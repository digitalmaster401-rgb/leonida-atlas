import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { catalogMeta, ENTIDAD_META, ENTIDADES, entidadDeRuta, loadCatalog, type CatalogRecord, type Entidad } from '../data/catalog';
import { STATUS_META } from '../data/meta';
import type { Status } from '../data/schema';
import { useProgress } from '../hooks/progress';
import { normalize } from '../lib/search';
import { setQueryParam } from '../lib/query';
import { Seo } from '../components/Seo';
import { Icon } from '../components/Icon';
import { Media } from '../components/Media';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { EmptyState } from '../components/EmptyState';
import { CatalogHero } from '../components/CatalogHero';
import { NotFound } from './NotFound';

const PAGE = 48;
const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return u;
  }
};

/** Crédito obligatorio (CC BY-SA 4.0) visible en cada página del catálogo. */
function Credit() {
  return (
    <p className="small muted cat-credit" data-testid="catalog-credit">
      Datos: <a href="https://atlasgta.com">GTA Atlas</a> (<a href={catalogMeta.licencia.url}>{catalogMeta.licencia.nombre}</a>); coordenadas y landmarks: gtadb.org (CC BY 4.0). Este catálogo derivado se
      ofrece bajo la misma licencia CC BY-SA 4.0. Resúmenes en español redactados por LEONIDA ATLAS a partir de los hechos; sin imágenes ni calificaciones de terceros.
    </p>
  );
}

function useCatalog(e: Entidad | undefined) {
  const [list, setList] = useState<CatalogRecord[] | null>(null);
  useEffect(() => {
    let alive = true;
    setList(null);
    if (e) loadCatalog(e).then((l) => alive && setList(l));
    return () => {
      alive = false;
    };
  }, [e]);
  return list;
}

function Photo({ r, sizes }: { r: CatalogRecord; sizes: string }) {
  return r.foto ? (
    <Media id={r.foto} category="lugares" label={r.nombre} className="enc-img" sizes={sizes} />
  ) : (
    <span className="enc-nophoto" aria-hidden="true">
      <Icon name={ENTIDAD_META[r.entidad].icon} size={30} />
      <span>Foto oficial pendiente</span>
    </span>
  );
}

/** Portada de la enciclopedia: 12 catálogos con sus cantidades reales y el informe de cobertura. */
export function EncyclopediaHub() {
  const r = catalogMeta.resumen;
  const t = catalogMeta.totales;
  return (
    <div className="page">
      <Seo title="Enciclopedia" description="Catálogo ampliado de GTA VI: vehículos, armas, propiedades, lugares, misiones, trofeos, fauna y más, con fuentes y evidencia." />
      <header className="hub-head">
        <p className="eyebrow">
          <Icon name="book" size={18} /> Enciclopedia
        </p>
        <h1>Enciclopedia de GTA VI</h1>
        <p className="lead">
          {t.publicados.toLocaleString('es-MX')} registros publicados en 12 catálogos, cada uno con sus fuentes y su estado de evidencia. Importado el {catalogMeta.importado.slice(0, 10)}.
        </p>
        <dl className="hub-stats" data-testid="enc-totals">
          <div>
            <dt>Publicados</dt>
            <dd>{t.publicados}</dd>
          </div>
          <div>
            <dt>Pendientes de verificar</dt>
            <dd>{t.pendientesVerificar}</dd>
          </div>
          <div>
            <dt>Sin foto oficial</dt>
            <dd>{t.sinFoto}</dd>
          </div>
        </dl>
      </header>
      <ul className="enc-grid">
        {ENTIDADES.map((e) => (
          <li key={e}>
            <Link to={`/enciclopedia/${ENTIDAD_META[e].ruta}`} className="neo-card neo-cyan enc-tile" data-testid="enc-tile">
              <Media id={ENTIDAD_META[e].media} category="lugares" label={ENTIDAD_META[e].titulo} className="neo-card-img" sizes="(min-width: 1024px) 25vw, 50vw" />
              <span className="neo-card-ico" aria-hidden="true">
                <Icon name={ENTIDAD_META[e].icon} size={24} />
              </span>
              <span className="neo-card-title">{ENTIDAD_META[e].titulo}</span>
              <span className="neo-card-count">{r[e].publicados} registros</span>
            </Link>
          </li>
        ))}
      </ul>
      <section className="section" aria-labelledby="cob-h">
        <h2 id="cob-h" className="section-title">
          Cobertura
        </h2>
        <p className="small muted">Por catálogo: registros recibidos de la fuente, publicados, pendientes, rechazados, duplicados, enlazados con fichas curadas y fotos oficiales.</p>
        <div className="table-wrap" tabIndex={0} role="region" aria-label="Tabla de cobertura">
          <table data-testid="enc-coverage">
            <thead>
              <tr>
                <th scope="col">Catálogo</th>
                <th scope="col">Recibidos</th>
                <th scope="col">Publicados</th>
                <th scope="col">Por verificar</th>
                <th scope="col">Rechazados</th>
                <th scope="col">Duplicados</th>
                <th scope="col">Ya en Atlas</th>
                <th scope="col">Con foto</th>
              </tr>
            </thead>
            <tbody>
              {ENTIDADES.map((e) => (
                <tr key={e}>
                  <th scope="row">
                    <Link to={`/enciclopedia/${ENTIDAD_META[e].ruta}`}>{ENTIDAD_META[e].titulo}</Link>
                  </th>
                  <td>{r[e].recibidos}</td>
                  <td>{r[e].publicados}</td>
                  <td>{r[e].pendientesVerificar + r[e].pendientesRevision}</td>
                  <td>{r[e].rechazados}</td>
                  <td>{r[e].duplicados}</td>
                  <td>{r[e].enlazadosConFichaCurada}</td>
                  <td>{r[e].conFoto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small">
          Lo que falta frente a los totales del juego (vehículos, armas, coleccionables individuales, fauna…) está en <code>docs/v4/COBERTURA.md</code>.
        </p>
      </section>
      <Credit />
    </div>
  );
}

/** Lista de un catálogo: buscador, tipos, evidencia y paginación. */
export function EncyclopediaList() {
  const { entidad: ruta } = useParams();
  const e = entidadDeRuta(ruta);
  const list = useCatalog(e);
  const [params, setParams] = useSearchParams();
  const { progress } = useProgress();
  const q = params.get('q') ?? '';
  const tipo = params.get('tipo');
  const ev = params.get('evidencia') as Status | null;
  const [shown, setShown] = useState(PAGE);
  const tipos = useMemo(() => [...new Map((list ?? []).filter((r) => r.tipo).map((r) => [r.tipo!, r.tipoEs ?? r.tipo!])).entries()].sort((a, b) => a[1].localeCompare(b[1])), [list]);
  if (!e) return <NotFound />;
  const meta = ENTIDAD_META[e];
  const nq = normalize(q.trim());
  const filtered = (list ?? []).filter((r) => (!nq || normalize(`${r.nombre} ${r.subtitulo ?? ''}`).includes(nq)) && (!tipo || r.tipo === tipo) && (!ev || r.estado === ev));
  const hideSpoilers = progress.settings.spoilerLevel < 1;
  return (
    <div className="page">
      <Seo title={`${meta.titulo} · Enciclopedia`} description={`Catálogo de ${meta.titulo.toLowerCase()} de GTA VI con fuentes y evidencia.`} />
      <CatalogHero
        category="lugares"
        heroMedia={meta.media}
        title={meta.titulo}
        icon={meta.icon}
        list={(list ?? []).map((r) => ({ status: r.estado }))}
        intro={<p>Catálogo completo con nombre original, datos con fuente y estado de evidencia. {catalogMeta.resumen[e].pendientesVerificar} registros más esperan verificación y no se muestran.</p>}
      >
        <Link to="/enciclopedia" className="btn btn-neon">
          <Icon name="book" size={18} /> Todos los catálogos
        </Link>
      </CatalogHero>
      <div className="enc-tools">
        <label className="map-search enc-search">
          <span className="sr-only">Buscar en {meta.titulo.toLowerCase()}</span>
          <Icon name="search" size={18} />
          <input type="search" value={q} onChange={(x) => setQueryParam(setParams, 'q', x.target.value || null)} placeholder={`Buscar en ${meta.titulo.toLowerCase()}…`} />
        </label>
        {tipos.length > 1 && (
          <div className="type-chips" role="group" aria-label="Tipo">
            <button type="button" className={`map-chip${!tipo ? ' is-on' : ''}`} aria-pressed={!tipo} onClick={() => setQueryParam(setParams, 'tipo', null)}>
              Todos
            </button>
            {tipos.map(([id, label]) => (
              <button key={id} type="button" className={`map-chip${tipo === id ? ' is-on' : ''}`} aria-pressed={tipo === id} onClick={() => setQueryParam(setParams, 'tipo', tipo === id ? null : id)}>
                {label} <span className="map-chip-n">{(list ?? []).filter((r) => r.tipo === id).length}</span>
              </button>
            ))}
          </div>
        )}
        <div className="type-chips" role="group" aria-label="Evidencia">
          {(['oficial', 'contrastado', 'reportado'] as Status[]).map((s) => (
            <button key={s} type="button" className={`map-chip${ev === s ? ' is-on' : ''}`} aria-pressed={ev === s} onClick={() => setQueryParam(setParams, 'evidencia', ev === s ? null : s)}>
              {STATUS_META[s].label} <span className="map-chip-n">{(list ?? []).filter((r) => r.estado === s).length}</span>
            </button>
          ))}
        </div>
        <p className="small muted" aria-live="polite" data-testid="enc-count">
          {list ? `${filtered.length} de ${list.length} ${meta.titulo.toLowerCase()}.` : 'Cargando catálogo…'}
        </p>
      </div>
      {list && filtered.length === 0 && <EmptyState title="Sin resultados">Prueba con otro nombre o quita un filtro.</EmptyState>}
      <ul className="enc-list">
        {filtered.slice(0, shown).map((r) => (
          <li key={r.id}>
            <Link to={`/enciclopedia/${meta.ruta}/${r.slug}`} className="enc-card" data-testid="enc-card">
              <span className="enc-media">
                <Photo r={r} sizes="(min-width: 1024px) 22vw, 45vw" />
              </span>
              <span className="enc-body">
                <span className="enc-name">{hideSpoilers && r.spoiler ? `${meta.singular} con posibles spoilers` : r.nombre}</span>
                {r.subtitulo && <span className="enc-sub">{r.subtitulo}</span>}
                <span className="enc-meta">
                  <EvidenceBadge status={r.estado} compact />
                  {r.curada && <span className="chip chip-static chip-edition">Ficha curada</span>}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {filtered.length > shown && (
        <button type="button" className="btn" onClick={() => setShown((s) => s + PAGE)}>
          Ver más ({filtered.length - shown} restantes)
        </button>
      )}
      <Credit />
    </div>
  );
}

/** Ficha de un registro del catálogo con hechos, relaciones, fuentes, evidencia y licencia. */
export function EncyclopediaDetail() {
  const { entidad: ruta, slug } = useParams();
  const e = entidadDeRuta(ruta);
  const list = useCatalog(e);
  const { isFavorite, toggleFavorite } = useProgress();
  if (!e) return <NotFound />;
  if (!list) return <p className="page muted">Cargando…</p>;
  const r = list.find((x) => x.slug === slug);
  if (!r) return <NotFound />;
  const meta = ENTIDAD_META[e];
  const fav = isFavorite(r.id);
  return (
    <div className="page">
      <Seo title={`${r.nombre} · ${meta.titulo}`} description={r.resumen} />
      <nav className="small crumbs" aria-label="Migas">
        <Link to="/enciclopedia">Enciclopedia</Link> / <Link to={`/enciclopedia/${meta.ruta}`}>{meta.titulo}</Link> / {r.nombre}
      </nav>
      <header className="detail-head">
        <div className="detail-badges">
          <EvidenceBadge status={r.estado} />
          <span className="chip chip-static">{meta.singular}</span>
          {r.tipoEs && <span className="chip chip-static">{r.tipoEs}</span>}
        </div>
        <h1>{r.nombre}</h1>
        <p className="lead">{r.resumen}</p>
        <div className="btn-row">
          <button type="button" className={`btn${fav ? ' is-on' : ''}`} aria-pressed={fav} onClick={() => toggleFavorite(r.id)}>
            <Icon name="star" size={18} /> {fav ? 'Guardado' : 'Guardar'}
          </button>
          {r.curada && (
            <Link to={r.curada.ruta} className="btn btn-neon">
              Ver ficha curada de LEONIDA ATLAS <Icon name="arrow_right" size={16} />
            </Link>
          )}
        </div>
      </header>
      <div className="detail-grid">
        <div className="detail-main">
          <div className="detail-hero enc-hero">
            <Photo r={r} sizes="(min-width: 1024px) 60vw, 100vw" />
          </div>
          <section className="panel" aria-labelledby="enc-facts-h">
            <h2 id="enc-facts-h">Datos</h2>
            <div className="table-wrap" tabIndex={0} role="region" aria-label="Datos del registro">
              <table className="facts" data-testid="enc-facts">
                <tbody>
                  {r.hechos.map((h) => (
                    <tr key={h.etiqueta}>
                      <th scope="row">{h.etiqueta}</th>
                      <td>{h.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="small muted">Evidencia «{STATUS_META[r.estado].label}»: {STATUS_META[r.estado].description}</p>
          </section>
          {r.relaciones.length > 0 && (
            <section className="panel" aria-labelledby="enc-rel-h">
              <h2 id="enc-rel-h">Relacionado</h2>
              <ul className="bullets">
                {r.relaciones.map((x) => (
                  <li key={`${x.entidad}-${x.slug}`}>
                    <Link to={`/enciclopedia/${ENTIDAD_META[x.entidad].ruta}/${x.slug}`}>{x.nombre}</Link> <span className="muted small">· {ENTIDAD_META[x.entidad].singular}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <aside className="detail-side">
          <section className="panel" aria-labelledby="enc-loc-h">
            <h2 id="enc-loc-h">Ubicación</h2>
            {r.coords ? (
              <p className="small">
                Coordenada de la comunidad (gtadb.org, metros): x {r.coords.x.toFixed(0)}, y {r.coords.y.toFixed(0)}. No se muestra en el mapa: la calibración con el póster oficial solo alcanza precisión de zona.
              </p>
            ) : (
              <p className="small muted">Sin coordenada verificada: no aparece en el mapa.</p>
            )}
          </section>
          <section className="panel" aria-labelledby="enc-src-h">
            <h2 id="enc-src-h">Fuentes</h2>
            <ol className="small">
              {r.fuentes.map((u) => (
                <li key={u}>
                  <a href={u} target="_blank" rel="noopener noreferrer nofollow">
                    {host(u)} <Icon name="external" size={13} />
                  </a>
                </li>
              ))}
            </ol>
            <p className="small muted">
              Fuente comprobada por GTA Atlas: {r.verificadoFuente ?? '—'}. Registro original: <a href={r.origen.url}>{host(r.origen.url)}</a>.
            </p>
          </section>
        </aside>
      </div>
      <Credit />
    </div>
  );
}
