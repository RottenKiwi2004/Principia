'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { stepBy, stepStates, stepTarget, type StepCommand } from '@/lib/steps';
import { useNotebooks } from '@/lib/notebook/hooks';
import { activePanel, adjacentNote, currentFilePanel, fileTitle, getApi, goToNote, panelFile } from '@/lib/workspace';

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    {children}
  </svg>
);
const ToStart = () => (
  <Svg>
    <rect x="3" y="3.5" width="1.6" height="9" rx="0.4" />
    <path d="M13 3.6v8.8L5.8 8z" />
  </Svg>
);
const Back = () => (
  <Svg>
    <path d="M11.5 3.6v8.8L4.3 8z" />
  </Svg>
);
const Forward = () => (
  <Svg>
    <path d="M4.5 3.6v8.8L11.7 8z" />
  </Svg>
);
const ToEnd = () => (
  <Svg>
    <path d="M3 3.6v8.8L10.2 8z" />
    <rect x="11.4" y="3.5" width="1.6" height="9" rx="0.4" />
  </Svg>
);

/** Keys never taken from a control that uses arrows itself (a text field, a slider, a select…). */
function ownsArrows(t: EventTarget | null) {
  const el = t instanceof Element ? t : null;
  return !!el?.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="slider"], [role="textbox"], [role="spinbutton"]');
}

const PrevNote = () => (
  <svg width={18} height={16} viewBox="0 0 18 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M8 2h5.5L16 4.5V14H8z" />
    <path d="M5.5 5L2.5 8l3 3M2.8 8h7.4" />
  </svg>
);
const NextNote = () => (
  <svg width={18} height={16} viewBox="0 0 18 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M2 2h5.5L10 4.5V14H2z" />
    <path d="M12.5 5l3 3-3 3M7.8 8h7.4" />
  </svg>
);

/** The note the bar acts on: the active file, else (the identity index is active) the note showing beside it. */
function barTarget(states = stepStates.get(), active = activePanel.get()) {
  return active?.startsWith('file:') ? active : (stepTarget(states, active) ?? currentFilePanel(active));
}

/**
 * The bar over the bottom middle of the dock. For a note with steps: to the start, back, the stage, forward, to
 * the end (← and → step, Shift+← and Shift+→ jump). For every note: the previous and next note of its folder
 * (Ctrl+← and Ctrl+→, or ⌘ on a Mac), shown in place of the current one.
 */
export function StepControls() {
  const states = useSyncExternalStore(stepStates.subscribe, stepStates.get, stepStates.get);
  const active = useSyncExternalStore(activePanel.subscribe, activePanel.get, () => null);
  useNotebooks(); // the order and titles of the notes follow the folder
  const id = barTarget(states, active);
  const stepId = stepTarget(states, active);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || ownsArrows(e.target)) return;
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      if (e.ctrlKey || e.metaKey) {
        const target = barTarget();
        if (!e.shiftKey && target && goToNote(target, dir)) e.preventDefault();
        return;
      }
      const cmd: StepCommand = dir > 0 ? (e.shiftKey ? 'end' : 'forward') : e.shiftKey ? 'start' : 'back';
      if (stepBy(cmd)) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const file = panelFile(id);
  if (!id || !file) return null;
  const title = getApi()?.getPanel(id)?.title;
  const prev = adjacentNote(file.nbId, file.path, -1);
  const next = adjacentNote(file.nbId, file.path, 1);
  const steps = stepId === id ? states[id] : undefined;
  const s = steps ? Math.min(steps.stage, steps.total) : 0;

  return (
    <div className="steps" role="toolbar" aria-label={`Steps and notes: ${title ?? 'the note'}`}>
      {title && id !== active && <span className="steps-title">{title}</span>}
      {steps && (
        <>
          <button type="button" className="steps-btn" onClick={() => stepBy('start')} disabled={s === 0} title="Back to the start (Shift+←)" aria-label="Back to the start">
            <ToStart />
          </button>
          <button type="button" className="steps-btn" onClick={() => stepBy('back')} disabled={s === 0} title="Step back (←)" aria-label="Step back">
            <Back />
          </button>
          <span className="steps-count" aria-live="polite" title="Stage, out of all stages">
            <b>{s}</b> / {steps.total}
          </span>
          <button type="button" className="steps-btn" onClick={() => stepBy('forward')} disabled={s === steps.total} title="Step forward (→)" aria-label="Step forward">
            <Forward />
          </button>
          <button type="button" className="steps-btn" onClick={() => stepBy('end')} disabled={s === steps.total} title="Skip to the end (Shift+→)" aria-label="Skip to the end">
            <ToEnd />
          </button>
          <span className="steps-sep" aria-hidden="true" />
        </>
      )}
      <button
        type="button"
        className="steps-btn steps-note"
        onClick={() => goToNote(id, -1)}
        disabled={!prev}
        title={prev ? `Previous note: ${fileTitle(file.nbId, prev)} (Ctrl+←)` : 'This is the first note'}
        aria-label={prev ? `Previous note: ${fileTitle(file.nbId, prev)}` : 'No previous note'}
      >
        <PrevNote />
      </button>
      <button
        type="button"
        className="steps-btn steps-note"
        onClick={() => goToNote(id, 1)}
        disabled={!next}
        title={next ? `Next note: ${fileTitle(file.nbId, next)} (Ctrl+→)` : 'This is the last note'}
        aria-label={next ? `Next note: ${fileTitle(file.nbId, next)}` : 'No next note'}
      >
        <NextNote />
      </button>
    </div>
  );
}
