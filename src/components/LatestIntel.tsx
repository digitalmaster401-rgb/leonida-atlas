import { useEffect, useState } from 'react';
import type { Finding } from '../intel/schema';
import { StatusBadge } from './IntelStatus';
import { formatDate } from '../lib/calc';

export const findingDate = (f: Finding) => f.sourcePublishedAt ?? f.firstDiscoveredAt;

/** Últimos hallazgos de ATLAS INTELLIGENCE. Los datos se cargan aparte para no engordar el paquete principal. */
export function LatestIntel({ limit = 2 }: { limit?: number }) {
  const [list, setList] = useState<Finding[] | null>(null);
  useEffect(() => {
    let alive = true;
    import('../data/intel').then(({ findings }) => {
      if (!alive) return;
      setList(
        findings
          .filter((f) => f.classifier !== 'migracion')
          .sort((a, b) => findingDate(b).localeCompare(findingDate(a)))
          .slice(0, limit),
      );
    });
    return () => {
      alive = false;
    };
  }, [limit]);
  if (!list) return null;
  return (
    <>
      {list.map((f) => (
        <li key={f.id} data-testid="latest-intel">
          <strong>{formatDate(findingDate(f).slice(0, 10))}</strong> — {f.title} <StatusBadge status={f.status} />{' '}
          <a href={f.sources[0].url} target="_blank" rel="noopener noreferrer nofollow" className="small">
            {f.sources[0].publisher}
          </a>
        </li>
      ))}
    </>
  );
}
