/**
 * App entry: builds the shell, then routes on hash changes.
 */
import { ROUTES, NOT_FOUND } from './config/routes.js';
import { SITE } from './config/site.js';
import { renderSidebar, setActiveNav } from './components/sidebar.js';
import { renderSearchBox, mountSearchBox } from './components/search-box.js';
import { escapeHtml } from './lib/rich.js';
import { icons } from './lib/icons.js';

const $ = (sel) => document.querySelector(sel);

const sidebar = $('#sidebar');
const backdrop = $('.backdrop');
const main = $('#main');
const crumbs = $('.crumbs');
const menuBtn = $('.menu-btn');
const toastEl = $('.toast');

/* ---------- Shell ---------- */
sidebar.innerHTML = renderSidebar();
$('.topbar__search').innerHTML = renderSearchBox();
menuBtn.innerHTML = icons.menu;

const setDrawer = (open) => {
  sidebar.dataset.open = String(open);
  backdrop.dataset.open = String(open);
  menuBtn.setAttribute('aria-expanded', String(open));
};
menuBtn.addEventListener('click', () => setDrawer(sidebar.dataset.open !== 'true'));
backdrop.addEventListener('click', () => setDrawer(false));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });

let toastTimer;
function toast(message) {
  toastEl.textContent = message;
  toastEl.dataset.show = 'true';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.dataset.show = 'false'), 1800);
}

function navigate(href) {
  if (location.hash === href) route();
  else location.hash = href;
}

const search = mountSearchBox($('.topbar__search'), { navigate });

/* ---------- Router ---------- */
let current = { key: null, view: null, el: null, cleanups: [] };

function parse() {
  const raw = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('?')[0];
  return raw.split('/').filter(Boolean);
}

function resolve(segments) {
  for (const view of ROUTES) {
    const params = view.match(segments);
    if (params) return { view, params };
  }
  return { view: NOT_FOUND, params: {} };
}

function renderCrumbs(list) {
  crumbs.innerHTML = list
    .map((c, i) => {
      const sep = i ? '<span class="crumbs__sep">/</span>' : '';
      return c.href ? `${sep}<a href="${c.href}">${escapeHtml(c.label)}</a>` : `${sep}<span class="crumbs__current" aria-current="page">${escapeHtml(c.label)}</span>`;
    })
    .join('');
}

function route() {
  // Ignore non-route hashes (e.g. the skip link)
  if (location.hash && !location.hash.startsWith('#/')) return;

  const { view, params } = resolve(parse());
  const key = view.key(params);
  setDrawer(false);

  const ctx = { navigate, toast, focusSearch: search.focus, onLeave: (fn) => current.cleanups.push(fn) };

  if (key === current.key && view.update) {
    view.update(current.el, params, ctx);
    return;
  }

  current.cleanups.forEach((fn) => fn());
  const out = view.render(params);
  const el = document.createElement('div');
  el.className = 'view';
  if (out.accent) el.dataset.accent = out.accent;
  el.innerHTML = out.html;
  main.replaceChildren(el);
  current = { key, view, el, cleanups: [] };

  document.title = out.title ? `${out.title} · ${SITE.title} · ${SITE.docTitle}` : `${SITE.title} · ${SITE.docTitle}`;
  document.body.dataset.accent = out.accent ?? '';
  if (!out.accent) delete document.body.dataset.accent;
  renderCrumbs(out.crumbs ?? []);
  setActiveNav(sidebar, out.nav);

  window.scrollTo(0, 0);
  view.mount?.(el, params, { ...ctx, onLeave: (fn) => current.cleanups.push(fn) });
}

window.addEventListener('hashchange', route);
route();
