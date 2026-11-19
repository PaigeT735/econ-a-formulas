# Econ A Formula Library

A revision website for **ECU22011 Intermediate Economics A (Micro)**. This first version contains the **Formula Library**: 66 formula cards across 9 sections, each with alternative forms, variable definitions, when-to-use notes, exam clues, assumptions, common traps and a worked example, plus 12 comparison tables, an exam decoder and full-text search.

Sections: Consumer Theory · Production Theory · Cost Functions · Perfect Competition · Monopoly · Oligopoly & Cournot · Game Theory · Surplus & Welfare Analysis · General Economic Relationships.

---

## Tech stack

- **Plain HTML, CSS and JavaScript (ES modules).** No framework and no build step: the files in this repo are the website.
- **KaTeX 0.19.1** for maths, vendored in `assets/vendor/katex/` (no CDN needed).
- **Fonts** (Figtree, Newsreader) are self-hosted in `assets/fonts/`.
- **Hash routing** (`#/formulas/monopoly`), so every page and deep link works on GitHub Pages without server configuration.

The only npm dependency is KaTeX, used by the optional `npm run check` content validator. The website itself needs nothing installed.

---

## Run it locally

ES modules don't load from `file://`, so serve the folder over HTTP. Either:

```bash
# Python (already on most computers)
python3 -m http.server 5173
# then open http://localhost:5173
```

or

```bash
npm run dev        # uses npx serve on port 5173
```

### Check the content

```bash
npm install        # once
npm run check
```

This renders every formula with KaTeX in strict mode and fails on any LaTeX error, duplicate id, unbalanced `$`, mis-sized table row or broken "Related" link.

---

## Deploy to GitHub Pages

### Option A: deploy from a branch (simplest)

1. Create a new repository on GitHub (e.g. `econ-a-formulas`).
2. Upload or push every file in this folder to the `main` branch. Keep the folder structure and the `.nojekyll` file.
   ```bash
   git init
   git add .
   git commit -m "Formula Library v1"
   git branch -M main
   git remote add origin https://github.com/<your-username>/econ-a-formulas.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
4. After a minute the site is live at `https://<your-username>.github.io/econ-a-formulas/`.

All asset paths are relative, so no base-path configuration is needed, whatever you name the repository.

### Option B: GitHub Actions

`.github/workflows/pages.yml` runs the content check and then deploys. To use it, set **Settings → Pages → Source: GitHub Actions** and push to `main`.

---

## Project structure

```
index.html                    App shell (sidebar, top bar, main area)
404.html                      Sends unknown paths back to the app
.nojekyll                     Stops GitHub Pages running Jekyll
assets/
  css/tokens.css              Colours, type, spacing, section accent colours
  css/base.css                Reset, page atmosphere, typography, maths
  css/layout.css              Sidebar, top bar, responsive drawer
  css/components.css          Cards, search, tables, buttons
  css/views.css               Home, library index, section pages
  fonts/  vendor/katex/  favicon.svg
src/
  main.js                     Shell + hash router
  config/site.js              Site name and sidebar navigation registry
  config/routes.js            Route registry (add new areas here)
  content/formulas/*.js       ALL formula content, one file per section
  content/formulas/SCHEMA.md  Content format reference
  content/decoder.js          Home-page exam decoder
  components/                 Card, table, sidebar, search box
  views/                      Home, library (index + section), not found
  lib/                        Rich-text/KaTeX renderer, search, icons
scripts/check-content.mjs     Content validator
```

Content is separate from the UI: the views never contain economics.

---

## Editing and adding content

- **Edit a formula:** open the section file in `src/content/formulas/` and change the card. Strings use the `t` tag, so LaTeX is written naturally: ``t`\frac{a}{b}` ``. In text, `$...$` is inline maths, `$$...$$` is display maths, `**...**` is bold.
- **Add a card:** add an object to that section's `cards` array. Its `id` becomes the URL (`#/formulas/monopoly/<id>`). See `SCHEMA.md` for every field.
- **Add a section:** create a new file in `src/content/formulas/`, import it in `index.js`, and (if it needs a new colour) add a `--accent-*` value and `[data-accent]` rule in `assets/css/tokens.css`.
- Run `npm run check` afterwards.

## Adding new areas later (past papers, practice questions, quizzes)

1. Put the content in a new folder, e.g. `src/content/papers/`.
2. Write a view in `src/views/` that exports `match`, `key`, `render` and optionally `mount` / `update` (see `src/config/routes.js` for the contract and `views/library.js` for an example).
3. Register the view in `src/config/routes.js`.
4. Add a group to `NAV_GROUPS` in `src/config/site.js` so it appears in the sidebar.
5. To make the new content searchable, extend `build()` in `src/lib/search.js`.

The card, table and rich-text components can be reused for worked solutions.

---

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `/` or `Ctrl/⌘ K` | Focus search |
| `↑` `↓` `Enter` | Move through and open search results |
| `Esc` | Close search or the mobile menu |

Every card has a **Link** button that copies a direct URL to it.

## Navigation and themes

- All nine sections sit on one continuous page (`#/formulas/<section>` jumps to a section on it). The top bar holds the section tabs; the underline slides to whichever section you are scrolling through.
- A second bar lists the cards of the section in view. Its underline follows you as you scroll, and clicking a name jumps to (and opens) that card.
- The moon/sun button switches between light (default) and dark mode. The choice is remembered in the browser.
- Colours for both themes live in `assets/css/tokens.css` (`:root` for light, `:root[data-theme='dark']` for dark).
