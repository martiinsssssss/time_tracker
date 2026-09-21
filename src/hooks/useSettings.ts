import { useLocalStorage } from './useLocalStorage';
import type { Settings } from '../types';

const KEY = 'tt.settings';

const DEFAULTS: Settings = {
  workdayHours: 8,
  weeklyTargetHours: 40,
  vacationDaysTotal: 22,
  roundingMarginMinutes: 0,
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<Settings>(KEY, DEFAULTS);

  function update(patch: Partial<Settings>) {
    // Merge over DEFAULTS too, so a settings object saved before this field
    // existed (loaded fresh from localStorage) still gets roundingMarginMinutes.
    setSettings((prev) => ({ ...DEFAULTS, ...prev, ...patch }));
  }

  return { settings: { ...DEFAULTS, ...settings }, update };
}
