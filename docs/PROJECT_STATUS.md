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

Echo Lab is the canonical validation surface for verified Rank-5 tuning mechanics. It uses the shared Echo Core runtime, exact checkpoint-scaled main stats, seeded reproduction, selective/batch tuning, exact resource accounting and shared discard-recovery rules. Browser-artifact regression confirms the exported app displays the verified runtime values.

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

### Character Mechanics — PARTIAL / ACTIVE PRE-DPS BLOCKER

**Current measured checkpoint after PR #84 candidate verification:**

- **54 VERIFIED**
- **0 PARTIAL**
- **3 UNSTARTED**
- **1866 canonical Character Mechanic facts**
- **0 structural issues**
- exactly one current shared-system Tune Break fact per VERIFIED profile

PR #84 source-audits and canonically promotes **Rover (Electro)** and **Suisui**.

#### Rover (Electro) — VERIFIED

Rover (Electro) is independently reconstructed from current sources rather than trusting the corrupted/misaligned PR #66/#68 review slice. Canonical facts preserve exact current Lv1-Lv10 action representations, Electric Surge/Thunder Rage and cross-attribute state semantics, Inherents, Outro, S1-S6 and **Tune Break — Sword** at the shared-system boundary. `Thrum of All Sounds` cross-attribute forms remain raw source facts where execution semantics are not yet modeled; no cross-attribute combat behavior is invented.

Regression anchors include current Thunderclap, Ultimate Tactics and Thunder Bane curves and S6 affecting both Thrum of All Sounds and Thunder Bane.

#### Suisui — VERIFIED

Suisui uses current post-update source tables and current **Rectifier** identity. Stale normalized `Gauntlets` Tune Break data and pre-update multipliers remain discrepancy evidence only and are not canonicalized. Exact current Lv1-Lv10 damage facts preserve source-explicit ATK/HP scaling, Cloud Breath/Floral Epistle resources, utility/state semantics, Inherents, Outro, S1-S6 and **Tune Break — Rectifier** at the shared-system boundary.

Regression anchors include current Zephyr Mid-air `35.57% -> 70.72%` and source-explicit HP scaling on Awakening Spring and Tinkling Jade.

#### Remaining Character Mechanics blockers — 3

These remain `UNSTARTED` because current sources do not support a truthful canonical promotion:

- **Buling** — Five Thunders Spell Array damage-bonus bucket is not explicitly confirmed by the current reviewed sources;
- **Danjin** — Ruby Blossom full-power wording remains internally inconsistent with the stated 120 maximum; no impossible threshold is normalized into canonical truth;
- **Xiangli Yao** — Pivot-Impale damage bucket is not explicitly current-source confirmed.

The roster is therefore **not** Character-Mechanics-complete. Broad Character DPS remains blocked until these three are truthfully resolved or the project gate is explicitly changed with documented evidence.

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

Effects that require rotation/state/stack/trigger execution remain explicit `VERIFIED_RAW_PENDING_MODEL` or MANUAL rather than receiving fabricated uptime. New or newly modeled Weapon effects must trigger backward-impact review for compatible existing profiles.

## Echo / Sonata content coverage

### Echo raw database — CATALOG FOUNDATION

181 Echo records and 34 Sonata records exist with stable IDs, COST and memberships. Current-patch raw Echo coverage still needs a complete source/roster audit before being called complete.

### Sonata Effects — FOUNDATION / PARTIAL COVERAGE

10 audited effects across 7 Sonata sets are modeled. Full supported-set effect coverage remains pending; triggers/uptime must stay conditional until combat/rotation state proves them.

### Echo effects and attacks — FOUNDATION / PARTIAL COVERAGE

Current modeled coverage remains intentionally small: 8 audited non-damage effects across 5 Echoes, with The False Sovereign as the first exact Echo attack fixture. Full supported active-skill and non-damage effect coverage remains pending.

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
3. **ACTIVE PRE-DPS BLOCKER:** resolve only the three remaining Character Mechanics blockers — **Buling, Danjin, Xiangli Yao** — from current source truth. Do not infer missing buckets/thresholds.
4. Complete current Echo/Sonata raw audit.
5. Complete Sonata Effect coverage.
6. Complete Echo skill/effect/attack fact coverage required by supported content.
7. Complete/populate composable default profiles and freeze pre-DPS contracts/current-patch backward-impact state.
8. Only then expand Character combat/DPS adapters character-by-character.
9. As each Character gains verified DPS, replace guide fallback stopping decisions with whole-build DPS-aware decisions for that Character.
10. On every later patch, run Content Preflight + Backward Impact before declaring the patch integrated.

## Verification contract

A Character Mechanics promotion is not complete because files exist. It must pass the canonical structural/source audit and the repository verification workflow. PR #84 additionally regression-locks the exact **54 VERIFIED / 0 PARTIAL / 3 UNSTARTED / 1866 facts / 0 structural issues** checkpoint plus current Rover (Electro)/Suisui source-critical facts.

UI bugs are not fixed by unit tests or deploy smoke alone; real UI/live verification is required where applicable.

## Documentation rule

Current project documentation describes the present Bellibing architecture, coverage and roadmap. Detailed historical status text is retained in `PROJECT_STATUS_HISTORY_2026-08-29.md` and Git history. Old spreadsheet behavior is not the current architecture; it may be used only as an explicitly verified historical oracle/parity reference.
