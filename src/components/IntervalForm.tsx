import { useId, useState } from 'react';
import type { TimeInterval } from '../types';
import { formatHM, fromDatetimeLocal, intervalDuration, toDatetimeLocal } from '../lib/time';

interface Props {
  /** Starting values; `end: null` means the interval is still running (no end field). */
  initial: Pick<TimeInterval, 'start' | 'end' | 'label'>;
  /** The other logged intervals, checked for overlaps. */
  others: TimeInterval[];
  now: number;
  saveLabel: string;
  onSave: (patch: { start: string; end: string | null; label?: string }) => void;
  onCancel: () => void;
}

const fmtTime = (ms: number) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/** Returns what's wrong with the draft, or null when it can be saved. */
function validate(startMs: number, endMs: number | null, others: TimeInterval[], now: number): string | null {
  if (Number.isNaN(startMs)) return 'Enter a start time.';
  if (endMs !== null && Number.isNaN(endMs)) return 'Enter an end time.';
  if (startMs > now) return "Start can't be in the future.";
  if (endMs !== null && endMs <= startMs) return 'End must be after start.';
  // An end slightly in the future is legitimate: rounding up to the day's target produces one.
  const until = endMs ?? now;
  const clash = others.find((o) => {
    const oStart = new Date(o.start).getTime();
    return oStart < until && oStart + intervalDuration(o, now) > startMs;
  });
  if (clash) {
    const cStart = new Date(clash.start).getTime();
    const cEnd = clash.end ? fmtTime(new Date(clash.end).getTime()) : 'now';
    return `Overlaps ${fmtTime(cStart)}–${cEnd}, which is already logged.`;
  }
  return null;
}

export function IntervalForm({ initial, others, now, saveLabel, onSave, onCancel }: Props) {
  const isRunning = initial.end === null;
  const [draftStart, setDraftStart] = useState(() => toDatetimeLocal(initial.start));
  const [draftEnd, setDraftEnd] = useState(() => (initial.end ? toDatetimeLocal(initial.end) : ''));
  const [draftLabel, setDraftLabel] = useState(initial.label ?? '');
  const errorId = useId();
  // Same-day intervals (the common case) edit as plain times; the date only shows when it matters.
  const [showDate, setShowDate] = useState(() => !!draftEnd && draftEnd.slice(0, 10) !== draftStart.slice(0, 10));

  const setTime = (value: string, time: string) => (time ? `${value.slice(0, 10)}T${time}` : '');
  function nudgeEnd(minutes: number) {
    if (!draftEnd) return;
    setDraftEnd(toDatetimeLocal(new Date(new Date(draftEnd).getTime() + minutes * 60_000).toISOString()));
  }

  const startMs = draftStart ? new Date(draftStart).getTime() : NaN;
  const endMs = isRunning ? null : draftEnd ? new Date(draftEnd).getTime() : NaN;
  const error = validate(startMs, endMs, others, now);

  function save() {
    if (error) return;
    onSave({
      start: fromDatetimeLocal(draftStart),
      end: isRunning ? null : fromDatetimeLocal(draftEnd),
      label: draftLabel.trim() || undefined,
    });
  }

  const fieldClass =
    'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-md px-2.5 py-1.5 text-sm tabular-nums';
  const nudgeClass =
    'px-2 py-1.5 rounded-md text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors';

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          Start
          <input
            type={showDate ? 'datetime-local' : 'time'}
            value={showDate ? draftStart : draftStart.slice(11)}
            onChange={(e) => {
              const next = showDate ? e.target.value : setTime(draftStart, e.target.value);
              setDraftStart(next);
              // Without a visible date the end stays on the start's day.
              if (!showDate && draftEnd) setDraftEnd(`${next.slice(0, 10)}T${draftEnd.slice(11)}`);
            }}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={fieldClass}
            autoFocus
          />
        </label>
        {!isRunning && (
          <label className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            End
            <input
              type={showDate ? 'datetime-local' : 'time'}
              value={showDate ? draftEnd : draftEnd.slice(11)}
              onChange={(e) => setDraftEnd(showDate ? e.target.value : setTime(draftStart, e.target.value))}
              aria-invalid={!!error}
              aria-describedby={errorId}
              className={fieldClass}
            />
          </label>
        )}
        {!isRunning && (
          <span className="flex items-center">
            <button type="button" onClick={() => nudgeEnd(-5)} aria-label="End 5 minutes earlier" className={nudgeClass}>
              −5m
            </button>
            <button type="button" onClick={() => nudgeEnd(5)} aria-label="End 5 minutes later" className={nudgeClass}>
              +5m
            </button>
          </span>
        )}
        {!isRunning && endMs !== null && endMs > startMs && (
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums" aria-live="polite">
            = {formatHM(endMs - startMs)}
          </span>
        )}
        {!showDate && (
          <button type="button" onClick={() => setShowDate(true)} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            Change date
          </button>
        )}
      </div>
      <input
        type="text"
        value={draftLabel}
        onChange={(e) => setDraftLabel(e.target.value)}
        placeholder="Note / project (optional)"
        aria-label="Note"
        className={`${fieldClass} w-full`}
      />
      <div className="flex items-center justify-end gap-2">
        {/* Polite and always mounted: the message is read once it settles, not on every keystroke. */}
        <p id={errorId} aria-live="polite" className="flex-1 text-sm font-medium text-rose-700 dark:text-rose-300">
          {error}
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 rounded-md text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!!error}
          className="px-3 py-1 rounded-md text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 disabled:cursor-not-allowed transition-colors"
        >
          {saveLabel}
        </button>
      </div>
    </form>
  );
}
