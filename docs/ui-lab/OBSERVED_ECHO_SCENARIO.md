# Fixed-scenario observed Echo comparison

Issue #319's clarified DPS direction uses the existing Augusta pilot as a bounded
replay. No general rotation planner, new damage engine, team substitution or
rotation optimization is added. The unchanged pilot owns coefficients, source
hit/state windows, dynamic buff quantities and canonical damage arithmetic.

## Working behavior

In the existing `?sandbox=true&review=expert` opt-in Augusta/Iuno/Shorekeeper
reference, a compatible local host can select Augusta, Iuno or Shorekeeper and
compare that Character’s five completed observed cards with one other complete observed card from the same run/slot.
At most one alternative per slot is supplied; selection is not damage ranking.
The UI shows the observed build, one-Echo alternative and absolute/relative
Character and Team DPS changes. These are experimental scenario values, not
Recommended/Expected reference builds or verified upgrade judgments.

Both scenarios keep the same other four cards, S0/R1 investment, equipment shell,
the two non-selected reference builds, enemy and source cycle 2. All three actor
contributions and each team total come from the complete team replay for that
build. The comparison is not a sum of independent dummy evaluations. Existing
Shorekeeper ER-dependent crit strength remains owned by that executor; this
Sandbox adapter can replace any one of the three members’ actual builds. Other
trios remain Pending; source timing references alone do not bind a damage model.

The clock is 1666 source-model frames / 60, excluding timestop. It is not measured
real-time gameplay. Source timing/hit evidence remains pinned to Riley Calcs
`195a22f1b7a1b55b953224e26742b896a719e1c3`; no external calculator code or new
external runtime dependency is imported. Generated `echo-scenario.json` contains
only metadata from the existing canonical pilot. No copied schedule or synthetic
Echo rolls are added to the browser.

## Boundaries

Only actual owned complete +25 alternatives may replace a card. Missing cards,
changed equipment, invalid observations, insufficient source ER and incompatible
contexts are Pending, with no invented alternative rotation. The public reader
checks source/clock/provider identity, run/revision, observed ownership, matching
baseline aggregates, same-run conservation and delta consistency. Reset and
context invalidation remove old comparisons.

The two non-selected members still use existing explicitly synthetic fixed
reference builds. This alone does not establish an approved Recommended build. Fixed state
schedule assumptions, grouped hits and remaining buff/proc/resource evidence
still require independent source qualification. The adapter never promotes an
experimental result into the normal three comparison rows; normal Simulated,
Recommended and statistical Expected DPS remain Pending.

Future qualification should target this one bounded scenario and its supported
Echo-stat changes. A general native rotation engine is not a prerequisite product
goal. If the fixed scenario cannot establish a particular trigger/resource claim,
only that qualification remains Pending. Account integration is outside this work.

## Whole-build rotation ER

The generated metadata owns the selected fixed scenario’s exact resource minima:
Augusta 116.2952970181886%, Iuno 123.1830500123183%, Shorekeeper
210.08321273516643%. These are pinned scenario-model minima, not the separate
Calc benchmarks or general gameplay recommendations. Source qualification of the
experimental scenario remains separate.

The host checks total Character ER from five actual cards plus the canonical
baseline. Explicit Custom total targets can raise the effective minimum; lower
Custom targets cannot weaken the source rotation minimum. No ER requirement is
added to individual Echo goals. Complete Echo-target success and rotation
acceptance are separate: equipment and actual receipts remain available when ER
is not met; no numeric scenario DPS/delta is returned for that invalid build.
No automatic retry policy is added. A provably unreachable requested total fails
before spending; the conservative upper bound respects full Hard/Flex occupancy.
Unsupported shells/contexts remain Pending, never a guessed minimum.

Certified Expected Echoes/Tuners still describe the existing per-Echo goals.
Expected cost for a rotation-ER-qualified build has no certificate and is Pending.
Iuno/Shorekeeper require explicit Custom Echo goals until source quantitative
recommendations exist; source priority guidance does not invent those goals.

## Focused evidence

Public tests cover fresh ownership/source binding, valid zeros, source-clock drift,
forged deltas and expert-only presentation. One focused 1440px Chromium flow uses
controlled HTTP aggregates, checks Pending alternatives and Reset, and preserves
normal DPS Pending. These fixtures do not prove private rolling execution.
The host owns separate actual-observation replay and validation tests. Existing
automatic repository gates remain enabled; no manual FULL campaign is added.
