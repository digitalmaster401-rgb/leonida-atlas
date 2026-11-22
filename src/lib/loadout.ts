// Lógica pura del constructor de equipamiento. Las reglas vienen de content/loadout.json
// (fuentes citadas); la clase de cada arma se deduce de su ficha y, si no es clara, queda sin clasificar.
import type { Entry } from '../data/schema';
import type { LoadoutFile, SlotKind } from '../data/schema-fase2';
import type { Loadout } from './storage';

export type WeaponClass = SlotKind | 'unclassified';
export interface Weapon {
  id: string;
  name: string;
  cls: WeaponClass;
  classLabel: string;
  unique: boolean;
  price: number | null;
  status: Entry['status'];
  edition: Entry['edition'];
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function classOf(e: Entry, rules: LoadoutFile['classes']): { cls: WeaponClass; label: string } | null {
  if (e.tags.includes('cosmetico')) return null; // patrones de pintura, no armas
  const fact = e.facts.find((f) => f.label === 'Clase' || f.label === 'Tipo')?.value ?? '';
  const hay = norm(`${fact} ${e.tags.join(' ')}`);
  const label = fact || (e.tags.includes('pistola') ? 'Pistola' : e.tags.includes('revolver') ? 'Revólver' : 'Sin clase publicada');
  // el orden importa: «subfusil» antes que «fusil», «escopeta» y «rifle» antes que «pistola»
  for (const k of rules.unclassified) if (hay.includes(norm(k))) return { cls: 'unclassified', label };
  for (const k of rules.longarm) if (hay.includes(norm(k))) return { cls: 'longarm', label };
  for (const k of rules.sidearm) if (hay.includes(norm(k))) return { cls: 'sidearm', label };
  for (const k of rules.melee) if (hay.includes(norm(k))) return { cls: 'melee', label };
  return { cls: 'unclassified', label };
}

export function buildWeapons(list: Entry[], rules: LoadoutFile['classes']): Weapon[] {
  const out: Weapon[] = [];
  for (const e of list) {
    if (e.category !== 'armas') continue;
    const c = classOf(e, rules);
    if (!c) continue;
    const amount = e.reward?.amount;
    out.push({
      id: e.id,
      name: e.name,
      cls: c.cls,
      classLabel: c.label,
      unique: e.tags.includes('unica') || /unic/.test(norm(c.label)),
      price: amount && amount.min === amount.max ? amount.min : null,
      status: e.status,
      edition: e.edition,
    });
  }
  return out;
}

export function emptyLoadout(slots: LoadoutFile['slots'], name = 'Mi equipamiento'): Loadout {
  return {
    id: `eq-${Date.now().toString(36)}`,
    name,
    sidearm: Array(slots.sidearm).fill(null),
    longarm: Array(slots.longarm).fill(null),
    melee: Array(slots.melee).fill(null),
    attachments: {},
    updatedAt: new Date().toISOString(),
  };
}

export interface Warning {
  level: 'error' | 'aviso';
  text: string;
}

/** Revisa el equipamiento contra las reglas documentadas. */
export function checkLoadout(l: Loadout, weapons: Weapon[], data: LoadoutFile): Warning[] {
  const w: Warning[] = [];
  const byId = new Map(weapons.map((x) => [x.id, x]));
  const kinds: SlotKind[] = ['sidearm', 'longarm', 'melee'];
  const label: Record<SlotKind, string> = { sidearm: 'arma corta', longarm: 'arma larga', melee: 'cuerpo a cuerpo' };
  const seen = new Set<string>();
  for (const k of kinds) {
    if (l[k].length > data.slots[k]) w.push({ level: 'error', text: `Solo caben ${data.slots[k]} espacios de ${label[k]}.` });
    for (const id of l[k]) {
      if (!id) continue;
      const wp = byId.get(id);
      if (!wp) {
        w.push({ level: 'error', text: `«${id}» no está en la guía.` });
        continue;
      }
      if (seen.has(id)) w.push({ level: 'error', text: `${wp.name} está repetida: cada arma ocupa un solo espacio.` });
      seen.add(id);
      if (wp.cls === 'unclassified') w.push({ level: 'aviso', text: `${wp.name}: la fuente no dice si es corta o larga. Compruébalo en tu partida.` });
      else if (wp.cls !== k) w.push({ level: 'error', text: `${wp.name} es ${label[wp.cls]}, no ${label[k]}.` });
      if (wp.status === 'reportado') w.push({ level: 'aviso', text: `${wp.name} viene de una sola fuente (reportado).` });
    }
  }
  for (const [id, att] of Object.entries(l.attachments)) {
    const wp = byId.get(id);
    if (!att.length) continue;
    if (!seen.has(id)) w.push({ level: 'aviso', text: `Hay accesorios guardados para un arma que no está equipada.` });
    if (wp?.unique) w.push({ level: 'error', text: `${wp.name} es única: las armas únicas no se pueden modificar.` });
    for (const a of att) if (!data.attachments.some((x) => x.id === a)) w.push({ level: 'error', text: `Accesorio desconocido «${a}».` });
  }
  return w;
}

export function loadoutCost(l: Loadout, weapons: Weapon[]): { total: number; unknown: string[] } {
  const byId = new Map(weapons.map((x) => [x.id, x]));
  let total = 0;
  const unknown: string[] = [];
  for (const id of [...l.sidearm, ...l.longarm, ...l.melee]) {
    if (!id) continue;
    const wp = byId.get(id);
    if (!wp) continue;
    if (wp.price === null) unknown.push(wp.name);
    else total += wp.price;
  }
  return { total, unknown };
}

/** Enlace para compartir: base64url de un JSON compacto (sin datos personales). */
export function encodeLoadout(l: Loadout): string {
  const json = JSON.stringify({ n: l.name, s: l.sidearm, l: l.longarm, m: l.melee, a: l.attachments });
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeLoadout(code: string, slots: LoadoutFile['slots']): Loadout | null {
  try {
    if (code.length > 2000) return null;
    const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
    const v: unknown = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
    if (typeof v !== 'object' || v === null) return null;
    const o = v as Record<string, unknown>;
    const ids = (x: unknown, n: number) =>
      Array.isArray(x) && x.length <= n && x.every((i) => i === null || (typeof i === 'string' && i.length <= 120)) ? [...(x as (string | null)[]), ...Array(n - x.length).fill(null)] : null;
    const s = ids(o.s, slots.sidearm);
    const l = ids(o.l, slots.longarm);
    const m = ids(o.m, slots.melee);
    if (!s || !l || !m || typeof o.n !== 'string') return null;
    const att: Record<string, string[]> = {};
    if (o.a && typeof o.a === 'object')
      for (const [k, a] of Object.entries(o.a as Record<string, unknown>).slice(0, 20))
        if (Array.isArray(a) && a.every((x) => typeof x === 'string')) att[k.slice(0, 120)] = (a as string[]).slice(0, 10);
    return { id: `eq-${Date.now().toString(36)}`, name: o.n.slice(0, 60) || 'Equipamiento compartido', sidearm: s, longarm: l, melee: m, attachments: att, updatedAt: new Date().toISOString() };
  } catch {
    return null;
  }
}
