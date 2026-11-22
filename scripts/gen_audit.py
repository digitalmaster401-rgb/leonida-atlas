#!/usr/bin/env python3
"""Genera AUDITORIA_DATOS.md a partir de content/entries.json y content/sources.json."""
import json, os
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = json.load(open(os.path.join(ROOT, "content/entries.json"), encoding="utf8"))
S = {s["id"]: s for s in json.load(open(os.path.join(ROOT, "content/sources.json"), encoding="utf8"))}
CAT = {"lugares": "Lugares", "personajes": "Personajes", "dinero": "Dinero", "armas": "Armas", "vehiculos": "Vehículos", "negocios": "Negocios y propiedades", "rutas": "Rutas y tutoriales"}
PATH = {"lugares": "/lugares", "personajes": "/personajes", "dinero": "/dinero", "armas": "/armas", "vehiculos": "/vehiculos", "negocios": "/negocios", "rutas": "/rutas"}

def decision(e):
    st = e["status"]
    srcs = [S[s] for s in e["sources"]]
    off = [s for s in srcs if s["type"] == "oficial"]
    third = sorted({s["publisher"] for s in srcs if s["type"] != "oficial"})
    if st == "oficial":
        extra = ""
        rep = [f for f in e["facts"] if f["status"] in ("reportado", "contrastado")]
        if rep:
            extra = f" Datos secundarios de terceros marcados por separado ({', '.join(sorted({f['status'] for f in rep}))})."
        return f"Publicar como OFICIAL: confirmado por {', '.join(sorted({s['publisher'] for s in off}))}.{extra}"
    if st == "contrastado":
        return f"Publicar como CONTRASTADO: dos fuentes independientes coinciden ({', '.join(third)}). No comprobado en partida propia."
    if st == "reportado":
        return f"Publicar como REPORTADO: fuente única ({', '.join(third)}). Visible con alerta; pendiente de segunda fuente o comprobación."
    return f"Estado {st}."

lines = []
c = Counter(e["status"] for e in E)
lines += [
    "# AUDITORÍA DE DATOS — LEONIDA ATLAS",
    "",
    "**Fecha de auditoría:** 22 de noviembre de 2026 · **Juego:** Grand Theft Auto VI (lanzamiento 19-nov-2026, PS5 y Xbox Series X|S) · Generado con `python3 scripts/gen_audit.py`.",
    "",
    "## 1. Sobre las 52 fichas del prototipo anterior",
    "",
    "El encargo pedía revisar una por una las 52 fichas de la carpeta `LEONIDA_ATLAS_GTA6` (con `data.js`, `datos-fuentes.json`, `build_data.py`, etc.). **Esa carpeta no está en este repositorio**: al iniciar el trabajo el repositorio solo contenía `README.md` y el documento del encargo (`LEONIDA_ATLAS_PROMPT_MAESTRO_CLAUDE_CODE-2.md`). Tampoco existe el video de referencia, sus 49 fotogramas ni la portada anterior.",
    "",
    "Consecuencias y decisión:",
    "",
    "- No se puede emitir una decisión ficha por ficha sobre datos que no se han visto. **No se inventa** una auditoría de esas 52 fichas.",
    "- Ningún dato, imagen o texto del prototipo anterior se ha reutilizado: el contenido se reconstruyó desde cero a partir de fuentes verificables (sección 3).",
    "- Si el propietario sube la carpeta, el procedimiento es: copiar cada ficha a `content/entries.json` con el esquema actual, ejecutar `npm run validate:data` y clasificarla con las mismas reglas de la sección 2. Lo que no tenga fuente se archiva, no se publica.",
    "",
    "## 2. Reglas de clasificación",
    "",
    "| Estado | Regla aplicada |",
    "|---|---|",
    "| Oficial | Publicado por Rockstar Games / Take-Two (sitio /VI, Only in Leonida, Media, Launch Gallery, Newswire, mapa oficial). |",
    "| Comprobado | Reproducido en una partida documentada con captura propia. **Ninguna ficha tiene este estado**: no hubo acceso a una partida. |",
    "| Contrastado | Dos fuentes independientes no oficiales coinciden en el dato. El validador rechaza un dato «contrastado» con menos de dos fuentes. |",
    "| Reportado | Una sola fuente no oficial. Se muestra con alerta y borde punteado. |",
    "| Pendiente / Obsoleto | Sin uso por ahora. Lo pendiente no se muestra como confirmado. |",
    "",
    "Además: dinero y glitches separados por modo; **no se publica ningún glitch** (ninguno cumple dos fuentes + pasos reproducibles); el modo online se marca como «sin información verificada»; los puntos del mapa declaran precisión (región, zona o barrio) y la base de la posición; no se asigna una foto al azar a un lugar.",
    "",
    f"## 3. Resultado: {len(E)} fichas publicadas",
    "",
    f"Oficial: **{c.get('oficial',0)}** · Contrastado: **{c.get('contrastado',0)}** · Reportado: **{c.get('reportado',0)}** · Comprobado: {c.get('comprobado',0)} · Pendiente: {c.get('pendiente',0)} · Obsoleto: {c.get('obsoleto',0)}",
    "",
    "### Datos descartados o no publicados (y por qué)",
    "",
    "- **Precios de las ediciones** (Standard $79.99 / Ultimate $99.99 en un resultado de búsqueda): la página oficial revisada no muestra precio → se marca «pendiente», no se publica cifra.",
    "- **Disponibilidad en PC**: un resultado de búsqueda la menciona; Rockstar solo lista PS5 y Xbox Series X|S → descartado.",
    "- **«Vice City es el doble de Los Santos», «80 horas de campaña», sistema de 6 estrellas, «Heat»**: provienen de artículos especulativos previos al lanzamiento → no publicados.",
    "- **Ubicaciones exactas de autos clásicos (Classic Car Collection)**: Rockstar no las publica → ficha sin puntos, dato «pendiente».",
    "- **Ubicación de la casa de Jason, Only Raw Records, refinería Allied Crystal**: sin evidencia de posición → sin punto en el mapa.",
    "- **Ubicaciones exactas de las 24 Ammu-Nation**: fuente única → se listan por barrio, sin pines.",
    "- **Bóvedas bancarias ($205,000) y recompensa del Capítulo 3 ($120,000)**: fuente única (PowerPyx); GTA BOOM indica que los mayores robos se retienen → «reportado» + spoiler avanzado.",
    "- **Guías fechadas antes del lanzamiento con cifras exactas** (p. ej. un resultado «de hace 64 días»): descartadas por ser anteriores al 19-nov-2026.",
    "",
    "### Detalle por ficha",
    "",
]
for cat in CAT:
    items = [e for e in E if e["category"] == cat]
    if not items:
        continue
    lines += [f"#### {CAT[cat]} ({len(items)})", "", "| Ficha | Ruta | Estado | Fuentes | Mapa | Decisión |", "|---|---|---|---|---|---|"]
    for e in items:
        srcs = ", ".join(f"[{s}]({S[s]['url']})" for s in e["sources"])
        mp = f"{e['mapPosition']['precision']}" if e.get("mapPosition") else "—"
        lines.append(f"| {e['name']} | `{PATH[cat]}/{e['slug']}` | {e['status']} | {srcs} | {mp} | {decision(e)} |")
    lines.append("")
lines += ["## 4. Fuentes consultadas", ""]
for s in S.values():
    lines.append(f"- **{s['id']}** — [{s['title']}]({s['url']}) · {s['publisher']}{' · ' + s['author'] if s['author'] and s['author'] != s['publisher'] else ''} · publicado: {s['publishedAt'] or 's/f'} · consultado: {s['accessedAt']} · {s['type']}. {s['note']}")
open(os.path.join(ROOT, "AUDITORIA_DATOS.md"), "w", encoding="utf8").write("\n".join(lines) + "\n")
print("AUDITORIA_DATOS.md generado:", len(E), "fichas")
