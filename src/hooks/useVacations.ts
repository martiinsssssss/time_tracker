import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const KEY = 'tt.vacationDates';

export function useVacations() {
  const [vacationDates, setVacationDates] = useLocalStorage<string[]>(KEY, []);

  const toggle = useCallback(
    (date: string) => {
      setVacationDates((prev) =>
        prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date].sort()
      );
    },
    [setVacationDates]
  );

  /** Adds (on) or removes (off) every date in `dates` at once. */
  const setMany = useCallback(
    (dates: string[], on: boolean) => {
      setVacationDates((prev) => {
        const next = new Set(prev);
        for (const d of dates) {
          if (on) next.add(d);
          else next.delete(d);
        }
        return [...next].sort();
      });
    },
    [setVacationDates]
  );

  const isVacation = useCallback((date: string) => vacationDates.includes(date), [vacationDates]);

  return { vacationDates, toggle, setMany, isVacation };
}
