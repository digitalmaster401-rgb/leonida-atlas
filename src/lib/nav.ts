// Navegación principal de LEONIDA ATLAS (Fase 4A): cinco pestañas que agrupan rutas existentes.
// Ninguna URL cambia; esta tabla solo decide qué pestaña se marca como activa.

export type TabId = 'mapa' | 'explorar' | 'dinero' | 'mi-espacio' | 'novedades';

export interface Tab {
  id: TabId;
  to: string;
  label: string;
  icon: string;
}

export const TABS: Tab[] = [
  { id: 'mapa', to: '/mapa', label: 'Mapa', icon: 'map' },
  { id: 'explorar', to: '/', label: 'Explorar', icon: 'compass' },
  { id: 'dinero', to: '/dinero', label: 'Dinero', icon: 'coins' },
  { id: 'mi-espacio', to: '/mi-espacio', label: 'Mi espacio', icon: 'user' },
  { id: 'novedades', to: '/novedades', label: 'Novedades', icon: 'news' },
];

const PREFIXES: [TabId, string[]][] = [
  ['mapa', ['/mapa', '/mis-rutas']],
  ['dinero', ['/dinero']],
  ['mi-espacio', ['/mi-espacio', '/mi-partida']],
  ['novedades', ['/novedades', '/intel']],
];

/** Pestaña activa para una ruta. Todo lo demás (portada, buscador, categorías, fichas, herramientas) es Explorar. */
export function tabOf(pathname: string): TabId {
  const p = pathname.replace(/\/+$/, '') || '/';
  for (const [id, list] of PREFIXES) if (list.some((x) => p === x || p.startsWith(x + '/'))) return id;
  return 'explorar';
}

export interface NavLinkDef {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

/** Menú lateral de escritorio y catálogo «Todas las secciones» de Explorar, agrupados por pestaña. */
export const NAV_GROUPS: { tab: TabId; title: string; links: NavLinkDef[] }[] = [
  {
    tab: 'mapa',
    title: 'Mapa',
    links: [
      { to: '/mapa', label: 'Mapa', icon: 'map' },
      { to: '/mis-rutas', label: 'Mis rutas', icon: 'flag' },
    ],
  },
  {
    tab: 'explorar',
    title: 'Explorar',
    links: [
      { to: '/', label: 'Explorar', icon: 'compass', end: true },
      { to: '/enciclopedia', label: 'Enciclopedia', icon: 'book' },
      { to: '/lugares', label: 'Lugares', icon: 'pin' },
      { to: '/personajes', label: 'Personajes', icon: 'user' },
      { to: '/armas', label: 'Armas', icon: 'target' },
      { to: '/equipamiento', label: 'Equipamiento', icon: 'layers' },
      { to: '/vehiculos', label: 'Vehículos', icon: 'car' },
      { to: '/comparar-vehiculos', label: 'Comparar vehículos', icon: 'list' },
      { to: '/negocios', label: 'Negocios y propiedades', icon: 'store' },
      { to: '/coleccionables', label: 'Coleccionables', icon: 'grid' },
      { to: '/trucos', label: 'Trucos y códigos', icon: 'gamepad' },
      { to: '/rutas', label: 'Rutas y tutoriales', icon: 'route' },
      { to: '/consola', label: 'Ajustes de consola', icon: 'sliders' },
      { to: '/galeria', label: 'Galería', icon: 'image' },
      { to: '/fuentes', label: 'Fuentes y cambios', icon: 'book' },
    ],
  },
  { tab: 'dinero', title: 'Dinero', links: [{ to: '/dinero', label: 'Dinero y glitches', icon: 'cash' }] },
  { tab: 'mi-espacio', title: 'Mi espacio', links: [{ to: '/mi-espacio', label: 'Mi espacio', icon: 'star' }] },
  {
    tab: 'novedades',
    title: 'Novedades',
    links: [
      { to: '/novedades', label: 'Novedades', icon: 'news' },
      { to: '/intel', label: 'ATLAS Intelligence', icon: 'note' },
    ],
  },
];
