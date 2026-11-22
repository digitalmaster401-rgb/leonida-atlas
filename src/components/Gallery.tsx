import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaItem } from '../data/schema';
import { Icon } from './Icon';

interface Props {
  items: MediaItem[];
  label: string;
}

export function Gallery({ items, label }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  if (!items.length) return null;
  return (
    <div className="gallery" aria-label={label}>
      <ul className="gallery-grid">
        {items.map((m, i) => (
          <li key={m.id}>
            <button type="button" className="gallery-thumb" onClick={() => setOpen(i)} aria-label={`Ampliar imagen: ${m.captionEs}`}>
              <img src={m.files['640'].src} width={m.files['640'].width} height={m.files['640'].height} alt="" loading="lazy" decoding="async" />
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </div>
  );
}

export function Lightbox({ items, index, onIndex, onClose }: { items: MediaItem[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const m = items[index];
  const go = useCallback(
    (d: number) => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      onIndex((index + d + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (typeof dlg.showModal === 'function' && !dlg.open) dlg.showModal();
    const prev = document.activeElement as HTMLElement | null;
    return () => prev?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === '+' || e.key === '=') setZoom(2);
      else if (e.key === '-') {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const toggleZoom = () => {
    setZoom((z) => (z === 1 ? 2 : 1));
    setPan({ x: 0, y: 0 });
  };

  return (
    <dialog ref={ref} className="lightbox" aria-label="Visor de imagen" onClose={onClose} onCancel={onClose}>
      <div className="lightbox-bar">
        <span className="muted small">
          {index + 1} / {items.length}
        </span>
        <div className="lightbox-actions">
          <button type="button" className="icon-btn" onClick={toggleZoom} aria-label={zoom === 1 ? 'Acercar imagen' : 'Alejar imagen'} aria-pressed={zoom > 1}>
            <Icon name={zoom === 1 ? 'plus' : 'minus'} />
          </button>
          <button type="button" className="icon-btn" onClick={() => ref.current?.close()} aria-label="Cerrar visor (Escape)" autoFocus>
            <Icon name="close" />
          </button>
        </div>
      </div>
      <div
        className={`lightbox-stage${zoom > 1 ? ' is-zoomed' : ''}`}
        onDoubleClick={toggleZoom}
        onPointerDown={(e) => {
          if (zoom === 1) return;
          (e.target as Element).setPointerCapture?.(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setPan({ x: drag.current.px + (e.clientX - drag.current.x), y: drag.current.py + (e.clientY - drag.current.y) });
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <img
          key={m.id}
          src={m.files['1280'].src}
          width={m.files['1280'].width}
          height={m.files['1280'].height}
          alt={m.captionEs}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          draggable={false}
        />
      </div>
      {items.length > 1 && (
        <>
          <button type="button" className="icon-btn lightbox-nav prev" onClick={() => go(-1)} aria-label="Imagen anterior">
            <Icon name="arrow_left" />
          </button>
          <button type="button" className="icon-btn lightbox-nav next" onClick={() => go(1)} aria-label="Imagen siguiente">
            <Icon name="arrow_right" />
          </button>
        </>
      )}
      <div className="lightbox-caption">
        <p>{m.captionEs}</p>
        <p className="muted small">
          {m.copyright} · Material oficial ({m.kind === 'official-map' ? 'mapa' : 'captura'}) ·{' '}
          <a href={m.sourcePage} target="_blank" rel="noopener noreferrer">
            Ver en la fuente oficial
          </a>{' '}
          · Tamaño original {m.originalSize}; se muestra una versión reducida.
        </p>
      </div>
    </dialog>
  );
}
