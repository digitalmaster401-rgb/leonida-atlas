import { useState } from 'react';
import { Link } from 'react-router';
import { entries, entryById, entryPath } from '../data';
import type { Entry } from '../data/schema';
import { CATEGORY_META, CATEGORY_ORDER } from '../data/meta';
import { useProgress } from '../hooks/progress';
import { CardGrid } from '../components/ItemCard';
import { EmptyState } from '../components/EmptyState';
import { ProgressManager, SpoilerSetting } from '../components/ProgressManager';
import { PhotoGallery } from '../components/PhotoGallery';
import { STATE_LABEL } from '../components/MyRecord';
import { Seo } from '../components/Seo';
import { Icon } from '../components/Icon';
import { formatDate } from '../lib/calc';
import { AVATARS, PLATFORM_LABEL, PLATFORMS, type Avatar, type Platform, type Progress } from '../lib/storage';

const AVATAR_LABEL: Record<Avatar, string> = { flamenco: 'Flamenco', palmera: 'Palmera', ola: 'Ola', sol: 'Sol', estrella: 'Estrella', rayo: 'Rayo' };
type ListKey = 'encontrado' | 'pendiente' | 'revisar' | 'no_disponible';
const LISTS: ListKey[] = ['encontrado', 'pendiente', 'revisar', 'no_disponible'];

/** Clasifica las fichas en las listas personales. Los coleccionables individuales sin estado cuentan como pendientes. */
export function personalLists(p: Progress, list: Entry[]): Record<ListKey, Entry[]> {
  const out: Record<ListKey, Entry[]> = { encontrado: [], pendiente: [], revisar: [], no_disponible: [] };
  for (const e of list) {
    const st = p.records[e.id]?.state;
    if (p.completed.includes(e.id)) out.encontrado.push(e);
    else if (st) out[st].push(e);
    else if (e.category === 'coleccionables' && e.collection) out.pendiente.push(e);
  }
  return out;
}

export function AvatarBadge({ avatar, name, size = 56 }: { avatar: Avatar; name: string; size?: number }) {
  return (
    <span className={`avatar avatar-${avatar}${size > 40 ? ' avatar-lg' : ''}`} aria-hidden="true">
      {(name.trim()[0] ?? AVATAR_LABEL[avatar][0]).toUpperCase()}
    </span>
  );
}

function Profile() {
  const { progress, setProfile } = useProgress();
  const { name, avatar, platform } = progress.profile;
  return (
    <section className="panel profile" aria-labelledby="prof-h">
      <h2 id="prof-h">Mi perfil</h2>
      <div className="profile-row">
        <AvatarBadge avatar={avatar} name={name} />
        <div className="field">
          <label htmlFor="prof-name">Nombre o apodo (opcional)</label>
          <input id="prof-name" type="text" maxLength={40} value={name} onChange={(e) => setProfile({ name: e.target.value })} autoComplete="nickname" />
        </div>
        <div className="field">
          <label htmlFor="prof-platform">Mi consola</label>
          <select id="prof-platform" value={platform ?? ''} onChange={(e) => setProfile({ platform: (e.target.value || null) as Platform | null })} data-testid="prof-platform">
            <option value="">Sin indicar</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <fieldset className="avatar-pick">
        <legend>Avatar</legend>
        {AVATARS.map((a) => (
          <label key={a} className={`avatar-opt${a === avatar ? ' is-on' : ''}`}>
            <input type="radio" name="avatar" className="sr-only" checked={a === avatar} onChange={() => setProfile({ avatar: a })} />
            <AvatarBadge avatar={a} name="" size={36} />
            <span className="small">{AVATAR_LABEL[a]}</span>
          </label>
        ))}
      </fieldset>
      <p className="muted small">Tu perfil no sale de este dispositivo. La consola elegida se usa como predeterminada en Trucos, Ajustes y Mi registro.</p>
    </section>
  );
}

function EntryRows({ list, empty }: { list: Entry[]; empty: string }) {
  const { progress, setFound, toggleToday } = useProgress();
  if (!list.length) return <p className="muted">{empty}</p>;
  return (
    <ul className="entry-rows">
      {list.map((e) => {
        const found = progress.completed.includes(e.id);
        const rec = progress.records[e.id];
        return (
          <li key={e.id} data-testid="entry-row" data-id={e.id}>
            <button type="button" className={`icon-btn${found ? ' is-on' : ''}`} aria-pressed={found} aria-label={found ? `Desmarcar ${e.name}` : `Marcar ${e.name}`} onClick={() => setFound(e.id, !found)}>
              <Icon name="check" size={18} />
            </button>
            <span className="entry-row-body">
              <Link to={entryPath(e)}>{e.name}</Link>
              <span className="muted small">
                {CATEGORY_META[e.category].singular}
                {rec?.date ? ` · ${formatDate(rec.date)}` : ''}
                {rec?.platform ? ` · ${PLATFORM_LABEL[rec.platform]}` : ''}
                {rec?.rating ? ` · ${'★'.repeat(rec.rating)}` : ''}
              </span>
            </span>
            {progress.today.includes(e.id) && (
              <button type="button" className="icon-btn" aria-label={`Quitar ${e.name} de la lista para hoy`} onClick={() => toggleToday(e.id)}>
                <Icon name="close" size={16} />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function MyGamePage() {
  const { progress } = useProgress();
  const [tab, setTab] = useState<ListKey>('encontrado');
  const favs = progress.favorites.map((id) => entryById.get(id)).filter((e): e is Entry => !!e);
  const notes = Object.entries(progress.notes).filter(([id]) => entryById.has(id));
  const tracked = entries.filter((e) => e.category !== 'personajes' && e.category !== 'lugares' && !e.tracking);
  const doneTracked = tracked.filter((e) => progress.completed.includes(e.id)).length;
  const pct = tracked.length ? Math.round((doneTracked / tracked.length) * 100) : 0;
  const lists = personalLists(progress, entries);
  const today = progress.today.map((id) => entryById.get(id)).filter((e): e is Entry => !!e);
  const cols = entries.filter((e) => e.tracking);
  const name = progress.profile.name.trim();
  return (
    <div className="page">
      <Seo title="Mi espacio" description="Tu progreso, fotos, encontrados y pendientes, guardados solo en tu dispositivo." />
      <header className="page-head">
        <h1>
          <Icon name="star" size={28} /> Mi espacio{name ? `: ${name}` : ''}
        </h1>
        <p className="lead">Tu progreso, fotos y listas. Todo se guarda solo en este dispositivo; vuelve otro día y lo encontrarás aquí.</p>
      </header>

      <Profile />

      <section className="panel" aria-labelledby="prog-h">
        <h2 id="prog-h">Progreso</h2>
        <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso total">
          <span style={{ width: `${pct}%` }} />
        </div>
        <p data-testid="progress-summary">
          {doneTracked} de {tracked.length} actividades, armas, vehículos, negocios, coleccionables y rutas marcadas como completadas ({pct} %).
        </p>
        <ul className="progress-cats">
          {CATEGORY_ORDER.filter((c) => c !== 'personajes' && c !== 'lugares').map((c) => {
            const all = tracked.filter((e) => e.category === c);
            const d = all.filter((e) => progress.completed.includes(e.id)).length;
            return (
              <li key={c}>
                <Link to={CATEGORY_META[c].path}>{CATEGORY_META[c].label}</Link>: {d}/{all.length}
              </li>
            );
          })}
        </ul>
        <h3>Colecciones</h3>
        <ul className="progress-cats" data-testid="col-stats">
          {cols.map((c) => (
            <li key={c.id}>
              <Link to={entryPath(c)}>{c.name}</Link>: {progress.counters[c.id] ?? 0}
              {c.tracking!.total ? `/${c.tracking!.total}` : ' (total no publicado)'}
            </li>
          ))}
        </ul>
        <p className="small">
          <Link to="/coleccionables">Abrir seguimiento de coleccionables</Link> · <Link to="/equipamiento">Mis equipamientos ({progress.loadouts.length})</Link>
        </p>
      </section>

      <section className="panel" aria-labelledby="today-h">
        <h2 id="today-h">
          <Icon name="list" size={20} /> Lista para hoy ({today.length})
        </h2>
        <EntryRows list={today} empty="Añade fichas con «Añadir a mi lista para hoy» dentro de cada ficha." />
      </section>

      <section className="panel" aria-labelledby="lists-h">
        <h2 id="lists-h">Mis listas</h2>
        <div className="tabs" role="tablist" aria-label="Listas personales">
          {LISTS.map((k) => (
            <button key={k} type="button" role="tab" id={`tab-${k}`} aria-selected={tab === k} aria-controls="list-panel" className="tab" onClick={() => setTab(k)}>
              {k === 'encontrado' ? 'Encontrados' : k === 'pendiente' ? 'Pendientes' : STATE_LABEL[k]} ({lists[k].length})
            </button>
          ))}
        </div>
        <div id="list-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          <EntryRows
            list={lists[tab]}
            empty={
              tab === 'encontrado' ? 'Marca fichas como completadas o encontradas.' : tab === 'pendiente' ? 'Sin pendientes.' : 'Cambia el estado desde «Mi registro» en una ficha.'
            }
          />
        </div>
      </section>

      <PhotoGallery />

      <section className="section" aria-labelledby="fav-h">
        <h2 id="fav-h" className="section-title">
          Guardadas ({favs.length})
        </h2>
        {favs.length ? (
          <CardGrid list={favs} />
        ) : (
          <EmptyState icon="star" title="Aún no guardas fichas">
            Toca ★ en cualquier tarjeta o «Guardar» dentro de una ficha.
          </EmptyState>
        )}
      </section>
      <section className="section" aria-labelledby="notes-list-h">
        <h2 id="notes-list-h" className="section-title">
          Mis notas ({notes.length})
        </h2>
        {notes.length ? (
          <ul className="notes-list">
            {notes.map(([id, n]) => {
              const e = entryById.get(id)!;
              return (
                <li key={id} className="panel">
                  <Link to={entryPath(e)}>
                    <strong>{e.name}</strong>
                  </Link>
                  <p className="note-text">{n.text}</p>
                  <span className="muted small">Actualizada {formatDate(n.updatedAt.slice(0, 10))}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState icon="note" title="Sin notas">
            Escribe notas dentro de cualquier ficha.
          </EmptyState>
        )}
      </section>
      <SpoilerSetting />
      <ProgressManager />
    </div>
  );
}
