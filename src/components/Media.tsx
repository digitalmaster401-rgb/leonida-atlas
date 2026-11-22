import { useState } from 'react';
import type { Category } from '../data/schema';
import { imageOf } from '../data';
import { Illustration } from './Illustration';

interface Props {
  id?: string;
  category: Category;
  label: string;
  sizes?: string;
  eager?: boolean;
  className?: string;
}

/** Imagen oficial optimizada (WebP 640/1280 con srcset) o ilustración editorial rotulada si no hay imagen. */
export function Media({ id, category, label, sizes = '(min-width: 1024px) 33vw, 100vw', eager = false, className }: Props) {
  const m = imageOf(id);
  const [broken, setBroken] = useState(false);
  if (!m || broken) return <Illustration category={category} seed={id ?? label} label={label} />;
  const small = m.files['640'];
  const large = m.files['1280'];
  return (
    <img
      className={className ?? 'media-img'}
      src={small.src}
      srcSet={`${small.src} ${small.width}w, ${large.src} ${large.width}w`}
      sizes={sizes}
      width={small.width}
      height={small.height}
      alt={m.captionEs}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : 'auto'}
      onError={() => setBroken(true)}
    />
  );
}
