#!/usr/bin/env node
/**
 * Content check: renders every formula and rich-text string with KaTeX
 * (throwing on errors) and validates ids and cross-links.
 *
 *   npm install   (once, installs KaTeX for this script only)
 *   npm run check
 */
import katex from 'katex';
import { KATEX_MACROS } from '../src/lib/katex-options.js';

// rich.js expects window.katex in the browser
globalThis.window = { katex };
const { segments } = await import('../src/lib/rich.js');
const { SECTIONS } = await import('../src/content/formulas/index.js');

const errors = [];
let rendered = 0;

function render(src, display, where) {
  try {
    katex.renderToString(src, { displayMode: display, throwOnError: true, strict: 'error', macros: { ...KATEX_MACROS } });
    rendered += 1;
  } catch (err) {
    errors.push(`${where}: ${err.message}\n    source: ${src}`);
  }
}

function checkRich(str, where) {
  if (str == null) return;
  if (typeof str !== 'string') {
    errors.push(`${where}: expected a string, got ${typeof str}`);
    return;
  }
  const dollarCount = (str.match(/\$/g) || []).length;
  if (dollarCount % 2 !== 0) errors.push(`${where}: unbalanced $ delimiters`);
  for (const seg of segments(str)) {
    if (seg.type === 'inline') render(seg.value, false, where);
    if (seg.type === 'display') render(seg.value, true, where);
  }
}

const ids = new Set();
const sectionIds = new Set();
const allRelated = [];

for (const section of SECTIONS) {
  const s = section.id;
  if (sectionIds.has(s)) errors.push(`Duplicate section id ${s}`);
  sectionIds.add(s);
  for (const key of ['id', 'number', 'title', 'short', 'accent', 'summary']) {
    if (section[key] == null) errors.push(`Section ${s}: missing ${key}`);
  }
  checkRich(section.summary, `${s}.summary`);
  section.method?.steps.forEach((step, i) => checkRich(step, `${s}.method[${i}]`));

  for (const card of section.cards) {
    const w = `${s}/${card.id}`;
    if (ids.has(card.id)) errors.push(`Duplicate card id ${card.id}`);
    ids.add(card.id);
    for (const key of ['id', 'title', 'summary', 'formula']) {
      if (!card[key]) errors.push(`${w}: missing ${key}`);
    }
    render(card.formula, true, `${w}.formula`);
    checkRich(card.summary, `${w}.summary`);
    (card.forms ?? []).forEach((f, i) => {
      checkRich(f.label, `${w}.forms[${i}].label`);
      render(f.tex, true, `${w}.forms[${i}].tex`);
    });
    (card.variables ?? []).forEach(([sym, meaning], i) => {
      render(sym, false, `${w}.variables[${i}]`);
      checkRich(meaning, `${w}.variables[${i}].meaning`);
    });
    [].concat(card.when ?? []).forEach((p, i) => checkRich(p, `${w}.when[${i}]`));
    for (const key of ['clues', 'assumptions', 'traps']) {
      (card[key] ?? []).forEach((p, i) => checkRich(p, `${w}.${key}[${i}]`));
    }
    if (card.example) {
      checkRich(card.example.given, `${w}.example.given`);
      card.example.steps.forEach((p, i) => checkRich(p, `${w}.example.steps[${i}]`));
      checkRich(card.example.answer, `${w}.example.answer`);
    }
    (card.related ?? []).forEach((r) => allRelated.push([w, r]));
  }

  for (const table of section.tables ?? []) {
    const w = `${s}/table:${table.id}`;
    if (ids.has(table.id)) errors.push(`Duplicate id ${table.id}`);
    ids.add(table.id);
    checkRich(table.caption, `${w}.caption`);
    table.columns.forEach((c, i) => checkRich(c, `${w}.columns[${i}]`));
    table.rows.forEach((row, r) => {
      if (row.length !== table.columns.length) errors.push(`${w}: row ${r} has ${row.length} cells, expected ${table.columns.length}`);
      row.forEach((cell, c) => checkRich(cell, `${w}.rows[${r}][${c}]`));
    });
  }
}

for (const [from, to] of allRelated) {
  if (!ids.has(to)) errors.push(`${from}: related link to unknown id "${to}"`);
}

const cards = SECTIONS.reduce((n, s) => n + s.cards.length, 0);
if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n`);
  errors.forEach((e) => console.error('  • ' + e));
  process.exit(1);
}
console.log(`✓ ${SECTIONS.length} sections, ${cards} cards, ${rendered} formulas rendered without errors. All links resolve.`);
