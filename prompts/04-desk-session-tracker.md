# Prompt 04 — Desk Session Tracker

Copy everything below the line into Cursor / Claude Code / Codex.

---

## Role

You are a senior React Native / Expo engineer familiar with Live Activities, widgets, and WatchConnectivity. Transform this **Health Stack Companion** skeleton (`packages/premium`) into a **Desk Session / Walk Tracker** — the Companion-native showcase product (DeskWalker-shaped).

## Product

**DeskStep** (working name):
- Start a **desk walk / stand break** session from the phone
- Dynamic Island / Live Activity shows elapsed time + session label
- Ending a session can **write a walking workout** to HealthKit (existing `saveWalkingWorkout`)
- Today: steps + active session state
- Streak: days with ≥1 completed session OR steps ≥ goal
- Home widget + Watch mirror active session + today’s steps
- Companion tab is the **home** of the product (consider making it the default tab)
- Apple Intelligence: weekly movement/session adherence insight (on-device)

## Non-goals

- Don’t build a full fitness social network.
- Don’t require a real treadmill SDK.
- Keep local-first; no backend.

## Current skeleton (ground truth) — lean on this heavily

| Area | Path |
|------|------|
| Session | `src/session/sessionStore.ts` — `start/pause/resume/stop`, `syncCompanions` |
| Live Activity | `src/liveActivities/SessionActivity.tsx` |
| Workout write | `src/health/workoutWrite.ts` → `saveWalkingWorkout` |
| Companion | `src/companion/*`, `native/HealthStackShared/*`, Watch targets |
| Screens | `CompanionScreen.tsx` (primary), `DashboardScreen`, `LogScreen` |
| Steps | already in HealthKit spine |

Reference patterns also exist in repo `examples/desk-walker/` — **read for inspiration**, but implement inside `packages/premium` without copying unrelated product code wholesale.

## Requirements

### 1. Session productization

- Session labels: `Desk walk`, `Stand break`, `Outdoor walk` (picker).
- On `stop()`:
  - If duration ≥ 2 minutes, prompt: “Save to Apple Health as walk?” → `saveWalkingWorkout` with elapsed duration; estimate distance optionally (e.g. 5 km/h × hours) or omit distance.
  - Always clear Live Activity / companion active session fields.
- Pause/resume must keep Island accurate (existing pause accounting — verify and fix bugs if broken).
- Prevent overlapping sessions.

### 2. Navigation / IA

- Default tab: **Companion** (rename tab to “Session” or “Desk”).
- Dashboard: today’s steps, sessions completed today (count), weekly sessions chart (derive from local session log).
- Add lightweight `sessionLog` persisted in AsyncStorage: `{ id, label, startedAt, endedAt, durationMs, savedToHealth }[]`.
- Log screen: list recent sessions + manual water/workout secondary.

### 3. Steps + goals

- Keep steps fetch; `stepsGoal` editable in settings (default 8000 for desk workers).
- Dashboard gauge: steps vs goal; session count badge.

### 4. Companion surfaces (critical)

- Active session fields already on `CompanionSnapshot` — ensure widget + Watch show **live** label + elapsed (elapsed may be computed on native side from `activeSessionStartedAt` — verify Swift widget/Watch and improve copy).
- When no session: show steps/goal.
- After start/pause/resume/stop and after health fetch, sync bridges.
- Update native UI strings to DeskStep branding where hardcoded “Health Stack” appears in Swift.

### 5. UI / theme

- Productive, bright desk aesthetic (teal/ink — not purple). Strong CTA “Start desk walk”.
- Onboarding: explain Motion & Fitness / Health workout write + why Live Activity needs foreground start.
- Settings: steps goal, Health permissions, RevenueCat.

### 6. Apple Intelligence

- Prompt uses: steps (14d), sessionLog summary (counts/durations), goal adherence.
- Tone: energy / sedentary break coach. Not medical.

### 7. Monetization

- Free: 7-day session history list + 7-day step charts.
- Pro: full history; optional unlock of multiple session presets is fine but not required.

### 8. Quality bar

- Kill switch: if Live Activity APIs unavailable, session still works in-app.
- Don’t break App Group / plugin sync scripts.
- Document any remaining **manual Xcode** steps in a short `DESKSTEP.md` only if you change native targets (prefer not).

## Acceptance criteria

- [ ] Start → Island/Live Activity visible with label + timer behavior
- [ ] Pause/resume/stop works; stop can write HealthKit workout
- [ ] Session history persists
- [ ] Widget/Watch show active session or steps/goal
- [ ] Companion/Session is the primary tab
- [ ] AI insight references sessions + steps
- [ ] Pro gates long history

## Implementation order

1. Session log + stop→Health write  
2. IA / default tab + Dashboard stats  
3. Native companion copy + sync hardening  
4. AI + theme/paywall  

Start implementing now. Prioritize Companion reliability over extra screens.
