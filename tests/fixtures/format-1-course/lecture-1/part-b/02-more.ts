import { R, shape, slide, tag } from '@/content/helpers';
import type { Identity, Section, Topic } from '@/content/types';

const identities: Identity[] = [
  { id: 'I2', area: 'Vector calculus', tex: R`\nabla_{\mathbf w}(\mathbf a^\top\mathbf w)=\mathbf a`, note: R`$\mathbf a$ and $\mathbf w$ are $D\times1$.` },
];

const sections: Section[] = [
  {
    id: 'grad',
    title: 'A gradient',
    why: R`Setting a gradient to zero finds the best weights, so we need the gradient of a linear term.`,
    slides: [slide('A', 7, 'Gradients')],
    rows: [
      {
        eq: R`\nabla_{\mathbf w}(\mathbf a^\top\mathbf w)=\mathbf a`,
        notes: [tag(['I2', 'C1'], 'the gradient of a linear term'), shape(R`D\times1`)],
      },
    ],
  },
];

export const more: Topic = { id: 'more', title: 'More', short: 'More', summary: 'One gradient.', identities, sections };
