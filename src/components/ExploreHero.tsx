import { useRef, useState, type PointerEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { GAME_RELEASE, LAST_REVIEW } from '../data/meta';
import { formatDate } from '../lib/calc';
import { Icon } from './Icon';
import { Media } from './Media';
import { LogoMark } from './Logo';
import { InstallButton } from './PwaControls';

/** Palmeras en silueta: ilustración original para dar profundidad al primer plano de la portada. */
function Palms({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="-4 0 238 300" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M120 300c-4-70 2-140 22-205" strokeWidth="9" />
        <path d="M142 95c-30-26-70-30-104-12M142 95c-8-34-34-58-66-66M142 95c18-30 52-44 88-38M142 95c34-6 62 8 78 36M142 95c-34 4-62 24-74 52M142 95c4-36 22-62 50-76" strokeWidth="7" />
        <path d="M40 300c2-50 10-96 28-140" strokeWidth="6" />
        <path d="M68 160c-22-16-50-16-70-4M68 160c-4-24-20-40-42-46M68 160c14-20 38-28 60-22M68 160c22 0 40 12 48 30M68 160c-22 6-38 22-44 40" strokeWidth="5" />
      </g>
    </svg>
  );
}

/** Portada cinematográfica: imagen oficial nocturna de Vice City, degradados neón y palmeras propias en primer plano. */
export function ExploreHero() {
  return (
    <section className="hero hero-cine" aria-labelledby="hero-h">
      <div className="hero-photo-wrap">
        <Media id="vc-skyline-noche" category="lugares" label="Vice City de noche" className="hero-photo" sizes="(min-width: 1024px) 80vw, 100vw" eager />
      </div>
      <Palms className="hero-palms hero-palms-l" />
      <Palms className="hero-palms hero-palms-r" />
      <div className="hero-inner">
        <p className="eyebrow">
          <LogoMark size={22} /> Explorar · Guía independiente de GTA VI
        </p>
        <h1 id="hero-h">
          Leonida, <span className="grad">con fuentes</span>.
        </h1>
        <p className="hero-lead">Mapa oficial, dinero, armas, vehículos y negocios. Cada dato dice de dónde sale.</p>
      </div>
      <p className="hero-credit">Imagen oficial © Rockstar Games</p>
    </section>
  );
}

/** Barra «ATLAS EXPLORER»: título de sección y botón que lleva al buscador principal. */
export function ExplorerBar() {
  return (
    <div className="explorer-bar">
      <span className="explorer-ico" aria-hidden="true">
        <Icon name="compass" size={22} />
      </span>
      <p className="explorer-title">ATLAS Explorer</p>
      <button
        type="button"
        className="explorer-action"
        aria-label="Ir al buscador principal"
        onClick={() => {
          const el = document.getElementById('hero-q');
          el?.scrollIntoView({ block: 'center' });
          el?.focus({ preventScroll: true });
        }}
      >
        <Icon name="search" size={22} />
      </button>
    </div>
  );
}

/** Buscador principal real (envía a /buscar) y accesos de inicio. */
export function ExplorerSearch() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  return (
    <section className="explorer section" aria-labelledby="explorer-h">
      <h2 id="explorer-h" className="section-title">
        Busca en la guía
      </h2>
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

const SLIDES = [
  {
    id: 'explora',
    media: 'jl-mirador',
    kicker: 'Mapa oficial',
    title: ['Explora', 'Leonida'],
    text: 'Puntos con precisión declarada sobre el póster oficial, capas y rutas personales.',
    to: '/mapa',
    cta: 'Abrir el mapa',
  },
  {
    id: 'personajes',
    media: 'p-lucia',
    kicker: 'Personajes',
    title: ['Conoce a', 'Lucia y Jason'],
    text: 'Protagonistas y personajes presentados por Rockstar, con sus fuentes.',
    to: '/personajes',
    cta: 'Ver personajes',
  },
  {
    id: 'novedades',
    media: 'vc-letrero',
    kicker: 'ATLAS Intelligence',
    title: ['Lo último', 'con fuentes'],
    text: 'Hallazgos con fecha, enlace a la fuente original y estado de verificación.',
    to: '/novedades',
    cta: 'Ver novedades',
  },
] as const;

/** Tarjeta editorial con tres destacados reales. Sin reproducción automática; se cambia con los puntos, las flechas o deslizando. */
export function FeatureCarousel() {
  const [i, setI] = useState(0);
  const start = useRef<number | null>(null);
  const go = (n: number) => setI((n + SLIDES.length) % SLIDES.length);
  const down = (e: PointerEvent) => {
    start.current = e.clientX;
  };
  const up = (e: PointerEvent) => {
    if (start.current === null) return;
    const dx = e.clientX - start.current;
    start.current = null;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
  };
  return (
    <section className="feature" aria-roledescription="carrusel" aria-label="Destacados">
      <div className="feature-stage" onPointerDown={down} onPointerUp={up} onPointerCancel={() => (start.current = null)}>
        {SLIDES.map((s, n) => (
          <article
            key={s.id}
            className={`feature-slide${n === i ? ' is-on' : ''}`}
            aria-roledescription="diapositiva"
            aria-label={`${n + 1} de ${SLIDES.length}`}
            data-testid="feature-slide"
          >
            <Media id={s.media} category="lugares" label={s.kicker} className="feature-img" sizes="(min-width: 1024px) 60vw, 100vw" eager={n === 0} />
            <div className="feature-copy">
              <p className="feature-kicker">{s.kicker}</p>
              <h3 className="feature-title">
                {s.title[0]} <span>{s.title[1]}</span>
              </h3>
              <p className="feature-text">{s.text}</p>
              <Link to={s.to} className="btn btn-sm btn-neon">
                {s.cta} <Icon name="arrow_right" size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>
      <div className="feature-nav">
        <button type="button" className="feature-arrow" aria-label="Destacado anterior" onClick={() => go(i - 1)}>
          <Icon name="arrow_left" size={20} />
        </button>
        <div className="feature-dots">
          {SLIDES.map((s, n) => (
            <button key={s.id} type="button" className={`feature-dot${n === i ? ' is-on' : ''}`} aria-label={`Ver destacado ${n + 1}: ${s.kicker}`} aria-current={n === i ? 'true' : undefined} onClick={() => go(n)} />
          ))}
        </div>
        <button type="button" className="feature-arrow" aria-label="Destacado siguiente" onClick={() => go(i + 1)}>
          <Icon name="arrow_right" size={20} />
        </button>
      </div>
    </section>
  );
}

const QUICK = [
  { to: '/mapa', label: 'Mapa', icon: 'map', media: 'vc-marina', tone: 'cyan' },
  { to: '/vehiculos', label: 'Vehículos', icon: 'car', media: 'vc-car-meet', tone: 'magenta' },
  { to: '/mis-rutas', label: 'Mis rutas', icon: 'route', media: 'mk-carretera', tone: 'cyan' },
  { to: '/mi-espacio', label: 'Mi espacio', icon: 'user', media: 'ue-safehouse', tone: 'magenta' },
];

/** Cuatro accesos visuales con imágenes oficiales. */
export function QuickAccess() {
  return (
    <nav className="quick" aria-label="Accesos rápidos">
      {QUICK.map((q) => (
        <Link key={q.to} to={q.to} className={`quick-card quick-${q.tone}`}>
          <Media id={q.media} category="lugares" label={q.label} className="quick-img" sizes="(min-width: 1024px) 25vw, 50vw" />
          <span className="quick-ico" aria-hidden="true">
            <Icon name={q.icon} size={30} />
          </span>
          <span className="quick-label">{q.label}</span>
        </Link>
      ))}
    </nav>
  );
}
