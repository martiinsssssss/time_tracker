# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One person: the author. A working student in Barcelona whose job has a flexible weekly hour target (40h by default) and who fits that work around university classes. Nobody else uses the app or sees its data, and there are no plans for other users.

## Product Purpose

Keep an accurate, trustworthy record of the hours actually worked, for the author's own accountability. The planning features (adaptive daily targets, out-of-office make-up, the hour bank) exist to answer "how much is left today and this week?", but they depend on the log being right. Success means the logged hours match what really happened and correcting them takes no effort.

## Positioning

A time tracker shaped around one specific life: work hours that bend around a class schedule. Classes are out-of-office blocks (with breaks inside them) that lower that day's target and get made up on other days of the same week. Skipping a class is detected live from tracked time. Weekday holidays and vacation days reduce the week's target, and each week's surplus or deficit carries into the next. Generic trackers record time; this one knows what the week owes.

## Operating Context

- Lives in a browser tab kept open all day on a desktop/laptop while working: start the timer, glance at progress, stop it. Phone use is not a primary scenario.
- Sessions are short and repeated: glances and one-click actions, with occasional edits to intervals that were started or stopped late.
- Less often: setting up out-of-office blocks, planning class skips, marking vacation days, and reviewing the monthly history.
- The week runs Monday–Sunday. Public holidays come from a Barcelona preset (the year's dates are kept in `src/lib/holidaysData.ts`).

## Capabilities and Constraints

- Local-only: React + TypeScript + Vite + Tailwind, with all data in `localStorage`. No backend, accounts or sync. JSON export is the only backup.
- Three areas: Dashboard (stats, timer, workday clock, This week, calendar, today's intervals), History (monthly chart, editable list of logged days), and Settings (targets, PTO, rounding margin, hour bank, out-of-office blocks, holidays, theme, export).
- Terminology: *interval*, *out of office* (classes are the typical case), *skip class*, *make-up hours*, *hour bank* / *carry-in balance*, *PTO* / vacation days, *rounding margin*.
- Rounding: on stop, a day total within the margin of today's target snaps to that target.
- Light and dark themes. On first load the theme follows the system preference.
- UI language is English. Dates use the `en-GB` format.

## Brand Commitments

Name: "Time Tracker". No other brand assets or voice commitments exist.

## Evidence on Hand

Real usage data lives only in the author's browser. The repo has no screenshots, sample data or testimonials, and none should be invented.

## Product Principles

1. **The log is the truth.** Recorded intervals must be accurate, visible and easy to correct. Derived numbers never hide or override what was actually tracked.
2. **Glanceable first.** In a tab left open all day, the current state (timer running?, today worked vs. target, week left) must be readable in a second.
3. **Explain the math.** Adaptive targets, make-up hours and the hour bank must always show why a number is what it is.
4. **Built for one.** Optimize for the author's real schedule rather than generality. Skip onboarding, multi-user concerns and marketing polish.

## Accessibility & Inclusion

No product-specific requirements beyond a sensible baseline (keyboard operability and readable contrast in both themes).
