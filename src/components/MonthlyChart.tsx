import { useMemo, useState } from 'react';
import type { TimeInterval } from '../types';
import { formatHM, totalDurationForDay, todayKey } from '../lib/time';

interface Props {
  intervals: TimeInterval[];
  year: number;
  month: number; // 0-indexed
  targetHours: number;
  now: number;
}

interface DayPoint {
  day: number;
  date: string;
  ms: number;
  isWeekend: boolean;
  isToday: boolean;
  isFuture: boolean;
}

const PLOT_HEIGHT = 140;
const TOP_PAD = 12;

export function MonthlyChart({ intervals, year, month, targetHours, now }: Props) {
  const today = todayKey();
  const [hovered, setHovered] = useState<number | null>(null);

  const points = useMemo<DayPoint[]>(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: DayPoint[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(year, month, d).getDay();
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      out.push({
        day: d,
        date,
        ms: totalDurationForDay(intervals, date, now),
        isWeekend: dow === 0 || dow === 6,
        isToday: date === today,
        isFuture: date > today,
      });
    }
    return out;
  }, [intervals, year, month, now, today]);

  const maxHours = Math.max(targetHours, ...points.map((p) => p.ms / 3_600_000), 1);
  const scaleMax = maxHours * 1.15;

  const monthTotalMs = points.reduce((sum, p) => sum + p.ms, 0);

  const barGap = 3;
  const barWidth = 100 / points.length - barGap * (points.length > 1 ? 0.6 : 0);
  const targetY = TOP_PAD + PLOT_HEIGHT * (1 - targetHours / scaleMax);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">
          {formatHM(monthTotalMs)}
        </span>
        <span className="text-slate-400 dark:text-slate-500 text-sm">month total</span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 100 ${TOP_PAD + PLOT_HEIGHT + 14}`}
          preserveAspectRatio="none"
          className="w-full h-[180px]"
        >
          {/* gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={0}
              x2={100}
              y1={TOP_PAD + PLOT_HEIGHT * f}
              y2={TOP_PAD + PLOT_HEIGHT * f}
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth={0.3}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {/* target reference line */}
          <line
            x1={0}
            x2={100}
            y1={targetY}
            y2={targetY}
            className="stroke-amber-400 dark:stroke-amber-500"
            strokeWidth={0.4}
            strokeDasharray="2,1.5"
            vectorEffect="non-scaling-stroke"
          />
          {/* bars */}
          {points.map((p, i) => {
            const h = p.ms > 0 ? Math.max(1.5, PLOT_HEIGHT * ((p.ms / 3_600_000) / scaleMax)) : 0.5;
            const x = i * (100 / points.length) + barGap * 0.3;
            const y = TOP_PAD + PLOT_HEIGHT - h;
            const isHover = hovered === i;
            return (
              <rect
                key={p.date}
                x={x}
                y={y}
                width={Math.max(0.5, barWidth)}
                height={h}
                rx={0.8}
                className={
                  p.isFuture
                    ? 'fill-slate-100 dark:fill-slate-700/40'
                    : p.ms === 0
                      ? 'fill-slate-200 dark:fill-slate-700'
                      : isHover
                        ? 'fill-indigo-700 dark:fill-indigo-400'
                        : p.isToday
                          ? 'fill-indigo-500 dark:fill-indigo-500'
                          : 'fill-indigo-400 dark:fill-indigo-600'
                }
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered((h2) => (h2 === i ? null : h2))}
              />
            );
          })}
        </svg>

        {hovered !== null && (
          <div
            className="pointer-events-none absolute -top-1 -translate-x-1/2 -translate-y-full bg-slate-800 dark:bg-slate-950 text-white text-xs rounded-md px-2 py-1 shadow-lg whitespace-nowrap"
            style={{ left: `${(hovered + 0.5) * (100 / points.length)}%` }}
          >
            {points[hovered].day} · {formatHM(points[hovered].ms)}
          </div>
        )}
      </div>

      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-0.5">
        <span>1</span>
        <span>{points.length}</span>
      </div>

      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-1.5 rounded-sm bg-indigo-400 dark:bg-indigo-600 inline-block" /> Hours worked
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 rounded-sm bg-amber-400 dark:bg-amber-500 inline-block" /> Daily target ({targetHours}h)
        </span>
      </div>
    </div>
  );
}
