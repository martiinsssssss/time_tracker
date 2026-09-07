import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, PalmtreeIcon } from 'lucide-react';
import { useHolidays } from '../hooks/useHolidays';
import { useVacations } from '../hooks/useVacations';
import { useSettings } from '../hooks/useSettings';
import { todayKey } from '../lib/time';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface DayCell {
  date: string | null;
  day: number | null;
  isWeekend: boolean;
}

function buildMonth(year: number, month: number): DayCell[] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: DayCell[] = [];
  for (let i = 0; i < startOffset; i++) cells.push({ date: null, day: null, isWeekend: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ date, day: d, isWeekend: dow === 0 || dow === 6 });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, day: null, isWeekend: false });
  return cells;
}

export function Calendar() {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const { holidays } = useHolidays();
  const { vacationDates, toggle } = useVacations();
  const { settings } = useSettings();

  const holidaySet = useMemo(() => new Map(holidays.map((h) => [h.date, h.name])), [holidays]);
  const vacationSet = useMemo(() => new Set(vacationDates), [vacationDates]);
  const today = todayKey();

  const cells = useMemo(() => buildMonth(cursor.year, cursor.month), [cursor]);

  const vacationsThisYear = vacationDates.filter((d) => d.startsWith(String(cursor.year))).length;
  const remaining = settings.vacationDaysTotal - vacationsThisYear;

  function prevMonth() {
    setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }));
  }
  function nextMonth() {
    setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }));
  }
  function goToday() {
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <CalendarDays size={17} strokeWidth={2.25} />
          </span>
          Calendar
        </h2>
        <div className="flex items-center gap-2 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full font-medium">
          <PalmtreeIcon size={15} />
          {remaining} / {settings.vacationDaysTotal} PTO days left ({cursor.year})
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
          <ChevronLeft size={18} />
        </button>
        <button onClick={goToday} className="font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          {MONTH_NAMES[cursor.month]} {cursor.year}
        </button>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 dark:text-slate-500 mb-1">
        {DAY_HEADERS.map((h, i) => (
          <div key={i}>{h}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell.date) return <div key={idx} />;
          const isHoliday = holidaySet.has(cell.date);
          const isVacation = vacationSet.has(cell.date);
          const isToday = cell.date === today;
          return (
            <button
              key={cell.date}
              onClick={() => toggle(cell.date!)}
              title={isHoliday ? holidaySet.get(cell.date) : isVacation ? 'Vacation' : undefined}
              className={[
                'aspect-square rounded-lg text-sm flex items-center justify-center transition-colors',
                isHoliday ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 font-semibold' : '',
                isVacation ? 'bg-indigo-600 text-white font-semibold' : '',
                !isHoliday && !isVacation && cell.isWeekend ? 'text-slate-300 dark:text-slate-600' : '',
                !isHoliday && !isVacation && !cell.isWeekend ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700' : '',
                isToday ? 'ring-2 ring-indigo-400' : '',
              ].join(' ')}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/50 inline-block" /> Holiday
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> Vacation
        </span>
        <span className="text-slate-400 dark:text-slate-500">Click a day to mark/unmark it as vacation</span>
      </div>
    </div>
  );
}
