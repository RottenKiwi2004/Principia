// The structured note format. See docs/CONTENT_GUIDE.md for how to write a topic.
//
// Prose strings may contain math only inside $...$ (rendered with KaTeX).
// `eq`, `display`, `tex` and `shape` strings are whole TeX.
import type { ReactNode } from 'react';

/** A slide in one of the notebook's decks, cited as e.g. "I · 39". `name` is the slide's title as printed. */
export type SlideRef = { deck: string; n: number; name: string };

export type Note =
  | { k: 'lab'; t: string } //   teal: label or short comment
  | { k: 'con'; t: string } //   orange: constant / dependency note
  | { k: 'warn'; t: string } //  red: warning, challenge, "fit" action
  | { k: 'term'; t: string } //  pink: a named key concept
  | { k: 'text'; t: string } //  ink: a plain bullet point (definitions, slide statements)
  | { k: 'ex'; t: string } //    green "Ex." example
  | { k: 'tag'; ids: string[]; t: string } // identity tags (click to open the index) + teal label
  | { k: 'shape'; tex: string }; //            green shape line, whole TeX

export type RowData = { eq: string; notes: Note[] };

/** A red box for a hidden step, a warning or an exam trap. `flag` links an identity. */
export type Callout = { heading: string; flag?: string; text: string; eq?: string };

export type Section = {
  id: string; //            unique within the topic; used in links and in the DOM
  circ?: number; //         circled step number, for derivation steps (1, 2, 3, ... within the topic)
  title: string; //         the purple heading
  why: string; //           "Why are we doing this?": one or two sentences
  slides: SlideRef[]; //    the slides this section covers; [] if none
  slideNote?: string; //    how the section relates to the slides (what was added, what is figure-only)
  nonExaminable?: boolean; // the slide says "Non-examinable"
  display?: string; //      one large display equation under the heading
  pre?: Note[]; //          note lines before the rows
  rows: RowData[]; //       derivation rows: equation left, notes right
  extra?: ReactNode; //     any React content (an interactive figure, a widget), placed after the rows
  callouts?: Callout[];
};

export type Topic = {
  id: string; //       unique within the notebook; used in DOM ids
  title: string; //    h1 and tab title
  subtitle?: string; // teal, after the title
  short: string; //    a few characters, for "used in" chips in the identity index (e.g. "LS matrix")
  summary: string; //  the lede: what this topic covers, in one or two sentences
  sections: Section[];
  identities?: Identity[]; // identities first introduced by this topic; they join the notebook-wide index
};

/** The usual areas, in index order. Any other string is allowed and is listed after these. */
export type IdentityArea =
  | 'Algebra & calculus'
  | 'Linear algebra'
  | 'Vector calculus'
  | 'Probability'
  | 'Optimisation'
  | 'Conventions'
  | (string & {});

/** An identity, theorem or convention. Where it is used is worked out from the tags in the topics. */
export type Identity = { id: string; area: IdentityArea; tex: string; note: string };

export type Deck = { id: string; label: string; pages: number };

/**
 * Optional settings for a notes folder, the default export of `principia.config.ts` (or `.tsx`, `.js`, `.json`)
 * at the folder's root. Every field is optional: a folder without a config still opens.
 */
export type NotebookConfig = {
  title?: string; //                          shown in the explorer and on every page (default: the folder name)
  decks?: Deck[]; //                          slide decks cited by `slide(...)`
  identities?: Identity[]; //                 shared identities; topics may add their own
  indexWhy?: string; //                       "Why are we doing this?" for the identity index page
  folders?: Record<string, string>; //        display titles for sub-folders, by path: { 'lecture-1': 'Lecture 1' }
  defaultFile?: string; //                    opened when the folder is first opened
  dependencies?: Record<string, string>; //   npm packages notes may import, with versions (loaded from esm.sh)
};
