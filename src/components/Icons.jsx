const I = ({ d, size = 20, sw = 1.4, children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {d ? <path d={d} /> : children}
  </svg>
);
export const Bag = (p) => <I {...p}><path d="M5 8h14l-1.2 12H6.2z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></I>;
export const Eye = (p) => <I {...p}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></I>;
export const EyeOff = (p) => <I {...p}><path d="M3 3l18 18" /><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17.6 17.6 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></I>;
export const Close = (p) => <I d="M6 6l12 12M18 6L6 18" {...p} />;
export const Menu = (p) => <I d="M4 7h16M4 12h16M4 17h16" {...p} />;
export const Search = (p) => <I {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></I>;
export const Upload = (p) => <I {...p}><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></I>;
export const Folder = (p) => <I {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></I>;
export const Edit = (p) => <I {...p}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></I>;
export const Trash = (p) => <I {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></I>;
export const Star = (p) => <I {...p}><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></I>;
export const Lock = (p) => <I {...p}><rect x="5" y="11" width="14" height="9" rx="1.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></I>;
export const User = (p) => <I {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></I>;
export const Arrow = (p) => <I d="M5 12h14M13 6l6 6-6 6" {...p} />;
export const Plus = (p) => <I d="M12 5v14M5 12h14" {...p} />;
export const Minus = (p) => <I d="M5 12h14" {...p} />;
export const Diamond = (p) => <I {...p}><path d="M6 4h12l3 5-9 11L3 9z" /><path d="M3 9h18M9 4l3 16 3-16" /></I>;

export const Ornament = ({ className = "" }) => (
  <svg className={`ornament ${className}`} viewBox="0 0 240 24" aria-hidden="true">
    <path d="M0 12h92M148 12h92" stroke="currentColor" strokeWidth=".8" />
    <path d="M120 3l9 9-9 9-9-9z" fill="none" stroke="currentColor" strokeWidth=".9" />
    <circle cx="120" cy="12" r="2.2" fill="currentColor" />
    <circle cx="100" cy="12" r="1.4" fill="currentColor" /><circle cx="140" cy="12" r="1.4" fill="currentColor" />
  </svg>
);
