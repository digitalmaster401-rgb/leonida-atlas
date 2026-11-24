// Auditoría de material ajeno: busca recursivamente cadenas prohibidas del prototipo anterior
// (video de terceros, fotogramas, portada, marcas de creadores) en el código, el contenido y el build.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { TERMS, PROHIBITED_FILES, collectHeadlines, scanText } from './audit-legacy-lib.mjs';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'test-results', 'playwright-report', 'release', 'dev-dist']);
const SKIP_FILES = new Set(['scripts/audit-legacy.mjs', 'scripts/audit-legacy-lib.mjs', 'scripts/gen_audit.py', 'scripts/make_zip.py', 'LEONIDA_ATLAS_PROMPT_MAESTRO_CLAUDE_CODE-2.md', 'AUDITORIA_DATOS.md', 'QA_REPORT.md', 'tests/data.test.ts', 'tests/audit-legacy.test.ts', 'e2e/integrity.spec.ts', 'qa/audit-legacy.txt']);
const TEXT = /\.(html|js|mjs|ts|tsx|css|json|md|txt|py|toml|xml|webmanifest|svg)$|_headers$|_redirects$/;
const readJson = (p, fallback) => (existsSync(join(root, p)) ? JSON.parse(readFileSync(join(root, p), 'utf8')) : fallback);
const headlines = collectHeadlines(readJson('intel/findings.json', []), readJson('intel/sources.json', []));
const hits = [];
const accepted = [];
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
      const r = scanText(rel.split('\\').join('/'), readFileSync(p, 'utf8').toLowerCase(), headlines);
      hits.push(...r.hits);
      accepted.push(...r.accepted);
    }
  }
}
walk(root);
const inDist = hits.filter((h) => h.file.startsWith('dist'));
console.log(`Archivos revisados: ${files.length} (incluye dist: ${existsSync(join(root, 'dist'))})`);
console.log(`Términos: ${TERMS.join(', ')}`);
console.log(`Coincidencias no permitidas: ${hits.length} · en el build público (dist/): ${inDist.length}`);
console.log(`Menciones aceptadas con motivo (código interno que reconoce enlaces de esa plataforma, o palabra común dentro del titular exacto de una noticia externa registrada): ${accepted.length}`);
for (const a of accepted) console.log(`   · ${a.file} :: «${a.term}» — ${a.reason}`);
for (const h of hits) console.log(` - ${h.file} :: «${h.term}» … ${h.context ?? ''}`);
process.exitCode = hits.length ? 1 : 0;
