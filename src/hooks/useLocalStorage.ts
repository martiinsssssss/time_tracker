import { useCallback, useEffect, useState } from 'react';

// Same-tab pub/sub so every component reading the same localStorage key stays
// in sync with the others. The native 'storage' event only fires in *other*
// tabs/windows, never in the tab that made the change — without this, e.g.
// stopping the timer in one component wouldn't update another component's
// separate `useState` copy of the same data until a full page reload.
const listeners = new Map<string, Set<() => void>>();

function notify(key: string) {
  listeners.get(key)?.forEach((fn) => fn());
}

function subscribe(key: string, fn: () => void): () => void {
  if (!listeners.has(key)) listeners.set(key, new Set());
  const set = listeners.get(key)!;
  set.add(fn);
  return () => {
    set.delete(fn);
    if (set.size === 0) listeners.delete(key);
  };
}

function readValue<T>(key: string, initial: T): T {
  if (typeof window === 'undefined') return initial;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return initial;
    return JSON.parse(raw) as T;
  } catch {
    return initial;
  }
}

/**
 * localStorage-backed piece of state, kept in sync across every component
 * that reads the same key — both within this tab and across other tabs.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readValue(key, initial));

  useEffect(() => {
    function sync() {
      setValue(readValue(key, initial));
    }
    const unsubscribe = subscribe(key, sync);
    function onStorage(e: StorageEvent) {
      if (e.key === key) sync();
    }
    window.addEventListener('storage', onStorage);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // storage full or unavailable — ignore
        }
        return next;
      });
      notify(key);
    },
    [key]
  );

  return [value, update] as const;
}
