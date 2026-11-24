import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router';
import { Wordmark } from './Logo';
import { Icon } from './Icon';
import { InstallButton, OfflineBanner, UpdatePrompt } from './PwaControls';
import { changelog, usingOverride } from '../data';
import { NAV_GROUPS, TABS, tabOf } from '../lib/nav';

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
  const loc = useLocation();
  const active = tabOf(loc.pathname);
  const mainRef = useRef<HTMLElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [loc.pathname]);

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
        <Link to="/fuentes" className="version-chip" aria-label={`v${changelog[0].version}, ver registro de cambios`}>
          v{changelog[0].version}
        </Link>
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
          {NAV_GROUPS.map((g) => (
            <div key={g.tab} className={`side-group${g.tab === active ? ' is-current' : ''}`}>
              <p className="side-title">{g.title}</p>
              <ul>
                {g.links.map((n) => (
                  <li key={n.to}>
                    <NavLink to={n.to} end={n.end} className="side-link">
                      <Icon name={n.icon} size={18} /> {n.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
        {TABS.map((t) => {
          const on = t.id === active;
          return (
            <Link key={t.id} to={t.to} className={`bottom-link${on ? ' active' : ''}`} aria-current={on ? (loc.pathname === t.to ? 'page' : 'true') : undefined} data-tab={t.id}>
              <span className="bottom-ico" aria-hidden="true">
                <Icon name={t.icon} size={22} />
              </span>
              <span>{t.label}</span>
            </Link>
          );
        })}
      </nav>
      <UpdatePrompt />
    </div>
  );
}
