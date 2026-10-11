// Reads a notebook: its config, then every script file, to find the structured topics. Used by the app and by
// `npm run check`. A file that fails to load is recorded in `errors` and skipped; it does not stop the scan.
import type { NotebookConfig, Topic } from '@/sdk/types';
import { fileKind } from './compile';
import { CONFIG_FILES, buildIndex, findTopic, type NotebookIndex } from './indexer';
import { DeferredImport, ModuleError, type ModuleGraph } from './loader';

export type Scan = { config: NotebookConfig; index: NotebookIndex; errors: Map<string, string> };

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
  await Promise.all(
    files
      .filter((p) => fileKind(p) === 'script' && p !== configPath)
      .map(async (path) => {
        try {
          const topic = findTopic(await graph.import(path, { allowNpm }));
          if (topic) found.push({ path, topic });
        } catch (e) {
          if (!(e instanceof ModuleError && e.cause instanceof DeferredImport)) errors.set(path, message(e));
        }
      }),
  );

  return { config, index: buildIndex(config, found), errors };
}
