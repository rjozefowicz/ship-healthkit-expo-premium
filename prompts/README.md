# Companion build prompts

Five ready-to-paste prompts that turn this Health Stack Companion skeleton into a focused shipping example.

## How to use

1. Open this repo (`packages/premium`) in Cursor, Claude Code, or Codex.
2. Copy **one entire** prompt file below into the agent.
3. Let it implement end-to-end, then run on a **physical iPhone**.
4. Rename branding (`com.example.healthstack`, App Group, scheme) before store submission.

| # | Prompt | Product |
|---|--------|---------|
| 01 | [Water Tracker](./01-water-tracker.md) | Hydration goal, quick-add, widget/Watch progress |
| 02 | [HRV Tracker](./02-hrv-tracker.md) | Heart-rate variability (SDNN), trends, recovery tone |
| 03 | [Sleep Tracker](./03-sleep-tracker.md) | Overnight sleep, consistency, morning summary |
| 04 | [Desk Session](./04-desk-session-tracker.md) | Walk/stand sessions → Island + Watch + HealthKit write |
| 05 | [Recovery Coach](./05-recovery-coach.md) | Sleep + RHR + HRV + on-device AI coaching |

## Shared ground rules (already embedded in each prompt)

- Keep Expo SDK 55 + `@kingstinct/react-native-healthkit` + Zustand + RevenueCat.
- Preserve Companion bridges: widget, WatchConnectivity, Live Activities, App Group.
- Prefer extending existing files over inventing a parallel architecture.
- Free users: 7-day history; Pro: full history (existing `ProGate`).
- No Expo Go — custom dev client only.
