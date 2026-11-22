import { describe, expect, it } from 'vitest';
import { addStop, moveStop, newRoute, removeStop, routeProgress } from '../src/lib/routes';

describe('rutas personales', () => {
  it('añade, ordena, marca y quita paradas sin inventar datos', () => {
    let r = newRoute('Keys');
    r = addStop(addStop(addStop(r, 'col-orca'), 'col-peche'), 'col-trigger-happy');
    expect(r.stops.map((s) => s.entryId)).toEqual(['col-orca', 'col-peche', 'col-trigger-happy']);
    r = moveStop(r, 2, -1);
    expect(r.stops.map((s) => s.entryId)).toEqual(['col-orca', 'col-trigger-happy', 'col-peche']);
    expect(moveStop(r, 0, -1)).toBe(r);
    r = { ...r, stops: r.stops.map((s, i) => (i === 0 ? { ...s, visited: true } : s)) };
    expect(routeProgress(r)).toEqual({ visited: 1, pct: 33 });
    r = removeStop(r, 0);
    expect(r.stops).toHaveLength(2);
    expect(Object.keys(r)).not.toContain('distance');
  });
  it('respeta el máximo de 40 paradas', () => {
    let r = newRoute('larga');
    for (let i = 0; i < 45; i++) r = addStop(r, `x-${i}`);
    expect(r.stops).toHaveLength(40);
  });
  it('una ruta vacía tiene 0 % de progreso', () => {
    expect(routeProgress(newRoute())).toEqual({ visited: 0, pct: 0 });
  });
});
