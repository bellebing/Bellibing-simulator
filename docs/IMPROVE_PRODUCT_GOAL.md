# Bellibing's public Echo Simulator and private Improve engine — product boundary

**Owner-approved product direction, 2026-10-25.** Public game truths and ordinary Echo leveling mechanics are not Bellibing's secret sauce. Keep the two experiences distinct and reusable.

## Public: Echo Simulator / Sandbox
- A fun, hypothetical Wuthering Waves Echo RNG/leveling simulator: acquire eligible Echoes, roll checkpoints, display generated substats and actual public game-cost/recovery mechanics.
- Canonical Echo RNG, EXP/Tubes/Tuners, legal roll values, source data and simulation state belong to this public repository. Share these **verified** primitives with consumers (including the private runtime) through pinned imports; do not clone them or migrate them merely to hide known game rules.
- UI must visibly distinguish hypothetical/generated results from user-observed rolls. Do not imply the simulator changes real account inventory, equipment or game data.

## Public frontend for private Improve service
- **Improve is not another RNG game.** It is a real-game leveling decision assistant: read the owned Character, selected real team, full Current stats/equipment and all five equipped Echoes; let the owner select a slot; register actual observed substat names **and their exact roll values** at +5, +10, +15, +20 and +25.
- Show a clear **five-slot opportunity comparison** from the private service: slot to start with, chance of a strict modeled DPS improvement, expected attempts to obtain a better Echo, expected remaining cost in Tuners, EXP/Tubes/Echoes with recovery, available DPS gain and supported uncertainty/readiness. The *easiest positive gain* and the *best expected improvement per cost* can be different choices.
- After each real checkpoint input present private **Continue vs Restart** advice. Keep real observations immutable; use public RNG only inside hypothetical probability calculations, never to fabricate a user-observed Improve roll.
- The valuation must be relative to **the full actual Current build and team**. Other four Echoes, stat interactions, selected Character/weapon, source-reviewed execution context and resources can change what makes an Echo replaceable. The frontend must not compute a fixed CRIT/ATK priority list or a hidden improvement score.
- Keep the **proprietary DSP/DPS-to-improvement evaluation, dynamic ranking, stopping/Restart optimization and policy details server-side/private**. The public UI requests allowlisted bounded summaries only; no private algorithms, model internals, artifacts, debug traces or secret tokens in bundles/Actions/Pages.
- Availability is source/context-bound. If an actual selected team/gear/Character profile cannot be executed correctly, return **Pending/unsupported**, not a synthetic Character, fake numerical result or claim of live-game verification.

## Acceptance and development boundary
- **One coherent, working product flow**: actual Current + five slots + team source → private modeling and ranked affordability → select a slot → manually record a genuine +5…+25 observation → private Continue/Restart → retain a strictly better modeled candidate without modifying saved equipment or inventory.
- Public **Simulator remains functional and RNG-driven**. Implement Improve as an explicitly separate observed-data mode; reuse existing canonical data/ledger/transaction owners rather than inventing duplicates.
- A module or CLI existing does not mean the ordinary Improve UX uses it. Product review of the full end-to-end flow precedes expensive exact-head final CI. In a read-only review requested without tests, run none and trigger no Actions.
- Historical experimental source-calculator parity for released Characters does **not** mean every possible selected team/loadout is DPS-executable or gameplay-qualified. Do not claim universal coverage without actual source/context support. Public UI must show meaningful Pending and readiness.
- Separate authorized stages: finish implementation and code/UX acceptance; freeze compatible public/private heads; run mandatory final checks once; obtain distinct owner GO for private merge, public merge/Pages, and backend activation. Do not weaken safety/merge checks or promote a demo as production.
