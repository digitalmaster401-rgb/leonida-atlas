import { useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { findings, intelSources, lastRun, patches, runs, submissions } from '../data/intel';
import { entries, entryPath } from '../data';
import type { Finding, FindingCategory, FindingStatus, Platform } from '../intel/schema';
import { STATUS_HELP, STATUS_LABEL } from '../intel/status';
import { ask, PLATFORM_LABEL, type AskAnswer } from '../intel/ask';
import { REPORT_URL } from '../data/meta';
import { Seo } from '../components/Seo';
import { Icon } from '../components/Icon';
import { EmptyState } from '../components/EmptyState';
import { formatDate } from '../lib/calc';
import { setQueryParam } from '../lib/query';

const SECTIONS = [
  { id: 'novedades', label: 'Novedades' },
  { id: 'observacion', label: 'En observación' },
  { id: 'parches', label: 'Parches' },
  { id: 'preguntar', label: 'Pregúntale a ATLAS' },
  { id: 'enviar', label: 'Enviar hallazgo' },
  { id: 'bitacora', label: 'Bitácora' },
] as const;
type SectionId = (typeof SECTIONS)[number]['id'];

const CATEGORY_LABEL: Record<FindingCategory, string> = {
  glitch: 'Glitch / bug',
  dinero: 'Dinero',
  truco: 'Truco',
  arma: 'Arma',
  vehiculo: 'Vehículo',
  coleccionable: 'Coleccionable',
  ropa_joyeria: 'Ropa y joyería',
  mision: 'Misión',
  parche: 'Parche',
  noticia: 'Noticia',
  configuracion: 'Configuración',
  otro: 'Otro',
};
const PLATFORMS: Platform[] = ['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'];

const dt = (iso: string | null | undefined) => (iso ? `${formatDate(iso.slice(0, 10))} ${iso.slice(11, 16)} UTC` : '—');

export function StatusBadge({ status }: { status: FindingStatus }) {
  return (
    <span className={`badge intel-${status}`} title={STATUS_HELP[status]}>
      <span className="badge-dot" aria-hidden="true" />
      {STATUS_LABEL[status]}
      <span className="sr-only">. {STATUS_HELP[status]}</span>
    </span>
  );
}

function FindingCard({ f }: { f: Finding }) {
  const s = f.sources[0];
  const plats = Object.entries(f.platformStatus) as [Platform, FindingStatus][];
  return (
    <article className="finding" data-testid="finding" data-category={f.category}>
      <div className="finding-meta">
        <StatusBadge status={f.status} />
        <span className="chip chip-static">{CATEGORY_LABEL[f.category]}</span>
        {f.flags.includes('fuente_oficial') && <span className="chip chip-static chip-edition">Fuente oficial</span>}
        {f.flags.includes('promesa_extraordinaria') && <span className="chip chip-static chip-warn">Promesa extraordinaria</span>}
      </div>
      <h3 className="finding-title">{f.title}</h3>
      {f.summary && <p className="small">{f.summary}</p>}
      {f.claims.length > 0 && (
        <ul className="small finding-claims">
          {f.claims.slice(0, 2).map((c, i) => (
            <li key={i}>
              {c.text}: <q>{c.quote}</q> <span className="muted">(afirmación de la fuente, no comprobada)</span>
            </li>
          ))}
        </ul>
      )}
      <p className="small muted">
        Plataformas: {f.platforms.length ? f.platforms.map((p) => PLATFORM_LABEL[p]).join(', ') : 'no especificadas por la fuente'} · Versión: {f.gameVersion ?? 'no indicada'} ·
        Prueba en juego: {f.lastInGameTestAt ? dt(f.lastInGameTestAt) : 'ninguna registrada'}
      </p>
      {plats.length > 0 && (
        <ul className="platform-status">
          {plats.map(([p, st]) => (
            <li key={p}>
              {PLATFORM_LABEL[p]}: <StatusBadge status={st} />
            </li>
          ))}
        </ul>
      )}
      <p className="small">
        {f.sources.slice(0, 3).map((src, i) => (
          <span key={i}>
            {i > 0 && ' · '}
            <a href={src.url} target="_blank" rel="noopener noreferrer nofollow">
              {src.publisher}
              {src.publishedAt ? `, ${formatDate(src.publishedAt.slice(0, 10))}` : ''}
            </a>
          </span>
        ))}
        {f.sources.length > 3 && ` y ${f.sources.length - 3} más`}
      </p>
      {f.entryIds.length > 0 && (
        <p className="small">
          Ficha relacionada:{' '}
          {f.entryIds.map((id) => {
            const e = entries.find((x) => x.id === id);
            return e ? (
              <Link key={id} to={entryPath(e)}>
                {e.name}
              </Link>
            ) : null;
          })}
        </p>
      )}
      <details className="small">
        <summary>Historial ({f.history.length})</summary>
        <ol className="history">
          {f.history.map((h, i) => (
            <li key={i}>
              {dt(h.at)} — {h.type}
              {h.from || h.to ? `: ${h.from ?? '—'} → ${h.to ?? '—'}` : ''}
              {h.platform ? ` (${PLATFORM_LABEL[h.platform]})` : ''}. {h.reason}
            </li>
          ))}
        </ol>
      </details>
      <span className="muted small">
        Primera detección {dt(f.firstDiscoveredAt)} · fuente consultada {dt(f.lastSourceCheckedAt)} · {s.tier === 'oficial' ? 'oficial' : 'terceros'}
      </span>
    </article>
  );
}

function Novedades() {
  const [win, setWin] = useState<1 | 7 | 30>(7);
  const ref = lastRun ? Date.parse(lastRun.finishedAt) : Date.now();
  const list = findings
    .filter((f) => f.classifier !== 'migracion' && ref - Date.parse(f.firstDiscoveredAt) <= win * 86400000)
    .sort((a, b) => (b.sourcePublishedAt ?? b.firstDiscoveredAt).localeCompare(a.sourcePublishedAt ?? a.firstDiscoveredAt));
  const changed = findings.filter((f) => f.history.some((h) => (h.type === 'estado' || h.type === 'revalidacion') && ref - Date.parse(h.at) <= win * 86400000));
  return (
    <section aria-labelledby="nov-h">
      <h2 id="nov-h" className="sr-only">
        Novedades
      </h2>
      <div className="chips" role="group" aria-label="Periodo">
        {([1, 7, 30] as const).map((w) => (
          <button key={w} type="button" className={`chip${win === w ? ' is-on' : ''}`} aria-pressed={win === w} onClick={() => setWin(w)}>
            {w === 1 ? 'Últimas 24 h' : `Últimos ${w} días`}
          </button>
        ))}
      </div>
      <p className="small muted">
        Periodo contado desde la última investigación real ({dt(lastRun?.finishedAt)}). {list.length} hallazgos nuevos y {changed.length} cambios de estado.
      </p>
      {list.length ? (
        <div className="finding-list">
          {list.slice(0, 40).map((f) => (
            <FindingCard key={f.id} f={f} />
          ))}
        </div>
      ) : (
        <EmptyState icon="search" title="Sin novedades en este periodo">
          La última corrida no encontró elementos nuevos en las fuentes activas.
        </EmptyState>
      )}
    </section>
  );
}

function Observacion() {
  const [params, setParams] = useSearchParams();
  const plat = (params.get('plataforma') ?? '') as Platform | '';
  const cat = (params.get('categoria') ?? '') as FindingCategory | '';
  const st = (params.get('estado') ?? '') as FindingStatus | '';
  const mode = params.get('modo') ?? '';
  const set = (k: string, v: string) => setQueryParam(setParams, k, v);
  const watch = findings.filter((f) => f.category !== 'noticia');
  const list = watch.filter(
    (f) => (!plat || f.platforms.includes(plat)) && (!cat || f.category === cat) && (!st || f.status === st || Object.values(f.platformStatus).includes(st)) && (!mode || f.mode === mode),
  );
  const cats = [...new Set(watch.map((f) => f.category))];
  return (
    <section aria-labelledby="obs-h">
      <h2 id="obs-h" className="sr-only">
        Hallazgos en observación
      </h2>
      <div className="chips" role="group" aria-label="Plataforma">
        {PLATFORMS.map((p) => (
          <button key={p} type="button" className={`chip${plat === p ? ' is-on' : ''}`} aria-pressed={plat === p} onClick={() => set('plataforma', plat === p ? '' : p)}>
            {PLATFORM_LABEL[p]}
          </button>
        ))}
      </div>
      <div className="filter-grid">
        <label>
          Categoría
          <select aria-label="Categoría" value={cat} onChange={(e) => set('categoria', e.target.value)}>
            <option value="">Todas</option>
            {cats.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Estado
          <select aria-label="Estado" value={st} onChange={(e) => set('estado', e.target.value)}>
            <option value="">Todos</option>
            {(Object.keys(STATUS_LABEL) as FindingStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Modo
          <select aria-label="Modo" value={mode} onChange={(e) => set('modo', e.target.value)}>
            <option value="">Todos</option>
            <option value="historia">Historia</option>
            <option value="online">Online</option>
            <option value="sin_confirmar">Sin confirmar</option>
          </select>
        </label>
      </div>
      <p className="result-count" aria-live="polite" data-testid="intel-count">
        {list.length} {list.length === 1 ? 'hallazgo' : 'hallazgos'}
        {plat && ' · solo se muestran los que la fuente atribuye a esa plataforma'}
      </p>
      {list.length ? (
        <div className="finding-list">
          {list.slice(0, 60).map((f) => (
            <FindingCard key={f.id} f={f} />
          ))}
        </div>
      ) : (
        <EmptyState icon="filter" title="Sin hallazgos con estos filtros">
          {plat ? 'Muchas fuentes no indican plataforma; prueba quitar ese filtro.' : 'Prueba con otra categoría o estado.'}
        </EmptyState>
      )}
    </section>
  );
}

function Parches() {
  return (
    <section aria-labelledby="par-h">
      <h2 id="par-h">Parches y versiones</h2>
      <p className="small">
        Solo un parche anunciado por Rockstar activa la revalidación: los hallazgos afectados pasan a «pendiente de revalidación» por plataforma. Un parche nunca marca algo como
        «parcheado» sin una prueba posterior.
      </p>
      {patches.length ? (
        <ul className="patch-list">
          {patches.map((p) => (
            <li key={p.id} className="panel">
              <strong>{p.version ? `Versión ${p.version}` : p.title}</strong> · {dt(p.publishedAt)} · {p.platforms.length ? p.platforms.map((x) => PLATFORM_LABEL[x]).join(', ') : 'plataformas no indicadas'} ·{' '}
              <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">
                fuente {p.official ? 'oficial' : 'no oficial'}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon="alert" title="Ningún parche oficial registrado">
          Las fuentes oficiales vigiladas no han publicado notas de parche desde el lanzamiento (19 nov 2026), según la última corrida.
        </EmptyState>
      )}
    </section>
  );
}

function Preguntar() {
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState<AskAnswer | null>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setAnswer(ask(q, entries, findings, runs, entryPath));
  };
  return (
    <section aria-labelledby="ask-h">
      <h2 id="ask-h">Pregúntale a ATLAS</h2>
      <p className="small muted">Responde solo con fichas y hallazgos registrados, con su fuente, fecha y certeza. No inventa ni investiga en tiempo real.</p>
      <form className="ask-form" onSubmit={submit}>
        <label htmlFor="ask-q" className="sr-only">
          Tu pregunta
        </label>
        <input id="ask-q" type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej.: ¿Qué glitch funciona hoy en Xbox?" maxLength={300} />
        <button type="submit" className="btn btn-cta">
          Preguntar
        </button>
      </form>
      <div className="chips">
        {['¿Qué glitch funciona hoy en Xbox?', '¿Dónde está Stock 305?', 'Moses autos', '¿Cuánto paga Randy?'].map((s) => (
          <button key={s} type="button" className="chip" onClick={() => { setQ(s); setAnswer(ask(s, entries, findings, runs, entryPath)); }}>
            {s}
          </button>
        ))}
      </div>
      {answer && (
        <div className="panel ask-answer" aria-live="polite" data-testid="ask-answer">
          <p>{answer.answer}</p>
          <p className="small">
            Certeza: <strong>{answer.certainty}</strong> · {answer.lastRun}
          </p>
          {answer.citations.length > 0 && (
            <ol className="small">
              {answer.citations.map((c, i) => (
                <li key={i}>
                  {c.internal ? <Link to={c.url}>{c.label}</Link> : <a href={c.url} target="_blank" rel="noopener noreferrer nofollow">{c.label}</a>} — {c.status}
                  {c.date ? ` · ${c.date.slice(0, 10)}` : ''}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}

const LOCAL_SENT = 'leonida-atlas:hallazgos-enviados';

function Enviar() {
  const [url, setUrl] = useState('');
  const [cat, setCat] = useState('Glitch');
  const [plat, setPlat] = useState('No lo sé');
  const [desc, setDesc] = useState('');
  const [error, setError] = useState('');
  const [issueUrl, setIssueUrl] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setIssueUrl('');
    let u: URL;
    try {
      u = new URL(url.trim());
    } catch {
      setError('Escribe un enlace completo que empiece con https://');
      return;
    }
    if (u.protocol !== 'https:') return setError('Solo se aceptan enlaces https.');
    if (desc.trim().length < 10) return setError('Describe en al menos 10 caracteres qué muestra el enlace.');
    setError('');
    const params = new URLSearchParams({ template: 'hallazgo.yml', title: `Hallazgo: ${desc.trim().slice(0, 60)}`, enlace: u.toString(), descripcion: desc.trim().slice(0, 1500) });
    const target = `${REPORT_URL}?${params}`;
    setIssueUrl(target);
    try {
      const prev = JSON.parse(localStorage.getItem(LOCAL_SENT) ?? '[]') as unknown[];
      localStorage.setItem(LOCAL_SENT, JSON.stringify([{ url: u.toString(), cat, plat, at: new Date().toISOString() }, ...prev].slice(0, 50)));
    } catch {
      /* sin almacenamiento local */
    }
  };
  const queue = submissions.filter((s) => s.moderation === 'en_cola').length;
  return (
    <section aria-labelledby="env-h">
      <h2 id="env-h">Enviar hallazgo</h2>
      <p className="small">
        Comparte un enlace a un video, una publicación de redes sociales, un blog o tu propia captura. Entra a una <strong>cola de revisión</strong> (actualmente {queue} en cola) y nunca se publica
        automáticamente. Se envía como issue de GitHub (necesitas una cuenta gratuita).
      </p>
      <form className="submit-form" onSubmit={submit} noValidate>
        <label htmlFor="sub-url">Enlace</label>
        <input id="sub-url" type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" required />
        <label htmlFor="sub-cat">Categoría</label>
        <select id="sub-cat" value={cat} onChange={(e) => setCat(e.target.value)}>
          {['Glitch', 'Dinero', 'Truco', 'Arma', 'Vehículo', 'Coleccionable', 'Ropa o joyería', 'Misión', 'Parche', 'Otro'].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label htmlFor="sub-plat">Plataforma</label>
        <select id="sub-plat" value={plat} onChange={(e) => setPlat(e.target.value)}>
          {['PS5', 'PS5 Pro', 'Xbox Series X', 'Xbox Series S', 'No lo sé'].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label htmlFor="sub-desc">Descripción (qué muestra, capítulo, versión, si lo probaste)</label>
        <textarea id="sub-desc" rows={4} maxLength={1500} value={desc} onChange={(e) => setDesc(e.target.value)} />
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-cta">
          Preparar envío
        </button>
      </form>
      {issueUrl && (
        <div className="ok-box" role="status" data-testid="submit-ready">
          <p>Listo. Abre GitHub para confirmar el envío; ahí eliges categoría y plataforma en el formulario.</p>
          <a className="btn" href={issueUrl} target="_blank" rel="noopener noreferrer">
            Abrir formulario en GitHub <Icon name="external" size={14} />
          </a>
        </div>
      )}
    </section>
  );
}

function Bitacora() {
  return (
    <section aria-labelledby="bit-h">
      <h2 id="bit-h">Bitácora del investigador</h2>
      {lastRun ? (
        <div className="panel" data-testid="last-run">
          <p>
            <strong>Última investigación real:</strong> {dt(lastRun.finishedAt)} · estado <strong>{lastRun.status}</strong> · origen{' '}
            {lastRun.trigger === 'manual_local' ? 'ejecución manual local (no programada)' : lastRun.trigger === 'schedule' ? 'GitHub Actions programado' : lastRun.trigger}
          </p>
          <p className="small">
            {lastRun.totals.itemsSeen} elementos revisados · {lastRun.totals.relevant} relevantes · {lastRun.totals.newFindings} nuevos · {lastRun.totals.statusChanges} cambios de estado ·
            clasificador {lastRun.classifierMode === 'ia' ? 'con IA' : 'heurístico (sin IA)'} · costo estimado de IA ${lastRun.budget.estimatedCostUsd.toFixed(4)} USD
          </p>
          {lastRun.errors.length > 0 && (
            <ul className="small">
              {lastRun.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
          <p className="small muted">
            Horario previsto en GitHub Actions: {lastRun.nextScheduledHintUtc.join(' y ')} UTC. GitHub puede retrasarlo; aquí solo se muestran corridas que realmente ocurrieron.
          </p>
        </div>
      ) : (
        <EmptyState icon="alert" title="Aún no hay corridas registradas" />
      )}
      <h3 className="h-sub">Historial de corridas</h3>
      <div className="table-wrap" tabIndex={0} role="region" aria-label="Historial de corridas">
        <table className="facts">
          <thead>
            <tr>
              <th scope="col">Fin</th>
              <th scope="col">Origen</th>
              <th scope="col">Estado</th>
              <th scope="col">Nuevos</th>
              <th scope="col">Errores</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id}>
                <td>{dt(r.finishedAt)}</td>
                <td>{r.trigger}</td>
                <td>{r.status}</td>
                <td>{r.totals.newFindings}</td>
                <td>{r.errors.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="h-sub">Fuentes vigiladas</h3>
      <ul className="source-status">
        {intelSources.map((s) => {
          const res = lastRun?.sources.find((x) => x.sourceId === s.id);
          return (
            <li key={s.id} className="panel">
              <strong>{s.name}</strong> · {s.tier} · {s.enabled ? (res ? (res.ok ? `✓ ${res.items} elementos en la última corrida` : `✗ ${res.error}`) : 'activa') : 'desactivada'}
              <span className="block small muted">{s.enabled ? s.rights : s.disabledReason}</span>
              {!s.aiProcessingAllowed && s.enabled && <span className="block small muted">Sin procesamiento con IA por las reglas de su robots.txt.</span>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function IntelPage({ initial }: { initial?: SectionId }) {
  const [params, setParams] = useSearchParams();
  const sec = ((params.get('seccion') as SectionId) || initial || 'novedades') as SectionId;
  const counts = useMemo(() => ({ total: findings.length, watch: findings.filter((f) => f.category !== 'noticia').length }), []);
  return (
    <div className="page">
      <Seo title="ATLAS INTELLIGENCE" description="Investigación automatizada de GTA VI: novedades, hallazgos en observación con estado por plataforma, parches, bitácora y preguntas con fuentes." />
      <header className="page-head">
        <h1>
          <Icon name="eye" size={28} /> ATLAS INTELLIGENCE
        </h1>
        <p className="lead">
          Investigación automatizada: lee fuentes autorizadas, detecta cambios y propone actualizaciones para revisión humana. No fabrica certezas: cada hallazgo muestra su estado,
          sus fuentes y si alguien lo probó.
        </p>
        <p className="small muted" data-testid="intel-summary">
          {counts.total} hallazgos registrados ({counts.watch} en observación) · última investigación real: {dt(lastRun?.finishedAt)}
        </p>
      </header>
      <div className="tabs" role="tablist" aria-label="Secciones de ATLAS INTELLIGENCE">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={sec === s.id}
            className="tab"
            onClick={() => setParams(s.id === 'novedades' ? {} : { seccion: s.id }, { replace: true })}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {sec === 'novedades' && <Novedades />}
        {sec === 'observacion' && <Observacion />}
        {sec === 'parches' && <Parches />}
        {sec === 'preguntar' && <Preguntar />}
        {sec === 'enviar' && <Enviar />}
        {sec === 'bitacora' && <Bitacora />}
      </div>
    </div>
  );
}
