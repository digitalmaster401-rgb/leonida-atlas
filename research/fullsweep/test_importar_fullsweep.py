import unittest
from importar_fullsweep import normalizar_ubicaciones, pares_gtadb


def loc(**k):
    base = {'id': 'sh-keys', 'cat': 'safehouse', 'x': 100, 'y': 200, 'title': 'T', 'source': 'official', 'sourceUrl': 'https://www.rockstargames.com/VI'}
    return {**base, **k}


class FullSweepTests(unittest.TestCase):
    def test_normaliza_sin_publicar_ni_proyectar(self):
        ok, bad = normalizar_ubicaciones({'locations': [loc()]}, 't')
        self.assertEqual(len(ok), 1)
        self.assertEqual(ok[0]['coordinates']['system'], 'fullsweep-basemap-px-3344x4820')
        self.assertIsNone(ok[0]['mapPosition'])
        self.assertFalse(ok[0]['publishable'])
        self.assertEqual(ok[0]['originalSourceDomain'], 'rockstargames.com')

    def test_rechaza_duplicados_coordenadas_y_etiquetas(self):
        ok, bad = normalizar_ubicaciones({'locations': [loc(), loc(), loc(id='b', x=9999), loc(id='c', source='rumor'), loc(id='Mal ID')]}, 't')
        self.assertEqual(len(ok), 1)
        self.assertEqual(sorted(b['reason'] for b in bad), ['duplicate', 'invalid_coordinates', 'invalid_id', 'unknown_source_label'])

    def test_oficial_sin_url_queda_por_verificar(self):
        ok, _ = normalizar_ubicaciones({'locations': [loc(sourceUrl=None), loc(id='d', source='community')]}, 't')
        self.assertEqual({x['status'] for x in ok}, {'pendiente_verificacion_fuente'})

    def test_landmarks_solo_como_pares_por_id(self):
        lms = [{'sourceNote': 'GTADB.ORG L2 · x', 'x': 10, 'y': 20}, {'sourceNote': 'otro', 'x': 1, 'y': 1}]
        self.assertEqual(pares_gtadb(lms, {'L2': {'x': 5, 'y': 6}}), [{'id': 'L2', 'src': [5, 6], 'dst': [10, 20]}])

    def test_contrato(self):
        with self.assertRaises(ValueError):
            normalizar_ubicaciones({'results': []}, 't')


if __name__ == '__main__':
    unittest.main()
