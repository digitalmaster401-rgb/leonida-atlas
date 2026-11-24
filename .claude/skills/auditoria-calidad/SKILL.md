---
name: auditoria-calidad
description: Verificar una entrega de LEONIDA ATLAS antes del PR (lint, tipos, unidad, build, E2E, axe, WebKit/CSP, desbordamiento, auditoría de material ajeno, matriz) e investigar fallos de CI. Usar antes de abrir o actualizar un PR o cuando falla GitHub Actions.
---

# Auditoría de calidad

## Puerta local (todo debe pasar)
`npm run lint && npm run typecheck && npm run test && npm run build && npm run audit:legacy && npm run test:e2e`

## Fallos de CI
1. Lee el log del job (`get_job_logs` con `failed_only`) y el artefacto `e2e-results` (error-context.md).
2. Busca la **causa raíz**.
   - WebKit real solo corre en CI (`PW_WEBKIT=1`).
   - La emulación móvil de Chromium agranda el viewport y puede ocultar desbordamientos: `noHorizontalOverflow` compara contra el ancho configurado.
   - En WebKit, cada captura de Playwright inyecta `<style>body {}</style>`: toma capturas **después** de comprobar la consola.
3. Prohibido: relajar la CSP, filtrar errores de consola, saltar o poner en cuarentena pruebas, ni empujar commits vacíos.
4. Un PR abierto por el bot con `GITHUB_TOKEN` no dispara CI (queda en «action_required»): el workflow lo lanza con `gh workflow run ci.yml --ref <rama>`.

## Cierre
- Actualiza `docs/MATRIZ_FUNCIONAL.csv` (implementado_testeado / parcial / pendiente / bloqueado con prueba real) y regenera con `python3 scripts/gen_matrix.py`.
- CHANGELOG, `content/changelog.json` y un documento QA breve con lo probado y lo **no** probado (consola física, iPhone físico).
- Un solo PR, sin fusionar; vigila el CI y resume los resultados en lenguaje sencillo.
