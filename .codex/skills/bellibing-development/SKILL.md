---
name: bellibing-development
description: Develop Bellibing Simulator changes using the project's current source of truth, strict scope boundaries, source-backed Wuthering Waves data, and the established verification/PR workflow.
---

# Bellibing development

Use for development work in `bellebing/Bellibing-simulator`.

1. **Read current sources first, in order:** current GitHub `main` and relevant implementation; `docs/PROJECT_STATUS.md`; **Bellibing Echo Tool — AI Handoff**; relevant domain/UI docs for the requested task. If required sources are unavailable, report the gap and keep dependent work blocked.
2. **Never guess Wuthering Waves data or mechanics.** Use current pinned/source-backed data. Missing, disputed, or ambiguous facts remain explicit **PENDING** and fail closed. Use V9.15 only as a historical oracle/reference when explicitly needed.
3. **Preserve boundaries:** raw/source data → effects/mechanics → profiles/recommendations → combat/DPS → UI/presentation. Do not move gameplay math into UI or duplicate canonical models.
4. **Keep the requested slice narrow.** Do not automatically start adjacent workstreams, redesign unrelated accepted UI, or alter unrelated mechanics, profile, or settings data.
5. **Follow branch/PR discipline.** Start from the explicitly required current base; keep unrelated parallel PRs isolated; inspect changed files before closeout. Use **DRAFT** PRs unless explicitly told otherwise. Never merge without explicit user approval.
6. **Use staged verification.** Follow ITERATION MODE during draft exploration and CHECKPOINT MODE at acceptance/readiness/closure boundaries below.
7. **Document and close out at checkpoints.** Record meaningful verified work and evidence where appropriate; iteration alone does not require PROJECT_STATUS or AI Handoff closeout.

## Staged verification policy

### ITERATION MODE — default inside an active DRAFT PR

- Treat the PR as an iterative workspace: **edit → focused check → user review → adjust**.
- For small/local changes, run only focused tests/checks relevant to the changed slice. For UI iteration, normally review in a real browser at **1440×900** first. Run a targeted build/typecheck only when relevant to the changed files.
- Do not repeatedly run the full test suite, full desktop viewport matrix, repository **Verify**, **Export**, PROJECT_STATUS closeout or AI Handoff closeout after every micro-change.
- An iteration pass is not a completion claim.

### CHECKPOINT MODE

Use when the user accepts the current slice; before merge/review readiness, claiming a bug fixed or claiming required data coverage complete; or earlier for genuinely cross-cutting/high-risk source, domain, state, migration or build-pipeline changes.

- Run the full applicable verification with current repository commands: focused tests, full test suite, strict build, required real-browser desktop matrix, repository **Verify**, **Export** where applicable, and changed-file review.
- Complete PROJECT_STATUS / AI Handoff / bug-register closeout where appropriate, recording exact head SHA, changed files, implemented scope, check results, remaining PENDING/blockers and Handoff update ID when applicable. Report failed or unavailable required checks as blockers.
- Avoid duplicate full verification on an unchanged checkpoint head. After a checkpoint, return to ITERATION MODE for the next exploratory slice.

### Rules in both modes

- Never weaken tests.
- UI bugs require real UI/live verification before being called fixed.
- Do not infer data completeness from green architecture/tests; verify actual required coverage before claiming it complete.
