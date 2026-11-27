import unittest
from importar_gtadb import normalize
class ImporterTests(unittest.TestCase):
    def row(self): return {'id':'TEST_1','ig_coordinates':[10,-20],'types':['test'],'rl_coordinates':[25,-80], 'ig_photo':'https://example.invalid/photo.jpg'}
    def data(self,*rows): return {'status':'OK','results':list(rows)}
    def test_staging(self):
        r=normalize(self.data(self.row()),'test'); p=r['candidates'][0]; self.assertFalse(p['publishable']); self.assertIsNone(p['mapPosition']); self.assertIsNone(p['verifiedAt']); self.assertEqual(p['coordinates']['y'],-20); self.assertEqual(p['photos'],[])
    def test_duplicate(self): self.assertEqual(normalize(self.data(self.row(),self.row()),'test')['counts']['rejected'],1)
    def test_conflict(self):
        q=self.row();q['ig_coordinates']=[1,2]
        with self.assertRaises(ValueError): normalize(self.data(self.row(),q),'test')
    def test_invalid_coordinates(self):
        q=self.row();q['ig_coordinates']=[True,2];self.assertEqual(normalize(self.data(q),'test')['counts']['accepted'],0)
    def test_bad_response(self):
        with self.assertRaises(ValueError): normalize({'status':'ERROR','results':[]},'test')
    def test_no_game_coordinates(self):
        q=self.row();del q['ig_coordinates'];self.assertEqual(normalize(self.data(q),'test')['counts']['accepted'],0)
if __name__=='__main__': unittest.main()
