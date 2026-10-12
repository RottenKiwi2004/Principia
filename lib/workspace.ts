import type { DockviewApi } from 'dockview-react';
import { createStore } from '@/lib/store';
import { basename, comparePaths } from '@/lib/notebook/indexer';
import { getNotebook } from '@/lib/notebook/store';
import { fileKind } from '@/lib/notebook/compile';

// ---- panel ids ------------------------------------------------------------------------
// A file panel is "file:<notebookId>:<path>". The identity index of a notebook is "index:<notebookId>".
export const filePanelId = (nbId: string, path: string) => `file:${nbId}:${path}`;
export const indexPanelId = (nbId: string) => `index:${nbId}`;

export const LAYOUT_KEY = 'notes-layout-v3';

// ---- the dock's API, set once the dock is ready -----------------------------------------
let apiRef: DockviewApi | null = null;
export const setApi = (api: DockviewApi | null) => {
  apiRef = api;
};
export const getApi = () => apiRef;

type Side = 'left' | 'right';
type PanelSpec = { id: string; component: 'file' | 'index'; title: string; params: Record<string, string> };

/** A tab title: the topic's title for a structured topic, otherwise the file name. */
export function fileTitle(nbId: string, path: string) {
  const topic = getNotebook(nbId)?.index.byPath.get(path)?.topic;
  return (topic?.title ?? basename(path)).replace(/\$/g, '');
}
function indexTitle(nbId: string) {
  const nb = getNotebook(nbId);
  return `Identity index${nb ? ` · ${nb.title}` : ''}`;
}

const fileSpec = (nbId: string, path: string): PanelSpec => ({
  id: filePanelId(nbId, path),
  component: 'file',
  title: fileTitle(nbId, path),
  params: { nbId, path },
});
const indexSpec = (nbId: string): PanelSpec => ({ id: indexPanelId(nbId), component: 'index', title: indexTitle(nbId), params: { nbId } });

/**
 * Open a panel. Without `side` it activates the panel, or adds it as a tab in the active group.
 * With `side` it puts the panel in its own group beside `fromId` (or the active panel), like
 * "Open to the Side" in VS Code. A panel that already sits in another group is just activated.
 */
function open(spec: PanelSpec, o: { side?: Side; fromId?: string } = {}) {
  const api = apiRef;
  if (!api) return;
  const existing = api.getPanel(spec.id);
  const ref = (o.fromId ? api.getPanel(o.fromId) : undefined) ?? api.activePanel;
  const sameGroup = !!existing && !!ref && existing.group.id === ref.group.id;

  if (existing && (!o.side || !ref || ref.id === existing.id || !sameGroup)) {
    // Only activate a panel that is hidden behind another tab. Re-activating a panel that is already
    // showing makes dockview re-attach its element, and the browser resets its scroll to the top.
    if (existing.group.activePanel?.id !== existing.id) existing.api.setActive();
    return;
  }
  if (existing) api.removePanel(existing); // same group as the reference: move it to the side

  const base = { id: spec.id, component: spec.component, title: spec.title, params: spec.params };
  api.addPanel(ref ? { ...base, position: { referencePanel: ref.id, direction: o.side ?? 'within' } } : base);
}

/** The file panel that was active most recently, so new files join its group rather than the index's. */
let lastFilePanel: string | null = null;

export function openFile(nbId: string, path: string, o: { side?: Side; fromId?: string } = {}) {
  const api = apiRef;
  const active = api?.activePanel?.id;
  // A plain "open" while an identity index is focused goes into the last file's group, like an editor group.
  if (!o.side && !o.fromId && active?.startsWith('index:') && lastFilePanel && api?.getPanel(lastFilePanel)) {
    open(fileSpec(nbId, path), { fromId: lastFilePanel });
    return;
  }
  open(fileSpec(nbId, path), o);
}
export function openIndex(nbId: string, o: { side?: Side; fromId?: string } = {}) {
  open(indexSpec(nbId), o);
}

/** The file to show when a folder is first opened: config.defaultFile, the first topic, a README, or any page. */
export function defaultFile(nbId: string) {
  const nb = getNotebook(nbId);
  if (!nb) return undefined;
  const paths = nb.files.map((f) => f.path);
  const configured = nb.config.defaultFile;
  if (configured && paths.includes(configured)) return configured;
  return (
    nb.index.topics[0]?.path ??
    paths.find((p) => /^readme\.(md|mdx)$/i.test(p)) ??
    paths.find((p) => ['mdx', 'md'].includes(fileKind(p)))
  );
}

export function openDefault(nbId: string) {
  const path = defaultFile(nbId);
  if (path) openFile(nbId, path);
}

// ---- moving between notes -------------------------------------------------------------------
/**
 * The notes of a notebook in reading order: its structured topics and Markdown/MDX pages, in explorer order.
 * Helper modules, widgets, config and other files are not notes (they can still be opened from the explorer).
 */
export function noteSequence(nbId: string) {
  const nb = getNotebook(nbId);
  if (!nb) return [];
  return nb.files.map((f) => f.path).filter((p) => nb.index.byPath.has(p) || ['md', 'mdx'].includes(fileKind(p)));
}

/** The note after (dir 1) or before (dir -1) `path`, which need not be a note itself; undefined at either end. */
export function adjacentNote(nbId: string, path: string, dir: 1 | -1) {
  const seq = noteSequence(nbId);
  return dir > 0 ? seq.find((p) => comparePaths(p, path) > 0) : [...seq].reverse().find((p) => comparePaths(p, path) < 0);
}

export const panelFile = (panelId: string | null) => {
  const params = panelId ? apiRef?.getPanel(panelId)?.params : undefined;
  return params && 'path' in params ? (params as { nbId: string; path: string }) : null;
};

/**
 * Shows the next or previous note in place of file panel `panelId`: same group, same tab position, like
 * following a link. A note that is already open elsewhere is just brought forward. False at either end.
 */
export function goToNote(panelId: string, dir: 1 | -1) {
  const api = apiRef;
  const panel = api?.getPanel(panelId);
  const file = panelFile(panelId);
  if (!api || !panel || !file) return false;
  const next = adjacentNote(file.nbId, file.path, dir);
  if (!next) return false;
  const existing = api.getPanel(filePanelId(file.nbId, next));
  if (existing) {
    existing.api.setActive();
    return true;
  }
  const spec = fileSpec(file.nbId, next);
  const index = panel.group.panels.indexOf(panel);
  api.addPanel({ ...spec, position: { referencePanel: panel.id, direction: 'within', index } });
  api.removePanel(panel);
  return true;
}

/**
 * The file panel the bottom bar acts on: the active panel if it is a file, otherwise (say the identity index is
 * active) the file that was active last, if it is still showing.
 */
export function currentFilePanel(active = activePanel.get()) {
  if (active?.startsWith('file:')) return active;
  const last = lastFilePanel ? apiRef?.getPanel(lastFilePanel) : undefined;
  return last && last.group.activePanel?.id === last.id ? last.id : null;
}

/** Close every panel of a notebook (when the folder is closed). */
export function closePanelsOf(nbId: string) {
  const api = apiRef;
  if (!api) return;
  for (const p of [...api.panels]) if ((p.params as { nbId?: string } | undefined)?.nbId === nbId) api.removePanel(p);
}

/** Tab titles follow the current topic titles (a topic may have been renamed, or its folder just loaded). */
export function refreshTitles() {
  const api = apiRef;
  if (!api) return;
  for (const p of api.panels) {
    const { nbId, path } = (p.params ?? {}) as { nbId?: string; path?: string };
    if (!nbId || !getNotebook(nbId) || getNotebook(nbId)?.status !== 'ready') continue;
    const t = path ? fileTitle(nbId, path) : indexTitle(nbId);
    if (p.title !== t) p.api.setTitle(t);
  }
}

export function resetLayout() {
  const api = apiRef;
  if (!api) return;
  try {
    window.localStorage.removeItem(LAYOUT_KEY);
  } catch {
    /* storage unavailable: nothing to clear */
  }
  api.clear();
}

// ---- small stores the UI subscribes to (useSyncExternalStore) -----------------------------
/** A focus request: "scroll to and highlight this item". `nonce` changes on every request, `at` is its time. */
export type Focus = { id: string | null; nonce: number; at: number };
const createFocusStore = () => {
  const s = createStore<Focus>({ id: null, nonce: 0, at: 0 });
  return { ...s, request: (id: string) => s.set({ id, nonce: s.get().nonce + 1, at: Date.now() }) };
};

export const identityFocus = createFocusStore(); // id = "<notebookId>::<identityId>"
export const sectionFocus = createFocusStore(); //  id = "<file panel id>::<sectionId>"
export const activePanel = createStore<string | null>(null); // the dock's active panel id, for the explorer
export function setActivePanel(id: string | null) {
  if (id?.startsWith('file:')) lastFilePanel = id;
  activePanel.set(id);
}

/** Click on a tag such as I5: open the notebook's identity index beside the panel the click came from. */
export function openIdentity(nbId: string, id: string, fromId?: string) {
  openIndex(nbId, { side: 'right', fromId });
  identityFocus.request(`${nbId}::${id}`);
}

/** Click on a "used in" chip: show that section of that topic, left of the identity index if it is not open yet. */
export function openSection(nbId: string, path: string, sectionId: string) {
  const api = apiRef;
  const index = api?.getPanel(indexPanelId(nbId));
  const last = lastFilePanel ? api?.getPanel(lastFilePanel) : undefined;
  if (api?.getPanel(filePanelId(nbId, path))) openFile(nbId, path);
  // Join the group of the file that was being read, if it sits beside the index.
  else if (last && index && last.group.id !== index.group.id) openFile(nbId, path, { fromId: last.id });
  else openFile(nbId, path, { side: 'left', fromId: indexPanelId(nbId) });
  sectionFocus.request(`${filePanelId(nbId, path)}::${sectionId}`);
}
