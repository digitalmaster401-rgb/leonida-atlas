"""Genera docs/v4/COBERTURA.md: qué tenemos (content/catalog/index.json + fichas curadas) frente a los totales que
publican las fuentes. Los totales de referencia son cifras citadas por las fuentes (no datos copiados)."""
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
REF = {
    'vehicles': ('Vehículos', [('Base de progreso del juego (GTA Scoop y PowerPyx, citado por GTA Atlas)', 557), ('Índice de GTABase', 329), ('GTA Town (página de datos)', 560)]),
    'weapons': ('Armas', [('Juego: 66 estándar + 130 variantes (GTA Scoop y PowerPyx, citado por GTA Atlas)', 196), ('Índice de GTABase', 205), ('GTA Town', 202)]),
    'properties': ('Propiedades', [('Garajes y refugios publicados (GTA Atlas)', 19)]),
    'locations': ('Lugares', [('Landmarks de GTADB', 4380), ('Lugares con nombre en GTA Town', 2889)]),
    'collectibles': ('Colecciones (conjuntos)', [('Marcadores individuales en GTA Town', 4021), ('Tarjetas coleccionables en GTA Town', 406)]),
    'missions': ('Misiones', [('Misiones principales en GTA Town', 92), ('Filas de misiones en los datos de GTA Town', 195)]),
    'trophies': ('Trofeos y logros', [('PowerPyx (1 platino, 2 oro, 6 plata, 46 bronce)', 55)]),
    'completion': ('Lista del 100 %', [('Líneas del 100 % (IGN y PowerPyx)', 35)]),
    'cheats': ('Trucos', [('GamesRadar (19 con secuencia publicada)', 61)]),
    'characters': ('Personajes', [('Personajes en GTA Town', 140)]),
    'animals': ('Fauna', [('Entradas del registro de fauna del juego (citado por GTA Atlas)', 255)]),
    'interiors': ('Interiores', [('Tiendas en GTA Town (alcance más amplio)', 474)]),
}


def main():
    idx = json.loads((RAIZ / 'content/catalog/index.json').read_text(encoding='utf-8'))
    r, t = idx['resumen'], idx['totales']
    out = [
        '# Cobertura de la base de datos de LEONIDA ATLAS',
        '',
        f"Generado desde `content/catalog/index.json` (importación del {idx['importado'][:10]}). Fuente integrada: GTA Atlas (CC BY-SA 4.0). GTA Town **no** se integró (licencia por resolver) y solo aporta totales de referencia.",
        '',
        f"**Totales:** recibidos {t['recibidos']} · publicados {t['publicados']} · pendientes de verificar {t['pendientesVerificar']} · pendientes de revisión {t['pendientesRevision']} · rechazados {t['rechazados']} · duplicados {t['duplicados']} · con foto oficial {t['conFoto']} · sin foto oficial {t['sinFoto']}.",
        '',
        '| Catálogo | Recibidos | Publicados | Por verificar | Rechazados | Duplicados | Ya en fichas curadas | Con foto | Sin foto | Referencia externa | Falta (aprox.) |',
        '|---|---|---|---|---|---|---|---|---|---|---|',
    ]
    for e, (titulo, refs) in REF.items():
        x = r[e]
        mayor = max(n for _, n in refs)
        falta = max(0, mayor - x['publicados'])
        out.append(f"| {titulo} | {x['recibidos']} | {x['publicados']} | {x['pendientesVerificar'] + x['pendientesRevision']} | {x['rechazados']} | {x['duplicados']} | {x['enlazadosConFichaCurada']} | {x['conFoto']} | {x['sinFoto']} | " + '; '.join(f'{n} ({d})' for d, n in refs) + f' | {falta} |')
    out += [
        '',
        '## Qué falta y por qué',
        '- **Fotos:** solo se aceptan imágenes oficiales de rockstargames.com/VI o ilustración propia. Las de GTA Atlas son fotogramas de videos de terceros y las de GTADB capturas del juego: no se usan. Las fichas sin foto muestran «Foto oficial pendiente».',
        '- **Vehículos y armas:** GTA Atlas solo publica los que tienen página en GTABase; el juego registra más (557 vehículos, 196 armas). Faltan sobre todo variantes.',
        '- **Coleccionables individuales:** GTA Atlas solo tiene conjuntos (sin posiciones comprobadas). Los 4021 marcadores de GTA Town no se integran hasta resolver su licencia.',
        '- **Lugares:** 115 registros marcados «unverified» por la fuente esperan verificación; ningún lugar se pinta en el mapa (calibración solo «zona»).',
        '- **Estadísticas:** las calificaciones sobre 10 son valoraciones de GTABase y no se importan; velocidades y daños medidos no existen todavía.',
        '- **Descripciones:** son resúmenes propios en español generados a partir de los hechos; la prosa en inglés de GTA Atlas no se copia.',
        '',
        '## Evidencia por catálogo',
        '',
        '| Catálogo | Oficial | Contrastado | Reportado |',
        '|---|---|---|---|',
    ]
    for e, (titulo, _) in REF.items():
        ev = r[e]['porEvidencia']
        out.append(f"| {titulo} | {ev.get('oficial', 0)} | {ev.get('contrastado', 0)} | {ev.get('reportado', 0)} |")
    (RAIZ / 'docs/v4/COBERTURA.md').write_text('\n'.join(out) + '\n', encoding='utf-8')
    print('docs/v4/COBERTURA.md')


if __name__ == '__main__':
    main()
