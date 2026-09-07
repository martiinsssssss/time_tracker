import { ListChecks } from 'lucide-react';
import { useIntervals } from '../hooks/useIntervals';
import { useNow } from '../hooks/useNow';
import { dateKeyOf, todayKey } from '../lib/time';
import { IntervalRow } from './IntervalRow';

export function IntervalsList() {
  const { intervals, remove, update } = useIntervals();
  const now = useNow(1000);
  const today = todayKey();

  const todays = intervals
    .filter((i) => dateKeyOf(i.start) === today)
    .sort((a, b) => b.start.localeCompare(a.start));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
      <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg mb-4 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
          <ListChecks size={17} strokeWidth={2.25} />
        </span>
        Today's intervals
      </h2>
      {todays.length === 0 ? (
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          No intervals logged yet today. Hit "Start interval" whenever you begin working.
        </p>
      ) : (
        <ul className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {todays.map((i) => (
            <IntervalRow key={i.id} interval={i} now={now} onUpdate={update} onRemove={remove} />
          ))}
        </ul>
      )}
    </div>
  );
}
