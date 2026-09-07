import { useState } from 'react';
import { TimerCard } from './components/TimerCard';
import { DailyClock } from './components/DailyClock';
import { IntervalsList } from './components/IntervalsList';
import { Calendar } from './components/Calendar';
import { SettingsPage } from './components/Settings';
import { History } from './components/History';
import { useTheme } from './hooks/useTheme';

type Tab = 'hoy' | 'historial' | 'calendario' | 'ajustes';

const TABS: { id: Tab; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'historial', label: 'Historial' },
  { id: 'calendario', label: 'Calendario' },
  { id: 'ajustes', label: 'Configuración' },
];

function App() {
  const [tab, setTab] = useState<Tab>('hoy');
  useTheme(); // applies the persisted theme class to <html> on load and on change

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">⏱️ Time Tracker</h1>
          <nav className="flex gap-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === 'hoy' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TimerCard />
            <DailyClock />
            <div className="md:col-span-2">
              <IntervalsList />
            </div>
          </div>
        )}
        {tab === 'historial' && <History />}
        {tab === 'calendario' && <Calendar />}
        {tab === 'ajustes' && <SettingsPage />}
      </main>
    </div>
  );
}

export default App;
