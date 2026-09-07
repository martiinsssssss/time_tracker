import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useHolidays } from '../hooks/useHolidays';
import { listPresets } from '../lib/holidaysData';
import { useIntervals } from '../hooks/useIntervals';

export function SettingsPage() {
  const { settings, update } = useSettings();
  const { holidays, loadPreset, addHoliday, removeHoliday } = useHolidays();
  const { intervals } = useIntervals();
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

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-slate-800 font-bold text-lg mb-4">Jornada laboral</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            Horas objetivo por día
            <input
              type="number"
              min={0.5}
              max={24}
              step={0.5}
              value={settings.workdayHours}
              onChange={(e) => update({ workdayHours: Number(e.target.value) })}
              className="border border-slate-200 rounded-lg px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            Horas objetivo por semana
            <input
              type="number"
              min={0}
              max={168}
              step={1}
              value={settings.weeklyTargetHours}
              onChange={(e) => update({ weeklyTargetHours: Number(e.target.value) })}
              className="border border-slate-200 rounded-lg px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            Días de vacaciones al año
            <input
              type="number"
              min={0}
              max={365}
              step={1}
              value={settings.vacationDaysTotal}
              onChange={(e) => update({ vacationDaysTotal: Number(e.target.value) })}
              className="border border-slate-200 rounded-lg px-3 py-2"
            />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-slate-800 font-bold text-lg mb-4">Festivos</h2>

        {presets.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-slate-500 mb-2">Cargar preset:</p>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={`${p.city}-${p.year}`}
                  onClick={() => handleLoadPreset(p.city, p.year)}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 border border-amber-200"
                >
                  {p.city} {p.year} ({p.count})
                </button>
              ))}
            </div>
            {presetMsg && <p className="text-xs text-slate-400 mt-2">{presetMsg}</p>}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-2 mb-4">
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            Fecha
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600 flex-1 min-w-[160px]">
            Nombre
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej. Sant Jordi"
              className="border border-slate-200 rounded-lg px-3 py-2"
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
            <li className="text-slate-400 text-sm">No hay festivos configurados todavía.</li>
          )}
          {holidays.map((h) => (
            <li
              key={h.date}
              className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm"
            >
              <span className="text-slate-600">
                {h.date} — {h.name}
              </span>
              <button
                onClick={() => removeHoliday(h.date)}
                className="text-slate-300 hover:text-rose-500 transition-colors"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-slate-800 font-bold text-lg mb-4">Datos</h2>
        <p className="text-sm text-slate-500 mb-3">
          Todos los datos se guardan localmente en este navegador. Puedes exportar una copia de seguridad.
        </p>
        <button
          onClick={exportData}
          className="px-4 py-2 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-900"
        >
          Exportar copia de seguridad (JSON)
        </button>
      </div>
    </div>
  );
}
