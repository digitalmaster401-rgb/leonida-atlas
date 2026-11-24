// Lógica de la auditoría de material ajeno (pura y probada en tests/audit-legacy.test.ts).
// Bloquea el material del prototipo anterior (video de terceros, fotogramas, portada, marcas de creadores).
// Única excepción: una palabra común («creator», «tiktok», «watermark») DENTRO del titular exacto de una
// noticia externa registrada por ATLAS INTELLIGENCE (con URL de una fuente registrada). Se informa, no se oculta.

export const TERMS = ['tiktok', 'creator', 'watermark', 'video-guia', 'assets/frames', 'assets/hd', 'portada-1920x1080', 'video_stops', 'timg(', 'LEONIDA_ATLAS_GTA6'];
/** Palabras comunes que pueden aparecer en titulares reales de prensa. Las rutas y nombres de archivo nunca. */
export const WORD_TERMS = new Set(['tiktok', 'creator', 'watermark']);
export const PROHIBITED_FILES = /video-guia\.mp4|\/frames\/|\/hd\/|portada-1920x1080/;
/** Dónde puede vivir un titular de noticia externa: datos de ATLAS INTELLIGENCE y el build que los incluye. */
export const HEADLINE_FILES = /^(intel\/(findings\.json|proposals\/[^/]+\.(json|md)|runs\/[^/]+\.json)|dist\/.+\.(js|html|json))$/;
/** Infraestructura interna que reconoce enlaces de esa plataforma (nunca en el build público). */
export const INTERNAL_OK = (rel, term) => term === 'tiktok' && /^(src\/intel\/(normalize|schema)\.ts|tests\/|docs\/)/.test(rel);

const hostOf = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

/**
 * Titulares externos legítimos: título de un hallazgo o de su fuente, con al menos una URL cuyo dominio
 * pertenece a una fuente registrada en intel/sources.json, y sin rutas ni nombres de archivo prohibidos.
 */
export function collectHeadlines(findings, intelSources) {
  const hosts = new Set(intelSources.flatMap((s) => [s.url, s.homepage].map(hostOf).filter(Boolean)));
  const out = new Map(); // titular en minúsculas → URL de la fuente
  for (const f of findings) {
    const registered = f.sources.find((s) => hosts.has(hostOf(s.url)));
    if (!registered) continue;
    let ok = false;
    for (const t of [f.title, ...f.sources.map((s) => s.title)]) {
      if (!t) continue;
      const low = t.toLowerCase();
      if (TERMS.some((x) => !WORD_TERMS.has(x) && low.includes(x.toLowerCase()))) continue;
      out.set(low, registered.url);
      ok = true;
    }
    // el id del hallazgo («fnd-…») se genera del mismo titular: se acepta solo si el titular ya es legítimo
    if (ok && /^fnd-[a-z0-9-]+$/.test(f.id)) out.set(f.id, registered.url);
  }
  return out;
}

/** ¿La coincidencia en la posición i está dentro de uno de los titulares legítimos (tal cual o escapado en JSON)? */
function insideHeadline(text, i, term, headlines) {
  for (const [h, url] of headlines) {
    for (const form of [h, JSON.stringify(h).slice(1, -1)]) {
      let k = form.indexOf(term);
      while (k !== -1) {
        const start = i - k;
        if (start >= 0 && text.startsWith(form, start)) return { headline: h, url };
        k = form.indexOf(term, k + 1);
      }
    }
  }
  return null;
}

/** Revisa un archivo de texto ya en minúsculas. Devuelve coincidencias prohibidas y aceptadas (con motivo). */
export function scanText(rel, text, headlines) {
  const hits = [];
  const accepted = [];
  for (const t0 of TERMS) {
    const t = t0.toLowerCase();
    let i = text.indexOf(t);
    while (i !== -1) {
      const context = text.slice(Math.max(0, i - 40), i + 40).replace(/\s+/g, ' ');
      const news = WORD_TERMS.has(t0) && HEADLINE_FILES.test(rel) ? insideHeadline(text, i, t, headlines) : null;
      if (INTERNAL_OK(rel, t0)) accepted.push({ file: rel, term: t0, reason: 'infraestructura interna, pruebas o documentación técnica (nunca en dist/)' });
      else if (news) accepted.push({ file: rel, term: t0, reason: `titular de noticia externa: «${news.headline}» (${news.url})` });
      else hits.push({ file: rel, term: t0, context });
      i = text.indexOf(t, i + 1);
    }
  }
  return { hits, accepted };
}
