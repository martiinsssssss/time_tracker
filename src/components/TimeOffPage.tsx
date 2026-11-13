import { HeartPulse, PalmtreeIcon, X } from 'lucide-react';
import { useVacations } from '../hooks/useVacations';
import { ABSENCE_LABELS, useAbsences } from '../hooks/useAbsences';
import { useSettings } from '../hooks/useSettings';
import { useNow } from '../hooks/useNow';
import { showToast } from '../hooks/useToast';
import { todayKey } from '../lib/time';
import { formatDay, openPools, vacationPools } from '../lib/vacation';
import type { AbsenceReason } from '../types';
import { Calendar } from './Calendar';
import { OutOfOfficeEditor } from './OutOfOfficeEditor';
import { HolidaysEditor } from './HolidaysEditor';

interface Run {
  from: string;
  to: string;
  dates: string[];
  kind: 'vacation' | AbsenceReason;
}

/** Groups sorted dates of the same kind into runs, joining across weekends. */
function toRuns(items: { date: string; kind: Run['kind'] }[]): Run[] {
  const runs: Run[] = [];
  for (const item of items) {
    const last = runs[runs.length - 1];
    const gapDays = last ? (new Date(item.date).getTime() - new Date(last.to).getTime()) / 86_400_000 : Infinity;
    if (last && last.kind === item.kind && gapDays <= 3) {
      last.to = item.date;
      last.dates.push(item.date);
    } else runs.push({ from: item.date, to: item.date, dates: [item.date], kind: item.kind });
  }
  return runs;
}

/** Everything about days you don't work: PTO balance, the calendar, upcoming time off, classes and holidays. */
export function TimeOffPage() {
  const today = todayKey(new Date(useNow(60_000)));
  const { settings } = useSettings();
  const { vacationDates, setMany: setVacationMany } = useVacations();
  const { absences, setMany: setAbsenceMany } = useAbsences();

  const pools = openPools(vacationPools(vacationDates, settings), today);
  const upcoming = toRuns(
    [
      ...vacationDates.map((date) => ({ date, kind: 'vacation' as const })),
      ...absences.map((a) => ({ date: a.date, kind: a.reason })),
    ]
      .filter((i) => i.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
  );

  function clearRun(run: Run) {
    if (run.kind === 'vacation') setVacationMany(run.dates, false);
    else setAbsenceMany(run.dates, null);
    const kind = run.kind;
    showToast({
      message: `Cleared ${run.dates.length} day${run.dates.length === 1 ? '' : 's'}`,
      action: { label: 'Undo', run: () => (kind === 'vacation' ? setVacationMany(run.dates, true) : setAbsenceMany(run.dates, kind)) },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {pools.map((p) => (
          <div key={p.year} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <PalmtreeIcon size={15} aria-hidden /> PTO {p.year}
            </p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums text-slate-800 dark:text-slate-100">
              {p.remaining}
              <span className="text-base font-semibold text-slate-500 dark:text-slate-400"> / {p.total} left</span>
            </p>
            <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden" aria-hidden>
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.total > 0 ? Math.min(100, (p.used / p.total) * 100) : 0}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {p.used} used · usable {formatDay(p.start)} – {formatDay(p.end)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <Calendar page />
        <section aria-labelledby="upcoming-heading" className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 id="upcoming-heading" className="font-bold text-slate-800 dark:text-slate-100 mb-3">Upcoming time off</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Nothing planned. Mark days on the calendar.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {upcoming.map((run) => (
                <li key={`${run.kind}-${run.from}`} className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-700/40 px-3 py-2 text-sm">
                  {run.kind === 'vacation' ? (
                    <PalmtreeIcon size={15} aria-hidden className="shrink-0 text-slate-500" />
                  ) : (
                    <HeartPulse size={15} aria-hidden className="shrink-0 text-rose-500" />
                  )}
                  <span className="flex-1 min-w-0">
                    <span className="block text-slate-700 dark:text-slate-200 font-medium">
                      {run.from === run.to ? formatDay(run.from) : `${formatDay(run.from)} – ${formatDay(run.to)}`}
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {run.kind === 'vacation' ? 'Vacation' : ABSENCE_LABELS[run.kind]} · {run.dates.length} day{run.dates.length === 1 ? '' : 's'}
                    </span>
                  </span>
                  <button onClick={() => clearRun(run)} aria-label="Clear these days" className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400">
                    <X size={15} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <OutOfOfficeEditor />
      <HolidaysEditor />
    </div>
  );
}
