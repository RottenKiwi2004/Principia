// The open notes folders ("notebooks"). Each has a file source, a module graph and an index. Folders are
// remembered across reloads; while the tab is visible their files are polled, and a change reloads the changed
// modules (and what imports them) and re-scans the index, so an edit saved in any editor shows up in a moment.
// After each scan the notes format is checked against this app (lib/notebook/migrate.ts): an older folder is
// upgraded on disk when the app may write to it, and otherwise read as it is, in compatibility mode.
import { createStore } from '@/lib/store';
import { APP_VERSION, FORMAT_VERSION } from '@/lib/version';
import type { NotebookConfig } from '@/sdk/types';
import { builtinModules } from './builtins';
import { forgetRoot, loadRoots, saveRoot, type SavedRoot } from './idb';
import { comparePaths, emptyIndex, type NotebookIndex } from './indexer';
import { ModuleGraph, type LoaderEnv } from './loader';
import { upgradeNotebook, versionStatus, type VersionFile, type VersionStatus } from './migrate';
import { importNpm } from './npm';
import { scanNotebook, type Scan } from './scan';
import { DirectorySource, FileListSource, SampleSource, writable, type FileEntry, type FileSource, type WritableSource } from './source';

export type NotebookStatus = 'loading' | 'ready' | 'needs-permission' | 'error';

/** A message about the folder's notes format, shown under its name in the explorer. */
export type Notice = { level: 'info' | 'warn' | 'error'; text: string; action?: 'upgrade' };

export type Notebook = {
  id: string; //            also part of every panel id, so it never contains ':'
  kind: 'folder' | 'files' | 'sample';
  name: string; //          the folder's name
  title: string; //         config.title, or the folder's name
  status: NotebookStatus;
  error?: string;
  live: boolean; //         edits on disk are picked up
  files: FileEntry[]; //    in explorer order
  config: NotebookConfig;
  index: NotebookIndex;
  errors: Map<string, string>; // files that failed to load during the last scan
  version: number; //       goes up on every change, so panels know to re-import
  format: number; //        the notes format of the folder (FORMAT_VERSION is the app's)
  versionFile: VersionFile | null; // its principia.version.json
  notice?: Notice;
};

type Live = {
  nb: Notebook;
  source: FileSource | null;
  saved?: SavedRoot;
  graph: ModuleGraph | null;
  stamps: Map<string, string>;
  busy: boolean;
  again: boolean;
  scan?: Scan; //            the last scan, and the files it saw
  paths: string[];
  upgradeTried: boolean; //  upgrade automatically once per open; the notice's button tries again
  upgraded?: Notice; //      "Upgraded from …", kept while the folder stays open
};

const live = new Map<string, Live>();
export const notebooks = createStore<Notebook[]>([]);
const publish = () => notebooks.set([...live.values()].map((l) => l.nb));
const update = (l: Live, patch: Partial<Notebook>) => {
  l.nb = { ...l.nb, ...patch };
  publish();
};

export const getNotebook = (id: string) => live.get(id)?.nb;
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

function envFor(l: Live): LoaderEnv {
  return {
    builtins: builtinModules,
    importNpm: (spec) => importNpm(spec, l.nb.config.dependencies),
    assetUrl: (_path, blob) => URL.createObjectURL(blob),
    injectCss: (path, css) => {
      const key = `${l.nb.id}:${path}`;
      document.querySelectorAll(`style[data-note-css="${CSS.escape(key)}"]`).forEach((e) => e.remove());
      if (css === null) return;
      const el = document.createElement('style');
      el.dataset.noteCss = key;
      el.textContent = css;
      document.head.append(el);
    },
  };
}

/** Lists the files and, if anything changed since last time, reloads what changed and re-scans. */
async function sync(l: Live) {
  if (!l.source) return;
  if (l.busy) {
    l.again = true;
    return;
  }
  l.busy = true;
  try {
    do {
      l.again = false;
      const files = (await l.source.list()).sort((a, b) => comparePaths(a.path, b.path));
      const stamps = new Map(files.map((f) => [f.path, `${f.size}:${f.mtime}`]));
      if (l.graph && l.nb.status === 'ready') {
        const changed = [...stamps].filter(([p, s]) => l.stamps.get(p) !== s).map(([p]) => p);
        const removed = [...l.stamps.keys()].filter((p) => !stamps.has(p));
        if (!changed.length && !removed.length) continue;
        if (removed.length || changed.some((p) => !l.stamps.has(p))) l.graph.setFiles(stamps.keys());
        else l.graph.invalidate(changed);
      } else {
        l.graph = new ModuleGraph(l.source, stamps.keys(), envFor(l));
      }
      l.stamps = stamps;
      l.paths = files.map((f) => f.path);
      const scan = (l.scan = await scanNotebook(l.graph, l.paths));
      if (!live.has(l.nb.id)) return; // closed while loading
      const { config, index, errors } = scan;
      update(l, { status: 'ready', error: undefined, files, config, index, errors, title: config.title || l.nb.name, version: l.nb.version + 1 });
      await checkVersion(l);
    } while (l.again);
  } catch (e) {
    update(l, { status: 'error', error: message(e) });
  } finally {
    l.busy = false;
  }
}

function noticeFor(l: Live, s: VersionStatus): Notice | undefined {
  const app = s.file ? ` by Principia ${s.file.app}` : '';
  switch (s.action) {
    case 'upgrade':
      return l.nb.kind === 'folder'
        ? { level: 'warn', text: `Notes format ${s.format}, shown in compatibility mode. Upgrading rewrites the files for format ${FORMAT_VERSION} and keeps a backup.`, action: 'upgrade' }
        : { level: 'info', text: `Notes format ${s.format}, shown in compatibility mode. This copy is read-only, so its files are not upgraded.` };
    case 'newer':
      return { level: 'warn', text: `Written for notes format ${s.format}${app}; this is Principia ${APP_VERSION} (format ${FORMAT_VERSION}). Some notes may not show correctly. Nothing is changed: update Principia to read them fully.` };
    case 'invalid':
    case 'misplaced':
      return { level: 'warn', text: s.problem ?? '' };
    case 'none':
      if (s.newerApp)
        return { level: 'info', text: `Last written by Principia ${s.file?.app}, newer than this app (${APP_VERSION}). Notes that use newer features may not show correctly.` };
  }
}

/** Compares the folder's notes format with the app's and, when the folder can be written, brings it up to date. */
async function checkVersion(l: Live) {
  if (!l.source || !l.graph || !l.scan) return;
  const s = await versionStatus(l.source, l.paths, l.scan);
  update(l, { format: s.format, versionFile: s.file, notice: noticeFor(l, s) ?? l.upgraded });
  if ((s.action !== 'upgrade' && s.action !== 'stamp') || l.upgradeTried || !(await writable(l.source))) return;

  l.upgradeTried = true;
  const source = l.source as WritableSource;
  try {
    const r = await upgradeNotebook(source, { files: l.paths, read: (p) => source.readText(p), graph: l.graph, scan: l.scan }, s);
    if (s.action === 'upgrade') {
      const where = 'backup' in r && r.backup ? ` The previous files are in ${r.backup}/.` : '';
      l.upgraded = { level: 'info', text: `Upgraded from notes format ${s.format} to ${FORMAT_VERSION}.${where}` };
      update(l, { notice: l.upgraded });
    }
    l.again = true; // the files changed: list and scan again
  } catch (e) {
    update(l, { notice: { level: 'error', text: `The upgrade failed: ${message(e)}. The notes are shown in compatibility mode.`, action: 'upgrade' } });
  }
}

/** The notice's "Upgrade" button: asks for edit permission if needed (this needs the click), then upgrades. */
export async function upgradeNow(id: string) {
  const l = live.get(id);
  if (!l?.source) return;
  if (l.saved?.kind === 'folder' && !(await writable(l.source))) {
    const perm = await l.saved.handle.requestPermission?.({ mode: 'readwrite' });
    if (perm !== 'granted') return;
  }
  l.upgradeTried = false;
  if (l.busy) l.again = true;
  else {
    l.busy = true;
    try {
      await checkVersion(l);
    } finally {
      l.busy = false;
    }
    if (l.again) void sync(l);
  }
}

function add(id: string, kind: Notebook['kind'], name: string, source: FileSource | null, saved?: SavedRoot) {
  const nb: Notebook = {
    id, kind, name, title: name, status: 'loading', live: !!source?.live || kind === 'folder',
    files: [], config: {}, index: emptyIndex(), errors: new Map(), version: 0, format: FORMAT_VERSION, versionFile: null,
  };
  const l: Live = { nb, source, saved, graph: null, stamps: new Map(), busy: false, again: false, paths: [], upgradeTried: false };
  live.set(id, l);
  publish();
  return l;
}

/** Asks for a folder with the browser's folder picker. 'unsupported' means: use openFiles with an <input> instead. */
export async function openFolder(): Promise<string | null | 'unsupported'> {
  if (typeof window.showDirectoryPicker !== 'function') return 'unsupported';
  let handle: FileSystemDirectoryHandle;
  try {
    // Edit access, so that notes written for an older format can be upgraded when they are opened.
    handle = await window.showDirectoryPicker({ id: 'notes', mode: 'readwrite' });
  } catch {
    return null; // cancelled
  }
  return openHandle(handle);
}

/** Opens a folder handle (from the picker, or any other source of handles), or finds it if it is already open. */
export async function openHandle(handle: FileSystemDirectoryHandle) {
  for (const l of live.values()) if (l.saved?.kind === 'folder' && (await l.saved.handle.isSameEntry(handle))) return l.nb.id;
  const saved: SavedRoot = { id: newId('f'), kind: 'folder', name: handle.name, order: Date.now(), handle };
  void saveRoot(saved);
  const l = add(saved.id, 'folder', handle.name, new DirectorySource(handle), saved);
  await sync(l);
  return saved.id;
}

/** Opens the files of an <input type="file" webkitdirectory>. A snapshot that is not remembered after a reload. */
export async function openFiles(files: FileList) {
  if (!files.length) return null;
  const source = new FileListSource(files);
  const l = add(newId('d'), 'files', source.name, source);
  await sync(l);
  return l.nb.id;
}

/** Opens a folder under samples/ in this repository. */
export async function openSample(sample: string) {
  for (const l of live.values()) if (l.saved?.kind === 'sample' && l.saved.sample === sample) return l.nb.id;
  const saved: SavedRoot = { id: `s-${sample.replace(/[^\w-]/g, '_')}`, kind: 'sample', name: sample, order: Date.now(), sample };
  void saveRoot(saved);
  const l = add(saved.id, 'sample', sample, new SampleSource(sample), saved);
  await sync(l);
  return saved.id;
}

export function closeNotebook(id: string) {
  live.delete(id);
  void forgetRoot(id);
  document.querySelectorAll('style[data-note-css]').forEach((e) => {
    if ((e as HTMLElement).dataset.noteCss?.startsWith(`${id}:`)) e.remove();
  });
  publish();
}

/** After a reload the browser forgets folder permissions until the user asks again (a click is required). */
export async function reconnect(id: string) {
  const l = live.get(id);
  if (l?.saved?.kind !== 'folder') return;
  // Edit access lets an older notes format be upgraded; read access alone still shows the notes.
  const handle = l.saved.handle;
  const perm = (await handle.requestPermission?.({ mode: 'readwrite' })) === 'granted' ? 'granted' : await handle.requestPermission?.({ mode: 'read' });
  if (perm !== 'granted') return;
  l.source = new DirectorySource(l.saved.handle);
  update(l, { status: 'loading' });
  await sync(l);
}

export function refresh(id: string) {
  const l = live.get(id);
  if (l) void sync(l);
}

export async function importModule(id: string, path: string) {
  const graph = live.get(id)?.graph;
  if (!graph) throw new Error('the folder is not loaded');
  return graph.import(path);
}

export async function readFile(id: string, path: string, as: 'text' | 'blob') {
  const source = live.get(id)?.source;
  if (!source) throw new Error('the folder is not loaded');
  return as === 'text' ? source.readText(path) : source.readBlob(path);
}

export async function listSamples(): Promise<string[]> {
  try {
    const r = await fetch('/api/samples', { cache: 'no-store' });
    return r.ok ? ((await r.json()) as string[]) : [];
  } catch {
    return [];
  }
}

// ---- start-up: reopen remembered folders, then keep them in sync -------------------------
let restoring: Promise<void> | null = null;

export function restoreNotebooks() {
  return (restoring ??= (async () => {
    for (const s of await loadRoots()) {
      if (live.has(s.id)) continue;
      if (s.kind === 'sample') {
        void sync(add(s.id, 'sample', s.name, new SampleSource(s.sample), s));
      } else {
        const granted = (await s.handle.queryPermission?.({ mode: 'read' }).catch(() => 'denied')) === 'granted';
        const l = add(s.id, 'folder', s.name, granted ? new DirectorySource(s.handle) : null, s);
        if (granted) void sync(l);
        else update(l, { status: 'needs-permission' });
      }
    }
    const poll = () => {
      if (document.hidden) return;
      for (const l of live.values()) if (l.source?.live && l.nb.status !== 'loading') void sync(l);
    };
    window.setInterval(poll, 1500);
    window.addEventListener('focus', poll);
    document.addEventListener('visibilitychange', poll);
  })());
}
