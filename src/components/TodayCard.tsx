import { useEffect, useRef } from 'react';
import { CircleCheck, Play, Square, Timer as TimerIcon } from 'lucide-react';
import { useIntervals } from '../hooks/useIntervals';
import { useSettings } from '../hooks/useSettings';
import { useNow } from '../hooks/useNow';
import { useWeekPlan } from '../hooks/useWeekPlan';
import { showToast } from '../hooks/useToast';
import { dateKeyOf, formatHM, formatHMS, formatShort, intervalDuration, roundedStopTime, todayKey } from '../lib/time';

/** True when a keypress belongs to a text field rather than to the app. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/**
 * The glance surface: today's total (or the running interval), what's left
 * today, and the one action — start or stop.
 */
export function TodayCard() {
  const { intervals, running, toggle, update } = useIntervals();
  const { settings } = useSettings();
  const now = useNow(1000);
  const plan = useWeekPlan(now);

  const workedMs = plan.today.workedMs;
  const targetMs = plan.todayTargetMs;
  const leftMs = Math.max(0, targetMs - workedMs);
  const pct = targetMs > 0 ? Math.min(100, (workedMs / targetMs) * 100) : 0;
  const complete = targetMs > 0 && workedMs >= targetMs;
  const elapsed = running ? intervalDuration(running, now) : 0;

  const today = todayKey(new Date(now));
  const lastStop = intervals
    .filter((i) => i.end && dateKeyOf(i.start) === today)
    .reduce<string | null>((latest, i) => (!latest || i.end! > latest ? i.end : latest), null);

  const notes: { text: string; tone: string }[] = [];
  if (plan.today.outOfOfficeMs > 0)
    notes.push({ text: `${formatShort(plan.today.outOfOfficeMs)} out of office`, tone: 'text-sky-700 dark:text-sky-400' });
  if (plan.today.workedDuringClass) notes.push({ text: 'worked during class', tone: 'text-sky-700 dark:text-sky-400' });
  if (plan.today.makeUpMs > 0)
    notes.push({ text: `includes ${formatShort(plan.today.makeUpMs)} make-up`, tone: 'text-amber-700 dark:text-amber-400' });
  if (plan.today.makeUpMs < 0)
    notes.push({ text: `${formatShort(-plan.today.makeUpMs)} less since you're ahead`, tone: 'text-emerald-700 dark:text-emerald-400' });

  function handleToggle() {
    if (!running) {
      toggle();
      return;
    }
    const stoppedAt = Date.now();
    const exactIso = new Date(stoppedAt).toISOString();
    const endIso = roundedStopTime(intervals, running, targetMs / 3_600_000, settings.roundingMarginMinutes, stoppedAt);
    toggle(endIso, exactIso);

    const savedMs = new Date(endIso).getTime() - new Date(running.start).getTime();
    const shiftMs = new Date(endIso).getTime() - stoppedAt;
    if (Math.abs(shiftMs) < 1000) {
      showToast({ message: `Saved ${formatHM(savedMs)}` });
      return;
    }
    // Rounding changed what was tracked: say so, and offer the exact stop time back.
    const id = running.id;
    const shift = Math.abs(shiftMs) < 60_000 ? '< 1m' : formatShort(Math.abs(shiftMs));
    showToast(
      {
        message: `Saved ${formatHM(savedMs)}, rounded ${shiftMs > 0 ? '+' : '−'}${shift} to hit ${formatShort(targetMs)} today`,
        action: { label: 'Keep exact', run: () => update(id, { end: exactIso, rawEnd: undefined }) },
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
    <section
      aria-labelledby="today-heading"
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors relative overflow-hidden"
    >
      <div className={`absolute inset-x-0 top-0 h-1 transition-colors ${running ? 'bg-indigo-500' : 'bg-transparent'}`} />

      <div className="flex items-center justify-between mb-5">
        <h2 id="today-heading" className="text-slate-800 dark:text-slate-100 font-bold text-lg flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <TimerIcon size={17} strokeWidth={2.25} aria-hidden />
          </span>
          Today
        </h2>
        {running && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 motion-safe:animate-pulse" />
            RUNNING
          </span>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_17rem] md:items-end">
        <div className="min-w-0">
          {running ? (
            <>
              <p
                role="timer"
                aria-label={`Current interval: ${formatHM(elapsed)}`}
                className="font-mono text-5xl sm:text-6xl font-extrabold tracking-tighter tabular-nums leading-none text-indigo-600 dark:text-indigo-400"
              >
                {formatHMS(elapsed)}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 tabular-nums">
                this interval · <span className="font-semibold text-slate-700 dark:text-slate-200">{formatHM(workedMs)}</span> today
              </p>
            </>
          ) : (
            <>
              <p className="text-5xl sm:text-6xl font-extrabold tracking-tight tabular-nums leading-none text-slate-800 dark:text-slate-100">
                {formatHM(workedMs)}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 tabular-nums">
                worked today{lastStop && ` · last stopped ${fmtTime(lastStop)}`}
              </p>
            </>
          )}

          <div className="mt-5">
            <div className="flex items-baseline justify-between gap-3 mb-1.5 text-sm tabular-nums">
              {targetMs <= 0 ? (
                <span className="font-semibold text-slate-700 dark:text-slate-200">Day off</span>
              ) : complete ? (
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CircleCheck size={15} strokeWidth={2.5} aria-hidden />
                  Daily goal reached
                </span>
              ) : (
                <span className="font-semibold text-slate-700 dark:text-slate-200">{formatHM(leftMs)} left today</span>
              )}
              {targetMs > 0 && <span className="text-slate-500 dark:text-slate-400">target {formatShort(targetMs)}</span>}
            </div>
            <div
              className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"
              role="progressbar"
              aria-label="Today's progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pct)}
              aria-valuetext={`${formatHM(workedMs)} of ${formatShort(targetMs)}`}
            >
              <div
                className={`h-full rounded-full transition-all ${complete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {notes.length > 0 && (
              <p className="text-xs font-medium mt-1.5">
                {notes.map((n, i) => (
                  <span key={n.text} className={n.tone}>
                    {i > 0 && <span className="text-slate-400 dark:text-slate-500"> · </span>}
                    {n.text}
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleToggle}
            aria-keyshortcuts="S"
            className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow flex items-center justify-center gap-2 transition-colors ${
              running
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200 dark:shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'
            }`}
          >
            {running ? <Square size={20} fill="currentColor" aria-hidden /> : <Play size={20} fill="currentColor" aria-hidden />}
            {running ? 'Stop interval' : 'Start interval'}
            <kbd className="ml-1 px-1.5 rounded-md bg-white/15 font-sans text-xs font-semibold leading-5" aria-hidden>
              S
            </kbd>
          </button>
          {settings.roundingMarginMinutes > 0 && targetMs > 0 && (
            <p className="text-slate-500 dark:text-slate-400 text-xs text-center text-pretty">
              Stops within {settings.roundingMarginMinutes}m of {formatShort(targetMs)} round to it.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
