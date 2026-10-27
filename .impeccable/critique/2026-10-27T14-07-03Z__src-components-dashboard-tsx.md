---
target: src/components/Dashboard.tsx
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:/Users/martins/Desktop/projects/time_tracker/src/components/Dashboard.tsx"
target_fingerprint: "sha256:9dc35e4ce6766bfeb879eefd522c3003b810efbe5a4adb833f1160c3b7ba3a99"
target_path: /Users/martins/Desktop/projects/time_tracker/src/components/Dashboard.tsx
timestamp: 2026-10-27T14-07-03Z
slug: src-components-dashboard-tsx
closed: true
---
Method: dual-agent (A: design review · B: detector). Both source-only; no browser available (Chrome extension not connected).

## Design Health Score — 23/40 (Acceptable)
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of status | 3 | Tab title never changes |
| 2 | Match real world | 3 | "−30m" unlabeled on day card |
| 3 | User control | 1 | Delete instant, no undo; no add-interval UI |
| 4 | Consistency | 2 | One Meaning violations, emoji |
| 5 | Error prevention | 2 | No end>start validation; calendar misclick changes target |
| 6 | Recognition | 3 | Calendar detail only in tooltips |
| 7 | Flexibility | 1 | No keyboard shortcuts |
| 8 | Minimalism | 2 | Figures repeated 3-4×; idle 00:00:00 as hero |
| 9 | Error recovery | 2 | No error states |
| 10 | Help | 4 | Inline math explanations |

## Specificity
Half authored (WeekCard: skip class, make-up, carry-in), half template (5 KPI tiles, gradient logo, streak). Detector: 0 findings across 9 files.

## Priority Issues
- [P0] Log can't be fully corrected/protected: delete with no undo (IntervalRow.tsx:113), addManual unused (useIntervals.ts:52), no end>start validation (IntervalRow.tsx:28). Fix: undo toast, Add interval button, inline validation. → harden
- [P1] Stop silently rounds end time (TimerCard.tsx:18). Fix: transient "Rounded 7h 52m → 8h 00m · Undo", shorten helper text. → clarify
- [P1] Glanceability: no document.title, idle 00:00:00 hero, triplicated numbers. Fix: live tab title, idle timer shows today/target, trim tiles, move Streak/PTO. → layout
- [P2] One Meaning violations + emoji: DailyClock.tsx:55, :67; Dashboard.tsx:37,40; WeekCard "−30m"; Calendar.tsx:122/125 indigo collision. → polish
- [P2] A11y: icon buttons without aria-label, no focus styles, no aria-current, calendar cells announce number only, slate-400 11px ≈2.6:1. → audit

## Persona red flags
Alex: no start/stop shortcut; two datetime pickers per edit; hidden "go to today". Sam: no focus rings; progressbars unlabeled; filled vs hollow dot; "Skip class" ×5 without day. Author: blank tab; log is last card; no interval total; cross-midnight intervals filtered by start date.

## Minor
Calendar new Date() vs useNow; PTO shown twice with different years; unstyled "running" row; opacity-70 on 11px text; lone gradient; locale [] vs en-GB.

## Questions
Tab title vs 5 tiles? Calendar on dashboard? Intervals as hero next to timer?
