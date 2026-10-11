import { R, con, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I9',
    area: 'Algebra & calculus',
    tex: R`\alpha_i=\frac{a_i}{\sum_{j=1}^{N}a_j},\ \ a_i\ge0\ \Rightarrow\ \alpha_i\ge0,\ \ \sum_{i=1}^{N}\alpha_i=1`,
    note: R`Normalised weights sum to one: dividing $N$ non-negative numbers by their total gives weights like probabilities. Needs the total $\sum_j a_j>0$. A sum $\sum_i\alpha_i y_i$ with such weights is a weighted average, so it lies between $\min_i y_i$ and $\max_i y_i$.`,
  },
  {
    id: 'I10',
    area: 'Algebra & calculus',
    tex: R`e^{a}>0\ \text{for every real }a,\qquad e^{0}=1,\qquad a<b\ \Rightarrow\ e^{a}<e^{b}`,
    note: R`The exponential is always positive, equals 1 at 0 and is increasing. So $\exp(-\text{something}\ge0)$ lies in $(0,1]$, with its largest value 1 when the something is 0.`,
  },
  {
    id: 'I11',
    area: 'Algebra & calculus',
    tex: R`\frac{c\,a_i}{\sum_{j=1}^{N}c\,a_j}=\frac{a_i}{\sum_{j=1}^{N}a_j}\quad(c\ne0)`,
    note: R`A constant factor $c$ that multiplies every term cancels between the numerator and the denominator. So normalised weights do not change if every $a_i$ is scaled by the same $c$.`,
  },
  {
    id: 'I12',
    area: 'Linear algebra',
    tex: R`\sum_{i=1}^{N}a_i b_i=\mathbf a^\top\mathbf b`,
    note: R`A weighted sum is a dot product. $\mathbf a$ and $\mathbf b$ are both $N\times1$, so $\mathbf a^\top\mathbf b$ is $(1\times N)(N\times1)=1\times1$.`,
  },
  {
    id: 'C2',
    area: 'Conventions',
    tex: R`\sum_{j=1}^{N}a_j=\sum_{i=1}^{N}a_i`,
    note: R`The summation index is a dummy: renaming it does not change the sum. A different letter ($j$) is used in a denominator so that it does not clash with the $i$ that is fixed outside.`,
  },
];

const sections: Section[] = [
  {
    id: 'setup',
    title: 'Regression setup',
    why: 'We have seen pairs of inputs and targets and must predict the target for an input we have not seen. Every regression method in the course answers this one question, starting with the simplest: average nearby targets.',
    slides: [slide('I', 23, 'Regression: a new input, an unknown target')],
    slideNote: R`Left figure: training data as dots, labelled $\{(x_i,y_i)\}_{i=1}^N$. Right figure: an empty plot with a dotted vertical line at the query $x'$ and a blue marker with a question mark.`,
    pre: [
      text('We observe input–target pairs. What should we predict for a new input?'),
      lab(R`$X$ and $Y$ label the input and target axes. $x'$ is a new input.`),
      warn(R`The target of $x'$ is unknown. The blue marker's height is only a placeholder.`),
    ],
    rows: [
      {
        eq: R`\mathcal D=\{(x_i,y_i)\}_{i=1}^{N}`,
        notes: [
          term('Training data'),
          lab(R`$N$ stored pairs; example $i$ has input $x_i$ and target $y_i$`),
          shape(R`x_i:\ 1\times1\ \text{(1D input here)},\quad y_i:\ 1\times1`),
        ],
      },
      {
        eq: R`x'\ \longmapsto\ \hat y(x')=\ ?`,
        notes: [
          term('Test query'),
          lab('a prediction for an input that is not in the training data'),
          shape(R`x',\ \hat y(x'):\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'knn',
    circ: 1,
    title: 'k-nearest-neighbour average',
    why: 'The simplest guess for a new input is to look at the stored inputs closest to it and average their targets. This needs no fitting at all, and it sets up the weighted-average form that kernel regression generalises.',
    slides: [slide('I', 24, 'Non-parametric regression: local averaging')],
    slideNote: R`The slide states the rule in words. Rows 1 and 2 write it as formulas; the neighbour set $\mathcal N_k(x)$ is added notation. Figure: a staircase prediction curve, and a lower panel with three bars of height 1/3.`,
    pre: [
      text(R`$k=3$: average the targets of the three nearest stored inputs.`),
      lab('Grey: observations. Blue: prediction curve. Red: prediction at the query.'),
      lab('The slide links an interactive demo to open in a browser.'),
    ],
    rows: [
      {
        eq: R`\hat y(x)=\frac{1}{k}\sum_{i\in\mathcal N_k(x)}y_i`,
        notes: [
          term('k-nearest-neighbour (k-NN) average'),
          lab(R`$\mathcal N_k(x)$: the indices of the $k$ stored inputs $x_i$ closest to the query $x$`),
          term('Non-parametric'),
          lab('the prediction is read off the stored training pairs, not from a fixed-size parameter vector'),
          shape(R`\hat y(x):\ 1\times1\ \text{(average of }k\text{ scalars)}`),
        ],
      },
      {
        eq: R`\hat y(x)=\sum_{i=1}^{N}\alpha_i(x)\,y_i,\qquad \alpha_i(x)=\begin{cases}\tfrac1k & i\in\mathcal N_k(x)\\[2pt] 0 & \text{otherwise}\end{cases}`,
        notes: [
          lab(R`same average, written as a weighted sum over all $N$ examples`),
          tag(['I9'], R`$k$ weights of $\tfrac1k$ and the rest 0: they sum to $k\cdot\tfrac1k=1$`),
          shape(R`\alpha_i(x):\ 1\times1\ \text{for each }i`),
        ],
      },
      {
        eq: R`k=3:\quad \alpha_i(x)=\tfrac13\ \text{for the three nearest}`,
        notes: [
          ex('slide 24: each neighbour has weight 1/3 (the three bars in the lower panel)'),
          lab('the prediction curve is a staircase: it only jumps when the set of nearest neighbours changes'),
        ],
      },
    ],
  },
  {
    id: 'kernel',
    circ: 2,
    title: R`Gaussian kernel and bandwidth $h$`,
    why: 'k-NN gives full weight to the $k$ nearest points and zero to the rest, so the prediction jumps. A kernel instead gives each stored input a weight that falls off smoothly with its distance from the query.',
    slides: [slide('I', 25, 'A kernel assigns weights by distance')],
    slideNote: R`Row 3 shows how the slide's value $K_h(\pm h)$ follows from the formula; row 2 (the peak value) is added. Figure: three bell curves centred at $x_i=0.6$ for $h=0.2$, $0.5$ and $1$; the larger $h$, the wider the bell.`,
    rows: [
      {
        eq: R`K_h(x-x_i)=\exp\!\left[-\frac{(x_i-x)^2}{2h^2}\right],\qquad h>0`,
        notes: [
          term('Gaussian kernel'),
          lab(R`$x$: the query. $x_i$: stored input $i$. $h>0$: the kernel width (bandwidth)`),
          lab(R`$(x_i-x)^2=(x-x_i)^2$, so only the distance between $x$ and $x_i$ matters`),
          tag(['I10'], R`exp of a number $\le0$: the kernel value lies in $(0,1]$`),
          shape(R`x,\ x_i,\ h,\ K_h:\ 1\times1`),
        ],
      },
      {
        eq: R`x=x_i:\quad K_h(0)=\exp(0)=1`,
        notes: [
          tag(['I10'], R`the peak is 1, at the centre $x=x_i$`),
          lab(R`each kernel is centred at its stored input $x_i$ (here $x_i=0.6$)`),
        ],
      },
      {
        eq: R`x-x_i=\pm h:\quad K_h(\pm h)=\exp\!\left[-\frac{h^2}{2h^2}\right]=e^{-1/2}\approx0.61`,
        notes: [
          ex(R`substitute $(x_i-x)^2=h^2$; the $h^2$ cancels`),
          lab(R`one width $h$ from the centre, the weight has dropped to about $0.61$, whatever $h$ is`),
        ],
      },
    ],
    callouts: [
      {
        heading: R`Larger $h$, wider reach`,
        flag: 'I10',
        text: R`Larger $h$ gives distant inputs more influence. A Gaussian has no hard cutoff: $K_h>0$ for every $x$, unlike k-NN, which gives exactly 0 outside the $k$ neighbours.`,
      },
      {
        heading: 'Exam trap: not a normalised density',
        flag: 'I11',
        text: R`This $K_h$ has no $\tfrac{1}{\sqrt{2\pi}\,h}$ in front, so its peak is 1, not a density value. Any such constant would cancel in the weights $\alpha_i(x)$ anyway.`,
      },
    ],
  },
  {
    id: 'weights',
    circ: 3,
    title: R`Normalised weights $\alpha_i(x)$`,
    why: 'Kernel values on their own do not sum to anything in particular. Dividing each one by their total turns them into weights that sum to one, so the prediction becomes an average of targets rather than an arbitrary sum.',
    slides: [slide('I', 26, 'Kernel regression: a weighted average'), slide('I', 27, 'Kernel regression: a weighted average')],
    slideNote: 'Row 1 is on both slides. Rows 2 to 4, the check that the weights sum to one, are added to show I9 and C2.',
    rows: [
      {
        eq: R`\alpha_i(x)=\frac{K_h(x-x_i)}{\sum_{j=1}^{N}K_h(x-x_j)}`,
        notes: [
          term('Normalised target weights'),
          lab(R`numerator: the kernel for example $i$. Denominator: the sum over all $N$ stored inputs`),
          con(R`the denominator does not depend on $i$: it is the same number for every weight at this $x$`),
          tag(['C2'], R`the denominator uses $j$ so it does not clash with the fixed $i$ on top`),
          tag(['I10'], R`every $K_h>0$, so the denominator is $>0$ and the division is safe`),
          shape(R`\alpha_i(x):\ 1\times1;\ \text{stacking all }N\text{ gives an }N\times1\text{ vector}`),
        ],
      },
      {
        eq: R`\sum_{i=1}^{N}\alpha_i(x)=\frac{\sum_{i=1}^{N}K_h(x-x_i)}{\sum_{j=1}^{N}K_h(x-x_j)}`,
        notes: [
          ex('common denominator: add the numerators over the same denominator'),
          shape(R`1\times1`),
        ],
      },
      {
        eq: R`=1`,
        notes: [
          tag(['C2'], R`top and bottom are the same sum, with the index renamed`),
        ],
      },
      {
        eq: R`\alpha_i(x)\ge0,\qquad \sum_{i=1}^{N}\alpha_i(x)=1`,
        notes: [
          tag(['I9'], 'normalised non-negative weights sum to one'),
          lab(R`the slides call these "normalised target weights"; they change with the query $x$`),
        ],
      },
    ],
  },
  {
    id: 'prediction',
    circ: 4,
    title: 'Kernel regression prediction',
    why: 'With weights that sum to one, the prediction at $x$ is a weighted average of all stored targets, with nearby targets counting most. The bandwidth $h$ then decides how many neighbours effectively take part, which controls how smooth the curve is.',
    slides: [slide('I', 26, 'Kernel regression: a weighted average'), slide('I', 27, 'Kernel regression: a weighted average')],
    slideNote: R`Row 1 is on both slides. Rows 2 and 3 are added. The two slides differ only in $h$; the readings of the weight bars are approximate. Rows 5 and 6 (the limits of $h$) are added, standard consequences of the formula.`,
    pre: [lab(R`Both slides: $N=17$. Grey: observations. Blue: prediction. Red: query.`)],
    rows: [
      {
        eq: R`\hat y(x)=\sum_{i=1}^{N}\alpha_i(x)\,y_i`,
        notes: [
          term('Kernel regression'),
          lab('a weighted average of the stored targets'),
          shape(R`\hat y(x):\ 1\times1`),
        ],
      },
      {
        eq: R`\hat y(x)=\underbrace{\boldsymbol\alpha(x)^\top}_{\htmlClass{c-green}{1\times N}}\underbrace{\mathbf y}_{\htmlClass{c-green}{N\times1}}`,
        notes: [
          tag(['I12'], R`the weighted sum is a dot product of the weight vector and the target vector`),
          shape(R`(1\times N)(N\times1)=1\times1`),
        ],
      },
      {
        eq: R`\min_i y_i\ \le\ \hat y(x)\ \le\ \max_i y_i`,
        notes: [
          tag(['I9'], 'a weighted average lies between the smallest and largest target'),
          lab('so the curve flattens out beyond the data instead of shooting off'),
        ],
      },
      {
        eq: R`h=0.12\ \text{(slide 26)}\qquad h=0.5\ \text{(slide 27)}`,
        notes: [
          ex(R`$h=0.12$: one weight is about 0.9, so the curve almost passes through each observation and is wiggly`),
          ex(R`$h=0.5$: the weight is spread mainly over about four neighbours (roughly 0.2, 0.4, 0.27, 0.07), so the curve is smoother and misses some points`),
        ],
      },
      {
        eq: R`h\to\infty:\quad K_h\to1\ \Rightarrow\ \alpha_i(x)\to\tfrac1N,\quad \hat y(x)\to\tfrac1N\sum_{i=1}^{N}y_i`,
        notes: [lab('very wide kernel: every target counts equally, and the prediction is the overall mean')],
      },
      {
        eq: R`h\to0:\quad \alpha_i(x)\to\begin{cases}1 & x_i\ \text{nearest to }x\\ 0 & \text{otherwise}\end{cases}`,
        notes: [lab('very narrow kernel: the prediction copies the target of the single nearest input (1-NN), assuming one input is strictly nearest')],
      },
    ],
    callouts: [
      {
        heading: 'k-NN is the same formula with different weights',
        flag: 'I9',
        text: R`Both methods predict $\sum_i\alpha_i(x)y_i$ with weights that sum to one. k-NN uses $\tfrac1k$ on the $k$ nearest and 0 elsewhere; kernel regression uses smooth Gaussian weights.`,
      },
    ],
  },
  {
    id: 'challenges',
    title: 'Challenges of non-parametric regression',
    why: 'Local averaging is simple but it keeps all the data, scans it for every prediction, and needs nearby points to exist. In many dimensions there are almost no nearby points. These costs motivate parametric models such as linear regression, next.',
    slides: [slide('I', 28, 'Challenges of non-parametric regression')],
    slideNote: R`Row 3 states the cell count in general; $b$ (bins per coordinate) is added notation. Figure: 30 dots on a 1D strip, a 2D grid and a 3D grid.`,
    rows: [
      {
        eq: R`\text{memory}\ \propto\ N\quad(D\ \text{fixed})`,
        notes: [
          term('Memory'),
          text('Storing the training pairs grows linearly with sample count for a fixed input dimension.'),
        ],
      },
      {
        eq: R`\text{cost of one prediction (full scan)}\ \propto\ N`,
        notes: [
          term('Prediction'),
          text('Access the stored examples. A straightforward full scan grows linearly with sample count. An index may be faster.'),
          lab(R`a full scan computes one distance or kernel value per stored input: $N$ of them`),
        ],
      },
      {
        eq: R`\text{cells}=b^{D},\qquad \text{points per cell}=\frac{N}{b^{D}}`,
        notes: [
          term('Curse of dimensionality'),
          text('Locality: neighbourhoods become sparse.'),
          lab(R`$b$ bins per coordinate, $D$ input dimensions, $N$ observations`),
        ],
      },
      {
        eq: R`N=30,\ b=10:\quad \tfrac{30}{10}=3,\quad \tfrac{30}{100}=0.3,\quad \tfrac{30}{1000}=0.03`,
        notes: [
          ex('1 dimension: 10 cells, 3 per cell on average'),
          ex('2 dimensions: 100 cells, 0.3 per cell on average'),
          ex('3 dimensions: 1,000 cells, 0.03 per cell on average'),
          warn('the number of cells grows exponentially with the dimension, so most cells are empty'),
        ],
      },
    ],
  },
];

export const localAveraging: Topic = {
  id: 'local-averaging',
  title: 'Local averaging and kernel regression',
  short: 'Local avg',
  summary: R`Predict a new target by averaging stored targets near the query: k-nearest-neighbour averaging, then kernel regression with Gaussian weights $\alpha_i(x)$ that sum to one. Ends with the costs of non-parametric methods, including the curse of dimensionality.`,
  identities,
  sections,
};
