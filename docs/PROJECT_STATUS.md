# Bellibing Simulator — Current Project Status

This file is the canonical **current-state + active-roadmap** checkpoint for Bellibing Simulator.

Detailed chronology belongs in [`PROJECT_STATUS_HISTORY_2026-08-29.md`](PROJECT_STATUS_HISTORY_2026-08-29.md), Git history and the external `Bellibing Echo Tool — AI Handoff` update/bug logs. Product/team-construction direction is recorded in [`BEST_AVAILABLE_TEAMS_DIRECTION.md`](BEST_AVAILABLE_TEAMS_DIRECTION.md).

Bellibing has **not** passed the full Pre-DPS Completeness Gate. Broad roster-wide Character DPS remains blocked. Narrow profiles may become `DPS_READY` only when their exact source, execution, BuildContext and freeze requirements close.

## North star

Bellibing is an Echo/build decision tool. Its job is to answer what the user should do next under their actual Character/build/rotation/roster constraints.

The product direction now includes **Best Available Teams**: given the Characters the user still has available, Bellibing should eventually find the best feasible team or set of non-overlapping teams by modeled result — not merely reproduce established meta teams or rank generic synergy.

Normal UX should give useful decisions rather than expose internal engine complexity by default.

## Verified current baseline — 2026-09-02

Current `main`:

- commit: `612324b8aba1dd1c4ae8a189ebf74062b291033b`;
- PR #151 established the stabilized source-truth/scope baseline;
- PR #156 integrated the reviewed source-safe Mornye support payload;
- PR #158 integrated the reviewed Zani execution preflight/Frazzle target-state payload;
- post-merge **Verify #974 attempt 2**: SUCCESS;
- post-merge **Export #945**: SUCCESS;
- post-merge **Deploy #137**: SUCCESS.

Current registry/readiness truth remains:

- **43 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **9 `PROFILE_SOURCE_PENDING`**;
- **2 `DPS_READY`** — Augusta and Ciaccona.

Zani adds a canonical backward-impact review with 11 still-open execution dependencies, so current execution inventory is:

- **19 backward-impact reviews**;
- **19 reviewed canonical profiles**;
- **17 profiles with pending execution dependencies**;
- **83 exact pending execution edges**;
- semantic queue: **40 UNREVIEWED / 1 SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING / 11 PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE / 5 BLOCKED_SOURCE_CONFLICT / 9 BLOCKED_SOURCE_SEMANTICS / 17 PROFILE_SPECIFIC_EXECUTION** = **41 actionable shared edges**.

Never replace current-main counts with branch-local worker counts.

## Active initial scope

Initial implementation/product support remains deliberately narrower than retained source data:

- **Sequences:** S0, S1 and S2.
- **Character skills:** maxed skills only — Lv10 wherever source data owns an exact Lv1-Lv10 curve.
- **Deferred:** S3-S6 and Character skill levels below max.
- **Retention:** deferred sequence/skill values remain canonical raw/source-facing data and must not be deleted or flattened away.
- **Completeness rule:** S0-safe is not automatically S0-S2-complete. Missing/disputed S1/S2 semantics remain pending.

Quickswap-oriented team optimization is also deferred from the initial Best Available Teams model. Do not make conflicting dual-carry combinations valid by assuming unsupported quickswap execution.

## Architecture boundary

Preserve separation between:

1. raw Character / Weapon / Echo / Sonata source data;
2. Character Mechanics and source-facing facts;
3. Weapon / Echo / Sonata effects;
4. composable profiles/team identity;
5. execution/combat-DPS logic;
6. product/UI projection.

Rules:

- current GitHub code is source truth above documentation/history;
- never guess Wuthering Waves values, timing, state or lifecycle semantics;
- `SOURCE_SEQUENCE_ONLY` is not executable timing evidence;
- a reusable primitive closes nothing until the exact canonical event/state/timeline requirement is satisfied;
- V9.15 is historical oracle/reference only when explicitly needed;
- UI projects canonical registries and must not create a second Character/profile database;
- team compatibility facts should be preset/mode-scoped where roles differ by context, not forced into one permanent Character-global role;
- compatibility/synergy may prune or explain teams, but modeled combat result is the eventual ranking objective.

Owned-Echo product support retains separate explicit boundaries:

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

Unmerged worker facts are not current-main truth until explicitly integrated and reverified.

## Profiles and current product support

Exact `PROFILE_SOURCE_PENDING` on main:

- semantic: **Baizhi, Brant, Jianxin, Phoebe, Verina, Yuanwu**;
- raw/static: **Qingxiao, Rover (Electro), Suisui**.

Current `DPS_READY` profiles:

- Augusta — `augusta-standard` / `AUGUSTA_STD_V1`;
- Ciaccona — `ciaccona-cartethyia-aero` / `CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1`.

Current product boundary:

- Augusta has verified Roll Assist policy + owned-build evaluator;
- Ciaccona has verified +25 whole-build/completed-candidate DPS support under its locked context, but no Roll Assist checkpoint/stopping-policy binding.

## Reference Team 01 — active foundation target

The first full product/foundation slice is the existing verified canonical team:

- **Augusta** — DPS context;
- **Iuno** — Hybrid/Sub DPS context;
- **The Shorekeeper** — Support context.

The milestone is not "finish every teammate's personal DPS engine." It is to make every teammate contribution required by the supported Augusta team explicit, source-backed and correctly composed through team/effect/context boundaries.

Before large team UI work, audit this path end-to-end:

raw/source → mechanics/effects → profiles/team → execution → BuildContext/DPS → product projection.

The audit must classify findings as `KEEP`, `SIMPLIFY`, `PARK/DELETE` or `MISSING` and specifically inspect duplicated truth, dead/legacy layers and hidden team assumptions.

A known architecture risk to inspect is `AugustaStandardContext`: it currently contains fixed team-context values including Shorekeeper-related crit context and static amplification fields. That is valid only while the context is locked. Arbitrary teammate replacement must not become possible until the engine can no longer silently retain stale bonuses from the old team.

### Phase 1 audit result — 2026-09-03

The targeted end-to-end audit is recorded in [`REFERENCE_TEAM_01_FOUNDATION_AUDIT.md`](REFERENCE_TEAM_01_FOUNDATION_AUDIT.md). The important result is that canonical source ownership is mostly in the right place, but team execution composition is not yet truthful/composable enough for arbitrary teammate replacement.

Verified findings:

- Iuno and Shorekeeper already have canonical source facts for the major Augusta-facing values used by the locked evaluator; the missing layer is activation/state/timeline composition, not another numeric buff database;
- current `TeamProfile` proves Character identity/roles but does not identify the exact teammate preset/loadout package consumed by DPS;
- `buildContextFromVerifiedPreset()` resolves canonical profiles and then collapses them to an ID-only legacy `BuildContext`, so teammate contribution source/state is not carried to the evaluator;
- current canonical Iuno/Shorekeeper presets have moved beyond the older support package embedded in the V9.15 Augusta context: Iuno is Moonlit/Heron in the Augusta Hybrid preset and Shorekeeper selects Stellar Symphony R1 with Rejuvenating/Fallacy;
- `AUGUSTA_STD_V1.staticContextAtkPct = 0.37` contains the historical Thunderflare R1 +12% permanent ATK while `augustaEchoEvaluator` already includes the canonical same +12% upstream. This is a verified duplicate contribution in the locked parity path;
- no scalar-only correction was made because the same static context still represents an older teammate-loadout package. Fixing only the duplicate would not create a truthful current Reference Team context;
- the current evaluator remains fail-closed outside its exact supported Augusta/team/rotation envelope, so the fixed teammate scalars are not authorization for dynamic teammate-edit UI;
- broad teammate replacement stays blocked until selected teammate presets/loadouts and required canonical contributions are resolved into an execution context that fails closed on unknown state.

Phase 2 should therefore implement the smallest preset/mode compatibility semantics plus a resolved team-execution context/dependency manifest. It must reference canonical Character/Weapon/Echo/Sonata facts rather than copy their values. The existing incoming-transfer primitive should be extended for Character sources only when doing so closes the first real handoff dependency.

## Best Available Teams — locked product direction

See [`BEST_AVAILABLE_TEAMS_DIRECTION.md`](BEST_AVAILABLE_TEAMS_DIRECTION.md) for the full contract. Core decisions:

- optimize for the **best available** result under the user's remaining-roster constraints, not for a generic "good team" label;
- established/meta teams are evidence/templates and validation fixtures, not the only legal candidates;
- two high-field-time carry modes are normally a hard conflict in the initial non-quickswap model unless an explicitly supported execution archetype proves otherwise;
- team role/field-time semantics belong to preset/mode context where necessary;
- compatibility must be able to represent provides, benefits-from, off-field contribution, handoffs, required states/triggers and hard conflicts;
- missing evidence remains pending rather than receiving guessed synergy value;
- multi-team content must eventually use **global non-overlapping roster allocation**, not greedily pick one team and then optimize the leftovers;
- actual executable/modelable team output is the final ranking target.

## Integrated source-safe boundaries

### Mornye — PR #156

Mornye support/review infrastructure is on main without a readiness/product promotion. Boundedness remains `OR` / `PENDING_INTERPRETATION` / `canResolveIncomingDamage: false`; exact rotation timing, disputed scaling/trigger semantics and predecessor-state gaps remain fail closed.

### Zani — PR #158

Zani's explicit-event Spectro Frazzle → Heliacal Ember target-state primitive is on main. The canonical rotation remains `SOURCE_SEQUENCE_ONLY` and all 11 reviewed execution dependencies remain open. No `DPS_READY`, freeze, BuildContext, Roll Assist or product promotion was made.

Historical worker PR #144 was closed unmerged after #158 became current-main truth so GitHub does not present two competing Zani integration candidates.

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
- **BUG-015** — Zani exact Frazzle/Blazing Justice/Mourning Aix/Character-state/team/timing execution remains incomplete.

Resolved bugs stay in the external bug register/history rather than being repeated here.

## Existing worker backlog

The remaining gameplay/data PRs are old sibling work from the pre-stabilization baseline. Their isolated green CI is evidence, not integration authorization. Do not bulk-compose them.

They are **parked while Reference Team 01/product-foundation audit is active**. Resume an old worker only when it is the highest-leverage route to a product-critical dependency or reusable primitive.

| PR | Scope | Current disposition |
| --- | --- | --- |
| #141 | Rover (Havoc) | next previously reviewed integration candidate; `140%+` remains lower-bound estimated guidance, never an exact ER gate; parked during reference-team audit |
| #140 | Chixia | source-safe worker; `BUG-022`; non-DPS-ready |
| #142 | Galbrena | source-safe preflight; non-DPS-ready |
| #145 | Jiyan | exact Kelpie facts/source boundary; 0 execution IDs closed |
| #146 | Lingyang | source-safe primitives/reviews; all 12 canonical dependencies remain open |
| #147 | Jinhsi | preset-scoped semantic-review fix + opener closures; non-DPS-ready |
| #148 | Sigrika | six closures; nine dependencies remain |
| #149 | Aemeath | eight detailed closures; four blockers remain |
| #150 | Lucilla | verified worker, still draft; `ENGINE_MODELED` overlay but non-DPS-ready/non-product |

## Active roadmap

There is one active roadmap for the initial product foundation.

### Phase 1 — current-truth sync + Reference Team 01 audit

- keep `PROJECT_STATUS` and AI Handoff synchronized to current `main`;
- trace Augusta / Iuno / The Shorekeeper end-to-end through the architecture;
- identify duplicated truth, stale/legacy layers, hardcoded teammate context and real missing contracts;
- do not create a broad UI or another Character worker during this audit;
- implement only small fixes that are clearly required to make the foundation truthful or remove high-cost duplication.

The audit itself is complete on the review branch. No combat-math change was made because the verified Thunderflare duplicate is coupled to an older unresolved teammate-loadout package. Phase 1 exits after review/state synchronization; executable composition work belongs to Phase 2/3.

### Phase 2 — minimal Team Compatibility + context composition contract

Define the smallest source-safe semantic layer required by Best Available Teams:

- preset/mode-scoped field-time demand;
- teammate-facing `provides`;
- `benefits from` / consumed states and damage classes;
- off-field/handoff behavior;
- required states/triggers;
- hard conflicts and explicit unknowns.

Prefer deriving these facts from canonical mechanics/effects/profiles. Do not build a second hand-maintained tier-list database.

At the same time, remove any unsafe hidden teammate coupling that would let UI/team selection drift away from the evaluator's real context.

For Reference Team 01, the execution boundary must additionally identify the selected teammate presets/loadouts and carry source-linked resolved contributions/unresolved dependencies so stale Iuno/Shorekeeper scalars cannot survive a teammate change.

#### Phase 2 first execution-context slice — draft PR #161

Branch-local review progress only; this is **not current-main truth** until integrated.

The first bounded implementation slice now exists on draft PR #161:

- `src/teamExecutionContext.ts` adds a resolved team-execution boundary separate from legacy `BuildContext`;
- every selected team member must resolve an exact verified Character preset, default weapon/rank, Echo/Sonata loadout identity, stat profile and rotation execution identity;
- source-linked contribution dependencies carry canonical `sourceKind + sourceId + source preset/Character + target + RESOLVED/PENDING/UNKNOWN`, with no copied buff values;
- explicit dependency coverage is `PARTIAL | COMPLETE`; `dpsReady` requires `COMPLETE` coverage and zero required unresolved dependencies, so a partial manifest can never turn green by accident;
- `src/data/referenceTeam01ExecutionContext.ts` binds `augusta-standard` + `iuno-augusta-hybrid` + `shorekeeper-augusta-support` and validates the selected canonical source identities;
- `TFD-ATK` is the first source-linked `RESOLVED` contribution because the selected Augusta preset resolves Thunderflare Dominion and the canonical effect remains `PERMANENT / ALWAYS / SELF`;
- Iuno `iuno-outro-from-gloom-to-gleam` and Shorekeeper `the-shorekeeper-liberation-stellarealms` remain required `PENDING` dependencies because their cross-character activation/state/timeline is not yet executable;
- the Reference Team manifest is intentionally `PARTIAL`, therefore `dpsReady = false`;
- missing/mismatched teammate preset selection and unselected contribution sources fail closed in tests.

Initial code head `fbbda2f912f6e3e392d5fdaad00642ac5b1117da` passed full repo **Verify #977** before this status-sync commit. No Augusta evaluator, combat math, Wuthering Waves source data, UI, optimizer or `.37` scalar was changed. `BUG-028` therefore remains open/known-gap rather than fixed.

The next implementation slice should expand only the audited Reference Team dependency coverage and close the first real cross-character handoff/state requirement with source-valid execution evidence. Do not add guessed Team Compatibility semantics merely to fill the contract, and do not consume the resolved team context in DPS until the required contribution set is complete enough to replace stale hidden teammate assumptions safely.

### Phase 3 — make Reference Team 01 product-ready

Close only the execution/context dependencies actually required to evaluate the supported Augusta team truthfully.

Apply the worker stop rule aggressively: if a blocker requires missing/conflicting source or unavailable exact timeline/state evidence, record it and park it. Do not manufacture layers that close no dependency.

The exit criterion is a complete truthful Augusta/Iuno/Shorekeeper decision path, not three independently complete personal-DPS engines.

### Phase 4 — Best Available Teams engine, then main UI

After the reference foundation is proven:

1. enumerate feasible preset/mode team candidates from a remaining roster;
2. reject hard field-time/state/trigger conflicts;
3. construct source-valid execution contexts;
4. evaluate actual modeled output where supported;
5. rank feasible teams;
6. optimize non-overlapping multi-team roster allocation globally;
7. explain why a recommendation is the best available choice and where evidence remains pending.

Build the large/main team UI **after** these contracts work. Small diagnostic/dev UI is allowed when it verifies the foundation.

### Deferred until later

- quickswap-oriented team optimization;
- S3-S6 implementation/product support;
- Character skill levels below max;
- nonessential UI polish;
- unsupported account-sync/API promises;
- broad roster work that does not move the active reference-team/Best Available Teams path.

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