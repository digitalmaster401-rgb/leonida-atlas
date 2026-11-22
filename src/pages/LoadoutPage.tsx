import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { entries, entryById, entryPath } from '../data';
import { loadoutData } from '../data/fase2';
import type { SlotKind } from '../data/schema-fase2';
import { useProgress } from '../hooks/progress';
import { useToast } from '../hooks/toast';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { Seo } from '../components/Seo';
import { SourceLinks } from '../components/SourceLinks';
import { money } from '../lib/calc';
import { buildWeapons, checkLoadout, decodeLoadout, emptyLoadout, encodeLoadout, loadoutCost, type Weapon } from '../lib/loadout';
import { absoluteUrl, shareLink } from '../lib/share';
import type { Loadout } from '../lib/storage';

const SLOT_LABEL: Record<SlotKind, string> = { sidearm: 'Arma corta', longarm: 'Arma larga', melee: 'Cuerpo a cuerpo' };
const KINDS: SlotKind[] = ['sidearm', 'longarm', 'melee'];

function WeaponSelect({ kind, index, value, weapons, onChange }: { kind: SlotKind; index: number; value: string | null; weapons: Weapon[]; onChange: (id: string | null) => void }) {
  const id = `slot-${kind}-${index}`;
  const fit = weapons.filter((w) => w.cls === kind);
  const unclassified = weapons.filter((w) => w.cls === 'unclassified');
  const other = weapons.filter((w) => w.cls !== kind && w.cls !== 'unclassified');
  const opt = (w: Weapon) => (
    <option key={w.id} value={w.id}>
      {w.name}
      {w.unique ? ' (única)' : ''}
      {w.price !== null ? ` · ${money(w.price)}` : ''}
    </option>
  );
  return (
    <div className="field slot">
      <label htmlFor={id}>
        {SLOT_LABEL[kind]} {loadoutData.slots[kind] > 1 ? index + 1 : ''}
      </label>
      <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} data-testid={id}>
        <option value="">Vacío</option>
        <optgroup label="Coinciden con este espacio">{fit.map(opt)}</optgroup>
        {unclassified.length > 0 && <optgroup label="Sin clase publicada">{unclassified.map(opt)}</optgroup>}
        {other.length > 0 && <optgroup label="Otra clase (no cabe aquí)">{other.map(opt)}</optgroup>}
      </select>
    </div>
  );
}

function Compare({ list, weapons }: { list: Loadout[]; weapons: Weapon[] }) {
  const [selA, setA] = useState('');
  const [selB, setB] = useState('');
  // si la selección no existe (aún no había dos guardados, o se borró), se usan los dos primeros
  const A = list.find((l) => l.id === selA) ?? list[0];
  const B = list.find((l) => l.id === selB) ?? list.find((l) => l !== A);
  const a = A?.id ?? '';
  const b = B?.id ?? '';
  const name = (id: string | null) => (id ? (entryById.get(id)?.name ?? id) : '—');
  if (list.length < 2) return <p className="muted small">Guarda dos equipamientos para compararlos.</p>;
  return (
    <div>
      <div className="btn-row">
        {[
          ['cmp-a', a, setA],
          ['cmp-b', b, setB],
        ].map(([id, v, set], i) => (
          <div key={id as string} className="field">
            <label htmlFor={id as string}>Equipamiento {i === 0 ? 'A' : 'B'}</label>
            <select id={id as string} value={v as string} onChange={(e) => (set as (x: string) => void)(e.target.value)}>
              {list.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {A && B && (
        <div className="table-wrap" tabIndex={0} role="region" aria-label="Comparación de equipamientos">
          <table className="facts" data-testid="compare-table">
            <thead>
              <tr>
                <th scope="col">Espacio</th>
                <th scope="col">{A.name}</th>
                <th scope="col">{B.name}</th>
              </tr>
            </thead>
            <tbody>
              {KINDS.flatMap((k) =>
                Array.from({ length: loadoutData.slots[k] }, (_, i) => (
                  <tr key={`${k}${i}`}>
                    <th scope="row">
                      {SLOT_LABEL[k]} {loadoutData.slots[k] > 1 ? i + 1 : ''}
                    </th>
                    <td>{name(A[k][i] ?? null)}</td>
                    <td>{name(B[k][i] ?? null)}</td>
                  </tr>
                )),
              )}
              <tr>
                <th scope="row">Costo conocido</th>
                <td>{money(loadoutCost(A, weapons).total)}</td>
                <td>{money(loadoutCost(B, weapons).total)}</td>
              </tr>
              <tr>
                <th scope="row">Avisos</th>
                <td>{checkLoadout(A, weapons, loadoutData).length}</td>
                <td>{checkLoadout(B, weapons, loadoutData).length}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function LoadoutPage() {
  const { progress, saveLoadout, deleteLoadout } = useProgress();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const weapons = useMemo(() => buildWeapons(entries, loadoutData.classes), []);
  const [l, setL] = useState<Loadout>(() => emptyLoadout(loadoutData.slots));

  // Equipamiento compartido por enlace (?c=…)
  const shared = params.get('c');
  const handled = useRef<string | null>(null);
  useEffect(() => {
    // la navegación de React Router corre en una transición: el efecto puede repetirse antes de que ?c= desaparezca
    if (!shared || handled.current === shared) return;
    handled.current = shared;
    const d = decodeLoadout(shared, loadoutData.slots);
    if (d) {
      setL(d);
      toast.show('Equipamiento compartido cargado. Guárdalo si quieres conservarlo.');
    } else toast.show('El enlace de equipamiento no es válido.');
    const next = new URLSearchParams(window.location.search);
    next.delete('c');
    setParams(next, { replace: true });
  }, [shared, setParams, toast]);

  const warnings = checkLoadout(l, weapons, loadoutData);
  const cost = loadoutCost(l, weapons);
  const equipped = [...l.sidearm, ...l.longarm, ...l.melee].filter((x): x is string => !!x);
  const set = (kind: SlotKind, i: number, id: string | null) =>
    setL((p) => {
      const next = { ...p, [kind]: p[kind].map((x, j) => (j === i ? id : x)) };
      const still = new Set([...next.sidearm, ...next.longarm, ...next.melee]);
      // los accesorios de un arma que ya no está equipada se descartan
      next.attachments = Object.fromEntries(Object.entries(p.attachments).filter(([w]) => still.has(w)));
      return next;
    });
  const toggleAtt = (wid: string, att: string) =>
    setL((p) => {
      const cur = p.attachments[wid] ?? [];
      const next = cur.includes(att) ? cur.filter((x) => x !== att) : [...cur, att];
      const attachments = { ...p.attachments, [wid]: next };
      if (!next.length) delete attachments[wid];
      return { ...p, attachments };
    });
  const isSaved = progress.loadouts.some((x) => x.id === l.id);

  return (
    <div className="page">
      <Seo title="Equipamiento de armas" description="Arma tu carga de armas de GTA VI con las reglas documentadas." />
      <header className="page-head">
        <h1>
          <Icon name="layers" size={28} /> Equipamiento de armas
        </h1>
        <p className="lead">
          Arma tu carga con las armas de la guía y las reglas publicadas: {loadoutData.slots.sidearm} armas cortas, {loadoutData.slots.longarm} largas y {loadoutData.slots.melee} cuerpo a
          cuerpo. Te avisamos si algo no cabe o no se puede modificar.
        </p>
      </header>

      <section className="panel" aria-labelledby="rules-h">
        <h2 id="rules-h">Reglas documentadas</h2>
        <ul className="fact-list">
          {loadoutData.rules.map((r) => (
            <li key={r.label}>
              <strong>{r.label}:</strong> {r.value} <SourceLinks ids={r.sources} status={r.status} />
            </li>
          ))}
        </ul>
        <p className="small muted">{loadoutData.classNote}</p>
      </section>

      <section className="panel builder" aria-labelledby="build-h" data-testid="builder">
        <h2 id="build-h">Tu equipamiento</h2>
        <div className="field">
          <label htmlFor="lo-name">Nombre</label>
          <input id="lo-name" type="text" maxLength={60} value={l.name} onChange={(e) => setL({ ...l, name: e.target.value })} />
        </div>
        <div className="slot-grid">
          {KINDS.map((k) => l[k].map((v, i) => <WeaponSelect key={`${k}${i}`} kind={k} index={i} value={v} weapons={weapons} onChange={(id) => set(k, i, id)} />))}
        </div>

        {equipped.length > 0 && (
          <div className="attachments">
            <h3>Accesorios</h3>
            <p className="small muted">{loadoutData.compatibilityNote} Los de «equipamiento» se ponen o quitan desde la rueda de armas; los demás se compran en Ammu-Nation.</p>
            {[...new Set(equipped)].map((wid) => {
              const w = weapons.find((x) => x.id === wid);
              if (!w) return null;
              return (
                <fieldset key={wid} className="att-group">
                  <legend>{w.name}</legend>
                  {w.unique ? (
                    <p className="small">Arma única: no se puede modificar.</p>
                  ) : (
                    <div className="chips">
                      {loadoutData.attachments.map((a) => {
                        const on = (l.attachments[wid] ?? []).includes(a.id);
                        return (
                          <button key={a.id} type="button" className={`chip${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => toggleAtt(wid, a.id)}>
                            {a.label} <span className="muted small">({a.where === 'loadout' ? 'equipamiento' : 'Ammu-Nation'})</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </fieldset>
              );
            })}
          </div>
        )}

        <div className="builder-summary">
          <p data-testid="lo-cost">
            <strong>Costo en Ammu-Nation (precios publicados):</strong> {money(cost.total)}
            {cost.unknown.length > 0 && <span className="muted small"> · sin precio publicado: {cost.unknown.join(', ')}</span>}
          </p>
          <ul className="warnings" aria-live="polite" data-testid="lo-warnings">
            {warnings.length === 0 && equipped.length > 0 && (
              <li className="ok">
                <Icon name="check" size={16} /> Cumple las reglas documentadas.
              </li>
            )}
            {warnings.map((w, i) => (
              <li key={i} className={w.level === 'error' ? 'err' : 'warn'}>
                <Icon name="alert" size={16} /> <span className="sr-only">{w.level === 'error' ? 'Error:' : 'Aviso:'}</span> {w.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="btn-row">
          <button
            type="button"
            className="btn btn-cta"
            onClick={() => {
              saveLoadout(l);
              toast.show(isSaved ? 'Equipamiento actualizado.' : 'Equipamiento guardado en Mi espacio.');
            }}
            data-testid="lo-save"
          >
            <Icon name="check" size={18} /> {isSaved ? 'Guardar cambios' : 'Guardar'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={async () => {
              const r = await shareLink({ title: `${l.name} · LEONIDA ATLAS`, text: 'Mi equipamiento de armas en GTA VI', url: absoluteUrl(`/equipamiento?c=${encodeLoadout(l)}`) });
              if (r === 'copied') toast.show('Enlace copiado.');
              else if (r === 'failed') toast.show('No se pudo compartir.');
            }}
          >
            <Icon name="share" size={18} /> Compartir
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setL(emptyLoadout(loadoutData.slots))}>
            <Icon name="plus" size={18} /> Nuevo
          </button>
        </div>
      </section>

      <section className="section" aria-labelledby="saved-h">
        <h2 id="saved-h" className="section-title">
          Guardados ({progress.loadouts.length})
        </h2>
        {progress.loadouts.length ? (
          <ul className="saved-list">
            {progress.loadouts.map((s) => (
              <li key={s.id} className="panel" data-testid="saved-loadout">
                <strong>{s.name}</strong>
                <span className="muted small">
                  {[...s.sidearm, ...s.longarm, ...s.melee]
                    .filter(Boolean)
                    .map((id) => entryById.get(id!)?.name ?? id)
                    .join(', ') || 'Vacío'}
                </span>
                <div className="btn-row">
                  <button type="button" className="btn btn-sm" onClick={() => setL(structuredClone(s))}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost btn-danger"
                    onClick={() => window.confirm(`¿Borrar «${s.name}»?`) && deleteLoadout(s.id)}
                    aria-label={`Borrar ${s.name}`}
                  >
                    <Icon name="trash" size={16} /> Borrar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon="layers" title="Aún no guardas equipamientos" />
        )}
        <h3>Comparar</h3>
        <Compare list={progress.loadouts} weapons={weapons} />
      </section>
      <p className="small muted">
        Las armas salen de la sección <Link to="/armas">Armas</Link>. Ver ficha de cada arma para su evidencia, p. ej.{' '}
        {weapons[0] && <Link to={entryPath(entryById.get(weapons[0].id)!)}>{weapons[0].name}</Link>}.
      </p>
    </div>
  );
}
