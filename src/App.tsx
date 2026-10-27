import { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, History as HistoryIcon, Settings as SettingsIcon, Clock } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { SettingsPage } from './components/Settings';
import { History } from './components/History';
import { Toaster } from './components/Toaster';
import { useTheme } from './hooks/useTheme';
import { useIntervals } from './hooks/useIntervals';
import { useNow } from './hooks/useNow';
import { useWeekPlan } from './hooks/useWeekPlan';
import { formatHM, formatShort } from './lib/time';

type Tab = 'dashboard' | 'history' | 'settings';

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'history', label: 'History', icon: HistoryIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

/** Keeps the browser tab readable at a glance: ▶ while running, then today's total against its target. */
function TabTitle() {
  const now = useNow(1000);
  const { running } = useIntervals();
  const { today, todayTargetMs } = useWeekPlan(now);
  const progress = todayTargetMs > 0 ? `${formatHM(today.workedMs)} / ${formatShort(todayTargetMs)}` : `${formatHM(today.workedMs)} today`;
  const title = `${running ? '▶ ' : ''}${progress} · Time Tracker`;
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}

/** The header date, re-rendered each minute so it rolls over at midnight in a tab left open. */
function HeaderDate() {
  const label = new Date(useNow(60_000)).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  return <p className="text-xs text-slate-500 dark:text-slate-400 ml-11 -mt-0.5">{label}</p>;
}

function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const mainRef = useRef<HTMLElement>(null);
  useTheme(); // applies the persisted theme class to <html> on load and on change

  function openTab(next: Tab) {
    setTab(next);
    // Move keyboard and screen-reader users to the new view instead of leaving them on the nav.
    requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }));
  }

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
            <HeaderDate />
          </div>
          <nav aria-label="Main" className="flex gap-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => openTab(t.id)}
                  aria-current={tab === t.id ? 'page' : undefined}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    tab === t.id
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-200 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon size={15} aria-hidden />
                  <span className="sr-only sm:not-sr-only">{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main ref={mainRef} tabIndex={-1} aria-label={TABS.find((t) => t.id === tab)!.label} className="max-w-5xl mx-auto px-4 py-6 outline-none">
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
