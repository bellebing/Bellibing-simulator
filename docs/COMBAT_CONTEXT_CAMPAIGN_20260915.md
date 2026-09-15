# Source-qualified combat context campaign

Base: verified post-PR197 main `3ce9b150a7a5b1f4bc8947f74411d6df9ac859bf`. Candidate: draft [PR198](https://github.com/bellebing/Bellibing-simulator/pull/198), `codex/source-qualified-combat-context-2026-09-15`. No merge authorized.

## Product baseline and first ranking

57 released Characters; 54 have 492 isolated direct-hit facts and exact Echo-card comparison. 47 presets contain two ENGINE_MODELED rotations and 45 source sequences. Only Augusta/Ciaccona are DPS_READY. Queue: 83 open edges / 72 IDs, partition 24/24/7/11/17; readiness 43/3/9/2. All six Reference Team blockers remain open.

Generate the deterministic inventory with `node --experimental-strip-types scripts/report-combat-context-coverage.mjs --output <report.json>`. It joins all 54 hit Characters to existing facts, presets, equipment, team identities, primitive support and exact execution dependencies. It copies no canonical gameplay amounts. A missing effect row is not proof of absence. S6 source presets are explicitly outside the existing S0 hit contract; their equipment recommendations do not authorize S6 execution.

| Rank | Existing source family | Character / preset discovery reach | Reason |
| --- | --- | --- | --- |
| 1 | Character base/Minor Fortes and compatible weapon core | 54 Characters | Remove repeated stat arithmetic for every current hit path; disputed Abyss Surges remains excluded. |
| 2 | Permanent weapon effects | 39 / 41 | Rank values and unconditional self contracts already exist. |
| 3 | Static Sonata effects | 42 / 44 | Existing equipped-set facts; actual membership must still be explicit. |
| 4 | Main-slot static Echo effects | 21 / 21 | Exact species/wielder contracts; specialized pending branches remain separate. |
| 5 | Existing weapon cast/damage/heal effects | 20 / 20 | Reuse actual event primitives without creating triggers or uptime. |

These counts measure discovery, not complete context assembly. Baseline capability ladder by Character identity: L0 60, L1 54, L2 54, L3–L7 two each. Partial static assembly must be reported separately from a complete L3 context. Existing engine availability is not new dependency closure.

## Contract and parked work

The new consumer must independently rebuild current/candidate stats, preserve the exact hit/component/count/element/equipment identity, and retain every unassembled contribution as a named caller obligation. Missing context produces PENDING without damage. Static source values cannot establish conditional uptime. Build-dependent effects require fresh per-build proof. A hit delta is not a whole-build upgrade or rotation DPS.

Parked without new evidence: S03/S10 lifecycle; Heron conflict; Fallacy variant; Defier's Thorn timing; Mourning Aix semantics; Denia/Moth scaling; Voidwing hit occurrence; Abyss Surges core-stat conflict. No Reference Team constant or resource/denominator assumption is changed. UI PR196, BUG-030 and root Flamewing WIP remain separate.

## Checkpoints

- Discovery: first inventory reproduces 54/492, 47 presets and all 83/72 open dependencies. Status reconciliation is published on the candidate branch. Runtime assembly and its gates are still in progress.
- Base/core slice: `assembleCharacterHitContext` reads level-90 Character/scaling, max Minor Fortes and compatible level-90 weapon stats; `compareCharacterHitWithAssembledContext` supplies both independently assembled builds to the existing PR197 comparison. All 54 current hit Characters are exercised. Each unassembled context scope requires fresh explicit per-build evidence; missing state returns PENDING without damage. Abyss Surges remains source-blocked regardless of passive coverage.
- Permanent weapon slice: 60 canonical permanent SELF stat effects have identity-only discovery. The assembler applies supported selected-weapon R1–R5 values once; all conditional branches stay in the requirement manifest. Tests exercise every available compatible weapon/rank, source drift, stale evidence, omitted values and existing Ciaccona/Augusta paths. Partial contributions advance all 54 hit consumers but do not claim 54 complete L3 contexts. Full checkpoint follows; static Sonata/main-Echo families remain the next safe candidates.
- First full checkpoint at `5ac1a558ed3992f21f7795a616006013a512dead`: 872/872 tests, all nine audits, strict build and whitespace PASS. [Verify1154](https://github.com/bellebing/Bellibing-simulator/actions/runs/34927216720) and [Export1053](https://github.com/bellebing/Bellibing-simulator/actions/runs/34927216666) SUCCESS. Logs retain full tests and real Chrome evidence. Re-ranking keeps static Sonata and main-Echo ahead of conditional timeline work. No exact profile dependency closes: static stat arithmetic does not establish event/resource/recipient/denominator proof.
- Static Sonata slice: 30 source-defined permanent stat effects compose from an explicit five-slot species/set assignment; current/candidate retain those identities. The supported subset requires distinct species and validates canonical membership/COST, without claiming duplicate-species legality or counting semantics. Activated source-conflicted/specialized and conditional branches remain named requirements. Coordinated Attack DMG stays outside the ordinary hit taxonomy. Missing equipment remains PENDING; no recommended set is silently equipped.
