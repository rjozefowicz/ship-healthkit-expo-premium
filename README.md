# Health Stack Companion (Premium)

Everything in **Basic**, plus Apple companion surfaces (Path A / DeskWalker-style):

- Dynamic Island / Live Activities (`expo-widgets`)
- Home-screen widget (App Group + `WidgetDataBridge`)
- watchOS companion (`WatchConnectivity`)
- On-device Apple Intelligence insights (no BYOK)

## Quick start

```bash
cd packages/premium
npm install
npx expo prebuild --platform ios
# plugins copy native/ → ios/ and patch ExpoWidgetsTarget
npx expo run:ios --device
```

Then finish Xcode linking (first time / after clean prebuild):

1. **Main app target** — add to Compile Sources:
   - `HealthStack/WidgetDataBridge.swift` + `.m`
   - `HealthStack/WatchConnectivityBridge.swift` + `.m`
2. **App Groups** on main app, widgets, and Watch: `group.com.example.healthstack`
3. **ExpoWidgetsTarget** — add `HealthStackShared/*.swift` to Compile Sources
4. **Watch target** — create `HealthStackWatch` watchOS app, embed in iPhone app, compile:
   - `HealthStackWatch/**`
   - `HealthStackShared/CompanionData.swift`
5. Bridging header / New Architecture: ensure RCT bridges are visible (same pattern as DeskWalker)

Live Activity UI comes from `src/liveActivities/SessionActivity.tsx` via `expo-widgets` (no extra Xcode file for Island).

## App tab: Companion

- Start/pause/end a demo walk session → Dynamic Island
- **Push widget + Watch** after HealthKit fetch
- Apple Intelligence card analyses last 14 days of summaries

## Rename for your product

| Placeholder | Change to |
|---|---|
| `com.example.healthstack` | your bundle id |
| `group.com.example.healthstack` | your App Group (keep in sync in `app.config.ts`, Swift bridges, `CompanionDataLoader`) |
| `healthstack://` | your URL scheme |

## i18n

Same as Basic: `src/i18n/locales/` (`en`, `es`) + Settings language picker. Companion / Apple Intelligence strings are included.

## Layout

```
src/          # JS (Basic + companion/session/ai/liveActivities)
native/       # Swift templates synced into ios/ by withCompanionNative
plugins/      # expo-widgets inject + native sync
```

Reference implementation: `examples/desk-walker/mobile` (full production Path A).

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
# ship-healthkit-expo-premium
