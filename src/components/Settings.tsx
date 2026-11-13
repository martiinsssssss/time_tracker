import { useState } from 'react';
import { Briefcase, Download, Moon, Palette, PalmtreeIcon, Repeat, Scale, Sun } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useHolidays } from '../hooks/useHolidays';
import { useIntervals } from '../hooks/useIntervals';
import { useTheme } from '../hooks/useTheme';
import { useOutOfOffice } from '../hooks/useOutOfOffice';
import { useWeekPlan } from '../hooks/useWeekPlan';
import { useNow } from '../hooks/useNow';
import { formatSigned, weekStartKey } from '../lib/time';
import { Section } from './Section';
import { RecoveryPreview } from './RecoveryPreview';
import { VacationExpiryInput } from './VacationExpiryInput';
import { markExported } from '../lib/backup';

export function SettingsPage() {
  const { settings, update } = useSettings();
  const { holidays } = useHolidays();
  const { intervals } = useIntervals();
  const { theme, toggle: toggleTheme } = useTheme();
  const { blocks, skips } = useOutOfOffice();
  const { carryInMs } = useWeekPlan(useNow(60_000));

  // The sign is kept locally too, so picking "−" sticks while the amount is still 0.
  const [signChoice, setSignChoice] = useState(settings.balanceInitialMinutes < 0 ? -1 : 1);
  const balanceSign = settings.balanceInitialMinutes === 0 ? signChoice : Math.sign(settings.balanceInitialMinutes);
  const balanceAbs = Math.abs(settings.balanceInitialMinutes);
  function setInitialBalance(sign: number, hours: number, minutes: number) {
    const total = Math.max(0, Math.floor(hours || 0)) * 60 + Math.max(0, Math.floor(minutes || 0));
    setSignChoice(sign);
    update({ balanceInitialMinutes: total === 0 ? 0 : sign * total });
  }

  function exportData() {
    const data = {
      intervals,
      settings,
      holidays,
      vacationDates: JSON.parse(localStorage.getItem('tt.vacationDates') ?? '[]'),
      absences: JSON.parse(localStorage.getItem('tt.absences') ?? '[]'),
      outOfOffice: blocks,
      outOfOfficeSkips: skips,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    markExported();
  }

  const inputClass =
    'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2';

  return (
    <div className="flex flex-col gap-4">
      <Section id="appearance" icon={Palette} title="Appearance" tone="slate">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? <Moon size={16} className="text-slate-400" /> : <Sun size={16} className="text-amber-400" />}
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Dark mode</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Switch the theme for the whole app</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            role="switch"
            aria-checked={theme === 'dark'}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                theme === 'dark' ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
      </Section>

      <Section id="workday" icon={Briefcase} title="Workday" tone="indigo" summary={`${settings.workdayHours}h/day · ${settings.weeklyTargetHours}h/week`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
            Target hours per day
            <input
              type="number"
              min={0.5}
              max={24}
              step={0.5}
              value={settings.workdayHours}
              onChange={(e) => update({ workdayHours: Number(e.target.value) })}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
            Target hours per week
            <input
              type="number"
              min={0}
              max={168}
              step={1}
              value={settings.weeklyTargetHours}
              onChange={(e) => update({ weeklyTargetHours: Number(e.target.value) })}
              className={inputClass}
            />
          </label>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300 max-w-xs">
            Rounding margin (minutes)
            <input
              type="number"
              min={0}
              max={60}
              step={1}
              value={settings.roundingMarginMinutes}
              onChange={(e) => update({ roundingMarginMinutes: Math.max(0, Number(e.target.value)) })}
              className={inputClass}
            />
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md">
            When you stop the timer, if your total for the day lands within this many minutes of
            that day's target (normally {settings.workdayHours}h, adjusted for out-of-office time
            and make-up hours), it rounds to exactly the target instead
            of the raw time — e.g. with a 15-minute margin, 7h 47m rounds up to 8h and 8h 10m
            rounds down to 8h. Set to 0 to turn this off.
          </p>
        </div>
      </Section>

      <Section id="recovery" icon={Repeat} title="Making up hours" tone="amber" summary={`${settings.keepFridayNormal ? 'Friday normal' : 'All days'} · max ${settings.maxDailyHours > 0 ? `${settings.maxDailyHours}h` : 'none'}`}>
        <RecoveryPreview />
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <label className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200 max-w-md">
            <input
              type="checkbox"
              checked={settings.keepFridayNormal}
              onChange={(e) => update({ keepFridayNormal: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-indigo-600"
            />
            <span>
              <span className="font-medium">Keep Friday at normal hours</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">
                Hours to make up go to the days before Friday. Friday only takes make-up hours
                when it's the last working day left. Off = spread over every remaining day.
              </span>
            </span>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300 max-w-xs mt-4">
            Max hours per day with make-up
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={settings.maxDailyHours}
              onChange={(e) => update({ maxDailyHours: Math.max(0, Number(e.target.value)) })}
              className={inputClass}
            />
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md">
            Make-up hours fill days up to this limit; what doesn't fit moves to days with
            out-of-office time, then Friday. Only if every day is full does a day go past it.
            Set to 0 for no limit.
          </p>
        </div>
      </Section>

      <Section id="vacation" icon={PalmtreeIcon} title="Vacation days" tone="slate" summary={`${settings.vacationDaysTotal} per year`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
            Vacation days per year
            <input
              type="number"
              min={0}
              max={365}
              step={1}
              value={settings.vacationDaysTotal}
              onChange={(e) => update({ vacationDaysTotal: Number(e.target.value) })}
              className={inputClass}
            />
          </label>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Leftover vacation days</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 max-w-md">
            Each year's days stay usable until the expiry date of the following year. Vacation
            uses the oldest days first; once they run out, it takes from the new year's allowance.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
              Days left
              <input
                type="number"
                min={0}
                max={365}
                step={1}
                value={settings.vacationCarryDays}
                onChange={(e) => update({ vacationCarryDays: Math.max(0, Number(e.target.value)) })}
                className={`${inputClass} w-24`}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
              As of
              <input
                type="date"
                value={settings.vacationCarryFrom}
                onChange={(e) => update({ vacationCarryFrom: e.target.value })}
                className={inputClass}
              />
            </label>
            <VacationExpiryInput value={settings.vacationExpiry} onChange={(v) => update({ vacationExpiry: v })} className={inputClass} />
          </div>
        </div>
      </Section>

      <Section id="bank" icon={Scale} title="Hour bank" tone="emerald" summary={formatSigned(carryInMs)}>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 max-w-md">
            Hours worked above or below each week's target carry over to the next week: being
            ahead lowers this week's target, being behind raises it. Only complete weeks since the
            start date count.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
              Start date
              <input
                type="date"
                value={settings.balanceStartDate}
                onChange={(e) => e.target.value && update({ balanceStartDate: e.target.value })}
                className={inputClass}
              />
            </label>
            <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
              Initial balance
              <div className="flex items-center gap-1">
                <select
                  value={balanceSign}
                  onChange={(e) => setInitialBalance(Number(e.target.value), Math.floor(balanceAbs / 60), balanceAbs % 60)}
                  className={inputClass}
                  aria-label="Balance sign"
                >
                  <option value={1}>+</option>
                  <option value={-1}>−</option>
                </select>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={Math.floor(balanceAbs / 60)}
                  onChange={(e) => setInitialBalance(balanceSign, Number(e.target.value), balanceAbs % 60)}
                  className={`${inputClass} w-20`}
                  aria-label="Initial balance hours"
                />
                <span className="text-slate-400">h</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  step={1}
                  value={balanceAbs % 60}
                  onChange={(e) => setInitialBalance(balanceSign, Math.floor(balanceAbs / 60), Number(e.target.value))}
                  className={`${inputClass} w-20`}
                  aria-label="Initial balance minutes"
                />
                <span className="text-slate-400">m</span>
              </div>
            </div>
            <button
              onClick={() => update({ balanceStartDate: weekStartKey(), balanceInitialMinutes: 0 })}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Reset to 0 from this week
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
            Current balance:{' '}
            <span
              className={`font-semibold tabular-nums ${
                carryInMs > 0 ? 'text-emerald-600 dark:text-emerald-400' : carryInMs < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {formatSigned(carryInMs)}
            </span>{' '}
            <span className="text-xs text-slate-500 dark:text-slate-400">(carried into this week)</span>
          </p>
        </div>
      </Section>

      <Section id="data" icon={Download} title="Data" tone="slate">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Everything is stored locally in this browser. You can export a backup at any time.
        </p>
        <button
          onClick={exportData}
          className="px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-700 text-white font-medium hover:bg-slate-900 dark:hover:bg-slate-600 flex items-center gap-2"
        >
          <Download size={16} />
          Export backup (JSON)
        </button>
      </Section>
    </div>
  );
}
