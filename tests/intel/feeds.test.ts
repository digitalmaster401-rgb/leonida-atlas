import { describe, expect, it } from 'vitest';
import { parseFeed, stripHtml } from '../../src/intel/feeds';
import { extractPageNews } from '../../src/intel/pipeline';
import { rss } from './fixtures';

describe('lectura de feeds', () => {
  it('lee RSS con CDATA y entidades', () => {
    const items = parseFeed(rss([{ title: 'GTA 6 &amp; Moses', link: 'https://a.example/1', desc: '<p>Hola <b>mundo</b></p>' }]));
    expect(items[0]).toMatchObject({ title: 'GTA 6 & Moses', link: 'https://a.example/1', summary: 'Hola mundo', publishedAt: '2026-11-21T10:00:00.000Z' });
  });
  it('lee Atom (YouTube) con link href', () => {
    const xml = `<feed><entry><title>GTA VI Now Available</title><link rel="alternate" href="https://www.youtube.com/watch?v=x1"/><published>2026-11-19T13:59:56+00:00</published><yt:videoId>x1</yt:videoId></entry></feed>`;
    expect(parseFeed(xml)[0]).toMatchObject({ title: 'GTA VI Now Available', link: 'https://www.youtube.com/watch?v=x1', id: 'x1' });
  });
  it('el contenido hostil se reduce a texto: sin scripts ni etiquetas', () => {
    const t = stripHtml('<script>alert(1)</script><img src=x onerror=alert(2)>Texto &lt;b&gt;ok&lt;/b&gt;');
    expect(t).toBe('Texto ok');
    const items = parseFeed(rss([{ title: '<script>x()</script>GTA 6', link: 'javascript:alert(1)' }, { title: 'GTA 6 ok', link: 'https://a.example/ok' }]));
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('GTA 6 ok');
  });
  it('extrae titulares con fecha de la página oficial', () => {
    const html = '"children":"Grand Theft Auto VI Now Available"..."children":"November 19, 2026"..."children":"Otro texto"';
    const items = extractPageNews(html, 'https://www.rockstargames.com/VI', 'rs');
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ title: 'Grand Theft Auto VI Now Available', publishedAt: '2026-11-19T12:00:00.000Z', dedupHint: 'page:rs:grand-theft-auto-vi-now-available' });
  });
});
