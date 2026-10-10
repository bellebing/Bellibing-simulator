# Single Echo Simulation V1 — source-backed resource blocker

Status: **Pending / not promotion-ready** on Draft PR #249. No merge or deployment.

## Verified boundary (Rank-5 +0 → +5, one substat)

- Canonical `src/echoCoreRules.ts` `CHECKPOINT_CUMULATIVE_COST[5]` requires **4,400 Echo EXP, 10 Tuners, and 2,440 Shell Credits**. The independent attempt also needs one Echo.
- Canonical `rollNewSubstat` plus `assertExactRank5SubstatRoll` supplies verified unique stat types, tiers and probabilities; `src/echoMainStats.ts` / the approved Echo catalog supply +0/+5 main-stat progression.
- Existing `src/echoExactTubeSpending.ts` and `src/resourceInventory.ts` can account for **whole Tube denominations, overflow and Tuners**, with finite zero distinct from explicitly unlimited. The private research reference is not a persisted inventory transaction.
- The public user-owned `ResourceInventory` has **Echoes, Tuners and four Tube denominations**, but **no Shell Credit balance or verified Shell Credit spending transaction**. Adding credits to a candidate ledger without debiting a reviewed authoritative balance would fabricate affordability.
- `Improve Settings` layout and resource inputs are approved/frozen for this PR; do not quietly add an unreviewed currency or imply its quantity is unlimited.

## Draft behavior

- **1 Slot** is visibly active and the original five selectable Echo slots remain independent presentation controls.
- **Simulate** refuses zero Echoes/Tuners, then explicitly reports the verified missing Shell Credit transaction. The right result card states Pending. **No RNG, candidate, resource write or real Character equipment/stat mutation occurs.**
- A pure, bounded one-candidate +5 mechanism and exact browser Tube transaction adapter are staged as **non-promoted, unconnected groundwork**. Their unit tests do not satisfy the live resource/equipment safety gate.
- **Full Set, accept/reject, retries, equipping, evaluator and actual paid candidate generation remain Pending.**

## Required to unblock

1. Approve a source-backed Shell Credit inventory owner and transaction, including finite-zero handling, persistence and concurrency safety, without modifying the approved Improve Settings layout by stealth.
2. Compose an **atomic candidate attempt receipt** that commits the verified Echo/Tuner/Tube and Shell Credit costs, or commits nothing. An existing partial Tube ledger must not be mistaken for a full transaction.
3. Only then wire the staged Echo Core RNG to the selected slot, display actual +5 main/substats in the right card, and run physical 1440×900 source + built UI verification for success, zero budgets, repeated clicks and Character isolation.

Do **not** report V1 candidate generation as complete before those gates pass.
