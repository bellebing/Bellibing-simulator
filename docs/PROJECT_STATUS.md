# Bellibing Simulator — Current Project Status

This document is the current implementation and roadmap checkpoint for Bellibing Simulator. Detailed pre-2026-08-29 chronology lives in [`PROJECT_STATUS_HISTORY_2026-08-29.md`](PROJECT_STATUS_HISTORY_2026-08-29.md) and Git history.

`FOUNDATION` means architecture exists and is tested but supported-content coverage is incomplete. `COMPLETE` means the layer has the data/behavior required for its supported scope with no known blocking gap. `BLOCKED` means a known gap prevents that layer from being called complete.

Bellibing has **not** passed the full Pre-DPS Completeness Gate. Broad roster-wide Character DPS remains blocked. Narrow vertical slices may become `DPS_READY` only after their exact source, execution and freeze requirements close.

## Current baseline

Current fully verified deployed baseline entering this checkpoint: `4bdc3e405cec23ab5b00ed8a6d7e44c20952d408` after PR #135.

- **Verify #620 SUCCESS**;
- **Export #592 SUCCESS**;
- **Deploy #127 SUCCESS**;
- live Chrome entered 25 exact rolls across five +25 Augusta Echoes, saved all five, and verified **Personal Rotation DPS + ER PASS** plus the permanent Roll Assist regression paths.

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

Ciaccona now has an independently reviewed static owned-build assembly boundary for the exact S0 / Woodland Aria R1 / Gusts of Welkin + Nightmare: Kelpie profile. It derives Character raw stats, Minor Fortes, Woodland Aria static stats/permanent ATK, Gusts 2-piece, Kelpie main-slot Aero bonus, exact owned Echo stats and the canonical 115% ER gate from current registries. Woodland Aria trigger state, Gusts 5-piece, Solo Concert and Winds of Rinascita remain owned by the existing 4.5-second execution engine and are not duplicated statically.

Ciaccona owned-build DPS is **still fail-closed in Alpha**. The DPS freeze authorizes explicit caller-provided combat/enemy context, but Bellibing does not yet have one independently verified, versioned Alpha default for `enemyDefense`, `enemyAeroResistance` and exact team buff/amplification values/uptime. The explicit-context evaluator exists only behind that boundary and is deliberately not registered in `ownedBuildAnalysis`.

## Existing execution blockers

Keep these fail-closed until stronger source or an explicitly approved measurement method changes the evidence:

- **BUG-008 — Impermanence Heron transfer:** `BLOCKED_SOURCE_CONFLICT`; hit-armed versus cancel/cast-armed evidence conflicts.
- **BUG-009 — Stringmaster / Rime-Draped Sprouts skill-stack lifetime:** `BLOCKED_SOURCE_SEMANTICS`; stack refresh/expiry policy unresolved.
- **BUG-010 — Fallacy profile cast variant:** `BLOCKED_SOURCE_SEMANTICS`; supported rotations do not identify normal/tap versus hold/release.
- **BUG-011 — Defier's Thorn `DT-DEF`:** `BLOCKED_SOURCE_SEMANTICS`; timing grammar ambiguous. Cartethyia remains non-DPS-ready.
- **BUG-012 — Rover (Aero) exact support execution:** `BLOCKED_SOURCE_SEMANTICS`; exact total duration/BPP-SKILL overlap/fixed optional branch unresolved.
- **BUG-013 — Blazing Brilliance Searing Feather at-cap lifecycle:** `BLOCKED_SOURCE_SEMANTICS`; qualifying events at 14 stacks do not have a source-proven removal-timer rule.
- **BUG-014 — Changli Standard Rotation denominator:** `BLOCKED_SOURCE_SEMANTICS`; source gives only a 1.37-second relative variant delta, not total duration.

Calcharo remains parked: current Void Thunder 5-piece source truth does not prove enough stack-family semantics for an executable peak-stack model.

Carlotta remains parked as a quick closure candidate: her canonical review has five pending IDs, no exact total rotation duration/DPS denominator, and Bellibing has no exact Rank-5 Sentry Construct attack profile. The Last Dance can reuse an existing primitive only after a real timeline exists.

## Echo Core / Alpha / Echo Lab / Roll Assist

- Echo Core: complete for eligible-candidate tuning.
- Public root: registry-driven **Alpha** shell.
- Alpha sequence remains **Character → mode → recommended starting build → Echoes → Analyze**.
- PR #133 added fail-closed profile-aware Roll Assist routing. The only binding is `augusta-standard` → `AUGUSTA_RECOMMENDED_V915`, validated against canonical 4/3/3/1/1 CRIT/Electro/Electro/ATK/ATK layout.
- PR #134 added first owned-Echo checkpoint input: +5/+10/+15/+20/+25, one exact verified Rank-5 substat roll at a time, evaluated by the existing profile-specific checkpoint policy. It is live verified.
- PR #135 extended only the already-supported Augusta path from one Echo to a real five-Echo +25 loadout. Each saved card comes from the same validated owned-Echo input, is checked against canonical slot COST/main-stat layout, then flows through `buildContextFromVerifiedPreset` and `augustaStandardEchoDamageEvaluator`. It is live verified on main `4bdc3e40`.
- Whole-build output is **Personal Rotation DPS + ER gate**. ER failure must stay visible and cannot be hidden by raw damage.
- Ciaccona is `DPS_READY`; its static owned-build assembly is source-backed, but it still has neither a Roll Assist checkpoint binding nor a verified versioned Alpha combat-context default. Both product paths remain unavailable until independently verified.
- Unsupported profile-aware URLs/analysis paths fail closed and never silently reuse Augusta behavior.
- Echo Lab remains the mechanical/debug oracle at `/echo-lab.html`.
- BUG-001 remains fixed/live-verified with permanent Chrome regression.
- BUG-002 remains the known +25 best-so-far/equipment lifecycle gap.

## Alpha product direction

The product is no longer dashboard-first. The normal path asks one decision at a time.

PR #134 closed the first owned-Echo checkpoint-input gap. PR #135 closed Augusta's real five-Echo whole-build gap: five actual +25 Echoes now reach Personal Rotation DPS + ER instead of a placeholder. No generic score was introduced.

The current Ciaccona checkpoint narrows its owned-build gap without inventing combat truth: static Echo→`CiacconaBuildInputs` assembly is now explicit and source-backed, while the unresolved versioned enemy/team context remains a separate fail-closed product dependency.

Next Alpha work should prioritize:

1. independently source/review one versioned Ciaccona enemy/team combat context before registering owned-build DPS in Alpha;
2. then use the existing whole-build analysis boundary for candidate-vs-incumbent upgrade decisions where the exact profile evaluator exists;
3. preserve the one-question/one-decision UX rather than adding a statistics dashboard.

## Verification contract

A final PR head intended for merge must pass source/raw/profile audits, Profile × Adapter/readiness audits, full Node tests, strict web build, real Chrome Alpha + Roll Assist regression, diff/whitespace checks, artifact packaging and Export. Post-merge main is rechecked; UI/live claims require deployed real-Chrome verification.

Recent exact live checkpoints:

- PR #133 head `82d52346d7f76ef202b2f6cff9e3f76ec039152c`: Verify #614 + Export #586 SUCCESS; merged main `8e0b2f55` passed Verify #615 + Export #587 + Deploy #125 including live Alpha→Augusta Roll Assist.
- PR #134 head `afc7ee18bd7fa8a1d84d1a7f8b648f4520b19a7a`: Verify #616 + Export #588 SUCCESS; merged main `95fab320ab223b855dfba567d3bab976ddf9c62b` passed Verify #617 + Export #589 + Deploy #126. Deploy live job verified Alpha owned +5 CRIT Rate 9.3% → `ROLL TO +10` plus permanent Roll Assist paths.
- PR #135 head `0ca7cf18`: Verify #619 + Export #591 SUCCESS; merged main `4bdc3e405cec23ab5b00ed8a6d7e44c20952d408` passed Verify #620 + Export #592 + Deploy #127. Live Chrome entered 25 exact rolls over five +25 Augusta Echoes and verified Personal Rotation DPS + ER PASS.

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
- **PR #135 — five actual +25 Augusta Echoes live through canonical whole-build Personal Rotation DPS + ER.**

## Next work

1. Keep Ciaccona owned-build Alpha binding fail-closed until one independently verified, versioned enemy/team combat context exists; do not copy Augusta defaults or infer Rover (Aero) uptime.
2. Work from the exact **9-row `PROFILE_SOURCE_PENDING`** backlog, never the old 15.
3. Do not re-research Baizhi, Brant, Jianxin, Phoebe, Verina or Yuanwu without new evidence.
4. Inspect Qingxiao, Rover (Electro) and Suisui `maxEnergy` horizontally; close only with stronger current evidence.
5. Do not force Carlotta, Calcharo or BUG-008/009/010/011/012/013/014 closures.
6. Once a Ciaccona combat-context default is independently verified, register it through the existing owned-build boundary and then live-verify the Alpha path; until then the explicit-context evaluator remains non-product.
7. Never fabricate teams, defaults, ER requirements, rotations, mechanics, trigger uptime, stack-refresh policy, roll policies, timestamps or Character stat assembly.
