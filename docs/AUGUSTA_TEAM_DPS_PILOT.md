# Augusta two-team damage pilot

This experimental pilot joins actual legal Echo stat cards, fixed gear/sequence presets, a continuous four-cycle standard timing/state schedule, canonical damage facts and Bellibing's existing damage kernel. It compares Augusta / Iuno / Shorekeeper with Augusta / Mortefi / Shorekeeper and reports each actor's own damage, share and DPS contribution using the **team cycle** as denominator.

It is an explicit reference scenario, not a production-ready native combat simulator. `scenarioDps` is numeric; `teamDpsReady` and `authorizesUpgradeVerdict` remain false. Public engine registration and Reference Team 01 readiness/dependencies are unchanged. The isolated Sandbox expert adapter can expose experimental comparisons; normal product DPS remains Pending.

## Controlled comparison

The generated [pilot report](../data/generated/augusta-team-pilot-report.json) contains the complete synthetic example cards, projected stats, enemy, source ER requirements, three later cycles, two Echo upgrades and per-roll marginal values. These example cards are reproducible inputs, not recommended player targets.

- Augusta and Shorekeeper use the **same builds and enemy** in both teams.
- Limited characters are S0, Mortefi S6, all skills Lv10, characters/weapons Lv90 and weapons R1. Mortefi's S6 is a bounded research scenario; broader public S3–S6 execution is not enabled.
- Gear is fixed: Augusta Thunderflare Dominion + Crown of Valor 3 / Void Thunder 2 + False Sovereign; Iuno Moongazer's Sigil + Crown 3 / Sierra Gale 2 + Lady of the Sea; Mortefi Static Mist + Moonlit Clouds 5 + Heron; Shorekeeper Stellar Symphony + Rejuvenating Glow 5 + Fallacy.
- Five exact Rank5 level25 cards in ordered 43311 slots are required. Main/substat quantities come from the existing Echo Core; fictional averaged substat rolls are rejected.
- Example enemy: DEF 1520, 10% resistance to each used element, no damage reduction. These are selected scenario parameters, not universal enemy facts. All scheduled hits land, party stays in range and shields are not broken.

Cycle 2 results for the synthetic example:

| Team | Cycle (model seconds) | Scenario DPS | Augusta contribution | Partner contribution | Shorekeeper contribution |
| --- | ---: | ---: | ---: | ---: | ---: |
| Augusta / Iuno / Shorekeeper | 27.77 | 74,217 | 56,615 | 15,787 | 1,814 |
| Augusta / Mortefi / Shorekeeper | 27.65 | 62,200 | 53,630 | 6,716 | 1,854 |

The Mortefi team is approximately 16.2% lower in this **specific** example. That is not a universal team ranking. Both Augusta's buff context and the partner's personal damage change. Other builds/sequences/enemies can produce different results. The capture completes Echo casts instead of retaining the earlier timing study's instant Echo handoffs; therefore its clock/cycle must be used for these damage sums. Do not divide by the older 26.63/25.52-second cycles.

Changing one Augusta Echo from the example's 15% Crit DMG / 7.9% ATK rolls to the actual highest legal 21% / 11.6% rolls increases team scenario DPS by about **2.50% with Iuno** and **2.71% with Mortefi**. All other cards remain unchanged. The report also tries the next legal tier of each substat separately; values depend on the current build. An already crit-capped build gains zero damage from more Crit Rate in the tested schedule. More ER can have zero direct damage value yet remain necessary for the rotation.

## Build and damage ownership

`assembleAugustaPilotBuild` projects the actual five stat cards and assembles canonical Character base, Minor Fortes, weapon core/permanent stats and the fixed preset's static Echo/set stats. Dynamic quantities remain owned by the existing Character/weapon/Sonata/Echo catalogs and canonical contract readers. The source state ledger supplies observed activation/stack/type/owner context; its numeric stat values are **not** imported as player build stats or combat bonuses.

`evaluateAugustaTeamPilot` binds source hit groups to reviewed exact action/component IDs and reads their canonical Lv10 coefficients. Conditional forms are confined to the explicitly selected source schedule rather than promoting the generic direct-hit primitive. Damage uses ATK/HP scaling, class/element bonuses, amplification, expected crit, DEF ignore, enemy DEF/resistance and reduction through the existing kernel.

Mortefi's off-field Marcato damage belongs to Mortefi and scales from **his** build. His buffs affect the intended recipients separately. Shorekeeper Discernment uses HP, Liberation classification and guaranteed crit. The source's Illation coefficient combines Heavy Illation and Basic Flare Star Butterfly damage; the binding separates them into their own canonical coefficients/classes at the model's grouped impact times. False Sovereign uses existing exact Echo attack facts. Heron's initial slam has independent mirror ATK proof; Lady of the Sea's Rank5 decomposition is checked against two guide pages, while ATK scaling is still the pinned publisher declaration and its eleven hit times remain grouped.

Canonical S5 Marcato reduction is applied to final damage instead of importing the publisher's additive -50% damage-bonus implementation. Source component grouping/cadence differences are documented in the binding review; whole-team damage parity with the external calculator is not claimed.

## State and readiness boundary

The schedule is captured from Riley Calcs commit `195a22f1b7a1b55b953224e26742b896a719e1c3`, with source-file hash checks. A read-only observer is inserted into a temporary copy of the compiled evaluator. It captures the final successful fight, discarding ER-probe/retry states, and exports hit order/times, state-source tags and source resource requirements. Source cast/stat gates must pass. No provider damage is consumed by the pilot engine; two provider damage values are kept **only** in a separate independent kernel benchmark.

Pilot assumptions and remaining requirements:

- This is a fixed publisher state schedule, not native Bellibing scheduling of resources, shield triggers, stacks, expiry, cooldowns or proc counts. Changed builds reuse it only within the supported fixed gear/sequence scope. Falling below source ER requirements returns no DPS; a slower alternative rotation is not invented.
- Wan Light at-cap refresh, shield overlap, coordinated cadence and native source resource semantics still need their own event-state verification. Source state observations do not close the existing canonical pending dependencies.
- Heron uses the publisher's +12% damage-bonus interpretation. The report includes a deliberately disabled-transfer sensitivity scenario. The general hit-armed/cast-armed transfer conflict remains pending; it is not silently resolved here.
- Echo damage may be grouped into a single model impact. The source's Illation/butterfly grouping is also a model assumption. This is not proof of animation frames or hit-weighted live-game buff uptime.
- Shared Tune Break damage is explicitly excluded from both scenarios and not assigned to Augusta or a partner. Enemy reaction/toughness, misses, interruption and survival are outside this pilot.
- The clock is source model game frames at 60 FPS excluding timestop. It must not be mixed with an unspecified-clock published timeline or labeled measured real-time gameplay DPS.

Issue #319 now prioritizes reusing this fixed source scenario for observed Echo-build comparisons rather than building a general native rotation engine. The [Sandbox adapter](ui-lab/OBSERVED_ECHO_SCENARIO.md) adds same-run experimental comparisons without changing this pilot. Qualifying numeric product rows still requires resolving the relevant fixed-scenario hit/buff/resource evidence and independent review; unsupported changes remain Pending. Native general scheduling is not the next required product deliverable.

## API and reproduction

- `evaluateAugustaTeamPilot`: selected trio/builds, enemy, cycle and explicit reference-state acceptance.
- `compareAugustaPilotTeams`: takes all four builds; shares Augusta/Shorekeeper and enemy between runs.
- `compareAugustaPilotEcho`: replaces one stat card at the same cost/equipment preset, recomputes build and all supported damage, and checks ER again.
- `analyzeAugustaPilotEchoRolls`: tries the next actual legal roll tier in the current context; no universal weights or economic upgrade verdict.

```bash
node scripts/capture-augusta-pilot-hits.mjs PINNED_COMPILED_RILEY_CHECKOUT data/source/augusta-pilot-hit-evidence-2026-10-12.json
node --experimental-strip-types scripts/generate-augusta-pilot-hits.mjs --check
node --experimental-strip-types scripts/report-augusta-team-pilot.ts --check
node --experimental-strip-types --test test/augustaTeamPilot.test.ts
```

Focused validation covers source pins, independent kernel benchmark with the provider's documented final floor, team conservation/actor ownership, actual Echo changes, crit cap, insufficient ER, conditional/HP/class bindings, fixed gear/sequence rejection and Heron sensitivity. Source replay and generated/report parity are deterministic. FULL/readiness verification is separate from this draft research pilot.
