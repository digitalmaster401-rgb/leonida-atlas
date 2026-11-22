#!/usr/bin/env python3
"""Descarga las imágenes oficiales seleccionadas desde rockstargames.com/VI y genera
versiones WebP optimizadas (640 px y 1280 px) en public/media/official/.

Fuente de la lista: sources/official-images.json (archivo, página oficial, alt oficial).
Las imágenes son material oficial de Rockstar Games compartido por la propia página
https://www.rockstargames.com/VI/media ("Download and share official videos,
screenshots, and more"). Se usan sin alterar su contenido (solo redimensionado y
compresión), sin fines comerciales y con atribución. Ver ATTRIBUTIONS.md.
"""
import io, json, os, sys, urllib.request, hashlib
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "media", "official")
LIST = os.path.join(ROOT, "sources", "official-images.json")
MAP = {
    "id": "mapa-oficial-leonida",
    "remote": "https://www.rockstargames.com/VI/_next/static/media/Leonida_Map_Poster.08ir77j-.26ny.jpg",
    "page": "https://www.rockstargames.com/VI/media",
    "officialAltEn": None,
    "captionEs": "Mapa oficial del estado de Leonida (póster descargable de Rockstar Games).",
    "width": 2805, "height": 3840,
}
SIZES = [640, 1280]
UA = {"User-Agent": "Mozilla/5.0 (LeonidaAtlas build script)"}


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def main():
    os.makedirs(OUT, exist_ok=True)
    items = json.load(open(LIST, encoding="utf8"))
    manifest = []
    for it in items + [MAP]:
        is_map = it["id"] == MAP["id"]
        sizes = [1200, 2400] if is_map else SIZES
        files = {}
        need = [s for s in sizes if not os.path.exists(os.path.join(OUT, f"{it['id']}-{s}.webp"))]
        raw = None
        if need:
            print("descargando", it["id"], file=sys.stderr)
            raw = fetch(it["remote"])
            im = Image.open(io.BytesIO(raw)).convert("RGB")
        for s in sizes:
            path = os.path.join(OUT, f"{it['id']}-{s}.webp")
            if s in need:
                cp = im.copy()
                cp.thumbnail((s, s * 2))
                cp.save(path, "WEBP", quality=78 if s > 700 else 72, method=6)
            with Image.open(path) as w:
                files[str(s)] = {"src": f"/media/official/{it['id']}-{s}.webp", "width": w.width, "height": w.height,
                                 "bytes": os.path.getsize(path)}
        manifest.append({
            "id": it["id"],
            "files": files,
            "captionEs": it["captionEs"],
            "officialAltEn": it.get("officialAltEn"),
            "sourceUrl": it["remote"],
            "sourcePage": it["page"],
            "originalSize": f"{it['width']}x{it['height']}",
            "copyright": "© Rockstar Games / Take-Two Interactive",
            "license": "Material oficial de prensa/descarga de Rockstar Games. Uso no comercial de fans con atribución; sin licencia de redistribución comercial.",
            "treatment": "Redimensionado y recompresión WebP. Sin recortes, sin retoques, sin eliminación de marcas.",
            "kind": "official-map" if is_map else "official-screenshot",
            "sinMarcaDeAgua": True,
        })
    # Recursos oficiales aportados localmente (no descargables por URL directa), p. ej. el póster para imprimir v2.
    # Se conservan tal cual si sus archivos existen; así esta herramienta nunca los borra del manifiesto.
    local = os.path.join(ROOT, "sources", "local-media.json")
    if os.path.exists(local):
        for it in json.load(open(local, encoding="utf8")):
            if all(os.path.exists(os.path.join(ROOT, "public", f["src"].lstrip("/"))) for f in it["files"].values()):
                manifest.append(it)
    json.dump({"generated": "build", "items": manifest}, open(os.path.join(ROOT, "public", "media", "media-manifest.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print("ok", len(manifest))

if __name__ == "__main__":
    main()
