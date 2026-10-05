# Character Truth Capture

This workstream is a **noncanonical external-provider capture and reconciliation lane** for Character facts.

Data flow:

`external provider -> capture -> normalized/reconciled evidence -> later manual review/promotion -> canonical Character facts -> combat/UI`

It never writes runtime readiness, `MODEL_READY`, recommendations, BiS, Echo rankings, teams, rotations, pull value or evaluator policy. Provider conflicts are retained evidence; they are not capture failures and do not block storing this noncanonical layer.

## Evidence states

The Character intake maps the existing Factory reconciliation semantics to:

- `CAPTURED_ONE_PROVIDER`
- `CONSENSUS_TWO_PROVIDERS`
- `PROVIDER_CONFLICT`
- `UNAVAILABLE`
- `UNMAPPED_IDENTITY`

Two providers count as consensus only when their normalized semantic fingerprints are exactly equal. Provider disagreement is retained, never overwritten.

## Current captured snapshot

The generated snapshot is bound to the 60-identity Bellibing `CHARACTER_CATALOG` roster.

Provider coverage:

- Prydwen kit: **59 CAPTURED / 1 PARTIAL**.
- Prydwen progression: **52 CAPTURED / 8 PARTIAL**.
- Wuthering.gg: **60 CAPTURED**.

Skill / Sequence coverage:

- **59 Characters** contain six captured Prydwen Sequence nodes (S1-S6).
- **295** captured Prydwen skill tables contain complete Lv1-Lv10 multiplier text.
- **Suoming** is the sole Prydwen kit gap: expected kit skills and S1-S6 are not captured in the current snapshot.
- Wuthering.gg supplies complete S1-S6 names for all 60 mapped identities.

Prydwen progression gaps are explicit source-unavailable level-90 stats for:

- Denia
- Hsin
- Jingran
- Qingxiao
- Rover: Electro
- Suisui
- Suoming
- Yangyang: Xuanling

Wuthering.gg progression coverage has no mapped-identity gaps in the current snapshot.

Freshness-sensitive identities are **Hsin, Jingran and Suoming**.

## Reconciliation snapshot

The generated reconciliation contains **2,130 facts**:

- `CAPTURED_ONE_PROVIDER`: **1,114**
- `CONSENSUS_TWO_PROVIDERS`: **374**
- `PROVIDER_CONFLICT`: **134**

Provider conflicts currently consist of **2 identity** and **132 progression** facts. These stay review evidence for later Character/fact promotion; the capture layer does not choose a winner.

Comparison against current canonical data is report-only:

- `CONFLICT`: **149**
- `EXACT_AGREEMENT`: **654**
- `NOT_COMPARABLE`: **782**
- `PROVIDER_ONLY`: **37**

Nothing in these counts promotes provider evidence into canonical Character data.

## Provider boundaries

Prydwen kit extraction is factual-only and pinned to
`theonuverse/ww_prydwen_api@96585d530be9f30c262eac69a4932b861b856adc`.

Captured material is limited to provider/display identity, factual skill text/tables, progression facts where exposed, and Sequence evidence. The Wuthering.gg lane is likewise bounded to factual Character identity/progression/Sequence material.

The lane deliberately excludes role judgements, ratings, build advice, weapon/Echo recommendations, stat priority, teams, rotations and pull value.

## Roster mapping

`data/factory/character-truth/roster.json` is generated from the Bellibing `CHARACTER_CATALOG` identity set and contains 60 identities at base
`8c743bafdbbaf18adefe4f66305471c50250d5b0`.

Provider display names are never used to merge variants. Bellibing Character ID is the mapping key. Provider identities that cannot be mapped safely must remain unmapped evidence rather than becoming canonical Characters.

## Existing source archive

Bellibing already has separate pinned source artifacts for released Character skill-tree/mechanics and S1-S6 presentation. Those remain under their existing contracts and are **not** duplicated into this Factory lane merely to inflate provider counts.

In particular, the pinned `DommyMM/wuwabuild` source remains subject to the current repository data-use policy. This workstream does not relabel it as an independent reusable Factory provider.

## Promotion boundary

A successful capture means only that provider evidence was stored with provenance. Promotion into `src/data/characters.ts`, Character Mechanics facts, combat adapters, readiness, or UI requires a later source-validity/semantic review. Existing canonical truth wins until that review is explicit.

The intended lifecycle is:

`capture -> reconciliation -> later selective review/promotion`

not:

`capture -> automatic gameplay truth`
