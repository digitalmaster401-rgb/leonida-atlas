import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import type { Category, Entry } from '../data/schema';
import { PRECISIONS } from '../data/schema';
import { entries, entryById, entryPath } from '../data';
import { CATEGORY_META, CATEGORY_ORDER, PRECISION_LABEL } from '../data/meta';
import { groupPins, MapView, posterOf, type RouteOverlay } from '../components/MapView';
import { EntrySheet, MarkerSheet, MARKER_ICON_NAME } from '../components/MapSheet';
import { normalize } from '../lib/search';
import type { CustomMarker } from '../lib/storage';
import { Seo } from '../components/Seo';
import { Icon } from '../components/Icon';
import { setQueryParam } from '../lib/query';
import { useProgress } from '../hooks/progress';
import { loadMapPrefs, saveMapPrefs, type MapPrefs } from '../lib/mapprefs';
import { POSTER_LABEL, type PosterId } from '../lib/mapgeo';

type Precision = (typeof PRECISIONS)[number];
/** Filtros agrupados: atajos que activan varias capas a la vez (solo las que tienen puntos). */
const GROUPS: { id: string; label: string; cats: Category[] }[] = [
  { id: 'explorar', label: 'Exploración', cats: ['lugares', 'negocios', 'rutas'] },
  { id: 'coleccion', label: 'Colección', cats: ['coleccionables', 'vehiculos', 'armas'] },
  { id: 'historia', label: 'Historia y dinero', cats: ['personajes', 'dinero'] },
];

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
  const [q, setQ] = useState('');
  const [legend, setLegend] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [draft, setDraft] = useState<CustomMarker | null>(null);
  const [markerId, setMarkerId] = useState<string | null>(null);
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
  const select = (id: string | null) => {
    setMarkerId(null);
    setDraft(null);
    setQueryParam(setParams, 'id', id);
  };
  const hits = q.trim().length > 1 ? located.filter((e) => normalize(e.name).includes(normalize(q.trim()))).slice(0, 6) : [];
  const countOf = (c: Category) => {
    const inCat = located.filter((e) => e.category === c);
    return { total: inCat.length, found: inCat.filter((e) => progress.completed.includes(e.id) || progress.visited.includes(e.id)).length };
  };
  const onlyCats = (list: Category[]) => {
    const pick = list.filter((c) => cats.includes(c));
    update({ cats: pick.length === cats.length ? null : pick });
  };
  const marker = draft ?? progress.markers.find((m) => m.id === markerId) ?? null;

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
      <div className="map-stage" data-testid="map-stage">
        <MapView
          list={list}
          selectedId={selectedId}
          onSelect={select}
          poster={poster}
          cluster={prefs.cluster}
          route={overlay}
          onPosterError={() => poster === 'v2' && setPosterFailed(true)}
          markers={progress.markers.map((m) => ({ id: m.id, x: m.x, y: m.y, name: m.name, icon: MARKER_ICON_NAME[m.icon] }))}
          selectedMarker={markerId}
          onMarkerSelect={(id) => {
            setQueryParam(setParams, 'id', null);
            setDraft(null);
            setMarkerId(id);
          }}
          addMode={addMode}
          onMapTap={(x, y) => {
            setAddMode(false);
            setQueryParam(setParams, 'id', null);
            setMarkerId(null);
            setDraft({ id: '', name: '', note: '', x, y, icon: 'estrella', createdAt: '', updatedAt: '' });
          }}
        />

        <div className="map-top">
          <header className="map-title">
            <h1>
              <Icon name="map" size={22} /> Mapa de Leonida
            </h1>
            <span className="small muted">{located.length} fichas ubicadas</span>
          </header>
          <div className="map-search" role="search">
            <label htmlFor="map-q" className="sr-only">
              Buscar en el mapa
            </label>
            <Icon name="search" size={18} />
            <input id="map-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar en Leonida…" autoComplete="off" enterKeyHint="search" />
            {hits.length > 0 && (
              <ul className="map-hits" data-testid="map-hits">
                {hits.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setQ('');
                        if (!activeCats.has(e.category)) update({ cats: null });
                        select(e.id);
                      }}
                    >
                      <span className={`dot dot-${e.category}`} aria-hidden="true" /> {e.name} <span className="muted small">· {CATEGORY_META[e.category].singular}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {q.trim().length > 1 && hits.length === 0 && <p className="map-hits-empty small">Sin fichas ubicadas con ese nombre.</p>}
          </div>
          <div className="map-chips" role="group" aria-label="Filtro rápido por categoría">
            <button type="button" className={`map-chip${!prefs.cats ? ' is-on' : ''}`} aria-pressed={!prefs.cats} onClick={() => update({ cats: null })}>
              <Icon name="layers" size={16} /> Todo
            </button>
            {cats.map((c) => {
              const n = countOf(c);
              return (
                <button
                  key={c}
                  type="button"
                  className={`map-chip chip-${c}${prefs.cats && activeCats.has(c) ? ' is-on' : ''}`}
                  aria-pressed={!!prefs.cats && activeCats.has(c)}
                  onClick={() => update({ cats: prefs.cats && prefs.cats.length === 1 && prefs.cats[0] === c ? null : [c] })}
                  data-testid="map-chip"
                >
                  <Icon name={CATEGORY_META[c].icon} size={16} /> {CATEGORY_META[c].label}{' '}
                  <span className="map-chip-n" aria-label={`${n.found} de ${n.total} encontrados o visitados`}>
                    {n.found}/{n.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="map-fabs" role="group" aria-label="Herramientas del mapa">
          <button type="button" className={`map-fab${legend ? ' is-on' : ''}`} aria-expanded={legend} aria-controls="map-legend" onClick={() => setLegend((l) => !l)}>
            <Icon name="list" size={20} />
            <span>Leyenda</span>
          </button>
          <button
            type="button"
            className={`map-fab${addMode ? ' is-on' : ''}`}
            aria-pressed={addMode}
            onClick={() => {
              setAddMode((m) => !m);
              setLegend(false);
            }}
            data-testid="map-add-marker"
          >
            <Icon name="flag" size={20} />
            <span>Marcador</span>
          </button>
        </div>
        {addMode && (
          <p className="map-hint" role="status">
            Toca el mapa donde quieras tu marcador personal.
          </p>
        )}

        {legend && (
          <div id="map-legend" className="map-legend-panel" data-testid="map-legend">
            <p className="legend-title">Leyenda</p>
            <ul>
              {cats.map((c) => (
                <li key={c}>
                  <span className={`legend-pin pin-${c}`} aria-hidden="true">
                    <Icon name={CATEGORY_META[c].icon} size={14} />
                  </span>
                  {CATEGORY_META[c].label} <span className="muted small">({countOf(c).total})</span>
                </li>
              ))}
              <li>
                <span className="legend-pin legend-marker" aria-hidden="true">
                  <Icon name="star" size={14} />
                </span>
                Marcador personal <span className="muted small">({progress.markers.length})</span>
              </li>
              <li>
                <span className="legend-cluster" aria-hidden="true">
                  3
                </span>
                Grupo de puntos cercanos (toca para acercar)
              </li>
            </ul>
            <p className="small muted">Ningún punto es una coordenada exacta del juego: cada uno declara su precisión (región, zona o barrio).</p>
          </div>
        )}

        <details className="map-filters" data-testid="map-filters">
          <summary>
            <Icon name="filter" size={18} /> Capas
            <span className="muted small">
              {' '}
              · {activeCats.size}/{cats.length}
              {prefs.precisions ? ` · ${activePrec.size}/${precisions.length} precisiones` : ''}
              {hide ? ' · ocultando encontrados' : ''}
            </span>
          </summary>
          <div className="map-filters-body">
            <p className="filters-label">Grupos</p>
            <div className="chips" role="group" aria-label="Filtros agrupados">
              {GROUPS.filter((g) => g.cats.some((c) => cats.includes(c))).map((g) => (
                <button key={g.id} type="button" className="chip" onClick={() => onlyCats(g.cats)}>
                  {g.label}
                </button>
              ))}
            </div>
            <p className="filters-label">Categorías</p>
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
            <p className="filters-label">Precisión</p>
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
          </div>
        </details>

        {marker ? (
          <MarkerSheet
            key={marker.id || `${marker.x},${marker.y}`}
            marker={marker}
            onClose={() => {
              setDraft(null);
              setMarkerId(null);
            }}
          />
        ) : (
          <EntrySheet key={group?.key} group={group} onClose={() => select(null)} />
        )}
      </div>

      {posterFailed && (
        <p className="alert" role="alert">
          El póster de alta resolución no cargó; se muestra el anterior.
        </p>
      )}
      <p className="small muted map-count" aria-live="polite" data-testid="map-count">
        {list.length} puntos visibles de {located.length} · {progress.markers.length} marcadores personales.
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
