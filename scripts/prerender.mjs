// Tras `vite build`: genera un index.html por ruta (estático) con título, descripción y etiquetas
// Open Graph propias de cada página. Así un enlace compartido abre la ficha correcta en cualquier
// hosting estático (sin 404) y WhatsApp/Discord/Facebook muestran título e imagen.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const entries = JSON.parse(readFileSync(join(root, 'content/entries.json'), 'utf8'));
const SITE = (process.env.SITE_URL || process.env.URL || process.env.CF_PAGES_URL || '').replace(/\/$/, '');
const CAT_PATH = { lugares: '/lugares', personajes: '/personajes', dinero: '/dinero', armas: '/armas', vehiculos: '/vehiculos', negocios: '/negocios', rutas: '/rutas', coleccionables: '/coleccionables' };
const NAME = 'LEONIDA ATLAS';
const DEFAULT_DESC = 'Guía independiente de GTA VI en español de México: mapa oficial, dinero, armas, vehículos y negocios con fuentes verificables.';

const pages = [
  { path: '/', title: `${NAME} — Guía de GTA VI`, desc: DEFAULT_DESC },
  { path: '/mapa', title: `Mapa de Leonida · ${NAME}`, desc: 'Visor del mapa oficial de Leonida con puntos de precisión declarada enlazados a cada ficha.' },
  { path: '/dinero', title: `Dinero y glitches · ${NAME}`, desc: 'Métodos para ganar dinero en GTA VI con pago, requisitos, riesgos y nivel de evidencia. Calculadora incluida.' },
  { path: '/armas', title: `Armas · ${NAME}`, desc: 'Armas oficiales, Ammu-Nation y armas únicas reportadas en GTA VI.' },
  { path: '/vehiculos', title: `Vehículos · ${NAME}`, desc: 'Vehículos confirmados de GTA VI y dónde encontrarlos.' },
  { path: '/negocios', title: `Negocios y propiedades · ${NAME}`, desc: 'Tiendas, talleres, garajes y propiedades de GTA VI.' },
  { path: '/rutas', title: `Rutas y tutoriales · ${NAME}`, desc: 'Recorridos y guías elaboradas para LEONIDA ATLAS.' },
  { path: '/lugares', title: `Lugares · ${NAME}`, desc: 'Las seis regiones oficiales de Leonida y sus zonas.' },
  { path: '/personajes', title: `Personajes · ${NAME}`, desc: 'Protagonistas y personajes de GTA VI presentados por Rockstar.' },
  { path: '/intel', title: `ATLAS INTELLIGENCE · ${NAME}`, desc: 'Investigación automatizada de GTA VI: novedades, hallazgos con estado por plataforma, parches, bitácora y preguntas con fuentes.' },
  { path: '/novedades', title: `Novedades · ${NAME}`, desc: 'Qué cambió en GTA VI según las fuentes vigiladas por ATLAS INTELLIGENCE, con fecha real de investigación.' },
  { path: '/coleccionables', title: `Coleccionables · ${NAME}`, desc: 'Tarjetas, revistas, libros y otras colecciones de GTA VI con seguimiento individual y fuentes.' },
  { path: '/trucos', title: `Trucos y códigos · ${NAME}`, desc: 'Trucos de GTA VI para PS5 y Xbox Series X|S: secuencias, efectos, requisitos y consecuencias, con evidencia.' },
  { path: '/consola', title: `Ajustes de consola · ${NAME}`, desc: 'Configuración documentada de GTA VI en PS5, PS5 Pro y Xbox Series X|S: rendimiento, pantalla, controles y accesibilidad.' },
  { path: '/equipamiento', title: `Equipamiento de armas · ${NAME}`, desc: 'Arma tu carga de armas de GTA VI con las reglas documentadas: 2 cortas, 2 largas y cuerpo a cuerpo.' },
  { path: '/mi-espacio', title: `Mi espacio · ${NAME}`, desc: 'Tu progreso, fotos, encontrados y pendientes, guardados solo en tu dispositivo.' },
  { path: '/galeria', title: `Galería · ${NAME}`, desc: 'Imágenes oficiales de GTA VI con procedencia.' },
  { path: '/mi-partida', title: `Mi espacio · ${NAME}`, desc: 'Tu progreso, fotos, encontrados y pendientes, guardados solo en tu dispositivo.' },
  { path: '/fuentes', title: `Fuentes y cambios · ${NAME}`, desc: 'Fuentes, criterios de evidencia y registro de cambios.' },
  { path: '/buscar', title: `Buscar · ${NAME}`, desc: DEFAULT_DESC },
  { path: '/legal', title: `Aviso legal y créditos · ${NAME}`, desc: 'Aviso legal, derechos de imágenes y privacidad.' },
  { path: '/editor', title: `Herramientas del editor · ${NAME}`, desc: 'Validación local del contenido.', noindex: true },
  ...entries.map((e) => ({ path: `${CAT_PATH[e.category]}/${e.slug}`, title: `${e.name} · ${NAME}`, desc: e.summary })),
];

// Precarga de las tipografías visibles en la portada (evita saltos de diseño al cargar fuentes)
import { readdirSync } from 'node:fs';
const fonts = readdirSync(join(dist, 'assets')).filter((f) => /^(barlow-condensed-latin-700|inter-latin-400|inter-latin-600)-normal-.*\.woff2$/.test(f));
const preload = fonts.map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`).join('\n    ');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const template = readFileSync(join(dist, 'index.html'), 'utf8').replace('</head>', `    ${preload}\n  </head>`);

function render(p) {
  let html = template;
  const abs = (u) => (SITE ? SITE + u : u);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>`);
  html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(p.desc)}$2`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(p.title)}$2`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(p.desc)}$2`);
  html = html.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${abs('/og/leonida-atlas-og.png')}$2`);
  const extra = [
    SITE ? `<link rel="canonical" href="${SITE}${p.path}" />` : '',
    SITE ? `<meta property="og:url" content="${SITE}${p.path}" />` : '',
    p.noindex ? '<meta name="robots" content="noindex" />' : '',
  ].filter(Boolean).join('\n    ');
  if (extra) html = html.replace('</head>', `    ${extra}\n  </head>`);
  return html;
}

for (const p of pages) {
  const file = p.path === '/' ? join(dist, 'index.html') : join(dist, p.path.slice(1), 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, render(p));
}
// 404 estático para rutas inexistentes (la app muestra «No encontramos esta página»)
writeFileSync(join(dist, '404.html'), render({ path: '/404', title: `Página no encontrada · ${NAME}`, desc: DEFAULT_DESC, noindex: true }));

if (SITE) {
  const urls = pages.filter((p) => !p.noindex).map((p) => `  <url><loc>${SITE}${p.path}</loc><lastmod>2026-11-22</lastmod></url>`);
  writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
  writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /editor\nSitemap: ${SITE}/sitemap.xml\n`);
} else if (!existsSync(join(dist, 'robots.txt'))) {
  writeFileSync(join(dist, 'robots.txt'), 'User-agent: *\nAllow: /\nDisallow: /editor\n');
}
console.log(`prerender: ${pages.length} páginas${SITE ? ` · sitio ${SITE} · sitemap generado` : ' · sin SITE_URL (og:url, canonical y sitemap omitidos)'}`);
