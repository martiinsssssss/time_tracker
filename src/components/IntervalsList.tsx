import { useIntervals } from '../hooks/useIntervals';
import { useNow } from '../hooks/useNow';
import { dateKeyOf, formatHMS, intervalDuration, todayKey } from '../lib/time';

export function IntervalsList() {
  const { intervals, remove } = useIntervals();
  const now = useNow(1000);
  const today = todayKey();

  const todays = intervals
    .filter((i) => dateKeyOf(i.start) === today)
    .sort((a, b) => b.start.localeCompare(a.start));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-slate-800 font-bold text-lg mb-4">Intervalos de hoy</h2>
      {todays.length === 0 ? (
        <p className="text-slate-400 text-sm">Todavía no has registrado ningún intervalo hoy.</p>
      ) : (
        <ul className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {todays.map((i) => {
            const start = new Date(i.start);
            const end = i.end ? new Date(i.end) : null;
            const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <li
                key={i.id}
                className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm"
              >
                <span className="text-slate-600">
                  {fmt(start)} – {end ? fmt(end) : 'en marcha'}
                </span>
                <span className="font-mono font-semibold text-slate-700">
                  {formatHMS(intervalDuration(i, now))}
                </span>
                <button
                  onClick={() => remove(i.id)}
                  className="text-slate-300 hover:text-rose-500 transition-colors ml-3"
                  title="Eliminar intervalo"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
