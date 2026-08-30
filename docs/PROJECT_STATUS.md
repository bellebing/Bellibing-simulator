# Bellibing Simulator — Current Project Status

This document is the current implementation and roadmap checkpoint for Bellibing Simulator. Detailed pre-2026-08-29 chronology lives in [`PROJECT_STATUS_HISTORY_2026-08-29.md`](PROJECT_STATUS_HISTORY_2026-08-29.md) and Git history.

`FOUNDATION` means architecture exists and is tested but supported-content coverage is incomplete. `COMPLETE` means the layer has the data/behavior required for its supported scope with no known blocking gap. `BLOCKED` means a known gap prevents that layer from being called complete.

Bellibing has **not** passed the full Pre-DPS Completeness Gate. Broad roster-wide Character DPS remains blocked. Narrow vertical slices may become `DPS_READY` only after their exact source, execution and freeze requirements close.

## Current baseline

Live registry-derived readiness remains:

- **37 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **15 `PROFILE_SOURCE_PENDING`**;
- **2 `DPS_READY`** — Augusta and Ciaccona.

PR #126 deterministically materialized 13 reviewer-approved profile packages from the exact green Profile Source Extract checkpoint. The semantic review covered all 24 then-non-raw-blocked `PROFILE_SOURCE_PENDING` Characters: **13 were approved** and **11 were explicitly parked** rather than receiving invented team/mode/default/rotation truth. Four additional current profile-source rows remain blocked by raw/intrinsic preflight: Mornye, Qingxiao, Rover (Electro) and Suisui.

The Changli execution semantic checkpoint does **not** change profile readiness or close any Changli pending execution ID. It classifies three shared edges more precisely and records one profile timing blocker while keeping the canonical execution graph intact.

Canonical backward-impact / execution inventory is:

- **18 backward-impact reviews**;
- **18 reviewed canonical profiles**;
- **16 profiles with pending execution dependencies**;
- **72 exact pending execution edges**.

The Ciaccona closure removed four exact edges from the previous 76-edge matrix. Cartethyia remains pending on exactly two dependencies: Defier's Thorn `DT-DEF` source timing semantics and its profile-specific rotation engine model.

## Architecture boundary

Preserve the separation between raw game/source data, Character Mechanics, Weapon/Echo/Sonata effects, composable profiles/recommendations, execution/combat-DPS logic and UI. The old V9.15 spreadsheet is a historical oracle only when explicitly needed. `SOURCE_SEQUENCE_ONLY` never becomes executable by assumption.

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
- **181 / 181 released Echo skills** are source-reviewed.
- Echo non-damage effect coverage remains **63 modeled rows across 37 Echoes** with specialized adapter boundaries kept explicit.
- The exact Rank-5 Echo attack catalog is now **4 attack profiles / 5 attack facts**. Reminiscence: Fleurdelys is source-exact at `27.36% x8 + 136.80%` Aero damage.

## Composable profiles

Independent Weapon Recommendation, Echo Loadout, Stat Target, Team, Rotation and Character Preset catalogs are live and cross-validated. The candidate/profile pipeline remains fail closed: extraction/staging cannot approve semantic truth, `SOURCE_SEQUENCE_ONLY` never implies timing or uptime, readiness is registry-derived, and ambiguous source truth stays pending instead of receiving defaults.

The Profile Source Import Accelerator has now completed its first roster-wide throughput pass and the approved horizontal subset is permanently reproducible in-repo. `data/research/profile-horizontal-source-candidates-2026-08-30.json` remains `CANDIDATE_ONLY / NOT_VERIFIED`, the separate 24-row semantic review owns approval decisions, and `audit:profile-horizontal-green-lane` regenerates the approved subset plus canonical TypeScript and requires byte-identical output. The original source checkpoint is pinned to workflow run `33327547829`, head `dd13cbdbd4e1010179b2004b0d4baf650651ea6e`, artifact `9736802750`, SHA256 `04663fefac62141f6b0d82b15d28d32a3e77aedfad4d89d7cc46830ca8ef365b`.

## Shared execution primitives and exact dependency closure

`src/data/profileExecutionClosures20260830.ts` removes an exact pending ID only when the expected review/preset/ID still exists. Reapplying or drifting a closure throws.

### Fleurdelys static applicability

`echo-character-restriction-v1` proves the static Fleurdelys extra Aero bonus only for canonical `cartethyia` and `rover-aero`. The character-restriction dependency is already closed for both profiles.

### Exact Echo active damage

`src/combat/echoActiveDamageAdapter.ts` provides `echo-active-damage-v1`, a reusable fail-closed resolver from verified `EchoAttackFact` data to exact active-cast damage facts. It proves owner, attack ID, `ACTIVE_CAST`, element, scaling stat and total motion value; it does not invent cast timing, rotation uptime or cast variants.

Reminiscence: Fleurdelys Rank-5 exact motion value is `355.68% ATK` Aero with a 20-second cooldown.

### Molten Rift cast window

`src/combat/sonataCastWindowAdapter.ts` provides `sonata-cast-timed-self-window-v1` for the manually reviewed Molten Rift 5-piece branch only. The source contract is exact: an executed Resonance Skill cast by the set owner creates a **15-second SELF +30% Fusion DMG** window. The adapter validates the canonical Sonata row and accepts an explicit caller timestamp; it does not parse trigger prose or infer uptime from equipping the set.

Changli's Molten Rift pending edge is therefore `PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE`, not closed. An executable profile timeline must still provide the Skill-cast event.

### Ciaccona — closed

`CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1` executes the reviewed fixed Ciaccona sequence using the source-backed **4.5-second** total duration. It owns the source-proven direct-hit state needed for Musical Essence, Aero Erosion, Woodland Aria and Gusts of Welkin. Optional/periodic Tonic events are not fabricated.

The Ciaccona backward-impact review has zero pending execution IDs and the explicit freeze row makes `ciaccona-cartethyia-aero` the second narrow `DPS_READY` profile.

### Cartethyia — parked

Cartethyia remains `SOURCE_SEQUENCE_ONLY` on exactly two blockers:

1. `weapon:defiers-thorn:DT-DEF:source-timing-adapter` — **BUG-011 / BLOCKED_SOURCE_SEMANTICS**. Current source does not unambiguously define the 15-second timing lifecycle.
2. `rotation:cartethyia-basic-ciaccona-rover-aero:engine-model` — the sequence is verified, but no exact source-backed total duration is established.

### Rover (Aero) — reviewed and parked, no guessed timing

The effective canonical Rover pending list is exactly four IDs after the already-closed Fleurdelys character restriction:

1. `weapon:bloodpacts-pledge:BPP-SKILL:healing-uptime-adapter`;
2. `weapon:bloodpacts-pledge:BPP-TEAM-AERO:unbound-flow-team-amplify-adapter`;
3. `echo:echo-60001065:active-skill-damage-adapter`;
4. `rotation:rover-aero-cartethyia-ciaccona-standard:engine-model`.

`ROVER_AERO_STANDARD_ROTATION_EXECUTION_REVIEW_20260830` records the source result:

- Cloudburst Dance and Omega Storm provide source-proven healing events, so Bloodpact's `Providing Healing` trigger exists in the canonical sequence;
- BPP-SKILL is a 6-second SELF Resonance Skill DMG window after healing;
- Unbound Flow P1 is explicitly cast before switching out, proving the event that triggers BPP-TEAM-AERO's 30-second team Aero amplification;
- Prydwen Echo Usage explicitly places Reminiscence: Fleurdelys after Unbound Flow P1 and before switching out, so the Fleurdelys active-cast event is source-proven and matches `echo-active-damage-v1`;
- Unbound Flow P2 then occurs automatically off-field.

What source does **not** supply is the exact total duration/timeline for this Standard Rotation. It describes Rover's rotation as lengthy but publishes no exact `rotationSeconds`. Therefore Bellibing cannot prove which later Resonance Skill damage events overlap the 6-second BPP-SKILL window, cannot invent per-action timestamps, and cannot produce a verified DPS denominator. The source sequence also retains Skyfall Severance as optional rather than one fixed executable branch.

This is parked as **BUG-012 / BLOCKED_SOURCE_SEMANTICS**. Rover remains `SOURCE_SEQUENCE_ONLY`; **zero pending IDs are closed by this review**. The team-amp trigger semantics are reviewed implementation-pending, and Fleurdelys active damage is classified as primitive-available/requires-timeline rather than falsely executable.

### Changli — reviewed and parked, shared semantics narrowed

`changli-standard` keeps four canonical pending execution IDs:

1. `weapon:blazing-brilliance:BBR-SKILL:stack-lifecycle-adapter` — **BUG-013 / BLOCKED_SOURCE_SEMANTICS**;
2. `weapon:blazing-brilliance:BBR-SKILL-CAST-STACKS:cross-effect-stack-mutation-adapter` — **BUG-013 / BLOCKED_SOURCE_SEMANTICS**;
3. `sonata:sonata-2:S02_5PC_FUSION:trigger-uptime-adapter` — `PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE` via `sonata-cast-timed-self-window-v1`;
4. `rotation:changli-standard-rotation:engine-model` — **BUG-014 / PROFILE_SPECIFIC_EXECUTION**.

Blazing Brilliance raw source facts remain verified: damage grants +1 Searing Feather at most once every 0.5 seconds, Resonance Skill casts grant +5 to the same state, max stacks are 14, and the current better-supported representation removes all stacks 12 seconds after reaching max. Current reviewed sources do **not** explicitly establish whether later +1/+5 grants while already capped restart, preserve or otherwise mutate that removal timer. `BUG-013` therefore parks only executable at-cap lifecycle behavior; no refresh policy is invented.

Current Prydwen Changli guidance preserves the canonical Standard Rotation and explicitly states that allowing the final Heavy to occur naturally instead of swapping extends the rotation by **1.37 seconds**. That is a relative variant delta, not an exact total duration. No exact `rotationSeconds` is published for the fixed Standard Rotation, so `BUG-014` keeps the profile `SOURCE_SEQUENCE_ONLY` and prevents a fabricated DPS denominator. **No Changli pending execution ID is closed by this checkpoint.**

## Existing execution blockers

- **BUG-008 — Impermanence Heron transfer:** `BLOCKED_SOURCE_CONFLICT`; hit-armed versus cancel/cast-armed evidence conflicts.
- **BUG-009 — Stringmaster / Rime-Draped Sprouts skill-stack lifetime:** `BLOCKED_SOURCE_SEMANTICS`; stack refresh/expiry policy is not source-resolved.
- **BUG-010 — Fallacy profile cast variant:** `BLOCKED_SOURCE_SEMANTICS`; supported rotations do not identify normal/tap versus hold/release execution.
- **BUG-011 — Defier's Thorn `DT-DEF`:** `BLOCKED_SOURCE_SEMANTICS`; timing grammar remains ambiguous.
- **BUG-012 — Rover (Aero) exact support execution:** `BLOCKED_SOURCE_SEMANTICS`; healing and Unbound Flow/Fleurdelys events are source-proven, but exact rotation duration/6-second overlap and one fixed optional-Skyfall execution path are not.
- **BUG-013 — Blazing Brilliance Searing Feather at-cap lifecycle:** `BLOCKED_SOURCE_SEMANTICS`; source does not define whether qualifying +1/+5 events while already at 14 stacks restart or otherwise alter the 12-second removal timer.
- **BUG-014 — Changli Standard Rotation denominator:** `BLOCKED_SOURCE_SEMANTICS`; source gives an exact 1.37-second variant delta but no exact total duration for the canonical fixed path.

No blocked dependency is implemented by assumption.

## Semantic execution work queue

`src/profileExecutionWorkQueue.ts` classifies the current 72 exact pending edges without authorizing execution. After the Changli semantic review:

- **30 `UNREVIEWED`**;
- **1 `SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING`** — Bloodpact BPP-TEAM-AERO;
- **11 `PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE`** — including Changli Molten Rift via `sonata-cast-timed-self-window-v1` and Rover Fleurdelys active damage via `echo-active-damage-v1`;
- **5 `BLOCKED_SOURCE_CONFLICT`**;
- **9 `BLOCKED_SOURCE_SEMANTICS`** — including the two Blazing Brilliance edges / BUG-013 and Rover BPP-SKILL / BUG-012;
- **16 `PROFILE_SPECIFIC_EXECUTION`**.

That leaves **31 actionable shared edges**. Queue order is a throughput hint only; the active strategy is shortest verified path to new `DPS_READY` plus reusable overlap. The Changli review improves semantic disposition without reducing the 72-edge canonical graph.

See [`DPS_EXECUTION_GAP_MATRIX.md`](DPS_EXECUTION_GAP_MATRIX.md) for the current registry-derived readable view.

## DPS execution

Current narrow freeze-approved fixtures:

- Augusta — `augusta-standard` / `AUGUSTA_STD_V1`;
- Ciaccona — `ciaccona-cartethyia-aero` / `CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1`.

Freeze approval still requires canonical verified profile truth, current backward-impact review, zero pending IDs, independently tested execution, `ENGINE_MODELED` rotation, verified BuildContext bridge and the normal repository verification surface.

## Echo Core / Echo Lab / Roll Assist

- Echo Core: complete for eligible-candidate tuning.
- Echo Lab: complete for mechanical oracle.
- Roll policy: foundation; whole-build DPS-aware stopping remains later scope.
- BUG-001 remains fixed/live-verified with permanent Chrome regression.
- BUG-002 remains the known +25 best-so-far/equipment lifecycle gap.

## Verification contract

A final PR head intended for merge must pass source/raw/profile audits, Profile × Adapter/readiness audits, full Node tests, strict web build, real Chrome Roll Assist regression, diff/whitespace checks, Verify artifact packaging and Export artifact workflow. Post-merge main is rechecked; UI/live claims require real browser/live verification.

## Recent completed checkpoints

- PR #121 — source-safe Fleurdelys character restriction.
- PR #123 — shared Aero Erosion state, Ciaccona executable rotation/freeze, Cartethyia reduced to two genuine blockers.
- PR #124 tranche — exact Fleurdelys Rank-5 attack data, reusable `echo-active-damage-v1`, Rover source-only closure review and registry-derived execution-doc sync. Rover is intentionally not promoted.
- PR #125 — Profile Source Import Accelerator exact green extraction checkpoint: 28/28 then-pending Characters fetched into `CANDIDATE_ONLY / NOT_VERIFIED` source data with provenance; automation did not approve semantic truth.
- PR #126 — horizontal semantic closure over all 24 non-raw-blocked pending profiles: 13 canonical VERIFIED packages materialized deterministically, 11 genuine ambiguities parked, readiness moved from 24→37 `PROFILE_COMPLETE_PENDING_FREEZE` and 28→15 `PROFILE_SOURCE_PENDING`; `DPS_READY` remains 2.
- PR #128 — Changli execution semantic checkpoint: reusable Molten Rift 15-second cast window, Blazing Brilliance at-cap lifecycle parked as BUG-013, Changli denominator parked as BUG-014; no pending execution ID or `DPS_READY` status is falsely closed.

## Next work

1. Resolve the remaining **15 `PROFILE_SOURCE_PENDING`** rows horizontally: 11 semantic team/mode/default/rotation ambiguities plus four raw/intrinsic preflight blockers (Mornye, Qingxiao, Rover (Electro), Suisui).
2. Keep BUG-008/009/010/011/012/013/014 parked until stronger source or an explicitly approved measurement method resolves them.
3. For the 11 semantic rows, create explicit mode/team/default review decisions instead of broad generic defaults; use the deterministic candidate pipeline for build fields and preserve ambiguous rows as pending.
4. In parallel, continue selecting build-ready DPS closures from the **37 `PROFILE_COMPLETE_PENDING_FREEZE`** profiles by shortest verified dependency path plus reusable execution overlap; skip candidates whose denominator or source semantics are unresolved instead of forcing a promotion.
5. Never fabricate teams, defaults, ER requirements, rotations, mechanics, trigger uptime, stack-refresh policy or timestamps.