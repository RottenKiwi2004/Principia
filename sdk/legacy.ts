// Notes format 1: the single-course app of Principia 0.1. A course folder had a `course.ts` exporting a Course,
// whose `tree` listed every topic in folders with display titles, and topics imported '@/content/helpers' and
// '@/content/types'. These exports keep such folders loading; upgrading a folder (automatic when it can be written,
// or `npm run upgrade`) replaces course.ts with principia.config.ts, after which none of this is needed.
import type { Deck, Identity, Topic } from './types';

/** @deprecated Notes format 1. The file tree of the folder is the tree now. */
export type TreeNode = { kind: 'folder'; id: string; title: string; children: TreeNode[] } | { kind: 'topic'; topic: Topic };

/** @deprecated Notes format 1. Use a principia.config.ts (NotebookConfig) instead. */
export type Course = { id: string; title: string; decks: Deck[]; identities: Identity[]; indexWhy: string; tree: TreeNode[] };

/** @deprecated Notes format 1. */
export const folder = (id: string, title: string, children: TreeNode[]): TreeNode => ({ kind: 'folder', id, title, children });
/** @deprecated Notes format 1. */
export const file = (topic: Topic): TreeNode => ({ kind: 'topic', topic });

/** True for an object shaped like a format-1 Course. */
export const isCourse = (v: unknown): v is Course =>
  !!v && typeof v === 'object' && typeof (v as Course).title === 'string' && Array.isArray((v as Course).tree);
