'use client';

import { useLayoutEffect, useRef, type UIEvent } from 'react';

// Dockview unmounts a panel when its tab is hidden or when it is dragged to another group.
// This remembers the scroll position per panel so the panel comes back where the reader left it.
// `ready` is false while the content is still loading: the position is restored once it is there.
const memory = new Map<string, number>();

export function useScrollMemory(key: string, ready = true) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (ready && ref.current) ref.current.scrollTop = memory.get(key) ?? 0;
  }, [key, ready]);
  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    memory.set(key, e.currentTarget.scrollTop);
  };
  return { ref, onScroll };
}
