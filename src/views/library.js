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

/* ---------- Section page ---------- */
function renderSection(section) {
  const i = SECTIONS.indexOf(section);
  const prev = SECTIONS[i - 1];
  const next = SECTIONS[i + 1];
  const hasPaper = section.cards.some((c) => c.paper?.length);
  const hasExt = section.cards.some((c) => c.level === 'extension');

  const method = section.method
    ? `<aside class="method panel" aria-label="Method">
        <div class="eyebrow">Exam method</div>
        <h2 class="method__title">${escapeHtml(section.method.title)}</h2>
        <ol class="method__steps">${section.method.steps.map((s) => `<li><span>${rich(s)}</span></li>`).join('')}</ol>
      </aside>`
    : '';

  const filters = hasPaper || hasExt
    ? `<div class="segmented" role="group" aria-label="Filter cards">
        <button type="button" data-filter="all" aria-pressed="true">All</button>
        ${hasPaper ? '<button type="button" data-filter="paper" aria-pressed="false">On the paper</button>' : ''}
        ${hasExt ? '<button type="button" data-filter="extension" aria-pressed="false">Beyond the paper</button>' : ''}
      </div>`
    : '';

  const subnav = `
    <nav class="subnav" aria-label="Formulas in this section">
      <div class="subnav__inner">
        <span class="subnav__label">${String(section.number).padStart(2, '0')} · ${escapeHtml(section.short)}</span>
        <div class="tabs" data-subnav>
          <div class="tabs__track">
            ${section.cards.map((c, idx) => `<a class="tab" href="#/formulas/${section.id}/${c.id}" data-target="${c.id}" title="${escapeHtml(c.title)}"><span class="tab__code">${cardCode(section, idx)}</span>${escapeHtml(navLabel(c))}</a>`).join('')}
            ${(section.tables ?? []).map((tb) => `<a class="tab" href="#/formulas/${section.id}/${tb.id}" data-target="${tb.id}" title="${escapeHtml(tb.title)}"><span class="tab__code">Table</span>${escapeHtml(tb.title)}</a>`).join('')}
            <span class="ink" aria-hidden="true"></span>
          </div>
        </div>
      </div>
    </nav>`;

  return `
  ${subnav}
  <div class="page" data-accent="${section.accent}">
    <div class="section-wrap">
      <div>
        <header class="section-hero">
          <div class="section-hero__eyebrow"><span class="eyebrow">Section ${String(section.number).padStart(2, '0')}</span><span class="eyebrow">${section.cards.length} formulas</span></div>
          <h1 class="section-hero__title">${escapeHtml(section.title)}</h1>
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

        ${section.tables?.length ? `<div class="subhead"><span class="eyebrow">Compare</span><h2>Comparison tables</h2></div><div class="tables">${section.tables.map(renderTable).join('')}</div>` : ''}

        <nav class="pager" aria-label="Sections">
          ${prev ? `<a class="prev" href="#/formulas/${prev.id}"><span class="eyebrow">← Previous</span><span class="pager__title">${escapeHtml(prev.title)}</span></a>` : ''}
          ${next ? `<a class="next" href="#/formulas/${next.id}"><span class="eyebrow">Next →</span><span class="pager__title">${escapeHtml(next.title)}</span></a>` : ''}
        </nav>
      </div>
    </div>
  </div>`;
}

function focusAnchor(root, anchorId, { smooth = true } = {}) {
  if (!anchorId) return;
  const el = root.querySelector(`#${CSS.escape(anchorId)}`);
  if (!el) return;
  if (el.classList.contains('fcard')) {
    if (el.hidden) applyFilter(root, 'all');
    setCardOpen(el, true);
  }
  requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    // On first load, fonts and maths can still shift the layout: settle once more.
    if (!smooth) {
      const settle = () => { if (Math.abs(el.getBoundingClientRect().top - 130) > 8) el.scrollIntoView({ block: 'start' }); };
      document.fonts?.ready.then(() => setTimeout(settle, 60));
      setTimeout(settle, 400);
    }
    el.classList.remove('is-flash');
    void el.offsetWidth; // restart animation
    el.classList.add('is-flash');
  });
}

function applyFilter(root, filter) {
  let shown = 0;
  root.querySelectorAll('.fcard').forEach((card) => {
    const visible = filter === 'all' || (filter === 'paper' && card.dataset.paper === 'true') || (filter === 'extension' && card.dataset.level === 'extension');
    card.hidden = !visible;
    const chip = root.querySelector(`[data-target="${card.id}"]`);
    if (chip) chip.hidden = !visible;
    if (visible) shown += 1;
  });
  root.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
  const total = root.querySelectorAll('.fcard').length;
  const count = root.querySelector('[data-count]');
  if (count) count.textContent = shown === total ? `${total} cards` : `${shown} of ${total} cards`;
  const empty = root.querySelector('[data-empty]');
  if (empty) empty.hidden = shown > 0;
}

function mountSection(root, params, ctx) {
  applyFilter(root, 'all');

  root.addEventListener('click', (e) => {
    const toggle = e.target.closest('.fcard__toggle');
    if (toggle) {
      const card = toggle.closest('.fcard');
      setCardOpen(card, card.dataset.open !== 'true');
      return;
    }
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'expand-all' || action === 'collapse-all') {
      root.querySelectorAll('.fcard:not([hidden])').forEach((c) => setCardOpen(c, action === 'expand-all'));
      return;
    }
    const filterBtn = e.target.closest('[data-filter]');
    if (filterBtn) {
      applyFilter(root, filterBtn.dataset.filter);
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

  // Scroll-spy: slide the underline in the sub-nav to the card currently being read
  const strip = root.querySelector('[data-subnav]');
  const chips = [...strip.querySelectorAll('a[data-target]')];
  const targets = chips.map((a) => root.querySelector(`#${CSS.escape(a.dataset.target)}`));
  let current = -1;
  const spy = () => {
    const line = 112 + window.innerHeight * 0.22;
    let idx = 0;
    targets.forEach((el, i) => {
      if (el && !el.hidden && !chips[i].hidden && el.getBoundingClientRect().top <= line) idx = i;
    });
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) {
      const lastVisible = chips.map((c, i) => (c.hidden ? -1 : i)).filter((i) => i >= 0).pop();
      if (lastVisible != null) idx = lastVisible;
    }
    if (chips[idx]?.hidden) idx = chips.findIndex((c) => !c.hidden);
    if (idx !== current) {
      current = idx;
      chips.forEach((c, i) => c.setAttribute('aria-current', String(i === idx)));
      moveInk(strip, chips[idx]);
    }
  };
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; spy(); });
  };
  const onResize = () => { if (current >= 0) moveInk(strip, chips[current], { scroll: false }); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  ctx.onLeave(() => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); });
  root.__spy = () => { current = -1; spy(); };
  requestAnimationFrame(spy);
  document.fonts?.ready.then(() => root.__spy?.());

  focusAnchor(root, params.anchor, { smooth: false });
}

export default {
  key: (p) => `library:${p.section ? p.section.id : 'index'}`,

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
      html: renderSection(p.section),
    };
  },

  mount(root, p, ctx) {
    if (p.section) mountSection(root, p, ctx);
  },

  /** Same section, different anchor: scroll without re-rendering. */
  update(root, p) {
    if (p.anchor) focusAnchor(root, p.anchor);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  },
};
