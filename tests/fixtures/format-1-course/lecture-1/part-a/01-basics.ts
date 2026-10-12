import { R, lab, shape, slide, tag } from '@/content/helpers';
import type { Topic } from '@/content/types';

export const basics: Topic = {
  id: 'basics',
  title: 'Basics',
  short: 'Basics',
  summary: R`The squared norm of $\mathbf v$.`,
  sections: [
    {
      id: 'norm',
      circ: 1,
      title: 'Squared norm',
      why: R`Least squares measures the size of a residual vector, so we need its squared length.`,
      slides: [slide('A', 3, 'Norms')],
      rows: [
        {
          eq: R`\lVert\mathbf v\rVert_2^2=\mathbf v^\top\mathbf v`,
          notes: [tag(['I1'], 'a vector dotted with itself'), lab('a scalar'), shape(R`1\times1`)],
        },
      ],
    },
  ],
};
