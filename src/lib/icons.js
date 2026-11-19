/** Inline SVG icons (stroke-based, 24px grid). */
const svg = (path, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${path}</svg>`;

export const icons = {
  search: svg('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h10"/>'),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  chevron: svg('<path d="m6 9 6 6 6-6"/>', 'class="fcard__chev"'),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  link: svg('<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>'),
  expand: svg('<path d="m7 9 5-5 5 5M7 15l5 5 5-5"/>'),
  collapse: svg('<path d="m7 4 5 5 5-5M7 20l5-5 5 5"/>'),
};

/** Brand mark: a supply curve crossing a demand curve, the equilibrium marked. */
export const brandMark = `
<svg class="brand__mark" viewBox="0 0 34 34" aria-hidden="true">
  <rect x="0.5" y="0.5" width="33" height="33" rx="8" fill="rgba(255,255,255,0.75)" stroke="rgba(32,70,128,0.16)"/>
  <path d="M7 8 C 13 15, 19 20, 27 26" fill="none" stroke="#2f6db3" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M7 26 C 14 21, 20 15, 27 9" fill="none" stroke="#7fb6c9" stroke-width="1.6" stroke-linecap="round" opacity="0.8"/>
  <circle cx="17" cy="17.4" r="2.2" fill="#ffffff" stroke="#14243d" stroke-width="1.3"/>
</svg>`;
