import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { findings, intelSources, lastRun } from '../data/intel';
import { Media } from '../components/Media';
import { changelog } from '../data';
import type { Finding, FindingCategory, FindingStatus, IntelSource, Platform } from '../intel/schema';
import { STATUS_HELP, STATUS_LABEL } from '../intel/status';
import { PLATFORM_LABEL } from '../intel/ask';
import { Seo } from '../components/Seo';
import { Icon } from '../components/Icon';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/IntelStatus';
import { findingDate } from '../components/LatestIntel';
import { formatDate } from '../lib/calc';
import { IntelPage } from './IntelPage';

const STATUS_ORDER: FindingStatus[] = [
  'anuncio_oficial',
  'comprobado_en_version',
  'contrastado',
  'reportado',
  'nuevo_sin_verificar',
  'pendiente_revalidacion',
  'parcheado',
  'refutado',
];
const PLATFORMS: Platform[] = ['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'];
const PAGE = 12;

const ACCESS = [
  { seccion: 'observacion', icon: 'filter', name: 'En observación', desc: 'Hallazgos con estado por plataforma, filtros y avisos de riesgo.' },
  { seccion: 'parches', icon: 'layers', name: 'Parches', desc: 'Versiones del juego y hallazgos que hay que volver a probar.' },
  { seccion: 'preguntar', icon: 'search', name: 'Pregúntale a ATLAS', desc: 'Respuestas solo con fichas y fuentes; si no hay prueba, lo dice.' },
  { seccion: 'enviar', icon: 'upload', name: 'Enviar hallazgo', desc: 'Comparte un enlace; entra a una cola de revisión, nunca se publica solo.' },
  { seccion: 'bitacora', icon: 'note', name: 'Bitácora', desc: 'Cada investigación real: fecha, fuentes consultadas y resultados.' },
];

const day = (iso: string) => formatDate(iso.slice(0, 10));

const CAT_ICON: Partial<Record<FindingCategory, string>> = {
  glitch: 'alert',
  dinero: 'cash',
  truco: 'gamepad',
  arma: 'target',
  vehiculo: 'car',
  coleccionable: 'grid',
  ropa_joyeria: 'star',
  mision: 'flag',
  parche: 'layers',
  noticia: 'news',
  configuracion: 'sliders',
  ubicacion: 'pin',
  personaje: 'user',
};

/** Miniatura ilustrada (original) por categoría: los hallazgos externos no tienen imagen con derechos de uso. */
function Thumb({ f }: { f: Finding }) {
  return (
    <span className={`thumb thumb-${f.category}`} aria-hidden="true">
      <Icon name={CAT_ICON[f.category] ?? 'note'} size={26} />
    </span>
  );
}

// Canales de ATLAS WATCH: agrupan las fuentes registradas por tipo. El estado sale de intel/sources.json y de la última corrida real.
const CHANNELS: { id: string; icon: string; name: string; desc: string; match: (s: IntelSource) => boolean }[] = [
  { id: 'web', icon: 'globe', name: 'Web y medios', desc: 'Página oficial, guías y medios', match: (s) => s.kind === 'rss' && s.tier !== 'comunidad' },
  { id: 'oficial', icon: 'shield', name: 'Rockstar Games', desc: 'Página oficial de GTA VI', match: (s) => s.kind === 'page_watch' },
  { id: 'video', icon: 'play', name: 'Video', desc: 'YouTube (canal oficial y búsqueda)', match: (s) => s.kind === 'youtube_rss' || s.kind === 'api' },
  { id: 'comunidad', icon: 'people', name: 'Comunidad', desc: 'Foros y redes sociales', match: (s) => s.tier === 'comunidad' },
];
const IMAGES = ['vc-skyline-noche', 'jl-mirador', 'vc-marina', 'keys-bar'];

/** Portada de la pestaña Novedades: línea de tiempo de ATLAS INTELLIGENCE con fuente original, fecha y estado. */
export function NewsPage() {
  const [params, setParams] = useSearchParams();
  // Compatibilidad: los enlaces antiguos /novedades?seccion=… siguen abriendo el panel de ATLAS INTELLIGENCE.
  const legacy = params.get('seccion');
  const estado = params.get('estado') as FindingStatus | null;
  const plataforma = params.get('plataforma') as Platform | null;
  const shown = Math.max(PAGE, Number(params.get('ver')) || PAGE);

  const base = useMemo(() => findings.filter((f) => f.classifier !== 'migracion').sort((a, b) => findingDate(b).localeCompare(findingDate(a))), []);
  const counts = useMemo(() => base.reduce<Partial<Record<FindingStatus, number>>>((acc, f) => ((acc[f.status] = (acc[f.status] ?? 0) + 1), acc), {}), [base]);
  const list = base.filter((f) => (!estado || f.status === estado) && (!plataforma || f.platforms.includes(plataforma)));
  const unverified = (counts.nuevo_sin_verificar ?? 0) + (counts.reportado ?? 0);
  const pending = base.filter((f) => f.status === 'nuevo_sin_verificar' || f.status === 'reportado').slice(0, 3);

  if (legacy) return <IntelPage />;

  // Igual que setQueryParam: parte de la URL real para no «revivir» filtros si se pulsan dos muy rápido.
  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setParams(next, { replace: true, preventScrollReset: true });
  };
  const set = (k: string, v: string | null) => update({ [k]: v, ver: null });

  // Agrupa por día para la línea de tiempo.
  const groups: [string, typeof list][] = [];
  for (const f of list.slice(0, shown)) {
    const d = findingDate(f).slice(0, 10);
    const g = groups[groups.length - 1];
    if (g && g[0] === d) g[1].push(f);
    else groups.push([d, [f]]);
  }

  return (
    <div className="page">
      <Seo title="Novedades" description="Qué cambió en GTA VI según las fuentes vigiladas por ATLAS INTELLIGENCE, con fecha real de investigación." />
      <header className="hub-head hub-novedades">
        <p className="eyebrow">
          <Icon name="eye" size={18} /> ATLAS INTELLIGENCE
        </p>
        <h1>Novedades</h1>
        <p className="lead">Lo último que detectaron las fuentes vigiladas, con enlace a la publicación original, su fecha y el estado de verificación de cada hallazgo.</p>
        <dl className="hub-stats" data-testid="news-stats">
          <div>
            <dt>Última investigación real</dt>
            <dd>
              {lastRun ? (
                <>
                  {day(lastRun.finishedAt)} <span className="dd-sub">{lastRun.finishedAt.slice(11, 16)} UTC</span>
                </>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt>Hallazgos</dt>
            <dd>{base.length}</dd>
          </div>
          <div>
            <dt>Fuentes vigiladas</dt>
            <dd>{intelSources.length}</dd>
          </div>
        </dl>
      </header>

      <p className="notice notice-warn" role="note">
        <Icon name="alert" size={18} />
        <span>
          <strong>{unverified} hallazgos aún no están verificados</strong> («Nuevo sin verificar» o «Reportado»). Que aparezcan aquí no significa que sean ciertos: nadie los ha probado en el juego para
          LEONIDA ATLAS.
        </span>
      </p>

      <section className="section watch" aria-labelledby="watch-h">
        <div className="block-head">
          <span className="block-ico" aria-hidden="true">
            <Icon name="eye" size={26} />
          </span>
          <div>
            <h2 id="watch-h" className="block-title">
              Fuentes <span>consultadas</span>
            </h2>
            <p className="block-sub">Estado real de cada canal en la última investigación ({lastRun ? day(lastRun.finishedAt) : 'sin corridas'}).</p>
          </div>
        </div>
        <ul className="watch-grid">
          {CHANNELS.map((c) => {
            const list = intelSources.filter(c.match);
            const active = list.filter((s) => s.enabled);
            const ok = active.filter((s) => lastRun?.sources.find((r) => r.sourceId === s.id)?.ok);
            return (
              <li key={c.id} className={`watch-card${active.length ? ' is-on' : ''}`} data-testid="watch-channel">
                <Icon name={c.icon} size={28} />
                <span className="watch-name">{c.name}</span>
                <span className="watch-desc">{c.desc}</span>
                <span className={`watch-state${active.length ? ' on' : ''}`}>
                  {active.length ? `${ok.length} de ${list.length} consultadas` : list.length ? 'Desactivado' : 'Sin conectar'}
                </span>
              </li>
            );
          })}
        </ul>
        <details className="watch-details small">
          <summary>Ver las {intelSources.length} fuentes y por qué algunas están desactivadas</summary>
          <ul>
            {intelSources.map((s) => {
              const r = lastRun?.sources.find((x) => x.sourceId === s.id);
              return (
                <li key={s.id}>
                  <strong>{s.name}</strong> — {s.enabled ? (r ? (r.ok ? `consultada: HTTP ${r.httpStatus}, ${r.items} elementos` : `error: ${r.error ?? 'sin respuesta'}`) : 'activa, sin resultado en la última corrida') : `desactivada. ${s.disabledReason ?? ''}`}
                </li>
              );
            })}
          </ul>
        </details>
        <p className="small muted">
          <strong>ATLAS WATCH</strong> (vigilancia de canales de video y redes sociales) es una propuesta para una entrega posterior: hoy no hay canales de video ni cuentas de redes sociales conectados.
        </p>
      </section>

      <section className="section pipeline" aria-labelledby="pipe-h">
        <div className="pipeline-head">
          <span className="block-ico block-ico-cyan" aria-hidden="true">
            <Icon name="scan" size={26} />
          </span>
          <div>
            <h2 id="pipe-h" className="block-title">
              ATLAS <span>Intelligence</span>
            </h2>
            <p className="block-sub">Cómo llega un hallazgo a esta página. Nada se publica sin revisión humana.</p>
          </div>
        </div>
        <ol className="pipeline-steps">
          <li>
            <Icon name="search" size={24} />
            <strong>Detecta</strong>
            <span>lee las fuentes activas</span>
          </li>
          <li>
            <Icon name="layers" size={24} />
            <strong>Clasifica</strong>
            <span>categoría y plataformas</span>
          </li>
          <li>
            <Icon name="shield" size={24} />
            <strong>Verifica</strong>
            <span>cuenta fuentes independientes</span>
          </li>
          <li>
            <Icon name="doc" size={24} />
            <strong>Propone</strong>
            <span>cola de revisión editorial</span>
          </li>
        </ol>
      </section>

      <section className="section review" aria-labelledby="rev-h">
        <div className="block-head">
          <span className="block-ico" aria-hidden="true">
            <Icon name="edit" size={26} />
          </span>
          <div>
            <h2 id="rev-h" className="block-title">
              Por <span>verificar</span>
            </h2>
            <p className="block-sub">Los hallazgos más recientes que todavía nadie ha comprobado.</p>
          </div>
          <Link to="/intel?seccion=observacion" className="btn btn-sm block-more">
            Ver todo <Icon name="arrow_right" size={16} />
          </Link>
        </div>
        <ul className="review-list">
          {pending.map((f) => (
            <li key={f.id} className="review-item" data-testid="review-item">
              <Thumb f={f} />
              <div className="review-body">
                <p className="review-title">{f.title}</p>
                <p className="small muted review-meta">
                  <a href={f.sources[0].url} target="_blank" rel="noopener noreferrer nofollow">
                    {f.sources[0].publisher}
                  </a>{' '}
                  · <time dateTime={findingDate(f).slice(0, 10)}>{day(findingDate(f))}</time>
                </p>
              </div>
              <StatusBadge status={f.status} />
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="chg-h">
        <div className="block-head">
          <span className="block-ico" aria-hidden="true">
            <Icon name="news" size={26} />
          </span>
          <div>
            <h2 id="chg-h" className="block-title">
              Novedades de <span>LEONIDA ATLAS</span>
            </h2>
            <p className="block-sub">Cambios publicados en la guía.</p>
          </div>
        </div>
        <ul className="release-list">
          {changelog.slice(0, 3).map((c, n) => (
            <li key={c.version}>
              <Link to="/fuentes" className="release-card">
                <Media id={IMAGES[n % IMAGES.length]} category="lugares" label={c.title} className="release-img" sizes="(min-width: 768px) 240px, 40vw" />
                <span className="release-body">
                  <span className="release-meta">
                    <span className="chip chip-static chip-version">v{c.version}</span>
                    <time dateTime={c.date}>{formatDate(c.date)}</time>
                  </span>
                  <span className="release-title">{c.title}</span>
                </span>
                <Icon name="arrow_right" size={20} className="release-go" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="flt-h" className="news-filters">
        <h2 id="flt-h" className="sr-only">
          Filtros
        </h2>
        <div className="chips" role="group" aria-label="Estado de verificación">
          <button type="button" className={`chip${!estado ? ' is-on' : ''}`} aria-pressed={!estado} onClick={() => set('estado', null)}>
            Todos ({base.length})
          </button>
          {STATUS_ORDER.filter((s) => counts[s]).map((s) => (
            <button key={s} type="button" className={`chip chip-status intel-${s}${estado === s ? ' is-on' : ''}`} aria-pressed={estado === s} title={STATUS_HELP[s]} onClick={() => set('estado', estado === s ? null : s)}>
              <span className="badge-dot" aria-hidden="true" />
              {STATUS_LABEL[s]} ({counts[s]})
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Plataforma">
          {PLATFORMS.map((p) => (
            <button key={p} type="button" className={`chip${plataforma === p ? ' is-on' : ''}`} aria-pressed={plataforma === p} onClick={() => set('plataforma', plataforma === p ? null : p)}>
              {PLATFORM_LABEL[p]}
            </button>
          ))}
        </div>
        <p className="small muted" data-testid="news-count" aria-live="polite">
          {list.length === base.length ? `${list.length} hallazgos, del más reciente al más antiguo.` : `${list.length} de ${base.length} hallazgos con los filtros elegidos.`}
          {plataforma && ' Solo se cuentan los que la fuente atribuye a esa plataforma.'}
        </p>
      </section>

      <section aria-labelledby="tl-h">
        <h2 id="tl-h" className="section-title">
          Línea de tiempo
        </h2>
        {list.length === 0 ? (
          <EmptyState title="Sin hallazgos con estos filtros">Quita un filtro para ver más resultados.</EmptyState>
        ) : (
          <ol className="timeline">
            {groups.map(([d, items]) => (
              <li key={d} className="tl-day">
                <h3 className="tl-date">
                  <time dateTime={d}>{formatDate(d)}</time>
                </h3>
                <ul className="tl-items">
                  {items.map((f) => (
                    <li key={f.id} className={`tl-item tl-${f.status}`} data-testid="news-item">
                      <div className="tl-meta">
                        <Thumb f={f} />
                        <StatusBadge status={f.status} />
                        {f.platforms.length > 0 && <span className="chip chip-static">{f.platforms.map((p) => PLATFORM_LABEL[p]).join(' · ')}</span>}
                      </div>
                      <p className="tl-title">{f.title}</p>
                      {f.summary && <p className="small tl-summary">{f.summary}</p>}
                      <p className="small tl-source">
                        Fuente original:{' '}
                        {f.sources.slice(0, 2).map((s, i) => (
                          <span key={s.url}>
                            {i > 0 && ' · '}
                            <a href={s.url} target="_blank" rel="noopener noreferrer nofollow">
                              {s.publisher}
                              <Icon name="external" size={14} />
                            </a>
                            {s.publishedAt ? ` (publicado ${day(s.publishedAt)})` : ''}
                          </span>
                        ))}
                        {f.sources.length > 2 && ` y ${f.sources.length - 2} más`}
                      </p>
                      <p className="muted small">Detectado por ATLAS el {day(f.firstDiscoveredAt)} · prueba en juego: {f.lastInGameTestAt ? day(f.lastInGameTestAt) : 'ninguna registrada'}</p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
        {list.length > shown && (
          <button type="button" className="btn" onClick={() => update({ ver: String(shown + PAGE) })}>
            Ver más ({list.length - shown} restantes)
          </button>
        )}
      </section>

      <section aria-labelledby="acc-h" className="section">
        <h2 id="acc-h" className="section-title">
          Panel de ATLAS INTELLIGENCE
        </h2>
        <div className="cat-grid">
          {ACCESS.map((a) => (
            <Link key={a.seccion} to={`/intel?seccion=${a.seccion}`} className="cat-tile">
              <span className="cat-ico" aria-hidden="true">
                <Icon name={a.icon} size={22} />
              </span>
              <span className="cat-name">{a.name}</span>
              <span className="cat-desc">{a.desc}</span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
