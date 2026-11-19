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

  const toc = `
    <nav class="toc" aria-label="On this page">
      <div class="toc__group">
        <div class="toc__label eyebrow">On this page</div>
        ${section.cards.map((c, idx) => `<a href="#/formulas/${section.id}/${c.id}" data-toc="${c.id}"><span class="toc__code">${cardCode(section, idx)}</span><span>${escapeHtml(c.title)}</span></a>`).join('')}
      </div>
      ${section.tables?.length ? `<div class="toc__group"><div class="toc__label eyebrow">Compare</div>${section.tables.map((tb) => `<a href="#/formulas/${section.id}/${tb.id}" data-toc="${tb.id}"><span class="toc__code">Tbl</span><span>${escapeHtml(tb.title)}</span></a>`).join('')}</div>` : ''}
    </nav>`;

  return `
  <div class="page" data-accent="${section.accent}">
    <div class="with-toc">
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
      ${toc}
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
    root.querySelector(`[data-toc="${card.id}"]`)?.classList.toggle('is-hidden', !visible);
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

  // Highlight the card currently in view in the table of contents
  const tocLinks = new Map([...root.querySelectorAll('[data-toc]')].map((a) => [a.dataset.toc, a]));
  if (tocLinks.size && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tocLinks.forEach((a) => a.classList.remove('is-active'));
            tocLinks.get(entry.target.id)?.classList.add('is-active');
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    root.querySelectorAll('.fcard, .ctable').forEach((el) => observer.observe(el));
    ctx.onLeave(() => observer.disconnect());
  }

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
