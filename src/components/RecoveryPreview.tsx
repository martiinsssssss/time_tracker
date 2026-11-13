import { useNow } from '../hooks/useNow';
import { useWeekPlan } from '../hooks/useWeekPlan';
import { formatShort } from '../lib/time';

const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Live result of the make-up settings on this week, so a change shows its effect at once. */
export function RecoveryPreview() {
  const plan = useWeekPlan(useNow(60_000));
  const days = plan.days.filter((d) => d.offReason !== 'weekend');
  return (
    <div className="mb-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 p-3">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">With these settings, this week:</p>
      <ul className="grid grid-cols-5 gap-2 text-center tabular-nums">
        {days.map((d) => (
          <li key={d.date} className={`rounded-lg py-1.5 ${d.isPast ? 'opacity-50' : ''}`}>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">{SHORT[d.weekday]}</span>
            <span className={`block text-sm font-semibold ${d.makeUpMs > 0 && !d.isPast ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}>
              {d.isWorking ? formatShort(d.isPast ? d.workedMs : d.plannedMs) : '—'}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Past days show hours worked; amber days carry make-up.</p>
    </div>
  );
}
