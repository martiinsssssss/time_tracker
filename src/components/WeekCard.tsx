import { CalendarRange, ChevronRight, PalmtreeIcon, PartyPopper } from 'lucide-react';
import { useNow } from '../hooks/useNow';
import { useSettings } from '../hooks/useSettings';
import { useWeekPlan } from '../hooks/useWeekPlan';
import { useOutOfOffice } from '../hooks/useOutOfOffice';
import { formatHM, formatShort, formatSigned } from '../lib/time';
import { skipKey } from '../lib/week';

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOUR = 3_600_000;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function WeekCard() {
  const now = useNow(1000);
  const plan = useWeekPlan(now);
  const { setSkipped } = useOutOfOffice();
  const { settings } = useSettings();
  const workdayMs = settings.workdayHours * HOUR;
  const weekdays = plan.days.filter((d) => d.offReason !== 'weekend');
  const makeUpDays = plan.days.filter((d) => !d.isPast && d.makeUpMs > 0).map((d) => WEEKDAY_NAMES[d.weekday]);
  // Sub-minute differences come from rounding each day to the minute — not worth a message.
  const showAhead = Math.abs(plan.aheadMs) >= 60_000;
  const upcomingOutOfOfficeMs = plan.days.filter((d) => !d.isPast && d.isWorking).reduce((sum, d) => sum + d.outOfOfficeMs, 0);
  const neededFromTodayMs = Math.max(0, plan.effectiveTargetMs - plan.workedBeforeTodayMs);

  // "Explain the math": every step from the weekly target to today's make-up or head start.
  const steps: { label: string; value: string; total?: boolean; tone?: string }[] = [
    { label: 'Weekly target', value: formatHM(settings.weeklyTargetHours * HOUR) },
  ];
  if (plan.daysOff > 0) steps.push({ label: `Holidays and vacation (${plural(plan.daysOff, 'day')})`, value: `−${formatHM(plan.daysOff * workdayMs)}` });
  if (plan.untrackedDays > 0)
    steps.push({ label: `Before you started tracking (${plural(plan.untrackedDays, 'day')})`, value: `−${formatHM(plan.untrackedDays * workdayMs)}` });
  if (Math.abs(plan.carryInMs) >= 60_000)
    steps.push({ label: plan.carryInMs > 0 ? 'Ahead from previous weeks' : 'Owed from previous weeks', value: formatSigned(-plan.carryInMs) });
  steps.push({ label: "This week's target", value: formatHM(plan.effectiveTargetMs), total: true });
  if (plan.workedBeforeTodayMs > 0) steps.push({ label: 'Worked before today', value: `−${formatHM(plan.workedBeforeTodayMs)}` });
  steps.push({ label: 'Still needed, today to Friday', value: formatHM(neededFromTodayMs), total: true });
  steps.push({
    label:
      upcomingOutOfOfficeMs > 0
        ? `Usual hours left (${plural(plan.remainingWorkingDays, 'day')} × ${formatShort(workdayMs)}, minus ${formatShort(upcomingOutOfOfficeMs)} out of office)`
        : `Usual hours left (${plural(plan.remainingWorkingDays, 'day')} × ${formatShort(workdayMs)})`,
    value: `−${formatHM(plan.upcomingBaseMs)}`,
  });
  if (showAhead)
    steps.push(
      plan.aheadMs < 0
        ? { label: makeUpDays.length > 0 ? `To make up, spread over ${makeUpDays.join(', ')}` : 'To make up', value: formatHM(-plan.aheadMs), total: true, tone: 'text-amber-700 dark:text-amber-400' }
        : { label: 'Ahead, taken off the remaining days', value: formatHM(plan.aheadMs), total: true, tone: 'text-emerald-700 dark:text-emerald-400' }
    );

  return (
    <section
      aria-labelledby="week-heading"
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors"
    >
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <h2 id="week-heading" className="text-slate-800 dark:text-slate-100 font-bold text-lg flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <CalendarRange size={17} strokeWidth={2.25} aria-hidden />
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
              <span className={`font-semibold ${plan.carryInMs > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatSigned(plan.carryInMs)}
              </span>
            </p>
          )}
          {showAhead && plan.remainingWorkingDays > 0 && (
            <p className={`text-xs font-medium ${plan.aheadMs > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
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
                  <span title="Vacation" className="text-slate-500 dark:text-slate-400">
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
                aria-valuetext={day.isWorking ? `${formatShort(day.workedMs)} of ${formatShort(day.plannedMs)}` : undefined}
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
                    {day.offReason === 'holiday' ? 'Holiday' : day.offReason === 'vacation' ? 'Vacation' : 'Not tracked yet'}
                  </span>
                )}
              </p>

              {(day.outOfOfficeMs > 0 || (!day.isPast && day.makeUpMs !== 0)) && (
                <div className="flex flex-wrap gap-x-2 text-[11px] font-medium">
                  {day.outOfOfficeMs > 0 && (
                    <span className="text-sky-700 dark:text-sky-400">{formatShort(day.outOfOfficeMs)} out</span>
                  )}
                  {!day.isPast && day.makeUpMs > 0 && (
                    <span className="text-amber-700 dark:text-amber-400">+{formatShort(day.makeUpMs)} make-up</span>
                  )}
                  {!day.isPast && day.makeUpMs < 0 && (
                    <span className="text-emerald-700 dark:text-emerald-400">{formatShort(-day.makeUpMs)} less</span>
                  )}
                </div>
              )}

              {day.workedDuringClass && (
                <p className="text-[11px] font-medium text-sky-700 dark:text-sky-400">Worked during class</p>
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

      <details className="group mt-4 text-sm">
        <summary className="inline-flex items-center gap-1 cursor-pointer select-none rounded-md font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors list-none [&::-webkit-details-marker]:hidden">
          <ChevronRight size={15} aria-hidden className="transition-transform group-open:rotate-90" />
          How is this calculated?
        </summary>
        <dl className="mt-3 max-w-xl flex flex-col tabular-nums">
          {steps.map((step) => (
            <div
              key={step.label}
              className={`flex items-baseline justify-between gap-4 py-1.5 ${
                step.total ? 'border-t border-slate-200 dark:border-slate-700 font-semibold' : ''
              } ${step.tone ?? (step.total ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300')}`}
            >
              <dt>{step.label}</dt>
              <dd className="shrink-0">{step.value}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}
