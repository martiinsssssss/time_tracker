---
target: src/components/Dashboard.tsx
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:/Users/martins/Desktop/projects/time_tracker/src/components/Dashboard.tsx"
target_fingerprint: "sha256:fd76fc586ae6bfe84784ab42eac91d72d8bc85bc73e526cd8d640d2e946aed23"
target_path: /Users/martins/Desktop/projects/time_tracker/src/components/Dashboard.tsx
timestamp: 2026-10-27T15-02-19Z
slug: src-components-dashboard-tsx
closed: true
---
Method: dual-agent (A: design review · B: detector + headless CDP). claude-in-chrome unavailable; rendered at 1280/390, light and dark, seeded; extra states: rounding toast, collapsed calendar, empty first run, form error, Tab order.

## Design Health Score — 29/40 (Good; was 26, 23)
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of status | 3 | Running hero shows the interval, not today; static favicon |
| 2 | Match real world | 3 | "PTO" vs "Vacation"; "interval" is engineer language |
| 3 | User control | 3 | Undo everywhere except Start/Stop (one keystroke) |
| 4 | Consistency | 3 | Indigo PTO pill/palm vs indigo = now; IntervalsList is a div among sections |
| 5 | Error prevention | 3 | Stray S silently changes the log |
| 6 | Recognition | 3 | Today's 9h 33m only explained inside another card's disclosure |
| 7 | Flexibility | 3 | No add/edit shortcut, no "started N min ago", no label on running |
| 8 | Minimalism | 2 | Week header 4 facts; calendar + PTO on glance surface; permanent rounding hint |
| 9 | Error recovery | 3 | Overlap error has no one-click fix |
| 10 | Help | 3 | Strong ledger; shortcuts only as kbd chips |

## Detector
CLI 0 (9 files). Rendered light & dark: 5× nested-cards, WeekCard.tsx:101 weekday tiles inside the week card (design call). No contrast hits.

## Priority Issues
- [P1] Stray S changes the log; Start/Stop have no undo; single-key S/Z with no off switch (WCAG 2.1.4). Fix: "Started 16:02 · Undo", "Saved 1h 40m · Resume", setting to disable single-key shortcuts. TodayCard.tsx:49-90, Toaster.tsx:15-26. → harden
- [P2] Running hero shows interval not today's total; tab title and hero disagree. Make today the ticking hero, interval as subline. TodayCard.tsx:116-128. → layout
- [P2] Calendar + indigo PTO pill on glance surface; indigo also = vacation. Move calendar off Dashboard or neutral pill; vacation neutral/sky wash. Calendar.tsx:116-119, WeekCard.tsx:118-121. → distill / colorize
- [P2] Calendar weekend digits slate-400/500 (~2.6:1), contradicts DESIGN.md. Calendar.tsx:199. → polish
- [P3] Repeated numbers (list header total, running row HMS, make-up ×3); edit form: datetime-local for same-day, placeholder-only Note, hides original row. → distill / clarify

## Persona red flags
Alex: no add/edit-last keys; no late-start fix; no label on running; no split. Sam: S/Z not disableable; off-day progressbars read 0%; calendar group not grid; intervals not a region; 16px rounding-undo target. Author: static favicon; weak running signal on page; rounding hint all day.

## Minor
390px orphaned "· Bug triage" wrap; Friday alone in week grid; month title is hidden back-to-today; RUNNING only uppercase; make-up notes persist after goal reached; chevrons lack aria-hidden.

## Questions
Rounding as display rule instead of rewriting end? Design for the 5% foreground (log as hero)? Calendar on daily surface?
