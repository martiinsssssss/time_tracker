import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { TimeInterval } from '../types';
import { isoNow } from '../lib/time';

const KEY = 'tt.intervals';

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useIntervals() {
  const [intervals, setIntervals] = useLocalStorage<TimeInterval[]>(KEY, []);

  const running = useMemo(() => intervals.find((i) => i.end === null) ?? null, [intervals]);

  const start = useCallback(
    (label?: string) => {
      setIntervals((prev) => {
        if (prev.some((i) => i.end === null)) return prev; // already running
        const next: TimeInterval = { id: uid(), start: isoNow(), end: null, label };
        return [...prev, next];
      });
    },
    [setIntervals]
  );

  const stop = useCallback(() => {
    setIntervals((prev) =>
      prev.map((i) => (i.end === null ? { ...i, end: isoNow() } : i))
    );
  }, [setIntervals]);

  const toggle = useCallback(() => {
    if (running) stop();
    else start();
  }, [running, start, stop]);

  const remove = useCallback(
    (id: string) => {
      setIntervals((prev) => prev.filter((i) => i.id !== id));
    },
    [setIntervals]
  );

  const addManual = useCallback(
    (startIso: string, endIso: string, label?: string) => {
      setIntervals((prev) => [...prev, { id: uid(), start: startIso, end: endIso, label }]);
    },
    [setIntervals]
  );

  return { intervals, running, start, stop, toggle, remove, addManual };
}
