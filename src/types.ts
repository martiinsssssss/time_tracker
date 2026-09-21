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
  /**
   * When you stop the timer, if the day's total lands within this many
   * minutes of `workdayHours`, it's rounded to exactly the target instead
   * of the raw stopped time. 0 disables rounding.
   */
  roundingMarginMinutes: number;
}

export interface HolidayEntry {
  date: string; // YYYY-MM-DD
  name: string;
}
