/**
 * Formula Library registry.
 * To add a section: create a new file in this folder and add it to the list below.
 * Order here is the order shown in the sidebar.
 */
import consumer from './01-consumer.js';
import production from './02-production.js';
import costs from './03-costs.js';
import competition from './04-competition.js';
import monopoly from './05-monopoly.js';
import oligopoly from './06-oligopoly.js';
import gameTheory from './07-game-theory.js';
import welfare from './08-welfare.js';
import general from './09-general.js';

export const SECTIONS = [consumer, production, costs, competition, monopoly, oligopoly, gameTheory, welfare, general];

export const sectionById = new Map(SECTIONS.map((s) => [s.id, s]));

/** cardId -> { card, section, index } */
export const cardIndex = new Map();
SECTIONS.forEach((section) => {
  section.cards.forEach((card, index) => {
    cardIndex.set(card.id, { card, section, index });
  });
});

/** Display code like "6.03" */
export function cardCode(section, index) {
  return `${section.number}.${String(index + 1).padStart(2, '0')}`;
}

export const LIBRARY_STATS = {
  sections: SECTIONS.length,
  cards: SECTIONS.reduce((n, s) => n + s.cards.length, 0),
  examples: SECTIONS.reduce((n, s) => n + s.cards.filter((c) => c.example).length, 0),
  tables: SECTIONS.reduce((n, s) => n + (s.tables?.length ?? 0), 0),
};
