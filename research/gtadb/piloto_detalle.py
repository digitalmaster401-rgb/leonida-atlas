"""Lote piloto del endpoint de detalle de GTADB (/landmarks?gta=6&id=…).
Pocas peticiones (por defecto 25), una cada 1,2 s, caché y reintentos limitados (research/cliente_http.py).
Conserva id original, atribución y procedencia; NO descarga imágenes ni publica nada.
Los registros sin nombre o sin tipo quedan «pendiente_clasificacion».
Uso: python3 piloto_detalle.py --staging <gtadb6-staging.json> --n 25 --out <piloto-staging.json>"""
import argparse
import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from cliente_http import Cliente  # noqa: E402

BASE = 'https://api.gtadb.org/landmarks?gta=6&id='
ATRIBUCION = 'GTA VI Landmarks Data (CC BY 4.0) — https://map.gtadb.org'


def muestra(candidatos, n):
    """Muestra reproducible: mitad con tipo y mitad sin tipo, en orden de id numérico."""
    num = lambda c: int(re.sub(r'\D', '', c['sourceId']) or 0)  # noqa: E731
    con = sorted((c for c in candidatos if c['originalTypes']), key=num)
    sin = sorted((c for c in candidatos if not c['originalTypes']), key=num)
    k = n // 2
    return con[:n - k] + sin[:k]


def nombre_de(direccion):
    """El primer componente de ig_address es el nombre del lugar; «?» significa desconocido."""
    if not isinstance(direccion, str) or not direccion.strip():
        return None
    primero = direccion.split(',')[0].strip()
    return None if primero in ('', '?') else primero


def normalizar_detalle(c, body, fecha):
    r = (body.get('results') or [None])[0] if isinstance(body, dict) and body.get('status') == 'OK' else None
    if not isinstance(r, dict):
        return {**c, 'detalle': None, 'status': 'sin_detalle'}
    nombre = nombre_de(r.get('ig_address'))
    tipos = r.get('types') if isinstance(r.get('types'), list) else c['originalTypes']
    return {
        **c,
        'originalName': nombre,
        'gameAddress': r.get('ig_address'),
        'originalTypes': tipos,
        'coordinatesDetail': r.get('ig_coordinates'),
        'realWorldInspiration': r.get('rl_address'),
        'photos': [],
        'photoRefs': [u for u in (r.get('ig_photo'), r.get('rl_photo')) if isinstance(u, str)],
        'photoRights': 'no_concedidos: capturas del juego (Rockstar) y fotos reales de terceros; GTADB no otorga derechos sobre ellas',
        'detailFetchedAt': fecha,
        'status': 'pendiente_revision' if nombre and tipos else 'pendiente_clasificacion',
        'publishable': False,
    }


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--staging', type=Path, required=True)
    p.add_argument('--n', type=int, default=25)
    p.add_argument('--out', type=Path, required=True)
    a = p.parse_args()
    if a.n > 50:
        p.error('El piloto se limita a 50 registros.')
    if 'staging' not in a.out.name or a.out.exists():
        p.error('La salida debe incluir «staging» en el nombre y no existir.')
    st = json.loads(a.staging.read_text(encoding='utf-8'))
    cli = Cliente(max_peticiones=a.n + 5)
    fecha = datetime.now(timezone.utc).isoformat(timespec='seconds')
    out = [normalizar_detalle(c, cli.get_json(BASE + c['sourceId']), fecha) for c in muestra(st['candidates'], a.n)]
    resumen = {
        'muestra': len(out),
        'con_nombre': sum(1 for c in out if c.get('originalName')),
        'con_direccion': sum(1 for c in out if c.get('gameAddress')),
        'con_tipo': sum(1 for c in out if c.get('originalTypes')),
        'con_referencia_foto': sum(1 for c in out if c.get('photoRefs')),
        'con_inspiracion_real': sum(1 for c in out if c.get('realWorldInspiration')),
        'estados': dict(Counter(c['status'] for c in out)),
        'peticiones_red': cli.peticiones,
        'desde_cache': cli.desde_cache,
    }
    a.out.write_text(json.dumps({'fuente': BASE + '<id>', 'atribucion': ATRIBUCION, 'fecha': fecha, 'resumen': resumen, 'registros': out}, ensure_ascii=False, indent=1), encoding='utf-8')
    print(json.dumps(resumen, ensure_ascii=False))


if __name__ == '__main__':
    main()
