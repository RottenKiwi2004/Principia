import { R, con, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Section, Topic } from 'principia';

const identities: Identity[] = [
  {
    id: 'I25',
    area: 'Probability',
    tex: R`\mathbb E[aX+bY+c]=a\,\mathbb E[X]+b\,\mathbb E[Y]+c`,
    note: R`Linearity of expectation. $a,b,c$ are constants (not random); $X,Y$ are scalar random variables. It always holds, independence is NOT needed. It extends to any number of terms.`,
  },
  {
    id: 'I26',
    area: 'Probability',
    tex: R`\operatorname{Var}(aZ+b)=a^2\operatorname{Var}(Z)`,
    note: R`$a,b$ constants, $Z$ scalar. Shifting by $b$ does not change the spread; scaling by $a$ scales the variance by $a^2$ (the standard deviation by $|a|$). Also holds for a sample variance over the training examples.`,
  },
];

const sections: Section[] = [
  {
    id: 'overfitting',
    title: 'Underfitting and overfitting',
    why: R`A model that is too simple misses the pattern; one that is too flexible memorises the noise in the training points. Both predict badly on new data, so we need a way to measure performance on data the model has not seen.`,
    slides: [slide('II', 2, 'Overfitting, in images')],
    slideNote: 'Figure only: three classification boundaries and three regression curves.',
    pre: [
      text(R`Classification (top row): a straight-line boundary that cuts through both classes (underfitting), a smooth curve that separates them (just right), and a very wiggly boundary that loops around individual points (overfitting).`),
      text(R`Regression (bottom row): a smooth arc that misses the shape of the points, a curve that follows the shape, and a curve with large swings between the points.`),
      term('Overfitting'),
      lab('the overfitted model fits its training points best but is the least believable between them'),
    ],
    rows: [],
  },
  {
    id: 'complexity',
    title: 'Model complexity and held-out error',
    why: R`Training error always improves as the model gets more flexible, so it cannot tell us when to stop. Error on held-out data first falls and then rises, and its lowest point is the complexity we want.`,
    slides: [slide('II', 4, 'Model complexity and held-out error')],
    slideNote: 'Figure with a one-line caption (the warn). The same figure appears again as deck II slide 39 (Generalisation topic).',
    pre: [
      text(R`Horizontal axis: model complexity, from low to high. Vertical axis: prediction error.`),
      lab(R`Training Sample curve (cyan): keeps going down as complexity grows.`),
      lab(R`Test Sample curve (red): U-shaped. It falls, reaches a minimum, then rises again.`),
      term('Sweet spot'),
      lab(R`the vertical line at the minimum of the held-out (test) error`),
      warn(R`Larger ridge $\lambda$ means LOWER complexity. So increasing $\lambda$ moves you to the LEFT on this axis.`),
    ],
    rows: [],
  },
  {
    id: 'three-roles',
    title: 'Training, validation and test data',
    why: R`We use data for three different jobs: fitting $\mathbf w$, choosing settings like $\lambda$, and reporting a final score. If one set does two jobs, the score is too optimistic, so each job gets its own data.`,
    slides: [slide('II', 5, 'Training, validation and test data'), slide('I', 59, 'Three roles for your data')],
    slideNote: 'Deck II slide 5 is a flow diagram: a shuffled dataset is split into training, validation and test sets; several models are trained, evaluated on validation, the best is picked, and only that model gets a final evaluation on the test set.',
    pre: [
      term('Training data'),
      text(R`Fit the parameters (e.g. $\mathbf w$) and any learned preprocessing (e.g. the means and standard deviations used to standardise).`),
      term('Validation data'),
      text(R`Choose $\lambda$ and other modelling decisions (hyperparameters, polynomial degree, which features).`),
      term('Test data'),
      text(R`Assess the model once, after its choices are fixed. Reserve it for evaluating the final modelling procedure.`),
      lab(R`parameter: learned by the fit ($\mathbf w$). Hyperparameter: chosen by you, using validation ($\lambda$).`),
    ],
    rows: [],
  },
  {
    id: 'cross-validation',
    title: 'K-fold cross-validation',
    why: R`A single validation split wastes data and gives a noisy score. Rotating which part is held out uses every example for validation once, and averaging the $K$ scores gives a steadier basis for comparing candidate $\lambda$ values.`,
    slides: [slide('I', 58, 'Cross-validation and final evaluation'), slide('II', 8, 'Choose a split that matches deployment')],
    slideNote: R`The slides state the averaging in words. The formula in row 2 is added; $\hat R_{\text{val}}$ is the validation risk defined on deck II slide 43.`,
    pre: [
      text(R`$K$ is the number of folds. Split the training data into $K$ equal parts.`),
      text(R`Fit on $K-1$ folds and score the remaining fold. Rotate the held-out fold so each fold is scored once.`),
      lab(R`slide 58 figure: five bars, each with a different block marked Val.`),
    ],
    rows: [
      {
        eq: R`\text{fit }k:\ \text{train on all folds except }k,\ \text{score on fold }k,\qquad k=1,\dots,K`,
        notes: [lab(R`$K$ separate fits for each candidate $\lambda$`)],
      },
      {
        eq: R`\mathrm{CV}(\lambda)=\frac1K\sum_{k=1}^{K}\hat R^{(k)}_{\text{val}}(\lambda)`,
        notes: [
          lab(R`average the held-out score over all $K$ fits`),
          shape(R`\hat R^{(k)}_{\text{val}}(\lambda):\ 1\times1\ \text{(scalar)},\qquad \mathrm{CV}(\lambda):\ 1\times1`),
        ],
      },
      {
        eq: R`\hat\lambda=\arg\min_{\lambda}\ \mathrm{CV}(\lambda)`,
        notes: [lab(R`compare candidate $\lambda$ values using this average and keep the best one`)],
      },
    ],
  },
  {
    id: 'final-evaluation',
    title: 'Final evaluation',
    why: R`Once $\lambda$ is chosen, the validation score has been used to make a decision, so it is no longer an honest estimate. A test set that played no part in any choice gives the one score we can report.`,
    slides: [
      slide('I', 58, 'Cross-validation and final evaluation'),
      slide('II', 6, 'Final evaluation'),
      slide('I', 59, 'Three roles for your data'),
    ],
    slideNote: R`Deck II slide 6 is a flow diagram: pick the best parameter values on validation, retrain on training plus validation data, then one final evaluation on the test dataset gives the final accuracy. The background on the slide 59 figure is a reading of the plot and its linked source.`,
    pre: [
      text(R`Then freeze the modelling choices.`),
      text(R`Optionally refit on training and validation data together (all development data).`),
      text(R`Evaluate once on the untouched test set. Further choices need fresh validation.`),
      warn(R`Repeated test feedback: changing the model in response to test results uses that set for validation. The test score is then optimistic.`),
      text(R`Slide 59 figure, Don't do this at work: cumulative submissions to the ImageNet test server, excluding official challenges, early 2013 to 05/2015. Entries from the authors of arXiv 1501.02876 (blue) shoot up from late 2014 to about 200, more than all other accounts together (green, about 110).`),
      lab(R`Baidu / ImageNet (2015): the team submitted to the test server far more often than the rules allowed, which is tuning on the test set.`),
    ],
    rows: [],
  },
  {
    id: 'standardise',
    circ: 1,
    title: 'Standardising a feature',
    why: R`Ridge penalises every $w_j$ by the same $\lambda$, which is only fair if the features are on comparable scales. Standardising puts every feature at mean 0 and variance 1 before we regularise.`,
    slides: [slide('II', 7, 'Standardise features before regularising')],
    slideNote: 'Row 1 is the slide. Rows 2 and 3 are added to show why the result has mean 0 and unit variance.',
    pre: [text(R`Feature $j$: training mean $\mu_j$ and standard deviation $s_j>0$.`)],
    rows: [
      {
        eq: R`\widetilde x_j=\frac{x_j-\mu_j}{s_j}`,
        notes: [
          term('Standardisation'),
          lab(R`applied to every example $i$: $\widetilde x_{ij}=(x_{ij}-\mu_j)/s_j$`),
          con(R`$\mu_j$ and $s_j$ are fixed numbers, computed from the training examples only`),
          shape(R`x_{ij},\ \mu_j,\ s_j,\ \widetilde x_{ij}:\ 1\times1\ \text{(scalars)}`),
        ],
      },
      {
        eq: R`\frac1N\sum_{i=1}^{N}\widetilde x_{ij}=\frac{1}{s_j}\Big(\frac1N\sum_{i=1}^{N}x_{ij}-\htmlClass{c-orange}{\mu_j}\Big)=\frac{\mu_j-\mu_j}{s_j}=0`,
        notes: [
          tag(['I16'], R`pull the constant $1/s_j$ out of the sum; $\sum_i\mu_j=N\mu_j$`),
          lab(R`$\mu_j=\frac1N\sum_i x_{ij}$ is the training mean, so the bracket is zero`),
        ],
      },
      {
        eq: R`\operatorname{Var}(\widetilde x_j)=\frac{1}{s_j^2}\operatorname{Var}(x_j)=\frac{s_j^2}{s_j^2}=1`,
        notes: [
          tag(['I26'], R`with $a=1/s_j$ and $b=-\mu_j/s_j$: the shift does nothing, the scale divides the variance by $s_j^2$`),
          lab(R`variance over the training examples; $s_j^2$ is exactly that variance`),
          lab('unit variance gives each feature a comparable scale'),
        ],
      },
    ],
  },
  {
    id: 'same-predictions',
    circ: 2,
    title: 'Rescaling leaves predictions unchanged',
    why: R`To see why scale matters for ridge, change a feature's units and compensate in its weight. The model makes exactly the same predictions, so the data-fit term cannot tell the two versions apart.`,
    slides: [slide('II', 7, 'Standardise features before regularising')],
    slideNote: 'The slide gives the substitution (row 2). Rows 1 and 3 are added to show why the predictions do not change.',
    pre: [text(R`Scale feature $x_j$ by a nonzero factor $c$ and its coefficient $w_j$ by $1/c$.`)],
    rows: [
      {
        eq: R`\hat y=w_0+\sum_{j=1}^{D}w_jx_j=\mathbf w^\top\mathbf x`,
        notes: [
          lab(R`prediction for one example; $\mathbf x$ starts with the $\htmlClass{c-red}{1}$ that multiplies $w_0$`),
          shape(R`\mathbf w^\top\mathbf x:\ \big(1\times(D+1)\big)\big((D+1)\times1\big)=1\times1`),
        ],
      },
      {
        eq: R`x_j\mapsto c\,x_j,\qquad w_j\mapsto w_j/c,\qquad c\ne0`,
        notes: [lab(R`$\mapsto$ reads "is replaced by"; only feature $j$ and its own weight change`), shape(R`c:\ 1\times1`)],
      },
      {
        eq: R`\frac{w_j}{c}\,(c\,x_j)=w_j\,x_j`,
        notes: [
          lab(R`the $c$ cancels, so term $j$, and therefore $\hat y$, is unchanged`),
          lab(R`so the squared-error term $\lVert\mathbf y-X\mathbf w\rVert_2^2$ is unchanged too`),
          shape(R`\text{every factor: }1\times1`),
        ],
      },
    ],
  },
  {
    id: 'penalty-changes',
    circ: 3,
    title: 'But the ridge penalty changes',
    why: R`The data-fit term is unchanged, but the penalty sees a different weight. So ridge's answer depends on the units you happened to measure in, which is why we standardise first.`,
    slides: [slide('II', 7, 'Standardise features before regularising')],
    slideNote: 'Rows 1 to 3 are the slide. The units example and the callout are added.',
    pre: [term('Same predictions, different ridge penalty')],
    rows: [
      {
        eq: R`\lambda w_j^2\ \mapsto\ \lambda\Big(\frac{w_j}{c}\Big)^2=\frac{\lambda w_j^2}{c^2}`,
        notes: [
          lab(R`the penalty on weight $j$ is divided by $c^2$`),
          shape(R`\lambda,\ w_j,\ c:\ 1\times1`),
        ],
      },
      {
        eq: R`c=100:\quad \lambda w_j^2\ \mapsto\ \frac{\lambda w_j^2}{10\,000}`,
        notes: [ex(R`100 times larger feature: penalty divided by 10,000`)],
      },
      {
        eq: R`c=0.1:\quad \lambda w_j^2\ \mapsto\ \frac{\lambda w_j^2}{0.01}=100\,\lambda w_j^2`,
        notes: [ex(R`0.1 times the feature: penalty multiplied by 100`)],
      },
    ],
    callouts: [
      {
        heading: 'Why this matters',
        text: R`A feature recorded in large numbers (e.g. centimetres instead of metres, $c=100$) can be used almost for free, while a feature in small numbers is penalised heavily. The fitted model then depends on the choice of units. Plain least squares ($\lambda=0$) is not affected, because only the penalty changed.`,
      },
    ],
  },
  {
    id: 'intercept',
    title: 'Unpenalised intercept',
    why: R`The intercept $w_0$ only sets the overall level of the predictions. Shrinking it towards 0 would drag every prediction towards 0 whatever the data's average, so the penalty leaves it out.`,
    slides: [slide('II', 7, 'Standardise features before regularising')],
    slideNote: 'The display is the slide. The norm form and the note on centred features are added.',
    display: R`\text{Penalty}=\lambda\sum_{j=1}^{D}w_j^2\qquad(\text{no }w_0^2\text{ term})`,
    pre: [term('The intercept has regulariser weight zero'), lab(R`$w_0$: intercept. $D$: number of features.`)],
    rows: [
      {
        eq: R`\lambda\sum_{j=1}^{D}w_j^2=\lambda\,\lVert(w_1,\dots,w_D)\rVert_2^2`,
        notes: [
          tag(['I1'], R`a sum of squares is the squared norm of the vector of weights $w_1,\dots,w_D$`),
          shape(R`(w_1,\dots,w_D)^\top:\ D\times1,\qquad \text{penalty}:\ 1\times1`),
          warn(R`$w_0$ multiplies the column of $\htmlClass{c-red}{1}$s and is left out of the sum (it starts at $j=1$)`),
          lab(R`with centred (mean-zero) features, the fitted $w_0$ is the mean of the training targets`),
        ],
      },
    ],
  },
  {
    id: 'split-deployment',
    title: 'A split that matches deployment',
    why: R`Validation is only useful if it imitates how the model will be used. If the held-out data is easier than real use (for example, it contains devices already seen in training), the validation score will be too optimistic.`,
    slides: [slide('II', 8, 'Choose a split that matches deployment')],
    pre: [
      term('Independent examples: rotate the held-out fold'),
      text(R`$K$-fold cross-validation divides the data into $K$ folds. Train on $K-1$ folds, validate on the remaining fold, and rotate.`),
      term('New people, devices or sites: hold out whole groups'),
      text(R`Keep related observations in the same fold. A row split can test on a device that the model has already seen.`),
      term('Future observations: hold out later times'),
      text(R`Train on earlier data and validate on later data. Choose the split to match the prediction you will make in the real world.`),
    ],
    rows: [],
  },
  {
    id: 'no-leakage',
    title: 'Keeping validation information out of training',
    why: R`Anything computed from the validation examples, even a mean used for standardising, quietly tells the model about them. Then the validation score no longer measures performance on genuinely unseen data.`,
    slides: [slide('II', 9, 'Keep validation information out of training')],
    pre: [
      term('Fit preprocessing inside each training fold'),
      text(R`Estimate means, standard deviations and any feature selection using that fold's training examples only. Apply the fitted transformations unchanged to its validation examples.`),
      warn(R`So $\mu_j$ and $s_j$ in the standardisation step are recomputed for every fold, from that fold's training part.`),
      ex(R`Many sensor readings from each device. Will deployment involve known devices or new devices? For new devices, reserve entire devices for validation. Randomly splitting their readings leaks device-specific information across the split.`),
      text(R`The validation score should reflect what the model can do with genuinely unseen information.`),
    ],
    rows: [],
  },
];

export const validation: Topic = {
  id: 'validation',
  title: 'Validation and test data',
  short: 'Validation',
  summary: R`Why training error cannot pick model complexity, how training, validation and test data each get one job, how $K$-fold cross-validation chooses $\lambda$, and why features must be standardised (with training statistics only) before ridge.`,
  identities,
  sections,
};
