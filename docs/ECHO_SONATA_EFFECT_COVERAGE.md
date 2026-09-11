# Echo / Sonata effect coverage inventory

Integration status: PR #190 is now merged/deployed through `c37b3ea5c0833f0483e2da2ac9cca36d42e1902f`; Verify #1102 / Export #1001 / Deploy #147 passed. References below to its unmerged/draft state are historical checkpoints. Its canonical gear/capability payload is now on main. New reuse-first work is on a separate branch and has no merge authorization.

PR #190 is merged. PR #191 feature scope is frozen for integration review. The [integration and reuse-first audit](PR190_INTEGRATION_AND_REUSE_AUDIT_20260910.md) records exact committed coverage and provider trust boundaries; local uncommitted Flamewing intersection work is excluded. Canonical values are reused downstream, with new source review only for actual drift, conflicts or uncovered semantics.

PR #190 adds `sonata-explicit-target-attack-window-v1` for existing source-reviewed S11_5PC_SPECTRO and S17_5PC_CR/AERO. Exact equipment and an actual source-qualified attack/hit require target state observed at the event time explicitly before the trigger. Existing Zani Heliacal equivalence is accepted only for Eternal Radiance stack counts, never S11_5PC_CR infliction. Values, source review totals and source statuses are unchanged; capability metadata joins canonical effects through `gear.sonataTargetWindows`. Zani's target-stack edge remains pending with primitive availability; no profile/Reference Team timeline is created.

This document starts **after** the Version 3.6 raw Echo/Sonata roster audit. Raw identity/catalog coverage and combat-effect coverage remain separate layers.

Do not read raw Sonata membership or raw Echo identity as proof that Bellibing can execute the corresponding combat effect.

## Raw foundation

Current source-reviewed Version 3.6 raw coverage:

- 181 / 181 released Echoes are `VERIFIED CURRENT` at the raw identity/COST/Sonata-membership projection.
- 34 / 34 released Sonata sets are `VERIFIED CURRENT` at the raw identity/activation/raw-description projection.
- 0 stale/wrong records.
- 0 missing records.
- 0 source conflicts.
- 0 extra/obsolete records.

`npm run audit:echo-raw` is the executable source-facing gate. Raw verification stops at this boundary.

## Sonata Effects — source review complete, execution intentionally partial

The roster-wide source-review checkpoint was DommyMM/wuwabuild commit `5fa70b11f1d84fb644e4dbed47873708da0fe66f`; that is historical provenance, not a claim about current upstream main. PR #190 subsequently reconciled the unchanged-value Sonata-35 raw duration-unit text against `8d8cbdee3ff14a0a384102e1771b4af96ac1d69f`. The source audits remain authoritative for current raw parity.

Current roster-wide Sonata effect coverage:

- **34 / 34 released Sonata sets source-reviewed.**
- **62 / 62 released activation tuples source-reviewed**, including the current 1-piece activation shape.
- **86 source-backed stat/effect rows** in `src/data/sonataEffects.ts`.
- **58 activation tuples `MODELED`.**
- **2 activation tuples `SOURCE_CONFLICT`.**
- **1 activation tuple `MODELED_WITH_PENDING_DAMAGE_ADAPTER`.**
- **1 activation tuple `MODELED_WITH_PENDING_STATE_ADAPTER`.**
- **0 unreviewed released activation tuples.**

`npm run audit:sonata-effects` is the fail-closed coverage gate. It validates every released raw activation against exactly one source-review disposition and checks the expected modeled-row count for that activation. The gate runs in Verify, Export and Deploy.

### Explicit unresolved Sonata dispositions

| Sonata activation | Disposition | Source-backed boundary |
| --- | --- | --- |
| Freezing Frost 5pc (`sonata-1`) | `SOURCE_CONFLICT` | Rendered English says +10% Glacio DMG per Basic/Heavy trigger, max 3 stacks for 15s; `effectDescriptionParam` exposes `30%`, `15` without the same per-stack shape. No value/stack interpretation is guessed. |
| Havoc Eclipse 5pc (`sonata-6`) | `SOURCE_CONFLICT` | Rendered English says +7.5% Havoc DMG per Basic/Heavy trigger, max 4 stacks for 15s; parameters say `6%`, `5`, `15`. No branch is promoted until source evidence resolves the contradiction. |
| Midnight Veil 5pc (`sonata-12`) | `MODELED_WITH_PENDING_DAMAGE_ADAPTER` | Incoming +15% Havoc DMG for 15s is modeled. The same Outro activation also deals 480% Havoc DMG around the caster and classifies it as Outro Skill DMG; that exact damage event remains outside the stat-effect layer. |
| Wishes of Quiet Snowfall 5pc (`sonata-30`) | `MODELED_WITH_PENDING_STATE_ADAPTER` | Source-explicit Glacio/CRIT/incoming bonuses are modeled. Snowfall removal arbitration and the Liberation CRIT-duration extension rule require a state adapter before execution. |

Two additional upstream discrepancies are documented without inventing semantics:

- Dream of the Lost 3pc (`sonata-19`): rendered effect text is character-agnostic while upstream `displayBonuses` carries separate `requires` metadata. Bellibing models the rendered effect literally and does not silently create a Character restriction.
- Shadow of Shattered Dreams 1pc (`sonata-32`): rendered text/used placeholders give +35% Basic Attack DMG and +35% Heavy Attack DMG for 15s after Hack - Shifting; an unused 15% parameter is retained as discrepancy evidence, not assigned a made-up effect.

### What “MODELED” means here

A `SonataEffectModel` is a **source-audited fact record**, not an automatic uptime promise. It may contain:

- pure permanent stats;
- event trigger + duration;
- stack cap / interval when explicitly stated;
- self, team, active-Resonator or incoming-Resonator scope;
- scaling input and cap;
- state-bound conditions with no invented fixed duration.

Rotation, trigger occurrence, stack acquisition, refresh timing, current target state and Character/team execution still belong to later adapters/profiles. A source-reviewed set therefore must not be treated as 100% active by default.

### 2026-09-09 Sonata damage-event windows

Four existing effects now have explicit event execution on PR #190: `S22_3PC_HEAVY_CR`, `S22_3PC_ECHO_CR`, `S29_5PC_ECHO_CR`, `S29_5PC_AERO`. Their canonical source statements and parameters were read from the previously reviewed pinned Fetters file; no new source values were imported. The existing Galbrena and Sigrika loadouts can reuse these facts through the same qualified damage/owner/query boundary as weapon windows. Exact equipped set/piece count is required.

Backward impact: source models, effects, recommendations and existing engines are unchanged. One source-qualified event creates a separate window with source duration; no same-hit benefit or refresh/overlap policy is assumed. Regression tests compose independently scoped weapon amplification and Sonata Echo crit with explicit Echo-hit arithmetic. Flamewing's joint-state Fusion bonus, Luuk's stack lifecycle and all profile dependencies remain outside this implementation. The database exposes canonical-linked support metadata without copying numeric facts.

### 2026-09-09 Sonata raw-text refresh

Verify #1093 / Export #992 correctly detected live upstream drift in `sonata-35` (Lamp of Nether Road). A comparison of all 34 Sonata English identity/piece-text/parameter projections against the reviewed `5fa70b11` checkpoint found one change: the 5pc description now includes `s` after its duration placeholder. The parameters, activation counts and modeled effect values are unchanged. The exact fetched `8d8cbdee3ff14a0a384102e1771b4af96ac1d69f` Fetters file matches Git blob `b441635dde76ba117eb015ae0eeb43bdabb266e7`.

Only this raw description and its own provenance are refreshed; the broader raw snapshot identity is retained. Backward impact: no combat/model, profile, recommendation, pending dependency or readiness change. The existing source-modeled five-second CRIT stack duration is preserved; stack refresh/overlap is not newly authorized. The live raw-coverage gate remains enabled and continues comparing all current upstream fields. No source-conflict exception or gate bypass was added.

## Echo Skills — source review complete, execution intentionally partial

The roster-wide Echo skill audit uses `DommyMM/wuwabuild/public/Data/Echoes.json` at exact commit `5fa70b11f1d84fb644e4dbed47873708da0fe66f` / Git blob `cca1563ce0491a3de80ac7359344112631329224`.

Current source coverage:

- **181 / 181 released Echo skill records source-reviewed.**
- **181 / 181 have non-empty rendered English skill descriptions.**
- **181 / 181 expose five rank parameter rows.**
- **181 / 181 expose a rendered cooldown placeholder that resolves to an exact Rank-5 cooldown.**
- Rank-5 cooldown distribution: **69 × 8s, 1 × 12s, 56 × 15s, 43 × 20s, 12 × 25s.**
- **170** source descriptions contain damage text; **11** are no-damage utility/heal/control descriptions.
- **36** rendered descriptions contain main-slot behavior.
- Upstream structured `bonuses`: **35 Echoes / 58 rows**, including **3 character-condition rows**.
- The upstream Echo skill object exposes **0 dedicated skill-name fields**. Bellibing therefore keeps the stable Echo/source identity and rendered source text instead of inventing a separate skill name.
- **3 rendered/source-parameter discrepancies** are retained explicitly: Reactor Husk leaves rank parameters 2 and 3 unused; Dwarf Cassowary and Nightmare: Dwarf Cassowary each leave parameter 3 unused.

`npm run audit:echo-skills` is fail-closed. It fetches the exact pinned source, validates the Git blob SHA, cross-checks all 181 source IDs/names against the Bellibing raw catalog, verifies the source-structure counts above, validates the exact cooldown distribution and discrepancy list, and then validates the modeled/pending execution boundaries. The gate runs in Verify, Export and Deploy.

### Echo Effects — current executable/source-safe slice

`src/data/echoEffects.ts` now contains **66 modeled non-damage effect rows across 40 Echoes** on PR #191. Main through merged #190 has 65 rows / 39 Echoes. The new row is Voidwing Moth's source-reviewed Rank-5 use-to-Outro ATK transfer; its press/hold damage remains unmodeled.

The expansion is deliberately conservative:

- source-explicit permanent main-slot bonuses are modeled where their behavior is stable;
- four clear permanent main-slot facts that exist only in rendered English skill text are also modeled: Hecate Coordinated Attack DMG +40%, Nameless Explorer Echo Skill DMG +20%, Nightmare: Hecate Echo Skill DMG +20%, and Nightmare: Lampylumen Myriad Coordinated Attack DMG +30%;
- the existing Fallacy cast buffs and Denia/Hyvatia transfer-window effects remain trigger-aware and are not converted to automatic uptime;
- Voidwing Moth reuses the transfer core with an exact `ECHO_SKILL_USE` arm event, Rank 5, caller-proven absence of an earlier active transfer and explicit same-time Echo/Outro order. Its canonical ATK amount and two durations are read from the effect row. It gains no fabricated damage/Intro prerequisite or early switch-out removal. `gear.echoTransferWindows` exposes capability references for all three distinct transfer contracts. Integration review additionally locks Voidwing caller catalogs to one unambiguous ATK row with reviewed provenance and no unreviewed wielder restriction; source amounts remain canonical;
- The False Sovereign and Thousand-Puppet Pavilion retain `ALREADY_MODELED_UPSTREAM` protection so existing parity paths do not double count them.

Source-explicit facts that the current effect domain cannot represent safely remain pending rather than being flattened:

1. Twin Nova: Collapsar Blade — main-slot Electro bonus becomes Spectro when Twin Nova: Nebulous Cannon occupies another slot.
2. Calamity Effigy — extra +10% Aero DMG for 15s after inflicting Tune Strain - Shifting.
3. Nightmare: Crownless — its own Echo Skill DMG +20% for 2s after hit, non-stacking.
4. Nightmare: Mourning Aix — +100% damage against Spectro-Frazzle targets, whose exact affected damage scope must not be guessed.

Those four facts live in `ECHO_SKILL_PENDING_ADAPTER_FACTS` with explicit adapter-boundary reasons. The static character-restriction family now covers all three existing structured source rows through `echo-character-restriction-v1`: Fleurdelys (Rover Aero/Cartethyia), Adam Smasher (Lucy/Rebecca +15% CRIT Rate), and Sigillum (Aemeath +25% Liberation bonus).

### 2026-09-08 static restriction migration and backward impact

The Adam Smasher and Sigillum facts were already source-verified pending rows. The same pinned source blob was fetched and hash-verified again; structured conditions, English main-slot text and every rank's parameter agree. They now use the existing `wielderCharacterIds` gate without Character-specific runtime code, new timing or active-attack assumptions. The normal source audit directly binds all three modeled restriction rows to exact source values and condition tokens.

Backward-impact disposition: **IMPACT_FOUND** for static main-Echo resolution of existing `lucy-standard` and `aemeath-standard` presets. Recommendations, stat targets, rankings and rotations remain unchanged because this implements their existing selected equipment. Rebecca is eligible when actually equipping Adam Smasher, but her current `rebecca-standard` preset selects Bell-Borne; no Adam Smasher bonus or recommendation leaks into it. All other roster identities are excluded by regression tests. Replacing the selected Echo removes the bonus without mutating canonical selections.

The existing Augusta/Ciaccona evaluators, profile readiness and all 83 exact profile execution edges are unchanged. The six Reference Team blockers are unchanged. Only two Echo fact-level pending migrations close (6 → 4); no full Character/Team DPS approval follows. Adam Smasher active variants and Sigillum active-attack scaling remain outside this static effect slice. Targeted tests, pinned-source audit, all 747 tests and strict build pass; exact branch/CI evidence lives in PR #190 and Handoff.

### Echo Attacks — exact executable facts only

The PR #191 reuse-first lane exposes **8 exact Rank-5 attack profiles / 10 attack facts** in `src/data/echoAttacks.ts`. Nine facts are ACTIVE_CAST and one is INTRO_AUTO_SUMMON. Five profiles / six facts were already integrated through #189:

- The False Sovereign — verified 55.35% ×4 Electro active spin plus 405% Electro Intro auto-summon, with existing charge/cooldown parity.
- Bell-Borne Geochelone — source-explicit 145.92% DEF-scaled Glacio protection blast with 20s cooldown.
- Fallacy of No Return — one 15.86% HP-scaled Spectro normal activation blast; hold/release is excluded.
- Nightmare: Thundering Mephis — one 405% ATK Electro active hit, 25s cooldown.
- Reminiscence: Fleurdelys — 27.36% ATK Aero ×8 plus 136.80% ATK Aero ×1, 20s cooldown.

The supplemental 2026-09-10 review adds Lorelei and Nightmare: Lampylumen Myriad. Each source's Echo Skill description and single Echo damage entry agree on one active component; the damage table explicitly supplies Base Attribute ATK. Lorelei has 405% Havoc with 25s cooldown ([damage entry 1](https://wuthering.wiki/monster_330000110.html)); Nightmare: Lampylumen has 273.60% Glacio with 20s cooldown ([damage entry 1](https://wuthering.wiki/monster_340000130.html)). These are exact Echo identities; ordinary/Phantom alternatives are not inferred. No monster stat table or resource column is imported. Canonical attack provenance owns this supplemental review separately from the unchanged pinned roster inventory.

Existing `echo-active-explicit-hit-v1`, whole-action reader and damage kernel consume these facts without runtime changes. Database facts/support are derived through their existing projections. The Cantarella and Zhezhi preset edges become primitive-available/requires-timeline; all 83 edges remain pending. Explicit attack/rank/component/landed count and complete combat context remain mandatory. Main-slot buffs remain exclusively in the effect layer.

Bell-Borne's 15s shield, 50% DMG Reduction, 10% DMG Boost and three-hit removal rule are **not** flattened into the attack model; they require shield/state execution semantics.

The [current cohort and closure review](PR191_EXECUTION_CLOSURE_REVIEW_20260910.md) adds Sentry Construct's separate normal-strike and charged-dive facts. Both use explicit ATK/Glacio source entries and the existing hit primitive; they are alternative attacks, never two components automatically landed in one cast. Capacitor/reset/freeze mechanics and profile variant occurrence remain unmodeled. Reminiscence: Denia, Voidwing Moth and Nightmare: Mourning Aix attack promotion is parked with exact scaling/variant/target gaps recorded in that review.

### 2026-09-09 explicit active-hit execution and backward impact

Merged PR #190 added `echo-active-explicit-hit-v1` over the five existing ACTIVE_CAST facts. Exact Echo/attack/Rank-5 identity, coefficient component and landed-hit count are mandatory, together with a caller-proven combat snapshot bound to the source element, scaling stat and ECHO damage scope. The existing ATK/HP/DEF snapshot validator and damage kernel are reused. Canonical numeric facts stay in `echoAttacks.ts`; the Character database exports only support identities/tags alongside those facts.

Backward-impact disposition: no existing profile engine, source fact, readiness status or pending ID changes. Full-component arithmetic agrees with the existing whole-action reader when the test explicitly lands every source hit. Partial/missed hits, separate component snapshots, HP/DEF binding, incomplete input, wrong rank/identity and excluded Intro/hold variants are covered. All 768 tests and strict build pass locally. This cannot resolve BUG-010's missing Fallacy profile variant, infer cast timing or close any Reference Team dependency. Exact remote verification belongs in PR #190 and Handoff.

The other damage descriptions are source-reviewed but are not automatically converted into `EchoAttackProfile` rows. In particular, most rendered source text gives a damage percentage without explicitly stating the scaling stat, and several Echoes have hold/press, counter, summon-duration, loadout, form, target-state or repeated-hit semantics. Bellibing does not silently assume ATK scaling or maximal hit counts.

### What “source review complete” means for Echoes

The roster-wide source inventory is complete. Executable combat modeling is not.

This checkpoint proves that every current released Echo has been inspected against the same pinned source and that Bellibing knows which source structure is available. It does **not** claim that all 170 damage-text Echoes have executable DPS adapters. Profiles/preflight must request only facts that are actually modeled, and any supported path that needs a pending Echo mechanic must add and verify the specialized adapter first.

## Pre-DPS sequencing

The active order is now:

1. **Echo/Sonata raw roster audit — complete for Version 3.6.**
2. **Sonata effect source coverage — complete with explicit source conflicts / specialized-adapter dispositions.**
3. **Echo active-skill/effect/attack source coverage — complete; execution intentionally partial with explicit pending-adapter boundaries.**
4. **Complete/populate composable Character/build/team/rotation profiles — next after merge/status sync.**
5. Freeze/preflight the full Pre-DPS foundation, adding any specialized Sonata/Echo adapters required by supported DPS paths.
6. Begin Character DPS character-by-character only after the above gates pass.

Characters that remain source-blocked or fail later preflight remain excluded from Character DPS adapters.
