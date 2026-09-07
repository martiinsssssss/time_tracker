import { useIntervals } from '../hooks/useIntervals';
import { useNow } from '../hooks/useNow';
import { formatHMS, intervalDuration } from '../lib/time';

export function TimerCard() {
  const { running, toggle } = useIntervals();
  const now = useNow(1000);

  const elapsed = running ? intervalDuration(running, now) : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center gap-4 transition-colors">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg">Cronómetro</h2>
        {running && (
          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full tracking-wide">
            EN MARCHA
          </span>
        )}
      </div>

      <div className="text-6xl font-mono font-extrabold tracking-tighter text-indigo-600 dark:text-indigo-400 py-6">
        {formatHMS(elapsed)}
      </div>

      <button
        onClick={toggle}
        className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow transition-colors ${
          running
            ? 'bg-rose-600 hover:bg-rose-700'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {running ? 'Detener intervalo' : 'Iniciar intervalo'}
      </button>

      <p className="text-slate-400 dark:text-slate-500 text-sm text-center">
        Cada vez que inicias y detienes se guarda como un intervalo de trabajo independiente.
      </p>
    </div>
  );
}
