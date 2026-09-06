# Bellibing Simulator — Current Project Status

Last reconciled: 2026-09-06

This is the canonical living roadmap for the latest active Factory branch. Current `main` remains implementation truth until an explicitly authorized merge.

## 1. Current implementation truth

Current `main`: `3a7fc098320fb51c1a1c941c60774343c1958121`.

Factory v1 through Milestone 03 is integrated on `main` through PR #178. PRs #174–#177 are closed unmerged as superseded milestone evidence and must not be merged separately.

**ACTIVE MILESTONE: Factory Provider Intake / Refresh v1 (Milestone 04).**

Branch: `factory/provider-intake-refresh-v1-2026-09-06`.

Milestone 04 starts exactly from current `main` and does not change Character Mechanics, combat/DPS, profiles, UI or canonical gameplay data.

## 2. Milestone 04 objective

Milestone 04 proves the first automated provider-to-review path that does not require a human to manually author refreshed Factory evidence JSON:

`provider source / pinned upstream`
→ `automated provider-specific extraction`
→ `provenance-rich Factory raw evidence`
→ `reviewed mapper registry`
→ `reconciliation`
→ `deterministic evidence + intake reports`
→ `REVIEW_CANDIDATE` or `EXCEPTION_QUEUE`.

The bounded provider is `Voruzhu/FrequencyManager`, which remains MIT-licensed, evidence-only and non-canonical. Broad/roster-scale ingestion remains disabled.

Milestone 04 reuses the already reviewed families only:

- `weapon-rarity-v1` for `abyss-surges::rarity.stars`;
- `weapon-r1-attribute-dmg-bonus-v1` for `ages-of-harvest::r1.attribute-dmg-bonus.value`.

No third Wuthering Waves fact family is introduced.

## 3. Provider intake implementation

The new bounded intake lane includes:

- `src/factory/providerIntake/frequencyManager.ts` — provider-specific parser + refresh/change assessment;
- `scripts/generate-factory-provider-intake.ts` — writes generated evidence snapshots and deterministic review reports;
- `fixtures/factory/frequency-manager/weapons-pinned-f585e47.ts` — offline fixture covering only the two existing reviewed targets;
- `test/factoryProviderIntake*.test.ts` — fixture-based success/change/missing/unknown/provenance regressions;
- `.github/workflows/factory-provider-refresh.yml` — external refresh workflow that checks out FrequencyManager, resolves the exact SHA, generates review artifacts and uploads them. It has read-only repository permissions and no canonical write path.

The provider source defaults to pinned upstream:
`Voruzhu/FrequencyManager@f585e47a868cb2b65845367b976a1781f130c758`, path `adapters/game-definitions/wuthering-waves/weapons.ts`.

The real external refresh run proved:

- exact upstream SHA was resolved as `f585e47a868cb2b65845367b976a1781f130c758`;
- both existing targets extracted successfully;
- both reconciled as `CONSENSUS`;
- both routed to `REVIEW_CANDIDATE`;
- `canonicalPromotion = MANUAL_SOURCE_VALIDATION_REQUIRED`;
- uploaded artifact: `factory-provider-intake-frequency-manager-f585e47a868cb2b65845367b976a1781f130c758`;
- FrequencyManager candidates retain the fresh refresh capture timestamp while carried-forward Prydwen reviewed anchors retain their original capture timestamps.

Fail-closed fixture regressions prove:

- valid upstream value change → `SOURCE_CHANGED`; mapper/reconciliation disagreement → `CONFLICT / EXCEPTION_QUEUE`;
- provider row missing → `SOURCE_MISSING / EXCEPTION_QUEUE` at intake level even if generic reconciliation would otherwise degrade to `SINGLE_SOURCE`;
- provider value unparseable/unsupported → `SOURCE_UNKNOWN / EXCEPTION_QUEUE`;
- non-exact upstream refs are rejected before evidence generation;
- no provider output promotes or mutates canonical/runtime truth.

## 4. Old profile source extractor audit

`.github/workflows/profile-source-extract.yml` remains a branch-bound roster-wide Prydwen profile accelerator for `feat/profile-source-import-accelerator-20260830`.

Milestone 04 classification: **reuse-by-pattern / future refactor or supersede candidate, not mechanical reuse**.

Reasons:

- artifact schema is profile backlog/import accelerator, not Factory fact-family evidence;
- scope is roster-wide rather than bounded;
- it requires Prydwen network/Chromium extraction;
- Prydwen remains `REVIEW_ONLY`.

Milestone 04 does not modify that workflow.

## 5. Reference Team 01 — golden regression

Team: **Augusta / Iuno / The Shorekeeper**.

State is unchanged:

- dependency coverage: `PARTIAL`;
- `dpsReady = false`;
- exactly six required dependencies remain `PENDING`:
  1. `iuno-wan-light-at-cap-trigger-semantics`;
  2. `iuno-wan-light-augusta-event-overlap`;
  3. `shorekeeper-stellar-symphony-augusta-window-overlap`;
  4. `shorekeeper-rejuvenating-augusta-window-overlap`;
  5. `shorekeeper-fallacy-team-atk-augusta-window-overlap`;
  6. `shorekeeper-fallacy-wielder-er-stellarealm-state`.

Related blockers remain open/relevant: `BUG-028`, `BUG-029`, `BUG-008`, `BUG-010`. The parked Abyss Surges level-90 Base ATK `587` vs `588` provider conflict remains unresolved and no Base ATK mapper is added.

## 6. Provider/canonical boundary

- Prydwen — `REVIEW_ONLY`.
- FrequencyManager — MIT, bounded `EVIDENCE_ONLY`, no canonical authority.
- `d4rkOfficial/wuwa-afyg-tool` — MIT evidence/reference candidate only after bounded review.
- `DommyMM/wuwabuild` — no established reuse license; no new code/data copying.

All Factory reconciliations retain `MANUAL_SOURCE_VALIDATION_REQUIRED`. `CONFLICT / MISSING / UNKNOWN` never auto-promote.

## 7. Verification state

Iteration verification is green:

- Factory Fast #30 — SUCCESS on initial intake implementation;
- Factory Provider Refresh #1 — SUCCESS against real pinned FrequencyManager source;
- Factory Provider Refresh #2 — SUCCESS after exact capture-provenance correction;
- Factory Fast #34 — SUCCESS including the provider-specific capture provenance regression.

Normal `npm test` / `Verify` remains network-independent because provider parsing tests use local fixtures. The external network lane is a separate workflow.

**Review-ready exit still requires full repository Verify on the final Milestone 04 head.** No merge is authorized by this document.

## 8. External Handoff synchronization

Bellibing Echo Tool Handoff remains permission-blocked from the prior post-merge attempt (`403 PERMISSION_DENIED`). After Milestone 04 reaches meaningful full-verified state, perform at most one normal sync attempt. No workaround or partial write is allowed.

Until permission returns, GitHub living docs remain the current project-state source above the stale Handoff.

## 9. Milestone boundary

Stop after Milestone 04. Do not start Milestone 05 automatically.

Milestone 04 is successful only if the final review head proves that a provider source artifact can create review backlog artifacts without manual Factory evidence-authoring. If a link remains missing, the next milestone must address that link rather than broadening source/fact coverage.
