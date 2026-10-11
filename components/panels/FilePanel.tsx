'use client';

import { Component, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { fileKind } from '@/lib/notebook/compile';
import { useLoaded, useNotebook } from '@/lib/notebook/hooks';
import { findTopic, folderTrail } from '@/lib/notebook/indexer';
import { importModule, readFile, reconnect, type Notebook } from '@/lib/notebook/store';
import { filePanelId } from '@/lib/workspace';
import { useScrollMemory } from '@/lib/useScrollMemory';
import { Callout, Circ, Flag, NoteLine, PanelContext, Row, SlideRefs, Why } from '../Notes';
import { P, Tex } from '../Tex';
import { TopicView } from './TopicPanel';

/** Components every Markdown/MDX note can use without importing them, e.g. <Callout heading="Trap" text="..." />. */
export const mdxComponents = {
  Tex, P, Row, NoteLine, Callout, Why, SlideRefs, Flag, Circ,
  table: (p: React.ComponentProps<'table'>) => (
    <div className="table-wrap">
      <table {...p} />
    </div>
  ),
};

const MAX_TEXT = 2_000_000;

/** One file of a notebook. How it is shown depends on what it is: see docs/CONTENT_GUIDE.md. */
export function FilePanel({ nbId, path }: { nbId: string; path: string }) {
  const nb = useNotebook(nbId);
  const [ready, setReady] = useState(false);
  const scroll = useScrollMemory(filePanelId(nbId, path), ready);
  return (
    <div className="panel" {...scroll}>
      <PanelBody nb={nb} nbId={nbId} path={path} onReady={() => setReady(true)} />
    </div>
  );
}

function PanelBody({ nb, nbId, path, onReady }: { nb?: Notebook; nbId: string; path: string; onReady: () => void }) {
  if (!nb) return <Message>This folder is closed. Close the tab, or open the folder again from the explorer.</Message>;
  if (nb.status === 'needs-permission')
    return (
      <Message>
        The browser needs your permission again to read “{nb.name}”.{' '}
        <button type="button" className="btn" onClick={() => void reconnect(nbId)}>
          Reconnect
        </button>
      </Message>
    );
  if (nb.version === 0) return <Message>{nb.status === 'error' ? `Could not open the folder: ${nb.error}` : 'Loading the folder…'}</Message>;

  const entry = nb.files.find((f) => f.path === path);
  if (!entry) return <Message>{path} is no longer in this folder.</Message>;
  const stamp = `${nbId}|${path}|${entry.size}:${entry.mtime}`;
  const kind = fileKind(path);

  if (kind === 'script' || kind === 'mdx' || kind === 'md') return <ModuleView nb={nb} path={path} kind={kind} onReady={onReady} />;
  if (kind === 'image' || kind === 'pdf' || kind === 'video' || kind === 'audio') return <MediaView nb={nb} path={path} kind={kind} stamp={stamp} />;
  if (kind === 'html') return <HtmlView nb={nb} path={path} stamp={stamp} />;
  if (entry.size > MAX_TEXT) return <Message>{path} is too large to preview.</Message>;
  return <SourceView nb={nb} path={path} stamp={stamp} onReady={onReady} />;
}

function Message({ children }: { children: ReactNode }) {
  return (
    <article className="sheet">
      <p className="lede">{children}</p>
    </article>
  );
}

function Crumbs({ nb, path }: { nb: Notebook; path: string }) {
  return (
    <p className="crumbs doc-crumbs">
      {[nb.title, ...folderTrail(nb.config, path), path.slice(path.lastIndexOf('/') + 1)].join('  /  ')}
    </p>
  );
}

function ErrorView({ path, error }: { path: string; error: unknown }) {
  return (
    <article className="sheet">
      <div className="callout">
        <p className="callout-h">Could not show {path}</p>
        <pre className="error-text">{error instanceof Error ? error.message : String(error)}</pre>
      </div>
      <p className="lede">Fix the file and save it: this panel reloads by itself.</p>
    </article>
  );
}

/** Script, Markdown and MDX files: a default-exported component, a structured topic, or else the source. */
function ModuleView({ nb, path, kind, onReady }: { nb: Notebook; path: string; kind: 'script' | 'mdx' | 'md'; onReady: () => void }) {
  // The version changes when any file changes; unchanged modules come back from the cache as the same objects.
  const loaded = useLoaded(() => importModule(nb.id, path), `${nb.id}|${path}|${nb.version}`);
  const done = loaded.value !== undefined || loaded.error !== undefined;
  useEffect(() => {
    if (done) onReady();
  }, [done, onReady]);

  if (loaded.error !== undefined) return <ErrorView path={path} error={loaded.error} />;
  if (!loaded.value) return <Message>Loading {path}…</Message>;
  const exp = loaded.value;
  const panelId = filePanelId(nb.id, path);

  if (typeof exp.default === 'function') {
    const Content = exp.default as ComponentType<{ components?: typeof mdxComponents }>;
    const body = (
      <Boundary path={path} reset={Content}>
        <PanelContext.Provider value={{ nbId: nb.id, panelId }}>
          <Content components={mdxComponents} />
        </PanelContext.Provider>
      </Boundary>
    );
    // `export const layout = 'full'` gives a component the whole panel, without the paper sheet around it.
    if (exp.layout === 'full') return <div className="fill">{body}</div>;
    return (
      <article className={'sheet prose' + (kind === 'script' ? ' is-component' : '')}>
        <Crumbs nb={nb} path={path} />
        {body}
      </article>
    );
  }

  const topic = findTopic(exp);
  if (topic)
    return (
      <Boundary path={path} reset={topic}>
        <TopicView topic={topic} nbId={nb.id} path={path} notebookTitle={nb.title} folders={folderTrail(nb.config, path)} />
      </Boundary>
    );

  return <SourceView nb={nb} path={path} stamp={`${nb.id}|${path}|${nb.version}`} onReady={onReady} />;
}

function SourceView({ nb, path, stamp, onReady }: { nb: Notebook; path: string; stamp: string; onReady?: () => void }) {
  const loaded = useLoaded(() => readFile(nb.id, path, 'text') as Promise<string>, stamp);
  const done = loaded.value !== undefined || loaded.error !== undefined;
  useEffect(() => {
    if (done) onReady?.();
  }, [done, onReady]);

  if (loaded.error !== undefined) return <ErrorView path={path} error={loaded.error} />;
  if (loaded.value === undefined) return <Message>Loading {path}…</Message>;
  if (loaded.value.slice(0, 8000).includes('\u0000')) return <Message>{path} is a binary file: there is no preview.</Message>;
  return (
    <article className="sheet">
      <Crumbs nb={nb} path={path} />
      <pre className="source">
        <code>{loaded.value}</code>
      </pre>
    </article>
  );
}

function useBlobUrl(nb: Notebook, path: string, stamp: string) {
  const [url, setUrl] = useState<{ stamp: string; url?: string; error?: unknown }>();
  useEffect(() => {
    let current = true;
    let made: string | undefined;
    (readFile(nb.id, path, 'blob') as Promise<Blob>).then(
      (blob) => {
        if (!current) return;
        made = URL.createObjectURL(blob);
        setUrl({ stamp, url: made });
      },
      (error) => current && setUrl({ stamp, error }),
    );
    return () => {
      current = false;
      if (made) URL.revokeObjectURL(made);
    };
  }, [nb.id, path, stamp]);
  return url;
}

function MediaView({ nb, path, kind, stamp }: { nb: Notebook; path: string; kind: 'image' | 'pdf' | 'video' | 'audio'; stamp: string }) {
  const src = useBlobUrl(nb, path, stamp);
  if (src?.error !== undefined) return <ErrorView path={path} error={src.error} />;
  if (!src?.url) return <Message>Loading {path}…</Message>;
  if (kind === 'pdf') return <iframe className="fill frame" src={src.url} title={path} />;
  return (
    <article className="sheet media">
      <Crumbs nb={nb} path={path} />
      {kind === 'image' && <img src={src.url} alt={path} />}
      {kind === 'video' && <video src={src.url} controls />}
      {kind === 'audio' && <audio src={src.url} controls />}
    </article>
  );
}

/** HTML runs in a sandboxed frame: its scripts work, but it cannot reach the app or the other files. */
function HtmlView({ nb, path, stamp }: { nb: Notebook; path: string; stamp: string }) {
  const loaded = useLoaded(() => readFile(nb.id, path, 'text') as Promise<string>, stamp);
  if (loaded.error !== undefined) return <ErrorView path={path} error={loaded.error} />;
  if (loaded.value === undefined) return <Message>Loading {path}…</Message>;
  return <iframe className="fill frame" sandbox="allow-scripts allow-forms allow-popups allow-modals" srcDoc={loaded.value} title={path} />;
}

/** Catches a render error in a note's own component, so one broken note cannot take down the workspace. */
class Boundary extends Component<{ path: string; reset: unknown; children: ReactNode }, { error: unknown; reset: unknown }> {
  state = { error: undefined as unknown, reset: this.props.reset };
  static getDerivedStateFromProps(props: { reset: unknown }, state: { reset: unknown }) {
    return props.reset !== state.reset ? { error: undefined, reset: props.reset } : null;
  }
  static getDerivedStateFromError(error: unknown) {
    return { error: error ?? new Error('unknown error') };
  }
  render() {
    return this.state.error !== undefined ? <ErrorView path={this.props.path} error={this.state.error} /> : this.props.children;
  }
}
