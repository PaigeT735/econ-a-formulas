/**
 * Formula Library views
 *   #/formulas                     index of every section and card
 *   #/formulas/:section            section page
 *   #/formulas/:section/:anchorId  section page, scrolled to a card or table
 */
import { SECTIONS, sectionById, cardCode } from '../content/formulas/index.js';
import { renderCard, setCardOpen } from '../components/card.js';
import { renderTable } from '../components/table.js';
import { rich, escapeHtml } from '../lib/rich.js';
import { icons } from '../lib/icons.js';
import { moveInk } from '../components/sidebar.js';

/** Short label for the in-page nav: "Marginal rate of substitution (MRS)" -> "MRS". */
function navLabel(card) {
  if (card.nav) return card.nav;
  const paren = card.title.match(/\(([^)]+)\)\s*$/);
  if (paren && paren[1].length <= 5 && paren[1] === paren[1].toUpperCase()) return paren[1];
  return card.title.split(/:\s|\s\(/)[0];
}

/* ---------- Index ---------- */
function renderIndex() {
  const blocks = SECTIONS.map((s) => {
    const cards = s.cards
      .map((c, i) => `<li><a href="#/formulas/${s.id}/${c.id}"><span>${cardCode(s, i)}</span><span>${escapeHtml(c.title)}</span></a></li>`)
      .join('');
    const tables = (s.tables ?? [])
      .map((tb) => `<li><a href="#/formulas/${s.id}/${tb.id}"><span>Tbl</span><span>${escapeHtml(tb.title)}</span></a></li>`)
      .join('');
    return `
      <section class="lib-block panel" data-accent="${s.accent}">
        <div class="lib-block__head"><span class="lib-block__num">${String(s.number).padStart(2, '0')}</span><a class="lib-block__title" href="#/formulas/${s.id}">${escapeHtml(s.title)}</a></div>
        <ul>${cards}</ul>
        ${tables ? `<ul class="lib-block__tables">${tables}</ul>` : ''}
      </section>`;
  }).join('');

  return `
  <div class="page"><div class="page__inner">
    <header class="lib-head">
      <div class="eyebrow">Formula Library</div>
      <h1 class="lib-head__title">All formulas</h1>
      <p class="lib-head__lede">Every card and comparison table on one page. Jump straight to what you need, or open a section to revise it in order.</p>
    </header>
    <div class="lib-grid">${blocks}</div>
  </div></div>`;
}

/* ---------- Continuous library: every section on one scrolling page ---------- */
function sectionBlock(section) {
  const hasPaper = section.cards.some((c) => c.paper?.length);
  const hasExt = section.cards.some((c) => c.level === 'extension');

  const method = section.method
    ? `<aside class="method panel" aria-label="Method">
        <div class="eyebrow">Exam method</div>
        <h3 class="method__title">${escapeHtml(section.method.title)}</h3>
        <ol class="method__steps">${section.method.steps.map((s) => `<li><span>${rich(s)}</span></li>`).join('')}</ol>
      </aside>`
    : '';

  const filters = hasPaper || hasExt
    ? `<div class="segmented" role="group" aria-label="Filter ${escapeHtml(section.title)} cards">
        <button type="button" data-filter="all" aria-pressed="true">All</button>
        ${hasPaper ? '<button type="button" data-filter="paper" aria-pressed="false">On the paper</button>' : ''}
        ${hasExt ? '<button type="button" data-filter="extension" aria-pressed="false">Beyond the paper</button>' : ''}
      </div>`
    : '';

  return `
  <section class="flow-section" id="${section.id}" data-section="${section.id}" data-accent="${section.accent}" aria-labelledby="${section.id}-heading">
    <header class="section-hero">
      <div class="section-hero__eyebrow"><span class="eyebrow">Section ${String(section.number).padStart(2, '0')}</span><span class="eyebrow">${section.cards.length} formulas</span></div>
      <h2 class="section-hero__title" id="${section.id}-heading">${escapeHtml(section.title)}</h2>
      <p class="section-hero__lede">${rich(section.summary)}</p>
    </header>

    ${method}

    <div class="toolbar">
      <div class="toolbar__left">${filters}<span class="toolbar__count" data-count></span></div>
      <div class="toolbar__right">
        <button class="btn" type="button" data-action="expand-all">${icons.expand}Expand all</button>
        <button class="btn" type="button" data-action="collapse-all">${icons.collapse}Collapse all</button>
      </div>
    </div>

    <div class="cards">${section.cards.map((c, idx) => renderCard(c, section, idx)).join('')}</div>
    <div class="empty-filter" data-empty hidden>No cards match this filter.</div>

    ${section.tables?.length ? `<div class="subhead"><span class="eyebrow">Compare</span><h3>Comparison tables</h3></div><div class="tables">${section.tables.map(renderTable).join('')}</div>` : ''}
  </section>`;
}

function renderFlow() {
  // One chip group per section; only the group for the section in view is shown.
  const groups = SECTIONS.map((section) => `
    <div class="tabs__track" data-group="${section.id}" data-accent="${section.accent}" hidden>
      ${section.cards.map((c, idx) => `<a class="tab" href="#/formulas/${section.id}/${c.id}" data-target="${c.id}" title="${escapeHtml(c.title)}"><span class="tab__code">${cardCode(section, idx)}</span>${escapeHtml(navLabel(c))}</a>`).join('')}
      ${(section.tables ?? []).map((tb) => `<a class="tab" href="#/formulas/${section.id}/${tb.id}" data-target="${tb.id}" title="${escapeHtml(tb.title)}"><span class="tab__code">Table</span>${escapeHtml(tb.title)}</a>`).join('')}
      <span class="ink" aria-hidden="true"></span>
    </div>`).join('');

  return `
  <nav class="subnav" aria-label="Formulas in this section">
    <div class="subnav__inner">
      <span class="subnav__label" data-subnav-label></span>
      <div class="tabs" data-subnav>${groups}</div>
    </div>
  </nav>
  <div class="page">
    <div class="section-wrap flow">${SECTIONS.map(sectionBlock).join('')}</div>
  </div>`;
}

let suppressHashUntil = 0; // don't rewrite the address while we're scrolling to a requested spot

function focusAnchor(root, anchorId, { smooth = true } = {}) {
  if (!anchorId) return;
  suppressHashUntil = performance.now() + (smooth ? 1400 : 900);
  const el = root.querySelector(`#${CSS.escape(anchorId)}`);
  if (!el) return;
  const isCard = el.classList.contains('fcard');
  if (isCard) {
    if (el.hidden) applyFilter(el.closest('.flow-section'), 'all');
    setCardOpen(el, true);
  }
  requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    // On first load, fonts and maths can still shift the layout: settle once more.
    if (!smooth) {
      const target = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      const settle = () => { if (Math.abs(el.getBoundingClientRect().top - target) > 8) el.scrollIntoView({ block: 'start' }); };
      document.fonts?.ready.then(() => setTimeout(settle, 60));
      setTimeout(settle, 450);
    }
    if (isCard) {
      el.classList.remove('is-flash');
      void el.offsetWidth; // restart animation
      el.classList.add('is-flash');
    }
  });
}

function applyFilter(scope, filter) {
  let shown = 0;
  const cards = scope.querySelectorAll('.fcard');
  cards.forEach((card) => {
    const visible = filter === 'all' || (filter === 'paper' && card.dataset.paper === 'true') || (filter === 'extension' && card.dataset.level === 'extension');
    card.hidden = !visible;
    const chip = document.querySelector(`.subnav [data-target="${card.id}"]`);
    if (chip) chip.hidden = !visible;
    if (visible) shown += 1;
  });
  scope.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
  const count = scope.querySelector('[data-count]');
  if (count) count.textContent = shown === cards.length ? `${cards.length} cards` : `${shown} of ${cards.length} cards`;
  const empty = scope.querySelector('[data-empty]');
  if (empty) empty.hidden = shown > 0;
}

function mountFlow(root, params, ctx) {
  root.querySelectorAll('.flow-section').forEach((sec) => applyFilter(sec, 'all'));

  root.addEventListener('click', (e) => {
    const toggle = e.target.closest('.fcard__toggle');
    if (toggle) {
      const card = toggle.closest('.fcard');
      setCardOpen(card, card.dataset.open !== 'true');
      return;
    }
    const scope = e.target.closest('.flow-section');
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (scope && (action === 'expand-all' || action === 'collapse-all')) {
      scope.querySelectorAll('.fcard:not([hidden])').forEach((c) => setCardOpen(c, action === 'expand-all'));
      return;
    }
    const filterBtn = e.target.closest('[data-filter]');
    if (scope && filterBtn) {
      applyFilter(scope, filterBtn.dataset.filter);
      root.__spy?.();
      return;
    }
    const copy = e.target.closest('[data-copy-link]');
    if (copy) {
      const url = `${location.origin}${location.pathname}${copy.dataset.copyLink}`;
      const done = () => ctx.toast('Link copied');
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done, () => ctx.toast(url));
      else ctx.toast(url);
    }
  });

  /* Scroll-spy: as you scroll, track the section (top tabs) and the card (sub-nav) in view */
  const sections = [...root.querySelectorAll('.flow-section')];
  const strip = root.querySelector('[data-subnav]');
  const label = root.querySelector('[data-subnav-label]');
  const topTabs = document.querySelector('[data-slot="tabs"]');
  const subnav = root.querySelector('.subnav');
  let curSection = null;
  let curChip = null;

  const setSection = (sec) => {
    if (sec === curSection) return;
    curSection = sec;
    const section = sectionById.get(sec.dataset.section);
    strip.querySelectorAll('[data-group]').forEach((g) => { g.hidden = g.dataset.group !== section.id; });
    strip.querySelectorAll('a[aria-current]').forEach((a) => a.removeAttribute('aria-current'));
    strip.scrollLeft = 0;
    label.textContent = `${String(section.number).padStart(2, '0')} · ${section.short}`;
    subnav.dataset.accent = section.accent;
    document.body.dataset.accent = section.accent;
    document.title = `${section.title} · Formula Library · Intermediate Economics A`;
    // top tabs
    topTabs.querySelectorAll('[data-nav]').forEach((a) => {
      if (a.dataset.nav === `section:${section.id}`) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.querySelectorAll('.sidebar [data-nav]').forEach((a) => {
      if (a.dataset.nav === `section:${section.id}`) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    moveInk(topTabs, topTabs.querySelector('[aria-current="page"]'));
    // keep the address in step without triggering navigation
    const want = `#/formulas/${section.id}`;
    if (performance.now() > suppressHashUntil && !location.hash.startsWith(want + '/') && location.hash !== want) history.replaceState(null, '', want);
    curChip = null;
  };

  const spy = () => {
    const line = 112 + window.innerHeight * 0.22;
    let sec = sections[0];
    for (const s of sections) if (s.getBoundingClientRect().top <= line) sec = s;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) sec = sections[sections.length - 1];
    setSection(sec);

    const group = strip.querySelector(`[data-group="${sec.dataset.section}"]`);
    const chips = [...group.querySelectorAll('a[data-target]')].filter((c) => !c.hidden);
    let chip = chips[0];
    for (const c of chips) {
      const el = root.querySelector(`#${CSS.escape(c.dataset.target)}`);
      if (el && el.getBoundingClientRect().top <= line) chip = c;
    }
    if (atBottom) chip = chips[chips.length - 1];
    if (chip !== curChip) {
      curChip = chip;
      group.querySelectorAll('a[data-target]').forEach((c) => c.setAttribute('aria-current', String(c === chip)));
      moveInk(strip, chip);
    }
  };

  // Links to a section or card on this page scroll smoothly instead of re-routing
  const onLinkClick = (e) => {
    const a = e.target.closest('a[href^="#/formulas/"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const m = a.getAttribute('href').match(/^#\/formulas\/([^/]+)(?:\/([^/]+))?$/);
    if (!m || !sectionById.has(m[1])) return;
    const id = m[2] || m[1];
    if (!root.querySelector(`#${CSS.escape(id)}`)) return;
    e.preventDefault();
    document.getElementById('sidebar')?.setAttribute('data-open', 'false');
    document.querySelector('.backdrop')?.setAttribute('data-open', 'false');
    if (location.hash !== a.getAttribute('href')) history.pushState(null, '', a.getAttribute('href'));
    focusAnchor(root, id);
  };
  document.addEventListener('click', onLinkClick);
  ctx.onLeave(() => document.removeEventListener('click', onLinkClick));

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; spy(); });
  };
  const onResize = () => {
    if (curChip) moveInk(strip, curChip, { scroll: false });
    moveInk(topTabs, topTabs.querySelector('[aria-current="page"]'), { scroll: false });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  ctx.onLeave(() => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); });
  root.__spy = () => { curChip = null; spy(); };

  if (params.anchor) focusAnchor(root, params.anchor, { smooth: false });
  else if (params.section && params.section !== SECTIONS[0]) focusAnchor(root, params.section.id, { smooth: false });
  requestAnimationFrame(spy);
  document.fonts?.ready.then(() => root.__spy?.());
}

export default {
  key: (p) => (p.section ? 'library:flow' : 'library:index'),

  match(seg) {
    if (seg[0] !== 'formulas') return null;
    if (seg.length === 1) return {};
    const section = sectionById.get(seg[1]);
    if (!section || seg.length > 3) return null;
    return { section, anchor: seg[2] };
  },

  render(p) {
    if (!p.section) {
      return { title: 'All formulas', crumbs: [{ label: 'Formula Library' }], nav: 'library', html: renderIndex() };
    }
    return {
      title: p.section.title,
      crumbs: [{ label: 'Formula Library', href: '#/formulas' }, { label: p.section.title }],
      nav: `section:${p.section.id}`,
      accent: p.section.accent,
      html: renderFlow(),
    };
  },

  mount(root, p, ctx) {
    if (p.section) mountFlow(root, p, ctx);
  },

  /** Already on the continuous page: just scroll to the section or card. */
  update(root, p) {
    if (!p.section) return;
    focusAnchor(root, p.anchor || p.section.id);
  },
};
