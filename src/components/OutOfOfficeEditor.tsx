import { useState } from 'react';
import { CalendarClock, X } from 'lucide-react';
import { useOutOfOffice } from '../hooks/useOutOfOffice';
import { showToast } from '../hooks/useToast';
import { blockLostMinutes, parseHM } from '../lib/week';
import { formatHM } from '../lib/time';
import type { OutOfOfficeBlock } from '../types';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0];

function describeBlock(b: OutOfOfficeBlock): string {
  const when = b.kind === 'weekly' ? `Every ${WEEKDAY_NAMES[b.weekday ?? 0]}` : b.date;
  const pause = b.breakStart && b.breakEnd ? ` (break ${b.breakStart}–${b.breakEnd})` : '';
  return `${when} · ${b.start}–${b.end}${pause}`;
}

/** Add and remove out-of-office blocks (classes and other hours you can't work). */
export function OutOfOfficeEditor() {
  const { blocks, addBlock, removeBlock, restoreBlock } = useOutOfOffice();
  const [oooKind, setOooKind] = useState<OutOfOfficeBlock['kind']>('weekly');
  const [oooWeekday, setOooWeekday] = useState(2);
  const [oooDate, setOooDate] = useState('');
  const [oooStart, setOooStart] = useState('13:00');
  const [oooEnd, setOooEnd] = useState('18:00');
  const [oooHasBreak, setOooHasBreak] = useState(true);
  const [oooBreakStart, setOooBreakStart] = useState('14:00');
  const [oooBreakEnd, setOooBreakEnd] = useState('15:00');
  const [oooLabel, setOooLabel] = useState('');

  const oooDraft = {
    start: oooStart,
    end: oooEnd,
    breakStart: oooHasBreak ? oooBreakStart : undefined,
    breakEnd: oooHasBreak ? oooBreakEnd : undefined,
  };
  const oooLostMinutes = blockLostMinutes(oooDraft);
  const oooValid =
    parseHM(oooEnd) > parseHM(oooStart) &&
    (!oooHasBreak || parseHM(oooBreakEnd) > parseHM(oooBreakStart)) &&
    (oooKind === 'weekly' || /^\d{4}-\d{2}-\d{2}$/.test(oooDate));

  function handleAddOutOfOffice() {
    if (!oooValid) return;
    addBlock({
      kind: oooKind,
      ...(oooKind === 'weekly' ? { weekday: oooWeekday } : { date: oooDate }),
      ...oooDraft,
      label: oooLabel.trim() || undefined,
    });
    setOooLabel('');
  }

  function handleRemove(b: OutOfOfficeBlock) {
    removeBlock(b.id);
    showToast({ message: `Removed ${describeBlock(b)}`, action: { label: 'Undo', run: () => restoreBlock(b) } });
  }

  const inputClass =
    'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2';

  return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
        <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg mb-1 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <CalendarClock size={17} strokeWidth={2.25} />
          </span>
          Out of office
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xl">
          Hours you can't work (e.g. classes). They lower that day's target and are spread as
          make-up time over the other days of the same week — your weekly target stays the same.
        </p>

        <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 w-fit mb-4">
          {(['weekly', 'date'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setOooKind(k)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                oooKind === k
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {k === 'weekly' ? 'Every week' : 'Specific date'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {oooKind === 'weekly' ? (
            <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
              Day
              <select
                value={oooWeekday}
                onChange={(e) => setOooWeekday(Number(e.target.value))}
                className={inputClass}
              >
                {MONDAY_FIRST.map((d) => (
                  <option key={d} value={d}>
                    {WEEKDAY_NAMES[d]}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
              Date
              <input type="date" value={oooDate} onChange={(e) => setOooDate(e.target.value)} className={inputClass} />
            </label>
          )}
          <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
            From
            <input type="time" value={oooStart} onChange={(e) => setOooStart(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
            To
            <input type="time" value={oooEnd} onChange={(e) => setOooEnd(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300 flex-1 min-w-[160px]">
            Label (optional)
            <input
              type="text"
              value={oooLabel}
              onChange={(e) => setOooLabel(e.target.value)}
              placeholder="e.g. Classes"
              className={inputClass}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-end gap-3 mt-3">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 h-10">
            <input
              type="checkbox"
              checked={oooHasBreak}
              onChange={(e) => setOooHasBreak(e.target.checked)}
              className="w-4 h-4 accent-sky-600"
            />
            Includes a break
          </label>
          {oooHasBreak && (
            <>
              <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                Break from
                <input type="time" value={oooBreakStart} onChange={(e) => setOooBreakStart(e.target.value)} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                Break to
                <input type="time" value={oooBreakEnd} onChange={(e) => setOooBreakEnd(e.target.value)} className={inputClass} />
              </label>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Work hours lost:{' '}
            <span className="font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
              {oooValid ? formatHM(oooLostMinutes * 60_000) : '—'}
            </span>
          </p>
          <button
            onClick={handleAddOutOfOffice}
            disabled={!oooValid}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>

        <ul className="flex flex-col gap-1 mt-4 max-h-64 overflow-y-auto">
          {blocks.length === 0 && (
            <li className="text-slate-500 dark:text-slate-400 text-sm">No out-of-office time configured yet.</li>
          )}
          {blocks.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2 text-sm"
            >
              <span className="text-slate-600 dark:text-slate-300">
                {describeBlock(b)}
                {b.label && <span className="text-slate-500 dark:text-slate-400"> — {b.label}</span>}
                <span className="text-sky-600 dark:text-sky-400 font-medium"> · {formatHM(blockLostMinutes(b) * 60_000)} lost</span>
              </span>
              <button
                onClick={() => handleRemove(b)}
                aria-label={`Remove out-of-office block: ${describeBlock(b)}`}
                className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                <X size={15} />
              </button>
            </li>
          ))}
        </ul>
      </div>

  );
}
