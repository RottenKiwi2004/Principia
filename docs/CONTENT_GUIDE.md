# Writing notes

A notebook is any folder. Every file in it shows up in the Explorer, in folder order (sub-folders first, then
files, with numbers in natural order: `2-…` before `10-…`), and opens as a tab. `samples/70050-machine-learning`
uses every format below; start from it.

## What each file becomes

| File | Shown as |
|---|---|
| `.ts`, `.tsx`, `.js`, `.jsx` exporting a **Topic** (default or named export) | a structured topic: see below |
| `.tsx`, `.jsx`, `.js` with a **default-exported component** | that component, on a sheet; `export const layout = 'full'` gives it the whole panel |
| `.md` | Markdown: GFM tables, `$inline$` and `$$display$$` math, front matter is hidden |
| `.mdx` | Markdown plus JSX: import components and place them anywhere in the text |
| `.png`, `.svg`, `.jpg`, …, `.pdf`, `.mp4`, `.mp3`, … | the image, PDF, video or audio |
| `.html` | the page, in a sandboxed frame (its scripts run; it cannot reach the app or other files) |
| anything else (`.json`, `.css`, `.py`, `.txt`, a module with nothing to show, …) | its text |

A file that fails to compile or render shows the error in its tab, and a red mark in the Explorer (hover for the
message). Fix and save it: the tab reloads by itself.

## Imports

Script, Markdown and MDX files can import:

| Import | Gives |
|---|---|
| `react`, `react-dom`, `react-dom/client` | the app's React: hooks and context work across notes |
| `katex` | KaTeX |
| `principia` | helpers (`R`, `lab`, `shape`, `tag`, `slide`, …), types (`Topic`, `Section`, …) and components (`Tex`, `P`, `Row`, `NoteLine`, `Callout`, `Why`, `SlideRefs`, `Flag`, `Circ`, `Step`) |
| `./x`, `../x` | another file of the folder; the extension may be left out (`.tsx`, `.ts`, `.jsx`, `.js`, `.mdx`, `.md`, `.json`, or `x/index.*`) |
| `~/x` | a file by its path from the folder's root |
| `./data.json` | the parsed JSON |
| `./style.css` | nothing: the CSS is added to the page while the importing note is loaded |
| `./figure.png`, `./notes.txt`, … | a URL to the file (media), or its text (text files), as the default export |
| any other name (`d3`, `lodash-es/debounce`, `react-colorful`) | the npm package, from esm.sh: needs a network connection |

Pin npm versions in the config: `dependencies: { d3: '7.9.0' }`, or in the import itself: `import * as d3 from 'd3@7'`.
Packages that are not in `dependencies` are only fetched when a file that imports them is opened.

Imports must be written with a fixed string (`import x from './x'`, or `require('./x')`), so the loader can find
them before running the file. Types are stripped, not checked; `npm run typecheck` checks the sample, and an
editor checks any folder whose `tsconfig.json` maps `principia` to this repository's `sdk/index.ts`.

## The config file

`principia.config.ts` (or `.tsx`, `.js`, `.mjs`, `principia.json`) at the folder's root. Every field is optional.

```ts
import { R, defineNotebook } from 'principia';
import { identities } from './identities';

export default defineNotebook({
  title: '70050 Machine Learning',                     // default: the folder's name
  decks: [{ id: 'I', label: 'Week 1 · Regression I', pages: 60 }], // for slide('I', 39, '…')
  identities,                                           // shared identities (topics may add their own)
  indexWhy: R`Why the identity index exists, in one or two sentences.`,
  folders: { 'lecture-1': 'Lecture 1 · Introduction & regression' }, // display names of sub-folders
  defaultFile: 'lecture-1/regression-1/01-course-overview.ts',       // opened when the folder is opened
  dependencies: { d3: '7.9.0' },                       // npm packages, loaded from esm.sh
  steps: 'rows',                                        // how topics are stepped through (see below)
});
```

## The version file

`principia.version.json` at the folder's root says which notes format the notes are written in:

```json
{
  "format": 2,
  "app": "0.3.0",
  "history": [{ "from": 1, "to": 2, "app": "0.3.0", "date": "…", "backup": ".principia/backup/…" }]
}
```

The app writes it; there is no need to edit it. When a folder was last written by a newer app with the same
format, the app says so: the notes may use features it does not have (such as `<Step>` before 0.4). A new folder gets one the first time it is opened. When the app's
notes format is newer than the folder's, the folder is shown in compatibility mode and upgraded on open (or with
`npm run upgrade -- <folder>`); the files it changes are first copied to `.principia/backup/<time>/`. See
`CHANGELOG.md` for what each format changed.

## Reading order

The previous / next note buttons (and `Ctrl+←` `Ctrl+→`) follow the explorer order of a folder's structured
topics and `.md` / `.mdx` pages. Other files (helper modules, widgets, the config, images…) are not in the
sequence, so name files so that they sort in reading order (`01-…`, `02-…`).

## Stepping through a note

A note can be revealed a part at a time, like a slide build: the step bar at the bottom middle (or `←` `→`)
adds or removes one step, and shows the stage out of the total. Content that is not a step is always shown.

**Topics** step by themselves. `steps` in the config (all topics), a topic, or a section chooses how:

| `steps` | Each step shows |
|---|---|
| `'rows'` (default) | the section heading (with its "why" and slides), then the display equation, the notes before the rows, each row, the extra, each callout |
| `'lines'` | as `'rows'`, but a row shows its equation, then one note line per step |
| `'section'` | a whole section |
| `'none'` | nothing is stepped: the section (or topic) is shown at once |

The topic's title, summary and pen key are always shown. A reference page (a glossary) is best with `steps: 'none'`.

**MDX and components** mark their steps:

```mdx
<Step>Shown at the next step.</Step>
<Step withPrevious>Shown together with the step before.</Step>
<Step at={5}>Shown at step 5.</Step>
Inline: the answer is <Step as="span">$42$</Step>.
```

Any element with a `data-step` attribute is a step too (`data-step=""` next, `"="` with the previous, `"3"` at
step 3), so a component can mark its own parts: `<g data-step="">…</g>` in an SVG. In MDX,
`export const steps = 'blocks'` makes every top-level block a step (the `h1` stays as the title).

## Components in notes

Three ways to place an interactive component:

1. **On its own**: a `.tsx` file whose default export is a component. Open it like any note.
2. **Inside a topic section**: `extra: <MyWidget />` on a section puts it after the rows (the topic file must then
   be `.tsx`). See `07-ridge.tsx`.
3. **Inside prose**: in an `.mdx` file, `import MyWidget from './widgets/MyWidget'` and write `<MyWidget />` where
   it belongs. The `principia` components (`Row`, `Callout`, `Flag`, `Tex`, …) work in MDX without an import.
   See `playground.mdx`.

Components can use the app's palette as CSS variables (`var(--teal)`, `--green`, `--orange`, `--pink`, `--red`,
`--purple`, `--ink`, `--ink-2`, `--rule`, `--paper`, `--ground`) and fonts (`--f-tex`, `--f-body`, `--f-mono`).

---

# The structured topic format

The reader is a student who is comfortable multiplying matrices but **weak at recalling linear-algebra,
probability and vector-calculus identities, and at the shape of each operation**. The notes copy the style of
their handwritten notes. In the sample, read `05-least-squares-matrix.ts` first: it is the reference topic.

## The format, in the reader's own convention

| Pen | `Note` kind / TeX | Use it for |
|---|---|---|
| purple | section `title` | sub-headings (each section heading) |
| teal | `lab(...)`, `tag(...)` text | labels naming parts of an expression, short connective comments |
| green | `shape(...)`, `ex(...)`, `\htmlClass{c-green}{…}` | dimensions / shapes, step notes ("rearrange", "set to zero"), "Ex." examples |
| orange | `con(...)`, `\htmlClass{c-orange}{…}` | constants (w.r.t. the variable being differentiated), dependency notes |
| pink | `term(...)` | named key concepts: "Normal Equation", "Bayes' rule", "Population risk" |
| red | `warn(...)`, callouts, `\htmlClass{c-red}{…}` | warnings, exam traps, challenges, the column of 1s |
| ink | `text(...)` | plain bullet statements (definitions, what the slide says) |

Rules that are not optional:

1. **Every section has a `why`**: one or two sentences, under 60 words, answering "Why are we doing this?"
   in plain words. It motivates the step from the reader's point of view (what problem it solves, where it
   leads next). It is not a summary of the slide.
2. **Every equation is TeX.** Row `eq`, `display`, `shape` and identity `tex` are whole TeX. In prose
   (`lab`, `text`, `why`, `summary`, notes…) math goes **only inside `$…$`**. No Unicode math in prose:
   write `$\lambda$`, never λ; `$X^\top X$`, never XᵀX; `$N\times M$`, never N×M. `npm run check`
   fails on this.
3. **Shapes under every matrix and vector.** Each row that introduces or combines matrices/vectors gets a
   `shape(...)` line, e.g. `shape(R\`X^\top\mathbf y:\ \big[(D+1)\times N\big]\cdot\big[N\times1\big]=(D+1)\times1\`)`.
   Scalars: say `1\times1` or "(scalar)". In big displays, put shapes under braces:
   `\underbrace{X}_{\htmlClass{c-green}{N\times M}}`.
4. **Flag every identity, theorem or rule a step uses** with `tag(['I5'], 'what it does here')`. Do not prove
   it. The tag's text says how it is applied in this row. If the identity is not in the index yet, add it
   (see Identities). This includes probability rules (sum rule, product rule, Bayes, log of a product,
   expectation is linear) and calculus rules (chain rule, derivative of a log).
5. **Cite slides exactly.** `slide('I', 39, 'Matrix form of the normal equations')`: deck id (from the config's
   `decks`), PDF page number, and the slide title **as printed**. A section lists every slide it covers. Use
   `slideNote` to say what was added beyond the slides ("Row 3 is added to show I2") or that a slide is a figure only.
6. **Mark non-examinable slides** with `nonExaminable: true` when the slide says "Non-examinable".
7. **Derivations get circled step numbers**: `circ: 1, 2, 3…` within the topic, in order. Concept sections
   (definitions, lists, pictures) have no `circ`.
8. Section headings are short noun phrases. Topic titles are plain text (they are also the tab title).

## Shape of a topic file

```tsx
import { R, con, ex, lab, shape, slide, tag, term, text, warn } from 'principia';
import type { Identity, Topic } from 'principia';
import RidgeShrinkage from '../../widgets/RidgeShrinkage';  // only if a section has an `extra`

const identities: Identity[] = [
  { id: 'I20', area: 'Linear algebra', tex: R`(A+B)^{-1}\ne A^{-1}+B^{-1}`, note: R`...` },
];

export const ridge: Topic = {
  id: 'ridge',                      // unique within the folder, kebab-case
  title: 'Regularisation and ridge regression',
  short: 'Ridge',                   // ≤ 12 characters, for "used in" chips
  summary: R`One or two sentences: what this topic covers.`,
  identities,                       // identities this topic introduces (optional)
  steps: 'rows',                    // how it is stepped through (optional; a section can override it)
  sections: [
    {
      id: 'objective',              // unique within the topic
      circ: 1,                      // only for derivation steps
      title: 'The ridge objective',
      why: R`Least squares alone can fit noise when there are many features. Adding a penalty on the size of $\mathbf w$ prefers simpler fits.`,
      slides: [slide('I', 55, 'Ridge regression')],
      slideNote: R`Row 2 expands the norm to show I1.`,       // optional
      display: R`...`,              // optional single large equation under the heading
      pre: [text(R`...`), warn(R`...`)],                    // optional note lines before the rows
      rows: [
        {
          eq: R`J(\mathbf w)=\lVert\mathbf y-X\mathbf w\rVert_2^2+\lambda\lVert\mathbf w\rVert_2^2`,
          notes: [
            term('Ridge regression'),
            lab(R`first term: fit to data; second: penalty`),
            tag(['I1'], R`both norms are a vector dotted with itself`),
            shape(R`\mathbf w:\ D\times1,\quad J:\ 1\times1`),
          ],
        },
      ],
      extra: <RidgeShrinkage />,    // optional: any React content, after the rows
      callouts: [{ heading: 'Exam trap', flag: 'I6', text: R`...`, eq: R`...` }],  // optional, red box
    },
  ],
};
```

A row is "equation on the left, notes on the right". A concept slide with no equation can use `pre` notes
only (`rows: []`), or rows whose `eq` is a short defining formula.

Colour inside equations: `\htmlClass{c-red}{1}` (the column of 1s), `\htmlClass{c-orange}{\mathbf y^\top\mathbf y}`
(a constant), `\htmlClass{c-green}{N\times1}` (a shape under a brace). The same works in Markdown math.

## Identities

The index is folder-wide. A tag id is `I<n>` (identity, theorem, rule) or `C<n>` (convention).
`area` is usually one of `Algebra & calculus` (scalar rules: sums, logs, exp, the chain rule), `Linear algebra`,
`Vector calculus`, `Probability`, `Optimisation`, `Conventions`; any other name is listed after these.
Reuse an existing id when it is the same fact (the config's `identities` and the `identities` of other topics).
The index works out "used in" from the tags, so there is nothing to list.
The `note` gives shapes and the condition under which it holds, in one or two sentences.

## Check

```bash
npm run check -- path/to/folder                 # everything
npm run check -- path/to/folder --topic ridge   # one or more topics (comma-separated)
npm run typecheck                               # types (the app and the sample)
```
