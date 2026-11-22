import { useRef, useState } from 'react';
import { entryById } from '../data';
import { SPOILER_LABEL } from '../data/meta';
import { useProgress } from '../hooks/progress';
import { useToast } from '../hooks/toast';
import { backupCurrent, emptyProgress, makeExport, mergeProgress, parseImport, restoreBackup, type ExportedPhoto, type Progress } from '../lib/storage';
import { clearPhotos, exportPhotos, importPhotos, photosAvailable } from '../lib/photos';
import { PHOTOS_CHANGED } from './PhotoGallery';
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
  const [pending, setPending] = useState<{ data: Progress; unknown: string[]; photos: ExportedPhoto[] } | null>(null);
  const [withPhotos, setWithPhotos] = useState(false);
  const [error, setError] = useState('');

  const onFile = async (file: File | undefined) => {
    setError('');
    if (!file) return;
    const res = parseImport(await file.text(), new Set(entryById.keys()));
    if (!res.ok) setError(res.error);
    else setPending({ data: res.data, unknown: res.unknownIds, photos: res.photos });
    if (fileRef.current) fileRef.current.value = '';
  };

  const apply = async (mode: 'merge' | 'replace') => {
    if (!pending) return;
    backupCurrent();
    replace(mode === 'merge' ? mergeProgress(progress, pending.data) : { ...pending.data, settings: pending.data.settings });
    let added = 0;
    if (pending.photos.length && photosAvailable()) {
      try {
        added = await importPhotos(pending.photos);
        window.dispatchEvent(new Event(PHOTOS_CHANGED));
      } catch {
        setError('El progreso se importó, pero no se pudieron guardar las fotos.');
      }
    }
    setPending(null);
    toast.show(
      (mode === 'merge' ? 'Progreso combinado.' : 'Progreso reemplazado.') + (added ? ` ${added} fotos añadidas.` : '') + ' Se guardó un respaldo del anterior.',
    );
  };

  const doExport = async () => {
    let photos: ExportedPhoto[] | undefined;
    if (withPhotos && photosAvailable()) {
      try {
        photos = await exportPhotos();
      } catch {
        toast.show('No se pudieron leer las fotos; se exporta sin ellas.');
      }
    }
    downloadJson(`leonida-atlas-progreso-${new Date().toISOString().slice(0, 10)}.json`, makeExport(progress, photos));
  };

  return (
    <section className="panel" aria-labelledby="pm-h">
      <h2 id="pm-h">Respaldo de tu progreso</h2>
      <p className="muted small">
        Tus favoritos, completados, notas, registros, contadores, equipamientos, rutas, garaje y fotos se guardan solo en este dispositivo (almacenamiento local, esquema v{progress.schemaVersion}). Nadie más los ve. Exporta un archivo para
        pasarlos a otro teléfono.
      </p>
      {!persisted && (
        <p className="alert" role="alert">
          <Icon name="alert" size={18} /> Tu navegador no permite guardar datos (modo privado o almacenamiento lleno). Los cambios se perderán al cerrar.
        </p>
      )}
      <label className="check">
        <input type="checkbox" checked={withPhotos} onChange={(e) => setWithPhotos(e.target.checked)} data-testid="export-photos" /> Incluir mis fotos en el archivo (más pesado)
      </label>
      <div className="btn-row">
        <button type="button" className="btn" onClick={doExport} data-testid="export-btn">
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
            if (window.confirm('¿Borrar favoritos, completados, notas, registros, equipamientos, rutas y garaje de este dispositivo? Se guardará un respaldo (las fotos se conservan).')) {
              backupCurrent();
              replace({ ...emptyProgress(), settings: progress.settings, profile: progress.profile });
              toast.show('Datos borrados. Puedes restaurar el respaldo.');
            }
          }}
        >
          Borrar mis datos
        </button>
        {photosAvailable() && (
          <button
            type="button"
            className="btn btn-ghost btn-danger"
            onClick={() => {
              if (window.confirm('¿Borrar todas tus fotos de este dispositivo? No se puede deshacer; exporta antes si quieres conservarlas.'))
                clearPhotos().then(() => {
                  window.dispatchEvent(new Event(PHOTOS_CHANGED));
                  toast.show('Fotos borradas.');
                });
            }}
          >
            <Icon name="trash" size={18} /> Borrar mis fotos
          </button>
        )}
      </div>
      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}
      {pending && (
        <div className="import-preview" role="dialog" aria-label="Confirmar importación">
          <p>
            Archivo válido: {pending.data.favorites.length} guardados, {pending.data.completed.length} completados, {Object.keys(pending.data.notes).length} notas,{' '}
            {pending.data.loadouts.length} equipamientos, {pending.data.routes.length} rutas, {pending.data.garage.length} vehículos en el garaje y {pending.photos.length} fotos.
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
