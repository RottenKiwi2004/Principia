// Notes format versions and upgrades.
//
// Every notebook carries principia.version.json: the notes format it is written in, the app version that last
// wrote it, and a history of upgrades. On open, versionStatus() compares it with this app:
//   older format  → 'upgrade': planUpgrade() runs the migrations from that format to FORMAT_VERSION, one step at
//                   a time, and applyUpgrade() writes the result, after backing up every file it changes or
//                   removes to .principia/backup/<time>/ (hidden from the explorer).
//   same format   → 'stamp' when the file is missing or was written by an older app: only the file is (re)written.
//   newer format  → 'newer': the notebook is shown as it is, never written.
// A folder that cannot be written (a sample, an uploaded snapshot, no edit permission) still opens: the scan reads
// older formats through compatibility shims, so upgrading only makes the files current, it is never required.
import { APP_VERSION, FORMAT_VERSION, compareVersions } from '@/lib/version';
import type { Course } from '@/sdk/legacy';
import type { Identity, NotebookConfig } from '@/sdk/types';
import { fileKind } from './compile';
import { configFromCourse } from './legacy';
import type { ModuleGraph } from './loader';
import type { Scan } from './scan';
import type { FileSource, WritableSource } from './source';

export const VERSION_FILE = 'principia.version.json';
export const BACKUP_DIR = '.principia/backup';

export type UpgradeRecord = { from: number; to: number; app: string; date: string; backup?: string };
export type VersionFile = { format: number; app: string; history?: UpgradeRecord[] };

export type VersionStatus = {
  format: number; //              the notebook's notes format
  file: VersionFile | null; //    its principia.version.json, if it has a valid one
  guessed: boolean; //            no (valid) version file: the format was worked out from the files
  action: 'none' | 'stamp' | 'upgrade' | 'newer' | 'invalid' | 'misplaced';
  problem?: string; //            for 'invalid' and 'misplaced'
  newerApp?: boolean; //          same format, but last written by a newer app: notes may use features this one lacks
};

export function parseVersionFile(text: string): VersionFile | null {
  try {
    const v = JSON.parse(text) as VersionFile;
    if (!v || !Number.isInteger(v.format) || v.format < 1 || typeof v.app !== 'string') return null;
    return { format: v.format, app: v.app, history: Array.isArray(v.history) ? v.history : [] };
  } catch {
    return null;
  }
}

/** Where a notebook stands against this app, from its version file or, without one, from what the scan found. */
export async function versionStatus(source: FileSource, files: string[], scan: Scan): Promise<VersionStatus> {
  const legacy = !!scan.legacy.course || (!scan.configPath && scan.legacy.aliased.length > 0);
  if (files.includes(VERSION_FILE)) {
    const file = parseVersionFile(await source.readText(VERSION_FILE));
    if (!file)
      return {
        format: legacy ? 1 : FORMAT_VERSION, file: null, guessed: true, action: 'invalid',
        problem: `${VERSION_FILE} is not valid: it needs "format" (a whole number) and "app" (a version string). It is left as it is.`,
      };
    const action =
      file.format > FORMAT_VERSION ? 'newer'
      : file.format < FORMAT_VERSION ? 'upgrade'
      : compareVersions(file.app, APP_VERSION) < 0 ? 'stamp'
      : 'none';
    const newerApp = action === 'none' && compareVersions(file.app, APP_VERSION) > 0;
    return { format: file.format, file, guessed: false, action, ...(newerApp && { newerApp }) };
  }

  // A course file deeper down and none at the root: most likely the whole folder of an old app, not a notebook.
  if (!scan.legacy.course && scan.legacy.nestedCourse && !scan.configPath)
    return {
      format: 1, file: null, guessed: true, action: 'misplaced',
      problem: `This looks like a Principia 0.1 app folder. Open the folder that holds ${scan.legacy.nestedCourse} instead, to read and upgrade those notes.`,
    };
  return legacy
    ? { format: 1, file: null, guessed: true, action: 'upgrade' }
    : { format: FORMAT_VERSION, file: null, guessed: true, action: 'stamp' };
}

// ---- migrations -------------------------------------------------------------------------------
export type Change = { path: string; text: string | null }; // null removes the file

export type UpgradeContext = {
  files: string[];
  read: (path: string) => Promise<string>;
  graph: ModuleGraph; // already holds the notebook as the scan loaded it
  scan: Scan;
};

type Migration = { from: number; to: number; title: string; plan: (ctx: UpgradeContext) => Promise<Change[]> };

const MIGRATIONS: Migration[] = [
  {
    from: 1,
    to: 2,
    title: 'format 1 (single-course app) to format 2 (open folders)',
    // 1. imports of '@/content/helpers' and '@/content/types' become 'principia';
    // 2. course.ts becomes principia.config.ts (title, decks, identities, index "why", folder titles), and is
    //    removed unless another file imports it.
    plan: async ({ files, read, graph, scan }) => {
      const changes: Change[] = [];
      for (const path of files.filter((p) => fileKind(p) === 'script' || fileKind(p) === 'mdx')) {
        const text = await read(path);
        const next = text.replace(/(['"])@\/content\/(?:helpers|types)\1/g, "'principia'");
        if (next !== text) changes.push({ path, text: next });
      }
      const legacy = scan.legacy.course;
      if (legacy && !scan.configPath) {
        const found = scan.index.topics.map((t) => ({ path: t.path, topic: t.topic }));
        const config = configFromCourse(legacy.course, found);
        changes.push({ path: 'principia.config.ts', text: renderConfig(legacy.course, config, graph, files, legacy.path) });
        if (graph.importersOf(legacy.path).length === 0) changes.push({ path: legacy.path, text: null });
      }
      return changes;
    },
  },
];

export type UpgradePlan = { from: number; to: number; steps: string[]; changes: Change[] };

/** The changes that bring a notebook from format `from` to the current one. Later steps see earlier steps' edits. */
export async function planUpgrade(ctx: UpgradeContext, from: number): Promise<UpgradePlan> {
  const edits = new Map<string, string | null>();
  const steps: string[] = [];
  for (let f = from; f < FORMAT_VERSION; ) {
    const m = MIGRATIONS.find((x) => x.from === f);
    if (!m) throw new Error(`there is no upgrade from notes format ${f}`);
    const files = [...new Set([...ctx.files, ...edits.keys()])].filter((p) => edits.get(p) !== null);
    const read = async (p: string) => (edits.has(p) ? (edits.get(p) ?? '') : ctx.read(p));
    for (const c of await m.plan({ ...ctx, files, read })) edits.set(c.path, c.text);
    steps.push(m.title);
    f = m.to;
  }
  return { from, to: Math.max(from, FORMAT_VERSION), steps, changes: [...edits].map(([path, text]) => ({ path, text })) };
}

/**
 * Writes an upgrade (or, with no changes, just the version file). Every existing file it changes or removes is first
 * copied to .principia/backup/<time>/<path>. The version file is written last, so an interrupted upgrade is
 * simply run again on the next open.
 */
export async function applyUpgrade(target: WritableSource, files: string[], plan: UpgradePlan, previous: VersionFile | null, now = new Date()) {
  const existing = new Set(files);
  const touched = plan.changes.filter((c) => existing.has(c.path));
  const backup = touched.length ? `${BACKUP_DIR}/${now.toISOString().replace(/[:.]/g, '-')}` : undefined;
  for (const c of touched) await target.writeText(`${backup}/${c.path}`, await target.readText(c.path));
  for (const c of plan.changes) {
    if (c.text === null) await target.remove(c.path);
    else await target.writeText(c.path, c.text);
  }
  const history = [...(previous?.history ?? [])];
  if (plan.to > plan.from) history.push({ from: plan.from, to: plan.to, app: APP_VERSION, date: now.toISOString(), ...(backup && { backup }) });
  const file: VersionFile = { format: FORMAT_VERSION, app: APP_VERSION, history };
  await target.writeText(VERSION_FILE, JSON.stringify(file, null, 2) + '\n');
  return { backup, file };
}

/** Plans and applies what `status` calls for ('upgrade' or 'stamp'). Used by the app and by `npm run upgrade`. */
export async function upgradeNotebook(target: WritableSource, ctx: UpgradeContext, status: VersionStatus, o: { dryRun?: boolean } = {}) {
  if (status.action !== 'upgrade' && status.action !== 'stamp') throw new Error(`nothing to do for '${status.action}'`);
  const plan =
    status.action === 'upgrade'
      ? await planUpgrade(ctx, status.format)
      : { from: status.format, to: status.format, steps: [], changes: [] };
  if (o.dryRun) return { plan };
  return { plan, ...(await applyUpgrade(target, ctx.files, plan, status.file)) };
}

// ---- writing principia.config.ts --------------------------------------------------------------
const IDENT = /^[A-Za-z_$][\w$]*$/;

/** TeX-heavy strings as R`...` (no escaping needed), others as ordinary quoted strings. */
function str(s: string, use: { R: boolean }) {
  if (s.includes('\\') && !/`|\$\{/.test(s) && !s.endsWith('\\')) {
    use.R = true;
    return `R\`${s}\``;
  }
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
}
const key = (k: string) => (IDENT.test(k) ? k : `'${k.replace(/'/g, "\\'")}'`);
function lit(v: unknown, use: { R: boolean }): string {
  if (typeof v === 'string') return str(v, use);
  if (Array.isArray(v)) return `[${v.map((x) => lit(x, use)).join(', ')}]`;
  if (v && typeof v === 'object')
    return `{ ${Object.entries(v)
      .filter(([, x]) => x !== undefined)
      .map(([k, x]) => `${key(k)}: ${lit(x, use)}`)
      .join(', ')} }`;
  return JSON.stringify(v) ?? 'undefined';
}

/** The module and export name that hold `value`, so the config can import it rather than copy it. */
function exportHolding(value: unknown, graph: ModuleGraph, files: string[], skip: string) {
  for (const path of files) {
    if (path === skip || fileKind(path) !== 'script') continue;
    const exports = graph.loaded(path);
    const name = exports && Object.keys(exports).find((k) => k !== 'default' && IDENT.test(k) && exports[k] === value);
    if (name) return { name, spec: './' + path.replace(/\.(tsx?|jsx?|mjs)$/, '') };
  }
}

function renderConfig(course: Course, config: NotebookConfig, graph: ModuleGraph, files: string[], coursePath: string) {
  const use = { R: false };
  const ids = exportHolding(course.identities, graph, files, coursePath);
  const lines = [`  title: ${str(config.title ?? '', use)},`];
  if (config.decks?.length) lines.push('  decks: [', ...config.decks.map((d) => `    ${lit(d, use)},`), '  ],');
  if (ids) lines.push(ids.name === 'identities' ? '  identities,' : `  identities: ${ids.name},`);
  else if (config.identities?.length) lines.push('  identities: [', ...config.identities.map((i: Identity) => `    ${lit(i, use)},`), '  ],');
  if (config.indexWhy) lines.push(`  indexWhy: ${str(config.indexWhy, use)},`);
  const folders = Object.entries(config.folders ?? {});
  if (folders.length) lines.push('  folders: {', ...folders.map(([k, v]) => `    ${key(k)}: ${str(v, use)},`), '  },');

  return [
    `// Written by Principia ${APP_VERSION} from ${coursePath}, when this folder was upgraded from notes format 1.`,
    '// Edit it freely: see docs/CONTENT_GUIDE.md in the Principia repository.',
    `import { ${use.R ? 'R, ' : ''}defineNotebook } from 'principia';`,
    ...(ids ? [`import { ${ids.name} } from '${ids.spec}';`] : []),
    '',
    'export default defineNotebook({',
    ...lines,
    '});',
    '',
  ].join('\n');
}
