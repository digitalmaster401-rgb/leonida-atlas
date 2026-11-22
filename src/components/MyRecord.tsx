import type { Entry } from '../data/schema';
import { useProgress } from '../hooks/progress';
import { PLATFORM_LABEL, PLATFORMS, TRACK_STATES, type Platform, type TrackState } from '../lib/storage';
import { Icon } from './Icon';

export const STATE_LABEL: Record<TrackState | 'encontrado', string> = {
  encontrado: 'Encontrado',
  pendiente: 'Pendiente',
  revisar: 'Revisar',
  no_disponible: 'No disponible',
};

/** «Mi registro» de una ficha: estado, fecha, plataforma y valoración (solo en este dispositivo). */
export function MyRecord({ entry }: { entry: Entry }) {
  const { progress, setFound, setRecord, toggleToday } = useProgress();
  const rec = progress.records[entry.id] ?? {};
  const found = progress.completed.includes(entry.id);
  const state: TrackState | 'encontrado' | '' = found ? 'encontrado' : (rec.state ?? '');
  const inToday = progress.today.includes(entry.id);
  const isCollectible = entry.category === 'coleccionables';
  return (
    <section className="panel my-record" aria-labelledby="rec-h" data-testid="my-record">
      <h2 id="rec-h">
        <Icon name="list" size={20} /> Mi registro
      </h2>
      <div className="record-grid">
        <div className="field">
          <label htmlFor="rec-state">Estado</label>
          <select
            id="rec-state"
            value={state}
            onChange={(e) => {
              const v = e.target.value as TrackState | 'encontrado' | '';
              if (v === 'encontrado') setFound(entry.id, true);
              else {
                if (found) setFound(entry.id, false);
                setRecord(entry.id, { state: v || undefined });
              }
            }}
            data-testid="rec-state"
          >
            <option value="">Sin estado</option>
            <option value="encontrado">{isCollectible ? 'Encontrado' : 'Completado'}</option>
            {TRACK_STATES.map((s) => (
              <option key={s} value={s}>
                {STATE_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="rec-date">Fecha</label>
          <input id="rec-date" type="date" value={rec.date ?? ''} max="2099-12-31" onChange={(e) => setRecord(entry.id, { date: e.target.value || undefined })} />
        </div>
        <div className="field">
          <label htmlFor="rec-platform">Plataforma</label>
          <select id="rec-platform" value={rec.platform ?? ''} onChange={(e) => setRecord(entry.id, { platform: (e.target.value || undefined) as Platform | undefined })}>
            <option value="">Sin indicar</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
        <fieldset className="field rating">
          <legend>Mi valoración</legend>
          <div className="rating-row">
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <button
                key={n}
                type="button"
                className={`icon-btn${(rec.rating ?? 0) >= n ? ' is-on' : ''}`}
                aria-pressed={rec.rating === n}
                aria-label={`${n} de 5`}
                onClick={() => setRecord(entry.id, { rating: rec.rating === n ? undefined : n })}
              >
                <Icon name="star" size={18} />
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <button type="button" className={`btn btn-sm${inToday ? ' is-on' : ''}`} aria-pressed={inToday} onClick={() => toggleToday(entry.id)} data-testid="btn-today">
        <Icon name="list" size={16} /> {inToday ? 'En mi lista para hoy' : 'Añadir a mi lista para hoy'}
      </button>
    </section>
  );
}
