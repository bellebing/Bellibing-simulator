# Bellibing Simulator — Current Project Status

Last reconciled: 2026-09-06

This is the canonical living roadmap for current `main`. Historical PR bodies and old worker branches are evidence/context, not competing roadmaps.

## 1. Current implementation truth

Bellibing Factory v1 through Milestone 03 is now integrated into `main` through PR #178.

- PR #178 was merged with a normal merge commit, not squash/rebase.
- Integration head: `751c65de73b4916746da0261f2cdacd56350a6db`.
- Factory integration merge commit: `576ac38f25a730a4c2a224b00db8665cb24a20ed`.
- The merge commit has the former `main` head `612324b8aba1dd1c4ae8a189ebf74062b291033b` and the verified integration head as its two parents.
- #174, #175, #176 and #177 are closed **unmerged** as superseded Factory milestone evidence and point to #178; they must not be merged separately.
- No Factory Milestone 04 has started.

Verification around the integration is green:

- integration head Factory Fast #28 — **SUCCESS**;
- integration head full Verify #1050 — **SUCCESS**;
- main-bound PR #178 Verify #1051 — **SUCCESS**;
- main-bound PR #178 Export #950 — **SUCCESS**;
- main-bound PR #178 Character Mechanics import #170 — **SUCCESS**;
- post-merge `main` Verify #1052 — **SUCCESS**;
- post-merge `main` Export #951 — **SUCCESS**;
- post-merge `main` Deploy #138 — **SUCCESS**;
- docs-only canonical cleanup `bbd57243801ed86fe2f30be650406b475663e4e9` Verify #1053 — **SUCCESS**;
- the same docs-only cleanup Export #952 — **SUCCESS**;
- the same docs-only cleanup Deploy/live #139 — **SUCCESS**.

This post-merge cleanup is documentation-only. It does not change gameplay/runtime/data behavior.

## 2. Active development model

**ACTIVE DEVELOPMENT MODEL: BELLIBING FACTORY v1**

**PRODUCT GOAL: BEST AVAILABLE TEAMS**

Factory is a development/data pipeline. It feeds but never bypasses:

`provider raw evidence → normalized reviewed candidates → canonical raw/source → Character Mechanics / Weapon / Echo / Sonata effects → profiles → execution/combat-DPS → product/UI`

Locked rules:

- provider evidence is never canonical/runtime truth by itself;
- `CONFLICT / MISSING / UNKNOWN` remain explicit and fail-closed;
- canonical promotion remains `MANUAL_SOURCE_VALIDATION_REQUIRED`;
- timeline/state gaps remain fail-closed;
- `SOURCE_SEQUENCE_ONLY` is not executable timing;
- V9.15 is historical oracle/reference only when explicitly needed;
- current gameplay scope remains S0-S2 + maxed Character skills;
- S3-S6/lower skill levels and quickswap remain deferred;
- do not build one calculator per Character or a universal gameplay DSL;
- do not broaden to roster-scale provider ingestion without a reviewed bounded Factory milestone.

## 3. Reference Team 01 — golden regression

Team: **Augusta / Iuno / The Shorekeeper**.

State remains unchanged through the Factory integration:

- dependency coverage: `PARTIAL`;
- `dpsReady = false`;
- Augusta historical `.37` static context unchanged;
- Wan Light is not consumed by Augusta DPS;
- Shorekeeper Stellarealm numeric Crit composition is not guessed;
- provider evidence cannot close a team dependency automatically.

Exactly six required dependencies remain `PENDING`:

1. `iuno-wan-light-at-cap-trigger-semantics` — `SOURCE_MISSING`.
2. `iuno-wan-light-augusta-event-overlap` — `TIMELINE_MISSING + STATE_MISSING`.
3. `shorekeeper-stellar-symphony-augusta-window-overlap` — `TIMELINE_MISSING + STATE_MISSING`.
4. `shorekeeper-rejuvenating-augusta-window-overlap` — `TIMELINE_MISSING + STATE_MISSING`.
5. `shorekeeper-fallacy-team-atk-augusta-window-overlap` — `TIMELINE_MISSING`.
6. `shorekeeper-fallacy-wielder-er-stellarealm-state` — `TIMELINE_MISSING + STATE_MISSING`.

Related blockers remain open/relevant: `BUG-028`, `BUG-029`, `BUG-008`, `BUG-010`.

## 4. Factory Milestone 01 — first reviewed mapping

Historical milestone PR: #175, now closed unmerged as evidence after #178 integration.

Family: `weapon-r1-attribute-dmg-bonus-v1`.

- subject: `ages-of-harvest`;
- field: `r1.attribute-dmg-bonus.value`;
- Prydwen review lane and pinned FrequencyManager evidence normalize to the same narrow R1 general/attribute-DMG value;
- trigger, duration, stacking, refresh, target and runtime uptime are deliberately not inferred.

Matching evidence yields `CONSENSUS / REVIEW_CANDIDATE / MANUAL_SOURCE_VALIDATION_REQUIRED`. Tested disagreement yields `CONFLICT / EXCEPTION_QUEUE` rather than selecting a winner.

## 5. Factory Milestone 02 — deterministic reporting

Historical milestone PR: #176, now closed unmerged as evidence after #178 integration.

Milestone 02 established family-agnostic review-output infrastructure:

- reviewed mapper registry; unregistered families fail closed;
- deterministic reconciliation/candidate sorting;
- classification summary counts;
- review-candidate and exception-queue keys;
- full provider/source/version/capture provenance;
- deterministic JSON + Markdown renderers;
- CLI export from `data/factory/evidence/*.json`;
- checked-in report artifacts;
- drift audit in `verify:fast:factory`.

## 6. Factory Milestone 03 — reuse proof with a different fact class

Historical milestone PR: #177, now closed unmerged as evidence after #178 integration.

Second family: `weapon-rarity-v1`.

- subject: `abyss-surges`;
- field: `rarity.stars`;
- Prydwen current weapons index supplies reviewed label `5★`;
- `Voruzhu/FrequencyManager@f585e47a868cb2b65845367b976a1781f130c758` supplies structured `rarity=5`;
- FrequencyManager is MIT-licensed and remains evidence-only;
- normalization maps only discrete weapon rarity to `weapon-rarity-v1:stars=5`.

Why this tests reuse rather than duplicating Ages of Harvest:

- Milestone 01 maps a numeric passive-effect value with effect-specific safety constraints;
- Milestone 03 maps categorical/static identity metadata with a separate normalizer and separate raw provider shapes;
- both use the same registry, reconciliation core, deterministic report, provenance contract and manual-promotion boundary;
- the report contains two independently registered fact families and stable cross-family ordering.

Checked-in report state:

- 2 reconciliations;
- 2 `CONSENSUS` rows;
- 2 review candidates;
- 0 live exception rows;
- all rows retain `MANUAL_SOURCE_VALIDATION_REQUIRED`.

Regressions explicitly prove:

- changing one rarity provider to a different star count produces `CONFLICT / EXCEPTION_QUEUE`;
- unparseable rarity evidence becomes `UNKNOWN`; when no safe present candidate remains it routes to `EXCEPTION_QUEUE`;
- Factory never chooses a provider winner or promotes runtime truth.

### Parked candidate: level-90 Base ATK

A level-90 Base ATK family was evaluated and deliberately **not implemented**. Prydwen evidence reports Abyss Surges ATK (Lv.90) as `587`, while the pinned FrequencyManager row stores `baseAtk: 588`. Factory does not assume harmless rounding and does not coerce the values into consensus. If revisited, this remains explicit conflict/source review.

## 7. Provider/license boundary

- Prydwen extraction/review lane — `REVIEW_ONLY`; extractor code is MIT, page content still requires Bellibing review.
- `Voruzhu/FrequencyManager` — MIT; approved for bounded independent-evidence prototypes, not broad ingestion.
- `d4rkOfficial/wuwa-afyg-tool` — MIT repository; data mappings still require separate provenance/review.
- `DommyMM/wuwabuild` — no current reuse license established; no new code/data copy.

No external provider has canonical authority.

## 8. Verification model

### Fast path

`npm run verify:fast:factory` remains an iteration accelerator covering targeted Factory tests, deterministic report drift, profile readiness and strict web build; Factory Fast workflow also validates diff whitespace.

It does not replace the repository-wide verification contract.

### Full path

The full `Verify` workflow remains authoritative for integration/main correctness and retains source/raw/profile gates, Profile × Adapter/readiness, full Node tests, strict build, real-Chrome regressions and whitespace.

The main-targeting Export/artifact contract remains separate. The integrated payload passed both before merge (#1051 / #950) and again on the actual merge commit (#1052 / #951). Post-merge Deploy #138 succeeded. The docs-only cleanup also passed Verify #1053, Export #952 and Deploy/live #139.

No correctness gate is weakened.

## 9. Post-merge boundary

Factory integration through Milestone 03 is complete. The old `main → #174 → #175 → #176 → #177` review stack is no longer an active merge queue; #174–#177 are historical evidence and #178 is the canonical integration record.

Do not start the next Factory milestone until post-merge canonical state is verified green and the next bounded objective is explicitly selected. Do not return to Character-by-Character slicing by default.

### External Handoff synchronization

The single permitted normal post-merge Google Sheets synchronization attempt was made after fresh-reading `Mål & Handoff`, `Uppdateringslogg`, `Buggar` and `ChatGPT Projektinstruktioner`. `spreadsheets.batchUpdate` returned `403 PERMISSION_DENIED` / `The caller does not have permission`.

No alternate write path, workaround or partial write was attempted or claimed. Bellibing Echo Tool Handoff therefore remains stale at UPD-157 / Milestone 01 state. Until normal Sheets write permission is restored, GitHub `docs/PROJECT_STATUS.md` and `docs/FACTORY_V1.md` on current `main` are the canonical current project state.
