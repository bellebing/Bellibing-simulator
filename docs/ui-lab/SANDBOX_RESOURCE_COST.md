# Sandbox and Improve Expected resource cost

The live M0 producer supplies certified fresh-start Echoes/Tuners in its existing
supported contexts. The coordinated Expected cost V1 candidate extends the
private producer to every Gate and canonical minimum, adds success odds and
reference Tube expectations, and connects pre-run candidate-search metrics in
Improve. These additions are not released until both candidates pass their gates
and the coordinated backend/Pages release is approved.

## One scope for probability, cost and execution

- Goal: first actually qualified Rank-5 +25 Echo for each active selected slot.
- Requirements: all Hard Requirements AND the explicit minimum count of distinct
  selected Flex Stats, with each canonical minimum. Other Stats impose no goal.
- Gate: first allowed assessment at +5/+10/+15/+20/+25; later checkpoints follow
  the same constrained gross-Tuner-optimal stopping policy as the private run.
- Candidates already have the chosen legal species/main stat/rank/Sonata. Farming,
  drops, acquisition odds and unsupported recommendation inference are excluded.
- **Full-roll odds** mean qualification if a fresh Echo is finished to +25.
  **Success per attempt** means qualification under the selected stopping policy.
  The visible probability is the latter; the two values must not be confused.
- Expected is a fresh-start unlimited-attempt mean including failed attempts.
  It is not success probability within current stock, live remaining cost or
  expected Character/DPS improvement. Sum per-slot resource means; do not present
  a product of probabilities as a mean cost.

## Aggregate producer and public presentation

The existing `expectedCost.selectedSet` cells independently use status VERIFIED
or PENDING. Verified scalar values carry exact rational and approximate values.
`expectedCost.odds.fullRoll` and `.policyAttempt` follow the same verification
shape. The browser displays only validated finite non-negative aggregates and
probabilities in [0,1]. Missing fields from older runtimes stay unavailable.
There is no public probability/optimizer implementation or numeric fallback.

Reference Tube cells contain all four canonical denomination expectations and
`tubeReference=CANONICAL_ALL_UNLIMITED_FIRST_PARETO_WITNESS`. They reuse the same
canonical transaction/path selector as an actual all-Unlimited run. Expected
Tubes are marked **Unlimited reference**. Finite stock can change actual Tube
selection; reference quantities are not guaranteed denomination spending from
that stock. Expected Tuners must never be converted to XP with a fixed ratio.

Gold-equivalent is sum(count × canonical Tube EXP)/Premium Tube EXP, a display
unit rather than an inventory exchange. Keep exact producer values underneath
rounded presentation. Missing one denomination makes the aggregate unavailable.
Expected Echoes/Tuners use rounded whole numbers with an approximation marker;
Tube equivalents retain one displayed decimal and Expected remains approximate.

## Improve and ownership

Improve retains the host's pre-run candidate-search metrics. These describe a
fresh replacement Echo meeting the selected criteria. Saved Current/equipment
and the user's inventory are immutable. `improvementExpectedCost`, ranking and
Expected DPS remain Pending until actual Character gain has a separate verified
definition. Whole-build ER constraints are separate from per-Echo requirements.

Existing owner/revision invalidation clears stale metrics on relevant edits,
Character changes, reset and failed preflight. Actual Simulated values require
unique authenticated receipts from the current run; no fixture or inventory
balance becomes an observed cost.

## Receipts and remaining boundaries

`src/simulatedResourceCost.mjs` validates contiguous unique event receipts and
inventory continuity, preserving gross, returns, signed denomination net,
remaining and Gold-equivalent. Unlimited affects feasibility, not actual cost.
An empty pre-run record is not fabricated zero spending. Whole-item +25 overflow
returns retain their existing canonical meaning and are not Data Recovery.

Finite-budget completion odds/optimum, feeding/Data Recovery, farming, Expected
whole-build ER/DPS gain and unsupported source contexts are outside V1. They stay
explicitly Pending rather than being approximated from a seeded simulation.
