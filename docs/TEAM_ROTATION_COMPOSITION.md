# Team rotation composition

A team change resolves a new composition context, source rotation modules, a whole-team timed scenario and a partial canonical combat-event preparation. Existing engine registrations and DPS readiness remain unchanged. This is a backend/reference-data contract; no simulator UI or full team DPS is enabled.

## Selection and evidence

`findTeamCompositionContexts({characterIds, anchorCharacterId?})` finds the exact trio. Multiple mode contexts remain separate. `findTeamRotationReplacements(contextId, outgoingCharacterId)` finds reviewed one-slot substitutions while retaining the carry and the other partner. Relationship (source BiS/core/alternative), accessibility and sustain conditions come from the existing composition catalog; no damage rank is invented. The unranked publisher discovery pool is opt-in.

`describeTeamCompositionContext(contextId)` links all three members to eligible Prydwen references and available timing modules. Prydwen remains the guide/context source. Unclassified guide mode labels retain member guidance with an explicit review flag; they do not silently become verified mode matches. A timing module’s known semantic mode selects its corresponding reference, and differences from the composition guide are reported (for example Iuno hybrid → semi-DPS in the Augusta model). Related calculator modules are **not** relabelled as Prydwen's exact action sequence. Their module export, source file, mode, carry role, selected sequence/gear, resource requirements and source origin are exposed for variant review.

`composeTeamRotation` requires an exact trio, an explicit model ID, cycle 1–4 and `acceptModelVariant: true`. This flag accepts a declared research scenario; it grants no verification or DPS readiness. Named mode conflicts fail closed, including explicit caller `modeKeys` that conflict with the selected context. Changing a member requires selecting a new context and model; old timestamps and buff recipients cannot carry into the new party.

## Timing construction

The source pin is Riley Calcs `195a22f1b7a1b55b953224e26742b896a719e1c3`. The capture verifies the source-file hashes from the earlier timing evidence. It replays four continuous cycles (opener + three later cycles), completing cancelled actions as in the earlier timing research. Ordinary handoffs and kit-native repeated visits remain. Source model game frames at 60 FPS **exclude timestop**; these are not measured real-time gameplay seconds and must not be combined with ArabWuwa's unspecified clock.

Published trios retain their source ordering and modules. For a missing guide trio, the capture may compose a declared **new module variant** using source-declared member modules in support → partner → carry order, selecting matching named modes and source carry roles. That ordering is a modeling choice, not a published exact trio. The whole new team is replayed: personal field budgets are never simply transplanted or added together. Unsupported lead/no-Intro/double-Intro chains and unmet cast/stat requirements stay blocked.

Build choices start at the first source weapon/Echo/mainstat, R1, S0 five-stars and S6 four-stars/alternate Rovers. Havoc Rover uses the previously documented S2 variant and omits the cooldown-blocked final Wingblade. Where the first mainstat cannot meet ER, the capture tries up to eight source-declared ER mainstats in source order, retaining the first that resolves that member's shortage; this is not DPS optimization. Both the final build and fallback choice are preserved. A separately labeled higher-sequence variant uses the source-required Jianxin S2 / Roccia S6; blocked S0 records remain visible.

The source solver allocates ER substat tiers. The artifact records worn ER, largest required ER, required ER rolls and source stat shortfalls. A timing template therefore does not automatically describe a player's gear. Weapons, sets and sequences can change resource generation and timing as well as damage. Revalidation is required when these assumptions change.

Visits cover the complete cycle including waits and the closing Intro credited to the ending cycle. Each active action retains its model start time. Event capture uses the provider's explicit `Cast` classification (Lib 4 / Intro 5 / Outro 6), deduplicates trace snapshots by sequence and excludes damage-only Outro/Lib ticks. These action starts are **not** damage-hit timestamps.

## Buff and combat preparation

`prepareTeamRotationScenario` replays event history from the opener through the selected cycle, including prior-cycle buffs and recipient switch-outs. It uses the existing canonical adapters rather than duplicating buff amounts/durations:

- Shorekeeper S0 Stellarealm: Liberation activation, Intro stage changes, expiry and Discernment removal. Explicit in-range and ER sample assumptions are required. An incompatible history or missing sample returns unknown coverage, never a fabricated zero.
- Shorekeeper Binary Butterfly: canonical team scope/window.
- Iuno From Gloom to Gleam: canonical Heavy Attack transfer with recipient ownership and switch-out removal.
- Other already-supported Character Outros: exact normalized provider/canonical ability-name match, a unique same-time incoming Intro, and the existing transfer contract. Unknown repeated-activation semantics require proof that the previous activation has ended.

It splits member visits at event times, buff expiry and switch-outs and exposes interval snapshots. The catalog anchor is the character whose options are being explored; it can have a hybrid/support role. Coordination uses the provider modules’ declared damage roles, and `anchorCoverage` reports that character’s field coverage. Bound windows use absolute fight time; displayed visits use cycle-relative time with an explicit origin. Half-open lifetimes come from the existing primitives. Coverage measures field time, **not damage-weighted buff coverage**. Waits remain in field time.

Shield/stacks (including Iuno Wan Light), other passives, weapon/sonata/Echo effects and damage-hit bindings remain explicit pending work. Unknown effects are not asserted absent. The output includes unbound action starts and canonical prepared windows for future combat-state integration, with `teamDpsReady: false`, `rotationDps: null` and no upgrade verdict.

## Augusta example

The generated report compares Augusta / Iuno / Shorekeeper with Augusta / Mortefi / Shorekeeper on cycle 2 of the same model clock. Assumptions for the buff query are in-range Intros/member presence and a constant 250% Shorekeeper ER sample. These are declared scenario assumptions, not observations of live gameplay.

| Scenario | Partner field time | Augusta field time | Cycle | Augusta Supernal coverage |
| --- | ---: | ---: | ---: | ---: |
| Iuno | 8.93 s | 12.77 s | 26.63 s | 12.77 s |
| Mortefi | 7.82 s | 12.77 s | 25.52 s | 12.77 s |

The cycle becomes 1.12 model seconds shorter; Augusta does not gain additional buffed field time because both scenarios already cover her entire visit. The prepared Heavy Attack amplification changes from Iuno's canonical 50% transfer to Mortefi's 38% transfer. Iuno's other benefits and Mortefi's coordinated attacks/S6/weapon effects need their own events before a damage comparison. The earlier ArabWuwa Augusta timing uses another clock/build/sequence and is not substituted into this comparison.

## Coverage and reproduction

See [the generated coverage/comparison report](../data/generated/team-rotation-composition-report.json) for every reviewed context, missing timing modules, rejected models, source requirements and the concrete swap. All 390 guide contexts have a resolver/coverage record: 277 have an available timing variant, 84 lack source modules, and 29 are blocked for the chosen source build/chain/mode. The artifact contains 714 whole-team records (646 without source cast/stat/chain blockers), including separately declared composed and higher-sequence variants. Available timing variants are **not** a claim that all contexts have validated standard rotations. The capture also includes the separately labeled discovery roster.

```bash
node scripts/capture-team-rotation-composition.mjs PINNED_COMPILED_RILEY_CHECKOUT data/source/team-rotation-composition-model-2026-10-12.json
node scripts/generate-team-rotation-composition.mjs --check
node --experimental-strip-types scripts/report-team-rotation-composition.ts
node --experimental-strip-types --test test/teamRotationComposition.test.ts
```

The source artifact and generated models are checksum-linked. Reproduction requires the earlier pinned source checkout compiled with its TypeScript 5.6.3 toolchain. No provider damage results are exported or used as Bellibing damage calculations.
