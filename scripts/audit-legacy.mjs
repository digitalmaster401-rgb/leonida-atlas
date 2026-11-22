// Auditoría de material ajeno: busca recursivamente cadenas prohibidas del prototipo anterior
// (video de terceros, fotogramas, portada, marcas de creadores) en el código, el contenido y el build.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TERMS = ['tiktok', 'creator', 'watermark', 'video-guia', 'assets/frames', 'assets/hd', 'portada-1920x1080', 'video_stops', 'timg(', 'LEONIDA_ATLAS_GTA6'];
const SKIP_DIRS = new Set(['node_modules', '.git', 'test-results', 'playwright-report', 'release', 'dev-dist']);
const SKIP_FILES = new Set(['scripts/audit-legacy.mjs', 'scripts/gen_audit.py', 'LEONIDA_ATLAS_PROMPT_MAESTRO_CLAUDE_CODE-2.md', 'AUDITORIA_DATOS.md', 'QA_REPORT.md', 'tests/data.test.ts', 'e2e/integrity.spec.ts', 'qa/audit-legacy.txt']);
const TEXT = /\.(html|js|mjs|ts|tsx|css|json|md|txt|py|toml|xml|webmanifest|svg)$|_headers$|_redirects$/;
const PROHIBITED_FILES = /video-guia\.mp4|\/frames\/|\/hd\/|portada-1920x1080/;

const hits = [];
const files = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const rel = relative(root, p);
    if (SKIP_DIRS.has(name)) continue;
    if (statSync(p).isDirectory()) walk(p);
    else {
      files.push(rel);
      if (PROHIBITED_FILES.test('/' + rel)) hits.push({ file: rel, term: 'ARCHIVO PROHIBIDO' });
      if (SKIP_FILES.has(rel) || !TEXT.test(name)) continue;
      const text = readFileSync(p, 'utf8').toLowerCase();
      for (const t of TERMS) {
        let i = text.indexOf(t.toLowerCase());
        while (i !== -1) {
          hits.push({ file: rel, term: t, context: text.slice(Math.max(0, i - 40), i + 40).replace(/\s+/g, ' ') });
          i = text.indexOf(t.toLowerCase(), i + 1);
        }
      }
    }
  }
}
walk(root);
const inDist = hits.filter((h) => h.file.startsWith('dist'));
console.log(`Archivos revisados: ${files.length} (incluye dist: ${existsSync(join(root, 'dist'))})`);
console.log(`Términos: ${TERMS.join(', ')}`);
console.log(`Coincidencias totales: ${hits.length} · en el build público (dist/): ${inDist.length}`);
for (const h of hits) console.log(` - ${h.file} :: «${h.term}» … ${h.context ?? ''}`);
process.exitCode = inDist.length ? 1 : 0;
