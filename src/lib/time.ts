import type { TimeInterval } from '../types';

export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dateKeyOf(iso: string): string {
  return todayKey(new Date(iso));
}

export function formatHMS(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

export function formatHM(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

export function intervalDuration(interval: TimeInterval, now: number = Date.now()): number {
  const start = new Date(interval.start).getTime();
  const end = interval.end ? new Date(interval.end).getTime() : now;
  return Math.max(0, end - start);
}

export function totalDurationForDay(intervals: TimeInterval[], day: string, now: number = Date.now()): number {
  return intervals
    .filter((i) => dateKeyOf(i.start) === day)
    .reduce((sum, i) => sum + intervalDuration(i, now), 0);
}

export function startOfWeek(date: Date, firstDayOfWeek: 0 | 1 = 1): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day - firstDayOfWeek + 7) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function totalDurationForWeek(intervals: TimeInterval[], reference: Date, now: number = Date.now()): number {
  const start = startOfWeek(reference);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return intervals
    .filter((i) => {
      const t = new Date(i.start).getTime();
      return t >= start.getTime() && t < end.getTime();
    })
    .reduce((sum, i) => sum + intervalDuration(i, now), 0);
}

export function isoNow(): string {
  return new Date().toISOString();
}

/** Converts an ISO datetime string to the value <input type="datetime-local"> expects, in local time. */
export function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Converts an <input type="datetime-local"> value (local time, no timezone) back to an ISO string. */
export function fromDatetimeLocal(value: string): string {
  return new Date(value).toISOString();
}
