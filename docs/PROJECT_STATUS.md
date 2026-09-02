# Bellibing Simulator — Current Project Status

This is the canonical current-state checkpoint for Bellibing Simulator. Detailed pre-2026-08-29 chronology lives in [`PROJECT_STATUS_HISTORY_2026-08-29.md`](PROJECT_STATUS_HISTORY_2026-08-29.md), Git history, and the external AI Handoff update log.

`FOUNDATION` means architecture exists and is tested but supported-content coverage is incomplete. `COMPLETE` means the layer has the data/behavior required for its supported scope with no known blocking gap. `BLOCKED` means a known gap prevents that layer from being called complete.

Bellibing has **not** passed the full Pre-DPS Completeness Gate. Broad roster-wide Character DPS remains blocked. Narrow vertical slices may become `DPS_READY` only after their exact source, execution and freeze requirements close.

## Verified current baseline — 2026-09-02

Current verified repository baseline on `main`:

- **main:** `2af8221b13448c9a0cc6749e3d6234b8e6c1efd8` — docs-only closeout sync after PR #139;
- **product-code parent:** `bae1b694b0d0df887bf73018429e8c90c86eec86` — merged PR #139;
- **main Verify #657:** SUCCESS;
- **main Export #629:** SUCCESS;
- **main Deploy #131:** SUCCESS;
- deployed real-Chrome coverage includes Alpha/Roll Assist, Augusta owned-build/upgrade flow and Ciaccona +25 owned-build/completed-candidate flow.

No open worker PR listed below is part of this baseline. Main-only registry truth remains:

- **43 `PROFILE_COMPLETE_PENDING_FREEZE`**;
- **3 `CHARACTER_MECHANICS_SOURCE_BLOCKED`**;
- **9 `PROFILE_SOURCE_PENDING`**;
- **2 `DPS_READY`** — Augusta and Ciaccona.

Main-only execution inventory remains:

- **18 backward-impact reviews**;
- **18 reviewed canonical profiles**;
- **16 profiles with pending execution dependencies**;
- **72 exact pending execution edges**;
- semantic queue: **30 UNREVIEWED / 1 SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING / 11 PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE / 5 BLOCKED_SOURCE_CONFLICT / 9 BLOCKED_SOURCE_SEMANTICS / 16 PROFILE_SPECIFIC_EXECUTION** = **31 actionable shared edges**.

Do not replace these numbers with counts from an unmerged worker branch.

## Architecture boundary

Preserve the existing separation between:

1. raw Character / Weapon / Echo / Sonata source data;
2. Character Mechanics and source-facing facts;
3. Weapon / Echo / Sonata effects;
4. composable profile catalogs;
5. execution/combat-DPS adapters and engines;
6. product/UI projection.

V9.15 is historical oracle/reference only where explicitly required. `SOURCE_SEQUENCE_ONLY` never becomes executable by assumption. A source-safe primitive does not close a profile dependency until the exact canonical event/timeline/state evidence required by that profile is available.

The Alpha UI is a projection of canonical registries, not a second profile database. Frontend code must not invent Character, mode, team, Weapon, Echo shell, timing, Roll Assist policy or DPS truth.

Owned-Echo analysis keeps two separate fail-closed boundaries:

- checkpoint/Roll Assist requires an independently verified profile-policy binding;
- whole-build DPS requires a verified `ENGINE_MODELED` profile plus an explicit source-backed Echo→`DamageEvaluator` adapter for that exact profile.

`DPS_READY` alone authorizes neither boundary.

## Current source coverage

### Characters

- 60 Character records; 57 `RELEASED`.
- Character Mechanics: **54 VERIFIED / 3 SOURCE_BLOCKED / 1866 canonical facts**.
- Mechanics source blockers: **Buling, Danjin, Xiangli Yao**.
- Raw/static blockers: **Qingxiao `maxEnergy`, Rover (Electro) `maxEnergy`, Suisui `maxEnergy`**.
- Intrinsic DPS blockers: **none**.

### Weapons

- **121 / 121 released Weapons** have source-audited effect coverage across **236 effect rows**.
- Trigger/state/stack/target semantics remain separate execution concerns; source text never implies automatic uptime.

### Echo / Sonata

- **181 / 181 released Echoes** verified current for stable identity/COST/Sonata membership.
- **34 / 34 released Sonata sets** verified current.
- Sonata Effect review: **62 / 62 activation tuples / 86 source-backed rows**.
- **181 / 181 released Echo skills** are source-reviewed.
- Main baseline Echo non-damage coverage: **63 modeled rows across 37 Echoes**.
- Main baseline exact Rank-5 Echo attack catalog: **5 attack profiles / 6 attack facts**.

Unmerged worker branches may contain additional attack/effect facts. They are not current-main truth until reviewed, integrated and verified together.

## Composable profiles and current readiness

Independent Weapon Recommendation, Echo Loadout, Stat Target, Team, Rotation and Character Preset catalogs are live and cross-validated. Candidate/profile pipelines remain fail closed: extraction cannot approve semantic truth, `SOURCE_SEQUENCE_ONLY` never implies timing/uptime, readiness is registry-derived, and ambiguity stays pending.

The exact `PROFILE_SOURCE_PENDING` queue on main is:

- semantic blockers: **Baizhi, Brant, Jianxin, Phoebe, Verina, Yuanwu**;
- raw/static blockers: **Qingxiao, Rover (Electro), Suisui** — unresolved `maxEnergy` source truth.

PR #129 integrated the approved 2026-08-31 horizontal tranche for Chixia, Encore, Lucilla, Rover (Havoc), Yangyang and Mornye. Those canonical rotations remain `SOURCE_SEQUENCE_ONLY` on main.

Current narrow `DPS_READY` fixtures are only:

- Augusta — `augusta-standard` / `AUGUSTA_STD_V1`;
- Ciaccona — `ciaccona-cartethyia-aero` / `CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1`.

Augusta and Ciaccona product support remains exactly as verified by PR #139/main `2af8221b`: Augusta has the verified Roll Assist policy and owned-build evaluator; Ciaccona has +25 whole-build/completed-candidate DPS support under its locked Lorelei context but still has **no Roll Assist checkpoint/stopping-policy binding**.

## Known execution/product gaps on main

Keep these fail closed until stronger source or an explicitly approved measurement method changes the evidence:

- **BUG-002 — accepted `BETTER` replacement lifecycle:** still not explicitly end-to-end regression-verified as the next incumbent/best-so-far state.
- **BUG-008 — Impermanence Heron transfer:** `BLOCKED_SOURCE_CONFLICT`; hit-armed versus cancel/cast-armed evidence conflicts.
- **BUG-009 — Stringmaster / Rime-Draped Sprouts skill-stack lifetime:** `BLOCKED_SOURCE_SEMANTICS`; refresh/expiry policy unresolved.
- **BUG-010 — Fallacy profile cast variant:** `BLOCKED_SOURCE_SEMANTICS`; supported rotations do not identify normal/tap versus hold/release.
- **BUG-011 — Defier's Thorn `DT-DEF`:** `BLOCKED_SOURCE_SEMANTICS`; timing grammar ambiguous. Cartethyia remains non-DPS-ready.
- **BUG-012 — Rover (Aero) exact support execution:** `BLOCKED_SOURCE_SEMANTICS`; total duration/BPP-SKILL overlap/fixed optional branch unresolved. PR #139 does not close it.
- **BUG-013 — Blazing Brilliance Searing Feather at-cap lifecycle:** `BLOCKED_SOURCE_SEMANTICS`; qualifying events at 14 stacks do not have a source-proven removal-timer rule.
- **BUG-014 — Changli Standard Rotation denominator:** `BLOCKED_SOURCE_SEMANTICS`; source gives only a 1.37-second relative variant delta, not total duration.

`BUG-001` remains fixed/live-verified with permanent Chrome regression.

## Parallel worker stabilization review — 2026-09-02

Eleven open worker PRs were created as **sibling branches from the same `2af8221b` baseline**. They are not a dependency chain. Individual green CI therefore does not prove that any arbitrary combination is integration-safe: several branches update shared execution reviews, semantic queues, coverage counts and regression snapshots.

The stabilization baseline intentionally integrates **none** of these worker code changes. This avoids turning source-of-truth cleanup into a new execution-combat tranche.

| PR | Scope | Current head | Exact-head CI | Stabilization disposition |
| --- | --- | --- | --- | --- |
| #140 | Chixia | `b30722bb` | Verify #939 + Export #911 SUCCESS | **PARK / REVIEW-READY INDIVIDUALLY** — the prior `BUG-015` collision is repaired; Chixia now uses unique `BUG-022` while Zani/#144 retains canonical `BUG-015`. No gameplay/source semantics changed in the repair. |
| #141 | Rover (Havoc) | `f8422adb` | Verify #952 + Export #923 SUCCESS | **PARK / REVIEW-READY INDIVIDUALLY; CANDIDATE #3** — fail-closed review now preserves `140%+` as `AT_LEAST` estimated build guidance rather than an exact ER gate. Exact gate stays null; all Red Spring/Havoc Eclipse/Dreamless/Umbra/team/timing blockers remain open. `BUG-025` is resolved in worker representation only. |
| #142 | Galbrena | `af24c988` | Verify #674 + Export #646 SUCCESS | **PARK / REVIEW-READY INDIVIDUALLY** — source-safe preflight, still non-`DPS_READY`. |
| #143 | Mornye | `f1522b61` | Verify #947 + Export #919 SUCCESS | **PARK / REVIEW-READY INDIVIDUALLY; CANDIDATE #1** — stabilization review repaired Boundedness representation so the source `3 caps OR 1 fatal prevention` relationship stays explicit, consumption remains `PENDING_INTERPRETATION`, and runtime cannot resolve incoming damage. Still no engine/freeze/DPS/product promotion. |
| #144 | Zani | `bd92dc25` | Verify #686 + Export #658 SUCCESS | **PARK / REVIEW-READY INDIVIDUALLY; CANDIDATE #2** — fresh semantic audit found the explicit-event Frazzle→Heliacal target-state primitive remains fail-closed; `BUG-015` remains Zani's canonical gap and no `DPS_READY` promotion occurs. |
| #145 | Jiyan | `eb4a35ff` | Verify #683 + Export #655 SUCCESS | **PARK / REVIEW-READY INDIVIDUALLY** — exact Kelpie facts/source boundary, 0 execution IDs closed. |
| #146 | Lingyang | `15d52c7d` | Verify #904 + Export #876 SUCCESS | **PARK / REVIEW-READY INDIVIDUALLY** — extensive fail-closed primitives, all 12 canonical dependencies remain open. |
| #147 | Jinhsi | `985ef139` | Verify #936 + Export #908 SUCCESS | **PARK / REVIEW-READY INDIVIDUALLY** — stabilization fixed shared pending-ID review leakage with preset-scoped semantic reviews; Lumi keeps the global generic cast-window disposition while Jinhsi alone gets preset-scoped `BUG-020`. Still non-`DPS_READY`. |
| #148 | Sigrika | `e3db50f6` | Verify #927 + Export #899 SUCCESS | **PARK / REVIEW-READY INDIVIDUALLY** — six closures, nine dependencies remain; historical 12.8s is not current denominator truth. |
| #149 | Aemeath | `5135512f` | Verify #794 + Export #766 SUCCESS | **PARK / REVIEW-READY INDIVIDUALLY** — eight detailed execution IDs closed, four blockers remain; no engine/freeze/product promotion. |
| #150 | Lucilla | `a385f948` | Verify #944 + Export #916 SUCCESS | **PARK / VERIFY-CLEAN; DRAFT FLAG REMAINS** — count/regression cleanup and strict-build provenance typing are complete. Canonical worker overlay is `ENGINE_MODELED` at source-backed 7.34s but remains non-`DPS_READY`, non-product, with four explicit execution gaps under canonical Handoff `BUG-023`. |

Additional stabilization findings:

- PR #151 remains a docs-only baseline candidate. Its earlier exact heads passed the full Verify + Export contract; each subsequent source-truth resync must run the same exact-head contract before the PR can be treated as final review-ready. Exact current PR head/run numbers are tracked in the PR body and AI Handoff rather than embedded self-referentially in this file.
- PR #143 has the smallest/localest changed-file surface among reviewed integration candidates: six additive research/support/review/test files with no sibling-file overlap, shared execution queue, generated profile or Echo taxonomy edit. Review found and repaired a real Boundedness representation risk: canonical raw remains `PENDING_INTERPRETATION` and says three capped hits **or** one fatal prevention. Head `f1522b61` carries `sourceLimitRelationship: 'OR'`, `consumptionModelingStatus: 'PENDING_INTERPRETATION'` and `canResolveIncomingDamage: false`, with Verify #947 + Export #919 green. This is candidate #1 after baseline acceptance, not integration authorization.
- PR #144 has the next-lowest reviewed practical integration surface: eight files, with shared touches concentrated in the backward-impact catalog/regression snapshots and no `src/profileExecutionWorkQueue.ts` or Echo trigger-taxonomy edit. A fresh semantic audit found no blocking representation defect: the Zani target-state primitive requires explicit incoming Spectro Frazzle, preserves 1:1 Heliacal conversion and independent six-second expiries, keeps Zani SELF Blaze separate, fails closed on unresolved cap overflow/refresh, and exposes Eternal Radiance Heliacal equivalence only as stack-read truth with `provesInflictSpectroFrazzleTrigger=false`. `BUG-015` remains open. This is candidate #2 only after #143 is separately integrated/reverified.
- PR #141 is the next-lowest reviewed candidate after #143/#144. Its Dreamless exact attack data remains attack truth only; cast/timeline and the +50% post-Liberation branch remain execution responsibilities. Stabilization review found that the preflight's `sourceBackedEnergyRegenContext: 1.4` could lose the source `140%+` relation to a future consumer even though `exactEnergyRegenGate` was already null. Head `f8422adb` now preserves source text `140%+`, relation `AT_LEAST`, usage `ESTIMATED_BUILD_GUIDANCE_ONLY`, and `sourceBackedEnergyRegenContextIsExactGate: false`, with a focused regression. Verify #952 + Export #923 are green. No execution dependency or product/readiness support was closed. This is candidate #3 only after #144 is separately integrated/reverified.
- PR #147's former red current-head state was traced to a real work-queue scoping defect rather than a Jinhsi source-data dispute. `weapon:ages-of-harvest:AH-SKILL:trigger-uptime-adapter` is shared by Lumi and Jinhsi; matching semantic reviews only by pending ID let Jinhsi-specific `BUG-020` leak onto Lumi. The worker now supports an optional preset scope with global fallback, validates scoped uniqueness/canonical preset ownership, and has an explicit Lumi-vs-Jinhsi regression. Exact-head Verify #936 + Export #908 are green.
- PR #140's former `BUG-015` collision is resolved as metadata integrity only. Zani keeps `BUG-015`; Chixia now owns `BUG-022`. The repair changes only blocker-ID ownership/assertions across three files and exact-head Verify #939 + Export #911 are green.
- PR #150's five Node regressions were stale branch fixtures after the explicit Lucilla impact-review/execution overlay, not evidence for new gameplay semantics. The cleanup now asserts the 19-review / 76-edge worker-local inventory, preserves the generated horizontal source snapshot as `SOURCE_SEQUENCE_ONLY`, and distinguishes the canonical Lucilla overlay as `ENGINE_MODELED`. A strict-build failure then exposed optional `ContentProvenance.sourceUrls`/`notes` being spread as required arrays; the final fix uses empty-array fallback without changing source facts or engine semantics. Verify #944 + Export #916 are green. Branch-local queue is **33 UNREVIEWED / 1 implementation-pending / 11 primitive+timeline / 5 source-conflict / 10 source-semantics / 16 profile-specific = 34 actionable shared** with 19 semantic review records. The four remaining Lucilla dependencies are Glommoth active scaling stat, Glacio Chafe system damage, Chisa Thread of Bane/Kumokiri predecessor state, and Chisa Havoc Bane stack/timeline state.
- A 2026-09-02 GitHub write-target incident briefly advanced `main` to accidental commit `ee016c2c...` and later moved the #141 worker to accidental `c2d46cb1...`. Both refs were immediately restored to their verified heads; live rechecks prove current `main` is exactly `2af8221b...`, the accidental test file is absent, #141 is exactly `f8422adb...`, and #151/#152 are again mergeable on the `2af8221b` base. This contained tooling incident is tracked as `BUG-026`; neither accidental commit is current project state.
- Green worker branches may contain valid reusable facts/primitives, but their branch-local counts are not canonical until a dedicated integration review rebases them onto the then-current main and reruns the full repository contract.

No worker PR is closed by this stabilization pass. No worker branch is treated as merged, superseded or rejected on game-data merit merely because it is parked. PR #150 remains marked draft in GitHub even though its exact head is verification-clean; that UI state does not change code/source truth.

## Verification contract

A PR head intended for merge must pass:

- source/raw/profile audits;
- Profile × Adapter/readiness audits;
- full Node tests;
- strict web build;
- permanent real-Chrome Alpha/Roll Assist/owned-build regressions;
- diff/whitespace checks;
- artifact packaging and Export.

Post-merge main is rechecked. UI/live claims require deployed real-Chrome verification where applicable.

For the current stabilization PR itself, product code is intentionally unchanged from `2af8221b`; the required review evidence is a green exact-head Verify + Export proving the documentation/source-of-truth sync did not disturb the repository contract. The deployed product baseline remains the already live-verified `2af8221b` checkpoint until an explicit merge occurs.

## Review-ready baseline decision

The next stable baseline is deliberately boring:

- **code/product behavior:** current main `2af8221b` unchanged;
- **canonical readiness/execution counts:** current-main values above unchanged;
- **worker code:** all kept outside the baseline;
- **worker follow-up:** #140 through #150 remain sibling branches and must be selected/rebased/integrated one at a time; #150 additionally remains marked draft in GitHub despite cleanup completion;
- **ordered post-baseline rebase-review queue:** #143 Mornye first, #144 Zani second only after #143 is separately accepted/reverified on main, #141 Rover (Havoc) third only after #144 is separately accepted/reverified. This ordering is a conflict-surface review priority, not merge authorization;
- **broad roster DPS:** still blocked;
- **no new gameplay/source truth is invented by stabilization.**

Do not start a new execution, profile-source, UI or product workstream merely because a parked worker PR exists. Selection remains external to this status document.