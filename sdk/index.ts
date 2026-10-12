// The `principia` module: everything a note file can import besides react, react-dom and katex.
//   import { R, lab, shape, slide, tag, Tex, P, type Topic } from 'principia';
export * from './helpers';
export type * from './types';
export { folder, file, isCourse, type Course, type TreeNode } from './legacy'; // notes format 1, deprecated
export { Tex, P, renderTex } from '@/components/Tex';
export { Callout, Circ, Flag, NoteLine, Row, SlideRefs, Step, Why, stepAttr, type StepMark } from '@/components/Notes';
