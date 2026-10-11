import { R, con, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I13',
    area: 'Linear algebra',
    tex: R`\langle\mathbf w,\mathbf x\rangle=\mathbf w^\top\mathbf x=\mathbf x^\top\mathbf w`,
    note: R`Angle brackets are another name for the inner (dot) product. Both vectors must have the same length, $D\times1$; the result is a scalar, so the order does not matter. Written out as a sum it is I12.`,
  },
  {
    id: 'I15',
    area: 'Algebra & calculus',
    tex: R`\frac{\partial}{\partial w}\,g\big(\epsilon(w)\big)=g'(\epsilon)\,\frac{\partial\epsilon}{\partial w},\qquad \frac{\partial}{\partial w}\,\epsilon^2=2\epsilon\,\frac{\partial\epsilon}{\partial w}`,
    note: R`Chain rule for scalars: differentiate the outer function at the inner value, then multiply by the derivative of the inner function. All quantities are $1\times1$.`,
  },
  {
    id: 'I16',
    area: 'Algebra & calculus',
    tex: R`\sum_{i=1}^{N}c\,a_i=c\sum_{i=1}^{N}a_i,\qquad \sum_{i=1}^{N}c=Nc,\qquad \sum_{i=1}^{N}(a_i+b_i)=\sum_{i=1}^{N}a_i+\sum_{i=1}^{N}b_i`,
    note: R`Holds when $c$ does not depend on the index $i$. A sum of the same constant $N$ times is $N$ times that constant.`,
  },
  {
    id: 'I14',
    area: 'Optimisation',
    tex: R`\hat{\mathbf w}\ \text{minimises a differentiable}\ L\ \Rightarrow\ \nabla_{\mathbf w}L(\hat{\mathbf w})=\mathbf 0`,
    note: R`First-order (stationary) condition. The zero vector has the shape of $\mathbf w$. The converse needs convexity (see I7): for a convex $L$, a point with zero gradient is a global minimum. In one variable, a positive second derivative at the flat point confirms a local minimum (global if $L$ is convex).`,
  },
  {
    id: 'I17',
    area: 'Linear algebra',
    tex: R`(X^\top X)_{jk}=\sum_{i=1}^{N}X_{ij}X_{ik},\qquad (X^\top\mathbf y)_j=\sum_{i=1}^{N}X_{ij}\,y_i`,
    note: R`Entry $(j,k)$ of $X^\top X$ is column $j$ of $X$ dotted with column $k$. For $X$ of shape $N\times M$: $X^\top X$ is $M\times M$ and $X^\top\mathbf y$ is $M\times1$.`,
  },
  {
    id: 'C3',
    area: 'Conventions',
    tex: R`\hat{\mathbf w}\in\arg\min_{\mathbf w}L(\mathbf w)`,
    note: R`$\arg\min$ is the set of minimisers, hence $\in$: there may be more than one. The hat marks an estimate fitted from data.`,
  },
  {
    id: 'C4',
    area: 'Conventions',
    tex: R`\nabla L(\mathbf w)=\begin{bmatrix}\partial L/\partial w_1\\ \vdots\\ \partial L/\partial w_M\end{bmatrix}`,
    note: R`The gradient stacks one partial derivative per coefficient, so it is a column vector with the shape of $\mathbf w$ (C1). Each $\partial$ differentiates one coefficient and holds the others fixed.`,
  },
];

const system2x2 = R`
\underbrace{\begin{bmatrix} N & \sum_i x_i\\ \sum_i x_i & \sum_i x_i^2 \end{bmatrix}}_{\htmlClass{c-green}{2\times 2}}
\underbrace{\begin{bmatrix} w_0\\ w_1 \end{bmatrix}}_{\htmlClass{c-green}{2\times 1}}
=
\underbrace{\begin{bmatrix} \sum_i y_i\\ \sum_i x_iy_i \end{bmatrix}}_{\htmlClass{c-green}{2\times 1}}`;

const sections: Section[] = [
  {
    id: 'predictor',
    title: 'Inputs, parameters and predictions',
    why: R`Before fitting anything we need names for the three ingredients: what goes in ($\mathbf x$), what we tune ($\mathbf w$) and what comes out ($\hat y$). Knowing whether each is a scalar or a vector, and how long, is what makes every later shape check possible.`,
    slides: [
      slide('I', 29, 'Inputs, parameters and predictions'),
      slide('I', 30, 'Representing the input'),
      slide('I', 31, 'Parameterising the predictor'),
    ],
    slideNote: R`The three slides share one labelled equation. Slide 29 shows the labels unhighlighted; slide 30 highlights Input; slide 31 highlights parameters and adds $f(\mathbf x;\mathbf w)$.`,
    pre: [
      text('A parametric model stores a fixed-size parameter vector. Prediction evaluates the fitted function without retrieving the training examples.'),
      lab('A hat marks an estimate. Bold letters are vectors.'),
    ],
    rows: [
      {
        eq: R`\hat y=f_{\mathbf w}(\mathbf x)=f(\mathbf x;\mathbf w)`,
        notes: [
          lab(R`$\hat y$: prediction. $f$: the method (prediction function). $\mathbf w$: parameters. $\mathbf x$: input`),
          lab(R`the semicolon separates inputs (left) from parameters (right)`),
          shape(R`\hat y:\ 1\times1\ \text{(scalar)}`),
        ],
      },
      {
        eq: R`x\in\mathbb R\qquad\text{or}\qquad\mathbf x\in\mathbb R^{D}`,
        notes: [
          lab(R`scalar input, or vector input with $D$ coordinates; $\mathbb R$ is the real numbers`),
          shape(R`x:\ 1\times1,\qquad \mathbf x:\ D\times1`),
          text('Inputs can also be discrete: strings, trees or graphs.'),
        ],
      },
      {
        eq: R`w\in\mathbb R\qquad\text{or}\qquad\mathbf w\in\mathbb R^{M}`,
        notes: [
          lab(R`$M$ is the number of coefficients`),
          shape(R`\mathbf w:\ M\times1`),
          warn(R`$M$ (number of coefficients) need not equal $D$ (number of input coordinates)`),
        ],
      },
    ],
  },
  {
    id: 'linear',
    title: 'The linear predictor',
    why: R`Linear regression picks the simplest possible $f$: multiply each input coordinate by a weight and add up. Writing this sum as $\mathbf w^\top\mathbf x$ turns it into a matrix product, which is what lets us later stack all $N$ examples into one equation.`,
    slides: [slide('I', 32, 'Linear regression: a linear predictor')],
    rows: [
      {
        eq: R`\hat y=f_{\mathbf w}(\mathbf x)=f(\mathbf x;\mathbf w)=\mathbf w^\top\mathbf x`,
        notes: [
          term('Linear predictor'),
          shape(R`\mathbf w^\top\mathbf x:\ (1\times D)(D\times1)=1\times1`),
        ],
      },
      {
        eq: R`\mathbf w^\top\mathbf x=\langle\mathbf w,\mathbf x\rangle=\sum_{j=1}^{D}w_jx_j`,
        notes: [
          tag(['I13', 'I12'], 'inner product, transpose product and sum over coordinates are the same number'),
          lab(R`$j$ indexes input coordinates, $j=1,\dots,D$`),
          shape(R`\mathbf x\in\mathbb R^D,\ \mathbf w\in\mathbb R^D:\ \text{both }D\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Where is the intercept?',
        text: R`On this slide $\mathbf w$ and $\mathbf x$ both have $D$ entries, so there is no constant term. From slide 34 on the model gets an intercept $w_0$; slide 39 puts it back inside $\mathbf w^\top\mathbf x$ by giving every input an extra coordinate equal to 1.`,
      },
    ],
  },
  {
    id: 'data',
    title: 'Fitting to data',
    why: R`A model only becomes useful once its weights are chosen from examples. This fixes what "the data" means, $N$ input and target pairs, so that "fitting" can be turned into a precise optimisation problem next.`,
    slides: [slide('I', 33, 'Fitting a model to data')],
    rows: [
      {
        eq: R`\mathcal D=\{(\mathbf x_i,y_i)\}_{i=1}^{N}`,
        notes: [
          lab(R`$N$ input and target pairs; $i$ indexes the training pair`),
          shape(R`\mathbf x_i:\ D\times1,\qquad y_i:\ 1\times1`),
          warn(R`curly $\mathcal D$ is the dataset; plain $D$ is the number of input coordinates`),
        ],
      },
      {
        eq: R`\hat y_i=f_{\mathbf w}(\mathbf x_i)\approx y_i`,
        notes: [lab(R`choose $\mathbf w$ so the predictions are close to the observed targets`)],
      },
    ],
  },
  {
    id: 'line',
    title: 'A line in 1D and its residuals',
    why: R`With one scalar input the model is a straight line, so we can see the fitting problem in a picture. The residuals, the vertical gaps between points and line, are the errors we will add up to judge a line.`,
    slides: [slide('I', 34, 'Linear regression in 1D')],
    slideNote: R`Row 2 is added: it writes the line as an inner product, which slide 39 uses to build $X$. The figure shows four red data points, a blue fitted line, and green vertical segments for the residuals.`,
    rows: [
      {
        eq: R`\hat y_i=w_0+w_1x_i`,
        notes: [
          lab(R`$w_0$: intercept. $w_1$: slope. $x_i$: scalar input of pair $i$, $y_i$: its target`),
          shape(R`\text{all terms }1\times1`),
        ],
      },
      {
        eq: R`\hat y_i=\begin{bmatrix}w_0 & w_1\end{bmatrix}\begin{bmatrix}\htmlClass{c-red}{1}\\ x_i\end{bmatrix}=\mathbf w^\top\begin{bmatrix}\htmlClass{c-red}{1}\\ x_i\end{bmatrix}`,
        notes: [
          tag(['I12'], R`the line is a dot product once the input gets a leading 1`),
          shape(R`(1\times2)(2\times1)=1\times1,\qquad \mathbf w=\begin{bmatrix}w_0\\ w_1\end{bmatrix}:\ 2\times1`),
          warn(R`the 1 multiplies $w_0$: this becomes the column of 1s in $X$`),
        ],
      },
      {
        eq: R`\epsilon_i=y_i-\hat y_i=y_i-(w_0+w_1x_i)`,
        notes: [
          term('Residual'),
          lab(R`signed vertical difference between target and prediction: positive when the point is above the line`),
          shape(R`\epsilon_i:\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'rss',
    circ: 1,
    title: 'Least squares criterion',
    why: R`To choose the best line we need one number that says how bad a given $\mathbf w$ is. Squaring the residuals makes every error count positively and punishes big misses most; adding them gives a loss whose minimiser is the least-squares fit.`,
    slides: [slide('I', 35, 'Least squares criterion')],
    rows: [
      {
        eq: R`L(\mathbf w)=\sum_{i=1}^{N}\epsilon_i^2=\sum_{i=1}^{N}(y_i-w_0-w_1x_i)^2`,
        notes: [
          term('Residual sum of squares (RSS)'),
          lab(R`substitute $\epsilon_i$ from slide 34; RSS measures training fit`),
          shape(R`L:\ \mathbb R^2\to\mathbb R,\qquad L(\mathbf w):\ 1\times1`),
        ],
      },
      {
        eq: R`\hat{\mathbf w}\in\arg\min_{\mathbf w}L(\mathbf w)`,
        notes: [
          term('Least squares'),
          tag(['C3'], R`$\arg\min$ returns the minimising $\mathbf w$ (a set, hence $\in$); the hat marks the fitted parameters`),
          shape(R`\hat{\mathbf w}:\ 2\times1`),
        ],
      },
    ],
  },
  {
    id: 'gradient-opt',
    title: 'Gradient-based optimisation',
    why: R`We cannot try every $\mathbf w$. The gradient tells us which way the loss goes up, and at the lowest point it is zero in every direction. So "find the minimum" becomes "solve gradient $=0$", which is just algebra.`,
    slides: [slide('I', 36, 'Gradient-based optimization')],
    slideNote: R`The slide uses two generic coefficients $w_1,w_2$ for the axes. Its three panels show the same bowl-shaped $L(\mathbf w)$ as a surface, as contour lines (nested ellipses), and as a field of gradient arrows that point away from the red minimum.`,
    rows: [
      {
        eq: R`L(\mathbf w)=c`,
        notes: [lab(R`isocontour: all $\mathbf w$ with the same loss value $c$`)],
      },
      {
        eq: R`\nabla L(\mathbf w)=\begin{bmatrix}\dfrac{\partial L}{\partial w_1}\\[6pt] \dfrac{\partial L}{\partial w_2}\end{bmatrix}`,
        notes: [
          tag(['C4', 'C1'], 'one partial derivative per coefficient, stacked as a column'),
          lab('gradient field: each arrow points uphill'),
          shape(R`\nabla L(\mathbf w):\ 2\times1,\ \text{same shape as }\mathbf w`),
        ],
      },
      {
        eq: R`\text{at the minimum:}\quad\nabla L(\mathbf w)=\mathbf 0`,
        notes: [
          tag(['I14'], 'first-order condition: no direction goes downhill'),
          shape(R`\mathbf 0:\ 2\times1`),
        ],
      },
    ],
  },
  {
    id: 'residual-derivs',
    circ: 2,
    title: 'Differentiating through the residual',
    why: R`$L$ depends on $w_0$ and $w_1$ only through the residuals. Differentiating each residual first (trivial: it is linear) and then using the chain rule gives both partial derivatives of $L$ without expanding any squares.`,
    slides: [slide('I', 37, 'Differentiating through the residual')],
    slideNote: R`Row 3 (derivative of a sum) is added. Rows 6 and 7 are added: the slide works only $w_0$, and the $w_1$ result appears on slide 38.`,
    rows: [
      {
        eq: R`L(\mathbf w)=\sum_{i=1}^{N}\epsilon_i^2,\qquad \epsilon_i=y_i-w_0-w_1x_i`,
        notes: [lab(R`$L$ is RSS; $\epsilon_i$ is residual $i$`), shape(R`\text{all }1\times1`)],
      },
      {
        eq: R`\frac{\partial\epsilon_i}{\partial w_0}=-1,\qquad \frac{\partial\epsilon_i}{\partial w_1}=-x_i`,
        notes: [
          con(R`$y_i$ and $x_i$ are data: constants with respect to $\mathbf w$, so they differentiate to 0 or stay as factors`),
          lab(R`$\partial$ differentiates one coefficient, holding the other fixed`),
        ],
      },
      {
        eq: R`\frac{\partial L}{\partial w_0}=\sum_{i=1}^{N}\frac{\partial(\epsilon_i^2)}{\partial w_0}`,
        notes: [tag(['I8'], 'derivative of a sum is the sum of the derivatives')],
      },
      {
        eq: R`=\sum_{i=1}^{N}2\epsilon_i\,\frac{\partial\epsilon_i}{\partial w_0}`,
        notes: [tag(['I15'], R`chain rule: outer $\epsilon^2\to2\epsilon$, times inner derivative`)],
      },
      {
        eq: R`=-2\sum_{i=1}^{N}\epsilon_i=-2\sum_{i=1}^{N}(y_i-w_0-w_1x_i)`,
        notes: [
          lab(R`substitute $\partial\epsilon_i/\partial w_0=-1$`),
          tag(['I16'], R`the constant $-2$ comes out of the sum`),
          shape(R`1\times1`),
        ],
      },
      {
        eq: R`\frac{\partial L}{\partial w_1}=\sum_{i=1}^{N}2\epsilon_i\,\frac{\partial\epsilon_i}{\partial w_1}=\sum_{i=1}^{N}2\epsilon_i(-x_i)`,
        notes: [tag(['I8', 'I15'], R`same two steps for $w_1$; now the inner derivative is $-x_i$`)],
      },
      {
        eq: R`=-2\sum_{i=1}^{N}x_i(y_i-w_0-w_1x_i)`,
        notes: [
          tag(['I16'], R`$-2$ comes out; $x_i$ depends on $i$ so it stays inside`),
          warn(R`$x_i$ cannot leave the sum: it changes with $i$`),
        ],
      },
    ],
  },
  {
    id: 'stationary',
    circ: 3,
    title: 'Stationary conditions',
    why: R`At the best line both partial derivatives are zero at once. That gives two equations in the two unknowns $w_0,w_1$, exactly enough to pin them down.`,
    slides: [slide('I', 38, 'Fitting a line: stationary conditions')],
    rows: [
      {
        eq: R`\frac{\partial L}{\partial w_0}=-2\sum_{i=1}^{N}(y_i-w_0-w_1x_i)=0`,
        notes: [tag(['I14'], 'set the partial derivative to zero'), lab('equation (a)')],
      },
      {
        eq: R`\frac{\partial L}{\partial w_1}=-2\sum_{i=1}^{N}x_i(y_i-w_0-w_1x_i)=0`,
        notes: [tag(['I14'], 'set the partial derivative to zero'), lab('equation (b)')],
      },
    ],
  },
  {
    id: 'rearrange',
    circ: 4,
    title: 'Rearrange',
    why: R`The conditions are tangled sums. Splitting them and pulling the unknowns out front shows they are just two linear equations in $w_0$ and $w_1$, whose coefficients are sums we can compute from the data.`,
    slides: [slide('I', 38, 'Fitting a line: stationary conditions')],
    slideNote: 'Rows 1 and 3 are added to show the steps; rows 2 and 4 are the slide.',
    rows: [
      {
        eq: R`\text{(a)}\div(-2):\quad\sum_i y_i-\sum_i w_0-\sum_i w_1x_i=0\ \Rightarrow\ \sum_i y_i-Nw_0-w_1\sum_i x_i=0`,
        notes: [
          ex('divide by $-2$, which is allowed because $-2$ is not zero'),
          tag(['I16'], R`split the sum; $\sum_{i=1}^N w_0=Nw_0$; $w_1$ comes out`),
          con(R`$w_0,w_1$ do not depend on $i$: constants inside the sum`),
        ],
      },
      {
        eq: R`Nw_0+w_1\sum_i x_i=\sum_i y_i`,
        notes: [ex('move the unknowns to the left')],
      },
      {
        eq: R`\text{(b)}\div(-2):\quad\sum_i x_iy_i-w_0\sum_i x_i-w_1\sum_i x_i^2=0`,
        notes: [tag(['I16'], R`multiply $x_i$ into the bracket, split, pull out $w_0$ and $w_1$`)],
      },
      {
        eq: R`w_0\sum_i x_i+w_1\sum_i x_i^2=\sum_i x_iy_i`,
        notes: [ex('move the unknowns to the left'), shape(R`\text{both equations: }1\times1`)],
      },
    ],
  },
  {
    id: 'system',
    circ: 5,
    title: 'The 2 by 2 linear system',
    why: R`Two linear equations in two unknowns are one matrix equation. Writing them this way shows the pattern (data matrix times weights equals data vector) that the next step recognises as $X^\top X\mathbf w=X^\top\mathbf y$.`,
    slides: [slide('I', 38, 'Fitting a line: stationary conditions')],
    display: system2x2,
    rows: [
      {
        eq: R`\text{row 1: }\ N\,w_0+\Big(\sum_i x_i\Big)w_1=\sum_i y_i`,
        notes: [lab('multiply out row 1: it is equation (a) rearranged')],
      },
      {
        eq: R`\text{row 2: }\ \Big(\sum_i x_i\Big)w_0+\Big(\sum_i x_i^2\Big)w_1=\sum_i x_iy_i`,
        notes: [lab('row 2 is equation (b) rearranged')],
      },
    ],
    callouts: [
      {
        heading: 'Notice',
        text: R`The $2\times2$ matrix is symmetric: the off-diagonal entries are both $\sum_i x_i$. That is a first sign it is $X^\top X$ (symmetric by I2).`,
      },
    ],
  },
  {
    id: 'matrix-form',
    circ: 6,
    title: 'Matrix form of the normal equations',
    why: R`Building $X$ with a column of 1s and a column of inputs turns the $2\times2$ system into $X^\top X\mathbf w=X^\top\mathbf y$. That form does not care how many columns $X$ has, so the same formula works for any number of inputs.`,
    slides: [slide('I', 39, 'Matrix form of the normal equations')],
    slideNote: R`Rows 2 and 3 are added: they multiply out $X^\top X$ and $X^\top\mathbf y$ to show they are the matrix and right-hand side of slide 38. The slide writes row 4 as $X^\top\mathbf y=X^\top X\mathbf w$. The slide attaches the label "Normal Equation" to the boxed $\hat{\mathbf w}$ (row 5).`,
    rows: [
      {
        eq: R`\mathbf y=\begin{bmatrix}y_1\\ \vdots\\ y_N\end{bmatrix},\qquad X=\begin{bmatrix}\htmlClass{c-red}{1} & x_1\\ \vdots & \vdots\\ \htmlClass{c-red}{1} & x_N\end{bmatrix}`,
        notes: [
          term('Design matrix'),
          lab(R`row $i$ of $X$ is $[\,1\ \ x_i\,]$, the input with its leading 1 (slide 34, row 2)`),
          shape(R`\mathbf y:\ N\times1,\qquad X:\ N\times2`),
        ],
      },
      {
        eq: R`X^\top X=\begin{bmatrix}\sum_i 1\cdot1 & \sum_i 1\cdot x_i\\ \sum_i x_i\cdot1 & \sum_i x_i\cdot x_i\end{bmatrix}=\begin{bmatrix}N & \sum_i x_i\\ \sum_i x_i & \sum_i x_i^2\end{bmatrix}`,
        notes: [
          tag(['I17'], R`entry $(j,k)$ is column $j$ of $X$ dotted with column $k$`),
          tag(['I16'], R`$\sum_{i=1}^N 1=N$`),
          shape(R`X^\top X:\ (2\times N)(N\times2)=2\times2`),
        ],
      },
      {
        eq: R`X^\top\mathbf y=\begin{bmatrix}\sum_i 1\cdot y_i\\ \sum_i x_i\,y_i\end{bmatrix}=\begin{bmatrix}\sum_i y_i\\ \sum_i x_iy_i\end{bmatrix}`,
        notes: [
          tag(['I17'], R`entry $j$ is column $j$ of $X$ dotted with $\mathbf y$`),
          shape(R`X^\top\mathbf y:\ (2\times N)(N\times1)=2\times1`),
        ],
      },
      {
        eq: R`X^\top X\,\mathbf w=X^\top\mathbf y`,
        notes: [
          term('Normal Equation'),
          lab(R`rows 2 and 3 are exactly the matrix and right-hand side of the $2\times2$ system`),
          shape(R`(2\times2)(2\times1)=2\times1`),
        ],
      },
      {
        eq: R`\hat{\mathbf w}=(X^\top X)^{-1}X^\top\mathbf y`,
        notes: [
          tag(['I6'], R`multiply on the LEFT by $(X^\top X)^{-1}$; it exists when $X$ has full column rank (here $D+1=2$)`),
          ex(R`here full column rank means the inputs $x_i$ are not all equal, so the two columns are independent`),
          shape(R`(2\times2)(2\times N)(N\times1)=2\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Exam trap',
        flag: 'I17',
        text: R`$X^\top X$ and $XX^\top$ are different matrices. $X^\top X$ is $2\times2$ (columns dotted with columns); $XX^\top$ is $N\times N$ (rows dotted with rows). The normal equation uses $X^\top X$.`,
        eq: R`X^\top X:\ (2\times N)(N\times2)=2\times2,\qquad XX^\top:\ (N\times2)(2\times N)=N\times N`,
      },
    ],
  },
];

export const leastSquares1d: Topic = {
  id: 'least-squares-1d',
  title: 'Linear regression and least squares',
  short: 'LS 1D',
  summary: R`The linear predictor $\hat y=\mathbf w^\top\mathbf x$, and fitting a line $w_0+w_1x$ by least squares: differentiate the RSS through the residuals, set both partial derivatives to zero, and solve the resulting $2\times2$ system, which is the normal equation $X^\top X\mathbf w=X^\top\mathbf y$.`,
  identities,
  sections,
};
