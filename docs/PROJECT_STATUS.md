# Bellibing Simulator — Current Project Status

This is the canonical current-state checkpoint for Bellibing Simulator. Detailed chronology lives in [`PROJECT_STATUS_HISTORY_2026-08-29.md`](PROJECT_STATUS_HISTORY_2026-08-29.md), Git history, and the external AI Handoff update log.

`FOUNDATION` means architecture exists and is tested but supported-content coverage is incomplete. `COMPLETE` means the layer has the data/behavior required for its supported scope with no known blocking gap. `BLOCKED` means a known gap prevents that layer from being called complete.

Bellibing has **not** passed the full Pre-DPS Completeness Gate. Broad roster-wide Character DPS remains blocked. Narrow vertical slices may become `DPS_READY` only after their exact source, execution and freeze requirements close.

## Verified current baseline — 2026-09-02

The accepted stabilization baseline is current `main`:

- **main:** `c4f67bc65dda110709b5f98056f4b8d513c7bda1` — merged PR #151, docs/source-of-truth stabilization;
- **post-merge Verify #964:** SUCCESS;
- **post-merge Deploy #134:** SUCCESS;
- **pre-merge exact-tree evidence:** PR #151 head `fdb7d1a77f42729f5e5fc229649271f47095e01f`, Verify #963 + Export #934 SUCCESS;
- **product behavior:** unchanged from the previously live-verified `2af8221b13448c9a0cc6749e3d6234b8e6c1efd8` checkpoint; PR #151 changed documentation only.

Current-main registry truth remains:

- **43 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **9 `PROFILE_SOURCE_PENDING`**;
- **2 `DPS_READY`** — Augusta and Ciaccona;
- **18 backward-impact reviews**;
- **18 reviewed canonical profiles**;
- **16 profiles with pending execution dependencies**;
- **72 exact pending execution edges**;
- semantic queue: **30 UNREVIEWED / 1 SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING / 11 PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE / 5 BLOCKED_SOURCE_CONFLICT / 9 BLOCKED_SOURCE_SEMANTICS / 16 PROFILE_SPECIFIC_EXECUTION** = **31 actionable shared edges**.

Do not replace current-main counts with counts from an unmerged worker or integration branch.

## Architecture boundary

Preserve the existing separation between:

1. raw Character / Weapon / Echo / Sonata source data;
2. Character Mechanics and source-facing facts;
3. Weapon / Echo / Sonata effects;
4. composable profile catalogs;
5. execution/combat-DPS adapters and engines;
6. product/UI projection.

V9.15 is historical oracle/reference only where explicitly required. `SOURCE_SEQUENCE_ONLY` never becomes executable by assumption. A source-safe primitive does not close a profile dependency until the exact canonical event/timeline/state evidence required by that profile is available.

The Alpha UI is a projection of canonical registries, not a second profile database. Frontend code must not invent Character, mode, team, Weapon, Echo shell, timing, Roll Assist policy or DPS truth.

Owned-Echo analysis keeps two separate fail-closed boundaries:

- checkpoint/Roll Assist requires an independently verified profile-policy binding;
- whole-build DPS requires a verified `ENGINE_MODELED` profile plus an explicit source-backed Echo→`DamageEvaluator` adapter for that exact profile.

`DPS_READY` alone authorizes neither boundary.

## Initial implementation scope

The active initial implementation/product scope is deliberately narrower than retained source coverage:

- **Sequence scope:** S0, S1 and S2 only.
- **Skill-level scope:** maxed Character skills only — Lv10 wherever the source owns an exact Lv1-Lv10 coefficient table.
- **Retained source data:** S3-S6 facts and lower skill-level values remain canonical raw/source-facing data. They must not be deleted, flattened away or rewritten merely because they are outside the initial implementation scope.
- **Deferred implementation:** S3+ and skill levels below max do not create new adapter, combat/DPS, profile, product or UI work now.
- **Raw/model boundary:** full Lv1-Lv10 raw motion-value curves remain source truth; in-scope consumers explicitly select max level.
- **Completeness boundary:** an S0-safe integration can be valid without proving S1/S2 completeness. Missing or disputed S1/S2 effects/execution semantics remain fail-closed.

Never force blocked Wuthering Waves data to satisfy this scope.

## Current source coverage

### Characters

- 60 Character records; 57 `RELEASED`.
- Character Mechanics: **54 VERIFIED / 3 SOURCE_BLOCKED / 1866 canonical facts**.
- Mechanics source blockers: **Buling, Danjin, Xiangli Yao**.
- Raw/static blockers: **Qingxiao `maxEnergy`, Rover (Electro) `maxEnergy`, Suisui `maxEnergy`**.

### Weapons

- **121 / 121 released Weapons** have source-audited effect coverage across **236 effect rows**.
- Trigger/state/stack/target semantics remain separate execution concerns; source text never implies automatic uptime.

### Echo / Sonata

- **181 / 181 released Echoes** verified current for stable identity/COST/Sonata membership.
- **34 / 34 released Sonata sets** verified current.
- Sonata Effect review: **62 / 62 activation tuples / 86 source-backed rows**.
- **181 / 181 released Echo skills** are source-reviewed.
- Current-main Echo non-damage coverage: **63 modeled rows across 37 Echoes**.
- Current-main exact Rank-5 Echo attack catalog: **5 attack profiles / 6 attack facts**.

Unmerged branches may contain additional attack/effect facts. They are not current-main truth until explicitly integrated and verified.

## Composable profiles and readiness

Independent Weapon Recommendation, Echo Loadout, Stat Target, Team, Rotation and Character Preset catalogs are live and cross-validated. Candidate/profile pipelines remain fail closed: extraction cannot approve semantic truth, `SOURCE_SEQUENCE_ONLY` never implies timing/uptime, readiness is registry-derived, and ambiguity stays pending.

The exact `PROFILE_SOURCE_PENDING` queue on main remains:

- semantic blockers: **Baizhi, Brant, Jianxin, Phoebe, Verina, Yuanwu**;
- raw/static blockers: **Qingxiao, Rover (Electro), Suisui**.

Current narrow `DPS_READY` fixtures remain only:

- Augusta — `augusta-standard` / `AUGUSTA_STD_V1`;
- Ciaccona — `ciaccona-cartethyia-aero` / `CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1`.

Augusta retains verified Roll Assist policy and owned-build evaluation. Ciaccona retains its locked +25 whole-build/completed-candidate support but still has no Roll Assist checkpoint/stopping-policy binding.

## Known current-main execution/product gaps

Keep these fail closed until stronger source or an explicitly approved measurement method changes the evidence:

- **BUG-002:** accepted `BETTER` replacement lifecycle still lacks explicit end-to-end next-incumbent regression proof.
- **BUG-008:** Impermanence Heron transfer — `BLOCKED_SOURCE_CONFLICT`.
- **BUG-009:** Stringmaster / Rime-Draped Sprouts skill-stack lifetime — `BLOCKED_SOURCE_SEMANTICS`.
- **BUG-010:** Fallacy profile cast variant — `BLOCKED_SOURCE_SEMANTICS`.
- **BUG-011:** Defier's Thorn `DT-DEF` timing grammar — `BLOCKED_SOURCE_SEMANTICS`.
- **BUG-012:** Rover (Aero) exact support execution — `BLOCKED_SOURCE_SEMANTICS`.
- **BUG-013:** Blazing Brilliance Searing Feather at-cap lifecycle — `BLOCKED_SOURCE_SEMANTICS`.
- **BUG-014:** Changli Standard Rotation denominator — `BLOCKED_SOURCE_SEMANTICS`.

`BUG-001` remains fixed/live-verified with permanent Chrome regression.

## Active integration — Mornye

Draft PR **#154** is the first post-stabilization integration candidate. It is built directly from current main `c4f67bc65dda110709b5f98056f4b8d513c7bda1` rather than reusing sibling history.

The worker payload is exactly the six byte-identical files from source worker #143 head `f1522b613958f4ab0acbd6fa511c9e8a09a9b8ff`:

- `data/research/mornye-combat-closure-2026-08-31.json`;
- `src/combat/mornyeSupportEvents.ts`;
- `src/data/mornyeExecutionReview20260831.ts`;
- `src/data/profileMornyeImpact20260831.ts`;
- `test/mornyeBoundednessBoundary.test.ts`;
- `test/mornyeCombatClosure.test.ts`.

The initial exact six-file integration head `ccd54a5526c22d3dca8060aed309ab29c455ddd7` passed **Verify #965 + Export #936** before this status resync was added. The final #154 head must pass fresh Verify + Export again after this documentation commit before it is review-ready.

### Mornye scope and fail-closed boundary

The source worker is canonical **S0** review material. Integrating it is compatible with the active S0-S2 scope but does **not** prove Mornye S1/S2 completeness and does not create S3+/lower-skill implementation work.

Preserved boundaries:

- Boundedness keeps `sourceLimitRelationship: 'OR'`, `consumptionModelingStatus: 'PENDING_INTERPRETATION'`, and `canResolveIncomingDamage: false`;
- no incoming-damage reducer or guessed Boundedness lifecycle is introduced;
- exact Loop Rotation duration/action timestamps remain unresolved;
- Critical Protocol scaling remains conflicted between current Bellibing raw ATK and reviewed source DEF;
- Reactor Husk active scaling stat remains source-unproven;
- Starfield Calibrator 8-Concerto trigger remains source-conflicted;
- Starfield permanent DEF +16% remains an effect-catalog gap;
- Lucy/Rebecca incoming-state timeline remains absent;
- Syntony periodic-heal first-tick phase remains unresolved;
- no `ENGINE_MODELED`, `DPS_READY`, freeze, Roll Assist, owned-build or product promotion occurs.

The source-proven 260% Energy Regen mechanic cap remains review evidence only; it is not used to hand-edit the generated profile or fabricate a product gate.

## Remaining worker disposition

Gameplay/data workers remain sibling source branches and are not a dependency chain. After Mornye, the reviewed conflict-surface order is:

1. **#144 Zani** — candidate only after Mornye is separately accepted and post-merge verified; head `bd92dc25`, Verify #686 + Export #658 SUCCESS; `BUG-015` remains open.
2. **#141 Rover (Havoc)** — candidate only after Zani is separately accepted and post-merge verified; head `f8422adb`, Verify #952 + Export #923 SUCCESS; `140%+` remains `AT_LEAST` estimated guidance, never an exact ER gate.

Other source workers remain parked/reviewable individually:

| PR | Scope | Current head | Verified disposition |
| --- | --- | --- | --- |
| #140 | Chixia | `b30722bb` | green; `BUG-022`; non-DPS-ready |
| #142 | Galbrena | `af24c988` | green; source-safe preflight; non-DPS-ready |
| #143 | Mornye source worker | `f1522b61` | source for #154 exact six-file payload; do not merge separately |
| #145 | Jiyan | `eb4a35ff` | green; exact Kelpie source boundary; non-DPS-ready |
| #146 | Lingyang | `15d52c7d` | green; all 12 canonical dependencies remain open |
| #147 | Jinhsi | `985ef139` | green; preset-scoped review fix; non-DPS-ready |
| #148 | Sigrika | `e3db50f6` | green; nine dependencies remain |
| #149 | Aemeath | `5135512f` | green; four detailed blockers remain |
| #150 | Lucilla | `a385f948` | green but still draft; non-DPS-ready/non-product |

Control/UI work remains parked:

- **#152:** draft historical rehearsal evidence only; stale after baseline movement; do not merge.
- **#153:** draft UI-only dropdown work, **PARKED / OUT OF CURRENT DIRECTION**; `BUG-027` remains `RESOLVED IN WORKER / UNMERGED`.

## Write-target incident boundary

`BUG-026` remains **RESOLVED / CONTAINED**. The accidental commits from the earlier connector incident are history-only. Current main was verified after #151 merge and the new Mornye integration branch was created from exact main with explicit branch/ref targets. Do not use branch-mutating file writes without an explicit target and immediate ref verification.

## Verification contract

A head intended for merge must pass:

- source/raw/profile audits;
- Profile × Adapter/readiness audits;
- full Node tests;
- strict web build;
- permanent real-Chrome Alpha/Roll Assist/owned-build regressions;
- diff/whitespace checks;
- artifact packaging and Export.

Post-merge main is rechecked. UI/live claims require deployed real-Chrome verification where applicable.

## Current decision boundary

PR #154 is the next integration decision point. It must remain unmerged until its **final exact head** passes fresh Verify + Export and an explicit human merge authorization is given.

If #154 is authorized and merged, re-read and fully verify new main before touching #144. Never bulk-compose sibling workers, never promote `SOURCE_SEQUENCE_ONLY` by assumption, and never force missing S1/S2 or other Wuthering Waves source truth.