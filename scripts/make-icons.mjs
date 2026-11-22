// Genera favicon, iconos PWA e imagen Open Graph a partir del isotipo original (SVG) usando Playwright.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mark = (pad = 0) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${64 + pad * 2} ${64 + pad * 2}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff3ea5"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>
  ${pad ? `<rect x="${-pad}" y="${-pad}" width="${64 + pad * 2}" height="${64 + pad * 2}" fill="#10131d"/>` : ''}
  <rect x="2" y="2" width="60" height="60" rx="16" fill="#10131d" stroke="url(#g)" stroke-width="3"/>
  <path d="M32 7 36 28 57 32 36 36 32 57 28 36 7 32 28 28Z" fill="none" stroke="#2a3150" stroke-width="1.5"/>
  <path d="M23 15v29h20" fill="none" stroke="url(#g)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M45 13 40 26" stroke="#c6ff3d" stroke-width="3.2" stroke-linecap="round"/>
  <circle cx="45" cy="13" r="2.6" fill="#c6ff3d"/>
</svg>`;

const out = (p, data) => {
  mkdirSync(dirname(join(root, p)), { recursive: true });
  writeFileSync(join(root, p), data);
};
out('public/favicon.svg', mark().trim());
out('public/brand/leonida-atlas-mark.svg', mark().trim());

const browser = await chromium.launch();
const page = await browser.newPage();
async function shot(html, w, h, file) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<html><body style="margin:0;background:transparent">${html}</body></html>`);
  await page.waitForTimeout(50);
  out(file, await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } }));
}
const icon = (pad) => `<div style="width:100vw;height:100vh">${mark(pad).replace('<svg ', '<svg width="100%" height="100%" ')}</div>`;
await shot(icon(0), 192, 192, 'public/icons/icon-192.png');
await shot(icon(0), 512, 512, 'public/icons/icon-512.png');
await shot(icon(14), 512, 512, 'public/icons/icon-maskable-512.png');
await shot(icon(6), 180, 180, 'public/icons/apple-touch-icon.png');

const og = `
<div style="width:1200px;height:630px;position:relative;overflow:hidden;font-family:'Arial Narrow',Arial,sans-serif;background:linear-gradient(180deg,#140a2e 0%,#5b1a5e 55%,#ff3ea5 82%,#ffb86b 100%)">
  <div style="position:absolute;left:640px;top:250px;width:360px;height:360px;border-radius:50%;background:linear-gradient(#ffe08a,#ff3ea5)"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:200px;background:linear-gradient(#0e3a52,#0b0d14)"></div>
  <svg style="position:absolute;left:0;bottom:180px" width="1200" height="240" viewBox="0 0 1200 240"><path fill="#0b0d14" d="M0 240V150h60V60h30V20h40v130h30V0h50v150h20V50h45v100h30V90h25v60h35V-40h55v190h25V20h40v130h30V70h30v80h40V0h45v150h40V90h40v60h35V30h35v120h40V60h30v90h50v-40h60v40h45V-20h40v170h55V80h45v70h60v90z"/></svg>
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,13,20,.92) 0%,rgba(11,13,20,.75) 48%,rgba(11,13,20,0) 75%)"></div>
  <div style="position:absolute;left:70px;top:90px;width:120px;height:120px">${mark().replace('<svg ', '<svg width="120" height="120" ')}</div>
  <div style="position:absolute;left:70px;top:235px;color:#fff;font-weight:800;font-size:104px;letter-spacing:4px;line-height:1">LEONIDA <span style="color:#ff3ea5">ATLAS</span></div>
  <div style="position:absolute;left:74px;top:360px;color:#e5e7f0;font-size:38px;font-family:Arial,sans-serif">Guía independiente de GTA VI · con fuentes</div>
  <div style="position:absolute;left:74px;top:425px;color:#c6ff3d;font-size:28px;font-family:Arial,sans-serif;font-weight:700">Mapa · Dinero · Armas · Vehículos · Negocios</div>
  <div style="position:absolute;left:74px;bottom:34px;color:#a7afc8;font-size:20px;font-family:Arial,sans-serif">Proyecto de fans. Sin afiliación con Rockstar Games.</div>
</div>`;
await shot(og, 1200, 630, 'public/og/leonida-atlas-og.png');
await browser.close();
console.log('iconos generados');
