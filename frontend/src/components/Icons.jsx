// Lightweight inline SVG icon set (no deps). Stroke = currentColor.
const base = {
  width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
}
const make = (children) => (props) => (
  <svg {...base} {...props}>{children}</svg>
)

export const IconHeart       = make(<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>)
export const IconCalendar    = make(<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>)
export const IconUser        = make(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>)
export const IconUsers       = make(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>)
export const IconStethoscope = make(<><path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 21a4 4 0 0 0 4-4v-3"/><circle cx="18" cy="11" r="2"/></>)
export const IconPill        = make(<><rect x="2.5" y="9" width="19" height="6" rx="3" transform="rotate(-45 12 12)"/><path d="M8.5 8.5l7 7"/></>)
export const IconReceipt     = make(<><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 2V2L4 2z"/><path d="M8 7h8M8 11h8M8 15h5"/></>)
export const IconShield      = make(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>)
export const IconActivity    = make(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>)
export const IconClock       = make(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>)
export const IconLogout      = make(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>)
export const IconHome        = make(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-5h-2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></>)
export const IconLayout      = make(<><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></>)
export const IconPlus        = make(<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>)
export const IconArrowRight  = make(<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>)
export const IconCheck       = make(<polyline points="20 6 9 17 4 12"/>)
export const IconX           = make(<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>)
export const IconBell        = make(<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></>)
export const IconSparkle     = make(<><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></>)
