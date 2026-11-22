// Servidor estático que imita el hosting de producción (Netlify/Cloudflare Pages):
// archivos → carpeta/index.html → fallback SPA (/index.html, 200), cabeceras de public/_headers y gzip.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT || 4173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };

function parseHeaders() {
  const file = join(root, '_headers');
  if (!existsSync(file)) return [];
  const rules = [];
  let cur = null;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!line.startsWith(' ')) {
      cur = { pattern: line.trim(), headers: {} };
      rules.push(cur);
    } else if (cur) {
      const i = line.indexOf(':');
      cur.headers[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return rules;
}
const rules = parseHeaders();
const match = (pattern, path) => (pattern.endsWith('*') ? path.startsWith(pattern.slice(0, -1)) : path === pattern);

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let path = decodeURIComponent(url.pathname);
  const safe = normalize(path).replace(/^(\.\.[/\\])+/, '');
  let file = join(root, safe);
  let status = 200;
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) {
    if (extname(safe) && !safe.endsWith('.html')) status = 404;
    file = status === 404 ? join(root, '404.html') : join(root, 'index.html');
  }
  const type = TYPES[extname(file)] || 'application/octet-stream';
  const headers = { 'Content-Type': type };
  for (const r of rules) if (match(r.pattern, path)) Object.assign(headers, r.headers);
  let body = readFileSync(file);
  if (/text|javascript|json|svg|xml/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) {
    body = gzipSync(body);
    headers['Content-Encoding'] = 'gzip';
  }
  res.writeHead(status, headers);
  res.end(body);
}).listen(port, () => console.log(`dist servido en http://localhost:${port}`));
