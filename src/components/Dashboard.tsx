import { TodayCard } from './TodayCard';
import { IntervalsList } from './IntervalsList';
import { Calendar } from './Calendar';
import { WeekCard } from './WeekCard';

// Reading order follows how often each part is needed: today at a glance, the
// log that backs it, the week's plan, and the (collapsible) calendar last.
export function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <TodayCard />
      <IntervalsList />
      <WeekCard />
      <Calendar />
    </div>
  );
}
