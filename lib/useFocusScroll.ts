'use client';

import { useEffect } from 'react';
import type { Focus } from './workspace';

/**
 * Scrolls the element for a focus request to the start or the middle of its own panel.
 * `elementId` maps the request's id to a DOM id, or returns null when the request is for another panel.
 * A request younger than three seconds is also honoured when the panel mounts after it,
 * which happens when the click that asked for the panel also created it.
 *
 * It scrolls the panel itself, not the page: Element.scrollIntoView also scrolls every `overflow: hidden`
 * ancestor, which would push the dock's tab strips out of place.
 * The scroll is tried twice, because a tab that was just activated may still be hidden at 80 ms.
 */
export function useFocusScroll(focus: Focus, elementId: (id: string) => string | null, align: 'start' | 'center') {
  const target = focus.id ? elementId(focus.id) : null;
  useEffect(() => {
    if (!target || Date.now() - focus.at > 3000) return;
    const go = () => {
      const el = document.getElementById(target);
      const panel = el?.closest<HTMLElement>('.panel');
      if (!el || !panel || panel.clientHeight === 0) return;
      const offset = el.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop;
      const top = align === 'center' ? offset - (panel.clientHeight - el.offsetHeight) / 2 : offset - 12;
      panel.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };
    const timers = [window.setTimeout(go, 80), window.setTimeout(go, 350)];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [target, focus.nonce, focus.at, align]);
}
