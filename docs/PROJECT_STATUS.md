# Bellibing Simulator — Current Project Status

This document is the current implementation and roadmap checkpoint for Bellibing Simulator. Detailed pre-2026-08-29 chronology lives in [`PROJECT_STATUS_HISTORY_2026-08-29.md`](PROJECT_STATUS_HISTORY_2026-08-29.md) and Git history.

`FOUNDATION` means architecture exists and is tested but supported-content coverage is incomplete. `COMPLETE` means the layer has the data/behavior required for its supported scope with no known blocking gap. `BLOCKED` means a known gap prevents that layer from being called complete.

Bellibing has **not** passed the full Pre-DPS Completeness Gate. Broad roster-wide Character DPS remains blocked. Narrow vertical slices may become `DPS_READY` only after their exact source, execution and freeze requirements close.

## Current baseline

Current fully verified deployed product-code baseline: `bae1b694b0d0df887bf73018429e8c90c86eec86` after PR #139.

- **Verify #656 SUCCESS**;
- **Export #628 SUCCESS**;
- **Deploy #130 SUCCESS**;
- deployed Alpha passes the permanent real-Chrome Alpha/Roll Assist paths, Augusta owned-build/upgrade loop, and Ciaccona +25 owned-build/whole-build comparison path.

Live registry-derived readiness is unchanged:

- **43 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **9 `PROFILE_SOURCE_PENDING`**;
- **2 `DPS_READY`** — Augusta and Ciaccona.

Canonical backward-impact / execution inventory is also unchanged:

- **18 backward-impact reviews**;
- **18 reviewed canonical profiles**;
- **16 profiles with pending execution dependencies**;
- **72 exact pending execution edges**;
- semantic queue: **30 UNREVIEWED / 1 SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING / 11 PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE / 5 BLOCKED_SOURCE_CONFLICT / 9 BLOCKED_SOURCE_SEMANTICS / 16 PROFILE_SPECIFIC_EXECUTION** = **31 actionable shared edges**.

PR #129 integrated the reviewer-approved 2026-08-31 horizontal tranche. Six canonical VERIFIED packages are live for **Chixia, Encore, Lucilla, Rover (Havoc), Yangyang and Mornye**; all six rotations remain `SOURCE_SEQUENCE_ONLY`. **Baizhi, Brant, Jianxin, Phoebe, Verina and Yuanwu** remain parked on their already-reviewed semantic blockers and must not be re-researched without new evidence. Mornye intrinsic DEF is resolved at reviewed **15.20%**.

The exact `PROFILE_SOURCE_PENDING` queue is therefore:

- semantic blockers: **Baizhi, Brant, Jianxin, Phoebe, Verina, Yuanwu**;
- raw/static preflight blockers: **Qingxiao, Rover (Electro), Suisui** — unresolved `maxEnergy` source truth.

## Architecture boundary

Preserve separation between raw game/source data, Character Mechanics, Weapon/Echo/Sonata effects, composable profiles, execution/combat-DPS logic and UI. V9.15 is historical oracle/reference only where explicitly required. `SOURCE_SEQUENCE_ONLY` never becomes executable by assumption.

The Alpha UI is a projection of canonical registries, not a second profile database. Frontend selection must never invent Character, mode, team, weapon, Echo shell, timing, roll policy or DPS truth.

Owned-Echo product input has two distinct fail-closed boundaries:

1. checkpoint analysis requires an independently verified Roll Assist policy bound to the canonical profile;
2. whole-build DPS additionally requires a verified `ENGINE_MODELED` profile **and** an explicit source-backed Echo→`DamageEvaluator` adapter for that exact profile.

`DPS_READY` alone does not authorize either Roll Assist or owned-build stat assembly. Exact owned-build Echo validation is shared across evaluators: Rank 5, +25, canonical slot COST/main-stat, exact COST-bound secondary main, and five unique verified Rank-5 substat rolls.

Candidate-vs-incumbent upgrade analysis is layered above that same whole-build boundary. It may only evaluate a profile with a registered owned-build DPS adapter, changes exactly one Echo slot, preserves the locked Character/sequence/Weapon/Team/rotation/evaluator context, and never substitutes a universal desired-stat score for whole-build DPS plus mandatory gates.

Optional leave-one-substat contribution diagnostics are not allowed to weaken exact whole-build validation. PR #139 made that diagnostic fail-soft for strict evaluators: incumbent and candidate whole-build evaluations remain strict, while an intentionally invalid temporary four-substat probe yields a null optional contribution instead of erasing a valid comparison decision.

## Source coverage

### Characters

- 60 Character records; 57 `RELEASED`.
- Raw/static blockers: Qingxiao `maxEnergy`, Rover (Electro) `maxEnergy`, Suisui `maxEnergy`.
- Intrinsic DPS blockers: **none**.
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
- Echo non-damage effect coverage remains **63 modeled rows across 37 Echoes** with specialized adapter boundaries explicit.
- Exact Rank-5 Echo attack catalog remains **5 attack profiles / 6 attack facts**. Storing an exact Echo attack fact never implies profile timing or DPS closure.

## Composable profiles

Independent Weapon Recommendation, Echo Loadout, Stat Target, Team, Rotation and Character Preset catalogs are live and cross-validated. Candidate/profile pipelines remain fail closed: extraction cannot approve semantic truth, `SOURCE_SEQUENCE_ONLY` never implies timing/uptime, readiness is registry-derived, and ambiguity stays pending.

Deterministic horizontal tranches are reproducible in-repo:

- 2026-08-30: 13 reviewer-approved canonical packages, 11 parked rows;
- 2026-08-31: 6 reviewer-approved canonical packages, 6 parked rows, materialized as split modules.

`audit:profile-horizontal-green-lane` regenerates both tranches. Source-subset JSON must remain structurally identical and canonical TypeScript byte-identical.

## Shared execution primitives and narrow DPS

Available source-safe primitives include:

- `echo-character-restriction-v1`;
- `echo-active-damage-v1`;
- `weapon-cast-timed-self-window-v1`;
- `incoming-transfer-state-v1`;
- `sonata-cast-timed-self-window-v1`;
- shared Aero Erosion target-state execution used by Ciaccona.

Current narrow `DPS_READY` fixtures:

- Augusta — `augusta-standard` / `AUGUSTA_STD_V1`;
- Ciaccona — `ciaccona-cartethyia-aero` / `CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1`.

Augusta has a source-backed `augustaStandardEchoDamageEvaluator` that assembles actual five-Echo cards into the locked S0 / Thunderflare Dominion R1 / Iuno + Shorekeeper / `AUGUSTA_STD_V1` context.

Ciaccona has an independently reviewed static owned-build assembly boundary for the exact S0 / Woodland Aria R1 / Gusts of Welkin + Nightmare: Kelpie profile. It derives Character raw stats, Minor Fortes, Woodland Aria static stats/permanent ATK, Gusts 2-piece, Kelpie main-slot Aero bonus, exact owned Echo stats and the canonical 115% ER gate from current registries. Woodland Aria trigger state, Gusts 5-piece, Solo Concert and Winds of Rinascita remain owned by the existing 4.5-second execution engine and are not duplicated statically.

PR #139 adds the independently reviewed, versioned Ciaccona owned-build product combat context and registers `ciaccona-cartethyia-aero` behind current-profile drift validation. The locked benchmark is **Tactical Hologram Lorelei VI, Lv100, DEF 1592, Aero RES 10%, pre-180s/no-dodge state**. The canonical Cartethyia / Ciaccona / Rover (Aero) handoff applies only the independently source-backed **Bloodpact's Pledge R1 Unbound Flow 10% Aero DMG Amplification for 30s**. Cartethyia Outro, teammate ATK/CRIT/ER, Hologram dodge/180s modifiers and Augusta defaults are not inferred.

This product context does **not** close BUG-012. It relies only on the independently source-proven Unbound Flow handoff event and its 30-second team-Aero window, which covers Ciaccona's already-fixed 4.5-second personal rotation. Rover (Aero)'s full rotation duration, Bloodpact skill-window overlap and optional-branch timing remain unresolved.

## Existing execution blockers

Keep these fail-closed until stronger source or an explicitly approved measurement method changes the evidence:

- **BUG-008 — Impermanence Heron transfer:** `BLOCKED_SOURCE_CONFLICT`; hit-armed versus cancel/cast-armed evidence conflicts.
- **BUG-009 — Stringmaster / Rime-Draped Sprouts skill-stack lifetime:** `BLOCKED_SOURCE_SEMANTICS`; stack refresh/expiry policy unresolved.
- **BUG-010 — Fallacy profile cast variant:** `BLOCKED_SOURCE_SEMANTICS`; supported rotations do not identify normal/tap versus hold/release.
- **BUG-011 — Defier's Thorn `DT-DEF`:** `BLOCKED_SOURCE_SEMANTICS`; timing grammar ambiguous. Cartethyia remains non-DPS-ready.
- **BUG-012 — Rover (Aero) exact support execution:** `BLOCKED_SOURCE_SEMANTICS`; exact total duration/BPP-SKILL overlap/fixed optional branch unresolved. PR #139 does not close it.
- **BUG-013 — Blazing Brilliance Searing Feather at-cap lifecycle:** `BLOCKED_SOURCE_SEMANTICS`; qualifying events at 14 stacks do not have a source-proven removal-timer rule.
- **BUG-014 — Changli Standard Rotation denominator:** `BLOCKED_SOURCE_SEMANTICS`; source gives only a 1.37-second relative variant delta, not total duration.

Calcharo remains parked: current Void Thunder 5-piece source truth does not prove enough stack-family semantics for an executable peak-stack model.

Carlotta remains parked as a quick closure candidate: her canonical review has five pending IDs, no exact total rotation duration/DPS denominator, and Bellibing has no exact Rank-5 Sentry Construct attack profile. The Last Dance can reuse an existing primitive only after a real timeline exists.

## Echo Core / Alpha / Echo Lab / Roll Assist

- Echo Core: complete for eligible-candidate tuning.
- Public root: registry-driven **Alpha** shell.
- Alpha sequence remains **Character → mode → recommended starting build → Echoes → Analyze**.
- PR #133 added fail-closed profile-aware Roll Assist routing. The only checkpoint-policy binding remains `augusta-standard` → `AUGUSTA_RECOMMENDED_V915`, validated against canonical 4/3/3/1/1 CRIT/Electro/Electro/ATK/ATK layout.
- PR #134 added first owned-Echo checkpoint input: +5/+10/+15/+20/+25, one exact verified Rank-5 substat roll at a time, evaluated by the existing profile-specific checkpoint policy. It is live verified.
- PR #135 extended only the already-supported Augusta path from one Echo to a real five-Echo +25 loadout. Each saved card comes from the same validated owned-Echo input, is checked against canonical slot COST/main-stat layout, then flows through `buildContextFromVerifiedPreset` and `augustaStandardEchoDamageEvaluator`. It is live verified.
- PR #136 added the source-backed Ciaccona static owned-build assembly boundary while deliberately leaving its Alpha DPS binding unregistered pending versioned combat context.
- PR #137 added Augusta candidate-vs-incumbent whole-build decisions and partial future-roll/economics forecasting on top of the same validated five-Echo input.
- PR #139 closes the Ciaccona **whole-build +25 product-input** blocker without inventing a Roll Assist policy: canonical +25 Echo cards are constructed independently from checkpoint stopping policy, five exact Echoes can be saved, and Personal Rotation DPS + ER are evaluated through the registered Ciaccona owned-build adapter and locked Lorelei benchmark context.
- PR #139 also enables the completed +25 whole-build candidate comparison path for Ciaccona. The permanent Chrome contract verifies `DO_NOT_REPLACE` on a completed candidate; no claim is made that partial Ciaccona checkpoint/stopping policy exists.
- Whole-build output remains **Personal Rotation DPS + ER gate**. ER failure must stay visible and cannot be hidden by raw damage.
- Ciaccona still has **no Roll Assist checkpoint/stopping-policy binding**. Alpha keeps `POLICY PENDING`; the new +25 whole-build input capability is intentionally separate.
- Unsupported profile-aware URLs/analysis paths fail closed and never silently reuse Augusta behavior.
- Echo Lab remains the mechanical/debug oracle at `/echo-lab.html`.
- BUG-001 remains fixed/live-verified with permanent Chrome regression.
- BUG-002 remains open for accepted `BETTER` replacement/equipment lifecycle. PR #139 live-verifies Ciaccona `DO_NOT_REPLACE`; it does not provide the missing accepted-`BETTER` lifecycle regression required to close BUG-002.

## Alpha product direction

The product is no longer dashboard-first. The normal path asks one decision at a time.

PR #134 closed the first owned-Echo checkpoint-input gap. PR #135 closed Augusta's real five-Echo whole-build gap. PR #137 uses that exact owned build as the incumbent for candidate decisions and future-roll/economics modeling. PR #139 reuses the shared whole-build boundary for Ciaccona instead of adding parallel Augusta-shaped logic.

Five saved +25 Augusta Echoes unlock `COMPARE AN ECHO` in the existing owned-Echo panel. Five saved +25 Ciaccona Echoes now also reach the shared whole-build Personal Rotation DPS + ER analysis and completed-candidate comparison path under the locked Lorelei benchmark. Ciaccona checkpoint Roll Assist remains unavailable because no independently verified stopping policy is bound.

No new product workstream is selected by this closeout. Remaining gaps stay parked until explicitly selected.

## Verification contract

A final PR head intended for merge must pass source/raw/profile audits, Profile × Adapter/readiness audits, full Node tests, strict web build, real Chrome Alpha + Roll Assist + owned-build regressions, diff/whitespace checks, artifact packaging and Export. Post-merge main is rechecked; UI/live claims require deployed real-Chrome verification.

PR #139 extends both local Verify and post-deploy smoke with `scripts/verify-alpha-ciaccona-owned-build.mjs`. The path must prove Ciaccona exact +25 owned-build input, Personal Rotation DPS + ER, completed candidate comparison, and continued `POLICY PENDING` Roll Assist separation.

Recent exact live checkpoints:

- PR #133 head `82d52346d7f76ef202b2f6cff9e3f76ec039152c`: Verify #614 + Export #586 SUCCESS; merged main `8e0b2f55` passed Verify #615 + Export #587 + Deploy #125 including live Alpha→Augusta Roll Assist.
- PR #134 head `afc7ee18bd7fa8a1d84d1a7f8b648f4520b19a7a`: Verify #616 + Export #588 SUCCESS; merged main `95fab320ab223b855dfba567d3bab976ddf9c62b` passed Verify #617 + Export #589 + Deploy #126. Deploy live job verified Alpha owned +5 CRIT Rate 9.3% → `ROLL TO +10` plus permanent Roll Assist paths.
- PR #135 head `0ca7cf18`: Verify #619 + Export #591 SUCCESS; merged main `4bdc3e405cec23ab5b00ed8a6d7e44c20952d408` passed Verify #620 + Export #592 + Deploy #127. Live Chrome entered 25 exact rolls over five +25 Augusta Echoes and verified Personal Rotation DPS + ER PASS.
- PR #136 merged main `df9e239920bbcf6e8c4a07a3a4ba1cd4c1c11172` passed Verify #630 + Export #602 + Deploy #128. Ciaccona static owned-build assembly is source-backed while Alpha product DPS remains fail-closed pending combat context.
- PR #139 head `a6f55eddadb81e34e27a409984b48e62a1607c78` passed **Verify #655 + Export #627** including 584/584 Node tests, strict web build, diff/whitespace and local real-Chrome Ciaccona owned-build regression. Merged main `bae1b694b0d0df887bf73018429e8c90c86eec86` passed **Verify #656 + Export #628 + Deploy #130**, including deployed real-Chrome Ciaccona exact +25 owned-build / Personal Rotation DPS + ER / `DO_NOT_REPLACE` and continued Roll Assist `POLICY PENDING`.

## Recent completed checkpoints

- PR #123 — shared Aero Erosion state, Ciaccona executable rotation/freeze, Cartethyia reduced to genuine blockers.
- PR #124 — exact Fleurdelys attack data, reusable active-damage primitive, Rover source-only review.
- PR #125 — Profile Source Import Accelerator exact green extraction checkpoint.
- PR #126 — 13 canonical horizontal VERIFIED packages; 11 ambiguities parked; readiness 37/3/15/2.
- PR #128 — Changli semantic checkpoint; Molten Rift primitive; BUG-013/014 parked.
- PR #129 — six additional canonical VERIFIED packages; Mornye intrinsic DEF resolved; readiness 43/3/9/2.
- PR #131 — registry-driven Alpha root and Echo Lab debug-route split.
- PR #132 — deployed root/live-smoke contract aligned and verified.
- PR #133 — canonical profile→Roll Assist policy binding; Augusta live route verified.
- PR #134 — owned-Echo checkpoint analysis live on Alpha using exact verified Rank-5 roll values.
- PR #135 — five actual +25 Augusta Echoes live through canonical whole-build Personal Rotation DPS + ER.
- PR #136 — source-backed Ciaccona static owned-build assembly; product DPS kept fail-closed pending combat context.
- PR #137 — Augusta whole-build candidate decision + partial future-roll/economics loop, with permanent local and post-deploy real-Chrome regression.
- **PR #139 — versioned Ciaccona Lorelei combat context, registered owned-build DPS, policy-independent exact +25 input, completed-candidate comparison, strict-evaluator diagnostic fix, and permanent local/deployed real-Chrome regression.**

## Parked / awaiting explicit selection

No next workstream is selected by this checkpoint.

Known remaining blockers/gaps include:

1. Ciaccona Roll Assist checkpoint/stopping policy remains unbound; do not infer one from whole-build +25 support.
2. BUG-002 remains open until accepted `BETTER` replacement/equipment lifecycle is explicitly regression-verified.
3. The exact **9-row `PROFILE_SOURCE_PENDING`** backlog remains unchanged: Baizhi, Brant, Jianxin, Phoebe, Verina, Yuanwu, Qingxiao, Rover (Electro), Suisui.
4. BUG-008/009/010/011/012/013/014 remain parked at their existing evidence boundaries; PR #139 does not close BUG-012.
5. Broad roster-wide DPS remains blocked until the full Pre-DPS Completeness Gate passes.

Do not begin any of these merely because they are listed here; selection is external to this status document.
