import { useSearchParams, Link } from 'react-router';
import { entries } from '../data';
import { search } from '../lib/search';
import { applyFilters, readFilters } from '../lib/filters';
import { FilterBar } from '../components/FilterBar';
import { CardGrid } from '../components/ItemCard';
import { EmptyState } from '../components/EmptyState';
import { Seo } from '../components/Seo';

const SUGGESTIONS = ['Moses', 'Duke 556', 'Stockyard', 'Ultimate Edition', 'caimanes', 'lancha'];

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const hits = q.trim() ? search(entries, q).map((h) => h.entry) : [];
  const f = readFilters(params);
  const list = q.trim() ? applyFilters(hits, f) : [];
  return (
    <div className="page">
      <Seo title={q ? `Buscar: ${q}` : 'Buscar'} description="Buscador de LEONIDA ATLAS, tolerante a acentos y errores leves." />
      <header className="page-head">
        <h1>{q ? <>Resultados para «{q}»</> : 'Buscar'}</h1>
        <p className="lead">Escribe en la barra superior. La búsqueda ignora acentos y tolera errores leves (por ejemplo, «moises» encuentra «Moses» y «vehiculo» encuentra «Vehículo»).</p>
      </header>
      {q.trim() ? (
        <>
          <FilterBar source={hits} showCategory resultCount={list.length} />
      <h2 className="sr-only">Fichas</h2>
          {list.length ? (
            <CardGrid list={list} />
          ) : (
            <EmptyState title="Sin coincidencias">
              <p>No hay fichas verificadas que coincidan. Si crees que falta algo, repórtalo desde cualquier ficha o en Fuentes.</p>
            </EmptyState>
          )}
        </>
      ) : (
        <div className="panel">
          <p>Sugerencias:</p>
          <div className="chips">
            {SUGGESTIONS.map((s) => (
              <Link key={s} className="chip" to={`/buscar?q=${encodeURIComponent(s)}`}>
                {s}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
