import { useCallback, useEffect, useState } from 'react';

// Same-tab pub/sub *and* a live cache of each key's current value, so every
// component reading the same localStorage key stays in sync with the others.
//
// Why a cache and not just React state: `update()` needs to compute the next
// value from the *current* one (`prev => next`). If it relied on this
// component's own `useState` value as `prev`, that state is only updated
// once React actually re-renders — which is asynchronous relative to the
// code that calls `update()`. Calling `notify()` right after `setState(fn)`
// (as an earlier version of this hook did) would fire *before* React had
// run the updater and written to localStorage, so other subscribers — and
// even this same component's own self-subscription — would re-read stale
// data and clobber the fresh update. That's what made the timer button and
// interval edits need a second click/save to actually stick. Keeping a
// synchronous, always-current cache alongside localStorage avoids the race:
// every `update()` computes off the cache, writes, and only then notifies.
const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, unknown>();

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

function readFromStorage<T>(key: string, initial: T): T {
  if (typeof window === 'undefined') return initial;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return initial;
    return JSON.parse(raw) as T;
  } catch {
    return initial;
  }
}

function getCurrent<T>(key: string, initial: T): T {
  if (!cache.has(key)) {
    cache.set(key, readFromStorage(key, initial));
  }
  return cache.get(key) as T;
}

/**
 * localStorage-backed piece of state, kept in sync across every component
 * that reads the same key — both within this tab and across other tabs.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => getCurrent(key, initial));

  useEffect(() => {
    function sync() {
      setValue(getCurrent(key, initial));
    }
    const unsubscribe = subscribe(key, sync);
    function onStorage(e: StorageEvent) {
      if (e.key === key) {
        cache.delete(key); // another tab/window wrote it — drop our cache and re-read
        sync();
      }
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
      const prev = getCurrent(key, initial);
      const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
      cache.set(key, next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // storage full or unavailable — ignore
      }
      setValue(next);
      notify(key);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return [value, update] as const;
}
