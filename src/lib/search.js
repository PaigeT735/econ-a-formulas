/**
 * Client-side search over the formula library.
 * Indexes card titles, tags, summaries, formulas, clues and body text,
 * plus comparison tables. Every query word must match somewhere.
 */
import { SECTIONS, cardCode } from '../content/formulas/index.js';

/** Turn LaTeX / rich text into lowercase searchable words. */
export function normalise(str) {
  return String(str ?? '')
    .replace(/\\(frac|dfrac|tfrac|left|right|qquad|quad|text|textit|mathcal|mathbb|cdot|big|Big|begin|end|array|cases|hline|le|ge|Rightarrow|Leftrightarrow|Longleftrightarrow|underline|br|max|ln|partial|forall|in|ne|nexists|ldots|approx|times|sqrt|int|propto|gtreqless|to|infty)\b/g, ' ')
    .replace(/\\([a-zA-Z]+)/g, ' $1 ')
    .replace(/[_^{}$\\*]/g, ' ')
    .replace(/[^\p{L}\p{N}\s.-]/gu, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const flat = (v) => (Array.isArray(v) ? v.join(' ') : v ?? '');

let INDEX = null;

function build() {
  const entries = [];
  for (const section of SECTIONS) {
    section.cards.forEach((card, i) => {
      const body = [
        flat(card.when),
        flat(card.assumptions),
        flat(card.traps),
        (card.forms ?? []).map((f) => `${f.label} ${f.tex}`).join(' '),
        (card.variables ?? []).map((v) => v.join(' ')).join(' '),
        card.example ? `${card.example.given} ${flat(card.example.steps)} ${card.example.answer}` : '',
      ].join(' ');
      entries.push({
        type: 'card',
        id: card.id,
        section,
        code: cardCode(section, i),
        title: card.title,
        summary: card.summary,
        href: `#/formulas/${section.id}/${card.id}`,
        f: {
          title: normalise(card.title),
          tags: normalise((card.tags ?? []).join(' | ') + ' ' + (card.paper ?? []).join(' ')),
          summary: normalise(card.summary),
          formula: normalise(card.formula),
          clues: normalise(flat(card.clues)),
          body: normalise(body),
        },
      });
    });
    (section.tables ?? []).forEach((table) => {
      entries.push({
        type: 'table',
        id: table.id,
        section,
        code: 'Table',
        title: table.title,
        summary: table.caption ?? 'Comparison table',
        href: `#/formulas/${section.id}/${table.id}`,
        f: {
          title: normalise(table.title),
          tags: normalise('table compare comparison ' + table.columns.join(' ')),
          summary: normalise(table.caption),
          formula: '',
          clues: '',
          body: normalise(table.rows.flat().join(' ')),
        },
      });
    });
  }
  return entries;
}

const WEIGHTS = { title: 12, tags: 7, summary: 4, formula: 3, clues: 3, body: 1 };

function matchField(field, token) {
  if (!field) return false;
  if (token.length <= 3) return new RegExp(`(^|\\s|-)${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(field);
  return field.includes(token);
}

export function search(query, limit = 12) {
  if (!INDEX) INDEX = build();
  const tokens = normalise(query).split(' ').filter((tok) => tok && tok !== '-' && tok !== '.');
  if (!tokens.length) return [];

  const results = [];
  for (const entry of INDEX) {
    let score = 0;
    let all = true;
    for (const tok of tokens) {
      let tokScore = 0;
      for (const [field, w] of Object.entries(WEIGHTS)) {
        if (matchField(entry.f[field], tok)) tokScore += w;
      }
      if (!tokScore) { all = false; break; }
      score += tokScore;
    }
    if (!all) continue;
    const q = tokens.join(' ');
    if (entry.f.title.startsWith(q)) score += 10;
    if (entry.f.title === q) score += 10;
    if (entry.type === 'table') score -= 2;
    results.push({ entry, score });
  }
  results.sort((a, b) => b.score - a.score || a.entry.section.number - b.entry.section.number);
  return results.slice(0, limit).map((r) => r.entry);
}
