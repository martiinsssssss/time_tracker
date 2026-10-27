import { Clock3, Hourglass, TrendingUp } from 'lucide-react';
import { TimerCard } from './TimerCard';
import { DailyClock } from './DailyClock';
import { IntervalsList } from './IntervalsList';
import { Calendar } from './Calendar';
import { StatTile } from './StatTile';
import { WeekCard } from './WeekCard';
import { useNow } from '../hooks/useNow';
import { useWeekPlan } from '../hooks/useWeekPlan';
import { formatHM, formatShort } from '../lib/time';

function aheadHint(aheadMs: number): string | undefined {
  if (Math.abs(aheadMs) < 60_000) return undefined;
  return aheadMs > 0 ? `+${formatHM(aheadMs)} ahead` : `${formatHM(-aheadMs)} to make up`;
}

export function Dashboard() {
  const now = useNow(1000);
  const plan = useWeekPlan(now);

  // The "left" tile takes the One Meaning colors: emerald when ahead, rose when behind.
  const leftAccent = plan.aheadMs >= 60_000 ? 'emerald' : plan.aheadMs <= -60_000 ? 'rose' : 'slate';

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <StatTile
          icon={Clock3}
          label="Worked today"
          value={formatHM(plan.today.workedMs)}
          hint={plan.todayTargetMs > 0 ? `of ${formatShort(plan.todayTargetMs)}` : 'day off'}
          accent="indigo"
        />
        <StatTile icon={TrendingUp} label="Week so far" value={formatHM(plan.workedMs)} hint={`of ${formatShort(plan.effectiveTargetMs)}`} accent="slate" />
        <StatTile icon={Hourglass} label="Left this week" value={formatHM(plan.remainingMs)} hint={aheadHint(plan.aheadMs)} accent={leftAccent} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TimerCard />
        <DailyClock />
      </div>

      <IntervalsList />

      <WeekCard />

      <Calendar />
    </div>
  );
}
