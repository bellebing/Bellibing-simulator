# Development Process v2

This is Bellibing's canonical worker process. `AGENTS.md` is the entrypoint; the Bellibing development skill refers here. For workflow, verification timing, autonomy and documentation, this contract supersedes older generic instructions in status/Handoff/UI documents and the unmerged ITERATION/CHECKPOINT proposal in PR #227. Their source-validity, product, architecture and relevant acceptance requirements still apply. Explicit user scope and stop instructions govern the current task.

## Start and scope

- Recover current GitHub main/code and relevant PR/CI state, then PROJECT_STATUS, available AI Handoff and the domain/UI contracts needed for the task. GitHub implementation beats stale documents or chat history; keep candidate behavior separate from merged main.
- Read at workstream start and recheck when the base, scope or relevant evidence changes. Do not rediscover every branch or reread every contract after each edit.
- Identify the coherent objective, invariants, affected consumers and highest applicable risk class. Classify behavior and dependencies, not file extensions. Report missing access; block only work dependent on the unavailable evidence.
- Prefer existing canonical data, components, tests and audits. Avoid unnecessary token/compute work, speculative infrastructure, repeated sourcing and verification without a concrete risk.

## Safety on every level

- Never guess Wuthering Waves values, mechanics, triggers, timing, ownership, stacking, scope or rotations. Missing, disputed or ambiguous evidence remains explicit PENDING/UNKNOWN/source-blocked and fails closed; missing is not zero.
- Reuse reviewed canonical facts with valid provenance. Reopen source review for drift, conflict, missing provenance or semantics the fact does not prove. External evidence never auto-promotes. Use V9.15 only as a historical reference when explicitly needed.
- Preserve raw/source data → domain effects/mechanics → profiles/recommendations → combat/DPS → UI. Echo Core stays character-free. Do not duplicate canonical models or move gameplay math into presentation.
- Preserve source pins, generated parity, content preflight, backward-impact review and readiness boundaries where applicable. A primitive, interface, recommendation or green test does not prove execution semantics, data completeness or DPS readiness.
- Never weaken a test or gate merely to obtain green results. Visual acceptance cannot substitute for source, persistence or combat correctness.

## Risk classes and focused checks

Use the highest affected class; shared or cross-cutting changes require broader verification. Source-validity review applies even during a cheap iteration.

| Risk class | Relevant FAST checks and escalation |
| --- | --- |
| Trivial docs/text/style | Diff, links and whitespace; inspect affected appearance for style changes. Process/gate edits also need a contract audit. |
| UI/presentation | Affected behavior checks; typecheck/build when relevant. REVIEW exercises the changed interaction and appearance. Shared layout/input changes need wider browser coverage. |
| State/persistence | Focused validation, Character isolation, save/reload, migration and failure/recovery checks. Shared schemas, migrations or ownership changes need earlier broad verification. |
| Source/data | Provenance, source semantics, relevant deterministic audits, extraction/generated parity and affected consumers. Promotion or broad catalog changes need stronger coverage and impact review. |
| Gameplay mechanics/effects | Source-backed values/conditions, ordering, scope, negative cases and dependent adapters/profiles. Shared mechanic changes need earlier broad verification. |
| Combat/DPS/evaluator | Independent parity/benchmarks, context composition, mandatory gates, pending paths and readiness. Cross-cutting math/execution changes need MERGE-level verification before readiness claims. |
| Build/CI/infrastructure | Changed configuration, packaging/parity and relevant pipeline checks. Changes to verification gates or artifact/deploy paths need proof of the affected contract. |

## Verification levels

### FAST — normal iteration

Run affected/focused tests and relevant audits only. Typecheck or build when the changed paths require it. A direct test-file command is sufficient; no new runner is required. Docs-only changes normally need diff/link/structure/contract checks.

Do not run the full suite, whole browser/repo matrix, Verify or Export after each small edit. An iteration is not a claim that all repository gates passed. Escalate for demonstrated risk, dependency reach, a failure or uncertainty.

### REVIEW — user inspection

Provide a usable preview and relevant runtime/browser evidence for the changed feature. For current desktop UI, start at 1440×900; add 1920×1080/2560×1440 when width/layout matters, and other sizes only when the affected contract requires them. Exercise physical pointer input for pointer behavior. Inspect screenshots when appearance matters.

Manual user review is valid visual acceptance for low-risk presentation work. Add automated regression when behavior, repeated defects or material regression risk warrants it. A review request, preview link or accepted cosmetic adjustment does not by itself require MERGE verification or a full simulator matrix. Preserve revision identity and state what was actually verified; do not claim remote preview availability from local evidence.

### MERGE — final candidate or earlier high risk

For a merge-intended final candidate, satisfy the current repository contract: full tests/audits, strict build, required real-browser gates, whitespace and Verify/Export/artifacts where required. Run this level earlier when high-risk work requires it; a tiny source-bound change can still use focused iteration before its final gate.

Use automatic CI evidence for the exact candidate head. Do not duplicate full CI locally without a concrete need such as reproducing a failure, diagnosing environment differences or covering a missing gate. Reuse an existing successful run on an unchanged head when its inputs remain applicable; relevant external source drift invalidates that assumption. Check automatic post-merge evidence where relevant rather than automatically launching duplicate runs.

Existing CI triggers and required checks remain in force until a separate CI change is approved and implemented. This contract does not authorize bypasses, blanket skip-CI commits or replacing required gates with focused checks. FAST/REVIEW may still trigger broad CI under the existing workflows.

## Autonomy and stops

- Work autonomously within the authorized coherent workstream: edit, check, review the diff and fix task-related failures. Commit/checkpoint at useful coherent boundaries, not every pixel adjustment. A commit, accepted small iteration or green CI is not an administrative stop by itself.
- Keep unrelated PRs and workstreams isolated. Use the required current base and draft PRs unless instructed otherwise. Do not start adjacent product work, redesign unrelated accepted UI or expand scope to fix an inherited unrelated failure.
- Stop when the objective is complete, an explicit user boundary is reached, a blocking source/product decision is needed or merge authorization is required. Continue independent authorized work while reporting a dependent blocker.
- No direct main code writes, merge, branch deletion, force-push, history rewrite or other destructive action without the applicable explicit authorization. Every merge needs separate explicit user authorization. Observe repository protections.

## Evidence and documentation

- Report the changed scope, risk, verification level, relevant checks/results, omitted checks and why, and remaining blockers. Distinguish local worktree evidence, exact PR-head evidence and merged/deployed evidence; include revision identity when making a revision-specific claim.
- Report failures and unavailable checks accurately. An inherited failure remains visible and does not count as green or expand the workstream. Required failed gates still block merge readiness.
- Verify actual coverage before completeness/readiness claims. Mark a bug fixed only with evidence appropriate to its failure; relevant visual bugs require browser/manual visual evidence.
- GitHub owns git/branch/commit/PR/CI state. Keep exact-head/run/artifact evidence on the PR or linked GitHub records; avoid copying live state into several documents or creating self-referential status commits.
- Update project docs only when product status, a decision, blocker, support boundary or reusable contract changes. Update Handoff only for meaningful handoff information; update the bug register only for a real bug-state change. No mandatory status/Handoff/log/bug write after each iteration or successful recheck.
- Preserve historical evidence as history. Old checkpoint-specific stop/verification text is not a standing instruction for a new authorized workstream. Keep process rules here rather than copying them into status pages or feature documents.
