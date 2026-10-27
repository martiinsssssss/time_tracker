import { useEffect, useState } from 'react';
import { LayoutDashboard, History as HistoryIcon, Settings as SettingsIcon, Clock } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { SettingsPage } from './components/Settings';
import { History } from './components/History';
import { Toaster } from './components/Toaster';
import { useTheme } from './hooks/useTheme';
import { useIntervals } from './hooks/useIntervals';
import { useNow } from './hooks/useNow';
import { useWeekPlan } from './hooks/useWeekPlan';
import { formatHM } from './lib/time';

type Tab = 'dashboard' | 'history' | 'settings';

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'history', label: 'History', icon: HistoryIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

/** Keeps the browser tab readable at a glance: ▶ and today's total while the timer runs. */
function TabTitle() {
  const now = useNow(1000);
  const { running } = useIntervals();
  const { today } = useWeekPlan(now);
  const title = `${running ? '▶ ' : ''}${formatHM(today.workedMs)} today · Time Tracker`;
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}

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
              <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200 dark:shadow-none">
                <Clock size={18} strokeWidth={2.5} aria-hidden />
              </span>
              Time Tracker
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 ml-11 -mt-0.5">{todayLabel}</p>
          </div>
          <nav aria-label="Main" className="flex gap-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id ? 'page' : undefined}
                  aria-label={t.label}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    tab === t.id
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon size={15} aria-hidden />
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
      <TabTitle />
      <Toaster />
    </div>
  );
}

export default App;
