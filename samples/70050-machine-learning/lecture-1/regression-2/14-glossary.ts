import { R, lab, shape, slide, tag, text, warn } from 'principia';
import type { Section, Topic } from 'principia';

const dataModels = [slide('I', 60, 'Symbol glossary: data and models'), slide('II', 51, 'Symbol glossary: data and models')];
const fittingProb = [slide('II', 52, 'Symbol glossary: fitting and probability')];

const sections: Section[] = [
  {
    id: 'data',
    title: 'Data and dimensions',
    why: 'Most shape mistakes come from mixing up $N$ (examples), $D$ (input coordinates) and $M$ (features). Fixing these symbols once lets you check every product in the course by its rows and columns.',
    slides: dataModels,
    slideNote: R`Deck I slide 60 and deck II slide 51 are the same table. The shapes are added, taken from deck I slides 41, 46 and 49.`,
    rows: [
      {
        eq: R`\mathcal D`,
        notes: [
          text('Training dataset.'),
          lab(R`a set of $N$ pairs, $\mathcal D=\{(\mathbf x_i,y_i)\}_{i=1}^N$ (deck II slide 41)`),
          warn(R`curly $\mathcal D$ is the dataset; plain $D$ is a number (the input dimension)`),
        ],
      },
      { eq: R`N`, notes: [text('Number of examples.'), shape(R`1\times1\ \text{(a count)};\ \text{the number of rows of }\mathbf X\text{ and of }\Phi`)] },
      { eq: R`i`, notes: [text('Example index.'), shape(R`i=1,\dots,N`)] },
      {
        eq: R`j`,
        notes: [
          text('Coordinate / feature index.'),
          shape(R`j=0,\dots,D\ \text{(input coordinates, }0\text{ for the intercept)},\quad j=1,\dots,M\ \text{(features)}`),
        ],
      },
      { eq: R`D`, notes: [text('Input dimension.'), shape(R`1\times1\ \text{(a count)};\ \mathbf x_i\text{ has }D\text{ coordinates}`)] },
      {
        eq: R`M`,
        notes: [
          text('Number of features.'),
          shape(R`1\times1\ \text{(a count)};\ \text{the number of columns of }\Phi,\ \text{including an intercept if used}`),
        ],
      },
      { eq: R`q`, notes: [text('Polynomial degree.'), shape(R`1\times1;\quad M=q+1\ \text{features for a scalar input }x\text{, including }\phi_1=1`)] },
      {
        eq: R`\mathbf x_i`,
        notes: [
          text(R`Input vector for example $i$.`),
          shape(R`D\times1;\ \text{with the intercept coordinate }x_{i0}=1\text{ added: }(D+1)\times1`),
          lab(R`row $i$ of $\mathbf X$ is $\mathbf x_i^\top$ with the 1 in front`),
        ],
      },
      { eq: R`y_i`, notes: [text(R`Target for example $i$.`), shape(R`1\times1\ \text{(scalar)}`)] },
      { eq: R`\mathbf y`, notes: [text('Vector of observed targets.'), shape(R`N\times1\ \text{(stacks }y_1,\dots,y_N)`)] },
      {
        eq: R`\mathbf X_i,\ Y_i`,
        notes: [
          text('Random input / target.'),
          shape(R`\mathbf X_i:\ D\times1\ \text{(random vector)},\quad Y_i:\ 1\times1\ \text{(random scalar)}`),
          warn(R`capital letters are random variables; lowercase $\mathbf x_i$, $y_i$ are their observed values (deck II slide 11)`),
          warn(R`bold $\mathbf X_i$ with a subscript is one random input; bold $\mathbf X$ alone is the design matrix`),
        ],
      },
    ],
  },
  {
    id: 'models',
    title: 'Models and representations',
    why: R`These symbols describe the model itself: the parameters it learns, the features it uses and the matrices that stack them. Knowing each one's shape is what lets you check $\mathbf y=\mathbf X\mathbf w+\boldsymbol\epsilon$ and the normal equation term by term.`,
    slides: dataModels,
    slideNote: R`The shapes are added, taken from deck I slides 41, 44, 46, 48 and 49. With features, $\mathbf w$ has one entry per feature.`,
    rows: [
      {
        eq: R`\mathbf w`,
        notes: [
          text('Parameter vector.'),
          shape(R`(D+1)\times1\ \text{(inputs plus intercept)},\quad M\times1\ \text{(with features)}`),
        ],
      },
      { eq: R`w_0`, notes: [text('Intercept.'), shape(R`1\times1;\ \text{the first entry of }\mathbf w`)] },
      {
        eq: R`x_{i0}`,
        notes: [
          text(R`Intercept coordinate ($=1$).`),
          shape(R`1\times1;\ \text{the column of 1s in }\mathbf X`),
          lab(R`it multiplies $w_0$, so the intercept sits inside $\mathbf X\mathbf w$`),
        ],
      },
      {
        eq: R`\hat{\mathbf w}`,
        notes: [
          text('Fitted parameter vector.'),
          shape(R`\text{same shape as }\mathbf w`),
          lab('a hat marks an estimate (deck I slide 29)'),
        ],
      },
      {
        eq: R`\boldsymbol\phi(\mathbf x)`,
        notes: [
          text('Feature vector.'),
          shape(R`M\times1\ \text{(stacks }\phi_1(\mathbf x),\dots,\phi_M(\mathbf x))`),
        ],
      },
      {
        eq: R`\phi_j(\mathbf x)`,
        notes: [
          text(R`Feature $j$.`),
          shape(R`1\times1\ \text{(scalar)},\quad j=1,\dots,M`),
          lab(R`$\phi_1=1$ pairs with the intercept $w_0$ (deck I slide 44)`),
        ],
      },
      {
        eq: R`\mathbf X`,
        notes: [
          text('Input design matrix.'),
          shape(R`N\times(D+1)\ \text{(rows: examples; columns: the 1s, then the }D\text{ input coordinates)}`),
        ],
      },
      {
        eq: R`\Phi`,
        notes: [
          text('Feature design matrix.'),
          shape(R`N\times M\ \text{(row }i\text{ is }\boldsymbol\phi(\mathbf x_i)^\top)`),
        ],
      },
      {
        eq: R`f_{\mathbf w}`,
        notes: [
          text('Prediction function.'),
          lab(R`the subscript $\mathbf w$: its parameters`),
          shape(R`\text{input }\mathbf x\ (D\times1)\ \mapsto\ \text{output }1\times1`),
        ],
      },
      { eq: R`\hat y`, notes: [text('Predicted target.'), shape(R`1\times1\ \text{(scalar)}`)] },
      {
        eq: R`\epsilon_i`,
        notes: [
          text('Residual / observation noise.'),
          shape(R`1\times1;\ \text{stacked: }\boldsymbol\epsilon\ \ N\times1`),
        ],
      },
    ],
  },
  {
    id: 'fitting',
    title: 'Fitting and generalisation',
    why: 'Fitting minimises one number on the training data, but what we care about is error on new data. These symbols keep the two apart: the loss and objective we minimise, and the risks that measure performance.',
    slides: fittingProb,
    slideNote: R`Formulas in the notes are from deck II slides 41 to 43 and 45. All the quantities here are scalars, except $f^*$, which is a function. $\lambda\ge0$ is from deck I slides 54 and 55.`,
    rows: [
      {
        eq: R`\ell`,
        notes: [
          text('Loss for one prediction.'),
          lab(R`squared loss: $\ell(y,\hat y)=(y-\hat y)^2$`),
          shape(R`1\times1`),
        ],
      },
      {
        eq: R`L,\ J`,
        notes: [
          text('Fitting objective.'),
          lab(R`a scalar function of $\mathbf w$, minimised during fitting (e.g. $L$ is the RSS; $J$ is a penalised cost)`),
          shape(R`1\times1`),
        ],
      },
      { eq: R`\lambda`, notes: [text('Penalty strength.'), shape(R`1\times1,\quad \lambda\ge0`)] },
      {
        eq: R`R`,
        notes: [
          text('Population risk.'),
          lab(R`$R(f)=\mathbb E_{(\mathbf X,Y)\sim P}[\ell(Y,f(\mathbf X))]$: average loss over real-world cases`),
          shape(R`1\times1`),
        ],
      },
      {
        eq: R`\hat R_{\text{train}}`,
        notes: [
          text('Training risk.'),
          lab(R`$\hat R_{\text{train}}(f)=\frac1N\sum_{i=1}^N\ell(y_i,f(\mathbf x_i))$: mean loss on the training set`),
          shape(R`1\times1`),
        ],
      },
      {
        eq: R`\hat R_{\text{val}}`,
        notes: [
          text('Validation risk.'),
          lab(R`the same mean loss on held-out validation pairs; it estimates $R$`),
          shape(R`1\times1`),
        ],
      },
      {
        eq: R`K`,
        notes: [
          text('Cross-validation fold count.'),
          shape(R`1\times1\ \text{(a count)}`),
          warn(R`not the kernel $K_h$ and not the neighbour count $k$`),
        ],
      },
      {
        eq: R`f^*`,
        notes: [
          text('True conditional mean.'),
          lab(R`$f^*(x)=\mathbb E[Y\mid X=x]$`),
          shape(R`\text{a function; }f^*(x):\ 1\times1`),
        ],
      },
      {
        eq: R`m(x)`,
        notes: [
          text('Mean fitted prediction.'),
          lab(R`$m(x)=\mathbb E_{\mathcal D}[\hat f_{\mathcal D}(x)]$: the fitted prediction at $x$, averaged over training sets`),
          shape(R`1\times1`),
          warn(R`not the bold $\mathbf m$ (posterior mean)`),
        ],
      },
    ],
  },
  {
    id: 'local',
    title: 'Local methods',
    why: 'Local averaging has its own three symbols: how many neighbours, how wide the kernel, and the resulting weight on each stored example. They are the whole of k-NN and kernel regression.',
    slides: fittingProb,
    slideNote: 'Details are from deck I slides 24 to 27.',
    rows: [
      { eq: R`k`, notes: [text('Nearest-neighbour count.'), shape(R`1\times1\ \text{(a count)}`)] },
      {
        eq: R`h`,
        notes: [text('Kernel bandwidth.'), lab('called the kernel width on deck I slide 25'), shape(R`1\times1,\quad h>0`)],
      },
      {
        eq: R`\alpha_i(x)`,
        notes: [
          text(R`Weight of example $i$ at $x$.`),
          tag(['I9'], R`the weights are $\ge0$ and sum to 1 over $i$ at each $x$`),
          shape(R`1\times1\ \text{for each }i;\ \text{all }N\text{ stacked: }N\times1`),
        ],
      },
    ],
  },
  {
    id: 'probability',
    title: 'Probability and uncertainty',
    why: 'The second deck rewrites least squares and ridge in terms of probabilities. These symbols, and in particular which ones are scalars and which are matrices, are what you need to read the Gaussian likelihood and prior.',
    slides: fittingProb,
    slideNote: R`Shapes are added from deck II slides 19, 24 and 28. $d$ is the number of coordinates of a Gaussian vector (deck II slide 19). Slide 28, where $\mathbf m$ and $S$ appear, is marked non-examinable.`,
    rows: [
      {
        eq: R`P`,
        notes: [text('Population distribution.'), lab('the real-world distribution of fresh pairs; it is unknown (deck II slide 42)')],
      },
      {
        eq: R`p`,
        notes: [text('Probability mass / density.'), lab(R`e.g. $p(y)$, or the joint density $p(\mathbf x,y)$`)],
      },
      {
        eq: R`\mathbb E`,
        notes: [
          text('Expectation.'),
          lab(R`a subscript says what is averaged over, e.g. $\mathbb E_{\mathcal D}$ averages training sets`),
          shape(R`\text{same shape as the quantity inside}`),
        ],
      },
      {
        eq: R`\operatorname{Var},\ \operatorname{Cov}`,
        notes: [
          text('Variance / covariance.'),
          shape(R`\operatorname{Var}\text{ of a scalar}:\ 1\times1,\quad \operatorname{Cov}\text{ of a }d\times1\text{ vector}:\ d\times d`),
        ],
      },
      {
        eq: R`\mu,\ \boldsymbol\mu`,
        notes: [text('Scalar / vector mean.'), shape(R`\mu:\ 1\times1,\quad \boldsymbol\mu:\ d\times1`)],
      },
      {
        eq: R`\Sigma`,
        notes: [
          text('Gaussian covariance matrix.'),
          shape(R`d\times d`),
          lab('diagonal entries: variances. Off-diagonal entries: how coordinates vary together'),
          warn(R`$\Sigma$ the matrix is not the summation sign $\sum$`),
        ],
      },
      { eq: R`\sigma^2`, notes: [text('Observation-noise variance.'), shape(R`1\times1`)] },
      {
        eq: R`\tau^2`,
        notes: [
          text('Prior coefficient variance.'),
          lab(R`prior $\mathbf w\sim\mathcal N(\mathbf 0,\tau^2 I)$: a smaller $\tau^2$ puts more prior mass near zero`),
          shape(R`\tau^2:\ 1\times1;\ \ \tau^2 I:\ \text{square, one row per entry of }\mathbf w`),
        ],
      },
      {
        eq: R`\mathbf m`,
        notes: [
          text('Posterior parameter mean.'),
          lab(R`$\mathbf m=(X^\top X+\lambda I)^{-1}X^\top\mathbf y$ (deck II slide 28)`),
          shape(R`\text{same shape as }\mathbf w`),
        ],
      },
      {
        eq: R`S`,
        notes: [
          text('Posterior parameter covariance.'),
          shape(R`\text{square, one row and column per entry of }\mathbf w\ (D\times D\text{ for centred data with the intercept fitted separately, deck II slide 24})`),
        ],
      },
    ],
  },
];

export const glossary: Topic = {
  id: 'glossary',
  title: 'Symbol glossary',
  short: 'Glossary',
  summary: R`Every symbol from the lecture's glossary slides, with its meaning and its shape: data and dimensions, models, fitting and risk, local methods, and probability.`,
  sections,
};
