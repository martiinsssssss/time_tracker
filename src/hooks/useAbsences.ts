import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Absence, AbsenceReason } from '../types';

const KEY = 'tt.absences';

export const ABSENCE_LABELS: Record<AbsenceReason, string> = {
  sick: 'Sick leave',
  strike: 'Strike',
  medical: 'Medical appointment',
  other: 'Other justified',
};

/** Justified absences: full days off that lower the target and don't use vacation days. */
export function useAbsences() {
  const [absences, setAbsences] = useLocalStorage<Absence[]>(KEY, []);

  /** Marks `date` with `reason`, or clears it if it already has an absence. */
  const toggle = useCallback(
    (date: string, reason: AbsenceReason) => {
      setAbsences((prev) =>
        prev.some((a) => a.date === date)
          ? prev.filter((a) => a.date !== date)
          : [...prev, { date, reason }].sort((a, b) => a.date.localeCompare(b.date))
      );
    },
    [setAbsences]
  );

  const absenceDates = useMemo(() => absences.map((a) => a.date), [absences]);
  const byDate = useMemo(() => new Map(absences.map((a) => [a.date, a.reason])), [absences]);

  return { absences, absenceDates, byDate, toggle };
}
