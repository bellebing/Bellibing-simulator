# Backend product capability audit — 2026-09-13

Canonical baseline is post-PR195 main `f2f8db676ba9433d065e7b18d854e0245e77d9dd`, independently post-merge verified with851 tests, Verify1144 / Export1043 / Deploy151 and local/Export/live parity. Reproduce this audit with `node --experimental-strip-types scripts/report-backend-product-capabilities.mjs --output <report.json>`. Counts are joined from the existing database, work queue and owned-build bindings; they are not a second canonical database.

## What a product can calculate today

- 60 canonical Character identities, including57 RELEASED (Rover variants remain separate canonical identities).
- 54 released Characters have VERIFIED mechanics profiles and usable isolated direct-hit support:492 action facts at S0/max skills. Exact component, landed hits and fully assembled combat values are caller obligations. This does not mean each Character's entire kit is executable.
- 47 canonical presets/rotation records:2 ENGINE_MODELED and45 SOURCE_SEQUENCE_ONLY. The active execution review cohort is17 profiles with83 edges/72 distinct IDs; it is a subset of the45 source-only records.
- Augusta and Ciaccona have registered owned-build Personal Rotation DPS and finished Echo replacement comparison. Only those2 Characters are DPS_READY. Their locked team/equipment/context must remain intact.
- Consumers receive122 weapon identities (121 released and1 upcoming),236 weapon effect rows;181 Echo identities and66 effect rows across40 Echoes;8 attack profiles with9 isolated ACTIVE_CAST facts;34 Sonata sets and86 effect rows. Source coverage is distinct from runtime effect coverage. Known core-stat conflicts such as Abyss Surges587/588 remain unresolved.

Readiness remains43 PROFILE_COMPLETE_PENDING_FREEZE /3 CHARACTER_MECHANICS_SOURCE_BLOCKED /9 PROFILE_SOURCE_PENDING /2 DPS_READY. Queue remains24 unreviewed /24 primitive available requiring timeline /7 source conflict /11 source semantics /17 profile-specific. All six Reference Team blockers remain open.

## Product blockers

Arbitrary-team rotation/DPS needs feasible actual event/resource paths, exact duration, targets/recipients and selected teammate/equipment effect composition. The legacy Augusta parity context cannot survive arbitrary teammate replacement. Best Available Teams ultimately needs non-quickswap feasibility and global non-overlapping roster allocation; a synergy score cannot replace modeled team output.

Improve Character already compares complete Echo substitutions for the two locked DPS bindings. For most Characters, action coefficients and a hit kernel exist, but callers still have to reconstruct the Echo contribution and all other combat values. A stat-dependent teammate/passive can change when an Echo changes; reusing an old fully assembled snapshot would produce a false marginal gain. Unknown ER/resource feasibility also cannot be labeled a valid rotation upgrade.

Factory v1 provides provenance-bearing evidence/reconciliation and manual-review exceptions; it does not supply execution timing or automatically approve provider facts. The current gap is downstream calculation/context, so another provider framework is not the selected lane.

## Selected bounded lane

**Shared exact Echo-stat reconstruction and explicit same-hit Echo replacement comparison.** Reuse the existing Rank5 main-stat/substat source tables and direct-hit kernel. Reconstruct primary, automatic secondary and known substats once; never double-count supplied secondary stats. Reuse that projection inside Ciaccona's existing owned-build assembly.

The comparison's current and candidate scenarios must each carry independently qualified non-Echo context bound to that exact Echo-stat projection. Caller evidence must cover gear/Character/team effects and their build dependence; pending context produces no numerical upgrade. Neither scenario inherits an old context silently. Exact Character/action/component/hit identity is shared; no cast, target state, effect uptime, resource sufficiency or duration is inferred.

Practical reach: the54 existing isolated-hit Character consumers can compare exact Echo-card changes once the remaining combat context is proven. Ciaccona's real owned-build calculation consumes the shared reconstruction immediately. This adds no ENGINE_MODELED or DPS_READY Character and does not generalize the old Augusta fixture. A hit delta is not a full Improve Character verdict.

This is higher value than another nominal resource binding because it connects an existing broad calculation surface to owned gear changes. Full Rover/Shorekeeper/Cartethyia closure remains source/profile-evidence limited. Reference Team replacement remains blocked by its six exact dependencies; wrapping them in another context abstraction would not resolve them. UI PR196/BUG030 and preserved Flamewing work are separate.

## Source and measurement boundaries

No gameplay fact or number is re-sourced for this source-neutral reuse lane. Existing canonical tables and reviewed stat-assembly equations remain authoritative. Current/user-supplied evidence is required for effects outside Echo stat cards. No duration measurement protocol is approved; video/animation timing is not promoted. Rover initial/end observations, overflow/reset, Concerto/Energy, optional Skyfall, hit/target set and BUG012 remain pending.

The earlier profile-evidence-specific long-pass instruction is narrowed by the latest product-first capability audit. No new resource/timeline engine is needed. Final implementation, test and exact-head CI/review results will be appended after the bounded candidate is verified.

