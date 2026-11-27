import { Link, useSearchParams } from 'react-router';
import type { Category } from '../data/schema';
import { entriesBy } from '../data';
import { CATEGORY_META } from '../data/meta';
import { applyFilters, readFilters } from '../lib/filters';
import { FilterBar } from '../components/FilterBar';
import { CardGrid } from '../components/ItemCard';
import { EmptyState } from '../components/EmptyState';
import { Seo } from '../components/Seo';
import { Icon } from '../components/Icon';
import { CatalogHero } from '../components/CatalogHero';
import { setQueryParam } from '../lib/query';
import type { Entry } from '../data/schema';

/** Tipo visible en los chips: clase del vehículo o etiqueta principal del arma (siempre de los datos). */
const TYPE_LABEL: Record<string, string> = { 'ammu-nation': 'Ammu-Nation', unica: 'Únicas', gratis: 'Gratuitas', pistola: 'Pistolas', revolver: 'Revólveres', cosmetico: 'Cosméticas' };
export function typeOf(e: Entry): string | null {
  if (e.category === 'vehiculos') return e.vehicle?.class ?? null;
  if (e.category === 'armas') return e.tags[0] ?? null;
  return null;
}

const INTRO: Partial<Record<Category, string>> = {
  armas:
    'Las armas confirmadas por Rockstar aparecen como «oficiales». Los precios de Ammu-Nation y las armas únicas provienen de una sola guía publicada tras el lanzamiento y se marcan como «reportados» hasta contrastarlos.',
  vehiculos:
    'Vehículos oficiales y vehículos con valores de registro y venta reportados por escaneos publicados tras el lanzamiento (una sola fuente de origen). No inventamos ubicaciones.',
  negocios: 'Tiendas, talleres, garajes y propiedades confirmados. Varios solo abren con Ultimate Edition o el Vintage Vice City Pack.',
  rutas: 'Recorridos y tutoriales elaborados para LEONIDA ATLAS a partir de las fuentes citadas y del mapa oficial.',
  lugares: 'Las seis regiones oficiales de Leonida y zonas mencionadas por Rockstar, con su punto en el mapa oficial.',
  personajes: 'Biografías tomadas de la página oficial «Only in Leonida». Sin spoilers de la trama.',
};

export function CategoryPage({ category }: { category: Category }) {
  const meta = CATEGORY_META[category];
  const [params, setParams] = useSearchParams();
  const source = entriesBy(category);
  const tipo = params.get('tipo');
  const types = [...new Set(source.map(typeOf).filter((t): t is string => !!t))].sort();
  const list = applyFilters(source, readFilters(params)).filter((e) => !tipo || typeOf(e) === tipo);
  return (
    <div className="page">
      <Seo title={meta.label} description={meta.description} />
      <CatalogHero category={category} title={meta.label} icon={meta.icon} intro={<p>{INTRO[category] ?? meta.description}</p>} list={source}>
        <div className="btn-row">
          {category === 'vehiculos' && (
            <Link to="/comparar-vehiculos" className="btn btn-glow">
              <Icon name="layers" size={18} /> Comparar vehículos y mi garaje
            </Link>
          )}
          {category === 'armas' && (
            <Link to="/equipamiento" className="btn btn-glow">
              <Icon name="layers" size={18} /> Constructor de equipamiento
            </Link>
          )}
          <Link to={`/mapa`} className="btn btn-neon">
            <Icon name="map" size={18} /> Ver en el mapa
          </Link>
        </div>
      </CatalogHero>
      {types.length > 1 && (
        <div className="type-chips" role="group" aria-label="Tipo">
          <button type="button" className={`map-chip${!tipo ? ' is-on' : ''}`} aria-pressed={!tipo} onClick={() => setQueryParam(setParams, 'tipo', null)}>
            Todos ({source.length})
          </button>
          {types.map((t) => (
            <button key={t} type="button" className={`map-chip${tipo === t ? ' is-on' : ''}`} aria-pressed={tipo === t} onClick={() => setQueryParam(setParams, 'tipo', tipo === t ? null : t)}>
              {TYPE_LABEL[t] ?? t} <span className="map-chip-n">{source.filter((e) => typeOf(e) === t).length}</span>
            </button>
          ))}
        </div>
      )}
      <FilterBar source={source} resultCount={list.length} />
      <h2 className="sr-only">Fichas</h2>
      {list.length ? (
        <CardGrid list={list} eagerFirst />
      ) : (
        <EmptyState title="Sin resultados con estos filtros">Prueba quitar algún filtro o cambiar la región.</EmptyState>
      )}
    </div>
  );
}
