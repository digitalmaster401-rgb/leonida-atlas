import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import type { Category, Entry } from '../data/schema';
import { PRECISIONS } from '../data/schema';
import { entries, entryById, entryPath } from '../data';
import { CATEGORY_META, CATEGORY_ORDER, PRECISION_LABEL } from '../data/meta';
import { groupPins, MapView, PinPanel, posterOf, type RouteOverlay } from '../components/MapView';
import { Seo } from '../components/Seo';
import { Icon } from '../components/Icon';
import { setQueryParam } from '../lib/query';
import { useProgress } from '../hooks/progress';
import { loadMapPrefs, saveMapPrefs, type MapPrefs } from '../lib/mapprefs';
import { POSTER_LABEL, type PosterId } from '../lib/mapgeo';

type Precision = (typeof PRECISIONS)[number];
const PRECISION_HELP: Record<Precision, string> = {
  exacta: 'Exacta: coordenada comprobada (ninguna por ahora)',
  barrio: 'Barrio: sobre el rótulo del barrio en el póster',
  zona: 'Zona: sobre el rótulo de la zona o lugar',
  region: 'Región: punto representativo de una región',
};

export function MapPage() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('id');
  const routeId = params.get('ruta');
  const { progress, setHideFound } = useProgress();
  const [prefs, setPrefs] = useState<MapPrefs>(() => loadMapPrefs());
  const [posterFailed, setPosterFailed] = useState(false);
  const update = (patch: Partial<MapPrefs>) =>
    setPrefs((p) => {
      const next = { ...p, ...patch };
      saveMapPrefs(next);
      return next;
    });
  const poster: PosterId = posterFailed ? 'v1' : prefs.poster;

  const located = entries.filter((e) => e.mapPosition);
  const cats = CATEGORY_ORDER.filter((c) => located.some((e) => e.category === c));
  const activeCats = new Set<Category>(prefs.cats ?? cats);
  const precisions = PRECISIONS.filter((p) => located.some((e) => e.mapPosition!.precision === p));
  const activePrec = new Set<Precision>(prefs.precisions ?? precisions);
  const hide = progress.settings.hideFound;

  const route = routeId ? progress.routes.find((r) => r.id === routeId) : undefined;
  const overlay: RouteOverlay | null = route
    ? {
        name: route.name,
        stops: route.stops
          .map((s) => ({ s, e: entryById.get(s.entryId) }))
          .filter((x): x is { s: (typeof route.stops)[number]; e: Entry } => !!x.e?.mapPosition)
          .map(({ s, e }) => ({ x: e.mapPosition!.x, y: e.mapPosition!.y, label: e.name, visited: s.visited })),
      }
    : null;
  const routeIds = new Set(route?.stops.map((s) => s.entryId) ?? []);

  const list = useMemo(
    () =>
      located.filter(
        (e) =>
          e.id === selectedId ||
          routeIds.has(e.id) ||
          (activeCats.has(e.category) && activePrec.has(e.mapPosition!.precision) && !(hide && progress.completed.includes(e.id))),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [located, selectedId, prefs, hide, progress.completed, routeId, progress.routes],
  );
  const unknown = entries.filter((e) => !e.mapPosition && activeCats.has(e.category) && e.category !== 'personajes');
  const group = groupPins(list).find((g) => g.entries.some((e) => e.id === selectedId));
  const select = (id: string | null) => setQueryParam(setParams, 'id', id);

  const toggleIn = <T,>(set: Set<T>, v: T, all: T[]): T[] | null => {
    const n = new Set(set);
    if (n.has(v)) n.delete(v);
    else n.add(v);
    return n.size === all.length ? null : [...n];
  };

  useEffect(() => {
    if (routeId && !route) setQueryParam(setParams, 'ruta', null);
  }, [routeId, route, setParams]);

  const posterInfo = posterOf(poster).item;
  return (
    <div className="page page-map">
      <Seo title="Mapa de Leonida" description="Visor del mapa oficial de Leonida con puntos de precisión declarada enlazados a cada ficha." />
      <header className="page-head">
        <h1>
          <Icon name="map" size={28} /> Mapa de Leonida
        </h1>
        <p className="lead">
          Póster oficial de Rockstar Games con {located.length} fichas ubicadas. Cada punto declara su precisión; los números agrupan puntos cercanos (toca para acercar).
        </p>
      </header>

      <details className="map-filters" data-testid="map-filters">
        <summary>
          <Icon name="filter" size={18} /> Capas y filtros
          <span className="muted small">
            {' '}
            · {activeCats.size}/{cats.length} capas{prefs.precisions ? ` · ${activePrec.size}/${precisions.length} precisiones` : ''}
            {hide ? ' · ocultando encontrados' : ''}
          </span>
        </summary>
        <div className="chips" role="group" aria-label="Capas temáticas">
          {cats.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip${activeCats.has(c) ? ' is-on' : ''}`}
              aria-pressed={activeCats.has(c)}
              onClick={() => update({ cats: toggleIn(activeCats, c, cats) })}
            >
              <span className={`dot dot-${c}`} aria-hidden="true" /> {CATEGORY_META[c].label}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Precisión de la ubicación">
          {precisions.map((p) => (
            <button
              key={p}
              type="button"
              className={`chip${activePrec.has(p) ? ' is-on' : ''}`}
              aria-pressed={activePrec.has(p)}
              title={PRECISION_HELP[p]}
              onClick={() => update({ precisions: toggleIn(activePrec, p, precisions) })}
            >
              {PRECISION_LABEL[p]}
            </button>
          ))}
        </div>
        <div className="map-toggles">
          <label className="check">
            <input type="checkbox" checked={hide} onChange={(e) => setHideFound(e.target.checked)} data-testid="map-hide-found" /> Ocultar lo que ya encontré o completé
          </label>
          <label className="check">
            <input type="checkbox" checked={prefs.cluster} onChange={(e) => update({ cluster: e.target.checked })} data-testid="map-cluster-toggle" /> Agrupar puntos cercanos
          </label>
          <label className="field map-poster">
            <span>Póster</span>
            <select value={poster} onChange={(e) => update({ poster: e.target.value as PosterId })} data-testid="map-poster">
              {(Object.keys(POSTER_LABEL) as PosterId[]).map((p) => (
                <option key={p} value={p}>
                  {POSTER_LABEL[p]}
                </option>
              ))}
            </select>
          </label>
          {(prefs.cats || prefs.precisions) && (
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => update({ cats: null, precisions: null })}>
              <Icon name="reset" size={16} /> Mostrar todo
            </button>
          )}
        </div>
      </details>
      {posterFailed && (
        <p className="alert" role="alert">
          El póster de alta resolución no cargó; se muestra el anterior.
        </p>
      )}
      <p className="small muted map-count" aria-live="polite" data-testid="map-count">
        {list.length} puntos visibles de {located.length}.
      </p>

      {route && (
        <section className="panel route-banner" aria-label="Ruta en el mapa" data-testid="route-banner">
          <strong>
            <Icon name="route" size={18} /> {route.name}
          </strong>{' '}
          · {route.stops.length} paradas, {route.stops.filter((s) => s.visited).length} visitadas.{' '}
          <Link to={`/mis-rutas?editar=${route.id}`}>Editar ruta</Link> ·{' '}
          <button type="button" className="link-btn" onClick={() => setQueryParam(setParams, 'ruta', null)}>
            Quitar del mapa
          </button>
        </section>
      )}

      <div className="map-area">
        <MapView list={list} selectedId={selectedId} onSelect={select} poster={poster} cluster={prefs.cluster} route={overlay} onPosterError={() => poster === 'v2' && setPosterFailed(true)} />
        <PinPanel group={group} onClose={() => select(null)} />
      </div>

      <details className="panel map-unknown" data-testid="map-unknown">
        <summary>
          Sin ubicación documentada ({unknown.length}) <span className="muted small">· no las ponemos en el mapa para no inventar posiciones</span>
        </summary>
        <ul className="bullets">
          {unknown.map((e) => (
            <li key={e.id}>
              <Link to={entryPath(e)}>{e.name}</Link> <span className="muted small">· {CATEGORY_META[e.category].singular}</span>
            </li>
          ))}
        </ul>
      </details>

      <details className="small muted map-help">
        <summary>¿Qué tan precisos son los puntos?</summary>
        <ul className="bullets">
          {PRECISIONS.map((p) => (
            <li key={p}>{PRECISION_HELP[p]}</li>
          ))}
        </ul>
        <p>Usa dos dedos o los botones para acercar; arrastra para moverte. El póster es una ilustración: su escala no es la del juego.</p>
      </details>
      <p className="small muted">
        {posterInfo.captionEs} {posterInfo.copyright}. Fuente:{' '}
        <a href="https://www.rockstargames.com/VI/media" target="_blank" rel="noopener noreferrer">
          rockstargames.com/VI/media
        </a>
        . Uso no comercial de fans con atribución; no se vende ni se redistribuye comercialmente.
      </p>
    </div>
  );
}
