import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { changelog, entries, entriesBy, entryPath } from '../data';
import { CATEGORY_META, CATEGORY_ORDER, GAME_RELEASE, LAST_REVIEW, STATUS_META } from '../data/meta';
import { Seo } from '../components/Seo';
import { Icon } from '../components/Icon';
import { ItemCard } from '../components/ItemCard';
import { Media } from '../components/Media';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { formatDate, money } from '../lib/calc';
import { LogoMark } from '../components/Logo';

function Hero() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  return (
    <section className="hero" aria-labelledby="hero-h">
      <svg className="hero-art" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="h-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#140a2e" />
            <stop offset=".55" stopColor="#5b1a5e" />
            <stop offset=".8" stopColor="#ff3ea5" />
            <stop offset="1" stopColor="#ffb86b" />
          </linearGradient>
          <linearGradient id="h-sun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe08a" />
            <stop offset="1" stopColor="#ff3ea5" />
          </linearGradient>
          <linearGradient id="h-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0e3a52" />
            <stop offset="1" stopColor="#0b0d14" />
          </linearGradient>
        </defs>
        <rect width="1200" height="600" fill="url(#h-sky)" />
        <circle cx="820" cy="380" r="150" fill="url(#h-sun)" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x="600" y={330 + i * 16} width="460" height={4 + i} fill="#5b1a5e" opacity=".9" />
        ))}
        <g fill="#0b0d14">
          <path d="M0 430h60v-90h30v-40h40v130h30v-160h50v160h20v-110h45v110h30v-60h25v60h35v-200h55v200h25v-130h40v130h30v-80h30v80h40v-150h45v150h40v-60h40v60h35v-120h35v120h40v-90h30v90h50v-40h60v40h45v-170h40v170h55v-70h45v70h60V600H0z" />
          <path d="M1015 430c-6-70-2-130 12-190M1010 300c-30-20-60-18-85-6M1022 260c20-28 52-38 84-30M1016 280c-34-4-58 10-70 30M1024 250c-6-26 4-50 26-64" stroke="#0b0d14" strokeWidth="9" fill="none" strokeLinecap="round" />
        </g>
        <rect y="430" width="1200" height="170" fill="url(#h-sea)" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x={680 + (i % 2) * 40} y={450 + i * 18} width={300 - i * 30} height="3" fill="#ff3ea5" opacity={0.5 - i * 0.06} />
        ))}
      </svg>
      <div className="hero-inner">
        <p className="eyebrow">
          <LogoMark size={22} /> Guía independiente · GTA VI · Español de México
        </p>
        <h1 id="hero-h">
          Leonida, <span className="grad">con fuentes</span>.
        </h1>
        <p className="hero-lead">
          Mapa oficial con puntos de precisión declarada, métodos de dinero con pago y evidencia separados, armas, vehículos y negocios. Cada dato dice de dónde sale.
        </p>
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
          <Link to="/mapa" className="btn btn-ghost">
            <Icon name="map" size={18} /> Abrir mapa
          </Link>
        </div>
        <p className="hero-facts small">
          Disponible desde el {formatDate(GAME_RELEASE)} en PS5 y Xbox Series X|S · Última revisión de la guía: {formatDate(LAST_REVIEW)}
        </p>
      </div>
    </section>
  );
}

export function Home() {
  const regions = entriesBy('lugares').filter((e) => !e.subzone);
  const bestMoney = entriesBy('dinero')
    .filter((e) => e.reward?.amount && e.status === 'contrastado')
    .sort((a, b) => (b.reward!.amount!.max ?? 0) - (a.reward!.amount!.max ?? 0));
  const counts = entries.reduce<Record<string, number>>((acc, e) => ((acc[e.status] = (acc[e.status] ?? 0) + 1), acc), {});
  const latest = changelog[0];
  return (
    <>
      <Seo title="LEONIDA ATLAS" description="Guía independiente de GTA VI en español de México: mapa oficial, dinero, armas, vehículos y negocios con fuentes verificables." />
      <Hero />

      <section className="section" aria-labelledby="cat-h">
        <h2 id="cat-h" className="section-title">
          Explora la guía
        </h2>
        <div className="cat-grid">
          {CATEGORY_ORDER.map((c) => (
            <Link key={c} to={CATEGORY_META[c].path} className="cat-tile">
              <Icon name={CATEGORY_META[c].icon} size={26} />
              <span className="cat-name">{CATEGORY_META[c].label}</span>
              <span className="cat-desc">{CATEGORY_META[c].description}</span>
              <span className="cat-count">{entriesBy(c).length} fichas</span>
            </Link>
          ))}
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

      <section className="section" aria-labelledby="reg-h">
        <div className="section-head">
          <h2 id="reg-h" className="section-title">
            Las 6 regiones de Leonida
          </h2>
          <Link to="/lugares" className="link-more">
            Ver todos los lugares →
          </Link>
        </div>
        <div className="region-strip">
          {regions.map((r, i) => (
            <Link key={r.id} to={entryPath(r)} className="region-tile">
              <Media id={r.images[0]} category="lugares" label={r.name} sizes="(min-width: 1024px) 30vw, 80vw" eager={i < 2} />
              <span className="region-name">{r.name}</span>
            </Link>
          ))}
        </div>
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
          <h2 id="news-h">Novedades verificadas</h2>
          <ul className="news-list">
            <li>
              <strong>{formatDate(GAME_RELEASE)}</strong> — Rockstar confirma el lanzamiento mundial en PS5 y Xbox Series X|S. <EvidenceBadge status="oficial" compact />
            </li>
            <li>
              <strong>{formatDate(latest.date)}</strong> — {latest.title}: {latest.items[0]}
            </li>
          </ul>
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
            <Link to="/intel" className="btn btn-sm">
              Novedades de ATLAS INTELLIGENCE
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
