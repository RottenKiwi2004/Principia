'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { pickFolder, pickSample } from '@/lib/notebook/actions';
import { fileKind } from '@/lib/notebook/compile';
import { useNotebooks } from '@/lib/notebook/hooks';
import { basename, folderTitle, type TopicEntry } from '@/lib/notebook/indexer';
import { dirname } from '@/lib/notebook/loader';
import type { FileEntry } from '@/lib/notebook/source';
import { closeNotebook, listSamples, reconnect, refresh, type Notebook } from '@/lib/notebook/store';
import { activePanel, closePanelsOf, filePanelId, indexPanelId, openFile, openIndex, resetLayout } from '@/lib/workspace';

const COLLAPSED_KEY = 'notes-explorer-collapsed-v2';

// ---- icons ---------------------------------------------------------------------------------
const Svg = ({ children, size = 14 }: { children: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    {children}
  </svg>
);
const FileIcon = () => (
  <Svg>
    <path d="M4 1.8h5.2L12.2 4.8V14.2H4z" />
    <path d="M9 1.8v3.2h3.2" />
  </Svg>
);
const DocIcon = () => (
  <Svg>
    <path d="M4 1.8h5.2L12.2 4.8V14.2H4z" />
    <path d="M6 7.5h4.2M6 9.7h4.2M6 11.9h2.6" />
  </Svg>
);
const CodeIcon = () => (
  <Svg>
    <path d="M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5" />
  </Svg>
);
const ImageIcon = () => (
  <Svg>
    <rect x="2" y="3" width="12" height="10" rx="1" />
    <path d="M2.5 11.5l3.5-3.5 2.5 2.5 2-2 3 3" />
    <circle cx="10.5" cy="6" r="1" />
  </Svg>
);
const IndexIcon = () => (
  <Svg>
    <path d="M3 2.5h8.5a1.5 1.5 0 0 1 1.5 1.5v9.5H4.5A1.5 1.5 0 0 1 3 12z" />
    <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" />
  </Svg>
);
const FolderIcon = ({ open }: { open: boolean }) =>
  open ? (
    <Svg>
      <path d="M1.8 4.2h4.4l1.3 1.4h6.7v1.6" />
      <path d="M1.8 4.2v8.6h10.6l2-5.6H4.1l-2.3 5.6" />
    </Svg>
  ) : (
    <Svg>
      <path d="M1.8 4.2h4.4l1.3 1.4h6.7v7.2H1.8z" />
    </Svg>
  );
const Chevron = ({ open }: { open: boolean }) => (
  <Svg size={12}>
    <path d={open ? 'M4 6l4 4 4-4' : 'M6 4l4 4-4 4'} />
  </Svg>
);
const SplitIcon = () => (
  <Svg>
    <rect x="2" y="3" width="12" height="10" rx="1" />
    <path d="M8 3v10" />
  </Svg>
);
const SidebarIcon = () => (
  <Svg size={16}>
    <rect x="2" y="3" width="12" height="10" rx="1" />
    <path d="M6 3v10" />
  </Svg>
);
const CollapseAllIcon = () => (
  <Svg size={16}>
    <path d="M4.5 6.5L8 3l3.5 3.5M4.5 13L8 9.5l3.5 3.5" />
  </Svg>
);
const ExpandAllIcon = () => (
  <Svg size={16}>
    <path d="M4.5 3L8 6.5 11.5 3M4.5 9.5L8 13l3.5-3.5" />
  </Svg>
);
const OpenFolderIcon = () => (
  <Svg size={16}>
    <path d="M1.8 4.2h4.4l1.3 1.4h6.7v7.2H1.8z" />
    <path d="M8 7.3v4M6 9.3h4" />
  </Svg>
);
const RefreshIcon = () => (
  <Svg>
    <path d="M13 8a5 5 0 1 1-1.5-3.6" />
    <path d="M12 1.8v2.9H9.1" />
  </Svg>
);
const CloseIcon = () => (
  <Svg>
    <path d="M4 4l8 8M12 4l-8 8" />
  </Svg>
);

function iconFor(path: string, isTopic: boolean) {
  if (isTopic) return <FileIcon />;
  const k = fileKind(path);
  if (k === 'md' || k === 'mdx') return <DocIcon />;
  if (k === 'script' || k === 'html' || k === 'css' || k === 'json') return <CodeIcon />;
  if (k === 'image' || k === 'video' || k === 'pdf') return <ImageIcon />;
  return <FileIcon />;
}

// ---- the folder tree of a notebook ----------------------------------------------------------
type Dir = { path: string; dirs: Dir[]; files: FileEntry[] };

/** Files arrive in explorer order (sub-folders first, natural sort), so insertion order is display order. */
function buildTree(files: FileEntry[]): Dir {
  const root: Dir = { path: '', dirs: [], files: [] };
  const dirs = new Map<string, Dir>([['', root]]);
  const dirFor = (path: string): Dir => {
    let d = dirs.get(path);
    if (!d) {
      d = { path, dirs: [], files: [] };
      dirFor(dirname(path)).dirs.push(d);
      dirs.set(path, d);
    }
    return d;
  };
  for (const f of files) dirFor(dirname(f.path)).files.push(f);
  return root;
}

function allDirs(d: Dir, out: string[] = []) {
  for (const c of d.dirs) out.push(c.path, ...allDirs(c));
  return out;
}

// ---- folder open/closed state, remembered per browser ----------------------------------------
function useCollapsed() {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(COLLAPSED_KEY);
      if (saved) setCollapsed(new Set(JSON.parse(saved) as string[]));
    } catch {
      /* storage unavailable: start with everything open */
    }
  }, []);
  const save = (next: Set<string>) => {
    setCollapsed(next);
    try {
      window.localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...next]));
    } catch {
      /* not remembered */
    }
  };
  const toggle = (id: string) => {
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    save(next);
  };
  return { collapsed, toggle, setAll: save };
}

// ---- explorer --------------------------------------------------------------------------------
export function Explorer({ collapsed: railOnly, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { collapsed, toggle, setAll } = useCollapsed();
  const active = useSyncExternalStore(activePanel.subscribe, activePanel.get, () => null);
  const open = useNotebooks();
  const everyFolder = () => open.flatMap((nb) => [`${nb.id}:`, ...allDirs(buildTree(nb.files)).map((d) => `${nb.id}:${d}`)]);

  return (
    <aside className={'explorer' + (railOnly ? ' is-collapsed' : '')} aria-label="Explorer">
      <div className="ex-top">
        {!railOnly && <span>Explorer</span>}
        <span className="ex-actions">
          {!railOnly && (
            <>
              <button type="button" className="ex-icon-btn" onClick={() => void pickFolder()} title="Open folder" aria-label="Open folder">
                <OpenFolderIcon />
              </button>
              <button type="button" className="ex-icon-btn" onClick={() => setAll(new Set(everyFolder()))} title="Collapse all folders" aria-label="Collapse all folders">
                <CollapseAllIcon />
              </button>
              <button type="button" className="ex-icon-btn" onClick={() => setAll(new Set())} title="Expand all folders" aria-label="Expand all folders">
                <ExpandAllIcon />
              </button>
            </>
          )}
          <button
            type="button"
            className="ex-icon-btn"
            onClick={onToggle}
            title={railOnly ? 'Show explorer (Ctrl+B)' : 'Hide explorer (Ctrl+B)'}
            aria-label={railOnly ? 'Show explorer' : 'Hide explorer'}
            aria-expanded={!railOnly}
          >
            <SidebarIcon />
          </button>
        </span>
      </div>

      {!railOnly && (
        <>
          <div className="ex-tree" role="tree">
            {open.length === 0 && <EmptyState />}
            {open.map((nb) => (
              <NotebookNode key={nb.id} nb={nb} collapsed={collapsed} toggle={toggle} active={active} />
            ))}
          </div>

          <div className="ex-foot">
            <p className="ex-hint">
              Click a tag such as <code>I5</code> in a topic to open the Identity index beside it. Drag a tab to an edge to
              split, or onto another tab strip to merge. Saved edits reload by themselves.
            </p>
            <button type="button" className="ex-reset" onClick={resetLayout}>
              Reset layout
            </button>
          </div>
        </>
      )}
    </aside>
  );
}

function EmptyState() {
  const [samples, setSamples] = useState<string[]>([]);
  useEffect(() => {
    void listSamples().then(setSamples);
  }, []);
  return (
    <div className="ex-empty">
      <p>No folder is open.</p>
      <button type="button" className="btn btn-primary" onClick={() => void pickFolder()}>
        Open folder…
      </button>
      {samples.map((s) => (
        <button key={s} type="button" className="btn" onClick={() => void pickSample(s)}>
          Sample: {s}
        </button>
      ))}
    </div>
  );
}

type NodeProps = { collapsed: Set<string>; toggle: (id: string) => void; active: string | null };

function NotebookNode({ nb, collapsed, toggle, active }: { nb: Notebook } & NodeProps) {
  const key = `${nb.id}:`;
  const open = !collapsed.has(key);
  const tree = useMemo(() => buildTree(nb.files), [nb.files]);
  const close = () => {
    closePanelsOf(nb.id);
    closeNotebook(nb.id);
  };

  return (
    <div role="group" className="ex-root">
      <div className="ex-root-row">
        <FolderRow depth={0} title={nb.title} open={open} onClick={() => toggle(key)} strong />
        <span className="ex-root-actions">
          {nb.live && nb.status !== 'needs-permission' && (
            <button type="button" className="ex-side" title="Reload the folder" aria-label={`Reload ${nb.title}`} onClick={() => refresh(nb.id)}>
              <RefreshIcon />
            </button>
          )}
          <button type="button" className="ex-side" title="Close the folder" aria-label={`Close ${nb.title}`} onClick={close}>
            <CloseIcon />
          </button>
        </span>
      </div>
      {open && (
        <>
          {nb.status === 'needs-permission' && (
            <button type="button" className="ex-status ex-status-btn" onClick={() => void reconnect(nb.id)}>
              Click to reconnect: the browser asks again after a reload.
            </button>
          )}
          {nb.status === 'loading' && nb.version === 0 && <p className="ex-status">Loading…</p>}
          {nb.status === 'error' && <p className="ex-status is-error">{nb.error}</p>}
          {nb.kind === 'files' && nb.version > 0 && <p className="ex-status">A snapshot: edits on disk are not picked up.</p>}
          <DirChildren nb={nb} dir={tree} depth={1} collapsed={collapsed} toggle={toggle} active={active} />
          {nb.index.identities.length > 0 && (
            <FileRow
              depth={1}
              title="Identity index"
              icon={<IndexIcon />}
              active={active === indexPanelId(nb.id)}
              onOpen={() => openIndex(nb.id)}
              onSide={() => openIndex(nb.id, { side: 'right' })}
            />
          )}
        </>
      )}
    </div>
  );
}

function DirChildren({ nb, dir, depth, ...p }: { nb: Notebook; dir: Dir; depth: number } & NodeProps) {
  return (
    <>
      {dir.dirs.map((d) => {
        const key = `${nb.id}:${d.path}`;
        const open = !p.collapsed.has(key);
        return (
          <div role="group" key={d.path}>
            <FolderRow depth={depth} title={folderTitle(nb.config, d.path)} open={open} onClick={() => p.toggle(key)} />
            {open && <DirChildren nb={nb} dir={d} depth={depth + 1} {...p} />}
          </div>
        );
      })}
      {dir.files.map((f) => (
        <NoteRow key={f.path} nb={nb} path={f.path} depth={depth} active={p.active} />
      ))}
    </>
  );
}

function FolderRow({ depth, title, open, onClick, strong }: { depth: number; title: string; open: boolean; onClick: () => void; strong?: boolean }) {
  return (
    <button
      type="button"
      role="treeitem"
      aria-expanded={open}
      className={'ex-folder' + (strong ? ' is-course' : '')}
      style={{ paddingLeft: 6 + depth * 12 }}
      onClick={onClick}
      title={title}
    >
      <Chevron open={open} />
      <FolderIcon open={open} />
      <span className="ex-label">{title}</span>
    </button>
  );
}

/** Slide range of a topic's main deck, e.g. "I 29–39". */
function slideRange({ topic }: TopicEntry) {
  const slides = topic.sections.flatMap((s) => s.slides);
  const main = slides.filter((s) => s.deck === slides[0]?.deck).map((s) => s.n);
  if (!main.length) return '';
  const lo = Math.min(...main);
  const hi = Math.max(...main);
  return `${slides[0].deck} ${lo}${hi > lo ? `–${hi}` : ''}`;
}

function NoteRow({ nb, path, depth, active }: { nb: Notebook; path: string; depth: number; active: string | null }) {
  const entry = nb.index.byPath.get(path);
  const error = nb.errors.get(path);
  return (
    <FileRow
      depth={depth}
      title={entry ? entry.topic.title : basename(path)}
      tooltip={error ? `${path}\n\n${error}` : path}
      hint={entry ? slideRange(entry) : ''}
      icon={iconFor(path, !!entry)}
      error={!!error}
      active={active === filePanelId(nb.id, path)}
      onOpen={() => openFile(nb.id, path)}
      onSide={() => openFile(nb.id, path, { side: 'right' })}
    />
  );
}

function FileRow(p: {
  depth: number;
  title: string;
  tooltip?: string;
  hint?: string;
  icon: React.ReactNode;
  error?: boolean;
  active: boolean;
  onOpen: () => void;
  onSide: () => void;
}) {
  return (
    <div className={'ex-item' + (p.active ? ' is-active' : '') + (p.error ? ' has-error' : '')} role="treeitem" style={{ paddingLeft: 6 + p.depth * 12 + 12 }}>
      <button type="button" className="ex-open" onClick={p.onOpen} title={p.tooltip ?? p.title}>
        {p.icon}
        <span className="ex-label">{p.title.replace(/\$/g, '')}</span>
        {p.error && <span className="ex-error-dot" aria-label="failed to load" />}
        {p.hint && <span className="ex-hint-chip">{p.hint}</span>}
      </button>
      <button type="button" className="ex-side" title="Open to the side" aria-label={`Open ${p.title} to the side`} onClick={p.onSide}>
        <SplitIcon />
      </button>
    </div>
  );
}
