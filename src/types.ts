export interface TimeInterval {
  id: string;
  /** ISO datetime string */
  start: string;
  /** ISO datetime string, null while running */
  end: string | null;
  /** optional label for the interval */
  label?: string;
}

export interface Settings {
  /** target worked hours per day, e.g. 8 */
  workdayHours: number;
  /** target worked hours per week, e.g. 40 */
  weeklyTargetHours: number;
  /** total vacation days granted per year */
  vacationDaysTotal: number;
}

export interface HolidayEntry {
  date: string; // YYYY-MM-DD
  name: string;
}
