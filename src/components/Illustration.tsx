import type { Category } from '../data/schema';

const PALETTE: Record<Category, [string, string]> = {
  lugares: ['#ff3ea5', '#5b2a86'],
  personajes: ['#22d3ee', '#1e3a8a'],
  dinero: ['#c6ff3d', '#14532d'],
  armas: ['#f97316', '#3b0d0d'],
  vehiculos: ['#22d3ee', '#3b0764'],
  negocios: ['#ff3ea5', '#0f3b4a'],
  rutas: ['#facc15', '#1e1b4b'],
  coleccionables: ['#a78bfa', '#2e1065'],
};

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Ilustración editorial original (SVG generativo). Siempre se rotula como tal. */
export function Illustration({ category, seed, label }: { category: Category; seed: string; label: string }) {
  const [a, b] = PALETTE[category];
  const h = hash(seed);
  const sunY = 40 + (h % 25);
  const bars = Array.from({ length: 14 }, (_, i) => {
    const v = (h >> (i % 24)) & 31;
    return { x: i * 30, h: 30 + v * 2.2, w: 22 + (v % 7) };
  });
  const gid = `il-${h}`;
  return (
    <figure className="illustration" role="img" aria-label={`Ilustración editorial: ${label}`}>
      <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${gid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={b} />
            <stop offset="1" stopColor="#0b0d14" />
          </linearGradient>
          <linearGradient id={`${gid}-sun`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={a} />
            <stop offset="1" stopColor={a} stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <rect width="400" height="225" fill={`url(#${gid}-sky)`} />
        <circle cx={120 + (h % 160)} cy={sunY + 40} r="48" fill={`url(#${gid}-sun)`} opacity="0.85" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x="0" y={sunY + 50 + i * 9} width="400" height="3" fill="#0b0d14" opacity="0.55" />
        ))}
        {bars.map((r, i) => (
          <rect key={i} x={r.x} y={225 - r.h} width={r.w} height={r.h} fill="#0b0d14" opacity="0.92" />
        ))}
        <path d="M0 210 Q100 195 200 208 T400 205 V225 H0Z" fill={a} opacity="0.18" />
      </svg>
      <figcaption className="illustration-tag">Ilustración editorial</figcaption>
    </figure>
  );
}
