import { useState } from 'react';
import { LayoutDashboard, History as HistoryIcon, Settings as SettingsIcon, Clock } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { SettingsPage } from './components/Settings';
import { History } from './components/History';
import { useTheme } from './hooks/useTheme';

type Tab = 'dashboard' | 'history' | 'settings';

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'history', label: 'History', icon: HistoryIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  useTheme(); // applies the persisted theme class to <html> on load and on change

  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200 dark:shadow-none">
                <Clock size={18} strokeWidth={2.5} />
              </span>
              Time Tracker
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 capitalize ml-11 -mt-0.5">{todayLabel}</p>
          </div>
          <nav className="flex gap-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    tab === t.id
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'history' && <History />}
        {tab === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}

export default App;
