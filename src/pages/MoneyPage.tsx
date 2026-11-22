import { Link, useSearchParams } from 'react-router';
import { entriesBy } from '../data';
import { applyFilters, readFilters } from '../lib/filters';
import { FilterBar } from '../components/FilterBar';
import { CardGrid } from '../components/ItemCard';
import { EmptyState } from '../components/EmptyState';
import { MoneyCalculator } from '../components/MoneyCalculator';
import { Seo } from '../components/Seo';
import { Icon } from '../components/Icon';

const TABS = [
  { id: 'historia', label: 'Modo historia' },
  { id: 'online', label: 'Modo online' },
  { id: 'glitches', label: 'Glitches' },
] as const;

export function MoneyPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('modo') as (typeof TABS)[number]['id']) || 'historia';
  const source = entriesBy('dinero').filter((e) => e.mode === 'historia');
  const list = applyFilters(source, readFilters(params));
  const setTab = (id: string) => {
    const next = new URLSearchParams();
    if (id !== 'historia') next.set('modo', id);
    setParams(next, { replace: true });
  };
  return (
    <div className="page">
      <Seo title="Dinero y glitches" description="Métodos para ganar dinero en GTA VI separados por modo, con pago, requisitos, riesgos y nivel de evidencia. Calculadora incluida." />
      <header className="page-head">
        <h1>
          <Icon name="cash" size={28} /> Dinero y glitches
        </h1>
        <p className="lead">
          Separamos modo historia, modo online y glitches. Las cifras son las publicadas por las fuentes (valor del botín o pago); no prometemos dinero infinito ni publicamos trucos que
          vulneren servicios en línea.
        </p>
      </header>
      <div className="tabs" role="tablist" aria-label="Modo de juego">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} className="tab" onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'historia' && (
          <>
            <FilterBar
              source={source}
              resultCount={list.length}
              sortOptions={[
                { value: '', label: 'Relevancia' },
                { value: 'pago', label: 'Mayor pago' },
                { value: 'evidencia', label: 'Mayor evidencia' },
                { value: 'nombre', label: 'Nombre (A–Z)' },
              ]}
            />
            <h2 className="sr-only">Métodos del modo historia</h2>
            {list.length ? <CardGrid list={list} /> : <EmptyState title="Sin métodos con estos filtros" />}
            <MoneyCalculator methods={source} />
          </>
        )}
        {tab === 'online' && (
          <EmptyState icon="alert" title="Modo online: sin información verificada">
            <p>
              Ninguna de las fuentes revisadas al {`22 nov 2026`} documenta un modo en línea de GTA VI disponible ni métodos de dinero para él. Cuando Rockstar publique información
              oficial, aparecerá aquí separada del modo historia.
            </p>
          </EmptyState>
        )}
        {tab === 'glitches' && (
          <EmptyState icon="alert" title="Ningún glitch publicado">
            <p>
              Solo publicamos glitches con dos fuentes independientes, paso a paso reproducible, consola, parche y riesgo de que deje de funcionar. Hasta hoy ninguno cumple ese criterio.
              Tampoco publicaremos trucos que afecten servicios en línea o eviten sanciones.
            </p>
            <p>
              <Link to="/intel?seccion=observacion&categoria=glitch" className="btn">
                Ver glitches en observación en ATLAS INTELLIGENCE
              </Link>
            </p>
          </EmptyState>
        )}
      </div>
    </div>
  );
}
