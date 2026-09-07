import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useHolidays } from '../hooks/useHolidays';
import { listPresets } from '../lib/holidaysData';
import { useIntervals } from '../hooks/useIntervals';
import { useTheme } from '../hooks/useTheme';

export function SettingsPage() {
  const { settings, update } = useSettings();
  const { holidays, loadPreset, addHoliday, removeHoliday } = useHolidays();
  const { intervals } = useIntervals();
  const { theme, toggle: toggleTheme } = useTheme();
  const presets = listPresets();

  const [newDate, setNewDate] = useState('');
  const [newName, setNewName] = useState('');
  const [presetMsg, setPresetMsg] = useState<string | null>(null);

  function handleLoadPreset(city: string, year: string) {
    const added = loadPreset(city, year);
    setPresetMsg(
      added > 0
        ? `Se añadieron ${added} festivos de ${city} ${year}.`
        : `Los festivos de ${city} ${year} ya estaban cargados.`
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
        <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg mb-4">Apariencia</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Modo oscuro</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Cambia el tema de toda la aplicación</p>
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
        <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg mb-4">Jornada laboral</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
            Horas objetivo por día
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
            Horas objetivo por semana
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
            Días de vacaciones al año
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
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
        <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg mb-4">Festivos</h2>

        {presets.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Cargar preset:</p>
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
            Fecha
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300 flex-1 min-w-[160px]">
            Nombre
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej. Sant Jordi"
              className={inputClass}
            />
          </label>
          <button
            onClick={handleAddHoliday}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
          >
            Añadir
          </button>
        </div>

        <ul className="flex flex-col gap-1 max-h-64 overflow-y-auto">
          {holidays.length === 0 && (
            <li className="text-slate-400 dark:text-slate-500 text-sm">No hay festivos configurados todavía.</li>
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
        <h2 className="text-slate-800 dark:text-slate-100 font-bold text-lg mb-4">Datos</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Todos los datos se guardan localmente en este navegador. Puedes exportar una copia de seguridad.
        </p>
        <button
          onClick={exportData}
          className="px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-700 text-white font-medium hover:bg-slate-900 dark:hover:bg-slate-600"
        >
          Exportar copia de seguridad (JSON)
        </button>
      </div>
    </div>
  );
}
