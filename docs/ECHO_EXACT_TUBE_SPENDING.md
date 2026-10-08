# Exact Rank-5 Tube resource engine

Worker 15 Fas 1 is COMPLETE: merged and post-merge verified. The pure-domain engine
is integrated in the public repository. Production inventory, simulator, rolling
runtime and browser entrypoints do not consume it automatically. Existing Resource
Inventory remains the sole persistent shared user budget. Canonical
checkpoint costs and four Tube values are imported, not copied into another model.

## Transactions and ownership

`ExactEchoProgress.cumulativeEchoEXP` is authoritative. EXP eligibility and
`tunedThrough` are separate. Each explicit tune advances one eligible checkpoint
and spends 10 Tuners. Tube transactions deduct whole items atomically, carry all
intermediate EXP, store at most 142,600 and return cap overflow largest-first:
Gold, Purple, Blue, Green. No recovery multiplier applies. The ledger reconciles
supplied EXP with stored EXP, returned Tube EXP and the remainder below 500.
General integer EXP may have any remainder; fresh Tube-only totals are multiples
of 500, so the first reachable cap total is 143,000 and its loss is 400.

`ExactResourceState` is a detached calculation snapshot, not a persistence schema.
Its revision comes from the caller's authoritative resource/progress owner;
a successful spend or tune proposes its next revision. The owner must compare
and commit against its current revision. Replaying a pure function against an old
snapshot is possible and never constitutes another committed spend. Production
binding to inventory/settings/session/candidate context remains unimplemented.
Input, output inventory and ledger inventories are detached from one another.
Unsafe integer arithmetic rejects atomically instead of rounding holdings or EXP.

## Search contract and corrections

The optimizer returns one executable witness per nondominated **future resource
state and exact Tube cost**, rather than a denomination score, greedy recommendation or evaluator
min-max policy. Search includes deliberate overspend, exact carry and cap returns.
A target already eligible is a no-op; the horizon skips already-eligible targets.
No tuning, rejection/acceptance or future-Echo orchestration occurs in the search.
Cap inventories remain available for a later consumer to compare future Echoes.

For finite/mixed holdings, an immediate `need + maxTube - 1` bound and removable-item
pruning are unsound.
At 141,600 EXP with 11 Blue, spending one Blue reaches cap without return, leaving
10 Blue. Spending all 11 supplies 11,000 EXP and returns two Gold. Neither inventory
componentwise dominates the other; the latter exceeds the old 5,999 EXP bound.
Before cap, redundant immediate spending also trades finite inventory for genuine
exact EXP carry. Those distinct outcomes must survive resource-state comparison.

Higher EXP alone is not dominance. Starting at 141,600 versus 141,100 with the same
one Gold, spending it returns two Purple versus one Purple, one Blue and one Green.
The higher-EXP state cannot reproduce the same denomination receipt by that spend.
The corrected conservative relation requires equal EXP, equal tunedThrough and
componentwise no fewer Tubes, Tuners and Echoes, treating unlimited symbolically.
Identical subsequent spends then produce identical cap returns and preserve that
inventory ordering. Equal states share the least-cost witness; revision is an owner token,
not a resource objective. Distinct incomparable denominations remain separate.
Greater EXP is not safely dominant even with all four Tube denominations unlimited:
it required spending resources before a checkpoint observation. UNLIMITED removes
inventory exhaustion; it never erases transaction cost. Path dominance additionally
requires no greater gross supplied Tube EXP. Each ledger retains exact spent and
returned counts by denomination, supplied EXP and cap loss; horizon paths expose
`cumulativeSuppliedEXP`, the safe-integer sum of their transaction supplied EXP.
Returns are separate receipts, not a deduction that hides gross spending. Canonical
Tube EXP is an exact within-Tube comparison dimension, never a scalar exchange rate
for Echoes or Tuners. Equal-state/equal-cost denomination witnesses are mechanically
equivalent when symbolic holdings are unchanged; search chooses one deterministically.
Consumers needing denomination preferences must supply that separate policy.

Search never tunes/observes/decides. A future driver must spend to one opportunity,
tune, observe, decide and only then request the next spend. Horizon witnesses show
conditional continued reachability and inspectable spend history; they are not
expected rejection cost or an evaluator policy.

For all-finite Tube states derived from the same input, equal EXP also means equal
weighted remaining inventory EXP. Supplied totals differ by multiples of 500;
cap loss has the same residue for every path from that input. Strict componentwise
inventory superiority would increase that weighted total, which is impossible.
Thus equal-state deduplication suffices for this case, avoiding quadratic comparisons.
This conservation proof is an internal pruning proof, not a denomination valuation.

## Bounds, unlimited and termination

- Finite smaller denominations use their actual counts, not an immediate-target cap.
- Gold count above `ceil((142600 - currentEXP) / 5000)` cancels exactly: removing
  extra Gold still reaches cap and subtracts the same Gold from the returned count,
  yielding identical final holdings. Keep one smaller-spend witness.
- With unlimited Gold, a smaller-denomination block returning only Gold can be
  removed once the rest reaches cap. Restored finite smaller holdings improve;
  symbolic holdings are unchanged. The blocks are five Purple (10,000 EXP),
  five Blue (5,000) and ten Green (5,000). Therefore each smaller count need not
  exceed `ceil((cap - currentEXP) / value) + blockCount - 1`. Above that count,
  removing a block leaves even that denomination alone sufficient to reach cap.
- With finite Gold and any unlimited smaller denomination, arbitrary overspend
  can return arbitrarily many finite Gold. There is no finite complete frontier
  in the symbolic model. Default search throws `UNBOUNDED_FRONTIER`. An explicit
  `maxSuppliedEXP` defines a finite per-transaction domain; it is not inferred stock.
- All-unlimited uses checkpoint-essential multisets: removing any spent item must
  make the requested threshold unreachable. A removable item yields no finite
  denomination receipt, so it can be deferred until after observation, reducing
  reject cost while preserving the option to buy the same carry if continuing.
  This argument applies only when **every** Tube denomination is unlimited.
  An essential multiset has `suppliedEXP < need + largestTube`: otherwise any item
  can be removed. Cap-reaching totals above the first reachable multiple of 500
  have identical progress/stock and higher gross cost, and are discarded too.
  Enumerate at most ten 500-EXP totals in this interval. For each, only denominations
  strictly greater than `total - need` can occur. A memoized four-denomination
  integer search constructs one witness per feasible exact total, without fake
  stock. Equal total means equal exact progress, gross cost and symbolic inventory;
  other denomination witnesses have no distinct mechanical future. The memo has
  at most four times 287 remainder states per total. An explicit `maxSuppliedEXP`
  intersects this domain. Fresh +5 retains 4500, 5000 and 6000 EXP, never a cap jump;
  fresh +25 has one 143000-EXP witness with 400 cap loss.
- Each remaining multiset is enumerated once. `maxSearchWork` defaults to 250,000
  counted traversal/frontier operations, shared across an entire horizon. Exhaustion
  throws `SEARCH_LIMIT`; no partial list is returned as a complete answer. Safe-integer
  overflow likewise rejects. Callers must distinguish these failures from an empty
  infeasible frontier. Large finite frontiers can require an explicit larger budget.

## Evidence and remaining scope

The regression suite uses an independent exhaustive finite-stock oracle over
567 initial inventory/EXP combinations, cap transformation counterexamples,
bounded-domain comparisons, larger symbolic-stock comparisons with cost-aware
frontiers and their original inventory projections, an independent essential-multiset
oracle at every checkpoint, replayable horizon
witnesses, tuning/revision/atomicity checks and 400 deterministic ledger properties.
Deterministic operation guards cover huge stocks and all-unlimited horizons; no
machine-dependent timing assertion is used. Run exploratory timing cases with
`node --experimental-strip-types scripts/benchmark-exact-tubes.ts`. Exact engine
verification and benchmark results belong on its GitHub PR.

Direct feed, Data Recovery/rounding, full rejection recovery, Tuner recovery,
evaluator, continue/reject/accept, completion, Build Need, Improvement Cost,
whole-build orchestration, Monte Carlo and production private ingress remain Pending.
