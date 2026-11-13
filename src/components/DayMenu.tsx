import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useVacations } from '../hooks/useVacations';
import { ABSENCE_LABELS, useAbsences } from '../hooks/useAbsences';
import { useOutOfOffice } from '../hooks/useOutOfOffice';
import { showToast } from '../hooks/useToast';
import { parseHM, skipKey } from '../lib/week';
import type { WeekDay } from '../lib/week';
import type { AbsenceReason } from '../types';

const itemClass =
  'w-full text-left px-3 py-1.5 rounded-md text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors';

/** Per-day quick actions from the week view: absence, vacation, skip class, one-off out of office. */
export function DayMenu({ day, dayName }: { day: WeekDay; dayName: string }) {
  const [open, setOpen] = useState(false);
  const [oooOpen, setOooOpen] = useState(false);
  const [from, setFrom] = useState('15:00');
  const [to, setTo] = useState('18:00');
  const ref = useRef<HTMLDivElement>(null);
  const { toggle: toggleVacation } = useVacations();
  const { toggle: toggleAbsence, byDate } = useAbsences();
  const { addBlock, removeBlock, setSkipped } = useOutOfOffice();

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (day.offReason === 'weekend' || day.offReason === 'holiday' || day.offReason === 'untracked') return null;

  function done(message: string, undo: () => void) {
    setOpen(false);
    setOooOpen(false);
    showToast({ message, action: { label: 'Undo', run: undo } });
  }

  const absence = byDate.get(day.date);
  const skipKeys = day.blocks.map((b) => skipKey(b.block.id, day.date));
  const oooValid = parseHM(to) > parseHM(from);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Options for ${dayName}`}
        className="p-0.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <MoreHorizontal size={16} aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-7 z-20 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg p-1.5">
          {day.offReason === 'vacation' && (
            <button role="menuitem" className={itemClass} onClick={() => (toggleVacation(day.date), done(`Removed vacation on ${dayName}`, () => toggleVacation(day.date)))}>
              Remove vacation
            </button>
          )}
          {day.offReason === 'absence' && absence && (
            <button role="menuitem" className={itemClass} onClick={() => (toggleAbsence(day.date, absence), done(`Removed absence on ${dayName}`, () => toggleAbsence(day.date, absence)))}>
              Remove {ABSENCE_LABELS[absence].toLowerCase()}
            </button>
          )}
          {day.isWorking && (
            <>
              <p className="px-3 pt-1 pb-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Justified absence</p>
              {(Object.keys(ABSENCE_LABELS) as AbsenceReason[]).map((r) => (
                <button
                  key={r}
                  role="menuitem"
                  className={itemClass}
                  onClick={() => (toggleAbsence(day.date, r), done(`${dayName}: ${ABSENCE_LABELS[r].toLowerCase()}`, () => toggleAbsence(day.date, r)))}
                >
                  {ABSENCE_LABELS[r]}
                </button>
              ))}
              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
              <button role="menuitem" className={itemClass} onClick={() => (toggleVacation(day.date), done(`${dayName}: vacation`, () => toggleVacation(day.date)))}>
                Vacation (uses PTO)
              </button>
              {day.blocks.length > 0 && (
                <button
                  role="menuitem"
                  className={itemClass}
                  onClick={() => (setSkipped(skipKeys, !day.skipped), done(day.skipped ? `Class back on ${dayName}` : `Skipping class on ${dayName}`, () => setSkipped(skipKeys, day.skipped)))}
                >
                  {day.skipped ? 'Undo skip class' : 'Skip class'}
                </button>
              )}
              {!oooOpen ? (
                <button role="menuitem" className={itemClass} onClick={() => setOooOpen(true)}>
                  Out of office this day…
                </button>
              ) : (
                <div className="px-3 py-2 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-sm">
                    <input type="time" aria-label="From" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-1.5 py-1" />
                    –
                    <input type="time" aria-label="To" value={to} onChange={(e) => setTo(e.target.value)} className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md px-1.5 py-1" />
                  </div>
                  <button
                    disabled={!oooValid}
                    onClick={() => {
                      const id = addBlock({ kind: 'date', date: day.date, start: from, end: to });
                      done(`Out of office ${from}–${to} on ${dayName}`, () => removeBlock(id));
                    }}
                    className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
