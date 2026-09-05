# Bellibing Simulator — Current Project Status

Last reconciled: 2026-09-05

This is the canonical living roadmap. Historical PR bodies, old worker branches and update-log rows may explain how the project got here, but they are not the active roadmap.

## 1. Implementation truth

### Current `main`

- Canonical implementation truth remains `main` at `612324b8aba1dd1c4ae8a189ebf74062b291033b` until an explicitly authorized merge changes it.
- This is the post-Zani baseline after merged Mornye/Zani integrations.
- Post-Zani verification recorded in project handoff: Verify #974 attempt 2, Export #945 and Deploy #137 succeeded.
- Current-main readiness snapshot remains `43 PROFILE_COMPLETE_PENDING_FREEZE / 3 CHARACTER_MECHANICS_SOURCE_BLOCKED / 9 PROFILE_SOURCE_PENDING / 2 DPS_READY`.
- Current-main execution snapshot remains `19 reviews / 19 reviewed profiles / 17 profiles with pending execution / 83 exact edges`, queue `40/1/11/5/9/17 = 41 actionable shared`.

### Review-ready Reference Team payload

The old Reference Team stack #159 → #173 is a linear descendant of current main. The verified final head is:

- `f4abdda16cddc17c2fc757a3d3829830efdf0982`
- merge-base with current main: exactly `612324b8aba1dd1c4ae8a189ebf74062b291033b`
- ahead of main: 98 commits
- behind main: 0 commits
- final #173 Verify #1037: SUCCESS

The intended net payload from current main to that head is preserved by the Factory cutover branch. The old stacked PRs are review checkpoints/history, not a second implementation universe and not the future merge path.

## 2. One active development direction

**ACTIVE DEVELOPMENT MODEL: BELLIBING FACTORY v1**

Factory is a development/data pipeline. It does not replace the product goal.

**PRODUCT GOAL: BEST AVAILABLE TEAMS**

The locked product contract remains `docs/BEST_AVAILABLE_TEAMS_DIRECTION.md`:

- recommend the best team(s) the user can actually build from the remaining roster;
- actual executable/modelable result is the ranking target;
- established/meta teams are evidence/templates, not the only legal candidates;
- role/field-time belongs to preset/mode context where needed;
- initial model is non-quickswap;
- substantial competing primary-field-time modes may hard-conflict;
- multi-team optimization is global non-overlapping roster allocation, not greedy best-first selection.

Do not restart Character-by-Character workers as the roadmap. Do not start another bounded #174-style Reference Team semantic slice. Reference Team 01 is now a golden regression/proof case for Factory.

## 3. Reference Team 01 — golden regression state

Team: **Augusta / Iuno / The Shorekeeper**.

Verified #173-head state:

- dependency coverage: `PARTIAL`
- `dpsReady = false`
- six exact required dependencies remain `PENDING`
- unresolved semantics remain fail-closed
- Augusta `.37` historical static context is unchanged
- Wan Light is not consumed by Augusta DPS
- unresolved numeric Shorekeeper Stellarealm Crit composition is not guessed

### Exact unresolved backlog

| Dependency ID | Owner/layer | Status | Already source/runtime proven | Still missing | Class | Factory handling |
| --- | --- | --- | --- | --- | --- | --- |
| `iuno-wan-light-at-cap-trigger-semantics` | Iuno Character Mechanics / Wan Light runtime | PENDING | Recipient ownership, below-cap 0.5s cadence, 4% per stack, max 10, 10s duration, new-stack refresh, switch-out clearing and fail-closed runtime core | Whether a qualifying Shield event at 10 stacks refreshes duration when no new stack can be gained | `SOURCE_MISSING` | Provider comparison may surface evidence; explicit AI/human source review required before canonical/runtime promotion |
| `iuno-wan-light-augusta-event-overlap` | Team execution / Iuno→Augusta state | PENDING | Full Moon Domain source ownership/lifetime and Wan Light recipient runtime core | Exact Reference Team Domain activation plus Augusta in-Domain Shield events and evaluated Augusta damage timestamps/overlap | `TIMELINE_MISSING` + `STATE_MISSING` | Factory may normalize timeline evidence, but no inferred timestamps; explicit reviewed evidence required |
| `shorekeeper-stellar-symphony-augusta-window-overlap` | Weapon effect → team execution | PENDING | Stellar Symphony team-ATK lifecycle from explicit healing-qualified Shorekeeper Skill cast | Exact qualifying cast timestamp and Augusta damage overlap inside the source window | `TIMELINE_MISSING` + `STATE_MISSING` | Route provider evidence to exception/review queue until explicit event coverage exists |
| `shorekeeper-rejuvenating-augusta-window-overlap` | Sonata effect → team execution | PENDING | Rejuvenating Glow team-ATK lifecycle from explicit `HEAL_APPLIED` event | Exact heal-applied event and Augusta damage overlap inside the source window | `TIMELINE_MISSING` + `STATE_MISSING` | Route provider evidence to exception/review queue; do not equate Skill cast with heal application |
| `shorekeeper-fallacy-team-atk-augusta-window-overlap` | Echo effect → team execution | PENDING | Generic Fallacy cast support lifecycle is executable independently from active-damage variant semantics | Exact Fallacy cast timestamp and Augusta overlap inside TEAM ATK window | `TIMELINE_MISSING` | Factory can reconcile event evidence; BUG-010 active damage remains separate |
| `shorekeeper-fallacy-wielder-er-stellarealm-state` | Echo effect + Shorekeeper Character state | PENDING | Fallacy wielder-ER lifecycle and Stellarealm ER→Crit state core are source/runtime resolved | Exact Fallacy cast timing plus explicit current Shorekeeper ER composition at query times | `TIMELINE_MISSING` + `STATE_MISSING` | Factory may assemble candidate state evidence; explicit composition review required |

### Related canonical blockers

- `BUG-028` — Augusta team-context correctness: historical `.37` contains a duplicated Thunderflare +12% ATK and stale teammate-package assumptions. `IMPLEMENTATION_PENDING` after current source-valid contribution/state coverage exists; do not patch `.37 → .25` in isolation.
- `BUG-029` — Wan Light recipient execution: source ownership/below-cap runtime are verified; at-cap semantics and actual Augusta Domain/Shield/action overlap remain open.
- `BUG-008` — Impermanence Heron incoming transfer arm condition remains a `SOURCE_CONFLICT`; all affected execution edges stay pending.
- `BUG-010` — Fallacy active-damage variant selection remains `SOURCE_MISSING` / blocked source semantics. Generic support-cast semantics do not authorize normal/tap vs hold/release damage execution.

## 4. Reference Team payload preservation

Preserve from #159-#173:

### Product / audit contracts

- `docs/BEST_AVAILABLE_TEAMS_DIRECTION.md`
- `docs/REFERENCE_TEAM_01_FOUNDATION_AUDIT.md`
- source/profile/execution boundary findings, including the verified Thunderflare duplication and the rule that V9.15 remains historical parity/oracle only

### Reusable execution contracts / primitives

- `src/teamExecutionContext.ts`
- exact selected member preset/loadout identity at the team execution boundary
- explicit `RESOLVED / PENDING / UNKNOWN` contribution dependencies and fail-closed `PARTIAL / COMPLETE` coverage
- Character support added to shared incoming-transfer state rather than a second transfer engine
- Iuno Outro transfer adapter
- Shorekeeper Outro team-window adapter
- Shorekeeper healing-support adapter
- Fallacy non-damage support-window adapter
- Iuno Wan Light recipient-state core
- Shorekeeper Stellarealm state core

### Source corrections that must not be lost

- Iuno Wan Light recipient ownership correction
- Iuno Lunar Cycle vs Full Moon Domain lifecycle separation
- Full Moon Domain 30s/off-field persistence source ownership
- Shorekeeper Stellarealm source wording/state corrections already carried by the verified stack

### Reference Team-specific proof

- selected Reference Team execution-context manifest
- Iuno→Augusta relative handoff/coverage proof
- Shorekeeper Outro→Augusta coverage proof
- Shorekeeper Stellarealm stage/recipient→Augusta proof
- all regression tests protecting the above semantics

Do not import stale branch-local roadmap prose as runtime truth. The preserved code/tests/source corrections are the payload; historical phase narration is superseded by this document.

## 5. Integration / recomposition path

The safest integration path is a single cutover delivery branch rooted at verified #173 head and targeted at actual current `main`.

Why this is safe:

- #173 is a direct linear descendant of current main, not a divergent branch;
- a fresh manual replay of 47 net-changed files would create unnecessary omission risk, especially for source corrections and regression tests;
- one integration PR can preserve the exact verified #173 net payload while replacing the stale roadmap and adding the first Factory contract;
- a later **squash merge** can give main a clean coherent milestone commit if the user explicitly authorizes merge.

Required before any merge:

1. compare integration head against current main and confirm the #173 net payload is preserved;
2. run Factory targeted verification during iteration;
3. run the full existing PR verification contract on the merge-intended head;
4. require Export/artifact contract because the integration PR targets main;
5. recheck main after any authorized merge;
6. never merge without explicit user authorization.

## 6. Old active-guidance disposition

| Guidance | Disposition | Current meaning |
| --- | --- | --- |
| Continue Character worker after Character worker | `SUPERSEDE` | Factory exception/backlog work replaces the manual roster queue |
| Rover Havoc is automatically next | `SUPERSEDE` | #141 is evidence/backlog input only |
| Continue #174-style bounded Reference Team slices | `SUPERSEDE` | #173 is the final old-pattern checkpoint |
| Sequentially integrate old sibling worker PRs | `SUPERSEDE` | each old worker is individually classified; none is an automatic merge candidate |
| Best Available Teams product contract | `KEEP` | remains the product goal |
| raw/source → mechanics/effects → profiles → execution/DPS → product/UI | `KEEP` | Factory feeds this architecture; it does not replace it |
| unresolved Wuwa semantics fail closed | `KEEP` | Factory classification/exception routing strengthens this rule |
| V9.15 as current architecture/model | `ARCHIVE/HISTORICAL` | historical oracle only when explicitly required |
| #159-#173 phase-by-phase roadmap narration | `ARCHIVE/HISTORICAL` | useful review history; not active development guidance |

## 7. Old worker PR disposition

Old sibling workers are not an integration queue.

| PR | Disposition | Reuse boundary |
| --- | --- | --- |
| #140 Chixia | `REUSABLE_EVIDENCE` + `FACTORY_BACKLOG_INPUT` | source-safe Echo/preflight evidence; BUG-022/open execution remains fail-closed |
| #141 Rover Havoc | `REUSABLE_EVIDENCE` + `FACTORY_BACKLOG_INPUT` | source/blocker review and ER-guidance boundary; old “third integration candidate” text is superseded |
| #142 Galbrena | `REUSABLE_EVIDENCE` + `FACTORY_BACKLOG_INPUT` | source-safe preflight/Echo facts; not DPS-ready |
| #145 Jiyan | `REUSABLE_EVIDENCE` + `FACTORY_BACKLOG_INPUT` | exact Echo attack/source-boundary review; no execution dependency was closed |
| #146 Lingyang | `REUSABLE_EVIDENCE` + `NEEDS_FRESH_REVIEW` | reusable primitives/evidence exist, but canonical/current-source rotation mismatch and 12 open dependencies prohibit direct integration |
| #147 Jinhsi | `REUSABLE_FIXTURE` + `REUSABLE_EVIDENCE` | preset-scoped semantic-review regression is valuable; implementation must be freshly compared before reuse |
| #148 Sigrika | `REUSABLE_EVIDENCE` + `FACTORY_BACKLOG_INPUT` | substantial source/preflight work; still non-engine-modeled with pending dependencies |
| #149 Aemeath | `REUSABLE_FIXTURE` + `REUSABLE_EVIDENCE` | generic status/event primitives and source checkpoints are useful Factory inputs; no direct branch merge |
| #150 Lucilla | `REUSABLE_EVIDENCE` + `FACTORY_BACKLOG_INPUT` | engine-overlay evidence exists but profile is not DPS-ready and four dependencies remain |

Any future reuse starts from current main/Factory truth and imports the smallest verified payload after fresh review. Do not merge these old branches wholesale.

## 8. Factory v1 roadmap

Detailed contract: `docs/FACTORY_V1.md`.

Minimum sequence:

1. Provider / Evidence contract.
2. Normalized candidate schema with provenance/version/source ownership.
3. At least two realistic provider lanes with explicit license/data-use disposition.
4. Deterministic `CONSENSUS / SINGLE_SOURCE / CONFLICT / MISSING / UNKNOWN` reconciliation.
5. Exception queue for conflict/missing/unknown.
6. One declarative standard-effect family backed by an existing shared runtime primitive.
7. Generated/contract regression tests.
8. Fast targeted iteration path without weakening full gates.
9. Reference Team 01 golden regression.
10. Only then broaden ingestion/effect generation and later return to Best Available Teams product execution.

## 9. Verification model

### FAST / TARGETED iteration

Factory batches may run only the affected audits/tests plus necessary build/type checks while work is being shaped. The first Factory slice provides a `verify:fast:factory` contract for Factory tests + readiness + strict build.

This is an iteration accelerator, not a merge gate replacement.

### FULL MERGE-INTENDED verification

The existing repository PR contract remains mandatory:

- Echo/Sonata raw coverage;
- Sonata effect source coverage;
- Echo skill source coverage;
- profile candidate/source accelerator/horizontal cohort gates;
- Profile × Adapter matrix;
- readiness / Pre-DPS freeze;
- full Node tests;
- strict web build;
- required real-Chrome Roll Assist/Alpha/owned-build regressions;
- diff whitespace checks;
- Export web artifact contract for main-targeting PRs.

No correctness gate is removed or weakened.

## 10. Exit criterion for this cutover

A new AI should infer exactly one state from canonical sources:

- current main is still `612324b8...` until authorized merge;
- one cutover/integration head preserves the verified Reference Team payload;
- six exact Reference Team dependencies remain open and fail-closed;
- Reference Team 01 is the Factory golden regression, not the manual roster template;
- old workers and old stacked PRs are historical/evidence inputs, not active merge queues;
- Bellibing Factory v1 is the only active development model;
- Best Available Teams remains the product goal.
