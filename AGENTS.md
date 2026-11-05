# Bellibing workers

- Continue existing Draft PR **#365** on branch `recovery/one-pr-build-team-improve-20261103`. Preserve local changes/source PRs; no second feature PR or project rebuild.
- **UI RESET — owner decision 2026-11-05:** The old mandatory UI/UX layout, controls, animations, pixel geometry and separate before/after `UI DECISION` approval rules are retired. Existing v34/#361/older visuals are optional references, not binding design requirements. The current user brief owns visual direction. Implement scoped design work and show real results for feedback; no micro-approval loop.
- Keep only the visual font identity: **ETNA** display, **Inter/system sans** utility; observe [Typography](docs/UI_TYPOGRAPHY.md) provenance/licensing.
- Do not fake delivery: UI must use functional HTML/CSS/JS rather than screenshot replacements; describe images accurately as sourced, cropped, edited or newly generated. Never claim genuine image generation when only reusing/cropping.
- Preserve actual Builds, CharacterBuildState, physical Inventory ownership, import corrections, Current/Candidate, Sandbox isolation, saved observations, recovery and canonical game/source facts. Unverified gameplay/results remain PENDING/UNKNOWN.
- Verify relevant behavior and the actual browser UI; report failed/incomplete checks. Tests cannot substitute for visual inspection.
- Respect local-only/no-commit/no-push constraints when given. No automatic backend activation, main writes, source-PR closure, branch deletion, force-push or history rewrite. Merge and deployment require separate explicit authorization.

Read relevant [Development Process](docs/DEVELOPMENT_PROCESS.md) sections and current code/contracts. [UI Agent Start](docs/UI_AGENT_START.md) describes the lightweight workflow. Historical UI documents do not override this reset.
