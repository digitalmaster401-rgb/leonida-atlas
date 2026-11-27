"""Cliente HTTP de investigación: caché en disco, una petición cada `intervalo` segundos y reintentos limitados.
Nunca lanza miles de peticiones: `max_peticiones` corta la ejecución. Sin claves."""
import hashlib
import json
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

UA = 'LeonidaAtlas-research/0.2 (investigacion; respeta limites)'
CACHE = Path(__file__).resolve().parent / '.cache'


class Cliente:
    def __init__(self, intervalo=1.2, reintentos=3, max_peticiones=60, cache=CACHE, abrir=urlopen, dormir=time.sleep):
        self.intervalo, self.reintentos, self.max = intervalo, reintentos, max_peticiones
        self.cache, self.abrir, self.dormir = Path(cache), abrir, dormir
        self.peticiones = 0
        self.desde_cache = 0
        self._ultima = 0.0

    def _ruta(self, url):
        return self.cache / (hashlib.sha256(url.encode()).hexdigest()[:24] + '.json')

    def get_json(self, url):
        ruta = self._ruta(url)
        if ruta.exists():
            self.desde_cache += 1
            return json.loads(ruta.read_text(encoding='utf-8'))['body']
        if self.peticiones >= self.max:
            raise RuntimeError(f'Límite de {self.max} peticiones alcanzado; se detiene para no saturar la fuente.')
        ultimo_error = None
        for intento in range(self.reintentos):
            espera = self.intervalo - (time.monotonic() - self._ultima)
            if espera > 0:
                self.dormir(espera)
            self._ultima = time.monotonic()
            self.peticiones += 1
            try:
                with self.abrir(Request(url, headers={'User-Agent': UA, 'Accept': 'application/json'}), timeout=25) as r:
                    body = json.loads(r.read(5_000_001))
                self.cache.mkdir(parents=True, exist_ok=True)
                ruta.write_text(json.dumps({'url': url, 'body': body}, ensure_ascii=False), encoding='utf-8')
                return body
            except HTTPError as e:
                ultimo_error = e
                if e.code not in (429, 500, 502, 503, 504):
                    raise
            except (URLError, TimeoutError) as e:
                ultimo_error = e
            self.dormir(2 ** intento * self.intervalo)
        raise RuntimeError(f'Sin respuesta tras {self.reintentos} intentos: {url} ({ultimo_error})')
