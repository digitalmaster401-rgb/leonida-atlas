import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { entries, entriesBy, entryPath } from '../data';
import { GAME_RELEASE, LAST_REVIEW } from '../data/meta';
import { formatDate } from '../lib/calc';
import { progressSummary } from '../lib/progressSummary';
import { useProgress } from '../hooks/progress';
import type { Finding } from '../intel/schema';
import { Icon } from './Icon';
import { Media } from './Media';
import { InstallButton } from './PwaControls';
import { StatusBadge } from './IntelStatus';
import { findingDate } from './LatestIntel';

/* Sistema visual de la portada Explorar (Fase 4A.2). Todas las fotografías son oficiales (public/media/media-manifest.json)
   y todos los números salen de content/*.json, intel/*.json o del progreso local. */

/** Banner cinematográfico: ciudad nocturna oficial + paneles oficiales de Lucia y Jason + título y llamada a la acción. */
export function CineBanner() {
  return (
    <section className="cine" aria-labelledby="hero-h">
      <div className="cine-bg">
        <Media id="vc-skyline-noche" category="lugares" label="Vice City de noche" className="cine-city" sizes="100vw" eager />
      </div>
      <div className="cine-people" aria-hidden="true">
        <div className="cine-panel cine-panel-a">
          <Media id="p-lucia" category="personajes" label="Lucia" className="cine-person cine-lucia" sizes="(min-width: 1024px) 30vw, 45vw" eager />
        </div>
        <div className="cine-panel cine-panel-b">
          <Media id="p-jason" category="personajes" label="Jason" className="cine-person cine-jason" sizes="(min-width: 1024px) 30vw, 45vw" eager />
        </div>
      </div>
      <div className="cine-copy">
        <p className="cine-kicker">Guía independiente · GTA VI</p>
        <h1 id="hero-h" className="cine-title">
          Explora <span>Leonida</span>
        </h1>
        <p className="cine-lead">Mapa oficial, rutas, coleccionables y descubrimientos con fuentes, en una misma guía.</p>
        <div className="cine-ctas">
          <Link to="/mapa" className="btn btn-glow">
            <Icon name="compass" size={20} /> Comenzar exploración
          </Link>
        </div>
      </div>
      <p className="hero-credit">Imágenes oficiales © Rockstar Games</p>
    </section>
  );
}

/** Encabezado de sección con barra neón y enlace «Ver todo». */
export function SectionHead({ id, title, accent, to, more = 'Ver todo' }: { id: string; title: string; accent?: string; to?: string; more?: string }) {
  return (
    <div className="neo-head">
      <h2 id={id} className="neo-title">
        {title} {accent && <span>{accent}</span>}
      </h2>
      {to && (
        <Link to={to} className="neo-more">
          {more} <Icon name="arrow_right" size={16} />
        </Link>
      )}
    </div>
  );
}

/** Carrusel fotográfico de las 6 regiones oficiales (desplazamiento horizontal con imán). */
export function RegionCarousel() {
  const regions = entriesBy('lugares').filter((e) => !e.subzone);
  return (
    <section className="section" aria-labelledby="reg-h">
      <SectionHead id="reg-h" title="Regiones de" accent="Leonida" to="/lugares" />
      <ul className="region-strip neo-regions">
        {regions.map((r, i) => (
          <li key={r.id}>
            <Link to={entryPath(r)} className="region-tile neo-region">
              <Media id={r.images[0]} category="lugares" label={r.name} sizes="(min-width: 1024px) 26vw, 72vw" eager={i < 2} />
              <span className="region-name">{r.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const CARDS = [
  { cat: 'vehiculos', to: '/vehiculos', title: 'Vehículos', media: 'ue-cheetah', icon: 'car', tone: 'cyan' },
  { cat: 'armas', to: '/armas', title: 'Armas', media: 'ue-revolveres', icon: 'target', tone: 'magenta' },
  { cat: 'coleccionables', to: '/coleccionables', title: 'Secretos y coleccionables', media: 'keys-buceo', icon: 'grid', tone: 'cyan' },
  { cat: 'dinero', to: '/dinero', title: 'Dinero', media: 'jl-banco', icon: 'coins', tone: 'magenta' },
] as const;

/** Tarjetas fotográficas de las cuatro áreas más consultadas, con el número real de fichas. */
export function VisualCards() {
  return (
    <section className="section" aria-labelledby="vis-h">
      <SectionHead id="vis-h" title="Descubre" accent="Leonida" />
      <ul className="neo-cards">
        {CARDS.map((c) => (
          <li key={c.cat}>
            <Link to={c.to} className={`neo-card neo-${c.tone}`} data-testid="visual-card">
              <Media id={c.media} category={c.cat} label={c.title} className="neo-card-img" sizes="(min-width: 1024px) 25vw, 50vw" />
              <span className="neo-card-ico" aria-hidden="true">
                <Icon name={c.icon} size={26} />
              </span>
              <span className="neo-card-title">{c.title}</span>
              <span className="neo-card-count">{entriesBy(c.cat).length} fichas</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Novedades con fotografía: se usa la imagen oficial de la ficha relacionada; si no hay, una miniatura ilustrada rotulada. */
export function NewsPhotos() {
  const [list, setList] = useState<Finding[] | null>(null);
  useEffect(() => {
    let alive = true;
    import('../data/intel').then(({ findings }) => {
      if (!alive) return;
      setList(
        findings
          .filter((f) => f.classifier !== 'migracion')
          .sort((a, b) => findingDate(b).localeCompare(findingDate(a)))
          .slice(0, 3),
      );
    });
    return () => {
      alive = false;
    };
  }, []);
  return (
    <section className="section" aria-labelledby="news-h">
      <SectionHead id="news-h" title="Últimas" accent="novedades" to="/novedades" />
      <ul className="neo-news" aria-busy={!list}>
        {(list ?? []).map((f) => {
          const rel = f.entryIds.map((id) => entries.find((e) => e.id === id)).find((e) => e?.images[0]);
          return (
            <li key={f.id} className="neo-news-item" data-testid="news-photo">
              <span className="neo-news-media">
                {rel ? (
                  <Media id={rel.images[0]} category={rel.category} label={rel.name} className="neo-news-img" sizes="160px" />
                ) : (
                  <span className="neo-news-illus" aria-hidden="true">
                    <Icon name="news" size={30} />
                  </span>
                )}
                <span className="neo-news-tag">{rel ? 'Imagen de la ficha' : 'Ilustración'}</span>
              </span>
              <span className="neo-news-body">
                <span className="neo-news-meta">
                  <StatusBadge status={f.status} />
                  <time dateTime={findingDate(f).slice(0, 10)}>{formatDate(findingDate(f).slice(0, 10))}</time>
                </span>
                <span className="neo-news-title">{f.title}</span>
                <a href={f.sources[0].url} target="_blank" rel="noopener noreferrer nofollow" className="small">
                  {f.sources[0].publisher} <Icon name="external" size={13} />
                </a>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Progreso personal calculado del progreso guardado en este dispositivo. */
export function ProgressPanel() {
  const { progress } = useProgress();
  const s = progressSummary(progress, entries);
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <section className="section" aria-labelledby="prog-h">
      <SectionHead id="prog-h" title="Tu" accent="progreso" to="/mi-espacio" more="Mi espacio" />
      <div className="neo-progress" data-testid="progress-panel">
        <div className="neo-ring">
          <svg viewBox="0 0 80 80" width="96" height="96" aria-hidden="true" focusable="false">
            <circle cx="40" cy="40" r={r} fill="none" stroke="#232a41" strokeWidth="8" />
            {s.collectiblesPct > 0 && <circle cx="40" cy="40" r={r} fill="none" stroke="url(#ring-g)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(s.collectiblesPct / 100) * c} ${c}`} transform="rotate(-90 40 40)" />}
            <defs>
              <linearGradient id="ring-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ff3ea5" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
          <span className="neo-ring-value">{s.collectiblesPct}%</span>
        </div>
        <div className="neo-progress-body">
          <p className="neo-progress-main">
            <strong>
              {s.collectiblesFound} / {s.collectiblesTotal}
            </strong>{' '}
            coleccionables encontrados
          </p>
          <ul className="neo-stats">
            <li>
              <Icon name="route" size={18} /> <strong>{s.routes}</strong> rutas
              {s.stopsTotal > 0 && (
                <span className="muted">
                  {' '}
                  ({s.stopsVisited}/{s.stopsTotal} paradas)
                </span>
              )}
            </li>
            <li>
              <Icon name="car" size={18} /> <strong>{s.garage}</strong> en tu garaje
            </li>
            <li>
              <Icon name="check" size={18} /> <strong>{s.completed}</strong> fichas marcadas
            </li>
          </ul>
          {!s.hasAny && <p className="small muted">Aún no marcas nada. Tu progreso se guarda solo en este dispositivo.</p>}
        </div>
      </div>
    </section>
  );
}

/** Buscador principal real (envía a /buscar) y accesos de inicio. */
export function ExplorerSearch() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  return (
    <section className="explorer section" aria-labelledby="explorer-h">
      <SectionHead id="explorer-h" title="Busca en la" accent="guía" />
      <form
        className="hero-search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          nav(`/buscar?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <label htmlFor="hero-q" className="sr-only">
          Buscar
        </label>
        <input id="hero-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Prueba: «Moses», «Duke 556», «Stockyard»…" enterKeyHint="search" />
        <button type="submit" className="btn btn-cta">
          <Icon name="search" size={18} /> Buscar
        </button>
      </form>
      <div className="hero-ctas">
        <Link to="/rutas/empieza-aqui" className="btn">
          Empieza aquí
        </Link>
        <InstallButton className="btn btn-ghost" />
      </div>
      <p className="hero-facts small">
        Disponible desde el {formatDate(GAME_RELEASE)} en PS5 y Xbox Series X|S · Última revisión de la guía: {formatDate(LAST_REVIEW)}
      </p>
    </section>
  );
}
