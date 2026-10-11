import { R, con, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I33',
    area: 'Probability',
    tex: R`x_1,\dots,x_N\ \text{independent}\ \Rightarrow\ p(x_1,\dots,x_N;\boldsymbol\theta)=\prod_{n=1}^{N}p(x_n;\boldsymbol\theta)`,
    note: R`Independence: the joint density of independent observations is the product of their individual densities. "Drawn from one distribution" means every factor uses the same $p(\cdot\,;\boldsymbol\theta)$. The same holds conditionally: targets independent given $\mathbf w$ give $p(\mathbf y\mid X,\mathbf w)=\prod_i p(y_i\mid\mathbf x_i,\mathbf w)$.`,
  },
  {
    id: 'I34',
    area: 'Algebra & calculus',
    tex: R`\log(ab)=\log a+\log b,\qquad\log\prod_{n=1}^{N}a_n=\sum_{n=1}^{N}\log a_n`,
    note: R`Log of a product is the sum of the logs. Needs every $a_n>0$. $\log$ is the natural log.`,
  },
  {
    id: 'I36',
    area: 'Algebra & calculus',
    tex: R`\log e^{u}=u,\qquad\log a^{k}=k\log a,\qquad\log\frac1a=-\log a`,
    note: R`Log of exp, log of a power. Used as $\log\frac{1}{\sqrt{2\pi\sigma^2}}=-\tfrac12\log(2\pi\sigma^2)$. Needs $a>0$.`,
  },
  {
    id: 'I35',
    area: 'Optimisation',
    tex: R`\operatorname*{arg\,max}_{\boldsymbol\theta}L=\operatorname*{arg\,max}_{\boldsymbol\theta}\log L=\operatorname*{arg\,min}_{\boldsymbol\theta}(-\log L),\qquad\operatorname*{arg\,min}_{\boldsymbol\theta}\big(\alpha f+\beta\big)=\operatorname*{arg\,min}_{\boldsymbol\theta}f\ \ (\alpha>0)`,
    note: R`$\log$ is increasing, so it keeps the location of the maximum; a minus sign turns a maximum into a minimum. Positive scaling $\alpha$ and adding a constant $\beta$ (no $\boldsymbol\theta$ in it) do not move the minimiser.`,
  },
  {
    id: 'I37',
    area: 'Algebra & calculus',
    tex: R`\frac{\mathrm d}{\mathrm dv}\log v=\frac1v,\qquad\frac{\mathrm d}{\mathrm dv}v^{k}=k\,v^{k-1}\ \Big(\text{so }\frac{\mathrm d}{\mathrm dv}\frac1v=-\frac1{v^2}\Big)`,
    note: R`Scalar derivatives of a log and of a power, for $v>0$.`,
  },
  {
    id: 'I38',
    area: 'Probability',
    tex: R`\boldsymbol\Sigma=\operatorname{Cov}(\mathbf Y),\qquad\Sigma_{jj}=\operatorname{Var}(Y_j),\qquad\Sigma_{jk}=\operatorname{Cov}(Y_j,Y_k)=\Sigma_{kj}`,
    note: R`Covariance matrix of a $d\times1$ random vector: $d\times d$ and symmetric, with $\boldsymbol\Sigma=\mathbb E\big[(\mathbf Y-\boldsymbol\mu)(\mathbf Y-\boldsymbol\mu)^\top\big]$, where $\mathbb E$ is the expected (average) value. Diagonal: variances. Off-diagonal: how pairs of coordinates vary together.`,
  },
  {
    id: 'I39',
    area: 'Probability',
    tex: R`\mathbf Y\sim\mathcal N(\boldsymbol\mu,\boldsymbol\Sigma)\ \Rightarrow\ p(\mathbf y)=\frac{1}{(2\pi)^{d/2}\lvert\boldsymbol\Sigma\rvert^{1/2}}\exp\!\Big[-\tfrac12(\mathbf y-\boldsymbol\mu)^\top\boldsymbol\Sigma^{-1}(\mathbf y-\boldsymbol\mu)\Big]`,
    note: R`Multivariate Gaussian. $\mathbf y,\boldsymbol\mu$: $d\times1$; $\boldsymbol\Sigma$: $d\times d$, symmetric positive definite (so invertible, with $\lvert\boldsymbol\Sigma\rvert>0$); $\lvert\boldsymbol\Sigma\rvert$ is its determinant (a scalar). With $d=1$ it is the 1D Gaussian (I32).`,
  },
  {
    id: 'I41',
    area: 'Linear algebra',
    tex: R`\operatorname{diag}(a_1,\dots,a_d)^{-1}=\operatorname{diag}\Big(\frac1{a_1},\dots,\frac1{a_d}\Big),\qquad(\sigma^2 I)^{-1}=\frac1{\sigma^2}I`,
    note: R`Inverse of a diagonal matrix: invert each diagonal entry. Needs every $a_j\ne0$. Shapes: $d\times d$.`,
  },
  {
    id: 'I42',
    area: 'Linear algebra',
    tex: R`\big\lvert\operatorname{diag}(a_1,\dots,a_d)\big\rvert=\prod_{j=1}^{d}a_j,\qquad\lvert\sigma^2I\rvert=(\sigma^2)^d`,
    note: R`Determinant of a diagonal matrix: the product of its diagonal entries. The result is a scalar ($1\times1$).`,
  },
  {
    id: 'I40',
    area: 'Linear algebra',
    tex: R`\mathbf v^\top A\mathbf v=\sum_{j=1}^{d}\sum_{k=1}^{d}A_{jk}v_jv_k\quad\big(=\textstyle\sum_j A_{jj}v_j^2\ \text{if }A\text{ is diagonal}\big)`,
    note: R`A quadratic form is a scalar: $(1\times d)(d\times d)(d\times1)=1\times1$. When $A$ is diagonal only the $j=k$ terms survive.`,
  },
];

const mvnDisplay = R`
p(\mathbf y)=\frac{1}{(2\pi)^{d/2}\,\underbrace{\lvert\boldsymbol\Sigma\rvert^{1/2}}_{\htmlClass{c-green}{1\times1}}}
\exp\!\Big[-\tfrac12\,
\underbrace{(\mathbf y-\boldsymbol\mu)^\top}_{\htmlClass{c-green}{1\times d}}\,
\underbrace{\boldsymbol\Sigma^{-1}}_{\htmlClass{c-green}{d\times d}}\,
\underbrace{(\mathbf y-\boldsymbol\mu)}_{\htmlClass{c-green}{d\times1}}\Big]`;

const sections: Section[] = [
  {
    id: 'likelihood',
    circ: 1,
    title: 'Likelihood of N observations',
    why: R`We want one number that scores how well a parameter setting $\boldsymbol\theta$ explains all the data at once. If the observations are independent, that number is a product of densities, and the best $\boldsymbol\theta$ is the one that makes it largest.`,
    slides: [slide('II', 16, 'Likelihood and the fitting objective')],
    slideNote: R`Row 1, the joint density before it is called $L$, is added to show where the product comes from.`,
    pre: [
      text(R`$N$ observations $x_n$, independently drawn from one distribution.`),
      text(R`$\boldsymbol\theta$ is the model's parameter vector. Hold the data fixed and vary $\boldsymbol\theta$.`),
    ],
    rows: [
      {
        eq: R`p(x_1,\dots,x_N;\boldsymbol\theta)=\prod_{n=1}^{N}p(x_n;\boldsymbol\theta)`,
        notes: [
          tag(['I33'], 'independent draws: the joint density is a product of one factor per observation'),
          lab(R`"$;\boldsymbol\theta$" reads "with parameters $\boldsymbol\theta$"`),
        ],
      },
      {
        eq: R`L(\boldsymbol\theta)=\prod_{n=1}^{N}p(x_n;\boldsymbol\theta)`,
        notes: [
          term('Likelihood'),
          lab(R`same expression, now read as a function of $\boldsymbol\theta$ with the data fixed`),
          warn(R`$L$ is not a distribution over $\boldsymbol\theta$: it need not integrate to 1 over $\boldsymbol\theta$`),
          shape(R`\boldsymbol\theta:\ \text{a vector, e.g. }(\mu,\sigma^2)\text{ is }2\times1;\qquad x_n,\ L(\boldsymbol\theta):\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'nll',
    circ: 2,
    title: 'Log-likelihood and the cost C',
    why: R`Products of many densities are awkward: they get tiny, and differentiating a product is messy. Taking the log turns the product into a sum, which we can differentiate term by term. Flipping the sign gives a cost $C$ to minimise, like the squared-error loss.`,
    slides: [slide('II', 16, 'Likelihood and the fitting objective')],
    rows: [
      {
        eq: R`\log L(\boldsymbol\theta)=\sum_{n=1}^{N}\log p(x_n;\boldsymbol\theta)`,
        notes: [
          term('Log-likelihood'),
          tag(['I34'], 'log of a product: a product becomes a sum'),
          shape(R`\log L(\boldsymbol\theta):\ 1\times1`),
        ],
      },
      {
        eq: R`C(\boldsymbol\theta)=-\log L(\boldsymbol\theta)`,
        notes: [term('Negative log-likelihood'), shape(R`C(\boldsymbol\theta):\ 1\times1`)],
      },
      {
        eq: R`\hat{\boldsymbol\theta}=\operatorname*{arg\,min}_{\boldsymbol\theta}C(\boldsymbol\theta)`,
        notes: [
          term('Maximum likelihood estimate (MLE)'),
          tag(['I35'], R`$\log$ is increasing, so maximising $L$ and minimising $C=-\log L$ give the same $\hat{\boldsymbol\theta}$`),
          lab('fitted parameters minimise negative log-likelihood'),
          shape(R`\hat{\boldsymbol\theta}:\ \text{same shape as }\boldsymbol\theta`),
        ],
      },
    ],
  },
  {
    id: 'gaussian-nll',
    circ: 3,
    title: 'Gaussian negative log-likelihood',
    why: R`To fit a Gaussian to data we need its cost $C(\mu,\sigma^2)$ written out explicitly. Plugging the Gaussian density into the general recipe gives a formula whose second term is a sum of squared errors, the first hint that least squares is maximum likelihood in disguise.`,
    slides: [
      slide('II', 17, 'Gaussian maximum likelihood estimates'),
      slide('II', 15, 'The one-dimensional Gaussian distribution'),
    ],
    slideNote: R`Slide 17 states the final $C(\mu,\sigma^2)$. Rows 1 to 3 are added to show how it comes from the slide 15 density.`,
    pre: [text(R`Fit a Gaussian to $N$ scalar observations. The parameters are $\boldsymbol\theta=(\mu,\sigma^2)$.`)],
    rows: [
      {
        eq: R`p(x_n;\mu,\sigma^2)=\frac{1}{\sqrt{2\pi\sigma^2}}\exp\!\Big[-\frac{(x_n-\mu)^2}{2\sigma^2}\Big]`,
        notes: [
          tag(['I32'], R`the 1D Gaussian at the observation $x_n$; $\sqrt{2\pi}\,\sigma=\sqrt{2\pi\sigma^2}$`),
          shape(R`x_n,\ \mu,\ \sigma^2:\ 1\times1`),
        ],
      },
      {
        eq: R`\log p(x_n;\mu,\sigma^2)=-\tfrac12\log(2\pi\sigma^2)-\frac{(x_n-\mu)^2}{2\sigma^2}`,
        notes: [
          tag(['I34'], 'log of (factor times exp) is log of factor plus log of exp'),
          tag(['I36'], R`$\log\frac{1}{\sqrt{a}}=-\tfrac12\log a$, and $\log e^{u}=u$`),
        ],
      },
      {
        eq: R`C(\mu,\sigma^2)=-\sum_{n=1}^{N}\log p(x_n;\mu,\sigma^2)=\sum_{n=1}^{N}\Big[\tfrac12\log(2\pi\sigma^2)+\frac{(x_n-\mu)^2}{2\sigma^2}\Big]`,
        notes: [
          tag(['I34'], 'the log-likelihood is a sum over observations (previous section)'),
          lab('the minus sign flips both terms to plus'),
        ],
      },
      {
        eq: R`C(\mu,\sigma^2)=\frac N2\log(2\pi\sigma^2)+\frac{1}{2\sigma^2}\sum_{n=1}^{N}(x_n-\mu)^2`,
        notes: [
          tag(['I16'], R`the first term has no $n$ in it: $N$ copies give $\frac N2\log(2\pi\sigma^2)$; $\frac{1}{2\sigma^2}$ comes out of the sum`),
          term('Sum of squared errors'),
          lab(R`the second term is a sum of squares, scaled by $\frac{1}{2\sigma^2}$`),
          shape(R`C:\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'mean',
    circ: 4,
    title: R`Solve for the mean`,
    why: R`The best $\mu$ is where the cost stops decreasing, so its derivative in $\mu$ is zero. Doing this by hand shows that the maximum likelihood mean is simply the average of the data.`,
    slides: [slide('II', 17, 'Gaussian maximum likelihood estimates')],
    slideNote: R`Slide 17 gives the last form of row 4 set to zero (rows 4 and 5) and $\hat\mu$ (row 6). Rows 1 to 3 (term-by-term derivative), the first form in row 4 and the second-derivative check are added.`,
    rows: [
      {
        eq: R`\frac{\partial C}{\partial\mu}=\frac{\partial}{\partial\mu}\Big[\htmlClass{c-orange}{\tfrac N2\log(2\pi\sigma^2)}\Big]+\frac{1}{2\sigma^2}\sum_{n=1}^{N}\frac{\partial}{\partial\mu}(x_n-\mu)^2`,
        notes: [
          tag(['I8'], 'the derivative of a sum is the sum of the derivatives'),
          con(R`$\sigma^2$ is held fixed in a partial derivative with respect to $\mu$`),
        ],
      },
      {
        eq: R`\frac{\partial}{\partial\mu}\Big[\htmlClass{c-orange}{\tfrac N2\log(2\pi\sigma^2)}\Big]=0`,
        notes: [con(R`no $\mu$ in it: constant, so its derivative is zero`)],
      },
      {
        eq: R`\frac{\partial}{\partial\mu}(x_n-\mu)^2=-2(x_n-\mu)`,
        notes: [tag(['I15'], R`chain rule: outer $u^2$, inner $u=x_n-\mu$ with $\frac{\partial u}{\partial\mu}=-1$`)],
      },
      {
        eq: R`\frac{\partial C}{\partial\mu}=-\frac{1}{\sigma^2}\sum_{n=1}^{N}(x_n-\mu)=\frac{N\mu-\sum_{n=1}^{N}x_n}{\sigma^2}`,
        notes: [
          lab(R`$\frac{1}{2\sigma^2}\cdot(-2)=-\frac{1}{\sigma^2}$`),
          tag(['I16'], R`$\sum_n\mu=N\mu$, since $\mu$ does not depend on $n$`),
          shape(R`\frac{\partial C}{\partial\mu}:\ 1\times1`),
        ],
      },
      {
        eq: R`\frac{N\mu-\sum_{n=1}^{N}x_n}{\sigma^2}=0\ \Rightarrow\ N\mu=\sum_{n=1}^{N}x_n`,
        notes: [
          tag(['I14'], 'set the mean derivative to zero'),
          lab(R`multiply both sides by $\sigma^2>0$`),
        ],
      },
      {
        eq: R`\hat\mu=\frac1N\sum_{n=1}^{N}x_n`,
        notes: [term('Sample mean'), lab(R`divide by $N$: the average of the observations`)],
      },
    ],
    callouts: [
      {
        heading: 'Hidden step: a minimum, not a maximum',
        flag: 'I14',
        text: R`Differentiate $\partial C/\partial\mu$ once more. The result is positive, so $C$ curves upwards in $\mu$ and the flat point $\hat\mu$ is its lowest point.`,
        eq: R`\frac{\partial^2C}{\partial\mu^2}=\frac{N}{\sigma^2}>0`,
      },
    ],
  },
  {
    id: 'variance',
    circ: 5,
    title: R`Solve for the variance`,
    why: R`The same zero-derivative recipe, now in $\sigma^2$, gives the maximum likelihood variance. The point to remember is that it divides by $N$, which the slide stresses.`,
    slides: [slide('II', 17, 'Gaussian maximum likelihood estimates')],
    slideNote: R`Slide 17 gives only the result $\hat\sigma^2$. The derivative steps (rows 1 to 3) are added. Writing $v$ for $\sigma^2$ is only a shorthand here, not slide notation.`,
    rows: [
      {
        eq: R`C=\htmlClass{c-orange}{\tfrac N2\log(2\pi)}+\tfrac N2\log v+\frac{S}{2v},\qquad v=\sigma^2,\ \ S=\sum_{n=1}^{N}(x_n-\hat\mu)^2`,
        notes: [
          tag(['I34'], R`$\log(2\pi v)=\log(2\pi)+\log v$`),
          con(R`$\hat\mu$ does not depend on $\sigma^2$, so plug it in; then $S$ is a fixed number`),
          shape(R`v,\ S:\ 1\times1`),
        ],
      },
      {
        eq: R`\frac{\partial C}{\partial v}=0+\frac{N}{2v}-\frac{S}{2v^2}`,
        notes: [
          tag(['I8'], 'differentiate term by term'),
          tag(['I37'], R`$\frac{\mathrm d}{\mathrm dv}\log v=\frac1v$ and $\frac{\mathrm d}{\mathrm dv}\frac1v=-\frac1{v^2}$`),
        ],
      },
      {
        eq: R`\frac{N}{2v}-\frac{S}{2v^2}=0\ \Rightarrow\ Nv=S`,
        notes: [tag(['I14'], 'set the derivative to zero'), lab(R`multiply both sides by $2v^2>0$`)],
      },
      {
        eq: R`\hat\sigma^2=\frac1N\sum_{n=1}^{N}(x_n-\hat\mu)^2`,
        notes: [
          term('Sample variance (MLE uses N)'),
          lab('the average squared distance from the sample mean'),
          warn(R`it divides by $N$. Some statistics courses divide by $N-1$ instead; that is a different (unbiased) estimate, not the MLE.`),
        ],
      },
    ],
  },
  {
    id: 'gaussian-2d',
    title: 'A Gaussian in two dimensions',
    why: R`Outcomes often have several coordinates at once, such as two features of one example. Before the general formula, the 2D picture shows what the mean and covariance do and how probability becomes a volume instead of an area.`,
    slides: [slide('II', 18, 'A Gaussian density in two dimensions')],
    slideNote: R`Slide 18 is a figure with text. The double-integral row is added as the 2D version of the area rule on slide 14.`,
    pre: [
      lab(R`Figure: a bell-shaped surface over a plane. Axes: "First coordinate" and "Second coordinate" (each from $-3$ to $3$) and "Joint density" (0 to $0.2$). The peak is at the centre of the plane, just under $0.2$.`),
      text('Two coordinates describe one outcome.'),
      text('The mean sets the centre. Covariance controls spread and orientation.'),
      text('Probability is volume under the surface over a region of the plane.'),
    ],
    rows: [
      {
        eq: R`\Pr(\mathbf Y\in A)=\iint_A p(y_1,y_2)\,\mathrm dy_1\,\mathrm dy_2`,
        notes: [
          tag(['I31'], R`the 1D "area under the curve" becomes a volume over the region $A$`),
          shape(R`\mathbf y=\begin{bmatrix}y_1\\y_2\end{bmatrix}:\ 2\times1,\qquad p(\mathbf y):\ 1\times1`),
        ],
      },
    ],
  },
  {
    id: 'mvn',
    title: 'The multivariate Gaussian',
    why: R`Regression with $N$ targets, or one example with many coordinates, needs a Gaussian over a whole vector. Its formula has the same structure as the 1D one, with $\sigma^2$ replaced by the matrix $\boldsymbol\Sigma$, so the shapes tell us how each piece generalises.`,
    slides: [slide('II', 19, 'The multivariate Gaussian distribution')],
    slideNote: R`Slide 19 shows $\mathbf Y\sim\mathcal N(\boldsymbol\mu,\boldsymbol\Sigma)$, $\boldsymbol\Sigma=\operatorname{Cov}(\mathbf Y)$ and three contour plots; it does not print the density. The density (display and row 3), the matrix of entries (row 2) and the $d=1$ check (row 5) are added.`,
    display: mvnDisplay,
    pre: [
      text(R`$\mathbf Y$ has $d$ coordinates. $\boldsymbol\mu$ is the mean vector. $\boldsymbol\Sigma$ is the covariance matrix.`),
      lab(R`Figure, contour plots (lines of equal density): (a) "full": long ellipses tilted diagonally; (b) "diagonal": ellipses lined up with the axes, taller than wide; (c) "spherical": circles.`),
      lab(R`Reading: tilt needs non-zero off-diagonal entries; axis-aligned means a diagonal $\boldsymbol\Sigma$; circles mean equal variances, $\boldsymbol\Sigma=\sigma^2I$.`),
    ],
    rows: [
      {
        eq: R`\mathbf Y\sim\mathcal N(\boldsymbol\mu,\boldsymbol\Sigma),\qquad\boldsymbol\Sigma=\operatorname{Cov}(\mathbf Y)`,
        notes: [
          term('Multivariate Gaussian'),
          tag(['I38'], 'covariance matrix of the random vector'),
          shape(R`\mathbf Y,\ \boldsymbol\mu:\ d\times1,\qquad\boldsymbol\Sigma:\ d\times d`),
        ],
      },
      {
        eq: R`\boldsymbol\Sigma=\begin{bmatrix}\operatorname{Var}(Y_1)&\cdots&\operatorname{Cov}(Y_1,Y_d)\\\vdots&\ddots&\vdots\\\operatorname{Cov}(Y_d,Y_1)&\cdots&\operatorname{Var}(Y_d)\end{bmatrix}`,
        notes: [
          tag(['I38'], 'diagonal entries: variances; off-diagonal entries: how coordinates vary together'),
          lab(R`symmetric: $\Sigma_{jk}=\Sigma_{kj}$`),
          shape(R`d\times d`),
        ],
      },
      {
        eq: R`p(\mathbf y)=\frac{1}{(2\pi)^{d/2}\lvert\boldsymbol\Sigma\rvert^{1/2}}\exp\!\Big[-\tfrac12(\mathbf y-\boldsymbol\mu)^\top\boldsymbol\Sigma^{-1}(\mathbf y-\boldsymbol\mu)\Big]`,
        notes: [
          tag(['I39'], 'the multivariate Gaussian density'),
          lab(R`$\lvert\boldsymbol\Sigma\rvert$: the determinant of $\boldsymbol\Sigma$`),
          warn(R`$\lvert\boldsymbol\Sigma\rvert$ is a determinant, not an absolute value`),
          shape(R`\mathbf y-\boldsymbol\mu:\ d\times1,\qquad\boldsymbol\Sigma^{-1}:\ d\times d,\qquad\lvert\boldsymbol\Sigma\rvert,\ p(\mathbf y):\ 1\times1`),
        ],
      },
      {
        eq: R`(\mathbf y-\boldsymbol\mu)^\top\boldsymbol\Sigma^{-1}(\mathbf y-\boldsymbol\mu)`,
        notes: [
          tag(['I40'], 'a quadratic form is a scalar, so it can sit inside exp'),
          lab(R`plays the role of $\frac{(y-\mu)^2}{\sigma^2}$ in 1D`),
          shape(R`(1\times d)(d\times d)(d\times1)=1\times1`),
        ],
      },
      {
        eq: R`d=1:\ \ \boldsymbol\Sigma=\sigma^2,\ \lvert\boldsymbol\Sigma\rvert=\sigma^2,\ \boldsymbol\Sigma^{-1}=\frac1{\sigma^2}\ \Rightarrow\ p(y)=\frac{1}{\sqrt{2\pi\sigma^2}}\exp\!\Big[-\frac{(y-\mu)^2}{2\sigma^2}\Big]`,
        notes: [
          tag(['I32'], 'check: one coordinate gives back the 1D Gaussian'),
          shape(R`\text{all }1\times1`),
        ],
      },
    ],
  },
  {
    id: 'diagonal',
    circ: 6,
    title: 'Diagonal covariance and least squares',
    why: R`This is the bridge to regression. With a diagonal or equal-variance $\boldsymbol\Sigma$, the Gaussian's exponent becomes a (weighted) sum of squares. So minimising the Gaussian negative log-likelihood is minimising squared error, which is how least squares gets a probabilistic meaning.`,
    slides: [slide('II', 20, 'Diagonal covariance and sums of squares')],
    slideNote: R`The determinant (row 3) and the negative log-likelihood (row 5) are added to explain why the slide says "fixed" variances. The explicit $\boldsymbol\Sigma^{-1}$ (rows 2 and 6) is added; the slide only says "$\boldsymbol\Sigma^{-1}$ is its inverse".`,
    rows: [
      {
        eq: R`\boldsymbol\Sigma=\operatorname{diag}(\sigma_1^2,\dots,\sigma_d^2)`,
        notes: [
          lab(R`diagonal $\boldsymbol\Sigma$: $\sigma_j^2$ is coordinate $j$'s variance; all covariances are zero`),
          shape(R`d\times d`),
        ],
      },
      {
        eq: R`\boldsymbol\Sigma^{-1}=\operatorname{diag}\Big(\frac1{\sigma_1^2},\dots,\frac1{\sigma_d^2}\Big)`,
        notes: [
          tag(['I41'], 'inverse of a diagonal matrix: invert each entry'),
          warn(R`needs every $\sigma_j^2>0$`),
          shape(R`d\times d`),
        ],
      },
      {
        eq: R`\lvert\boldsymbol\Sigma\rvert=\prod_{j=1}^{d}\sigma_j^2`,
        notes: [tag(['I42'], 'determinant of a diagonal matrix: product of the diagonal'), shape(R`1\times1`)],
      },
      {
        eq: R`(\mathbf y-\boldsymbol\mu)^\top\boldsymbol\Sigma^{-1}(\mathbf y-\boldsymbol\mu)=\sum_{j=1}^{d}\frac{(y_j-\mu_j)^2}{\sigma_j^2}`,
        notes: [
          tag(['I40'], R`diagonal $A=\boldsymbol\Sigma^{-1}$: only the $j=k$ terms survive, each weighted by $\frac1{\sigma_j^2}$`),
          term('Variance-weighted sum of squares'),
          lab('a coordinate with large variance counts less'),
          shape(R`(1\times d)(d\times d)(d\times1)=1\times1`),
        ],
      },
      {
        eq: R`-\log p(\mathbf y)=\tfrac12(\mathbf y-\boldsymbol\mu)^\top\boldsymbol\Sigma^{-1}(\mathbf y-\boldsymbol\mu)+\htmlClass{c-orange}{\tfrac12\log\lvert\boldsymbol\Sigma\rvert+\tfrac d2\log(2\pi)}`,
        notes: [
          tag(['I34', 'I36'], 'log of (factor times exp), then log of a power and log of exp'),
          con(R`with $\boldsymbol\Sigma$ fixed, the orange terms are constants`),
          lab('so fixed diagonal variances give a variance-weighted sum of squares to minimise'),
          shape(R`1\times1`),
        ],
      },
      {
        eq: R`\boldsymbol\Sigma=\sigma^2I\ \Longrightarrow\ \frac1{\sigma^2}\sum_{j=1}^{d}(y_j-\mu_j)^2=\frac1{\sigma^2}\lVert\mathbf y-\boldsymbol\mu\rVert_2^2`,
        notes: [
          tag(['I41'], R`$(\sigma^2I)^{-1}=\frac1{\sigma^2}I$: every weight is the same`),
          tag(['I1'], 'a sum of squares is the squared norm'),
          shape(R`I:\ d\times d,\qquad\mathbf y-\boldsymbol\mu:\ d\times1,\qquad\lVert\mathbf y-\boldsymbol\mu\rVert_2^2:\ 1\times1`),
        ],
      },
      {
        eq: R`\operatorname*{arg\,min}_{\boldsymbol\mu}\ \frac{1}{2\sigma^2}\lVert\mathbf y-\boldsymbol\mu\rVert_2^2=\operatorname*{arg\,min}_{\boldsymbol\mu}\ \lVert\mathbf y-\boldsymbol\mu\rVert_2^2`,
        notes: [
          tag(['I35'], R`positive scale $\frac{1}{2\sigma^2}$ and added constants do not move the minimiser`),
          term('Ordinary least squares, up to scale'),
          lab(R`fixed equal variances give ordinary least squares`),
          ex(R`slides 22 and 23 make $\boldsymbol\mu$ depend on the weights $\mathbf w$, which turns this into least-squares regression`),
        ],
      },
    ],
  },
];

export const maximumLikelihood: Topic = {
  id: 'maximum-likelihood',
  title: 'Maximum likelihood and the Gaussian',
  short: 'MLE',
  summary: R`Fit a model by minimising the negative log-likelihood $C(\boldsymbol\theta)$. For a Gaussian this gives the sample mean and the $\frac1N$ sample variance; for a multivariate Gaussian with fixed diagonal or equal variances it gives a (weighted) sum of squares, i.e. least squares.`,
  identities,
  sections,
};
