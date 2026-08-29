# Echo / Sonata effect coverage inventory

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

The current pinned/current source checkpoint is DommyMM/wuwabuild commit `5fa70b11f1d84fb644e4dbed47873708da0fe66f`. Upstream `main` was reverified at the same commit before this review.

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

`src/data/echoEffects.ts` now contains **62 modeled non-damage effect rows across 37 Echoes**.

The expansion is deliberately conservative:

- source-explicit permanent main-slot bonuses are modeled where their behavior is stable;
- four clear permanent main-slot facts that exist only in rendered English skill text are also modeled: Hecate Coordinated Attack DMG +40%, Nameless Explorer Echo Skill DMG +20%, Nightmare: Hecate Echo Skill DMG +20%, and Nightmare: Lampylumen Myriad Coordinated Attack DMG +30%;
- the existing Fallacy cast buffs and Denia/Hyvatia transfer-window effects remain trigger-aware and are not converted to automatic uptime;
- The False Sovereign and Thousand-Puppet Pavilion retain `ALREADY_MODELED_UPSTREAM` protection so existing parity paths do not double count them.

Source-explicit facts that the current effect domain cannot represent safely remain pending rather than being flattened:

1. Reminiscence - Nightmare: Adam Smasher — Lucy/Rebecca-only +15% CRIT Rate.
2. Reminiscence: Fleurdelys — extra +10% Aero DMG for Resonator: Aero or Cartethyia.
3. Sigillum — Aemeath-only +25% Resonance Liberation DMG.
4. Twin Nova: Collapsar Blade — main-slot Electro bonus becomes Spectro when Twin Nova: Nebulous Cannon occupies another slot.
5. Calamity Effigy — extra +10% Aero DMG for 15s after inflicting Tune Strain - Shifting.
6. Nightmare: Crownless — its own Echo Skill DMG +20% for 2s after hit, non-stacking.
7. Nightmare: Mourning Aix — +100% damage against Spectro-Frazzle targets, whose exact affected damage scope must not be guessed.

Those seven facts live in `ECHO_SKILL_PENDING_ADAPTER_FACTS` with explicit adapter-boundary reasons.

### Echo Attacks — exact executable facts only

`src/data/echoAttacks.ts` now has **2 exact Rank-5 attack profiles / 3 attack facts**:

- The False Sovereign — verified 55.35% ×4 Electro active spin plus 405% Electro Intro auto-summon, with existing charge/cooldown parity.
- Bell-Borne Geochelone — source-explicit 145.92% DEF-scaled Glacio protection blast with 20s cooldown.

Bell-Borne's 15s shield, 50% DMG Reduction, 10% DMG Boost and three-hit removal rule are **not** flattened into the attack model; they require shield/state execution semantics.

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
