#!/usr/bin/env python3
"""Crea release/leonida-atlas-v1.0.0-sitio.zip (dist/) y release/leonida-atlas-v1.0.0-codigo.zip (fuente)
y verifica que no contengan material prohibido (video de terceros, fotogramas, portada anterior)."""
import os, re, subprocess, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "release")
VERSION = "1.0.0"
BANNED = re.compile(r"(video-guia|/frames/|/hd/|portada-1920x1080|\.mp4$)", re.I)
os.makedirs(OUT, exist_ok=True)

def add_tree(z, base, prefix, skip_dirs=()):
    n = 0
    for d, dirs, files in os.walk(base):
        dirs[:] = [x for x in dirs if x not in skip_dirs]
        for f in files:
            p = os.path.join(d, f)
            rel = os.path.relpath(p, base)
            z.write(p, os.path.join(prefix, rel))
            n += 1
    return n

site = os.path.join(OUT, f"leonida-atlas-v{VERSION}-sitio.zip")
with zipfile.ZipFile(site, "w", zipfile.ZIP_DEFLATED) as z:
    n1 = add_tree(z, os.path.join(ROOT, "dist"), "leonida-atlas")

files = subprocess.run(["git", "ls-files", "--cached", "--others", "--exclude-standard"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.split()
code = os.path.join(OUT, f"leonida-atlas-v{VERSION}-codigo.zip")
with zipfile.ZipFile(code, "w", zipfile.ZIP_DEFLATED) as z:
    for f in files:
        if f.startswith(("release/", "qa/screenshots/")):
            continue
        z.write(os.path.join(ROOT, f), os.path.join("leonida-atlas", f))
    n2 = len(z.namelist())

for path in (site, code):
    with zipfile.ZipFile(path) as z:
        bad = [n for n in z.namelist() if BANNED.search(n)]
        assert z.testzip() is None, f"ZIP corrupto: {path}"
        assert not bad, f"Material prohibido en {path}: {bad[:5]}"
        size = os.path.getsize(path) / 1e6
        print(f"{os.path.relpath(path, ROOT)}: {len(z.namelist())} archivos, {size:.1f} MB, sin material prohibido, integridad OK")
