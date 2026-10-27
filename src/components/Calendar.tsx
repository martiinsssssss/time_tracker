import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, PalmtreeIcon } from 'lucide-react';
import { useHolidays } from '../hooks/useHolidays';
import { useVacations } from '../hooks/useVacations';
import { useSettings } from '../hooks/useSettings';
import { useOutOfOffice } from '../hooks/useOutOfOffice';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNow } from '../hooks/useNow';
import { showToast } from '../hooks/useToast';
import { formatShort, todayKey } from '../lib/time';
import { blockLostMinutes, blocksForDate, parseDateKey, skipKey } from '../lib/week';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const ARROW_STEPS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

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
  // Ticks each minute so today's mark follows a midnight rollover like the rest of the page.
  const now = new Date(useNow(60_000));
  const today = todayKey(now);
  const [open, setOpen] = useLocalStorage<boolean>('tt.ui.calendarOpen', false);
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  // Roving focus: one day is tabbable, arrow keys move it.
  const [focusDate, setFocusDate] = useState(today);
  const moveFocus = useRef(false);
  const cellRefs = useRef(new Map<string, HTMLButtonElement>());
  const { holidays } = useHolidays();
  const { vacationDates, toggle } = useVacations();
  const { settings } = useSettings();
  const { blocks, skips } = useOutOfOffice();
  const skipSet = useMemo(() => new Set(skips), [skips]);

  const holidaySet = useMemo(() => new Map(holidays.map((h) => [h.date, h.name])), [holidays]);
  const vacationSet = useMemo(() => new Set(vacationDates), [vacationDates]);

  const cells = useMemo(() => buildMonth(cursor.year, cursor.month), [cursor]);
  const monthPrefix = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}`;
  const tabbableDate = focusDate.startsWith(monthPrefix) ? focusDate : `${monthPrefix}-01`;

  const vacationsThisYear = vacationDates.filter((d) => d.startsWith(String(cursor.year))).length;
  const remaining = settings.vacationDaysTotal - vacationsThisYear;

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    cellRefs.current.get(focusDate)?.focus();
  }, [focusDate, cursor]);

  function prevMonth() {
    setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }));
  }
  function nextMonth() {
    setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }));
  }
  function goToday() {
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
    setFocusDate(today);
  }

  function onGridKey(e: KeyboardEvent, date: string) {
    const step = ARROW_STEPS[e.key];
    if (!step) return;
    e.preventDefault();
    const next = parseDateKey(date);
    next.setDate(next.getDate() + step);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
    moveFocus.current = true;
    setFocusDate(todayKey(next));
  }

  return (
    <section
      aria-labelledby="calendar-heading"
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 id="calendar-heading" className="text-slate-800 dark:text-slate-100 font-bold text-lg">
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="calendar-body"
            className="flex items-center gap-2 rounded-lg -m-1 p-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <CalendarDays size={17} strokeWidth={2.25} aria-hidden />
            </span>
            Calendar
            <ChevronDown size={18} aria-hidden className={`text-slate-400 dark:text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </h2>
        <div className="flex items-center gap-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-full font-medium tabular-nums">
          <PalmtreeIcon size={15} aria-hidden />
          {remaining} / {settings.vacationDaysTotal} PTO days left ({cursor.year})
        </div>
      </div>

      {open && (
        <div id="calendar-body" className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} aria-label="Previous month" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
              <ChevronLeft size={18} aria-hidden />
            </button>
            <button onClick={goToday} title="Back to this month" className="px-2 py-1 rounded-lg font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {MONTH_NAMES[cursor.month]} {cursor.year}
            </button>
            <button onClick={nextMonth} aria-label="Next month" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 dark:text-slate-400 mb-1" aria-hidden>
            {DAY_HEADERS.map((h, i) => (
              <div key={i}>{h}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1" role="group" aria-label={`${MONTH_NAMES[cursor.month]} ${cursor.year}`}>
            {cells.map((cell, idx) => {
              if (!cell.date) return <div key={idx} />;
              const date = cell.date;
              const isHoliday = holidaySet.has(date);
              const isVacation = vacationSet.has(date);
              const isToday = date === today;
              const outOfOffice = !cell.isWeekend && !isHoliday && !isVacation ? blocksForDate(blocks, date) : [];
              const isSkipped = (id: string) => skipSet.has(skipKey(id, date));
              const allSkipped = outOfOffice.length > 0 && outOfOffice.every((b) => isSkipped(b.id));
              const outOfOfficeTitle = outOfOffice
                .map(
                  (b) =>
                    `Out of office ${b.start}–${b.end}${b.label ? ` (${b.label})` : ''} · ` +
                    (isSkipped(b.id) ? 'Class skipped' : `${formatShort(blockLostMinutes(b) * 60_000)} lost`)
                )
                .join('\n');
              // Only working days can become vacation; an existing mark can always be removed.
              const canToggle = isVacation || (!cell.isWeekend && !isHoliday);
              const dayName = new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
              const state = isHoliday
                ? `holiday: ${holidaySet.get(date)}`
                : isVacation
                  ? 'vacation'
                  : outOfOffice.length > 0
                    ? outOfOfficeTitle.replace(/\n/g, '; ')
                    : null;
              const plain = !isHoliday && !isVacation;
              return (
                <button
                  key={date}
                  ref={(el) => {
                    if (el) cellRefs.current.set(date, el);
                    else cellRefs.current.delete(date);
                  }}
                  tabIndex={date === tabbableDate ? 0 : -1}
                  onKeyDown={(e) => onGridKey(e, date)}
                  onFocus={() => setFocusDate(date)}
                  onClick={() => {
                    if (!canToggle) return;
                    toggle(date);
                    showToast({
                      message: `${isVacation ? 'Removed vacation on' : 'Marked as vacation:'} ${dayName}`,
                      action: { label: 'Undo', run: () => toggle(date) },
                    });
                  }}
                  aria-disabled={!canToggle || undefined}
                  aria-pressed={canToggle ? isVacation : undefined}
                  aria-current={isToday ? 'date' : undefined}
                  aria-label={`${isToday ? 'Today, ' : ''}${dayName}${state ? `, ${state}` : ''}`}
                  title={isHoliday ? holidaySet.get(date) : isVacation ? 'Vacation' : outOfOfficeTitle || undefined}
                  className={[
                    'relative h-10 sm:h-11 rounded-lg text-sm flex items-center justify-center transition-colors tabular-nums',
                    canToggle ? '' : 'cursor-default',
                    isHoliday ? 'bg-amber-100 dark:bg-amber-400/20 text-amber-800 dark:text-amber-200 font-semibold' : '',
                    isVacation ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500' : '',
                    plain && isToday ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-bold' : '',
                    plain && !isToday && cell.isWeekend ? 'bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400' : '',
                    plain && !isToday && !cell.isWeekend ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700' : '',
                    !plain && isToday ? 'underline decoration-2 underline-offset-4' : '',
                  ].join(' ')}
                >
                  {cell.day}
                  {outOfOffice.length > 0 && (
                    <span
                      aria-hidden
                      className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                        allSkipped ? 'border border-sky-500' : 'bg-sky-500'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-800 dark:bg-slate-100 inline-block" /> Today
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-400/20 inline-block" /> Holiday
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-600 inline-block" /> Vacation
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" /> Out of office
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full border border-sky-500 inline-block" /> Class skipped
            </span>
            <span className="basis-full">Click a working day to mark or unmark it as vacation. Arrow keys move between days.</span>
          </div>
        </div>
      )}
    </section>
  );
}
