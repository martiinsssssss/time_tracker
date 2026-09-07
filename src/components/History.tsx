import { useMemo, useState } from 'react';
import { useIntervals } from '../hooks/useIntervals';
import { useSettings } from '../hooks/useSettings';
import { useNow } from '../hooks/useNow';
import { dateKeyOf, formatHM, totalDurationForDay, todayKey } from '../lib/time';
import { MonthlyChart } from './MonthlyChart';
import { IntervalRow } from './IntervalRow';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function History() {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const { intervals, remove, update } = useIntervals();
  const { settings } = useSettings();
  const liveNow = useNow(1000);
  const today = todayKey();
  const [expanded, setExpanded] = useState<string | null>(null);

  function prevMonth() {
    setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }));
  }
  function nextMonth() {
    setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }));
  }

  const daysWithData = useMemo(() => {
    const prefix = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}`;
    const dates = new Set(
      intervals.map((i) => dateKeyOf(i.start)).filter((d) => d.startsWith(prefix))
    );
    return Array.from(dates)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        ms: totalDurationForDay(intervals, date, liveNow),
        intervals: intervals
          .filter((i) => dateKeyOf(i.start) === date)
          .sort((a, b) => a.start.localeCompare(b.start)),
      }));
  }, [intervals, cursor, liveNow]);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg">Historial</h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
              ‹
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-200 min-w-[120px] text-center">
              {MONTH_NAMES[cursor.month]} {cursor.year}
            </span>
            <button onClick={nextMonth} className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">
              ›
            </button>
          </div>
        </div>

        <MonthlyChart
          intervals={intervals}
          year={cursor.year}
          month={cursor.month}
          targetHours={settings.workdayHours}
          now={liveNow}
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
        <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg mb-4">Días registrados</h2>
        {daysWithData.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            No hay ningún día registrado este mes todavía.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {daysWithData.map((d) => {
              const isOpen = expanded === d.date;
              const label = new Date(d.date + 'T00:00:00').toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              });
              return (
                <li key={d.date} className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : d.date)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <span className="text-sm text-slate-600 dark:text-slate-300 capitalize flex items-center gap-2">
                      {label}
                      {d.date === today && (
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded-full">
                          HOY
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 text-sm">
                        {formatHM(d.ms)}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600 text-xs">{isOpen ? '▲' : '▼'}</span>
                    </span>
                  </button>
                  {isOpen && (
                    <ul className="flex flex-col gap-2 px-4 pb-4">
                      {d.intervals.map((i) => (
                        <IntervalRow key={i.id} interval={i} now={liveNow} onUpdate={update} onRemove={remove} />
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
