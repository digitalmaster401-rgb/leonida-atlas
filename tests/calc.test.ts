import { describe, expect, it } from 'vitest';
import { calculate, formatDate, money } from '../src/lib/calc';

describe('calculadora', () => {
  it('aplica las fórmulas visibles', () => {
    const r = calculate({ gross: 1000, costs: 100, minutesPerRun: 2, cooldownMinutes: 2, goal: 9000 });
    expect(r.netPerRun).toBe(900);
    expect(r.runsPerHour).toBe(15);
    expect(r.netPerHour).toBe(13500);
    expect(r.runsForGoal).toBe(10);
    expect(r.hoursForGoal).toBeCloseTo(40 / 60);
  });
  it('sin duración no calcula ritmo por hora', () => {
    const r = calculate({ gross: 10000, costs: 0, minutesPerRun: 0, cooldownMinutes: 0, goal: 0 });
    expect(r.runsPerHour).toBeNull();
    expect(r.netPerHour).toBeNull();
    expect(r.runsForGoal).toBeNull();
  });
  it('maneja entradas no numéricas y pérdidas', () => {
    const r = calculate({ gross: NaN, costs: 50, minutesPerRun: 5, cooldownMinutes: 0, goal: 100 });
    expect(r.netPerRun).toBe(-50);
    expect(r.runsForGoal).toBeNull();
  });
  it('formatea dinero y fechas en español', () => {
    expect(money(205000)).toBe('$205,000');
    expect(money(-50)).toBe('−$50');
    expect(formatDate('2026-11-19')).toBe('19 nov 2026');
  });
});
