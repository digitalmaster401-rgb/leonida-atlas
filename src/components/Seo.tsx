import { useEffect } from 'react';
import { SITE_NAME } from '../data/meta';

/** Actualiza título y descripción en navegación SPA (el HTML prerenderizado ya trae las etiquetas OG). */
export function Seo({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = title === SITE_NAME ? `${SITE_NAME} — Guía de GTA VI` : `${title} · ${SITE_NAME}`;
    const set = (sel: string, attr: string, val: string) => document.querySelector(sel)?.setAttribute(attr, val);
    set('meta[name="description"]', 'content', description);
    set('meta[property="og:title"]', 'content', document.title);
    set('meta[property="og:description"]', 'content', description);
  }, [title, description]);
  return null;
}
