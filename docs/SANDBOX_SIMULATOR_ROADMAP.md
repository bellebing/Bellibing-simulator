# Standalone Sandbox Simulator roadmap

> **Older standalone-program plan (historical).** The current owner-approved end-to-end priorities are in [PRODUCT_JOURNEY_ROADMAP](PRODUCT_JOURNEY_ROADMAP.md). Preserve the source/safety contracts below, but use the new roadmap for ordering work. Canonical worker rules remain in [DEVELOPMENT_PROCESS](DEVELOPMENT_PROCESS.md).

## Product decision and ownership

Develop the standalone Character Sandbox before account integration. A released Character can be explored without owning a Character, saved build, Echo or resource inventory. `SANDBOX_BUILD` is an explicit detached, versioned context; `ACCOUNT_BUILD` retains its existing production contract. Neither is a fallback for the other. Canonical catalogs, validators and build projections remain shared. No second evaluator or public private-policy implementation is permitted.

This plan supersedes account-first sequencing for this program, not the safety of the existing production bridge. The UI Lab stack remains unmerged. PR #310 remains the wider UX proposal; this candidate implements only the inline behaviors explicitly authorized by Master Program V2. Public cleanup #304–#307 remains separate.

Status vocabulary: **NOT STARTED**, **IN PROGRESS**, **BLOCKED**, **READY FOR REVIEW**, **VERIFIED**. Architecture alone never establishes a verified phase. Coverage, actual behavior and the required verification must agree. GitHub owns exact commit/check/run evidence.

## S1 — Sandbox foundation

- **Status:** READY FOR REVIEW. **Current PR:** [Draft #312](https://github.com/bellebing/Bellibing-simulator/pull/312), stacked on #311. Source/configuration coverage is 59/59; implementation/browser evidence and remaining independent readiness dimensions are in the [foundation contract](ui-lab/SANDBOX_FOUNDATION.md) and [coverage matrix](ui-lab/SANDBOX_COVERAGE.md). The owner has approved the four-column DPS concept; computation remains Pending. This is not a merged/production claim.
- **Goal:** source-bound standard Character/Weapon/five-Echo configurations for all 59 released identities; independent sessions/settings/resources and slot-aware existing Workshop.
- **Sources:** canonical Character/signature/guide/weapon/Echo/Sonata catalogs, reviewed loadout profiles, stat editor, source reviews and Settings v3; inherited Phase 6A.1/6B.1 contracts.
- **Dependencies:** verified identity/type/Main/Cost/set composition rules and explicit build context. Missing facts are Pending, never Augusta fallback.
- **Product decisions:** dedicated verified signature first, reviewed alternative otherwise; tied source alternatives may use an explicit deterministic Sandbox convention retaining originals. No invented rolls. Remove the large left Sonata selector; Edit Echo owns Sonata commits. DPS is a separate four-column concept below Character Stats with Pending values.
- **Definition of Done:** every source-supported default implemented, full machine/human 59-Character matrix, independent configuration/simulation/DPR/DPS readiness, canonical baseline, unique session/revisions, manual overrides/Character/reset isolation, source-bound species/set checks, Expected Cost contract and S2 plan. Any unresolved Character dimension is enumerated and prevents a 59/59 claim.
- **Verification:** coverage gate, source audits/generated parity, focused state/validation/regression tests, build, actual Chromium interaction/layout/keyboard at 1440×900, 1920×1080, 2560×1440, exact-head automatic CI. No account writes/spend.
- **Pending:** broader simulation/DPS execution, active bonus presentation and account integration. Master Program V2 authorizes the local S2B–S5 work below; production activation remains separate.

## S2 — Real Sandbox simulation

- **Status:** READY FOR REVIEW for local Augusta/default execution. S2A [Draft #313](https://github.com/bellebing/Bellibing-simulator/pull/313) remains the base; the current public/private companions add the actual browser connection. No public ingress or deployment.
- **Goal:** SIMULATE uses the existing private motor for canonical rolls, Candidate/Current/Temporary/Trash, resource spend, Decision Trace and safe JSON export without an account.
- **Sources:** existing private simulator and transport V1, canonical Echo/resource/session primitives, versioned Sandbox compiler/context and reviewed presentation DTO.
- **Dependencies:** S1 valid configurations; private supported policy capability; isolated authenticated/guest sessions, bounded requests/work/budgets, idempotency, trusted revision registry, stale/late-result protection and safe exports.
- **Product decisions:** same engine for all presentation speeds; no private policy in JavaScript, no real-account debit. Public ingress/activation requires separate approval.
- **Definition of Done:** actual end-to-end rolls/decisions/history/receipts and exact selected active slots; unsupported contexts fail explicitly; safe trace/export and reset/abort/reconnect semantics verified.
- **Verification:** real private tests plus source/built Chromium, freshness/idempotency/session/resource isolation and no-leak checks; approved security/ingress review.
- **Pending:** unsupported policy categories, global finite-budget optimization/recovery, general DPR/DPS; no automatic capability promotion from S1 templates.

### S2A — actual private integration

- Actual S1 Sandbox owner/configuration flows now execute Augusta/default through the existing private compiler, simulation owner, transport V1 and replay. Actual one-slot and five-slot runs reach GOAL_SUCCESS; abort, insufficient budget and administrative censoring retain their real statuses.
- Canonical rolls, Temporary replacement, unique Current/Candidate/Trash ownership, receipt conservation, replay and safe JSON round-trip are verified privately. Public contract tests are explicitly separate from private execution evidence.
- [Execution contract](ui-lab/SANDBOX_EXECUTION_CONTRACT.md) defines the public presentation boundary, observed-cost adapter, live-owner freshness and S2B plan. Exact public dependency is `32d8c348534cd8248e8b99d08221e06efb5bc6b9`; final PR heads/checks belong to GitHub. Exact private revision, reproducible runs and actual resource quantities remain in the private companion PR/report, not public release mappings.
- Unsupported Characters, changed Weapon context and unsupported Gate/minimum/Settings capability remain Pending rather than falling back. Source-backed 59/59 templates do not establish 59 executable policies. Expected, general DPR/DPS and account integration remain separate.

### S2B — browser and guest/session integration

- **Status:** READY FOR REVIEW for bounded loopback execution. The existing SIMULATE button runs the real private engine through isolated server-owned guests and a persistent atomic authority. The production status Worker and its routes are unchanged.
- The [browser contract](ui-lab/SANDBOX_BROWSER_CONTRACT.md) defines same-origin guest access, independent server revisions, idempotent requests, full-input freshness/late-response rejection, Abort/Reset, read-only Current/Candidate/Temporary/Trash and authenticated safe export. No account owner or inventory is written.
- Actual one-to-five-slot canonical ownership/receipt execution is distinct from 59/59 template coverage. Unsupported Characters, Weapon/settings/minimum contexts remain Pending before spending; there is no Augusta fallback.
- Local browser acceptance exercises the actual private host. Public browser gates preserve all 59 defaults and Workshop interaction; those public gates do not claim private execution. GitHub owns exact-head checks; private execution/security evidence remains private.
- Remaining activation blockers: reviewed production host/persistence, compatible runtime, edge controls, TLS/cookies, bindings/credentials and explicit authorization. A static GitHack preview cannot reach this private localhost engine.

## S3 — Expected and Simulated Cost

- **Status:** READY FOR REVIEW for supported metrics; unsupported cells remain Pending.
- **Goal:** mathematically defined Expected before simulation and actual Simulated cost from run receipts, separately for Echoes/Tuners/Tubes with approved Gold-equivalent presentation.
- **Sources:** canonical resource ledger/denominations and reviewed private economic producers; S1 cost contract.
- **Dependencies:** an expectation model matching the exact goal/policy/slot-set scope; actual transaction receipts for Simulated. A single observed run is not Expected.
- **Product decisions:** distinguish one-slot/set, per-run gross, many-run statistics, inventory feasibility and recovery. Unlimited changes feasibility, not zero price.
- **Definition of Done:** verified producer coverage and units, matching context/revisions, exact Tube conversion, censoring/unavailable cases, truthful pre-run dashes. Each metric is independently available. The existing policy supplies a proven fresh-start sum for selected empty slots; this is not finite-budget completion or remaining-live-state cost.
- **Verification:** mathematical checks/independent references, ledger aggregation, finite/unlimited/censored/recovery negatives, UI context invalidation.
- **Implemented:** observed gross/returns/net/remaining preserve real denominations with Gold-equivalent presentation. Independently verified Expected Echoes/Tuners use the matching existing policy and explicit fresh-start assumptions.
- **Pending:** Expected Tubes, recovery, finite-budget completion probability and live remaining-state expectations.

## S4 — DPR / DPS integration

- **Status:** READY FOR REVIEW for bounded observed DPR presentation; default DPS remains Pending; an explicit qualified reference scenario is available.
- **Goal:** keep DPR and DPS separate; integrate qualified Character/team cases then expand verified coverage. Compare before/after only in the same calculation context.
- **Sources:** canonical Character/Weapon/Echo/Sonata/combat data, separately reviewed DPR providers and verified team execution.
- **Dependencies:** source-complete builds, qualified rotation/team/provider/version/measurement window and actual execution.
- **Product decisions:** Team Total and attribution must come from the same team run. No universal DPS-readiness or independent-character summation claim.
- **Definition of Done:** real provider outputs, context/revision binding, attribution/total consistency and explicit Pending dimensions; preserved independent DPR interpretation.
- **Verification:** qualified reference parity, legal-build cases, context drift, missing/unsupported/crit/ER boundaries, real UI behavior.
- **Implemented:** existing source-bound experimental observed-substat DPR aggregates, provider/version/context and explicit limits. Optional named synthetic reference-team DPS reuses an existing executor only for five actual finished Augusta Echoes, exact source-bound default equipment/baseline and existing ER gates. Fixed synthetic Iuno/Shorekeeper builds are explicitly labelled; same-run contributions/total remain EXPERIMENTAL, never optimal/verified live DPS. Small canonical portraits sit above actual team labels in four equal columns, with subtle gold Team Total. No graph or invented damage values.
- **Pending:** default/unsupported contexts, incomplete cards, mismatched equipment and failed ER gates; native proc/resource/rotation verification, optimal/live DPS and before/after damage. No synthetic Augusta cards, unrelated contributions or DPR scores are substituted as actual Sandbox damage.

## S5 — Advanced Echo Workshop

- **Status:** READY FOR REVIEW for the Master Program V2 approved inline editor.
- **Goal:** inline expandable +5/+10/+15/+20/+25 rows, canonical stat/value selection, next-row progression and explicit duplicate confirmation/swap/move.
- **Sources:** canonical editor/tiers/uniqueness and PR #310 UX plan.
- **Dependencies:** existing canonical tier/uniqueness validation; Master Program V2 explicitly authorizes the focused inline concept and implementation. Larger PR #310 redesigns still require separate approval.
- **Product decisions:** edit observed pairs, never invent a roll; atomic swap retains each value with its stat; incomplete drafts cannot commit.
- **Definition of Done:** approved editor, complete/partial draft validation, undo/Cancel, keyboard/touch/reduced-motion and no ownership regression.
- **Verification:** canonical validation plus actual pointer/keyboard browser tests, conflicts, swaps/moves, all checkpoints, layout/focus.
- **Implemented:** inline stat/value rows, next unfinished row, discoverable used stats, explicit complete-pair swap, Cancel/Undo and incomplete-commit protection. Unrolled template editing still produces no observed substats.
- **Pending:** unspecified move/conflict interactions and any larger redesign; no replacement rolls are invented.

## S6 — My Characters / account

- **Status:** NOT STARTED. **Current PR:** none.
- **Goal:** My Characters, My Echo Inventory, saved builds, Improve Character, comparisons and Best Available Teams using the same Sandbox motor.
- **Sources:** real account owners and the retained production compiler/Settings/session contracts; qualified combat/team providers.
- **Dependencies:** sufficiently verified standalone simulation, stable real Build/mode identities, persistence/revision/auth ownership and explicit integration approval.
- **Product decisions:** no parallel evaluator; never silently import account gear or debit inventory. Future active Sonata-bonus display is separately scoped.
- **Definition of Done:** authorized account operations, recovery/migration/concurrency, truthful comparisons and source/capability coverage.
- **Verification:** real-account isolation/write authorization, source/built browser, cross-tab/reload/recovery, exact-head required integration gates.
- **Pending:** all account features; none required to use S1/S2 Sandbox.
