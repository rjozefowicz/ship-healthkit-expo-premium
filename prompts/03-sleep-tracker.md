# Prompt 03 — Sleep Tracker

Copy everything below the line into Cursor / Claude Code / Codex.

---

## Role

You are a senior React Native / Expo + HealthKit engineer. Transform this **Health Stack Companion** skeleton (`packages/premium`) into a focused **Sleep Tracker** iOS app with strong morning UX and Companion surfaces.

## Product

**Night Arc** (working name):
- Show **last night’s sleep** as the hero metric (hours)
- Improve overnight bucketing (sleep spanning midnight)
- Sleep goal (default 8h), consistency score (stddev of duration over last 7 nights — simple)
- Bedtime / wake rough estimate from sleep samples when possible
- Optional stage breakdown **if** samples expose stage values already mapped in fetchers (asleepCore/Deep/REM/Awake) — show stacked summary when data exists; otherwise total asleep only
- Widget + Watch: last night hours + goal
- Morning Live Activity optional: “Sleep summary” session is NOT required; prefer a static widget. If you use Live Activity, only for a “Wind down” timer on Companion tab.
- On-device AI: morning note from last 14 nights (duration trend + goal adherence) — lifestyle language only

## Non-goals

- No sleep coaching prescriptions / clinical claims.
- No automatic bedtime notifications unless already trivial with existing deps (skip push for v1).
- No backend. Keep Companion stack.

## Current skeleton (ground truth)

Sleep **hours** already exist as `sleepHours` via `HKCategoryTypeIdentifierSleepAnalysis` in `src/health/fetchers.ts` (asleep values summed). Overnight bucketing is weak (sum by sample start day). Fix that as part of this prompt.

| Area | Path |
|------|------|
| Types | `src/health/types.ts` (`sleepHours`) |
| Fetch | `src/health/fetchers.ts` (`fetchSleep`) |
| Aggregate | `src/health/aggregator.ts` |
| Dashboard / detail | `DashboardScreen`, `MetricDetailScreen` |
| Companion | `companionTypes.ts`, `CompanionData.swift` |
| AI | `buildInsightsPrompt.ts` |
| Session | `sessionStore.ts` (optional wind-down) |

## Requirements

### 1. Sleep night model

- Introduce a `SleepNight` (or enrich `DailySummary`) concept:
  - `dateKey` = **wake calendar day** (morning you care about)
  - `asleepHours`
  - optional `inBedHours`
  - optional stage hours: `rem`, `deep`, `core`, `awake` when category values allow
  - `rangeStart` / `rangeEnd` ISO for the primary bout
- Rewrite aggregation so overnight sleep is attributed to the **wake day**, not fragmented across two days.
- Keep `summaries` store shape workable for charts (array by dateKey).

### 2. Settings

- `sleepGoalHours` (default 8), persisted.
- Optional “use yesterday if today empty” already implied by morning UX.

### 3. UI

- **Onboarding**: sleep-first permission story (read Sleep Analysis).
- **Dashboard**:
  - Hero: last night hours vs goal (gauge)
  - Sub: bedtime → wake window if known
  - Consistency: 7-night average + simple variance label (`steady` / `mixed`)
  - Stage chips only when data exists
  - Spark of last 7 nights
  - Secondary: RHR if present
- **MetricDetail** for sleep: trend; Pro gate.
- **Log**: de-emphasize water/workout or retitle; sleep apps rarely write sleep — skip sleep writes unless trivial; keep water optional.
- **Companion tab**: wind-down timer → Live Activity “Wind down” using existing session APIs.
- Theme: deep night blues / soft dawn accent via `theme.ts`. Copy → Night Arc.

### 4. Companion surfaces

- Snapshot primary: `sleepHoursLastNight` + add `sleepGoalHours` (extend JS + Swift + widget/Watch).
- Widget copy: `7.4h · goal 8h`.
- Watch: large hours + goal ring if layout allows.

### 5. Apple Intelligence

- Feed last 14 nights’ duration (+ goal, consistency).
- Disclaimers: not medical advice; no diagnose insomnia.
- On-device only.

### 6. Monetization

- Free: 7 nights history. Pro: full window + longer consistency context in charts.

### 7. Quality bar

- Unit tests **or** a small pure function test file for overnight bucketing if easy in-repo; otherwise document edge cases (nap-only day, no samples, multi-bout night).
- Null-safe charts.
- Companion sync after fetch.

## Acceptance criteria

- [ ] Overnight sleep appears as one night on the wake day
- [ ] Dashboard hero is last night vs goal
- [ ] Goal persists
- [ ] Widget/Watch show sleep vs goal
- [ ] Stages render only when HealthKit provides them
- [ ] AI morning note is sleep-focused
- [ ] Pro gates long history

## Implementation order

1. Sleep night aggregation fix  
2. Goal + Dashboard  
3. Companion native fields  
4. Wind-down session + AI + theme  

Start implementing now.
