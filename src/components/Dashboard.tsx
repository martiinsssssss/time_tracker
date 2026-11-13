import { TodayCard } from './TodayCard';
import { IntervalsList } from './IntervalsList';
import { WeekCard } from './WeekCard';

// Reading order follows how often each part is needed: today at a glance, the
// log that backs it, and the week's plan. The calendar lives on the Time off tab.
export function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <TodayCard />
      <IntervalsList />
      <WeekCard />
    </div>
  );
}
