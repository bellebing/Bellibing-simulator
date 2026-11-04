# Bellibing workers

- Continue Draft PR **#365**, branch `recovery/one-pr-build-team-improve-20261103`, in this checkout. Preserve local changes and source PRs; no second feature PR or project rebuild.
- Make the requested change with existing models/components and focused checks. Report results and missing checks honestly; do not weaken tests or CI.
- Preserve the approved style and typography. Keep UI text minimal; prefer inline expandable cards over new popups. This does not authorize redesigning existing UI.
- Before visible changes, follow [Owner UI Control](docs/OWNER_UI_CONTROL.md): obtain separate **UI DECISION** approval of exact appearance, copy and interaction. Complete an already approved proposal without asking again; pause only new visible deviations.
- Preserve saved data, equipment ownership and recovery. Never invent gameplay facts/results; unknown stays PENDING/UNKNOWN, never zero.
- Respect local-only/no-commit/no-push limits. No automatic backend activation, main writes, source-PR closure, branch deletion, force-push or history rewrite. Merge/deployment require explicit authorization.

Read [Development Process v2](docs/DEVELOPMENT_PROCESS.md) sections relevant to state/persistence, source/mechanics, build/CI, broader recovery or publication/merge. For UI references, use [UI Agent Start](docs/UI_AGENT_START.md). A small, explicit local task needs only these ground rules and relevant code/contracts; do not routinely read every linked file or reread unchanged instructions.
