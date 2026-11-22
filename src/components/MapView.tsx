import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import type { Category, Entry } from '../data/schema';
import { entryPath, imageOf, MAP_MEDIA_ID } from '../data';
import { CATEGORY_META, PRECISION_LABEL } from '../data/meta';
import { EvidenceBadge } from './EvidenceBadge';
import { Icon } from './Icon';
import { useProgress } from '../hooks/progress';

const RATIO = 2805 / 3840; // ancho / alto del póster oficial
const MIN = 1;
const MAX = 6;

/** Marcador en forma de gota; la punta inferior (18, 46) es el punto exacto. */
function PinShape() {
  return (
    <svg className="pin-shape" width="36" height="46" viewBox="0 0 36 46" aria-hidden="true" focusable="false">
      <path d="M18 45C18 45 3 28.5 3 17.5a15 15 0 0 1 30 0C33 28.5 18 45 18 45Z" fill="currentColor" stroke="#fff" strokeWidth="2.5" />
    </svg>
  );
}

export interface PinGroup {
  key: string;
  x: number;
  y: number;
  entries: Entry[];
}

export function groupPins(list: Entry[]): PinGroup[] {
  const map = new Map<string, PinGroup>();
  for (const e of list) {
    if (!e.mapPosition) continue;
    const key = `${e.mapPosition.x.toFixed(3)}:${e.mapPosition.y.toFixed(3)}`;
    const g = map.get(key) ?? { key, x: e.mapPosition.x, y: e.mapPosition.y, entries: [] };
    g.entries.push(e);
    map.set(key, g);
  }
  return [...map.values()];
}

interface View {
  s: number;
  tx: number;
  ty: number;
}

export function MapView({ list, selectedId, onSelect }: { list: Entry[]; selectedId: string | null; onSelect: (id: string | null) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 360, h: 480 });
  const [view, setView] = useState<View>({ s: 1, tx: 0, ty: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ dist: number; s: number; mid: { x: number; y: number }; tx: number; ty: number; start: { x: number; y: number } } | null>(null);
  const groups = useMemo(() => groupPins(list), [list]);
  const mapImg = imageOf(MAP_MEDIA_ID)!;

  // tamaño base del póster ajustado al contenedor
  const base = useMemo(() => {
    const h = Math.min(box.h, box.w / RATIO);
    return { w: h * RATIO, h };
  }, [box]);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, []);

  const clamp = useCallback(
    (v: View): View => {
      const s = Math.min(MAX, Math.max(MIN, v.s));
      const w = base.w * s;
      const h = base.h * s;
      const cx = (box.w - w) / 2;
      const cy = (box.h - h) / 2;
      const tx = w <= box.w ? cx : Math.min(0, Math.max(box.w - w, v.tx));
      const ty = h <= box.h ? cy : Math.min(0, Math.max(box.h - h, v.ty));
      return { s, tx, ty };
    },
    [base, box],
  );

  const zoomAt = useCallback(
    (factor: number, cx = box.w / 2, cy = box.h / 2) => {
      setView((v) => {
        const s = Math.min(MAX, Math.max(MIN, v.s * factor));
        const k = s / v.s;
        return clamp({ s, tx: cx - (cx - v.tx) * k, ty: cy - (cy - v.ty) * k });
      });
    },
    [box, clamp],
  );

  const centerOn = useCallback(
    (x: number, y: number, s: number) => {
      setView(clamp({ s, tx: box.w / 2 - x * base.w * s, ty: box.h / 2 - y * base.h * s }));
    },
    [box, base, clamp],
  );

  // recentra al cambiar tamaño
  useEffect(() => setView((v) => clamp(v)), [clamp]);

  // enfoca la selección (deep link /mapa?id=...)
  useEffect(() => {
    if (!selectedId) return;
    const g = groups.find((g) => g.entries.some((e) => e.id === selectedId));
    if (g) centerOn(g.x, g.y, 2.6);
  }, [selectedId, groups, centerOn]);

  const isPin = (t: EventTarget | null) => !!(t as Element | null)?.closest?.('.map-pin');

  const onPointerDown = (e: React.PointerEvent) => {
    if (isPin(e.target)) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    startGesture();
  };
  const startGesture = () => {
    const pts = [...pointers.current.values()];
    const rect = wrap.current!.getBoundingClientRect();
    const mid = pts.length === 2 ? { x: (pts[0].x + pts[1].x) / 2 - rect.left, y: (pts[0].y + pts[1].y) / 2 - rect.top } : { x: pts[0].x - rect.left, y: pts[0].y - rect.top };
    const dist = pts.length === 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
    gesture.current = { dist, s: view.s, mid, tx: view.tx, ty: view.ty, start: mid };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const pts = [...pointers.current.values()];
    const rect = wrap.current!.getBoundingClientRect();
    if (pts.length >= 2 && g.dist > 0) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const mid = { x: (pts[0].x + pts[1].x) / 2 - rect.left, y: (pts[0].y + pts[1].y) / 2 - rect.top };
      const s = Math.min(MAX, Math.max(MIN, (g.s * dist) / g.dist));
      const k = s / g.s;
      setView(clamp({ s, tx: mid.x - (g.mid.x - g.tx) * k, ty: mid.y - (g.mid.y - g.ty) * k }));
    } else {
      const p = { x: pts[0].x - rect.left, y: pts[0].y - rect.top };
      setView(clamp({ s: g.s, tx: g.tx + (p.x - g.start.x), ty: g.ty + (p.y - g.start.y) }));
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) startGesture();
    else gesture.current = null;
  };

  // rueda del mouse (listener no pasivo para evitar el desplazamiento de la página)
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = 60;
    const moves: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (moves[e.key]) {
      e.preventDefault();
      setView((v) => clamp({ ...v, tx: v.tx + moves[e.key][0], ty: v.ty + moves[e.key][1] }));
    } else if (e.key === '+' || e.key === '=') zoomAt(1.4);
    else if (e.key === '-') zoomAt(1 / 1.4);
    else if (e.key === '0') setView(clamp({ s: 1, tx: 0, ty: 0 }));
  };

  // pines más compactos cuando el mapa completo se ve pequeño (evita que se encimen en teléfonos)
  const pinScale = (base.w < 520 ? 0.72 : base.w < 800 ? 0.85 : 1) / view.s;
  const hi = view.s > 1.6;
  const file = hi ? mapImg.files['2400'] : mapImg.files['1200'];

  return (
    <div className="map-shell">
      <div
        ref={wrap}
        className="map-viewport"
        tabIndex={0}
        role="application"
        aria-roledescription="mapa interactivo"
        aria-label="Mapa oficial de Leonida. Usa las flechas para desplazarte, + y − para acercar o alejar, 0 para restablecer."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        data-testid="map-viewport"
        data-scale={view.s.toFixed(2)}
      >
        <div className="map-layer" style={{ width: base.w, height: base.h, transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.s})` }}>
          <img src={file.src} width={base.w} height={base.h} alt="Mapa oficial del estado de Leonida publicado por Rockstar Games" draggable={false} />
          {groups.map((g) => {
            const first = g.entries[0];
            const sel = g.entries.some((e) => e.id === selectedId);
            return (
              <button
                key={g.key}
                type="button"
                className={`map-pin pin-${first.category}${sel ? ' is-selected' : ''}`}
                style={{ left: `${g.x * 100}%`, top: `${g.y * 100}%`, transform: `scale(${Math.max(pinScale, 0.3 / view.s)})` }}
                aria-label={`${g.entries.length > 1 ? `${g.entries.length} fichas: ` : ''}${g.entries.map((e) => e.name).join(', ')}. ${PRECISION_LABEL[first.mapPosition!.precision]}`}
                aria-pressed={sel}
                onClick={() => onSelect(sel ? null : first.id)}
                data-testid="map-pin"
              >
                <PinShape />
                <span className="pin-icon">
                  <Icon name={CATEGORY_META[first.category].icon} size={16} />
                </span>
                {g.entries.length > 1 && <span className="pin-count">{g.entries.length}</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="map-controls" role="group" aria-label="Controles del mapa">
        <button type="button" className="icon-btn" onClick={() => zoomAt(1.4)} aria-label="Acercar">
          <Icon name="plus" />
        </button>
        <button type="button" className="icon-btn" onClick={() => zoomAt(1 / 1.4)} aria-label="Alejar">
          <Icon name="minus" />
        </button>
        <button type="button" className="icon-btn" onClick={() => setView(clamp({ s: 1, tx: 0, ty: 0 }))} aria-label="Restablecer vista">
          <Icon name="reset" />
        </button>
      </div>
    </div>
  );
}

export function PinPanel({ group, onClose }: { group: PinGroup | undefined; onClose: () => void }) {
  const { progress } = useProgress();
  if (!group) return null;
  return (
    <aside className="pin-panel" aria-live="polite" data-testid="pin-panel">
      <div className="pin-panel-head">
        <strong>{group.entries.length > 1 ? `${group.entries.length} fichas en este punto` : 'Punto seleccionado'}</strong>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar panel">
          <Icon name="close" size={18} />
        </button>
      </div>
      <ul>
        {group.entries.map((e) => (
          <li key={e.id}>
            <Link to={entryPath(e)} className="pin-entry">
              <span className={`dot dot-${e.category}`} aria-hidden="true" />
              <span>
                <strong>{e.spoilerLevel > progress.settings.spoilerLevel ? `${CATEGORY_META[e.category].singular} con spoilers ${e.spoilerLevel === 2 ? 'avanzados' : 'leves'}` : e.name}</strong>
                <span className="muted small"> · {CATEGORY_META[e.category].singular}</span>
                {progress.completed.includes(e.id) && <span className="chip chip-static">Encontrado/completado</span>}
              </span>
            </Link>
            <div className="pin-entry-meta">
              <EvidenceBadge status={e.status} compact /> <span className="small">{PRECISION_LABEL[e.mapPosition!.precision]}</span>
            </div>
            <p className="small muted">{e.mapPosition!.basis}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function MapLegend({ active, onToggle, cats }: { active: Set<Category>; onToggle: (c: Category) => void; cats: Category[] }) {
  return (
    <div className="map-legend">
      <div className="chips" role="group" aria-label="Mostrar categorías en el mapa">
        {cats.map((c) => (
          <button key={c} type="button" className={`chip${active.has(c) ? ' is-on' : ''}`} aria-pressed={active.has(c)} onClick={() => onToggle(c)}>
            <span className={`dot dot-${c}`} aria-hidden="true" /> {CATEGORY_META[c].label}
          </button>
        ))}
      </div>
      <details className="small muted map-help">
        <summary>¿Qué tan precisos son los puntos?</summary>
        <p>
          «Región» = punto representativo de una región; «zona» = rótulo de un lugar del mapa; «barrio» = rótulo de un barrio. Ningún punto es una coordenada exacta del juego. Usa
          dos dedos o los botones para acercar; arrastra para moverte.
        </p>
      </details>
    </div>
  );
}

/** Miniatura estática del mapa centrada en una ficha. */
export function MiniMap({ entry }: { entry: Entry }) {
  const p = entry.mapPosition!;
  const m = imageOf(MAP_MEDIA_ID)!;
  const zoom = 3;
  return (
    <Link to={`/mapa?id=${entry.id}`} className="minimap" aria-label={`${PRECISION_LABEL[p.precision]} · Ver en el mapa: ${entry.name}`}>
      <div className="minimap-frame">
        <img
          src={m.files['1200'].src}
          alt=""
          loading="lazy"
          style={{ width: `${zoom * 100}%`, left: `${50 - p.x * zoom * 100}%`, top: `calc(50% - ${p.y * zoom * 100 * (3840 / 2805)}cqw)` }}
        />
        <span className={`map-pin pin-${entry.category} is-selected minimap-pin`} aria-hidden="true">
          <PinShape />
          <span className="pin-icon">
            <Icon name={CATEGORY_META[entry.category].icon} size={16} />
          </span>
        </span>
      </div>
      <span className="minimap-label">
        <Icon name="map" size={16} /> {PRECISION_LABEL[p.precision]} · Ver en el mapa
      </span>
    </Link>
  );
}
