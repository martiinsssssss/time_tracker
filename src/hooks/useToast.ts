import { useEffect, useState } from 'react';

export interface Toast {
  id: number;
  message: string;
  /** Optional one-click recovery, e.g. "Undo". */
  action?: { label: string; run: () => void };
}

// A single app-wide toast slot: a new toast replaces the current one, so the
// latest action's feedback (and its undo) is always the one on screen.
let current: Toast | null = null;
let nextId = 1;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function dismissToast() {
  clearTimeout(timer);
  current = null;
  emit();
}

export function showToast(toast: Omit<Toast, 'id'>, durationMs = 7000) {
  clearTimeout(timer);
  current = { ...toast, id: nextId++ };
  timer = setTimeout(dismissToast, durationMs);
  emit();
}

/** Holds the current toast on screen while it is hovered or focused. */
export function pauseToast() {
  clearTimeout(timer);
}

/** Lets a paused toast leave again, with a short grace period. */
export function resumeToast(graceMs = 4000) {
  clearTimeout(timer);
  if (current) timer = setTimeout(dismissToast, graceMs);
}

export function useToast(): Toast | null {
  const [toast, setToast] = useState(current);
  useEffect(() => {
    const sync = () => setToast(current);
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);
  return toast;
}
