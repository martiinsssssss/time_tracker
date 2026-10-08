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

/**
 * A stretch of time you can't work (e.g. classes). The hours it covers,
 * minus any break inside it, lower that day's target and must be made up
 * on other days of the same week — they never reduce the weekly target.
 */
export interface OutOfOfficeBlock {
  id: string;
  /** 'weekly' repeats on `weekday` every week; 'date' applies to one `date` */
  kind: 'weekly' | 'date';
  /** 0 = Sunday … 6 = Saturday (only for kind 'weekly') */
  weekday?: number;
  /** YYYY-MM-DD (only for kind 'date') */
  date?: string;
  /** HH:MM */
  start: string;
  /** HH:MM */
  end: string;
  /** HH:MM — optional break inside the block that doesn't count as lost */
  breakStart?: string;
  breakEnd?: string;
  label?: string;
}
