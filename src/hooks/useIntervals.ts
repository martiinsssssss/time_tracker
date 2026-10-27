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

  /** Stops the running interval; `rawEndIso` records the real stop time when `endIso` was rounded. */
  const stop = useCallback(
    (endIso?: string, rawEndIso?: string) => {
      setIntervals((prev) =>
        prev.map((i) =>
          i.end === null ? { ...i, end: endIso ?? isoNow(), ...(rawEndIso && rawEndIso !== endIso ? { rawEnd: rawEndIso } : {}) } : i
        )
      );
    },
    [setIntervals]
  );

  const toggle = useCallback(
    (stopEndIso?: string, rawEndIso?: string) => {
      if (running) stop(stopEndIso, rawEndIso);
      else start();
    },
    [running, start, stop]
  );

  const remove = useCallback(
    (id: string) => {
      setIntervals((prev) => prev.filter((i) => i.id !== id));
    },
    [setIntervals]
  );

  /** Undoes a Start: drops the running interval. */
  const discardRunning = useCallback(() => {
    setIntervals((prev) => prev.filter((i) => i.end !== null));
  }, [setIntervals]);

  /** Undoes a Stop: re-opens the interval, unless another one is already running. */
  const resume = useCallback(
    (id: string) => {
      setIntervals((prev) =>
        prev.some((i) => i.end === null) ? prev : prev.map((i) => (i.id === id ? { ...i, end: null, rawEnd: undefined } : i))
      );
    },
    [setIntervals]
  );

  /** Puts back an interval that was just deleted (undo), keeping its id. */
  const restore = useCallback(
    (interval: TimeInterval) => {
      setIntervals((prev) => (prev.some((i) => i.id === interval.id) ? prev : [...prev, interval]));
    },
    [setIntervals]
  );

  const addManual = useCallback(
    (startIso: string, endIso: string, label?: string) => {
      setIntervals((prev) => [...prev, { id: uid(), start: startIso, end: endIso, label }]);
    },
    [setIntervals]
  );

  /** Manually correct an interval's start/end/label (e.g. forgot to stop the timer). */
  const update = useCallback(
    (id: string, patch: Partial<Pick<TimeInterval, 'start' | 'end' | 'label' | 'rawEnd'>>) => {
      setIntervals((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...patch } : i))
      );
    },
    [setIntervals]
  );

  return { intervals, running, start, stop, toggle, remove, restore, discardRunning, resume, addManual, update };
}
