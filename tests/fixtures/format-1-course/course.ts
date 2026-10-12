import { R, file, folder } from '@/content/helpers';
import type { Course } from '@/content/types';
import { identities } from './identities';

import { basics } from './lecture-1/part-a/01-basics';
import { more } from './lecture-1/part-b/02-more';

// A course in notes format 1 (Principia 0.1), used by `npm test`: course.ts lists the tree with folder titles.
export const courseFixture: Course = {
  id: 'fixture',
  title: 'Fixture Course',
  decks: [{ id: 'A', label: 'Week 1 · Deck A', pages: 20 }],
  identities,
  indexWhy: R`Rules such as $\nabla(\alpha f)=\alpha\nabla f$ are used in many steps.`,
  tree: [
    folder('l1', 'Lecture 1 · Basics', [
      folder('l1-a', 'Part A', [file(basics)]),
      folder('l1-b', 'Part B', [file(more)]),
    ]),
  ],
};
