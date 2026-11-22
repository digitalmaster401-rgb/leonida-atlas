import type { Entry } from '../data/schema';
import { sourceById } from '../data';
import { formatDate } from '../lib/calc';
import { Icon } from './Icon';

export function SourceList({ ids }: { ids: string[] }) {
  return (
    <ol className="source-list">
      {ids.map((id) => {
        const s = sourceById.get(id);
        if (!s) return null;
        return (
          <li key={id} id={`fuente-${id}`}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.title} <Icon name="external" size={14} />
            </a>
            <span className="source-meta">
              {s.publisher}
              {s.author && s.author !== s.publisher ? ` · ${s.author}` : ''}
              {s.publishedAt ? ` · publicado ${formatDate(s.publishedAt)}` : ''} · consultado {formatDate(s.accessedAt)} ·{' '}
              <span className={`src-type src-${s.type}`}>{s.type === 'oficial' ? 'Fuente oficial' : s.type === 'guia' ? 'Guía de terceros' : s.type}</span>
            </span>
            {s.note && <span className="source-note">{s.note}</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function SourcePanel({ entry }: { entry: Entry }) {
  const ids = [...new Set([...entry.sources, ...entry.facts.flatMap((f) => f.sources)])];
  return (
    <section className="panel" aria-labelledby="fuentes-h">
      <h2 id="fuentes-h">Fuentes</h2>
      <SourceList ids={ids} />
      <p className="muted small">
        Última revisión: <strong>{formatDate(entry.verifiedAt)}</strong> · Actualizado para: {entry.patch}
      </p>
    </section>
  );
}
