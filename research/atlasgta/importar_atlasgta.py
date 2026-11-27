"""Importador de GTA Atlas (https://atlasgta.com/data/, CC BY-SA 4.0) → content/catalog/*.json (producción).

Reglas de LEONIDA ATLAS aplicadas a cada fila:
- Solo HECHOS: nombre original, clase/tipo, fabricante, precio, valores, cargador, adquisición, relaciones, fuentes.
- NO se importan: la prosa en inglés de GTA Atlas (se redacta un resumen propio en español a partir de los hechos),
  las calificaciones sobre 10 (son valoraciones editoriales de GTABase u otros medios), las imágenes (fotogramas de
  videos de terceros o capturas de GTADB: no son imágenes oficiales de Rockstar) ni coordenadas al mapa (la
  calibración al póster solo llega a precisión «zona»; las coordenadas GTADB se guardan como dato, sin pin).
- Evidencia: «oficial» si una fuente es de Rockstar/PlayStation y GTA Atlas la marca confirmed; «contrastado» si hay
  ≥ 2 grupos editoriales independientes; «reportado» con uno; «unverified» queda pendiente (no se publica).
- Duplicados: mismo slug o mismo nombre normalizado y misma clase dentro de una entidad. Las variantes con nombre
  propio se conservan. Coincidencias con fichas curadas se enlazan, no se duplican.
- Actualización incremental: un registro nuevo o cambiado respecto a la importación anterior queda
  «pendiente_revision» (no se publica) hasta aprobarlo con --aprobar ID[,ID] o --aprobar-todo.
Uso: python3 importar_atlasgta.py [--entrada DIR] [--aprobar-todo] [--aprobar IDS] [--max-peticiones N]"""
import argparse
import glob
import hashlib
import json
import re
import sys
import unicodedata
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / 'research'))
from cliente_http import Cliente  # noqa: E402

BASE = 'https://atlasgta.com/data/'
ENTIDADES = ['vehicles', 'weapons', 'properties', 'locations', 'collectibles', 'missions', 'trophies', 'completion', 'cheats', 'characters', 'animals', 'interiors']
SALIDA = RAIZ / 'content' / 'catalog'
LICENCIA = {'nombre': 'CC BY-SA 4.0', 'url': 'https://creativecommons.org/licenses/by-sa/4.0/', 'atribucion': 'GTA Atlas (https://atlasgta.com), CC BY-SA 4.0', 'obligaciones': 'Atribución en cada página del catálogo y misma licencia (CC BY-SA 4.0) para este catálogo derivado.'}

OFICIAL = {'rockstargames.com', 'blog.playstation.com', 'news.xbox.com'}
GRUPOS = {
    'gtabase.com': 'gtabase', 'gtascoop.com': 'gtascoop', 'ign.com': 'ign', 'powerpyx.com': 'powerpyx', 'pcgamer.com': 'pcgamer',
    'gamesradar.com': 'gamesradar', 'vicecitydb.org': 'vicecitydb', 'vulture.com': 'vulture', 'radiotimes.com': 'radiotimes',
    'rockstargames.com': 'rockstar', 'blog.playstation.com': 'rockstar', 'youtube.com': 'video', 'map.gtadb.org': 'gtadb',
}
NO_EDITORIAL = {'video', 'gtadb'}

ES = {
    'vehicles': {'boat': 'Embarcación', 'sports': 'Deportivo', 'muscle': 'Muscle', 'van': 'Furgoneta', 'sedan': 'Sedán', 'suv': 'SUV', 'off-road': 'Todoterreno', 'motorcycle': 'Motocicleta', 'emergency': 'Emergencia', 'plane': 'Avión', 'service': 'Servicio', 'coupe': 'Cupé', 'utility': 'Utilitario', 'commercial': 'Comercial', 'helicopter': 'Helicóptero', 'super': 'Superdeportivo', 'sports-classic': 'Deportivo clásico', 'industrial': 'Industrial', 'cycle': 'Bicicleta', 'pickup': 'Pickup', 'military': 'Militar'},
    'weapons': {'pistol': 'Pistola', 'shotgun': 'Escopeta', 'smg': 'Subfusil', 'assault-rifle': 'Rifle de asalto', 'melee': 'Cuerpo a cuerpo', 'sniper-rifle': 'Rifle de francotirador', 'tactical-rifle': 'Rifle táctico', 'thrown': 'Arrojadiza', 'machine-gun': 'Ametralladora', 'launcher': 'Lanzador', 'revolver': 'Revólver', 'equipment': 'Equipo'},
    'properties': {'garage': 'Garaje', 'safehouse': 'Refugio'},
    'locations': {'landmark': 'Punto de referencia', 'region': 'Región', 'interior': 'Interior', 'district': 'Distrito', 'settlement': 'Población', 'poi': 'Punto de interés'},
    'collectibles': {'Collectible Card Sets': 'Colecciones de tarjetas', 'Exploration Collections': 'Colecciones de exploración', 'WAiNK Locations': 'Lugares WAiNK', 'Discovered Styles': 'Estilos descubiertos', 'Street Art and Murals': 'Arte urbano y murales'},
    'trophies': {'bronze': 'Bronce', 'silver': 'Plata', 'gold': 'Oro', 'platinum': 'Platino'},
    'completion': {'Exploration and Activities': 'Exploración y actividades', 'Story and Tasks': 'Historia y tareas', 'Discoveries': 'Descubrimientos'},
    'animals': {'mammal': 'Mamífero', 'bird': 'Ave', 'fish': 'Pez', 'reptile': 'Reptil', 'amphibian': 'Anfibio', 'invertebrate': 'Invertebrado'},
    'characters': {'cast': 'Reparto', 'supporting': 'Secundario', 'protagonist': 'Protagonista'},
    'cheats': {'player': 'Jugador', 'weapons': 'Armas', 'vehicles': 'Vehículos', 'world': 'Mundo', 'fun': 'Diversión'},
}
CAT_LOC = {'Transport': 'Transporte', 'Shops': 'Tiendas', 'Natural features': 'Naturaleza', 'Leisure and nightlife': 'Ocio y vida nocturna', 'Government': 'Gobierno', 'Industrial': 'Industria', 'Utilities': 'Servicios públicos', 'Hotels': 'Hoteles', 'Homes and apartments': 'Viviendas', 'Food and drink': 'Comida y bebida', 'Landmarks': 'Monumentos', 'Event venues': 'Recintos', 'Public buildings': 'Edificios públicos', 'Services': 'Servicios', 'Offices': 'Oficinas', 'Farming': 'Agricultura', 'Not sorted into a category yet': 'Sin categoría'}
METODO = {'purchase': 'compra', 'reward': 'recompensa', 'mission': 'misión', 'street': 'en la calle', 'found': 'se encuentra', 'free': 'gratis', 'unlock': 'desbloqueo', 'gift': 'regalo', 'steal': 'robo'}
INTERIOR = {'clothing': 'Ropa', 'bar': 'Bar', 'mod-shop': 'Taller de modificación', 'restaurant': 'Restaurante', 'liquor-store': 'Licorería', 'gun-shop': 'Armería', 'strip-club': 'Club nocturno', 'barber': 'Barbería', 'garage': 'Garaje', 'souvenir': 'Recuerdos', 'footwear': 'Calzado', 'electronics': 'Electrónica', 'car-dealer': 'Concesionario', 'pawn-shop': 'Casa de empeño', 'bowling-alley': 'Boliche', 'motel': 'Motel', 'club': 'Club', 'shooting-range': 'Campo de tiro', 'tattoo': 'Tatuajes', 'illegal-goods': 'Artículos ilegales', 'mall': 'Centro comercial', 'market': 'Mercado'}


def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()


def money(n):
    return f'${n:,.0f}' if isinstance(n, (int, float)) else None


def dominio(u):
    return urlparse(u).netloc.removeprefix('www.') if isinstance(u, str) else ''


def evidencia(sources, confidence):
    grupos = {GRUPOS.get(dominio(u), dominio(u)) for u in sources if dominio(u)}
    editoriales = {g for g in grupos if g not in NO_EDITORIAL and g != 'rockstar'}
    if confidence == 'unverified':
        return 'pendiente', sorted(grupos)
    if 'rockstar' in grupos and confidence == 'confirmed':
        return 'oficial', sorted(grupos)
    if len(editoriales) >= 2:
        return 'contrastado', sorted(grupos)
    return 'reportado', sorted(grupos)


def hecho(etq, val):
    # Solo valores simples: de un objeto se toma su nombre (p. ej., inspiración real de GTADB) y nunca sus fotos.
    if isinstance(val, dict):
        val = val.get('name') if isinstance(val.get('name'), str) else None
    elif isinstance(val, list):
        val = ', '.join(str(x) for x in val if isinstance(x, (str, int, float))) or None
    elif isinstance(val, bool):
        val = 'Sí' if val else 'No'
    return {'etiqueta': etq, 'valor': val} if val not in (None, '') else None


def facts(*pares):
    return [p for p in (hecho(e, v) for e, v in pares) if p]


def es_lista(x):
    return ', '.join(x) if isinstance(x, list) and x else None


def adquisicion(acq):
    out = []
    for a in acq or []:
        m = METODO.get(a.get('method'), a.get('method'))
        if m:
            out.append(m)
    return es_lista(sorted(set(out)))


# ---------- Transformadores por entidad (resumen propio en español a partir de los hechos) ----------
def t_vehicles(r):
    cls = ES['vehicles'].get(r.get('class'), r.get('class') or 'Vehículo')
    precio = money(r.get('price'))
    resumen = f"{cls}{' de ' + r['manufacturer'] if r.get('manufacturer') else ''}. " + (f'Precio de compra reportado: {precio}. ' if precio else '') + (f"Se obtiene por: {adquisicion(r.get('acquisition'))}." if adquisicion(r.get('acquisition')) else '')
    return dict(tipo=r.get('class'), tipoEs=cls, subtitulo=' · '.join(x for x in [r.get('manufacturer'), cls] if x), resumen=resumen.strip(), hechos=facts(
        ('Fabricante', r.get('manufacturer')), ('Clase', cls), ('Precio', precio), ('Registro', money(r.get('register_cost'))), ('Venta', money(r.get('sell_value'))),
        ('Plazas', r.get('seats')), ('Se puede guardar', {True: 'Sí', False: 'No'}.get(r.get('storable'))), ('Personalizable', {True: 'Sí', False: 'No'}.get(r.get('customisable'))),
        ('Inspiración real', r.get('real_counterpart')), ('Modelo base', r.get('base_model')), ('Época', r.get('era')), ('Adquisición', adquisicion(r.get('acquisition')))),
        numeros={k: v for k, v in {'precio': r.get('price'), 'registro': r.get('register_cost'), 'venta': r.get('sell_value')}.items() if isinstance(v, (int, float))},
        relaciones=[{'entidad': 'locations', 'slug': a['location_slug']} for a in r.get('acquisition') or [] if a.get('location_slug')] + [{'entidad': 'vehicles', 'slug': s} for s in r.get('related') or []])


def t_weapons(r):
    cls = ES['weapons'].get(r.get('class'), r.get('class') or 'Arma')
    clip = (r.get('stats') or {}).get('clip_size')
    precio = money(r.get('price'))
    resumen = f"{cls}{' de ' + r['manufacturer'] if r.get('manufacturer') else ''}. " + (f'Precio reportado: {precio}. ' if precio else '') + (f'Cargador de {clip} balas. ' if clip else '') + (f"Se obtiene por: {adquisicion(r.get('acquisition'))}." if adquisicion(r.get('acquisition')) else '')
    return dict(tipo=r.get('class'), tipoEs=cls, subtitulo=' · '.join(x for x in [r.get('manufacturer'), cls] if x), resumen=resumen.strip(), hechos=facts(
        ('Fabricante', r.get('manufacturer')), ('Clase', cls), ('Precio', precio), ('Munición', r.get('ammo_type')), ('Cargador', clip), ('Inspiración real', r.get('real_counterpart')),
        ('Modelo base', r.get('base_model')), ('Accesorios', es_lista([a.get('name', a) if isinstance(a, dict) else a for a in r.get('attachments') or []])), ('Lugar gratuito', r.get('free_location') if isinstance(r.get('free_location'), str) else None), ('Adquisición', adquisicion(r.get('acquisition')))),
        numeros={k: v for k, v in {'precio': r.get('price'), 'cargador': clip}.items() if isinstance(v, (int, float))},
        relaciones=[{'entidad': 'locations', 'slug': a['location_slug']} for a in r.get('acquisition') or [] if a.get('location_slug')])


def t_properties(r):
    t = ES['properties'].get(r.get('property_type'), 'Propiedad')
    precio = money(r.get('price'))
    return dict(tipo=r.get('property_type'), tipoEs=t, subtitulo=t, resumen=f"{t}" + (f' con precio reportado de {precio}' if precio else '') + (f", capacidad para {r['vehicle_capacity']} vehículo(s)" if r.get('vehicle_capacity') else '') + '.', hechos=facts(
        ('Tipo', t), ('Precio', precio), ('Capacidad', r.get('vehicle_capacity')), ('Ingresos', money((r.get('income') or {}).get('amount')))),
        numeros={k: v for k, v in {'precio': r.get('price'), 'capacidad': r.get('vehicle_capacity')}.items() if isinstance(v, (int, float))},
        relaciones=[{'entidad': 'locations', 'slug': r['location_slug']}] if r.get('location_slug') else [])


def t_locations(r):
    k = ES['locations'].get(r.get('kind'), r.get('kind') or 'Lugar')
    cat = CAT_LOC.get(r.get('category_label'), r.get('category_label'))
    direccion = r.get('in_game_address')
    return dict(tipo=r.get('kind'), tipoEs=k, subtitulo=' · '.join(x for x in [k, cat] if x), resumen=f"{k}" + (f' ({cat.lower()})' if cat and cat != 'Sin categoría' else '') + (f'. Dirección en el juego: {direccion}.' if direccion else '.'), hechos=facts(
        ('Tipo', k), ('Categoría', cat), ('Dirección en el juego', direccion), ('Inspiración real', r.get('real_world')), ('Accesible', {True: 'Sí', False: 'No'}.get(r.get('enterable'))), ('Id GTADB', r.get('gtadb_id'))),
        coords={'sistema': 'gtadb6-world-m', 'x': r['coords']['x'], 'y': r['coords']['y']} if isinstance(r.get('coords'), dict) and isinstance(r['coords'].get('x'), (int, float)) else None,
        relaciones=[{'entidad': 'locations', 'slug': r['parent_slug']}] if r.get('parent_slug') else [])


def t_collectibles(r):
    t = ES['collectibles'].get(r.get('type_label'), r.get('type_label'))
    return dict(tipo=r.get('type'), tipoEs=t, subtitulo=t, resumen=f"Conjunto de {r.get('set_total') or '¿?'} piezas" + (f"; el 100 % pide {r['required_count']}" if r.get('required_count') else '') + '.', hechos=facts(
        ('Tipo', t), ('Total del conjunto', r.get('set_total')), ('Requeridos para el 100 %', r.get('required_count')), ('Cuenta para el 100 %', {True: 'Sí', False: 'No'}.get(r.get('counts_for_completion')))),
        numeros={k: v for k, v in {'total': r.get('set_total'), 'requeridos': r.get('required_count')}.items() if isinstance(v, (int, float))},
        relaciones=[{'entidad': 'locations', 'slug': r['location_slug']}] if r.get('location_slug') else [])


def t_missions(r):
    cap = r.get('strand')
    return dict(tipo=cap, tipoEs=cap, subtitulo=cap, resumen=f"Misión n.º {r.get('order')} de la historia ({cap})." + (f" Duración aproximada: {r['length_minutes']} min." if r.get('length_minutes') else ''), hechos=facts(
        ('Orden', r.get('order')), ('Capítulo', cap), ('Encargo', r.get('giver')), ('Repetible', {True: 'Sí', False: 'No'}.get(r.get('replayable'))), ('Duración (min)', r.get('length_minutes'))),
        spoiler=0 if r.get('spoiler_safe') else 1, numeros={'orden': r['order']} if isinstance(r.get('order'), int) else {}, relaciones=[{'entidad': 'characters', 'slug': norm(r['giver']).replace(' ', '-')}] if r.get('giver') else [])


def t_trophies(r):
    t = ES['trophies'].get(r.get('tier'), r.get('tier'))
    return dict(tipo=r.get('tier'), tipoEs=t, subtitulo=f'Trofeo de {t.lower()}', resumen=f"Trofeo de {t.lower()} (grupo «{r.get('group')}»)." + (' Se puede perder.' if r.get('missable') else ''), hechos=facts(
        ('Grado', t), ('Grupo', r.get('group')), ('Perdible', {True: 'Sí', False: 'No'}.get(r.get('missable'))), ('Oculto', {True: 'Sí', False: 'No'}.get(r.get('hidden')))), spoiler=1)


def t_completion(r):
    c = ES['completion'].get(r.get('category_label'), r.get('category_label'))
    return dict(tipo=r.get('category'), tipoEs=c, subtitulo=c, resumen=f"Línea {r.get('order')} del 100 %: vale {r.get('weight_percent')} %." + (f" Objetivo: {r['target_count']} de {r['target_total']}." if r.get('target_count') else ''), hechos=facts(
        ('Peso en el 100 %', f"{r['weight_percent']} %" if r.get('weight_percent') is not None else None), ('Objetivo', r.get('target_count')), ('Total', r.get('target_total')), ('Categoría', c)),
        numeros={k: v for k, v in {'peso': r.get('weight_percent'), 'objetivo': r.get('target_count'), 'total': r.get('target_total')}.items() if isinstance(v, (int, float))})


def t_characters(r):
    role = ES['characters'].get(r.get('role'), r.get('role'))
    return dict(tipo=r.get('role'), tipoEs=role, subtitulo=role, resumen=f'{role} de GTA VI' + (f", con la voz de {r['voice_actor']} (según la fuente citada)" if r.get('voice_actor') else '') + '.', hechos=facts(
        ('Papel', role), ('Región', r.get('region')), ('Afiliaciones', es_lista(r.get('affiliations'))), ('Voz', r.get('voice_actor')), ('Primera aparición', r.get('first_seen'))))


def t_animals(r):
    c = ES['animals'].get(r.get('class'), r.get('class'))
    usos = [x for x, k in (('cazar', 'can_hunt'), ('pescar', 'can_fish'), ('fotografiar', 'can_photograph')) if r.get(k)]
    return dict(tipo=r.get('class'), tipoEs=c, subtitulo=c, resumen=f"{c}." + (f" Se puede {', '.join(usos)}." if usos else ''), hechos=facts(
        ('Clase', c), ('Regiones', es_lista(r.get('habitat_regions'))), ('Se puede cazar', {True: 'Sí', False: 'No'}.get(r.get('can_hunt'))), ('Se puede pescar', {True: 'Sí', False: 'No'}.get(r.get('can_fish'))), ('Se puede fotografiar', {True: 'Sí', False: 'No'}.get(r.get('can_photograph')))))


def t_interiors(r):
    t = INTERIOR.get(r.get('interior_type'), r.get('interior_type'))
    return dict(tipo=r.get('interior_type'), tipoEs=t, subtitulo=' · '.join(x for x in [t, r.get('neighbourhood')] if x), resumen=f"{t}" + (f" en {r['neighbourhood']}" if r.get('neighbourhood') else '') + '. Interior que se puede visitar.', hechos=facts(
        ('Tipo', t), ('Cadena', r.get('chain')), ('Zona', r.get('neighbourhood')), ('Región', r.get('region'))),
        relaciones=[{'entidad': 'locations', 'slug': r['location_slug']}] if r.get('location_slug') else [])


def t_cheats(r):
    c = ES['cheats'].get(r.get('category'), r.get('category'))
    seq = r.get('sequence') if isinstance(r.get('sequence'), list) else None
    return dict(tipo=r.get('category'), tipoEs=c, subtitulo=c, resumen=f"Truco de la categoría {c.lower() if c else '—'}. " + ('Secuencia publicada por la fuente.' if seq else 'Secuencia aún no publicada.'), hechos=facts(
        ('Categoría', c), ('Secuencia (cruceta)', ' '.join({'Up': '↑', 'Down': '↓', 'Left': '←', 'Right': '→'}.get(x, x) for x in seq) if seq else None), ('Probado por GTA Atlas', 'No' if r.get('tested_by_us') is False else None)))


TRANS = {k: globals()[f't_{k}'] for k in ENTIDADES}


def filas(entidad, data):
    return data.get('cheats') if entidad == 'cheats' else data.get('rows')


def curadas():
    """Fichas curadas de LEONIDA ATLAS por nombre normalizado (para enlazar y no duplicar)."""
    out = {}
    for f in sorted(glob.glob(str(RAIZ / 'content' / '*.json'))):
        d = json.loads(Path(f).read_text(encoding='utf-8'))
        if isinstance(d, list):
            for e in d:
                if isinstance(e, dict) and 'category' in e and 'slug' in e:
                    out.setdefault(norm(e['name']), {'id': e['id'], 'category': e['category'], 'slug': e['slug'], 'images': e.get('images') or []})
    trucos = json.loads((RAIZ / 'content' / 'cheats.json').read_text(encoding='utf-8')).get('cheats', [])
    for t in trucos:
        out.setdefault(norm(t['name']), {'id': t['id'], 'category': 'trucos', 'slug': t['id'], 'images': []})
    return out


RUTA_CAT = {'trucos': '/trucos#', 'lugares': '/lugares', 'personajes': '/personajes', 'dinero': '/dinero', 'armas': '/armas', 'vehiculos': '/vehiculos', 'negocios': '/negocios', 'rutas': '/rutas', 'coleccionables': '/coleccionables'}


def importar(entidad, data, previo, aprobar, aprobar_todo, cur, fecha):
    raw = filas(entidad, data)
    if not isinstance(raw, list):
        raise ValueError(f'{entidad}: respuesta incompatible con el contrato (sin filas)')
    publicados, pendientes, rechazados, duplicados = [], [], [], []
    vistos, vistos_nombre = set(), {}
    for i, r in enumerate(raw):
        slug = r.get('slug') or r.get('id')
        nombre = r.get('name')
        fuentes = r.get('sources') or ([u for u in (r.get('unlock_source'), r.get('sequence_source')) if u] if entidad == 'cheats' else [])
        fuentes = [u for u in fuentes if isinstance(u, str) and u.startswith('http')]
        if not isinstance(slug, str) or not re.fullmatch(r'[a-z0-9-]{1,100}', slug) or not isinstance(nombre, str) or not nombre.strip():
            rechazados.append({'entidad': entidad, 'index': i, 'motivo': 'id_o_nombre_invalido'})
            continue
        if not fuentes:
            rechazados.append({'entidad': entidad, 'slug': slug, 'motivo': 'sin_fuentes'})
            continue
        # Dos lugares con el mismo nombre (p. ej., 47 «Bridge») son sitios distintos si su id GTADB o su coordenada difieren.
        coords = r.get('coords') if isinstance(r.get('coords'), dict) else {}
        lugar = r.get('gtadb_id') or (coords.get('x'), coords.get('y')) if entidad == 'locations' else None
        clave_nombre = (norm(nombre), str(r.get('class') or r.get('type') or r.get('kind') or ''), str(lugar))
        if slug in vistos or clave_nombre in vistos_nombre:
            duplicados.append({'entidad': entidad, 'slug': slug, 'duplicadoDe': vistos_nombre.get(clave_nombre, slug)})
            continue
        vistos.add(slug)
        vistos_nombre[clave_nombre] = slug
        estado, grupos = evidencia(fuentes, 'confirmed' if entidad == 'cheats' and r.get('status') == 'confirmed' else r.get('confidence') or ('likely' if entidad == 'cheats' else None))
        t = TRANS[entidad](r)
        c = cur.get(norm(nombre))
        curada = ({'ruta': f"/trucos#{c['slug']}" if c['category'] == 'trucos' else f"{RUTA_CAT[c['category']]}/{c['slug']}", 'id': c['id']} if c and (c['category'] != 'trucos' or entidad == 'cheats') else None)
        rid = f'{entidad}:{slug}'
        reg = {
            'id': rid, 'entidad': entidad, 'slug': slug, 'nombre': nombre.strip(), 'tipo': t.get('tipo'), 'tipoEs': t.get('tipoEs'), 'subtitulo': t.get('subtitulo'),
            'resumen': t['resumen'], 'hechos': t['hechos'], 'numeros': t.get('numeros', {}), 'estado': estado, 'grupos': grupos, 'fuentes': fuentes[:8],
            'relaciones': t.get('relaciones', []), 'coords': t.get('coords'), 'spoiler': t.get('spoiler', 0), 'curada': curada,
            'foto': (c['images'][0] if c and c['images'] else None), 'verificadoFuente': r.get('last_verified') or r.get('last_checked'),
            'origen': {'proveedor': 'GTA Atlas', 'url': BASE + f'{entidad}.json', 'licencia': LICENCIA['nombre']},
        }
        h = hashlib.sha256(json.dumps({k: v for k, v in reg.items() if k != 'verificadoFuente'}, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:16]
        reg['hash'] = h
        if estado == 'pendiente':
            pendientes.append({**reg, 'motivoPendiente': 'sin_verificar_en_la_fuente'})
            continue
        anterior = previo.get(rid)
        if previo and (anterior is None or anterior != h) and not (aprobar_todo or rid in aprobar):
            pendientes.append({**reg, 'motivoPendiente': 'nuevo' if anterior is None else 'cambiado'})
            continue
        publicados.append(reg)
    # relaciones solo si el destino existe en lo publicado (se resuelven después entre entidades)
    return publicados, pendientes, rechazados, duplicados, len(raw)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--entrada', type=Path, help='Carpeta con los JSON ya descargados (si no, se descargan con caché y límite)')
    p.add_argument('--aprobar-todo', action='store_true')
    p.add_argument('--aprobar', default='')
    a = p.parse_args()
    fecha = datetime.now(timezone.utc).isoformat(timespec='seconds')
    estado_prev = SALIDA / '_estado.json'
    previo = json.loads(estado_prev.read_text(encoding='utf-8')) if estado_prev.exists() else {}
    aprobar = {x.strip() for x in a.aprobar.split(',') if x.strip()}
    cli = Cliente(max_peticiones=20)
    manifiesto = json.loads((a.entrada / 'atlas-index.json').read_text()) if a.entrada else cli.get_json(BASE + 'index.json')
    cur = curadas()
    todos, pend, rech, dup, recibidos = {}, [], [], [], {}
    for ent in ENTIDADES:
        data = json.loads((a.entrada / f'atlas-{ent}.json').read_text()) if a.entrada else cli.get_json(BASE + f'{ent}.json')
        lic = (data.get('licence') or {}).get('name')
        if lic != 'CC BY-SA 4.0':
            raise ValueError(f'{ent}: licencia inesperada {lic!r}; no se importa')
        pub, pe, re_, du, n = importar(ent, data, previo.get('hashes', {}), aprobar, a.aprobar_todo, cur, fecha)
        todos[ent], recibidos[ent] = pub, n
        pend += pe
        rech += re_
        dup += du
    # resolver relaciones contra lo publicado
    indice = {(e, r['slug']): r for e, rs in todos.items() for r in rs}
    for rs in todos.values():
        for r in rs:
            r['relaciones'] = [{**x, 'nombre': indice[(x['entidad'], x['slug'])]['nombre']} for x in r['relaciones'] if (x['entidad'], x['slug']) in indice and (x['entidad'], x['slug']) != (r['entidad'], r['slug'])]
    SALIDA.mkdir(parents=True, exist_ok=True)
    for ent, rs in todos.items():
        (SALIDA / f'{ent}.json').write_text(json.dumps(rs, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    resumen = {
        ent: {
            'recibidos': recibidos[ent], 'publicados': len(todos[ent]),
            'pendientesVerificar': sum(1 for x in pend if x['entidad'] == ent and x['motivoPendiente'] == 'sin_verificar_en_la_fuente'),
            'pendientesRevision': sum(1 for x in pend if x['entidad'] == ent and x['motivoPendiente'] != 'sin_verificar_en_la_fuente'),
            'rechazados': sum(1 for x in rech if x['entidad'] == ent), 'duplicados': sum(1 for x in dup if x['entidad'] == ent),
            'enlazadosConFichaCurada': sum(1 for x in todos[ent] if x['curada']), 'conFoto': sum(1 for x in todos[ent] if x['foto']),
            'sinFoto': sum(1 for x in todos[ent] if not x['foto']), 'porEvidencia': dict(Counter(x['estado'] for x in todos[ent])),
        } for ent in ENTIDADES
    }
    indice_out = {
        'proveedor': 'GTA Atlas', 'manifiesto': manifiesto.get('manifest'), 'importado': fecha, 'licencia': LICENCIA,
        'creditosRequeridos': (manifiesto.get('licence') or {}).get('credit_required'), 'resumen': resumen,
        'totales': {k: sum(v[k] for v in resumen.values()) for k in ('recibidos', 'publicados', 'pendientesVerificar', 'pendientesRevision', 'rechazados', 'duplicados', 'conFoto', 'sinFoto')},
    }
    (SALIDA / 'index.json').write_text(json.dumps(indice_out, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    (SALIDA / 'revision.json').write_text(json.dumps({'generado': fecha, 'pendientes': [{k: x[k] for k in ('id', 'nombre', 'estado', 'motivoPendiente', 'fuentes')} for x in pend], 'rechazados': rech, 'duplicados': dup}, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    estado_prev.write_text(json.dumps({'actualizado': fecha, 'hashes': {**previo.get('hashes', {}), **{r['id']: r['hash'] for rs in todos.values() for r in rs}}}, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    print(json.dumps(indice_out['totales'], ensure_ascii=False))


if __name__ == '__main__':
    main()
