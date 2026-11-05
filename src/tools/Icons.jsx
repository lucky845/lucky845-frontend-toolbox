// 统一图标系统：线性 SVG 图标，24x24，stroke=currentColor 跟随文字颜色
// 用 strokeWidth=1.6 线条，视觉轻盈统一，避免 emoji/文本混搭
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
}

export const Icons = {
  json: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1" />
      <path d="M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1" />
      <path d="M10 7.5v9M14 7.5v9" />
    </svg>
  ),
  regex: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
      <path d="M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2" />
    </svg>
  ),
  base64: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M9 15l3-6 3 6" />
      <path d="M9.8 13.4h4.4" />
    </svg>
  ),
  url: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
    </svg>
  ),
  color: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2 0-1.3-1-1.5-1-2.5S14.8 15 16 15c2.7 0 5-2.2 5-5a9 9 0 0 0-9-7z" />
      <circle cx="7.5" cy="11" r="1" />
      <circle cx="10" cy="7" r="1" />
      <circle cx="14.5" cy="7" r="1" />
    </svg>
  ),
  timestamp: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  qr: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM14 21v-1M21 14v0M18 18h3M21 21h-3" />
    </svg>
  ),
  markdown: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 15V9l2 3 2-3v6" />
      <path d="M17 15v-4m0 0l-1.5 1.5M17 11l1.5 1.5" />
    </svg>
  ),
  password: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="16" r="1.6" />
    </svg>
  ),
  diff: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M10 8h4M10 12h4M10 16h4" />
    </svg>
  ),
  cssunit: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <path d="M5 4l3 16h2l3-16" />
      <path d="M11 14h6M15 8h6" />
    </svg>
  ),
  hash: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <path d="M9 4L7 20M17 4l-2 16" />
      <path d="M5 9h16M3 15h16" />
    </svg>
  ),
uuid: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <rect x="5" y="9" width="14" height="8" rx="2" />
      <path d="M9 4v3M15 4v3M9 17v3M15 17v3M4 9h1M19 9h1M4 15h1M19 15h1" />
    </svg>
  ),
  binary: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <rect x="6" y="4" width="5" height="5" rx="1" />
      <rect x="13" y="4" width="5" height="5" rx="1" />
      <rect x="6" y="15" width="5" height="5" rx="1" />
      <rect x="13" y="15" width="5" height="5" rx="1" />
    </svg>
  ),
  xml: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <path d="M4 8l4 4-4 4M20 8l-4 4 4 4" />
      <path d="M13 6l-2 12" />
    </svg>
  ),
  table: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M3 16h18M10 4v16" />
    </svg>
  ),
  text: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <path d="M4 6h16M4 12h10M4 18h7" />
    </svg>
  ),
  count: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <circle cx="8" cy="10" r="3" />
      <path d="M8 16c-2.5 0-4 1.5-4 3h8c0-1.5-1.5-3-4-3z" />
      <path d="M13 8h6M13 12h4" />
    </svg>
  ),
  lorem: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <path d="M4 4h16v16H4z" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </svg>
  ),
  cron: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </svg>
  ),
  compress: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <path d="M3 8l3-3 3 3M9 16l3 3 3-3" />
      <path d="M3 5h0M9 5h4a3 3 0 0 1 3 3v8M6 8H3v13h18V8h-3" />
    </svg>
  ),
  watermark: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 16l4-5 3 3 2-2 3 4" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.53 11.53 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" {...base} className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z" />
    </svg>
  )
}