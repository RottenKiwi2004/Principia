import type { Identity } from '@/content/types';

const R = String.raw;

export const identities: Identity[] = [
  { id: 'I1', area: 'Linear algebra', tex: R`\lVert\mathbf v\rVert_2^2=\mathbf v^\top\mathbf v`, note: R`Vectors only: $\mathbf v$ is $n\times1$.` },
  { id: 'C1', area: 'Conventions', tex: R`\nabla_{\mathbf w}f:\ (D+1)\times1`, note: 'The gradient has the shape of the variable.' },
];
