/**
 * Logotipo horizontal de LEONIDA ATLAS (Fase 4A.2): palmera neón + «LEONIDA» cromado en cursiva + «ATLAS» magenta.
 * Composición original inspirada en la dirección visual aprobada por el propietario. No reproduce logotipos de
 * Rockstar Games ni de GTA VI (sin el numeral «VI» ni su tipografía). Versión estática: public/brand/leonida-atlas-logo.svg.
 */
export function BrandLogo({ className = 'brand-logo', title }: { className?: string; title?: string }) {
  return (
    <svg className={className} viewBox="0 0 360 96" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} focusable="false">
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id="bl-chrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".48" stopColor="#e4e8f7" />
          <stop offset=".52" stopColor="#a9b1d6" />
          <stop offset="1" stopColor="#f3f5ff" />
        </linearGradient>
        <linearGradient id="bl-neon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff3ea5" />
          <stop offset="1" stopColor="#ff7cc3" />
        </linearGradient>
        <linearGradient id="bl-swoosh" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset=".35" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#ff3ea5" stopOpacity="0" />
        </linearGradient>
        <filter id="bl-glow" x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Palmera neón */}
      <g filter="url(#bl-glow)" fill="none" stroke="url(#bl-neon)" strokeLinecap="round" strokeLinejoin="round">
        <path d="M36 88c-2-22 1-42 9-58" strokeWidth="4.5" />
        <path d="M45 30c-10-8-24-9-35-3M45 30c-2-11-10-19-21-21M45 30c6-10 18-14 30-12M45 30c12-1 21 5 26 14M45 30c-11 2-20 9-24 18" strokeWidth="3.6" />
      </g>
      <g transform="skewX(-12)">
        <text x="88" y="50" className="bl-word" fill="url(#bl-chrome)" stroke="#0b0d14" strokeWidth="1.2" paintOrder="stroke">
          LEONIDA
        </text>
        <text x="132" y="86" className="bl-sub" fill="url(#bl-neon)" filter="url(#bl-glow)">
          ATLAS
        </text>
      </g>
      <path d="M78 58h262" stroke="url(#bl-swoosh)" strokeWidth="2" />
    </svg>
  );
}
