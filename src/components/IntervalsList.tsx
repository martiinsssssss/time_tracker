import { useState } from 'react';
import { ListChecks, Plus } from 'lucide-react';
import { useIntervals } from '../hooks/useIntervals';
import { useNow } from '../hooks/useNow';
import { showToast } from '../hooks/useToast';
import { dateKeyOf, formatHM, intervalDuration, todayKey } from '../lib/time';
import { IntervalForm } from './IntervalForm';
import { IntervalRow } from './IntervalRow';

const HOUR = 3_600_000;

export function IntervalsList() {
  const { intervals, remove, restore, update, addManual } = useIntervals();
  const now = useNow(1000);
  const today = todayKey(new Date(now));
  const [adding, setAdding] = useState(false);

  const todays = intervals
    .filter((i) => dateKeyOf(i.start) === today)
    .sort((a, b) => b.start.localeCompare(a.start));
  const totalMs = todays.reduce((sum, i) => sum + intervalDuration(i, now), 0);

  // A forgotten stretch most often just ended: default to the last hour, minute-aligned.
  const draftEnd = Math.floor(now / 60_000) * 60_000;
  const draft = { start: new Date(draftEnd - HOUR).toISOString(), end: new Date(draftEnd).toISOString() };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <ListChecks size={17} strokeWidth={2.25} />
          </span>
          Today's intervals
          {todays.length > 0 && (
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 tabular-nums">· {formatHM(totalMs)}</span>
          )}
        </h2>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} />
            Add interval
          </button>
        )}
      </div>

      {adding && (
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2 text-sm mb-2">
          <IntervalForm
            initial={draft}
            others={intervals}
            now={now}
            saveLabel="Add"
            onCancel={() => setAdding(false)}
            onSave={({ start, end, label }) => {
              addManual(start, end!, label);
              setAdding(false);
              showToast({ message: `Added ${formatHM(new Date(end!).getTime() - new Date(start).getTime())}` });
            }}
          />
        </div>
      )}

      {todays.length === 0 ? (
        !adding && (
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Nothing logged yet today. Start the timer when you begin, or add a stretch you forgot to track.
          </p>
        )
      ) : (
        <ul className="flex flex-col gap-2">
          {todays.map((i) => (
            <IntervalRow key={i.id} interval={i} all={intervals} now={now} onUpdate={update} onRemove={remove} onRestore={restore} />
          ))}
        </ul>
      )}
    </div>
  );
}
