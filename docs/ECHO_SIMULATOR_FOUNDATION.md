# Echo Simulator Foundation

Worker 12 is an OPEN / UNMERGED development candidate until merge and post-merge verification. The accepted product direction remains [Echo Simulator direction](ECHO_SIMULATOR_DIRECTION.md).

## Ownership

Improve's Current mode continues to read the existing Character-owned build and persistence. Simulate takes two detached copies: an original source snapshot (Character identity and active Echo set) and a working sandbox of the same build. The sandbox is memory-only. It introduces no storage key, migration, recovery overwrite, equipment commit or competing Character database.

The session uses slots 1–5. The UI maps its existing zero-based selected Echo index at the edge. Any slot can be selected. Each slot owns its candidate, accepted-card history and Trash Pile. The accepted Echo itself lives only in that slot of the sandbox's active set. Other sets, slots, weapon, Forte and Sequence remain part of the cloned build. Stats use the existing static projection with sandbox equipment; this is source-backed stat presentation, not usefulness evaluation.

Each candidate has a session-local unique identity, revision, actual card snapshot and detached checkpoint snapshots. Checkpoint recording consumes observed cards; it does not roll, price resources or interpret stats. Accepted/rejected dispositions are historical data supplied by an injected future adapter. Accepted history retains successive accepted cards; rejected history retains the actual card, checkpoints and short supplied reason in the corresponding slot's pile. No name-based keep/discard strategy is used.

Reset reconstructs from the original snapshot with a fresh session identity. Current/exit, Character changes, navigation away from Improve and reload discard the sandbox. Existing real Current Candidate is preserved when entering/exiting Simulate. Improve Settings display Current's inputs read-only during Simulate; return to Current to edit them.

## Evaluator and production availability

`echoSimulatorBoundary.ts` contains only Pending availability and a small disposition receipt contract. There is no action-policy taxonomy, transport implementation, evaluator endpoint, Character policy, weight or calibration. A receipt must match session, Character, build revision, selected slot, candidate identity and candidate revision. Stale/cross-slot/cross-build receipts fail closed. Identity-only cards cannot be accepted into sandbox equipment.

Production exposes Current/Simulate, free slot selection, Current simulated cards, identity/assigned-Sonata New Echo selection, five empty Trash Piles, reset/exit and truthful Evaluator Pending feedback. Selecting New Echo uses the existing source-backed chooser. There are no production roll/accept/reject controls or adapter calls. A selected candidate remains Pending until reset/exit; other slots can be explored independently.

Test/dev-only fixtures in `scripts/verify-v34-echo-simulator.mjs` inject canonical observed cards and explicit external dispositions into an isolated browser profile. They exercise accepted cards, growing piles and inspection of every actual older history. These fixtures are absent from the approved public artifact. The history/card renderer and neutral session transitions are production foundation code, usable when a real private adapter exists later.

Private Worker 8 Fas 3 is COMPLETE only for Augusta/default and Cartethyia/default under STAT_TARGET. ER/unsupported dimensions, mixed trades, cross-stat ranking and both team DPS contexts remain Pending. No evaluator HTTP route exists and production private runtime is undeployed. Thus all Characters, including these two pilots, show Pending in public Simulate. Pilot capability does not authorize a browser substitute.

## Resource and mechanics boundary

The accepted future resource names remain **Tuners | Tubes | Echoes**. Foundation shows no resource amounts or costs. It adds no Tube conversion, visible raw EXP/XP, Shell Credits resource, combined score, farming probability, completion rule or Improvement Cost. Existing Current-mode Pending presentation is preserved; simulator feedback hides the older model metrics.

Echo mechanics/data remain canonical in Echo Core and the existing Echo card/data contracts. No substat tiers, probability tables, checkpoints, main-stat progression or refunds are duplicated. Session state records observations and consumes dispositions only; it never evaluates Character Target, Every Echo or Flex Stats.

## Verification

Domain regressions cover real-build byte/semantic isolation, nested alias isolation, five independent histories, accept/reject transitions, detached observations, invalid/stale receipts, reset/close and unavailable evaluation. Generated repository-source JS is checked against TypeScript compilation. The shared Echo Workspace browser gate verifies source and built previews, physical pointer interaction, state/storage equality, arbitrary slots, accepted/rejected fixtures, actual older history inspection, stack growth, layout at 1440×900 / 1920×1080 / 2560×1440 and reset/exit/reload/Character changes. Existing Improve Settings, Current/Candidate, equipment and recovery regressions remain part of that gate.

## PM preview

The existing immutable source-preview protocol also hosts `docs/ui-prototypes/echo-simulator-review.html` at the exact PR head. This explicitly marked dev review wrapper fetches the same-head functional entrypoint and installs only an iframe-local memory storage adapter before app initialization. It seeds canonical fixture equipment, then explicit external dispositions and observed checkpoints. It starts with accepted simulated Current, a +5 New Echo, five slot piles (including a growing ×3 stack), actual inspectable history and evaluator Pending. Header controls restore Current or reconstruct the populated sandbox. The normal same-head `v34-functional.html` remains available without fixtures. Neither the wrapper nor its fixture module is copied into dist; no main deployment is required. PM approval of this actual UI preview is a separate requirement from tests/FULL CI.
