const PATHS: Record<string, string> = {
  home: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  map: 'M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4zm0 0v13m6-10.5v13',
  pin: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0',
  cash: 'M3 7h18v10H3zM7 7a4 4 0 0 1-4 4m18 0a4 4 0 0 1-4-4M7 17a4 4 0 0 0-4-4m18 0a4 4 0 0 0-4 4M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 1v4m0 14v4M1 12h4m14 0h4',
  car: 'M5 16v3m14-3v3M3 16h18v-4l-2-5H5l-2 5zm4-1.5h.01M17 14.5h.01M5 12h14',
  store: 'M4 10v10h16V10M3 4h18l-1 6H4zm6 16v-6h6v6',
  route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7',
  search: 'M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zM21 21l-5-5',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
  check: 'M4 12.5l5 5L20 6.5',
  share: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  book: 'M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zm16 0h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  reset: 'M4 4v6h6M20 20v-6h-6M5.5 15a7 7 0 0 0 12.8 1.5M18.5 9A7 7 0 0 0 5.7 7.5',
  image: 'M4 5h16v14H4zm0 11 5-5 4 4 2-2 5 5M15.5 9.5h.01',
  alert: 'M12 3 2 20h20zM12 10v4m0 3h.01',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  download: 'M12 4v11m-5-5 5 5 5-5M4 20h16',
  upload: 'M12 20V9m-5 5 5-5 5 5M4 4h16',
  calc: 'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 4h8v3H8zm0 7h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01M16 17.5h.01',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  filter: 'M3 5h18l-7 8v6l-4-2v-4z',
  flag: 'M5 21V4m0 0h11l-2 4 2 4H5',
  install: 'M12 3v12m-4-4 4 4 4-4M5 21h14',
  wifi_off: 'M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5-2.7M12 20h.01M19 13a10 10 0 0 0-2.5-1.8M2 8.8A15 15 0 0 1 6.3 6M22 8.8A15 15 0 0 0 11 5',
  note: 'M5 4h14v12l-4 4H5zm10 12v4m0-4h4M8 9h8M8 13h5',
  arrow_left: 'M15 6l-6 6 6 6',
  arrow_right: 'M9 6l6 6-6 6',
  grid: 'M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z',
  gamepad: 'M7 8h10a5 5 0 0 1 4.6 7l-.8 2a2.5 2.5 0 0 1-4.3.6L15 16H9l-1.5 1.6a2.5 2.5 0 0 1-4.3-.6l-.8-2A5 5 0 0 1 7 8zm1 3v3m-1.5-1.5h3M15.5 12h.01M17.5 14h.01',
  sliders: 'M4 6h10m4 0h2M4 12h4m4 0h8M4 18h12m4 0h0M14 4v4M8 10v4M16 16v4',
  layers: 'M12 3 2 8l10 5 10-5zM2 13l10 5 10-5M2 17.5l10 5 10-5',
  camera: 'M4 7h3l2-3h6l2 3h3v13H4zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  trash: 'M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  list: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm3.5-12.5-2 5-5 2 2-5z',
  coins: 'M12 9c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 6v4c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 10v4c0 1.7 3.6 3 8 3s8-1.3 8-3v-4M4 14v4c0 1.7 3.6 3 8 3s8-1.3 8-3v-4',
  news: 'M4 5h13v14H6a2 2 0 0 1-2-2zm13 4h3v8a2 2 0 0 1-2 2h-1M7 8h7M7 11h7M7 14h4',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z',
  play: 'M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5zM10 9v6l5-3z',
  rss: 'M5 19h.01M5 12a7 7 0 0 1 7 7M5 5a14 14 0 0 1 14 14',
  people: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm-6 9a6 6 0 0 1 12 0m1-9a3 3 0 1 0 0-6m2 15a5.5 5.5 0 0 0-3-5',
  shield: 'M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6zm-3.5 9 2.5 2.5 4.5-5',
  edit: 'M4 20h4L19 9l-4-4L4 16zm9-13 4 4',
  scan: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8',
  doc: 'M6 3h9l4 4v14H6zm9 0v4h4M9 12h7M9 16h5',
};

export function Icon({ name, size = 20, title, className }: { name: string; size?: number; title?: string; className?: string }) {
  const d = PATHS[name] ?? PATHS.pin;
  const filled = name === 'star';
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <path d={d} />
    </svg>
  );
}
