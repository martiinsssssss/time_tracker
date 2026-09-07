import { Clock3 } from 'lucide-react';
import { useIntervals } from '../hooks/useIntervals';
import { useNow } from '../hooks/useNow';
import { useSettings } from '../hooks/useSettings';
import { formatHM, totalDurationForDay, totalDurationForWeek, todayKey } from '../lib/time';

export function DailyClock() {
  const { intervals } = useIntervals();
  const { settings } = useSettings();
  const now = useNow(1000);

  const today = todayKey();
  const dayMs = totalDurationForDay(intervals, today, now);
  const weekMs = totalDurationForWeek(intervals, new Date(now), now);

  const dayTargetMs = settings.workdayHours * 3600_000;
  const weekTargetMs = settings.weeklyTargetHours * 3600_000;

  const dayPct = dayTargetMs > 0 ? Math.min(100, (dayMs / dayTargetMs) * 100) : 0;
  const weekPct = weekTargetMs > 0 ? Math.min(100, (weekMs / weekTargetMs) * 100) : 0;
  const dayComplete = dayTargetMs > 0 && dayMs >= dayTargetMs;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-6 transition-colors">
      <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <Clock3 size={17} strokeWidth={2.25} />
        </span>
        Today's workday
      </h2>

      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">
            {formatHM(dayMs)}
          </span>
          <span className="text-slate-400 dark:text-slate-500 text-sm">target {settings.workdayHours}h</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${dayComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
            style={{ width: `${dayPct}%` }}
          />
        </div>
        {dayComplete && (
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            Daily goal reached 🎉
          </p>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xl font-bold text-slate-700 dark:text-slate-200 tabular-nums">{formatHM(weekMs)}</span>
          <span className="text-slate-400 dark:text-slate-500 text-sm">week · target {settings.weeklyTargetHours}h</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${weekPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
