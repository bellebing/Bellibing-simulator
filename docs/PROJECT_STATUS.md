# Bellibing Simulator — Current Project Status

Last reconciled: 2026-09-06

This is the canonical living roadmap for repository `main`. The repository `main` branch head is authoritative implementation/runtime truth. This document intentionally does not hardcode the live branch-head SHA, because a docs commit would make that value stale by construction.

## 1. Current implementation truth

Repository `main` branch head = authoritative implementation/runtime truth.

Factory v1 through Milestone 04 is integrated on `main` through PR #179.

- PR #179 final review head: `553bcb1dd9b18989f76ff000bba77307db6b0866`.
- Milestone 04 integration merge checkpoint: `1c396832f6658df7a1bd17305c4a3e488d6878b1`.
- Post-merge canonical cleanup checkpoint: `72e4de8de8ce52a98293cb6f18a48292a94f5597`.
- PR #180 is the active **unmerged** Milestone 05 review candidate: `Provider Refresh Change Detection / Triage v1`.
- Milestone 05 merge still requires separate explicit authorization.
- PRs #174–#177 remain closed unmerged superseded milestone evidence; PR #178 remains the canonical integration record for Milestones 00–03.
- Milestone 05 changes no Character Mechanics, combat/DPS, profiles, UI or canonical gameplay data.

## 2. Milestone 04 exit capability

Milestone 04 proves this bounded real chain:

`provider source / pinned upstream`
→ `automated provider-specific extraction`
→ `provenance-rich generated Factory raw evidence`
→ `reviewed mapper registry`
→ `reconciliation`
→ `deterministic evidence + intake reports`
→ `REVIEW_CANDIDATE` or `EXCEPTION_QUEUE`.

The real lane remains `Voruzhu/FrequencyManager`, MIT-licensed and bounded `EVIDENCE_ONLY`. Broad/roster-scale ingestion remains disabled.

The lane still reuses only the two existing reviewed families:

- `weapon-rarity-v1` → `abyss-surges::rarity.stars`;
- `weapon-r1-attribute-dmg-bonus-v1` → `ages-of-harvest::r1.attribute-dmg-bonus.value`.

No third Wuthering Waves fact family has been added.

## 3. Milestone 05 — Provider Refresh Change Detection / Triage v1

Milestone 05 addresses the operational gap above Milestone 04: a successful refresh should distinguish between new human review work and a healthy no-change check without changing Factory evidence/reconciliation semantics.

The triage dispositions are operational only:

- `NO_REVIEW_REQUIRED` — provider refresh completed correctly and every bounded target is `UNCHANGED`;
- `REVIEW_REQUIRED` — refresh completed, but at least one target is `SOURCE_CHANGED`, `SOURCE_MISSING` or `SOURCE_UNKNOWN`;
- `REFRESH_FAILURE` — provider checkout, provenance resolution or global intake execution could not complete safely. This does not fabricate Factory evidence classifications or reconciliation data.

A provider commit advance by itself never creates review. A new exact upstream SHA with identical bounded semantic facts remains `NO_REVIEW_REQUIRED`.

## 4. Milestone 05 implementation

PR #180 adds:

- `src/factory/providerIntake/refreshTriage.ts` — deterministic operational triage above the unchanged Milestone 04 intake report;
- `test/factoryProviderRefreshTriage.test.ts` — no-change, timestamp determinism, new-SHA/same-facts, changed, missing, unknown and pre-intake/global-failure regressions;
- `scripts/generate-factory-provider-intake.ts` — emits deterministic triage JSON/Markdown alongside the full Milestone 04 evidence bundle, and emits a failure-only triage artifact when intake cannot safely run;
- `.github/workflows/factory-provider-refresh.yml` — adds scheduled bounded refresh, provider-configured default ref `master`, exact resolved SHA validation, Actions summary output and explicit operational failure handling while retaining `contents: read`.

The parser is not hardcoded to a permanent default-branch name. `master` is workflow/provider configuration; manual dispatch still accepts an explicit ref/SHA.

No issue creation, canonical write, provider auto-trust or runtime mutation path exists.

## 5. Determinism and fail-closed behavior

Semantic triage excludes volatile execution metadata such as capture timestamps and workflow run IDs. For the same baseline plus the same upstream provenance/content/result, rendered triage JSON/Markdown is deterministic.

The successful triage report carries:

- exact upstream SHA and source blob provenance;
- configured provider ref;
- baseline FrequencyManager source ref/version per bounded target;
- current source ref/version per bounded target;
- each target's existing Milestone 04 refresh status;
- triage disposition and `attentionRequired`.

Milestone 04 evidence/reconciliation remains unchanged:

- unchanged reviewed value → normal reconciliation route;
- valid changed relevant value → `SOURCE_CHANGED` and effective `EXCEPTION_QUEUE`;
- expected provider row missing → `SOURCE_MISSING / EXCEPTION_QUEUE`;
- unsupported/unparseable row → `SOURCE_UNKNOWN / EXCEPTION_QUEUE`;
- all reconciliations retain `MANUAL_SOURCE_VALIDATION_REQUIRED`.

`REFRESH_FAILURE` is not a new Factory evidence classification.

## 6. Real provider proof

Real `Factory Provider Refresh` run #6 on the Milestone 05 implementation head succeeded against provider-configured `Voruzhu/FrequencyManager@master`.

The uploaded artifact was inspected directly and proves:

- `master` resolved to exact SHA `f585e47a868cb2b65845367b976a1781f130c758`;
- `abyss-surges::rarity.stars` → `UNCHANGED`;
- `ages-of-harvest::r1.attribute-dmg-bonus.value` → `UNCHANGED`;
- triage disposition → `NO_REVIEW_REQUIRED`;
- `attentionRequired=false`;
- baseline and current FrequencyManager source versions/refs are retained;
- canonical promotion policy remains `MANUAL_SOURCE_VALIDATION_REQUIRED`.

This is real provider proof, not fixture-only evidence.

## 7. Existing source extraction workflow audit

`.github/workflows/profile-source-extract.yml` remains branch-bound to the old roster-wide Prydwen profile accelerator `feat/profile-source-import-accelerator-20260830`.

Disposition remains **reuse-by-pattern / future refactor-or-supersede candidate; not mechanical reuse**. Its artifact schema, roster-wide scope and Chromium/network extraction do not match bounded Factory fact-family intake. It is unchanged. Prydwen remains `REVIEW_ONLY`.

## 8. Reference Team 01 — golden regression

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

## 9. Provider/canonical boundary

- Prydwen — `REVIEW_ONLY`.
- FrequencyManager — MIT, bounded `EVIDENCE_ONLY`, no canonical authority.
- `d4rkOfficial/wuwa-afyg-tool` — MIT evidence/reference candidate only after bounded review.
- `DommyMM/wuwabuild` — no established reuse license; no new code/data copying.

All Factory reconciliations retain `MANUAL_SOURCE_VALIDATION_REQUIRED`. Provider source changes, `CONFLICT`, `MISSING` and `UNKNOWN` never auto-promote.

## 10. Verification state

Milestone 04 integration remains green as previously recorded through PR #179 and its post-merge checkpoints.

Milestone 05 implementation payload before documentation synchronization passed:

- Factory Fast #43 — SUCCESS;
- full Verify #1060 verify job — SUCCESS, including tests, strict web build, browser regression and whitespace gate;
- Export #959 — SUCCESS;
- Factory Provider Refresh #6 — SUCCESS against real `FrequencyManager/master`;
- direct artifact inspection — SUCCESS with `NO_REVIEW_REQUIRED`, `attentionRequired=false` and exact upstream SHA/provenance.

Documentation synchronization changes only Factory docs and must retain the same full-repo correctness gates on the final review head. No verification gate is weakened.

## 11. Handoff synchronization

The external Bellibing Echo Tool — AI Handoff remains the place to record the final exact PR review-head SHA and final verification run identifiers without creating a self-referential GitHub-doc problem.

Milestone 05 Handoff synchronization is required after the final review head is verified. No Handoff write changes canonical GitHub implementation/runtime truth.

## 12. Milestone boundary

**Stop after Milestone 05 review-ready. Do not start coverage expansion or Milestone 06 automatically.**

Milestone 05 does not authorize roster-scale ingestion, Character-by-Character work, Reference Team micro-slicing, a universal gameplay DSL, new fact families/providers, automatic provider trust or canonical promotion.

PR #180 remains unmerged until separate explicit merge authorization is given.