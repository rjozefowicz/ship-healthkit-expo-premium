# Health Stack Companion (Premium)

Everything in **Basic**, plus Apple companion surfaces (Path A / DeskWalker-style):

- Dynamic Island / Live Activities (`expo-widgets` Live Activity shell only)
- Native home-screen widget (Swift in `ExpoWidgetsTarget` + `WidgetDataBridge`)
- watchOS companion (`HealthStackWatch` + `WatchConnectivity`)
- On-device Apple Intelligence insights (no BYOK)

Xcode targets (same shape as DeskWalker):

- **HealthStackCompanion** — `com.example.healthstack`
- **ExpoWidgetsTarget** — `com.example.healthstack.widgets` (native widget + Live Activity)
- **HealthStackWatch** — `com.example.healthstack.watchkitapp`

## Quick start

```bash
cd packages/premium
npm install
npx expo prebuild --platform ios --clean --no-install
node scripts/post-prebuild-ios.js
npx expo run:ios
```

`ios/` is part of the repo (Pods stay gitignored). After a **clean** prebuild, always run `scripts/post-prebuild-ios.js` so the native widget is injected into `ExpoWidgetsTarget/index.swift` and the Watch target is re-linked.

EAS local/cloud uses the same sequence via `eas.json` `prebuildCommand` — do not skip it, or Expo will regenerate `ios/` without the Swift widget / Watch target.

The home-screen widget is native Swift (`native/HealthStackShared/HealthStackWidget.swift`), fed by JS through `WidgetDataBridge` (App Group `group.com.example.healthstack`). After install: long-press Home Screen → Add Widget → **Health Stack**.

Live Activity UI stays in `src/liveActivities/SessionActivity.tsx`. Do **not** add a `widgets[]` entry in `expo-widgets` for the home-screen widget.

## App tab: Companion

- Start/pause/end a demo walk session → Dynamic Island
- **Push widget + Watch** after HealthKit fetch
- Apple Intelligence card analyses last 14 days of summaries

## Rename for your product

| Placeholder | Change to |
|---|---|
| `com.example.healthstack` | your bundle id |
| `com.example.healthstack.widgets` | widget extension id |
| `com.example.healthstack.watchkitapp` | Watch id |
| `group.com.example.healthstack` | App Group (`app.config.ts`, Swift bridges, `CompanionDataLoader`) |
| `healthstack://` | your URL scheme |

## i18n

Same as Basic: `src/i18n/locales/` (`en`, `es`) + Settings language picker. Companion / Apple Intelligence strings are included.

## Layout

```
src/          # JS (widgetBridge + Live Activity + app)
native/       # Swift sources of truth (copied into ios/ on prebuild)
ios/          # committed Xcode project (app + ExpoWidgetsTarget + Watch)
plugins/      # inject native widget + copy/link targets after expo-widgets
```

Reference implementation: `examples/desk-walker/mobile`.

## Build prompts (Companion)

Five paste-ready Cursor / Claude Code / Codex prompts that reshape this skeleton into a focused app:

→ [`prompts/README.md`](./prompts/README.md)

| Prompt | App |
|--------|-----|
| Water Tracker | Hydration goal, quick-add, widget progress |
| HRV Tracker | SDNN + baseline |
| Sleep Tracker | Overnight nights + goal |
| Desk Session | Island + Watch + HealthKit workout write |
| Recovery Coach | Sleep + HRV + RHR score + on-device AI |
