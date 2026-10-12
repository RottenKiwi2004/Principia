// Step-by-step reveal: the current stage of every panel that has steps, and which panel the step controls drive.
// A panel's StepScope reports how many stages it has; the stage itself lives here, so the controls, the keyboard
// and the panel agree, and it is remembered per panel across reloads.
import { createStore } from '@/lib/store';
import { activePanel, getApi } from '@/lib/workspace';

export type StepState = { stage: number; total: number };

const KEY = 'notes-steps-v1';
let saved: Record<string, number> | null = null;
function remembered() {
  if (!saved) {
    try {
      saved = JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as Record<string, number>;
    } catch {
      saved = {}; // no storage (or the server): every panel starts at the beginning
    }
  }
  return saved;
}

export const stepStates = createStore<Record<string, StepState>>({});

/** The stage a panel is at: 0 shows only what has no step; `total` shows everything. */
export const stageOf = (panelId: string) => stepStates.get()[panelId]?.stage ?? remembered()[panelId] ?? 0;

/**
 * The panel the step controls drive. When a file is active it decides (null if it has no steps), so the step and
 * note buttons always act on the same note. When something else is active (the identity index), the last panel
 * with steps, as long as it is still showing, never one hidden behind another tab.
 */
let lastStepPanel: string | null = null;
const hasSteps = (id: string | null, states = stepStates.get()): id is string => !!id && (states[id]?.total ?? 0) > 0;
activePanel.subscribe(() => {
  const a = activePanel.get();
  if (hasSteps(a)) lastStepPanel = a;
});

export function stepTarget(states = stepStates.get(), active = activePanel.get()) {
  if (active?.startsWith('file:')) return hasSteps(active, states) ? active : null;
  const last = hasSteps(lastStepPanel, states) ? getApi()?.getPanel(lastStepPanel) : undefined;
  return last && last.group.activePanel?.id === last.id ? last.id : null;
}

export function setTotal(panelId: string, total: number) {
  const cur = stepStates.get()[panelId];
  if (cur?.total === total) return;
  if (total > 0 && activePanel.get() === panelId) lastStepPanel = panelId;
  stepStates.set({ ...stepStates.get(), [panelId]: { stage: cur?.stage ?? stageOf(panelId), total } });
}

export function setStage(panelId: string, stage: number) {
  const cur = stepStates.get()[panelId];
  const s = Math.max(0, Math.min(stage, cur?.total ?? stage));
  if (cur?.stage === s) return;
  stepStates.set({ ...stepStates.get(), [panelId]: { stage: s, total: cur?.total ?? 0 } });
  remembered()[panelId] = s;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    /* not remembered */
  }
}

export type StepCommand = 'start' | 'back' | 'forward' | 'end';

/** Steps the panel the controls drive. Returns false when there is none, so a key press can go elsewhere. */
export function stepBy(cmd: StepCommand) {
  const id = stepTarget();
  if (!id) return false;
  const { stage, total } = stepStates.get()[id];
  const s = Math.min(stage, total);
  setStage(id, cmd === 'start' ? 0 : cmd === 'back' ? s - 1 : cmd === 'forward' ? s + 1 : total);
  return true;
}
