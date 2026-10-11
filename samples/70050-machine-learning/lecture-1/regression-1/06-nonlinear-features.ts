import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I19',
    area: 'Linear algebra',
    tex: R`\operatorname{rank}(\Phi^\top\Phi)=\operatorname{rank}(\Phi)\le\min(N,M)`,
    note: R`For $\Phi$ of shape $N\times M$, $\Phi^\top\Phi$ is $M\times M$. It is invertible only if its rank is $M$, which needs $N\ge M$. When $M>N$ it is always singular.`,
  },
  {
    id: 'I18',
    area: 'Linear algebra',
    tex: R`\operatorname{rank}(\Phi)=N\ \Rightarrow\ \Phi\mathbf w=\mathbf y\ \text{has a solution for every}\ \mathbf y\in\mathbb R^N`,
    note: R`Full row rank: the $N$ rows are independent, which needs $M\ge N$. If $M>N$ there are infinitely many solutions: adding any $\mathbf v$ with $\Phi\mathbf v=\mathbf 0$ gives another one.`,
  },
];

const designMatrix = R`
\underbrace{\Phi}_{\htmlClass{c-green}{N\times M}}
=
\begin{bmatrix}
\phi_1(\mathbf x_1) & \cdots & \phi_M(\mathbf x_1)\\
\vdots & & \vdots\\
\phi_1(\mathbf x_N) & \cdots & \phi_M(\mathbf x_N)
\end{bmatrix}
\in\mathbb R^{N\times M}`;

const sections: Section[] = [
  {
    id: 'feature-map',
    title: 'Features',
    why: R`A straight line cannot follow a curved trend. Instead of changing the model, we change the input: compute $M$ new numbers from $\mathbf x$ and fit a linear model on those. All the least-squares algebra then works unchanged.`,
    slides: [slide('I', 44, 'Features')],
    slideNote: 'The figure shows red data points above a 2D input plane with a curved fitted surface; the thin vertical lines are the residuals.',
    rows: [
      {
        eq: R`\mathbf x\mapsto\boldsymbol\phi(\mathbf x)=\begin{bmatrix}\phi_1(\mathbf x)\\ \vdots\\ \phi_M(\mathbf x)\end{bmatrix}`,
        notes: [
          term('Feature map'),
          lab(R`$\phi_j$ is feature $j$, for $j=1,\dots,M$; each one turns the whole input into one number`),
          shape(R`\mathbf x:\ D\times1\ \longmapsto\ \boldsymbol\phi(\mathbf x):\ M\times1`),
        ],
      },
      {
        eq: R`\phi_1(\mathbf x)=\htmlClass{c-red}{1}`,
        notes: [
          lab(R`the first feature is the constant 1; it pairs with the intercept $w_0$`),
          warn(R`index offset: feature $\phi_1$ pairs with coefficient $w_0$, $\phi_2$ with $w_1$, and so on`),
        ],
      },
    ],
  },
  {
    id: 'poly2',
    title: 'Example: degree 2 polynomial in 1D',
    why: R`The simplest curve is a parabola. Choosing the features $1,x,x^2$ shows that a "curved" fit is still the inner product $\mathbf w^\top\boldsymbol\phi(x)$, so it is linear in the coefficients we solve for.`,
    slides: [slide('I', 45, '1D Example: 2nd degree polynomial fitting')],
    rows: [
      {
        eq: R`\boldsymbol\phi(x)=\begin{bmatrix}\phi_1(x)\\ \phi_2(x)\\ \phi_3(x)\end{bmatrix}=\begin{bmatrix}\htmlClass{c-red}{1}\\ x\\ x^2\end{bmatrix}`,
        notes: [
          lab(R`three features from one scalar input`),
          shape(R`x:\ 1\times1\ \longmapsto\ \boldsymbol\phi(x):\ 3\times1,\qquad M=3`),
        ],
      },
      {
        eq: R`\mathbf w^\top\boldsymbol\phi(x)=w_0+w_1x+w_2x^2`,
        notes: [
          tag(['I12'], R`dot product of $\mathbf w=[w_0,w_1,w_2]^\top$ with the feature vector`),
          lab(R`the coefficients keep their names $w_0,w_1,w_2$`),
          shape(R`(1\times3)(3\times1)=1\times1`),
          warn(R`nonlinear in $x$, but linear in $\mathbf w$: that is what least squares needs`),
        ],
      },
    ],
  },
  {
    id: 'polyq',
    title: 'Polynomial features of degree q',
    why: R`The parabola generalises to any degree $q$ by adding powers of $x$. The degree controls how flexible the curve is, which is exactly the knob that later causes overfitting.`,
    slides: [slide('I', 46, 'Polynomial features of degree q')],
    slideNote: 'The plot shows the same raw data fitted with 3rd, 5th and 9th order polynomials; the 9th order curve wiggles through more of the points and shoots up steeply at the right edge.',
    rows: [
      {
        eq: R`\boldsymbol\phi(x)=\begin{bmatrix}\phi_1(x)\\ \phi_2(x)\\ \vdots\\ \phi_{q+1}(x)\end{bmatrix}=\begin{bmatrix}\htmlClass{c-red}{1}\\ x\\ \vdots\\ x^q\end{bmatrix}`,
        notes: [
          lab(R`$q$ is the polynomial degree; $M=q+1$ features, including $\phi_1=1$`),
          shape(R`\boldsymbol\phi(x):\ (q+1)\times1`),
        ],
      },
      {
        eq: R`\mathbf w^\top\boldsymbol\phi(x)=w_0+w_1x+\cdots+w_qx^q`,
        notes: [
          tag(['I12'], 'dot product written out, one term per feature'),
          shape(R`\big(1\times(q+1)\big)\big((q+1)\times1\big)=1\times1`),
          ex(R`$q=2$ gives back slide 45 with $M=3$`),
        ],
      },
    ],
  },
  {
    id: 'poly2d',
    title: 'Example: second-order polynomial in 2D',
    why: R`With more than one input coordinate, polynomial features also include products of coordinates. Counting them ($M=6$ here) shows that $M$ grows quickly once inputs have several coordinates.`,
    slides: [slide('I', 47, '2D example: second-order polynomials')],
    rows: [
      {
        eq: R`\mathbf x=(x_1,x_2),\qquad \boldsymbol\phi(\mathbf x)=\begin{bmatrix}\htmlClass{c-red}{1}\\ x_1\\ x_2\\ x_1^2\\ x_2^2\\ x_1x_2\end{bmatrix}`,
        notes: [
          lab(R`constant, linear terms, squares and the cross term $x_1x_2$`),
          shape(R`\mathbf x:\ 2\times1\ \longmapsto\ \boldsymbol\phi(\mathbf x):\ 6\times1,\qquad M=6`),
        ],
      },
      {
        eq: R`\mathbf w^\top\boldsymbol\phi(\mathbf x)=w_0+w_1x_1+w_2x_2+w_3x_1^2+w_4x_2^2+w_5x_1x_2`,
        notes: [
          tag(['I12'], 'dot product of six coefficients with six features'),
          shape(R`(1\times6)(6\times1)=1\times1`),
          warn(R`do not forget the cross term $x_1x_2$`),
        ],
      },
    ],
  },
  {
    id: 'design-matrix',
    circ: 1,
    title: 'A design matrix for features',
    why: R`To reuse the matrix least-squares result we need the same shape of equation, $\mathbf y=(\text{matrix})\mathbf w+\boldsymbol\epsilon$. Stacking each example's feature vector as a row gives that matrix, $\Phi$, in place of $X$.`,
    slides: [slide('I', 48, 'A design matrix for nonlinear features')],
    display: designMatrix,
    rows: [
      {
        eq: R`\hat y_i=f(\mathbf x_i;\mathbf w)=\mathbf w^\top\boldsymbol\phi(\mathbf x_i)`,
        notes: [
          lab('linear in the coefficients, with possibly nonlinear input features'),
          tag(['I13'], R`same as $\boldsymbol\phi(\mathbf x_i)^\top\mathbf w$, which is row $i$ of $\Phi$ times $\mathbf w$`),
          shape(R`(1\times M)(M\times1)=1\times1`),
        ],
      },
      {
        eq: R`\Phi_{ij}=\phi_j(\mathbf x_i)`,
        notes: [
          term('Design matrix'),
          lab(R`$N$ rows (one per example), $M$ feature columns; row $i$ is $\boldsymbol\phi(\mathbf x_i)^\top$`),
          ex(R`with $\boldsymbol\phi(x)=[1,x]^\top$, $\Phi$ is exactly the $X$ of slide 39`),
          shape(R`\Phi:\ N\times M`),
        ],
      },
      {
        eq: R`\mathbf y=\Phi\mathbf w+\boldsymbol\epsilon,\qquad \mathbf y,\boldsymbol\epsilon\in\mathbb R^N,\quad \mathbf w\in\mathbb R^M`,
        notes: [
          lab(R`all $N$ predictions at once`),
          shape(R`N\times1=(N\times M)(M\times1)+N\times1`),
        ],
      },
    ],
  },
  {
    id: 'feature-loss',
    circ: 2,
    title: 'Least squares with features',
    why: R`The loss has the same form as before with $\Phi$ in place of $X$. So we do not need a new derivation: every step of the matrix least-squares topic goes through with $X\to\Phi$ and $D+1\to M$.`,
    slides: [slide('I', 48, 'A design matrix for nonlinear features')],
    slideNote: R`Rows 2 and 3 are added: they apply the result of the matrix least-squares topic with $\Phi$ in place of $X$. The slide says only "Minimise it over the same coefficient vector".`,
    rows: [
      {
        eq: R`L(\mathbf w)=\sum_{i=1}^{N}\big(y_i-\mathbf w^\top\boldsymbol\phi(\mathbf x_i)\big)^2=\lVert\mathbf y-\Phi\mathbf w\rVert_2^2`,
        notes: [
          term('RSS criterion'),
          tag(['I1'], R`the sum of squared residuals is the squared norm of $\mathbf y-\Phi\mathbf w$`),
          shape(R`\mathbf y-\Phi\mathbf w:\ N\times1,\qquad L:\ 1\times1`),
        ],
      },
      {
        eq: R`\Phi^\top\Phi\,\hat{\mathbf w}=\Phi^\top\mathbf y`,
        notes: [
          term('Normal Equation'),
          tag(['I2', 'I3', 'I4', 'I5', 'I8'], R`same expansion and gradient steps as with $X$, then set the gradient to zero`),
          shape(R`(M\times N)(N\times M)(M\times1)=(M\times N)(N\times1)=M\times1`),
        ],
      },
      {
        eq: R`\hat{\mathbf w}=(\Phi^\top\Phi)^{-1}\Phi^\top\mathbf y`,
        notes: [
          tag(['I6'], R`with $\Phi$ for $X$ and $M$ for $D+1$: needs full column rank, $\operatorname{rank}(\Phi)=M$`),
          shape(R`(M\times M)(M\times N)(N\times1)=M\times1`),
        ],
      },
    ],
  },
  {
    id: 'overdetermined',
    title: 'More equations than unknowns',
    why: R`Whether least squares has one answer, or any exact fit, depends on how $N$ (examples) compares with $M$ (features). The usual case is many more examples than features, where an exact fit usually does not exist and we settle for the smallest error.`,
    slides: [slide('I', 49, 'More equations than unknowns')],
    slideNote: R`The slide writes "$X$ has full column rank"; here the design matrix is $\Phi$.`,
    pre: [
      text(R`Design matrix: $N$ rows (examples), $M$ columns (features, including an intercept if used).`),
    ],
    rows: [
      {
        eq: R`N>M:\quad \Phi\mathbf w=\mathbf y\ \text{is}\ N\ \text{equations in}\ M\ \text{unknowns}`,
        notes: [
          lab('an exact fit may not exist: solve for the smallest residual norm instead'),
          shape(R`\Phi:\ N\times M\ \text{(tall)}`),
        ],
      },
      {
        eq: R`\hat{\mathbf w}\in\arg\min_{\mathbf w}\lVert\mathbf y-\Phi\mathbf w\rVert_2`,
        notes: [
          tag(['C3'], 'the least-squares coefficients'),
          ex(R`30 noisy observations and 2 line parameters: $N=30$, $M=2$`),
        ],
      },
      {
        eq: R`\operatorname{rank}(\Phi)=M\ \Rightarrow\ \hat{\mathbf w}\ \text{unique}`,
        notes: [
          tag(['I6', 'I7'], R`full column rank makes $\Phi^\top\Phi$ invertible and the minimum unique`),
        ],
      },
    ],
  },
  {
    id: 'underdetermined',
    title: 'Interpolation and overfitting',
    why: R`Adding features makes the model more flexible, but once there are more coefficients than examples the model can hit every training point exactly. A perfect training fit says nothing about new data, which is the problem the rest of the lecture addresses.`,
    slides: [slide('I', 50, 'Interpolation and overfitting')],
    slideNote: R`Row 3 is added: it explains why the normal-equation formula stops working when $M>N$.`,
    rows: [
      {
        eq: R`M>N:\quad\text{more parameters than observations}`,
        notes: [shape(R`\Phi:\ N\times M\ \text{(wide)}`)],
      },
      {
        eq: R`\operatorname{rank}(\Phi)=N\ \Rightarrow\ \Phi\mathbf w=\mathbf y\ \text{solvable, with many}\ \mathbf w`,
        notes: [
          term('Interpolation'),
          tag(['I18'], 'full row rank: every training target vector can be fitted, with many possible coefficients'),
          ex('30 observations and 126 polynomial features can interpolate the data'),
        ],
      },
      {
        eq: R`\operatorname{rank}(\Phi^\top\Phi)\le N<M`,
        notes: [
          tag(['I19'], R`the $M\times M$ matrix $\Phi^\top\Phi$ is singular, so $(\Phi^\top\Phi)^{-1}$ does not exist`),
          warn(R`the formula $(\Phi^\top\Phi)^{-1}\Phi^\top\mathbf y$ cannot be used when $M>N$`),
          shape(R`\Phi^\top\Phi:\ M\times M`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'The real question',
        text: R`How well does the chosen solution predict independent examples? Zero training error is easy to get when $M>N$; it is not the goal.`,
      },
    ],
  },
];

export const nonlinearFeatures: Topic = {
  id: 'nonlinear-features',
  title: 'Nonlinear features',
  short: 'Features',
  summary: R`A feature map $\boldsymbol\phi$ turns each input into $M$ numbers (for example powers of $x$), so a model linear in $\mathbf w$ can fit curves. Stacking features gives the design matrix $\Phi$ and the same least-squares problem $\lVert\mathbf y-\Phi\mathbf w\rVert_2^2$; comparing $N$ with $M$ tells us when the fit is unique and when it interpolates.`,
  identities,
  sections,
};
