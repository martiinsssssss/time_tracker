import { Play, Square, Timer as TimerIcon } from 'lucide-react';
import { useIntervals } from '../hooks/useIntervals';
import { useNow } from '../hooks/useNow';
import { formatHMS, intervalDuration } from '../lib/time';

export function TimerCard() {
  const { running, toggle } = useIntervals();
  const now = useNow(1000);

  const elapsed = running ? intervalDuration(running, now) : 0;

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
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            RUNNING
          </span>
        )}
      </div>

      <div className="text-6xl font-mono font-extrabold tracking-tighter text-indigo-600 dark:text-indigo-400 py-6 tabular-nums">
        {formatHMS(elapsed)}
      </div>

      <button
        onClick={toggle}
        className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow flex items-center justify-center gap-2 transition-colors ${
          running
            ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200 dark:shadow-none'
            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'
        }`}
      >
        {running ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        {running ? 'Stop interval' : 'Start interval'}
      </button>

      <p className="text-slate-400 dark:text-slate-500 text-sm text-center">
        Every start/stop is saved as its own work interval, so you can track your day in pieces.
      </p>
    </div>
  );
}
