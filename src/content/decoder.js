import { t } from '../lib/tag.js';

/**
 * "Exam decoder" shown on the home page: question wording → the cards to open.
 * Card ids refer to entries in src/content/formulas/.
 */
export const DECODER = [
  { cue: t`$\min\{\ldots\}$ in the utility function`, cards: ['perfect-complements', 'budget-constraint'] },
  { cue: t`Find the optimal consumption bundle, utility like $x_1^{1/2}x_2^{1/2}$`, cards: ['tangency-condition', 'cobb-douglas-utility'] },
  { cue: 'Derive the conditional input demand functions x₁(q) and x₂(q)', cards: ['cost-min-condition', 'conditional-demands'] },
  { cue: 'Derive the total cost function and marginal cost function', cards: ['total-cost-function', 'marginal-cost'] },
  { cue: 'Find the monopoly output, price and profit', cards: ['mr-equals-mc', 'monopoly-price', 'monopoly-profit'] },
  { cue: 'Find the competitive output … and the deadweight loss', cards: ['competitive-market-outcome', 'deadweight-loss'] },
  { cue: 'Calculate the producer surplus under monopoly', cards: ['producer-surplus'] },
  { cue: 'The firms choose quantities simultaneously', cards: ['cournot-profit', 'best-response-cournot', 'cournot-symmetric', 'cournot-asymmetric'] },
  { cue: 'Explain Nash equilibrium … why it need not be the best joint outcome', cards: ['nash-equilibrium', 'pareto-efficiency', 'prisoners-dilemma'] },
];
