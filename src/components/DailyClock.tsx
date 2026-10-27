import { CircleCheck, Clock3 } from 'lucide-react';
import { useNow } from '../hooks/useNow';
import { useWeekPlan } from '../hooks/useWeekPlan';
import { formatHM, formatShort } from '../lib/time';

export function DailyClock() {
  const now = useNow(1000);
  const plan = useWeekPlan(now);

  const dayMs = plan.today.workedMs;
  const weekMs = plan.workedMs;

  const dayTargetMs = plan.todayTargetMs;
  const weekTargetMs = plan.effectiveTargetMs;

  const dayPct = dayTargetMs > 0 ? Math.min(100, (dayMs / dayTargetMs) * 100) : 0;
  const weekPct = weekTargetMs > 0 ? Math.min(100, (weekMs / weekTargetMs) * 100) : 0;
  const dayComplete = dayTargetMs > 0 && dayMs >= dayTargetMs;
  const weekComplete = weekTargetMs > 0 && weekMs >= weekTargetMs;

  const dayNotes: string[] = [];
  if (plan.today.outOfOfficeMs > 0) dayNotes.push(`${formatHM(plan.today.outOfOfficeMs)} out of office`);
  if (plan.today.makeUpMs > 0) dayNotes.push(`+${formatHM(plan.today.makeUpMs)} to make up`);
  if (plan.today.makeUpMs < 0) dayNotes.push(`−${formatHM(-plan.today.makeUpMs)} since you're ahead`);
  if (plan.today.workedDuringClass) dayNotes.push('worked during class');

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
          <span className="text-slate-500 dark:text-slate-400 text-sm">
            {dayTargetMs > 0 ? `target ${formatShort(dayTargetMs)}` : 'day off'}
          </span>
        </div>
        <div
          className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-label="Today's progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(dayPct)}
          aria-valuetext={`${formatHM(dayMs)} of ${formatShort(dayTargetMs)}`}
        >
          <div
            className={`h-full rounded-full transition-all ${dayComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
            style={{ width: `${dayPct}%` }}
          />
        </div>
        {dayNotes.length > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{dayNotes.join(' · ')}</p>
        )}
        {dayComplete && (
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CircleCheck size={13} strokeWidth={2.5} aria-hidden />
            Daily goal reached
          </p>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xl font-bold text-slate-700 dark:text-slate-200 tabular-nums">{formatHM(weekMs)}</span>
          <span className="text-slate-500 dark:text-slate-400 text-sm">week · target {formatShort(weekTargetMs)}</span>
        </div>
        <div
          className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-label="This week's progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(weekPct)}
          aria-valuetext={`${formatHM(weekMs)} of ${formatShort(weekTargetMs)}`}
        >
          <div
            className={`h-full rounded-full transition-all ${weekComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
            style={{ width: `${weekPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
