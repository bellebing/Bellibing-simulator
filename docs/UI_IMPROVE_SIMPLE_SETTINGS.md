# Improve Simple Settings — Valuable Stats v2

Draft PR #224, for desktop visual review. Only Valuable Stats changes in this slice. Gate remains +5 / +10 / +15 / +20 / +25. Roll Quality remains All Rolls / Mid+ / High+, with numeric threshold mapping **PENDING**.

## Presentation and interaction

The account-owned Character selector is followed by Improve Settings and the existing workspace, in normal vertical document flow at the same width. The selector's full hover envelope and motion-aware clearance remain intact. Cards/workspace retain their dimensions. One inline choice area opens at a time, pushes content down and uses the existing 320ms weighted transition. Escape closes it and restores trigger focus; reduced motion uses a short opacity transition. No native select, floating menu, popover or internally scrolling option list is introduced.

Collapsed Valuable Stats shows **N of M selected**: N is Active count; M is the current verified available source pool size. Expanded content has ordering mode controls, then a vertical **Active** list followed by **Available**. Activating appends to Active; deactivating returns the stat to Available in neutral source order. The groups are disjoint. Selection stays inline and open for repeated edits. There is no separate count setting or count control.

Any selection or order customization enters **Manual**. Active rows can be dragged vertically; labeled Move up / Move down buttons provide the keyboard alternative. Reordering changes only Active, never the canonical source pool. Focus follows the same action after render, falling back to that stat's selection button when the move action reaches a disabled boundary.

**Reset to Recommended**, or choosing Recommended mode, discards the current manual selection/order and restores the current source-backed baseline. Gate and Roll Quality are preserved. Current verified sources supply no v2 default selected set, so Recommended Active is empty: **0 of M selected**. Explicitly choosing Manual can retain that empty selection.

## Source and ranking boundary

`src/improveSettingsProjection.ts` continues to join RELEASED Characters to `PROFILE_REGISTRY` through `getDefaultBuildPreset()` and the existing VERIFIED `StatTargetProfile`. Exact canonical names, conditional notes, profile identities and provenance are exported. Current availability is **44 READY / 13 PENDING** Characters. No Character stat names are hardcoded in the UI.

Source review inspected `src/profileDomain.ts#TargetStatRule`, `src/data/statTargetProfiles.ts`, the registry/default presets and the separate `targetCheckpointPolicy.ts` roll policy. Reviewed target priorities are **build-guide priorities**, with ties and conditional ER-until-satisfied rules. They do not verify an unconditional Valuable Stats v2 DPR order or default Active selection. Augusta's historical Core/Useful stopping policy is a different contract and does not establish v2 defaults. Applying conditional ER rules would require the deferred build/ER logic. Consequently **recommendedOrderStatus: PENDING** for all Characters. Available uses canonical/source order only as stable neutral display order; no weights, DPR values, tier mapping or gameplay evaluation are inferred. The UI explicitly says Recommended ranking is pending.

## Versioned state, persistence and migration

`src/improveSimpleSettings.mjs` owns presentation state and the storage boundary; the generated browser module is checked for exact parity. Detached `window.bellibingImproveSettings.getState()` exposes schema version 2, Character identity, Gate, Roll Quality/status, and Valuable Stats version, source status/binding, preset/profile IDs, ordering mode, recommended-order status, ordered `activeStats` and derived `availableStats`. No legacy count field is present in v2 runtime state.

The new key is **bellibing.improve.simple-settings.v2**. The envelope has version 2 and independent Character records. Binding includes Character, preset/profile, provenance and the exact pool/conditional notes. Reload and switching restore each Character independently. Invalid names/duplicates are removed while preserving valid manual order. Any binding drift resets Valuable Stats to the current empty Recommended baseline while preserving valid Gate/Quality.

Explicit v1 → v2 migration:

- Read **bellibing.improve.simple-settings.v1** only when no v2 envelope exists. Keep that legacy key untouched as a recovery copy.
- Preserve valid Gate and Roll Quality for every Character; invalid labels normalize to +5 / All Rolls.
- Discard old stat selections and the old count. A v1 selected pool was eligibility for a required-hit policy, not an explicit v2 Active set; even an identical saved profile binding cannot prove equivalent semantics. Never reinterpret the old count.
- Migrate each Character when its verified source becomes available. Until then, keep its original v1 record under `pendingV1Characters` in the v2 envelope; Gate/Quality edits update those labels without removing its legacy data. Unvisited Characters remain independent deferred records.
- During a temporary source failure, live Valuable Stats is PENDING with no Active/Available pool. Retain an existing valid saved v2 binding/order separately while persisting Gate/Quality edits; source recovery restores it. Do not persist the masked live selection over the saved one.
- Storage write failure shows an explicit save notice and does not falsely mark the in-memory storage record committed.

Settings never write account-owned equipment, saved Character builds, Candidate, or evaluator policy. The accepted Improve Character Build, Current/New Stats, Dynamic Live Build Helper, Current/Candidate Echoes, five equipped Echoes and Echo Workspace remain unchanged. No Advanced Settings, tier/ER/ranking engine, DPR calculation or mobile adaptation is included.

## Verification

Focused state/source/storage tests cover exact source parity, 0-of-M baseline, activate/deactivate/append/Manual, reorder/reset, v1 migration, Character isolation/reload, profile/provenance/note/pool drift, invalid names and temporary source outage recovery with Gate/Quality edits.

The existing real-Chrome Improve harness covers physical activation and vertical drag, keyboard reorder/focus, empty/reset states, one accessible inline expansion, normal layout displacement, Gate/Quality options, source failure/recovery, v1 migration and binding drift. Desktop matrix: **1440×900 / 1920×1080 / 2560×1440**, with collapsed, empty/Active Valuable Stats and hover-expanded screenshots. Fresh-account review and unchanged Candidate/Echo Workspace checks remain required. Full tests, strict build, whitespace and exact-head repository Verify remain required. Final head/run/result evidence belongs on PR #224 and the external AI Handoff.

Stop for visual review. Keep PR #224 OPEN / DRAFT / UNMERGED. Do not start another slice.
