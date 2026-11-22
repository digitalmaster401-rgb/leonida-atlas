import { Link } from 'react-router';
import { changelog, entries, media, sources } from '../data';
import { REPORT_URL } from '../data/meta';
import { SourceList } from '../components/SourcePanel';
import { EvidenceLegend } from '../components/EvidenceBadge';
import { Seo } from '../components/Seo';
import { Icon } from '../components/Icon';
import { formatDate } from '../lib/calc';

export function SourcesPage() {
  const official = sources.filter((s) => s.type === 'oficial');
  const third = sources.filter((s) => s.type !== 'oficial');
  const cites = (id: string) => entries.filter((e) => e.sources.includes(id) || e.facts.some((f) => f.sources.includes(id))).length;
  return (
    <div className="page">
      <Seo title="Fuentes y cambios" description="Fuentes oficiales y guías consultadas, criterios de evidencia y registro de cambios de LEONIDA ATLAS." />
      <header className="page-head">
        <h1>
          <Icon name="book" size={28} /> Fuentes y cambios
        </h1>
        <p className="lead">Cómo verificamos, qué consultamos y qué ha cambiado.</p>
      </header>
      <section className="panel">
        <h2>Niveles de evidencia</h2>
        <EvidenceLegend />
        <p className="small muted">
          Jerarquía: 1) Rockstar Games / Take-Two; 2) comprobación en una partida documentada; 3) guías reputadas con fecha; 4) comunidad. Pagos, ubicaciones exactas y glitches
          necesitan dos fuentes independientes para pasar de «reportado» a «contrastado».
        </p>
      </section>
      <section className="panel">
        <h2>Fuentes oficiales ({official.length})</h2>
        <SourceList ids={official.map((s) => s.id)} />
      </section>
      <section className="panel">
        <h2>Guías de terceros ({third.length})</h2>
        <SourceList ids={third.map((s) => s.id)} />
        <ul className="small muted">
          {third.map((s) => (
            <li key={s.id}>
              {s.publisher}: citada en {cites(s.id)} fichas.
            </li>
          ))}
        </ul>
      </section>
      <section className="panel">
        <h2>Registro de cambios</h2>
        <ol className="changelog">
          {changelog.map((c) => (
            <li key={c.version}>
              <strong>
                v{c.version} · {formatDate(c.date)} — {c.title}
              </strong>
              <ul>
                {c.items.map((i, k) => (
                  <li key={k}>{i}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
      <section className="panel">
        <h2>Imágenes</h2>
        <p>
          {media.length} imágenes oficiales de Rockstar Games con fuente, derechos y tratamiento registrados en el{' '}
          <a href="/media/media-manifest.json" target="_blank" rel="noopener">
            manifiesto de medios
          </a>
          . Donde no hay imagen oficial adecuada usamos ilustraciones propias rotuladas «Ilustración editorial». Consulta la <Link to="/galeria">galería</Link>.
        </p>
      </section>
      <section className="panel">
        <h2>Reportar un error</h2>
        <p>Cada ficha tiene un botón «Reportar un error». También puedes abrir un reporte general:</p>
        <a className="btn" href={`${REPORT_URL}?title=${encodeURIComponent('Reporte general')}`} target="_blank" rel="noopener noreferrer">
          <Icon name="flag" size={18} /> Abrir reporte en GitHub
        </a>
      </section>
    </div>
  );
}
