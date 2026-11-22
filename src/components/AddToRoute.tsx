import { useState } from 'react';
import { Link } from 'react-router';
import type { Entry } from '../data/schema';
import { useProgress } from '../hooks/progress';
import { useToast } from '../hooks/toast';
import { addStop, newRoute } from '../lib/routes';
import { MAX_STOPS } from '../lib/storage';
import { Icon } from './Icon';

/** Añade una ficha con punto en el mapa a una ruta personal existente o nueva. */
export function AddToRoute({ entry }: { entry: Entry }) {
  const { progress, saveRoute } = useProgress();
  const toast = useToast();
  const [target, setTarget] = useState('nueva');
  if (!entry.mapPosition) return null;
  const add = () => {
    const r = target === 'nueva' ? newRoute(`Ruta ${progress.routes.length + 1}`) : progress.routes.find((x) => x.id === target);
    if (!r) return;
    if (r.stops.length >= MAX_STOPS) {
      toast.show(`La ruta ya tiene ${MAX_STOPS} paradas.`);
      return;
    }
    saveRoute(addStop(r, entry.id));
    toast.show(`Añadida a «${r.name}».`);
  };
  return (
    <div className="add-route" data-testid="add-to-route">
      <label htmlFor="add-route-sel" className="small">
        Añadir a una ruta
      </label>
      <div className="btn-row">
        <select id="add-route-sel" value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="nueva">Ruta nueva</option>
          {progress.routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.stops.length})
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-sm" onClick={add}>
          <Icon name="flag" size={16} /> Añadir
        </button>
        <Link to="/mis-rutas" className="btn btn-sm btn-ghost">
          Mis rutas
        </Link>
      </div>
    </div>
  );
}
