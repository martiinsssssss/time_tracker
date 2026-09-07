import { useState } from 'react';
import { TimerCard } from './components/TimerCard';
import { DailyClock } from './components/DailyClock';
import { IntervalsList } from './components/IntervalsList';
import { Calendar } from './components/Calendar';
import { SettingsPage } from './components/Settings';

type Tab = 'hoy' | 'calendario' | 'ajustes';

const TABS: { id: Tab; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'calendario', label: 'Calendario' },
  { id: 'ajustes', label: 'Configuración' },
];

function App() {
  const [tab, setTab] = useState<Tab>('hoy');

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-slate-800">⏱️ Time Tracker</h1>
          <nav className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
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
        {tab === 'calendario' && <Calendar />}
        {tab === 'ajustes' && <SettingsPage />}
      </main>
    </div>
  );
}

export default App;
