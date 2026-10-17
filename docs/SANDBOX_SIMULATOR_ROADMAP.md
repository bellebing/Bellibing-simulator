# Standalone Sandbox Simulator roadmap

## Product decision and ownership

Develop the standalone Character Sandbox before account integration. A released Character can be explored without owning a Character, saved build, Echo or resource inventory. `SANDBOX_BUILD` is an explicit detached, versioned context; `ACCOUNT_BUILD` retains its existing production contract. Neither is a fallback for the other. Canonical catalogs, validators and build projections remain shared. No second evaluator or public private-policy implementation is permitted.

This plan supersedes account-first sequencing for this program, not the safety of the existing production bridge. The UI Lab stack remains unmerged. PR #310 is a UX proposal, not an integrated implementation. Public cleanup #304–#307 remains separate.

Status vocabulary: **NOT STARTED**, **IN PROGRESS**, **BLOCKED**, **READY FOR REVIEW**, **VERIFIED**. Architecture alone never establishes a verified phase. Coverage, actual behavior and the required verification must agree. GitHub owns exact commit/check/run evidence.

## S1 — Sandbox foundation

- **Status:** READY FOR REVIEW. **Current PR:** [Draft #312](https://github.com/bellebing/Bellibing-simulator/pull/312), stacked on #311. Source/configuration coverage is 59/59; implementation/browser evidence and remaining independent readiness dimensions are in the [foundation contract](ui-lab/SANDBOX_FOUNDATION.md) and [coverage matrix](ui-lab/SANDBOX_COVERAGE.md). Owner review of the DPS concept is still required; this is not a merged/production or S2 execution claim.
- **Goal:** source-bound standard Character/Weapon/five-Echo configurations for all 59 released identities; independent sessions/settings/resources and slot-aware existing Workshop.
- **Sources:** canonical Character/signature/guide/weapon/Echo/Sonata catalogs, reviewed loadout profiles, stat editor, source reviews and Settings v3; inherited Phase 6A.1/6B.1 contracts.
- **Dependencies:** verified identity/type/Main/Cost/set composition rules and explicit build context. Missing facts are Pending, never Augusta fallback.
- **Product decisions:** dedicated verified signature first, reviewed alternative otherwise; tied source alternatives may use an explicit deterministic Sandbox convention retaining originals. No invented rolls. Remove the large left Sonata selector; Edit Echo owns Sonata commits. DPS is a separate four-column concept below Character Stats with Pending values.
- **Definition of Done:** every source-supported default implemented, full machine/human 59-Character matrix, independent configuration/simulation/DPR/DPS readiness, canonical baseline, unique session/revisions, manual overrides/Character/reset isolation, source-bound species/set checks, Expected Cost contract and S2 plan. Any unresolved Character dimension is enumerated and prevents a 59/59 claim.
- **Verification:** coverage gate, source audits/generated parity, focused state/validation/regression tests, build, actual Chromium interaction/layout/keyboard at 1440×900, 1920×1080, 2560×1440, exact-head automatic CI. No account writes/spend.
- **Pending:** real simulation, cost producer, DPR/DPS execution, active bonus presentation, account integration. Stop for ChatGPT review; do not start S2.

## S2 — Real Sandbox simulation

- **Status:** NOT STARTED. **Current PR:** none; separate authorization required.
- **Goal:** SIMULATE uses the existing private motor for canonical rolls, Candidate/Current/Temporary/Trash, resource spend, Decision Trace and safe JSON export without an account.
- **Sources:** existing private simulator and transport V1, canonical Echo/resource/session primitives, versioned Sandbox compiler/context and reviewed presentation DTO.
- **Dependencies:** S1 valid configurations; private supported policy capability; isolated authenticated/guest sessions, bounded requests/work/budgets, idempotency, trusted revision registry, stale/late-result protection and safe exports.
- **Product decisions:** same engine for all presentation speeds; no private policy in JavaScript, no real-account debit. Public ingress/activation requires separate approval.
- **Definition of Done:** actual end-to-end rolls/decisions/history/receipts and exact selected active slots; unsupported contexts fail explicitly; safe trace/export and reset/abort/reconnect semantics verified.
- **Verification:** real private tests plus source/built Chromium, freshness/idempotency/session/resource isolation and no-leak checks; approved security/ingress review.
- **Pending:** unsupported policy categories, global finite-budget optimization/recovery, general DPR/DPS; no automatic capability promotion from S1 templates.

## S3 — Expected and Simulated Cost

- **Status:** NOT STARTED. **Current PR:** none.
- **Goal:** mathematically defined Expected before simulation and actual Simulated cost from run receipts, separately for Echoes/Tuners/Tubes with approved Gold-equivalent presentation.
- **Sources:** canonical resource ledger/denominations and reviewed private economic producers; S1 cost contract.
- **Dependencies:** an expectation model matching the exact goal/policy/slot-set scope; actual transaction receipts for Simulated. A single observed run is not Expected.
- **Product decisions:** distinguish one-slot/set, per-run gross, many-run statistics, inventory feasibility and recovery. Unlimited changes feasibility, not zero price.
- **Definition of Done:** verified producer coverage and units, matching context/revisions, exact Tube conversion, censoring/unavailable cases, truthful pre-run dashes. Whole-set expectation needs separate model work if unsupported.
- **Verification:** mathematical checks/independent references, ledger aggregation, finite/unlimited/censored/recovery negatives, UI context invalidation.
- **Pending:** new set-wide models and recovery semantics until source/model review.

## S4 — DPR / DPS integration

- **Status:** NOT STARTED. **Current PR:** none.
- **Goal:** keep DPR and DPS separate; integrate qualified Character/team cases then expand verified coverage. Compare before/after only in the same calculation context.
- **Sources:** canonical Character/Weapon/Echo/Sonata/combat data, separately reviewed DPR providers and verified team execution.
- **Dependencies:** source-complete builds, qualified rotation/team/provider/version/measurement window and actual execution.
- **Product decisions:** Team Total and attribution must come from the same team run. No universal DPS-readiness or independent-character summation claim.
- **Definition of Done:** real provider outputs, context/revision binding, attribution/total consistency and explicit Pending dimensions; preserved independent DPR interpretation.
- **Verification:** qualified reference parity, legal-build cases, context drift, missing/unsupported/crit/ER boundaries, real UI behavior.
- **Pending:** broader Character/team coverage, unverified dynamics and general DPS.

## S5 — Advanced Echo Workshop

- **Status:** NOT STARTED. **Current PR:** none.
- **Goal:** inline expandable +5/+10/+15/+20/+25 rows, canonical stat/value selection, next-row progression and explicit duplicate confirmation/swap/move.
- **Sources:** canonical editor/tiers/uniqueness and PR #310 UX plan.
- **Dependencies:** separate clickable UX concept and owner approval before larger Workshop changes.
- **Product decisions:** edit observed pairs, never invent a roll; atomic swap retains each value with its stat; incomplete drafts cannot commit.
- **Definition of Done:** approved editor, complete/partial draft validation, undo/Cancel, keyboard/touch/reduced-motion and no ownership regression.
- **Verification:** canonical validation plus actual pointer/keyboard browser tests, conflicts, swaps/moves, all checkpoints, layout/focus.
- **Pending:** all implementation until separate UX authorization.

## S6 — My Characters / account

- **Status:** NOT STARTED. **Current PR:** none.
- **Goal:** My Characters, My Echo Inventory, saved builds, Improve Character, comparisons and Best Available Teams using the same Sandbox motor.
- **Sources:** real account owners and the retained production compiler/Settings/session contracts; qualified combat/team providers.
- **Dependencies:** sufficiently verified standalone simulation, stable real Build/mode identities, persistence/revision/auth ownership and explicit integration approval.
- **Product decisions:** no parallel evaluator; never silently import account gear or debit inventory. Future active Sonata-bonus display is separately scoped.
- **Definition of Done:** authorized account operations, recovery/migration/concurrency, truthful comparisons and source/capability coverage.
- **Verification:** real-account isolation/write authorization, source/built browser, cross-tab/reload/recovery, exact-head required integration gates.
- **Pending:** all account features; none required to use S1/S2 Sandbox.
