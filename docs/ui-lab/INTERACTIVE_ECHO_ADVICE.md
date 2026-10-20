# Interactive Echo advice — local Improve review

## Run and use

Start the existing local launcher with both repositories available (`START_BELLIBING_LOCAL.bat` on Windows, or `node scripts/start-bellibing-local.mjs`). The private repository must contain the advisor stdio entry. Open Improve, select a saved Character and an active equipped Echo slot, and configure an explicit supported Echo target and Gate. The selected source-valid species, Sonata, cost and main stat define the fresh replacement template.

SIMULATE reveals exactly one canonical substat at +5, +10, +15, +20 and +25. The compact panel below it offers **DISCARD** (archive the current simulated Echo and reveal a fresh +5) and **CONTINUE** (one more checkpoint). Green marks the lower expected Tuner cost; its intensity follows the relative saving. The separate percentage-point difference describes attempt odds, which need not favor the cheaper action. Before the configured Gate the panel shows the Gate rather than a stopping recommendation.

At +25, TARGET MET means the configured **Echo** requirements were met, not that the Character improved. Full Build opens the existing Current/Expected/Candidate stats projection. Expected build stats/DPS are not synthesized. Equipped Echoes remain accessible in a collapsible section; narrow screens focus the upgrading Single Echo and show the completed result afterward.

## Meaning of the numbers

Both chances refer to **one attempt**, following the same configured Gate policy after the next checkpoint. CONTINUE starts with the already observed substats; DISCARD starts fresh. Both costs mean **expected future gross Tuners until the first target +25, including failed replacements**, excluding already spent Tuners. The recommendation compares those costs, not chance alone. A terminal failed Echo cannot continue; an impossible or unsupported target has no fabricated finite expectation.

XP is assumed sufficient. These are unconstrained replacement expectations, not finite-budget success probabilities. Actual interactive spending respects the selected finite Tuner/Echo limits, or Unlimited, without changing the shared inventory. Tube transactions, recovery/refunds, acquisition/farming costs and globally optimal finite-resource advice remain Pending.

## Context and ownership

Gate, minima, Hard/Flex selections/counts and resource changes recompute advice from the same observed rolls. They do not call RNG. Owner/build/Character/slot changes retire the session; aborted or superseded responses cannot restore old advice. One advisor session owns one selected slot. Other legitimate Candidate slots remain reviewable. Reset clears the detached session; Abort freezes it until Reset. Export downloads its observations, context and spend locally.

No action equips an Echo, spends account inventory or edits real Current. The canonical character-free RNG is reused unchanged. The private analytical model runs only in a bounded same-origin loopback Node child, with existing Host/Origin/request bounds and cancellation. The browser receives an allowlisted aggregate result; no private model, policy, cache, fixtures or Worker bundle is distributed. Static/Pages builds without that local endpoint retain their existing behavior and do not display fabricated advice.

## Supported and Pending

Explicit feasible canonical rank-5 Echo Hard/Flex targets, exact minimum tiers and explicit Flex counts use the existing model. Missing account/template facts, inactive slots, invalid/count-less goals, whole-build ER constraints, search limits and unavailable local math remain Pending. This does not establish roster-wide Recommended requirements, Character upgrade utility, DPS qualification or automatic whole-build optimization. BUG-042 remains open.

## Verification

Focused public session/transport/launcher/Candidate tests cover real canonical reveals, finite limits, owner isolation, abort/reset and stale responses. Strict build and canonical source parity remain mandatory. Private tests independently certify the Gate-constrained fixed point, preserve historical Gate-5 parity and cover weighted minima and explicit Flex counts. A private real-Chromium runner exercises desktop/mobile checkpoints, Gate/minimum edits without rerolls, +25 success/failure, full-build projection, Discard, Export, Abort, Reset and unchanged account bytes. Private fixtures and screenshots stay private and ignored; exact-head CI evidence belongs on the Draft PRs.
