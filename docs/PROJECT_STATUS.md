# Bellibing Simulator — Current Project Status

This document is the current implementation and roadmap checkpoint for Bellibing Simulator. Detailed pre-2026-08-29 chronology lives in [`PROJECT_STATUS_HISTORY_2026-08-29.md`](PROJECT_STATUS_HISTORY_2026-08-29.md) and Git history.

`FOUNDATION` means architecture exists and is tested but supported-content coverage is incomplete.  
`COMPLETE` means the layer has the data/behavior required for its supported scope with no known blocking gap.  
`BLOCKED` means a known gap prevents that layer from being called complete.

Bellibing has **not** passed the full Pre-DPS Completeness Gate. Broad roster-wide Character DPS remains blocked. Narrow vertical slices may become `DPS_READY` only after their exact source, execution and freeze requirements close.

## Current baseline

Live registry-derived readiness on this tranche head is:

- **24 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **28 `PROFILE_SOURCE_PENDING`**;
- **2 `DPS_READY`** — Augusta and Ciaccona.

Canonical backward-impact / execution inventory is:

- **18 backward-impact reviews**;
- **18 reviewed canonical profiles**;
- **16 profiles with pending execution dependencies**;
- **72 exact pending execution edges**.

The Ciaccona closure removes four exact edges from the previous 76-edge matrix: Woodland Aria `WA-AERO`, Woodland Aria `WA-AERO-RES`, Cartethyia Defier's Thorn `DT-AERO-AMP`, and the Ciaccona rotation engine-model dependency. Cartethyia remains pending on exactly two dependencies: Defier's Thorn `DT-DEF` source timing semantics and its profile-specific rotation engine model.

## Architecture boundary

Preserve the separation between:

1. raw game/source data;
2. Character Mechanics;
3. Weapon/Echo/Sonata effects;
4. composable profiles/recommendations;
5. execution/combat-DPS logic;
6. UI.

The old V9.15 spreadsheet is a historical oracle only when explicitly needed. It is not the current architecture. `SOURCE_SEQUENCE_ONLY` never becomes executable by assumption, and profile-specific execution coverage does not mutate raw Character Mechanics source status.

## Source coverage

### Characters

- 60 Character records; 57 `RELEASED`.
- Raw/static blockers remain Qingxiao `maxEnergy`, Rover (Electro) `maxEnergy`, Suisui `maxEnergy` and Mornye DEF%.
- Character Mechanics source review: **54 VERIFIED / 3 SOURCE_BLOCKED / 1866 canonical facts**.
- Mechanics blockers remain Buling, Danjin and Xiangli Yao.

### Weapons

- **121 / 121 released Weapons** have source-audited effect coverage across **236 effect rows**.
- Conditional trigger/state/stack/target semantics remain separate execution concerns; source text never implies automatic uptime.

### Echo / Sonata

- **181 / 181 released Echoes** verified current for stable identity/COST/Sonata membership.
- **34 / 34 released Sonata sets** verified current.
- Sonata Effect review: **62 / 62 activation tuples / 86 source-backed rows**.
- Freezing Frost 5pc and Havoc Eclipse 5pc remain explicit source conflicts.
- **181 / 181 released Echo skills** are source-reviewed.
- Echo non-damage effect coverage remains **63 modeled rows across 37 Echoes** with **6 specialized pending adapter facts**.
- The exact Rank-5 Echo attack catalog is now **4 attack profiles / 5 attack facts**. Reminiscence: Fleurdelys is the new exact profile: pinned Rank-5 source proves `27.36% x8 + 136.80%` Aero damage. Active damage stays partial where exact scaling/hit/state execution is not verified.

## Composable profiles

Independent Weapon Recommendation, Echo Loadout, Stat Target, Team, Rotation and Character Preset catalogs are live and cross-validated.

The candidate/profile pipeline remains fail closed:

- extraction/staging cannot approve semantic truth;
- source extraction and semantic review remain separate;
- `SOURCE_SEQUENCE_ONLY` never implies timing or uptime;
- readiness is derived from live registries;
- ambiguous source truth remains pending instead of receiving defaults.

Historical Cohort 01 source closure and its seven promoted canonical defaults remain unchanged. Lucilla Glacio Chafe, Lucilla Echo Skill and Rover (Havoc) Quick Swap remain deliberately default-blocked rather than receiving fabricated mode semantics.

## Shared execution primitives and exact dependency closure

The Profile × Adapter matrix is a prioritization tool only. Matching suffixes are not semantic proof and never authorize `ENGINE_MODELED`, freeze approval or `DPS_READY`.

`src/data/profileExecutionClosures20260830.ts` applies fail-closed closures only when the exact expected pending ID still exists on the exact expected preset. Reapplying or drifting a closure throws instead of silently hiding work.

### Fleurdelys character restriction

`echo-character-restriction-v1` remains the static source-safe Fleurdelys applicability closure for `cartethyia` and `rover-aero`. The exact Fleurdelys character-restriction dependency is closed for Cartethyia and Rover (Aero); active Echo damage remains a separate boundary.

### Exact Echo active damage — current closure checkpoint

`src/combat/echoActiveDamageAdapter.ts` now provides `echo-active-damage-v1`, a reusable fail-closed resolver from exact `EchoAttackFact` data to engine-ready active-cast damage facts.

The primitive deliberately proves only:

- the exact owning Echo and attack ID;
- `ACTIVE_CAST` trigger identity;
- element and scaling stat;
- exact total motion value from verified attack components.

It does **not** invent a cast timestamp, uptime, profile rotation, or cast variant. Automatic Intro summons are rejected as active casts.

Reminiscence: Fleurdelys now has exact Rank-5 attack data from the already-pinned `wuwabuild` Echo snapshot: eight `27.36% ATK` Aero hits plus one `136.80% ATK` Aero hit, totaling `355.68% ATK` motion value with a 20-second cooldown.

This is prerequisite execution coverage, not a profile closure. Rover (Aero)'s exact `echo:echo-60001065:active-skill-damage-adapter` dependency remains pending until its eventual executable rotation proves the source-listed Fleurdelys cast event. The work-queue disposition therefore remains unchanged at this checkpoint.

### Aero Erosion target state — implemented for the active closure tranche

`src/combat/aeroErosionTargetState.ts` now owns a shared ordered Aero Erosion target/application state for the Cartethyia + Ciaccona closure tranche.

The primitive deliberately does **not** fabricate:

- generic Aero Erosion tick damage;
- stack damage scaling;
- refresh cadence;
- arbitrary per-stack expiration behavior;
- profile-independent default uptime.

It records only source-proven application state and conservative persistence needed by the supported short rotation.

`src/combat/aeroErosionWeaponAdapter.ts` uses that shared state for:

- Woodland Aria `WA-AERO` self Aero DMG after a proven Aero Erosion application;
- Woodland Aria `WA-AERO-RES` target Aero RES reduction after a later hit on a target already affected by Aero Erosion;
- Defier's Thorn `DT-AERO-AMP` target-state amplification when the target is proven Aero-Eroded.

The adapter intentionally gives no same-hit benefit where source ordering is not explicit.

### Ciaccona engine model — closed

`CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1` executes the reviewed fast Ciaccona sequence:

`Intro -> Basic P3 -> Basic P4 -> Jump cancel -> Mid-air P1 -> Mid-air P2 -> Basic P4 -> Skill cancel -> Quadruple Downbeat -> Ultimate -> Outro`.

The current source review supplies **4.5 seconds** for this fixed calculation rotation. Bellibing uses 4.5 only as total rotation duration and does not invent per-action timestamps.

The engine executes source-backed direct-hit mechanics and state needed by this exact path:

- canonical Lv1-Lv10 Character motion-value structures;
- Musical Essence generation, requirement and consumption;
- the P4 Jump-cancel / Ensemble Sylph / Solo Concert path;
- Aero Erosion application state;
- Woodland Aria Aero bonus and target Aero RES reduction;
- Gusts of Welkin Aero windows;
- Winds of Rinascita's Quadruple Downbeat bonus.

Periodic/optional Symphonic Poem: Tonic events are outside the fixed sequence and are not fabricated.

The Ciaccona backward-impact review now has **zero pending execution IDs**. Its canonical rotation is `ENGINE_MODELED`, BuildContext resolves to `CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1`, and the explicit freeze row makes `ciaccona-cartethyia-aero` the second narrow `DPS_READY` profile.

Supported freeze scope is S0 Ciaccona / Woodland Aria R1 / Gusts of Welkin + Nightmare: Kelpie / Cartethyia + Rover (Aero) / the fixed 4.5s personal direct-hit rotation. This does not imply broad team DPS, arbitrary rotations, Kelpie active damage, or generic Aero Erosion system-DMG execution.

### Cartethyia closure state — source-blocked, not guessed

Cartethyia concretely moved closer to freeze but does **not** become DPS-ready.

Closed in this tranche:

- Fleurdelys character restriction — previously closed;
- Defier's Thorn `DT-AERO-AMP` — now backed by shared Aero Erosion target state.

Still pending:

1. `weapon:defiers-thorn:DT-DEF:source-timing-adapter` — **BLOCKED_SOURCE_SEMANTICS / BUG-011**. Current sources preserve the clause “15s after casting Intro Skill or Basic Attacks” without unambiguously defining delay versus active-window semantics. Bellibing does not manufacture duration/uptime.
2. `rotation:cartethyia-basic-ciaccona-rover-aero:engine-model` — the exact source sequence is verified, but no exact source-backed total duration for that sequence is established. The statement that the rotation works with 14-second Outro buffs is an upper compatibility bound, not proof of a 14.0s rotation.

The Cartethyia rotation therefore remains `SOURCE_SEQUENCE_ONLY`.

### Existing execution blockers

- **BUG-008 — Impermanence Heron transfer:** `BLOCKED_SOURCE_CONFLICT`; hit-armed versus cancel/cast-armed evidence remains conflicting.
- **BUG-009 — Stringmaster / Rime-Draped Sprouts skill-stack lifetime:** `BLOCKED_SOURCE_SEMANTICS`; refresh/shared-duration versus independent stack expiry remains unspecified.
- **BUG-010 — Fallacy profile cast variant:** `BLOCKED_SOURCE_SEMANTICS`; supported rotations do not identify normal/tap versus hold/release execution.
- **BUG-011 — Defier's Thorn `DT-DEF`:** `BLOCKED_SOURCE_SEMANTICS`; timing grammar remains ambiguous.

No blocked dependency is implemented by assumption.

## Semantic execution work queue

`src/profileExecutionWorkQueue.ts` classifies the current exact pending edges without authorizing execution.

Current regression target after this tranche is:

- **36 `UNREVIEWED`**;
- **0 `SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING`**;
- **9 `PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE`**;
- **5 `BLOCKED_SOURCE_CONFLICT`** — BUG-008 fanout;
- **6 `BLOCKED_SOURCE_SEMANTICS`** — BUG-009, BUG-010 and BUG-011 fanout;
- **16 `PROFILE_SPECIFIC_EXECUTION`** — remaining rotation engine models.

That leaves **36 actionable shared edges** out of **72 exact pending edges**. The current highest actionable shared group remains `sonata:trigger-stack-adapter` at 2 profiles / 2 Characters / 2 exact dependencies, but future work should optimize for shortest verified DPS-ready closure and dependency overlap rather than blindly consuming this queue in order.

See [`DPS_EXECUTION_GAP_MATRIX.md`](DPS_EXECUTION_GAP_MATRIX.md) for the readable dependency view; it is descriptive and does not authorize execution.

## DPS execution

There are now two narrow freeze-approved execution fixtures on this tranche head:

- **Augusta — `augusta-standard` / `AUGUSTA_STD_V1`**;
- **Ciaccona — `ciaccona-cartethyia-aero` / `CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1`**.

Freeze approval requires the exact supported path to have:

1. canonical verified profile truth;
2. current backward-impact review;
3. zero unresolved pending execution IDs;
4. independently implemented and tested execution adapters;
5. an `ENGINE_MODELED` rotation where DPS is claimed;
6. a verified BuildContext bridge;
7. normal repository audits/tests/build/browser verification.

This does not imply arbitrary teams, teammate DPS or broad roster execution.

## Echo Core / Echo Lab / Roll Assist

- **Echo Core — COMPLETE FOR ELIGIBLE-CANDIDATE TUNING.** Rank-5 pools, progression, substats, roll distributions, tuning costs, recovery, seeded reproduction and COST-12 validation remain implemented and tested.
- **Echo Lab — COMPLETE FOR MECHANICAL ORACLE.** It consumes the shared Echo Core runtime.
- **Roll policy — FOUNDATION.** Profile-driven Core/Useful checkpoint logic is implemented; whole-build DPS-aware stopping remains later DPS scope.
- **BUG-001 — FIXED / LIVE VERIFIED.** Permanent real-Chrome regression remains required.
- **BUG-002 — KNOWN GAP.** Full +25 best-so-far/equipment lifecycle remains pending.

## Verification contract

A final PR head intended for merge must pass the exact-head verification surface:

- source/raw/profile audits;
- horizontal cohort and Profile × Adapter audits where applicable;
- profile readiness audit;
- full Node test suite;
- strict web build;
- real Chrome Roll Assist regression;
- diff/whitespace checks;
- Verify workflow artifact packaging;
- Export artifact workflow;
- other relevant workflows for the changed scope.

Post-merge main is rechecked for functional tranches. UI/live claims require real browser/live verification.

## Recent completed checkpoints

- PR #113 — Cohort 01 source closure and seven canonical promotions.
- PR #115 — source-reviewed Weapon cast-window primitive; no profile closure.
- PR #116 — incoming-transfer core; Impermanence Heron parked as BUG-008.
- PR #117 — machine-readable execution work queue.
- PR #118 — Stringmaster/Rime skill-stack semantics parked as BUG-009.
- PR #119 — exact Fallacy normal blast data while profile variant execution remains BUG-010.
- PR #121 — source-safe Fleurdelys character restriction and first exact static dependency closure.
- PR #123 — shared Aero Erosion target state, Ciaccona executable rotation, four exact dependency closures, Ciaccona freeze, Cartethyia reduced to two genuine source/execution blockers.
- Current closure checkpoint — exact Fleurdelys Rank-5 damage coverage plus reusable `echo-active-damage-v1`; no profile dependency or readiness status is closed by this prerequisite step.

## Next work

1. Keep Cartethyia `DT-DEF` blocked until timing semantics are explicitly resolved; do not infer a 15s delay/window lifecycle.
2. Keep Cartethyia `SOURCE_SEQUENCE_ONLY` until the exact canonical sequence has a verified total duration or independently approved measured timing.
3. Continue Rover (Aero) only if the exact canonical support sequence supplies enough execution evidence to place its healing-triggered 6s Bloodpact window, Unbound Flow team amplification and Fleurdelys cast without fabricated timestamps; otherwise park it and move to the next ranked green-lane profile.
4. Choose the next 2–4 build-ready canonical profiles by shortest remaining verified execution closure plus dependency overlap, not by adapter queue position alone.
5. Keep BUG-008/009/010 source blockers parked until stronger evidence resolves them.
6. Reuse existing primitives only when layer-specific semantics match; primitive availability alone does not close an event/timeline dependency.
7. Broad roster DPS remains out of scope until narrow closures and source completeness justify expansion.
