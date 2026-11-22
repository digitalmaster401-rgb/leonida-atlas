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
  const [params] = useSearchParams();
  const source = entriesBy(category);
  const list = applyFilters(source, readFilters(params));
  return (
    <div className="page">
      <Seo title={meta.label} description={meta.description} />
      <header className="page-head">
        <h1>
          <Icon name={meta.icon} size={28} /> {meta.label}
        </h1>
        <p className="lead">{INTRO[category] ?? meta.description}</p>
        {category === 'vehiculos' && (
          <Link to="/comparar-vehiculos" className="btn btn-cta">
            <Icon name="layers" size={18} /> Comparar vehículos y mi garaje
          </Link>
        )}
      </header>
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
