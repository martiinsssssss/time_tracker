import { Clock3, Flame, Hourglass, PalmtreeIcon, TrendingUp } from 'lucide-react';
import { TimerCard } from './TimerCard';
import { DailyClock } from './DailyClock';
import { IntervalsList } from './IntervalsList';
import { Calendar } from './Calendar';
import { StatTile } from './StatTile';
import { WeekCard } from './WeekCard';
import { useIntervals } from '../hooks/useIntervals';
import { useSettings } from '../hooks/useSettings';
import { useVacations } from '../hooks/useVacations';
import { useNow } from '../hooks/useNow';
import { useWeekPlan } from '../hooks/useWeekPlan';
import { computeStreak, formatHM, formatShort } from '../lib/time';

export function Dashboard() {
  const { intervals } = useIntervals();
  const { settings } = useSettings();
  const { vacationDates } = useVacations();
  const now = useNow(1000);
  const plan = useWeekPlan(now);

  const dayMs = plan.today.workedMs;
  const streak = computeStreak(intervals, now);
  const year = new Date(now).getFullYear();
  const vacationsThisYear = vacationDates.filter((d) => d.startsWith(String(year))).length;
  const remainingVacation = settings.vacationDaysTotal - vacationsThisYear;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatTile icon={Clock3} label="Worked today" value={formatHM(dayMs)} accent="indigo" />
        <StatTile icon={TrendingUp} label="Week so far" value={formatHM(plan.workedMs)} hint={`of ${formatShort(plan.targetMs)}`} accent="emerald" />
        <StatTile icon={Hourglass} label="Left this week" value={formatHM(plan.remainingMs)} accent="sky" />
        <StatTile icon={Flame} label="Current streak" value={`${streak} day${streak === 1 ? '' : 's'}`} accent="amber" />
        <StatTile icon={PalmtreeIcon} label="PTO days left" value={String(remainingVacation)} hint={`of ${settings.vacationDaysTotal}`} accent="rose" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TimerCard />
        <DailyClock />
      </div>

      <WeekCard />

      <Calendar />

      <IntervalsList />
    </div>
  );
}
