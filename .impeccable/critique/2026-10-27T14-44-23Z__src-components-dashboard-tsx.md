---
target: src/components/Dashboard.tsx
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/Users/martins/Desktop/projects/time_tracker/src/components/Dashboard.tsx"
target_fingerprint: "sha256:64cbf33d7b27e32511ceee9944b8952df21f1a11ceed42866e192d7e202529d2"
target_path: /Users/martins/Desktop/projects/time_tracker/src/components/Dashboard.tsx
timestamp: 2026-10-27T14-44-23Z
slug: src-components-dashboard-tsx
closed: true
---
Method: dual-agent (A: design review · B: detector + headless-Chromium CDP scan). Rendered at 1280/390, light and dark, seeded data.

## Design Health Score — 26/40 (Acceptable; was 23)
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of status | 3 | Idle hero is grey 00:00:00 (1.5:1); header date stale after midnight |
| 2 | Match real world | 3 | "left" / "to make up" / "make-up"; "−30m ahead" |
| 3 | User control | 3 | Undo everywhere, but single 7s toast slot |
| 4 | Consistency | 2 | 01:40:00 rows vs 5h 25m totals; emerald=running, indigo=vacation |
| 5 | Error prevention | 3 | Add default draft overlaps while timer runs >1h |
| 6 | Recognition | 3 | Legend, visible S shortcut, rounding rule stated |
| 7 | Flexibility | 2 | S is the only shortcut |
| 8 | Minimalism | 2 | Today total ×4, week ×3; calendar ⅓ of page |
| 9 | Error recovery | 3 | Overlap error names clash, no suggested fix |
| 10 | Help | 2 | Make-up amount never explained |

## Detector
CLI 0 findings (11 files). Rendered light: 10 (idle timer 1.5:1, sky-600 11px 4.0:1, rose on today tile 4.3:1, inactive nav 4.3:1, straggler TimerCard:122, nested-cards ×5 WeekCard:64). Dark: 8 (active nav 3.3:1, idle timer 1.9:1). Nested-cards = deliberate day grid (design call).

## Priority Issues
- [P1] Repetition + empty idle hero: merge stat strip/timer/DailyClock into one Today hero; idle shows today's total, of target, last stopped. Dashboard.tsx:26-41, TimerCard.tsx:95-102, DailyClock.tsx. → layout
- [P1] Make-up math unexplained and off by a minute (Tue+Wed 1h33+1h33 vs 3h05; per-day minute rounding lib/week.ts:288). Largest-remainder distribution + "Why?" breakdown. → clarify / harden
- [P1] Rounding leaves no trace after the toast: keep original stop, show "rounded +5m" chip with revert on the row. TimerCard.tsx:29-55, IntervalRow.tsx. → harden
- [P2] Keyboard/SR recovery + contrast: toast Undo unreachable in time (pause on focus/hover, Z to undo), focus lost after delete/edit, role=alert re-announces per keystroke, timer aria-label on plain div, today ring == focus ring, contrast hits above. → audit
- [P2] Semantic color drift: planned make-up in rose reads as permanent debt; emerald marks running; solid indigo marks vacation; first-run week counts days before the app existed. → colorize / polish

## Persona red flags
Alex: one shortcut; late-start fix via datetime editor; 2nd delete loses 1st undo; ~22px row actions. Sam: toast after ~35 tab stops; focus dropped; calendar no roving; disabled holiday cells unfocusable; weekday progressbars lack valuetext. Author: zeros dominate idle; time left today never stated; rose always on.

## Minor
DESIGN.md week-day card still says opacity 70%; long rounding toast copy; −1h/−30m negation; muddy dark holiday cells; redundant nav aria-label; 9h 33m targets hard to hold.

## Questions
Log third behind a stopwatch? What color is "on plan"? Calendar on a glance surface?
