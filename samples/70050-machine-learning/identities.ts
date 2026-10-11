import type { Identity } from 'principia';

const R = String.raw;


// Course-wide identity index. Ids are unique within the course. Where each one is used is worked out
// from the tags in the topic files, so there is no "used" list to maintain here.
export const identities: Identity[] = [
  {
    id: 'I1',
    area: 'Linear algebra',
    tex: R`\lVert\mathbf v\rVert_2^2=\mathbf v^\top\mathbf v`,
    note: R`Vectors only. $\mathbf v$ is $n\times1$ and the result is $1\times1$. For a matrix $X$, $X^\top X$ is the Gram matrix, $(D+1)\times(D+1)$, not a norm.`,
  },
  {
    id: 'I2',
    area: 'Linear algebra',
    tex: R`(A-B)^\top=A^\top-B^\top,\quad (AB)^\top=B^\top A^\top,\quad (A^\top)^\top=A`,
    note: R`The order reverses. So $(X\mathbf w)^\top=\mathbf w^\top X^\top$, and $(X^\top X)^\top=X^\top X$, which makes $X^\top X$ symmetric.`,
  },
  {
    id: 'I3',
    area: 'Linear algebra',
    tex: R`s\in\mathbb R\ (1\times1)\ \Rightarrow\ s^\top=s`,
    note: R`Used as $\mathbf w^\top X^\top\mathbf y=(\mathbf w^\top X^\top\mathbf y)^\top=\mathbf y^\top X\mathbf w$.`,
  },
  {
    id: 'I4',
    area: 'Vector calculus',
    tex: R`\nabla_{\mathbf w}(\mathbf a^\top\mathbf w)=\mathbf a`,
    note: R`$\mathbf a$ and $\mathbf w$ are both $(D+1)\times1$.`,
  },
  {
    id: 'I5',
    area: 'Vector calculus',
    tex: R`\nabla_{\mathbf w}(\mathbf w^\top A\mathbf w)=(A+A^\top)\mathbf w\ \ \big(=2A\mathbf w\ \text{if}\ A=A^\top\big)`,
    note: R`$A$ is $(D+1)\times(D+1)$.`,
  },
  {
    id: 'I6',
    area: 'Linear algebra',
    tex: R`X^\top X\ \text{invertible}\iff\operatorname{rank}(X)=D+1`,
    note: R`Full column rank: the columns of $X$ are independent. This needs $N\ge D+1$.`,
  },
  {
    id: 'I7',
    area: 'Linear algebra',
    tex: R`\mathbf v^\top X^\top X\mathbf v=\lVert X\mathbf v\rVert_2^2\ge 0`,
    note: R`$X^\top X$ is positive semi-definite, so $L$ is convex and a flat point is a global minimum. With full column rank it is positive definite, so the minimum is unique.`,
  },
  {
    id: 'I8',
    area: 'Vector calculus',
    tex: R`\nabla(\alpha f+\beta g)=\alpha\nabla f+\beta\nabla g`,
    note: 'The gradient is linear, so it can be applied term by term.',
  },
  {
    id: 'C1',
    area: 'Conventions',
    tex: R`f:\mathbb R^{D+1}\to\mathbb R\ \Rightarrow\ \nabla_{\mathbf w}f\ \text{has shape}\ (D+1)\times 1`,
    note: 'Convention: the gradient of a scalar has the same shape as the variable it is taken with respect to.',
  },
];
