import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from urllib.error import HTTPError

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from cliente_http import Cliente  # noqa: E402
from piloto_detalle import muestra, nombre_de, normalizar_detalle  # noqa: E402


class Resp(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


def cand(i, types):
    return {'sourceId': f'L{i}', 'originalTypes': types, 'coordinates': {'x': 1, 'y': 2}}


class PilotoTests(unittest.TestCase):
    def test_nombre_desconocido(self):
        self.assertEqual(nombre_de('Vice Regal, Washington Beach, Vice Beach'), 'Vice Regal')
        self.assertIsNone(nombre_de('?, Washington Beach'))
        self.assertIsNone(nombre_de(None))

    def test_muestra_mitad_con_y_sin_tipo(self):
        cs = [cand(i, ['hotel'] if i % 2 else []) for i in range(1, 41)]
        m = muestra(cs, 10)
        self.assertEqual(len(m), 10)
        self.assertEqual(sum(1 for c in m if c['originalTypes']), 5)

    def test_sin_nombre_queda_pendiente_de_clasificacion_y_sin_fotos(self):
        body = {'status': 'OK', 'results': [{'ig_address': '?, Ocean Beach', 'types': ['hotel'], 'ig_photo': 'https://x/ig.jpg'}]}
        r = normalizar_detalle(cand(5, ['hotel']), body, 't')
        self.assertEqual(r['status'], 'pendiente_clasificacion')
        self.assertEqual(r['photos'], [])
        self.assertFalse(r['publishable'])
        ok = normalizar_detalle(cand(1, ['hotel']), {'status': 'OK', 'results': [{'ig_address': 'Vice Regal, X', 'types': ['hotel']}]}, 't')
        self.assertEqual(ok['status'], 'pendiente_revision')
        self.assertEqual(normalizar_detalle(cand(2, []), {'status': 'ERROR'}, 't')['status'], 'sin_detalle')


class ClienteTests(unittest.TestCase):
    def test_cache_limite_y_reintentos(self):
        llamadas = []

        def abrir(req, timeout):
            llamadas.append(req.full_url)
            if len(llamadas) == 1:
                raise HTTPError(req.full_url, 503, 'busy', {}, None)
            return Resp(json.dumps({'ok': True}).encode())

        with tempfile.TemporaryDirectory() as d:
            c = Cliente(intervalo=0, max_peticiones=2, cache=d, abrir=abrir, dormir=lambda s: None)
            self.assertEqual(c.get_json('https://a/1'), {'ok': True})
            self.assertEqual(len(llamadas), 2)
            self.assertEqual(c.get_json('https://a/1'), {'ok': True})
            self.assertEqual(c.desde_cache, 1)
            with self.assertRaises(RuntimeError):
                c.get_json('https://a/2')

    def test_error_no_recuperable_no_reintenta(self):
        def abrir(req, timeout):
            raise HTTPError(req.full_url, 404, 'nf', {}, None)

        with tempfile.TemporaryDirectory() as d:
            c = Cliente(intervalo=0, cache=d, abrir=abrir, dormir=lambda s: None)
            with self.assertRaises(HTTPError):
                c.get_json('https://a/x')
            self.assertEqual(c.peticiones, 1)


if __name__ == '__main__':
    unittest.main()
