import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { TimeInterval } from '../types';
import { formatHM, formatHMS, intervalDuration } from '../lib/time';
import { showToast } from '../hooks/useToast';
import { IntervalForm } from './IntervalForm';

interface Props {
  interval: TimeInterval;
  /** Every logged interval, used to catch overlaps while editing. */
  all: TimeInterval[];
  now: number;
  onUpdate: (id: string, patch: Partial<Pick<TimeInterval, 'start' | 'end' | 'label'>>) => void;
  onRemove: (id: string) => void;
  onRestore: (interval: TimeInterval) => void;
}

const fmt = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export function IntervalRow({ interval, all, now, onUpdate, onRemove, onRestore }: Props) {
  const [editing, setEditing] = useState(false);

  const isRunning = interval.end === null;
  const range = `${fmt(interval.start)}–${interval.end ? fmt(interval.end) : 'now'}`;

  function handleRemove() {
    onRemove(interval.id);
    showToast({
      message: `Deleted ${range} (${formatHM(intervalDuration(interval, now))})`,
      action: { label: 'Undo', run: () => onRestore(interval) },
    });
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
            onUpdate(interval.id, end === null ? { start, label } : { start, end, label });
            setEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2 text-sm">
      <span className="text-slate-600 dark:text-slate-300 flex-1 min-w-0 flex items-center gap-2 tabular-nums">
        {isRunning && <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-emerald-500 motion-safe:animate-pulse" aria-hidden />}
        <span className="shrink-0">
          {fmt(interval.start)} –{' '}
          {isRunning ? <span className="font-semibold text-emerald-600 dark:text-emerald-400">running</span> : fmt(interval.end!)}
        </span>
        {interval.label && <span className="text-slate-500 dark:text-slate-400 truncate">· {interval.label}</span>}
      </span>
      <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 shrink-0 tabular-nums">
        {formatHMS(intervalDuration(interval, now))}
      </span>
      <span className="flex items-center gap-1 shrink-0 -mr-1">
        <button
          onClick={() => setEditing(true)}
          className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          aria-label={`Edit interval ${range}`}
          title="Edit interval"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={handleRemove}
          className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          aria-label={`Delete interval ${range}`}
          title="Delete interval"
        >
          <Trash2 size={14} />
        </button>
      </span>
    </li>
  );
}
