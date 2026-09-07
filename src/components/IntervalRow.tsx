import { useState } from 'react';
import type { TimeInterval } from '../types';
import { formatHMS, fromDatetimeLocal, intervalDuration, toDatetimeLocal } from '../lib/time';

interface Props {
  interval: TimeInterval;
  now: number;
  onUpdate: (id: string, patch: Partial<Pick<TimeInterval, 'start' | 'end' | 'label'>>) => void;
  onRemove: (id: string) => void;
}

export function IntervalRow({ interval, now, onUpdate, onRemove }: Props) {
  const [editing, setEditing] = useState(false);
  const [draftStart, setDraftStart] = useState(() => toDatetimeLocal(interval.start));
  const [draftEnd, setDraftEnd] = useState(() => (interval.end ? toDatetimeLocal(interval.end) : ''));
  const [draftLabel, setDraftLabel] = useState(interval.label ?? '');

  const isRunning = interval.end === null;

  function startEdit() {
    setDraftStart(toDatetimeLocal(interval.start));
    setDraftEnd(interval.end ? toDatetimeLocal(interval.end) : '');
    setDraftLabel(interval.label ?? '');
    setEditing(true);
  }

  function save() {
    const patch: Partial<Pick<TimeInterval, 'start' | 'end' | 'label'>> = {
      start: fromDatetimeLocal(draftStart),
      label: draftLabel.trim() || undefined,
    };
    if (!isRunning && draftEnd) {
      patch.end = fromDatetimeLocal(draftEnd);
    }
    onUpdate(interval.id, patch);
    setEditing(false);
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (editing) {
    return (
      <li className="bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2 text-sm flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            Inicio
            <input
              type="datetime-local"
              value={draftStart}
              onChange={(e) => setDraftStart(e.target.value)}
              className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md px-2 py-1 text-xs"
            />
          </label>
          {!isRunning && (
            <label className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              Fin
              <input
                type="datetime-local"
                value={draftEnd}
                onChange={(e) => setDraftEnd(e.target.value)}
                className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md px-2 py-1 text-xs"
              />
            </label>
          )}
        </div>
        <input
          type="text"
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
          placeholder="Nota / proyecto (opcional)"
          className="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md px-2 py-1 text-xs w-full"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-1 rounded-md text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            className="px-3 py-1 rounded-md text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Guardar
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2 text-sm">
      <span className="text-slate-600 dark:text-slate-300 flex-1 min-w-0">
        {fmt(interval.start)} – {interval.end ? fmt(interval.end) : 'en marcha'}
        {interval.label && (
          <span className="ml-2 text-slate-400 dark:text-slate-500 truncate">· {interval.label}</span>
        )}
      </span>
      <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 shrink-0">
        {formatHMS(intervalDuration(interval, now))}
      </span>
      <span className="flex items-center gap-2 shrink-0">
        <button
          onClick={startEdit}
          className="text-slate-300 dark:text-slate-500 hover:text-indigo-500 transition-colors"
          title="Editar intervalo"
        >
          ✎
        </button>
        <button
          onClick={() => onRemove(interval.id)}
          className="text-slate-300 dark:text-slate-500 hover:text-rose-500 transition-colors"
          title="Eliminar intervalo"
        >
          ✕
        </button>
      </span>
    </li>
  );
}
