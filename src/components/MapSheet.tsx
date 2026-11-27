import { useRef, useState, type PointerEvent } from 'react';
import { Link } from 'react-router';
import type { Entry } from '../data/schema';
import { entryPath } from '../data';
import { CATEGORY_META, PRECISION_LABEL } from '../data/meta';
import { useProgress } from '../hooks/progress';
import { MARKER_ICONS, type CustomMarker, type MarkerIcon } from '../lib/storage';
import { EvidenceBadge } from './EvidenceBadge';
import { AddToRoute } from './AddToRoute';
import { Icon } from './Icon';
import { Media } from './Media';
import type { PinGroup } from './MapView';

export const MARKER_ICON_NAME: Record<MarkerIcon, string> = { estrella: 'star', bandera: 'flag', camara: 'camera', dinero: 'cash', alerta: 'alert' };
const MARKER_ICON_LABEL: Record<MarkerIcon, string> = { estrella: 'Estrella', bandera: 'Bandera', camara: 'Foto', dinero: 'Dinero', alerta: 'Aviso' };

/** Contenedor deslizable del panel inferior: dos alturas (vista previa / completa), con asa táctil y botón accesible. */
function Sheet({ title, onClose, children, testId }: { title: string; onClose: () => void; children: React.ReactNode; testId: string }) {
  const [full, setFull] = useState(false);
  const start = useRef<number | null>(null);
  const down = (e: PointerEvent) => {
    start.current = e.clientY;
  };
  const up = (e: PointerEvent) => {
    if (start.current === null) return;
    const dy = e.clientY - start.current;
    start.current = null;
    if (dy < -30) setFull(true);
    else if (dy > 60) {
      if (full) setFull(false);
      else onClose();
    }
  };
  return (
    <aside className={`map-sheet${full ? ' is-full' : ''}`} aria-label={title} aria-live="polite" data-testid={testId}>
      <div className="sheet-grip" onPointerDown={down} onPointerUp={up} onPointerCancel={() => (start.current = null)}>
        <button type="button" className="sheet-handle" aria-expanded={full} aria-label={full ? 'Reducir panel' : 'Ampliar panel'} onClick={() => setFull((f) => !f)}>
          <span aria-hidden="true" />
        </button>
        <strong className="sheet-title">{title}</strong>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar panel">
          <Icon name="close" size={18} />
        </button>
      </div>
      <div className="sheet-body">{children}</div>
    </aside>
  );
}

/** Ficha del punto: fotografía oficial (o ilustración rotulada), evidencia, precisión declarada y acciones reales. */
function EntryCard({ e }: { e: Entry }) {
  const { progress, isFavorite, toggleFavorite, isCompleted, setFound, toggleVisited } = useProgress();
  const spoiler = e.spoilerLevel > progress.settings.spoilerLevel;
  const name = spoiler ? `${CATEGORY_META[e.category].singular} con spoilers ${e.spoilerLevel === 2 ? 'avanzados' : 'leves'}` : e.name;
  const fav = isFavorite(e.id);
  const found = isCompleted(e.id);
  const visited = progress.visited.includes(e.id);
  return (
    <article className="sheet-entry" data-testid="sheet-entry">
      <div className="sheet-media">
        <Media id={e.images[0]} category={e.category} label={e.name} className="sheet-img" sizes="(min-width: 1024px) 380px, 40vw" />
      </div>
      <div className="sheet-info">
        <p className="sheet-kicker">
          <span className={`dot dot-${e.category}`} aria-hidden="true" /> {CATEGORY_META[e.category].singular}
        </p>
        <Link to={entryPath(e)} className="sheet-name">
          {name}
        </Link>
        <div className="sheet-meta">
          <EvidenceBadge status={e.status} compact /> <span className="small">{PRECISION_LABEL[e.mapPosition!.precision]}</span>
          {found && <span className="chip chip-static chip-money">Encontrado/completado</span>}
        </div>
        <p className="small muted sheet-basis">{e.mapPosition!.basis}</p>
        {!spoiler && <p className="small sheet-summary">{e.summary}</p>}
        <div className="sheet-actions">
          <button type="button" className={`btn btn-sm${fav ? ' is-on' : ''}`} aria-pressed={fav} onClick={() => toggleFavorite(e.id)}>
            <Icon name="star" size={16} /> {fav ? 'Favorito' : 'Añadir a favoritos'}
          </button>
          {e.category === 'lugares' ? (
            <button type="button" className={`btn btn-sm${visited ? ' is-on' : ''}`} aria-pressed={visited} onClick={() => toggleVisited(e.id)} data-testid="sheet-visited">
              <Icon name="check" size={16} /> {visited ? 'Visitado' : 'Marcar como visitado'}
            </button>
          ) : (
            <button type="button" className={`btn btn-sm${found ? ' is-on' : ''}`} aria-pressed={found} onClick={() => setFound(e.id, !found)} data-testid="sheet-found">
              <Icon name="check" size={16} /> {found ? 'Encontrado' : 'Marcar encontrado'}
            </button>
          )}
          <Link to={entryPath(e)} className="btn btn-sm btn-neon">
            Ver ficha <Icon name="arrow_right" size={16} />
          </Link>
        </div>
        <AddToRoute entry={e} />
      </div>
    </article>
  );
}

/** Panel inferior para un punto (o grupo de puntos) del mapa. Conserva data-testid="pin-panel". */
export function EntrySheet({ group, onClose }: { group: PinGroup | undefined; onClose: () => void }) {
  const [i, setI] = useState(0);
  if (!group) return null;
  const idx = Math.min(i, group.entries.length - 1);
  const e = group.entries[idx];
  return (
    <Sheet title={group.entries.length > 1 ? `${group.entries.length} fichas en este punto` : 'Punto seleccionado'} onClose={onClose} testId="pin-panel">
      {group.entries.length > 1 && (
        <div className="chips sheet-tabs" role="group" aria-label="Fichas en este punto">
          {group.entries.map((x, n) => (
            <button key={x.id} type="button" className={`chip${n === idx ? ' is-on' : ''}`} aria-pressed={n === idx} onClick={() => setI(n)}>
              {x.name}
            </button>
          ))}
        </div>
      )}
      <EntryCard key={e.id} e={e} />
    </Sheet>
  );
}

/** Crear o editar un marcador personal con nota privada. */
export function MarkerSheet({ marker, onClose }: { marker: CustomMarker; onClose: () => void }) {
  const { saveMarker, deleteMarker, progress } = useProgress();
  const exists = progress.markers.some((m) => m.id === marker.id);
  const [name, setName] = useState(marker.name);
  const [note, setNote] = useState(marker.note);
  const [icon, setIcon] = useState<MarkerIcon>(marker.icon);
  return (
    <Sheet title={exists ? 'Marcador personal' : 'Nuevo marcador personal'} onClose={onClose} testId="marker-sheet">
      <form
        className="marker-form"
        onSubmit={(ev) => {
          ev.preventDefault();
          saveMarker({ ...marker, name: name.trim() || 'Marcador', note, icon });
          onClose();
        }}
      >
        <p className="small muted">Solo en este dispositivo. La posición la eliges tú; no es un dato del juego ni se publica.</p>
        <label htmlFor="mk-name">Nombre</label>
        <input id="mk-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="Ej.: Atardecer en la playa" />
        <label htmlFor="mk-note">Nota privada</label>
        <textarea id="mk-note" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
        <fieldset className="marker-icons">
          <legend>Icono</legend>
          {MARKER_ICONS.map((ic) => (
            <label key={ic} className={`chip${icon === ic ? ' is-on' : ''}`}>
              <input type="radio" name="mk-icon" value={ic} checked={icon === ic} onChange={() => setIcon(ic)} className="sr-only" />
              <Icon name={MARKER_ICON_NAME[ic]} size={16} /> {MARKER_ICON_LABEL[ic]}
            </label>
          ))}
        </fieldset>
        <div className="btn-row">
          <button type="submit" className="btn btn-cta">
            Guardar marcador
          </button>
          {exists && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                deleteMarker(marker.id);
                onClose();
              }}
            >
              <Icon name="trash" size={16} /> Borrar
            </button>
          )}
        </div>
      </form>
    </Sheet>
  );
}
