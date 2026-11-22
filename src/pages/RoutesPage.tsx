import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { entries, entryById, entryPath } from '../data';
import { CATEGORY_META, CATEGORY_ORDER, PRECISION_LABEL } from '../data/meta';
import { useProgress } from '../hooks/progress';
import { useToast } from '../hooks/toast';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { Seo } from '../components/Seo';
import { setQueryParam } from '../lib/query';
import { addStop, moveStop, newRoute, removeStop, routeProgress } from '../lib/routes';
import { MAX_STOPS, type PersonalRoute } from '../lib/storage';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
/** Solo puntos documentados: fichas con posición en el mapa oficial. */
const STOPPABLE = entries.filter((e) => e.mapPosition);

function Editor({ initial, onDone }: { initial: PersonalRoute; onDone: () => void }) {
  const { saveRoute, progress } = useProgress();
  const toast = useToast();
  const [r, setR] = useState<PersonalRoute>(initial);
  const [q, setQ] = useState('');
  const isNew = !progress.routes.some((x) => x.id === r.id);
  const matches = useMemo(() => {
    const t = norm(q.trim());
    return STOPPABLE.filter((e) => !t || norm(`${e.name} ${e.subzone ?? ''} ${CATEGORY_META[e.category].singular}`).includes(t))
      .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category))
      .slice(0, 30);
  }, [q]);
  const save = () => {
    if (!r.name.trim()) {
      toast.show('Ponle un nombre a la ruta.');
      return;
    }
    saveRoute({ ...r, name: r.name.trim() });
    toast.show(isNew ? 'Ruta guardada en Mi espacio.' : 'Ruta actualizada.');
    onDone();
  };
  return (
    <section className="panel route-editor" aria-labelledby="ed-h" data-testid="route-editor">
      <h2 id="ed-h">{isNew ? 'Nueva ruta' : `Editar «${initial.name}»`}</h2>
      <div className="record-grid">
        <div className="field">
          <label htmlFor="rt-name">Nombre</label>
          <input id="rt-name" type="text" maxLength={60} value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} placeholder="Ej.: Revistas de Key Lento" />
        </div>
        <div className="field field-wide">
          <label htmlFor="rt-obj">Objetivo (opcional)</label>
          <input id="rt-obj" type="text" maxLength={300} value={r.objective} onChange={(e) => setR({ ...r, objective: e.target.value })} placeholder="Qué quieres lograr en esta ruta" />
        </div>
      </div>

      <h3>
        Paradas ({r.stops.length}/{MAX_STOPS})
      </h3>
      {r.stops.length ? (
        <ol className="stop-list">
          {r.stops.map((s, i) => {
            const e = entryById.get(s.entryId);
            return (
              <li key={`${s.entryId}-${i}`} className={`stop${s.visited ? ' is-visited' : ''}`} data-testid="stop">
                <span className="stop-n" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="stop-body">
                  <strong>{e?.name ?? `${s.entryId} (ya no está en la guía)`}</strong>
                  {e?.mapPosition && <span className="muted small">{PRECISION_LABEL[e.mapPosition.precision]}</span>}
                  <label className="sr-only" htmlFor={`note-${i}`}>
                    Nota de la parada {i + 1}
                  </label>
                  <input
                    id={`note-${i}`}
                    type="text"
                    maxLength={200}
                    value={s.note}
                    placeholder="Nota u objetivo de esta parada"
                    onChange={(ev) => setR({ ...r, stops: r.stops.map((x, j) => (j === i ? { ...x, note: ev.target.value } : x)) })}
                  />
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={s.visited}
                      onChange={(ev) => setR({ ...r, stops: r.stops.map((x, j) => (j === i ? { ...x, visited: ev.target.checked } : x)) })}
                    />{' '}
                    Visitada
                  </label>
                </div>
                <div className="stop-actions">
                  <button type="button" className="icon-btn" aria-label={`Subir parada ${i + 1}`} disabled={i === 0} onClick={() => setR(moveStop(r, i, -1))}>
                    <Icon name="arrow_left" size={18} className="rot90" />
                  </button>
                  <button type="button" className="icon-btn" aria-label={`Bajar parada ${i + 1}`} disabled={i === r.stops.length - 1} onClick={() => setR(moveStop(r, i, 1))}>
                    <Icon name="arrow_right" size={18} className="rot90" />
                  </button>
                  <button type="button" className="icon-btn" aria-label={`Quitar parada ${i + 1}`} onClick={() => setR(removeStop(r, i))}>
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="muted">Añade paradas desde la lista de puntos documentados.</p>
      )}

      <div className="field">
        <label htmlFor="rt-q">Añadir parada: busca un punto documentado</label>
        <input id="rt-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Key Lento, Moses, revista…" />
      </div>
      <ul className="stop-picker" aria-label="Puntos documentados">
        {matches.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              className="btn btn-sm"
              disabled={r.stops.length >= MAX_STOPS}
              onClick={() => setR(addStop(r, e.id))}
              aria-label={`Añadir ${e.name} a la ruta`}
            >
              <Icon name="plus" size={16} /> <span className={`dot dot-${e.category}`} aria-hidden="true" /> {e.name}
            </button>
            <span className="muted small"> {e.subzone ?? CATEGORY_META[e.category].singular}</span>
          </li>
        ))}
      </ul>
      <p className="small muted">
        Solo se pueden añadir fichas con punto en el mapa oficial. El orden es el que tú elijas: la guía no calcula caminos ni distancias, porque no hay datos oficiales de
        carreteras del juego.
      </p>
      <div className="btn-row">
        <button type="button" className="btn btn-cta" onClick={save} data-testid="route-save">
          <Icon name="check" size={18} /> Guardar ruta
        </button>
        <button type="button" className="btn btn-ghost" onClick={onDone}>
          Cancelar
        </button>
      </div>
    </section>
  );
}

export function RoutesPage() {
  const { progress, deleteRoute, saveRoute } = useProgress();
  const [params, setParams] = useSearchParams();
  const editId = params.get('editar');
  const [draft, setDraft] = useState<PersonalRoute | null>(null);
  const editing = draft ?? (editId ? (progress.routes.find((r) => r.id === editId) ?? null) : null);
  const close = () => {
    setDraft(null);
    setQueryParam(setParams, 'editar', null);
  };
  return (
    <div className="page">
      <Seo title="Mis rutas" description="Crea rutas personales con puntos documentados del mapa oficial de Leonida, ordena paradas y marca lo visitado." />
      <header className="page-head">
        <h1>
          <Icon name="route" size={28} /> Mis rutas
        </h1>
        <p className="lead">Arma recorridos con puntos documentados del mapa, en el orden que quieras, y marca lo que ya visitaste. Se guardan solo en este dispositivo.</p>
      </header>
      {editing ? (
        <Editor key={editing.id} initial={editing} onDone={close} />
      ) : (
        <button type="button" className="btn btn-cta" onClick={() => setDraft(newRoute())} data-testid="route-new">
          <Icon name="plus" size={18} /> Nueva ruta
        </button>
      )}
      <section className="section" aria-labelledby="mine-h">
        <h2 id="mine-h" className="section-title">
          Guardadas ({progress.routes.length})
        </h2>
        {progress.routes.length ? (
          <ul className="saved-list">
            {progress.routes.map((r) => {
              const pr = routeProgress(r);
              return (
                <li key={r.id} className="panel" data-testid="saved-route">
                  <strong>{r.name}</strong>
                  {r.objective && <span className="small">{r.objective}</span>}
                  <span className="muted small">
                    {r.stops.length} paradas · {pr.visited} visitadas ({pr.pct} %)
                  </span>
                  <div className="progress-bar" role="progressbar" aria-valuenow={pr.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso de ${r.name}`}>
                    <span style={{ width: `${pr.pct}%` }} />
                  </div>
                  <ol className="bullets small">
                    {r.stops.slice(0, 6).map((s, i) => {
                      const e = entryById.get(s.entryId);
                      return (
                        <li key={i}>
                          <label className="check">
                            <input
                              type="checkbox"
                              checked={s.visited}
                              onChange={(ev) => saveRoute({ ...r, stops: r.stops.map((x, j) => (j === i ? { ...x, visited: ev.target.checked } : x)) })}
                              aria-label={`Visitada: ${e?.name ?? s.entryId}`}
                            />
                            {e ? <Link to={entryPath(e)}>{e.name}</Link> : s.entryId}
                          </label>
                        </li>
                      );
                    })}
                    {r.stops.length > 6 && <li className="muted">y {r.stops.length - 6} más…</li>}
                  </ol>
                  <div className="btn-row">
                    <Link to={`/mapa?ruta=${r.id}`} className="btn btn-sm">
                      <Icon name="map" size={16} /> Ver en el mapa
                    </Link>
                    <button type="button" className="btn btn-sm" onClick={() => setQueryParam(setParams, 'editar', r.id)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost btn-danger"
                      aria-label={`Borrar ${r.name}`}
                      onClick={() => window.confirm(`¿Borrar la ruta «${r.name}»?`) && deleteRoute(r.id)}
                    >
                      <Icon name="trash" size={16} /> Borrar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState icon="route" title="Aún no tienes rutas">
            Crea una con «Nueva ruta». Por ejemplo, las revistas de Key Lento.
          </EmptyState>
        )}
      </section>
    </div>
  );
}
