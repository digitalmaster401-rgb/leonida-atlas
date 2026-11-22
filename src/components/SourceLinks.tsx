import { sourceById } from '../data';
import type { Status } from '../data/schema';
import { EvidenceBadge } from './EvidenceBadge';

/** Insignia de evidencia + enlaces a las fuentes citadas (se abren en pestaña nueva). */
export function SourceLinks({ ids, status, label }: { ids: string[]; status?: Status; label?: string }) {
  return (
    <span className="src-links">
      {status && <EvidenceBadge status={status} compact />}
      {label && <span className="muted small">{label}</span>}
      {ids.map((id) => {
        const s = sourceById.get(id);
        return s ? (
          <a key={id} href={s.url} target="_blank" rel="noopener noreferrer" className="small" title={s.title}>
            {s.publisher}
          </a>
        ) : (
          <span key={id} className="small">
            [{id}]
          </span>
        );
      })}
    </span>
  );
}
