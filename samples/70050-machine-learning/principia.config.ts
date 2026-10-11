import { R, defineNotebook } from 'principia';
import { identities } from './identities';

export default defineNotebook({
  title: '70050 Machine Learning',
  // Slide badges read "<deck> · <page>". The combined deck "3 Week_1_regression" is decks I and II merged.
  decks: [
    { id: 'I', label: 'Week 1 · Regression I (1 Week_1_regression_ I.pdf)', pages: 60 },
    { id: 'II', label: 'Week 1 · Regression II (2 Week_1_regression_II.pdf)', pages: 53 },
  ],
  identities,
  indexWhy: R`Each derivation leans on a few linear-algebra, vector-calculus and probability rules. Keeping them in one place, with their shapes, lets you look one up from any step instead of re-deriving it.`,
  folders: {
    'lecture-1': 'Lecture 1 · Introduction & regression',
    'lecture-1/regression-1': 'Regression I',
    'lecture-1/regression-2': 'Regression II',
    widgets: 'Widgets',
  },
  defaultFile: 'lecture-1/regression-1/01-course-overview.ts',
});
