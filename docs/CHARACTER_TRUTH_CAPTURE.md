# Character Truth Capture

This workstream is a **noncanonical external-provider capture lane** for Character facts.

Data flow:

`external provider -> capture -> normalized/reconciled evidence -> later manual review/promotion -> canonical Character facts -> combat/UI`

It never writes runtime readiness, `MODEL_READY`, recommendations, teams, rotations or evaluator policy.

## Evidence states

The Character intake maps the existing Factory reconciliation semantics to:

- `CAPTURED_ONE_PROVIDER`
- `CONSENSUS_TWO_PROVIDERS`
- `PROVIDER_CONFLICT`
- `UNAVAILABLE`
- `UNMAPPED_IDENTITY`

Two providers count as consensus only when their normalized semantic fingerprints are exactly equal. Provider disagreement is retained, never overwritten.

## Current provider lane

The first automated factual lane is Prydwen Character Kit pages via the pinned MIT extractor
`theonuverse/ww_prydwen_api@96585d530be9f30c262eac69a4932b861b856adc`.

Captured fields are intentionally limited to factual kit material exposed by that provider:

- provider/display identity;
- Basic Attack, Resonance Skill and Resonance Liberation;
- Forte Circuit and optional Forte Circuit Tune;
- both Inherent Skills;
- Intro and Outro;
- provider multiplier text for skill levels 1-10 when exposed;
- S1-S6 names and concise description evidence.

The lane deliberately excludes role judgements, ratings, build advice, weapon/Echo recommendations, stat priority, teams, rotations and pull value.

## Roster mapping

`data/factory/character-truth/roster.json` is generated from the current Bellibing `CHARACTER_CATALOG` identity set and contains 60 identities at base
`8c743bafdbbaf18adefe4f66305471c50250d5b0`.

Provider display names are never used to merge variants. Bellibing Character ID is the mapping key. Provider identities that cannot be mapped safely must remain unmapped evidence rather than becoming canonical Characters.

## Existing source archive

Bellibing already has separate pinned source artifacts for released Character skill-tree/mechanics and S1-S6 presentation. Those remain under their existing contracts and are **not** duplicated into this Factory lane merely to inflate provider counts.

In particular, the pinned `DommyMM/wuwabuild` source remains subject to the current repository data-use policy. This workstream does not relabel it as an independent reusable Factory provider.

## Promotion boundary

A successful capture means only that provider evidence was stored with provenance. Promotion into `src/data/characters.ts`, Character Mechanics facts, combat adapters, readiness, or UI requires a later source-validity/semantic review. Existing canonical truth wins until that review is explicit.
