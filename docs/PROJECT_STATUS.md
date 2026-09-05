# Bellibing Simulator — Current Project Status

Last reconciled: 2026-09-05

This is the canonical living roadmap for the latest active Factory branch. Historical PR bodies and old worker branches are context, not competing roadmaps.

## 1. Implementation truth and review stack

### Current `main`

- Canonical runtime/implementation truth remains `main` at `612324b8aba1dd1c4ae8a189ebf74062b291033b` until an explicitly authorized merge changes it.
- No Factory PR has been merged.

### PR #174 — Factory cutover / integration path

- Branch: `factory/cutover-v1-2026-09-05`.
- Review-ready head: `74ee4155f50ebb9a6717f978fc491fbaf3427d08`.
- Exact-head Factory Fast #3, Verify #1040, Export #949 and Character Mechanics import #164 succeeded.
- Open, non-draft, mergeable, unmerged.

### PR #175 — Factory Milestone 01

- Branch: `factory/provider-evidence-standard-effect-v1-2026-09-05`.
- Base: #174.
- Review-ready head: `dfdd8b90a52f01091b97ba030dacefdff31d5825`.
- Proves one tiny multi-provider fact mapping plus one declarative standard-effect family through an existing reviewed primitive.
- Factory Fast #11 and full Verify #1043 succeeded.
- Open, non-draft, mergeable, unmerged.

### PR #176 — Factory Milestone 02

- Branch: `factory/evidence-reporting-v1-2026-09-05`.
- Base: #175.
- Final verified head: `7c49c83dc1684f49c2d1f3bf6bbdcf56685d0add`.
- Adds reviewed mapper registry + deterministic JSON/Markdown evidence/reconciliation reporting + report drift audit.
- Factory Fast #23, full Verify #1048 and Character Mechanics import #169 succeeded on the exact head.
- Open, draft, mergeable, unmerged.

### PR #177 — Factory Milestone 03 / integration-review head

- Branch: `factory/second-source-fact-family-v1-2026-09-05`.
- Base: exact #176 head, not `main`.
- Scope: route a second small, already-understood source fact family through the existing reviewed mapper registry and deterministic reporting path.
- Final review-ready head before integration-state cleanup: `bd72a3287786dc7e3458445a65012f4c3783b8f9`.
- That head passed Factory Fast #27 and full Verify #1049, including source/raw/profile gates, full Node tests, strict web build, required real-Chrome regression and diff whitespace.
- Open, non-draft, mergeable, unmerged.
- No Character-by-Character work, Reference Team semantic slicing, roster-scale ingestion or gameplay DSL work is in scope.

**Merge policy:** #174, #175, #176 and #177 remain unmerged. Any merge requires explicit user authorization.

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
- do not broaden to roster-scale provider ingestion while bounded-family reuse/integration remains under review.

## 3. Reference Team 01 — golden regression

Team: **Augusta / Iuno / The Shorekeeper**.

State remains unchanged through Milestones 01–03:

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

Family: `weapon-r1-attribute-dmg-bonus-v1`.

- subject: `ages-of-harvest`;
- field: `r1.attribute-dmg-bonus.value`;
- Prydwen review lane and pinned FrequencyManager evidence normalize to the same narrow R1 general/attribute-DMG value;
- trigger, duration, stacking, refresh, target and runtime uptime are deliberately not inferred.

Matching evidence yields `CONSENSUS / REVIEW_CANDIDATE / MANUAL_SOURCE_VALIDATION_REQUIRED`. Tested disagreement yields `CONFLICT / EXCEPTION_QUEUE` rather than selecting a winner.

## 5. Factory Milestone 02 — deterministic reporting

PR #176 established family-agnostic review-output infrastructure:

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
- the report now contains two independently registered fact families and stable cross-family ordering.

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

A level-90 Base ATK family was evaluated first and deliberately **not implemented**. Current Prydwen weapons evidence reports Abyss Surges ATK (Lv.90) as `587`, while the pinned FrequencyManager row stores `baseAtk: 588`. Factory does not assume that difference is harmless rounding and does not invent a normalization rule to force consensus. If revisited, it must enter explicit conflict/source review.

## 7. Provider/license boundary

- Prydwen extraction/review lane — `REVIEW_ONLY`; extractor code is MIT, page content still requires Bellibing review.
- `Voruzhu/FrequencyManager` — MIT; approved for bounded independent-evidence prototypes, not broad ingestion.
- `d4rkOfficial/wuwa-afyg-tool` — MIT repository; data mappings still require separate provenance/review.
- `DommyMM/wuwabuild` — no current reuse license established; no new code/data copy.

No external provider has canonical authority.

## 8. Verification model

### Fast path

`npm run verify:fast:factory` covers targeted Factory tests, deterministic report drift, profile readiness and strict web build; Factory Fast workflow also validates diff whitespace.

PR #177 head `bd72a3287786dc7e3458445a65012f4c3783b8f9` passed Factory Fast #27.

### Full PR path

The same #177 head passed full Verify #1049. Full Verify retained source/raw/profile gates, Profile × Adapter/readiness, full Node tests, strict build, real-Chrome regressions and whitespace.

No correctness gate is weakened. Main-targeting Export remains a separate required integration contract; #174 has Export #949 SUCCESS.

## 9. Integration review state

Milestone 03 is complete. Do not build Milestone 04 during integration review.

The current task is to assess the full linear `main → #174 → #175 → #176 → #177` payload for safe main-bound integration while preserving milestone history. No merge is authorized by this document.

Bellibing Echo Tool Handoff remains externally stale because the normal Google Sheets `spreadsheets.batchUpdate` write path returns `403 PERMISSION_DENIED`. No workaround or partial write is permitted. Until write permission returns, these GitHub living docs are the current integration-review truth.
