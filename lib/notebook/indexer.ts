// The index of one notebook, worked out from its files: the structured topics in explorer order, the
// identities (from the config and from the topics), and where each identity is tagged.
import { isTopic } from '@/sdk/helpers';
import type { Identity, NotebookConfig, Section, Topic } from '@/sdk/types';

export type TopicEntry = { path: string; topic: Topic; folders: string[]; order: number };
export type Use = { path: string; topicShort: string; topicTitle: string; sectionId: string; sectionTitle: string; circ?: number; secNo: number };
export type NotebookIndex = {
  topics: TopicEntry[];
  byPath: Map<string, TopicEntry>;
  identities: Identity[];
  uses: Map<string, Use[]>;
};

export const emptyIndex = (): NotebookIndex => ({ topics: [], byPath: new Map(), identities: [], uses: new Map() });

/** The files that configure a folder, in the order they are looked for. */
export const CONFIG_FILES = ['principia.config.ts', 'principia.config.tsx', 'principia.config.js', 'principia.config.mjs', 'principia.json'];

/** The Topic a module exports: its default export, or the first named export shaped like a Topic. */
export function findTopic(exports: Record<string, unknown>): Topic | undefined {
  if (isTopic(exports.default)) return exports.default;
  return Object.values(exports).find(isTopic);
}

/** Every identity id a section tags, in reading order. */
export function sectionTags(s: Section): string[] {
  const ids: string[] = [];
  for (const n of [...(s.pre ?? []), ...s.rows.flatMap((r) => r.notes)]) if (n.k === 'tag') ids.push(...n.ids);
  for (const c of s.callouts ?? []) if (c.flag) ids.push(c.flag);
  return ids;
}

export const basename = (path: string) => path.slice(path.lastIndexOf('/') + 1);

/** The display title of a folder: from the config's `folders`, or its own name. */
export const folderTitle = (config: NotebookConfig, dir: string) => config.folders?.[dir] ?? basename(dir);

/** Titles of the folders a file sits in, outermost first. */
export function folderTrail(config: NotebookConfig, path: string) {
  const parts = path.split('/').slice(0, -1);
  return parts.map((_, i) => folderTitle(config, parts.slice(0, i + 1).join('/')));
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/** Explorer order: within a folder, sub-folders first, then files; names in natural order (2 before 10). */
export function comparePaths(a: string, b: string) {
  const pa = a.split('/');
  const pb = b.split('/');
  for (let i = 0; ; i++) {
    const aDir = i < pa.length - 1;
    const bDir = i < pb.length - 1;
    if (aDir !== bDir) return aDir ? -1 : 1;
    const c = collator.compare(pa[i], pb[i]);
    if (c || i >= pa.length - 1) return c;
  }
}

const AREAS = ['Algebra & calculus', 'Linear algebra', 'Vector calculus', 'Probability', 'Optimisation', 'Conventions'];
const areaRank = (a: string) => (AREAS.includes(a) ? AREAS.indexOf(a) : AREAS.length);
const idNum = (id: string) => Number(id.replace(/\D/g, '')) || 0;

export function buildIndex(config: NotebookConfig, found: { path: string; topic: Topic }[]): NotebookIndex {
  const sorted = [...found].sort((a, b) => comparePaths(a.path, b.path));
  const topics = sorted.map(({ path, topic }, order) => ({ path, topic, folders: folderTrail(config, path), order }));

  const identities = [...(config.identities ?? []), ...topics.flatMap((t) => t.topic.identities ?? [])];
  identities.sort(
    (a, b) =>
      areaRank(a.area) - areaRank(b.area) || a.area.localeCompare(b.area) || a.id[0].localeCompare(b.id[0]) || idNum(a.id) - idNum(b.id),
  );

  const uses = new Map<string, Use[]>();
  for (const { path, topic: t } of topics)
    t.sections.forEach((s, k) => {
      for (const id of new Set(sectionTags(s))) {
        if (!uses.has(id)) uses.set(id, []);
        uses.get(id)!.push({ path, topicShort: t.short, topicTitle: t.title, sectionId: s.id, sectionTitle: s.title, circ: s.circ, secNo: k + 1 });
      }
    });

  return { topics, byPath: new Map(topics.map((t) => [t.path, t])), identities, uses };
}
