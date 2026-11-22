export interface CalcInput {
  gross: number;
  costs: number;
  minutesPerRun: number;
  cooldownMinutes: number;
  goal: number;
}
export interface CalcResult {
  netPerRun: number;
  runsPerHour: number | null;
  netPerHour: number | null;
  runsForGoal: number | null;
  hoursForGoal: number | null;
}

const finite = (n: number) => (Number.isFinite(n) ? n : 0);

/** Fórmulas visibles en la calculadora. */
export function calculate(i: CalcInput): CalcResult {
  const gross = Math.max(0, finite(i.gross));
  const costs = Math.max(0, finite(i.costs));
  const cycle = Math.max(0, finite(i.minutesPerRun)) + Math.max(0, finite(i.cooldownMinutes));
  const netPerRun = gross - costs;
  const runsPerHour = cycle > 0 ? 60 / cycle : null;
  const netPerHour = runsPerHour !== null ? netPerRun * runsPerHour : null;
  const goal = Math.max(0, finite(i.goal));
  const runsForGoal = netPerRun > 0 && goal > 0 ? Math.ceil(goal / netPerRun) : null;
  const hoursForGoal = runsForGoal !== null && cycle > 0 ? (runsForGoal * cycle) / 60 : null;
  return { netPerRun, runsPerHour, netPerHour, runsForGoal, hoursForGoal };
}

export const money = (n: number) =>
  (n < 0 ? '−' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US');

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d} ${months[m - 1]} ${y}`;
}
