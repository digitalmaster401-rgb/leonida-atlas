# Investigación cartográfica — importador de GTADB (staging)

Base para la fase de investigación cartográfica (paquete «Ampliación V4», 26-nov-2026). **No forma parte de la app** ni escribe en `content/`.

- `importar_gtadb.py`: normaliza la respuesta documentada de `https://api.gtadb.org/landmarks?gta=6` a un archivo `*staging*.json` (nunca sobrescribe; límite de 20 MB; rechaza ids inválidos, coordenadas no finitas, tipos vacíos y duplicados; aborta ante duplicados contradictorios). Cada candidato queda `publishable: false`, `mapPosition: null`, `precision: "unverified"`, sin fotos ni nombres.
- `test_importar_gtadb.py`: 6 pruebas sintéticas (`npm run test:research`, también en CI). No prueban datos reales ni la app.

## Antes de usarlo con datos reales (no hecho todavía)
1. Verificar acceso autorizado, licencia por dataset (declarada CC BY 4.0 con excepciones) y esquema real de la API; añadir pruebas de contrato sobre una respuesta real.
2. No ejecutar `--fetch` hasta esa verificación. Las salidas `*staging*.json` están en `.gitignore`.
3. Calibración documentada (puntos de control + error medido de forma independiente) antes de proyectar coordenadas al póster oficial. Sin calibración, el candidato queda **sin pin**.
4. Adaptador al esquema Zod de Atlas y revisión humana por registro (derechos, evidencia, filtraciones) antes de cualquier publicación. Sin escrituras automáticas hasta tener idempotencia, registro de diferencias y rollback.
