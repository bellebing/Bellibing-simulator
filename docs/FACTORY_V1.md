# Bellibing Factory v1

Status: ACTIVE DEVELOPMENT MODEL after Factory cutover

Factory is a development/data pipeline for producing reviewed Bellibing source/runtime inputs faster. It does **not** become gameplay truth by itself and it does **not** replace Best Available Teams as the product goal.

## Architecture boundary

Factory feeds the existing architecture:

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

- `CONSENSUS` and `SINGLE_SOURCE` become **review candidates**;
- `CONFLICT`, `MISSING` and `UNKNOWN` enter the **exception queue**;
- no Factory classification automatically promotes a value into canonical Bellibing truth;
- source-validity review remains mandatory before canonical promotion.

## Provider / provenance contract

Every normalized candidate must retain:

- provider ID;
- exact subject/field identity;
- provider/source reference;
- source version/commit/snapshot when available;
- capture timestamp;
- normalized semantic fingerprint when interpretation is source-safe;
- explicit `PRESENT / MISSING / UNKNOWN` evidence state.

Provider raw data stays separate from canonical Bellibing files.

### Current provider audit

#### Existing Prydwen extraction/review lane — KEEP, REVIEW-ONLY

Bellibing already has `.github/workflows/profile-source-extract.yml` using the MIT-licensed `theonuverse/ww_prydwen_api` extractor reference and producing review artifacts.

Disposition:

- keep as a provider lane;
- keep outputs review-only/evidence-only;
- extractor MIT license does not convert Prydwen page content into canonical Bellibing truth;
- retain source/capture provenance;
- never auto-promote extracted prose or timing/state semantics.

#### `Voruzhu/FrequencyManager` — APPROVED FOR BOUNDED INDEPENDENT-EVIDENCE PROTOTYPES

Current repository license is MIT.

Disposition:

- usable as an independent structured comparison/evidence corpus;
- provenance must identify repository/commit/path;
- do not copy its computed semantics directly into Bellibing runtime truth;
- broad Factory ingestion remains disabled until reviewed mappings prove the contract family-by-family.

#### `d4rkOfficial/wuwa-afyg-tool` — APPROVED FOR CONTRACT/ARCHITECTURE STUDY; DATA MAPPING STILL REVIEWED

The repository contains an MIT license file even though GitHub repository metadata currently reports `NOASSERTION`.

Disposition:

- code/contract architecture may be studied/reused under MIT terms;
- Wuthering Waves data requires separate provenance and Bellibing semantic/source review;
- approximate test fixtures are not source evidence;
- do not treat its internal API/data model as Bellibing canonical truth.

#### `DommyMM/wuwabuild` — REFERENCE-ONLY / NO CODE OR DATA COPY

Current main exposes no repository license file and GitHub reports no license.

Disposition:

- existing pinned references may remain evidence citations where already recorded;
- do not copy new code/data into Factory from this repository without explicit reuse rights;
- Factory should prefer licensed providers for ingestion.

## Cutover foundation — PR #174

The first Factory code slice intentionally contains no new Wuthering Waves gameplay values.

It adds:

- provider descriptors;
- normalized evidence candidates;
- deterministic reconciliation;
- exception routing;
- explicit `MANUAL_SOURCE_VALIDATION_REQUIRED` canonical-promotion policy;
- Reference Team 01 golden-regression assertion locking six pending dependencies and `dpsReady=false`;
- targeted Factory verification while preserving the full repository gates.

PR #174 remains review-ready and unmerged. `main` remains canonical runtime truth until an explicitly authorized merge.

## Milestone 01 — tiny multi-provider mapping and first standard-effect family — PR #175

PR #175 is stacked on #174 so Factory development does not require merging #174 first. It is review-ready and unmerged.

The first mapping is deliberately narrow:

- family: `weapon-r1-attribute-dmg-bonus-v1`;
- subject: Ages of Harvest;
- field: R1 general/attribute DMG Bonus numeric value only;
- provider lane 1: Prydwen current Lumi build review evidence, 12% DMG Bonus;
- provider lane 2: `Voruzhu/FrequencyManager@f585e47a868cb2b65845367b976a1781f130c758`, structured unconditional `elemDmg=12`.

The raw snapshot lives under `data/factory/evidence/` and retains source/version/capture provenance.

Normalization rules are intentionally semantic-minimal:

- Prydwen must identify an exact R1 general DMG Bonus value;
- FrequencyManager must identify an exact R1 `elemDmg` value with `conditional=false`;
- only the numeric general/attribute-DMG value is fingerprinted;
- trigger, lifetime, stacking, refresh, target and rotation uptime are **not** inferred from either provider lane.

Expected matching result:

- `CONSENSUS`;
- `REVIEW_CANDIDATE`;
- `MANUAL_SOURCE_VALIDATION_REQUIRED`;
- no exception row.

A disagreement regression changes one provider value and must yield `CONFLICT / EXCEPTION_QUEUE`. Factory never chooses a winner automatically.

`FrequencyManager` remains globally disabled for broad ingestion. It is whitelisted only for this reviewed prototype family, preventing a tiny successful mapping from silently becoming roster-scale trust.

Milestone 01 also proves exactly one already-reviewed standard-effect family:

`weapon-cast-timed-self-window-v1`

Proof specs:

- Ages of Harvest `AH-INTRO`;
- Ages of Harvest `AH-SKILL`.

The Factory spec contains **identity only**:

- canonical effect ID;
- generator family;
- explicit canonical source-authority marker.

It does not copy values, durations, scope or trigger semantics. Compilation resolves those from Bellibing's canonical `WEAPON_EFFECT_CATALOG` and verifies the existing `WEAPON_CAST_WINDOW_CONTRACTS`. Runtime execution still calls `activateWeaponCastWindow`.

Required fail-closed behavior:

- canonical effect must exist exactly once;
- effect must remain `TRIGGERED / SELF / maxStacks=1` with a positive canonical duration;
- canonical trigger text must still match the manually reviewed runtime contract;
- generated activation must equal direct activation through the existing primitive;
- provider/external evidence cannot claim runtime source authority;
- implementing/generating the primitive does not invent a profile timeline or close profile-specific pending execution by itself.

This is a generator over an existing reviewed mechanic family, not a universal gameplay DSL.

## Milestone 02 — deterministic evidence/reconciliation reporting — PR #176

PR #176 is stacked directly on #175. It does not require #174 or #175 to be merged and introduces no new Wuthering Waves gameplay value.

Milestone 02 adds a reusable reporting boundary over reviewed Factory mappings:

- a reviewed mapper registry that rejects unregistered evidence families rather than guessing how to normalize them;
- deterministic reconciliation ordering by subject/field and candidate ordering by provider/candidate identity;
- summary counts for `CONSENSUS / SINGLE_SOURCE / CONFLICT / MISSING / UNKNOWN`;
- explicit `reviewCandidateKeys` and `exceptionQueueKeys`;
- provenance-rich candidate output retaining provider/source/version/capture metadata;
- deterministic JSON and Markdown renderers with no generated-at timestamp;
- `scripts/generate-factory-evidence-report.ts` over `data/factory/evidence/*.json`;
- checked-in review artifacts under `data/generated/` and `docs/generated/`;
- `--check` drift validation exposed as `npm run audit:factory-evidence-report` and included in `npm run verify:fast:factory`;
- regression tests for deterministic output, duplicate reconciliation-key rejection, unreviewed-family fail-closed behavior, provenance visibility and manual canonical-promotion preservation.

Current reviewed snapshot report remains deliberately tiny:

- reconciliations: 1;
- `CONSENSUS`: 1;
- review candidates: 1;
- exception queue: 0;
- subject/field: `ages-of-harvest::r1.attribute-dmg-bonus.value`.

The report is review input only. It cannot promote provider evidence into canonical Bellibing runtime truth.

## Exception-driven development

Future AI workers should primarily work on:

- source conflicts;
- source-missing semantics;
- unrecognized mechanic families;
- exact timeline/state blockers;
- provider mapping exceptions;
- generated contract failures.

They should not repeatedly copy roster data by hand when a provider contract can safely normalize it.

## Reference Team 01 golden regression

Reference Team 01 = Augusta / Iuno / The Shorekeeper.

Factory must continuously prove that:

- selected preset/loadout identity remains exact;
- resolved lifecycles stay resolved;
- the six known pending dependencies remain pending until stronger evidence closes them;
- `PARTIAL` coverage cannot become DPS-ready;
- no generated/provider candidate silently changes Wuwa semantics;
- BUG-028/BUG-029 boundaries are not erased by data import.

Milestones 01 and 02 do not close or alter any Reference Team dependency.

## Verification throughput model

### Fast path

`npm run verify:fast:factory` runs Factory tests, generated-report drift audit, readiness and strict web build. `.github/workflows/factory-fast.yml` additionally checks diff whitespace when that workflow is invoked for its configured target/ref.

Factory Fast is an iteration path, not merge authorization. Stacked PRs whose base is not `main` still receive the repository-wide `Verify` workflow; do not weaken or rewrite workflow triggers merely to manufacture a fast-path badge.

### Full PR path

The existing `Verify` workflow runs on pull requests including stacked Factory PRs. This allows full repository verification before #174 is merged.

For Milestone 02, code-bearing head `6583e99b17ac9a5410e0ac3772a08ce10afcfd9b` passed full Verify #1046 after a prior whitespace-only failure was corrected. The passing run includes source/raw/profile gates, full Node tests, strict build, required real-Chrome regressions and diff whitespace. Final documentation-head verification remains required before #176 can be called exact-head verified.

Main-targeting Export remains required on #174 and is already green there (#949). A stacked non-main-base Factory PR does not substitute or invalidate that main-targeting artifact contract.

No Factory workflow may delete, skip or weaken existing correctness gates.

## Factory v1 milestone state

1. Provider/evidence contract + reconciliation + exception queue — **implemented on #174**.
2. Two provider mappings on one tiny source family with provenance/licensing — **implemented and exact-head verified on #175**.
3. One declarative standard-effect family through an existing runtime primitive — **implemented and exact-head verified on #175**.
4. Generated contract/regression tests protect source ownership and runtime semantics — **implemented on #175**.
5. Deterministic evidence/reconciliation report export + provenance + drift contract — **implemented on #176; final documentation-head verification pending**.
6. Fast targeted path remains available while full PR Verify protects stacked work — **preserved; no gate weakened**.
7. Reference Team 01 remains the golden regression — **locked; six dependencies remain PENDING**.
8. Roster-scale ingestion/mechanic generation — **not authorized yet**.

## Next boundary after Milestone 02

Do not jump to roster-scale ingestion and do not return to Character-by-Character work.

After #176 is exact-head verified, the preferred next Factory-scale slice is a **second small, already-understood source fact family** routed through the same provider-mapping registry and deterministic report path. The purpose is to prove that Milestones 01–02 are reusable infrastructure rather than Ages-of-Harvest-specific wiring.

Requirements for that next family:

- use licensed/review-approved provider lanes only;
- preserve raw evidence and provenance separately;
- normalize only source-safe semantics already understood in Bellibing;
- route disagreement/absence/unknown interpretation to the exception queue;
- no automatic canonical promotion;
- no Character-specific calculator;
- no universal gameplay DSL;
- no broad roster ingestion until the second-family proof shows the mapping/reporting contract generalizes safely.

Best Available Teams remains the product destination once canonical source/profile/execution coverage is strong enough.
