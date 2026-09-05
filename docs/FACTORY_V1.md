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
- no Factory v1 classification automatically promotes a value into canonical Bellibing truth;
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

#### Existing Prydwen extraction lane — KEEP, REVIEW-ONLY

Bellibing already has `.github/workflows/profile-source-extract.yml` using the MIT-licensed `theonuverse/ww_prydwen_api` extractor reference and producing review artifacts.

Disposition:

- keep as a provider lane;
- keep outputs review-only/evidence-only;
- extractor MIT license does not convert Prydwen page content into canonical Bellibing truth;
- retain upstream commit/source snapshot provenance;
- never auto-promote extracted prose or timing/state semantics.

#### `Voruzhu/FrequencyManager` — APPROVED FOR INDEPENDENT EVIDENCE PROTOTYPING

Current repository license is MIT.

Disposition:

- usable as an independent structured comparison/evidence corpus;
- provenance must identify repository/commit/path;
- do not copy its computed semantics directly into Bellibing runtime truth;
- first integration should normalize a tiny fact family and compare against existing Bellibing/Prydwen evidence.

#### `d4rkOfficial/wuwa-afyg-tool` — APPROVED FOR CONTRACT/ARCHITECTURE STUDY; DATA MAPPING STILL REVIEWED

The repository contains an MIT license file even though GitHub repository metadata currently reports `NOASSERTION`.

Disposition:

- code/contract architecture may be studied/reused under MIT terms;
- any Wuthering Waves data imported from the repository must still retain provenance and pass Bellibing semantic/source review;
- do not treat its internal API/data model as Bellibing canonical truth.

#### `DommyMM/wuwabuild` — REFERENCE-ONLY / NO CODE OR DATA COPY

Current main exposes no repository license file and GitHub reports no license.

Disposition:

- existing pinned references may remain evidence citations where already recorded;
- do not copy new code/data into Factory from this repository without explicit reuse rights;
- Factory should prefer licensed providers for ingestion.

## First implementation slice

The first Factory code slice intentionally contains no Wuthering Waves values.

It adds:

- a provider descriptor contract;
- normalized evidence candidates;
- deterministic reconciliation;
- exception routing;
- explicit “manual source validation required” canonical-promotion policy;
- Reference Team 01 golden-regression assertion that locks its six current pending dependencies and `dpsReady=false`.

This proves pipeline behavior before large ingestion begins.

## Standard effect generation — next bounded Factory slice

The first declarative runtime family should be a mechanic already well-understood and already backed by a shared primitive, preferably a timed self window.

Candidate contract shape:

- canonical source/effect ID;
- owner/source layer;
- explicit trigger event family;
- duration from canonical source;
- target/scope;
- stat/effect reference, not copied numeric truth when canonical catalog already owns it;
- termination semantics;
- generated adapter/test identity.

The generator should compile to/reuse the existing shared primitive rather than create one Character-specific calculator per Character.

Do **not** build a universal DSL. Character-specific state remains Character-specific when mechanics genuinely require it.

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

When a Factory change touches source/effect/execution contracts, Reference Team 01 is the first regression proof case.

## Verification throughput model

### Fast path

Use affected tests/audits and strict build while iterating. Factory provides `npm run verify:fast:factory` for the first slice.

Fast checks are allowed to be narrower because they are iteration checks, not merge authorization.

### Full path

Any PR targeting `main` still runs the repository's full Verify and Export contracts. No Factory workflow may delete, skip or weaken those gates.

## Factory v1 completion milestones

1. Provider/evidence contract + reconciliation + exception queue — first slice.
2. Two provider mappings proven on a tiny source family with provenance/licensing recorded.
3. One declarative standard-effect family generated through an existing runtime primitive.
4. Generated contract/regression tests protect source ownership and runtime semantics.
5. Fast targeted path demonstrates lower iteration latency; full PR verify remains green.
6. Reference Team 01 remains the golden regression throughout.
7. Only after throughput is proven should Factory broaden to roster-scale ingestion/mechanic generation.
