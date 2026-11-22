import type { SetURLSearchParams } from 'react-router';

/**
 * Cambia un parámetro de la URL partiendo de la URL real del navegador. React Router 7 aplica la
 * navegación dentro de una transición, así que el estado del hook puede ir un paso atrás si el usuario
 * cambia dos filtros muy rápido; leer window.location evita «revivir» filtros ya quitados.
 */
export function setQueryParam(setParams: SetURLSearchParams, key: string, value: string | null): void {
  const next = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  if (value) next.set(key, value);
  else next.delete(key);
  setParams(next, { replace: true, preventScrollReset: true });
}
