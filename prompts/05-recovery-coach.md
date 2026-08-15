# Prompt 05 — Recovery Coach

Copy everything below the line into Cursor / Claude Code / Codex.

---

## Role

You are a senior React Native / Expo + HealthKit engineer. Transform this **Health Stack Companion** skeleton (`packages/premium`) into a **Recovery Coach** app that combines sleep, resting HR, and HRV into one morning score, with on-device Apple Intelligence as a first-class feature.

## Product

**Restline** (working name):
- Morning **Recovery Score** 0–100 from:
  - Sleep hours vs goal (weight ~40%)
  - HRV vs 14-day baseline (weight ~35%) — **add HRV pipeline if missing**
  - Resting HR vs 14-day baseline (weight ~25%; lower RHR vs baseline = better)
- Dashboard hero = score + short status (`Recovered` / `OK` / `Go easy`)
- Breakdown cards: Sleep, HRV, RHR
- Widget + Watch show score + status color
- Companion tab: AI insights card is primary; optional “Recovery check-in” Live Activity not required
- Strong disclaimers: lifestyle tool, not medical advice

## Non-goals

- No training plan generator, no nutrition, no cloud coach.
- No third-party LLM keys — Apple Intelligence on-device only.
- Don’t delete Companion bridges.

## Current skeleton (ground truth)

| Area | Path |
|------|------|
| Metrics today | steps, `sleepHours`, `restingHeartRate`, `waterMl` |
| HRV | **must add** like Prompt 02 (`HKQuantityTypeIdentifierHeartRateVariabilitySDNN`) |
| Stores / screens | `healthStore`, Dashboard, MetricDetail, Companion |
| AI | `AIInsightsCard`, `buildInsightsPrompt.ts` — elevate this |
| Companion snapshot | extend with `recoveryScore` + component metrics |
| Native | update `CompanionData.swift`, widget, Watch |

## Requirements

### 1. Data pipeline

- Add HRV (`hrvMs`) end-to-end (types, permissions, fetch, daily aggregate average, usage strings).
- Keep sleep + RHR.
- Pure function `computeRecoveryScore(input) → { score, band, parts }` in e.g. `src/health/recoveryScore.ts` with clear weighting and null-safe behavior (if a part missing, redistribute weights or mark score `partial`).
- Goals/baselines:
  - `sleepGoalHours` (default 8) in settings
  - HRV baseline = 14-day mean
  - RHR baseline = 14-day mean (improvement = below baseline)

### 2. UI

- **Onboarding**: “Morning recovery from Health data”; request needed read types; disclaimer sheet.
- **Dashboard**:
  - Large score gauge
  - Band label + one-sentence explanation (deterministic, not AI)
  - Three metric cards → MetricDetail
  - 7-day spark of recovery score (compute per day from summaries)
- **Companion tab**: AIInsightsCard at top; “How this score works” expandable.
- Deprioritize water/steps (keep accessible in Settings or secondary row).
- Theme: restorative morning light (soft gold + forest). Copy → Restline.

### 3. Companion surfaces

- `CompanionSnapshot` + Swift:
  - `recoveryScore: number | null`
  - `recoveryBand: string | null`
  - keep underlying metrics for detail if space
- Widget: big score + band.
- Watch: score complications-style large number.

### 4. Apple Intelligence (centerpiece)

- Rewrite `buildInsightsPrompt` to include:
  - today’s score + parts
  - 14-day series for sleep, HRV, RHR
  - band history
- System instructions: encouraging, non-clinical, no diagnosis, suggest only gentle lifestyle framing (sleep regularity, stress load — no medication advice).
- Graceful UI if Apple Intelligence unavailable on device.

### 5. Monetization

- Free: today score + 7-day score history.
- Pro: full history + longer AI context window of summaries (pass full Pro window into prompt only when `isPro`).

### 6. Quality bar

- Unit-test `computeRecoveryScore` with fixtures (missing HRV, short sleep, etc.) if lightweight.
- No crashes on empty Health.
- Sync companions after fetch.
- TypeScript strict.

## Acceptance criteria

- [ ] HRV added and used in score
- [ ] Score renders with breakdown and null-safe partial mode
- [ ] 7-day score spark works
- [ ] Widget/Watch show recovery score
- [ ] AI card uses recovery-focused prompt + disclaimer
- [ ] Pro gates long history / longer AI context
- [ ] App reads as Restline, not generic boilerplate

## Implementation order

1. HRV pipeline  
2. `computeRecoveryScore` + tests  
3. Dashboard  
4. Companion native  
5. AI + theme + paywall  

Start implementing now. Prefer correct scoring + empty states over decorative screens.
