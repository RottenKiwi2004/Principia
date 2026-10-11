import { R, con, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'C5',
    area: 'Conventions',
    tex: R`p(y)=p(Y=y)=\Pr(Y=y)`,
    note: R`A capital letter ($Y$, $B$, $X$) is the random variable; a lower-case letter ($y$, $b$, $x$) is one value it can take. The slides write $P$ and $p$ for the same thing.`,
  },
  {
    id: 'I27',
    area: 'Probability',
    tex: R`p(y)\ge0,\ \ \sum_y p(y)=1\qquad p(x)\ge0,\ \ \int_{-\infty}^{\infty}p(x)\,\mathrm dx=1`,
    note: R`Normalisation. Discrete: the probabilities of all values add to 1. Continuous: the total area under the density is 1. It also holds for a conditional: $\sum_y p(y\mid b)=1$ for each fixed $b$.`,
  },
  {
    id: 'I28',
    area: 'Probability',
    tex: R`p(y)=\sum_b p(y,b)\qquad\Big(\text{continuous: }p(x)=\int p(x,z)\,\mathrm dz\Big)`,
    note: R`Sum rule (marginalisation): to get rid of a variable, add the joint over all its values. In a joint table this is a row or column total.`,
  },
  {
    id: 'I29',
    area: 'Probability',
    tex: R`p(y,b)=p(y\mid b)\,p(b)=p(b\mid y)\,p(y)`,
    note: R`Product rule. Rearranged, it defines the conditional $p(y\mid b)=p(y,b)/p(b)$, which needs $p(b)>0$. The bar $\mid$ reads "given".`,
  },
  {
    id: 'I30',
    area: 'Probability',
    tex: R`p(b\mid y)=\frac{p(y\mid b)\,p(b)}{p(y)}=\frac{p(y\mid b)\,p(b)}{\sum_{b'}p(y\mid b')\,p(b')}`,
    note: R`Bayes' rule: posterior $=$ likelihood $\times$ prior $/$ evidence. It follows from the two forms of the product rule (I29); the denominator is the sum rule (I28). Needs $p(y)>0$. In MAP estimation the evidence $p(\mathbf y\mid X)$ has no $\mathbf w$ in it, so it is a constant when maximising over $\mathbf w$.`,
  },
  {
    id: 'I31',
    area: 'Probability',
    tex: R`\Pr(a<X\le b)=\int_a^b p(x)\,\mathrm dx=P(b)-P(a),\qquad P(x)=\Pr(X\le x)`,
    note: R`Continuous $X$: probability is area under the density $p(x)$; $P(x)$ is the cumulative distribution function (CDF). A single point has zero width, so $\Pr(X=x)\le\Pr(x-\delta<X\le x)=\int_{x-\delta}^{x}p(t)\,\mathrm dt\to0$ as $\delta\to0$: $\Pr(X=x)=0$.`,
  },
  {
    id: 'I32',
    area: 'Probability',
    tex: R`Y\sim\mathcal N(\mu,\sigma^2)\ \Rightarrow\ p(y)=\frac{1}{\sqrt{2\pi}\,\sigma}\exp\!\Big[-\frac{(y-\mu)^2}{2\sigma^2}\Big]`,
    note: R`One-dimensional Gaussian. $\mu$ is the mean, $\sigma>0$ the standard deviation, $\sigma^2$ the variance; all are scalars ($1\times1$). Note $\sqrt{2\pi}\,\sigma=\sqrt{2\pi\sigma^2}$. Also written $\mathcal N(y\mid\mu,\sigma^2)$: the density of $y$ given its mean and variance.`,
  },
];

const jointTable = R`
\begin{array}{l|cc|c}
\text{Joint probability} & \text{Red box }(r) & \text{Blue box }(b) & \text{Fruit total}\\ \hline
\text{Apple }(a) & 0.10 & 0.45 & \htmlClass{c-green}{0.55}\\
\text{Orange }(o) & 0.30 & 0.15 & \htmlClass{c-green}{0.45}\\ \hline
\text{Box total} & \htmlClass{c-green}{0.40} & \htmlClass{c-green}{0.60} & 1.00
\end{array}`;

const sections: Section[] = [
  {
    id: 'modelling',
    title: 'Probabilistic modelling',
    why: R`So far a model gave one prediction per input. A probabilistic model instead says how likely each possible value is. Fitting then means picking the distribution that best explains the data, which is where maximum likelihood (next topic) comes from.`,
    slides: [slide('II', 10, 'Probabilistic modeling')],
    slideNote: R`Slide 10 is a figure only (from Murphy, 2022, Foundations).`,
    pre: [
      lab(R`Top of the figure: a few observed values marked as ticks on an $x$ axis.`),
      lab(R`Bottom: two candidate bell-shaped densities over the same axis, each with a question mark. An arrow points from the data to the wider curve.`),
      text(R`The question the slide poses: which distribution could have produced these observations?`),
    ],
    rows: [],
  },
  {
    id: 'random-variables',
    title: 'Random variables and the PMF',
    why: R`We need names for "the thing that is uncertain" and "the value we actually saw", and a rule for what counts as a valid set of probabilities. Every later formula (joint, Bayes, likelihood) is built from these pieces.`,
    slides: [slide('II', 11, 'Random variables and observed values')],
    slideNote: R`The box contents are read from the figure, taking the green circles as apples; those counts reproduce the table on slide 12.`,
    pre: [
      text(R`Example: choose a box, then pick a fruit from it.`),
      lab(R`$Y$ records the fruit: apple ($a$) or orange ($o$). $B$ records the box: red ($r$) or blue ($b$).`),
      ex(R`Figure: the red box holds 2 apples and 6 oranges; the blue box holds 3 apples and 1 orange.`),
    ],
    rows: [
      {
        eq: R`Y\in\{a,o\},\qquad y=a\ \text{or}\ y=o`,
        notes: [
          tag(['C5'], R`capital $Y$: the random variable; lower-case $y$: one observed value`),
          lab(R`likewise $B\in\{r,b\}$`),
        ],
      },
      {
        eq: R`p(y)=p(Y=y)=\Pr(Y=y)`,
        notes: [
          term('Probability mass function (PMF)'),
          tag(['C5'], 'three ways of writing the same number'),
          shape(R`p(y):\ 1\times1\ \text{(a number in }[0,1])`),
        ],
      },
      {
        eq: R`p(y)\ge0,\qquad\sum_y p(y)=1`,
        notes: [
          tag(['I27'], 'normalisation: no negative probabilities, and all values together have probability 1'),
          lab(R`here the sum has two terms: $p(a)+p(o)=1$`),
        ],
      },
    ],
  },
  {
    id: 'joint-marginal-conditional',
    title: 'Joint, marginal and conditional',
    why: R`Real problems involve several uncertain things at once (box and fruit). The joint table holds everything; the sum rule and product rule are the two moves that get any other probability out of it, including the one Bayes' rule needs next.`,
    slides: [slide('II', 12, 'Joint, marginal and conditional probability')],
    slideNote: R`The apple total (row 3), the orange-given-red value (row 6) and the blue column (row 7) are added; they are needed for the Bayes example.`,
    display: jointTable,
    pre: [
      text(R`Choose red with probability $0.4$, blue with probability $0.6$.`),
      lab(R`Each inner cell is a joint probability. The green totals are marginals.`),
    ],
    rows: [
      {
        eq: R`P(Y=a,B=r)=0.10`,
        notes: [term('Joint probability'), lab('read one cell: apple AND red box')],
      },
      {
        eq: R`P(B=r)=0.10+0.30=0.40`,
        notes: [
          term('Marginal probability'),
          tag(['I28'], 'sum rule: add the red column over both fruits'),
        ],
      },
      {
        eq: R`P(Y=a)=0.10+0.45=0.55`,
        notes: [tag(['I28'], 'sum rule the other way: add the apple row over both boxes')],
      },
      {
        eq: R`P(Y=y,B=b)=P(Y=y\mid B=b)\,P(B=b)`,
        notes: [
          term('Conditional probability'),
          tag(['I29'], 'product rule: the joint is the conditional times the marginal'),
          lab(R`the bar $\mid$ means "given". Assume $P(B=b)>0$.`),
          warn(R`here $b$ stands for any box value, not only "blue"`),
        ],
      },
      {
        eq: R`P(Y=a\mid B=r)=\frac{0.10}{0.40}=0.25`,
        notes: [
          tag(['I29'], R`rearranged: divide the joint by $P(B=r)$`),
          lab('normalise the red column by its total'),
          ex(R`matches the figure: 2 apples out of 8 fruits in the red box`),
        ],
      },
      {
        eq: R`P(Y=o\mid B=r)=\frac{0.30}{0.40}=0.75,\qquad 0.25+0.75=1`,
        notes: [tag(['I27'], R`a conditional is a proper distribution over $y$: it sums to 1`)],
      },
      {
        eq: R`P(Y=a\mid B=b)=\frac{0.45}{0.60}=0.75,\qquad P(Y=o\mid B=b)=\frac{0.15}{0.60}=0.25`,
        notes: [
          tag(['I29'], 'same move on the blue column'),
          lab(R`here $b$ means blue`),
          ex(R`matches the figure: 3 apples out of 4 fruits in the blue box`),
        ],
      },
    ],
  },
  {
    id: 'bayes',
    circ: 1,
    title: "Bayes' rule, worked",
    why: R`We often know how likely the evidence is under each cause ($p(\text{apple}\mid\text{box})$) but want the reverse: which cause is likely given the evidence. Bayes' rule flips the conditioning, and the same prior-times-likelihood idea gives MAP estimation and ridge later.`,
    slides: [slide('II', 13, 'Bayes’ rule: reverse the conditioning')],
    slideNote: R`Row 3 expands the evidence with the sum and product rules, and row 5 (the blue posterior) is added as a check.`,
    pre: [text('Observed: an apple. Which box did it come from?')],
    rows: [
      {
        eq: R`p(B=b\mid Y=a)=\frac{p(Y=a\mid B=b)\,p(B=b)}{p(Y=a)}`,
        notes: [
          term('Bayes’ rule'),
          tag(['I30'], 'reverse the conditioning: from fruit-given-box to box-given-fruit'),
          lab(R`$B$: box colour; $Y$: fruit; $a$: apple; $b$ here is any box value`),
        ],
      },
      {
        eq: R`\text{posterior}=\frac{\text{likelihood}\times\text{prior}}{\text{evidence}}`,
        notes: [
          term('Prior'),
          lab(R`$p(B=b)$: before observing the fruit`),
          term('Likelihood'),
          lab(R`$p(Y=a\mid B=b)$: apple chance in a chosen box`),
          term('Evidence'),
          lab(R`$p(Y=a)$: total apple chance`),
          term('Posterior'),
          lab(R`$p(B=b\mid Y=a)$: after observing the fruit`),
        ],
      },
      {
        eq: R`p(Y=a)=\underbrace{0.25\times0.40}_{\text{red}}+\underbrace{0.75\times0.60}_{\text{blue}}=0.10+0.45=0.55`,
        notes: [
          tag(['I28', 'I29'], 'evidence: sum over boxes of likelihood times prior; same as the apple row total'),
        ],
      },
      {
        eq: R`p(B=r\mid Y=a)=\frac{0.25\times0.40}{0.55}=\frac{2}{11}\simeq0.182`,
        notes: [
          tag(['I30'], R`likelihood $0.25$, prior $0.40$, evidence $0.55$`),
          lab(R`the red prior was $0.40$; after seeing an apple it drops to about $0.18$`),
        ],
      },
      {
        eq: R`p(B=b\mid Y=a)=\frac{0.75\times0.60}{0.55}=\frac{9}{11}\simeq0.818=1-\frac{2}{11}`,
        notes: [
          lab(R`here $b$ means blue`),
          tag(['I27'], 'the two posteriors add to 1, a quick check'),
          term('An apple makes the blue box more likely'),
          lab(R`blue goes from $0.60$ (prior) to about $0.82$ (posterior)`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Exam trap: the order of conditioning matters',
        flag: 'I30',
        text: R`$p(Y=a\mid B=r)=0.25$ is the chance of an apple from the red box. $p(B=r\mid Y=a)\simeq0.182$ is the chance of the red box once you hold an apple. They are different numbers; Bayes' rule converts one into the other.`,
        eq: R`p(Y=a\mid B=r)\ne p(B=r\mid Y=a)`,
      },
    ],
  },
  {
    id: 'continuous',
    title: 'Continuous variables: pdf and CDF',
    why: R`Regression targets are real numbers, not apple-or-orange. For a continuous variable each single value has probability zero, so we need a density and areas under it instead of a table of probabilities.`,
    slides: [slide('II', 14, 'Continuous variables: density and probability')],
    slideNote: R`The CDF integral (row 3), the difference form (row 4), the strip approximation (row 6) and the numeric examples are added to explain the figure's labels.`,
    pre: [
      text(R`$X$ is a continuous random variable. Its probability density function (pdf), $p(x)$, assigns density to each possible value $x$.`),
      lab(R`Figure: red curve: the density $p(x)$, with two bumps. Blue curve: the cumulative probability $P(x)=\Pr(X\le x)$, rising from 0 and levelling off at 1. Green strip: an interval of width $\delta x$.`),
    ],
    rows: [
      {
        eq: R`\Pr(a<X\le b)=\int_a^b p(x)\,\mathrm dx`,
        notes: [
          tag(['I31'], 'probability is the area under the density between the endpoints'),
          warn(R`here $a$ and $b$ are interval endpoints, not apple and blue`),
        ],
      },
      {
        eq: R`p(x)\ge0,\qquad\int_{-\infty}^{\infty}p(x)\,\mathrm dx=1`,
        notes: [tag(['I27'], 'normalisation, continuous version: total area is 1')],
      },
      {
        eq: R`P(x)=\Pr(X\le x)=\int_{-\infty}^{x}p(t)\,\mathrm dt`,
        notes: [
          term('Cumulative distribution function (CDF)'),
          tag(['I31'], R`area from $-\infty$ up to $x$; $t$ is just the integration variable`),
          lab('the blue curve in the figure'),
        ],
      },
      {
        eq: R`\Pr(a<X\le b)=P(b)-P(a)`,
        notes: [tag(['I31'], 'area up to $b$ minus area up to $a$')],
      },
      {
        eq: R`\Pr(X=x)=0`,
        notes: [
          tag(['I31'], R`$\Pr(X=x)\le\Pr(x-\delta<X\le x)=\int_{x-\delta}^{x}p(t)\,\mathrm dt\to0$ as $\delta\to0$: a single point has zero width, so zero area`),
          warn(R`so $p(x)$ is not a probability; only areas under it are`),
        ],
      },
      {
        eq: R`\Pr(x<X\le x+\delta x)\approx p(x)\,\delta x`,
        notes: [
          lab(R`the green strip: height $p(x)$ times width $\delta x$`),
          lab('a density is probability per unit of $x$'),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Density values can exceed 1',
        flag: 'I27',
        text: R`Only the total area must be 1, not the height. Example: a density that is flat on $[0,0.5]$ must have height 2 so that the area is $2\times0.5=1$.`,
        eq: R`p(x)=2\ \text{on}\ [0,0.5]:\quad\int_0^{0.5}2\,\mathrm dx=1`,
      },
    ],
  },
  {
    id: 'gaussian-1d',
    title: 'The 1D Gaussian',
    why: R`The Gaussian is the density we will assume for noise in regression. Knowing its formula, and what $\mu$ and $\sigma$ do to the curve, is all we need to write down its likelihood in the next topic.`,
    slides: [slide('II', 15, 'The one-dimensional Gaussian distribution')],
    slideNote: R`The peak-height rows are added; they check the figure's values and show a density above 1.`,
    display: R`Y\sim\mathcal N(\mu,\sigma^2),\qquad p(y)=\frac{1}{\sqrt{2\pi}\,\sigma}\exp\!\left[-\frac{(y-\mu)^2}{2\sigma^2}\right]`,
    pre: [
      lab(R`$\sim$: "distributed as". $\mathcal N(\text{mean},\text{variance})$: Gaussian distribution.`),
      lab(R`$\mu$: mean. $\sigma$: standard deviation. The variance is $\sigma^2$.`),
      lab(R`Figure: three curves. $\mu=0,\sigma=0.5$ is tall and narrow; $\mu=0,\sigma=1$ is lower and wider; $\mu=1,\sigma=1$ is the same shape shifted right by 1. $\mu$ moves the curve, $\sigma$ sets its width.`),
    ],
    rows: [
      {
        eq: R`Y\sim\mathcal N(\mu,\sigma^2)`,
        notes: [
          term('Gaussian (normal) distribution'),
          warn(R`the second argument is the variance $\sigma^2$, not $\sigma$`),
          shape(R`\mu,\ \sigma,\ \sigma^2:\ 1\times1`),
        ],
      },
      {
        eq: R`p(y)=\underbrace{\frac{1}{\sqrt{2\pi}\,\sigma}}_{\text{height factor}}\exp\!\Big[-\frac{\overbrace{(y-\mu)^2}^{\text{squared distance from }\mu}}{2\sigma^2}\Big]`,
        notes: [
          tag(['I32'], 'the Gaussian density'),
          tag(['I27'], R`the factor $1/(\sqrt{2\pi}\,\sigma)$ makes the total area 1`),
          lab(R`largest at $y=\mu$; falls off faster when $\sigma$ is small`),
          con(R`$\mu$ and $\sigma$ are fixed parameters; $y$ is the variable`),
        ],
      },
      {
        eq: R`p(\mu)=\frac{1}{\sqrt{2\pi}\,\sigma}:\qquad\sigma=1\Rightarrow0.399,\qquad\sigma=0.5\Rightarrow0.798`,
        notes: [
          ex(R`these are the peak heights in the figure (about $0.4$ and $0.8$)`),
        ],
      },
      {
        eq: R`\sigma=0.1\ \Rightarrow\ p(\mu)=\frac{1}{\sqrt{2\pi}\times0.1}\simeq3.99>1`,
        notes: [ex('a narrow Gaussian has density above 1: the slide 14 point again')],
      },
    ],
  },
];

export const probabilityBasics: Topic = {
  id: 'probability-basics',
  title: 'Probability basics',
  short: 'Probability',
  summary: R`Random variables, joint, marginal and conditional probability on the box-and-fruit table, Bayes' rule worked numerically, densities for continuous variables, and the 1D Gaussian $\mathcal N(\mu,\sigma^2)$.`,
  identities,
  sections,
};
