# Time Tracker

A local web app to track your work hours. Built with React + TypeScript + Vite + Tailwind CSS. All data is stored in the browser's `localStorage` — no backend, no server.

## Features

- **Dashboard**: a stats overview (today, this week, streak, PTO days left), a start/stop timer, today's workday clock, the calendar, and today's logged intervals — all in one place.
- **Timer**: start and stop a work interval whenever you like; each stretch is saved as its own entry.
- **Workday clock**: total hours worked today and this week, with a progress bar against your configured target.
- **History**: a monthly bar chart of hours worked per day (with a daily-target reference line), plus a list of logged days you can expand to review or edit their intervals.
- **Calendar**: public holidays (with a ready-made Barcelona preset) and manually marked vacation days, with a running count of PTO days left for the year.
- **Manual interval editing**: fix the start/end time or add a note to any interval, from the Dashboard or History.
- **Dark mode**: toggle in Settings, with the system preference detected on first load.
- **Settings**: daily/weekly target hours, yearly PTO days, holiday management (load a preset, add/remove), and exporting a JSON backup.

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
