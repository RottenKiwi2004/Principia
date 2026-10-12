'use client';

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { setStage, setTotal, stageOf, stepStates } from '@/lib/steps';

// Step-by-step reveal of a panel's content.
//
// Every element with a data-step attribute is a step, in document order:
//   data-step=""   the next stage        data-step="="  the same stage as the previous step
//   data-step="3"  stage 3
// At stage s, the steps up to s are shown and later ones are hidden (data-step-hidden, display: none); content
// without data-step is always shown. Stepping forward fades the new elements in and scrolls them into view.
// It works on the DOM, so topics, Markdown/MDX, components and npm widgets all step the same way, and a
// MutationObserver keeps it right when the content changes (a live reload, a widget that renders later).

type Placed = [Element, number][];

/** Gives each step element under `root` its stage. Returns them in document order, and the last stage. */
export function placeSteps(root: Element): { placed: Placed; total: number } {
  const placed: Placed = [];
  let cur = 0;
  let total = 0;
  root.querySelectorAll('[data-step]').forEach((el) => {
    const v = el.getAttribute('data-step') ?? '';
    const st = v === '=' ? Math.max(cur, 1) : /^\d+$/.test(v) ? Math.max(1, Number(v)) : cur + 1;
    placed.push([el, st]);
    cur = st;
    total = Math.max(total, st);
  });
  return { placed, total };
}

const BAR_SPACE = 72; // the step controls sit over the bottom of the panel
const behavior = (): ScrollBehavior => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

// Where a smooth scroll that is still running will end, per panel. A quick run of key presses builds on that
// rather than on the half-way position, so it does not fall behind. It is cleared by `scrollend` (the scroll
// arrived, or the reader took over with the wheel); the timeout only covers a scrollend that never comes.
const pending = new WeakMap<HTMLElement, { top: number; at: number }>();
function scrollBase(panel: HTMLElement) {
  const p = pending.get(panel);
  return p && Date.now() - p.at < 5000 ? p.top : panel.scrollTop;
}
function scrollPanel(panel: HTMLElement, top: number) {
  const max = panel.scrollHeight - panel.clientHeight;
  const t = Math.max(0, Math.min(top, max));
  if (Math.abs(t - panel.scrollTop) < 1) return pending.delete(panel); // nothing to scroll: no scrollend would come
  pending.set(panel, { top: t, at: Date.now() });
  panel.addEventListener('scrollend', () => pending.delete(panel), { once: true });
  panel.scrollTo({ top: t, behavior: behavior() });
}

/** Before a step forward: is the end of what is shown in view? Measured where the running scroll will end. */
function measureFollow(root: HTMLElement, placed: Placed) {
  const panel = root.closest<HTMLElement>('.panel');
  if (!panel) return null;
  const base = scrollBase(panel);
  const shift = base - panel.scrollTop;
  const last = [...placed].reverse().find(([el]) => el.isConnected && !el.hasAttribute('data-step-hidden'))?.[0] ?? root;
  const r = last.getBoundingClientRect();
  const p = panel.getBoundingClientRect();
  const follow = r.bottom - shift > p.top && r.top - shift < p.bottom - BAR_SPACE;
  return { panel, base, follow, height: panel.scrollHeight };
}

/**
 * After a step forward: if the reader was following the end, scroll down by exactly as much as the note grew,
 * so what was at the bottom stays at the bottom. Never so far that the top of the new content leaves the view
 * (a part taller than the panel shows from its top).
 */
function followGrowth(before: NonNullable<ReturnType<typeof measureFollow>>, placed: Placed, from: number) {
  const { panel, base } = before;
  const growth = panel.scrollHeight - before.height;
  if (!before.follow || growth <= 0) return;
  const first = placed.find(([el, st]) => st > from && !el.hasAttribute('data-step-hidden'))?.[0];
  const shift = base - panel.scrollTop;
  const room = first ? first.getBoundingClientRect().top - shift - panel.getBoundingClientRect().top - 12 : growth;
  const delta = Math.min(growth, Math.max(0, room));
  if (delta > 0) scrollPanel(panel, base + delta);
}

/** After a step back: if the parts of the current stage are above the view, scroll up to them. */
function scrollBackTo(root: Element, placed: Placed, s: number) {
  const panel = root.closest<HTMLElement>('.panel');
  const els = placed.filter(([el, st]) => st === s && !el.hasAttribute('data-step-hidden')).map(([el]) => el.getBoundingClientRect());
  if (!panel || !els.length) return;
  const top = Math.min(...els.map((r) => r.top));
  const p = panel.getBoundingClientRect();
  if (top < p.top) scrollPanel(panel, scrollBase(panel) + top - p.top - 12);
}

/**
 * The steppable content of one panel. `blocks` makes every top-level element a step except the h1, which stays as
 * the title (an MDX page that says `export const steps = 'blocks'`).
 */
export function StepScope({ panelId, blocks = false, children }: { panelId: string; blocks?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const stage = useSyncExternalStore(stepStates.subscribe, () => stageOf(panelId), () => Number.MAX_SAFE_INTEGER);
  const placed = useRef<Placed>([]);
  const shown = useRef<number | null>(null); // the stage the DOM shows now; null before the first pass

  const apply = (s: number) => {
    const root = ref.current;
    if (!root) return null;
    if (blocks) for (const c of root.children) if (c.tagName !== 'H1' && !c.hasAttribute('data-step')) c.setAttribute('data-step', '');
    const r = placeSteps(root);
    placed.current = r.placed;
    setTotal(panelId, r.total);
    const now = Math.min(s, r.total);
    const before = shown.current;
    const forward = before !== null && now > before;
    for (const [el, st] of r.placed) {
      el.toggleAttribute('data-step-hidden', st > now);
      if (forward) el.toggleAttribute('data-step-in', st > before && st <= now);
    }
    shown.current = now;
    return { now, before };
  };
  const applyRef = useRef(apply);
  applyRef.current = apply;

  // Before paint, so hidden steps never flash and the scroll starts with the reveal.
  useLayoutEffect(() => {
    const root = ref.current;
    const follow = root && shown.current !== null && stage > shown.current ? measureFollow(root, placed.current) : null;
    const r = applyRef.current(stage);
    if (!root || !r || r.before === null || r.now === r.before) return;
    if (r.now > r.before) {
      if (follow) followGrowth(follow, placed.current, r.before);
    } else scrollBackTo(root, placed.current, r.now);
  }, [stage]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const observer = new MutationObserver(() => applyRef.current(stageOf(panelId)));
    observer.observe(root, { childList: true, subtree: true });
    // A link into the note (an identity's "used in" chip) reveals everything up to the end of its target.
    const onReveal = (e: Event) => {
      const t = e.target as Element;
      let need = 0;
      for (const [el, st] of placed.current) if (el === t || el.contains(t) || t.contains(el)) need = Math.max(need, st);
      if (need > stageOf(panelId)) {
        setStage(panelId, need);
        applyRef.current(need);
      }
    };
    root.addEventListener('step-reveal', onReveal);
    return () => {
      observer.disconnect();
      root.removeEventListener('step-reveal', onReveal);
    };
  }, [panelId]);

  return (
    <div ref={ref} className="step-scope">
      {children}
    </div>
  );
}
