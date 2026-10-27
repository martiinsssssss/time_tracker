import { CalendarRange, PalmtreeIcon, PartyPopper } from 'lucide-react';
import { useNow } from '../hooks/useNow';
import { useWeekPlan } from '../hooks/useWeekPlan';
import { useOutOfOffice } from '../hooks/useOutOfOffice';
import { formatHM, formatShort, formatSigned } from '../lib/time';
import { skipKey } from '../lib/week';

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function WeekCard() {
  const now = useNow(1000);
  const plan = useWeekPlan(now);
  const { setSkipped } = useOutOfOffice();
  const weekdays = plan.days.filter((d) => d.offReason !== 'weekend');
  const makeUpDays = plan.days.filter((d) => !d.isPast && d.makeUpMs > 0).map((d) => WEEKDAY_NAMES[d.weekday]);
  // Sub-minute differences come from rounding each day to the minute — not worth a message.
  const showAhead = Math.abs(plan.aheadMs) >= 60_000;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <CalendarRange size={17} strokeWidth={2.25} />
          </span>
          This week
        </h2>
        <div className="w-full sm:w-auto sm:text-right">
          <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">
            {formatHM(plan.remainingMs)} <span className="text-base font-semibold text-slate-500 dark:text-slate-400">left</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatHM(plan.workedMs)} of {formatShort(plan.effectiveTargetMs)}
            {plan.daysOff > 0 && ` · ${plan.daysOff} day${plan.daysOff === 1 ? '' : 's'} off`}
          </p>
          {Math.abs(plan.carryInMs) >= 60_000 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              From previous weeks:{' '}
              <span className={`font-semibold ${plan.carryInMs > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatSigned(plan.carryInMs)}
              </span>
            </p>
          )}
          {showAhead && plan.remainingWorkingDays > 0 && (
            <p className={`text-xs font-medium ${plan.aheadMs > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {plan.aheadMs > 0
                ? `You're ${formatHM(plan.aheadMs)} ahead — remaining days lowered`
                : `${formatHM(-plan.aheadMs)} to make up${makeUpDays.length > 0 ? ` — spread over ${makeUpDays.join(', ')}` : ''}`}
            </p>
          )}
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
                  : day.isPast
                    ? 'border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/30'
                    : 'border-slate-200 dark:border-slate-700',
              ].join(' ')}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {WEEKDAY_NAMES[day.weekday]} <span className="text-slate-500 dark:text-slate-400 font-normal">{dayOfMonth}</span>
                </span>
                {day.offReason === 'holiday' && (
                  <span title="Holiday" className="text-amber-500">
                    <PartyPopper size={15} aria-label="Holiday" />
                  </span>
                )}
                {day.offReason === 'vacation' && (
                  <span title="Vacation" className="text-indigo-500">
                    <PalmtreeIcon size={15} aria-label="Vacation" />
                  </span>
                )}
              </div>

              <div
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"
                role="progressbar"
                aria-label={`${WEEKDAY_FULL[day.weekday]} progress`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(pct)}
              >
                <div
                  className={`h-full rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <p className="text-xs tabular-nums text-slate-600 dark:text-slate-300">
                {day.isWorking ? (
                  <>
                    {formatShort(day.workedMs)}
                    <span className="text-slate-500 dark:text-slate-400"> / {formatShort(day.plannedMs)}</span>
                  </>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400">
                    {day.offReason === 'holiday' ? 'Holiday' : 'Vacation'}
                  </span>
                )}
              </p>

              {(day.outOfOfficeMs > 0 || (!day.isPast && day.makeUpMs !== 0)) && (
                <div className="flex flex-wrap gap-x-2 text-[11px] font-medium">
                  {day.outOfOfficeMs > 0 && (
                    <span className="text-sky-600 dark:text-sky-400">{formatShort(day.outOfOfficeMs)} out</span>
                  )}
                  {!day.isPast && day.makeUpMs > 0 && (
                    <span className="text-rose-600 dark:text-rose-400">+{formatShort(day.makeUpMs)} make-up</span>
                  )}
                  {!day.isPast && day.makeUpMs < 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400">−{formatShort(-day.makeUpMs)} ahead</span>
                  )}
                </div>
              )}

              {day.workedDuringClass && (
                <p className="text-[11px] font-medium text-sky-600 dark:text-sky-400">Worked during class</p>
              )}

              {day.blocks.length > 0 && (
                <button
                  onClick={() => setSkipped(day.blocks.map((b) => skipKey(b.block.id, day.date)), !day.skipped)}
                  aria-pressed={day.skipped}
                  aria-label={`${day.skipped ? 'Undo skip' : 'Skip class'} on ${WEEKDAY_FULL[day.weekday]}`}
                  className="self-start text-[11px] font-medium px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/40 transition-colors"
                >
                  {day.skipped ? 'Undo skip' : 'Skip class'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
