import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { Category } from '../data/schema';
import { entries } from '../data';
import { groupPins, MapLegend, MapView, PinPanel } from '../components/MapView';
import { Seo } from '../components/Seo';
import { Icon } from '../components/Icon';
import { setQueryParam } from '../lib/query';
import { useProgress } from '../hooks/progress';

export function MapPage() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('id');
  const located = entries.filter((e) => e.mapPosition);
  const cats = [...new Set(located.map((e) => e.category))] as Category[];
  const [active, setActive] = useState<Set<Category>>(() => new Set(cats));
  const { progress, setHideFound } = useProgress();
  const hide = progress.settings.hideFound;
  const list = useMemo(
    () => located.filter((e) => e.id === selectedId || (active.has(e.category) && !(hide && progress.completed.includes(e.id)))),
    [located, active, selectedId, hide, progress.completed],
  );
  const group = groupPins(list).find((g) => g.entries.some((e) => e.id === selectedId));
  const select = (id: string | null) => setQueryParam(setParams, 'id', id);
  return (
    <div className="page page-map">
      <Seo title="Mapa de Leonida" description="Visor del mapa oficial de Leonida con puntos de precisión declarada enlazados a cada ficha." />
      <header className="page-head">
        <h1>
          <Icon name="map" size={28} /> Mapa de Leonida
        </h1>
        <p className="lead">
          Póster oficial de Rockstar Games con {located.length} fichas ubicadas. Cada punto declara su precisión. Toca uno para ver la ficha.
        </p>
      </header>
      <MapLegend
        cats={cats}
        active={active}
        onToggle={(c) =>
          setActive((s) => {
            const n = new Set(s);
            if (n.has(c)) n.delete(c);
            else n.add(c);
            return n;
          })
        }
      />
      <label className="check">
        <input type="checkbox" checked={hide} onChange={(e) => setHideFound(e.target.checked)} data-testid="map-hide-found" /> Ocultar lo que ya encontré o completé
      </label>
      <div className="map-area">
        <MapView list={list} selectedId={selectedId} onSelect={select} />
        <PinPanel group={group} onClose={() => select(null)} />
      </div>
      <p className="small muted">
        Mapa © Rockstar Games, de la sección oficial de descargas{' '}
        <a href="https://www.rockstargames.com/VI/media" target="_blank" rel="noopener noreferrer">
          rockstargames.com/VI/media
        </a>
        . Es un póster ilustrado: la escala y los rótulos son los del póster, no coordenadas del juego.
      </p>
    </div>
  );
}
