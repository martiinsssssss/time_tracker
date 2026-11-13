import type { Settings } from '../types';

/** One year's vacation days, usable from `start` to `end` (inclusive, YYYY-MM-DD). */
export interface VacationPool {
  year: number;
  total: number;
  used: number;
  /** total − used; negative when overdrawn */
  remaining: number;
  start: string;
  end: string;
}

type VacationSettings = Pick<Settings, 'vacationDaysTotal' | 'vacationCarryDays' | 'vacationCarryFrom' | 'vacationExpiry'>;

const pad = (n: number) => String(n).padStart(2, '0');

/** Last valid date of `MM-DD` in `year` (02-29 becomes 02-28 outside leap years). */
function expiryIn(year: number, monthDay: string): string {
  const [m, d] = monthDay.split('-').map(Number);
  const last = new Date(year, m, 0).getDate();
  return `${year}-${pad(m)}-${pad(Math.min(d, last))}`;
}

/**
 * Vacation days don't reset on 1 January: year Y's allowance is usable from
 * 1 Jan Y until `vacationExpiry` of Y+1. Each vacation day uses the oldest
 * pool still open on that date, so leftover days are spent before the new
 * year's allowance.
 *
 * With `vacationCarryFrom` set, the first pool is that date's year with
 * `vacationCarryDays` left as of that date, and earlier vacation days are
 * ignored. Without it, every year starts with the full allowance.
 */
export function vacationPools(vacationDates: string[], settings: VacationSettings): VacationPool[] {
  const expiry = /^\d{2}-\d{2}$/.test(settings.vacationExpiry) ? settings.vacationExpiry : '02-28';
  const carryFrom = /^\d{4}-\d{2}-\d{2}$/.test(settings.vacationCarryFrom) ? settings.vacationCarryFrom : '';
  const dates = [...vacationDates].filter((d) => !carryFrom || d >= carryFrom).sort();
  const firstYear = carryFrom ? Number(carryFrom.slice(0, 4)) : Number((dates[0] ?? String(new Date().getFullYear())).slice(0, 4));
  const lastYear = Math.max(firstYear, new Date().getFullYear() + 1, ...dates.map((d) => Number(d.slice(0, 4))));

  const pools: VacationPool[] = [];
  for (let year = firstYear; year <= lastYear; year++) {
    const carried = carryFrom && year === firstYear;
    const total = carried ? settings.vacationCarryDays : settings.vacationDaysTotal;
    pools.push({ year, total, used: 0, remaining: total, start: carried ? carryFrom : `${year}-01-01`, end: expiryIn(year + 1, expiry) });
  }

  for (const date of dates) {
    const open = pools.filter((p) => date >= p.start && date <= p.end);
    // Oldest pool with days left; if all are spent, overdraw the newest one.
    const pool = open.find((p) => p.remaining > 0) ?? open[open.length - 1];
    if (!pool) continue;
    pool.used++;
    pool.remaining--;
  }
  return pools;
}

/** Pools still usable on `today` (or later), oldest first. */
export function openPools(pools: VacationPool[], today: string): VacationPool[] {
  return pools.filter((p) => p.end >= today && p.start.slice(0, 4) <= String(Number(today.slice(0, 4)) + 1));
}

/** "28 Feb 2027" */
export function formatDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
