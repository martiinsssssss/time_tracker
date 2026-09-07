import { useCallback, useEffect, useState } from 'react';

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
 * localStorage-backed piece of state. Also syncs across tabs/windows
 * via the native 'storage' event.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readValue(key, initial));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable — ignore
    }
  }, [key, value]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === key) {
        setValue(readValue(key, initial));
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback((updater: T | ((prev: T) => T)) => {
    setValue((prev) => (typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater));
  }, []);

  return [value, update] as const;
}
