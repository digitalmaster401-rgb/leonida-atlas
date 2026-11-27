import type { ReactNode } from 'react';
import type { Category, Status } from '../data/schema';
import { STATUS_META } from '../data/meta';
import { Media } from './Media';
import { Icon } from './Icon';

const HERO: Partial<Record<Category, string>> = {
  vehiculos: 'ue-cheetah',
  armas: 'ue-revolveres',
  dinero: 'jl-banco',
  negocios: 'ue-stock305',
  coleccionables: 'keys-buceo',
  lugares: 'vc-skyline-noche',
  personajes: 'p-jason',
  rutas: 'mk-carretera',
};
const ORDER: Status[] = ['oficial', 'comprobado', 'contrastado', 'reportado', 'pendiente', 'obsoleto'];

/** Encabezado cinematográfico de catálogo: foto oficial protagonista, título inclinado y reparto real de evidencia. */
export function CatalogHero({ category, title, icon, intro, list, heroMedia, children }: { category: Category; title: string; icon: string; intro: ReactNode; list: { status: Status }[]; heroMedia?: string; children?: ReactNode }) {
  const counts = ORDER.map((s) => [s, list.filter((e) => e.status === s).length] as const).filter(([, n]) => n > 0);
  return (
    <header className="cat-hero" data-testid="catalog-hero">
      <div className="cat-hero-bg" aria-hidden="true">
        <Media id={heroMedia ?? HERO[category]} category={category} label={title} className="cat-hero-img" sizes="100vw" eager />
      </div>
      <div className="cat-hero-copy">
        <p className="cat-hero-kicker">
          <Icon name={icon} size={18} /> {list.length} fichas
        </p>
        <h1 className="cat-hero-title">{title}</h1>
        <div className="cat-hero-lead">{intro}</div>
        <ul className="cat-hero-ev" aria-label="Fichas por estado de verificación">
          {counts.map(([s, n]) => (
            <li key={s} className={`ev-pill ev-pill-${s}`}>
              {n} {STATUS_META[s].label.toLowerCase()}
            </li>
          ))}
        </ul>
        {children}
      </div>
      <p className="hero-credit">Imagen oficial © Rockstar Games</p>
    </header>
  );
}
