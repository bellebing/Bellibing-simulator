# Character database and shared action values

Integration status: PR #190 is now merged/deployed through `c37b3ea5c0833f0483e2da2ac9cca36d42e1902f`; Verify #1102 / Export #1001 / Deploy #147 passed. References below to its unmerged/draft state are historical checkpoints. Its canonical gear/capability payload is now on main. New reuse-first work is on a separate branch and has no merge authorization.

The UI and backend can use one generated Character catalog instead of assembling a second Character database. The export is derived from the existing canonical registries on every build. Adding a reviewed Character, fact or preset to its owning registry automatically includes it; there is no export allowlist or copied numeric table to maintain.

Delivery state: **#182/#184–#188 are integrated and deployed through PR #189**, followed by merged #190. The earlier main checkpoint `b16552da92a35a717c179a3801b262d728cbba97` passed Verify #1085, Export #984 and Deploy #146, including live database byte parity. See [integration evidence](CHARACTER_BACKEND_INTEGRATION_REVIEW.md). PR #191 is merged and post-merge verified (819 tests; Verify1110/Export1009/Deploy148): canonical Outro bindings and additional Echo facts project through existing exports. Its current eight attack profiles/ten attack facts and pending profile boundaries are documented in the [closure review](PR191_EXECUTION_CLOSURE_REVIEW_20260910.md).

## Use from a separate UI

```sh
npm run export:characters
# data/generated/character-database.json

npm run export:characters -- --output path/to/character-database.json

npm run build
# dist/data/character-database.json, included in the normal Pages/Export payload
```

Fetch `./data/character-database.json` relative to the deployed Bellibing site root, or use the generated build/Export copy. A UI hosted elsewhere can import that copy into its own build. The file has `schemaVersion: 1` and stable bytes for the same canonical data; it does not refresh external providers. The CLI validates before replacing the last successful output.

TypeScript consumers can import `buildCharacterDatabase` and `CharacterDatabase` from `src/characterDatabase.ts`. Each call returns a detached copy; client-side edits cannot mutate canonical catalogs or subsequent exports.

| Field | Meaning |
| --- | --- |
| `characters` | All canonical identities, level-90 stats, intrinsic stats, mechanics profile/fact references, source blockers and released-Character readiness. Upcoming/WIP identities retain their release status and `readiness: null`. |
| `mechanicsFacts` | Original canonical action/passive/resource/S1–S6 facts, with provenance, conditions and modeling status preserved. |
| `actionValuesAtMaxSkill` | Exact level-10 source coefficient components/hit counts or separately typed flat damage, keyed by `factId`. `UNAVAILABLE` carries a reason and no fabricated zero. |
| `hitPrimitives.basicHits` | Derived S0/max-skill ATK Basic Attack hit support. This is isolated-hit coverage, never a rotation or DPS approval. |
| `hitPrimitives.directHits` | Derived support for ordinary single-class ATK/HP/DEF damage, tagged with the actual source damage class and scaling stat. |
| `hitPrimitives.echoActiveHits` | Nine exact Rank-5 ACTIVE_CAST Echo facts integrated through #191, with explicit component/landed-hit evaluation. Join Echo/attack IDs to `gear.echoAttacks`; coefficients remain canonical there. |
| `outroTransferSupport` | Eleven canonical Character Outro contracts: nine integrated through #191 plus Lupa/Qiuyuan isolated bindings on #193. Explicit handoff, recipient history and the declared stack policy are required. |
| `profiles` | Presets and their referenced weapon recommendations, Echo loadouts, stat targets, teams and rotations. Roles belong to these team/mode contexts. |
| `gear` | Canonical weapon/Echo/Sonata identities, separate effects and exact Echo attacks, plus existing source coverage and pending/conflict dispositions. Integrated and deployed through #190. |
| `gear.echoTransferWindows` | Existing Denia/Hyvatia summon contracts and the new Rank-5 Voidwing use-to-Outro contract, with exact arm kind, rank and caller-state requirements. Values stay in `gear.echoEffects`; no profile timing or activation is inferred. |
| `executionReviews` | Existing reviewed profile execution dependencies; absence of a review is not approval. |
| `referenceTeam01` | The existing Augusta/Iuno/Shorekeeper context, including its six unresolved dependencies and `PARTIAL / dpsReady=false`. |

Resolve a Character's preset IDs through `character.readiness.presetIds`, then join the preset's profile IDs against `profiles`. Resolve mechanic IDs through `mechanicsFacts`. A `SOURCE_SEQUENCE_ONLY` rotation has no executable DPS denominator. A source-complete Character does not automatically have an executable profile, and a personal `DPS_READY` profile does not establish total team DPS or authorize replacing its teammates.

The export currently contains 57 released Characters, 54 verified mechanics profiles and the existing two DPS-ready Characters. It introduces no new source facts or DPS approvals. Raw lower skill levels and S3–S6 are retained as source data; active product scope remains S0/S1/S2 and max skills, with quickswap deferred.

## Reuse when building Character engines

The PR #190 static Echo family now includes Adam Smasher's existing Lucy/Rebecca restriction and Sigillum's existing Aemeath restriction through the shared wielder-identity primitive. The generated gear effects and pending-fact list reflect 66 effects across 40 Echoes on #191 (65/39 on main), including the independent Voidwing transfer / four remaining specialized pending facts. This changes static applicability for the existing Lucy/Aemeath presets; it does not change their source-only rotations or the 83 profile execution dependencies. [Backward-impact evidence](ECHO_SONATA_EFFECT_COVERAGE.md) records the exact boundary.

`gear.weaponResourceCasts` lists the 17 source-verified Skill/Liberation flat-resource effects now supported by `weaponResourceCastAdapter.ts`. Join their `effectId` to `gear.weaponEffects`; amounts remain in canonical rank values. Seven effects recover Concerto Energy and ten recover Resonance Energy. `createWeaponResourceCastState` requires known initial cooldown readiness, and `advanceWeaponResourceCast` consumes an owned, ordered cast to return a nominal source amount plus the next cooldown state. It does not compose energy pools/caps, ER scaling or a rotation. Current options in four Character recommendation profiles can reuse this family. Stellar Symphony's profile edge gains primitive availability while remaining pending for its timeline.

`gear.weaponCastWindows` and `gear.sonataCastWindows` expose the already-implemented 34 weapon / six Sonata cast-window contracts. The weapon bindings cover options in 12 existing Character recommendation profiles. Consumers can discover exact effect IDs and accepted cast events, then join the corresponding canonical effect row for rank values/duration or set activation. These lists contain no copied numeric facts and introduce no new runtime behavior. Equipment selection and source-proven cast occurrence/timing remain caller responsibilities; listed capability never grants uptime or readiness.

`gear.sonataTargetWindows` exposes Eternal Radiance's stack-qualified Spectro window and Windward Pilgrimage's two Aero-Erosion-target hit windows. Existing Zani, Cartethyia, Rover Aero and Jiyan loadouts can discover these exact canonical bindings. Execution requires an actual source-qualified attack/hit and the exact target observation at that time explicitly before the trigger. Target state alone, a cast, an assumed hit or a stale observation cannot activate an effect.

Zani's existing Eternal Radiance target view is accepted only for Zani's stack-count condition, retaining its independent Heliacal expiry and `provesInflictSpectroFrazzleTrigger=false` boundary. The separate S11 CRIT Rate infliction edge stays unresolved. The Spectro edge gains primitive availability while all 83 pending edges and every Reference Team blocker remain open. Source values/durations are joined from `gear.sonataEffects`; no copied numeric facts, refresh policy or profile timeline is introduced.

`gear.weaponHealingWindows` supports two canonical applied-heal contracts: Starfield Calibrator TEAM CRIT DMG and Bloodpact's Pledge SELF Skill DMG. Current Mornye/Rover Aero weapon selections can reuse the family at explicit R1–R5. It requires an actual source-qualified applied ally heal plus selected weapon, owner, target and team. Arbitrary self-healing/full-HP qualification is not inferred. Stellar Symphony's healing-qualified Skill cast is a different trigger and remains in its existing adapter. Numeric facts stay canonical; Mornye's existing R1 event helper reuses the fact reader with unchanged output.

These are separate activations with source duration and explicit same-timestamp query ordering. No repeat-heal cadence, refresh policy or profile coverage is assumed. In particular BUG-012 still blocks Rover's six-second overlap and rotation denominator; adding the isolated Bloodpact window does not close that edge or any Reference Team blocker.

`gear.weaponDamageWindows` exposes seven reviewed event bindings on Lethean Elegy, Lux and Umbra, Daybreaker's Spine and Unflickering Valor. This covers existing weapon options for Phrolova, Galbrena and Luuk Herssen. `weaponDamageWindowAdapter.ts` requires the exact selected weapon/rank and an owned, source-qualified BASIC/HEAVY/ECHO damage event; a cast or hypothetical hit cannot activate it. Values/durations come from `gear.weaponEffects`. Bonus, amplification and DEF-ignore terms retain distinct source labels and are not automatically assigned to a damage calculation.

Each activation creates one independent SELF window. Queries bind the recipient and require known event order at the activation timestamp, so the triggering hit is never automatically buffed. Repeated windows do not choose refresh/stack/overlap policy. Existing source conflicts, stack contracts and hit-versus-damage triggers remain outside this family. Synthetic composition with explicit Echo-hit arithmetic proves reuse; it does not select a Character's Echo, grant a rotation or close dependencies.

`gear.sonataDamageWindows` exposes four matching source-verified damage-event bindings for Flamewing's Shadow (two 3pc crit windows) and Sound of True Name (5pc Echo crit/Aero windows), used by the existing Galbrena and Sigrika loadouts. Weapon and Sonata adapters share `qualifiedDamageEvent.ts` for actual damage qualification, ownership and query ordering. `activateSonataDamageWindow` additionally requires the exact set and explicit equipped piece count. All values remain in canonical Sonata rows. Flamewing's separate both-windows-active Fusion effect and Luuk's three-stack Spectro effect are not inferred from one damage event.

`outroTransferSupport` reuses five MODEL_READY Character facts: Aalto, Changli, Mortefi, Taoqi and Yinlin. `characterOutroTransferAdapter.ts` reads their exact canonical statements and uses the existing incoming-transfer state primitive. The seven source amplification terms stay independent; multi-scope bonus aggregation is not inferred. Every activation requires the actual outgoing/incoming identities and timestamp. Queries require explicit recipient switch-out history; the bonus ends at the source duration or first recipient switch-out and cannot reappear on a later return.

The post-#190 reuse-first lane adds `zhezhi-outro-carve-and-draw` and `lumi-outro-escorting` under `UNKNOWN_SINGLE_ACTIVATION_ONLY`. Their canonical VERIFIED facts retain RAW_ONLY and `maxStacks: null`; the adapter reads the existing amounts and durations without changing source data. A caller must prove `priorActivationState: NONE_ACTIVE`, the actual Outro transfer and recipient, and explicit query ordering. Same-time recipient switch/query order is separately required. Mixed/repeated activation windows are rejected because stack/refresh semantics remain unknown. Zhezhi's Glacio and Skill terms stay separate. Six current presets across five Characters can discover the bindings through canonical team membership; this does not choose a recipient or execute those SOURCE_SEQUENCE_ONLY rotations.

The follow-up reuses that same contract for `roccia-outro-applause-please` and `sanhua-outro-silversnow`, extending discovery to nine presets/eight Characters across the four new owners. Roccia retains separate Havoc/Basic terms. Only Sanhua's exact Silversnow `Deepen` wording maps to Basic Attack amplification, checked against the [current Echo/Character game-text mirror](https://wuthering.wiki/character_1102.html); there is no generic Deepen parser. Their original numeric facts, provenance dates, RAW_ONLY and null stack fields remain intact. Brant's PENDING_INTERPRETATION fact is still excluded.

No Character-specific value table, changed modeling status, profile dependency closure or new DPS result is added. Brant remains PENDING_INTERPRETATION. Zhezhi/Lumi/Roccia/Sanhua remain outside the legacy MODEL_READY family; only their reviewed isolated-activation bindings above are exposed. Yangyang's periodic energy and Youhu's source statement without this switch-out termination clause are also excluded. Existing Iuno transfer behavior is preserved. Source/backward-impact validation includes all five source contracts, stale-recipient/expiry tests and one synthetic Mortefi → Jiyan Heavy-hit composition through the existing direct-hit primitive.

On PR #190 the additive `gear` section lets every existing profile's weapon options, main Echo and Sonata IDs resolve in this same file. Join `weaponEffects.weaponId`, `echoEffects.echoId`, `echoAttacks.echoId` and `sonataEffects.sonataSetId` to their identity catalogs. The raw weapon `effectIds` placeholder is preserved verbatim; use the separate effect rows for this relation.

`weaponEffectCoverage` reuses the existing source audit, `echoSkillSourceReview` and `echoSkillPendingAdapterFacts` preserve the reviewed Echo boundary, and `sonataSourceReviews` retain each activation's disposition. Missing attack/effect rows never mean zero damage or no passive. `AUDITED_EFFECTS` describes weapon passive source coverage only; it does not settle disputed core stats, make a pending model executable, or select uptime. In particular the canonical Abyss Surges 587 value is exported unchanged while its parked 587/588 provider conflict remains unresolved. No new source facts, copied numeric tables, source refresh or UI implementation are introduced.

`readCharacterActionValues(fact, skillLevel)` in `src/characterActionValues.ts` selects exact canonical values for all existing Character action representations. It retains mixed coefficient components and their individual source hit counts. Flat damage stays separate; shared-system damage, unverified facts and legacy scalars without a machine-readable level binding are unavailable. Ambiguous or malformed source representations fail closed.

`sumCharacterActionCoefficients` is the narrow execution helper for a single damage class and ATK/HP/DEF scaling. Ciaccona now uses it instead of a private curve reader. An engine must still prove the action occurs, which hits connect, resource/state prerequisites, damage rules and timing. The reader neither applies conditional effects nor supplies a rotation, uptime or DPS value. In particular, source values on a `PENDING_INTERPRETATION` fact remain source values only.

`echoActiveHitAdapter.ts` now evaluates the five existing exact ACTIVE_CAST Echo facts through the same numeric snapshot boundary and damage kernel as Character direct hits. Exact Echo ID, attack ID, Rank 5, component index, landed-hit count and a caller-proven snapshot tagged ECHO / source element / ATK, HP or DEF are required. Different components or individual hits can use different explicit snapshots. Zero landed hits is valid; an omitted count never means all hits.

The capability list contains identities and execution tags, not copied coefficients. The False Sovereign's INTRO_AUTO_SUMMON, Fallacy hold/release, unmodeled attacks and ambiguous variants remain unsupported. The primitive neither proves a cast nor selects effects, charges, cooldowns, timing or rotation. Synthetic arithmetic/partial-hit tests and existing Character hit regressions preserve all readiness and pending dependencies; no profile engine is switched to this primitive automatically.

The post-#191 follow-up adds the existing Lupa Outro fact to the same isolated-transfer family. Five current presets discover it from canonical team membership. Fusion and Basic terms remain separate; no Pack Hunt, Glory, stack refresh or profile timeline is inferred. See the [source-valid execution review](SOURCE_VALID_EXECUTION_REVIEW_20260911.md). The database projection derives this support directly from the shared adapter and retains canonical RAW_ONLY/null-stack facts.

Qiuyuan's existing incoming Echo amplification additionally reuses this family for five current presets. Its Character-owned Outro ECHO damage remains a separate source fact; amplification support does not create an equipped Echo cast, select a hit or execute the Character's attack. Explicit event/recipient/order and isolated activation requirements remain unchanged, including detached export and RAW_ONLY/null-stack preservation.

## Fast path for further Characters

Current measured coverage and the next-lane ranking are in the [integration and reuse-first audit](PR190_INTEGRATION_AND_REUSE_AUDIT_20260910.md). **Source once → canonical once → reuse many:** use an unchanged reviewed fact locally by ID while its provenance and source audits remain valid. Reopen external review only for changed/missing provenance, an uncovered semantic or a conflict. A new Character still needs its own occurrence, state, timing and team proof; this is separate from re-verifying the same effect value.

1. Reuse current canonical data and the existing profile/mechanics import and review tools. Do not retranscribe verified rows.
2. Review new material by shared fact/mechanic family; add source-valid records to the owning catalogs. Preserve missing/disputed fields explicitly.
3. Reuse the shared action reader and existing combat primitives. Add Character-specific code only for actual execution semantics those primitives cannot express.
4. Run targeted tests during iteration and full Verify before integration. The normal build validates and exports the entire database batch.

Provider candidates remain evidence only. This export does not authorize new copying from unreviewed providers or automatic canonical promotion. Buling, Danjin and Xiangli Yao retain their mechanics source blockers; unresolved Max Energy fields stay null. BUG-008/010/028/029 and the six Reference Team dependencies remain open. No UI work is part of this backend slice.

## Batch 1: explicit ATK Basic Attack hits

Historical stack dependency: PR #182 / `codex/character-database-batch`, verified parent head `9240cfea5541de739f418e64fa124d4f388b1413`. This payload is integrated through #189.

`src/combat/characterBasicHitAdapter.ts` supplies `listCharacterBasicHitSupport` and `evaluateCharacterBasicHit`. Family membership is derived from VERIFIED mechanics profiles and VERIFIED, MODEL_READY/MODELED, unconditional ATK actions whose source section/action kind/damage class are Basic Attack. It currently covers **268 actions across 52 Characters**. No Character allowlist, coefficient copy or automatic source promotion is added.

The caller selects the exact Character/fact, one coefficient component, an explicit landed-hit count within that component's source count, S0 and max skills. The caller also supplies the fully assembled ATK, bonuses, expected-crit inputs and defense/resistance/reduction multipliers at that hit. The primitive uses `readCharacterActionValues` and the existing `expectedDamage` kernel. Mixed components can have separate snapshots; a source-listed multi-hit attack is never assumed to land in full.

This boundary evaluates a hit whose occurrence and combat context have already been established by the caller. It does not automatically compose gear/passive/team effects, carry state between calls, apply S1/S2 effects, reconstruct resources or prove a rotation. Conditional attacks, other scaling, simultaneous damage classes, missing facts, invalid snapshots and unsupported sequence/skill selections fail closed. Raw Character fields such as unresolved Max Energy are not consumed or promoted. Canonical fact modeling statuses and profile readiness remain unchanged.

## Batch 2: standard direct-hit families

Historical stack dependency: PR #184 / `codex/character-basic-hit-batch`, verified parent head `86b6263e410b251846065798c456a697516308ce` (which depends on #182). This payload is integrated through #189.

`characterDirectHitAdapter.ts` extends the same explicit-hit boundary to **492 canonical actions across all 54 verified mechanics profiles**. The original Basic Attack API delegates to the shared implementation and retains its narrower 268-action scope and output contract.

| Source damage class | Actions |
| --- | ---: |
| BASIC | 294 |
| HEAVY | 55 |
| SKILL | 54 |
| LIBERATION | 33 |
| INTRO | 47 |
| OUTRO | 9 |

The batch covers 481 ATK, 6 HP and 5 DEF actions. Membership is derived from source-VERIFIED, MODEL_READY/MODELED, unconditional Character-owned damage with one of these ordinary damage classes and an exact stat coefficient. The source damage class is independent of action kind/section: for example, Aemeath Charged II uses its source LIBERATION class even though the action is HEAVY.

`evaluateCharacterDirectHit` requires the caller's snapshot to name both the exact source damage class and scaling stat. A mismatched ATK/HP/DEF or damage-class binding is rejected rather than silently applying the wrong stat/bonus bucket. The caller must already establish the hit and its fully assembled action-specific snapshot, including special crit/defense/bonus rules where applicable; this primitive does not prove that supplied gameplay context. Synthetic test snapshots test arithmetic, not a canonical full-build result.

Conditional actions, RAW_ONLY/PENDING_INTERPRETATION facts, simultaneous classes, shared-system damage, ECHO/negative-status/special-system classes, mixed scaling and literal flat damage remain outside this primitive. No such exclusion is a new source blocker or a fabricated zero. S1/S2 effects and rotation/state/timing execution remain pending; this batch adds no full Character/Team DPS approval and closes none of the existing pending dependencies.

## Batch 3: reviewed team amplification window

Historical stack dependency: PR #185 / `codex/character-direct-hit-families`, verified parent head `181a23248482556f7f880a059dc7b9d8c8972394` (above #184 and #182). This payload is integrated through #189.

`weaponTeamAmplifyWindowAdapter.ts` implements the existing reviewed `BPP-TEAM-AERO` gap. `activateWeaponTeamAmplifyWindow` requires Bloodpact's Pledge, Rover (Aero), the wielder's explicit Unbound Flow event and its timestamp. The canonical R1–R5 value and 30-second duration are read from the source registry with drift checks. There is no new gameplay fact or Character-specific coefficient table.

`weaponTeamAeroAmplificationAt` returns the amplification contribution for a supplied hit. Nearby/on-field eligibility must already be verified for that recipient/hit; `UNKNOWN` fails closed. Trigger ordering is explicit, including hits at the cast timestamp. The contribution is an amplification term for the existing damage kernel, and the integration test composes it with the shared Character direct-hit primitive using a synthetic snapshot.

One activation has an independent window. This primitive does not choose recipient allocation/snapshot versus aura semantics, combine repeated windows, refresh buffs, infer team uptime or execute a rotation. The BPP dependency moves only from implementation-pending to primitive-available/requires-timeline; all four Rover profile pending IDs and BUG-012 remain. Source-only rotations, full Character readiness, the six Reference Team dependencies and UI behavior are unchanged.

## Batch 4: shared support stat windows

Historical stack dependency: PR #186 / `codex/weapon-team-amplify-window`, verified parent head `dac0aa15e2e64685eee7830910117e502d09f46e`. This payload is integrated through #189.

`sharedSupportStatWindows.ts` reuses `incoming-transfer-state-v1` for Static Mist's canonical R1–R5 ATK buff to the actual incoming Resonator after the wielder's Outro. The 14-second source duration is retained. It is neither a SELF nor a TEAM buff, requires no invented incoming Intro prerequisite and adds no early-removal/stack/refresh rule.

The same batch extracts Rejuvenating Glow healing execution from the Shorekeeper-only path into `activateSharedRejuvenatingGlowWindow`. Any owner with the selected canonical 5-piece set can supply a source-qualified applied ally-heal, an explicit target and selected team. This supports the existing Chisa healing dependency without hardcoding a second Character engine. The source-qualified event is a caller obligation: a cast, shield, full-HP target or ambiguous self-heal is not automatically treated as a qualifying heal. Existing Shorekeeper behavior/output delegates to the shared implementation and retains its Character-specific guard.

Both adapters read their values from canonical source rows and reject contract drift. Two more exact dependencies are primitive-available/requires-timeline; all 83 profile dependencies remain pending. New windows remain separate and do not select stacking/refresh policy. No source facts, Character readiness, Reference Team pending IDs or UI behavior change.

## Batch 5: canonical cast-window coverage

Stack dependency: draft PR #187 / `codex/shared-support-stat-windows`, verified parent head `7a0188028f6fd5c4be35ea459a28bb8a7b92e8cf`. No merge is authorized.

The existing Weapon and Sonata cast-window primitives now cover **34 effects on 27 weapons** and **six Sonata effects**, respectively. The weapon catalog includes source-recommended options in 12 existing Character recommendation profiles. This is gear-effect execution coverage, not 12 new Character DPS approvals.

Bindings are reviewed explicit effect-ID/event mappings over canonical data. Cast events include Intro, Skill, Liberation, Echo Skill and Basic Attack where the exact source row declares them. A cast is never substituted for dealing damage, applying a target status, healing or satisfying a resource/stack condition. Runtime values continue to come from the canonical rows, with source-trigger, scope, rank/duration and state-boundary validation also applied to caller-supplied catalogs.

The six Sonata bindings use these exact canonical effect IDs; display names remain owned by the canonical set catalog:

`S02_5PC_FUSION`, `S04_5PC_AERO`, `S05_5PC_SPECTRO`, `S10_5PC_GLACIO`, `S18_5PC_SELF_LIB`, `S21_3PC_HEAVY`.

The caller must prove the selected weapon/rank or activated Sonata piece count, event ownership, resolved cast ordering and query timestamp. This low-level API does not select gear or supply a Character rotation. Cooldown, stack, target-state, damage-trigger and pending-trigger facts stay outside this cast family. New activations do not choose a repeated-window stacking/refresh policy.

Frosty Resolve's exact Glacio cast-window dependency is now primitive-available/requires-timeline; its separate Skill stack dependency and all five Carlotta pending IDs remain. The total execution graph remains 83 pending edges, 15 with available timeline-dependent primitives. All source facts, full readiness, Reference Team pending IDs and UI behavior are preserved.
