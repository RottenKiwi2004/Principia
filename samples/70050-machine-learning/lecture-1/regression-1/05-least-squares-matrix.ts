import { R, con, lab, shape, slide, tag, term, warn } from 'principia';
import type { Section, Topic } from 'principia';

const matrixEq = R`
\underbrace{\begin{bmatrix} y_1\\ y_2\\ \vdots\\ y_N \end{bmatrix}}_{\htmlClass{c-green}{N\times 1}}
=
\underbrace{\begin{bmatrix}
\htmlClass{c-red}{1} & x_{11} & \cdots & x_{1D}\\
\htmlClass{c-red}{1} & x_{21} & \cdots & x_{2D}\\
\vdots & \vdots & \ddots & \vdots\\
\htmlClass{c-red}{1} & x_{N1} & \cdots & x_{ND}
\end{bmatrix}}_{\htmlClass{c-green}{N\times (D+1)}}
\underbrace{\begin{bmatrix} \htmlClass{c-red}{w_0}\\ w_1\\ \vdots\\ w_D \end{bmatrix}}_{\htmlClass{c-green}{(D+1)\times 1}}
+
\underbrace{\begin{bmatrix} \varepsilon_1\\ \varepsilon_2\\ \vdots\\ \varepsilon_N \end{bmatrix}}_{\htmlClass{c-green}{N\times 1}}`;

const sections: Section[] = [
  {
    id: 'setup',
    title: 'Setup and shapes',
    why: R`Fitting a line to $N$ data points means $N$ separate equations, one per point. Stacking them gives the single equation $\mathbf y=X\mathbf w+\boldsymbol\varepsilon$, so every later step is matrix algebra whose shapes we can check.`,
    slides: [slide('I', 40, 'Linear regression in 2D (or ND)'), slide('I', 41, 'Linear regression: the matrix model')],
    display: matrixEq,
    pre: [
      lab(R`$N$ samples are the rows. $D$ features are the columns after the column of 1s.`),
      lab(R`Slide 40 is a figure only: with $D=2$ features the fitted model is a plane, and each residual is the vertical gap from a point to that plane.`),
      warn(R`The column of 1s multiplies $w_0$, so the intercept lives inside $X\mathbf w$.`),
    ],
    rows: [
      {
        eq: R`\mathbf y = X\mathbf w + \boldsymbol\varepsilon`,
        notes: [
          lab('same equation, written compactly'),
          shape(R`N\times1=\big[N\times(D+1)\big]\cdot\big[(D+1)\times1\big]+N\times1`),
          shape(R`\text{inner sizes match: }D+1`),
        ],
      },
    ],
  },
  {
    id: 'loss',
    circ: 1,
    title: 'Loss in vector form',
    why: R`To choose the best $\mathbf w$ we need one number that says how badly a given $\mathbf w$ fits the data. The sum of squared errors is that number, and writing it as $\lVert\boldsymbol\varepsilon\rVert_2^2$ gives a compact formula in $\mathbf w$ that we can differentiate in one go.`,
    slides: [slide('I', 42, 'Squared error as a vector norm'), slide('I', 43, 'Least squares solution, in vector form')],
    slideNote: 'Row 1 is slide 42. Rows 2 and 4 are slide 43. Row 3, the four-term expansion, is added to show I2 and I3.',
    rows: [
      {
        eq: R`L(\mathbf w)=\sum_{i=1}^{N}\varepsilon_i^2=\boldsymbol\varepsilon^\top\boldsymbol\varepsilon=\lVert\boldsymbol\varepsilon\rVert_2^2`,
        notes: [
          tag(['I1'], 'a sum of squares is the vector dotted with itself'),
          shape(R`\boldsymbol\varepsilon:\ N\times1,\qquad \boldsymbol\varepsilon^\top\boldsymbol\varepsilon:\ (1\times N)(N\times1)=1\times1\ \text{(scalar)}`),
        ],
      },
      {
        eq: R`=(\mathbf y-X\mathbf w)^\top(\mathbf y-X\mathbf w)`,
        notes: [
          tag(['I1'], R`substitute $\boldsymbol\varepsilon=\mathbf y-X\mathbf w$`),
          shape(R`\mathbf y-X\mathbf w:\ N\times1`),
        ],
      },
      {
        eq: R`=\mathbf y^\top\mathbf y-\mathbf y^\top X\mathbf w-\mathbf w^\top X^\top\mathbf y+\mathbf w^\top X^\top X\mathbf w`,
        notes: [
          tag(['I2'], R`transpose each bracket, then multiply out: $(X\mathbf w)^\top=\mathbf w^\top X^\top$`),
          shape(R`\text{each of the four terms: }1\times1`),
        ],
      },
      {
        eq: R`=\htmlClass{c-orange}{\mathbf y^\top\mathbf y}-2\,\mathbf y^\top X\mathbf w+\mathbf w^\top X^\top X\mathbf w`,
        notes: [
          tag(['I3'], R`$\mathbf w^\top X^\top\mathbf y$ is a scalar, so it equals its own transpose $\mathbf y^\top X\mathbf w$`),
          con(R`$\mathbf y^\top\mathbf y$ has no $\mathbf w$ in it: constant`),
          shape(R`\mathbf w^\top X^\top\mathbf y:\ \big(1\times(D+1)\big)\big((D+1)\times N\big)(N\times1)=1\times1`),
        ],
      },
    ],
  },
  {
    id: 'gradient',
    circ: 2,
    title: 'Gradient, term by term',
    why: R`The best $\mathbf w$ sits at the lowest point of the loss, where the slope in every direction (the gradient) is zero. So before we can solve for it we need the gradient, and we find it one term at a time with the identities in the index.`,
    slides: [slide('I', 43, 'Least squares solution, in vector form')],
    slideNote: 'Slide 43 goes straight from the condition to the result. The term-by-term steps here are added so each identity is visible.',
    rows: [
      {
        eq: R`\nabla_{\mathbf w}L=\nabla_{\mathbf w}(\mathbf y^\top\mathbf y)-2\,\nabla_{\mathbf w}(\mathbf y^\top X\mathbf w)+\nabla_{\mathbf w}(\mathbf w^\top X^\top X\mathbf w)`,
        notes: [
          tag(['I8', 'C1'], 'differentiate each term on its own'),
          shape(R`\nabla_{\mathbf w}L:\ (D+1)\times1,\ \text{same shape as }\mathbf w`),
        ],
      },
      {
        eq: R`\nabla_{\mathbf w}(\htmlClass{c-orange}{\mathbf y^\top\mathbf y})=\mathbf 0`,
        notes: [con(R`constant: no $\mathbf w$, so the gradient is zero`), shape(R`\mathbf 0:\ (D+1)\times1`)],
      },
      {
        eq: R`\nabla_{\mathbf w}(\mathbf y^\top X\mathbf w)=X^\top\mathbf y`,
        notes: [
          tag(['I4'], R`here $\mathbf a^\top=\mathbf y^\top X$, so $\mathbf a=(\mathbf y^\top X)^\top=X^\top\mathbf y$ (by I2)`),
          shape(R`X^\top\mathbf y:\ \big[(D+1)\times N\big]\cdot\big[N\times1\big]=(D+1)\times1`),
        ],
      },
      {
        eq: R`\nabla_{\mathbf w}(\mathbf w^\top X^\top X\mathbf w)=2X^\top X\mathbf w`,
        notes: [
          tag(['I5'], R`$A=X^\top X$ is symmetric, because $(X^\top X)^\top=X^\top X$ by I2`),
          shape(R`X^\top X:\ (D+1)\times(D+1),\qquad X^\top X\mathbf w:\ (D+1)\times1`),
        ],
      },
      {
        eq: R`\nabla_{\mathbf w}L=-2X^\top\mathbf y+2X^\top X\mathbf w`,
        notes: [lab('collect the three results'), shape(R`\text{both terms: }(D+1)\times1`)],
      },
    ],
  },
  {
    id: 'solve',
    circ: 3,
    title: R`Solve for $\hat{\mathbf w}$`,
    why: R`Setting the gradient to zero gives the Normal Equation, a linear equation in $\hat{\mathbf w}$. Solving it gives the best weights as a closed-form formula, so we get them directly instead of searching step by step.`,
    slides: [slide('I', 39, 'Matrix form of the normal equations'), slide('I', 43, 'Least squares solution, in vector form')],
    rows: [
      {
        eq: R`\nabla_{\mathbf w}L(\hat{\mathbf w})=-2X^\top\mathbf y+2X^\top X\hat{\mathbf w}=\mathbf 0`,
        notes: [
          lab(R`condition for a minimum: the gradient is zero at the fitted $\hat{\mathbf w}$`),
          shape(R`\mathbf 0:\ (D+1)\times1`),
        ],
      },
      {
        eq: R`X^\top X\,\hat{\mathbf w}=X^\top\mathbf y`,
        notes: [term('Normal Equation'), shape(R`\big[(D+1)\times(D+1)\big]\cdot\big[(D+1)\times1\big]=(D+1)\times1`)],
      },
      {
        eq: R`\hat{\mathbf w}=(X^\top X)^{-1}X^\top\mathbf y`,
        notes: [
          tag(['I6'], R`multiply both sides on the LEFT by $(X^\top X)^{-1}$: matrix order matters`),
          lab('slide 39 boxes this closed form and labels it the Normal Equation'),
          warn(R`needs full column rank, otherwise $X^\top X$ has no inverse`),
          shape(R`\big[(D+1)\times(D+1)\big]\cdot\big[(D+1)\times N\big]\cdot\big[N\times1\big]=(D+1)\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Hidden step: why is a zero gradient a minimum?',
        flag: 'I7',
        text: R`The matrix $X^\top X$ is positive semi-definite, so $L$ is a convex bowl shape and its only flat point is the lowest point.`,
        eq: R`\mathbf v^\top X^\top X\mathbf v=\lVert X\mathbf v\rVert_2^2\ge 0`,
      },
    ],
  },
];

export const leastSquaresMatrix: Topic = {
  id: 'least-squares-matrix',
  title: 'Least squares in matrix form',
  short: 'LS matrix',
  summary: R`The same least-squares fit as the 1D case, written once for $N$ examples and $D$ inputs. One matrix equation gives the loss, its gradient and the closed-form solution $\hat{\mathbf w}=(X^\top X)^{-1}X^\top\mathbf y$.`,
  sections,
};
