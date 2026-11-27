import { useEffect, useRef, useState } from 'react';
import type { Finding } from '../intel/schema';

/**
 * Carga los hallazgos de ATLAS INTELLIGENCE solo cuando el bloque aparece en pantalla (IntersectionObserver).
 * Así la portada no descarga datos que quizá no se vean y una navegación rápida no deja una descarga cortada.
 * Si la descarga falla (p. ej., se cancela al salir de la página), el bloque simplemente queda vacío.
 */
export function useIntelWhenVisible<T extends HTMLElement>(pick: (all: Finding[]) => Finding[]) {
  const ref = useRef<T>(null);
  const [list, setList] = useState<Finding[] | null>(null);
  const pickRef = useRef(pick);
  pickRef.current = pick;
  useEffect(() => {
    const el = ref.current;
    let alive = true;
    let started = false;
    const load = () => {
      if (started) return;
      started = true;
      import('../data/intel')
        .then(({ findings }) => alive && setList(pickRef.current(findings)))
        .catch(() => alive && setList([]));
    };
    if (!el || typeof IntersectionObserver === 'undefined') {
      load();
      return () => {
        alive = false;
      };
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        load();
      }
    }, { rootMargin: '120px' });
    io.observe(el);
    return () => {
      alive = false;
      io.disconnect();
    };
  }, []);
  return { ref, list };
}
