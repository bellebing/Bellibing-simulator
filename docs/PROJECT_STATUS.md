# Bellibing Simulator — Current Project Status

Last reconciled: 2026-09-12

This is the canonical living roadmap for repository `main`. The repository `main` branch head is authoritative implementation/runtime truth. This document intentionally does not hardcode the live branch-head SHA, because a docs commit would make that value stale by construction.

## 1. Current implementation truth

Repository `main` branch head = authoritative implementation/runtime truth.

Factory v1 through Milestone 05 is integrated on `main` through PR #180.

- PR #179 final review head: `553bcb1dd9b18989f76ff000bba77307db6b0866`.
- Milestone 04 integration merge checkpoint: `1c396832f6658df7a1bd17305c4a3e488d6878b1`.
- Post-merge canonical cleanup checkpoint: `72e4de8de8ce52a98293cb6f18a48292a94f5597`.
- PR #180 final head `c3bce5e3eebd57f06cc1776e1069ec2368f75945` was integrated with normal merge commit `4f507f59e9b3be7a5cfa72f872803740c5a15a36`.
- The integration parents are prior main `b789cc7e44bdcda5a44176d8d17b5355567bc807` and that exact verified PR head.
- PRs #174–#177 remain closed unmerged superseded milestone evidence; PR #178 remains the canonical integration record for Milestones 00–03.
- Milestone 05 changes no Character Mechanics, combat/DPS, profiles, UI or canonical gameplay data.

PR #183 integrated the isolated UI/UX v34 checkpoint after M05. `docs/UI_UX_STATUS.md` owns the new UI interaction contract. Normal builds publish its prototype at `/ui-preview/`; the existing Alpha root and runtime regression routes remain intact. Backend work must preserve both payloads and must not alter the user's UI behavior. The historical UI integration checkpoint is `2a3b16f6122d81a8c2d39ab378e70971d8f1244d`.

The Character backend stack #182/#184–#188 is **integrated on main through merged PR #189**. Its normal merge checkpoint is `b16552da92a35a717c179a3801b262d728cbba97`, with prior main `2a3b16f6122d81a8c2d39ab378e70971d8f1244d` and verified integration head `0cfe37eac5942410898b788bd4d2b761c8ae767c` as parents. Post-merge Verify #1085, Export #984 and Deploy #146 passed on that exact commit, including 734 tests, strict build and live browser checks. Published Alpha, `/ui-preview/` and Character database bytes matched the reviewed payload. See [integration evidence](CHARACTER_BACKEND_INTEGRATION_REVIEW.md); its earlier candidate state is historical.

PR #190 is **MERGED and post-merge verified**. Normal merge commit `c37b3ea5c0833f0483e2da2ac9cca36d42e1902f` has parents prior main `b16552da92a35a717c179a3801b262d728cbba97` and reviewed PR head `707563b91a2a5e892eae711739b14fa1c47e46ae`; the merge tree exactly matches that reviewed head. Post-merge Verify #1102, Export #1001 and Deploy #147 (including live browser checks) passed; all three CI test logs show 800/800 tests and zero failures. Published Alpha, `/ui-preview/`, Echo Lab, Roll Assist and Character database bytes match Export. No branch was deleted.

PR #191 is **MERGED and post-merge verified** at `3fe1544f81ba7658fccd2ebbe4c4471bf6dd7d89`. Its parents are prior main `c37b3ea5c0833f0483e2da2ac9cca36d42e1902f` and reviewed head `30058599ae7f52eb70b0011d00066e1cbaebdfc8`; the resulting tree `212d91add597d26504cc8d3888779ac303c1afe0` exactly matches the reviewed payload. Post-merge [Verify #1110](https://github.com/bellebing/Bellibing-simulator/actions/runs/34630158510), [Export #1009](https://github.com/bellebing/Bellibing-simulator/actions/runs/34630158564) and [Deploy #148](https://github.com/bellebing/Bellibing-simulator/actions/runs/34630158501) passed, each with 819/819 tests and zero failures. All source/profile audits, strict build, whitespace and real-browser regressions passed. Published Alpha, UI preview, Echo Lab, Roll Assist and Character database bytes match Export and the exact merge-head local build. No branch was deleted.

PR #193 is **MERGED and post-merge verified** at `b03d43b3f1810b502099efb321be225ccfbba46c`. Parents: prior main `3fe1544f81ba7658fccd2ebbe4c4471bf6dd7d89` and reviewed head `4e19968e0a2a15ee5506f257d0f318579f4d87b1`; tree `8edb29dd5bf7e6ba641b7776b62ad8e5c0f03812` exactly matches that reviewed payload. [Verify #1127](https://github.com/bellebing/Bellibing-simulator/actions/runs/34673436423), [Export #1026](https://github.com/bellebing/Bellibing-simulator/actions/runs/34673436425) and [Deploy #149](https://github.com/bellebing/Bellibing-simulator/actions/runs/34673436460) passed on the merge commit: 832/832 tests, full audits, strict build, whitespace and real-Chrome regressions. Alpha, `/ui-preview/`, Echo Lab, Roll Assist and Character database match local/Export/live bytes. No branch was deleted; PR #192 and the preserved Flamewing WIP were untouched.

The four canonical Lupa/Qiuyuan/Lynae/Cantarella isolated Outro contracts are now canonical, with seven terms and 15 existing preset/Character consumers. This supplies no profile timeline or new DPS_READY Character. The [PR193 review](SOURCE_VALID_EXECUTION_REVIEW_20260911.md) records the historical candidate and parked lifecycle review.

The new branch `codex/profile-execution-closure-2026-09-12` starts from that verified main. Its bounded [nearest-profile audit](PROFILE_EXECUTION_CLOSURE_REVIEW_20260912.md) prioritizes complete execution evidence and a small resource feasibility cohort, not additional low-fanout Outro counts. One new draft PR is authorized; no later merge is authorized. S03/S10 are not re-researched without new lifecycle proof. All known source conflicts, six Reference Team blockers and deferred UI/Flamewing boundaries remain open.

The integrated payload isolates the historical Augusta team fixture, shares verified profile/default-equipment resolution, detaches team manifests, exports canonical gear, and extends the existing Echo identity family. Shared resource, Outro, explicit Echo-hit, damage-event, applied-heal and target-event bindings reuse canonical source facts. Cast capability export exposes existing contracts. No UI behavior or profile engine is added. See the [integration and reuse-first audit](PR190_INTEGRATION_AND_REUSE_AUDIT_20260910.md).

At the merged #193 baseline all **83 pending execution edges / 72 distinct dependency IDs** remain open: **26 UNREVIEWED / 24 PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE / 7 BLOCKED_SOURCE_CONFLICT / 9 BLOCKED_SOURCE_SEMANTICS / 17 PROFILE_SPECIFIC_EXECUTION**. Only Augusta and Ciaccona are DPS_READY; all six Reference Team blockers remain unresolved. Zani's Eternal Radiance stack view supports the isolated Spectro target window only, never the separate Frazzle-infliction trigger.

Merged #191 implements isolated-activation bindings for the existing canonical Zhezhi and Lumi Outro facts. Six current presets across five Characters discover them through existing team membership. Canonical RAW_ONLY and `maxStacks: null` remain unchanged. The existing transfer lifecycle requires caller-proven absence of an earlier activation, actual outgoing/incoming identities and timestamp, plus explicit query and recipient-switch ordering. Independent terms remain separate; rotations/readiness and repeated-activation semantics remain unresolved. The second slice adds exact Lorelei and Nightmare: Lampylumen ATK attack facts from supplemental damage-entry evidence. Existing Echo readers/kernel/export consume them; Cantarella/Zhezhi timelines remain pending. Roccia and Sanhua additionally reuse the isolated-transfer contract, bringing the four new Outro owners to nine presets/eight Characters. Integration review found and fixed a Voidwing caller-catalog validation gap in `ee7b6ff`; the reviewed runtime passes 819/819 local tests, strict build and all repository source/profile audits. The subsequent documentation checkpoint requires its own exact-head Verify/Export before landing readiness; final run IDs belong to PR #191 and AI Handoff. The follow-up adds two Sentry Construct attack alternatives; no capacitor/reset/freeze state is inferred. Voidwing Moth additionally has a separately reviewed use-to-Outro ATK transfer with explicit Rank-5/use/recipient/prior-state/order requirements; damage scaling stays pending. All 17 pending profiles still lack a canonical rotation denominator. See [current closure review](PR191_EXECUTION_CLOSURE_REVIEW_20260910.md) for the complete integration review, validation fix and parked boundaries. That integration stop was superseded by explicit authorization to merge #191 and begin the new backend pass after post-merge verification. That historical authorization was later superseded by the explicit #193-only merge and new execution-closure pass above; UI change and Flamewing inclusion remain unauthorized.

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

Real `Factory Provider Refresh` run #7 succeeded against provider-configured `Voruzhu/FrequencyManager@master` after the intake script was hardened to require the workflow/provider-configured `--provider-ref` explicitly.

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

Milestone 05 code/test/docs payload before the final proof-reference-only documentation sync passed:

- Factory Fast #47 — SUCCESS;
- full Verify #1064 verify job — SUCCESS, including tests, strict web build, browser regression and whitespace gate;
- Export #963 — SUCCESS;
- Factory Provider Refresh #7 — SUCCESS against real `FrequencyManager/master` on the current runtime-code payload;
- direct artifact inspection — SUCCESS with `NO_REVIEW_REQUIRED`, `attentionRequired=false` and exact upstream SHA/baseline/current provenance.

Final PR #180 head passed Factory Fast #49, full Verify #1066 and Export #965. The real Provider Refresh #7 runtime/script/workflow payload is unchanged at the final head; only documentation and a failure-path regression followed it. Its downloaded artifact SHA-256 was checked and the two `UNCHANGED` targets and provenance were read directly before integration.

Integration checkpoint `4f507f59e9b3be7a5cfa72f872803740c5a15a36` passed full Verify #1067, Export #966 and Deploy #144 including live-site verification. Exact checks for subsequent work are recorded on its PR and in Handoff. No verification gate is weakened.

## 11. Handoff synchronization

The external Bellibing Echo Tool — AI Handoff remains the place to record the final exact PR review-head SHA and final verification run identifiers without creating a self-referential GitHub-doc problem.

UPD-162 records M05 integration and the unmerged Character database slice; UPD-163 records the integrated UI checkpoint. Subsequent backend Handoff records must distinguish verified branch heads from canonical main. No Handoff write changes canonical GitHub implementation/runtime truth.

## 12. Milestone boundary

**Current responsibility: Character data and reusable backend models. The user is building the UI separately.**

Prioritize the shortest source-valid path to supporting many Characters: reuse existing canonical rows, review shared fact/mechanic families in batches, and reuse execution primitives. Add Character-specific code only where actual mechanics require it. Follow `BEST_AVAILABLE_TEAMS_DIRECTION.md` for the downstream product contract; keep the six Reference Team dependencies open until independently resolved.

The current backend slice adds `characterActionValues.ts` and `characterDatabase.ts`: a common exact source-value reader across 54 verified mechanics profiles, reused by Ciaccona, and a deterministic JSON export for all 60 canonical identities (57 released), 1868 facts and 47 presets. `npm run export:characters` writes the standalone database; normal builds include `dist/data/character-database.json`. See `CHARACTER_DATABASE.md` for the consumer contract and batch workflow.

No gameplay facts, source approvals, DPS-ready Characters or Reference Team dependencies change. Existing readiness remains 43 profile-complete/pending-freeze, 3 mechanics-source-blocked, 9 profile-source-pending and 2 DPS-ready. Further Factory infrastructure needs a concrete throughput or modeling benefit. A universal gameplay DSL, speculative facts, automatic canonical promotion and UI implementation remain outside this backend slice.

The current overnight backend pass has **no merge authorization** and uses one long-lived branch/draft PR from fresh main. The user's new overnight instruction supersedes the earlier stop-after-#188 instruction: reconcile status, audit Reference Team 01 end-to-end with `KEEP`, `SIMPLIFY`, `PARK/DELETE` and `MISSING`, then implement bounded source-valid findings and continue safe backend work on the same branch. Document the audit before implementation. Preserve all six Reference Team blockers without source/execution proof. No direct main writes, branch deletion, history rewrite, UI implementation or guessed gameplay semantics. A completed commit or green CI is not an instruction to stop this authorized pass.

The [current Reference Team architecture audit](REFERENCE_TEAM_01_ARCHITECTURE_AUDIT_20260908.md) records the end-to-end trace before implementation. It preserves the partial source/timeline boundary and identifies three source-neutral changes: isolate the historical Augusta team fixture, share verified profile/default-weapon resolution, and detach resolved team snapshots. The historical `.37` ATK correction and arbitrary-team execution remain parked until current contribution proof exists.

## 13. Integrated backend batches — historical implementation sequence

The following branch/parent references record the original review sequence. Every payload below is integrated through #189; intermediate coverage counts describe the point at which each batch was implemented. GitHub automatically marked #182 merged; #184–#188 remain historical open drafts whose payloads are already on main. UPD-172 records full post-merge verification.

The first dependent batch, `codex/character-basic-hit-batch`, added explicit ATK Basic Attack hit evaluation for 268 canonical actions across 52 Characters on verified #182 head `9240cfea5541de739f418e64fa124d4f388b1413`. Coverage is exposed in `hitPrimitives.basicHits`; hit occurrence and fully assembled combat context remain caller-owned. No rotation, readiness, source blocker or UI behavior changes. See `CHARACTER_DATABASE.md` for the exact family and fail-closed contract.

The next stacked batch, `codex/character-direct-hit-families`, built on verified draft #184 head `86b6263e410b251846065798c456a697516308ce`. It extends shared isolated-hit evaluation to 492 already-verified ordinary-damage actions across 54 Characters, with exact source damage-class and ATK/HP/DEF snapshot binding. Existing Basic Attack compatibility remains intact. No full Character execution/readiness claim follows from hit-primitive coverage; special-system, conditional and unresolved semantics remain excluded.

The third stacked batch, `codex/weapon-team-amplify-window`, builds on verified draft #185 head `181a23248482556f7f880a059dc7b9d8c8972394`. It implements the already-reviewed Bloodpact Unbound Flow team-amplification window with caller-proven recipient eligibility and event timing. The BPP execution dependency now has a reusable primitive but stays pending until a verified profile timeline/team state exists. No raw gameplay fact, full DPS approval, Reference Team closure or UI change is introduced. The execution-gap document is reconciled to the actual 19-profile/83-edge registry; final CI/head evidence belongs in the PR and Handoff.

The fourth stacked batch, `codex/shared-support-stat-windows`, builds on verified draft #186 head `dac0aa15e2e64685eee7830910117e502d09f46e`. Static Mist now uses the existing incoming-transfer primitive, and Rejuvenating Glow has a shared applied-heal path reused by the existing Shorekeeper adapter and available to the Chisa dependency. The registry retains all 83 pending edges; 14 now have reusable primitives requiring a timeline. No UI or full DPS/readiness changes. Exact final head/CI evidence is recorded on its draft PR and Handoff.

The fifth stacked batch, `codex/canonical-cast-window-batch`, builds on verified draft #187 head `7a0188028f6fd5c4be35ea459a28bb8a7b92e8cf`. Existing cast-window primitives now execute 34 canonical effects on 27 weapons and six Sonata effects. Their values and explicit event contracts remain source-bound; no cooldown, stack, hit/status trigger or profile uptime is inferred. Frosty Resolve's Glacio dependency is primitive-available/requires-timeline, while its separate Skill-stack dependency stays open. The registry still has 83 exact pending edges, including 15 with available primitives requiring timelines. No source, DPS readiness, Reference Team or UI change.

Repeated Export failures on the unauthenticated GitHub API source-head lookup were observed during this batch. CI now supplies its existing GitHub token only to the raw-audit step; the fetch helper sends it only to the exact HTTPS GitHub API origin and rejects authenticated redirects. Public raw downloads receive no credential. Source-head resolution, live projection comparison and all failure gates remain mandatory. This workflow change does not dispatch a deployment or grant new permissions.
