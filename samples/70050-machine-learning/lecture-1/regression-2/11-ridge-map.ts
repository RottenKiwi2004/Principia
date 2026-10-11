import { R, con, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I44',
    area: 'Probability',
    tex: R`-\log\mathcal N(y\mid\mu,\sigma^2)=\tfrac12\log(2\pi\sigma^2)+\frac{(y-\mu)^2}{2\sigma^2}`,
    note: R`Negative log of a Gaussian density. Uses $\log e^{a}=a$ and $-\log\frac{1}{\sqrt c}=\tfrac12\log c$. The first term does not depend on $y$ or $\mu$.`,
  },
  {
    id: 'I45',
    area: 'Probability',
    tex: R`\mathcal N(\mathbf w\mid\mathbf 0,\tau^2 I)=\prod_{j=1}^{D}\mathcal N(w_j\mid 0,\tau^2)`,
    note: R`An isotropic Gaussian (covariance $\tau^2 I$, $D\times D$) has zero off-diagonal covariance, so its $D$ coordinates are independent, each with mean $0$ and variance $\tau^2$, and the density factorises.`,
  },
  {
    id: 'I47',
    area: 'Linear algebra',
    tex: R`(cA)^{-1}=\tfrac1c A^{-1},\qquad aI+bI=(a+b)I,\qquad (cI)^{-1}=\tfrac1c I`,
    note: R`For a scalar $c\ne0$ and an invertible square matrix $A$. So a multiple of the identity is inverted by inverting the scalar.`,
  },
  {
    id: 'I48',
    area: 'Probability',
    tex: R`\operatorname{Var}(\mathbf a^\top\mathbf w)=\mathbf a^\top\operatorname{Cov}(\mathbf w)\,\mathbf a`,
    note: R`$\mathbf a$ is a fixed $D\times1$ vector, $\mathbf w$ a random $D\times1$ vector with $D\times D$ covariance. The result is $1\times1$.`,
  },
  {
    id: 'I49',
    area: 'Probability',
    tex: R`A,B\ \text{independent}\ \Rightarrow\ \operatorname{Var}(A+B)=\operatorname{Var}(A)+\operatorname{Var}(B)`,
    note: R`Variances of independent scalar random variables add. Without independence a covariance term $2\operatorname{Cov}(A,B)$ appears.`,
  },
  {
    id: 'I46',
    area: 'Probability',
    tex: R`\arg\max_{\mathbf w}\mathcal N(\mathbf w\mid\mathbf m,S)=\mathbf m`,
    note: R`A Gaussian density is highest at its mean (its mode equals its mean). So when the posterior is Gaussian, the MAP estimate is the posterior mean.`,
  },
  {
    id: 'I43',
    area: 'Probability',
    tex: R`\epsilon\sim\mathcal N(0,\sigma^2),\ c\ \text{fixed}\ \Rightarrow\ c+\epsilon\sim\mathcal N(c,\sigma^2)`,
    note: R`Adding a fixed number to a Gaussian shifts its mean and leaves its variance unchanged.`,
  },
  {
    id: 'C6',
    area: 'Conventions',
    tex: R`X=\begin{bmatrix}\mathbf x_1^\top\\ \vdots\\ \mathbf x_N^\top\end{bmatrix}\ \Rightarrow\ (X\mathbf w)_i=\mathbf x_i^\top\mathbf w,\quad \sum_{i=1}^{N}(y_i-\mathbf x_i^\top\mathbf w)^2=\lVert\mathbf y-X\mathbf w\rVert^2`,
    note: R`Row $i$ of $X$ ($N\times D$) is example $i$ written as a row, $\mathbf x_i^\top$ ($1\times D$). The sum of squared residuals is a squared norm by I1.`,
  },
  {
    id: 'C7',
    area: 'Conventions',
    tex: R`\lVert\mathbf v\rVert=\lVert\mathbf v\rVert_2`,
    note: R`A norm written without a subscript means the L2 (Euclidean) norm. The deck II slides 23, 24, 26 and 33 drop the subscript.`,
  },
];

const sections: Section[] = [
  {
    id: 'big-picture',
    title: 'Likelihood, prior and posterior',
    why: R`Ridge added the penalty $\lambda\lVert\mathbf w\rVert_2^2$ by choice. Here we show the same penalty comes out of probability: a belief about $\mathbf w$ before seeing data (the prior) combined with how well $\mathbf w$ fits the data (the likelihood). That justifies the penalty and gives $\lambda$ a meaning.`,
    slides: [slide('II', 21, 'Ridge regression as MAP estimation')],
    slideNote: R`The slide gives words and a figure only. The four rows (likelihood, prior, posterior, and the ML/MAP definitions) are added to name each quantity in symbols.`,
    pre: [
      lab(R`Figure: axes $w_1,w_2$ (two coefficients). A red ellipse is a contour of the likelihood around the ML estimate. A green circle is a contour of the prior around the prior mean. The MAP estimate (blue dot) lies between them: pulled away from the ML estimate towards the prior mean.`),
      text(R`ML: maximum likelihood. MAP: maximum a posteriori. A prior gives a probabilistic basis for a penalty.`),
    ],
    rows: [
      {
        eq: R`\text{likelihood: }p(\mathbf y\mid X,\mathbf w)`,
        notes: [
          term('Likelihood'),
          text('Scores how well parameters explain the observed data.'),
          warn(R`It is a density over $\mathbf y$; we read it as a function of $\mathbf w$ with the data held fixed. It is not a distribution over $\mathbf w$.`),
        ],
      },
      {
        eq: R`\text{prior: }p(\mathbf w)`,
        notes: [term('Prior'), text('Describes parameter beliefs before these observations.')],
      },
      {
        eq: R`\text{posterior: }p(\mathbf w\mid X,\mathbf y)\ \propto\ p(\mathbf y\mid X,\mathbf w)\,p(\mathbf w)`,
        notes: [
          term('Posterior'),
          text('Combines likelihood and prior after observing the data.'),
          tag(['I30'], R`Bayes' rule, dropping the denominator, which has no $\mathbf w$ in it ($\propto$ means "proportional to")`),
        ],
      },
      {
        eq: R`\hat{\mathbf w}_{\text{ML}}=\arg\max_{\mathbf w}p(\mathbf y\mid X,\mathbf w),\qquad \hat{\mathbf w}_{\text{MAP}}=\arg\max_{\mathbf w}p(\mathbf w\mid X,\mathbf y)`,
        notes: [
          lab('ML: highest likelihood (red centre). MAP: highest posterior (blue dot).'),
          shape(R`\hat{\mathbf w}_{\text{ML}},\ \hat{\mathbf w}_{\text{MAP}}:\ D\times1`),
        ],
      },
    ],
  },
  {
    id: 'model',
    circ: 1,
    title: 'The probabilistic model',
    why: R`To use probability we need a story for how the data were made: a linear function plus random noise. With that story, each choice of $\mathbf w$ gives each observed $y_i$ a probability density, and a good $\mathbf w$ is one that makes the observed data likely.`,
    slides: [slide('II', 22, 'A probabilistic model for regression')],
    slideNote: R`Row 3 (the distribution of $y_i$) is added to connect rows 2 and 4. The figure shows four data points (red) and a fitted line through the origin.`,
    rows: [
      {
        eq: R`y_i=\mathbf x_i^\top\mathbf w+\epsilon_i,\qquad i=1,\dots,N`,
        notes: [
          lab('one equation per training example'),
          shape(R`\mathbf x_i:\ D\times1,\quad \mathbf w:\ D\times1,\quad \mathbf x_i^\top\mathbf w:\ (1\times D)(D\times1)=1\times1`),
          shape(R`y_i,\ \epsilon_i:\ 1\times1\ \text{(scalars)}`),
          warn(R`No column of 1s here: slide 24 says the data are centred and the intercept is fitted separately, so $\mathbf w$ holds the $D$ non-intercept coefficients (in the LS matrix topic $X$ was $N\times(D+1)$).`),
        ],
      },
      {
        eq: R`\epsilon_i\sim\mathcal N(0,\sigma^2)`,
        notes: [
          term('Gaussian observation noise'),
          text(R`$\epsilon_i$: independent observation noise. $\sigma^2$: noise variance.`),
          con(R`$\sigma^2$ is treated as fixed and known: a constant w.r.t. $\mathbf w$`),
        ],
      },
      {
        eq: R`y_i\mid\mathbf x_i,\mathbf w\ \sim\ \mathcal N(\mathbf x_i^\top\mathbf w,\ \sigma^2)`,
        notes: [
          tag(['I43'], R`$\mathbf x_i^\top\mathbf w$ is fixed once $\mathbf w$ is chosen, so adding the noise gives a Gaussian centred on the line`),
          shape(R`\text{mean }\mathbf x_i^\top\mathbf w:\ 1\times1,\quad \text{variance }\sigma^2:\ 1\times1`),
        ],
      },
      {
        eq: R`p(y_i\mid\mathbf x_i,\mathbf w)=\frac{1}{\sqrt{2\pi\sigma^2}}\exp\!\Big[-\frac{(y_i-\mathbf x_i^\top\mathbf w)^2}{2\sigma^2}\Big]`,
        notes: [
          tag(['I32'], R`Gaussian density with $\mu=\mathbf x_i^\top\mathbf w$, evaluated at $y=y_i$`),
          text(R`Density at the observed target $y_i$. Fix the data and vary $\mathbf w$: a likelihood contribution.`),
          lab(R`large when $y_i$ is close to the line, small when the residual is big`),
          shape(R`p(y_i\mid\mathbf x_i,\mathbf w):\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'likelihood-ls',
    circ: 2,
    title: 'Gaussian likelihood gives least squares',
    why: R`Maximising the likelihood is the probabilistic way to fit $\mathbf w$. Working it through shows that, with Gaussian noise, it gives exactly the least-squares fit we already know. This is the first half of the ridge story; the prior supplies the second half.`,
    slides: [slide('II', 23, 'Gaussian likelihood gives least squares')],
    slideNote: R`The slide shows only row 5 and row 7. Rows 1 to 4 (product over $i$, log of the product, the per-example term) and row 6 are added so each rule is visible.`,
    rows: [
      {
        eq: R`p(\mathbf y\mid X,\mathbf w,\sigma^2)=\prod_{i=1}^{N}p(y_i\mid\mathbf x_i,\mathbf w)`,
        notes: [
          tag(['I33'], R`the noise terms $\epsilon_i$ are independent, so the joint density is a product`),
          shape(R`\mathbf y:\ N\times1,\quad X:\ N\times D\ \text{(row }i\text{ is }\mathbf x_i^\top\text{)},\quad \text{each factor: }1\times1`),
        ],
      },
      {
        eq: R`-\log p(\mathbf y\mid X,\mathbf w,\sigma^2)=-\sum_{i=1}^{N}\log p(y_i\mid\mathbf x_i,\mathbf w)`,
        notes: [
          tag(['I34'], 'log of a product is the sum of the logs'),
          lab('a sum is easier to handle than a product of many small numbers'),
          shape(R`1\times1`),
        ],
      },
      {
        eq: R`=\sum_{i=1}^{N}\Big[\tfrac12\log(2\pi\sigma^2)+\frac{(y_i-\mathbf x_i^\top\mathbf w)^2}{2\sigma^2}\Big]`,
        notes: [
          tag(['I44'], R`negative log of each Gaussian factor, with $\mu=\mathbf x_i^\top\mathbf w$`),
          shape(R`\text{each bracket: }1\times1`),
        ],
      },
      {
        eq: R`=\htmlClass{c-orange}{\frac N2\log(2\pi\sigma^2)}+\frac{1}{2\sigma^2}\sum_{i=1}^{N}(y_i-\mathbf x_i^\top\mathbf w)^2`,
        notes: [
          lab(R`split the sum: the first term is the same for every $i$, so it appears $N$ times`),
          con(R`$\frac N2\log(2\pi\sigma^2)$ has no $\mathbf w$: constant`),
        ],
      },
      {
        eq: R`=\htmlClass{c-orange}{\frac N2\log(2\pi\sigma^2)}+\frac{\lVert\mathbf y-X\mathbf w\rVert^2}{2\sigma^2}`,
        notes: [
          tag(['C6', 'I1'], R`row $i$ of $X\mathbf w$ is $\mathbf x_i^\top\mathbf w$, so the sum of squared residuals is $\lVert\mathbf y-X\mathbf w\rVert^2$`),
          tag(['C7'], R`no subscript on the norm: it is the L2 norm`),
          shape(R`\mathbf y-X\mathbf w:\ N\times1-(N\times D)(D\times1)=N\times1,\quad \lVert\cdot\rVert^2:\ 1\times1`),
        ],
      },
      {
        eq: R`\hat{\mathbf w}_{\text{ML}}=\arg\max_{\mathbf w}p(\mathbf y\mid X,\mathbf w,\sigma^2)=\arg\min_{\mathbf w}\big[-\log p(\mathbf y\mid X,\mathbf w,\sigma^2)\big]`,
        notes: [tag(['I35'], 'maximising a density is the same as minimising its negative log'), shape(R`\hat{\mathbf w}_{\text{ML}}:\ D\times1`)],
      },
      {
        eq: R`\hat{\mathbf w}_{\text{ML}}=\arg\min_{\mathbf w}\lVert\mathbf y-X\mathbf w\rVert^2`,
        notes: [
          tag(['I35'], R`drop the constant $\frac N2\log(2\pi\sigma^2)$, then multiply by $2\sigma^2>0$`),
          text(R`For fixed $\sigma^2$, constants and positive scaling do not change the minimiser.`),
          term('Maximum likelihood gives least squares'),
          text('ML: maximum likelihood. Fit the coefficients by minimising squared error.'),
          lab('A Gaussian prior will add the ridge penalty.'),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Exam trap: same minimiser, different minimum',
        flag: 'I35',
        text: R`Dropping constants and scaling keeps the position $\hat{\mathbf w}$ but changes the value of the objective at that point. Also, this only works because $\sigma^2$ is fixed: if $\sigma^2$ were also being fitted, the term $\frac N2\log(2\pi\sigma^2)$ could not be dropped.`,
      },
    ],
  },
  {
    id: 'prior',
    circ: 3,
    title: 'A Gaussian prior on the coefficients',
    why: R`The likelihood alone gives plain least squares, which can overfit. A prior says, before seeing any data, that the coefficients are probably small. Its negative log turns out to be a squared-norm penalty on $\mathbf w$: the ridge term.`,
    slides: [slide('II', 24, 'A Gaussian prior on the coefficients')],
    slideNote: R`The slide shows rows 1 and 5. Rows 2 to 4 are added to show where the $\lVert\mathbf w\rVert^2$ comes from.`,
    pre: [
      text('Centred data. Fit the intercept separately without a penalty.'),
      warn(R`The intercept is not inside $\mathbf w$, so the prior (and hence the penalty) does not shrink it.`),
    ],
    rows: [
      {
        eq: R`\mathbf w\sim\mathcal N(\mathbf 0,\tau^2 I)`,
        notes: [
          text(R`$\tau^2$: prior coefficient variance. $I$: identity matrix.`),
          shape(R`\mathbf w:\ D\times1,\quad \mathbf 0:\ D\times1\ \text{(mean)},\quad \tau^2 I:\ D\times D\ \text{(covariance)}`),
          lab(R`$\tau^2 I$ has $\tau^2$ on the diagonal and $0$ elsewhere: each $w_j$ has variance $\tau^2$ and they are uncorrelated`),
        ],
      },
      {
        eq: R`p(\mathbf w)=\prod_{j=1}^{D}\mathcal N(w_j\mid 0,\tau^2)`,
        notes: [tag(['I45'], 'isotropic Gaussian: the density splits into one factor per coefficient'), shape(R`\text{each factor: }1\times1`)],
      },
      {
        eq: R`-\log p(\mathbf w)=\sum_{j=1}^{D}\Big[\tfrac12\log(2\pi\tau^2)+\frac{w_j^2}{2\tau^2}\Big]`,
        notes: [
          tag(['I34'], 'log of the product is a sum'),
          tag(['I44'], R`each factor with $\mu=0$ and variance $\tau^2$: $(w_j-0)^2=w_j^2$`),
        ],
      },
      {
        eq: R`=\htmlClass{c-orange}{\frac D2\log(2\pi\tau^2)}+\frac{1}{2\tau^2}\sum_{j=1}^{D}w_j^2`,
        notes: [lab(R`the first term appears $D$ times`), con(R`$\frac D2\log(2\pi\tau^2)$ has no $\mathbf w$: constant`)],
      },
      {
        eq: R`-\log p(\mathbf w)=\frac{\lVert\mathbf w\rVert^2}{2\tau^2}+\htmlClass{c-orange}{\text{constant}}`,
        notes: [
          tag(['I1'], R`$\sum_j w_j^2=\mathbf w^\top\mathbf w=\lVert\mathbf w\rVert^2$`),
          shape(R`\mathbf w^\top\mathbf w:\ (1\times D)(D\times1)=1\times1`),
          text(R`A smaller $\tau^2$ puts more prior mass near zero.`),
          lab(R`smaller $\tau^2$ also means a bigger weight $\frac{1}{2\tau^2}$: a stronger pull towards $\mathbf 0$`),
          ex(R`$\tau^2=1$ gives weight $\tfrac12$; $\tau^2=0.01$ gives weight $50$.`),
        ],
      },
    ],
  },
  {
    id: 'recap-penalty',
    title: 'Recap: the penalty restricts good fits',
    why: R`A reminder from Monday of what the penalty does, so the formula we are about to derive has a picture attached: a stronger penalty shrinks the region of good coefficients towards zero.`,
    slides: [
      slide('II', 25, 'Monday: regularisation restricts good fits'),
      slide('I', 57, 'Stronger regularisation restricts good fits'),
      slide('I', 55, 'Ridge regression'),
    ],
    slideNote: R`II 25 repeats I 57. Figure only; the row is the ridge objective from I 55.`,
    pre: [
      lab(R`Top row: the model $y=w_0+w_1x$ fitted to one data point (black dot). Dashed green: true function. Blue: best fit. Shaded: good fits.`),
      lab(R`Bottom row: the cost $L_{\text{ridge}}(\mathbf w)$ over the plane $(w_0,w_1)$, dark is low and yellow is high. Stronger penalty from left to right: the dark region goes from a long valley, to an ellipse, to a small spot at the origin. The best fit (blue cross) moves to $\mathbf 0$ and the fitted line flattens.`),
      warn('This schematic penalises both coefficients. Our regression objective leaves the intercept unpenalised.'),
    ],
    rows: [
      {
        eq: R`L_{\text{ridge}}(\mathbf w)=\lVert\mathbf y-X\mathbf w\rVert_2^2+\lambda\lVert\mathbf w\rVert_2^2`,
        notes: [
          lab(R`fit term plus penalty; larger $\lambda$ means a stronger penalty`),
          shape(R`\mathbf y:\ N\times1,\quad X:\ N\times D,\quad \mathbf w:\ D\times1,\quad L_{\text{ridge}}:\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'map',
    circ: 4,
    title: 'MAP estimation gives the ridge objective',
    why: R`Now combine the two halves. Choosing the most probable $\mathbf w$ after seeing the data (MAP) and taking negative logs gives the data-fit term from the likelihood plus the penalty from the prior. That is exactly the ridge objective, with $\lambda=\sigma^2/\tau^2$.`,
    slides: [slide('II', 26, 'MAP estimation gives the ridge objective')],
    slideNote: R`The slide shows rows 1, 6, 7 and the value of $\lambda_{\text{MSE}}$. Rows 2 to 5 unpack "Bayes' rule, then take negative logs"; the objective in row 8 is added to show where $\lambda_{\text{MSE}}$ comes from.`,
    rows: [
      {
        eq: R`\hat{\mathbf w}_{\text{MAP}}=\arg\max_{\mathbf w}p(\mathbf w\mid X,\mathbf y)`,
        notes: [text('MAP selects the coefficients with highest posterior density.'), shape(R`\hat{\mathbf w}_{\text{MAP}}:\ D\times1`)],
      },
      {
        eq: R`=\arg\max_{\mathbf w}\frac{p(\mathbf y\mid X,\mathbf w)\,p(\mathbf w)}{\htmlClass{c-orange}{p(\mathbf y\mid X)}}`,
        notes: [
          tag(['I30'], R`Bayes' rule: likelihood times prior over evidence`),
          con(R`$p(\mathbf y\mid X)$ does not depend on $\mathbf w$: a positive constant`),
        ],
      },
      {
        eq: R`=\arg\max_{\mathbf w}p(\mathbf y\mid X,\mathbf w)\,p(\mathbf w)`,
        notes: [tag(['I35'], R`dividing by a positive constant does not move the $\arg\max$`)],
      },
      {
        eq: R`=\arg\min_{\mathbf w}\big\{-\log p(\mathbf y\mid X,\mathbf w)-\log p(\mathbf w)\big\}`,
        notes: [
          tag(['I35'], 'take negative logs: maximise becomes minimise'),
          tag(['I34'], R`$-\log(ab)=-\log a-\log b$`),
        ],
      },
      {
        eq: R`=\arg\min_{\mathbf w}\Big\{\htmlClass{c-orange}{\tfrac N2\log(2\pi\sigma^2)}+\frac{\lVert\mathbf y-X\mathbf w\rVert^2}{2\sigma^2}+\frac{\lVert\mathbf w\rVert^2}{2\tau^2}+\htmlClass{c-orange}{\text{constant}}\Big\}`,
        notes: [
          lab('substitute the results of steps 2 and 3'),
          con(R`orange terms have no $\mathbf w$`),
          shape(R`\text{every term: }1\times1`),
        ],
      },
      {
        eq: R`=\arg\min_{\mathbf w}\Big\{\frac{\lVert\mathbf y-X\mathbf w\rVert^2}{2\sigma^2}+\frac{\lVert\mathbf w\rVert^2}{2\tau^2}\Big\}`,
        notes: [
          tag(['I35'], 'discard the constants'),
          lab('first term from the likelihood (fit), second from the prior (penalty)'),
          tag(['C7'], 'both norms are L2 norms'),
        ],
      },
      {
        eq: R`=\arg\min_{\mathbf w}\big\{\lVert\mathbf y-X\mathbf w\rVert^2+\lambda\lVert\mathbf w\rVert^2\big\},\qquad \lambda=\frac{\sigma^2}{\tau^2}`,
        notes: [
          tag(['I35'], R`multiply by $2\sigma^2>0$: the first term loses its $\frac{1}{2\sigma^2}$, the second becomes $\frac{2\sigma^2}{2\tau^2}=\frac{\sigma^2}{\tau^2}$`),
          term('Ridge objective'),
          shape(R`\lambda,\ \sigma^2,\ \tau^2:\ 1\times1\ \text{(positive scalars)}`),
        ],
      },
      {
        eq: R`\arg\min_{\mathbf w}\Big\{\frac1N\lVert\mathbf y-X\mathbf w\rVert^2+\lambda_{\text{MSE}}\lVert\mathbf w\rVert^2\Big\},\qquad \lambda_{\text{MSE}}=\frac{\sigma^2}{N\tau^2}`,
        notes: [
          text('For mean squared error (RSS / N).'),
          tag(['I35'], R`multiply the previous objective by $\frac1N>0$: the penalty weight becomes $\frac{\lambda}{N}$`),
          warn(R`the same model needs a different $\lambda$ depending on whether the fit term is RSS or MSE`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Reading the formula for lambda',
        text: R`$\lambda=\sigma^2/\tau^2$ is large when the noise $\sigma^2$ is large (trust the data less) or when the prior variance $\tau^2$ is small (strong belief that $\mathbf w$ is near $\mathbf 0$). As $\tau^2\to\infty$ the prior becomes flat, $\lambda\to0$, and MAP becomes ML, which is least squares.`,
        eq: R`\lambda=\frac{\sigma^2}{\tau^2}`,
      },
    ],
  },
  {
    id: 'recap-data',
    title: 'Recap: more data constrains the fit',
    why: R`A second reminder from Monday: more data is the other way to pin down $\mathbf w$. It sets up the next slides, where the uncertainty about $\mathbf w$ shrinks as $N$ grows.`,
    slides: [
      slide('II', 27, 'Monday: more observations constrain fitting'),
      slide('I', 52, 'More observations constrain the fitted function'),
    ],
    nonExaminable: true,
    slideNote: R`II 27 repeats I 52 and is labelled Non-examinable. Figure only.`,
    pre: [
      lab(R`Top row: the model $y=w_1x+w_2\sin(x)$ with more data from left to right. Bottom row: the cost over the plane $(w_1,w_2)$.`),
      lab(R`With one point the low-cost region is a long dark valley: many $(w_1,w_2)$ fit equally well. With more points it narrows to a small region, and the best fit (blue cross) moves onto the true function (green dot).`),
      text(R`$w_1$, $w_2$: coefficients. The function class stays fixed.`),
      text('Illustrated cost: residual magnitude to the power 0.25.'),
    ],
    rows: [
      {
        eq: R`y=w_1x+w_2\sin(x)`,
        notes: [lab(R`two coefficients, so the cost can be drawn as a 2D picture`), shape(R`\mathbf w=(w_1,w_2)^\top:\ 2\times1`)],
      },
    ],
  },
  {
    id: 'posterior',
    circ: 5,
    title: 'Posterior mean and covariance',
    why: R`MAP keeps only the single best $\mathbf w$. The full posterior also says how sure we are. For this model the posterior is Gaussian: its mean is the ridge solution, and its covariance shrinks as we collect more informative data.`,
    slides: [
      slide('II', 28, 'Posterior uncertainty about the parameters'),
      slide('I', 56, 'Ridge: the parameter estimate'),
    ],
    nonExaminable: true,
    slideNote: R`Rows 1 to 3, 5 and 6 are II 28. Row 4 is added to show that $S$ is a scaled version of the inverse in the ridge formula. I 56 is cited for the ridge estimate that $\mathbf m$ equals.`,
    rows: [
      {
        eq: R`p(\mathbf w\mid X,\mathbf y)=\mathcal N(\mathbf m,S)`,
        notes: [
          text(R`$\mathbf m$: posterior mean. $S$: posterior covariance.`),
          shape(R`\mathbf m:\ D\times1,\quad S:\ D\times D`),
        ],
      },
      {
        eq: R`\mathbf m=(X^\top X+\lambda I)^{-1}X^\top\mathbf y`,
        notes: [
          lab(R`the same formula as the ridge estimate $\hat{\mathbf w}$ on I 56`),
          tag(['I46'], R`a Gaussian peaks at its mean, so $\hat{\mathbf w}_{\text{MAP}}=\mathbf m$`),
          shape(R`(D\times D)(D\times N)(N\times1)=D\times1`),
        ],
      },
      {
        eq: R`S=\Big(\frac{X^\top X}{\sigma^2}+\frac{I}{\tau^2}\Big)^{-1}`,
        notes: [shape(R`X^\top X:\ (D\times N)(N\times D)=D\times D,\quad I:\ D\times D,\quad S:\ D\times D`)],
      },
      {
        eq: R`S=\Big(\frac{1}{\sigma^2}\big(X^\top X+\lambda I\big)\Big)^{-1}=\sigma^2\big(X^\top X+\lambda I\big)^{-1}`,
        notes: [
          lab(R`factor out $\frac{1}{\sigma^2}$, using $\frac{1}{\tau^2}=\frac{1}{\sigma^2}\cdot\frac{\sigma^2}{\tau^2}=\frac{\lambda}{\sigma^2}$`),
          tag(['I47'], R`$(cA)^{-1}=\frac1c A^{-1}$ with $c=\frac{1}{\sigma^2}$`),
        ],
      },
      {
        eq: R`X^\top X=NqI,\qquad q>0`,
        notes: [
          text(R`Example: $N$ measurements. $q>0$: equal feature energy in every direction.`),
          lab(R`each column of $X$ has sum of squares $Nq$, and different columns are orthogonal (off-diagonal entries $0$)`),
          shape(R`D\times D`),
        ],
      },
      {
        eq: R`S=\Big(\frac{Nq}{\sigma^2}+\frac{1}{\tau^2}\Big)^{-1}I\ \longrightarrow\ 0\qquad(N\to\infty)`,
        notes: [
          tag(['I47'], R`$\frac{Nq}{\sigma^2}I+\frac{1}{\tau^2}I=\big(\frac{Nq}{\sigma^2}+\frac{1}{\tau^2}\big)I$, then invert the scalar`),
          lab(R`the scalar in brackets grows with $N$, so its inverse goes to $0$`),
          text('More informative measurements reduce uncertainty.'),
          shape(R`(1\times1)\cdot(D\times D)=D\times D`),
        ],
      },
    ],
  },
  {
    id: 'predictive',
    circ: 6,
    title: 'Mean uncertainty and observation noise',
    why: R`At a new input there are two different uncertainties: how unsure we are about the mean line, and how far a new noisy measurement could land. The first comes from $S$; the second adds the noise $\sigma^2$, which never goes away.`,
    slides: [slide('II', 29, 'Mean uncertainty and observation noise')],
    nonExaminable: true,
    slideNote: R`The slide shows rows 2 and 4. Rows 1 and 3 are added to show which rules give them. The blue line in the figure is not labelled; it is most likely the posterior-mean fit.`,
    pre: [
      text(R`At new input $\mathbf x_*$: $f_*$ is the mean response; $y_*$ is a noisy target.`),
      text(R`$\mathcal D$ is the observed training set. Green: mean bounds. Red: new-observation bounds.`),
      warn(R`Do not confuse $\mathcal D$ (the training set) with $D$ (the number of coefficients).`),
      lab(R`In the figure the green bounds meet at $x=0$: with no intercept, $\mathbf x_*=0$ gives $\mathbf x_*^\top S\mathbf x_*=0$. The red bounds keep a gap there because of $\sigma^2$.`),
    ],
    rows: [
      {
        eq: R`f_*=\mathbf x_*^\top\mathbf w`,
        notes: [lab(R`$\mathbf w$ is uncertain, with posterior covariance $S$`), shape(R`\mathbf x_*:\ D\times1,\quad f_*:\ (1\times D)(D\times1)=1\times1`)],
      },
      {
        eq: R`\operatorname{Var}(f_*\mid\mathcal D)=\mathbf x_*^\top S\,\mathbf x_*`,
        notes: [
          tag(['I48'], R`variance of $\mathbf a^\top\mathbf w$ with $\mathbf a=\mathbf x_*$ and $\operatorname{Cov}(\mathbf w)=S$`),
          shape(R`(1\times D)(D\times D)(D\times1)=1\times1`),
        ],
      },
      {
        eq: R`y_*=f_*+\epsilon_*,\qquad \epsilon_*\sim\mathcal N(0,\sigma^2)`,
        notes: [lab(R`a new measurement adds fresh noise, independent of the training data and of $\mathbf w$`)],
      },
      {
        eq: R`\operatorname{Var}(y_*\mid\mathcal D)=\mathbf x_*^\top S\,\mathbf x_*+\sigma^2`,
        notes: [tag(['I49'], 'independent parts: the variances add'), shape(R`1\times1`)],
      },
    ],
  },
  {
    id: 'more-data',
    title: 'More data reduces parameter uncertainty',
    why: R`This puts the last two slides into one picture: with ten times more data the band around the mean line becomes narrow, but the band for new measurements stays wide, because the noise in a new measurement cannot be averaged away.`,
    slides: [slide('II', 30, 'More data reduces parameter uncertainty')],
    nonExaminable: true,
    slideNote: R`Figure only: two panels, $N=4$ and $N=40$. The row is added to show which term shrinks.`,
    pre: [
      lab(R`Left ($N=4$): wide green bounds that fan out from the origin. Right ($N=40$): green bounds much closer to the blue line; red bounds still a wide band either side.`),
      text('The green bounds narrow as the coefficient becomes better known.'),
      text('The red bounds retain the contribution of observation noise.'),
    ],
    rows: [
      {
        eq: R`\operatorname{Var}(y_*\mid\mathcal D)=\underbrace{\mathbf x_*^\top S\,\mathbf x_*}_{\text{shrinks as }N\text{ grows}}+\underbrace{\htmlClass{c-orange}{\sigma^2}}_{\text{stays}}`,
        notes: [
          lab(R`$S\to0$ (step 5) shrinks the green part; $\sigma^2$ is fixed`),
          shape(R`\text{both terms: }1\times1`),
        ],
      },
    ],
  },
];

export const ridgeMap: Topic = {
  id: 'ridge-map',
  title: 'Ridge regression as MAP estimation',
  short: 'MAP',
  summary: R`Ridge regression derived from probability: Gaussian noise makes maximum likelihood equal to least squares, a Gaussian prior on $\mathbf w$ adds the penalty, and maximising the posterior (MAP) gives the ridge objective with $\lambda=\sigma^2/\tau^2$. Non-examinable extra: the posterior mean $\mathbf m$, covariance $S$, and prediction uncertainty.`,
  identities,
  sections,
};
