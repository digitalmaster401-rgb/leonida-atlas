import { useState } from 'react';
import { baseEntries, entries, mediaById, OVERRIDE_KEY, sources, usingOverride } from '../data';
import { validateDataset } from '../data/schema';
import { downloadJson } from '../lib/share';
import { Seo } from '../components/Seo';
import { Icon } from '../components/Icon';

/** Panel editorial local: valida, previsualiza y exporta el contenido. No publica nada en línea. */
export function EditorPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ ok: boolean; messages: string[]; count?: number } | null>(null);

  const validate = (raw: string) => {
    try {
      const json = JSON.parse(raw);
      const r = validateDataset(json, sources, new Set(mediaById.keys()));
      setResult(r.ok ? { ok: true, messages: ['Contenido válido.'], count: r.entries.length } : { ok: false, messages: r.errors });
      return r.ok;
    } catch (e) {
      setResult({ ok: false, messages: ['JSON inválido: ' + (e as Error).message] });
      return false;
    }
  };

  return (
    <div className="page">
      <Seo title="Herramientas del editor" description="Validación local del contenido de LEONIDA ATLAS." />
      <header className="page-head">
        <h1>
          <Icon name="note" size={28} /> Herramientas del editor
        </h1>
        <p className="lead">
          Para el dueño de la guía. Valida un archivo de fichas contra el esquema (campos obligatorios, fuentes existentes, «contrastado» con dos fuentes, imágenes del manifiesto) y
          previsualízalo en este dispositivo. Para publicar cambios, reemplaza <code>content/entries.json</code> en el repositorio y vuelve a desplegar.
        </p>
      </header>
      <section className="panel">
        <div className="btn-row">
          <button type="button" className="btn" onClick={() => downloadJson('entries.json', baseEntries)}>
            <Icon name="download" size={18} /> Descargar contenido publicado
          </button>
          <label className="btn">
            <Icon name="upload" size={18} /> Cargar archivo JSON
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const t = await f.text();
                setText(t);
                validate(t);
              }}
            />
          </label>
        </div>
        <label htmlFor="editor-json">O pega el JSON aquí</label>
        <textarea id="editor-json" rows={10} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} className="mono" />
        <div className="btn-row">
          <button type="button" className="btn btn-cta" onClick={() => validate(text)} disabled={!text.trim()}>
            Validar
          </button>
          <button
            type="button"
            className="btn"
            disabled={!result?.ok}
            onClick={() => {
              if (validate(text)) {
                localStorage.setItem(OVERRIDE_KEY, text);
                window.location.reload();
              }
            }}
          >
            Previsualizar en este dispositivo
          </button>
          {usingOverride && (
            <button
              type="button"
              className="btn btn-ghost btn-danger"
              onClick={() => {
                localStorage.removeItem(OVERRIDE_KEY);
                window.location.reload();
              }}
            >
              Quitar vista previa
            </button>
          )}
        </div>
        {result && (
          <div className={result.ok ? 'ok-box' : 'alert'} role="status" data-testid="editor-result">
            {result.ok ? (
              <p>Contenido válido: {result.count} fichas.</p>
            ) : (
              <>
                <p>Se encontraron {result.messages.length} problemas:</p>
                <ul className="small">
                  {result.messages.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        <p className="muted small">Contenido activo: {entries.length} fichas{usingOverride ? ' (vista previa local)' : ' (publicado)'}.</p>
      </section>
    </div>
  );
}
