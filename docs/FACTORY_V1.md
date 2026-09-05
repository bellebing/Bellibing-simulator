# Bellibing Factory v1

Status: **ACTIVE DEVELOPMENT MODEL on `main` after PR #178 integration**

Factory is a development/data pipeline for producing reviewed Bellibing source/runtime inputs faster. It does **not** become gameplay truth by itself and it does **not** replace Best Available Teams as the product goal.

Factory v1 through Milestone 03 is integrated into `main` by PR #178. The integration head was `751c65de73b4916746da0261f2cdacd56350a6db`; normal merge commit `576ac38f25a730a4c2a224b00db8665cb24a20ed` integrated it without squash/rebase. PRs #174–#177 are closed unmerged as superseded milestone evidence.

## Architecture boundary

`external providers`
→ `provider-specific raw evidence`
→ `normalized Bellibing candidates`
→ `comparison / reconciliation`
→ `review / exception disposition`
→ `canonical Bellibing source layer`
→ `Character Mechanics / Weapon / Echo / Sonata effects`
→ `profiles`
→ `execution / combat-DPS`
→ `product / UI`

External data accelerates evidence creation. It never bypasses canonical source ownership or semantic review.

## Evidence classifications

Factory v1 uses exactly:

- `CONSENSUS` — two or more independent providers normalize to the same semantic fingerprint;
- `SINGLE_SOURCE` — exactly one provider supplies a present candidate;
- `CONFLICT` — present candidates disagree, including contradictory rows from one provider;
- `MISSING` — no present candidate and no provider claims an unknown/uninterpretable value;
- `UNKNOWN` — evidence exists but cannot be normalized/interpreted safely.

Routing:

- `CONSENSUS` and `SINGLE_SOURCE` become `REVIEW_CANDIDATE`;
- `CONFLICT`, `MISSING` and `UNKNOWN` enter `EXCEPTION_QUEUE`;
- every classification retains `MANUAL_SOURCE_VALIDATION_REQUIRED`;
- no classification automatically promotes canonical Bellibing truth.

## Provenance contract

Every normalized candidate retains:

- provider ID;
- exact subject/field identity;
- source reference;
- source version/commit/snapshot when available;
- capture timestamp;
- explicit `PRESENT / MISSING / UNKNOWN` state;
- semantic fingerprint only when interpretation is source-safe.

Provider raw evidence stays separate under `data/factory/evidence/` and never becomes canonical runtime data by location or consensus alone.

## Provider boundary

### Prydwen review lane

- Keep `REVIEW_ONLY`.
- Existing extractor reference is MIT, but extracted page content remains review evidence.
- Never infer timing/state semantics from prose unless separately validated.

### `Voruzhu/FrequencyManager`

- MIT licensed.
- Approved only for bounded independent-evidence prototypes.
- Provenance must pin repository commit/path.
- Broad ingestion remains disabled.

### `d4rkOfficial/wuwa-afyg-tool`

- Repository contains MIT license.
- Architecture/contracts may be studied, but Wuwa data still needs bounded provenance/review before mapping.

### `DommyMM/wuwabuild`

- No current reuse license established during cutover audit.
- Reference-only; no new code/data copying.

No provider has canonical authority.

## Milestone 00 — Factory cutover / PR #174

Historical milestone evidence, integrated through PR #178. PR #174 is closed unmerged and must not be merged separately.

Introduced provider descriptors, normalized candidates, deterministic reconciliation, exception routing, explicit manual promotion policy and Reference Team golden-regression protection. No new gameplay values were added.

## Milestone 01 — first multi-provider mapping / PR #175

Historical milestone evidence, integrated through PR #178. PR #175 is closed unmerged and must not be merged separately.

Family: `weapon-r1-attribute-dmg-bonus-v1`.

- subject: Ages of Harvest;
- field: R1 general/attribute DMG Bonus numeric value only;
- Prydwen review evidence and pinned FrequencyManager evidence agree on the narrow mapped value;
- trigger, lifetime, stacking, refresh, target and rotation uptime are outside the mapping.

Matching evidence produces `CONSENSUS / REVIEW_CANDIDATE / MANUAL_SOURCE_VALIDATION_REQUIRED`; a disagreement regression produces `CONFLICT / EXCEPTION_QUEUE`.

Milestone 01 also proves `weapon-cast-timed-self-window-v1` over existing Bellibing canonical effect ownership and `activateWeaponCastWindow`. Generator specs carry identity only; provider evidence is not runtime authority.

## Milestone 02 — deterministic evidence reporting / PR #176

Historical milestone evidence, integrated through PR #178. PR #176 is closed unmerged and must not be merged separately.

Implemented:

- reviewed mapper registry with fail-closed unregistered-family handling;
- deterministic report model and stable cross-row/candidate ordering;
- classification summary counts;
- explicit review-candidate and exception-queue keys;
- provenance-rich JSON and Markdown output;
- deterministic export CLI;
- checked-in report artifacts;
- report drift audit wired into `verify:fast:factory`;
- regressions for duplicates, provenance, manual-promotion policy and deterministic rendering.

Exact historical #176 head `7c49c83dc1684f49c2d1f3bf6bbdcf56685d0add` passed Factory Fast #23 and full Verify #1048.

## Milestone 03 — second source fact family / PR #177

Historical milestone evidence, integrated through PR #178. PR #177 is closed unmerged and must not be merged separately.

Purpose: prove the mapper/report architecture is reusable across **different fact classes**, not merely across different weapons carrying the same passive-stat schema.

Historical review-ready milestone head before the final integration-state docs commit: `bd72a3287786dc7e3458445a65012f4c3783b8f9`. That head passed Factory Fast #27 and full Verify #1049. The final integration tree then received the docs-only state cleanup at `751c65de73b4916746da0261f2cdacd56350a6db`, which passed Factory Fast #28 and full Verify #1050.

### Selected family: `weapon-rarity-v1`

- subject: `abyss-surges`;
- field: `rarity.stars`;
- Prydwen weapons index reviewed value: `5★`;
- pinned FrequencyManager structured value: `rarity=5`;
- normalized fingerprint: `weapon-rarity-v1:stars=5`.

The family is source-safe because it maps only discrete static rarity metadata. It does not interpret weapon type, stats, passive text, triggers, timing, state, targets or uptime.

It differs materially from Milestone 01:

- Milestone 01 normalizes a numeric passive-effect value under effect-specific constraints;
- Milestone 03 normalizes categorical/static metadata from different raw shapes;
- a new family-specific normalizer is registered, while reconciliation/reporting code is reused unchanged;
- deterministic report output spans two registered families.

### Fail-closed regressions

- provider star-count disagreement → `CONFLICT / EXCEPTION_QUEUE`;
- unparseable/unsupported rarity values → candidate `UNKNOWN`;
- with no safely present candidate, `UNKNOWN / EXCEPTION_QUEUE`;
- unregistered families still throw before reconciliation;
- all outputs preserve `MANUAL_SOURCE_VALIDATION_REQUIRED`.

### Deliberately parked family: level-90 Base ATK

Base ATK was evaluated before rarity because it would also be static metadata, but it remains **not source-safe to normalize**. Prydwen reports Abyss Surges ATK (Lv.90) as `587`; pinned FrequencyManager stores `baseAtk: 588`. Factory treats that as unresolved provider disagreement/rounding provenance, not permission to coerce one value into the other. No Base ATK mapping exists.

## Deterministic report state after Milestone 03

The checked-in report contains:

1. `abyss-surges::rarity.stars`;
2. `ages-of-harvest::r1.attribute-dmg-bonus.value`.

Reviewed summary:

- reconciliations: 2;
- `CONSENSUS`: 2;
- review candidates: 2;
- exception queue: 0.

The empty live exception queue does **not** mean exception behavior is unused: conflict and unknown regressions explicitly prove fail-closed routing.

## Reference Team 01 golden regression

Reference Team 01 = Augusta / Iuno / The Shorekeeper.

Factory must continuously prove:

- selected preset/loadout identity remains exact;
- six known pending dependencies stay pending until stronger source/timeline/state evidence closes them;
- `PARTIAL` coverage cannot become DPS-ready;
- no generated/provider candidate silently changes Wuwa semantics;
- BUG-028/BUG-029 boundaries remain visible.

Factory integration changes none of these dependencies. Reference Team remains `PARTIAL / dpsReady=false` with the same six `PENDING` dependencies. BUG-028, BUG-029, BUG-008 and BUG-010 remain open/relevant.

## Verification throughput model

### Fast path

Use `npm run verify:fast:factory` while iterating. It covers targeted Factory tests, generated-report drift, profile readiness and strict build; the workflow also checks diff whitespace.

The final pre-integration head `751c65de73b4916746da0261f2cdacd56350a6db` passed Factory Fast #28.

### Full path

Factory fast-path remains an iteration accelerator only. It does not replace or weaken full Verify.

The integrated tree passed:

- full Verify #1050 before the main-bound integration PR;
- main-bound full Verify #1051;
- main-bound Export #950;
- Character Mechanics import #170;
- post-merge `main` full Verify #1052;
- post-merge `main` Export #951;
- post-merge Deploy #138.

Full Verify retains source/raw/profile gates, Profile × Adapter/readiness, full Node tests, strict web build, required real-Chrome regression and diff whitespace. Main-targeting Export remains a separate artifact contract. No correctness gate is weakened.

## Boundary after integration

Factory v1 through Milestone 03 is now canonical on `main`; integration/merge review is complete. PR #178 is the canonical integration record and #174–#177 are historical milestone evidence only.

Do **not** automatically start Milestone 04. Select the next bounded Factory objective only after the post-merge canonical state is green and explicit. Avoid Character-by-Character continuation, Reference Team micro-slicing, roster-scale ingestion and universal gameplay DSL work unless a separately reviewed objective requires them.

Bellibing Echo Tool Handoff remains an external synchronization target. A normal Sheets sync may be attempted once for this post-merge state. If it still returns `403 PERMISSION_DENIED`, do not use a workaround or partial write; GitHub `docs/PROJECT_STATUS.md` and `docs/FACTORY_V1.md` remain canonical current state until normal write permission returns.
