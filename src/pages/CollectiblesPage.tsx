import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { entriesBy, entryPath } from '../data';
import type { Entry } from '../data/schema';
import { REGION_LABEL } from '../data/meta';
import { useProgress } from '../hooks/progress';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { Seo } from '../components/Seo';
import { STATE_LABEL } from '../components/MyRecord';
import { setQueryParam } from '../lib/query';
import { TRACK_STATES, type TrackState } from '../lib/storage';

type Filter = 'todos' | 'encontrado' | 'sin-encontrar' | TrackState;
const FILTERS: Filter[] = ['todos', 'encontrado', 'sin-encontrar', ...TRACK_STATES];
const FILTER_LABEL: Record<Filter, string> = { todos: 'Todos', 'sin-encontrar': 'Sin encontrar', ...STATE_LABEL };

function Counter({ col }: { col: Entry }) {
  const { progress, setCounter } = useProgress();
  const n = progress.counters[col.id] ?? 0;
  const total = col.tracking?.total ?? null;
  const pct = total ? Math.min(100, Math.round((n / total) * 100)) : null;
  const id = `cnt-${col.id}`;
  return (
    <div className="counter" data-testid="counter" data-id={col.id}>
      <label htmlFor={id}>Llevo</label>
      <div className="counter-row">
        <button type="button" className="icon-btn" aria-label={`Restar 1 a ${col.name}`} onClick={() => setCounter(col.id, n - 1)} disabled={n <= 0}>
          <Icon name="minus" size={18} />
        </button>
        <input id={id} type="number" inputMode="numeric" min={0} max={total ?? 10000} value={n} onChange={(e) => setCounter(col.id, Number(e.target.value))} />
        <button type="button" className="icon-btn" aria-label={`Sumar 1 a ${col.name}`} onClick={() => setCounter(col.id, n + 1)} disabled={total !== null && n >= total}>
          <Icon name="plus" size={18} />
        </button>
        <span className="muted">
          {total ? `de ${total} ${col.tracking!.unit}` : `${col.tracking!.unit} (total no publicado)`}
        </span>
      </div>
      {pct !== null && (
        <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso de ${col.name}`}>
          <span style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

function ItemRow({ e }: { e: Entry }) {
  const { progress, setFound, setRecord } = useProgress();
  const found = progress.completed.includes(e.id);
  const state = progress.records[e.id]?.state;
  const hidden = e.spoilerLevel > progress.settings.spoilerLevel;
  return (
    <li className={`col-item${found ? ' is-found' : ''}`} data-testid="col-item" data-id={e.id}>
      <button
        type="button"
        className={`icon-btn found-btn${found ? ' is-on' : ''}`}
        aria-pressed={found}
        aria-label={found ? `Desmarcar ${e.name}` : `Marcar ${e.name} como encontrado`}
        onClick={() => setFound(e.id, !found)}
      >
        <Icon name="check" size={20} />
      </button>
      <div className="col-item-body">
        <Link to={entryPath(e)} className="col-item-name">
          {e.name}
        </Link>
        <span className="muted small">
          {e.subzone ?? REGION_LABEL[e.region]} · {hidden ? `contiene spoilers ${e.spoilerLevel === 2 ? 'avanzados' : 'leves'}` : e.summary}
        </span>
        <span className="col-item-tags">
          <EvidenceBadge status={e.status} compact />
          {found && progress.records[e.id]?.date && <span className="chip chip-static">Encontrado {progress.records[e.id]!.date}</span>}
        </span>
      </div>
      <label className="sr-only" htmlFor={`st-${e.id}`}>
        Estado de {e.name}
      </label>
      <select id={`st-${e.id}`} value={found ? '' : (state ?? '')} disabled={found} onChange={(ev) => setRecord(e.id, { state: (ev.target.value || undefined) as TrackState | undefined })}>
        <option value="">{found ? 'Encontrado' : 'Sin estado'}</option>
        {TRACK_STATES.map((s) => (
          <option key={s} value={s}>
            {STATE_LABEL[s]}
          </option>
        ))}
      </select>
    </li>
  );
}

export function CollectiblesPage() {
  const { progress, setHideFound } = useProgress();
  const [params, setParams] = useSearchParams();
  const all = entriesBy('coleccionables');
  const cols = all.filter((e) => e.tracking);
  const colParam = params.get('coleccion') ?? '';
  const filter = (FILTERS.includes(params.get('estado') as Filter) ? params.get('estado') : 'todos') as Filter;
  const hide = progress.settings.hideFound;

  const items = useMemo(
    () =>
      all.filter((e) => {
        if (!e.collection || (colParam && e.collection !== colParam)) return false;
        const found = progress.completed.includes(e.id);
        const st = progress.records[e.id]?.state;
        if (hide && found) return false;
        if (filter === 'encontrado') return found;
        if (filter === 'sin-encontrar') return !found;
        if (filter !== 'todos') return !found && st === filter;
        return true;
      }),
    [all, colParam, filter, hide, progress],
  );
  const individual = all.filter((e) => e.collection);
  const foundCount = individual.filter((e) => progress.completed.includes(e.id)).length;

  return (
    <div className="page">
      <Seo title="Coleccionables" description="Tarjetas, revistas, libros y otras colecciones de GTA VI con seguimiento individual." />
      <header className="page-head">
        <h1>
          <Icon name="grid" size={28} /> Coleccionables
        </h1>
        <p className="lead">
          Marca cada objeto como encontrado, pendiente, por revisar o no disponible. Para colecciones sin lista pública (como las ≈480 tarjetas) lleva tu conteo. Todo se guarda solo en
          este dispositivo.
        </p>
        <p data-testid="col-summary">
          <strong>
            {foundCount} de {individual.length}
          </strong>{' '}
          objetos con ubicación publicada encontrados.
        </p>
      </header>

      <section aria-labelledby="cols-h" className="section">
        <h2 id="cols-h" className="section-title">
          Colecciones
        </h2>
        <div className="col-grid">
          {cols.map((c) => (
            <article key={c.id} className="panel col-card" data-testid="collection" data-id={c.id}>
              <h3>
                <Link to={entryPath(c)}>{c.name}</Link>
              </h3>
              <p className="small">{c.summary}</p>
              <p className="small">
                Total: {c.tracking!.total ?? 'no publicado'} <EvidenceBadge status={c.tracking!.totalStatus} compact />
              </p>
              <Counter col={c} />
              {individual.some((e) => e.collection === c.id) && (
                <button type="button" className="btn btn-sm" onClick={() => setQueryParam(setParams, 'coleccion', c.id)}>
                  Ver {individual.filter((e) => e.collection === c.id).length} con ubicación
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="items-h" className="section">
        <h2 id="items-h" className="section-title">
          Seguimiento individual
        </h2>
        <div className="filters">
          <div className="field">
            <label htmlFor="col-sel">Colección</label>
            <select id="col-sel" value={colParam} onChange={(e) => setQueryParam(setParams, 'coleccion', e.target.value || null)}>
              <option value="">Todas</option>
              {cols
                .filter((c) => individual.some((e) => e.collection === c.id))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="chips" role="group" aria-label="Estado">
            {FILTERS.map((f) => (
              <button key={f} type="button" className={`chip${filter === f ? ' is-on' : ''}`} aria-pressed={filter === f} onClick={() => setQueryParam(setParams, 'estado', f === 'todos' ? null : f)}>
                {FILTER_LABEL[f]}
              </button>
            ))}
          </div>
          <label className="check">
            <input type="checkbox" checked={hide} onChange={(e) => setHideFound(e.target.checked)} data-testid="hide-found" /> Ocultar encontrados (también en el mapa)
          </label>
          <p className="result-count" aria-live="polite">
            {items.length} objetos
          </p>
        </div>
        {items.length ? (
          <ul className="col-list">
            {items.map((e) => (
              <ItemRow key={e.id} e={e} />
            ))}
          </ul>
        ) : (
          <EmptyState icon="grid" title="Nada con estos filtros">
            {hide ? 'Tienes activado «Ocultar encontrados».' : 'Prueba otro estado o colección.'}
          </EmptyState>
        )}
        <p className="small muted">
          Las ubicaciones vienen de guías publicadas tras el lanzamiento; las marcadas como «reportado» tienen una sola fuente. Los puntos del mapa señalan el rótulo de la zona, no el
          objeto exacto.
        </p>
      </section>
    </div>
  );
}
