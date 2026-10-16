# Single Echo Simulation V1 — source-backed resource blocker

Status: **Transaction foundation staged on Draft PR #249; Echo generation remains Pending.** No merge or deployment.

## Verified boundary (Rank-5 +0 → +5, one substat)

- Canonical `src/echoCoreRules.ts` `CHECKPOINT_CUMULATIVE_COST[5]` requires **4,400 Echo EXP, 10 Tuners, and 2,440 Shell Credits**. The independent attempt also needs one Echo.
- Canonical `rollNewSubstat` plus `assertExactRank5SubstatRoll` supplies verified unique stat types, tiers and probabilities; `src/echoMainStats.ts` / the approved Echo catalog supply +0/+5 main-stat progression.
- Existing `src/echoExactTubeSpending.ts` and `src/resourceInventory.ts` can account for **whole Tube denominations, overflow and Tuners**, with finite zero distinct from explicitly unlimited. The private research reference is not a persisted inventory transaction.
- Shared `ResourceInventory` contains **Shell Credits** with finite-zero/unlimited and strict legacy migration. `echoResourceTransaction.ts` now stages a single bounded **Rank-5 +0 → +5** atomic debit (one Echo, canonical Tuners, actual whole Tubes, canonical Shell Credits) in the existing Improve storage envelope, with persisted replay IDs and preflight. It does not generate candidates or activate UI.
- The Shell Credits control remains unchanged. Resource spending is available only through explicit isolated commit calls, never implicitly from a balance or Simulate click.

## Draft behavior

- **1 Slot** is visibly active and the original five selectable Echo slots remain independent presentation controls.
- **Simulate** remains deliberately disabled at the resource-commit boundary and retains its Pending feedback; no RNG, candidate, resource write or real Character equipment/stat mutation occurs from the UI.
- A pure, bounded one-candidate +5 mechanism and exact browser Tube transaction adapter are staged as **non-promoted, unconnected groundwork**. Their unit tests do not satisfy the live resource/equipment safety gate.
- **Full Set, accept/reject, retries, equipping, evaluator and actual paid candidate generation remain Pending.**

## Required to unblock

1. **Staged transaction implemented, not live:** `commitRank5Plus5Resources` computes and persists all four costs in one synchronous envelope write, reports actual Tube quantities and keeps revision/replay IDs in that same envelope. Failed preflight, stale token, replay or `setItem` failure changes no persisted bytes; settings saves preserve committed shared inventory. Exclusive coordination of **all** cross-tab envelope writers remains a future integration requirement: Web Storage compare-then-set is not a universal cross-tab CAS.
2. **Next separate authorization:** safely connect the transaction to the selected slot and stage Echo Core RNG only after reviewing browser/runtime concurrency, result presentation and failure recovery. This PR iteration intentionally does **not** connect or generate.
3. Physical 1440×900 source + built UI resource-commit verification remains Pending until that integration. Existing presentation behavior is unchanged.

Do **not** report V1 candidate generation as complete before those gates pass.
