# Bellibing Simulator — Current Project Status

Last reconciled: 2026-09-06

This is the canonical living roadmap for the latest active Factory branch. Current `main` remains implementation/runtime truth until an explicitly authorized merge.

## 1. Current implementation truth

Current `main`: `3a7fc098320fb51c1a1c941c60774343c1958121`.

Factory v1 through Milestone 03 is integrated on `main` through PR #178. PRs #174–#177 are closed unmerged as superseded milestone evidence.

**Factory Milestone 04 — Provider Intake / Refresh v1 — implementation is complete and is represented by PR #179.**

- Branch: `factory/provider-intake-refresh-v1-2026-09-06`.
- Base: exact current `main` above.
- PR #179 is unmerged; merge still requires explicit user authorization.
- No Milestone 05 has started.
- Milestone 04 changes no Character Mechanics, combat/DPS, profiles, UI or canonical gameplay data.

## 2. Milestone 04 exit capability

Milestone 04 proves this bounded real chain:

`provider source / pinned upstream`
→ `automated provider-specific extraction`
→ `provenance-rich generated Factory raw evidence`
→ `reviewed mapper registry`
→ `reconciliation`
→ `deterministic evidence + intake reports`
→ `REVIEW_CANDIDATE` or `EXCEPTION_QUEUE`.

The first real lane is `Voruzhu/FrequencyManager`, MIT-licensed and bounded `EVIDENCE_ONLY`. Broad/roster-scale ingestion remains disabled.

The lane reuses only existing reviewed families:

- `weapon-rarity-v1` → `abyss-surges::rarity.stars`;
- `weapon-r1-attribute-dmg-bonus-v1` → `ages-of-harvest::r1.attribute-dmg-bonus.value`.

No third Wuthering Waves fact family was added.

## 3. Provider intake implementation

Milestone 04 adds:

- `src/factory/providerIntake/frequencyManager.ts` — bounded FrequencyManager parser and refresh-health assessment;
- `scripts/generate-factory-provider-intake.ts` — generates Factory evidence snapshots plus deterministic review reports without manual refresh JSON authoring;
- `fixtures/factory/frequency-manager/weapons-pinned-f585e47.ts` — offline fixture for the two existing reviewed targets;
- `test/factoryProviderIntake*.test.ts` — unchanged/change/missing/unknown/exact-SHA/provenance regressions;
- `.github/workflows/factory-provider-refresh.yml` — read-only external refresh workflow that checks out FrequencyManager, resolves exact upstream SHA, generates review artifacts and uploads them. It has no canonical/runtime write path.

Pinned proof source:

`Voruzhu/FrequencyManager@f585e47a868cb2b65845367b976a1781f130c758`

Path:

`adapters/game-definitions/wuthering-waves/weapons.ts`.

Real Provider Refresh #1 and #2 both succeeded. Generated review artifacts show both bounded targets as `UNCHANGED / CONSENSUS / REVIEW_CANDIDATE`, preserve exact upstream SHA/blob provenance, and keep `MANUAL_SOURCE_VALIDATION_REQUIRED`.

Provider-specific capture provenance is also locked: refreshed FrequencyManager candidates use the refresh capture time, while carried-forward Prydwen reviewed anchors retain their original capture timestamps.

## 4. Fail-closed refresh behavior

Milestone 04 does not let generic reconciliation hide provider degradation:

- unchanged reviewed value → normal mapper/reconciliation route;
- valid changed relevant value → `SOURCE_CHANGED`; effective intake route is `EXCEPTION_QUEUE`; current regressions produce mapper-level `CONFLICT`;
- expected provider row missing → `SOURCE_MISSING / EXCEPTION_QUEUE`, even if another reviewed source would otherwise produce generic `SINGLE_SOURCE`;
- unparseable/unsupported provider shape → `SOURCE_UNKNOWN / EXCEPTION_QUEUE`;
- non-exact upstream Git SHA is rejected before evidence generation;
- no path performs automatic canonical promotion or runtime mutation.

## 5. Existing source extraction workflow audit

`.github/workflows/profile-source-extract.yml` remains branch-bound to the old roster-wide Prydwen profile accelerator `feat/profile-source-import-accelerator-20260830`.

Milestone 04 disposition: **reuse-by-pattern / future refactor-or-supersede candidate; not mechanical reuse**.

Its artifact schema, roster-wide scope and Chromium/network extraction do not match the bounded Factory fact-family intake contract. It is unchanged. Prydwen remains `REVIEW_ONLY`.

## 6. Reference Team 01 — golden regression

Augusta / Iuno / The Shorekeeper remains unchanged:

- dependency coverage `PARTIAL`;
- `dpsReady = false`;
- exactly six required `PENDING` dependencies:
  1. `iuno-wan-light-at-cap-trigger-semantics`;
  2. `iuno-wan-light-augusta-event-overlap`;
  3. `shorekeeper-stellar-symphony-augusta-window-overlap`;
  4. `shorekeeper-rejuvenating-augusta-window-overlap`;
  5. `shorekeeper-fallacy-team-atk-augusta-window-overlap`;
  6. `shorekeeper-fallacy-wielder-er-stellarealm-state`.

`BUG-028`, `BUG-029`, `BUG-008` and `BUG-010` remain open/relevant. Abyss Surges level-90 Base ATK `587` vs `588` remains a parked provider conflict; no Base ATK mapper/coercion was added.

## 7. Provider/canonical boundary

- Prydwen — `REVIEW_ONLY`.
- FrequencyManager — MIT, bounded `EVIDENCE_ONLY`, no canonical authority.
- `d4rkOfficial/wuwa-afyg-tool` — MIT evidence/reference candidate only after bounded review.
- `DommyMM/wuwabuild` — no established reuse license; no new code/data copying.

All Factory reconciliations retain `MANUAL_SOURCE_VALIDATION_REQUIRED`. Provider source changes, `CONFLICT`, `MISSING` and `UNKNOWN` never auto-promote.

## 8. Verification state

Verified Milestone 04 evidence before this final docs-only state commit:

- Factory Fast #30 — SUCCESS;
- Factory Provider Refresh #1 — SUCCESS against real pinned FrequencyManager;
- Factory Provider Refresh #2 — SUCCESS after exact capture-provenance correction;
- Factory Fast #34 — SUCCESS with provider-specific capture regression;
- Factory Fast #36 — SUCCESS on PR #179 pre-final docs head `9723c0b0b98aace9902e80a832c97d4f7cbfc0eb`;
- full Verify #1055 — SUCCESS on that head, including full tests, strict build and required real-Chrome regression;
- Export #954 — SUCCESS on that head;
- Character Mechanics import #171 — SUCCESS on that head.

Normal tests/Verify remain network-independent because provider extraction regressions use local fixtures. External provider access is isolated to `Factory Provider Refresh`.

The current PR #179 head after this final docs-only state commit must have its own exact-head Factory Fast/full Verify/Export/Import green before PR #179 is marked ready for review. PR check state is authoritative for that final SHA; no correctness gate is weakened.

## 9. Handoff synchronization

The single permitted normal Milestone 04 Google Sheets synchronization attempt **succeeded** after the pre-final head passed full verification.

Verified read-back shows:

- `Mål & Handoff` now records current main plus Milestone 04 / PR #179 state;
- `UPD-158` records Provider Intake / Refresh v1 and the real provider proof;
- BUG-028/029 preservation notes remain `HIGH / KNOWN GAP` context;
- ChatGPT Project Instructions were updated to the Milestone 04 boundary.

No second Sheets write will be attempted for the final docs-only SHA. Handoff therefore records PR #179 head `9723c0b0...` at sync time, while this GitHub branch/PR remains authoritative for the final exact review SHA.

## 10. Milestone boundary

**Stop after Milestone 04. Do not start Milestone 05 automatically.**

The Milestone 04 capability answer is now **YES, bounded**: Factory can create review backlog from real FrequencyManager provider input without manual Factory evidence-authoring for the two already-reviewed targets. This does not authorize roster-scale ingestion or canonical promotion.

Merge PR #179 only after explicit user authorization.
