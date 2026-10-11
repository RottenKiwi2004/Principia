import { R, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I50',
    area: 'Linear algebra',
    tex: R`\lVert\mathbf w\rVert_1=\sum_{j=1}^{D}|w_j|`,
    note: R`L1 norm (Manhattan distance from $\mathbf 0$): add up the sizes of the coordinates, ignoring signs. $\mathbf w$ is $D\times1$, the result is $1\times1$ and never negative.`,
  },
  {
    id: 'I51',
    area: 'Linear algebra',
    tex: R`\lVert\mathbf w\rVert_2=\Big(\sum_{j=1}^{D}w_j^2\Big)^{1/2},\qquad \lVert\mathbf w\rVert_2^2=\sum_{j=1}^{D}w_j^2=\mathbf w^\top\mathbf w`,
    note: R`L2 norm (straight-line, Euclidean length). The squared version has no square root; the last equality is I1. $\mathbf w$ is $D\times1$, the result is $1\times1$.`,
  },
  {
    id: 'I53',
    area: 'Optimisation',
    tex: R`\min_{\mathbf w}\ f(\mathbf w)+\lambda\,g(\mathbf w)\quad\longleftrightarrow\quad \min_{\mathbf w}\ f(\mathbf w)\ \ \text{s.t.}\ \ g(\mathbf w)\le r`,
    note: R`Penalty form and constraint form. For convex $f$ and $g$ (as in ridge and LASSO), each $\lambda\ge0$ has a matching radius $r$ that gives the same minimiser. A larger $\lambda$ matches a smaller $r$.`,
  },
  {
    id: 'I54',
    area: 'Optimisation',
    tex: R`\Pi_{\lVert\cdot\rVert_2\le\mu}(\mathbf v)=\begin{cases}\mathbf v & \lVert\mathbf v\rVert_2\le\mu\\[2pt] \mu\,\dfrac{\mathbf v}{\lVert\mathbf v\rVert_2} & \lVert\mathbf v\rVert_2>\mu\end{cases}`,
    note: R`Projection onto the L2 ball of radius $\mu$: the nearest point of the ball. A point outside is scaled down along the line to the centre, so every coordinate keeps its sign and a nonzero coordinate stays nonzero.`,
  },
  {
    id: 'I55',
    area: 'Linear algebra',
    tex: R`X^\top X=I\ \Rightarrow\ \lVert\mathbf y-X\mathbf w\rVert_2^2=\lVert\mathbf w-\hat{\mathbf w}_{\text{LS}}\rVert_2^2+\text{const}`,
    note: R`$\hat{\mathbf w}_{\text{LS}}=X^\top\mathbf y$ is the least-squares solution when $X^\top X=I$ (orthonormal columns). Then the RSS is the squared distance from $\mathbf w$ to $\hat{\mathbf w}_{\text{LS}}$ plus a constant, so the constrained fit is the projection of $\hat{\mathbf w}_{\text{LS}}$ onto the ball.`,
  },
  {
    id: 'I52',
    area: 'Algebra & calculus',
    tex: R`\frac{d}{dw}\,w^2=2w,\qquad \frac{d}{dw}\,|w|=\operatorname{sign}(w)=\pm1\quad(w\ne0)`,
    note: R`The slope of $w^2$ goes to $0$ as $w\to0$; the slope of $|w|$ stays $\pm1$ however small $w$ is. $|w|$ has a corner at $w=0$ and no derivative there.`,
  },
];

const sections: Section[] = [
  {
    id: 'l1-penalty',
    title: 'The L1 penalty',
    why: R`Ridge shrinks every coefficient but almost never makes one exactly zero. Replacing the squared L2 penalty with an L1 penalty (the sum of absolute values) pushes some coefficients to exactly zero, so the model also chooses which features to use.`,
    slides: [slide('II', 31, 'L1 regularisation and LASSO'), slide('II', 32, 'L1 regularisation and LASSO')],
    slideNote: R`Both slides show the same figure; slide 32 adds the sentence about the L1 penalty. The axes of the figure are not labelled on the slides. The row is added to write the sentence as a formula.`,
    pre: [
      term('LASSO'),
      text('LASSO: least absolute shrinkage and selection operator (Tibshirani, 1996).'),
      lab(R`Figure: each coloured curve is the value of one coefficient. Reading from left to right the curves bend towards zero and, one after another, reach exactly zero and stay there, until at the far right all of them are zero. This is the usual LASSO path picture, where the horizontal direction is the penalty strength.`),
    ],
    rows: [
      {
        eq: R`\lambda\sum_{j=1}^{D}|w_j|`,
        notes: [
          text('The L1 penalty sums absolute coefficient values.'),
          lab(R`$|w_j|$ is the size of $w_j$ with its sign removed, e.g. $|-3|=3$`),
          shape(R`\lambda,\ |w_j|,\ \text{the sum}:\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'objective',
    circ: 1,
    title: 'The LASSO objective',
    why: R`This is the actual cost we minimise. It has the same data-fit term as ridge; only the penalty changes. Comparing the two penalties term by term shows why L1 keeps pushing small coefficients all the way to zero while the squared L2 penalty stops caring.`,
    slides: [slide('II', 33, 'LASSO: an L1 coefficient penalty'), slide('I', 55, 'Ridge regression')],
    slideNote: R`Rows 1 and 2 are the slide. Row 3 (ridge, for comparison) is I 55. Rows 4 and 5 are added: a worked example and the slope comparison behind "some coefficients can become exactly zero". The "No closed form" callout is added.`,
    pre: [text('Fit the data while penalising the sum of absolute coefficient values.')],
    rows: [
      {
        eq: R`J_{\text{lasso}}(\mathbf w)=\lVert\mathbf y-X\mathbf w\rVert^2+\lambda\lVert\mathbf w\rVert_1`,
        notes: [
          text(R`$J$: penalised fitting cost. $D$: number of non-intercept coefficients.`),
          lab('first term: RSS, the fit to the data (L2 norm squared); second term: the L1 penalty'),
          tag(['C7'], R`no subscript on the first norm: it is the L2 norm`),
          shape(R`\mathbf y:\ N\times1,\quad X:\ N\times D,\quad \mathbf w:\ D\times1,\quad \mathbf y-X\mathbf w:\ N\times1`),
          shape(R`J_{\text{lasso}},\ \lambda,\ \lVert\mathbf w\rVert_1:\ 1\times1`),
        ],
      },
      {
        eq: R`\lVert\mathbf w\rVert_1=\sum_{j=1}^{D}|w_j|`,
        notes: [term('L1 norm'), tag(['I50'], 'add the absolute values of the coordinates'), warn('the intercept is not in the sum: it is fitted separately, unpenalised')],
      },
      {
        eq: R`J_{\text{ridge}}(\mathbf w)=\lVert\mathbf y-X\mathbf w\rVert_2^2+\lambda\lVert\mathbf w\rVert_2^2,\qquad \lVert\mathbf w\rVert_2^2=\sum_{j=1}^{D}w_j^2`,
        notes: [
          lab('ridge for comparison: same fit term, squared L2 penalty'),
          tag(['I51', 'I1'], R`$\lVert\mathbf w\rVert_2^2=\sum_j w_j^2=\mathbf w^\top\mathbf w$`),
          warn(R`L1 is NOT squared: $\lVert\mathbf w\rVert_1$, not $\lVert\mathbf w\rVert_1^2$`),
        ],
      },
      {
        eq: R`\mathbf w=\begin{bmatrix}3\\-4\end{bmatrix}:\quad \lVert\mathbf w\rVert_1=3+4=7,\quad \lVert\mathbf w\rVert_2^2=9+16=25,\quad \lVert\mathbf w\rVert_2=5`,
        notes: [ex('the minus sign disappears in every norm'), shape(R`\mathbf w:\ 2\times1\ (D=2)`)],
      },
      {
        eq: R`w_j=0.1:\quad |w_j|=0.1,\quad w_j^2=0.01`,
        notes: [
          tag(['I52'], R`the slope of $w_j^2$ is $2w_j\to0$ near zero; the slope of $|w_j|$ stays $\pm1$`),
          lab(R`so ridge barely pushes a small coefficient further, but LASSO keeps pushing with the same force $\lambda$, so a coefficient whose data-fit slope at $0$ is at most $\lambda$ ends up exactly $0$`),
          text('Some coefficients can become exactly zero. LASSO selects a subset of the features.'),
          lab(R`a coefficient $w_j=0$ means feature $j$ has no effect on the prediction $\mathbf x^\top\mathbf w=\sum_j w_jx_j$: that feature is dropped`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'No closed form',
        flag: 'I52',
        text: R`Because $|w_j|$ has a corner at $0$ (no derivative there), the ridge trick of setting the gradient to zero and solving one linear system (I 56) does not give a formula for the LASSO solution in general (except special cases such as $X^\top X=I$, where it is soft-thresholding). It is found by an iterative algorithm instead.`,
      },
    ],
  },
  {
    id: 'penalty-constraint',
    circ: 2,
    title: 'Penalty and constraint forms',
    why: R`A penalty is hard to picture. Rewriting it as a hard limit, keep $\lVert\mathbf w\rVert_1$ at most a radius $r$, turns the problem into geometry: find the best-fitting $\mathbf w$ inside a fixed shape. The next slides use that shape to explain why LASSO gives zeros.`,
    slides: [slide('II', 34, 'Regularisation penalties and constraints')],
    slideNote: R`Rows 1 and 2 are the slide. Row 3, the ridge constraint, is added for comparison.`,
    pre: [text('LASSO penalises L1. Ridge penalises L2 squared.')],
    rows: [
      {
        eq: R`\min_{\mathbf w}\ \lVert\mathbf y-X\mathbf w\rVert_2^2+\lambda\lVert\mathbf w\rVert_1`,
        notes: [term('Penalty formulation'), lab(R`any $\mathbf w$ is allowed, but a big $\lVert\mathbf w\rVert_1$ costs extra`), shape(R`\text{objective: }1\times1,\quad \mathbf w:\ D\times1`)],
      },
      {
        eq: R`\min_{\mathbf w}\ \lVert\mathbf y-X\mathbf w\rVert_2^2\quad\text{s.t.}\quad\lVert\mathbf w\rVert_1\le r`,
        notes: [
          term('Constraint formulation'),
          text(R`$r$: a matching radius. s.t.: subject to.`),
          tag(['I53'], R`for each $\lambda$ there is a radius $r$ with the same solution; larger $\lambda$ matches smaller $r$`),
          lab(R`only $\mathbf w$ inside the L1 ball of radius $r$ are allowed; among those, take the one with the smallest RSS`),
        ],
      },
      {
        eq: R`\text{ridge: }\min_{\mathbf w}\ \lVert\mathbf y-X\mathbf w\rVert_2^2\quad\text{s.t.}\quad\lVert\mathbf w\rVert_2^2\le r\iff\lVert\mathbf w\rVert_2\le\sqrt r`,
        notes: [lab(R`squaring or not gives the same round ball, just with radius $\sqrt r$`)],
      },
    ],
    callouts: [
      {
        heading: 'Notation change in the next figures',
        text: R`Next figures: $\boldsymbol\alpha$ denotes $\mathbf w$, and $\mu$ denotes the radius $r$. So $\boldsymbol\alpha[1]$ and $\boldsymbol\alpha[2]$ are the coordinates $w_1$ and $w_2$.`,
      },
    ],
  },
  {
    id: 'unit-balls',
    title: 'Unit balls of the L1 and L2 norms',
    why: R`The allowed region in the constraint form is a ball of a norm, and the L1 and L2 balls look very different: a diamond with sharp corners against a round disc. That difference in shape is the whole reason LASSO gives exact zeros and ridge does not.`,
    slides: [slide('II', 35, 'Unit balls: L1 and L2 norms')],
    slideNote: R`Rows 1 and 2 are the slide. Rows 3 to 6 write out the 2D pictures and add a worked example.`,
    pre: [
      text(R`$\mathbf w$ contains $D$ coefficients. $j$ indexes them.`),
      text(R`Boundary: norm $=1$. Unit ball: norm $\le1$.`),
      lab(R`Figure, left: a diamond in the $(w_1,w_2)$ plane through $(1,0)$, $(0,1)$, $(-1,0)$, $(0,-1)$; the orange path from $\mathbf 0$ to a point $\mathbf w$ on its edge goes horizontally then vertically. Right: a circle of radius 1; the orange path is a straight line.`),
    ],
    rows: [
      {
        eq: R`\lVert\mathbf w\rVert_1=\sum_{j=1}^{D}|w_j|`,
        notes: [term('L1: Manhattan distance'), tag(['I50'], 'horizontal + vertical distance'), text('Horizontal + vertical distance equals 1 on the boundary.')],
      },
      {
        eq: R`\lVert\mathbf w\rVert_2=\Big(\sum_{j=1}^{D}w_j^2\Big)^{1/2}`,
        notes: [term('L2: Euclidean distance'), tag(['I51'], 'straight-line length (Pythagoras)'), text('Straight-line distance equals 1 on the boundary.')],
      },
      {
        eq: R`D=2:\quad |w_1|+|w_2|\le1`,
        notes: [
          lab(R`L1 unit ball: a diamond (a square turned $45^\circ$)`),
          lab(R`its 4 corners $(\pm1,0)$, $(0,\pm1)$ lie on the axes: at a corner one coordinate is exactly $0$`),
        ],
      },
      {
        eq: R`D=2:\quad w_1^2+w_2^2\le1`,
        notes: [lab('L2 unit ball: a disc of radius 1, round everywhere, no corners'), tag(['I1'], R`$w_1^2+w_2^2=\mathbf w^\top\mathbf w=\lVert\mathbf w\rVert_2^2\le1$, the same as $\lVert\mathbf w\rVert_2\le1$`)],
      },
      {
        eq: R`\mathbf w=\begin{bmatrix}0.5\\0.5\end{bmatrix}:\quad \lVert\mathbf w\rVert_1=1,\quad \lVert\mathbf w\rVert_2=\sqrt{0.5}\approx0.71`,
        notes: [ex(R`on the boundary of the diamond, but strictly inside the disc`), shape(R`\mathbf w:\ 2\times1`)],
      },
      {
        eq: R`\lVert\mathbf w\rVert_1\le r\ \ \text{or}\ \ \lVert\mathbf w\rVert_2\le r`,
        notes: [lab(R`a ball of radius $r$ is the unit ball scaled by $r$: same shape, corners at $(\pm r,0)$, $(0,\pm r)$ for L1`)],
      },
    ],
  },
  {
    id: 'l2-geometry',
    title: 'L2 geometry: projection onto a ball',
    why: R`Projecting means moving a point to the nearest point of the ball. Seeing where outside points land on the round L2 ball shows why ridge keeps coefficients nonzero: the point is just scaled down towards the centre, so no coordinate becomes zero unless it already was.`,
    slides: [slide('II', 36, 'L2 geometry: projection onto a ball')],
    slideNote: R`The projection formula (row 1), the example (row 2) and the callout linking projection to regression are added; the slide is a figure with one sentence.`,
    pre: [
      lab(R`Figure: grey disc, the $\ell_2$-ball $\lVert\boldsymbol\alpha\rVert_2\le\mu$. Three rays of outside points: red along the $\boldsymbol\alpha[2]$ axis, blue on a diagonal, green along the $\boldsymbol\alpha[1]$ axis. Each dot marks where that ray lands on the ball.`),
      text(R`The $\ell_2$-norm is isotropic: it looks the same in every direction, so the ball has no preferred points.`),
      text('The nearest point usually has several nonzero coordinates.'),
    ],
    rows: [
      {
        eq: R`\Pi(\mathbf v)=\mu\,\frac{\mathbf v}{\lVert\mathbf v\rVert_2}\qquad(\lVert\mathbf v\rVert_2>\mu)`,
        notes: [
          tag(['I54'], 'nearest point: go straight towards the centre until you hit the circle'),
          shape(R`\mathbf v:\ D\times1,\quad \frac{\mu}{\lVert\mathbf v\rVert_2}:\ 1\times1,\quad \Pi(\mathbf v):\ D\times1`),
        ],
      },
      {
        eq: R`\mathbf v=\begin{bmatrix}3\\4\end{bmatrix},\ \mu=1:\quad \lVert\mathbf v\rVert_2=5,\quad \Pi(\mathbf v)=\begin{bmatrix}0.6\\0.8\end{bmatrix}`,
        notes: [ex('both coordinates are shrunk, neither becomes zero')],
      },
    ],
    callouts: [
      {
        heading: 'Why projection is about regression',
        flag: 'I55',
        text: R`Added link, not on the slide. When $X^\top X=I$, the RSS is the squared distance from $\mathbf w$ to the least-squares solution, so the constrained fit is exactly the projection of $\hat{\mathbf w}_{\text{LS}}$ onto the ball. For a general $X$ the contours of the RSS are ellipses instead of circles, and the solution is where the smallest contour touches the ball.`,
        eq: R`\lVert\mathbf y-X\mathbf w\rVert_2^2=\lVert\mathbf w-\hat{\mathbf w}_{\text{LS}}\rVert_2^2+\text{const}`,
      },
    ],
  },
  {
    id: 'l1-geometry',
    title: 'L1 geometry: projection onto corners',
    why: R`Doing the same with the diamond-shaped L1 ball shows the key effect: a whole wedge of outside points lands exactly on a corner, and at a corner one coordinate is zero. So the L1 constraint produces exact zeros for a wide range of inputs, not just for special ones.`,
    slides: [slide('II', 37, 'L1 geometry: projection onto corners')],
    slideNote: R`Rows 2 and 3 are worked examples added here; the slide is a figure with one sentence.`,
    pre: [
      lab(R`Figure: grey diamond, the $\ell_1$-ball $\lVert\boldsymbol\alpha\rVert_1\le\mu$. Pink wedge above the top corner: every point in it projects onto the corner $(0,\mu)$. Green wedge to the right of the right corner: every point projects onto $(\mu,0)$. Blue ray between the wedges: those points land on the flat edge.`),
      lab(R`Each wedge is bounded by the two lines from the corner at right angles to the two edges that meet there (at $45^\circ$).`),
      text('Many observations project onto a corner, where one coordinate is zero.'),
    ],
    rows: [
      {
        eq: R`\text{corners: }(\pm\mu,0),\ (0,\pm\mu)`,
        notes: [
          lab(R`pink wedge lands on $(0,\mu)$: $\boldsymbol\alpha[1]=0$; green wedge lands on $(\mu,0)$: $\boldsymbol\alpha[2]=0$`),
          lab('blue: lands on an edge, both coordinates nonzero'),
        ],
      },
      {
        eq: R`\mathbf v=\begin{bmatrix}3\\0.5\end{bmatrix},\ \mu=1:\quad \Pi_{\ell_1}(\mathbf v)=\begin{bmatrix}1\\0\end{bmatrix},\qquad \Pi_{\ell_2}(\mathbf v)\approx\begin{bmatrix}0.99\\0.16\end{bmatrix}`,
        notes: [
          ex(R`$\mathbf v$ is in the green wedge, so the L1 projection is the corner: the second coordinate becomes exactly $0$`),
          lab(R`the L2 projection (I54) only shrinks it: still nonzero`),
          shape(R`\mathbf v:\ 2\times1`),
        ],
      },
      {
        eq: R`\mathbf v=\begin{bmatrix}1\\0.8\end{bmatrix},\ \mu=1:\quad \Pi_{\ell_1}(\mathbf v)=\begin{bmatrix}0.6\\0.4\end{bmatrix}`,
        notes: [ex(R`between the wedges (like the blue ray): it lands on the edge $w_1+w_2=1$, both coordinates nonzero`)],
      },
    ],
    callouts: [
      {
        heading: 'In more dimensions',
        text: R`With $D$ coefficients the L1 ball has $2D$ corners, each on an axis, so at a corner $D-1$ coordinates are zero. For $D\ge3$ its edges also lie where at least one coordinate is zero; only the largest flat faces have every coordinate nonzero. Landing on a corner or an edge gives a sparse $\mathbf w$; the round L2 ball has no such special places.`,
      },
    ],
  },
  {
    id: 'sparsity',
    title: 'Sparsity and interpretability',
    why: R`Zeros are useful, not just tidy. A model with few nonzero coefficients is easier to read: you can say which features it actually uses. The same idea is used today to make the inside of large neural networks easier to interpret.`,
    slides: [slide('II', 38, 'L1 norms: favors sparsity and interpretabiltiy')],
    slideNote: R`Figure only. The rows are a summary added here comparing ridge and LASSO.`,
    pre: [
      term('Sparsity'),
      lab(R`a vector is sparse when most of its entries are exactly $0$`),
      lab(R`Left: the LASSO coefficient paths from slides 31 and 32.`),
      lab(R`Right: a sparse autoencoder. Input, then an encoder, then a long vector of "SAE activations" in which only a few entries are shaded (active) and the rest are blank, then a decoder that produces an output of the same size as the input.`),
      text(R`Cited: "Sparse Autoencoders Find Highly Interpretable Features in Language Models", arXiv 2309.08600.`),
      lab(R`Reading of the slide: as with LASSO, an L1 penalty keeps most activations at zero, and a representation that uses few active entries is easier to interpret.`),
    ],
    rows: [
      {
        eq: R`\text{ridge: }\lambda\lVert\mathbf w\rVert_2^2\ \Rightarrow\ \hat{\mathbf w}=(X^\top X+\lambda I)^{-1}X^\top\mathbf y`,
        notes: [
          lab('shrinks all coefficients towards zero; usually none exactly zero; closed form (I 56)'),
          shape(R`\hat{\mathbf w}:\ (D\times D)(D\times N)(N\times1)=D\times1`),
        ],
      },
      {
        eq: R`\text{LASSO: }\lambda\lVert\mathbf w\rVert_1`,
        notes: [lab(R`shrinks, and sets some coefficients exactly to zero: feature selection; no closed form in general (except special cases such as $X^\top X=I$)`), term('Least absolute shrinkage and selection operator')],
      },
    ],
  },
];

export const lasso: Topic = {
  id: 'lasso',
  title: 'L1 regularisation and LASSO',
  short: 'LASSO',
  summary: R`LASSO replaces the ridge penalty $\lambda\lVert\mathbf w\rVert_2^2$ with the L1 penalty $\lambda\lVert\mathbf w\rVert_1$. The diamond-shaped L1 ball has corners on the axes, so the solution often has coefficients that are exactly zero: LASSO selects features and gives sparse, interpretable models.`,
  identities,
  sections,
};
