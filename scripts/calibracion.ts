// Ajusta y versiona la calibración GTADB → póster oficial v2 a partir de research/calibracion/puntos-control-v1.json.
// Uso: npx tsx scripts/calibracion.ts   → escribe research/calibracion/transformacion-v1.json (con decisión).
import { readFileSync, writeFileSync } from 'node:fs';
import { decide, errors, fit, leaveOneOut, split, type Model, type Pair } from '../src/lib/calibration';

const POSTER_PX: [number, number] = [5775, 7900]; // póster v2 a resolución original
/**
 * Umbrales por nivel de precisión (px del póster v2). Se exige que tanto la validación reservada como la de
 * «dejando uno fuera» queden por debajo: con pocos puntos, una sola división puede salir favorable por azar.
 */
const TIERS: { precision: 'barrio' | 'zona'; maxPx: number }[] = [
  { precision: 'barrio', maxPx: 150 },
  { precision: 'zona', maxPx: 400 },
];
const MAX_PX = TIERS[0].maxPx;

const data = JSON.parse(readFileSync('research/calibracion/puntos-control-v1.json', 'utf8'));
const pairs: Pair[] = data.pares
  .filter((p: { gtadb: unknown }) => p.gtadb)
  .map((p: { nombre: string; x: number; y: number; gtadb: { x: number; y: number } }) => ({ id: p.nombre, src: [p.gtadb.x, p.gtadb.y], dst: [p.x, p.y] }));
const { train, test } = split(pairs, 3);

const models: Model[] = ['similaridad', 'afin'];
const report = models.map((model) => {
  const t = fit(train, model);
  const tr = t ? errors(t, train, POSTER_PX) : null;
  const te = t ? errors(t, test, POSTER_PX) : null;
  const loo = leaveOneOut(pairs, model, POSTER_PX);
  const r1 = (s: typeof tr) => s && { n: s.n, media: +s.mean.toFixed(1), mediana: +s.median.toFixed(1), p90: +s.p90.toFixed(1), max: +s.max.toFixed(1), rmse: +s.rmse.toFixed(1), residuos: s.residuals.map((r) => ({ id: r.id, dx: +r.dx.toFixed(1), dy: +r.dy.toFixed(1), error: +r.err.toFixed(1) })) };
  return { model, params: t?.params ?? null, entrenamiento: r1(tr), validacion: r1(te), dejandoUnoFuera: r1(loo), decision: decide(train.length, te, MAX_PX) };
});

const best = report.filter((r) => r.validacion).sort((a, b) => a.validacion!.max - b.validacion!.max)[0];
const out = {
  version: 1,
  fecha: new Date().toISOString().slice(0, 10),
  origen: data.sistemaOrigen,
  destino: data.sistemaDestino,
  unidadesError: 'píxeles del póster oficial v2 (5775 × 7900)',
  umbralMaxPx: MAX_PX,
  puntos: { total: pairs.length, entrenamiento: train.map((p) => p.id), validacion: test.map((p) => p.id), sinEquivalente: data.pares.filter((p: { gtadb: unknown }) => !p.gtadb).map((p: { nombre: string }) => p.nombre) },
  modelos: report,
  elegido: best.model,
  ...(() => {
    const worst = Math.max(best.validacion!.max, best.dejandoUnoFuera?.max ?? Infinity);
    const tier = TIERS.find((t) => worst <= t.maxPx);
    return {
      peorErrorPx: +worst.toFixed(1),
      precisionMaximaPermitida: tier?.precision ?? null,
      aceptada: !!tier && train.length >= 8,
      motivo: tier
        ? `Peor error independiente ${worst.toFixed(1)} px (reservados y dejando uno fuera): válida como mucho para precisión «${tier.precision}» (≤ ${tier.maxPx} px). ${tier.precision === 'barrio' ? '' : 'No sirve para precisión de barrio.'}`.trim()
        : `Peor error independiente ${worst.toFixed(1)} px: insuficiente; no se proyecta nada.`,
      umbrales: TIERS,
    };
  })(),
  nota: 'Los pares unen el rótulo del póster con el centroide de landmarks de GTADB del mismo barrio: ninguno es un punto exacto. La transformación solo propone candidatos para revisión humana; nunca publica.',
  atribucion: data.atribucion,
};
writeFileSync('research/calibracion/transformacion-v1.json', JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({ elegido: out.elegido, aceptada: out.aceptada, precision: out.precisionMaximaPermitida, motivo: out.motivo, modelos: report.map((r) => ({ m: r.model, val: r.validacion && { media: r.validacion.media, max: r.validacion.max }, loo: r.dejandoUnoFuera && { media: r.dejandoUnoFuera.media, max: r.dejandoUnoFuera.max } })) }, null, 1));

// ---------- Segunda calibración: GTADB (m) → FullSweep (px), con correspondencias exactas por id ----------
const fs = JSON.parse(readFileSync('research/calibracion/pares-gtadb-fullsweep.json', 'utf8'));
const fsAll: Pair[] = fs.pares;
// Ajuste robusto: un primer ajuste afín detecta pares incoherentes (> 50 px; p. ej., landmarks movidos en GTADB
// después de que FullSweep los copiara); se informan y se excluyen antes del ajuste final.
const first = fit(fsAll, 'afin')!;
const OUTLIER_PX = 50;
const outliers = errors(first, fsAll).residuals.filter((r) => r.err > OUTLIER_PX);
const fsPairs = fsAll.filter((p) => !outliers.some((o) => o.id === p.id));
const fsSplit = split(fsPairs, 5);
const fsModels = models.map((model) => {
  const t = fit(fsSplit.train, model)!;
  const te = errors(t, fsSplit.test);
  return { model, params: t.params, entrenamiento: fsSplit.train.length, validacion: { n: te.n, media: +te.mean.toFixed(2), mediana: +te.median.toFixed(2), p90: +te.p90.toFixed(2), max: +te.max.toFixed(2), rmse: +te.rmse.toFixed(2) } };
});
const fsOut = {
  version: 1,
  fecha: new Date().toISOString().slice(0, 10),
  origen: 'gtadb6-world-m',
  destino: 'fullsweep-basemap-px-3344x4820',
  unidadesError: 'píxeles del mapa base de FullSweep',
  pares: fsAll.length,
  incoherentes: { umbralPx: OUTLIER_PX, n: outliers.length, ids: outliers.map((o) => o.id).slice(0, 50) },
  paresUsados: fsPairs.length,
  modelos: fsModels,
  conclusion:
    'FullSweep deriva sus landmarks de GTADB con una transformación casi exacta: las dos fuentes NO son independientes para posiciones de landmarks. Sus 75 ubicaciones propias sí son un aporte distinto, pero requieren calibrar FullSweep → póster con los mismos puntos de control.',
  atribucion: fs.atribucion,
};
writeFileSync('research/calibracion/transformacion-gtadb-fullsweep-v1.json', JSON.stringify(fsOut, null, 1) + '\n');
console.log(JSON.stringify(fsModels.map((m) => ({ m: m.model, val: m.validacion })), null, 1));
