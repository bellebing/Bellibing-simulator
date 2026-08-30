# Bellibing Simulator — Current Project Status

This document is the current implementation and roadmap checkpoint for Bellibing Simulator. Detailed pre-2026-08-29 chronology lives in [`PROJECT_STATUS_HISTORY_2026-08-29.md`](PROJECT_STATUS_HISTORY_2026-08-29.md) and Git history.

`FOUNDATION` means architecture exists and is tested but supported-content coverage is incomplete.  
`COMPLETE` means the layer has the data/behavior required for its supported scope with no known blocking gap.  
`BLOCKED` means a known gap prevents that layer from being called complete.

Bellibing has **not** passed the full Pre-DPS Completeness Gate. Broad roster-wide Character DPS remains blocked. Narrow vertical slices may become `DPS_READY` only after their exact source, execution and freeze requirements close.

## Current baseline

Live registry-derived readiness is:

- **25 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **28 `PROFILE_SOURCE_PENDING`**;
- **1 `DPS_READY`**.

Canonical backward-impact / execution inventory is:

- **18 backward-impact reviews**;
- **18 reviewed canonical profiles**;
- **17 profiles with pending execution dependencies**;
- **78 exact pending execution edges**.

Augusta remains the only narrow `DPS_READY` profile. The seven Cohort 01 promotions are verified build/profile truth but their rotations remain `SOURCE_SEQUENCE_ONLY`.

## Architecture boundary

Preserve the separation between:

1. raw game/source data;
2. Character Mechanics;
3. Weapon/Echo/Sonata effects;
4. composable profiles/recommendations;
5. execution/combat-DPS logic;
6. UI.

The old V9.15 spreadsheet is a historical oracle only when explicitly needed. It is not the current architecture.

## Echo Core / Echo Lab / Roll Assist

- **Echo Core — COMPLETE FOR ELIGIBLE-CANDIDATE TUNING.** Rank-5 COST/main-stat pools, +0/+5/+10/+15/+20/+25 main-stat progression, 13 substats, roll distributions, tuning costs, recovery, seeded reproduction and COST-12 loadout validation are implemented and tested.
- **Echo Lab — COMPLETE FOR MECHANICAL ORACLE.** It consumes the shared Echo Core runtime.
- **Roll policy — FOUNDATION.** Profile-driven Core/Useful checkpoint logic is implemented. Whole-build DPS-aware stopping remains later DPS scope.
- **BUG-001 — FIXED / LIVE VERIFIED.** Real Chrome regression permanently checks the supported Roll Assist verdict paths.
- **BUG-002 — KNOWN GAP.** Full +25 best-so-far/equipment lifecycle remains pending.

Fresh world-drop desired-main acquisition probabilities remain outside the verified runtime.

## Current source coverage

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
- Midnight Veil's separate 480% Havoc Outro damage branch and Wishes of Quiet Snowfall arbitration remain specialized pending boundaries.
- **181 / 181 released Echo skills** are source-reviewed. Active damage remains partial where exact scaling/hit/state execution is not verified.

## Composable profiles

Independent Weapon Recommendation, Echo Loadout, Stat Target, Team, Rotation and Character Preset catalogs are live and cross-validated.

The candidate pipeline remains fail closed:

- automation may extract/stage/materialize reviewed data but cannot approve semantic truth;
- source extraction state and semantic review state are separate;
- `SOURCE_SEQUENCE_ONLY` never means executable timing/uptime;
- readiness is derived from live registries;
- missing/ambiguous source truth stays blocked instead of receiving defaults.

### Cohort 01 source closure

Historical Cohort 01 contains 15 Characters / 20 staged modes. Source phases closed at:

| Phase | REVIEWED | BLOCKED | PENDING |
| --- | ---: | ---: | ---: |
| `MODE_TEAM_CONTEXT` | 10 | 10 | 0 |
| `WEAPON` | 18 | 2 | 0 |
| `ECHO_SONATA` | 17 | 3 | 0 |
| `STATS_ER` | 10 | 10 | 0 |
| `SOURCE_ROTATION` | 10 | 10 | 0 |

Seven canonical defaults passed manual semantic review and were promoted:

- `lumi-hybrid`;
- `yinlin-moonlit`;
- `calcharo-standard`;
- `cantarella-standard`;
- `carlotta-standard`;
- `changli-standard`;
- `chisa-standard`.

Lucilla Glacio Chafe, Lucilla Echo Skill and Rover (Havoc) Quick Swap are source-complete but deliberately default-blocked. No universal default is fabricated from ambiguous mode semantics.

## Shared execution primitives

The Profile × Adapter matrix is a prioritization tool only. Matching suffixes are **not** semantic proof and never authorize `ENGINE_MODELED`, freeze approval or `DPS_READY`.

### Weapon cast windows — implemented primitive

`src/combat/weaponCastWindowAdapter.ts` provides `weapon-cast-timed-self-window-v1` after manual semantic review of the six `weapon:trigger-uptime-adapter` edges.

Five edges share an explicit cast-event → timed SELF-window mechanic:

- Ages of Harvest `AH-INTRO`;
- Ages of Harvest `AH-SKILL`;
- Wildfire Mark `WM-LIB`;
- The Last Dance `TLD-SKILL`;
- Moongazer's Sigil `MGS-LIB`.

Woodland Aria `WA-AERO` is deliberately separate because its event is applying Aero Erosion to a target, not a cast event.

The primitive is source-locked, runtime fail-closed and regression-tested. **Zero canonical pending IDs are removed** because the affected rotations still lack executable timelines.

### Incoming transfer state — shared core

`src/combat/incomingTransferState.ts` is the low-level outgoing → actual incoming Resonator state primitive. Layer-specific adapters provide source semantics; the core never parses trigger prose.

Current source-safe wrappers are:

- Echo `REMINISCENCE_DENIA_INCOMING_FUSION` — explicit Echo summon arms a 15s Outro window, then a 15s incoming Fusion DMG window;
- Echo `HYVATIA_INCOMING_ALL_ATTRIBUTE` — same armed-window shape plus required incoming Intro;
- Sonata `S08_5PC_INCOMING_ATK` — direct Outro → incoming Resonator 15s ATK window;
- Sonata `S12_5PC_INCOMING_HAVOC` — direct Outro → incoming Resonator 15s Havoc window.

Other incoming-resonator Sonata effects are **not** admitted automatically; extra Intro/self-state/scaling/state-removal prerequisites remain separate contracts.

### Impermanence Heron — BLOCKED SOURCE CONFLICT

Impermanence Heron remains unimplemented in execution despite five-profile fanout.

Current evidence conflicts on the arm condition:

- pinned current DommyMM/wuwabuild `Echoes.json` renders the transfer after the initial attack lands and restores 10 Resonance Energy;
- current Prydwen usage guidance states the Echo can be cancelled before damage/Energy while still applying the incoming-character buff.

Bellibing does not choose hit-armed versus cast-armed behavior without stronger evidence. All `echo:echo-60000525:impermanence-heron-active-transfer-adapter` dependencies remain pending.

### Important execution rule

Having a reusable primitive is not the same as closing a profile dependency. A canonical pending ID closes only when the exact supported profile has an executable event/state path using the verified adapter. `SOURCE_SEQUENCE_ONLY` profiles remain fail closed.

### Semantic execution work queue

`src/profileExecutionWorkQueue.ts` turns the raw 78-edge dependency matrix into a machine-readable implementation queue without changing canonical truth.

Current exact-edge disposition is regression-locked to:

- **46 `UNREVIEWED`**;
- **1 `SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING`** — Woodland Aria Aero-Erosion application state;
- **9 `PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE`** — five Weapon cast-window edges plus four direct Sonata Outro-transfer edges;
- **5 `BLOCKED_SOURCE_CONFLICT`** — Impermanence Heron / BUG-008 fanout;
- **17 `PROFILE_SPECIFIC_EXECUTION`** — rotation engine models.

That leaves **47 actionable shared edges**. The queue automatically excludes already-covered primitives, source-conflicted work and profile-specific rotations, then ranks the remaining shared work by current profile/Character/dependency fanout. New canonical pending IDs default to `UNREVIEWED`, so they surface automatically instead of silently inheriting old semantics.

The existing `audit:profile-adapters` CI gate validates this semantic partition and prints the current actionable shortlist. The queue never removes `pendingExecutionIds` and never authorizes execution.

See [`DPS_EXECUTION_GAP_MATRIX.md`](DPS_EXECUTION_GAP_MATRIX.md) for the readable dependency view.

## DPS execution

Augusta is the one narrow `DPS_READY` fixture, limited to the locked `augusta-standard` S0 / Thunderflare Dominion R1 / Iuno + The Shorekeeper personal-DPS context through `AUGUSTA_STD_V1`.

This does not imply arbitrary teams, teammate DPS or generic roster execution.

Freeze approval requires the exact supported path to have:

1. canonical verified profile truth;
2. current backward-impact review;
3. zero unresolved pending execution IDs;
4. independently implemented and tested execution adapters;
5. an `ENGINE_MODELED` rotation where DPS is claimed;
6. normal repository audits/tests/build/browser verification.

## Verification contract

A final PR head intended for merge must pass the exact-head verification surface:

- source/raw/profile audits;
- horizontal cohort and Profile × Adapter audits where applicable;
- full Node test suite;
- strict web build;
- real Chrome Roll Assist regression;
- diff/whitespace checks;
- Export artifact workflow;
- other relevant workflows for the changed scope.

Post-merge main is rechecked for functional tranches. UI/live claims require real browser/live verification.

## Recent completed checkpoints

- PR #113 — Cohort 01 STATS_ER + SOURCE_ROTATION closure, seven canonical promotions and adapter-matrix expansion.
- PR #114 — current-status synchronization after Cohort 01 merge.
- PR #115 — first shared execution primitive: five source-verified Weapon cast windows, Woodland Aria semantic split, runtime hardening; no pending profile IDs closed.
- PR #116 — shared incoming-transfer core with Denia/Hyvatia and direct Moonlit/Midnight wrappers; Impermanence Heron parked as BUG-008 source conflict; no pending profile IDs closed.

## Next work

1. Use the semantic execution work queue instead of manually re-triaging all 78 edges.
2. Keep Lucilla's two source-complete modes and Havoc Rover Quick Swap parked until default semantics are explicitly closed.
3. Resolve the Impermanence Heron hit-vs-cancel source conflict before implementing its transfer wrapper.
4. Review/implement the highest actionable shared groups — currently including Sonata trigger stacks, Sonata trigger uptime and Weapon target state at two-profile fanout — before Character-specific copies.
5. Reuse existing primitives only after layer-specific semantic review; primitive availability alone does not close a profile dependency.
6. Close execution gaps incrementally with backward-impact regressions; do not bulk-promote `SOURCE_SEQUENCE_ONLY` rotations.
7. Keep broad roster DPS blocked until exact profile execution closure exists.
