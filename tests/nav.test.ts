import { describe, expect, it } from 'vitest';
import { NAV_GROUPS, TABS, tabOf } from '../src/lib/nav';

describe('navegación de 5 pestañas', () => {
  it('tiene exactamente las cinco secciones en orden', () => {
    expect(TABS.map((t) => t.label)).toEqual(['Mapa', 'Explorar', 'Dinero', 'Mi espacio', 'Novedades']);
  });
  it.each([
    ['/mapa', 'mapa'],
    ['/mis-rutas', 'mapa'],
    ['/dinero', 'dinero'],
    ['/dinero/vender-autos-a-moses', 'dinero'],
    ['/mi-espacio', 'mi-espacio'],
    ['/mi-partida', 'mi-espacio'],
    ['/novedades', 'novedades'],
    ['/intel', 'novedades'],
    ['/', 'explorar'],
    ['/explorar', 'explorar'],
    ['/buscar', 'explorar'],
    ['/armas/rifle', 'explorar'],
    ['/trucos', 'explorar'],
    ['/mapache', 'explorar'],
    ['/dinero/', 'dinero'],
  ])('%s → %s', (p, t) => expect(tabOf(p)).toBe(t));
  it('cada enlace agrupado pertenece a su pestaña y no hay duplicados', () => {
    const all = NAV_GROUPS.flatMap((g) => g.links.map((l) => ({ ...l, tab: g.tab })));
    expect(new Set(all.map((l) => l.to)).size).toBe(all.length);
    for (const l of all) expect(tabOf(l.to)).toBe(l.tab);
  });
});
