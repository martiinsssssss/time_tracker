import { CalendarRange, PalmtreeIcon, PartyPopper } from 'lucide-react';
import { useNow } from '../hooks/useNow';
import { useWeekPlan } from '../hooks/useWeekPlan';
import { formatHM, formatShort } from '../lib/time';

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeekCard() {
  const now = useNow(1000);
  const plan = useWeekPlan(now);
  const weekdays = plan.days.filter((d) => d.offReason !== 'weekend');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <CalendarRange size={17} strokeWidth={2.25} />
          </span>
          This week
        </h2>
        <div className="text-right">
          <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">
            {formatHM(plan.remainingMs)} <span className="text-base font-semibold text-slate-400 dark:text-slate-500">left</span>
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {formatHM(plan.workedMs)} of {formatShort(plan.targetMs)}
            {plan.daysOff > 0 && ` · ${plan.daysOff} day${plan.daysOff === 1 ? '' : 's'} off`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {weekdays.map((day) => {
          const pct = day.plannedMs > 0 ? Math.min(100, (day.workedMs / day.plannedMs) * 100) : 0;
          const done = day.plannedMs > 0 && day.workedMs >= day.plannedMs;
          const dayOfMonth = Number(day.date.slice(8));
          return (
            <div
              key={day.date}
              className={[
                'rounded-xl border p-3 flex flex-col gap-2 transition-colors',
                day.isToday
                  ? 'border-indigo-300 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                  : 'border-slate-200 dark:border-slate-700',
                day.isPast ? 'opacity-70' : '',
              ].join(' ')}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {WEEKDAY_NAMES[day.weekday]} <span className="text-slate-400 dark:text-slate-500 font-normal">{dayOfMonth}</span>
                </span>
                {day.offReason === 'holiday' && (
                  <span title="Holiday" className="text-amber-500">
                    <PartyPopper size={15} />
                  </span>
                )}
                {day.offReason === 'vacation' && (
                  <span title="Vacation" className="text-indigo-500">
                    <PalmtreeIcon size={15} />
                  </span>
                )}
              </div>

              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <p className="text-xs tabular-nums text-slate-600 dark:text-slate-300">
                {day.isWorking ? (
                  <>
                    {formatShort(day.workedMs)}
                    <span className="text-slate-400 dark:text-slate-500"> / {formatShort(day.plannedMs)}</span>
                  </>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">
                    {day.offReason === 'holiday' ? 'Holiday' : 'Vacation'}
                  </span>
                )}
              </p>

              {(day.outOfOfficeMs > 0 || (!day.isPast && day.makeUpMs > 0)) && (
                <div className="flex flex-wrap gap-x-2 text-[11px] font-medium">
                  {day.outOfOfficeMs > 0 && (
                    <span className="text-sky-600 dark:text-sky-400">{formatShort(day.outOfOfficeMs)} out</span>
                  )}
                  {!day.isPast && day.makeUpMs > 0 && (
                    <span className="text-rose-600 dark:text-rose-400">+{formatShort(day.makeUpMs)} make-up</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
