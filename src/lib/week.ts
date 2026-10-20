import type { OutOfOfficeBlock, Settings, TimeInterval } from '../types';
import { intervalDuration, startOfWeek, todayKey, totalDurationForDay } from './time';

const MINUTE = 60_000;
const HOUR = 3_600_000;

/** 'HH:MM' → minutes since midnight (NaN if malformed). */
export function parseHM(value: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** YYYY-MM-DD → local midnight. */
export function parseDateKey(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** The clipped break of a block, in minutes since midnight, or null if it has none inside. */
function breakWindow(block: Pick<OutOfOfficeBlock, 'start' | 'end' | 'breakStart' | 'breakEnd'>): [number, number] | null {
  if (!block.breakStart || !block.breakEnd) return null;
  const bStart = Math.max(parseHM(block.start), parseHM(block.breakStart));
  const bEnd = Math.min(parseHM(block.end), parseHM(block.breakEnd));
  return bEnd > bStart ? [bStart, bEnd] : null;
}

/**
 * Minutes of work a block takes away: (end - start) minus whatever part of
 * its break falls inside it. E.g. 13:00–18:00 with a 14:00–15:00 break → 240.
 */
export function blockLostMinutes(block: Pick<OutOfOfficeBlock, 'start' | 'end' | 'breakStart' | 'breakEnd'>): number {
  const start = parseHM(block.start);
  const end = parseHM(block.end);
  if (!(end > start)) return 0;
  const pause = breakWindow(block);
  return end - start - (pause ? pause[1] - pause[0] : 0);
}

/** Blocks that apply to a given YYYY-MM-DD date. */
export function blocksForDate(blocks: OutOfOfficeBlock[], date: string): OutOfOfficeBlock[] {
  const weekday = parseDateKey(date).getDay();
  return blocks.filter((b) => (b.kind === 'weekly' ? b.weekday === weekday : b.date === date));
}

/** Key stored in `tt.oooSkips` for "I'm skipping this block on this date". */
export function skipKey(blockId: string, date: string): string {
  return `${blockId}@${date}`;
}

function overlap(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  return Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
}

/**
 * Time actually worked inside a block's window on `date` (the break doesn't
 * count), including a running interval up to `now`.
 */
export function workedDuringBlockMs(block: OutOfOfficeBlock, date: string, intervals: TimeInterval[], now: number): number {
  const midnight = parseDateKey(date).getTime();
  const at = (minutes: number) => midnight + minutes * MINUTE;
  const start = at(parseHM(block.start));
  const end = at(parseHM(block.end));
  if (!(end > start)) return 0;
  const pause = breakWindow(block);
  let total = 0;
  for (const interval of intervals) {
    const iStart = new Date(interval.start).getTime();
    const iEnd = iStart + intervalDuration(interval, now);
    total += overlap(iStart, iEnd, start, end);
    if (pause) total -= overlap(iStart, iEnd, at(pause[0]), at(pause[1]));
  }
  return total;
}

/** weeklyTargetHours minus one workday per Mon–Fri holiday/vacation day of the week starting on `monday`. */
function weekTargetFor(monday: Date, holidays: Set<string>, vacations: Set<string>, settings: Pick<Settings, 'workdayHours' | 'weeklyTargetHours'>): number {
  const cursor = new Date(monday);
  let daysOff = 0;
  for (let i = 0; i < 5; i++) {
    const date = todayKey(cursor);
    if (holidays.has(date) || vacations.has(date)) daysOff++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return Math.max(0, settings.weeklyTargetHours * HOUR - settings.workdayHours * HOUR * daysOff);
}

/**
 * Hour bank carried into the current week: the initial balance plus, for
 * every complete week from the week of `balanceStartDate` up to last week,
 * worked time minus that week's target. Positive = ahead.
 */
export function computeCarryInMs(
  intervals: TimeInterval[],
  holidays: Set<string>,
  vacations: Set<string>,
  settings: Pick<Settings, 'workdayHours' | 'weeklyTargetHours'> &
    Partial<Pick<Settings, 'balanceStartDate' | 'balanceInitialMinutes'>>,
  now: number
): number {
  let carry = (settings.balanceInitialMinutes || 0) * MINUTE;
  if (!settings.balanceStartDate || !/^\d{4}-\d{2}-\d{2}$/.test(settings.balanceStartDate)) return carry;
  const thisWeek = startOfWeek(new Date(now)).getTime();
  const cursor = startOfWeek(parseDateKey(settings.balanceStartDate));

  // Bucket worked time by week once, instead of scanning every interval per week.
  const workedByWeek = new Map<string, number>();
  for (const interval of intervals) {
    const start = new Date(interval.start);
    if (start.getTime() < cursor.getTime() || start.getTime() >= thisWeek) continue;
    const key = todayKey(startOfWeek(start));
    workedByWeek.set(key, (workedByWeek.get(key) ?? 0) + intervalDuration(interval, now));
  }

  while (cursor.getTime() < thisWeek) {
    carry += (workedByWeek.get(todayKey(cursor)) ?? 0) - weekTargetFor(cursor, holidays, vacations, settings);
    cursor.setDate(cursor.getDate() + 7);
  }
  return carry;
}

export type OffReason = 'weekend' | 'holiday' | 'vacation' | null;

export interface DayBlock {
  block: OutOfOfficeBlock;
  /** lost time per the block's schedule */
  lostMs: number;
  /** time worked inside the block's window (break excluded) */
  workedDuringMs: number;
  skipped: boolean;
  /** what the block actually takes away today: 0 if skipped, else lost − worked during it */
  effectiveLostMs: number;
}

export interface WeekDay {
  date: string;
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
  isToday: boolean;
  isPast: boolean;
  isWorking: boolean;
  offReason: OffReason;
  /** out-of-office blocks on this working day */
  blocks: DayBlock[];
  /** every block on this day is marked as skipped */
  skipped: boolean;
  /** some time was worked during a (non-skipped) block */
  workedDuringClass: boolean;
  outOfOfficeMs: number;
  /** workday hours minus out-of-office time */
  baseMs: number;
  /** base + this day's share of the hours to make up (or minus, when ahead) */
  plannedMs: number;
  makeUpMs: number;
  workedMs: number;
}

export interface WeekPlan {
  days: WeekDay[];
  /** weekly target after holidays/vacation, before the hour bank */
  weekTargetMs: number;
  /** hour bank from previous weeks (positive = ahead) */
  carryInMs: number;
  /** weekTarget − carryIn: what this week actually needs */
  effectiveTargetMs: number;
  /** Mon–Fri days that are a holiday or vacation */
  daysOff: number;
  workedMs: number;
  remainingMs: number;
  /** positive = ahead of plan, negative = hours still to make up */
  aheadMs: number;
  outOfOfficeMs: number;
  /** working days from today (inclusive) to the end of the week */
  remainingWorkingDays: number;
  todayTargetMs: number;
  today: WeekDay;
}

interface BuildWeekPlanInput {
  intervals: TimeInterval[];
  blocks: OutOfOfficeBlock[];
  skips?: string[];
  holidayDates: string[];
  vacationDates: string[];
  settings: Pick<Settings, 'workdayHours' | 'weeklyTargetHours'> &
    Partial<Pick<Settings, 'balanceStartDate' | 'balanceInitialMinutes'>>;
  now: number;
}

/** Lowers every day in `days` evenly by `amountMs`, never below 0 (what a day can't absorb moves to the others). */
function spreadReduction(days: WeekDay[], amountMs: number) {
  let remaining = amountMs;
  let active = days.filter((d) => d.plannedMs > 0);
  while (remaining > 0 && active.length > 0) {
    const cut = remaining / active.length;
    const smallest = Math.min(...active.map((d) => d.plannedMs));
    const step = Math.min(cut, smallest);
    for (const day of active) day.plannedMs -= step;
    remaining -= step * active.length;
    active = active.filter((d) => d.plannedMs > 0);
  }
}

/**
 * Plans the current Monday–Sunday week:
 * - the weekly target drops by one workday per weekday holiday/vacation day,
 *   then the hour bank from previous weeks is applied on top;
 * - out-of-office time (unless skipped or worked through) lowers that day's
 *   target but not the week's, so missing hours are spread evenly over the
 *   remaining working days without out-of-office time (or all of them, if
 *   none). Being ahead lowers every remaining working day evenly instead.
 */
export function buildWeekPlan({ intervals, blocks, skips = [], holidayDates, vacationDates, settings, now }: BuildWeekPlanInput): WeekPlan {
  const holidays = new Set(holidayDates);
  const vacations = new Set(vacationDates);
  const skipSet = new Set(skips);
  const workdayMs = settings.workdayHours * HOUR;
  const todayStr = todayKey(new Date(now));
  const monday = startOfWeek(new Date(now));
  const cursor = new Date(monday);

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
    const dayBlocks: DayBlock[] = isWorking
      ? blocksForDate(blocks, date).map((block) => {
          const lostMs = blockLostMinutes(block) * MINUTE;
          const workedDuringMs = workedDuringBlockMs(block, date, intervals, now);
          const skipped = skipSet.has(skipKey(block.id, date));
          return {
            block,
            lostMs,
            workedDuringMs,
            skipped,
            effectiveLostMs: skipped ? 0 : Math.max(0, lostMs - workedDuringMs),
          };
        })
      : [];
    const outOfOfficeMs = Math.min(workdayMs, dayBlocks.reduce((sum, b) => sum + b.effectiveLostMs, 0));
    const baseMs = isWorking ? workdayMs - outOfOfficeMs : 0;
    days.push({
      date,
      weekday,
      isToday: date === todayStr,
      isPast: date < todayStr,
      isWorking,
      offReason,
      blocks: dayBlocks,
      skipped: dayBlocks.length > 0 && dayBlocks.every((b) => b.skipped),
      workedDuringClass: dayBlocks.some((b) => !b.skipped && b.workedDuringMs > 0),
      outOfOfficeMs,
      baseMs,
      plannedMs: baseMs,
      makeUpMs: 0,
      workedMs: totalDurationForDay(intervals, date, now),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const daysOff = days.filter((d) => d.offReason === 'holiday' || d.offReason === 'vacation').length;
  const weekTargetMs = weekTargetFor(monday, holidays, vacations, settings);
  const carryInMs = computeCarryInMs(intervals, holidays, vacations, settings, now);
  const effectiveTargetMs = Math.max(0, weekTargetMs - carryInMs);

  const workedBeforeToday = days.filter((d) => d.isPast).reduce((sum, d) => sum + d.workedMs, 0);
  const upcoming = days.filter((d) => !d.isPast && d.isWorking);
  const needFromToday = Math.max(0, effectiveTargetMs - workedBeforeToday);
  const extraMs = needFromToday - upcoming.reduce((sum, d) => sum + d.baseMs, 0);

  if (extraMs > 0) {
    const withoutOutOfOffice = upcoming.filter((d) => d.outOfOfficeMs === 0);
    const sharers = withoutOutOfOffice.length > 0 ? withoutOutOfOffice : upcoming;
    for (const day of sharers) day.plannedMs += extraMs / sharers.length;
  } else if (extraMs < 0) {
    spreadReduction(upcoming, -extraMs);
  }
  for (const day of upcoming) {
    day.plannedMs = Math.max(0, Math.round(day.plannedMs / MINUTE) * MINUTE);
    day.makeUpMs = day.plannedMs - day.baseMs;
  }

  const workedMs = days.reduce((sum, d) => sum + d.workedMs, 0);
  const today = days.find((d) => d.isToday)!;

  return {
    days,
    weekTargetMs,
    carryInMs,
    effectiveTargetMs,
    daysOff,
    workedMs,
    remainingMs: Math.max(0, effectiveTargetMs - workedMs),
    aheadMs: -extraMs,
    outOfOfficeMs: days.reduce((sum, d) => sum + d.outOfOfficeMs, 0),
    remainingWorkingDays: upcoming.length,
    todayTargetMs: today.isWorking ? today.plannedMs : 0,
    today,
  };
}
