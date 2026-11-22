import { Link } from 'react-router';
import type { Entry } from '../data/schema';
import { entryPath } from '../data';
import { CATEGORY_META, EDITION_LABEL, REGION_LABEL } from '../data/meta';
import { useProgress } from '../hooks/progress';
import { EvidenceBadge } from './EvidenceBadge';
import { Media } from './Media';
import { Icon } from './Icon';
import { money } from '../lib/calc';
import { useState } from 'react';

export function ItemCard({ entry, eager = false }: { entry: Entry; eager?: boolean }) {
  const { isFavorite, isCompleted, toggleFavorite, progress } = useProgress();
  const [revealed, setRevealed] = useState(false);
  const fav = isFavorite(entry.id);
  const done = isCompleted(entry.id);
  const hidden = entry.spoilerLevel > progress.settings.spoilerLevel && !revealed;
  const amount = entry.reward?.amount;
  return (
    <article className={`card${hidden ? ' card-spoiler' : ''}`} data-testid="item-card" data-id={entry.id}>
      <div className="card-media">
        <Media id={entry.images[0]} category={entry.category} label={entry.name} sizes="(min-width: 1280px) 25vw, (min-width: 768px) 45vw, 100vw" eager={eager} />
        {done && (
          <span className="card-done" title="Completado">
            <Icon name="check" size={16} /> <span className="sr-only">Completado</span>
          </span>
        )}
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span>{CATEGORY_META[entry.category].singular}</span>
          <span aria-hidden="true">·</span>
          <span>{entry.subzone ?? REGION_LABEL[entry.region]}</span>
        </div>
        <h3 className="card-title">
          <Link to={entryPath(entry)} className="card-link">
            {entry.name}
          </Link>
        </h3>
        {hidden ? (
          <p className="card-summary spoiler-note">
            Contiene spoilers {entry.spoilerLevel === 2 ? 'de etapas avanzadas' : 'leves'}.{' '}
            <button type="button" className="link-btn" onClick={() => setRevealed(true)}>
              Mostrar de todos modos
            </button>
          </p>
        ) : (
          <p className="card-summary">{entry.summary}</p>
        )}
        <div className="card-foot">
          <EvidenceBadge status={entry.status} compact />
          {entry.edition !== 'base' && <span className="chip chip-static">{EDITION_LABEL[entry.edition]}</span>}
          {amount && !hidden && <span className="chip chip-static chip-money">{amount.min === amount.max ? money(amount.min) : `${money(amount.min)}–${money(amount.max)}`}</span>}
          <button
            type="button"
            className={`icon-btn fav-btn${fav ? ' is-on' : ''}`}
            aria-pressed={fav}
            aria-label={fav ? `Quitar ${entry.name} de guardados` : `Guardar ${entry.name}`}
            onClick={() => toggleFavorite(entry.id)}
          >
            <Icon name="star" size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function CardGrid({ list, eagerFirst = false }: { list: Entry[]; eagerFirst?: boolean }) {
  return (
    <div className="card-grid">
      {list.map((e, i) => (
        <ItemCard key={e.id} entry={e} eager={eagerFirst && i < 2} />
      ))}
    </div>
  );
}
