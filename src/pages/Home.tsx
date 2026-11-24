import { Link } from 'react-router';
import { changelog, entries, entriesBy, entryPath } from '../data';
import { CATEGORY_META, CATEGORY_ORDER, GAME_RELEASE, STATUS_META } from '../data/meta';
import { Seo } from '../components/Seo';
import { Icon } from '../components/Icon';
import { ItemCard } from '../components/ItemCard';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { formatDate, money } from '../lib/calc';
import { CineBanner, ExplorerSearch, NewsPhotos, ProgressPanel, RegionCarousel, VisualCards } from '../components/ExploreHero';
import { NAV_GROUPS } from '../lib/nav';
import { LatestIntel } from '../components/LatestIntel';
import type { Status } from '../data/schema';

const EVIDENCE_ORDER: Status[] = ['oficial', 'comprobado', 'contrastado', 'reportado', 'pendiente', 'obsoleto'];

export function Home() {
  const bestMoney = entriesBy('dinero')
    .filter((e) => e.reward?.amount && e.status === 'contrastado')
    .sort((a, b) => (b.reward!.amount!.max ?? 0) - (a.reward!.amount!.max ?? 0));
  const counts = entries.reduce<Record<string, number>>((acc, e) => ((acc[e.status] = (acc[e.status] ?? 0) + 1), acc), {});
  const latest = changelog[0];

  return (
    <>
      <Seo title="LEONIDA ATLAS" description="Guía independiente de GTA VI en español de México: mapa oficial, dinero, armas, vehículos y negocios con fuentes verificables." />
      <CineBanner />
      <RegionCarousel />
      <VisualCards />
      <NewsPhotos />
      <ProgressPanel />
      <ExplorerSearch />

      <section className="section" aria-labelledby="cat-h">
        <h2 id="cat-h" className="section-title">
          Explora la guía
        </h2>
        <p className="muted small">Cada categoría muestra cuántas fichas tiene y cómo se reparte su evidencia, de oficial a pendiente.</p>
        <div className="cat-grid cat-grid-visual">
          {CATEGORY_ORDER.map((c) => {
            const list = entriesBy(c);
            const parts = EVIDENCE_ORDER.map((st) => [st, list.filter((e) => e.status === st).length] as const).filter(([, n]) => n > 0);
            return (
              <Link key={c} to={CATEGORY_META[c].path} className={`cat-tile cat-${c}`}>
                <span className="cat-ico" aria-hidden="true">
                  <Icon name={CATEGORY_META[c].icon} size={24} />
                </span>
                <span className="cat-name">{CATEGORY_META[c].label}</span>
                <span className="cat-desc">{CATEGORY_META[c].description}</span>
                <span className="cat-count">{list.length} fichas</span>
                {parts.length > 0 && (
                  <span className="ev-bar" aria-hidden="true">
                    {parts.map(([st, n]) => (
                      <span key={st} className={`ev-seg ev-${st}`} style={{ flexGrow: n }} />
                    ))}
                  </span>
                )}
                <span className="sr-only">Evidencia: {parts.map(([st, n]) => `${n} ${STATUS_META[st].label.toLowerCase()}`).join(', ')}.</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section" aria-labelledby="tools-h">
        <h2 id="tools-h" className="section-title">
          Herramientas
        </h2>
        <div className="cat-grid">
          {[
            { to: '/trucos', icon: 'gamepad', name: 'Trucos y códigos', desc: 'Secuencias para PS5 y Xbox, requisitos y consecuencias.' },
            { to: '/mis-rutas', icon: 'flag', name: 'Mis rutas', desc: 'Arma recorridos con puntos documentados del mapa y marca lo visitado.' },
            { to: '/comparar-vehiculos', icon: 'car', name: 'Comparar vehículos', desc: 'Registro, venta y rastreador con evidencia; guarda tu garaje.' },
            { to: '/equipamiento', icon: 'layers', name: 'Equipamiento de armas', desc: 'Arma tu carga con las reglas documentadas y compártela.' },
            { to: '/consola', icon: 'sliders', name: 'Ajustes de consola', desc: 'Qué se puede ajustar en PS5, PS5 Pro y Xbox Series X|S.' },
            { to: '/mi-espacio', icon: 'star', name: 'Mi espacio', desc: 'Progreso, fotos, encontrados y pendientes en tu teléfono.' },
          ].map((t) => (
            <Link key={t.to} to={t.to} className="cat-tile">
              <Icon name={t.icon} size={26} />
              <span className="cat-name">{t.name}</span>
              <span className="cat-desc">{t.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="all-h">
        <h2 id="all-h" className="section-title">
          Todas las secciones
        </h2>
        <nav aria-label="Todas las secciones" className="all-sections">
          {NAV_GROUPS.map((g) => (
            <div key={g.tab} className={`all-group all-${g.tab}`}>
              <h3 className="all-title">{g.title}</h3>
              <ul>
                {g.links
                  .filter((l) => l.to !== '/')
                  .map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="all-link">
                        <Icon name={l.icon} size={18} /> {l.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </nav>
      </section>


      <section className="section two-col">
        <div className="panel" aria-labelledby="best-h">
          <h2 id="best-h">Mejores métodos contrastados</h2>
          <p className="muted small">Solo métodos con dos guías independientes que coinciden. Pago bruto reportado, no comprobado por nosotros.</p>
          <ol className="rank-list">
            {bestMoney.map((e) => (
              <li key={e.id}>
                <Link to={entryPath(e)}>{e.name}</Link>
                <span className="rank-meta">
                  {e.chapter} · {e.reward!.amount!.min === e.reward!.amount!.max ? `${money(e.reward!.amount!.min)}+` : `${money(e.reward!.amount!.min)}–${money(e.reward!.amount!.max)}`}
                </span>
              </li>
            ))}
          </ol>
          <Link to="/dinero" className="btn btn-sm">
            <Icon name="calc" size={16} /> Calcular mis ganancias
          </Link>
        </div>
        <div className="panel" aria-labelledby="news-h">
          <h2 id="news-h">Novedades</h2>
          <ul className="news-list">
            <li>
              <strong>{formatDate(GAME_RELEASE)}</strong> — Rockstar confirma el lanzamiento mundial en PS5 y Xbox Series X|S. <EvidenceBadge status="oficial" compact />
            </li>
            <li>
              <strong>{formatDate(latest.date)}</strong> — {latest.title}: {latest.items[0]}
            </li>
            <LatestIntel />
          </ul>
          <p>
            <Link to="/novedades" className="btn btn-sm">
              <Icon name="eye" size={16} /> Ver todas las novedades
            </Link>
          </p>
          <h3 className="h-sub">Estado de la evidencia</h3>
          <ul className="evidence-counts">
            {Object.entries(counts).map(([s, n]) => (
              <li key={s}>
                <EvidenceBadge status={s as keyof typeof STATUS_META} compact /> {n}
              </li>
            ))}
          </ul>
          <Link to="/fuentes" className="link-more">
            Ver fuentes y registro de cambios →
          </Link>
          <p>
            <Link to="/intel" className="link-more">
              Panel completo de ATLAS INTELLIGENCE →
            </Link>
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="start-h">
        <h2 id="start-h" className="section-title">
          Empieza aquí
        </h2>
        <div className="card-grid">
          {['rut-empieza-aqui', 'din-regla-capitulo-1', 'rut-dinero-por-capitulo', 'rut-ediciones'].map((id) => {
            const e = entries.find((x) => x.id === id);
            return e ? <ItemCard key={id} entry={e} /> : null;
          })}
        </div>
      </section>
    </>
  );
}
