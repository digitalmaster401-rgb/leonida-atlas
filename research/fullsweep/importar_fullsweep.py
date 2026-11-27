"""Adaptador de FullSweep (independiente de GTADB) — solo staging, nunca producción.

- /api/v1/locations: ubicaciones propias de FullSweep (con source official/community/unverified y sourceUrl).
- /api/v1/landmarks: copia de GTADB en píxeles de FullSweep. NO se importan como registros nuevos (serían
  duplicados de la misma fuente); solo se usan para medir la correspondencia GTADB ↔ FullSweep (sourceNote «GTADB.ORG L…»).
- Coordenadas: píxeles del mapa base de FullSweep (3344 × 4820). El dibujo del mapa NO se reutiliza (no está licenciado).
Uso: python3 importar_fullsweep.py --out <fullsweep-staging.json> [--gtadb <gtadb6-staging.json>]"""
import argparse
import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from cliente_http import Cliente  # noqa: E402

API = 'https://fullsweepmap.com/api/v1'
ATRIBUCION = 'FullSweep data CC BY 4.0, https://fullsweepmap.com; landmarks: gtadb.org and contributors, CC BY 4.0'
FUENTES_VALIDAS = {'official', 'community', 'unverified'}
GTADB_ID = re.compile(r'GTADB\.ORG\s+(L\d+)')


def normalizar_ubicaciones(payload, fecha):
    if not isinstance(payload, dict) or not isinstance(payload.get('locations'), list):
        raise ValueError('Respuesta de FullSweep incompatible con el contrato documentado')
    aceptadas, rechazadas, vistos = [], [], set()
    for i, r in enumerate(payload['locations']):
        if not isinstance(r, dict) or not isinstance(r.get('id'), str) or not re.fullmatch(r'[a-z0-9-]{1,80}', r['id']):
            rechazadas.append({'index': i, 'reason': 'invalid_id'})
            continue
        if r['id'] in vistos:
            rechazadas.append({'index': i, 'id': r['id'], 'reason': 'duplicate'})
            continue
        x, y = r.get('x'), r.get('y')
        if type(x) not in (int, float) or type(y) not in (int, float) or not (0 <= x <= 3344 and 0 <= y <= 4820):
            rechazadas.append({'index': i, 'id': r['id'], 'reason': 'invalid_coordinates'})
            continue
        if r.get('source') not in FUENTES_VALIDAS:
            rechazadas.append({'index': i, 'id': r['id'], 'reason': 'unknown_source_label'})
            continue
        vistos.add(r['id'])
        url = r.get('sourceUrl') if isinstance(r.get('sourceUrl'), str) else None
        aceptadas.append({
            'id': 'fullsweep:' + r['id'],
            'sourceId': r['id'],
            'provider': 'fullsweep',
            'attribution': ATRIBUCION,
            'fetchedAt': fecha,
            'originalName': r.get('title'),
            'originalDescription': r.get('desc'),
            'category': r.get('cat'),
            'region': r.get('region'),
            'providerSourceLabel': r['source'],
            'originalSourceUrl': url,
            'originalSourceDomain': urlparse(url).netloc.removeprefix('www.') if url else None,
            'coordinates': {'system': 'fullsweep-basemap-px-3344x4820', 'x': x, 'y': y},
            'mapPosition': None,
            'publishable': False,
            'status': 'pendiente_verificacion_fuente' if r['source'] != 'official' or not url else 'pendiente_revision',
        })
    return aceptadas, rechazadas


def pares_gtadb(landmarks, gtadb_por_id):
    """Correspondencias exactas por id original: GTADB (m) ↔ FullSweep (px)."""
    pares = []
    for lm in landmarks:
        m = GTADB_ID.search(lm.get('sourceNote') or '')
        g = gtadb_por_id.get(m.group(1)) if m else None
        if g and type(lm.get('x')) in (int, float) and type(lm.get('y')) in (int, float):
            pares.append({'id': m.group(1), 'src': [g['x'], g['y']], 'dst': [lm['x'], lm['y']]})
    return pares


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--out', type=Path, required=True)
    p.add_argument('--gtadb', type=Path)
    a = p.parse_args()
    if 'staging' not in a.out.name or a.out.exists():
        p.error('La salida debe incluir «staging» en el nombre y no existir.')
    cli = Cliente(max_peticiones=5)
    fecha = datetime.now(timezone.utc).isoformat(timespec='seconds')
    stats = cli.get_json(API + '/stats')
    loc = cli.get_json(API + '/locations')
    aceptadas, rechazadas = normalizar_ubicaciones(loc, fecha)
    pares = []
    if a.gtadb:
        lm = cli.get_json(API + '/landmarks').get('landmarks', [])
        g = {c['sourceId']: c['coordinates'] for c in json.loads(a.gtadb.read_text(encoding='utf-8'))['candidates']}
        pares = pares_gtadb(lm, g)
    resumen = {
        'stats': stats.get('counts'),
        'aceptadas': len(aceptadas),
        'rechazadas': len(rechazadas),
        'por_categoria': dict(Counter(x['category'] for x in aceptadas)),
        'por_etiqueta_fuente': dict(Counter(x['providerSourceLabel'] for x in aceptadas)),
        'dominios_fuente_original': dict(Counter(x['originalSourceDomain'] for x in aceptadas)),
        'pares_gtadb_fullsweep': len(pares),
        'peticiones_red': cli.peticiones,
    }
    a.out.write_text(json.dumps({'fuente': API, 'atribucion': ATRIBUCION, 'fecha': fecha, 'resumen': resumen, 'ubicaciones': aceptadas, 'rechazadas': rechazadas, 'paresGtadb': pares}, ensure_ascii=False, indent=1), encoding='utf-8')
    print(json.dumps(resumen, ensure_ascii=False))


if __name__ == '__main__':
    main()
