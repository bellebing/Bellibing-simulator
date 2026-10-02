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
6. **Verify the change.** Run focused tests, the full test suite, strict build, and the repository **Verify** workflow using current repository commands. Never weaken tests to pass. UI changes require real browser/live verification where applicable. Never mark a bug fixed without verification; report checks that fail or cannot run as blockers. Do not treat green architecture/tests as proof that required data coverage is complete; verify the actual required coverage.
7. **Document meaningful verified work.** Update `docs/PROJECT_STATUS.md` when appropriate. Update the AI Handoff update log and bug register with exact state, head SHA, test/Verify evidence, and remaining blockers. Do not claim coverage complete while required data is incomplete.
8. **Close out with evidence:** exact head SHA; changed files; what was implemented; remaining PENDING/blockers; focused/full test results; strict build/Verify result; and Handoff update ID when applicable.
