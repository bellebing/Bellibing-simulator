# Sandbox resource-cost producer contract

S1 keeps the approved compact `resource-cost.js` table and its canonical icons/Gold-equivalent formatter. No verified Expected producer or run is connected. Expected cells mean **Pending: no matching verified expectation**; Simulated cells mean **Awaiting an actual run**. Both render `—`, never a zero inferred from missing data or Unlimited inventory.

## Audited existing capability

| Quantity / scope | Existing producer evidence | Safe S1 conclusion |
| --- | --- | --- |
| One-slot Expected gross Tuners to first goal-qualified +25 | Reviewed private exact recurrence and independent certificate for its explicitly supported Gate/minimum/Hard/Flex policy | Mathematically defined only for that target/policy/source context. No browser producer/authorization wired here. Higher Gate/minimum and general policy coverage are independent Pending capabilities. |
| Expected Echo attempts and Tube denominations | No approved browser-facing matched producer contract for all three metrics | Do not derive from one observed run, divide Tuners by a fixed constant, or assume mean Tube cost from static +25 totals. Remains S3 work. |
| Whole active-set Expected | No verified finite-budget, arbitrary-set expectation producer connected | Sequential composition requires proof of each target/policy/context, independence/coupling assumptions and completion/censoring semantics. Do not multiply one slot's result by five. |
| Actual Simulated Echoes/Tuners/Tubes | Existing private run presentation exposes observed canonical transaction receipts/events and session identity/revisions | S2 can aggregate unique committed receipts for selected slots/session, keeping gross/returned/net separate. Empty before a run. No account debit is implied. |
| Finite-inventory feasibility | Canonical resource validation, exact whole Tube transactions/carry/overflow; private bounded run feasibility | Feasible/censored/blocked is not Expected. Unlimited affects feasibility, not zero cost. |
| Recovery/feed/refunds/global finite-budget optimum | Existing explicit Pending boundaries | No invented refund, denomination conversion or optimal-budget claim. Recorded whole-item overflow returns stay separate from unimplemented Data Recovery/reject refunds. |

This is a capability audit, not publication of private recurrence code, policy, coefficients, intermediate economics or calibration. DPR/DPS usefulness and the economic goal remain independent.

## Versioned producer DTO (planned, not a new calculation engine)

`BELLIBING_SANDBOX_RESOURCE_COST_V1` must carry:

- `kind`: `EXPECTED` or `SIMULATED`; `status`: `VERIFIED`, `PENDING`, `UNSUPPORTED`, `BLOCKED` or `CENSORED`, with a safe public reason code.
- `scope`: `SINGLE_SLOT` or `ACTIVE_SET`, exact numbered selected slots, Character/preset/source identity, Settings/goal/policy context and engine/provider/version.
- `binding`: Sandbox session/build ID and Character/build/configuration/selection/Settings/inventory/session revisions, plus immutable canonical source version. Fresh complete owner values remain authoritative; a digest is not authorization.
- `basis`: for Expected, exact defined random variable and stopping criterion (first qualified +25, fresh start/resume context, unlimited versus finite/censored model and its assumptions). For Simulated, one actual run ID, receipt range/cursor and terminal/completion status.
- `gross`: Echoes, Tuners and four Tube denominations, each independently available or null. Actual counts are whole non-negative safe integers. Expectations may be non-negative fractional values only from a verified matching mathematical producer; unavailable metrics remain null.
- `returned` and any separately proven `recovery`/`net`: separate records with their own semantics, never silently subtracted from gross. Sample means/distributions over many runs need sample size, censoring and estimator metadata; they are not mislabeled exact Expected.

Gold-equivalent is a presentation unit only: sum each canonical denomination's item count times its reviewed internal value, divided by Premium's value. Existing canonical denominations yield Premium + 0.4×Advanced + 0.2×Medium + 0.1×Basic. Keep exact internal quantities; round only displayed digits. Never ceil to a fictitious number of Premium items or perform inventory exchanges. Missing one denomination makes that aggregate unavailable. Internal EXP remains absent from user-facing resource controls.

The eventual adapter must validate this DTO, reject mismatched/stale scope/provider/revisions, clear obsolete results on edits and only then project the existing `{status:'VERIFIED',echoes,tuners,tubes}` presentation record. In S1 no producer calls that adapter. No sentinel demo amount is used as an estimate.

## S2 / S3 implementation and verification order

1. S2: register an isolated host-run context and receive only the existing safe presentation DTO. Deduplicate committed transaction receipts by authenticated/isolated session and event/request identity. Aggregate gross per slot and active set; retain returned/net separately. Verify start/reset/abort/censored/blocked/late/replayed responses, exact Tube carry/overflow and zero account writes.
2. S3: expose only the reviewed private producer's supported one-slot Expected metrics with goal/stopping/model/provider/source binding. Extend Echo/Tube expectations only with independent recurrence/reward proof; never infer them from Tuner expectation or a seeded run.
3. Separately qualify whole-set expectation under explicit sequential/budget/coupling assumptions. If no valid producer exists, report Pending rather than routing through Monte Carlo without estimator labels.
4. Test exact/independent references, limiting/zero/unlimited cases, missing metrics, invalid negative/nonfinite values, denomination conversion, gross versus returns, scope mismatches, stale UI edits and repeated receipts. Verify actual browser pre-run `—`, active-slot scope and reset/invalidation. Any new mathematics requires its own model/source review.

S1 deliberately connects no optional producer: the available exact Tuner economics does not establish a complete three-resource, arbitrary-set, fresh-context expectation API. Implementation belongs to the separately authorized S2/S3 phases.

## S2A observed receipt adapter

`src/simulatedResourceCost.mjs` now implements `BELLIBING_SIMULATED_RESOURCE_COST_V1` and its existing-table projection. It validates contiguous unique event receipts, inventory continuity and canonical whole Tube transactions; keeps gross, returned, signed per-denomination net and remaining separate; and computes Gold-equivalent using canonical denomination values. A negative denomination net can represent returned lower-denomination items, not negative gross spending. Unlimited still records actual paid receipts.

The private offline integration reuses this public, policy-free adapter against actual engine receipts. Public synthetic contract tests verify aggregation/rejection only; actual run/replay evidence stays private. `expected` is always null. No UI producer is connected, no demo spend is substituted and no account inventory is debited. Browser cells remain `—` pending S2B. See the [execution boundary](SANDBOX_EXECUTION_CONTRACT.md).
