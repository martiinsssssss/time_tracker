import { useIntervals } from './useIntervals';
import { useOutOfOffice } from './useOutOfOffice';
import { useHolidays } from './useHolidays';
import { useVacations } from './useVacations';
import { useAbsences } from './useAbsences';
import { useSettings } from './useSettings';
import { buildWeekPlan } from '../lib/week';

/** The current week's adaptive plan (targets, make-up hours, time left). */
export function useWeekPlan(now: number) {
  const { intervals } = useIntervals();
  const { blocks, skips } = useOutOfOffice();
  const { holidays } = useHolidays();
  const { vacationDates } = useVacations();
  const { absenceDates } = useAbsences();
  const { settings } = useSettings();

  return buildWeekPlan({
    intervals,
    blocks,
    skips,
    holidayDates: holidays.map((h) => h.date),
    vacationDates,
    absenceDates,
    settings,
    now,
  });
}
