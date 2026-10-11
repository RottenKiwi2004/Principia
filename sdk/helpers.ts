// Small constructors that keep topic files short. Import what you need:
//   import { R, lab, con, warn, term, text, ex, tag, shape, slide } from 'principia';
import type { Note, NotebookConfig, SlideRef, Topic } from './types';

/** String.raw, so TeX backslashes need no escaping: R`\mathbf w^\top` */
export const R = String.raw;

export const lab = (t: string): Note => ({ k: 'lab', t });
export const con = (t: string): Note => ({ k: 'con', t });
export const warn = (t: string): Note => ({ k: 'warn', t });
export const term = (t: string): Note => ({ k: 'term', t });
export const text = (t: string): Note => ({ k: 'text', t });
export const ex = (t: string): Note => ({ k: 'ex', t });
export const tag = (ids: string[], t: string): Note => ({ k: 'tag', ids, t });
export const shape = (tex: string): Note => ({ k: 'shape', tex });

/** A slide citation: slide('I', 39, 'Matrix form of the normal equations') */
export const slide = (deck: string, n: number, name: string): SlideRef => ({ deck, n, name });

/** Typed identity helpers: `export default defineNotebook({...})` in principia.config.ts, `export default defineTopic({...})`. */
export const defineNotebook = (config: NotebookConfig): NotebookConfig => config;
export const defineTopic = (topic: Topic): Topic => topic;

/** True for an object shaped like a Topic. A file is shown as a structured topic when it exports one. */
export const isTopic = (v: unknown): v is Topic =>
  !!v && typeof v === 'object' && typeof (v as Topic).title === 'string' && Array.isArray((v as Topic).sections);
