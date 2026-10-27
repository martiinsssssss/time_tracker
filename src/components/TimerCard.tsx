import { useEffect, useRef } from 'react';
import { Play, Square, Timer as TimerIcon } from 'lucide-react';
import { useIntervals } from '../hooks/useIntervals';
import { useSettings } from '../hooks/useSettings';
import { useNow } from '../hooks/useNow';
import { useWeekPlan } from '../hooks/useWeekPlan';
import { showToast } from '../hooks/useToast';
import { formatHM, formatHMS, formatShort, intervalDuration, roundedStopTime } from '../lib/time';

/** True when a keypress belongs to a text field rather than to the app. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function TimerCard() {
  const { intervals, running, toggle, update } = useIntervals();
  const { settings } = useSettings();
  const now = useNow(1000);
  const { todayTargetMs } = useWeekPlan(now);

  const elapsed = running ? intervalDuration(running, now) : 0;

  function handleToggle() {
    if (!running) {
      toggle();
      return;
    }
    const stoppedAt = Date.now();
    const endIso = roundedStopTime(
      intervals,
      running,
      todayTargetMs / 3_600_000,
      settings.roundingMarginMinutes,
      stoppedAt
    );
    toggle(endIso);

    const savedMs = new Date(endIso).getTime() - new Date(running.start).getTime();
    const shiftMs = new Date(endIso).getTime() - stoppedAt;
    if (Math.abs(shiftMs) < 1000) {
      showToast({ message: `Saved ${formatHM(savedMs)}` });
      return;
    }
    // Rounding changed what was tracked: say so, and offer the exact stop time back.
    const id = running.id;
    const exactIso = new Date(stoppedAt).toISOString();
    const shift = Math.abs(shiftMs) < 60_000 ? '< 1m' : formatShort(Math.abs(shiftMs));
    showToast(
      {
        message: `Saved ${formatHM(savedMs)} (${shiftMs > 0 ? '+' : '−'}${shift} rounding to land on today's ${formatShort(todayTargetMs)})`,
        action: { label: 'Keep exact', run: () => update(id, { end: exactIso }) },
      },
      10_000
    );
  }

  // `S` starts or stops the timer from anywhere on the page, except while typing.
  const toggleRef = useRef(handleToggle);
  useEffect(() => {
    toggleRef.current = handleToggle;
  });
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== 's' || e.repeat || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      e.preventDefault();
      toggleRef.current();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center gap-4 transition-colors relative overflow-hidden">
      <div
        className={`absolute inset-x-0 top-0 h-1 transition-colors ${
          running ? 'bg-emerald-500' : 'bg-transparent'
        }`}
      />
      <div className="flex items-center justify-between w-full">
        <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <TimerIcon size={17} strokeWidth={2.25} />
          </span>
          Timer
        </h2>
        {running && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
            RUNNING
          </span>
        )}
      </div>

      <div
        className={`text-6xl font-mono font-extrabold tracking-tighter py-6 tabular-nums transition-colors ${
          running ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-600'
        }`}
        aria-label={running ? `Running for ${formatHM(elapsed)}` : 'Timer stopped'}
      >
        {formatHMS(elapsed)}
      </div>

      <button
        onClick={handleToggle}
        aria-keyshortcuts="S"
        className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow flex items-center justify-center gap-2 transition-colors ${
          running
            ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200 dark:shadow-none'
            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'
        }`}
      >
        {running ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        {running ? 'Stop interval' : 'Start interval'}
        <kbd className="ml-1 px-1.5 rounded-md bg-white/15 font-sans text-xs font-semibold leading-5" aria-hidden>
          S
        </kbd>
      </button>

      {settings.roundingMarginMinutes > 0 && todayTargetMs > 0 && (
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
          Stopping within {settings.roundingMarginMinutes}m of today's {formatShort(todayTargetMs)} rounds to it.
        </p>
      )}
    </div>
  );
}
