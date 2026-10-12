'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { restoreNotebooks } from '@/lib/notebook/store';
import { Explorer } from './Explorer';
import { Clock } from './Clock';
import { StepControls } from './StepControls';

// Dockview measures the DOM and reads localStorage, so it only runs in the browser.
const Dock = dynamic(() => import('./Dock'), {
  ssr: false,
  loading: () => <div className="dock-loading">Loading workspace…</div>,
});

export function Workspace() {
  const [collapsed, setCollapsed] = useState(false);

  // Reopen the folders that were open last time.
  useEffect(() => {
    void restoreNotebooks();
  }, []);

  // Ctrl+B / Cmd+B toggles the explorer, as in VS Code.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setCollapsed((c) => !c);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="shell" data-explorer={collapsed ? 'closed' : 'open'}>
      <Explorer collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="dock">
        <Dock />
        <StepControls />
      </div>
      <Clock />
    </div>
  );
}
