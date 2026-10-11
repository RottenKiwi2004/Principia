import { R, con, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I56',
    area: 'Probability',
    tex: R`\mathbb E[g(Z)]=\int g(z)\,p(z)\,dz`,
    note: R`Expectation of a function of a random variable: weight each value $g(z)$ by the density $p(z)$. For a discrete $Z$ the integral becomes $\sum_z g(z)\,P(Z=z)$. For a pair $(\mathbf X,Y)$ it is a double integral against the joint density $p(\mathbf x,y)$.`,
  },
  {
    id: 'I58',
    area: 'Probability',
    tex: R`\mathbb E[c]=c\quad(c\ \text{not random}),\qquad\text{so}\quad\mathbb E\big[\mathbb E[Z]\big]=\mathbb E[Z]`,
    note: R`Expectation of a constant. "Constant" means it does not change under the average being taken: under $\mathbb E_{\mathcal D}$, the numbers $f^*(x)$ and $m(x)$ are constants.`,
  },
  {
    id: 'I61',
    area: 'Probability',
    tex: R`X,\,Y\ \text{independent}\ \Rightarrow\ \mathbb E[XY]=\mathbb E[X]\,\mathbb E[Y]`,
    note: R`Needs independence, unlike linearity (I25). Scalars $X,Y$. Used with fresh noise $\epsilon$, which is independent of the training data and so of anything fitted from it.`,
  },
  {
    id: 'I59',
    area: 'Probability',
    tex: R`\operatorname{Var}(Z)=\mathbb E\big[(Z-\mathbb E[Z])^2\big]=\mathbb E[Z^2]-\big(\mathbb E[Z]\big)^2`,
    note: R`Variance definition: the average squared distance from the mean. Scalar $Z$; the result is $1\times1$ and $\ge0$. If $\mathbb E[Z]=0$ then $\operatorname{Var}(Z)=\mathbb E[Z^2]$.`,
  },
  {
    id: 'I57',
    area: 'Probability',
    tex: R`Z_1,\dots,Z_N\sim p\ \Rightarrow\ \mathbb E\Big[\frac1N\sum_{i=1}^{N}g(Z_i)\Big]=\mathbb E[g(Z)]`,
    note: R`A sample average is an unbiased estimate of the expectation. Follows from I25 because each $Z_i$ has the same distribution as $Z$. Independence is what makes the estimate's spread shrink as $N$ grows.`,
  },
  {
    id: 'I60',
    area: 'Algebra & calculus',
    tex: R`(a+b+c)^2=a^2+b^2+c^2+2ab+2ac+2bc`,
    note: R`Scalars. Squaring a sum of three terms gives the three squares plus every pair twice (the cross-terms).`,
  },
  {
    id: 'I62',
    area: 'Probability',
    tex: R`\mathbb E[Z]=\mathbb E_{\mathbf X}\big[\mathbb E[Z\mid\mathbf X]\big]`,
    note: R`Law of total expectation (tower rule): average at each fixed input first, then average those results over the inputs.`,
  },
  {
    id: 'C9',
    area: 'Conventions',
    tex: R`\mathbb E_{\mathcal D}[\cdot],\quad\mathbb E_{\mathcal V}[\cdot],\quad\mathbb E_{(\mathbf X,Y)\sim P}[\cdot],\quad\mathbb E[\cdot\mid X=x]`,
    note: R`The subscript names what is random and averaged over: training sets $\mathcal D$, validation samples $\mathcal V$, or a fresh pair from $P$. Whatever comes after the bar is held fixed.`,
  },
  {
    id: 'C8',
    area: 'Conventions',
    tex: R`\hat f_{\mathcal D},\quad\hat R_{\text{train}},\quad\hat R_{\text{val}},\quad\widehat{\mathbb E}`,
    note: R`A hat marks something computed from a finite sample of data. The subscript $\mathcal D$ names the training set used for the fit.`,
  },
];

const sections: Section[] = [
  {
    id: 'complexity',
    title: 'Model complexity and held-out error',
    why: R`Training error keeps falling as models get more flexible, but error on new data does not. To explain this picture we need precise names for "error on the training set" and "error on new data", which the rest of this topic builds.`,
    slides: [slide('II', 39, 'Model complexity and held-out error')],
    slideNote: 'Figure with a one-line caption (the warn), the same figure as deck II slide 4 (Validation topic).',
    pre: [
      lab(R`Training Sample curve: falls steadily as complexity grows.`),
      lab(R`Test Sample curve: U-shaped, lowest at the Sweet spot.`),
      warn(R`Larger ridge $\lambda$ means lower complexity: increasing $\lambda$ moves left on this axis.`),
    ],
    rows: [],
  },
  {
    id: 'expectation',
    title: 'Expectation and the sample average',
    why: R`Every risk in this topic is an average of a loss. The true average uses a distribution we do not know; a sample average uses data we do have. This slide gives both, so we can tell which risk is which.`,
    slides: [slide('II', 40, 'Expectation and a sample average')],
    slideNote: 'Rows 1 to 3 are the slide. The unbiasedness note (I57) is added.',
    pre: [text(R`$Z$ has density $p(z)$. $g(z)$ is a quantity computed from a value $z$.`)],
    rows: [
      {
        eq: R`\mathbb E[g(Z)]=\int g(z)\,p(z)\,dz`,
        notes: [
          term('Expectation'),
          lab('distribution: average over possible values, each weighted by how likely it is'),
          tag(['I56'], 'definition of the expectation of a function of $Z$'),
          shape(R`g(z),\ p(z),\ \mathbb E[g(Z)]:\ 1\times1\ \text{(scalars)}`),
        ],
      },
      {
        eq: R`\widehat{\mathbb E}[g(Z)]=\frac1N\sum_{i=1}^{N}g(z_i)`,
        notes: [
          lab(R`sample: estimate from $N$ independent observations $z_i$ of $Z$`),
          tag(['C8'], 'the hat marks an estimate computed from data'),
          tag(['I57'], R`on average over samples it equals $\mathbb E[g(Z)]$: it is unbiased`),
        ],
      },
      {
        eq: R`g(z)=z:\qquad\widehat{\mathbb E}[Z]=\frac1N\sum_{i=1}^{N}z_i`,
        notes: [ex('with $g(z)=z$ this is the sample mean')],
      },
    ],
  },
  {
    id: 'erm',
    title: 'Empirical risk minimisation',
    why: R`Fitting a model means picking the function that does best on the training data. Writing "best" as the training risk shows that least squares is one example of a general recipe, empirical risk minimisation.`,
    slides: [slide('II', 41, 'Empirical risk minimisation')],
    slideNote: 'Rows 1 to 4 are the slide. Row 5, the link to least squares, is added.',
    pre: [
      text(R`Training set $\mathcal D$: $N$ pairs with input $\mathbf x_i$ and target $y_i$, indexed by $i$.`),
      text(R`$f$ predicts a target; $\hat y$ is a prediction. $\ell$ is the squared loss.`),
    ],
    rows: [
      {
        eq: R`\mathcal D=\{(\mathbf x_i,y_i)\}_{i=1}^{N}`,
        notes: [shape(R`\mathbf x_i:\ D\times1\ (\text{row }i\text{ of }X\text{ is }\mathbf x_i^\top),\qquad y_i:\ 1\times1`)],
      },
      {
        eq: R`\ell(y,\hat y)=(y-\hat y)^2`,
        notes: [term('Squared loss'), shape(R`y,\ \hat y,\ \ell:\ 1\times1`)],
      },
      {
        eq: R`\hat R_{\text{train}}(f)=\frac1N\sum_{i=1}^{N}\ell\big(y_i,f(\mathbf x_i)\big)`,
        notes: [
          term('Training risk'),
          lab('mean squared error on the training set'),
          lab(R`it is the sample average of slide 40 with $g$ the loss, over the training pairs`),
          tag(['C8'], 'hat: computed from the training sample'),
          shape(R`f(\mathbf x_i):\ 1\times1,\qquad\hat R_{\text{train}}(f):\ 1\times1`),
        ],
      },
      {
        eq: R`\hat f_{\mathcal D}\in\arg\min_{f\in\mathcal F}\hat R_{\text{train}}(f)`,
        notes: [
          term('ERM'),
          lab(R`$\mathcal F$: candidate function class. $\arg\min$ selects a minimiser.`),
          lab(R`$\in$ because there may be more than one minimiser`),
          lab(R`subscript $\mathcal D$: the training set used for this fit`),
        ],
      },
      {
        eq: R`\mathcal F=\{\mathbf x\mapsto\mathbf w^\top\mathbf x\}:\quad\hat R_{\text{train}}=\frac1N\lVert\mathbf y-X\mathbf w\rVert_2^2`,
        notes: [
          tag(['I1'], R`the sum of squared residuals is the squared norm of $\mathbf y-X\mathbf w$`),
          lab(R`so ERM over linear functions is least squares; the factor $1/N$ does not move the minimiser`),
          lab(R`here $\mathbf x$ includes the leading 1, so it is $(D+1)\times1$`),
          shape(R`X:\ N\times(D+1),\quad\mathbf w:\ (D+1)\times1,\quad\mathbf y-X\mathbf w:\ N\times1`),
        ],
      },
    ],
  },
  {
    id: 'population-risk',
    title: 'Population risk',
    why: R`Low training risk is not the goal: the model was fitted to those exact points. What we care about is the average loss on fresh cases from the real world, the population risk.`,
    slides: [slide('II', 42, 'Population risk: the quantity we care about')],
    pre: [
      text(R`$P$: real-world distribution. $(\mathbf X,Y)$: a fresh pair, independent of training.`),
      text(R`Hold the fitted function fixed. $R(f)$ is its population risk.`),
    ],
    rows: [
      {
        eq: R`R(f)=\mathbb E_{(\mathbf X,Y)\sim P}\big[\ell(Y,f(\mathbf X))\big]`,
        notes: [
          term('Population risk'),
          tag(['C9'], R`the subscript says the average is over a fresh pair drawn from $P$; $f$ is fixed`),
          shape(R`R(f):\ 1\times1`),
        ],
      },
      {
        eq: R`=\iint\ell\big(y,f(\mathbf x)\big)\,p(\mathbf x,y)\,\mathrm dy\,\mathrm d\mathbf x`,
        notes: [
          tag(['I56'], R`expectation of a function of the pair $(\mathbf X,Y)$, with $g(\mathbf x,y)=\ell(y,f(\mathbf x))$`),
          lab(R`$p(\mathbf x,y)$: joint density for continuous inputs and targets`),
          lab('the integral averages loss over real-world cases'),
        ],
      },
    ],
    callouts: [
      {
        heading: 'We cannot compute this',
        text: R`The population distribution is unknown, so $R(f)$ cannot be evaluated. Validation data will estimate unseen performance.`,
      },
    ],
  },
  {
    id: 'validation-risk',
    circ: 1,
    title: 'Validation risk estimates population risk',
    why: R`Since $R(f)$ cannot be computed, we approximate it with a sample average over fresh pairs the model never saw. The derivation shows this average is right on target for the fitted model.`,
    slides: [slide('II', 43, 'Validation estimates unseen performance')],
    slideNote: 'Rows 1, 2 and 6 are the slide. Rows 3 to 5 are added to show why the slide\'s equation holds.',
    pre: [
      text(R`Reserve fresh validation pairs from the same population. $\mathcal V$: validation sample. $N_{\text{val}}$: its size. Superscript val marks its values.`),
    ],
    rows: [
      {
        eq: R`\mathcal V=\{(\mathbf x_i^{\text{val}},y_i^{\text{val}})\}_{i=1}^{N_{\text{val}}}`,
        notes: [lab(R`not used to fit $\hat f_{\mathcal D}$`)],
      },
      {
        eq: R`\hat R_{\text{val}}(\hat f_{\mathcal D})=\frac{1}{N_{\text{val}}}\sum_{i=1}^{N_{\text{val}}}\ell\big(y_i^{\text{val}},\hat f_{\mathcal D}(\mathbf x_i^{\text{val}})\big)`,
        notes: [
          term('Validation risk'),
          lab('evaluate the trained predictor without refitting it'),
          shape(R`\hat R_{\text{val}}:\ 1\times1`),
        ],
      },
      {
        eq: R`\mathbb E_{\mathcal V}\big[\hat R_{\text{val}}(\hat f_{\mathcal D})\mid\mathcal D\big]=\frac{1}{N_{\text{val}}}\sum_{i=1}^{N_{\text{val}}}\mathbb E_{\mathcal V}\big[\ell\big(y_i^{\text{val}},\hat f_{\mathcal D}(\mathbf x_i^{\text{val}})\big)\mid\mathcal D\big]`,
        notes: [
          tag(['C9'], R`average over validation samples, with $\mathcal D$ (and so $\hat f_{\mathcal D}$) held fixed`),
          tag(['I25'], R`the average of a sum is the sum of averages; the constant $1/N_{\text{val}}$ comes out`),
        ],
      },
      {
        eq: R`=\frac{1}{N_{\text{val}}}\sum_{i=1}^{N_{\text{val}}}R(\hat f_{\mathcal D})`,
        notes: [
          lab(R`each validation pair is a fresh draw from $P$, independent of $\mathcal D$, so each term is exactly the population risk of slide 42`),
          tag(['C9'], R`each $(\mathbf x_i^{\text{val}},y_i^{\text{val}})\sim P$, independent of $\mathcal D$: definition of $R$ (slide 42) with $f=\hat f_{\mathcal D}$ fixed`),
        ],
      },
      {
        eq: R`=\frac{1}{N_{\text{val}}}\cdot N_{\text{val}}\,R(\hat f_{\mathcal D})`,
        notes: [lab(R`$N_{\text{val}}$ identical terms`)],
      },
      {
        eq: R`\mathbb E_{\mathcal V}\big[\hat R_{\text{val}}(\hat f_{\mathcal D})\mid\mathcal D\big]=R(\hat f_{\mathcal D})`,
        notes: [
          lab('hold training set $\\mathcal D$ and the fitted model fixed: on average, validation risk equals population risk'),
          tag(['I57'], 'so the validation average is unbiased'),
          shape(R`\text{both sides: }1\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Only before model selection',
        text: R`$\mathbb E$ with subscript $\mathcal V$ averages validation samples before model selection. After you pick the model with the lowest $\hat R_{\text{val}}$, that score tends to be optimistic. Use validation to choose complexity. Keep test data for final assessment.`,
      },
    ],
  },
  {
    id: 'train-vs-val',
    title: 'Training fit and unseen predictions',
    why: R`Numbers make the picture concrete: the most flexible polynomial has almost zero training error but the worst validation error. Training risk rewards memorising, validation risk does not.`,
    slides: [slide('II', 44, 'Training fit and unseen predictions')],
    display: R`\begin{array}{l|ccc}
\text{Degree} & 1 & 3 & 14\\ \hline
\text{Train MSE} & 0.305 & 0.029 & \htmlClass{c-green}{0.002}\\
\text{Validation MSE} & 0.245 & \htmlClass{c-green}{0.057} & \htmlClass{c-red}{0.485}
\end{array}`,
    pre: [
      text(R`Same training set and 200 independent validation pairs for every model.`),
      lab(R`Plots: grey points are training data, blue is the fitted predictor, green is the true mean (a sine-like curve on $[-1,1]$).`),
      lab(R`Degree 1: a straight line that misses the curve. Degree 3: follows the true mean closely. Degree 14: passes near the points but dives below $-2$ near both ends.`),
      warn('The most flexible model wins on training error, but loses on validation.'),
      lab(R`degree 3 has the lowest validation MSE, so validation would choose it`),
    ],
    rows: [],
  },
  {
    id: 'averaging-datasets',
    title: 'Averaging over datasets',
    why: R`One training set gives one fitted curve, partly by luck. To talk about bias and variance we imagine drawing many training sets and refitting each time, then ask how the fits behave on average and how much they spread.`,
    slides: [slide('II', 45, 'What does “averaging over datasets” mean?')],
    pre: [
      text(R`Repeat collecting $N$ examples from the same source and refitting. Keep the function class and ridge strength $\lambda$ fixed within each plot.`),
      lab(R`At scalar input $x$: grey fits, red mean fit $m(x)$, green true mean $f^*(x)$.`),
      lab(R`Weak ridge, $\lambda=0.0001$: grey fits spread out a lot, especially near the ends; the red mean lies on top of the green true mean.`),
      lab(R`Strong ridge, $\lambda=10$: grey fits are tightly bunched, but the red mean is much flatter than the green sine curve.`),
    ],
    rows: [
      {
        eq: R`m(x)=\mathbb E_{\mathcal D}\big[\hat f_{\mathcal D}(x)\big]`,
        notes: [
          term('Mean fit'),
          tag(['C9'], R`$\mathbb E$ with subscript $\mathcal D$ averages training sets; $x$ is fixed`),
          con(R`$m(x)$ is a number at each $x$: it no longer depends on which $\mathcal D$ we drew`),
          shape(R`x,\ \hat f_{\mathcal D}(x),\ m(x):\ 1\times1`),
        ],
      },
      {
        eq: R`f^*(x)=\mathbb E[Y\mid X=x]`,
        notes: [
          term('True mean'),
          tag(['C9'], R`average over the target $Y$ with the input held at $x$`),
          shape(R`f^*(x):\ 1\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'What is random here',
        text: R`Here: fixed inputs, fresh noisy targets. With random inputs, resample those too.`,
      },
    ],
  },
  {
    id: 'bv-model',
    circ: 2,
    nonExaminable: true,
    title: 'Noise model at one input',
    why: R`To split the expected error into pieces we first write down what is random at a fixed input: the fresh target's noise and the training set behind the fit. Everything else is a constant.`,
    slides: [slide('II', 46, 'Bias–variance decomposition at one input')],
    slideNote: 'Row 1 is the slide. Rows 2 and 3 are added to check that $f^*(x)$ is the mean of $Y$ and $\\sigma^2(x)$ its noise variance.',
    pre: [
      text(R`Fix $x$. Fresh target noise $\epsilon$ is independent of the training data.`),
      text(R`$\sigma^2(x)$ is the noise variance at $x$. Keep the training method fixed.`),
    ],
    rows: [
      {
        eq: R`Y=f^*(x)+\epsilon,\qquad\mathbb E[\epsilon\mid x]=0,\qquad\mathbb E[\epsilon^2\mid x]=\sigma^2(x)`,
        notes: [
          lab(R`the target is the true mean plus noise`),
          con(R`with $x$ fixed, $f^*(x)$ is a constant`),
          shape(R`Y,\ f^*(x),\ \epsilon,\ \sigma^2(x):\ 1\times1\ \text{(scalar input }x\text{ here)}`),
        ],
      },
      {
        eq: R`\mathbb E[Y\mid X=x]=\htmlClass{c-orange}{f^*(x)}+\mathbb E[\epsilon\mid x]=f^*(x)`,
        notes: [
          tag(['I25', 'I58'], R`average both sides; the average of the constant $f^*(x)$ is itself`),
          lab('matches the definition of $f^*$ on slide 45'),
        ],
      },
      {
        eq: R`\operatorname{Var}(\epsilon\mid x)=\mathbb E[\epsilon^2\mid x]-\big(\mathbb E[\epsilon\mid x]\big)^2=\sigma^2(x)`,
        notes: [tag(['I59'], R`the noise has mean 0, so its second moment is its variance`)],
      },
    ],
  },
  {
    id: 'bv-split',
    circ: 3,
    nonExaminable: true,
    title: 'Add and subtract',
    why: R`The error $Y-\hat f_{\mathcal D}(x)$ mixes three sources. Adding and subtracting the true mean and the mean fit separates them into pieces that each depend on only one random thing, so each can be averaged on its own.`,
    slides: [slide('II', 46, 'Bias–variance decomposition at one input')],
    slideNote: 'Row 1 is the slide. Row 2 checks it. The short names $a$ and $b$ in row 3 are added to keep the next steps readable.',
    pre: [term('Add and subtract the true mean and the mean fit')],
    rows: [
      {
        eq: R`Y-\hat f_{\mathcal D}(x)=\underbrace{f^*(x)-m(x)}_{\text{mean error}}+\underbrace{m(x)-\hat f_{\mathcal D}(x)}_{\text{fit fluctuation}}+\epsilon`,
        notes: [
          lab(R`replace $Y$ by $f^*(x)+\epsilon$, then insert $-m(x)+m(x)=0$`),
          shape(R`\text{every term: }1\times1`),
        ],
      },
      {
        eq: R`\big(f^*-m\big)+\big(m-\hat f_{\mathcal D}\big)+\epsilon=f^*+\epsilon-\hat f_{\mathcal D}=Y-\hat f_{\mathcal D}`,
        notes: [lab(R`check: the two $m(x)$ terms cancel (all at the same $x$)`)],
      },
      {
        eq: R`Y-\hat f_{\mathcal D}(x)=a+b+\epsilon,\qquad a=\htmlClass{c-orange}{f^*(x)-m(x)},\quad b=m(x)-\hat f_{\mathcal D}(x)`,
        notes: [
          con(R`$a$ has no $\mathcal D$ and no $\epsilon$ in it: a constant`),
          lab(R`$b$ is random only through the training set $\mathcal D$`),
          lab(R`$\epsilon$ is random only through the fresh target`),
        ],
      },
    ],
  },
  {
    id: 'bv-square',
    circ: 4,
    nonExaminable: true,
    title: 'Square, then average',
    why: R`The expected squared error is what we want to understand. Squaring gives six terms, and linearity lets us average each one separately.`,
    slides: [slide('II', 46, 'Bias–variance decomposition at one input')],
    slideNote: 'The slide says "Square and average". The six-term expansion is added to show I60 and I25.',
    rows: [
      {
        eq: R`\big(Y-\hat f_{\mathcal D}(x)\big)^2=(a+b+\epsilon)^2=a^2+b^2+\epsilon^2+2ab+2a\epsilon+2b\epsilon`,
        notes: [tag(['I60'], R`three squares plus three cross-terms`), shape(R`\text{each term: }1\times1`)],
      },
      {
        eq: R`\mathbb E_{\mathcal D,Y}\big[(Y-\hat f_{\mathcal D}(x))^2\mid X=x\big]=\mathbb E[a^2]+\mathbb E[b^2]+\mathbb E[\epsilon^2]+2\,\mathbb E[ab]+2\,\mathbb E[a\epsilon]+2\,\mathbb E[b\epsilon]`,
        notes: [
          tag(['C9'], R`subscript $\mathcal D,Y$: average over training sets and the fresh target, with $x$ held fixed`),
          tag(['I25'], R`average of a sum is the sum of averages; the constant 2 comes out`),
        ],
      },
    ],
  },
  {
    id: 'bv-cross',
    circ: 5,
    nonExaminable: true,
    title: 'Cross-terms vanish',
    why: R`The three cross-terms are where the pieces could interfere. Showing that each averages to zero leaves a clean sum of three squares, one per source of error.`,
    slides: [slide('II', 46, 'Bias–variance decomposition at one input')],
    slideNote: 'The slide states the two zero means (rows 1 and 3). The term-by-term steps are added so each rule is visible.',
    pre: [text(R`Cross-terms vanish: the fluctuations have mean zero, and fresh noise is independent of the fitted predictor.`)],
    rows: [
      {
        eq: R`\mathbb E_{\mathcal D}[b]=\mathbb E_{\mathcal D}\big[m(x)-\hat f_{\mathcal D}(x)\big]=\htmlClass{c-orange}{m(x)}-\mathbb E_{\mathcal D}\big[\hat f_{\mathcal D}(x)\big]=m(x)-m(x)=0`,
        notes: [
          tag(['I25', 'I58'], R`linearity, and $m(x)$ is a constant under $\mathbb E_{\mathcal D}$`),
          lab(R`then use the definition $m(x)=\mathbb E_{\mathcal D}[\hat f_{\mathcal D}(x)]$`),
        ],
      },
      {
        eq: R`2\,\mathbb E[ab]=2a\,\mathbb E_{\mathcal D}[b]=2a\cdot0=0`,
        notes: [tag(['I25'], R`$a$ is a constant, so it comes out of the average`)],
      },
      {
        eq: R`\mathbb E[\epsilon\mid x]=0`,
        notes: [lab('noise has mean zero (from the model)')],
      },
      {
        eq: R`2\,\mathbb E[a\epsilon]=2a\,\mathbb E[\epsilon\mid x]=2a\cdot0=0`,
        notes: [tag(['I25'], R`$a$ is a constant, so it comes out of the average`)],
      },
      {
        eq: R`2\,\mathbb E[b\epsilon]=2\,\mathbb E_{\mathcal D}[b]\;\mathbb E[\epsilon\mid x]=2\cdot0\cdot0=0`,
        notes: [
          tag(['I61'], R`fresh noise $\epsilon$ is independent of the training data, so of $b$`),
          warn('this is the only step that needs independence; the others need only linearity'),
        ],
      },
    ],
  },
  {
    id: 'bv-result',
    circ: 6,
    nonExaminable: true,
    title: 'Bias squared, variance and noise',
    why: R`What is left are three non-negative pieces with clear meanings. This tells us which part of the error a modelling choice such as $\lambda$ can reduce, and which part no model can remove.`,
    slides: [slide('II', 46, 'Bias–variance decomposition at one input')],
    slideNote: 'Rows 1 to 3 name each surviving term; the final display is the slide.',
    display: R`\mathbb E_{\mathcal D,Y}\big[(Y-\hat f_{\mathcal D}(x))^2\mid X=x\big]=\underbrace{\big(m(x)-f^*(x)\big)^2}_{\text{bias}^2}+\underbrace{\mathbb E_{\mathcal D}\big[(\hat f_{\mathcal D}(x)-m(x))^2\big]}_{\text{variance}}+\underbrace{\sigma^2(x)}_{\text{noise}}`,
    rows: [
      {
        eq: R`\mathbb E[a^2]=a^2=\big(f^*(x)-m(x)\big)^2=\big(m(x)-f^*(x)\big)^2`,
        notes: [
          tag(['I58'], R`$a^2$ is a constant`),
          lab('squaring removes the sign, so the order inside does not matter'),
          term('Bias squared'),
          lab('how far the average fit is from the truth'),
        ],
      },
      {
        eq: R`\mathbb E_{\mathcal D}[b^2]=\mathbb E_{\mathcal D}\big[(\hat f_{\mathcal D}(x)-m(x))^2\big]=\operatorname{Var}_{\mathcal D}\big(\hat f_{\mathcal D}(x)\big)`,
        notes: [
          tag(['I59'], R`with $Z=\hat f_{\mathcal D}(x)$ and $\mathbb E_{\mathcal D}[Z]=m(x)$, this is the variance definition`),
          term('Variance'),
          lab('how much the fit at $x$ changes from one training set to another'),
        ],
      },
      {
        eq: R`\mathbb E[\epsilon^2\mid x]=\sigma^2(x)`,
        notes: [
          term('Noise'),
          lab('from the model in step 2; no choice of $f$ can remove it'),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Link to slide 45',
        text: R`Weak ridge: the mean fit sits on the true mean (small bias squared) but the fits spread widely (large variance). Strong ridge: the fits agree with each other (small variance) but their mean is too flat (large bias squared).`,
      },
    ],
  },
  {
    id: 'bv-population',
    circ: 7,
    nonExaminable: true,
    title: 'Bias–variance and population risk',
    why: R`The decomposition was for one fixed input. Averaging it over real-world inputs connects it to the population risk, the quantity we actually care about, averaged over the training sets we might have drawn.`,
    slides: [slide('II', 47, 'Bias–variance explains population risk')],
    slideNote: 'Row 3 is the slide. Rows 1 and 2 are added to show how the fixed-input result is averaged over inputs.',
    pre: [text(R`Population risk averages fresh cases for one trained predictor. Now also average over possible training sets $\mathcal D$.`)],
    rows: [
      {
        eq: R`\mathbb E_{\mathcal D}\big[R(\hat f_{\mathcal D})\big]=\mathbb E_{\mathcal D}\Big[\mathbb E_{\mathbf X}\big[\mathbb E_Y[(Y-\hat f_{\mathcal D}(\mathbf X))^2\mid\mathbf X]\big]\Big]`,
        notes: [
          tag(['I62'], R`population risk with squared loss: average over $Y$ at each input, then over inputs`),
          shape(R`\text{all: }1\times1`),
        ],
      },
      {
        eq: R`=\mathbb E_{\mathbf X}\Big[\mathbb E_{\mathcal D,Y}\big[(Y-\hat f_{\mathcal D}(\mathbf X))^2\mid\mathbf X\big]\Big]`,
        notes: [lab(R`the fresh input $\mathbf X$ is independent of $\mathcal D$, so the two averages can be taken in either order`)],
      },
      {
        eq: R`\mathbb E_{\mathcal D}\big[R(\hat f_{\mathcal D})\big]=\mathbb E_{\mathbf X}\big[\text{bias}^2(\mathbf X)+\text{variance}(\mathbf X)+\text{noise}(\mathbf X)\big]`,
        notes: [
          lab('the inner average is exactly step 6, at input $\\mathbf X$'),
          lab('average these terms over real-world inputs $\\mathbf X$'),
        ],
      },
    ],
    callouts: [
      {
        heading: 'Validation estimates the risk of a particular fitted model',
        text: R`Bias–variance describes average risk as the training sample changes. Validation estimates risk for the fitted model obtained from one sample.`,
      },
    ],
  },
  {
    id: 'ridge-experiment',
    nonExaminable: true,
    title: 'A controlled ridge experiment',
    why: R`In real data we never know $f^*$, so bias and variance cannot be measured. A simulation with a known true mean lets us compute all three pieces and watch how they move as $\lambda$ changes.`,
    slides: [slide('II', 48, 'A controlled ridge experiment')],
    slideNote: 'The shapes of $\\Phi$, $\\mathbf y$ and $\\mathbf w$ and the noise-term value are worked out from the slide\'s numbers.',
    rows: [
      {
        eq: R`y_i=\sin(\pi x_i)+\epsilon_i,\qquad\epsilon_i\sim\mathcal N(0,\sigma^2)`,
        notes: [
          lab(R`18 fixed inputs across $[-1,1]$. True mean: $f^*(x)=\sin(\pi x)$.`),
          lab(R`redraw independent Gaussian noise $\epsilon_i$ and refit on each new dataset`),
          lab(R`$\sigma$ is the noise standard deviation. Compare $\sigma=0.25$ with $\sigma=1$.`),
          con(R`the noise term is the same at every $x$: $\sigma^2(x)=\sigma^2$`),
        ],
      },
      {
        eq: R`J(\mathbf w)=\lVert\mathbf y-\boldsymbol\Phi\mathbf w\rVert_2^2+\lambda\sum_{j=1}^{9}w_j^2`,
        notes: [
          term('Degree-9 polynomial model, same fitting objective'),
          lab(R`$J$: fitting cost. $\boldsymbol\Phi$: polynomial design matrix. $\mathbf y$: target vector. $\lambda$: shrinkage strength.`),
          tag(['I1'], R`the first term is the sum of squared residuals`),
          warn(R`the sum starts at $j=1$: intercept $w_0$ is unpenalised`),
          shape(R`\boldsymbol\Phi:\ 18\times10\ (\text{columns }1,x,\dots,x^9),\quad\mathbf w:\ 10\times1,\quad\mathbf y:\ 18\times1`),
        ],
      },
    ],
    callouts: [
      {
        heading: 'How the curves are made',
        text: R`Curves average repeated datasets and fresh noise at 121 fixed inputs.`,
      },
    ],
  },
  {
    id: 'ridge-strength',
    nonExaminable: true,
    title: 'Ridge strength and expected error',
    why: R`This is the bias–variance trade-off as a picture: stronger shrinkage lowers variance but raises bias. Where the total is lowest depends on how noisy the data is, which is why $\lambda$ must be chosen, not fixed in advance.`,
    slides: [
      slide('II', 49, 'Ridge strength and expected error'),
      slide('II', 50, 'More noise changes the ridge trade-off'),
    ],
    slideNote: R`The minima are as printed on the slides. The noise row ($\sigma^2$) is computed, and the curve descriptions are read from the plots.`,
    display: R`\begin{array}{l|cc}
 & \sigma=0.25 & \sigma=1\\ \hline
\text{noise }\sigma^2 & 0.0625 & 1\\
\text{best }\lambda\text{ on the grid} & \approx0.32 & \approx2.51\\
\text{expected MSE at best }\lambda & \approx0.091 & \approx1.237
\end{array}`,
    pre: [
      lab(R`Horizontal axis: $\log_{10}\lambda$ from $-4$ to $2$, i.e. $\lambda$ from $0.0001$ to $100$. Larger $\lambda$ means stronger shrinkage.`),
      lab(R`Four curves: bias squared, variance, noise (flat), and expected MSE (their sum).`),
    ],
    rows: [
      {
        eq: R`\text{Expected MSE}=\text{bias}^2+\text{variance}+\text{noise}`,
        notes: [lab(R`averaged over the 121 inputs, as in step 7`), shape(R`\text{each: }1\times1`)],
      },
      {
        eq: R`\sigma=0.25`,
        notes: [
          lab(R`variance is small at every $\lambda$, so the expected MSE stays close to the noise level until about $\lambda=1$, then rises with the bias to about $0.5$`),
          text(R`Stronger shrinkage reduces variance but eventually adds too much bias. An optimum need not lie in the interior for every problem.`),
        ],
      },
      {
        eq: R`\sigma=1`,
        notes: [
          lab(R`variance starts near $0.5$ for small $\lambda$ and falls; bias squared rises; the expected MSE dips to its minimum between them`),
          text(R`More noise raises the variance and noise floor. In practice, choose $\lambda$ using validation. These curves use known simulated truth.`),
          lab(R`more noise moves the best $\lambda$ up, from about $0.32$ to about $2.51$`),
        ],
      },
    ],
  },
  {
    id: 'learner',
    title: 'Choosing a function by minimising cost',
    why: R`This slide names the three ingredients every method in the course shares. Seeing least squares and ridge as "objective + function class + optimiser" makes new methods easier to place.`,
    slides: [slide('II', 53, 'Choosing a function by minimising cost')],
    slideNote: R`The diagram is Data into a Learner box (Objective, Hypothesis space, Optimizer), with Compute feeding in, and $f$ out. Rows 1 and 2 are added to link it to this lecture.`,
    pre: [
      term('Objective'),
      text('A cost scores task performance on the training set.'),
      term('Function class'),
      text(R`Candidates for prediction. $f$ denotes one function. $\mathbf w$ denotes its parameter vector.`),
      term('Optimisation'),
      text('Choose parameters that minimise the training cost.'),
      lab(R`Hypothesis space on the diagram is the function class $\mathcal F$.`),
    ],
    rows: [
      {
        eq: R`\hat{\mathbf w}\in\arg\min_{\mathbf w}J(\mathbf w)`,
        notes: [
          lab(R`e.g. $J=\hat R_{\text{train}}$ (least squares) or $J$ with the ridge penalty; the optimiser can be the closed-form normal equations`),
        ],
      },
      {
        eq: R`\arg\max_{\mathbf w}\ \text{reward}(\mathbf w)=\arg\min_{\mathbf w}\ \big(-\text{reward}(\mathbf w)\big)`,
        notes: [lab('a reward measures desirability and is maximised; maximising it is minimising its negative')],
      },
    ],
  },
];

export const generalisation: Topic = {
  id: 'generalisation',
  title: 'Generalisation: risk and bias–variance',
  short: 'Bias–var',
  summary: R`From training risk to population risk: empirical risk minimisation, why validation risk estimates $R(f)$, and the (non-examinable) bias–variance decomposition with a ridge experiment showing how $\lambda$ trades bias against variance.`,
  identities,
  sections,
};
