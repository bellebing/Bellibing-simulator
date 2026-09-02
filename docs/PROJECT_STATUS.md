# Bellibing Simulator — Current Project Status

This file is the canonical **current-state + active-roadmap** checkpoint for Bellibing Simulator.

Detailed chronology belongs in [`PROJECT_STATUS_HISTORY_2026-08-29.md`](PROJECT_STATUS_HISTORY_2026-08-29.md), Git history and the external `Bellibing Echo Tool — AI Handoff` update/bug logs. Do not turn this file back into a workstream diary.

Bellibing has **not** passed the full Pre-DPS Completeness Gate. Broad roster-wide Character DPS remains blocked. Narrow profiles may become `DPS_READY` only when their exact source, execution, BuildContext and freeze requirements close.

## North star

Bellibing is an Echo-building decision tool. Its job is to answer what the user should do next with the Echo/build in front of them under the selected Character/build/rotation context.

Normal UX should give **one useful decision at a time**. Combat, probability and economy logic may be complex internally, but the default product should not become an analysis dashboard.

## Verified current baseline — 2026-09-02

Current `main`:

- commit: `699dc6a496f80c26f994dd9dfd477a3659609758`;
- PR #151 established the stabilized source-truth/scope baseline;
- PR #156 integrated the reviewed source-safe Mornye support payload from current main;
- post-merge **Verify #970**: SUCCESS;
- post-merge **Export #941**: SUCCESS;
- post-merge **Deploy #135 + live verification**: SUCCESS.

PR #156 adds six Mornye research/support/review/test files. It does **not** edit shared readiness registries, generated profiles, product routing or UI, so current registry-derived readiness/execution counts remain:

- **43 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **9 `PROFILE_SOURCE_PENDING`**;
- **2 `DPS_READY`** — Augusta and Ciaccona;
- **18 backward-impact reviews**;
- **18 reviewed canonical profiles**;
- **16 profiles with pending execution dependencies**;
- **72 exact pending execution edges**;
- semantic queue: **30 UNREVIEWED / 1 SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING / 11 PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE / 5 BLOCKED_SOURCE_CONFLICT / 9 BLOCKED_SOURCE_SEMANTICS / 16 PROFILE_SPECIFIC_EXECUTION** = **31 actionable shared edges**.

Never replace current-main counts with branch-local worker counts.

## Active initial scope

Initial implementation/product support is deliberately narrower than retained source data:

- **Sequences:** S0, S1 and S2.
- **Character skills:** maxed skills only — Lv10 wherever source data owns an exact Lv1-Lv10 curve.
- **Deferred:** S3-S6 and Character skill levels below max.
- **Retention:** deferred sequence/skill values remain canonical raw/source-facing data and must not be deleted or flattened away.
- **Consumer rule:** in-scope runtime explicitly selects max skill values; raw Lv1-Lv10 curves stay intact.
- **Completeness rule:** S0-safe is not automatically S0-S2-complete. Missing/disputed S1/S2 semantics remain pending.

Deferred scope must not create new combat adapters, profile/DPS work or product/UI complexity until an explicit later scope change.

## Architecture boundary

Preserve separation between:

1. raw Character / Weapon / Echo / Sonata source data;
2. Character Mechanics and source-facing facts;
3. Weapon / Echo / Sonata effects;
4. composable profiles;
5. execution/combat-DPS logic;
6. product/UI projection.

Rules:

- current GitHub code is source truth above documentation/history;
- never guess Wuthering Waves values, timing, state or lifecycle semantics;
- `SOURCE_SEQUENCE_ONLY` is not executable timing evidence;
- a reusable primitive closes nothing until the exact canonical event/state/timeline requirement is satisfied;
- V9.15 is historical oracle/reference only when explicitly needed;
- UI projects canonical registries and must not create a second Character/profile database.

Owned-Echo product support has separate explicit boundaries:

- Roll Assist/checkpoint decisions require a verified profile-policy binding;
- whole-build DPS requires an `ENGINE_MODELED` profile plus an explicit source-backed Echo → `DamageEvaluator` adapter;
- `DPS_READY` alone does not automatically authorize either product boundary.

## Current source coverage

### Characters

- 60 Character records; 57 `RELEASED`.
- Character Mechanics: **54 VERIFIED / 3 SOURCE_BLOCKED / 1866 canonical facts**.
- Mechanics blockers: **Buling, Danjin, Xiangli Yao**.
- Raw/static blockers: **Qingxiao `maxEnergy`, Rover (Electro) `maxEnergy`, Suisui `maxEnergy`**.

### Weapons

- **121 / 121 released Weapons** have source-audited effect coverage across **236 effect rows**.
- Trigger/state/stack/target execution semantics remain separate from source-text coverage.

### Echo / Sonata

- **181 / 181 released Echoes** reviewed for stable identity/COST/Sonata membership.
- **34 / 34 released Sonata sets** reviewed.
- Sonata Effect review: **62 / 62 activation tuples / 86 source-backed rows**.
- **181 / 181 released Echo skills** are source-reviewed.
- Main exact Rank-5 Echo attack catalog remains **5 attack profiles / 6 attack facts**.

Unmerged worker facts are not current-main truth until explicitly integrated and reverified.

## Profiles and product support

Exact `PROFILE_SOURCE_PENDING` on main:

- semantic: **Baizhi, Brant, Jianxin, Phoebe, Verina, Yuanwu**;
- raw/static: **Qingxiao, Rover (Electro), Suisui**.

Current `DPS_READY` profiles:

- Augusta — `augusta-standard` / `AUGUSTA_STD_V1`;
- Ciaccona — `ciaccona-cartethyia-aero` / `CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1`.

Product boundary:

- Augusta has verified Roll Assist policy + owned-build evaluator.
- Ciaccona has verified +25 whole-build/completed-candidate DPS support under its locked context, but no Roll Assist checkpoint/stopping-policy binding.

## Mornye integrated boundary

PR #156 makes the reviewed source-safe Mornye support semantics part of current main. This is useful source/execution infrastructure, **not** a readiness promotion.

Preserved fail-closed boundaries include:

- Boundedness keeps `sourceLimitRelationship: 'OR'`, `consumptionModelingStatus: 'PENDING_INTERPRETATION'` and `canResolveIncomingDamage: false`;
- no incoming-damage reducer or guessed Boundedness lifecycle exists;
- exact Loop Rotation duration/action timestamps remain unresolved;
- Critical Protocol scaling remains source-conflicted;
- Reactor Husk active scaling stat remains source-unproven;
- Starfield Calibrator Concerto trigger remains source-conflicted;
- Starfield permanent DEF effect remains a catalog gap;
- Lucy/Rebecca incoming-state timeline remains absent;
- Syntony periodic-heal first-tick phase remains unresolved;
- Mornye remains non-`ENGINE_MODELED`, non-`DPS_READY`, non-freeze and non-product.

The source-proven 260% ER mechanic cap is review evidence only; it is not an invented product gate.

## Active known gaps on main

Keep these fail closed:

- **BUG-002** — accepted `BETTER` replacement lifecycle still lacks explicit end-to-end next-incumbent regression proof.
- **BUG-008** — Impermanence Heron transfer: source conflict.
- **BUG-009** — Stringmaster / Rime-Draped Sprouts skill-stack lifetime: refresh/expiry semantics unresolved.
- **BUG-010** — Fallacy profile cast variant unresolved.
- **BUG-011** — Defier's Thorn `DT-DEF` timing grammar unresolved.
- **BUG-012** — Rover (Aero) exact support execution unresolved.
- **BUG-013** — Blazing Brilliance at-cap lifecycle unresolved.
- **BUG-014** — Changli Standard Rotation exact denominator unresolved.

Resolved bugs stay in the external bug register/history rather than being repeated here.

## Existing worker backlog

The remaining gameplay/data PRs are old sibling work from the pre-stabilization baseline. Their isolated green CI is evidence, not integration authorization. Every selected worker must be recomposed/rebased from then-current main and freshly verified.

Current integration priority:

1. **#144 Zani** — next candidate. Preserve `BUG-015` and all fail-closed Frazzle/Blazing Justice/Mourning Aix/team/timing boundaries.
2. **#141 Rover (Havoc)** — candidate only after Zani is independently integrated and main is green. Preserve `140%+` as `AT_LEAST` estimated guidance, never an exact ER gate.

Other workers remain parked for later individual review:

| PR | Scope | Current disposition |
| --- | --- | --- |
| #140 | Chixia | source-safe worker; `BUG-022`; non-DPS-ready |
| #142 | Galbrena | source-safe preflight; non-DPS-ready |
| #145 | Jiyan | exact Kelpie facts/source boundary; 0 execution IDs closed |
| #146 | Lingyang | source-safe primitives/reviews; all 12 canonical dependencies remain open |
| #147 | Jinhsi | preset-scoped semantic-review fix + opener closures; non-DPS-ready |
| #148 | Sigrika | six closures; nine dependencies remain |
| #149 | Aemeath | eight detailed closures; four blockers remain |
| #150 | Lucilla | verified worker, still draft; `ENGINE_MODELED` overlay but non-DPS-ready/non-product |

Do not bulk-compose sibling workers.

## Active roadmap

There is one active roadmap for the current initial scope.

### Phase 1 — integrate useful existing work cleanly

Process one worker at a time from current main. After every main movement:

- re-read current source truth;
- resolve only real integration conflicts;
- run the full verification contract;
- update current status/Handoff;
- select the next worker only after the new baseline is green.

Do not create more parallel Character workers while this backlog is being integrated.

### Phase 2 — S0-S2 + max-skill coverage

Audit supported Characters/profiles specifically for the active scope:

- S0 execution truth;
- S1 effects/semantics;
- S2 effects/semantics;
- max-skill damage/resource facts;
- required Weapon/Echo/Sonata/team state;
- exact source blockers.

This is a coverage audit, not permission to invent missing execution data.

### Phase 3 — executable combat / DPS closure

Promote profiles only when actual dependencies close.

**Worker stop rule:** if remaining blockers require missing/conflicting source, unavailable exact timeline/state evidence or deferred scope, park the Character and stop. Do not keep building validation-only layers that close no canonical dependency.

`ENGINE_MODELED` and `DPS_READY` are exact claims, not architecture milestones.

### Phase 4 — product activation

For sufficiently verified profiles, connect the shared product architecture rather than creating Character-specific calculators:

- owned five-Echo build evaluation;
- mandatory gates;
- candidate-vs-incumbent replacement;
- Roll Assist/stopping policy when independently verified;
- Upgrade Mode / best-next-improvement economics.

The product should continue answering the user's next action instead of exposing engine complexity by default.

### Deferred until later

- S3-S6 implementation/product support;
- Character skill levels below max;
- nonessential UI polish;
- unsupported account-sync/API promises;
- side work that does not move the active S0-S2/max-skill decision-tool path.

## Verification contract

A merge-intended head must pass:

- source/raw/profile audits;
- Profile × Adapter/readiness audits;
- full Node tests;
- strict web build;
- permanent real-Chrome Alpha/Roll Assist/owned-build regressions;
- diff/whitespace checks;
- artifact packaging / Export.

After merge, recheck main. UI/live claims require deployed real-Chrome verification where applicable.
