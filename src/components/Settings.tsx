import { useState } from 'react';
import { Briefcase, CalendarClock, Download, Moon, Palette, PartyPopper, Sun } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useHolidays } from '../hooks/useHolidays';
import { listPresets } from '../lib/holidaysData';
import { useIntervals } from '../hooks/useIntervals';
import { useTheme } from '../hooks/useTheme';
import { useOutOfOffice } from '../hooks/useOutOfOffice';
import { blockLostMinutes, parseHM } from '../lib/week';
import { formatHM } from '../lib/time';
import type { OutOfOfficeBlock } from '../types';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0];

function describeBlock(b: OutOfOfficeBlock): string {
  const when = b.kind === 'weekly' ? `Every ${WEEKDAY_NAMES[b.weekday ?? 0]}` : b.date;
  const pause = b.breakStart && b.breakEnd ? ` (break ${b.breakStart}–${b.breakEnd})` : '';
  return `${when} · ${b.start}–${b.end}${pause}`;
}

export function SettingsPage() {
  const { settings, update } = useSettings();
  const { holidays, loadPreset, addHoliday, removeHoliday } = useHolidays();
  const { intervals } = useIntervals();
  const { theme, toggle: toggleTheme } = useTheme();
  const { blocks, addBlock, removeBlock } = useOutOfOffice();
  const presets = listPresets();

  const [newDate, setNewDate] = useState('');
  const [newName, setNewName] = useState('');
  const [presetMsg, setPresetMsg] = useState<string | null>(null);

  const [oooKind, setOooKind] = useState<OutOfOfficeBlock['kind']>('weekly');
  const [oooWeekday, setOooWeekday] = useState(2);
  const [oooDate, setOooDate] = useState('');
  const [oooStart, setOooStart] = useState('13:00');
  const [oooEnd, setOooEnd] = useState('18:00');
  const [oooHasBreak, setOooHasBreak] = useState(true);
  const [oooBreakStart, setOooBreakStart] = useState('14:00');
  const [oooBreakEnd, setOooBreakEnd] = useState('15:00');
  const [oooLabel, setOooLabel] = useState('');

  const oooDraft = {
    start: oooStart,
    end: oooEnd,
    breakStart: oooHasBreak ? oooBreakStart : undefined,
    breakEnd: oooHasBreak ? oooBreakEnd : undefined,
  };
  const oooLostMinutes = blockLostMinutes(oooDraft);
  const oooValid =
    parseHM(oooEnd) > parseHM(oooStart) &&
    (!oooHasBreak || parseHM(oooBreakEnd) > parseHM(oooBreakStart)) &&
    (oooKind === 'weekly' || /^\d{4}-\d{2}-\d{2}$/.test(oooDate));

  function handleAddOutOfOffice() {
    if (!oooValid) return;
    addBlock({
      kind: oooKind,
      ...(oooKind === 'weekly' ? { weekday: oooWeekday } : { date: oooDate }),
      ...oooDraft,
      label: oooLabel.trim() || undefined,
    });
    setOooLabel('');
  }

  function handleLoadPreset(city: string, year: string) {
    const added = loadPreset(city, year);
    setPresetMsg(
      added > 0
        ? `Added ${added} holidays from ${city} ${year}.`
        : `${city} ${year} holidays were already loaded.`
    );
  }

  function handleAddHoliday() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate) || !newName.trim()) return;
    addHoliday(newDate, newName.trim());
    setNewDate('');
    setNewName('');
  }

  function exportData() {
    const data = {
      intervals,
      settings,
      holidays,
      vacationDates: JSON.parse(localStorage.getItem('tt.vacationDates') ?? '[]'),
      outOfOffice: blocks,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const inputClass =
    'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2';

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
        <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <Palette size={17} strokeWidth={2.25} />
          </span>
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? <Moon size={16} className="text-slate-400" /> : <Sun size={16} className="text-amber-400" />}
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Dark mode</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Switch the theme for the whole app</p>
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
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
        <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Briefcase size={17} strokeWidth={2.25} />
          </span>
          Workday
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-md">
            When you stop the timer, if your total for the day lands within this many minutes of
            that day's target (normally {settings.workdayHours}h, adjusted for out-of-office time
            and make-up hours), it rounds to exactly the target instead
            of the raw time — e.g. with a 15-minute margin, 7h 47m rounds up to 8h and 8h 10m
            rounds down to 8h. Set to 0 to turn this off.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
        <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg mb-1 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <CalendarClock size={17} strokeWidth={2.25} />
          </span>
          Out of office
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 max-w-xl">
          Hours you can't work (e.g. classes). They lower that day's target and are spread as
          make-up time over the other days of the same week — your weekly target stays the same.
        </p>

        <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 w-fit mb-4">
          {(['weekly', 'date'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setOooKind(k)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                oooKind === k
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {k === 'weekly' ? 'Every week' : 'Specific date'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {oooKind === 'weekly' ? (
            <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
              Day
              <select
                value={oooWeekday}
                onChange={(e) => setOooWeekday(Number(e.target.value))}
                className={inputClass}
              >
                {MONDAY_FIRST.map((d) => (
                  <option key={d} value={d}>
                    {WEEKDAY_NAMES[d]}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
              Date
              <input type="date" value={oooDate} onChange={(e) => setOooDate(e.target.value)} className={inputClass} />
            </label>
          )}
          <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
            From
            <input type="time" value={oooStart} onChange={(e) => setOooStart(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
            To
            <input type="time" value={oooEnd} onChange={(e) => setOooEnd(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300 flex-1 min-w-[160px]">
            Label (optional)
            <input
              type="text"
              value={oooLabel}
              onChange={(e) => setOooLabel(e.target.value)}
              placeholder="e.g. Classes"
              className={inputClass}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-end gap-3 mt-3">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 h-10">
            <input
              type="checkbox"
              checked={oooHasBreak}
              onChange={(e) => setOooHasBreak(e.target.checked)}
              className="w-4 h-4 accent-sky-600"
            />
            Includes a break
          </label>
          {oooHasBreak && (
            <>
              <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                Break from
                <input type="time" value={oooBreakStart} onChange={(e) => setOooBreakStart(e.target.value)} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                Break to
                <input type="time" value={oooBreakEnd} onChange={(e) => setOooBreakEnd(e.target.value)} className={inputClass} />
              </label>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Work hours lost:{' '}
            <span className="font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
              {oooValid ? formatHM(oooLostMinutes * 60_000) : '—'}
            </span>
          </p>
          <button
            onClick={handleAddOutOfOffice}
            disabled={!oooValid}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>

        <ul className="flex flex-col gap-1 mt-4 max-h-64 overflow-y-auto">
          {blocks.length === 0 && (
            <li className="text-slate-400 dark:text-slate-500 text-sm">No out-of-office time configured yet.</li>
          )}
          {blocks.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2 text-sm"
            >
              <span className="text-slate-600 dark:text-slate-300">
                {describeBlock(b)}
                {b.label && <span className="text-slate-400 dark:text-slate-500"> — {b.label}</span>}
                <span className="text-sky-600 dark:text-sky-400 font-medium"> · {formatHM(blockLostMinutes(b) * 60_000)} lost</span>
              </span>
              <button
                onClick={() => removeBlock(b.id)}
                className="text-slate-300 dark:text-slate-500 hover:text-rose-500 transition-colors"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
        <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <PartyPopper size={17} strokeWidth={2.25} />
          </span>
          Holidays
        </h2>

        {presets.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Load a preset:</p>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={`${p.city}-${p.year}`}
                  onClick={() => handleLoadPreset(p.city, p.year)}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800"
                >
                  {p.city} {p.year} ({p.count})
                </button>
              ))}
            </div>
            {presetMsg && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{presetMsg}</p>}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-2 mb-4">
          <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
            Date
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300 flex-1 min-w-[160px]">
            Name
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Company anniversary"
              className={inputClass}
            />
          </label>
          <button
            onClick={handleAddHoliday}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
          >
            Add
          </button>
        </div>

        <ul className="flex flex-col gap-1 max-h-64 overflow-y-auto">
          {holidays.length === 0 && (
            <li className="text-slate-400 dark:text-slate-500 text-sm">No holidays configured yet.</li>
          )}
          {holidays.map((h) => (
            <li
              key={h.date}
              className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2 text-sm"
            >
              <span className="text-slate-600 dark:text-slate-300">
                {h.date} — {h.name}
              </span>
              <button
                onClick={() => removeHoliday(h.date)}
                className="text-slate-300 dark:text-slate-500 hover:text-rose-500 transition-colors"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
        <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <Download size={17} strokeWidth={2.25} />
          </span>
          Data
        </h2>
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
      </div>
    </div>
  );
}
