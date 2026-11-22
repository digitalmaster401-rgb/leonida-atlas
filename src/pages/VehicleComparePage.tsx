import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { entries, entryPath } from '../data';
import { EDITION_LABEL, REGION_LABEL } from '../data/meta';
import { useProgress } from '../hooks/progress';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { Icon } from '../components/Icon';
import { Media } from '../components/Media';
import { Seo } from '../components/Seo';
import { SourceLinks } from '../components/SourceLinks';
import { money } from '../lib/calc';
import { setQueryParam } from '../lib/query';
import { bestIndex, MAX_COMPARE, parseCompare, sortVehicles, TRACKER_LABEL, vehicleEntries, type SortKey, type VehicleEntry } from '../lib/vehicles';

const ALL = vehicleEntries(entries);
const VALID = new Set(ALL.map((v) => v.id));

function GarageButton({ v }: { v: VehicleEntry }) {
  const { inGarage, toggleGarage } = useProgress();
  const on = inGarage(v.id);
  return (
    <button type="button" className={`btn btn-sm${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => toggleGarage(v.id)} aria-label={on ? `Quitar ${v.name} de mi garaje` : `Añadir ${v.name} a mi garaje`}>
      <Icon name="car" size={16} /> {on ? 'En mi garaje' : 'A mi garaje'}
    </button>
  );
}

export function VehicleComparePage() {
  const [params, setParams] = useSearchParams();
  const { progress } = useProgress();
  const sel = parseCompare(params.get('v'), VALID);
  const chosen = sel.map((id) => ALL.find((v) => v.id === id)!);
  const [sort, setSort] = useState<SortKey>('registro');
  const [cls, setCls] = useState('');
  const [onlyGarage, setOnlyGarage] = useState(false);
  const classes = [...new Set(ALL.map((v) => v.vehicle.class))].sort();
  const catalog = useMemo(
    () => sortVehicles(ALL.filter((v) => (!cls || v.vehicle.class === cls) && (!onlyGarage || progress.garage.includes(v.id))), sort),
    [sort, cls, onlyGarage, progress.garage],
  );
  const setSel = (ids: string[]) => setQueryParam(setParams, 'v', ids.length ? ids.join(',') : null);
  const toggle = (id: string) => setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id].slice(0, MAX_COMPARE));

  const rows: { label: string; render: (v: VehicleEntry) => React.ReactNode; best?: (number | null)[] }[] = [
    { label: 'Clase', render: (v) => v.vehicle.class },
    { label: 'Fabricante', render: (v) => v.vehicle.manufacturer ?? '—' },
    {
      label: 'Valor de registro',
      render: (v) => (v.vehicle.registration !== null ? money(v.vehicle.registration) : <span className="muted">No publicado</span>),
      best: chosen.map((v) => v.vehicle.registration),
    },
    {
      label: 'Valor de venta',
      render: (v) => (v.vehicle.sellValue !== null ? money(v.vehicle.sellValue) : <span className="muted">No publicado</span>),
      best: chosen.map((v) => v.vehicle.sellValue),
    },
    { label: 'Rastreador', render: (v) => (v.vehicle.tracker ? TRACKER_LABEL[v.vehicle.tracker] : <span className="muted">No publicado</span>) },
    { label: 'Cómo se consigue', render: (v) => v.vehicle.acquisition },
    { label: 'Zona', render: (v) => v.subzone ?? REGION_LABEL[v.region] },
    { label: 'Edición', render: (v) => EDITION_LABEL[v.edition] },
    {
      label: 'Evidencia del precio',
      render: (v) => (v.vehicle.priceStatus ? <SourceLinks ids={v.vehicle.priceSources} status={v.vehicle.priceStatus} /> : <span className="muted">Sin precio publicado</span>),
    },
    { label: 'Evidencia de la ficha', render: (v) => <EvidenceBadge status={v.status} compact /> },
  ];

  return (
    <div className="page">
      <Seo title="Comparar vehículos" description="Compara vehículos de GTA VI por clase, valor de registro, valor de venta y rastreador, con la evidencia de cada dato." />
      <header className="page-head">
        <h1>
          <Icon name="car" size={28} /> Comparar vehículos
        </h1>
        <p className="lead">Elige hasta {MAX_COMPARE} vehículos. Solo se muestran valores publicados, con su evidencia. Lo que nadie ha publicado aparece como «No publicado», nunca como cero.</p>
      </header>

      <section className="panel alerts" aria-labelledby="how-h">
        <h2 id="how-h">
          <Icon name="alert" size={20} /> Cómo se valoran los autos (reportado)
        </h2>
        <ul className="fact-list">
          <li>
            Los precios vienen de escaneos con la app WAINK del juego publicados tras el lanzamiento. Las dos guías que los publican comparten el mismo origen, así que cuentan como una
            sola fuente. <SourceLinks ids={['gurugamer-cars', 'gta6supercars-cars']} status="reportado" />
          </li>
          <li>
            Registrar un auto cuesta aproximadamente de dos a tres veces su valor de venta, y el daño reduce el valor de venta.{' '}
            <SourceLinks ids={['gurugamer-cars', 'gta6supercars-cars']} status="reportado" />
          </li>
          <li>
            Un auto con rastreador no se puede modificar hasta registrarlo; el registro y la venta con rastreador se hacen en un Pay &apos;n&apos; Spray cuando la historia lo
            desbloquea. <SourceLinks ids={['gtabase-car-stealing']} status="reportado" />
          </li>
        </ul>
      </section>

      {chosen.length > 0 && (
        <section className="section" aria-labelledby="cmp-h">
          <h2 id="cmp-h" className="section-title">
            Comparación ({chosen.length}/{MAX_COMPARE})
          </h2>
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Tabla de comparación de vehículos">
            <table className="facts compare-table" data-testid="vehicle-compare">
              <thead>
                <tr>
                  <th scope="col">Dato</th>
                  {chosen.map((v) => (
                    <th scope="col" key={v.id}>
                      <div className="cmp-head">
                        <Media id={v.images[0]} category="vehiculos" label={v.name} sizes="200px" />
                        <Link to={entryPath(v)}>{v.name}</Link>
                        <div className="btn-row">
                          <GarageButton v={v} />
                          <button type="button" className="btn btn-sm btn-ghost" onClick={() => toggle(v.id)} aria-label={`Quitar ${v.name} de la comparación`}>
                            <Icon name="close" size={16} />
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const b = r.best ? bestIndex(r.best) : null;
                  return (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      {chosen.map((v, i) => (
                        <td key={v.id} className={b === i ? 'is-best' : undefined}>
                          {r.render(v)}
                          {b === i && <span className="sr-only"> (el más alto)</span>}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="cat-h">
        <h2 id="cat-h" className="section-title">
          Catálogo ({catalog.length})
        </h2>
        <div className="filters">
          <div className="btn-row">
            <div className="field">
              <label htmlFor="v-sort">Ordenar por</label>
              <select id="v-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                <option value="registro">Valor de registro (mayor primero)</option>
                <option value="venta">Valor de venta (mayor primero)</option>
                <option value="nombre">Nombre</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="v-class">Clase</label>
              <select id="v-class" value={cls} onChange={(e) => setCls(e.target.value)}>
                <option value="">Todas</option>
                {classes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="check">
            <input type="checkbox" checked={onlyGarage} onChange={(e) => setOnlyGarage(e.target.checked)} /> Solo mi garaje ({progress.garage.filter((id) => VALID.has(id)).length})
          </label>
        </div>
        <ul className="vehicle-list">
          {catalog.map((v) => {
            const on = sel.includes(v.id);
            return (
              <li key={v.id} className={`panel vehicle-row${on ? ' is-on' : ''}`} data-testid="vehicle-row" data-id={v.id}>
                <div className="vehicle-row-main">
                  <Link to={entryPath(v)}>
                    <strong>{v.name}</strong>
                  </Link>
                  <span className="muted small">
                    {v.vehicle.class} · {v.vehicle.registration !== null ? `registro ${money(v.vehicle.registration)}` : 'registro no publicado'} ·{' '}
                    {v.vehicle.sellValue !== null ? `venta ${money(v.vehicle.sellValue)}` : 'venta no publicada'}
                  </span>
                  <EvidenceBadge status={v.vehicle.priceStatus ?? v.status} compact />
                </div>
                <div className="btn-row">
                  <button
                    type="button"
                    className={`btn btn-sm${on ? ' is-on' : ''}`}
                    aria-pressed={on}
                    disabled={!on && sel.length >= MAX_COMPARE}
                    onClick={() => toggle(v.id)}
                    aria-label={on ? `Quitar ${v.name} de la comparación` : `Comparar ${v.name}`}
                  >
                    <Icon name="layers" size={16} /> {on ? 'Comparando' : 'Comparar'}
                  </button>
                  <GarageButton v={v} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
