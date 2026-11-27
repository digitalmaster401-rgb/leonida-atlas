import unittest
from importar_atlasgta import evidencia, importar, t_vehicles, t_weapons


def veh(**k):
    base = {'slug': 'vapid-stanier-55', 'name': "'55 Vapid Stanier", 'class': 'sedan', 'manufacturer': 'Vapid', 'price': None, 'register_cost': 1000, 'sell_value': 500,
            'acquisition': [{'method': 'reward', 'location_slug': None}], 'sources': ['https://www.gtabase.com/x', 'https://gtascoop.com/y'], 'confidence': 'confirmed',
            'images': [{'kind': 'footage-still', 'src': '/media/x.jpg'}], 'prose': 'English prose', 'stats': {'speed_rating': 7.5}, 'related': []}
    return {**base, **k}


class AtlasTests(unittest.TestCase):
    def test_evidencia(self):
        self.assertEqual(evidencia(['https://www.rockstargames.com/VI', 'https://gtabase.com/a'], 'confirmed')[0], 'oficial')
        self.assertEqual(evidencia(['https://gtabase.com/a', 'https://ign.com/b'], 'likely')[0], 'contrastado')
        self.assertEqual(evidencia(['https://gtabase.com/a', 'https://youtube.com/v'], 'confirmed')[0], 'reportado')
        self.assertEqual(evidencia(['https://map.gtadb.org/#VI,L1'], 'unverified')[0], 'pendiente')

    def test_solo_hechos_sin_prosa_calificaciones_ni_imagenes(self):
        pub, *_ = importar('vehicles', {'rows': [veh()]}, {}, set(), True, {}, 't')
        r = pub[0]
        self.assertEqual(r['nombre'], "'55 Vapid Stanier")
        self.assertNotIn('English prose', str(r))
        self.assertNotIn('7.5', str(r))
        self.assertIsNone(r['foto'])
        self.assertIsNone(r['coords'])
        self.assertIn('Sedán', r['resumen'])
        self.assertEqual(r['estado'], 'contrastado')

    def test_rechazos_duplicados_y_pendientes(self):
        rows = [veh(), veh(), veh(slug='x', name='Otro', sources=[]), veh(slug='y', name='Z', confidence='unverified', sources=['https://gtabase.com/z'])]
        pub, pend, rech, dup, n = importar('vehicles', {'rows': rows}, {}, set(), True, {}, 't')
        self.assertEqual((len(pub), len(pend), len(rech), len(dup), n), (1, 1, 1, 1, 4))

    def test_mismo_nombre_distinto_lugar_no_es_duplicado(self):
        loc = lambda s, gid: {'slug': s, 'name': 'Bridge', 'kind': 'landmark', 'gtadb_id': gid, 'coords': {'x': 1, 'y': 2}, 'sources': ['https://map.gtadb.org/#VI,' + gid, 'https://pcgamer.com/a'], 'confidence': 'likely'}  # noqa: E731
        pub, _, _, dup, _ = importar('locations', {'rows': [loc('a', 'L1'), loc('b', 'L2')]}, {}, set(), True, {}, 't')
        self.assertEqual((len(pub), len(dup)), (2, 0))
        self.assertEqual(pub[0]['coords']['sistema'], 'gtadb6-world-m')

    def test_incremental_lo_nuevo_o_cambiado_va_a_revision(self):
        pub, *_ = importar('vehicles', {'rows': [veh()]}, {}, set(), True, {}, 't')
        previo = {pub[0]['id']: pub[0]['hash']}
        pub2, pend2, *_ = importar('vehicles', {'rows': [veh(), veh(slug='nuevo', name='Nuevo')]}, previo, set(), False, {}, 't')
        self.assertEqual([r['slug'] for r in pub2], ['vapid-stanier-55'])
        self.assertEqual(pend2[0]['motivoPendiente'], 'nuevo')
        pub3, pend3, *_ = importar('vehicles', {'rows': [veh(price=999)]}, previo, set(), False, {}, 't')
        self.assertEqual((len(pub3), pend3[0]['motivoPendiente']), (0, 'cambiado'))
        pub4, *_ = importar('vehicles', {'rows': [veh(price=999)]}, previo, {'vehicles:vapid-stanier-55'}, False, {}, 't')
        self.assertEqual(len(pub4), 1)

    def test_curada_enlaza_y_reusa_foto_oficial(self):
        cur = {'55 vapid stanier': {'id': 'veh-stanier', 'category': 'vehiculos', 'slug': 'vapid-stanier', 'images': ['vv-stanier']}}
        pub, *_ = importar('vehicles', {'rows': [veh()]}, {}, set(), True, cur, 't')
        self.assertEqual(pub[0]['curada']['ruta'], '/vehiculos/vapid-stanier')
        self.assertEqual(pub[0]['foto'], 'vv-stanier')

    def test_armas_sin_calificaciones(self):
        t = t_weapons({'class': 'pistol', 'manufacturer': 'Hawk', 'price': 700, 'stats': {'damage': 4.2, 'clip_size': 15}, 'acquisition': []})
        self.assertIn('15', t['resumen'])
        self.assertNotIn('4.2', str(t))
        self.assertEqual(t_vehicles(veh())['numeros'], {'registro': 1000, 'venta': 500})

    def test_contrato(self):
        with self.assertRaises(ValueError):
            importar('vehicles', {'data': []}, {}, set(), True, {}, 't')


if __name__ == '__main__':
    unittest.main()
