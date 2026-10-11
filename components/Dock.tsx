'use client';

import { useEffect, useRef } from 'react';
import { DockviewReact, themeDark, type DockviewReadyEvent, type IDockviewPanelProps } from 'dockview-react';
import { notebooks } from '@/lib/notebook/store';
import { LAYOUT_KEY, getApi, refreshTitles, setActivePanel, setApi } from '@/lib/workspace';
import { FilePanel } from './panels/FilePanel';
import { IdentityPanel } from './panels/IdentityPanel';
import { Welcome } from './Welcome';

// The keys are the `component` names used in lib/workspace.ts. Each panel gets its notebook and file from params.
const components = {
  file: (p: IDockviewPanelProps<{ nbId: string; path: string }>) => <FilePanel nbId={p.params.nbId} path={p.params.path} />,
  index: (p: IDockviewPanelProps<{ nbId: string }>) => <IdentityPanel nbId={p.params.nbId} />,
};

function onReady({ api }: DockviewReadyEvent) {
  setApi(api);

  // Restore the last layout. A saved layout from an older version may not load: start fresh then.
  try {
    const saved = window.localStorage.getItem(LAYOUT_KEY);
    if (saved) api.fromJSON(JSON.parse(saved));
  } catch {
    api.clear();
  }

  setActivePanel(api.activePanel?.id ?? null);
  api.onDidActivePanelChange((e) => setActivePanel(e.panel?.id ?? null));
  api.onDidLayoutChange(() => {
    try {
      window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(api.toJSON()));
    } catch {
      /* storage unavailable: the layout just won't be remembered */
    }
  });
}

export default function Dock() {
  const box = useRef<HTMLDivElement>(null);

  // Size the dock from its own box, every time that box changes (window resize, zoom, explorer toggle, fonts
  // loading). If dockview ever kept a stale, taller measurement, panes would extend past the window.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const api = getApi();
      if (api && el.clientWidth > 0 && el.clientHeight > 0) api.layout(el.clientWidth, el.clientHeight);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener('resize', fit);
    void document.fonts?.ready.then(fit);
    // Tab titles follow the topics' titles as folders load and files change.
    const off = notebooks.subscribe(refreshTitles);
    return () => {
      ro.disconnect();
      off();
      window.removeEventListener('resize', fit);
      setApi(null);
    };
  }, []);

  return (
    <div ref={box} className="dock-fill">
      <DockviewReact className="dock-root" theme={themeDark} components={components} watermarkComponent={Welcome} onReady={onReady} />
    </div>
  );
}
