# Bellibing Simulator — Current Project Status

Last reconciled: 2026-09-05

This is the canonical living roadmap for the latest active Factory branch. Historical PR bodies, old worker branches and update-log rows are context, not competing roadmaps.

## 1. Implementation truth and review stack

### Current `main`

- Canonical runtime/implementation truth remains `main` at `612324b8aba1dd1c4ae8a189ebf74062b291033b` until an explicitly authorized merge changes it.
- This is the post-Mornye/Zani baseline.
- Current-main readiness remains `43 PROFILE_COMPLETE_PENDING_FREEZE / 3 CHARACTER_MECHANICS_SOURCE_BLOCKED / 9 PROFILE_SOURCE_PENDING / 2 DPS_READY`.
- Current-main execution remains `19 reviews / 19 reviewed profiles / 17 profiles with pending execution / 83 exact edges`, queue `40/1/11/5/9/17 = 41 actionable shared`.

### PR #174 — review-ready Factory cutover

- Branch: `factory/cutover-v1-2026-09-05`.
- Review-ready head: `74ee4155f50ebb9a6717f978fc491fbaf3427d08`.
- Preserves the verified #159-#173 Reference Team payload linearly above current main.
- Exact-head Factory Fast #3, Verify #1040, Export #949 and Character Mechanics import #164 succeeded.
- #174 is open, non-draft and mergeable, but **not merged**.
- Merge requires explicit user authorization.

### PR #175 — active Factory milestone stacked on #174

- Branch: `factory/provider-evidence-standard-effect-v1-2026-09-05`.
- Base: #174 branch/head, not `main`.
- Purpose: prove the next Factory v1 roadmap steps without requiring #174 to merge first.
- Scope is one coherent Factory milestone: tiny multi-provider evidence mapping + reconciliation/exception routing + one declarative standard-effect family + regression proof.
- No Character-by-Character work and no post-#173 Reference Team semantic slicing.
- #175 is currently draft while final docs/Handoff/exact-head verification are completed.
- Neither #174 nor #175 is authorized for merge by this work.

## 2. One active development direction

**ACTIVE DEVELOPMENT MODEL: BELLIBING FACTORY v1**

**PRODUCT GOAL: BEST AVAILABLE TEAMS**

Factory is a development/data pipeline that feeds, but never bypasses, the existing architecture:

`provider raw evidence → normalized reviewed candidates → canonical raw/source → Character Mechanics / Weapon / Echo / Sonata effects → profiles → execution/combat-DPS → product/UI`

Locked rules:

- external evidence is never canonical/runtime truth by itself;
- `CONFLICT / MISSING / UNKNOWN` and unresolved timeline/state semantics stay fail-closed;
- `SOURCE_SEQUENCE_ONLY` is not executable timing;
- V9.15 is historical oracle/reference only when explicitly required;
- current gameplay scope remains S0-S2 + maxed Character skills;
- S3-S6/lower skill levels remain retained source data but deferred;
- quickswap remains deferred for initial Best Available Teams;
- do not build one calculator per Character or a universal gameplay DSL.

## 3. Reference Team 01 — Factory golden regression

Team: **Augusta / Iuno / The Shorekeeper**.

Preserved state on #174 and inherited by #175:

- dependency coverage: `PARTIAL`;
- `dpsReady = false`;
- Augusta historical `.37` static context unchanged;
- Wan Light is not consumed by Augusta DPS;
- Shorekeeper Stellarealm numeric Crit composition is not guessed;
- no Factory provider candidate may close a Reference Team dependency automatically.

Exactly six required dependencies remain `PENDING`:

1. `iuno-wan-light-at-cap-trigger-semantics` — `SOURCE_MISSING`.
2. `iuno-wan-light-augusta-event-overlap` — `TIMELINE_MISSING + STATE_MISSING`.
3. `shorekeeper-stellar-symphony-augusta-window-overlap` — `TIMELINE_MISSING + STATE_MISSING`.
4. `shorekeeper-rejuvenating-augusta-window-overlap` — `TIMELINE_MISSING + STATE_MISSING`.
5. `shorekeeper-fallacy-team-atk-augusta-window-overlap` — `TIMELINE_MISSING`.
6. `shorekeeper-fallacy-wielder-er-stellarealm-state` — `TIMELINE_MISSING + STATE_MISSING`.

Related blockers remain open/relevant:

- `BUG-028` Augusta team-context correctness / duplicated Thunderflare + stale `.37` package assumptions;
- `BUG-029` Iuno Wan Light at-cap + actual Augusta Domain/Shield/action overlap;
- `BUG-008` Impermanence Heron source conflict;
- `BUG-010` Fallacy active-damage variant source semantics.

## 4. Factory milestone 01 — multi-provider evidence proof

PR #175 maps exactly one already-understood fact family:

- family: `weapon-r1-attribute-dmg-bonus-v1`;
- subject: `ages-of-harvest`;
- field: `r1.attribute-dmg-bonus.value`;
- Prydwen review lane: current Lumi build evidence identifies R1 Ages of Harvest as supplying 12% general DMG Bonus;
- FrequencyManager lane: pinned `f585e47a868cb2b65845367b976a1781f130c758` structured weapon row supplies unconditional `elemDmg=12`.

Raw provider-specific evidence is stored separately under `data/factory/evidence/` with provider/source/version/capture provenance.

The reviewed normalizer deliberately maps only the shared numeric R1 attribute/general-DMG value. It does **not** infer trigger, duration, stacking, refresh, target, or profile uptime from provider text/data.

Expected reconciliation:

- two independent present candidates normalize to one semantic fingerprint;
- classification: `CONSENSUS`;
- route: `REVIEW_CANDIDATE`;
- canonical promotion: `MANUAL_SOURCE_VALIDATION_REQUIRED`;
- exception queue: empty for the matching snapshot;
- a regression changes one provider value and proves the result becomes `CONFLICT / EXCEPTION_QUEUE` rather than selecting a winner.

`FrequencyManager` remains globally disabled for broad Factory ingestion. PR #175 allows it only in this explicit bounded prototype family based on its already-recorded MIT/evidence-only disposition.

## 5. Factory milestone 01 — declarative standard-effect proof

PR #175 also proves one intentionally narrow standard-effect generator family by reusing existing runtime architecture:

- family/runtime primitive: `weapon-cast-timed-self-window-v1`;
- canonical proof effect identities: Ages of Harvest `AH-INTRO` and `AH-SKILL`;
- source authority: `BELLIBING_CANONICAL_WEAPON_EFFECT_CATALOG` only.

The Factory specs contain identities only. Numeric values, rank values, durations, scope, source trigger text and execution semantics remain owned by Bellibing's canonical `WEAPON_EFFECT_CATALOG` and the existing manually reviewed `weaponCastWindowAdapter` contract.

Regression requirements:

- generated activation must equal direct activation through the existing runtime primitive;
- wrong trigger remains inactive/fail-closed;
- a spec claiming external/provider evidence as runtime source authority must throw;
- provider reconciliation does not mutate/promote canonical Weapon Effect data.

This is standard-effect generation through an existing primitive, not a new gameplay engine.

## 6. Provider/license boundary

Current Factory dispositions:

- Prydwen extraction/review lane — keep `REVIEW_ONLY`; extractor code is MIT, page content still requires Bellibing source review.
- `Voruzhu/FrequencyManager` — MIT; approved for this bounded independent-evidence prototype, not broad auto-ingestion.
- `d4rkOfficial/wuwa-afyg-tool` — repository MIT; provider architecture may be studied, but Wuwa data requires separate provenance/review before any mapping.
- `DommyMM/wuwabuild` — no current repository license found during cutover audit; no new code/data copy without explicit reuse rights.

No external provider has canonical authority.

## 7. Historical PR disposition

- #159-#173 are closed **unmerged** historical/review checkpoints whose intended verified payload is preserved in #174.
- #140/#141/#142/#145-#150 are closed **unmerged** evidence/fixture/Factory-backlog/fresh-review inputs.
- They are not an implicit integration queue.
- Any future reuse starts from then-current Factory truth and imports only the smallest freshly reviewed payload.

## 8. Verification model

### Fast iteration path

`npm run verify:fast:factory` runs targeted Factory tests + readiness + strict web build; the Factory workflow also runs diff whitespace validation.

PR #175 code/test head `48d5dbc59927c43e16ebcc070b36e85ba4bfe59a` passed Factory Fast #9, including:

- Factory provider/reconciliation tests;
- Factory standard-effect generation tests;
- Reference Team golden regression inherited from #174;
- readiness gate;
- strict web build;
- diff whitespace.

### Full PR path

`.github/workflows/verify.yml` runs on any pull request, including stacked #175 → #174. Therefore #175 can receive the full existing repository Verify contract **without merging #174 first**.

Full Verify includes source/raw/profile gates, Profile × Adapter/readiness, full Node tests, strict build, required real-Chrome regressions and whitespace.

Export remains the main-targeting artifact contract and is not treated as required for this stacked non-main-base PR. #174 retains its already-green main-targeting Export #949.

No correctness gate is weakened.

## 9. Current next step

Finish PR #175 as one milestone:

1. complete exact-head full Verify;
2. synchronize this status, `docs/FACTORY_V1.md`, Handoff/update log and relevant bug preservation notes;
3. mark #175 review-ready only if exact-head checks are green and its diff remains Factory-only;
4. do **not** merge #174 or #175 without explicit authorization.

After milestone 01 is review-ready, the next Factory work should measure/reuse the pattern on another small source family or add report-generation ergonomics — not broaden directly to roster-scale ingestion and not return to Character-by-Character work.
