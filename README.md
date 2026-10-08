# Time Tracker

A local web app to track your work hours. Built with React + TypeScript + Vite + Tailwind CSS. All data is stored in the browser's `localStorage` — no backend, no server.

## Features

- **Dashboard**: a stats overview (today, week so far, hours left this week, streak, PTO days left), a start/stop timer, today's workday clock, the "This week" plan, the calendar, and today's logged intervals — all in one place.
- **Timer**: start and stop a work interval whenever you like; each stretch is saved as its own entry. The optional rounding margin rounds to *today's* target (see below).
- **Workday clock**: hours worked today against today's adaptive target (with a note for out-of-office time and make-up hours), plus the week's progress and how much is left.
- **Out of office**: block out hours you can't work (e.g. classes), either every week on a given day or on a specific date, with an optional break inside. A Tuesday 13:00–18:00 with a 14:00–15:00 lunch break loses 4h. Those hours don't count as worked and don't lower the weekly target — they lower that day's target and get made up on other days of the same week.
- **Adaptive weekly target**: the week runs Monday–Sunday. Each weekday holiday or vacation day lowers the weekly target by one workday (e.g. 40h with one holiday → 32h). Whatever is still missing after out-of-office time is spread evenly over the remaining working days without out-of-office time. With 8h days and the Tuesday block above, Monday/Wednesday/Thursday/Friday become 9h and Tuesday 4h. Past days' hours are taken into account, so the plan adapts as the week goes on.
- **This week**: hours left until the weekly target, and a card per weekday with progress, worked / target, holiday or vacation markers, out-of-office time and make-up hours.
- **History**: a monthly bar chart of hours worked per day (with a daily-target reference line), plus a list of logged days you can expand to review or edit their intervals.
- **Calendar**: public holidays (with a ready-made Barcelona preset) and manually marked vacation days, with a running count of PTO days left for the year. Working days with out-of-office time get a small blue dot.
- **Manual interval editing**: fix the start/end time or add a note to any interval, from the Dashboard or History.
- **Dark mode**: toggle in Settings, with the system preference detected on first load.
- **Settings**: daily/weekly target hours, yearly PTO days, rounding margin, out-of-office time, holiday management (load a preset, add/remove), and exporting a JSON backup (including out-of-office blocks).

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```
