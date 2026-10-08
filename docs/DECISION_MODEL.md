# Decision runtime boundary

Improvement Cost / evaluator uses a private decision-engine contract. Proprietary policy and calibration are not part of the public repository.

Build Need, Improvement Cost and evaluator outputs remain Pending until a private runtime is available. The public UI must not approximate unavailable decisions.


The public `EchoRequirements` model also owns deterministic user acceptance, independent of the private decision runtime. `requiredOnEveryEcho` is a conjunction of individual stat/minimum pairs. Each group with explicit `minimumCount` requires that many distinct members to pass their own minimum. All groups and individual requirements must pass. The user-selected Flex group uses `id: selected-flex`; preferences retain ordering metadata rather than adding hidden requirements. A group without a count is unresolved legacy intent and returns Pending; loading or moving legacy preference rows never supplies a count. Structural persistence accepts a positive saved count even when a later move makes it infeasible, so the UI can retain and explicitly repair the user's intent.

For a valid uniquely tuned Rank-5 checkpoint, `assessEchoRequirements` counts unsatisfied Hard Requirements and missing group hits. An already rolled type cannot be rolled again, so a below-minimum Hard roll makes completion impossible. Remaining slots are 5 minus the tuned substat count. The checker enumerates distinct unrolled canonical type sets and tests each type at its highest existing canonical roll, finding the minimum number of future hits needed to satisfy the same requirements. This handles overlapping groups without double-counting a type. If no qualifying completion exists or that minimum exceeds the remaining slots, the final target is Impossible; otherwise it is Still Possible (or Satisfied when no future hits are needed). `acceptsFinalEcho` requires a valid +25 Echo and all requirements satisfied. Invalid checkpoints and unresolved legacy groups fail closed.

This establishes only exact final acceptance and existential slot feasibility. It says nothing about Temporary-build usefulness, continuation/discard economics, RNG, resource spending, DPS or private optimization. Build Need, Improvement Cost and evaluator readiness remain Pending.
