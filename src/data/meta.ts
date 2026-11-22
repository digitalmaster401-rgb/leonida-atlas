import type { Category, Edition, RegionId, Status } from './schema';

export const SITE_NAME = 'LEONIDA ATLAS';
export const LAST_REVIEW = '2026-11-22';
export const GAME_RELEASE = '2026-11-19';
export const REPORT_URL: string =
  (import.meta.env.VITE_REPORT_URL as string | undefined) ??
  'https://github.com/digitalmaster401-rgb/leonida-atlas/issues/new';

export interface CategoryMeta {
  id: Category;
  label: string;
  singular: string;
  path: string;
  description: string;
  icon: string; // id del símbolo SVG
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  lugares: { id: 'lugares', label: 'Lugares', singular: 'Lugar', path: '/lugares', description: 'Regiones y zonas oficiales de Leonida.', icon: 'pin' },
  personajes: { id: 'personajes', label: 'Personajes', singular: 'Personaje', path: '/personajes', description: 'Protagonistas y personajes presentados por Rockstar.', icon: 'user' },
  dinero: { id: 'dinero', label: 'Dinero y glitches', singular: 'Método', path: '/dinero', description: 'Métodos del modo historia con pago y evidencia separados.', icon: 'cash' },
  armas: { id: 'armas', label: 'Armas', singular: 'Arma', path: '/armas', description: 'Armas oficiales, Ammu-Nation y armas únicas reportadas.', icon: 'target' },
  vehiculos: { id: 'vehiculos', label: 'Vehículos', singular: 'Vehículo', path: '/vehiculos', description: 'Vehículos confirmados y dónde encontrarlos.', icon: 'car' },
  negocios: { id: 'negocios', label: 'Negocios y propiedades', singular: 'Negocio', path: '/negocios', description: 'Tiendas, talleres, garajes y propiedades.', icon: 'store' },
  rutas: { id: 'rutas', label: 'Rutas y tutoriales', singular: 'Tutorial', path: '/rutas', description: 'Recorridos y guías elaboradas para LEONIDA ATLAS.', icon: 'route' },
};

export const CATEGORY_ORDER: Category[] = ['lugares', 'dinero', 'armas', 'vehiculos', 'negocios', 'rutas', 'personajes'];

export const REGION_LABEL: Record<RegionId, string> = {
  leonida: 'Todo Leonida',
  'vice-city': 'Vice City',
  'leonida-keys': 'Leonida Keys',
  grassrivers: 'Grassrivers',
  'port-gellhorn': 'Port Gellhorn',
  ambrosia: 'Ambrosia',
  'mount-kalaga': 'Mount Kalaga',
};

export interface StatusMeta {
  label: string;
  short: string;
  description: string;
  rank: number; // mayor = más certeza
}
export const STATUS_META: Record<Status, StatusMeta> = {
  oficial: { label: 'Oficial', short: 'OFICIAL', description: 'Publicado por Rockstar Games o Take-Two.', rank: 6 },
  comprobado: { label: 'Comprobado', short: 'COMPROBADO', description: 'Reproducido en una partida documentada.', rank: 5 },
  contrastado: { label: 'Contrastado', short: 'CONTRASTADO', description: 'Dos fuentes independientes coinciden.', rank: 4 },
  reportado: { label: 'Reportado', short: 'REPORTADO', description: 'Una sola fuente no oficial; no reproducido por nosotros.', rank: 3 },
  pendiente: { label: 'Pendiente', short: 'PENDIENTE', description: 'Falta información para confirmarlo.', rank: 2 },
  obsoleto: { label: 'Obsoleto', short: 'OBSOLETO', description: 'Ya no aplica (parcheado o retirado).', rank: 1 },
};

export const EDITION_LABEL: Record<Edition, string> = {
  base: 'Juego base',
  ultimate: 'Ultimate Edition',
  vintage: 'Vintage Vice City Pack',
};

export const SPOILER_LABEL: Record<0 | 1 | 2, string> = {
  0: 'Sin spoilers',
  1: 'Spoilers leves (misiones y capítulos)',
  2: 'Todos (incluye etapas avanzadas)',
};

export const PRECISION_LABEL: Record<string, string> = {
  region: 'Precisión: región',
  zona: 'Precisión: zona',
  barrio: 'Precisión: barrio',
  exacta: 'Precisión: exacta',
};

export const MODE_LABEL: Record<string, string> = {
  historia: 'Modo historia',
  online: 'Modo online',
  'sin-confirmar': 'Sin confirmar',
};
