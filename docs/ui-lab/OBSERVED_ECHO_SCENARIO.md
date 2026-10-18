# Fixed-scenario observed Echo comparison

Issue #319's clarified DPS direction uses the existing Augusta pilot as a bounded
replay. No general rotation planner, new damage engine, team substitution or
rotation optimization is added. The unchanged pilot owns coefficients, source
hit/state windows, dynamic buff quantities and canonical damage arithmetic.

## Working behavior

In the existing `?sandbox=true&review=expert` opt-in Augusta/Iuno/Shorekeeper
reference, a compatible local host can compare the five completed observed
Augusta cards with one other complete observed card from the same run/slot.
At most one alternative per slot is supplied; selection is not damage ranking.
The UI shows the observed build, one-Echo alternative and absolute/relative
Character and Team DPS changes. These are experimental scenario values, not
Recommended/Expected reference builds or verified upgrade judgments.

Both scenarios keep the same other four cards, S0/R1 investment, equipment shell,
Iuno/Shorekeeper reference builds, enemy and source cycle 2. All three actor
contributions and each team total come from the complete team replay for that
build. The comparison is not a sum of independent dummy evaluations. Existing
Shorekeeper ER-dependent crit strength remains owned by that executor; this
Sandbox adapter changes only Augusta. Other Character execution stays Pending.

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

Iuno/Shorekeeper still use the existing explicitly synthetic fixed reference
builds. This alone does not establish an approved Recommended build. Fixed state
schedule assumptions, grouped hits and remaining buff/proc/resource evidence
still require independent source qualification. The adapter never promotes an
experimental result into the normal three comparison rows; normal Simulated,
Recommended and statistical Expected DPS remain Pending.

Future qualification should target this one bounded scenario and its supported
Echo-stat changes. A general native rotation engine is not a prerequisite product
goal. If the fixed scenario cannot establish a particular trigger/resource claim,
only that qualification remains Pending. Account integration is outside this work.

## Focused evidence

Public tests cover fresh ownership/source binding, valid zeros, source-clock drift,
forged deltas and expert-only presentation. One focused 1440px Chromium flow uses
controlled HTTP aggregates, checks Pending alternatives and Reset, and preserves
normal DPS Pending. These fixtures do not prove private rolling execution.
The host owns separate actual-observation replay and validation tests. Existing
automatic repository gates remain enabled; no manual FULL campaign is added.
