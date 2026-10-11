/** A tiny value store for useSyncExternalStore: get, subscribe, set. */
export function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    set: (v: T) => {
      value = v;
      listeners.forEach((l) => l());
    },
  };
}
