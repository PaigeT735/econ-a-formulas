/** Sidebar navigation, built from NAV_GROUPS in src/config/site.js. */
import { NAV_GROUPS, SITE } from '../config/site.js';
import { escapeHtml } from '../lib/rich.js';
import { brandMark } from '../lib/icons.js';

function renderItem(item) {
  const accent = item.accent ? ` data-accent="${item.accent}"` : '';
  const lead = item.num ? `<span class="nav-link__num">${item.num}</span>` : '<span class="nav-link__dot"></span>';
  const count = item.count != null ? `<span class="nav-link__count">${item.count}</span>` : '';
  return `<li><a class="nav-link" href="${item.href}" data-nav="${item.id}"${accent}>${lead}<span class="nav-link__label">${escapeHtml(item.label)}</span>${count}</a></li>`;
}

export function renderSidebar() {
  const groups = NAV_GROUPS.map((g) => {
    const items = typeof g.items === 'function' ? g.items() : g.items;
    return `<div class="nav-group"><div class="nav-group__label eyebrow">${escapeHtml(g.label)}</div><ul>${items.map(renderItem).join('')}</ul></div>`;
  }).join('');

  return `
    <a class="brand" href="#/" aria-label="${escapeHtml(SITE.name)} ${escapeHtml(SITE.title)}, home">
      ${brandMark}
      <span class="brand__text">
        <span class="brand__title">${escapeHtml(SITE.title)}</span>
        <span class="brand__sub">ECU22011 · ECON A MICRO</span>
      </span>
    </a>
    <nav class="sidebar__nav" aria-label="Main">${groups}</nav>
    <div class="sidebar__foot">Press <kbd>/</kbd> to search any formula, term or exam phrase.</div>`;
}

/** Highlight the active nav item. `activeId` matches an item id. */
export function setActiveNav(root, activeId) {
  root.querySelectorAll('.nav-link').forEach((a) => {
    if (a.dataset.nav === activeId) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}
