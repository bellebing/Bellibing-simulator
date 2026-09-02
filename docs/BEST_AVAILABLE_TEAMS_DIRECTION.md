# Bellibing Simulator — Best Available Teams product direction

This document records the agreed product/architecture direction for team construction so the decision does not live only in chat history.

It is a product contract, not a Wuthering Waves data source. Character-specific mechanics, timings, buffs, states and damage values still require the normal canonical source/review/execution path.

## Product problem

Bellibing must help a user make the best use of the **Characters that remain available to them**.

The target question is not:

> What is this Character's established meta team?

The target question is:

> Given the Characters I still have available, which team or set of teams gives me the best modeled result?

A team can therefore be the best available choice even when it is not an established guide/meta composition and even when its internal synergy is mediocre. Established teams are valuable evidence and validation fixtures, but they are not the only combinations Bellibing may consider.

## Initial scope boundary

- Initial team construction is **not quickswap-oriented**.
- Do not make otherwise conflicting dual-carry combinations valid by assuming aggressive quickswap play.
- S0/S1/S2 + max-skill remains the active implementation/product scope.
- S3-S6 and lower Character skill levels remain deferred while their raw/source data is retained.
- Missing or disputed mechanics/timing/state remain explicit pending rather than being replaced by optimizer assumptions.

## Optimization objective

### Final judge: modeled team result

Compatibility and synergy are inputs to team construction. They are not the final score by themselves.

When two feasible teams are compared, Bellibing should prefer the team with the stronger verified/modelable result for the selected context even if another team has a more conventional composition or cleaner guide-page synergy.

Until Bellibing has enough executable evidence to calculate a team result truthfully, the optimizer must expose the limitation rather than substitute a generic synergy score and present it as DPS.

### Optimize teams globally, not greedily

For content that consumes Characters across several teams, Bellibing must eventually optimize the **whole remaining roster allocation**.

It must not simply:

1. pick the single highest-output team;
2. remove those Characters;
3. repeat.

That greedy choice can be globally worse if a high-value Character raises one team slightly but would enable a much stronger second team elsewhere.

The intended objective is therefore **Best Available Teams**, plural: choose a set of non-overlapping teams that maximizes the relevant total result under the user's remaining-roster constraints.

## Team compatibility model

The current `DPS | SUB_DPS | SUPPORT | FLEX` labels are useful display/context labels but are too coarse to construct arbitrary teams safely.

Compatibility should be modeled at the **preset/mode context**, not as one permanent Character-global role. A Character may legitimately have different roles in different supported modes.

The minimum semantic contract should be capable of expressing, where source/review evidence exists:

- **field-time demand** — how strongly the mode requires sustained primary on-field time;
- **provides** — buffs, amplification, healing, shields, target states, resource support or other teammate-facing value;
- **benefits from / consumes** — which damage classes, attributes, states or handoffs materially help the mode;
- **off-field contribution** — whether useful effects continue after switching out;
- **handoff behavior** — effects delivered to the incoming Resonator or team at Outro/switch boundaries;
- **required states/triggers** — prerequisites the team must actually be able to create;
- **hard conflicts** — combinations that cannot form a useful non-quickswap rotation under the supported model;
- **unknown/pending semantics** — missing evidence must remain explicit and must not be scored as if known.

Do not create a second hand-maintained Character/mechanics database merely for team scoring. Prefer deriving compatibility facts from canonical Character Mechanics/effects/profiles and add only the smallest explicit semantic layer that the existing architecture cannot represent.

## Primary field-time conflict rule

As an initial non-quickswap rule, two presets that both depend on substantial primary on-field carry windows should normally be treated as incompatible when neither provides enough useful handoff/off-field value to justify the field-time competition.

This is a product-model default, not a claim that such Characters can never be played together in Wuthering Waves. A future explicitly verified archetype may override it when the project intentionally supports that execution style.

## Construction pipeline

The intended future flow is:

`remaining roster`
→ enumerate candidate preset/mode combinations
→ apply hard compatibility/state/field-time constraints
→ construct source-valid rotation/context candidates
→ evaluate actual modeled team output where executable
→ rank feasible teams
→ solve the non-overlapping multi-team roster allocation globally
→ explain why the recommended teams are the best available choices

The explanation should distinguish:

- strong established synergy;
- useful but incomplete synergy;
- low-synergy combinations that still win on actual modeled result;
- combinations rejected by hard field-time/state/trigger conflicts;
- combinations that cannot yet be ranked because required source/execution evidence is pending.

Bellibing should not label a low-synergy roster salvage team as a universally "good team". It should say that it is the **best available** choice for the user's current constraints.

## Reference Team 01

The first foundation slice is the existing verified canonical team:

- Augusta — DPS context;
- Iuno — Hybrid/Sub DPS context;
- The Shorekeeper — Support context.

This team is the first architecture/product reference because Augusta already has executable owned-build DPS and Roll Assist support, while Iuno/Shorekeeper expose the exact kind of teammate handoff/support semantics the future team system must represent.

The milestone is **not** "make every member's personal DPS engine complete." The milestone is:

> Every teammate contribution required to evaluate the supported Augusta team is explicit, source-backed and routed through the correct effect/team/context boundary, with no hidden teammate bonus surviving after the teammate is notionally replaced.

## Audit requirement before large UI

Before building the main team UI, trace Reference Team 01 end-to-end through:

1. raw Character/Weapon/Echo/Sonata data;
2. Character Mechanics and effects;
3. composable profiles/team identity;
4. rotation/execution state;
5. BuildContext and DPS evaluation;
6. product projection.

The audit must specifically identify:

- duplicated truth;
- dead/legacy layers that increase maintenance without product value;
- Character-specific logic that should remain Character-specific;
- Character-specific logic that should become a reusable primitive;
- teammate bonuses hardcoded inside a Character evaluator/context;
- missing semantic contracts needed for Best Available Teams;
- blockers that are genuinely source/timeline-limited and should be parked rather than wrapped in more validation layers.

Use the disposition vocabulary:

- `KEEP`
- `SIMPLIFY`
- `PARK/DELETE`
- `MISSING`

Implementation should follow the audit findings, not precede them.

## Known architecture risk to audit

Current Augusta execution contains team-context values directly in `AugustaStandardContext`, including Shorekeeper-related crit context and other static amplification fields.

That is acceptable only for the currently locked verified context. It becomes dangerous if a future UI swaps teammates while the evaluator silently retains the old team's bonuses.

The Reference Team audit must determine which values are genuinely fixed encounter/build context and which must move behind explicit teammate/effect/context composition before arbitrary team construction is allowed.

## UI gate

Do not build the large Best Available Teams UI until:

- Reference Team 01 has a truthful end-to-end context path;
- the minimal compatibility semantic contract is defined;
- teammate replacement cannot leave stale hidden buffs in the evaluator;
- unsupported combinations fail closed;
- at least one executable reference path proves the architecture can expose a useful decision rather than a chain of `pending` placeholders.

Small diagnostic/dev surfaces are allowed when they help verify the foundation. Visual polish is not the milestone.
