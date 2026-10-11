// The `principia` module: everything a note file can import besides react, react-dom and katex.
//   import { R, lab, shape, slide, tag, Tex, P, type Topic } from 'principia';
export * from './helpers';
export type * from './types';
export { Tex, P, renderTex } from '@/components/Tex';
export { Callout, Circ, Flag, NoteLine, Row, SlideRefs, Why } from '@/components/Notes';
