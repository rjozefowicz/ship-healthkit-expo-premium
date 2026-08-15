# Prompt 01 — Water Tracker

Copy everything below the line into Cursor / Claude Code / Codex.

---

## Role

You are a senior React Native / Expo engineer. Transform this **Health Stack Companion** skeleton (`packages/premium`) into a polished **Water Tracker** iOS app. Ship a product someone would actually open daily — not a demo with renamed labels.

## Product

**Aqua Stack** (working name — use until I rename branding):
- Daily hydration goal (default 2500 ml, user-editable)
- Quick-add buttons (150 / 250 / 350 / 500 ml) that write to HealthKit
- Today progress ring + streak of days meeting the goal
- 7/30-day trend of intake
- Home widget + Watch show today’s ml vs goal
- Optional “hydration session” Live Activity while user is actively logging during a workout window (simple timer label “Hydrating”)
- On-device Apple Intelligence tip based on last 14 days of water (+ optional sleep if present)

## Non-goals

- Do not add a backend, auth, or cloud sync.
- Do not remove Companion infrastructure (widget / Watch / Live Activity / App Group).
- Do not switch HealthKit libraries.
- Do not use Expo Go assumptions.

## Current skeleton (ground truth)

Extend these — do not reinvent:

| Area | Path |
|------|------|
| Metrics | `src/health/types.ts` — already has `waterMl` |
| Fetch | `src/health/fetchers.ts`, `aggregator.ts` |
| Write | `src/health/waterWrite.ts` → `saveWaterMl` |
| Store | `src/store/healthStore.ts` |
| Dashboard | `src/screens/DashboardScreen.tsx` |
| Log | `src/screens/LogScreen.tsx` |
| Charts | `src/components/charts/{Gauge,Spark,Trend}.tsx` |
| Companion snapshot | `src/companion/companionTypes.ts` (`waterMlToday`, `stepsGoal` — adapt goal for water) |
| Widget / Watch sync | `src/companion/companionBridge.ts`, `src/widget/widgetBridge.ts` |
| Session / Island | `src/session/sessionStore.ts`, `src/liveActivities/SessionActivity.tsx` |
| AI | `src/ai/buildInsightsPrompt.ts`, `src/components/AIInsightsCard.tsx` |
| Theme | `src/theme.ts` |
| Config | `src/config.ts`, `app.config.ts` |

## Requirements

### 1. Domain model

- Add `waterGoalMl` to settings (persist with AsyncStorage). Default `2500`.
- Settings UI: edit goal, optional unit display preference (`ml` | `fl oz`) — store goal in ml; convert only for display.
- Compute `streakDays`: consecutive calendar days (ending today or yesterday if today incomplete) where `waterMl >= goal`.
- Keep other HealthKit metrics available but **de-emphasize** them: Dashboard is water-first.

### 2. HealthKit

- Ensure read + write for `HKQuantityTypeIdentifierDietaryWater` (already in `READ_TYPES` / `WRITE_TYPES`).
- Quick-add must call `saveWaterMl`, then `fetchHealthData(true)`.
- Handle permission denied / Health unavailable with clear empty states.
- Log screen: water-focused quick adds; keep or slim workout write (optional secondary).

### 3. UI / navigation

- **Onboarding**: brand as water tracker; explain Health write access for logging cups.
- **Dashboard (Today)**:
  - Large gauge: today ml / goal
  - Quick-add chip row
  - Streak + “remaining today”
  - Spark/trend of last 7 days water
  - Secondary compact cards for sleep / RHR optional (small)
- **MetricDetail** for `waterMl`: goal line on trend if easy; Pro gate unchanged (7 vs full history).
- **Companion tab**: show widget/Watch preview copy for water progress; session start label “Hydrating” optional.
- **Settings**: goal editor, unit toggle, Health reconnect, RevenueCat restore.
- Visual tone: clean hydration brand — cool blues/teals via `src/theme.ts` (no purple glow aesthetic). Update copy everywhere from generic “Health Stack” starter strings to Aqua Stack.

### 4. Companion surfaces

- Update `CompanionSnapshot`:
  - Map `stepsToday`/`stepsGoal` **or** add explicit `waterMlToday` / `waterGoalMl` fields.
  - Prefer **adding** `waterGoalMl` and using existing `waterMlToday`; if native Swift `CompanionData` must stay in sync, update `native/HealthStackShared/CompanionData.swift`, widget UI (`HealthStackWidget.swift`), and Watch UI to show **ml / goal** as the primary complication/widget line.
- After every successful water write + fetch, call the existing companion sync path (`syncCompanions` / bridge) so widget + Watch update.
- Live Activity: reuse session machinery with water-themed label; showing elapsed time is enough.

### 5. Apple Intelligence

- Update `buildInsightsPrompt` to prioritize hydration adherence, streaks, and under-goal days. Mention sleep only if helpful for “consistency” framing.
- Keep on-device only (`@react-native-ai/apple`).

### 6. Monetization

- Keep RevenueCat lifetime + `ProGate` on history.
- Free: today + 7-day water history. Pro: full window + optional “export summary” not required.
- Paywall copy: longer hydration history + insights.

### 7. Quality bar

- TypeScript strict; no `any` unless unavoidable at native boundaries.
- Empty / loading / error states on Dashboard.
- Pull-to-refresh still works.
- Do not break `expo prebuild` plugins.
- After changes, list files touched and a short manual test checklist.

## Acceptance criteria

- [ ] Quick-add writes water to HealthKit and updates Dashboard within one refresh cycle
- [ ] Goal persists across app restarts
- [ ] Streak calculates correctly for consecutive goal days
- [ ] Widget / Watch snapshot includes today’s water vs goal (native Swift updated if schema changes)
- [ ] AI card prompt is hydration-specific
- [ ] App copy/theme reads as a water tracker, not a generic health boilerplate
- [ ] Pro still gates long history

## Implementation order

1. Settings goal + unit + streak helpers  
2. Dashboard / Log water-first UX  
3. Companion snapshot + Swift/widget/Watch  
4. AI prompt + theme/copy  
5. Paywall copy polish  

Start implementing now. Prefer small, coherent commits of thought; modify code directly.
