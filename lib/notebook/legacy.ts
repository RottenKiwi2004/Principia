// Reading notes format 1 (Principia 0.1) without changing it: the folder's config is worked out from its course.ts.
import type { Course, TreeNode } from '@/sdk/legacy';
import type { NotebookConfig, Topic } from '@/sdk/types';
import { dirname } from './loader';

/** The deepest folder that holds every one of `paths` ('' when they share none). */
export function commonDir(paths: string[]) {
  if (!paths.length) return '';
  let dir = dirname(paths[0]);
  for (const p of paths)
    while (dir && !p.startsWith(dir + '/')) dir = dirname(dir);
  return dir;
}

/**
 * The format-2 config equivalent to a format-1 Course. A course folder's title becomes the display title of the
 * folder that holds all of its topics; topics are matched to files by object identity (the course tree holds the
 * very objects the topic files export).
 */
export function configFromCourse(course: Course, found: { path: string; topic: Topic }[]): NotebookConfig {
  const pathOf = new Map(found.map((f) => [f.topic, f.path]));
  const folders: Record<string, string> = {};
  const topicPaths = (nodes: TreeNode[]): string[] =>
    nodes.flatMap((n) => (n.kind === 'folder' ? topicPaths(n.children) : pathOf.has(n.topic) ? [pathOf.get(n.topic)!] : []));
  const walk = (nodes: TreeNode[]) => {
    for (const n of nodes) {
      if (n.kind !== 'folder') continue;
      const dir = commonDir(topicPaths(n.children));
      if (dir) folders[dir] = n.title; // outer folders first, so an inner one with the same directory wins
      walk(n.children);
    }
  };
  walk(course.tree);
  return { title: course.title, decks: course.decks, identities: course.identities, indexWhy: course.indexWhy, folders };
}
