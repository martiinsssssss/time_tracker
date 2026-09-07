import { useLocalStorage } from './useLocalStorage';
import type { Settings } from '../types';

const KEY = 'tt.settings';

const DEFAULTS: Settings = {
  workdayHours: 8,
  weeklyTargetHours: 40,
  vacationDaysTotal: 22,
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<Settings>(KEY, DEFAULTS);

  function update(patch: Partial<Settings>) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  return { settings, update };
}
