import { useState } from 'react';
import { Link } from 'react-router';
import { entries, entryById, entryPath } from '../data';
import { useProgress } from '../hooks/progress';
import { atlasAchievements, mySpaceStats, timeAgo } from '../lib/mySpace';
import { ACCENTS, PLATFORM_LABEL, type Accent, type ActivityEvent, type Progress } from '../lib/storage';
import { Icon } from './Icon';
import { Media } from './Media';
import { AvatarBadge } from './Avatar';

const ACCENT_LABEL: Record<Accent, string> = { magenta: 'Magenta', cian: 'Cian', lima: 'Lima', violeta: 'Violeta' };

const ACTIVITY: Record<ActivityEvent['type'], { icon: string; text: string }> = {
  encontrado: { icon: 'check', text: 'Encontrado' },
  favorito: { icon: 'star', text: 'Añadido a favoritos' },
  visitado: { icon: 'pin', text: 'Lugar visitado' },
  ruta: { icon: 'route', text: 'Nueva ruta guardada' },
  garaje: { icon: 'car', text: 'Vehículo añadido al garaje' },
  marcador: { icon: 'flag', text: 'Marcador personal creado' },
  objetivo: { icon: 'target', text: 'Objetivo cumplido' },
};

function refLabel(p: Progress, a: ActivityEvent): { label: string; to?: string; media?: string; category?: string } {
  const e = entryById.get(a.ref);
  if (e) return { label: e.name, to: entryPath(e), media: e.images[0], category: e.category };
  if (a.type === 'ruta') return { label: p.routes.find((r) => r.id === a.ref)?.name ?? 'Ruta borrada', to: '/mis-rutas' };
  if (a.type === 'marcador') return { label: p.markers.find((m) => m.id === a.ref)?.name ?? 'Marcador borrado', to: '/mapa' };
  if (a.type === 'objetivo') return { label: p.goals.find((g) => g.id === a.ref)?.text ?? 'Objetivo borrado' };
  return { label: 'Ficha que ya no existe' };
}

/** Anillo de progreso en SVG (atributos, sin estilos en línea). */
export function Ring({ pct, size = 84, label }: { pct: number; size?: number; label: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <span className="ring" role="img" aria-label={label}>
      <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true" focusable="false">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#232a41" strokeWidth="8" />
        {pct > 0 && <circle cx="40" cy="40" r={r} fill="none" stroke="url(#ms-ring)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(Math.min(100, pct) / 100) * c} ${c}`} transform="rotate(-90 40 40)" />}
        <defs>
          <linearGradient id="ms-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff3ea5" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <span className="ring-value">{pct}%</span>
    </span>
  );
}

/** Panel principal de Mi espacio (referencia 02) con datos reales del progreso local. */
export function MySpaceDashboard() {
  const { progress, setProfile, addGoal, toggleGoal, deleteGoal } = useProgress();
  const s = mySpaceStats(progress, entries);
  const achievements = atlasAchievements(s);
  const [goal, setGoal] = useState('');
  const { name, avatar, platform, accent } = progress.profile;
  const cards = [
    { id: 'rutas', to: '/mis-rutas', icon: 'route', title: 'Rutas guardadas', value: `${s.routes}`, sub: s.routesDone ? `${s.routesDone} completas` : 'Crea recorridos con fichas del mapa', media: 'mk-carretera' },
    { id: 'colec', to: '/coleccionables', icon: 'grid', title: 'Coleccionables encontrados', value: `${s.collectiblesFound} / ${s.collectiblesTotal}`, sub: 'Registrados en Atlas', media: 'keys-buceo' },
    { id: 'veh', to: '/comparar-vehiculos', icon: 'car', title: 'Vehículos favoritos', value: `${s.vehiclesFav}`, sub: 'Favoritos y garaje', media: 'ue-cheetah' },
    { id: 'lug', to: '/lugares', icon: 'pin', title: 'Lugares visitados', value: `${s.placesVisited} / ${s.placesTotal}`, sub: `${s.regionsVisited} de ${s.regionsTotal} regiones`, media: 'vc-marina' },
  ];
  return (
    <div className={`ms accent-${accent}`}>
      <section className="ms-hero" aria-labelledby="ms-h">
        <div className="ms-hero-bg" aria-hidden="true">
          <Media id="vc-skyline-noche" category="lugares" label="Vice City de noche" className="ms-hero-img" sizes="100vw" eager />
        </div>
        <div className="ms-hero-copy">
          <h1 id="ms-h" className="ms-title">
            <Icon name="user" size={30} /> Mi espacio{name.trim() ? `: ${name.trim()}` : ''}
          </h1>
          <p className="ms-sub">Tu progreso registrado en LEONIDA ATLAS, guardado solo en este dispositivo.</p>
        </div>
        <p className="hero-credit">Imagen oficial © Rockstar Games</p>
      </section>

      <section className="ms-profile" aria-label="Perfil">
        <AvatarBadge avatar={avatar} name={name} size={84} />
        <div className="ms-profile-body">
          <p className="ms-name">{name.trim() || 'Sin nombre'}</p>
          <p className="ms-badges">
            <span className="chip chip-static">{platform ? PLATFORM_LABEL[platform] : 'Consola sin indicar'}</span>
            <span className="chip chip-static">{s.atlasDone} fichas marcadas</span>
          </p>
          <div className="ms-accents" role="group" aria-label="Color del perfil">
            {ACCENTS.map((a) => (
              <button key={a} type="button" className={`ms-accent sw-${a}${accent === a ? ' is-on' : ''}`} aria-pressed={accent === a} aria-label={`Color ${ACCENT_LABEL[a]}`} onClick={() => setProfile({ accent: a })} />
            ))}
          </div>
          <a href="#prof-h" className="small">
            Editar nombre, avatar y consola
          </a>
        </div>
      </section>

      <ul className="ms-cards" data-testid="ms-cards">
        {cards.map((c) => (
          <li key={c.id}>
            <Link to={c.to} className="ms-card">
              <Media id={c.media} category="lugares" label={c.title} className="ms-card-img" sizes="(min-width: 1024px) 25vw, 50vw" />
              <span className="ms-card-ico" aria-hidden="true">
                <Icon name={c.icon} size={22} />
              </span>
              <span className="ms-card-title">{c.title}</span>
              <span className="ms-card-value">{c.value}</span>
              <span className="ms-card-sub">{c.sub}</span>
            </Link>
          </li>
        ))}
        <li>
          <div className="ms-card ms-card-ring" data-testid="ms-atlas-progress">
            <span className="ms-card-title">Progreso registrado en Atlas</span>
            <Ring pct={s.atlasPct} label={`${s.atlasPct} % de las fichas seguibles marcadas en Atlas`} />
            <span className="ms-card-sub">
              {s.atlasDone} de {s.atlasTotal} fichas. No es el porcentaje oficial del juego.
            </span>
          </div>
        </li>
      </ul>

      <section className="ms-panel" aria-labelledby="ms-stats-h">
        <h2 id="ms-stats-h" className="ms-panel-title">
          <Icon name="layers" size={20} /> Estadísticas de exploración
        </h2>
        <ul className="ms-stats">
          <li>
            <Icon name="pin" size={22} />
            <span>Regiones visitadas</span>
            <strong>
              {s.regionsVisited} / {s.regionsTotal}
            </strong>
          </li>
          <li>
            <Icon name="flag" size={22} />
            <span>Marcadores personales</span>
            <strong>{s.markers}</strong>
          </li>
          <li>
            <Icon name="target" size={22} />
            <span>Objetivos</span>
            <strong>
              {s.goalsDone} / {s.goalsTotal}
            </strong>
          </li>
          <li>
            <Icon name="star" size={22} />
            <span>Logros de Atlas</span>
            <strong>
              {achievements.filter((a) => a.done).length} / {achievements.length}
            </strong>
          </li>
        </ul>
      </section>

      <div className="ms-two">
        <section className="ms-panel" aria-labelledby="ms-ach-h" data-testid="ms-achievements">
          <h2 id="ms-ach-h" className="ms-panel-title">
            <Icon name="star" size={20} /> Logros de Atlas
          </h2>
          <p className="small muted">Metas internas de LEONIDA ATLAS. No son trofeos oficiales de PlayStation ni logros de Xbox.</p>
          <ul className="ms-ach">
            {achievements.map((a) => (
              <li key={a.id} className={a.done ? 'is-done' : ''}>
                <span className="ms-ach-ico" aria-hidden="true">
                  <Icon name={a.done ? 'check' : a.icon} size={18} />
                </span>
                <span className="ms-ach-body">
                  <strong>{a.title}</strong>
                  <span className="small muted">{a.description}</span>
                  <span className="ms-bar" aria-hidden="true">
                    <svg viewBox="0 0 100 6" preserveAspectRatio="none" focusable="false">
                      <rect width="100" height="6" rx="3" fill="#232a41" />
                      <rect width={(a.value / a.goal) * 100} height="6" rx="3" fill="url(#ms-ring)" />
                    </svg>
                  </span>
                </span>
                <span className="ms-ach-n">
                  {a.value}/{a.goal}
                  <span className="sr-only">{a.done ? ', conseguido' : ', en progreso'}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="ms-panel" aria-labelledby="ms-goals-h" data-testid="ms-goals">
          <h2 id="ms-goals-h" className="ms-panel-title">
            <Icon name="target" size={20} /> Mis objetivos
          </h2>
          <form
            className="ms-goal-form"
            onSubmit={(e) => {
              e.preventDefault();
              addGoal(goal);
              setGoal('');
            }}
          >
            <label htmlFor="ms-goal" className="sr-only">
              Nuevo objetivo
            </label>
            <input id="ms-goal" value={goal} maxLength={120} onChange={(e) => setGoal(e.target.value)} placeholder="Ej.: Encontrar todas las revistas" />
            <button type="submit" className="btn btn-sm btn-neon" disabled={!goal.trim()}>
              <Icon name="plus" size={16} /> Añadir
            </button>
          </form>
          {progress.goals.length ? (
            <ul className="ms-goals">
              {progress.goals.map((g) => (
                <li key={g.id} className={g.done ? 'is-done' : ''}>
                  <label className="check">
                    <input type="checkbox" checked={g.done} onChange={() => toggleGoal(g.id)} /> {g.text}
                  </label>
                  <button type="button" className="icon-btn" aria-label={`Borrar objetivo: ${g.text}`} onClick={() => deleteGoal(g.id)}>
                    <Icon name="trash" size={16} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="small muted">Escribe tus propias metas para esta partida.</p>
          )}
        </section>
      </div>

      <div className="ms-two">
        <section className="ms-panel" aria-labelledby="ms-act-h" data-testid="ms-activity">
          <h2 id="ms-act-h" className="ms-panel-title">
            <Icon name="list" size={20} /> Actividad reciente
          </h2>
          {progress.activity.length ? (
            <ul className="ms-act">
              {progress.activity.slice(0, 8).map((a) => {
                const ref = refLabel(progress, a);
                const t = ACTIVITY[a.type];
                const body = (
                  <>
                    <span className="ms-act-media">
                      {ref.media ? <Media id={ref.media} category="lugares" label={ref.label} className="ms-act-img" sizes="72px" /> : <Icon name={t.icon} size={22} />}
                    </span>
                    <span className="ms-act-body">
                      <strong>{t.text}</strong>
                      <span className="small muted">{ref.label}</span>
                    </span>
                    <time className="small muted" dateTime={a.at}>
                      {timeAgo(a.at)}
                    </time>
                  </>
                );
                return <li key={`${a.type}-${a.ref}-${a.at}`}>{ref.to ? <Link to={ref.to}>{body}</Link> : <span className="ms-act-row">{body}</span>}</li>;
              })}
            </ul>
          ) : (
            <p className="small muted">Aquí aparecerá lo que marques, guardes o visites (registrado desde esta versión en este dispositivo).</p>
          )}
        </section>

        <Link to="/novedades" className="ms-intel" data-testid="ms-intel">
          <Media id="vc-letrero" category="lugares" label="ATLAS Intelligence" className="ms-intel-img" sizes="(min-width: 1024px) 40vw, 100vw" />
          <span className="ms-intel-copy">
            <span className="ms-intel-kicker">ATLAS Intelligence</span>
            <strong>Novedades con fuentes y estado de verificación</strong>
            <span className="small">Ver lo último que detectaron las fuentes vigiladas →</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
