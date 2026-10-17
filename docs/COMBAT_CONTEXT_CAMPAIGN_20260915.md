# Source-qualified combat context — public integration boundary

This document summarizes the public source/execution contract established during the September 2026 combat-context work. It is **not** an active work plan or a substitute for the current [project status](PROJECT_STATUS.md), code, source reviews, and generated inventories.

## Public source and reproducibility

The public `src/data/` and `src/combat/` layers own reviewed Wuthering Waves facts and general combat calculations. `src/profileExecutionWorkQueue.ts` owns the execution dependency inventory; profile and team reference coverage must be derived from the current registries.

Regenerate the source-qualified coverage report using:

```sh
node --experimental-strip-types scripts/report-combat-context-coverage.mjs --output <report.json>
```

The report joins direct-hit facts, available effects, build profiles, rotation references, equipment and outstanding execution dependencies. Its counts are **diagnostics**, not evidence of an executable DPS profile or account-level upgrade recommendation. Older September counts and review checkpoints are historical snapshots, not current source authority.

## Damage context / provenance contract

Source-backed effects and caller-supplied events must be kept separate:

- `assembleCharacterHitContext()` may derive supported source quantities from canonical game data and an explicitly supplied build/context. It must retain every unresolved contribution as a named requirement.
- `RemainingHitContext` with `CALLER_QUALIFIED` evidence describes assertions by a caller; an evidence identifier alone is **not** independent numeric source proof. The assembly key, applicable equipment/build and each residual must be qualified.
- `EchoBuildHitContext` and `compareCharacterHitEchoReplacement()` are only valid within their exact qualified hit/owner/target/equipment context. Each compared build must recompute its own source-dependent contributions.
- A hit comparison is **not** a verified complete rotation, whole-team DPS measurement or an upgrade verdict. No missing effect is assumed absent. Unknown effects, occurrence, stack history, recipient, timing, resources or denominator remain **PENDING/UNKNOWN**.

Actual trigger occurrence and overlap require source-qualified events and a supported timeline; an isolated primitive cannot infer uptime or turn a source-only sequence into `ENGINE_MODELED` execution. Generic [damage/execution readiness](DPS_EXECUTION_GAP_MATRIX.md) remains separately gated.

## Source/verification boundaries retained

The integrated [combat-context work in PR #198](https://github.com/bellebing/Bellibing-simulator/pull/198) recorded a bounded September 2026 review. Its archived checkpoint counts and historical tests do not override new code, later source evidence or today's [project status](PROJECT_STATUS.md).

Missing or disputed mechanical facts must not be manufactured to achieve a ready state. Existing public source/effect ownership, hit/component identities, game provenance, independent tests and review audits remain authoritative. This documentation change does not change their implementation or claim new DPS readiness.
