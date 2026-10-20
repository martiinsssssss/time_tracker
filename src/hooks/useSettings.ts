import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Settings } from '../types';
import { weekStartKey } from '../lib/time';

const KEY = 'tt.settings';

const DEFAULTS: Omit<Settings, 'balanceStartDate'> = {
  workdayHours: 8,
  weeklyTargetHours: 40,
  vacationDaysTotal: 22,
  roundingMarginMinutes: 0,
  balanceInitialMinutes: 0,
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<Partial<Settings>>(KEY, {});

  // The hour bank starts on the Monday of the week the app first sees no
  // start date — persist it so it doesn't move forward every week.
  useEffect(() => {
    if (!settings.balanceStartDate) {
      setSettings((prev) => (prev.balanceStartDate ? prev : { ...DEFAULTS, ...prev, balanceStartDate: weekStartKey() }));
    }
  }, [settings.balanceStartDate, setSettings]);

  function update(patch: Partial<Settings>) {
    // Merge over DEFAULTS too, so a settings object saved before a field
    // existed (loaded fresh from localStorage) still gets it.
    setSettings((prev) => ({ ...DEFAULTS, balanceStartDate: weekStartKey(), ...prev, ...patch }));
  }

  const merged: Settings = { ...DEFAULTS, balanceStartDate: weekStartKey(), ...settings };
  return { settings: merged, update };
}
