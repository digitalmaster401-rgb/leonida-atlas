import { Link } from 'react-router';
import { entries, entryById, entryPath } from '../data';
import { CATEGORY_META, CATEGORY_ORDER } from '../data/meta';
import { useProgress } from '../hooks/progress';
import { CardGrid } from '../components/ItemCard';
import { EmptyState } from '../components/EmptyState';
import { ProgressManager, SpoilerSetting } from '../components/ProgressManager';
import { Seo } from '../components/Seo';
import { Icon } from '../components/Icon';
import { formatDate } from '../lib/calc';

export function MyGamePage() {
  const { progress } = useProgress();
  const favs = progress.favorites.map((id) => entryById.get(id)).filter((e) => !!e);
  const notes = Object.entries(progress.notes).filter(([id]) => entryById.has(id));
  const tracked = entries.filter((e) => e.category !== 'personajes' && e.category !== 'lugares');
  const doneTracked = tracked.filter((e) => progress.completed.includes(e.id)).length;
  const pct = tracked.length ? Math.round((doneTracked / tracked.length) * 100) : 0;
  return (
    <div className="page">
      <Seo title="Mi partida" description="Tus fichas guardadas, completadas y notas, guardadas solo en tu dispositivo." />
      <header className="page-head">
        <h1>
          <Icon name="star" size={28} /> Mi partida
        </h1>
        <p className="lead">Todo se guarda en este dispositivo. Vuelve otro día y lo encontrarás aquí.</p>
      </header>
      <section className="panel" aria-labelledby="prog-h">
        <h2 id="prog-h">Progreso</h2>
        <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso total">
          <span style={{ width: `${pct}%` }} />
        </div>
        <p data-testid="progress-summary">
          {doneTracked} de {tracked.length} actividades, armas, vehículos, negocios y rutas marcadas como completadas ({pct} %).
        </p>
        <ul className="progress-cats">
          {CATEGORY_ORDER.filter((c) => c !== 'personajes' && c !== 'lugares').map((c) => {
            const all = entries.filter((e) => e.category === c);
            const d = all.filter((e) => progress.completed.includes(e.id)).length;
            return (
              <li key={c}>
                <Link to={CATEGORY_META[c].path}>{CATEGORY_META[c].label}</Link>: {d}/{all.length}
              </li>
            );
          })}
        </ul>
      </section>
      <section className="section" aria-labelledby="fav-h">
        <h2 id="fav-h" className="section-title">
          Guardadas ({favs.length})
        </h2>
        {favs.length ? (
          <CardGrid list={favs as NonNullable<(typeof favs)[number]>[]} />
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
