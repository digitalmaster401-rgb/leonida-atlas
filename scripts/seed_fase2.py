#!/usr/bin/env python3
"""Siembra reproducible de la fase 2 (22-nov-2026): coleccionables (fichas), trucos, ajustes de consola y
reglas de equipamiento. Idempotente: reemplaza solo lo que genera. Tras ejecutarse, los JSON de content/
son la fuente de verdad. Investigación: sources/INVESTIGACION_FASE2.md."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = lambda *p: os.path.join(ROOT, 'content', *p)
V = '2026-11-22'
PATCH = 'Lanzamiento (19-nov-2026). Las fuentes no indican número de parche.'
def F(label, value, status, *src): return dict(label=label, value=value, status=status, sources=list(src))
def P(x, y, precision, basis): return dict(x=x, y=y, precision=precision, basis=basis)
def entry(**k):
    d = dict(subzone=None, howTo=[], requirements=[], chapter=None, mode='historia', platform=['PS5', 'Xbox Series X|S'], patch=PATCH,
             reward=None, time=None, risks=[], images=[], mapPosition=None, spoilerLevel=0, edition='base', tags=[], related=[], money=None,
             facts=[], verifiedAt=V)
    d.update(k)
    return d

KEY_LENTO = P(0.568, 0.833, 'zona', 'Dirección reportada por la fuente (Key Lento); punto sobre el rótulo «Key Lento» del mapa oficial, no sobre el edificio.')
COLS = []
# ---------- Colecciones
COLS.append(entry(id='col-tarjetas', slug='tarjetas-coleccionables', name='Tarjetas coleccionables', category='coleccionables', region='leonida', status='contrastado',
  summary='18 sets de tarjetas, alrededor de 480 en total; el set Vice City Flamingos tiene 24.',
  description='Las guías revisadas coinciden en 18 sets de tarjetas con unas 480 tarjetas (algunas cuentan 481). Los temas incluyen equipos como los Vice City Flamingos, personajes y cómics. Completar los 24 Vice City Flamingos desbloquea el filtro de pantalla «Bubblegum». Lleva tu conteo aquí: el juego no publica una lista oficial.',
  howTo=['Abre el mapa y entra en Progreso → Colecciones para ver tu avance (ruta reportada por una guía).', 'Registra cuántas tarjetas llevas con el contador de esta ficha.'],
  facts=[F('Sets', '18', 'contrastado', 'playguide-collectibles', 'gta6cm-mags'), F('Total aproximado', '≈480 (algunas guías cuentan 481)', 'contrastado', 'playguide-collectibles', 'gta6cm-mags'),
         F('Vice City Flamingos', '24 tarjetas; completarlo desbloquea el filtro «Bubblegum»', 'contrastado', 'gtabase-cheats', 'beebom-cheats', 'gamertweak-cheats', 'playguide-collectibles'),
         F('Sets necesarios para el 100 %', '15 de 18', 'reportado', 'playguide-collectibles'), F('Trofeo «Don\'t Touch My Deck»', 'Completar 3 sets', 'reportado', 'playguide-collectibles'),
         F('Ruta de progreso', 'Progreso → Colecciones → Collectible Cards', 'reportado', 'playguide-collectibles')],
  sources=['playguide-collectibles', 'gta6cm-mags', 'gtabase-cheats', 'beebom-cheats', 'gamertweak-cheats'], tags=['coleccion', 'tarjetas', 'cartas'],
  tracking=dict(total=480, totalStatus='contrastado', unit='tarjetas')))
COLS.append(entry(id='col-lecturas', slug='revistas-libros-y-comics', name='Revistas, libros y cómics', category='coleccionables', region='leonida', status='contrastado',
  summary='27 revistas, libros y cómics para leer, más 7 intercambios de libros.',
  description='Dos guías coinciden en 27 revistas, libros y cómics. Una de ellas suma 7 intercambios de libros (34 en total, 30 necesarios para el 100 %). Algunas copias están en edificios de la historia a los que no se vuelve, pero esas guías indican que no afectan el 100 %. Abajo están los 16 títulos con ubicación publicada hasta ahora.',
  howTo=['Lee cada título interactuando con él.', 'Consulta el avance en Progreso → Colecciones → Exploración.', 'Marca cada título como encontrado en su ficha.'],
  facts=[F('Revistas, libros y cómics', '27', 'contrastado', 'pushsquare-mags', 'gta6cm-mags'), F('Intercambios de libros', '7', 'reportado', 'gta6cm-mags'),
         F('Necesarios para el 100 %', '30 de 34', 'reportado', 'gta6cm-mags'), F('Ruta de progreso', 'Progreso → Colecciones → Exploración', 'contrastado', 'pushsquare-mags', 'gta6cm-mags'),
         F('Copias duplicadas', 'Leer el mismo título dos veces no cuenta doble', 'reportado', 'gta6cm-mags'), F('Ubicaciones publicadas', '16 de 27 (guía en progreso)', 'reportado', 'pushsquare-mags')],
  sources=['pushsquare-mags', 'gta6cm-mags'], tags=['coleccion', 'revistas', 'libros', 'comics'], tracking=dict(total=27, totalStatus='contrastado', unit='lecturas')))
COLS.append(entry(id='col-relojes', slug='relojes-coleccionables', name='Relojes coleccionables', category='coleccionables', region='leonida', status='contrastado',
  summary='Encontrar 10 y 20 relojes desbloquea trucos de tiempo; el total no está publicado.',
  description='Las guías de trucos coinciden en que encontrar 10 relojes desbloquea «Move Time Forward» y 20 desbloquea «Pause Time of Day». Ninguna fuente revisada publica el total de relojes ni sus ubicaciones.',
  facts=[F('10 relojes', 'Desbloquea el truco Move Time Forward', 'contrastado', 'gtabase-cheats', 'beebom-cheats', 'gamertweak-cheats'), F('20 relojes', 'Desbloquea el truco Pause Time of Day', 'contrastado', 'gtabase-cheats', 'beebom-cheats', 'gamertweak-cheats'),
         F('Total', 'No publicado', 'pendiente', 'playguide-collectibles')],
  sources=['gtabase-cheats', 'beebom-cheats', 'gamertweak-cheats', 'playguide-collectibles'], tags=['coleccion', 'relojes', 'joyeria'], tracking=dict(total=None, totalStatus='pendiente', unit='relojes')))
COLS.append(entry(id='col-flamencos', slug='flamencos-de-cocaina', name='Flamencos de cocaína', category='coleccionables', region='leonida', status='contrastado',
  summary='Destruir 50 flamencos de cocaína desbloquea el truco del flamenco inflable.',
  description='Las guías de trucos coinciden en que destruir 50 flamencos de cocaína desbloquea el truco «Inflatable Flamingo». El total no aparece en las fuentes leídas.',
  facts=[F('50 destruidos', 'Desbloquea el truco Inflatable Flamingo', 'contrastado', 'gtabase-cheats', 'beebom-cheats', 'gamertweak-cheats'), F('Total', 'No publicado en las fuentes leídas', 'pendiente', 'gtabase-cheats')],
  sources=['gtabase-cheats', 'beebom-cheats', 'gamertweak-cheats'], tags=['coleccion', 'flamencos'], tracking=dict(total=None, totalStatus='pendiente', unit='flamencos')))
COLS.append(entry(id='col-girlypop', slug='vehiculos-girlypop', name='Vehículos Girlypop', category='coleccionables', region='leonida', status='contrastado',
  summary='16 vehículos Girlypop; descubrirlos todos desbloquea el filtro «Neon Jungle».',
  description='Las guías de trucos y de coleccionables coinciden en 16 vehículos Girlypop; descubrirlos todos desbloquea el filtro de pantalla «Neon Jungle».',
  facts=[F('Total', '16', 'contrastado', 'gtabase-cheats', 'beebom-cheats', 'gamertweak-cheats', 'playguide-collectibles'), F('Recompensa', 'Filtro de pantalla Neon Jungle', 'contrastado', 'gtabase-cheats', 'beebom-cheats', 'gamertweak-cheats')],
  sources=['gtabase-cheats', 'beebom-cheats', 'gamertweak-cheats', 'playguide-collectibles'], tags=['coleccion', 'vehiculos', 'girlypop'], tracking=dict(total=16, totalStatus='contrastado', unit='vehículos')))
COLS.append(entry(id='col-saltos', slug='saltos-acrobaticos', name='Saltos acrobáticos', category='coleccionables', region='leonida', status='contrastado',
  summary='Completar 50 saltos acrobáticos desbloquea el truco de nitro ilimitado.',
  description='Las guías de trucos coinciden en que completar 50 saltos acrobáticos desbloquea «Unlimited Nitrous». El total de saltos no está confirmado en las fuentes leídas.',
  facts=[F('50 saltos', 'Desbloquea el truco Unlimited Nitrous', 'contrastado', 'gtabase-cheats', 'beebom-cheats', 'gamertweak-cheats'), F('Total', 'No confirmado', 'pendiente', 'playguide-collectibles')],
  sources=['gtabase-cheats', 'beebom-cheats', 'gamertweak-cheats', 'playguide-collectibles'], tags=['coleccion', 'saltos', 'stunt'], tracking=dict(total=None, totalStatus='pendiente', unit='saltos')))

# ---------- Lecturas individuales (Push Square; confirmaciones adicionales donde existen)
MAGS = [
 ('orca', 'Orca: A Whole Different Animal', 'leonida-keys', 'Key Lento', 'Mesa del lado este de la casa de Jason, Peach Palm Dr, Key Lento, Mariana County.', 'Antes del final del Capítulo 1', KEY_LENTO, []),
 ('lethal-by-design', 'Lethal by Design: A Liberty City Memoir', 'leonida-keys', 'Key Lento', 'Mesa circular del lado noreste de la casa de Jason, Key Lento.', 'Antes del final del Capítulo 1', KEY_LENTO, []),
 ('body-copy', "Body Copy: America's Fittest Bodybuilding Magazine", 'leonida-keys', 'Key Lento', 'Balcón de la casa de Jason, junto a la zona de ejercicio.', 'Antes del final del Capítulo 1', KEY_LENTO, []),
 ('off-the-hook', "Off the Hook: America's No. 1 Fishing Magazine", 'leonida-keys', 'Key Lento', 'Banco de trabajo del cobertizo bajo la casa de Jason.', 'Antes del final del Capítulo 1', KEY_LENTO, []),
 ('ashes-of-glory', 'Ashes of Glory', 'leonida-keys', 'Key Lento', 'Cómoda junto a la cama de Jason.', 'Antes del final del Capítulo 1', KEY_LENTO, []),
 ('help-me-help-you', 'Help Me, Help You, Help Me: The Pyramid of Success', 'port-gellhorn', 'Port Gellhorn', 'Recepción del Starlet Motel, US-183, Port Gellhorn, Kelly County.', 'Antes del final del Capítulo 2', P(0.305, 0.358, 'zona', 'Dirección reportada (Starlet Motel, Port Gellhorn); punto sobre el rótulo «Port Gellhorn» del mapa oficial.'), []),
 ('children-of-wizard-wang', 'Children of Wizard Wang', 'port-gellhorn', 'Port Gellhorn', 'Cocina del Starlet Motel, en el mostrador junto a la ventana y la radio.', 'Antes del final del Capítulo 2', P(0.305, 0.358, 'zona', 'Dirección reportada (Starlet Motel, Port Gellhorn); punto sobre el rótulo «Port Gellhorn» del mapa oficial.'), []),
 ('two-pricks-in-the-bush', 'Two Pricks in the Bush', 'vice-city', 'Bayside', 'Bayside Apartments 201, Catalan Blvd, Vice City; mesa frente a la TV.', 'Antes del final del Capítulo 3', P(0.7237, 0.472, 'barrio', 'Dirección reportada (Bayside, Vice City); punto sobre el rótulo «Bayside» del mapa oficial.'), []),
 ('passion-bc', 'Passion B.C.', 'vice-city', 'Bayside', 'Bayside Apartments, mesa pequeña a la derecha del jacuzzi.', 'Antes del final del Capítulo 3', P(0.7237, 0.472, 'barrio', 'Dirección reportada (Bayside, Vice City); punto sobre el rótulo «Bayside» del mapa oficial.'), []),
 ('high-roller', 'High Roller Magazine', 'vice-city', 'Crosstown', 'Pasillo del estudio de grabación en el piso superior de Jack of Hearts, Mirimar Dr, Crosstown; mesa junto al teclado.', None, P(0.698, 0.496, 'barrio', 'Dirección reportada (Crosstown, Vice City); punto sobre el rótulo «Crosstown» del mapa oficial.'), []),
 ('remote-strike', 'Remote Strike: A Modern Military Memoir', 'vice-city', 'Oldby Island', 'Ajax Gym, piso Trauma, Vickery Dr, Oldby Island; mesa de billar junto a los casilleros.', 'Disponible tras la misión «Blood Sweat and Gear»', P(0.837, 0.4576, 'barrio', 'Dirección reportada (Oldby Island); punto sobre el rótulo «Oldby Island» del mapa oficial.'), ['gta6cm-mags']),
 ('1159-survivalist', '11:59 Survivalist Culture', 'mount-kalaga', 'Mount Kalaga National Park', 'Bosque al este de Kalaga Reservoir, cerca de Dawson Dam; sube la escalera del mirador donde está el rifle Twin\'s Laird 350.', None, None, []),
 ('cowboys-prayer', "The Cowboy's Prayer Is to Die Young", 'mount-kalaga', 'Moreau', 'Recepción del Grayson Motel, Rockledge Rd, Moreau, Lummox County; mesa a la derecha.', None, P(0.516, 0.165, 'zona', 'Dirección reportada (Moreau, Lummox County); punto sobre el rótulo «Moreau» del mapa oficial.'), []),
 ('peche', 'Pêche Magazine', 'leonida-keys', 'Key Lento', 'Casa de fiestas de Dolphin Dr, Key Lento; primera habitación a la izquierda, sobre la cama.', None, KEY_LENTO, ['playguide-collectibles']),
 ('trigger-happy', 'Trigger Happy', 'leonida-keys', 'Key Lento', 'Casa de playa de Sunset Dr, Key Lento; esquina de la mesa del comedor, subiendo las escaleras.', None, KEY_LENTO, []),
 ('foiled', 'Foiled', 'grassrivers', 'Gullet Marsh', 'Muelle de un complejo de pesca al oeste de Gullet Marsh, Grassrivers; en el suelo frente a una choza con estatua de Bigfoot.', None, None, []),
]
for slug, title, reg, sub, where, timing, pos, extra in MAGS:
    st = 'contrastado' if extra else 'reportado'
    srcs = ['pushsquare-mags'] + extra
    spoiler = 1 if (timing and ('misión' in timing or 'Capítulo' in timing)) else 0
    facts = [F('Ubicación', where, st, *srcs), F('Colección', 'Revistas, libros y cómics', 'contrastado', 'pushsquare-mags', 'gta6cm-mags')]
    if timing: facts.append(F('Momento', timing, 'reportado', 'pushsquare-mags'))
    COLS.append(entry(id=f'col-{slug}', slug=slug, name=title, category='coleccionables', region=reg, subzone=sub, status=st, collection='col-lecturas', chapter=None,
      summary=f'Lectura coleccionable en {sub}. {timing + "." if timing else ""}'.strip(),
      description=f'Ubicación según la fuente: {where}' + (f' {timing}.' if timing else '') + (' Confirmado por una segunda guía.' if extra else ' Fuente única: compruébalo en tu partida.'),
      howTo=[f'Ve a: {where}', 'Interactúa con el objeto para leerlo.', 'Marca la ficha como «Encontrado».'],
      facts=facts, sources=srcs + ['gta6cm-mags'], spoilerLevel=spoiler, mapPosition=pos, tags=['coleccionable', 'revista', 'libro', 'lectura'], related=['col-lecturas']))
# Tarjetas con ubicación publicada (fuente única)
for slug, name, where in [('tarjeta-lionel-taber', 'Tarjeta de Lionel Taber', 'Baño de la casa de fiestas de Dolphin Drive, Key Lento.'), ('tarjeta-thelma', 'Tarjeta de Thelma', 'Cerca de la cima de la Badger R&D Tower, Key Lento.')]:
    COLS.append(entry(id=f'col-{slug}', slug=slug, name=name, category='coleccionables', region='leonida-keys', subzone='Key Lento', status='reportado', collection='col-tarjetas',
      summary=f'Tarjeta coleccionable reportada en Key Lento: {where}', description=f'Ubicación según una guía: {where} Fuente única.',
      howTo=[f'Ve a: {where}', 'Recoge la tarjeta.', 'Marca la ficha como «Encontrado» y suma 1 al contador de tarjetas.'],
      facts=[F('Ubicación', where, 'reportado', 'playguide-collectibles'), F('Colección', 'Tarjetas coleccionables', 'contrastado', 'playguide-collectibles', 'gta6cm-mags')],
      sources=['playguide-collectibles'], mapPosition=KEY_LENTO, tags=['coleccionable', 'tarjeta', 'carta'], related=['col-tarjetas']))

entries = [e for e in json.load(open(C('entries.json'))) if e['category'] != 'coleccionables']
entries += COLS
json.dump(entries, open(C('entries.json'), 'w'), indent=1, ensure_ascii=False)

# ---------- Trucos
S3 = ['gtabase-cheats', 'beebom-cheats', 'gamertweak-cheats']
CHEATS = [
 # id, nombre en juego, categoría, efecto (es), secuencia o None, fuentes secuencia, desbloqueo (es)
 ('dinero-250k', '$250,000 Money', 'jugador', 'Añade $250,000 en la sesión actual.', 'U R D L U L D R', S3, 'Terminar la historia principal.'),
 ('borracho', 'Drunk', 'jugador', 'Tú y tu pareja quedan ebrios.', 'U L R U U L R U L R', ['gtabase-cheats'], 'Gastar $2,500 en alcohol.'),
 ('subir-heat', 'Raise Heat Level', 'jugador', 'Sube el nivel de «heat» en el mapa.', 'L D R D U D U', S3, 'Perder un nivel de búsqueda de 3 estrellas 25 veces.'),
 ('subir-busqueda', 'Raise Wanted Level', 'jugador', 'Sube el nivel de búsqueda.', 'L D R D U R U', ['gtabase-cheats', 'beebom-cheats'], 'Perder un nivel de búsqueda de 3 estrellas 50 veces.'),
 ('focus-ilimitado', 'Unlimited Focus', 'jugador', 'La barra de Focus no se agota.', 'D U U D U D U D U R', S3, 'Terminar la historia principal.'),
 ('sin-caidas', 'No Fall Damage', 'jugador', 'Sin daño por caídas.', None, [], 'Sobrevivir 20 caídas libres de 40 pies.'),
 ('paracaidas', 'Parachute', 'jugador', 'Te da un paracaídas.', None, [], 'Hacer 50 saltos en paracaídas o BASE desde 300 pies o más.'),
 ('chaleco', 'Body Armor', 'jugador', 'Te da chaleco antibalas.', 'D U L U U U U U D D', S3, 'Completar 100 entrenamientos.'),
 ('reparar', 'Repair Vehicle', 'jugador', 'Repara el vehículo actual.', None, [], 'Ganar 10 carreras en Gellhorn Raceway, Thrillbilly Mud Club y Boone Speedway.'),
 ('nitro', 'Unlimited Nitrous', 'jugador', 'Nitro y combustible no se agotan.', None, [], 'Completar 50 saltos acrobáticos.'),
 ('max-municion', 'Max Ammo', 'combate', 'Llena la munición de todas tus armas.', 'D U R D L L U U D L', S3, 'Ganar 25 medallas de bronce o mejores en campos de tiro.'),
 ('municion-infinita', 'Infinite Ammo', 'combate', 'La munición no se agota.', 'D U R D L L U D D D', S3, 'Ganar 25 medallas de plata o mejores en campos de tiro.'),
 ('sin-recarga', 'No Reload', 'combate', 'Munición infinita sin recargar.', 'D U R D L L U D D U', S3, 'Ganar 25 medallas de oro en campos de tiro.'),
 ('explosivos', 'All Explosive Weapons', 'combate', 'Te da todas las armas explosivas.', None, [], 'Lanzar 100 granadas.'),
 ('incendiaria', 'Incendiary Ammo', 'combate', 'Munición incendiaria.', None, [], 'Quemar a 100 enemigos.'),
 ('botellas', 'Exploding Bottles', 'combate', 'Botellas explosivas.', None, [], 'Lanzar 100 molotov.'),
 ('escopeta-explosiva', 'Explosive Shotgun', 'combate', 'Escopeta explosiva.', None, [], 'Dañar a 100 enemigos con explosivos.'),
 ('hauners-hat', 'Hauners H-AT', 'combate', 'Te da el lanzacohetes Hauners H-AT.', None, [], 'Destruir 100 vehículos.'),
 ('attack-force', 'Attack Force', 'combate', 'Balas y golpes mandan a volar a los objetivos.', 'D U L L R D D U D', S3, 'Terminar la historia principal.'),
 ('balones', 'Exploding Balls', 'combate', 'Los balones deportivos explotan.', 'D U L L R D D U R', S3, 'Dañar a 20 enemigos con explosivos.'),
 ('vehicle-force', 'Vehicle Force', 'combate', 'Los atropellos lanzan por los aires a las personas.', 'D U L L R D L U D', S3, 'Matar a 25 enemigos con un vehículo.'),
]
VEH = [('ambulancia', 'Interstate Ambulance', None, 'Descubrirla en el menú Progreso.'), ('airboat', 'Airboat 09', None, 'Completar 5 desafíos de Supervivencia.'),
 ('banshee', 'Bravado Banshee', None, 'Completar todos los desafíos de Combate.'), ('bmx', 'Tuff BMX', None, 'Completar 5 desafíos de Fitness.'),
 ('boomazoom', 'Maibatsu Boomazoom', 'L U R D L L U L', 'Completar 5 desafíos de Compras.'), ('carbon-rs', 'Nagasaki Carbon RS', None, 'Completar todos los desafíos de Exploración.'),
 ('dominator-65', "'65 Vapid Dominator", None, 'Completar todos los desafíos de Fitness.'), ('emerus', 'Progen Emerus', None, 'Completar todos los desafíos de Vehículos.'),
 ('flamenco', 'Inflatable Flamingo', None, 'Destruir 50 flamencos de cocaína.'), ('pumper', 'MTL Pumper', 'L U R D L R R U', 'Descubrirlo en el menú Progreso.'),
 ('taxi', 'Vapid Stanier G2 Taxi', None, 'Completar 5 desafíos de Deportes.'), ('lazer', 'Hauners P-996 Lazer', None, 'Completar todos los desafíos.'),
 ('bulldozer', 'HVY Bulldozer', 'L U R D L R R D', 'Descubrirlo en el menú Progreso.'), ('mallard', 'Lapwing Mallard', None, 'Completar 5 desafíos de Vehículos.'),
 ('golfer', 'Brimstone Golfer', None, 'Completar todos los desafíos de Deportes.'), ('rhino', 'Hauners Rhino Tank', None, 'Completar todos los desafíos de Supervivencia.'),
 ('sanchez', 'Maibatsu Sanchez', None, 'Completar 5 desafíos Criminales.'), ('sea-sparrow', 'Nagasaki Sea Sparrow', None, 'Completar 5 desafíos de Exploración.'),
 ('speeder', 'Speeder 700 GT', None, 'Completar 5 desafíos de Combate.'), ('thrax', 'Truffade Thrax', None, 'Completar todos los desafíos de Compras.'),
 ('zombie-bobber', 'Western Zombie Bobber', None, 'Completar todos los desafíos Criminales.')]
for slug, name, seq, unlock in VEH:
    CHEATS.append((f'veh-{slug}', name, 'vehiculo', f'Aparece un {name}.', seq, S3 if seq else [], unlock))
CHEATS += [('tiempo-adelante', 'Move Time Forward', 'entorno', 'Adelanta la hora del día.', None, [], 'Encontrar 10 relojes coleccionables.'),
 ('pausar-tiempo', 'Pause Time of Day', 'entorno', 'Detiene la hora del día.', None, [], 'Encontrar 20 relojes coleccionables.'),
 ('clima', 'Cycle Weather', 'entorno', 'Cambia el clima.', 'D R U D R U R', S3, 'Terminar la historia principal.')]
FIL = [('golden-hour', 'Golden Hour', None, 'Pasar 4 horas tomados de la mano.'), ('powdered-sugar', 'Powdered Sugar', None, 'Escanear toda la basura espacial con WAiNK.'),
 ('pinhole', 'Pinhole', None, 'Despejar 25 operaciones de pandillas con tu pareja.'), ('neon-jungle', 'Neon Jungle', None, 'Descubrir los 16 vehículos Girlypop.'),
 ('yesteryear', 'Yesteryear', None, 'Descubrir el Ridgeway.'), ('cataclysm', 'Cataclysm', 'D D U R R U L L R R', 'Descubrir el Vamos de Martha en el menú Progreso.'),
 ('videotape', 'Videotape', None, 'Completar 50 actividades con tu pareja.'), ('dark-mirror', 'Dark Mirror', None, 'Ganar $500,000 vendiendo vehículos.'),
 ('migraine', 'Migraine', None, 'Sobrevivir 6 minutos con 6 estrellas de búsqueda.'), ('dollhouse', 'Dollhouse', 'D D U R R U L L D R', 'Pasar 8 horas con tu pareja.'),
 ('bubblegum', 'Bubblegum', None, 'Encontrar las 24 tarjetas Vice City Flamingos.'), ('fast-forward', 'Fast Forward', None, 'Completar 50 meditaciones.'),
 ('fisheye', 'Fisheye', None, 'Pescar 100 peces.'), ('faded-glory', 'Faded Glory', 'D D U R R U L L L R', 'Robar 50 tiendas con tu pareja.'),
 ('pixel-art', 'Pixel Art', None, 'Ganar $250,000 vendiendo coleccionables.'), ('hellscape', 'Hellscape', None, 'Robar 100 vehículos de policía.')]
for slug, name, seq, unlock in FIL:
    CHEATS.append((f'filtro-{slug}', name, 'filtro', f'Aplica el filtro de pantalla «{name}».', seq, S3 if seq else [], unlock))
MAP = {'U': 'up', 'D': 'down', 'L': 'left', 'R': 'right'}
out = []
for cid, name, cat, eff, seq, ssrc, unlock in CHEATS:
    st = 'desconocida' if not seq else ('contrastado' if len({'beebom-cheats', 'gamertweak-cheats', 'gtabase-cheats'} & set(ssrc)) >= 2 else 'reportado')
    usrc = ['gtabase-cheats', 'beebom-cheats'] if cid == 'max-municion' else S3
    note = ''
    if cid == 'borracho': note = 'Solo GTA BASE publica esta secuencia; VICE (que usa datos de GTA BASE) la marca como no confirmada y Beebom como «TBA».'
    if cid == 'subir-busqueda': note = 'Gamer Tweak aún la marca como «Not discovered».'
    if cid == 'max-municion': note = 'Gamer Tweak indica que el número de medallas varía entre guías.'
    out.append(dict(id=cid, name=name, category=cat, effect=eff, sequence=[MAP[x] for x in seq.split()] if seq else None, sequenceStatus=st,
                    sequenceSources=ssrc + (['vice-cheats'] if seq and 'gtabase-cheats' in ssrc and cid != 'borracho' else []), unlock=unlock, unlockStatus='contrastado', unlockSources=usrc, note=note))
cheats = dict(
  verifiedAt=V, patch=PATCH,
  entry=dict(
    ps5=dict(label='PS5 y PS5 Pro', hold='L1', press='R1', steps=['Pulsa ↑ en la cruceta para sacar el teléfono.', 'Mantén L1 y pulsa R1.', 'Sin soltar, introduce la secuencia con la cruceta.'], status='contrastado', sources=['gtabase-cheats', 'beebom-cheats', 'gamertweak-cheats'], note='Las fuentes hablan de PS5; ninguna distingue la PS5 Pro, que usa el mismo mando DualSense.'),
    xbox=dict(label='Xbox Series X|S', hold='LB', press='RB', steps=['Pulsa ↑ en la cruceta para sacar el teléfono.', 'Mantén LB y pulsa RB.', 'Sin soltar, introduce la secuencia con la cruceta.'], status='contrastado', sources=['beebom-cheats', 'gamertweak-cheats', 'vice-cheats'], note='Las secuencias de la cruceta son las mismas en ambas consolas según las fuentes.')),
  rules=[F('Requisito general', 'Terminar la historia principal; después, cada truco tiene su propio requisito (Progreso → Trucos).', 'contrastado', 'gtabase-cheats', 'beebom-cheats', 'gamertweak-cheats'),
         F('Guardado', 'Usar un truco desactiva el guardado durante esa sesión; lo avanzado después se pierde al salir.', 'contrastado', 'gtabase-cheats', 'beebom-cheats', 'gamertweak-cheats'),
         F('Trofeos y logros', 'Se bloquean durante la sesión en la que usas un truco.', 'contrastado', 'gtabase-cheats', 'beebom-cheats', 'gamertweak-cheats'),
         F('Modo', 'Solo para un jugador; no funcionan en línea.', 'contrastado', 'gtabase-cheats', 'beebom-cheats'),
         F('Consejo', 'Haz un guardado manual antes de usar trucos y vuelve a cargarlo después.', 'contrastado', 'gamertweak-cheats', 'vice-cheats'),
         F('Dinero del truco', 'Los $250,000 no se conservan en tu partida guardada.', 'reportado', 'vice-cheats'),
         F('Desactivar', 'Volver a introducir el código lo cancela.', 'reportado', 'beebom-cheats')],
  cheats=out)
json.dump(cheats, open(C('cheats.json'), 'w'), indent=1, ensure_ascii=False)

# ---------- Consola
console = dict(verifiedAt=V, patch=PATCH,
 platforms=[dict(id='ps5', name='PS5'), dict(id='ps5_pro', name='PS5 Pro'), dict(id='xbox_series_x', name='Xbox Series X'), dict(id='xbox_series_s', name='Xbox Series S')],
 sections=[
  dict(id='rendimiento', title='Rendimiento y modos gráficos', scope='juego', items=[
    dict(label='Fotogramas por segundo', value='El juego apunta a 30 fps en PS5 y Xbox Series X|S.', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path=None, status='oficial', sources=['rs-preload']),
    dict(label='Modo rendimiento o calidad', value='No existe selector de modo gráfico ni de 60 fps en ninguna consola, tampoco en PS5 Pro.', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path=None, status='contrastado', sources=['outputlag-settings', 'sixcheats-performance']),
    dict(label='Mejoras de PS5 Pro', value='Imagen más nítida con PSSR y sombras con trazado de rayos exclusivas de PS5 Pro. Se aplican solas; no hay menú extra.', platforms=['ps5_pro'], path=None, status='oficial', sources=['rs-preload', 'sixcheats-performance']),
    dict(label='Resolución interna', value='≈1440p en PS5, PS5 Pro (reconstruida con PSSR) y Series X; ≈720p en Series S con reescalado.', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path=None, status='contrastado', sources=['outputlag-settings', 'sixcheats-performance']),
    dict(label='Estabilidad observada', value='PS5 Pro casi fija en 30; PS5 y Series X con caídas puntuales; Series S con caídas más frecuentes (análisis técnico citado por las guías).', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path=None, status='contrastado', sources=['outputlag-settings', 'sixcheats-performance']),
    dict(label='VRR y 120 Hz', value='No elevan el tope de 30 fps.', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path=None, status='reportado', sources=['sixcheats-performance']),
    dict(label='Juego en la nube', value='Disponible en Xbox Cloud Gaming en Xbox Series X|S y Xbox One, con los ajustes gráficos de Series S; la conexión puede afectar el rendimiento.', platforms=['xbox_series_x', 'xbox_series_s'], path=None, status='oficial', sources=['rs-preload']),
    dict(label='Remote Play', value='Compatible con Remote Play en PlayStation y Xbox.', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path=None, status='oficial', sources=['rs-preload'])]),
  dict(id='pantalla', title='Pantalla y HDR (dentro del juego)', scope='juego', items=[
    dict(label='Calibración de brillo', value='Ajusta hasta que el logotipo de Rockstar apenas se vea. No hay menú HDR aparte dentro del juego.', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path='Pausa → Settings → Display → Brightness Calibration', status='reportado', sources=['outputlag-settings']),
    dict(label='Desenfoque de movimiento', value='Valor predeterminado 3; 0 lo desactiva.', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path='Settings → Display → Motion Blur Strength', status='contrastado', sources=['outputlag-settings', 'sixcheats-performance']),
    dict(label='Opciones de contraste', value='Incluye High Contrast Shaders, Brightness Reduction y modo para daltonismo del rastro de Focus.', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path='Settings → Display', status='contrastado', sources=['outputlag-settings', 'sixcheats-performance']),
    dict(label='Sin opciones de FOV ni viñeta', value='No hay campo de visión, viñeta, profundidad de campo ni grano de película ajustables.', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path=None, status='reportado', sources=['outputlag-settings'])]),
  dict(id='camara', title='Cámara y comodidad', scope='juego', items=[
    dict(label='Sacudida y balanceo de cámara', value='Camera Shake y Camera Bob se pueden desactivar; Weapon Sway activado por defecto.', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path='Settings → Camera → Comfort', status='reportado', sources=['outputlag-settings']),
    dict(label='Primera persona', value='No hay vista en primera persona en el lanzamiento; solo la vista del teléfono.', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path='Settings → Camera → Comfort → Phone Display', status='reportado', sources=['outputlag-settings'])]),
  dict(id='controles', title='Controles y apuntado', scope='juego', items=[
    dict(label='Esquemas de control', value='Default, Classic y Left-Handed.', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path='Settings → Control Scheme', status='reportado', sources=['outputlag-settings']),
    dict(label='Sensibilidad', value='Look and Aim Sensitivity (predeterminado 7, máximo 14), aceleración, curva de respuesta y zona muerta.', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path='Settings → Controller', status='reportado', sources=['outputlag-settings']),
    dict(label='Asistencia de apuntado', value='Targeting: Lock-On, Partial (predeterminado) o Free Aim; Aim Assist Strength predeterminado 4.', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path='Settings → Gameplay → Combat → Targeting', status='reportado', sources=['outputlag-settings']),
    dict(label='Hápticos del DualSense', value='Retroalimentación háptica integrada y ajustable desde la configuración de accesibilidad.', platforms=['ps5', 'ps5_pro'], path=None, status='oficial', sources=['rs-preload'])]),
  dict(id='accesibilidad', title='Accesibilidad y audio', scope='juego', items=[
    dict(label='Opciones de accesibilidad', value='Tap Assist, Hold Assist, Simplified Mini Games, Auto Drive, Auto Equip Helmet, Accessible Combat y Reduced Vehicle Damage.', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path='Settings → Gameplay → Accessibility', status='reportado', sources=['outputlag-settings']),
    dict(label='Narración de pantalla', value='Se activa o desactiva en el audio, no en una sección de accesibilidad.', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path='Settings → Audio → Narration → Screen Narration', status='reportado', sources=['outputlag-settings']),
    dict(label='Audio 3D', value='Audio espacial mejorado con Tempest 3D Audio en PS5.', platforms=['ps5', 'ps5_pro'], path=None, status='oficial', sources=['rs-preload'])]),
  dict(id='consola-hdr', title='Ajustes de la consola (fuera del juego)', scope='consola', items=[
    dict(label='HDR en PS5', value='Calibra el HDR de la consola antes de la calibración del juego.', platforms=['ps5', 'ps5_pro'], path='Ajustes → Pantalla y video → Salida de video → Ajustar HDR', status='reportado', sources=['sixcheats-performance']),
    dict(label='HDR en Xbox', value='Calibra el HDR para juegos antes de la calibración del juego.', platforms=['xbox_series_x', 'xbox_series_s'], path='Configuración → General → Opciones de TV y pantalla → Calibrar HDR para juegos', status='reportado', sources=['sixcheats-performance']),
    dict(label='Televisor', value='Desactiva el suavizado de movimiento del televisor si notas imagen borrosa; usa el modo juego.', platforms=['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'], path=None, status='reportado', sources=['outputlag-settings'])]),
 ])
json.dump(console, open(C('console.json'), 'w'), indent=1, ensure_ascii=False)

# ---------- Equipamiento
loadout = dict(verifiedAt=V, patch=PATCH,
 slots=dict(sidearm=2, longarm=2, melee=1),
 rules=[F('Carga a pie', 'Hasta 2 armas cortas y 2 armas largas.', 'contrastado', 'gtabase-loadout', 'progamer-weapons'),
        F('Cuerpo a cuerpo, explosivos y equipo', 'Además: explosivos, 1 arma cuerpo a cuerpo y equipo como binoculares o linterna.', 'reportado', 'gtabase-loadout'),
        F('Almacenamiento', 'El resto se guarda en la cajuela de tu vehículo personal o en un casillero de armas de Ammu-Nation.', 'contrastado', 'gtabase-loadout', 'progamer-weapons'),
        F('Armas compradas', 'Quedan disponibles para Jason y Lucia; cada uno las modifica por separado.', 'contrastado', 'gtabase-loadout', 'progamer-weapons'),
        F('Armas únicas', 'No se pueden modificar; se desbloquean para ambos.', 'contrastado', 'gtabase-loadout', 'progamer-weapons', 'gamesgg-unique'),
        F('Armas no propias', 'Las recogidas del suelo no se modifican y se pierden al morir o ser arrestado.', 'reportado', 'gtabase-loadout')],
 attachments=[
   dict(id='suppressor', label='Silenciador', where='loadout', status='contrastado', sources=['gtabase-loadout', 'progamer-weapons']),
   dict(id='flashlight', label='Linterna táctica', where='loadout', status='contrastado', sources=['gtabase-loadout', 'progamer-weapons']),
   dict(id='grip', label='Empuñadura', where='ammunation', status='contrastado', sources=['gtabase-loadout', 'progamer-weapons']),
   dict(id='magazine', label='Cargador', where='ammunation', status='contrastado', sources=['gtabase-loadout', 'progamer-weapons']),
   dict(id='optic', label='Mira óptica', where='ammunation', status='contrastado', sources=['gtabase-loadout', 'progamer-weapons'])],
 compatibilityNote='Ninguna fuente revisada publica qué accesorios acepta cada arma ni sus precios: el constructor no los inventa.',
 classes={'sidearm': ['pistola', 'revólver', 'revolver'], 'longarm': ['escopeta', 'rifle', 'carabina', 'francotirador'], 'melee': ['cuchillo'], 'unclassified': ['subfusil', 'smg']},
 classNote='La guía no clasifica cada arma. Pistolas y revólveres se tratan como armas cortas y escopetas, rifles y carabinas como largas; los subfusiles quedan sin clasificar y puedes asignarlos tú.')
json.dump(loadout, open(C('loadout.json'), 'w'), indent=1, ensure_ascii=False)
print('coleccionables', len(COLS), 'trucos', len(out), 'contrastados', sum(1 for c in out if c['sequenceStatus'] == 'contrastado'), 'reportados', sum(1 for c in out if c['sequenceStatus'] == 'reportado'), 'desconocidas', sum(1 for c in out if c['sequenceStatus'] == 'desconocida'))
