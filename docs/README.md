# Bellibing documentation — where to start

**Current (2026-11-14) local beta direction:** [BETA_STATUS.md](BETA_STATUS.md) → [GitHub beta tracker #368](https://github.com/bellebing/Bellibing-simulator/issues/368). Read the **actual GitHub branch/CI** before using any readiness claim. The public `main` and unmerged local candidate [PR #365](https://github.com/bellebing/Bellibing-simulator/pull/365) are deliberately different.

## Authoritative current documents

- [Beta status / scope / outstanding gates](BETA_STATUS.md) — first read, owner-facing summary and exact readiness limits.
- [PROJECT_STATUS.md](PROJECT_STATUS.md) — detailed implementation, coverage and technical Pending; dated entries may refer to older PR heads or `main`. Prefer the Beta index for live priority.
- [DEVELOPMENT_PROCESS.md](DEVELOPMENT_PROCESS.md) — verification risk classes, FAST/REVIEW/MERGE, source and ownership safety. **Overrides older procedural instructions**.
- [PRODUCT_CONTRACT.md](PRODUCT_CONTRACT.md), [DATA_VERIFICATION_POLICY.md](DATA_VERIFICATION_POLICY.md), [CONTENT_PREFLIGHT_AND_IMPACT_AUDIT.md](CONTENT_PREFLIGHT_AND_IMPACT_AUDIT.md) — canonical contracts and audits; no invented data/effects.
- [CHARACTER_IMPORT_LOCAL.md](CHARACTER_IMPORT_LOCAL.md), [CHARACTER_IMPORT_PIPELINE.md](CHARACTER_IMPORT_PIPELINE.md) — local scanner and source-backed new Character onboarding, with explicitly noted real-Windows / private-DPS gaps.
- [ONE_PR_INTEGRATION_REVIEW.md](ONE_PR_INTEGRATION_REVIEW.md) — source-preservation and candidate review **at its recorded historical head**, not today's automatically accepted UI.
- [IMPROVE_CHARACTER_PRODUCT_DEFAULTS.md](IMPROVE_CHARACTER_PRODUCT_DEFAULTS.md) — 59-character source-family/product-default coverage, not an assertion that 61 characters now have 61 verified guides.

## Active work tracking (avoid competing backlogs)

**Use [GitHub Issues](https://github.com/bellebing/Bellibing-simulator/issues) for active bugs and roadmap tasks right now.** The structured bug form is only in the unmerged PR; until merge, choose **New issue** normally. The owner-facing local beta queue is [#368](https://github.com/bellebing/Bellibing-simulator/issues/368). For historical `BUG-xxx`, logs/decisions and private owner evidence, cross-reference the private Handoff sheet (`Buggar`, `Uppdateringslogg`); do not copy private image/account data to a public Issue. Closed means proven fixed by affected-surface evidence, not merely code committed.

## Historical or superseded sequencing (retained, not governing today)

- [USABLE_RELEASE_PLAN.md](USABLE_RELEASE_PLAN.md): historical feature steps including claims from before commits were pushed; not the current beta state.
- [PRODUCT_JOURNEY_ROADMAP.md](PRODUCT_JOURNEY_ROADMAP.md), [ROADMAP_DOCUMENT_AUDIT.md](ROADMAP_DOCUMENT_AUDIT.md): October sequencing and authority audit. Still useful for long-range intent, not current beta priority.
- [M0_LANDING_AND_ONLINE_BETA.md](M0_LANDING_AND_ONLINE_BETA.md), [M0_COORDINATED_RELEASE.md](M0_COORDINATED_RELEASE.md): earlier *online* deployment campaign, not permission to publish the local PR.
- [SANDBOX_SIMULATOR_ROADMAP.md](SANDBOX_SIMULATOR_ROADMAP.md), older PR/review snapshots, `docs/archive/` and `docs/pr365-preview/`: historic program/candidate assets; may have live references. Keep until a separate dependency/links/artifact audit.
- All dated source reviews, character mechanics/Skill/Sequence/guide audits and migration evidence remain reference material even if their earlier "next step" text is obsolete. **Do not remove source pins or data evidence.**

## Cleanup rule

Each future docs cleanup should: (1) compare against live source, (2) label outdated release/priority text, (3) redirect to the current beta entry point, (4) check inbound links/build references, (5) remove/move only after verifying no required test/source/history is lost. Docs/archive is **not** garbage collection. This index intentionally keeps the large historic document tree intact on the first pass.
