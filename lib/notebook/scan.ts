// Reads a notebook: its config, then every script file, to find the structured topics. Used by the app and by
// the scripts. A file that fails to load is recorded in `errors` and skipped; it does not stop the scan.
// Older notes formats are read as they are (see lib/notebook/legacy.ts); `legacy` says what was found.
import { isCourse, type Course } from '@/sdk/legacy';
import type { NotebookConfig, Topic } from '@/sdk/types';
import { LEGACY_ALIASES } from './builtins';
import { fileKind } from './compile';
import { CONFIG_FILES, buildIndex, findTopic, type NotebookIndex } from './indexer';
import { configFromCourse } from './legacy';
import { DeferredImport, ModuleError, type ModuleGraph } from './loader';

export type Legacy = {
  course?: { path: string; course: Course }; // a format-1 course file at the folder's root
  nestedCourse?: string; //                     one deeper down: probably a whole Principia 0.1 app folder
  aliased: string[]; //                         files importing '@/content/helpers' or '@/content/types'
};

export type Scan = { config: NotebookConfig; configPath?: string; index: NotebookIndex; errors: Map<string, string>; legacy: Legacy };

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** The package name in an import such as 'd3', 'd3/array' or '@scope/pkg/sub'. */
export const packageName = (spec: string) => spec.split('/').slice(0, spec.startsWith('@') ? 2 : 1).join('/').replace(/(?!^)@.*$/, '');

export async function scanNotebook(graph: ModuleGraph, files: string[]): Promise<Scan> {
  const errors = new Map<string, string>();
  const set = new Set(files);

  let config: NotebookConfig = {};
  const configPath = CONFIG_FILES.find((f) => set.has(f));
  if (configPath) {
    try {
      const m = await graph.import(configPath);
      config = ((m.default ?? m) as NotebookConfig) || {};
    } catch (e) {
      errors.set(configPath, message(e));
    }
  }

  // While scanning, only packages the config declares may be fetched; others wait until the file is opened.
  const declared = new Set(Object.keys(config.dependencies ?? {}));
  const allowNpm = (spec: string) => declared.has(packageName(spec));

  const found: { path: string; topic: Topic }[] = [];
  const courses: { path: string; course: Course }[] = [];
  await Promise.all(
    files
      .filter((p) => fileKind(p) === 'script' && p !== configPath)
      .map(async (path) => {
        try {
          const exports = await graph.import(path, { allowNpm });
          const topic = findTopic(exports);
          if (topic) found.push({ path, topic });
          const course = Object.values(exports).find(isCourse);
          if (course) courses.push({ path, course });
        } catch (e) {
          if (!(e instanceof ModuleError && e.cause instanceof DeferredImport)) errors.set(path, message(e));
        }
      }),
  );

  const legacy: Legacy = {
    course: courses.find((c) => !c.path.includes('/')),
    nestedCourse: courses.find((c) => c.path.includes('/'))?.path,
    aliased: [...new Set(LEGACY_ALIASES.flatMap((a) => graph.importersOf(a)))].sort(),
  };
  // Format 1 has no config file: its course.ts plays that part.
  if (!configPath && legacy.course) config = configFromCourse(legacy.course.course, found);

  return { config, configPath, index: buildIndex(config, found), errors, legacy };
}
