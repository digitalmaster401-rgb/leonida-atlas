/** Isotipo original de LEONIDA ATLAS: monograma «L» dentro de una rosa de los vientos. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="la-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff3ea5" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#10131d" stroke="url(#la-g)" strokeWidth="3" />
      <path d="M32 7 36 28 57 32 36 36 32 57 28 36 7 32 28 28Z" fill="none" stroke="#2a3150" strokeWidth="1.5" />
      <path d="M23 15v29h20" fill="none" stroke="url(#la-g)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M45 13 40 26" stroke="#c6ff3d" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="45" cy="13" r="2.6" fill="#c6ff3d" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <LogoMark size={34} />
      <span className="wordmark-text">
        LEONIDA <span>ATLAS</span>
      </span>
    </span>
  );
}
