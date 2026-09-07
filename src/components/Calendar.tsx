import { useMemo, useState } from 'react';
import { useHolidays } from '../hooks/useHolidays';
import { useVacations } from '../hooks/useVacations';
import { useSettings } from '../hooks/useSettings';
import { todayKey } from '../lib/time';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DAY_HEADERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-slate-800 font-bold text-lg">Calendario</h2>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500">
            Vacaciones restantes {cursor.year}:{' '}
            <span className="font-bold text-slate-800">{remaining}</span> / {settings.vacationDaysTotal}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="px-2 py-1 rounded hover:bg-slate-100 text-slate-500">
          ‹
        </button>
        <span className="font-semibold text-slate-700">
          {MONTH_NAMES[cursor.month]} {cursor.year}
        </span>
        <button onClick={nextMonth} className="px-2 py-1 rounded hover:bg-slate-100 text-slate-500">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-1">
        {DAY_HEADERS.map((h) => (
          <div key={h}>{h}</div>
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
              title={isHoliday ? holidaySet.get(cell.date) : isVacation ? 'Vacaciones' : undefined}
              className={[
                'aspect-square rounded-lg text-sm flex items-center justify-center transition-colors',
                isHoliday ? 'bg-amber-100 text-amber-700 font-semibold' : '',
                isVacation ? 'bg-indigo-600 text-white font-semibold' : '',
                !isHoliday && !isVacation && cell.isWeekend ? 'text-slate-300' : '',
                !isHoliday && !isVacation && !cell.isWeekend ? 'text-slate-600 hover:bg-slate-100' : '',
                isToday ? 'ring-2 ring-indigo-400' : '',
              ].join(' ')}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-100 inline-block" /> Festivo
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> Vacaciones
        </span>
        <span className="text-slate-400">Haz clic en un día para marcar/desmarcar vacaciones</span>
      </div>
    </div>
  );
}
