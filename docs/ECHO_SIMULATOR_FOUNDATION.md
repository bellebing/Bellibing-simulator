# Echo Simulator — unified public UI contract

## Ownership and navigation

The simulator lives inside Improve a Character. **Current / Simulate** switch the workspace; Current is the saved actual build, and Simulate creates a memory-only session with five empty Echo slots. Character context, Weapon, Skills and Sequence come from the existing build owner. Reset clears simulated equipment/history and snapshots the current saved budget. Exit, reload, Character changes and Home discard the sandbox without changing actual equipment or balances.

The workspace uses one shared Echo card renderer/editor. Each simulated slot has small Edit, Activate and Deactivate controls with accessible names. Edit opens the existing Echo Workspace with the slot's cost and selected Sonata eligibility. Saving prepares a canonical stat card in the same slot owner used by generated results. Preparation consumes no resources and fabricates no accepted/generated history. Editing an inactive card preserves its inactive state. Canonical editor validation and the 12-cost loadout limit apply before mutation.

Current and Simulated stats appear side by side through the existing static Build Stats projection. Deactivated Echoes and Weapon are excluded from simulated projection while retained for reactivation. Extra zero-value stats and read-only Skills/Sequence are under separate expandable controls. Unsupported conditional effects remain Pending. These values are static build stats, not DPS or expected results.

## Shared settings and resources

Current and Simulate use one Character-owned settings record and shared Resource Inventory in the canonical Improve v3 storage envelope. Selected Sonata filters persist per Character; explicit empty selections and existing multi-set selections survive. The newer persistent multi-select replaces the former memory-only two-set replacement picker. Filters determine eligible species/assignments, not a guaranteed set distribution or active set bonus.

The compact settings row is **Sonata Sets / Gate / Required Substats / Flex Substats / Stats**. Edits express manual intent directly; resetting Echo settings is local to that section. Saved numeric targets remain editable and recoverable. Source Recommended values never substitute for unavailable Expected values.

Resources allow safe whole counts or explicit ∞, with an Unlimited toggle per input. Previous finite counts are remembered during the page lifetime; after reload an already-unlimited field returns to zero because its prior finite value is not persisted. Direct editing, horizontal scrubbing and Arrow Up/Down use the same serialized storage writer. Inventory v2 includes Shell Credits, retaining finite-zero and legacy recovery semantics. Shell Credits are saved context, **not charged by the +25 sandbox**. Browser Web Locks order writers; an IndexedDB read/write transaction owns the exact shared envelope, including retained legacy recovery bytes. localStorage is its synchronous UI mirror and storage-event transport. On first use, existing bytes are adopted without changing the schema or deleting recovery data. Each writer refreshes its mirror from the authoritative transaction before checking snapshots. Success is returned only on durable transaction completion; failed/quota/aborted writes restore the prior mirror and retain the authoritative original. Missing locks or IndexedDB fail closed. Native storage events refresh the other tab’s settings and inventory; they are change notifications, not transaction receipts.

Settings edits cancel running batches before another attempt. Sonata edits also rebuild eligible templates without rewriting equipped cards. Resource edits cancel the run and preserve cards/history. Apply new total budget deducts all committed session spending (net of verified cap returns); an insufficient total fails without mutation. Reset remains available. Saved Resources are never spent by the simulator.

## Canonical requirement rolling

**1 Slot** progresses eligible Rank-5 candidates checkpoint by checkpoint for the chosen template in cooperative batches. **Full Set** processes slots 1–5 sequentially with one detached working budget. Canonical Echo Core owns tiers, RNG, unique substats and progression; the exact resource engine owns whole-Tube spending and tuning. At/after Gate, impossible selected requirements stop further checkpoints. Only +25 cards satisfying all requirements populate simulated equipment. Insufficient next-checkpoint resources retain a partial candidate; starting another run archives it as an unplaced card, not a rejection. A candidate passes only when all selected Required minima and at least N distinct selected Flex minima pass the existing requirement assessment. Success activates that slot; it does not establish Character improvement.

Invalid/impossible/unavailable requirements or an unfunded first checkpoint stop before spending. Finite-zero Echoes, fewer than 10 Tuners or insufficient whole Tubes for +5 do not roll. Later exhaustion preserves a partial card and committed checkpoint spending. One attempt is atomic, including detached resource depletion and actual checkpoint history. Exhaustion and Cancel preserve completed slots, consumption and histories. A 1,000-attempt safety pause offers Resume. Yielding batches keep controls usable.

Unrolled templates contribute no stats. Generated active/inactive equipment shares the same slot owner as prepared cards. Accepted and rejected generated histories remain inspectable, with slot-local Trash Piles and checkpoint records. Five piles remain visible in a separate panel below Simulator, including explicit Empty states. Cards show identity, main stat, unlocked substats and actual stopped level; inspection shows one new roll per checkpoint and marks the last rejected roll. Replacement does not refund resources. The exact Tube ledger owns upgrade overflow/carry/cap returns; discard/feed/Data Recovery receipts and net recovery remain Pending.

Gate +5/+10/+15/+20/+25 selects the first mathematical impossibility check. A possible candidate continues to +25 for final requirement acceptance; no economic preference is inferred. The separate pure +5 resource transaction and candidate groundwork is preserved and regression-tested, including cross-tab debit protection, but is not connected to a live UI spending action.

## Public boundary and remaining work

The public build contains explicitly approved character-free mechanics, canonical storage, static projection and requirement orchestration. It contains no private policy, calibration, evaluator endpoint or browser substitute for Character usefulness.

Private evaluation, Build Need, Improvement Cost/distributions, Expected, farming probabilities, completion thresholds, recovery economics and live team DPS remain Pending. The experimental Augusta damage pilot on main is unchanged and is not made available through this UI.

## Verification

Domain regressions cover canonical RNG/ledger parity, atomic failures, budgets, five-slot orchestration, pause/cancel, manual preparation, cost validation, activation, alias isolation and source JavaScript parity. Browser gates exercise source and strict built previews, physical editing/activation/generation, Current/storage isolation, native cross-tab settings/resource propagation, and 1440×900 / 1920×1080 / 2560×1440 layout. Review screenshots and exact-head CI evidence belong to the PR; user review and successful FULL remain separate requirements before landing.

See [Improve settings](UI_IMPROVE_SIMPLE_SETTINGS.md), [product direction](ECHO_SIMULATOR_DIRECTION.md) and [integration coverage](UI_INTEGRATION_COVERAGE.md).
