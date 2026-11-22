#!/usr/bin/env python3
"""Genera docs/REQUISITOS_ACUMULATIVOS.md a partir de docs/MATRIZ_FUNCIONAL.csv (fuente de verdad)."""
import csv, os
from collections import Counter
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rows = list(csv.DictReader(open(os.path.join(ROOT, "docs/MATRIZ_FUNCIONAL.csv"), encoding="utf8")))
c = Counter(r["estado"] for r in rows)
ICON = {"implementado_testeado": "✅", "parcial": "🟡", "pendiente": "⬜", "bloqueado": "⛔"}
out = [
    "# REQUISITOS ACUMULATIVOS — LEONIDA ATLAS",
    "",
    "Fuente de verdad: `docs/MATRIZ_FUNCIONAL.csv` (este archivo se genera con `python3 scripts/gen_matrix.py`).",
    "Reúne el prompt maestro original (Anexo I), la ampliación de mapa/espacio (Anexo II), la especificación V3 (A–E) y ATLAS INTELLIGENCE.",
    "",
    "**Regla:** una interfaz visible no cuenta como función terminada. «implementado_testeado» exige código funcional **y** prueba automatizada que lo ejerce.",
    "",
    f"Resumen: ✅ implementado y probado **{c['implementado_testeado']}** · 🟡 parcial **{c['parcial']}** · ⬜ pendiente **{c['pendiente']}** · ⛔ bloqueado (requiere cuenta/permiso/prueba física) **{c['bloqueado']}** · total {len(rows)}",
    "",
]
area = None
for r in rows:
    if r["area"] != area:
        area = r["area"]
        out += ["", f"## {area}", "", "| ID | Requisito | Estado | Módulo | Prueba | Comentario |", "|---|---|---|---|---|---|"]
    out.append(f"| {r['id']} | {r['requisito']} | {ICON.get(r['estado'], '')} {r['estado']} | {r['modulo']} | {r['prueba']} | {r['comentario']} |")
open(os.path.join(ROOT, "docs/REQUISITOS_ACUMULATIVOS.md"), "w", encoding="utf8").write("\n".join(out) + "\n")
print("REQUISITOS_ACUMULATIVOS.md:", dict(c))
