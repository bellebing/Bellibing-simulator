# Character-aware Sandbox contexts

This Draft implements the source-context and presentation slice of Issue #319,
on top of public Draft #318. It does not qualify new DPS providers.

`tools/export-character-contexts.mjs` projects the existing canonical team,
rotation, guide and Settings catalogs. Run it with `--check` to check parity.
`v1.1/modules/character-contexts.json` is generated, never a manually authored
team database. Its 59 Character records include a field-based coverage matrix:
standard configuration, source-ranked stat guidance, exact modern DEFAULT Calc
metrics, Recommended UI mapping, Hard/Flex, ER and DPS boundaries.

## Working behavior

- All 59 Characters have reviewed source team options. The selected Character is
  always the first displayed member, including when a support selects a context
  whose original anchor is another Character. Model-only discovery is excluded.
- Default selection requires an existing reviewed primary-Character Team Profile
  matching exactly one guide context, or exactly one source BiS/core context.
  This currently resolves Augusta, Cartethyia, Luuk Herssen and Qingxiao. The
  remaining 55 defaults are `PENDING_AMBIGUOUS_TEAM`; no arbitrary first option
  is promoted. User-selected reviewed alternatives are labelled separately.
- The same Team DPS panel follows both Character Stats and Simulation Stats.
  Portraits/names appear once above four equal value columns. Recommended,
  Expected and Simulated are horizontal rows, with per-cell Pending reasons.
- Source details join all three members to existing standard Weapon/Echo-shell
  configurations and retain team mode, conditions, rotation references, timing
  variant/resource coverage and provenance. A standard shell is not a complete
  numeric baseline or team-specific gear prescription.
- Team choices live in each detached Character state. A team change advances
  the context revision, invalidates results and clears the expert evaluation
  context. These reference choices are not passed off as executable host teams.
- Recommended opens source guidance for all 59 Characters, including original
  priorities, endgame strings, conditions and source measurement/sequence basis.
  It resets Hard/Flex only when the existing canonical approved policy supports
  it (currently Augusta). Otherwise Custom intent and ER are preserved.
- The compact Character Target now uses each Character's existing modern DEFAULT
  Calc projection (19 covered identities), without a guide fallback.
- Host diagnostics live under Simulation details beside SIMULATE. Resource Cost
  retains its own cost details; repeated DPR/DPS Pending text is removed.

## Phrolova / Frolova

The canonical identity is `phrolova`. The reviewed Prydwen capture lists
`CRIT RATE = CRIT DMG > ATK% > Skill DMG% > ATK`, `60%+ (before Echo set bonuses)`
and `215-260%+ (before any Aftersound stacks)`. These now appear in Recommended
source guidance. This capture contains no numeric ER target. Neither conditional
total-stat ranges nor priorities establish per-Echo Hard requirements, Flex
minimum/count or an unconditional crit threshold. Those mappings remain Pending;
BUG-042 is not closed.

## Pending and review mode

All three normal DPS rows remain Pending: no approved complete Recommended
baseline, statistical Expected team-DPS producer or qualified Simulated team
provider is introduced. There is no DPS delta, E[DPS] approximation or implied
buff uptime. Full Character/Simulation Stats projection is a separate remaining
work area. Current/Candidate comparison contract and account integration are not
implemented by this slice.

`?sandbox=true&review=expert` exposes a separate collapsed synthetic-reference
review control for Augusta. Explicit opt-in retains the existing private host's
strict qualification and same-call contribution/total guard. Its experimental
values never populate the normal comparison rows or define a default source
team. Normal product mode has no synthetic DPS selector.

## Verification boundary

FAST: generated parity, focused context/ownership/Custom/Pending tests and the
strict build. One focused Chromium interaction checks panel sharing, explicit
team selection, Character changes and Phrolova guidance. Existing automatic UI
Lab Review retains its width/host/export gates and includes the new regression.
Independent final source/visual/runtime review remains required. No extra FULL,
private research reproduction, merge, deployment or account write is performed.

Next independent review should inspect default-source semantics, mode/gear
compatibility, per-Character switching and panel layout at the existing desktop
widths. Actual private-host qualification is needed before introducing numeric
comparison rows; a public UI test cannot establish that qualification.
