import type { Status } from '../data/schema';
import { STATUS_META } from '../data/meta';

export function EvidenceBadge({ status, compact = false }: { status: Status; compact?: boolean }) {
  const m = STATUS_META[status];
  return (
    <span className={`badge badge-${status}`} title={`${m.label}: ${m.description}`}>
      <span className="badge-dot" aria-hidden="true" />
      {compact ? m.label : m.short}
      <span className="sr-only">. {m.description}</span>
    </span>
  );
}

export function EvidenceLegend() {
  return (
    <ul className="evidence-legend">
      {(Object.keys(STATUS_META) as Status[]).map((s) => (
        <li key={s}>
          <EvidenceBadge status={s} compact /> <span>{STATUS_META[s].description}</span>
        </li>
      ))}
    </ul>
  );
}
