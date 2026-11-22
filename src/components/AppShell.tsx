import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router';
import { Wordmark } from './Logo';
import { Icon } from './Icon';
import { InstallButton, OfflineBanner, UpdatePrompt } from './PwaControls';
import { usingOverride } from '../data';

const NAV = [
  { to: '/', label: 'Inicio', icon: 'home', end: true },
  { to: '/mapa', label: 'Mapa', icon: 'map' },
  { to: '/dinero', label: 'Dinero y glitches', icon: 'cash' },
  { to: '/armas', label: 'Armas', icon: 'target' },
  { to: '/vehiculos', label: 'Vehículos', icon: 'car' },
  { to: '/negocios', label: 'Negocios y propiedades', icon: 'store' },
  { to: '/rutas', label: 'Rutas y tutoriales', icon: 'route' },
  { to: '/lugares', label: 'Lugares', icon: 'pin' },
  { to: '/personajes', label: 'Personajes', icon: 'user' },
  { to: '/intel', label: 'ATLAS Intelligence', icon: 'eye' },
  { to: '/galeria', label: 'Galería', icon: 'image' },
  { to: '/mi-partida', label: 'Mi partida', icon: 'star' },
  { to: '/fuentes', label: 'Fuentes y cambios', icon: 'book' },
];

const BOTTOM = [
  { to: '/', label: 'Inicio', icon: 'home', end: true },
  { to: '/mapa', label: 'Mapa', icon: 'map' },
  { to: '/dinero', label: 'Dinero', icon: 'cash' },
  { to: '/mi-partida', label: 'Mi partida', icon: 'star' },
];

function HeaderSearch() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const loc = useLocation();
  const [q, setQ] = useState(loc.pathname === '/buscar' ? (params.get('q') ?? '') : '');
  useEffect(() => {
    if (loc.pathname === '/buscar') setQ(params.get('q') ?? '');
  }, [loc.pathname, params]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    nav(`/buscar?q=${encodeURIComponent(q.trim())}`);
  };
  return (
    <form className="header-search" role="search" onSubmit={submit}>
      <label htmlFor="global-search" className="sr-only">
        Buscar en LEONIDA ATLAS
      </label>
      <Icon name="search" size={18} />
      <input
        id="global-search"
        type="search"
        placeholder="Busca armas, autos, lugares…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          if (loc.pathname === '/buscar') nav(`/buscar?q=${encodeURIComponent(e.target.value)}`, { replace: true });
        }}
        autoComplete="off"
        enterKeyHint="search"
      />
    </form>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const loc = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const first = useRef(true);

  useEffect(() => {
    setMenu(false);
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [loc.pathname]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  return (
    <div className="shell">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <header className="topbar">
        <Link to="/" className="brand" aria-label="LEONIDA ATLAS, inicio">
          <Wordmark />
        </Link>
        <HeaderSearch />
        <div className="topbar-actions">
          <InstallButton />
        </div>
      </header>
      <OfflineBanner />
      {usingOverride && (
        <div className="override-bar" role="status">
          Vista previa local de contenido editado. <Link to="/editor">Administrar</Link>
        </div>
      )}
      <div className="layout">
        <nav className="sidebar" aria-label="Secciones">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end} className="side-link">
                  <Icon name={n.icon} size={18} /> {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main id="contenido" ref={mainRef} tabIndex={-1} className="main">
          {children}
          <footer className="site-footer">
            <p>
              <strong>Guía independiente de fans. Sin afiliación con Rockstar Games.</strong> GTA VI y sus contenidos son de sus respectivos titulares. Imágenes oficiales © Rockstar
              Games, usadas sin fines comerciales con atribución.
            </p>
            <p>
              <Link to="/legal">Aviso legal y créditos</Link> · <Link to="/fuentes">Fuentes y cambios</Link> · <Link to="/editor">Herramientas del editor</Link>
            </p>
          </footer>
        </main>
      </div>
      <nav className="bottombar" aria-label="Navegación principal">
        {BOTTOM.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className="bottom-link">
            <Icon name={n.icon} size={22} />
            <span>{n.label}</span>
          </NavLink>
        ))}
        <button type="button" className="bottom-link" aria-expanded={menu} aria-controls="menu-sheet" onClick={() => setMenu((m) => !m)}>
          <Icon name={menu ? 'close' : 'menu'} size={22} />
          <span>Menú</span>
        </button>
      </nav>
      {menu && (
        <div className="sheet-backdrop" onClick={() => setMenu(false)}>
          <nav id="menu-sheet" className="sheet" aria-label="Todas las secciones" onClick={(e) => e.stopPropagation()}>
            <ul>
              {NAV.map((n) => (
                <li key={n.to}>
                  <NavLink to={n.to} end={n.end} className="sheet-link">
                    <Icon name={n.icon} size={20} /> {n.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <InstallButton className="btn btn-cta" />
          </nav>
        </div>
      )}
      <UpdatePrompt />
    </div>
  );
}
