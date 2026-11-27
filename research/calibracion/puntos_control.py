"""Genera candidatos a puntos de control póster ↔ GTADB SIN inventar nada.

Póster: posición del rótulo de barrio/zona ya documentada en content/*.json (mapPosition con «rótulo» en basis).
GTADB: /geocode?address=<nombre> devuelve landmarks cuyo address incluye ese barrio o lugar; se usa el
centroide de los resultados cuyo componente coincide exactamente con el nombre, con su dispersión (m).
Un rótulo NO es un punto exacto: la dispersión y el error de validación dicen cuánto vale cada par.
Uso: python3 puntos_control.py [--max-peticiones 40]"""
import argparse
import glob
import json
import re
import statistics
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / 'research'))
from cliente_http import Cliente  # noqa: E402

ATRIBUCION = 'GTA VI Landmarks Data (CC BY 4.0) — https://map.gtadb.org'


def rotulos():
    """Rótulos únicos de precisión barrio/zona con su nombre (de la ficha de lugar o entre «» en basis)."""
    out = {}
    for f in sorted(glob.glob(str(RAIZ / 'content' / '*.json'))):
        data = json.loads(Path(f).read_text(encoding='utf-8'))
        if not isinstance(data, list):
            continue
        for e in data:
            m = e.get('mapPosition') if isinstance(e, dict) else None
            if not m or m['precision'] not in ('barrio', 'zona') or 'rótulo' not in m['basis'].lower():
                continue
            nombre = e['name'] if e.get('category') == 'lugares' else None
            if not nombre:
                q = re.search(r'«([^»]+)»', m['basis'])
                nombre = q.group(1) if q else None
            if not nombre:
                continue
            clave = (round(m['x'], 4), round(m['y'], 4))
            out.setdefault(clave, {'nombre': nombre, 'x': m['x'], 'y': m['y'], 'precision': m['precision'], 'fichas': []})['fichas'].append(e['id'])
    return list(out.values())


def centroide(nombre, resultados):
    pts = []
    for r in resultados:
        comps = [c['long_name'] for c in r.get('address_components', []) if 'establishment' not in c.get('types', [])]
        if nombre.lower() in (c.lower() for c in comps):
            pts.append(r['geometry']['location'])
    if not pts:
        return None
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    cx, cy = statistics.fmean(xs), statistics.fmean(ys)
    disp = statistics.fmean(((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 for x, y in pts)
    return {'x': round(cx, 2), 'y': round(cy, 2), 'n': len(pts), 'dispersionMedia': round(disp, 1), 'ids': [r.get('gtadb_id') for r in resultados][:10]}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--max-peticiones', type=int, default=40)
    p.add_argument('--out', type=Path, default=Path(__file__).with_name('puntos-control-v1.json'))
    a = p.parse_args()
    cli = Cliente(max_peticiones=a.max_peticiones)
    pares = []
    for r in rotulos():
        body = cli.get_json(f'https://api.gtadb.org/geocode?gta=6&address={quote(r["nombre"].lower())}')
        c = centroide(r['nombre'], body.get('results', []) if body.get('status') == 'OK' else [])
        pares.append({**r, 'gtadb': c, 'estado': 'candidato' if c else 'sin_equivalente'})
    salida = {
        'version': 1,
        'generado': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'metodo': 'Rótulo del póster oficial (content/*.json) ↔ centroide de landmarks GTADB del mismo barrio/lugar (/geocode).',
        'sistemaOrigen': 'gtadb6-world-m (x, y en metros del mundo del juego, estimación de la comunidad)',
        'sistemaDestino': 'poster-v2-norm (x, y normalizados 0–1 sobre el póster oficial v2)',
        'atribucion': ATRIBUCION,
        'peticiones': {'red': cli.peticiones, 'cache': cli.desde_cache},
        'pares': pares,
    }
    a.out.write_text(json.dumps(salida, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(json.dumps({'pares': len(pares), 'con_equivalente': sum(1 for x in pares if x['gtadb']), **salida['peticiones']}))


if __name__ == '__main__':
    main()
