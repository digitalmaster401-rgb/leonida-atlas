// Calibración cartográfica (Fase 4C). Funciones puras: ajustan una transformación entre dos sistemas de
// coordenadas a partir de puntos de control documentados y miden el error con puntos independientes.
// No inventa puntos: solo trabaja con los pares que recibe.

export type Model = 'similaridad' | 'afin';

export interface Pair {
  id: string;
  /** Coordenadas de origen (p. ej., metros de GTADB). */
  src: [number, number];
  /** Coordenadas de destino (p. ej., póster normalizado 0–1). */
  dst: [number, number];
}

/** x' = a·x + b·y + c ; y' = d·x + e·y + f */
export interface Transform {
  model: Model;
  params: [number, number, number, number, number, number];
}

export interface ErrorStats {
  n: number;
  mean: number;
  median: number;
  p90: number;
  max: number;
  rmse: number;
  residuals: { id: string; dx: number; dy: number; err: number }[];
}

/** Resuelve un sistema lineal pequeño (eliminación gaussiana con pivoteo). Devuelve null si es singular. */
function solve(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const k = M[r][c] / M[c][c];
      for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

/** Mínimos cuadrados: (AᵀA)·p = Aᵀb. */
function leastSquares(rows: number[][], rhs: number[]): number[] | null {
  const k = rows[0].length;
  const AtA = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => rows.reduce((s, r) => s + r[i] * r[j], 0)));
  const Atb = Array.from({ length: k }, (_, i) => rows.reduce((s, r, n) => s + r[i] * rhs[n], 0));
  return solve(AtA, Atb);
}

export const MIN_POINTS: Record<Model, number> = { similaridad: 2, afin: 3 };

/** Ajusta el modelo pedido. Afín: 6 parámetros (escala distinta por eje, cizalla). Similaridad: escala única + giro. */
export function fit(pairs: Pair[], model: Model): Transform | null {
  if (pairs.length < MIN_POINTS[model]) return null;
  if (model === 'afin') {
    const rows = pairs.map((p) => [p.src[0], p.src[1], 1]);
    const px = leastSquares(rows, pairs.map((p) => p.dst[0]));
    const py = leastSquares(rows, pairs.map((p) => p.dst[1]));
    if (!px || !py) return null;
    return { model, params: [px[0], px[1], px[2], py[0], py[1], py[2]] };
  }
  // Similaridad (escala única + giro + traslación), probada con y sin reflejo del eje y
  // (el mundo del juego crece hacia el norte y el póster hacia abajo). Se queda la de menor error.
  const solveSim = (flip: boolean): Transform | null => {
    const rows: number[][] = [];
    const rhs: number[] = [];
    for (const p of pairs) {
      const x = p.src[0];
      const y = flip ? -p.src[1] : p.src[1];
      rows.push([x, -y, 1, 0]);
      rhs.push(p.dst[0]);
      rows.push([y, x, 0, 1]);
      rhs.push(p.dst[1]);
    }
    const s = leastSquares(rows, rhs);
    if (!s) return null;
    const [A, B, C, D] = s;
    return flip ? { model, params: [A, B, C, B, -A, D] } : { model, params: [A, -B, C, B, A, D] };
  };
  const cands = [solveSim(false), solveSim(true)].filter((t): t is Transform => !!t);
  if (!cands.length) return null;
  return cands.sort((t1, t2) => errors(t1, pairs).rmse - errors(t2, pairs).rmse)[0];
}

export function apply(t: Transform, [x, y]: [number, number]): [number, number] {
  const [a, b, c, d, e, f] = t.params;
  return [a * x + b * y + c, d * x + e * y + f];
}

/** Error euclidiano en unidades de destino. `scale` convierte cada eje (p. ej., a píxeles del póster). */
export function errors(t: Transform, pairs: Pair[], scale: [number, number] = [1, 1]): ErrorStats {
  const residuals = pairs.map((p) => {
    const [x, y] = apply(t, p.src);
    const dx = (x - p.dst[0]) * scale[0];
    const dy = (y - p.dst[1]) * scale[1];
    return { id: p.id, dx, dy, err: Math.hypot(dx, dy) };
  });
  const e = residuals.map((r) => r.err).sort((a, b) => a - b);
  const q = (k: number) => (e.length ? e[Math.min(e.length - 1, Math.floor(k * (e.length - 1) + 0.5))] : 0);
  return {
    n: e.length,
    mean: e.length ? e.reduce((s, v) => s + v, 0) / e.length : 0,
    median: q(0.5),
    p90: q(0.9),
    max: e.length ? e[e.length - 1] : 0,
    rmse: e.length ? Math.sqrt(e.reduce((s, v) => s + v * v, 0) / e.length) : 0,
    residuals,
  };
}

/** Validación «dejando uno fuera»: cada punto se predice con un ajuste que no lo usa. */
export function leaveOneOut(pairs: Pair[], model: Model, scale: [number, number] = [1, 1]): ErrorStats | null {
  const residuals: ErrorStats['residuals'] = [];
  for (let i = 0; i < pairs.length; i++) {
    const t = fit(pairs.filter((_, j) => j !== i), model);
    if (!t) return null;
    residuals.push(errors(t, [pairs[i]], scale).residuals[0]);
  }
  const fake: Transform = { model, params: [1, 0, 0, 0, 1, 0] };
  const stats = errors(fake, [], scale);
  const e = residuals.map((r) => r.err).sort((a, b) => a - b);
  const q = (k: number) => e[Math.min(e.length - 1, Math.floor(k * (e.length - 1) + 0.5))];
  return { ...stats, n: e.length, mean: e.reduce((s, v) => s + v, 0) / e.length, median: q(0.5), p90: q(0.9), max: e[e.length - 1], rmse: Math.sqrt(e.reduce((s, v) => s + v * v, 0) / e.length), residuals };
}

/** División reproducible entrenamiento / validación (cada `k`-ésimo par queda reservado para validar). */
export function split<T extends { id: string }>(pairs: T[], every = 4): { train: T[]; test: T[] } {
  const sorted = [...pairs].sort((a, b) => a.id.localeCompare(b.id));
  return { train: sorted.filter((_, i) => (i + 1) % every !== 0), test: sorted.filter((_, i) => (i + 1) % every === 0) };
}

export interface Decision {
  ok: boolean;
  reason: string;
}

/**
 * Acepta la transformación solo si hay puntos suficientes (≥ 8 de entrenamiento y ≥ 3 de validación) y el error
 * máximo de validación no supera el umbral (en unidades de destino escaladas). Si no, no se proyecta nada.
 */
export function decide(train: number, test: ErrorStats | null, maxAllowed: number): Decision {
  if (train < 8) return { ok: false, reason: `Solo ${train} puntos de entrenamiento: se necesitan al menos 8.` };
  if (!test || test.n < 3) return { ok: false, reason: 'Se necesitan al menos 3 puntos independientes de validación.' };
  if (test.max > maxAllowed) return { ok: false, reason: `Error máximo de validación ${test.max.toFixed(1)} > umbral ${maxAllowed}.` };
  return { ok: true, reason: `Error máximo de validación ${test.max.toFixed(1)} ≤ umbral ${maxAllowed}.` };
}

/** Rechaza posiciones fuera del póster (con margen) antes de proponerlas. */
export function insidePoster([x, y]: [number, number], margin = 0): boolean {
  return x >= -margin && x <= 1 + margin && y >= -margin && y <= 1 + margin;
}
