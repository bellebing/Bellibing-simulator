# Bellibing Simulator — Current Project Status

This document is the current implementation and roadmap state for Bellibing Simulator.

The pre-2026-08-29 accumulated status history is preserved byte-for-byte in [`PROJECT_STATUS_HISTORY_2026-08-29.md`](PROJECT_STATUS_HISTORY_2026-08-29.md). Use this file for the **current** checkpoint; use Git history and the archive for detailed PR chronology.

`FOUNDATION` means architecture exists and is tested but supported-content coverage is incomplete.  
`COMPLETE` means the layer has the data/behavior required for its supported scope with no known blocking gap.  
`BLOCKED` means a known gap prevents that layer from being called complete.

Bellibing must pass the **Pre-DPS Completeness Gate** before broad Character DPS expansion.

## Pre-DPS Completeness Gate

### Echo Core — COMPLETE FOR ELIGIBLE-CANDIDATE TUNING

Implemented and regression-tested:

- Rank-5 COST 1 / 3 / 4 main-stat pools;
- exact Rank-5 primary/secondary main-stat progression at +0/+5/+10/+15/+20/+25;
- source-backed GrowthValue scaling with integer truncation;
- all 19 Rank-5 primary main-stat families and all secondary families at each checkpoint;
- 13 unique substat types, verified roll values and probabilities;
- sequential tuning, EXP, Tuners and Shell Credits;
- 75% effective EXP recovery, 30% Tuner recovery, zero Shell Credit recovery;
- seeded reproducible runtime;
- separate 5-Echo / COST-12 loadout validation.

Fresh world-drop desired-main acquisition probabilities remain unverified. This limits full world-drop-to-finished-build farming-cost claims, but does not block eligible-candidate tuning or interactive Roll Assist for an Echo the user already owns.

### Echo Lab — COMPLETE FOR MECHANICAL ORACLE

Echo Lab is the canonical validation surface for verified Rank-5 tuning mechanics. It consumes the shared Echo Core runtime, exact checkpoint-scaled main stats, seeded reproduction, selective/batch tuning, exact resource accounting and shared discard-recovery rules. Browser-artifact regression confirms the exported app displays the verified runtime values.

### Roll / stopping policy — COMPLETE FOR GUIDE/PROFILE FALLBACK

The fallback engine is profile-driven rather than universally assuming exactly two Core stats. Profiles own Core/Useful target sets and explicit required hit counts; reachability uses exact remaining unique slots and roll values.

This remains a **guide/profile fallback**, not the final Bellibing decision rule. Final decisions must become whole-build DPS-aware once a Character has a verified combat/DPS model.

### DPS-aware stopping policy — ENGINE HOOK EXISTS / FINAL POLICY PENDING DPS

`forecastCandidateViability` can simulate exact future RNG branches and inject a final evaluator. Final Character-specific stop/roll decisions must eventually use the current five-Echo build, exact partial-Echo values, mandatory gates such as ER, future branch Personal Rotation DPS, improvement probability, remaining resource cost and the selected target/stopping objective.

Broad final policy is intentionally pending verified Character combat/DPS truth.

### Content Preflight + Backward Impact — COMPLETE AS PROCESS CONTRACT

[`CONTENT_PREFLIGHT_AND_IMPACT_AUDIT.md`](CONTENT_PREFLIGHT_AND_IMPACT_AUDIT.md) is mandatory. New or changed Characters, Weapons, Sonata sets, Echoes and combat-affecting effects require both source/model verification and backward-impact screening of compatible existing profiles. `Reviewed — no impact` is valid; silently skipping review is not.

## Character foundation

### Character raw/core — STATIC GATE IMPLEMENTED / EXPLICIT PENDING FIELDS REMAIN

60 Character records exist; 57 are currently `RELEASED` and covered by the executable raw gate.

Current explicit released-character raw pending fields are:

- **Qingxiao `maxEnergy`** — current sources conflict on Max Energy / energy-field semantics;
- **Rover (Electro) `maxEnergy`** — current sources disagree between 125 and 140, while a 125 Liberation cost does not prove the cap;
- **Suisui `maxEnergy`** — current databases expose incompatible 125/140/175 energy-labelled values.

These remain explicit pending exceptions; no Liberation cost is substituted for Max Energy.

### Character intrinsic stats — COMPLETE EXCEPT ONE EXPLICIT SOURCE CONFLICT

Every released Character has explicit Minor-Forte coverage. **Mornye DEF%** remains an intrinsic-source conflict and stays pending rather than being guessed.

### Character Mechanics source review — COMPLETE / CANONICAL COVERAGE 54 VERIFIED + 3 SOURCE_BLOCKED

Roster-wide Character Mechanics source review is complete for all 57 released Characters.

Current canonical coverage remains:

- **54 VERIFIED profiles**;
- **0 PARTIAL profiles**;
- **3 released Characters without canonical profiles**;
- **1866 canonical Character Mechanic facts**;
- **0 structural issues**;
- exactly one current shared-system Tune Break fact per VERIFIED profile.

The three missing profiles are now explicitly distinguished from unreviewed work. They have been fully re-reviewed against the exact pinned `DommyMM/wuwabuild` snapshot (`5fa70b11f1d84fb644e4dbed47873708da0fe66f`) and are `SOURCE_BLOCKED`:

- **Buling** — Five Thunders Spell Array Continuous DMG has exact coefficients but no explicit current-source damage-bonus classification;
- **Danjin** — current Ruby Blossom semantics simultaneously cap the resource at 120 and require `over 120` for the enhanced branch;
- **Xiangli Yao** — Pivot - Impale has exact coefficients but no explicit current-source damage-bonus classification, while the same source explicitly classifies other enhanced actions when appropriate.

Full evidence and dispositions are recorded in [`CHARACTER_MECHANICS_SOURCE_REVIEW.md`](CHARACTER_MECHANICS_SOURCE_REVIEW.md) and enforced by `characterMechanicsSourceReview.ts` regression coverage.

This does **not** promote those three Characters. They remain without canonical Character Mechanics profiles, remain blocked by Character preflight and must not receive Character DPS adapters until future source data resolves their blockers and the normal canonical audit passes.

The project gate distinction is now explicit:

- **roster-wide Character Mechanics source review is complete** — 54 VERIFIED + 3 SOURCE_BLOCKED + 0 unreviewed;
- **canonical Character Mechanics coverage is not 57/57** and must never be reported as such;
- repeated source-review work on these same three blockers is no longer the active Pre-DPS workstream unless new evidence appears.

### Character Mechanics source/executable boundary

The canonical layer remains fail-closed:

- exact source coefficients are stored as Lv1-Lv10 representations without silently choosing a talent level;
- mixed hit expressions preserve independent components and explicit hit counts;
- fixed coefficients/flat damage use separate representations and cannot masquerade as curves;
- source-facing `ECHO`, `TUNE_RUPTURE`, `AERO_EROSION`, `HACK`, `SPECTRO_FRAZZLE` and simultaneous `damageClasses` do not imply missing combat adapters;
- VERIFIED ACTIONS reject unknown damage intent, missing classifications, malformed representations and ambiguous hit multiplicity;
- Tune Break is explicit `SHARED_SYSTEM_DAMAGE`; Character facts own access/variant semantics while the shared combat system owns its damage formula;
- generated source candidates remain review-only and cannot auto-promote to `VERIFIED`;
- unresolved resource cadence, state transitions, trigger timing, target trails and conditional sequence execution remain raw facts until combat/rotation state exists.

## Weapons

### Weapon Core — COMPLETE FOR CURRENT VERSION 3.6 RELEASED ROSTER

Current audited snapshot:

- 122 total catalog records;
- 121 `RELEASED` Weapons;
- 1 `CONFIRMED_UPCOMING` Weapon: Thousandfold Deliverance;
- released raw Weapon gate complete.

### Weapon Effects — RELEASED SOURCE COVERAGE COMPLETE / EXECUTABLE MODELING PARTIAL

All **121/121 released Weapons** have source-audited effect coverage: **236 effect rows**, zero `PENDING_SOURCE_AUDIT` backlog.

Effects requiring rotation/state/stack/trigger execution remain explicit `VERIFIED_RAW_PENDING_MODEL` or MANUAL rather than receiving fabricated uptime. New or newly modeled Weapon effects must trigger backward-impact review for compatible existing profiles.

## Echo / Sonata content coverage

### Echo raw database — COMPLETE FOR CURRENT VERSION 3.6 RELEASED ROSTER

The Version 3.6 raw source audit is complete:

- **181 / 181 released Echoes are VERIFIED CURRENT** for stable identity, COST and Sonata membership;
- **34 / 34 released Sonata sets are VERIFIED CURRENT** for stable identity, activation thresholds and raw effect-description rows;
- **0 STALE / WRONG** records;
- **0 MISSING** records;
- **0 SOURCE_CONFLICT** records;
- **0 EXTRA / OBSOLETE** records.

Bellibing's pinned normalized snapshot remains `DommyMM/wuwabuild@0a2e49c649c857c690be709577e6ce98832b2d43`. It was re-reviewed against current upstream head `5fa70b11f1d84fb644e4dbed47873708da0fe66f` and current release/source references. `Echoes.json` is unchanged; the later `Fetters.json` delta adds upstream `displayBonuses` metadata outside Bellibing's raw identity/activation/raw-description projection.

`npm run audit:echo-raw` is now a source-facing fail-closed gate. It resolves current upstream at runtime and rejects missing/stale/extra identities, COST or membership drift, invalid raw fields/lifecycle/provenance and unregistered source conflicts. The gate runs in Verify, Export and Deploy.

This raw completion does **not** promote Sonata combat effects or Echo active-skill semantics. See [`ECHO_DATA_PIPELINE.md`](ECHO_DATA_PIPELINE.md) and [`ECHO_SONATA_EFFECT_COVERAGE.md`](ECHO_SONATA_EFFECT_COVERAGE.md).

### Sonata Effects — FOUNDATION / PARTIAL COVERAGE — ACTIVE PRE-DPS WORKSTREAM

10 audited effects across 7 Sonata sets are modeled. The remaining 27 current Sonata sets have zero modeled rows, and presence among the seven does not by itself prove all activation branches are complete.

The active workstream is now full current-set Sonata effect source coverage. Every required 2pc / 3pc / 5pc or other current activation branch must be classified from source truth. Pure stats remain distinct from trigger/state/stack/target/team/resource semantics; unresolved execution semantics stay explicit rather than receiving fabricated uptime.

### Echo effects and attacks — FOUNDATION / PARTIAL COVERAGE

Current modeled coverage remains intentionally small: 8 audited non-damage effects across 5 Echoes, with The False Sovereign as the first exact Echo attack fixture.

Before complete:

- raw active-skill parameters/facts must be available for the supported Echo catalog;
- non-damage main-slot/team/conditional effects must remain separate from active attack motion values;
- Character-restricted effects must carry explicit conditions;
- no Character recommendation or rotation uptime belongs in the raw Echo fact.

## Composable defaults/profiles — FOUNDATION

Independent catalogs exist for Weapon Recommendation, Echo Loadout, Stat Target, Team, Rotation and Character Preset. The resolver validates IDs and supports multiple modes for one raw Character.

Coverage is not complete until supported profiles are populated character-by-character/mode-by-mode and new compatible content is backward-impact screened.

## Roll Assistant UI — BLOCKED

`BUG-001 Live Roll Assist` remains **OPEN / BLOCKER**. The user reports that the live page returns `DISCARD` for every input path. Existing unit/regression behavior can distinguish relevant policy paths, so the blocker must be reproduced through the real live UI input mapping/candidate/evaluator path.

A deploy/site route smoke test is **not** sufficient verification. BUG-001 is not fixed until regression tests pass and the known live verdict paths are genuinely verified in the live UI.

`BUG-002 Roll Assist endgame` remains a known medium gap after BUG-001: final +25 Temporary/Keep equipment lifecycle is not yet fully source-identical to the V9.15 best-so-far lifecycle and eventually must be whole-build/DPS-aware.

## Current order before broad Character DPS work

1. **DONE:** Echo Core checkpoint mechanics and Echo Lab mechanical oracle.
2. **DONE:** profile-proof guide/fallback roll engine and Content Preflight + Backward Impact contract.
3. **DONE — SOURCE REVIEW:** roster-wide Character Mechanics source review: 54 canonical VERIFIED + 3 explicit SOURCE_BLOCKED + 0 unreviewed. Source-blocked Characters remain non-DPS-ready.
4. **DONE — VERSION 3.6 RAW SOURCE AUDIT:** 181 / 181 Echoes and 34 / 34 Sonata sets VERIFIED CURRENT with fail-closed source-facing gate and zero stale/missing/conflict/extra raw records.
5. **ACTIVE PRE-DPS WORKSTREAM:** complete current Sonata Effect source coverage.
6. Complete Echo skill/effect/attack fact coverage required by supported content.
7. Complete/populate composable default profiles and freeze pre-DPS contracts/current-patch backward-impact state.
8. Only then expand Character combat/DPS adapters character-by-character, excluding any Character still source-blocked or otherwise failing preflight.
9. As each Character gains verified DPS, replace guide fallback stopping decisions with whole-build DPS-aware decisions for that Character.
10. On every later patch, run Content Preflight + Backward Impact before declaring the patch integrated.

## Verification contract

A Character Mechanics promotion is not complete because files exist. It must pass the canonical structural/source audit and repository verification workflow.

A `SOURCE_BLOCKED` disposition is not a promotion. It must correspond to a released Character without a canonical profile, carry a dated exact-source reason and evidence, and remain fail-closed for preflight/DPS. The source-review audit must reject duplicate/invalid dispositions and distinguishes explicit blockers from genuinely unreviewed released Characters.

Echo/Sonata raw coverage is not complete because a catalog count exists. The source-facing projection audit must match current upstream for Bellibing-owned raw fields, pass lifecycle/required-field/membership/provenance invariants and preserve source conflicts explicitly rather than guessing them away.

UI bugs are not fixed by unit tests or deploy smoke alone; real UI/live verification is required where applicable.

## Documentation rule

Current project documentation describes the present Bellibing architecture, coverage and roadmap. Detailed historical status text is retained in `PROJECT_STATUS_HISTORY_2026-08-29.md` and Git history. Old spreadsheet behavior is not the current architecture; it may be used only as an explicitly verified historical oracle/parity reference.
