import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { entryById, entryPath, getEntry, imageOf } from '../data';
import { CATEGORY_META, EDITION_LABEL, MODE_LABEL, REGION_LABEL, STATUS_META } from '../data/meta';
import type { Category, MediaItem } from '../data/schema';
import { useProgress } from '../hooks/progress';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { Gallery } from '../components/Gallery';
import { Icon } from '../components/Icon';
import { Illustration } from '../components/Illustration';
import { ItemCard } from '../components/ItemCard';
import { MiniMap } from '../components/MapView';
import { MyRecord } from '../components/MyRecord';
import { AddToRoute } from '../components/AddToRoute';
import { PhotoGallery } from '../components/PhotoGallery';
import { ReportError } from '../components/ReportError';
import { Seo } from '../components/Seo';
import { ShareAction } from '../components/ShareAction';
import { SourcePanel } from '../components/SourcePanel';
import { formatDate, money } from '../lib/calc';
import { NotFound } from './NotFound';

function Notes({ id }: { id: string }) {
  const { progress, setNote } = useProgress();
  const saved = progress.notes[id]?.text ?? '';
  const [text, setText] = useState(saved);
  useEffect(() => setText(saved), [saved, id]);
  useEffect(() => {
    if (text === saved) return;
    const t = setTimeout(() => setNote(id, text), 500);
    return () => clearTimeout(t);
  }, [text, saved, id, setNote]);
  return (
    <section className="panel" aria-labelledby="notes-h">
      <h2 id="notes-h">
        <Icon name="note" size={20} /> Mis notas
      </h2>
      <label htmlFor="note-text" className="sr-only">
        Notas personales para esta ficha
      </label>
      <textarea id="note-text" rows={3} maxLength={5000} value={text} onChange={(e) => setText(e.target.value)} onBlur={() => text !== saved && setNote(id, text)} placeholder="Solo se guardan en este dispositivo." data-testid="notes" />
      <p className="muted small" aria-live="polite">
        {text === saved ? (saved ? 'Guardado en este dispositivo.' : 'Escribe para guardar automáticamente.') : 'Guardando…'}
      </p>
    </section>
  );
}

export function DetailPage({ category }: { category: Category }) {
  const { slug = '' } = useParams();
  const entry = getEntry(category, slug);
  const { isFavorite, isCompleted, toggleFavorite, toggleCompleted, progress, inGarage, toggleGarage } = useProgress();
  const [reveal, setReveal] = useState(false);
  if (!entry) return <NotFound />;
  const meta = CATEGORY_META[entry.category];
  const fav = isFavorite(entry.id);
  const done = isCompleted(entry.id);
  const images = entry.images.map((i) => imageOf(i)).filter((m): m is MediaItem => !!m);
  const related = entry.related.map((r) => entryById.get(r)).filter((e) => !!e);
  const spoilerHidden = entry.spoilerLevel > progress.settings.spoilerLevel && !reveal;
  const amount = entry.reward?.amount;

  return (
    <article className="page detail" data-testid="detail" data-id={entry.id}>
      <Seo title={entry.name} description={entry.summary} />
      <nav aria-label="Ruta de navegación" className="crumbs">
        <Link to="/">Inicio</Link> / <Link to={meta.path}>{meta.label}</Link> / <span aria-current="page">{entry.name}</span>
      </nav>
      <header className="detail-head">
        <div className="detail-badges">
          <EvidenceBadge status={entry.status} />
          <span className="chip chip-static">{meta.singular}</span>
          <span className="chip chip-static">{entry.subzone ? `${entry.subzone}, ${REGION_LABEL[entry.region]}` : REGION_LABEL[entry.region]}</span>
          {entry.edition !== 'base' && <span className="chip chip-static chip-edition">{EDITION_LABEL[entry.edition]}</span>}
          {entry.category === 'dinero' && <span className="chip chip-static">{MODE_LABEL[entry.mode]}</span>}
          {entry.chapter && <span className="chip chip-static">{entry.chapter}</span>}
          {entry.spoilerLevel > 0 && <span className="chip chip-static chip-warn">Spoiler {entry.spoilerLevel === 2 ? 'avanzado' : 'leve'}</span>}
        </div>
        <h1>{entry.name}</h1>
        <p className="lead">{entry.summary}</p>
        {entry.collection && entryById.get(entry.collection) && (
          <p className="small">
            Parte de la colección <Link to={entryPath(entryById.get(entry.collection)!)}>{entryById.get(entry.collection)!.name}</Link> ·{' '}
            <Link to="/coleccionables">ver mi seguimiento</Link>
          </p>
        )}
        <p className="muted small">
          Última revisión: <strong>{formatDate(entry.verifiedAt)}</strong> · Actualizado para: {entry.patch} · Plataformas: {entry.platform.join(', ')}
        </p>
        <div className="btn-row detail-actions">
          <button type="button" className={`btn${fav ? ' is-on' : ''}`} aria-pressed={fav} onClick={() => toggleFavorite(entry.id)} data-testid="btn-fav">
            <Icon name="star" size={18} /> {fav ? 'Guardada' : 'Guardar'}
          </button>
          <button type="button" className={`btn${done ? ' is-on' : ''}`} aria-pressed={done} onClick={() => toggleCompleted(entry.id)} data-testid="btn-done">
            <Icon name="check" size={18} /> {entry.category === 'coleccionables' ? (done ? 'Encontrado' : 'Marcar encontrado') : done ? 'Completado' : 'Marcar completado'}
          </button>
          {entry.category === 'vehiculos' && (
            <>
              <button type="button" className={`btn${inGarage(entry.id) ? ' is-on' : ''}`} aria-pressed={inGarage(entry.id)} onClick={() => toggleGarage(entry.id)} data-testid="btn-garage">
                <Icon name="car" size={18} /> {inGarage(entry.id) ? 'En mi garaje' : 'Añadir a mi garaje'}
              </button>
              <Link to={`/comparar-vehiculos?v=${entry.id}`} className="btn">
                <Icon name="layers" size={18} /> Comparar
              </Link>
            </>
          )}
          <ShareAction title={`${entry.name} · LEONIDA ATLAS`} text={entry.summary} path={entryPath(entry)} />
        </div>
      </header>

      {spoilerHidden ? (
        <div className="panel spoiler-wall">
          <p>
            <Icon name="eye" size={20} /> Esta ficha contiene spoilers {entry.spoilerLevel === 2 ? 'de etapas avanzadas de la historia' : 'leves (nombres de misiones o capítulos)'}. Tu
            preferencia actual los oculta.
          </p>
          <button type="button" className="btn btn-cta" onClick={() => setReveal(true)}>
            Mostrar contenido
          </button>{' '}
          <Link to="/mi-espacio" className="btn btn-ghost">
            Cambiar preferencia
          </Link>
        </div>
      ) : (
        <div className="detail-grid">
          <div className="detail-main">
            <div className="detail-hero">
              {images[0] ? (
                <Gallery items={images} label={`Galería de ${entry.name}`} />
              ) : (
                <Illustration category={entry.category} seed={entry.id} label={entry.name} />
              )}
            </div>
            <section className="panel">
              <h2>Descripción</h2>
              <p>{entry.description}</p>
            </section>
            {entry.howTo.length > 0 && (
              <section className="panel">
                <h2>{entry.category === 'rutas' ? 'Paso a paso' : entry.category === 'negocios' && entry.status === 'reportado' ? 'Detalle' : 'Cómo hacerlo'}</h2>
                <ol className="steps">
                  {entry.howTo.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </section>
            )}
            {entry.facts.length > 0 && (
              <section className="panel">
                <h2>Datos y evidencia</h2>
                <div className="table-wrap" tabIndex={0} role="region" aria-label="Tabla de datos y evidencia">
                  <table className="facts">
                    <thead>
                      <tr>
                        <th scope="col">Dato</th>
                        <th scope="col">Valor</th>
                        <th scope="col">Evidencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.facts.map((f, i) => (
                        <tr key={i}>
                          <th scope="row">{f.label}</th>
                          <td>{f.value}</td>
                          <td>
                            <EvidenceBadge status={f.status} compact />
                            <span className="fact-src">
                              {f.sources.map((s) => (
                                <a key={s} href={`#fuente-${s}`} className="small">
                                  [{s}]
                                </a>
                              ))}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
          <aside className="detail-side">
            {(entry.reward || entry.time) && (
              <section className="panel reward">
                <h2>{entry.reward?.label ?? 'Recompensa'}</h2>
                {amount && <p className="big-money">{amount.min === amount.max ? money(amount.min) : `${money(amount.min)} – ${money(amount.max)}`}</p>}
                {entry.reward?.note && <p className="small muted">{entry.reward.note}</p>}
                {entry.time && <p className="small">Tiempo: {entry.time}</p>}
                {entry.category === 'dinero' && (
                  <Link to="/dinero#calc-h" className="btn btn-sm">
                    <Icon name="calc" size={16} /> Usar en la calculadora
                  </Link>
                )}
              </section>
            )}
            {entry.requirements.length > 0 && (
              <section className="panel">
                <h2>Requisitos</h2>
                <ul className="bullets">
                  {entry.requirements.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </section>
            )}
            {(entry.risks.length > 0 || entry.status === 'reportado') && (
              <section className="panel alerts" aria-label="Alertas">
                <h2>
                  <Icon name="alert" size={20} /> Alertas
                </h2>
                <ul className="bullets">
                  {entry.status === 'reportado' && <li>{STATUS_META.reportado.description} Compruébalo en tu partida.</li>}
                  {entry.risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </section>
            )}
            {entry.mapPosition ? (
              <section className="panel">
                <h2>Ubicación</h2>
                <MiniMap entry={entry} />
                <p className="small muted">{entry.mapPosition.basis}</p>
                <AddToRoute entry={entry} />
              </section>
            ) : (
              <section className="panel">
                <h2>Ubicación</h2>
                <p className="small muted">Sin punto en el mapa: no hay evidencia suficiente de su posición. Preferimos no marcar a inventar una ubicación.</p>
              </section>
            )}
            <SourcePanel entry={entry} />
          </aside>
        </div>
      )}

      <MyRecord entry={entry} />
      <PhotoGallery entryId={entry.id} title="Mis fotos de esta ficha" />
      <Notes id={entry.id} />
      <ReportError subject={entry.name} path={entryPath(entry)} />

      {related.length > 0 && (
        <section className="section" aria-labelledby="rel-h">
          <h2 id="rel-h" className="section-title">
            Relacionado
          </h2>
          <div className="card-grid">
            {related.map((r) => (
              <ItemCard key={r!.id} entry={r!} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
