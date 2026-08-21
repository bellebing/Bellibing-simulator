# Game-data verification policy

## Goal

Minimize manual input for the user without turning third-party tools into hidden sources of truth.

## Source roles

1. DPR Calc Results
   - quantitative benchmark / rotation comparisons when available.
2. Prydwen and Game8
   - published standard recommendations, rotation descriptions and cross-checks.
3. Tethys and theorycraft resources
   - mechanics/rotation support and edge cases.
4. Wutheringlab, Nanoka and structured databases
   - raw data/scaffolding inputs.
5. Official patch notes / in-game release state
   - release status and changed mechanics.
6. International tools/sites (CN/JP/KR/Arabic/etc.)
   - discovery, implementation ideas, alternate descriptions and cross-checks.
   - never sufficient alone for a contested mechanic.

## Required data status

Every combat-affecting value should be representable as one of:
- verified base/raw value
- verified modeled effect
- conditional effect
- pending/unmodeled effect
- WIP/unreleased (must not route into production calculations)

## Character ingestion

A future generator may import raw character/weapon/action structures from a machine-readable
source, but generated output is initially non-routable. The ingestion step should create:
- provenance for each imported block
- a review checklist
- explicit pending entries for effects that require interpretation
- parity tests when a V9.15/DPR benchmark exists

Only verified contexts become selectable in production.
