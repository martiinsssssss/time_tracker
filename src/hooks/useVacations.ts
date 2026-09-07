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

  const isVacation = useCallback((date: string) => vacationDates.includes(date), [vacationDates]);

  return { vacationDates, toggle, isVacation };
}
