# Prompt 02 — HRV Tracker

Copy everything below the line into Cursor / Claude Code / Codex.

---

## Role

You are a senior React Native / Expo + HealthKit engineer. Transform this **Health Stack Companion** skeleton (`packages/premium`) into a focused **HRV Tracker** iOS app (morning recovery / readiness tone).

## Product

**Pulse Baseline** (working name):
- Track daily **Heart Rate Variability (SDNN)** from Apple Health
- Show today’s latest (or daily average) HRV in ms
- 7/30-day trend + simple baseline (rolling 14-day average)
- Flag “below baseline” vs “stable / above”
- Resting HR shown as secondary context
- Widget + Watch show latest HRV + baseline delta
- On-device Apple Intelligence explains recent HRV vs baseline in plain language (not medical advice)
- No fake HRV generation — only HealthKit samples

## Non-goals

- No ECG, no live Bluetooth sensors, no medical diagnosis claims.
- No backend. No Expo Go.
- Do not remove Companion bridges.

## Current skeleton (ground truth)

HRV is **not** wired yet. Water/steps/sleep/RHR are. Extend the spine:

| Area | Path |
|------|------|
| Types / permissions | `src/health/types.ts`, `permissions.ts` |
| Fetch / aggregate | `src/health/fetchers.ts`, `aggregator.ts` |
| Store | `src/store/healthStore.ts` |
| Screens | `DashboardScreen`, `MetricDetailScreen`, `OnboardingScreen`, `CompanionScreen` |
| Charts | `src/components/charts/*` |
| Companion | `src/companion/companionTypes.ts` + `native/HealthStackShared/CompanionData.swift` |
| AI | `src/ai/buildInsightsPrompt.ts` |

## Requirements

### 1. HealthKit — add HRV end-to-end

- Add metric key e.g. `hrvMs` to `MetricKey` and `DailySummary`.
- Read type: `HKQuantityTypeIdentifierHeartRateVariabilitySDNN` with unit **ms**.
- Add to `READ_TYPES` and request in permission flow / usage strings in `app.config.ts` HealthKit plugin if needed.
- Fetch samples in `fetchAllHealthData` (mirror `fetchQuantity` pattern used for RHR).
- Aggregate **per day**: prefer **average** of SDNN samples that day (document choice in a one-line comment). Also keep `latestHrvMs` for “most recent sample” if useful for Today.
- Overnight/morning UX: Dashboard title “Morning HRV” using today’s value if present, else yesterday’s with a clear label.

### 2. Baseline logic

- `baselineMs`: mean of available daily HRV over last 14 days with data (min 3 days or show “Building baseline…”).
- `deltaPct` or `deltaMs` vs baseline for today/yesterday.
- Status chip: `below` | `near` | `above` with simple thresholds (e.g. ±10% near).

### 3. UI

- **Onboarding**: explain HRV comes from Apple Watch / Health; not a medical device; needs read permission.
- **Dashboard**:
  - Hero: HRV ms + status vs baseline
  - Secondary: Resting HR
  - Trend spark (HRV)
  - Short education blurb (1–2 sentences, non-clinical)
- **MetricDetail** for `hrvMs`: Trend chart; Pro gate 7 vs full.
- Deprioritize steps/water on Dashboard (can remain in Log/Settings or compact row).
- Theme: calm, clinical-clean (slate + soft green signal). Rename copy to Pulse Baseline.

### 4. Companion surfaces

- Extend `CompanionSnapshot` + Swift `CompanionData` with `hrvMs` and `hrvBaselineMs` (or reuse fields carefully — **prefer explicit new fields** and update widget/Watch UI).
- Primary widget line: `HRV 42 ms · −8% vs baseline`.
- Watch: large HRV number + small baseline.
- Live Activity optional: skip unless trivial; not core to HRV.

### 5. Apple Intelligence

- Prompt must include last 14 daily HRV values, baseline, RHR if present.
- Hard rules in prompt text: “Not medical advice. Speak in recovery/lifestyle language.”
- On-device only.

### 6. Monetization

- Free: 7-day HRV history. Pro: full history + baseline detail beyond 7 days if you compute longer window only for Pro (or keep compute free, gate chart — match existing ProGate pattern).

### 7. Quality bar

- Handle days with no HRV samples (null) without crashing charts.
- Type-safe MetricKey plumbing through navigation (`MetricDetail`).
- Sync companions after fetch.
- List files changed + device test checklist.

## Acceptance criteria

- [ ] HRV permission requested; samples fetched from HealthKit when available
- [ ] Dashboard shows ms + baseline status
- [ ] MetricDetail charts HRV history with Pro gate
- [ ] Widget/Watch updated for HRV (Swift in sync)
- [ ] AI insights are HRV/recovery-focused with disclaimer
- [ ] No fabricated data when HealthKit is empty

## Implementation order

1. Types → permissions → fetch → aggregate → store  
2. Dashboard + MetricDetail  
3. Companion Swift/JS sync  
4. AI + theme/copy  

Start implementing now.
