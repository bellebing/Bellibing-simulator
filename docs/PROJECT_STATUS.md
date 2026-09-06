# Bellibing Simulator — Current Project Status

Last reconciled: 2026-09-06

This is the canonical living roadmap for current `main`.

## 1. Current implementation truth

Current `main`: `1c396832f6658df7a1bd17305c4a3e488d6878b1`.

Factory v1 through Milestone 04 is integrated on `main` through PR #179.

- PR #179 final review head: `553bcb1dd9b18989f76ff000bba77307db6b0866`.
- PR #179 was merged with a normal merge commit, not squash/rebase.
- Milestone 04 integration merge commit: `1c396832f6658df7a1bd17305c4a3e488d6878b1`.
- That merge commit has prior `main` `3a7fc098320fb51c1a1c941c60774343c1958121` and the verified PR head as its two parents.
- PRs #174–#177 remain closed unmerged as superseded milestone evidence; PR #178 remains the canonical integration record for Milestones 00–03.
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

Milestone 04 and its integration are green:

- Factory Provider Refresh #1 — SUCCESS against real pinned FrequencyManager;
- Factory Provider Refresh #2 — SUCCESS after exact capture-provenance correction;
- final PR #179 head `553bcb1dd9b18989f76ff000bba77307db6b0866`: Factory Fast #37 — SUCCESS;
- final PR #179 head: full Verify #1056 — SUCCESS;
- final PR #179 head: Export #955 — SUCCESS;
- final PR #179 head: Character Mechanics import #172 — SUCCESS;
- actual integration merge commit `1c396832f6658df7a1bd17305c4a3e488d6878b1`: full Verify #1057 — SUCCESS;
- actual integration merge commit: Export #956 — SUCCESS;
- actual integration merge commit: Deploy #141 — SUCCESS, including live-site verification in Chrome for Alpha/Roll Assist, Augusta upgrade loop and Ciaccona owned-build path.

Normal tests/Verify remain network-independent because provider extraction regressions use local fixtures. External provider access is isolated to `Factory Provider Refresh`. No correctness gate was weakened.

## 9. Handoff synchronization

The Milestone 04 pre-merge Google Sheets synchronization succeeded and established the UPD-158 state with the milestone review evidence and blocker preservation.

Post-merge Handoff synchronization is external bookkeeping and is performed at most once, only after the final post-merge `main` state is verified green. Whether that external write succeeds or fails does not change canonical GitHub implementation truth.

## 10. Milestone boundary

**Stop after Milestone 04. Do not start Milestone 05 automatically.**

The Milestone 04 capability answer is **YES, bounded**: Factory can create review backlog from real FrequencyManager provider input without manual Factory evidence-authoring for the two already-reviewed targets. This does not authorize roster-scale ingestion or canonical promotion.

Milestone 04 integration is complete on `main`; the next Factory objective requires a new explicit bounded decision.
