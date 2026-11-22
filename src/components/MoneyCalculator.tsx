import { useId, useMemo, useState } from 'react';
import type { Entry } from '../data/schema';
import { calculate, money } from '../lib/calc';
import { EvidenceBadge } from './EvidenceBadge';

type Point = 'min' | 'mid' | 'max';

function NumField({ label, unit, value, onChange, hint }: { label: string; unit: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {label} <span className="muted small">({unit})</span>
      </label>
      <input id={id} type="number" inputMode="decimal" min={0} step="any" value={value} onChange={(e) => onChange(e.target.value)} aria-describedby={hint ? id + '-h' : undefined} />
      {hint && (
        <span id={id + '-h'} className="muted small">
          {hint}
        </span>
      )}
    </div>
  );
}

export function MoneyCalculator({ methods }: { methods: Entry[] }) {
  const presets = methods.filter((m) => m.money);
  const [presetId, setPresetId] = useState('');
  const [point, setPoint] = useState<Point>('min');
  const [gross, setGross] = useState('1000');
  const [costs, setCosts] = useState('0');
  const [minutes, setMinutes] = useState('2');
  const [cooldown, setCooldown] = useState('2');
  const [goal, setGoal] = useState('50000');
  const [fromPreset, setFromPreset] = useState(false);
  const selected = presets.find((p) => p.id === presetId);

  const applyPreset = (id: string, pt: Point = point) => {
    setPresetId(id);
    const p = presets.find((x) => x.id === id)?.money;
    if (!p) {
      setFromPreset(false);
      return;
    }
    const g = pt === 'min' ? p.grossMin : pt === 'max' ? p.grossMax : (p.grossMin + p.grossMax) / 2;
    setGross(String(Math.round(g)));
    setCosts(String(p.costs));
    setMinutes(p.minutesPerRun !== null ? String(p.minutesPerRun) : '');
    setCooldown(p.cooldownMinutes !== null ? String(p.cooldownMinutes) : '0');
    setFromPreset(true);
  };

  const r = useMemo(
    () => calculate({ gross: Number(gross), costs: Number(costs), minutesPerRun: Number(minutes), cooldownMinutes: Number(cooldown), goal: Number(goal) }),
    [gross, costs, minutes, cooldown, goal],
  );
  const estimate = fromPreset && (selected?.money?.estimate ?? true);
  const missingTime = !(Number(minutes) > 0);

  return (
    <section className="panel calc" aria-labelledby="calc-h" data-testid="money-calculator">
      <h2 id="calc-h">Calculadora de ganancias</h2>
      <p className="muted small">Ajusta los valores con tus propios tiempos. Los datos precargados vienen de guías y se marcan como estimación.</p>
      <div className="calc-grid">
        <div className="field field-wide">
          <label htmlFor="calc-preset">Método (opcional)</label>
          <select id="calc-preset" value={presetId} onChange={(e) => applyPreset(e.target.value)}>
            <option value="">Valores manuales</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        {selected && (
          <fieldset className="field field-wide calc-point">
            <legend>Punto del rango reportado</legend>
            {(['min', 'mid', 'max'] as Point[]).map((pt) => (
              <label key={pt} className="radio">
                <input
                  type="radio"
                  name="calc-point"
                  checked={point === pt}
                  onChange={() => {
                    setPoint(pt);
                    applyPreset(presetId, pt);
                  }}
                />
                {pt === 'min' ? 'Mínimo (conservador)' : pt === 'mid' ? 'Medio' : 'Máximo'}
              </label>
            ))}
          </fieldset>
        )}
        <NumField label="Ingreso bruto por ejecución" unit="$" value={gross} onChange={(v) => { setGross(v); setFromPreset(false); }} hint="Valor recibido por una ejecución." />
        <NumField label="Costos por ejecución" unit="$" value={costs} onChange={setCosts} hint="Datos, reparaciones, munición, etc." />
        <NumField label="Duración de la ejecución" unit="min" value={minutes} onChange={setMinutes} />
        <NumField label="Enfriamiento o traslado" unit="min" value={cooldown} onChange={setCooldown} />
        <NumField label="Meta de ahorro" unit="$" value={goal} onChange={setGoal} />
      </div>

      {selected && (
        <p className="calc-source small">
          Fuente de los valores: <EvidenceBadge status={selected.status} compact /> {selected.money?.note || selected.reward?.note}
        </p>
      )}

      <div className="calc-results" aria-live="polite">
        {estimate && <span className="chip chip-static chip-warn">Estimación: no comprobado en una partida propia</span>}
        <dl>
          <div>
            <dt>Ganancia neta por ejecución</dt>
            <dd data-testid="calc-net">{money(r.netPerRun)}</dd>
          </div>
          <div>
            <dt>Ejecuciones por hora</dt>
            <dd>{r.runsPerHour !== null ? r.runsPerHour.toFixed(1) : '—'}</dd>
          </div>
          <div>
            <dt>Ganancia neta por hora</dt>
            <dd data-testid="calc-hour">{r.netPerHour !== null ? money(r.netPerHour) : '—'}</dd>
          </div>
          <div>
            <dt>Ejecuciones para la meta</dt>
            <dd>{r.runsForGoal ?? '—'}</dd>
          </div>
          <div>
            <dt>Tiempo para la meta</dt>
            <dd>{r.hoursForGoal !== null ? `${r.hoursForGoal.toFixed(1)} h` : '—'}</dd>
          </div>
        </dl>
        {missingTime && <p className="small muted">Sin duración por ejecución no se puede calcular el ritmo por hora: ninguna guía publica ese dato para este método.</p>}
      </div>
      <details className="formulas">
        <summary>Ver fórmulas</summary>
        <ul className="small">
          <li>Neto por ejecución = bruto − costos</li>
          <li>Ejecuciones por hora = 60 ÷ (duración + enfriamiento)</li>
          <li>Neto por hora = neto por ejecución × ejecuciones por hora</li>
          <li>Ejecuciones para la meta = ⌈meta ÷ neto por ejecución⌉</li>
          <li>Tiempo para la meta = ejecuciones × (duración + enfriamiento) ÷ 60</li>
        </ul>
        <p className="small muted">El juego puede descontar parte del botín al venderlo o perderlo al morir/ser arrestado; las guías revisadas no publican esas tasas, así que inclúyelas como costo si las observas.</p>
      </details>
    </section>
  );
}
