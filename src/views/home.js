/** Home / overview. */
import { SECTIONS, LIBRARY_STATS, cardIndex } from '../content/formulas/index.js';
import { DECODER } from '../content/decoder.js';
import { SITE } from '../config/site.js';
import { rich, escapeHtml } from '../lib/rich.js';
import { icons } from '../lib/icons.js';

const LEGEND = [
  ['legend__swatch--formula', 'Formula', 'The headline result, always visible. Scan these first.'],
  ['block--when', 'When to use it', 'What the formula is for and why it works, in plain words.'],
  ['block--forms', 'Other ways to write it', 'Rearrangements, special cases and shortcuts, with every symbol defined.'],
  ['block--clues', 'Spot it in a question', 'Wording in a question that tells you to reach for this formula.'],
  ['block--traps', 'Watch out for', 'The mistakes that lose marks most often.'],
  ['block--example', 'Worked example', 'Fresh illustrative numbers, so the practice-paper answers stay unspoiled.'],
];

export default {
  key: () => 'home',
  match: (seg) => (seg.length === 0 ? {} : null),

  render() {
    const index = SECTIONS.map(
      (s) => `
      <a class="index__row" href="#/formulas/${s.id}" data-accent="${s.accent}">
        <span class="index__num">${String(s.number).padStart(2, '0')}</span>
        <span>
          <span class="index__title">${escapeHtml(s.title)}</span>
          <span class="index__summary">${rich(s.summary)}</span>
        </span>
        <span class="index__count">${s.cards.length} formulas${s.tables?.length ? `<br>${s.tables.length} table${s.tables.length > 1 ? 's' : ''}` : ''}<span class="index__arrow">${icons.arrow}</span></span>
      </a>`
    ).join('');

    const decoder = DECODER.map((row) => {
      const links = row.cards
        .map((id) => cardIndex.get(id))
        .filter(Boolean)
        .map(({ card, section }) => `<a href="#/formulas/${section.id}/${card.id}" data-accent="${section.accent}"><i></i>${escapeHtml(card.title)}</a>`)
        .join('');
      return `<div class="decoder__row"><div class="decoder__cue">${rich(row.cue)}</div><div class="decoder__links related">${links}</div></div>`;
    }).join('');

    const legend = LEGEND.map(([cls, title, text]) => `<div class="legend__item"><div class="block ${cls.startsWith('block') ? cls : ''}"><div class="block__label ${cls.startsWith('legend') ? cls : ''}">${title}</div></div><p>${text}</p></div>`).join('');

    const html = `
    <div class="page"><div class="page__inner">
      <section class="hero">
        <div class="eyebrow">${escapeHtml(SITE.course)}</div>
        <h1 class="hero__title">Every formula, <em>and when to use it.</em></h1>
        <p class="hero__lede">A revision reference for the Econ A final, built around the practice paper but written to prepare you for variations: each formula comes with its rearrangements, variable definitions, the exam wording that signals it, the usual traps, and a worked example.</p>
        <div class="hero__actions">
          <button class="btn btn--primary" type="button" data-action="focus-search">${icons.search}Search the library <kbd>/</kbd></button>
          <a class="btn" href="#/formulas">Browse all formulas</a>
        </div>
        <div class="stats">
          <div class="stat"><div class="stat__num">${LIBRARY_STATS.cards}</div><div class="stat__label">Formula cards</div></div>
          <div class="stat"><div class="stat__num">${LIBRARY_STATS.sections}</div><div class="stat__label">Topic sections</div></div>
          <div class="stat"><div class="stat__num">${LIBRARY_STATS.examples}</div><div class="stat__label">Worked examples</div></div>
          <div class="stat"><div class="stat__num">${LIBRARY_STATS.tables}</div><div class="stat__label">Comparison tables</div></div>
        </div>
      </section>

      <section class="home-section" aria-labelledby="sections-title">
        <div class="home-section__head">
          <div><div class="eyebrow">Formula Library</div><h2 class="home-section__title" id="sections-title">Sections</h2></div>
          <p class="home-section__intro">Ordered the way the course builds: choice, production, costs, then market structures and welfare.</p>
        </div>
        <div class="index panel">${index}</div>
      </section>

      <section class="home-section" aria-labelledby="decoder-title">
        <div class="home-section__head">
          <div><div class="eyebrow">Exam decoder</div><h2 class="home-section__title" id="decoder-title">If the question says…</h2></div>
          <p class="home-section__intro">The wording of the practice paper, mapped to the cards you need. Use it to spot the method before you start writing.</p>
        </div>
        <div class="decoder">${decoder}</div>
      </section>

      <section class="home-section" aria-labelledby="legend-title">
        <div class="home-section__head">
          <div><div class="eyebrow">How to read a card</div><h2 class="home-section__title" id="legend-title">Card anatomy</h2></div>
          <p class="home-section__intro">Press “Show explanation” on any card to open the detail. Badges show which practice-paper questions use a formula, and which cards go beyond the paper.</p>
        </div>
        <div class="legend">${legend}</div>
      </section>
    </div></div>`;

    return { title: null, crumbs: [{ label: 'Overview' }], nav: 'home', html };
  },

  mount(root, _params, ctx) {
    root.querySelector('[data-action="focus-search"]')?.addEventListener('click', () => ctx.focusSearch());
  },
};
