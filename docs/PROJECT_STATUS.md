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

### Review-ready cutover state

The verified old Reference Team stack #159 → #173 was a direct linear descendant of current main. Its final old-pattern head was `f4abdda16cddc17c2fc757a3d3829830efdf0982`, exactly 98 commits ahead / 0 behind current main, with final #173 Verify #1037 SUCCESS.

That intended net payload is now preserved by **PR #174**, branch `factory/cutover-v1-2026-09-05`, targeted at actual current `main`.

- PR #174 is the only open pull request.
- #159-#173 are closed **unmerged** as historical/review checkpoints after payload preservation.
- old sibling workers #140/#141/#142/#145-#150 are closed **unmerged** after explicit disposition below.
- no old PR is an implicit integration queue.
- no merge has been performed; PR #174 requires explicit user authorization.

The cutover branch preserves the #173 code/tests/source corrections and adds the first Bellibing Factory v1 foundation. `main` remains authoritative runtime truth until an authorized merge.

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

Do not restart Character-by-Character workers as the roadmap. Do not treat PR #174 as another bounded Reference Team semantic slice: it is the cutover/integration PR. Reference Team 01 is now a golden regression/proof case for Factory.

## 3. Reference Team 01 — golden regression state

Team: **Augusta / Iuno / The Shorekeeper**.

Preserved verified state:

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

- `BUG-028` — Augusta team-context correctness: historical `.37` contains a duplicated Thunderflare +12% ATK and stale teammate-package assumptions. `IMPLEMENTATION_PENDING` only after current source-valid contribution/state coverage exists; do not patch `.37 → .25` in isolation.
- `BUG-029` — Wan Light recipient execution: source ownership/below-cap runtime are verified; at-cap semantics and actual Augusta Domain/Shield/action overlap remain open.
- `BUG-008` — Impermanence Heron incoming transfer arm condition remains a `SOURCE_CONFLICT`; affected execution edges stay pending.
- `BUG-010` — Fallacy active-damage variant selection remains `SOURCE_MISSING` / blocked source semantics. Generic support-cast semantics do not authorize normal/tap vs hold/release damage execution.

## 4. Reference Team payload preservation

PR #174 must preserve the intended #159-#173 net payload, specifically:

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

A fresh manual replay of the 47-file #173 net payload was deliberately avoided because #173 is linear on current main and replay would create omission risk. PR #174 preserves the verified stack payload and composes the cutover on top. A later **squash merge** is the preferred clean-history landing strategy if the user explicitly authorizes merge.

## 5. Old active-guidance disposition

| Guidance | Disposition | Current meaning |
| --- | --- | --- |
| Continue Character worker after Character worker | `SUPERSEDE` | Factory exception/backlog work replaces the manual roster queue |
| Rover Havoc is automatically next | `SUPERSEDE` | #141 is evidence/backlog input only |
| Continue bounded Reference Team semantic slices after #173 | `SUPERSEDE` | #173 is the final old-pattern checkpoint; #174 is the cutover PR, not a semantic continuation |
| Sequentially integrate old sibling worker PRs | `SUPERSEDE` | old workers are closed unmerged and individually classified; none is an automatic merge candidate |
| Best Available Teams product contract | `KEEP` | remains the product goal |
| raw/source → mechanics/effects → profiles → execution/DPS → product/UI | `KEEP` | Factory feeds this architecture; it does not replace it |
| unresolved Wuwa semantics fail closed | `KEEP` | Factory classification/exception routing strengthens this rule |
| V9.15 as current architecture/model | `ARCHIVE/HISTORICAL` | historical oracle only when explicitly required |
| #159-#173 phase-by-phase roadmap narration | `ARCHIVE/HISTORICAL` | closed PR history/review evidence; not active development guidance |

## 6. Old worker PR disposition

All rows below are closed **unmerged**. Their branches/history remain available as evidence; they are not an integration queue.

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

Any future reuse starts from then-current main/Factory truth and imports the smallest verified payload after fresh review. Do not reopen/merge these old branches wholesale as the roadmap.

## 7. Bellibing Factory v1

Detailed contract: `docs/FACTORY_V1.md`.

The first cutover slice on PR #174 adds no Wuthering Waves gameplay values. It adds:

- provider/evidence contracts;
- normalized candidates with provenance/version/source ownership;
- deterministic `CONSENSUS / SINGLE_SOURCE / CONFLICT / MISSING / UNKNOWN` reconciliation;
- exception routing for `CONFLICT / MISSING / UNKNOWN`;
- explicit `MANUAL_SOURCE_VALIDATION_REQUIRED` canonical-promotion policy;
- provider/license dispositions for the existing Prydwen lane, FrequencyManager, wuwa-afyg-tool and unlicensed wuwabuild reference;
- Reference Team 01 exact golden-regression assertions;
- Factory contract tests;
- targeted Factory verification without weakening the full repository gates.

### Factory v1 next sequence

1. Map at least two licensed/review-approved provider lanes onto one tiny, already-understood source fact family.
2. Generate provenance-rich consensus/conflict reports and an explicit exception queue.
3. Prove one declarative standard-effect family through an existing shared runtime primitive, preferably a timed self window if canonical source supports it.
4. Generate contract/regression tests from that family.
5. Measure targeted iteration path versus full merge verification.
6. Keep Reference Team 01 as golden regression while expanding only after throughput is proven.
7. Return to Best Available Teams product execution only on top of canonical source/profile/execution truth.

Do **not** build a universal gameplay DSL and do **not** create one Character-specific calculator per Character. Character-specific complex state stays Character-specific when genuinely required.

## 8. External provider / license boundary

Factory provider policy is fail-closed:

- existing Prydwen extraction lane: keep as review/evidence only; external page content is not canonical Bellibing truth;
- `Voruzhu/FrequencyManager`: MIT, acceptable for a small independent evidence prototype with repository/commit/path provenance;
- `d4rkOfficial/wuwa-afyg-tool`: repository contains MIT license; contract/provider architecture may be studied/reused under MIT, while Wuwa data still requires separate provenance and Bellibing semantic review;
- `DommyMM/wuwabuild`: no current repository license found during cutover audit; do not copy new code/data without explicit reuse rights.

No external source may directly become runtime truth.

## 9. Verification model

### FAST / TARGETED iteration

Factory batches may run affected Factory tests/audits plus necessary readiness/build checks while work is being shaped. `npm run verify:fast:factory` covers the first Factory contract, and the Factory branch workflow retains a diff-whitespace check with parent history available.

This is an iteration accelerator, not a merge gate replacement.

### FULL MERGE-INTENDED verification

Any merge-intended PR to `main`, including #174, still requires the existing repository contract:

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
- Export web artifact contract for main-targeting PRs;
- Character Mechanics source import checks where triggered.

No correctness gate is removed or weakened.

## 10. Cutover exit state

A new AI should infer exactly one project state from canonical sources:

- `main` is still `612324b8...` until explicit merge authorization;
- PR #174 is the only open/review-ready cutover/integration path and preserves the verified Reference Team payload;
- six exact Reference Team dependencies remain open and fail-closed;
- BUG-028, BUG-029, BUG-008 and BUG-010 remain relevant/open blockers as described above;
- Reference Team 01 is the Factory golden regression, not the manual roster template;
- old workers and #159-#173 are closed unmerged historical/evidence inputs, not active merge queues;
- Bellibing Factory v1 is the only active development model;
- Best Available Teams remains the product goal.

Do not merge PR #174 without explicit user authorization.
