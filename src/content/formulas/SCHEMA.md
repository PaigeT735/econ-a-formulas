# Formula content schema

Each file in this folder exports one **section** object. The UI never hard-codes
economics content, so adding or editing formulas only means editing these files.

```js
export default {
  id: 'consumer',              // URL slug: #/formulas/consumer
  number: 1,                   // display order and card numbering (1.01, 1.02 ...)
  title: 'Consumer Theory',
  short: 'Consumer',           // short label for chips and search results
  accent: 'consumer',          // matches a --accent-* colour in assets/css/tokens.css
  summary: t`...`,             // rich text
  method: { title, steps: [t`...`] },   // optional exam routine shown at the top
  cards: [ /* formula cards, see below */ ],
  tables: [ /* comparison tables, see below */ ],
};
```

## Card

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Unique across the whole library. Used in URLs: `#/formulas/consumer/mrs` |
| `title` | yes | Plain text |
| `summary` | yes | One or two lines, rich text |
| `formula` | yes | LaTeX for the headline formula (display mode) |
| `level` | no | `'core'` (default) or `'extension'` (beyond the practice paper) |
| `paper` | no | Practice-paper questions that use it, e.g. `['Q4', 'Q8']` |
| `tags` | no | Extra search keywords and synonyms |
| `forms` | no | `[{ label, tex }]` alternative forms and rearrangements |
| `variables` | no | `[[symbolTex, meaning]]` |
| `when` | no | Rich text, or an array of paragraphs: when and why to use it |
| `clues` | no | Exam-question wording that signals this formula |
| `assumptions` | no | Assumptions and limitations |
| `traps` | no | Common mistakes |
| `example` | no | `{ given, steps: [], answer }` (all rich text) |
| `related` | no | Card ids to link to |

## Table

```js
{ id: 'utility-types', title: 'Utility functions compared', caption: t`...`,
  columns: ['Type', 'Utility', ...], rows: [[t`...`, t`...`], ...] }
```

## Rich text

`$...$` inline maths, `$$...$$` display maths, `**bold**`. Write strings with the
`t` tag (String.raw) so LaTeX backslashes need no escaping. Avoid the character
sequence `$` immediately followed by `{` inside a template literal.

Run `npm run check` after editing — it renders every formula with KaTeX and fails
on any LaTeX error, duplicate id or broken `related` link.
