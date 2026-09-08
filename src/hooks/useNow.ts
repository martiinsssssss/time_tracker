import { useEffect, useState } from 'react';

/**
 * Re-renders the consumer every `intervalMs`, returning the current timestamp.
 *
 * Also re-syncs immediately when the tab regains focus/visibility. Browsers
 * throttle timers in background tabs, so if the app is left open overnight
 * the regular tick can stall — without this, the day rollover (and anything
 * derived from "today", like the calendar highlight or PTO counts) would
 * stay stale until something else happened to re-render, e.g. a manual
 * page reload.
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    function sync() {
      setNow(Date.now());
    }
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', sync);
    };
  }, [intervalMs]);
  return now;
}
