"""Prueba de contrato con un extracto REAL de la respuesta de GTADB (27-nov-2026).
Si la API cambia de forma, esta prueba y el importador deben revisarse antes de cualquier uso."""
import json
import unittest
from pathlib import Path
from importar_gtadb import normalize

FIXTURE = json.loads(Path(__file__).with_name('fixture_respuesta_real.json').read_text(encoding='utf-8'))


class ContratoReal(unittest.TestCase):
    def test_forma_de_la_respuesta(self):
        self.assertEqual(FIXTURE['status'], 'OK')
        for row in FIXTURE['results']:
            self.assertEqual(set(row), {'id', 'ig_coordinates', 'types'})

    def test_normaliza_sin_publicar_ni_proyectar(self):
        r = normalize(FIXTURE, 'contrato')
        self.assertEqual(r['counts'], {'received': 5, 'accepted': 4, 'rejected': 1})
        self.assertEqual(r['rejected'][0]['reason'], 'invalid_game_coordinates')
        for c in r['candidates']:
            self.assertFalse(c['publishable'])
            self.assertIsNone(c['mapPosition'])
            self.assertIsNone(c['originalName'])
            self.assertEqual(c['coordinates']['system'], 'gtadb6-provider-xy-unvalidated')


if __name__ == '__main__':
    unittest.main()
