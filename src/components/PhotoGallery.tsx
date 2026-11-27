import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { entryById, entryPath } from '../data';
import { addPhoto, deletePhoto, listPhotos, photosAvailable, updateCaption, type Photo } from '../lib/photos';
import { useToast } from '../hooks/toast';
import { Icon } from './Icon';

/** URL temporal para una foto; se libera al desmontar. */
function PhotoImg({ photo, alt }: { photo: Photo; alt: string }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const u = URL.createObjectURL(photo.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [photo.blob]);
  return url ? <img src={url} alt={alt} loading="lazy" decoding="async" /> : null;
}

export const PHOTOS_CHANGED = 'leonida-atlas:photos-changed';

/** Fotos personales guardadas solo en este dispositivo (IndexedDB). Con entryId muestra solo las de esa ficha. */
export function PhotoGallery({ entryId, title = 'Mis fotos' }: { entryId?: string; title?: string }) {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const available = photosAvailable();

  const reload = useCallback(() => {
    if (!available) return;
    listPhotos(entryId)
      .then(setPhotos)
      .catch(() => setError('No se pudieron leer las fotos de este dispositivo.'));
  }, [entryId, available]);

  useEffect(() => {
    reload();
    window.addEventListener(PHOTOS_CHANGED, reload);
    return () => window.removeEventListener(PHOTOS_CHANGED, reload);
  }, [reload]);

  const onFiles = async (files: FileList | null) => {
    setError('');
    if (!files?.length) return;
    setBusy(true);
    let ok = 0;
    for (const f of Array.from(files).slice(0, 10)) {
      try {
        await addPhoto(f, entryId ?? null);
        ok++;
      } catch (e) {
        setError((e as Error).message || 'No se pudo guardar la foto.');
      }
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
    if (ok) {
      toast.show(ok === 1 ? 'Foto guardada en este dispositivo.' : `${ok} fotos guardadas en este dispositivo.`);
      window.dispatchEvent(new Event(PHOTOS_CHANGED));
    }
  };

  const headingId = `photos-h-${entryId ?? 'all'}`;
  return (
    <section className="panel" aria-labelledby={headingId} data-testid="photo-gallery">
      <h2 id={headingId}>
        <Icon name="camera" size={20} /> {title}
        {photos && ` (${photos.length})`}
      </h2>
      {!available ? (
        <p className="muted small">Este navegador no permite guardar fotos (IndexedDB no disponible o modo privado).</p>
      ) : (
        <>
          <p className="muted small">Se guardan solo en este teléfono, reducidas a 1600 px. No se suben a ningún servidor. JPG, PNG o WebP.</p>
          <label className={`btn${busy ? ' is-busy' : ''}`}>
            <Icon name="camera" size={18} /> {busy ? 'Guardando…' : 'Añadir foto'}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              disabled={busy}
              onChange={(e) => onFiles(e.target.files)}
              data-testid="photo-input"
            />
          </label>
          {error && (
            <p className="alert" role="alert">
              {error}
            </p>
          )}
          {photos && photos.length > 0 && (
            <ul className="photo-grid">
              {photos.map((p) => {
                const e = p.entryId ? entryById.get(p.entryId) : undefined;
                return (
                  <li key={p.id} className="photo-item" data-testid="photo-item">
                    <PhotoImg photo={p} alt={p.caption || (e ? `Foto personal de ${e.name}` : 'Foto personal')} />
                    <label className="sr-only" htmlFor={`cap-${p.id}`}>
                      Descripción de la foto
                    </label>
                    <input
                      id={`cap-${p.id}`}
                      type="text"
                      maxLength={200}
                      defaultValue={p.caption}
                      placeholder="Descripción"
                      onBlur={(ev) => {
                        if (ev.target.value === p.caption) return;
                        setSaved('');
                        updateCaption(p.id, ev.target.value)
                          .then(() => {
                            setSaved(p.id);
                            reload();
                          })
                          .catch(() => setError('No se pudo guardar la descripción.'));
                      }}
                    />
                    <span className="small muted" role="status" data-testid="caption-status">
                      {saved === p.id ? 'Descripción guardada' : ''}
                    </span>
                    <div className="photo-meta">
                      {!entryId && e && <Link to={entryPath(e)}>{e.name}</Link>}
                      <span className="muted small">{p.createdAt.slice(0, 10)}</span>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label="Borrar foto"
                        onClick={() => {
                          if (window.confirm('¿Borrar esta foto de este dispositivo?'))
                            deletePhoto(p.id).then(() => window.dispatchEvent(new Event(PHOTOS_CHANGED)));
                        }}
                      >
                        <Icon name="trash" size={18} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
