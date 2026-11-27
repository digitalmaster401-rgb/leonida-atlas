import type { Entry } from '../data/schema';
import { entriesBy } from '../data';
import { money } from '../lib/calc';
import { EvidenceBadge } from './EvidenceBadge';

/** Barra horizontal en SVG (sin estilos en línea): valor relativo al máximo del catálogo. */
function Bar({ value, max }: { value: number; max: number }) {
  return (
    <svg className="stat-bar" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <rect width="100" height="8" rx="4" fill="#232a41" />
      <rect width={Math.max(2, (value / max) * 100)} height="8" rx="4" fill="url(#stat-g)" />
      <defs>
        <linearGradient id="stat-g" x1="0" x2="1">
          <stop offset="0" stopColor="#ff3ea5" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Estadísticas visuales SOLO con datos con fuente. Vehículos: registro y venta reportados (comparados con el máximo
 * del catálogo). Las estadísticas de manejo, velocidad o daño no se muestran hasta tener una fuente verificable.
 */
export function StatBars({ entry }: { entry: Entry }) {
  if (entry.category === 'vehiculos' && entry.vehicle) {
    const v = entry.vehicle;
    const all = entriesBy('vehiculos').map((e) => e.vehicle).filter((x): x is NonNullable<typeof x> => !!x);
    const maxReg = Math.max(1, ...all.map((x) => x.registration ?? 0));
    const maxSell = Math.max(1, ...all.map((x) => x.sellValue ?? 0));
    const rows = [
      { label: 'Registro', value: v.registration, max: maxReg },
      { label: 'Venta', value: v.sellValue, max: maxSell },
    ].filter((r): r is { label: string; value: number; max: number } => r.value !== null && r.value !== undefined);
    return (
      <section className="panel stat-panel" aria-labelledby="stats-h" data-testid="stat-panel">
        <h2 id="stats-h">Valores del juego</h2>
        {rows.length ? (
          <ul className="stat-list">
            {rows.map((r) => (
              <li key={r.label}>
                <span className="stat-label">{r.label}</span>
                <Bar value={r.value} max={r.max} />
                <strong>{money(r.value)}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="small muted">Sin valores de registro ni venta con fuente.</p>
        )}
        {v.priceStatus && (
          <p className="small">
            Evidencia de los valores: <EvidenceBadge status={v.priceStatus} compact /> · barras comparadas con el valor más alto registrado en el catálogo.
          </p>
        )}
        <p className="small muted">Velocidad, aceleración y manejo: sin datos verificables todavía; no se muestran.</p>
      </section>
    );
  }
  if (entry.category === 'armas') {
    return (
      <section className="panel stat-panel" aria-labelledby="stats-h" data-testid="stat-panel">
        <h2 id="stats-h">Estadísticas del juego</h2>
        <p className="small muted">Daño, precisión, alcance, cadencia y capacidad: Rockstar no las ha publicado y ninguna fuente verificable las documenta todavía. Se añadirán con su evidencia.</p>
      </section>
    );
  }
  return null;
}
