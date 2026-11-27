import { describe, expect, it } from 'vitest';
import { apply, decide, errors, fit, insidePoster, leaveOneOut, split, type Pair } from '../src/lib/calibration';

// Transformación conocida (sintética) para comprobar que el ajuste la recupera.
const truth = (x: number, y: number): [number, number] => [0.5 + 0.00004 * x + 0.000002 * y, 0.5 - 0.00003 * y + 0.000001 * x];
const grid: Pair[] = [];
for (const x of [-8000, -3000, 0, 2500]) for (const y of [-6000, 0, 6000]) grid.push({ id: `${x},${y}`, src: [x, y], dst: truth(x, y) });

describe('calibración cartográfica', () => {
  it('el modelo afín recupera una transformación exacta (error ~0)', () => {
    const t = fit(grid, 'afin')!;
    expect(errors(t, grid).max).toBeLessThan(1e-9);
    const [x, y] = apply(t, [1000, 1000]);
    expect(x).toBeCloseTo(truth(1000, 1000)[0], 9);
    expect(y).toBeCloseTo(truth(1000, 1000)[1], 9);
  });
  it('la similaridad detecta el eje y invertido y no puede representar escalas distintas por eje', () => {
    const sim = fit(grid, 'similaridad')!;
    expect(sim.params[4]).toBeLessThan(0);
    expect(errors(sim, grid).max).toBeGreaterThan(errors(fit(grid, 'afin')!, grid).max);
  });
  it('validación independiente: dejando uno fuera y con división reservada', () => {
    const noisy = grid.map((p, i) => ({ ...p, dst: [p.dst[0] + (i % 2 ? 0.002 : -0.002), p.dst[1]] as [number, number] }));
    const loo = leaveOneOut(noisy, 'afin')!;
    expect(loo.n).toBe(noisy.length);
    expect(loo.mean).toBeGreaterThan(0.001);
    const { train, test } = split(noisy, 4);
    expect(train.length + test.length).toBe(noisy.length);
    expect(test.length).toBe(3);
    expect(new Set([...train, ...test].map((p) => p.id)).size).toBe(noisy.length);
  });
  it('no acepta con pocos puntos ni con error excesivo; rechaza posiciones fuera del póster', () => {
    const t = fit(grid, 'afin')!;
    expect(decide(5, errors(t, grid.slice(0, 3)), 10).ok).toBe(false);
    expect(decide(9, errors(t, grid.slice(0, 2)), 10).ok).toBe(false);
    expect(decide(9, { ...errors(t, grid.slice(0, 3)), max: 50 }, 10).ok).toBe(false);
    expect(decide(9, errors(t, grid.slice(0, 3)), 10).ok).toBe(true);
    expect(fit(grid.slice(0, 2), 'afin')).toBeNull();
    expect(insidePoster([0.5, 0.5])).toBe(true);
    expect(insidePoster([1.2, 0.5])).toBe(false);
  });
});
