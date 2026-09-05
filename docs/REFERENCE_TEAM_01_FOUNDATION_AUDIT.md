# Reference Team 01 — Foundation Audit

Date: 2026-09-03

Reference Team 01:

- Augusta — DPS context
- Iuno — Hybrid/Sub DPS context
- The Shorekeeper — Support context

This is a targeted product-spine / architecture audit for the first Best Available Teams foundation slice. It is not a full repository audit, not a Character worker, and not an optimizer/UI implementation.

Audit baseline:

- current `main`: `612324b8aba1dd1c4ae8a189ebf74062b291033b`;
- product-direction PR #159 head: `7c8455f478740a62267e230ed5369b380c918580`;
- locked product direction: `docs/BEST_AVAILABLE_TEAMS_DIRECTION.md` from PR #159 while that PR remains unmerged;
- V9.15 is used only as an explicit historical parity/oracle reference where current Augusta execution still depends on that fixture.

The core result is that the repository already has most of the **source facts** needed for Augusta's current teammates, but it does not yet have a truthful **team composition/execution context** that binds selected teammate presets/loadouts, canonical teammate effects, and actual activation/state/timeline to the DPS evaluator. The current Augusta evaluator is safe only while its team is locked and unsupported contexts fail closed. It must not become the backing engine for arbitrary teammate replacement.

No combat-math change is made by this audit. A verified Thunderflare ATK duplication exists in the locked Augusta parity context, but correcting only that scalar now would still leave the evaluator tied to an older teammate-loadout package while the current canonical Iuno/Shorekeeper presets have moved. The fix therefore belongs with the first source-resolved team-context composition change, not as an isolated parity-number edit.

## 1. Verified current data / execution path

### 1.1 Raw/source and effect truth

Character Mechanics stores current source-facing Character facts independently from executable combat assumptions:

- `src/data/characterMechanics/augustaRawFacts.ts`
  - `augusta-inherent-glorys-favor`
  - `augusta-outro-battlesong-effect`
  - `augusta-crown-of-wills-effect`
  - Augusta resource/handoff facts
- `src/data/characterMechanics/iunoRawFacts.ts`
  - Iuno Outro `From Gloom to Gleam`: 50% Heavy Attack DMG Amplification for 14s to the incoming/next Resonator, ending on switch-out
  - Full Moon Domain / Wan Light source semantics: shield-driven 4% all-DMG Amplification stacks, explicit cadence/duration/cap
- `src/data/characterMechanics/theShorekeeperRawFacts.ts`
  - Stellarealm Outer → Inner → Supernal evolution requirements
  - ER-scaled CRIT Rate / CRIT DMG caps
  - Outro 15% DMG Amplification and duration

Weapon/Echo/Sonata source effects are also separate from execution:

- `src/data/weaponEffectsBroadblade.ts`
  - `TFD-ATK`: Thunderflare Dominion R1 permanent +12% ATK
  - `TFD-HEAVY`
  - `TFD-DEF`
- `src/data/echoLoadoutProfiles.ts`
  - current Iuno preset shell: Moonlit Clouds / Impermanence Heron
  - current Shorekeeper shell: Rejuvenating Glow / Fallacy of No Return
- `src/data/weaponRecommendations.ts`
  - current Iuno default: Moongazer's Sigil R1
  - current Shorekeeper default: Stellar Symphony R1
- `src/data/sonataEffects.ts`, `src/data/echoEffects.ts`, `src/data/weaponEffects*.ts`
  - raw/effect ownership remains separate from trigger uptime/state.

This separation is correct and should be preserved.

### 1.2 Profile/team composition truth

`src/data/teamProfiles.ts` owns the canonical established-team identity:

- `augusta-iuno-shorekeeper`
  - Augusta — `DPS`
  - Iuno — `SUB_DPS`
  - The Shorekeeper — `SUPPORT`

`src/data/characterBuildPresets.ts` owns preset/mode composition:

- `augusta-standard` / mode `standard`
- `iuno-augusta-hybrid` / mode `augusta-hybrid`
- `shorekeeper-augusta-support` / mode `augusta-iuno-support`

All three reference the same canonical team identity, but each owns its own Character-specific build/rotation pointer set. This is already the correct place to preserve mode-scoped Character usage rather than assigning one permanent global role to the Character.

`src/profileRegistry.ts` correctly validates profile identity consistency: team membership, team/rotation match, selected Character membership, and profile references. It does **not** claim to validate teammate buff execution, which is correct.

### 1.3 Rotation / execution truth

`src/data/rotationProfiles.ts` contains three different execution states:

- Augusta `augusta-standard-iuno-shorekeeper`
  - `ENGINE_MODELED`
  - `engineModelId: AUGUSTA_STD_V1`
  - exact 11.17s historical parity execution
- Iuno `iuno-augusta-sub-dps-standard`
  - `SOURCE_SEQUENCE_ONLY`
- Shorekeeper `shorekeeper-augusta-support-standard`
  - `SOURCE_SEQUENCE_ONLY`

The Augusta profile's `modeledMechanicFactIds` / `assumedMechanicFactIds` are Augusta-owned facts. `src/data/rotationMechanicsAudit.ts` intentionally enforces same-character ownership for those lists. Therefore teammate facts should **not** be stuffed into Augusta's `assumedMechanicFactIds` as a shortcut. Cross-character contributions need a separate team-context dependency/composition boundary.

`src/characters/augustaStandard.ts` then executes Augusta's fixed historical recipe:

- Character actions resolve canonical Augusta fact identity, while selected-level aggregate parity values remain isolated in `src/characters/augustaStandardMotionValues.ts`;
- False Sovereign attack motion values resolve canonical Echo attack facts;
- `AUGUSTA_STD_V1` supplies fixed encounter, self, weapon, set and teammate-context scalars;
- the action loop applies current historical stack-state assumptions and calls the shared damage kernel.

`src/characters/augustaStandardMotionValues.ts` is correctly isolated as a historical/executable parity fixture rather than being promoted back into raw Character Mechanics. Keep that boundary.

### 1.4 BuildContext / DPS bridge

`src/profileBuildContext.ts::buildContextFromVerifiedPreset()` resolves the canonical preset but then returns the legacy `BuildContext` shape from `src/domain.ts`:

- Character ID
- sequence
- selected weapon
- `teamId`
- Echoes
- max-skills flag
- rotation profile ID

It does **not** carry:

- teammate preset IDs;
- teammate weapon/Echo/Sonata loadout identity;
- canonical teammate contribution/effect IDs;
- resolved activation windows;
- state/timeline dependencies;
- unresolved team dependencies.

`src/characters/augustaEchoEvaluator.ts` protects the current locked implementation by requiring the exact Augusta S0 / Thunderflare R1 / Augusta team / Augusta rotation combination and returning `PENDING`/`NaN` outside that supported envelope.

That fail-closed gate is important. It is why the current fixed context is not automatically a live arbitrary-team-selection bug today. It is also why the same evaluator must not simply be reused underneath future teammate-edit UI.

### 1.5 Product projection

`src/alphaEntryModel.ts` projects team identity from the canonical `PROFILE_REGISTRY`; it does not maintain a second UI Character/team database. Current team display is derived from `resolved.team.members`.

That is the correct product direction. Future team selection should continue to project canonical data and a resolved execution context rather than invent UI-side buff/team assumptions.

## 2. Findings

| Class | Finding | Evidence / symbols | Disposition |
| --- | --- | --- | --- |
| KEEP | Canonical Character Mechanics facts are separated from executable state/uptime. | `characterMechanicsDomain.ts`, `augustaRawFacts.ts`, `iunoRawFacts.ts`, `theShorekeeperRawFacts.ts` | Preserve. Team composition should reference these facts rather than copy their numeric values. |
| KEEP | Weapon/Echo/Sonata raw/effect layers already encode source-facing values, scopes, triggers and pending semantics separately from execution. | `effectDomain.ts`, `weaponEffects*.ts`, `echoEffects.ts`, `sonataEffects.ts` | Preserve. |
| KEEP | `TeamProfile` is an established-team identity/evidence template, not a complete execution context. | `profileDomain.ts::TeamProfile`, `data/teamProfiles.ts` | Preserve this narrow responsibility. |
| KEEP | Role/build usage is already preset/mode-scoped. | `characterBuildPresets.ts` (`augusta-standard`, `iuno-augusta-hybrid`, `shorekeeper-augusta-support`) | Preserve; do not replace with a Character-global role DB. |
| KEEP | `ProfileRegistry` validates identity composition without pretending to prove combat activation. | `profileRegistry.ts` | Preserve. |
| KEEP | Augusta fixed evaluator fails closed outside its exact locked envelope. | `augustaEchoEvaluator.ts::isSupported`, `augustaEchoEvaluator.test.ts` | Preserve until source-resolved team context replaces fixed teammate assumptions. |
| KEEP | Augusta selected-level V9.15 motion-value parity data is isolated from canonical current raw Character facts. | `augustaStandardMotionValues.ts` | Preserve as historical parity/oracle fixture. |
| KEEP | Alpha UI derives team display from canonical profiles. | `alphaEntryModel.ts::resolveAlphaSelection` | Preserve; no second UI team DB. |
| KEEP | Backward-impact review, adapter dependency matrix and readiness/freeze checks serve different purposes. | `profileBackwardImpactReview.ts`, `profileAdapterDependencyMatrix.ts`, `profileReadinessRegistry.ts` | Do not delete merely because they all inspect profiles. They are not interchangeable source-of-truth layers. |
| SIMPLIFY | `AugustaStandardContext` mixes encounter, self, selected weapon/set and teammate contributions in one Character-specific fixed struct. | `augustaStandard.ts::AugustaStandardContext`, `AUGUSTA_STD_V1` | Split future arbitrary-team execution into actor/encounter inputs plus a resolved team-contribution context. Character-specific Augusta action/state logic can remain Augusta-specific. |
| SIMPLIFY | Opaque `staticContextAtkPct = 0.37` is a historical aggregate rather than source-resolved composition. | `augustaStandard.ts::AUGUSTA_STD_V1` | Decompose by canonical contribution source when current teammate loadouts are resolved. |
| SIMPLIFY | Existing generic incoming-transfer primitive stops at Echo/Sonata/Weapon source layers. | `combat/incomingTransferState.ts` | When implementing real Character handoffs, extend the existing primitive to support Character source facts rather than inventing another transfer engine. Do not extend it in isolation before it closes a real dependency. |
| SIMPLIFY | `buildContextFromVerifiedPreset()` drops rich team/profile identity to an ID-only legacy `BuildContext`. | `profileBuildContext.ts`, `domain.ts::BuildContext` | Do not add teammate buffs directly to legacy `BuildContext`. Introduce a resolved team-execution composition object at the DPS boundary. |
| PARK/DELETE | V9.15 static team-context rows are still valuable as parity evidence but must not act as the current teammate database. | historical Augusta parity context / tests | PARK as oracle only. Do not port the old sheet team-buff table into current architecture. |
| PARK/DELETE | Isolated scalar correction of `staticContextAtkPct` would be incomplete while current teammate preset/loadout effects are unresolved. | `AUGUSTA_STD_V1`, current Iuno/SK presets | PARK the number-only patch until the support package is source-resolved. |
| PARK/DELETE | Shorekeeper Fallacy active-damage cast variant is not required to resolve Augusta's personal DPS support buffs. | existing BUG-010 / Shorekeeper pending execution review | PARK for teammate/team-DPS work. Do not make it a Phase 1 Augusta blocker. |
| PARK/DELETE | Broad UI, synergy-score DB, quickswap model and optimizer are premature. | locked Best Available Teams direction | Skip in this phase. |
| MISSING | Team candidate does not identify the exact teammate **preset/loadout package** used by DPS. | `TeamProfile` + legacy `BuildContext` only identify members/team ID | Required before current teammate support effects can be composed truthfully. |
| MISSING | No cross-character team dependency manifest binds an evaluated contribution to canonical source fact/effect + source member/preset + target. | Augusta fixed scalars vs canonical teammate facts | Required. |
| MISSING | No source-valid cross-character event/state/timeline resolves teammate handoffs and buff windows. | Augusta engine contains only Augusta action recipe; Iuno/SK rotations are `SOURCE_SEQUENCE_ONLY` | Required for exact activation/coverage claims. |
| MISSING | Iuno Wan Light needs executable Full Moon Domain state and shield timestamps/cadence. | Iuno raw facts vs Augusta parity stack ramp | Required; current action-per-shield parity assumption is historical, not generic team truth. |
| MISSING | Shorekeeper Stellarealm needs Outer→Inner→Supernal evolution plus ER-at-state resolution. | Shorekeeper raw facts vs fixed max CR/CD scalars | Required before applying 12.5% CR / 25% CDMG as current team truth. |
| MISSING | Current selected support equipment effects are not tied to Reference Team execution. | current Iuno Moonlit/Heron + Shorekeeper Stellar Symphony/Rejuvenating/Fallacy presets | Required where those effects contribute to the evaluated team. Unknown/conflicting semantics stay pending. |
| MISSING | Minimal preset/mode Team Compatibility semantics do not yet exist. | current profile domain has identity/role only | Needed for candidate pruning/explanation before Best Available Teams. |
| MISSING | Required unresolved contribution state is not represented at the team-DPS boundary. | current fixed context is all numeric | Future team evaluator must fail closed when a required contribution remains `UNKNOWN`/`PENDING`. |

## 3. Verified Augusta context correctness problem

### 3.1 Thunderflare ATK is currently duplicated in the locked Augusta path

Current canonical weapon-effect truth contains:

- `src/data/weaponEffectsBroadblade.ts::TFD-ATK`
  - Thunderflare Dominion R1 permanent +12% ATK.

Current Augusta owned-Echo adapter contains:

- `src/characters/augustaEchoEvaluator.ts::AUGUSTA_STANDARD_NON_ECHO.fixedAtkPct = 0.12`
  - this contributes to `upstreamAtk` before the rotation evaluator is called.

The fixed Augusta context then contains:

- `src/characters/augustaStandard.ts::AUGUSTA_STD_V1.staticContextAtkPct = 0.37`.

The explicit V9.15 historical oracle used to build this context decomposes that 37% as:

- Rejuvenating Glow team ATK: 15%;
- Fallacy team ATK: 10%;
- selected Thunderflare permanent ATK: 12%.

Therefore the current locked evaluator path counts Thunderflare's permanent R1 +12% ATK once in `upstreamAtk` and again inside the historical `.37` static context aggregate.

This is a correctness finding, not just a naming issue.

### 3.2 Why this audit does not patch `.37 → .25`

A scalar-only correction would still leave a stale teammate-package boundary:

- current canonical Iuno preset is Moonlit Clouds / Impermanence Heron;
- current canonical Shorekeeper preset uses Stellar Symphony R1 + Rejuvenating Glow / Fallacy;
- the historical Augusta fixed context was built against an older teammate/loadout package, including a Variation-based Shorekeeper context.

So `.25` would mean “historical Rejuvenating + Fallacy, minus duplicated Thunderflare”, not “current canonical Reference Team context”. That would improve one historical calculation while falsely suggesting the team package itself had been resolved.

The correct fix is to stop using an opaque aggregate for arbitrary/current team composition: identify the exact teammate presets/loadouts, resolve their canonical contributions and activation state, then rebaseline Augusta under that source-valid context.

Existing exact V9.15 parity tests should remain as historical regression fixtures even if a future current-context evaluator intentionally produces different numbers.

## 4. Exactly what blocks a truthful complete Augusta team

The following are the Phase 2/3 blockers for truthful Augusta + Iuno + Shorekeeper evaluation.

1. **Exact teammate preset/loadout identity**
   - The team ID proves the three Character identities, not which Iuno/Shorekeeper weapon/Echo/Sonata package the evaluator uses.
   - Current canonical presets have drifted from the older V9.15 support package embedded in Augusta's fixed context.

2. **Thunderflare permanent ATK ownership must be de-duplicated**
   - `TFD-ATK` is already in Augusta upstream stats and must not also remain in an opaque static context aggregate.

3. **Iuno Outro → Augusta handoff**
   - source value is known: 50% Heavy Attack DMG Amplification, 14s, next/incoming Resonator, ends on switch-out;
   - missing: an executable cross-character event/timeline proving Iuno Outro targets Augusta and the relevant Augusta damage window is covered.

4. **Iuno Full Moon Domain / Wan Light lifecycle**
   - source values/cap/cadence are known;
   - missing: Full Moon Domain active state plus actual shield-gain timestamps and 0.5s trigger cadence/10s lifecycle during Augusta's damage window;
   - current parity engine increments Wan Light after each included Augusta damage action because it assumes a shield event after each included Augusta action. That is historical parity behavior, not generic source-resolved timing.

5. **Shorekeeper Stellarealm state and ER-derived CR/CD**
   - source evolution Outer → Inner → Supernal is known;
   - source CR/CD caps are known;
   - missing: exact state evolution before/during Augusta and Shorekeeper's applicable ER state at those timestamps;
   - fixed `12.5% CR / 25% CDMG` cannot become an arbitrary-team constant.

6. **Shorekeeper Outro coverage**
   - source value/duration is known: 15% DMG Amplification for 30s;
   - missing: source-valid team execution proving the buff is active for the evaluated Augusta window, including any intermediary handoff.

7. **Current support equipment contribution composition**
   - Shorekeeper current preset: Stellar Symphony R1 + Rejuvenating Glow + Fallacy of No Return;
   - Iuno current preset: Moongazer's Sigil R1 + Moonlit Clouds + Impermanence Heron;
   - each teammate-facing effect that materially contributes must be resolved from the selected teammate preset and canonical effect row, not copied into Augusta constants;
   - conflicting or unavailable semantics stay pending. In particular, Impermanence Heron transfer remains a source-conflict area and must not be guessed.

8. **Augusta Glory's Favor shield lifecycle**
   - source trigger/lifecycle exists in Augusta raw facts;
   - the generic lifecycle is still `PENDING_INTERPRETATION`;
   - this matters because both Iuno Wan Light and Thunderflare DEF-ignore stacks depend on shield-gain events. A real team timeline cannot use “every included Augusta damage action implies one shield event” as an unexamined universal rule.

9. **Cross-character resolved team context**
   - current `BuildContext` carries IDs only;
   - no object tells the evaluator “this scalar came from this canonical Iuno/Shorekeeper/weapon/Echo/Sonata fact, activated in this state/window, for this target”.

10. **Future total-team ranking needs teammate damage execution, but Augusta support-context closure does not**
    - Iuno and Shorekeeper personal rotations remain `SOURCE_SEQUENCE_ONLY`;
    - this does **not** block resolving their source-valid support contributions to Augusta personal/team-context DPS;
    - it **does** become a blocker when Best Available Teams ranks on full actual team output including their personal damage. Do not turn that later requirement into three full Character-worker projects now.

## 5. Minimal Team Compatibility + context architecture

The smallest useful foundation is two different contracts with different responsibilities. They should not become another database of copied buff numbers.

### 5.1 Preset/mode-scoped `TeamCompatibilityProfile`

Purpose: candidate feasibility/pruning/explanation before expensive execution, not final team scoring.

Minimum semantics:

- `presetId` / mode identity;
- field-time demand;
- `provides` references to canonical mechanics/effect semantics;
- `benefitsFrom` references to damage classes/states/teammate capabilities;
- off-field contribution;
- handoff semantics;
- required states/triggers;
- hard conflicts;
- explicit evidence state per statement: supported / pending / unknown.

Rules:

- no copied 50%, 15%, 12.5%, 25%, etc. if those values already live in canonical facts/effects;
- do not assign one permanent Character-global role when a Character has multiple presets/modes;
- substantial primary-field-time carry modes may hard-conflict in the initial non-quickswap model unless explicit off-field/handoff execution proves otherwise;
- `UNKNOWN` / `PENDING` is first-class and must not be converted into an invented synergy score.

### 5.2 `ResolvedTeamExecutionContext`

Purpose: the actual combat/DPS input that prevents selected-team UI from drifting away from evaluated-team mechanics.

Minimum identity/state:

- exact `teamProfileId`;
- exact selected member `presetId`s / loadout identities;
- exact team execution/rotation variant;
- resolved teammate contributions, each containing:
  - canonical `sourceId` (Character fact, Weapon effect, Echo effect, Sonata effect);
  - source member/preset;
  - target/scope;
  - activation event/state/window;
  - resolution status;
- explicit unresolved required dependencies.

Execution rule:

> If a contribution is required by the evaluator but its source/activation/state is unresolved, the evaluated context is pending. The engine must not silently fall back to the previous teammate's scalar.

This object should be constructed from canonical raw/effect/profile truth. It should not be hand-authored independently by the UI.

### 5.3 Reuse existing shared transfer state

`src/combat/incomingTransferState.ts` already models target-bound incoming effects with activation/expiry/switch semantics for Echo/Sonata/Weapon sources.

When the first real Character handoff is implemented, extend that existing primitive's source layer to Character facts instead of adding a parallel Iuno/Augusta-specific transfer mechanism. Make the extension only when it directly closes an execution dependency.

## 6. What should happen now, later and never

### Now — Phase 1 review/state sync

- land this targeted audit documentation after review;
- synchronize `PROJECT_STATUS` and external AI Handoff with the verified findings;
- register the Augusta fixed-context duplication/loadout-drift issue as open;
- keep broad teammate selection disabled/unimplemented;
- do not change Augusta parity math until the selected current teammate package can be resolved truthfully.

### Next — Phase 2 foundation

Implement only enough contract to close the first exact Reference Team contribution path:

1. add preset/mode-scoped compatibility identity/semantics without copied buff values;
2. add resolved team member preset/loadout identity at the execution boundary;
3. add a canonical contribution/dependency manifest;
4. reuse/extend incoming transfer state for Character handoffs when the first contribution needs it;
5. fail closed on unresolved required contribution state.

A good first implementation target is one direct, source-bounded handoff such as Iuno Outro → Augusta or Shorekeeper Outro → active team state, followed by the harder stateful contributions. Do not claim the team complete after only one contribution is wired.

### Then — Phase 3 Reference Team completion

- resolve exact current support package selection;
- resolve Shorekeeper Stellarealm state and ER-derived crit contribution;
- resolve Augusta shield events + Iuno Wan Light / Thunderflare stack timing;
- resolve all current teammate gear contributions that materially affect Augusta/team output;
- remove stale fixed teammate scalars from arbitrary/current team evaluation;
- rebaseline current Augusta team output under the source-valid context while preserving the separate historical V9.15 parity oracle.

### Later — Phase 4 product engine/UI

Only after the Reference Team contract works:

- enumerate candidate teams from the user's remaining roster;
- reject hard field-time/state/trigger conflicts;
- build executable/source-valid contexts;
- evaluate modeled team output;
- rank feasible teams;
- solve multi-team selection as a global non-overlapping roster allocation problem;
- project results/explanations in UI.

### Skip

- no arbitrary synergy score database;
- no copy of the V9.15 team-buff sheet into current code;
- no broad Best Available Teams optimizer yet;
- no quickswap assumptions in the initial model;
- no Rover Havoc or unrelated Character worker as a side task;
- no deletion of review/readiness layers without evidence that they are genuinely redundant;
- no large UI before resolved team context drives the evaluator.

## 7. Review conclusion

Current foundation is **good at source ownership and profile identity**, but **not yet composable at the team-execution boundary**.

The highest-risk gap is not missing numeric buff data. The important Iuno/Shorekeeper values already exist in canonical facts. The gap is that Augusta's DPS path still consumes historical, opaque teammate scalars and stack assumptions without proving the selected teammate presets, canonical source contributions, activation states and timeline.

Therefore the efficient path is:

- keep existing source/profile separation;
- avoid a second team database;
- make selected teammate preset/loadout identity explicit at execution time;
- resolve each required team contribution from canonical facts/effects;
- reuse shared handoff/state primitives;
- fail closed on unknown state;
- only then expose arbitrary teammate replacement and Best Available Teams ranking.

This closes a real product dependency. Creating more review layers or a large compatibility taxonomy before executable composition would not.