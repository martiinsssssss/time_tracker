import { useState } from 'react';
import { PartyPopper, X } from 'lucide-react';
import { useHolidays } from '../hooks/useHolidays';
import { showToast } from '../hooks/useToast';
import { listPresets } from '../lib/holidaysData';

/** Public holidays: load a city preset or add your own. */
export function HolidaysEditor() {
  const { holidays, loadPreset, addHoliday, removeHoliday } = useHolidays();
  const presets = listPresets();
  const [newDate, setNewDate] = useState('');
  const [newName, setNewName] = useState('');
  const [presetMsg, setPresetMsg] = useState<string | null>(null);

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

  function handleRemove(date: string, name: string) {
    removeHoliday(date);
    showToast({ message: `Removed holiday: ${name}`, action: { label: 'Undo', run: () => addHoliday(date, name) } });
  }

  const inputClass =
    'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2';

  return (
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
            {presetMsg && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{presetMsg}</p>}
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
            <li className="text-slate-500 dark:text-slate-400 text-sm">No holidays configured yet.</li>
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
                onClick={() => handleRemove(h.date, h.name)}
                aria-label={`Remove holiday: ${h.name}`}
                className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                <X size={15} />
              </button>
            </li>
          ))}
        </ul>
      </div>

  );
}
