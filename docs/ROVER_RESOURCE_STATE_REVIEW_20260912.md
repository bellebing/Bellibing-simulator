# Rover resource/state execution review

Baseline: merged/post-merge-verified PR194, `2b1ba64a239338a91919c96afe1f8f4ed9516a73`, 839 tests. New work is isolated on PR195. All83 pending edges/72 IDs, partition24/24/7/11/17, readiness43/3/9/2 and six Reference Team blockers remain open.

## Source boundary

The existing `rover-aero-resource-windstrings` fact owns every amount and maximum. Its original pinned provenance and RAW_ONLY status are preserved. The existing nominal-gain API remains unchanged. No second numeric resource table is introduced.

The [current game-text mirror](https://wuthering.wiki/character_1406.html) and [current kit](https://www.prydwen.gg/wuthering-waves/characters/rover-aero), reviewed 2026-09-12, establish Unbound Flow access at maximum Windstrings and a cost for each performed attack. This is not a per-landed-damage-hit cost: Stage1's five-hit damage representation does not multiply consumption. Exact Stage1/Stage2 action IDs, S0/max skills, active Unbound Flow mode and actual source-qualified execution are required. The nominal spend evaluator proves no initial/stored resource, access from a profile string or timing relative to damage/healing.

The canonical rule also contains Basic3/4 and Dodge Counter gains. Basic3 and Dodge Counter are composite/multi-hit representations; their component/partial-hit allocation is not established. Basic4 is a single hit, but it is not required by the selected canonical standard profile and is not added merely to increase primitive count.

## State questions still open

The bounded `rover-windstrings-ordered-fragment-v1` ledger now consumes the four existing gains and two performed-stage spends for the existing Rover preset. The caller supplies a proven numeric initial observation or explicit UNKNOWN, chronological event IDs/order, and evidence for a complete continuous on-field Windstrings fragment. Known values within the maximum can be updated without deciding overflow. Any possible overflow returns PENDING with the last proven prefix; it never clips. Unknown initial state returns no stored total. Invalid identities/order/source qualification fail closed before evaluation.

For an on-field fragment, Stage1 requires maximum stored resource and Stage2 requires the immediately preceding matching, source-qualified Unbound Flow chain. The ledger does not choose an attack, infer a mode, repeat an event, generate damage, execute a swap or carry state into an unproved interval. End-of-fragment resource is not a full-rotation final resource. `resourceStateSupport` exports one identity-only contract for the existing preset; the closure report joins it without promoting any readiness/dependency.

The selected standard profile also needs off-field Stage2. The reviewed kit and canonical rotation describe that continuation after switching out, but neither supplies a numeric post-swap pool observation or exact transition time. A separately bounded suffix now accepts exactly one caller-proven Stage2 with a matching prior Stage1/chain and actual outgoing/incoming swap proof. Incoming identity is joined to the existing preset's canonical team rather than copied into a teammate table. Its initial observation must be at or after that swap and before the supplied Stage2. Stored resource is read from that independent observation; Stage1's presumed remainder is never carried across the swap. UNKNOWN stays PENDING. No attack is automatically emitted, swap reset/persistence generalized, or extra event accepted in this suffix.

Synthetic contract tests illustrate both outcomes: a non-overflow prefix can reach maximum and pay both stage costs; an all-landed gain prefix with the Cartethyia award encounters possible overflow and stops. The fixture initial value, timestamps and hit set are not claimed as source-backed profile events.

The maximum bounds stored Windstrings; it alone supplies no overflow/clipping timing, simultaneous-award aggregation or reset policy. Neither zero nor full initial state is a proven standard-profile default. Unbound Flow's two source actions permit bounded explicit spend evaluation; performing Stage1 requires maximum resource and performing Stage2 requires source-qualified continuation. A source rotation alone supplies neither occurrence nor resource sufficiency.

The selected `rover-aero-cartethyia-ciaccona` profile still needs initial/end Windstrings, overflow behavior if reached, complete ordered events, Concerto, Resonance Energy, optional Skyfall choice, target/hit proof, Cartethyia award occurrence, off-field continuation, BUG-012 healing overlap, gear applicability and a verified denominator. No ENERGY/Concerto provider field is promoted to execution semantics. S1/S2 are not inferred from S0 support.

Fresh fallback reads on 2026-09-12 retain Shorekeeper's stage-level Empirical Data description and multi-hit damage facts without a partial-hit/multi-target/deduplication contract. Cartethyia's current kit still describes on-hit Conviction without exact component awards. Both remain parked; no hit-wise division, multiplication or component ledger is invented. S03/S10 are not retried. All known bug/source/Reference Team boundaries remain pending.
