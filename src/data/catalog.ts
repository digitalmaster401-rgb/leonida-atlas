// Catálogo ampliado (Fase 4D-datos): registros importados de GTA Atlas (CC BY-SA 4.0) por research/atlasgta.
// Cada entidad se carga bajo demanda para no engordar el paquete principal.
import type { Status } from './schema';
import catalogIndex from '../../content/catalog/index.json';

export const ENTIDADES = ['vehicles', 'weapons', 'properties', 'locations', 'collectibles', 'missions', 'trophies', 'completion', 'cheats', 'characters', 'animals', 'interiors'] as const;
export type Entidad = (typeof ENTIDADES)[number];

export interface CatalogRecord {
  id: string;
  entidad: Entidad;
  slug: string;
  nombre: string;
  tipo: string | null;
  tipoEs: string | null;
  subtitulo: string | null;
  resumen: string;
  hechos: { etiqueta: string; valor: string | number }[];
  numeros: Record<string, number>;
  estado: Status;
  grupos: string[];
  fuentes: string[];
  relaciones: { entidad: Entidad; slug: string; nombre: string }[];
  coords: { sistema: string; x: number; y: number } | null;
  spoiler: 0 | 1;
  curada: { ruta: string; id: string } | null;
  foto: string | null;
  verificadoFuente: string | null;
  origen: { proveedor: string; url: string; licencia: string };
  hash: string;
}

export const ENTIDAD_META: Record<Entidad, { ruta: string; titulo: string; singular: string; icon: string; media?: string }> = {
  vehicles: { ruta: 'vehiculos', titulo: 'Vehículos', singular: 'Vehículo', icon: 'car', media: 'ue-cheetah' },
  weapons: { ruta: 'armas', titulo: 'Armas', singular: 'Arma', icon: 'target', media: 'ue-revolveres' },
  properties: { ruta: 'propiedades', titulo: 'Propiedades', singular: 'Propiedad', icon: 'store', media: 'ue-safehouse' },
  locations: { ruta: 'lugares', titulo: 'Lugares', singular: 'Lugar', icon: 'pin', media: 'vc-calles' },
  collectibles: { ruta: 'colecciones', titulo: 'Colecciones', singular: 'Colección', icon: 'grid', media: 'keys-buceo' },
  missions: { ruta: 'misiones', titulo: 'Misiones', singular: 'Misión', icon: 'flag', media: 'jl-banco' },
  trophies: { ruta: 'trofeos', titulo: 'Trofeos y logros', singular: 'Trofeo', icon: 'star', media: 'vc-letrero' },
  completion: { ruta: 'cien-por-ciento', titulo: 'Lista del 100 %', singular: 'Línea del 100 %', icon: 'check', media: 'jl-mirador' },
  cheats: { ruta: 'trucos', titulo: 'Trucos', singular: 'Truco', icon: 'gamepad', media: 'vc-car-meet' },
  characters: { ruta: 'personajes', titulo: 'Personajes', singular: 'Personaje', icon: 'user', media: 'p-lucia' },
  animals: { ruta: 'fauna', titulo: 'Fauna', singular: 'Animal', icon: 'eye', media: 'keys-pez-leon' },
  interiors: { ruta: 'interiores', titulo: 'Interiores', singular: 'Interior', icon: 'store', media: 'keys-bar' },
};

export const entidadDeRuta = (ruta: string | undefined): Entidad | undefined => ENTIDADES.find((e) => ENTIDAD_META[e].ruta === ruta);

type Resumen = Record<Entidad, { recibidos: number; publicados: number; pendientesVerificar: number; pendientesRevision: number; rechazados: number; duplicados: number; enlazadosConFichaCurada: number; conFoto: number; sinFoto: number; porEvidencia: Partial<Record<Status, number>> }>;
export const catalogMeta = catalogIndex as unknown as { proveedor: string; importado: string; licencia: { nombre: string; url: string; atribucion: string; obligaciones: string }; creditosRequeridos: string[]; resumen: Resumen; totales: Record<string, number> };

const loaders: Record<Entidad, () => Promise<{ default: unknown }>> = {
  vehicles: () => import('../../content/catalog/vehicles.json'),
  weapons: () => import('../../content/catalog/weapons.json'),
  properties: () => import('../../content/catalog/properties.json'),
  locations: () => import('../../content/catalog/locations.json'),
  collectibles: () => import('../../content/catalog/collectibles.json'),
  missions: () => import('../../content/catalog/missions.json'),
  trophies: () => import('../../content/catalog/trophies.json'),
  completion: () => import('../../content/catalog/completion.json'),
  cheats: () => import('../../content/catalog/cheats.json'),
  characters: () => import('../../content/catalog/characters.json'),
  animals: () => import('../../content/catalog/animals.json'),
  interiors: () => import('../../content/catalog/interiors.json'),
};
const cache = new Map<Entidad, CatalogRecord[]>();
export async function loadCatalog(e: Entidad): Promise<CatalogRecord[]> {
  const hit = cache.get(e);
  if (hit) return hit;
  const list = (await loaders[e]()).default as CatalogRecord[];
  cache.set(e, list);
  return list;
}
