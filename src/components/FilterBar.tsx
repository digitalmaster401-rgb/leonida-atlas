import { useSearchParams } from 'react-router';
import type { Entry } from '../data/schema';
import { CATEGORY_META, CATEGORY_ORDER, EDITION_LABEL, REGION_LABEL, STATUS_META } from '../data/meta';
import { chaptersOf } from '../data';
import { FILTER_KEYS, readFilters, type Filters } from '../lib/filters';
import { Icon } from './Icon';
import { setQueryParam } from '../lib/query';

interface Props {
  source: Entry[];
  showCategory?: boolean;
  resultCount: number;
  sortOptions?: { value: string; label: string }[];
}

const DEFAULT_SORT = [
  { value: '', label: 'Relevancia' },
  { value: 'nombre', label: 'Nombre (A–Z)' },
  { value: 'evidencia', label: 'Mayor evidencia' },
  { value: 'pago', label: 'Mayor pago / precio' },
];

export function FilterBar({ source, showCategory = false, resultCount, sortOptions = DEFAULT_SORT }: Props) {
  const [params, setParams] = useSearchParams();
  const f = readFilters(params);
  const set = (k: keyof Filters, v: string) => setQueryParam(setParams, k, v);
  const regions = [...new Set(source.map((e) => e.region))];
  const statuses = [...new Set(source.map((e) => e.status))];
  const editions = [...new Set(source.map((e) => e.edition))];
  const chapters = chaptersOf(source);
  const active = FILTER_KEYS.filter((k) => k !== 'sort' && f[k]).length;

  const chip = (k: keyof Filters, v: string, label: string) => (
    <button key={k + v} type="button" className={`chip${f[k] === v ? ' is-on' : ''}`} aria-pressed={f[k] === v} onClick={() => set(k, f[k] === v ? '' : v)}>
      {label}
    </button>
  );

  return (
    <section className="filterbar" aria-label="Filtros">
      <div className="chips" role="group" aria-label="Filtrar por región">
        {regions.length > 1 && regions.map((r) => chip('region', r, REGION_LABEL[r]))}
      </div>
      <details className="filter-more">
        <summary>
          <Icon name="filter" size={16} /> Más filtros{active ? ` (${active})` : ''}
        </summary>
        <div className="filter-grid">
          {showCategory && (
            <label>
              Categoría
              <select aria-label="Categoría" value={f.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">Todas</option>
                {CATEGORY_ORDER.filter((c) => source.some((e) => e.category === c)).map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_META[c].label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Evidencia
            <select aria-label="Evidencia" value={f.status} onChange={(e) => set('status', e.target.value)}>
              <option value="">Toda</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </label>
          {chapters.length > 0 && (
            <label>
              Capítulo
              <select aria-label="Capítulo" value={f.chapter} onChange={(e) => set('chapter', e.target.value)}>
                <option value="">Todos</option>
                {chapters.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          )}
          {editions.length > 1 && (
            <label>
              Edición / versión
              <select aria-label="Edición / versión" value={f.edition} onChange={(e) => set('edition', e.target.value)}>
                <option value="">Todas</option>
                {editions.map((ed) => (
                  <option key={ed} value={ed}>
                    {EDITION_LABEL[ed]}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Spoilers
            <select aria-label="Spoilers" value={f.spoiler} onChange={(e) => set('spoiler', e.target.value)}>
              <option value="">Mostrar todo (velado según preferencia)</option>
              <option value="0">Solo sin spoilers</option>
              <option value="1">Hasta spoilers leves</option>
              <option value="2">Incluir etapas avanzadas</option>
            </select>
          </label>
          <label>
            Ordenar por
            <select aria-label="Ordenar por" value={f.sort} onChange={(e) => set('sort', e.target.value)}>
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </details>
      <p className="result-count" aria-live="polite">
        {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
        {active > 0 && (
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              const next = new URLSearchParams();
              const q = params.get('q');
              if (q) next.set('q', q);
              setParams(next, { replace: true });
            }}
          >
            Limpiar filtros
          </button>
        )}
      </p>
    </section>
  );
}
