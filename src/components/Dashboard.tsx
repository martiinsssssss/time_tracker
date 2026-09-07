import { Clock3, Flame, PalmtreeIcon, TrendingUp } from 'lucide-react';
import { TimerCard } from './TimerCard';
import { DailyClock } from './DailyClock';
import { IntervalsList } from './IntervalsList';
import { Calendar } from './Calendar';
import { StatTile } from './StatTile';
import { useIntervals } from '../hooks/useIntervals';
import { useSettings } from '../hooks/useSettings';
import { useVacations } from '../hooks/useVacations';
import { useNow } from '../hooks/useNow';
import { computeStreak, formatHM, todayKey, totalDurationForDay, totalDurationForWeek } from '../lib/time';

export function Dashboard() {
  const { intervals } = useIntervals();
  const { settings } = useSettings();
  const { vacationDates } = useVacations();
  const now = useNow(1000);

  const today = todayKey();
  const dayMs = totalDurationForDay(intervals, today, now);
  const weekMs = totalDurationForWeek(intervals, new Date(now), now);
  const streak = computeStreak(intervals, now);
  const year = new Date(now).getFullYear();
  const vacationsThisYear = vacationDates.filter((d) => d.startsWith(String(year))).length;
  const remainingVacation = settings.vacationDaysTotal - vacationsThisYear;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile icon={Clock3} label="Worked today" value={formatHM(dayMs)} accent="indigo" />
        <StatTile icon={TrendingUp} label="Worked this week" value={formatHM(weekMs)} accent="emerald" />
        <StatTile icon={Flame} label="Current streak" value={`${streak} day${streak === 1 ? '' : 's'}`} accent="amber" />
        <StatTile icon={PalmtreeIcon} label="PTO days left" value={String(remainingVacation)} hint={`of ${settings.vacationDaysTotal}`} accent="rose" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TimerCard />
        <DailyClock />
      </div>

      <Calendar />

      <IntervalsList />
    </div>
  );
}
