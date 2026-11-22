import { useRef, useState } from 'react';
import { entryById } from '../data';
import { SPOILER_LABEL } from '../data/meta';
import { useProgress } from '../hooks/progress';
import { useToast } from '../hooks/toast';
import { backupCurrent, emptyProgress, makeExport, mergeProgress, parseImport, restoreBackup, type Progress } from '../lib/storage';
import { downloadJson } from '../lib/share';
import { Icon } from './Icon';

export function SpoilerSetting() {
  const { progress, setSpoilerLevel } = useProgress();
  return (
    <fieldset className="panel spoiler-setting">
      <legend>Protección de spoilers</legend>
      <p className="muted small">Las fichas por encima de este nivel aparecen veladas hasta que decidas mostrarlas.</p>
      {([0, 1, 2] as const).map((lvl) => (
        <label key={lvl} className="radio">
          <input type="radio" name="spoiler-level" checked={progress.settings.spoilerLevel === lvl} onChange={() => setSpoilerLevel(lvl)} />
          {SPOILER_LABEL[lvl]}
        </label>
      ))}
    </fieldset>
  );
}

export function ProgressManager() {
  const { progress, replace, persisted } = useProgress();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ data: Progress; unknown: string[] } | null>(null);
  const [error, setError] = useState('');

  const onFile = async (file: File | undefined) => {
    setError('');
    if (!file) return;
    const res = parseImport(await file.text(), new Set(entryById.keys()));
    if (!res.ok) setError(res.error);
    else setPending({ data: res.data, unknown: res.unknownIds });
    if (fileRef.current) fileRef.current.value = '';
  };

  const apply = (mode: 'merge' | 'replace') => {
    if (!pending) return;
    backupCurrent();
    replace(mode === 'merge' ? mergeProgress(progress, pending.data) : { ...pending.data, settings: pending.data.settings });
    setPending(null);
    toast.show(mode === 'merge' ? 'Progreso combinado. Se guardó un respaldo del anterior.' : 'Progreso reemplazado. Se guardó un respaldo del anterior.');
  };

  return (
    <section className="panel" aria-labelledby="pm-h">
      <h2 id="pm-h">Respaldo de tu progreso</h2>
      <p className="muted small">
        Tus favoritos, completados y notas se guardan solo en este dispositivo (almacenamiento local, esquema v{progress.schemaVersion}). Nadie más los ve. Exporta un archivo para
        pasarlos a otro teléfono.
      </p>
      {!persisted && (
        <p className="alert" role="alert">
          <Icon name="alert" size={18} /> Tu navegador no permite guardar datos (modo privado o almacenamiento lleno). Los cambios se perderán al cerrar.
        </p>
      )}
      <div className="btn-row">
        <button type="button" className="btn" onClick={() => downloadJson(`leonida-atlas-progreso-${new Date().toISOString().slice(0, 10)}.json`, makeExport(progress))}>
          <Icon name="download" size={18} /> Exportar JSON
        </button>
        <label className="btn">
          <Icon name="upload" size={18} /> Importar JSON
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} data-testid="import-input" />
        </label>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            const b = restoreBackup();
            if (!b) toast.show('No hay respaldo guardado.');
            else {
              replace(b);
              toast.show('Respaldo restaurado.');
            }
          }}
        >
          Restaurar respaldo
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-danger"
          onClick={() => {
            if (window.confirm('¿Borrar favoritos, completados y notas de este dispositivo? Se guardará un respaldo.')) {
              backupCurrent();
              replace({ ...emptyProgress(), settings: progress.settings });
              toast.show('Datos borrados. Puedes restaurar el respaldo.');
            }
          }}
        >
          Borrar mis datos
        </button>
      </div>
      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}
      {pending && (
        <div className="import-preview" role="dialog" aria-label="Confirmar importación">
          <p>
            Archivo válido: {pending.data.favorites.length} guardados, {pending.data.completed.length} completados y {Object.keys(pending.data.notes).length} notas.
            {pending.unknown.length > 0 && ` ${pending.unknown.length} elementos no existen en esta versión de la guía y se conservarán sin mostrarse.`}
          </p>
          <div className="btn-row">
            <button type="button" className="btn btn-cta" onClick={() => apply('merge')}>
              Combinar con lo actual
            </button>
            <button type="button" className="btn" onClick={() => apply('replace')}>
              Reemplazar todo
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setPending(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
