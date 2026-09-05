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
- broad Factory ingestion remains disabled until a bounded mapping proves the contract.

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

## Milestone 01 — tiny multi-provider mapping

PR #175 is stacked on #174 so Factory development does not require merging #174 first.

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

## Milestone 01 — first declarative standard-effect family

The first generated family is exactly the already-reviewed shared primitive:

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

Milestone 01 does not close or alter any Reference Team dependency.

## Verification throughput model

### Fast path

Use affected tests/audits and strict build while iterating. `npm run verify:fast:factory` runs Factory tests, readiness and strict web build; the Factory branch workflow also checks diff whitespace.

Milestone 01 code/test head `48d5dbc59927c43e16ebcc070b36e85ba4bfe59a` passed Factory Fast #9.

Fast checks are iteration checks, not merge authorization.

### Full PR path

The existing `Verify` workflow runs on every pull request, including stacked PR #175 → #174. This allows full repository verification before #174 is merged.

Main-targeting Export remains required on #174 and is already green there (#949). A stacked non-main-base Factory PR does not substitute or invalidate that main-targeting artifact contract.

No Factory workflow may delete, skip or weaken existing correctness gates.

## Factory v1 milestone state

1. Provider/evidence contract + reconciliation + exception queue — **implemented on #174**.
2. Two provider mappings on one tiny source family with provenance/licensing — **implemented on #175; final review verification pending**.
3. One declarative standard-effect family through an existing runtime primitive — **implemented on #175; final review verification pending**.
4. Generated contract/regression tests protect source ownership and runtime semantics — **implemented on #175**.
5. Fast targeted path demonstrates lower iteration latency while full PR Verify remains available — **fast path proven; exact final PR Verify required**.
6. Reference Team 01 remains the golden regression — **locked; six dependencies remain PENDING**.
7. Roster-scale ingestion/mechanic generation — **not authorized yet**.

## Next boundary after Milestone 01

Do not jump to roster-scale ingestion.

After #175 is exact-head review-ready, choose one of these Factory-scale follow-ups based on leverage:

- add deterministic report-generation/export ergonomics for evidence/reconciliation output;
- map a second small fact family to prove the mapping is reusable rather than Ages-of-Harvest-specific;
- add a second already-reviewed standard-effect family only if it reuses an existing primitive without semantic invention.

Character-specific state remains Character-specific when genuinely required. Best Available Teams remains the product destination once canonical source/profile/execution coverage is strong enough.
