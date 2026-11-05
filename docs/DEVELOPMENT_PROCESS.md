# Development Process v2

Canonical worker process, read by relevant section as directed by [AGENTS.md](../AGENTS.md); older mandatory UI rules and per-change approval gates are retired (owner decision 2026-11-05). This process replaces historical workflow/checkpoint instructions. Relevant product/domain contracts and the user's current scope still apply.

## Work from the task

1. Check local branch, HEAD and existing changes. Inspect affected code and relevant contracts; preserve other work.
2. Make the smallest coherent change within scope. Reuse canonical models/components. For UI, follow the user's current brief, implement coherent scoped changes and review real rendered results; do not require separate approval for every visual detail.
3. Run focused checks, review the diff and report results/limits. Continue routine task-related fixes; stop at completion, a requested checkpoint or a real blocker. Ask only for missing decisions that affect the task.

Small local tasks do not require all PR comments, CI, history, PROJECT_STATUS or Handoff. Recover broader context when scope is unclear, evidence conflicts, the base changes or publication/merge is prepared: current GitHub main/relevant PR/code/CI → [PROJECT_STATUS](PROJECT_STATUS.md) → available AI Handoff → relevant contracts. Code establishes implementation; the user's current brief guides design. Candidates remain separate from main. Verify remote identity before claiming local/PR parity; unavailable access blocks only dependent work. Reuse known context rather than rereading it after each edit.

## Always preserve

- Source truth: never guess Wuthering Waves values, conditions, timing, ownership, stacking or rotations. Reuse reviewed facts/provenance; missing or disputed evidence stays PENDING/UNKNOWN and fails closed, never zero. External evidence needs review. V9.15 is historical reference only when needed.
- Architecture: raw/source → effects/mechanics → profiles → combat/DPS → UI; character-free Echo Core, one canonical model, no gameplay math in presentation. Preserve source pins, generated parity, content preflight and backward-impact/readiness checks where relevant. Facts/tests do not establish executable coverage or DPS readiness.
- User data: saved builds, Character isolation, physical equipment ownership, legacy recovery and failure safety. No silent loss or real-account reset as a fix.
- Scope/permissions: no unrelated fixes, extra UI, automatic backend activation, main writes, source-PR closure, branch deletion, force-push or history rewrite. Respect commit/push limits; merge/deployment need explicit authorization. Do not weaken tests/CI or expand scope to fix inherited failures.

## Verification

**FAST — normal work:** focused tests/audits and `git diff --check`; typecheck/build when relevant. Docs need links/diff and a contract check. UI needs actual appearance and affected interaction; persistence needs relevant isolation/save/reload/migration/failure cases; mechanics need source conditions/order/negative cases; shared combat/DPS needs independent parity and broader readiness evidence. Build/CI changes need proof of the affected packaging/gate contract. Expand checks for dependency reach, failures or unresolved risk, not after every small edit.

**REVIEW — owner inspection:** use the requested preview, including local Live Preview. Start desktop UI at 1440×900; add 1920×1080/2560×1440 when width-sensitive. Exercise pointer behavior with real pointer input and inspect rendered screenshots. Preserve existing mobile code; no mobile redesign unless requested. Check tool availability and report missing checks honestly. A blocked browser is not permission for workaround UI. Visual acceptance does not replace source/data/function checks. GitHack is for published review, not a reason to push local-only work.

**MERGE — final candidate or earlier high risk:** full tests/audits, strict build, required real-browser/UI Lab/private paired gates where applicable, whitespace and successful exact-head FULL Verify with its web/visual artifacts. Export/preview is not FULL. Drafts may opt into FULL with `full-verification` or workflow_dispatch. Use applicable exact-head CI; repeat locally only for a demonstrated gap/failure. Changed inputs/source drift invalidate old evidence. Keep existing triggers/protections; no bypass or blanket skip-CI. Verified Ready stays Ready unless rework is needed; Ready is not merge permission.

## Keep reports and knowledge useful

Report changes, checks, failures/limits and blockers. Distinguish local/PR/merged/deployed state and identify the revision when relevant; never claim unsupported acceptance, coverage or bug closure.

Update current docs in place only for meaningful decisions/product/blocker changes, not every iteration. GitHub owns SHA/CI/artifacts; PROJECT_STATUS owns product/roadmap/blockers; Handoff owns cross-source goals/decisions; history and bugs stay in their own records. Do not duplicate live state or accumulate checkpoint logs.

Past UI concepts and owner feedback may be recorded as optional inspiration, never compulsory placement, style or approval rules. The old separate `UI DECISION` and mandatory before/after-per-change ceremony is retired. Engineering tests, preservation and independent merge/deploy authorization remain mandatory.
