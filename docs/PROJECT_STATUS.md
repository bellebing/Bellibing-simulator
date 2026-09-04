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

#### Phase 2 first execution-context slice — PR #161

Branch-local review progress only; this is **not current-main truth** until integrated.

The first bounded implementation slice is review-ready on PR #161:

- `src/teamExecutionContext.ts` adds a resolved team-execution boundary separate from legacy `BuildContext`;
- every selected team member must resolve an exact verified Character preset, default weapon/rank, Echo/Sonata loadout identity, stat profile and rotation execution identity;
- source-linked contribution dependencies carry canonical `sourceKind + sourceId + source preset/Character + target + RESOLVED/PENDING/UNKNOWN`, with no copied buff values;
- explicit dependency coverage is `PARTIAL | COMPLETE`; `dpsReady` requires `COMPLETE` coverage and zero required unresolved dependencies, so a partial manifest can never turn green by accident;
- `src/data/referenceTeam01ExecutionContext.ts` binds `augusta-standard` + `iuno-augusta-hybrid` + `shorekeeper-augusta-support` and validates the selected canonical source identities;
- `TFD-ATK` is the first source-linked `RESOLVED` contribution because the selected Augusta preset resolves Thunderflare Dominion and the canonical effect remains `PERMANENT / ALWAYS / SELF`;
- Iuno `iuno-outro-from-gloom-to-gleam` and Shorekeeper `the-shorekeeper-liberation-stellarealms` remain required `PENDING` dependencies because their cross-character activation/state/timeline is not yet executable;
- the Reference Team manifest is intentionally `PARTIAL`, therefore `dpsReady = false`;
- missing/mismatched teammate preset selection and unselected contribution sources fail closed in tests.

Initial code head `fbbda2f912f6e3e392d5fdaad00642ac5b1117da` passed full repo **Verify #977** before the status-sync commits. No Augusta evaluator, combat math, Wuthering Waves source data, UI, optimizer or `.37` scalar was changed. `BUG-028` therefore remains open/known-gap rather than fixed.

#### Phase 2 second handoff-lifecycle slice — PR #162

Branch-local review progress only; this is **not current-main truth** until integrated.

The second bounded implementation slice is review-ready on PR #162 and closes the source-proven Iuno Outro handoff lifecycle without manufacturing Reference Team timing:

- `src/combat/incomingTransferState.ts` admits `CHARACTER` as a source layer and can terminate a transfer at an explicit affected-Resonator switch-out event;
- the new switch-out behavior is opt-in per transfer window, so existing Echo/Sonata/Weapon transfers retain their prior duration behavior unless a source-specific adapter proves otherwise;
- `src/combat/iunoOutroTransferAdapter.ts` source-locks `iuno-outro-from-gloom-to-gleam` and derives its Heavy Attack DMG Amplification value and duration from the canonical fact text rather than creating a parallel buff-value table;
- an explicit Iuno `OUTRO_SWITCH` event binds the actual incoming Resonator; activity queries additionally require explicit switch-out event history and end at the earlier of source duration or the affected recipient's switch-out;
- the Reference Team manifest splits Iuno into `iuno-outro-handoff-lifecycle-contract = RESOLVED` and `iuno-outro-augusta-window-overlap = PENDING`;
- Iuno's selected rotation remains `SOURCE_SEQUENCE_ONLY`, so no Iuno Outro timestamp or Augusta Heavy Attack overlap is inferred;
- no canonical profile `pendingExecutionId` is closed merely because the reusable primitive now exists;
- dependency coverage remains `PARTIAL`, `dpsReady = false`, and no Iuno amplification is consumed by Augusta DPS;
- `BUG-028` remains open/known-gap; `.37`, Augusta combat math, Wuthering Waves source data, UI and optimizer are unchanged.

TypeScript/code head `ecaf5815853b9bacfd0ff5b2302fd27b0c0ea23b` passed full repo **Verify #982**. PROJECT_STATUS sync head `c83b7aeff06c027f318ad0327a3e3895113be44b` passed **Verify #983**. Final review/hygiene head `fd1ca912d46393b04f32a5c7196f7e557dfca084` passed full repo **Verify #984**; PR #162 is review-ready.

#### Phase 2 third team-window slice — PR #163

Branch-local review progress only; this is **not current-main truth** until integrated.

The third bounded implementation slice is review-ready on PR #163 and closes only the source-proven Shorekeeper Outro Binary Butterfly team-window lifecycle:

- `src/combat/shorekeeperOutroTeamWindowAdapter.ts` source-locks `the-shorekeeper-outro-binary-butterfly`;
- TEAM scope, DMG Amplification value and duration are derived from the canonical Character fact rather than copied into the Reference Team manifest;
- activation requires an explicit Shorekeeper `OUTRO_SKILL_CAST` event plus explicit selected-team membership, and activity queries cannot apply the window to a non-team Character;
- the Reference Team manifest splits Shorekeeper Outro into `shorekeeper-outro-team-amplification-lifecycle-contract = RESOLVED` and `shorekeeper-outro-augusta-window-overlap = PENDING`;
- Shorekeeper's selected rotation remains `SOURCE_SEQUENCE_ONLY`, so no Outro timestamp or Augusta damage-window overlap is inferred;
- Shorekeeper Stellarealm crit contribution remains separately `PENDING`; this slice does not guess realm evolution, Energy Regen → crit transfer or exact team timing;
- no canonical profile `pendingExecutionId` closes merely because the source-specific lifecycle adapter exists;
- dependency coverage remains `PARTIAL`, `dpsReady = false`, and no Shorekeeper amplification is consumed by Augusta DPS;
- `BUG-028` remains open/known-gap; `.37`, Augusta combat math, Wuthering Waves source data, UI and optimizer are unchanged.

Code head `d0e503d0a446608f217d1a8213cffb8ed2ee3c49` passed full repo **Verify #988**. Final PROJECT_STATUS/Handoff head `810e288445adc666706a1cb54e5dbfba186e5292` passed full repo **Verify #989**; PR #163 is review-ready.

#### Phase 2 blocker audit — Stellarealm and Wan Light

The next two Reference Team state candidates were re-audited against canonical structured data before implementation. Their executable state still fails closed:

- **Shorekeeper Stellarealm:** the canonical fact proves Outer → Inner → Supernal evolution and the source duration, but the executable data does not yet own the exact Energy Regen → party CRIT transfer function. Shorekeeper S1 also states that Discernment no longer ends the existing Stellarealm, which proves a baseline termination interaction exists without structurally specifying the exact S0 termination rule in the baseline fact. Do not infer that lifecycle from the S1 modifier or from the `SOURCE_SEQUENCE_ONLY` rotation.
- **Iuno Blessing of the Wan Light:** the original audit correctly found that the mixed `iuno-forte-lunar-cycle` SELF fact could not safely prove Augusta recipient ownership. PR #167 source-corrects that boundary with a separate current-source recipient fact for the receiving Resonator inside Full Moon Domain. The runtime Domain + Augusta shield + stack timeline is still not executable, so the historical evaluator behavior remains unauthorised as current runtime truth and `BUG-029` stays open.

These findings are blockers, not reasons to manufacture a generic realm/stack engine. Implement only source-valid state that can bind explicit events without invented cross-character timing.

#### Phase 2 fourth healing-support slice — PR #164

Branch-local review progress only; this is **not current-main truth** until integrated.

PR #164 is review-ready and closes only the source-proven activation/lifecycle semantics for the current Shorekeeper **Stellar Symphony + Rejuvenating Glow** support package:

- `src/combat/shorekeeperHealingSupportWindowAdapter.ts` source-locks canonical `the-shorekeeper-skill-chaos-theory-healing`, selected weapon effect `SSY-TEAM-ATK` and selected Sonata effect `REJUV_ATK`;
- Chaos Theory remains the source proof that Shorekeeper has a Resonance Skill which applies party healing;
- Stellar Symphony activates only from an explicit Shorekeeper healing-qualified `RESONANCE_SKILL_CAST` event plus the actually selected weapon/rank;
- Rejuvenating Glow activates only from a separate explicit `HEAL_APPLIED` event plus the actually selected Sonata set; the adapter deliberately does **not** turn a Skill cast into a successful heal automatically, so full-HP/heal-state is not guessed;
- both windows bind explicit selected-team membership and derive their values/durations from canonical Weapon/Sonata catalogs rather than copying them into the team manifest;
- the Reference Team manifest now splits `SSY-TEAM-ATK` and `REJUV_ATK` lifecycle contracts to `RESOLVED`, while their actual Augusta-window overlap remains `PENDING`;
- Shorekeeper remains `SOURCE_SEQUENCE_ONLY`; no Skill/heal timestamp or Augusta overlap is inferred;
- no canonical profile `pendingExecutionId` closes merely because the source-specific lifecycle adapter exists;
- dependency coverage remains `PARTIAL`, `dpsReady = false`, and neither support ATK effect is consumed by Augusta DPS;
- `BUG-028` remains open/known-gap; `.37`, Augusta combat math, Wuthering Waves source data, UI and optimizer are unchanged.

Code head `6df1491ca0faf91f3bbb0b792f6dc58fd28b1668` passed full repo **Verify #990**. Final PROJECT_STATUS/Handoff head `5ff4a716ffc848b451d24c4bcef4963d86eb1bf4` passed full repo **Verify #991**; PR #164 is review-ready.

#### Phase 2 fifth Fallacy support-cast slice — PR #165

Branch-local review progress only; this is **not current-main truth** until integrated.

PR #165 is review-ready and closes only the source-proven non-damage `ON_ECHO_CAST` lifecycle for the currently selected Shorekeeper main Echo, **Fallacy of No Return**:

- `src/combat/fallacySupportWindowAdapter.ts` source-locks canonical `FALLACY_TEAM_ATK` and `FALLACY_WIELDER_ER` from `ECHO_EFFECT_MODELS`;
- activation requires an explicit selected Fallacy `ECHO_SKILL_CAST` event, explicit wielder identity and explicit selected-team membership;
- TEAM ATK and WIELDER Energy Regen remain separate target scopes, and values/durations are read from canonical Echo-effect rows at activation time rather than copied into the Reference Team manifest;
- the Reference Team manifest splits `FALLACY_TEAM_ATK` into a `RESOLVED` lifecycle and `PENDING` Augusta overlap, and splits `FALLACY_WIELDER_ER` into a `RESOLVED` lifecycle and `PENDING` Stellarealm ER-state consumption;
- the generic cast event is authorized only for non-damage effects: `FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW` remains `BLOCKED_SOURCE_SEMANTICS / BUG-010`, no `FALLACY_INITIAL_BLAST` is fired, no hold hit count is invented and no hold-release finisher is selected;
- Shorekeeper remains `SOURCE_SEQUENCE_ONLY`, so no Fallacy cast timestamp, Augusta overlap or Stellarealm ER sampling is inferred;
- no canonical profile `pendingExecutionId` closes merely because this support lifecycle exists;
- dependency coverage remains `PARTIAL`, `dpsReady = false`, and neither Fallacy effect is consumed by Augusta DPS;
- `BUG-028` and `BUG-029` remain open/known gaps; `.37`, Augusta combat math, Wuthering Waves source data, UI and optimizer are unchanged.

Code head `42c0e1c8b341138c2371a6fbf0117decc3d7edab` passed full repo **Verify #992**. Final PROJECT_STATUS/Handoff head `1b72e8f4fdca2472f3f9b117686683ed3dcb1d86` passed full repo **Verify #993**; PR #165 is review-ready.

#### Phase 2 sixth Iuno Moonlit transfer slice — PR #166

Branch-local review progress only; this is **not current-main truth** until integrated.

PR #166 is review-ready and binds the already source-reviewed **Moonlit Clouds 5-piece `S08_5PC_INCOMING_ATK`** lifecycle to the selected Iuno Augusta-Hybrid package without adding another transfer engine:

- the selected Reference Team Iuno loadout must contain `sonata-8`, and the existing `sonataOutroTransferAdapter.ts` contract for `S08_5PC_INCOMING_ATK` is validated at the Reference Team boundary;
- one explicit Iuno `OUTRO_SWITCH` event can activate both the canonical Iuno Character-Outro transfer and Moonlit incoming-ATK transfer for the actual incoming Resonator;
- the two source lifecycles remain distinct: Iuno Character-Outro ends on affected-recipient switch-out or source duration, while Moonlit retains the canonical timed Sonata transfer with no added switch-out termination;
- the Reference Team manifest marks `iuno-moonlit-incoming-atk-lifecycle-contract = RESOLVED` and keeps `iuno-moonlit-augusta-window-overlap = PENDING`;
- Iuno remains `SOURCE_SEQUENCE_ONLY`, so no Outro timestamp or Augusta damage overlap is inferred from prose;
- Impermanence Heron remains separately source-conflicted behind `BUG-008` and is not used as evidence for Moonlit;
- no canonical profile `pendingExecutionId` closes merely because the existing primitive is now bound to this selected package;
- dependency coverage remains `PARTIAL`, `dpsReady = false`, and Moonlit ATK is not consumed by Augusta DPS;
- Moongazer's Sigil was rechecked during this slice: its current modeled effects are SELF/Iuno-personal-DPS state, so they are parked for this Reference Team milestone rather than broadening scope;
- `BUG-028`, `BUG-029`, `BUG-010` and `BUG-008` remain open/blocking as applicable; `.37`, Augusta combat math, Wuthering Waves source data, UI and optimizer are unchanged.

Code head `52d1c3511f227383aab347d0ab409af387d19f60` passed full repo **Verify #994**. Final PROJECT_STATUS/Handoff head `276461e05e029ee7fa6a7ceae029c60109efe011` passed full repo **Verify #995**; PR #166 is review-ready.

#### Phase 2 seventh Iuno Wan Light source-correction slice — PR #167

Branch-local review progress only; this is **not current-main truth** until integrated.

PR #167 corrects canonical Iuno Wan Light source ownership first, without claiming executable Augusta stacks or closing `BUG-029`:

- `iuno-forte-lunar-cycle` remains Iuno `SELF` form/domain-generation state and no longer owns recipient-stack semantics;
- new canonical `iuno-full-moon-domain-wan-light-recipient` owns the receiving-Resonator rule: a receiving Resonator inside Iuno's Full Moon Domain that gains a Shield gains one Blessing of the Wan Light stack at most once every 0.5s;
- the same source fact owns 4% all-DMG Amplification per stack, max 10 stacks, 10s duration, duration refresh on a new stack and removal when that receiving Resonator switches off field;
- `iuno-inherent-derivation` remains separate `SELF` source truth for Iuno's immediate five stacks;
- current Prydwen + Wutheringlab cross-checks dated 2026-09-04 support active/receiving-Resonator semantics and explicitly discuss Augusta as a practical recipient in Iuno/Augusta teams;
- branch-local Character Mechanics count is therefore **1867 canonical facts**, while the current-main coverage checkpoint above correctly remains **1866** until integration;
- source-semantic regressions lock the split, and historical current-coverage snapshots were advanced from 1866 → 1867; ninth-batch Iuno inventory advances from profile/raw 36/35 → 37/36;
- no runtime Full Moon Domain duration/timeline, Augusta shield event/timestamp, Wan Light stack engine or Augusta damage-window overlap is introduced;
- no combat/DPS, `.37`, UI, optimizer, quickswap or unrelated Character behavior changes;
- Reference Team coverage remains `PARTIAL`, `dpsReady = false`, and `BUG-029` remains **HIGH / KNOWN GAP**.

Code/test head `1875aeae65bdaf744956881caf20825a5bd3f4d7` passed full repo **Verify #998** and Character Mechanics import **#134**. A final docs/Handoff verification is still required before PR #167 is review-ready.

The next implementation should model Wan Light recipient/domain/shield/stack runtime only if canonical state can bind explicit events without inventing cross-character timestamps. Otherwise record the unresolved execution boundary and park it. Do not feed source-correct but non-executable Wan Light into Augusta DPS.

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
