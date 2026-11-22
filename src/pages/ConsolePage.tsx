import { useSearchParams } from 'react-router';
import { consoleData } from '../data/fase2';
import type { ConsolePlatform } from '../data/schema-fase2';
import { useProgress } from '../hooks/progress';
import { Icon } from '../components/Icon';
import { Seo } from '../components/Seo';
import { SourceLinks } from '../components/SourceLinks';
import { setQueryParam } from '../lib/query';
import { formatDate } from '../lib/calc';

export function ConsolePage() {
  const { progress } = useProgress();
  const [params, setParams] = useSearchParams();
  const ids = consoleData.platforms.map((p) => p.id);
  const q = params.get('plataforma') as ConsolePlatform | null;
  const platform: ConsolePlatform = q && ids.includes(q) ? q : (progress.profile.platform ?? 'ps5');
  const name = consoleData.platforms.find((p) => p.id === platform)!.name;
  const sections = consoleData.sections.map((s) => ({ ...s, items: s.items.filter((i) => i.platforms.includes(platform)) })).filter((s) => s.items.length);
  return (
    <div className="page">
      <Seo title="Ajustes de consola" description="Configuración documentada de GTA VI en PS5, PS5 Pro y Xbox Series X|S." />
      <header className="page-head">
        <h1>
          <Icon name="sliders" size={28} /> Ajustes de consola
        </h1>
        <p className="lead">
          Qué se puede ajustar en GTA VI y qué no, por consola. Separamos los ajustes del juego de los de la consola. Las rutas de menú siguen los nombres en inglés que citan las guías.
        </p>
        <p className="muted small">
          Revisado: {formatDate(consoleData.verifiedAt)} · {consoleData.patch}
        </p>
      </header>
      <div className="chips" role="group" aria-label="Consola">
        {consoleData.platforms.map((p) => (
          <button key={p.id} type="button" className={`chip${p.id === platform ? ' is-on' : ''}`} aria-pressed={p.id === platform} onClick={() => setQueryParam(setParams, 'plataforma', p.id)}>
            {p.name}
          </button>
        ))}
      </div>
      <h2 className="section-title" data-testid="console-title">
        {name}
      </h2>
      {sections.map((s) => (
        <section key={s.id} className="panel" aria-labelledby={`cs-${s.id}`} data-testid="console-section">
          <h3 id={`cs-${s.id}`}>
            {s.title} <span className="chip chip-static">{s.scope === 'consola' ? 'Menú de la consola' : 'Menú del juego'}</span>
          </h3>
          <dl className="settings-list">
            {s.items.map((it) => (
              <div key={it.label} className="setting">
                <dt>{it.label}</dt>
                <dd>
                  <p>{it.value}</p>
                  {it.path && (
                    <p className="small">
                      <span className="muted">Ruta:</span> <code>{it.path}</code>
                    </p>
                  )}
                  <SourceLinks ids={it.sources} status={it.status} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      <p className="small muted">
        No publicamos valores «óptimos» inventados. Si una opción no aparece aquí, ninguna fuente revisada la documenta todavía. ¿Ves algo distinto en tu consola? Repórtalo desde
        cualquier ficha.
      </p>
    </div>
  );
}
