# Improve Simple Settings

First UI/interaction slice, based on canonical main `b2c160333c4391988f02ae01fab5309791e47bd4`. Draft for desktop visual review.

## Presentation and interaction

The account-owned Character selector is followed by **Improve Settings**, then the existing Improve workspace. The Improve shell reserves the selector's complete 250px hover envelope plus a 16px gap, and follows its actual rendered bounds during entrance/hover motion. Card sizes and selector motion remain unchanged. Settings and workspace share a normal vertical document flow, the same width and the existing glass panel treatment. The larger composition scrolls vertically at 1440×900; the workspace and its contents retain their sizes.

Three compact controls expose component-local choices. Only one choice area is open at a time. Expansion pushes the workspace down using the 320ms Bellibing weighted panel transition. Selection closes the choice area and restores focus to its trigger. Escape also closes it. Reduced motion uses a short opacity transition. There are no native selects, popovers, floating lists or internally scrolling option menus.

- **Gate:** +5, +10, +15, +20, +25. Initial UI selection: +5. No gate mechanics are attached.
- **Valuable Stats:** selectable chips for the current profile's available stats, followed by required-count buttons. Chips change the selected pool; choosing a count commits it and closes the area. The summary is the actual required count out of the actual selected pool. Initially the count is unset (`Choose`), so no suggested requirement is fabricated. Removing too many stats clears an invalid count. Count capacity reuses the canonical Echo Stats Editor maximum.
- **Roll Quality:** All Rolls, Mid+, High+. Initial UI selection: All Rolls. Threshold mapping remains explicitly Pending.

## Source boundary

`src/improveSettingsProjection.ts` joins each RELEASED Character to the existing `PROFILE_REGISTRY` default UI-selectable preset and its `StatTargetProfile`. Both preset and target profile must be VERIFIED. It exports exact canonical target-rule stat names, conditional notes, profile identity and provenance. It does not derive a new rank, weight, stat priority, ER-satisfaction decision or profile.

The current projection has **44 READY / 13 PENDING** Characters. Augusta's five available names come from `augusta-recommended-targets-v915-current`; they are not hardcoded in the UI. The projection also supports the other current profiles, including HP/DEF stat families. Missing/unverified profiles and failed source loading show Pending and supply no count or invented pool. The generated source is checked by the strict build.

Canonical roll values exist in `src/echoCoreRules.ts` (`ROLL_VALUES`), exposed through the existing Echo Stats Editor. They do **not** define universal `All Rolls` / `Mid+` / `High+` tier cutoffs. The legacy Augusta V9.15 minimums are a separate policy and are not reused as those presets. This slice stores the selected label and `rollQualityMappingStatus: PENDING`, without numeric thresholds.

## State and integration

`src/improveSimpleSettings.mjs` owns only presentation settings. Its generated browser copy is checked for parity. `window.bellibingImproveSettings.getState()` returns a detached snapshot with Character identity, gate, selected stat names, required count, profile binding and roll-quality preset/status. A future consumer must respect Pending and an unset required count.

The UI stores per-Character settings under `bellibing.improve.simple-settings.v1`, separately from saved Character builds and the transient Candidate. Switching Characters closes choices and restores their settings; reload also restores them. Changed profile/pool bindings clear the old count/configuration. A temporary source outage keeps the live view Pending while retaining the saved configuration for recovery.

The accepted Improve card, Dynamic Live Build Helper, Current/New Stats, five equipped Echoes, Candidate and shared Echo Workspace keep their current behavior. Settings do not feed them gameplay decisions. The shared Character loader now distinguishes a pending request from READY (57) and ERROR; failure provides a reload instruction. No Build redesign, Advanced Settings, evaluator, scoring, probabilities, tuner forecasting, DPS or Team logic are included.

## Verification

- Six focused source/state tests, included in the full **1203/1203** passing test suite.
- Strict web build checks exact generated source/state parity; whitespace check passes.
- `verify-v34-improve-settings.mjs` runs through the existing real-Chrome Echo Workspace harness. It covers compact width, inline layout movement, every available option, actual state summaries, one accessible open area, hover collision, two different source pools, Pending, isolated persistence, source-failure recovery, keyboard focus and reduced motion.
- Desktop matrix: **1440×900**, **1920×1080**, **2560×1440**. Captures include collapsed, Valuable Stats expanded and Character hover-expanded states. The existing Candidate suite scrolls to the unchanged workspace and verifies its layout/ownership/commit behavior at the same sizes.
- `verify-v34-account-review.mjs` runs first in a fresh Chrome profile. It physically navigates empty Improve → Build → Augusta → S1 → Add to Account → Improve → Simple Settings; tests paused/failed/recovered manifest loading; samples entrance/hover collision every frame; checks unchanged equipment and Candidate ownership.
- The headless launcher declares desktop pointer capabilities, matching [Playwright's Chromium launch configuration](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/chromium/chromium.ts). The test asserts `(hover:hover)` and `(pointer:fine)` before physical mouse input; activation failures and geometry failures have separate diagnostics.
- Full Verify and Export use the exact PR head. Functional review uses the built `bellibing-web-dist` artifact: extract it and run `START_UI_PREVIEW.bat`. Its PowerShell server serves directory indexes and `.mjs` modules. `review-build.json` identifies the head and dirty state. Rawcdn source HTML and the seeded layout query do not establish functional account-flow acceptance. Exact remote head/run/result belongs on the draft PR and external AI Handoff.

The repaired implementation passed [full Verify #1758](https://github.com/bellebing/Bellibing-simulator/actions/runs/36964129738) and [Export #1480](https://github.com/bellebing/Bellibing-simulator/actions/runs/36964129740), including 1203/1203 tests, strict build and every browser gate. The draft PR records the final documentation head and its checks.

Stop for user review. No merge is authorized.
