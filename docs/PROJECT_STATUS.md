# Bellibing Simulator — Current Project Status

This document is the current implementation and roadmap checkpoint for Bellibing Simulator. Detailed pre-2026-08-29 chronology lives in [`PROJECT_STATUS_HISTORY_2026-08-29.md`](PROJECT_STATUS_HISTORY_2026-08-29.md) and Git history.

`FOUNDATION` means architecture exists and is tested but supported-content coverage is incomplete. `COMPLETE` means the layer has the data/behavior required for its supported scope with no known blocking gap. `BLOCKED` means a known gap prevents that layer from being called complete.

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

## Shared execution primitives and exact dependency closure

`src/data/profileExecutionClosures20260830.ts` removes an exact pending ID only when the expected review/preset/ID still exists. Reapplying or drifting a closure throws.

### Fleurdelys static applicability

`echo-character-restriction-v1` proves the static Fleurdelys extra Aero bonus only for canonical `cartethyia` and `rover-aero`. The character-restriction dependency is already closed for both profiles.

### Exact Echo active damage

`src/combat/echoActiveDamageAdapter.ts` provides `echo-active-damage-v1`, a reusable fail-closed resolver from verified `EchoAttackFact` data to exact active-cast damage facts. It proves owner, attack ID, `ACTIVE_CAST`, element, scaling stat and total motion value; it does not invent cast timing, rotation uptime or cast variants.

Reminiscence: Fleurdelys Rank-5 exact motion value is `355.68% ATK` Aero with a 20-second cooldown.

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

## Existing execution blockers

- **BUG-008 — Impermanence Heron transfer:** `BLOCKED_SOURCE_CONFLICT`; hit-armed versus cancel/cast-armed evidence conflicts.
- **BUG-009 — Stringmaster / Rime-Draped Sprouts skill-stack lifetime:** `BLOCKED_SOURCE_SEMANTICS`; stack refresh/expiry policy is not source-resolved.
- **BUG-010 — Fallacy profile cast variant:** `BLOCKED_SOURCE_SEMANTICS`; supported rotations do not identify normal/tap versus hold/release execution.
- **BUG-011 — Defier's Thorn `DT-DEF`:** `BLOCKED_SOURCE_SEMANTICS`; timing grammar remains ambiguous.
- **BUG-012 — Rover (Aero) exact support execution:** `BLOCKED_SOURCE_SEMANTICS`; healing and Unbound Flow/Fleurdelys events are source-proven, but exact rotation duration/6-second overlap and one fixed optional-Skyfall execution path are not.

No blocked dependency is implemented by assumption.

## Semantic execution work queue

`src/profileExecutionWorkQueue.ts` classifies the current 72 exact pending edges without authorizing execution. After the Rover-only semantic review:

- **33 `UNREVIEWED`**;
- **1 `SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING`** — Bloodpact BPP-TEAM-AERO;
- **10 `PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE`** — including Rover Fleurdelys active damage via `echo-active-damage-v1`;
- **5 `BLOCKED_SOURCE_CONFLICT`**;
- **7 `BLOCKED_SOURCE_SEMANTICS`** — including Rover BPP-SKILL / BUG-012;
- **16 `PROFILE_SPECIFIC_EXECUTION`**.

That leaves **34 actionable shared edges**. Queue order is a throughput hint only; the active strategy is shortest verified path to new `DPS_READY` plus reusable overlap.

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

## Next work

1. Merge this closure tranche once the exact final head passes the full Verify/Export/test/build/browser/diff surface.
2. Keep BUG-008/009/010/011/012 parked until stronger source or an explicitly approved measurement method resolves them.
3. Start the **Profile Source Import Accelerator** on a new post-merge branch: automate roster-wide CANDIDATE_ONLY / NOT_VERIFIED extraction of source-available build fields and provenance so manual work focuses on ambiguity rather than transcription.
4. In parallel, choose further build-ready DPS closures by shortest verified dependency path plus reuse overlap.
5. Never fabricate teams, defaults, ER requirements, rotations, mechanics, trigger uptime or timestamps.
