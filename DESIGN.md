---
name: Time Tracker
description: A friendly desk-side companion for logging work hours around a class schedule.
colors:
  focus-indigo: "oklch(51.1% 0.262 276.966)"
  focus-indigo-deep: "oklch(45.7% 0.24 277.023)"
  focus-indigo-bright: "oklch(58.5% 0.233 277.117)"
  focus-indigo-glow: "oklch(67.3% 0.182 276.935)"
  focus-indigo-wash: "oklch(96.2% 0.018 272.314)"
  done-emerald: "oklch(69.6% 0.17 162.48)"
  done-emerald-ink: "oklch(59.6% 0.145 163.225)"
  away-sky: "oklch(68.5% 0.169 237.323)"
  away-sky-ink: "oklch(58.8% 0.158 241.966)"
  holiday-amber: "oklch(76.9% 0.188 70.08)"
  holiday-amber-wash: "oklch(96.2% 0.059 95.617)"
  owed-rose: "oklch(58.6% 0.253 17.585)"
  owed-rose-deep: "oklch(51.4% 0.222 16.935)"
  chip-violet: "oklch(54.1% 0.281 293.009)"
  paper: "oklch(100% 0 0)"
  desk: "oklch(96.8% 0.007 247.896)"
  well: "oklch(98.4% 0.003 247.858)"
  hairline: "oklch(92.9% 0.013 255.508)"
  muted-ink: "oklch(55.4% 0.046 257.417)"
  soft-ink: "oklch(55.4% 0.046 257.417)"
  body-ink: "oklch(44.6% 0.043 257.281)"
  heading-ink: "oklch(27.9% 0.041 260.031)"
  night-desk: "oklch(20.8% 0.042 265.755)"
  night-paper: "oklch(27.9% 0.041 260.031)"
  night-hairline: "oklch(37.2% 0.044 257.287)"
  night-heading-ink: "oklch(96.8% 0.007 247.896)"
typography:
  display:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "3.75rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.05em"
    fontFeature: "\"tnum\""
  headline:
    fontFamily: "system-ui, \"Segoe UI\", Roboto, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.25
    fontFeature: "\"tnum\""
  title:
    fontFamily: "system-ui, \"Segoe UI\", Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.556
  stat:
    fontFamily: "system-ui, \"Segoe UI\", Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    lineHeight: 1.25
  body:
    fontFamily: "system-ui, \"Segoe UI\", Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "system-ui, \"Segoe UI\", Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
  micro:
    fontFamily: "system-ui, \"Segoe UI\", Roboto, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  "1": "4px"
  "1.5": "6px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
components:
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.2xl}"
    padding: "24px"
  stat-tile:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.2xl}"
    padding: "16px"
  icon-chip:
    backgroundColor: "{colors.focus-indigo-wash}"
    textColor: "{colors.focus-indigo}"
    rounded: "{rounded.lg}"
    size: "32px"
  button-primary:
    backgroundColor: "{colors.focus-indigo}"
    textColor: "{colors.paper}"
    typography: "{typography.title}"
    rounded: "{rounded.xl}"
    padding: "16px"
  button-primary-hover:
    backgroundColor: "{colors.focus-indigo-deep}"
  button-stop:
    backgroundColor: "{colors.owed-rose}"
    textColor: "{colors.paper}"
    typography: "{typography.title}"
    rounded: "{rounded.xl}"
    padding: "16px"
  button-stop-hover:
    backgroundColor: "{colors.owed-rose-deep}"
  button-small:
    backgroundColor: "{colors.focus-indigo}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
  button-ghost:
    textColor: "{colors.soft-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.body-ink}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  nav-tab:
    textColor: "{colors.soft-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "6px 16px"
  nav-tab-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.focus-indigo}"
  chip-skip:
    textColor: "{colors.away-sky-ink}"
    typography: "{typography.micro}"
    rounded: "{rounded.md}"
    padding: "2px 8px"
  badge-running:
    backgroundColor: "oklch(95% 0.052 163.051)"
    textColor: "{colors.done-emerald-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
---

# Design System: Time Tracker

## Overview

**Creative North Star: "The Desk Companion"**

Time Tracker sits in a browser tab next to you all day, so it should feel like a friendly object on the desk rather than a corporate dashboard. Soft white cards rest on a cool slate desk, each one opening with a small tinted icon chip and a plain bold title. The surface is rounded and gently lifted, and it never shouts. Warmth comes from the generous 16px corners, the color-coded icon chips and a cheerful accent indigo. The numbers stay calm and exact.

Density is moderate. The dashboard stacks a row of five stat tiles, then the timer and today's workday side by side, then the week, the calendar and today's intervals, all inside a 1024px column. A glance should answer three questions: is the timer running, how much have I done today, and how much is left this week. Big tabular numbers carry those answers, and everything else steps back into small muted text.

Color carries meaning first and decoration second. Emerald means *done or ahead*, rose means *owed or stop*, sky means *away* (out of office, classes), amber means *holiday or target*, and indigo means *the thing you're acting on now*. The heading icon chips borrow these tints freely, and violet appears only as a chip tint.

**Key Characteristics:**
- White cards (16px radius, 1px hairline border, whisper shadow) on a cool slate desk
- An icon chip before every card title, tinted to the card's subject
- Tabular, monospaced-feeling numbers as the hero of every card
- One accent (Focus Indigo) for action and progress, with semantic tints for state
- Light and dark themes of equal standing

## Colors

A cool slate neutral world with one confident indigo accent and four semantic tints that each mean exactly one thing.

### Primary
- **Focus Indigo** (`focus-indigo`): the color of action and of the current moment. It appears on the Start button, the running timer's digits, the active nav tab, in-progress bars, today's ring in the calendar, vacation days and the Save button. Hover deepens it to **Focus Indigo Deep**. In dark mode, text and icons shift to the lighter **Focus Indigo Glow** to keep contrast. **Focus Indigo Wash** is the tinted background of indigo chips and today's card in the week.

### Secondary (semantic state tints)
- **Done Emerald** (`done-emerald`, ink `done-emerald-ink`): goal reached, ahead of plan, positive carry-in, the RUNNING badge and the green top edge of a running timer card.
- **Owed Rose** (`owed-rose`, deep `owed-rose-deep`): the Stop button, hours to make up, negative carry-in and the delete hover.
- **Away Sky** (`away-sky`, ink `away-sky-ink`): out-of-office time and classes. It covers the calendar dot (filled when the class is attended, hollow when skipped), "Xh out" notes and the Skip class chip.
- **Holiday Amber** (`holiday-amber`, wash `holiday-amber-wash`): public holidays (calendar cell, party icon) and the dashed daily-target line in the monthly chart.

### Tertiary
- **Chip Violet** (`chip-violet`): a purely decorative tint for the Calendar heading's icon chip. It carries no meaning and appears nowhere else.

### Neutral
- **Desk** (`desk`): the page background behind every card. It also fills progress-bar tracks and the nav segmented control.
- **Paper** (`paper`): card and input surfaces.
- **Well** (`well`): interval rows and other inset lists inside a card.
- **Hairline** (`hairline`): card borders, input borders and chart gridlines.
- **Heading Ink** (`heading-ink`): card titles and hero numbers.
- **Body Ink** (`body-ink`): field labels and the default row text.
- **Soft Ink** (`soft-ink`): inactive nav tabs, legends and ghost buttons.
- **Muted Ink** (`muted-ink`): hints, "of 40h" sublines, timestamps and weekday headers. It is slate-500 in light mode and slate-400 in dark mode, the lightest grey that still clears 4.5:1 on Paper at 11–12px. Never go lighter for text.
- **Night Desk / Night Paper / Night Hairline / Night Heading Ink**: the dark-theme counterparts. The page is slate-900, cards are slate-800, borders are slate-700, and headings are slate-100. Semantic washes become ~40% alpha tints of the 900 shade.

### Named Rules
**The One Meaning Rule.** Each semantic tint means one thing everywhere: emerald is *done or ahead*, rose is *owed or stop*, sky is *away*, amber is *holiday or target*. Never use emerald for decoration on a number that isn't good news, and never use rose for anything that isn't a deficit or a stop.

**The Paired Theme Rule.** Every color class ships with its `dark:` partner in the same class string. A color without its dark counterpart is a bug.

## Typography

**Display Font:** the system monospace stack (`font-mono`), used only for the live timer and interval durations
**Body Font:** system-ui (with Segoe UI and Roboto fallbacks)

**Character:** one familiar system sans for everything, which keeps the tool native and quiet. A monospace face appears only where digits tick, so the clock reads like a clock.

### Hierarchy
- **Display** (800, 3.75rem, line-height 1, -0.05em tracking, tabular, monospace): the running timer, HH:MM:SS, in Focus Indigo. Only one appears per screen.
- **Headline** (800, 1.875rem, tabular): hero numbers such as "Worked today" in the workday card, "Xh left" in This week and the monthly total.
- **Title** (700, 1.125rem): card headings, always preceded by an icon chip. The Start/Stop button uses the same size and weight.
- **Stat** (800, 1.125rem, tight): values inside stat tiles.
- **Body** (400–600, 0.875rem): nav tabs, interval rows, field labels, explanatory text.
- **Label** (500, 0.75rem): stat tile labels, legends, notes under progress bars, small buttons.
- **Micro** (500, 11px): stat tile hints and the badges inside week-day cards ("2h out", "+1h make-up", "Skip class").

### Named Rules
**The Sacred Numbers Rule.** Every duration is set in tabular figures (`tabular-nums`). Totals read `Xh YYm`, compact plans read `4h` / `1h 20m`, signed balances read `+1h 00m` / `−1h 00m` with a true minus sign, and anything that ticks live reads `HH:MM:SS` in monospace. Use the formatters in `src/lib/time.ts`. Never hand-format durations.

## Layout

A single centered column (max-width 1024px, 16px side gutters) under a sticky header. The Dashboard stacks sections with 24px gaps:

1. Stat tiles: three tiles (worked today, week so far, left this week), always 3 columns, with 8px gaps on phones and 16px from 640px.
2. Timer and Today's workday: 1 column, then 2 from 768px, with 24px gaps.
3. Today's intervals: the log sits directly under the timer.
4. This week: weekday cards in 2 columns, then 5 from 640px, with 12px gaps.
5. Calendar: a 7-column Monday-first grid with 4px gaps.

Streak and PTO live on History, not the Dashboard.

Cards use 24px padding (16px for stat tiles, 12px on phones). Inside a card, the heading sits 16px above the content, and related lines stack with 4–8px. Settings and History reuse the same full-width card stack. Breakpoints are Tailwind's defaults (`sm` 640, `md` 768, `lg` 1024). Below `sm`, the nav tabs collapse to icons only.

## Elevation & Depth

A lightly lifted system. Each card combines a 1px hairline border with Tailwind's `shadow-sm`, which gives a soft whisper of lift and no drama. The two big action buttons carry a colored glow (`shadow` tinted indigo-200 or rose-200), and the chart tooltip uses `shadow-lg`. In dark mode, every colored shadow is turned off (`dark:shadow-none`). Depth there comes from the slate-900 page, slate-800 cards and slate-700 borders.

### Shadow Vocabulary
- **Card whisper** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): every card, stat tile and active nav tab.
- **Action glow** (`box-shadow: 0 1px 3px 0 <indigo-200 or rose-200>, 0 1px 2px -1px <same>`): the Start/Stop button only.
- **Floating** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): chart tooltip.

### Named Rules
**The Border-Plus-Whisper Rule.** Cards always get both the hairline border and the whisper shadow. Never use a heavier shadow to make one card more important; use content, a semantic top edge or a tint instead.

## Shapes

Soft, friendly geometry. Radii step down as elements nest: cards are 16px, the big buttons, stat icon chips and weekday cards are 12px, inputs, interval rows, nav tabs, heading icon chips and calendar cells are 8px, and small buttons and chips are 6px. Badges, progress bars, status dots and the theme switch are fully round. Progress bars are thin pills (8px tall in the workday card, 6px in weekday cards) on a Desk-colored track. Calendar cells have a fixed height (40px, 44px from 640px) so the month stays compact at any width.

## Components

### Buttons
Tactile and clear.
- **Shape:** gently rounded (12px) for the hero action, 6px for small inline actions.
- **Primary (Start interval):** full-width Focus Indigo with white 1.125rem bold text, a leading filled play icon and 16px vertical padding. Hover deepens to Focus Indigo Deep.
- **Stop (Stop interval):** the same button swapped to Owed Rose with a filled square icon. The same physical button changes meaning, never position.
- **Small (Save):** Focus Indigo with white 0.75rem medium text and 4px × 12px padding.
- **Ghost (Cancel):** Soft Ink text with no fill. Hover adds a slate-200 wash.
- **Icon buttons (edit, delete, month arrows):** bare 14–18px Lucide icons in light slate. Hover tints indigo for edit and rose for delete.

### Chips & Badges
- **Running badge:** an emerald-100 pill with emerald-700 bold uppercase 0.75rem "RUNNING" text and a pulsing 6px emerald dot.
- **Skip class chip:** an outlined chip with a 1px sky-200 border, sky-700 11px text and 6px radius. Hover adds a sky-50 wash. It toggles to "Undo skip".
- **PTO pill:** an indigo-50 pill with indigo-700 0.875rem medium text and a palm icon.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** Paper, or Night Paper in dark mode.
- **Shadow Strategy:** Border-Plus-Whisper (see Elevation).
- **Border:** 1px Hairline, or Night Hairline in dark mode.
- **Internal Padding:** 24px, or 16px for stat tiles.
- **Header:** a 32px icon chip (8px radius, a tinted wash of the subject's color with a 17px icon at stroke 2.25) followed by a bold 1.125rem title.
- **State edge:** the timer card shows a 4px emerald bar along its top edge while running.

### Stat Tile (signature)
A compact card (16px padding, 12px on phones) with a 40px rounded-12 icon chip on the left (hidden below 640px). The right side stacks a muted 0.75rem label, a heavy 1.125rem value and an optional 11px muted hint ("of 40h", "+1h 00m ahead"). Chip accents obey the One Meaning Rule. Indigo marks today and PTO (vacation). Slate is neutral and is used for the week total and the streak. "Left this week" turns emerald when ahead, rose when behind, and slate otherwise.

### Toast
A single app-wide slot, bottom-center: a slate-800 pill (slate-700 in dark mode) with white 0.875rem text, the Floating shadow and 12px radius. An optional indigo-300 action ("Undo", "Keep exact") and a dismiss button complete it. It lasts 7 seconds (10 seconds for a rounding notice), enters with a 180ms ease-out rise, and sits inside a polite live region. Every destructive or silently derived change to the log (delete, vacation toggle, stop rounding) answers with a toast that can reverse it.

### Inputs / Fields
- **Style:** a 1px Hairline border on Paper, 8px radius, 8px × 12px padding and Body Ink text. In dark mode the field is slate-900 with a slate-600 border. The label sits above the field in 0.875rem Body Ink with a 4px gap.
- **Compact (inline interval edit):** 6px radius with 4px × 8px padding and 0.75rem text.
- **Focus:** a global `:focus-visible` outline, 2px Focus Indigo (indigo-500, indigo-400 in dark mode) with a 2px offset. Text selection uses an indigo-100 wash (indigo-800 in dark mode).
- **Error:** an invalid interval draft shows a rose-600 0.75rem message beside the actions and disables Save.

### Navigation
A segmented control in the header: a Desk-colored track with 4px padding and 12px radius holds three tabs (Dashboard, History, Settings), each with a 15px icon and a 0.875rem medium label. The active tab is lifted onto Paper with Focus Indigo text and the card whisper, and inactive tabs use Soft Ink. Below 640px, only the icons show. The brand mark beside it is a 36px rounded-12 solid Focus Indigo tile with a white clock icon. The system has no gradients.

### Week Day Card (signature)
A 12px-radius bordered tile per weekday. The header shows the weekday with a muted date and an icon if the day is a holiday or vacation. Below it sit a 6px progress pill, "worked / planned" in tabular 0.75rem, and 11px colored notes ("2h out" in sky, "+1h make-up" in rose, "−30m" in emerald). The tile ends with the Skip class chip when a class falls on that day. Today's tile gets an indigo-300 border with an indigo-50/50 wash, and past tiles drop to 70% opacity.

## Do's and Don'ts

### Do:
- **Do** give every new card the Border-Plus-Whisper treatment, a 16px radius, 24px padding and an icon chip before its title.
- **Do** pair every color class with its `dark:` counterpart. Dark mode is a first-class theme, not a fallback.
- **Do** set every duration in `tabular-nums` using the `src/lib/time.ts` formatters (`Xh YYm`, `HH:MM:SS`, signed `+`/`−`).
- **Do** keep each semantic tint to its single meaning: emerald for done or ahead, rose for owed or stop, sky for away or classes, amber for holiday or target.
- **Do** use Focus Indigo for the one primary action and the current-moment indicators.
- **Do** keep explanatory text in Muted Ink at 0.75–0.875rem below the number it explains.

### Don't:
- **Don't** use emoji in the UI. Celebrate with color and copy instead (for example, emerald "Daily goal reached").
- **Don't** introduce new accent hues. Violet is permitted only as a decorative icon-chip tint.
- **Don't** add colored shadows in dark mode. Every tinted glow takes `dark:shadow-none`.
- **Don't** hand-format durations or use proportional digits for numbers that change.
- **Don't** make one card heavier than the others with a bigger shadow. Use a semantic top edge or a tint.
