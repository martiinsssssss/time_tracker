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
      <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg mb-4">Intervalos de hoy</h2>
      {todays.length === 0 ? (
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          Todavía no has registrado ningún intervalo hoy.
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
