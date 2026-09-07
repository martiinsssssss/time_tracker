import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { HOLIDAY_PRESETS } from '../lib/holidaysData';

const KEY = 'tt.publicHolidays';

export interface StoredHoliday {
  date: string; // YYYY-MM-DD
  name: string;
}

export function useHolidays() {
  const [holidays, setHolidays] = useLocalStorage<StoredHoliday[]>(KEY, []);

  const loadPreset = useCallback(
    (city: string, year: string) => {
      const list = HOLIDAY_PRESETS[city]?.[year];
      if (!list) return 0;
      let added = 0;
      setHolidays((prev) => {
        const existing = new Set(prev.map((h) => h.date));
        const toAdd = list.filter((h) => !existing.has(h.date));
        added = toAdd.length;
        return [...prev, ...toAdd].sort((a, b) => a.date.localeCompare(b.date));
      });
      return added;
    },
    [setHolidays]
  );

  const addHoliday = useCallback(
    (date: string, name: string) => {
      setHolidays((prev) => {
        if (prev.some((h) => h.date === date)) return prev;
        return [...prev, { date, name }].sort((a, b) => a.date.localeCompare(b.date));
      });
    },
    [setHolidays]
  );

  const removeHoliday = useCallback(
    (date: string) => {
      setHolidays((prev) => prev.filter((h) => h.date !== date));
    },
    [setHolidays]
  );

  return { holidays, loadPreset, addHoliday, removeHoliday };
}
