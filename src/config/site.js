/**
 * Site-wide configuration and the navigation registry.
 *
 * To add a new area later (e.g. past papers, practice questions):
 *   1. Create a view in src/views/ exporting { match, render, mount? }.
 *   2. Register it in src/config/routes.js.
 *   3. Add a group to NAV_GROUPS below so it appears in the sidebar.
 */
import { SECTIONS } from '../content/formulas/index.js';

export const SITE = {
  name: 'Econ A',
  title: 'Formula Library',
  course: 'ECU22011 · Intermediate Economics A (Micro)',
  docTitle: 'Intermediate Economics A',
};

/**
 * Sidebar groups. `items` may be a static list or a function that builds one.
 * Each item: { id, label, href, accent?, num?, count? }
 */
export const NAV_GROUPS = [
  {
    id: 'start',
    label: 'Start',
    items: [
      { id: 'home', label: 'Overview', href: '#/' },
      { id: 'library', label: 'All formulas', href: '#/formulas' },
    ],
  },
  {
    id: 'formulas',
    label: 'Formula Library',
    items: () =>
      SECTIONS.map((s) => ({
        id: `section:${s.id}`,
        label: s.title,
        href: `#/formulas/${s.id}`,
        accent: s.accent,
        num: String(s.number).padStart(2, '0'),
        count: s.cards.length,
      })),
  },
];
