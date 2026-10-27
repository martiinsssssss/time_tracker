import { useEffect, useRef, useState } from 'react';
import { Pencil, Trash2, Undo2 } from 'lucide-react';
import type { TimeInterval } from '../types';
import { formatHM, formatHMS, formatShort, intervalDuration } from '../lib/time';
import { showToast } from '../hooks/useToast';
import { IntervalForm } from './IntervalForm';

interface Props {
  interval: TimeInterval;
  /** Every logged interval, used to catch overlaps while editing. */
  all: TimeInterval[];
  now: number;
  onUpdate: (id: string, patch: Partial<Pick<TimeInterval, 'start' | 'end' | 'label' | 'rawEnd'>>) => void;
  onRemove: (id: string) => void;
  onRestore: (interval: TimeInterval) => void;
}

const fmt = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export function IntervalRow({ interval, all, now, onUpdate, onRemove, onRestore }: Props) {
  const [editing, setEditing] = useState(false);
  const rowRef = useRef<HTMLLIElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);

  // Closing the editor hands focus back to the Edit button it came from.
  useEffect(() => {
    if (wasEditing.current && !editing) editButtonRef.current?.focus();
    wasEditing.current = editing;
  }, [editing]);

  const isRunning = interval.end === null;
  const range = `${fmt(interval.start)}–${interval.end ? fmt(interval.end) : 'now'}`;
  const roundedMs = interval.end && interval.rawEnd ? new Date(interval.end).getTime() - new Date(interval.rawEnd).getTime() : 0;

  function handleRemove() {
    // Keep keyboard users in the list: focus the neighbouring row's first action, or the Add button.
    const row = rowRef.current;
    const neighbour = (row?.nextElementSibling ?? row?.previousElementSibling)?.querySelector<HTMLElement>('button');
    onRemove(interval.id);
    showToast({
      message: `Deleted ${range} (${formatHM(intervalDuration(interval, now))})`,
      action: { label: 'Undo', run: () => onRestore(interval) },
    });
    requestAnimationFrame(() => (neighbour ?? document.getElementById('add-interval'))?.focus());
  }

  if (editing) {
    return (
      <li className="bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2 text-sm">
        <IntervalForm
          initial={interval}
          others={all.filter((i) => i.id !== interval.id)}
          now={now}
          saveLabel="Save"
          onCancel={() => setEditing(false)}
          onSave={({ start, end, label }) => {
            // A hand-edited end replaces the rounded one, so the rounding note no longer applies.
            const endChanged = end !== null && end !== interval.end;
            onUpdate(interval.id, end === null ? { start, label } : { start, end, label, ...(endChanged ? { rawEnd: undefined } : {}) });
            setEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li ref={rowRef} className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-1.5 text-sm">
      <span className="text-slate-600 dark:text-slate-300 flex-1 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1 tabular-nums">
        {isRunning && <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-indigo-500 motion-safe:animate-pulse" aria-hidden />}
        <span className="shrink-0">
          {fmt(interval.start)} –{' '}
          {isRunning ? <span className="font-semibold text-indigo-600 dark:text-indigo-400">running</span> : fmt(interval.end!)}
        </span>
        {interval.label && <span className="text-slate-500 dark:text-slate-400 truncate">· {interval.label}</span>}
        {Math.abs(roundedMs) >= 1000 && (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-400/10 text-amber-800 dark:text-amber-300 text-[11px] font-medium pl-1.5 pr-0.5">
            rounded {roundedMs > 0 ? '+' : '−'}
            {Math.abs(roundedMs) < 60_000 ? '<1m' : formatShort(Math.abs(roundedMs))}
            <button
              onClick={() => onUpdate(interval.id, { end: interval.rawEnd, rawEnd: undefined })}
              aria-label={`Undo rounding, end at ${fmt(interval.rawEnd!)}`}
              title={`Undo rounding (end at ${fmt(interval.rawEnd!)})`}
              className="p-0.5 rounded hover:bg-amber-100 dark:hover:bg-amber-400/20 transition-colors"
            >
              <Undo2 size={12} aria-hidden />
            </button>
          </span>
        )}
      </span>
      <span className="font-semibold text-slate-700 dark:text-slate-200 shrink-0 tabular-nums">
        {isRunning ? <span className="font-mono">{formatHMS(intervalDuration(interval, now))}</span> : formatHM(intervalDuration(interval, now))}
      </span>
      <span className="flex items-center shrink-0 -mr-1.5">
        <button
          ref={editButtonRef}
          onClick={() => setEditing(true)}
          className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          aria-label={`Edit interval ${range}`}
          title="Edit interval"
        >
          <Pencil size={14} aria-hidden />
        </button>
        <button
          onClick={handleRemove}
          className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          aria-label={`Delete interval ${range}`}
          title="Delete interval"
        >
          <Trash2 size={14} aria-hidden />
        </button>
      </span>
    </li>
  );
}
