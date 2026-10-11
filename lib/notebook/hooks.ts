'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { notebooks } from './store';

export const useNotebooks = () => useSyncExternalStore(notebooks.subscribe, notebooks.get, notebooks.get);
export const useNotebook = (id: string) => useNotebooks().find((n) => n.id === id);

export type Loaded<T> = { key?: string; value?: T; error?: unknown };

/**
 * The result of `load`, run again whenever `key` changes. The previous result stays until the new one arrives,
 * so a panel does not flash "Loading" on every edit.
 */
export function useLoaded<T>(load: () => Promise<T>, key: string | null): Loaded<T> {
  const [state, setState] = useState<Loaded<T>>({});
  useEffect(() => {
    if (key === null) return;
    let current = true;
    load().then(
      (value) => current && setState({ key, value }),
      (error) => current && setState({ key, error }),
    );
    return () => {
      current = false;
    };
  }, [key]); // `load` is a fresh closure on every render; `key` says when its result changes

  return state;
}
