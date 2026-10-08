import type { OutOfOfficeBlock, Settings, TimeInterval } from '../types';
import { startOfWeek, todayKey, totalDurationForDay } from './time';

const MINUTE = 60_000;
const HOUR = 3_600_000;

/** 'HH:MM' → minutes since midnight (NaN if malformed). */
export function parseHM(value: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

/**
 * Minutes of work a block takes away: (end - start) minus whatever part of
 * its break falls inside it. E.g. 13:00–18:00 with a 14:00–15:00 break → 240.
 */
export function blockLostMinutes(block: Pick<OutOfOfficeBlock, 'start' | 'end' | 'breakStart' | 'breakEnd'>): number {
  const start = parseHM(block.start);
  const end = parseHM(block.end);
  if (!(end > start)) return 0;
  let lost = end - start;
  if (block.breakStart && block.breakEnd) {
    const bStart = Math.max(start, parseHM(block.breakStart));
    const bEnd = Math.min(end, parseHM(block.breakEnd));
    if (bEnd > bStart) lost -= bEnd - bStart;
  }
  return lost;
}

/** Blocks that apply to a given YYYY-MM-DD date. */
export function blocksForDate(blocks: OutOfOfficeBlock[], date: string): OutOfOfficeBlock[] {
  const [y, m, d] = date.split('-').map(Number);
  const weekday = new Date(y, m - 1, d).getDay();
  return blocks.filter((b) => (b.kind === 'weekly' ? b.weekday === weekday : b.date === date));
}

export type OffReason = 'weekend' | 'holiday' | 'vacation' | null;

export interface WeekDay {
  date: string;
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
  isToday: boolean;
  isPast: boolean;
  isWorking: boolean;
  offReason: OffReason;
  outOfOfficeMs: number;
  /** workday hours minus out-of-office time */
  baseMs: number;
  /** base + this day's share of the hours to make up */
  plannedMs: number;
  makeUpMs: number;
  workedMs: number;
}

export interface WeekPlan {
  days: WeekDay[];
  targetMs: number;
  /** Mon–Fri days that are a holiday or vacation */
  daysOff: number;
  workedMs: number;
  remainingMs: number;
  outOfOfficeMs: number;
  /** working days from today (inclusive) to the end of the week */
  remainingWorkingDays: number;
  todayTargetMs: number;
  today: WeekDay;
}

interface BuildWeekPlanInput {
  intervals: TimeInterval[];
  blocks: OutOfOfficeBlock[];
  holidayDates: string[];
  vacationDates: string[];
  settings: Pick<Settings, 'workdayHours' | 'weeklyTargetHours'>;
  now: number;
}

/**
 * Plans the current Monday–Sunday week:
 * - the weekly target drops by one workday per weekday holiday/vacation day;
 * - out-of-office time lowers that day's target but not the week's, so the
 *   hours still missing are spread evenly over the remaining working days
 *   without out-of-office time (or all remaining working days, if none).
 */
export function buildWeekPlan({ intervals, blocks, holidayDates, vacationDates, settings, now }: BuildWeekPlanInput): WeekPlan {
  const holidays = new Set(holidayDates);
  const vacations = new Set(vacationDates);
  const workdayMs = settings.workdayHours * HOUR;
  const todayStr = todayKey(new Date(now));
  const cursor = startOfWeek(new Date(now));

  const days: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const date = todayKey(cursor);
    const weekday = cursor.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const offReason: OffReason = isWeekend
      ? 'weekend'
      : holidays.has(date)
        ? 'holiday'
        : vacations.has(date)
          ? 'vacation'
          : null;
    const isWorking = offReason === null;
    const lostMs = blocksForDate(blocks, date).reduce((sum, b) => sum + blockLostMinutes(b) * MINUTE, 0);
    const outOfOfficeMs = isWorking ? Math.min(workdayMs, lostMs) : 0;
    const baseMs = isWorking ? workdayMs - outOfOfficeMs : 0;
    days.push({
      date,
      weekday,
      isToday: date === todayStr,
      isPast: date < todayStr,
      isWorking,
      offReason,
      outOfOfficeMs,
      baseMs,
      plannedMs: baseMs,
      makeUpMs: 0,
      workedMs: totalDurationForDay(intervals, date, now),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const daysOff = days.filter((d) => d.offReason === 'holiday' || d.offReason === 'vacation').length;
  const targetMs = Math.max(0, settings.weeklyTargetHours * HOUR - workdayMs * daysOff);

  const workedBeforeToday = days.filter((d) => d.isPast).reduce((sum, d) => sum + d.workedMs, 0);
  const upcoming = days.filter((d) => !d.isPast && d.isWorking);
  const stillToDo = targetMs - workedBeforeToday;
  const extraMs = stillToDo - upcoming.reduce((sum, d) => sum + d.baseMs, 0);

  const withoutOutOfOffice = upcoming.filter((d) => d.outOfOfficeMs === 0);
  const sharers = withoutOutOfOffice.length > 0 ? withoutOutOfOffice : upcoming;
  const shareMs = sharers.length > 0 ? extraMs / sharers.length : 0;
  for (const day of upcoming) {
    const raw = day.baseMs + (sharers.includes(day) ? shareMs : 0);
    day.plannedMs = Math.max(0, Math.round(raw / MINUTE) * MINUTE);
    day.makeUpMs = day.plannedMs - day.baseMs;
  }

  const workedMs = days.reduce((sum, d) => sum + d.workedMs, 0);
  const today = days.find((d) => d.isToday)!;

  return {
    days,
    targetMs,
    daysOff,
    workedMs,
    remainingMs: Math.max(0, targetMs - workedMs),
    outOfOfficeMs: days.reduce((sum, d) => sum + d.outOfOfficeMs, 0),
    remainingWorkingDays: upcoming.length,
    todayTargetMs: today.isWorking ? today.plannedMs : 0,
    today,
  };
}
