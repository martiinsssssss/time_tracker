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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-6 transition-colors">
      <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg">Jornada de hoy</h2>

      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{formatHM(dayMs)}</span>
          <span className="text-slate-400 dark:text-slate-500 text-sm">objetivo {settings.workdayHours}h</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${dayPct}%` }}
          />
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{formatHM(weekMs)}</span>
          <span className="text-slate-400 dark:text-slate-500 text-sm">semana · objetivo {settings.weeklyTargetHours}h</span>
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
