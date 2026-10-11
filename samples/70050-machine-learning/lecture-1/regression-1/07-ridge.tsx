import { R, con, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';
import RidgeShrinkage from '../../widgets/RidgeShrinkage';

const identities: Identity[] = [
  {
    id: 'I22',
    area: 'Linear algebra',
    tex: R`I\mathbf v=\mathbf v,\qquad I^\top=I,\qquad \lambda\mathbf v=\lambda I\mathbf v`,
    note: R`$I$ is square, with 1s on the diagonal and 0s elsewhere, and must match the size of what it multiplies or is added to: next to the $D\times D$ matrix $X^\top X$ it is $D\times D$. A scalar cannot be added to a matrix, so write $\lambda I$, not $\lambda$.`,
  },
  {
    id: 'I20',
    area: 'Vector calculus',
    tex: R`\nabla_{\mathbf w}\big(\lambda\lVert\mathbf w\rVert_2^2\big)=\nabla_{\mathbf w}\big(\lambda\,\mathbf w^\top I\mathbf w\big)=2\lambda\mathbf w`,
    note: R`I5 with $A=I$ (symmetric), times the constant $\lambda$. $\mathbf w$ and the result are $D\times1$.`,
  },
  {
    id: 'I23',
    area: 'Linear algebra',
    tex: R`\lambda>0\ \Rightarrow\ \mathbf v^\top(X^\top X+\lambda I)\mathbf v=\lVert X\mathbf v\rVert_2^2+\lambda\lVert\mathbf v\rVert_2^2>0\ \ \text{for all}\ \mathbf v\ne\mathbf 0`,
    note: R`So $X^\top X+\lambda I$ ($D\times D$) is positive definite, hence invertible, for any $X$: no full-column-rank condition, and it holds even when $D>N$.`,
  },
  {
    id: 'I24',
    area: 'Linear algebra',
    tex: R`(A+B)^{-1}\ne A^{-1}+B^{-1}\ \ \text{in general}`,
    note: R`The inverse of a sum does not split. $(X^\top X+\lambda I)^{-1}$ must be computed (or solved) as one matrix.`,
  },
  {
    id: 'I21',
    area: 'Linear algebra',
    tex: R`A(\mathbf u-\mathbf v)=A\mathbf u-A\mathbf v,\qquad A\mathbf v+B\mathbf v=(A+B)\mathbf v`,
    note: R`Matrix products distribute over sums. The common factor keeps its side: $\mathbf v$ stays on the right. $A,B$ are $D\times D$ and $\mathbf u,\mathbf v$ are $D\times1$ (or $A$ is $D\times N$ and $\mathbf u,\mathbf v$ are $N\times1$).`,
  },
];

const ridgeObjective = R`
L_{\text{ridge}}(\mathbf w)=
\underbrace{\lVert\mathbf y-X\mathbf w\rVert_2^2}_{\text{fit (RSS)}}
+
\underbrace{\lambda\lVert\mathbf w\rVert_2^2}_{\text{penalty}}`;

const sections: Section[] = [
  {
    id: 'smaller-class',
    title: 'A smaller function class',
    why: R`Overfitting comes from too many candidate functions fitting a few points. One fix is to allow fewer candidates. This shows what that buys (fewer good fits) and what it can cost (the true function may be excluded).`,
    slides: [slide('I', 51, 'A smaller function class rules out candidates')],
    slideNote: R`Figure only. Top row: two data points, the true function (dashed green line), the best fit (blue) and other good fits (light blue). Bottom row: the cost $L(\mathbf w)$ over $(w_1,w_2)$ with the true function (green dot) and best fit (blue cross); grey regions are outside the class.`,
    rows: [
      {
        eq: R`y=w_1x+w_2x^2`,
        notes: [
          lab('left: the full quadratic family; the best fit is a parabola through both points that departs from the true line'),
          lab(R`middle: linear only, $w_2=0$; right: the zero function, $\mathbf w=\mathbf 0$`),
          warn('a restrictive family can exclude the true function: the zero function on the right cannot match the line'),
        ],
      },
    ],
  },
  {
    id: 'more-data',
    title: 'More observations',
    why: R`The other fix keeps the function class and adds data. Each new point rules out the candidates that miss it, so the good fits shrink towards the true function.`,
    slides: [slide('I', 52, 'More observations constrain the fitted function')],
    slideNote: R`Figure only, same layout as slide 51. From left to right there are more data points; the band of good fits narrows, and the low-cost valley in $(w_1,w_2)$ shrinks around the true function.`,
    rows: [
      {
        eq: R`y=w_1x+w_2\sin(x)`,
        notes: [
          lab('the function class stays the same in all three panels'),
          text('More observations narrow the range of fits consistent with the data.'),
        ],
      },
    ],
  },
  {
    id: 'penalty',
    title: 'Regularisation: a preference over functions',
    why: R`Often we cannot shrink the class or collect more data. Regularisation keeps the flexible class but adds a cost for "complicated" coefficients, so among fits that match the data the optimiser prefers the simpler one.`,
    slides: [
      slide('I', 53, 'Avoiding overfitting: regularization'),
      slide('I', 54, 'Regularisation: a preference over functions'),
    ],
    slideNote: 'Slide 53 is a figure: a wildly oscillating blue curve and a smooth green curve both pass through the same red points. Flexible models can fit noise as well as signal.',
    rows: [
      {
        eq: R`\hat{\mathbf w}\in\arg\min_{\mathbf w}\big[L(\mathbf w)+\lambda\,\Omega(\mathbf w)\big]`,
        notes: [
          term('Regularisation'),
          lab(R`$L(\mathbf w)$: residual sum of squares. $\Omega(\mathbf w)$: a chosen penalty on the coefficients`),
          con(R`$\lambda\ge0$ sets the penalty strength; it is fixed while we minimise over $\mathbf w$`),
          tag(['C3'], 'the fitted coefficients minimise fit plus penalty'),
          shape(R`L(\mathbf w),\ \Omega(\mathbf w),\ \lambda:\ \text{all }1\times1`),
        ],
      },
      {
        eq: R`\Omega(\mathbf w)=\lVert\mathbf w\rVert_2^2=\mathbf w^\top\mathbf w`,
        notes: [
          lab('ridge uses the squared L2 coefficient penalty'),
          tag(['I1'], 'squared norm is the vector dotted with itself'),
          shape(R`(1\times D)(D\times1)=1\times1`),
        ],
      },
      {
        eq: R`\lambda=0\ \Rightarrow\ \text{plain least squares}`,
        notes: [ex('no penalty: the problem of the earlier topics')],
      },
    ],
  },
  {
    id: 'objective',
    circ: 1,
    title: 'The ridge objective',
    why: R`To find the ridge weights we need $L_{\text{ridge}}$ as one formula in $\mathbf w$. Expanding it shows it is the least-squares loss plus one extra quadratic term, so the gradient will be the old one plus one new piece.`,
    slides: [slide('I', 55, 'Ridge regression')],
    slideNote: 'Rows 2 and 3 are added: they expand the norms exactly as in the matrix least-squares topic.',
    display: ridgeObjective,
    rows: [
      {
        eq: R`L_{\text{ridge}}(\mathbf w)=\lVert\mathbf y-X\mathbf w\rVert_2^2+\lambda\lVert\mathbf w\rVert_2^2`,
        notes: [
          term('Ridge regression'),
          lab('first term: fit to the observations (RSS); second: the squared L2 coefficient penalty'),
          lab(R`preference for smaller coefficients: larger $\lambda$ shrinks them more`),
          shape(R`\mathbf y-X\mathbf w:\ N\times1,\quad \mathbf w:\ D\times1,\quad L_{\text{ridge}}:\ 1\times1`),
          shape(R`X:\ N\times D\ \text{(centred, no column of 1s; see next section)}`),
        ],
      },
      {
        eq: R`=(\mathbf y-X\mathbf w)^\top(\mathbf y-X\mathbf w)+\lambda\,\mathbf w^\top\mathbf w`,
        notes: [tag(['I1'], 'both squared norms become a vector dotted with itself')],
      },
      {
        eq: R`=\htmlClass{c-orange}{\mathbf y^\top\mathbf y}-2\,\mathbf y^\top X\mathbf w+\mathbf w^\top X^\top X\mathbf w+\lambda\,\mathbf w^\top\mathbf w`,
        notes: [
          tag(['I2', 'I3'], R`multiply out; the two cross terms are equal scalars, so they combine to $-2\,\mathbf y^\top X\mathbf w$`),
          con(R`$\mathbf y^\top\mathbf y$ has no $\mathbf w$: constant`),
          shape(R`\text{each term: }1\times1`),
        ],
      },
    ],
  },
  {
    id: 'intercept',
    title: 'Centring and the unpenalised intercept',
    why: R`Penalising $w_0$ would pull the whole fit towards $y=0$, so the answer would change if every target were shifted by a constant. Centring the data and leaving the intercept out of the penalty keeps the shrinkage on the slopes only.`,
    slides: [slide('I', 55, 'Ridge regression'), slide('I', 57, 'Stronger regularisation restricts good fits')],
    slideNote: R`The slide gives the three instructions in rows 1, 2 (label) and 4. Rows 2 and 3 are added to show why they fit together: with centred data the best unpenalised intercept is 0, so $X$ can drop its column of 1s.`,
    rows: [
      {
        eq: R`\tilde{\mathbf x}_i=\mathbf x_i-\bar{\mathbf x},\quad \tilde y_i=y_i-\bar y,\qquad \bar{\mathbf x}=\frac1N\sum_{i=1}^{N}\mathbf x_i,\quad \bar y=\frac1N\sum_{i=1}^{N}y_i`,
        notes: [
          lab('centre inputs and targets by subtracting their training means'),
          shape(R`\mathbf x_i,\bar{\mathbf x},\tilde{\mathbf x}_i:\ D\times1,\qquad y_i,\bar y,\tilde y_i:\ 1\times1`),
        ],
      },
      {
        eq: R`\frac{\partial}{\partial w_0}\Big[\sum_{i=1}^{N}(\tilde y_i-w_0-\mathbf w^\top\tilde{\mathbf x}_i)^2+\lambda\lVert\mathbf w\rVert_2^2\Big]=-2\sum_{i=1}^{N}(\tilde y_i-w_0-\mathbf w^\top\tilde{\mathbf x}_i)=0`,
        notes: [
          lab(R`the intercept $w_0$ is fitted separately, without a penalty: the penalty has no $w_0$`),
          tag(['I8', 'I15', 'I14'], 'differentiate the sum term by term with the chain rule, set to zero'),
        ],
      },
      {
        eq: R`\hat w_0=\frac1N\sum_i\tilde y_i-\mathbf w^\top\frac1N\sum_i\tilde{\mathbf x}_i=0-\mathbf w^\top\mathbf 0=0`,
        notes: [
          tag(['I16'], R`split the sum; $\sum_i w_0=Nw_0$; $\mathbf w^\top$ comes out`),
          lab('centred values sum to zero, so the best intercept is 0'),
          warn(R`so in $L_{\text{ridge}}$, $X$ is the centred $N\times D$ matrix with no column of 1s and $\mathbf y$ is the centred target vector $\tilde{\mathbf y}$`),
        ],
      },
      {
        eq: R`\hat y=\bar y+\hat{\mathbf w}^\top(\mathbf x-\bar{\mathbf x})`,
        notes: [
          lab(R`reuse the training $\bar{\mathbf x},\bar y$ at validation and test time`),
          warn('do not recompute the means on the test set'),
          shape(R`(1\times D)(D\times1)=1\times1`),
        ],
      },
    ],
  },
  {
    id: 'gradient',
    circ: 2,
    title: 'Gradient of the ridge objective',
    why: R`As in least squares, the best $\mathbf w$ is where the gradient is zero. The fit term gives the gradient we already know; the penalty adds just $2\lambda\mathbf w$.`,
    slides: [slide('I', 56, 'Ridge: the parameter estimate'), slide('II', 3, 'Ridge regression')],
    slideNote: 'Deck II slide 3 repeats deck I slide 56. Rows 1 to 4 are added to show each identity; row 5 is the slide.',
    rows: [
      {
        eq: R`\nabla_{\mathbf w}L_{\text{ridge}}=\nabla_{\mathbf w}(\htmlClass{c-orange}{\mathbf y^\top\mathbf y})-2\,\nabla_{\mathbf w}(\mathbf y^\top X\mathbf w)+\nabla_{\mathbf w}(\mathbf w^\top X^\top X\mathbf w)+\lambda\,\nabla_{\mathbf w}(\mathbf w^\top\mathbf w)`,
        notes: [
          tag(['I8', 'C1'], R`differentiate each term on its own; $\lambda$ is a constant factor`),
          shape(R`\nabla_{\mathbf w}L_{\text{ridge}}:\ D\times1`),
        ],
      },
      {
        eq: R`=\mathbf 0-2X^\top\mathbf y+2X^\top X\mathbf w+\lambda\,\nabla_{\mathbf w}(\mathbf w^\top\mathbf w)`,
        notes: [
          tag(['I2', 'I4', 'I5'], R`$\nabla(\mathbf y^\top\mathbf y)=\mathbf 0$ (constant); I4 with $\mathbf a=X^\top\mathbf y$ by I2; I5 with symmetric $A=X^\top X$`),
          shape(R`X^\top\mathbf y,\ X^\top X\mathbf w:\ D\times1`),
        ],
      },
      {
        eq: R`\lambda\,\nabla_{\mathbf w}(\mathbf w^\top\mathbf w)=2\lambda\mathbf w`,
        notes: [
          tag(['I20'], R`write $\mathbf w^\top\mathbf w=\mathbf w^\top I\mathbf w$ and use I5 with the symmetric $A=I$`),
          shape(R`2\lambda\mathbf w:\ D\times1`),
        ],
      },
      {
        eq: R`\nabla_{\mathbf w}L_{\text{ridge}}=-2X^\top\mathbf y+2X^\top X\mathbf w+2\lambda\mathbf w`,
        notes: [lab('collect the results'), shape(R`\text{all three terms: }D\times1`)],
      },
      {
        eq: R`\nabla_{\mathbf w}L_{\text{ridge}}(\mathbf w)=-2X^\top(\mathbf y-X\mathbf w)+2\lambda\mathbf w`,
        notes: [
          tag(['I21'], R`factor $-2X^\top$ out on the left of the first two terms`),
          shape(R`(D\times N)(N\times1)+D\times1=D\times1`),
        ],
      },
    ],
  },
  {
    id: 'solve',
    circ: 3,
    title: 'Solve for the ridge estimate',
    why: R`Setting the gradient to zero gives a linear equation in $\hat{\mathbf w}$, like the Normal Equation but with $\lambda I$ added. That extra term is what guarantees one unique answer, even when least squares alone has many.`,
    slides: [slide('I', 56, 'Ridge: the parameter estimate'), slide('II', 3, 'Ridge regression')],
    slideNote: 'Rows 2 to 4 are added to show the rearranging; rows 5 and 6 are the slide.',
    rows: [
      {
        eq: R`-2X^\top(\mathbf y-X\hat{\mathbf w})+2\lambda\hat{\mathbf w}=\mathbf 0`,
        notes: [tag(['I14'], R`set the gradient to zero at the fitted $\hat{\mathbf w}$`), shape(R`\mathbf 0:\ D\times1`)],
      },
      {
        eq: R`-X^\top\mathbf y+X^\top X\hat{\mathbf w}+\lambda\hat{\mathbf w}=\mathbf 0`,
        notes: [ex('divide by 2'), tag(['I21'], R`multiply $X^\top$ into the bracket`)],
      },
      {
        eq: R`X^\top X\hat{\mathbf w}+\lambda\hat{\mathbf w}=X^\top\mathbf y`,
        notes: [ex(R`move $X^\top\mathbf y$ to the right`)],
      },
      {
        eq: R`X^\top X\hat{\mathbf w}+\lambda I\hat{\mathbf w}=X^\top\mathbf y`,
        notes: [
          tag(['I22'], R`write $\lambda\hat{\mathbf w}=\lambda I\hat{\mathbf w}$ so both terms are a matrix times $\hat{\mathbf w}$`),
          shape(R`\lambda I:\ D\times D`),
        ],
      },
      {
        eq: R`(X^\top X+\lambda I)\,\hat{\mathbf w}=X^\top\mathbf y`,
        notes: [
          tag(['I21'], R`factor $\hat{\mathbf w}$ out on the RIGHT`),
          lab(R`$I$ is the identity matrix`),
          shape(R`\big[(D\times D)+(D\times D)\big](D\times1)=(D\times N)(N\times1)=D\times1`),
        ],
      },
      {
        eq: R`\hat{\mathbf w}=(X^\top X+\lambda I)^{-1}X^\top\mathbf y`,
        notes: [
          tag(['I23'], R`for $\lambda>0$ the matrix is invertible, so the solution is unique`),
          lab('multiply on the LEFT by the inverse'),
          ex(R`$\lambda=0$ gives back the Normal Equation $\hat{\mathbf w}=(X^\top X)^{-1}X^\top\mathbf y$`),
          text(R`In code, solve the linear system $(X^\top X+\lambda I)\hat{\mathbf w}=X^\top\mathbf y$ (for example with numpy.linalg.solve) instead of forming the inverse.`),
          shape(R`(D\times D)(D\times N)(N\times1)=D\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Exam trap',
        flag: 'I22',
        text: R`Writing $X^\top X+\lambda$ is wrong: a matrix plus a scalar is undefined. The $\lambda$ must multiply the identity, $\lambda I$, which adds $\lambda$ to each diagonal entry only.`,
        eq: R`X^\top X+\lambda I=\begin{bmatrix}(X^\top X)_{11}+\lambda & \cdots\\ \vdots & \ddots\end{bmatrix}`,
      },
      {
        heading: 'Exam trap',
        flag: 'I24',
        text: R`The inverse does not split over the sum.`,
        eq: R`(X^\top X+\lambda I)^{-1}\ne(X^\top X)^{-1}+\tfrac1\lambda I`,
      },
      {
        heading: 'Hidden step: why is the solution unique for any data?',
        flag: 'I23',
        text: R`For $\lambda>0$, $X^\top X+\lambda I$ is positive definite even when $X$ does not have full column rank (for example more features than examples). So $L_{\text{ridge}}$ is a strictly convex bowl with exactly one lowest point.`,
        eq: R`\mathbf v^\top(X^\top X+\lambda I)\mathbf v=\lVert X\mathbf v\rVert_2^2+\lambda\lVert\mathbf v\rVert_2^2>0\quad(\mathbf v\ne\mathbf 0)`,
      },
    ],
  },
  {
    id: 'stronger',
    title: 'Stronger regularisation',
    why: R`$\lambda$ is a dial. Turning it up pulls the coefficients towards zero and narrows the set of good fits; too far, and the fit ignores the data. Seeing this helps explain why $\lambda$ has to be chosen with care.`,
    slides: [slide('I', 57, 'Stronger regularisation restricts good fits')],
    slideNote: R`Figure plus a one-line caption (the warn), same layout as slide 51, for a line through one data point. Left: a long low-cost valley in $(w_0,w_1)$, so many lines fit the single point. Moving right, the low-cost region shrinks to a small disc around the origin and the best line flattens. The widget below is added: it turns the same dial on a degree-9 polynomial.`,
    rows: [
      {
        eq: R`y=w_0+w_1x`,
        notes: [
          lab('stronger penalty from left to right'),
          tag(['I23'], 'with a penalty, one data point is enough for a single best fit'),
          warn(R`this schematic penalises both coefficients; our ridge objective leaves the intercept $w_0$ unpenalised`),
        ],
      },
    ],
    extra: <RidgeShrinkage />,
  },
];

export const ridge: Topic = {
  id: 'ridge',
  title: 'Regularisation and ridge regression',
  short: 'Ridge',
  summary: R`Ways to stop overfitting: a smaller function class, more data, or a penalty. Ridge adds $\lambda\lVert\mathbf w\rVert_2^2$ to the RSS; setting its gradient to zero gives $(X^\top X+\lambda I)\hat{\mathbf w}=X^\top\mathbf y$, with a unique solution for every $\lambda>0$.`,
  identities,
  sections,
};
