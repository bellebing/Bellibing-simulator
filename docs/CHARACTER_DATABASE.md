# Character database and shared action values

The UI and backend can use one generated Character catalog instead of assembling a second Character database. The export is derived from the existing canonical registries on every build. Adding a reviewed Character, fact or preset to its owning registry automatically includes it; there is no export allowlist or copied numeric table to maintain.

## Use from a separate UI

```sh
npm run export:characters
# data/generated/character-database.json

npm run export:characters -- --output path/to/character-database.json

npm run build
# dist/data/character-database.json, included in the normal Pages/Export payload
```

On the deployed site, fetch `./data/character-database.json` relative to the Bellibing site root. A UI hosted elsewhere can import a generated copy into its own build. The file has `schemaVersion: 1` and stable bytes for the same canonical data; it does not refresh external providers. The CLI validates before replacing the last successful output.

TypeScript consumers can import `buildCharacterDatabase` and `CharacterDatabase` from `src/characterDatabase.ts`. Each call returns a detached copy; client-side edits cannot mutate canonical catalogs or subsequent exports.

| Field | Meaning |
| --- | --- |
| `characters` | All canonical identities, level-90 stats, intrinsic stats, mechanics profile/fact references, source blockers and released-Character readiness. Upcoming/WIP identities retain their release status and `readiness: null`. |
| `mechanicsFacts` | Original canonical action/passive/resource/S1–S6 facts, with provenance, conditions and modeling status preserved. |
| `actionValuesAtMaxSkill` | Exact level-10 source coefficient components/hit counts or separately typed flat damage, keyed by `factId`. `UNAVAILABLE` carries a reason and no fabricated zero. |
| `hitPrimitives.basicHits` | Derived S0/max-skill ATK Basic Attack hit support. This is isolated-hit coverage, never a rotation or DPS approval. |
| `hitPrimitives.directHits` | Derived support for ordinary single-class ATK/HP/DEF damage, tagged with the actual source damage class and scaling stat. |
| `profiles` | Presets and their referenced weapon recommendations, Echo loadouts, stat targets, teams and rotations. Roles belong to these team/mode contexts. |
| `executionReviews` | Existing reviewed profile execution dependencies; absence of a review is not approval. |
| `referenceTeam01` | The existing Augusta/Iuno/Shorekeeper context, including its six unresolved dependencies and `PARTIAL / dpsReady=false`. |

Resolve a Character's preset IDs through `character.readiness.presetIds`, then join the preset's profile IDs against `profiles`. Resolve mechanic IDs through `mechanicsFacts`. A `SOURCE_SEQUENCE_ONLY` rotation has no executable DPS denominator. A source-complete Character does not automatically have an executable profile, and a personal `DPS_READY` profile does not establish total team DPS or authorize replacing its teammates.

The export currently contains 57 released Characters, 54 verified mechanics profiles and the existing two DPS-ready Characters. It introduces no new source facts or DPS approvals. Raw lower skill levels and S3–S6 are retained as source data; active product scope remains S0/S1/S2 and max skills, with quickswap deferred.

## Reuse when building Character engines

`readCharacterActionValues(fact, skillLevel)` in `src/characterActionValues.ts` selects exact canonical values for all existing Character action representations. It retains mixed coefficient components and their individual source hit counts. Flat damage stays separate; shared-system damage, unverified facts and legacy scalars without a machine-readable level binding are unavailable. Ambiguous or malformed source representations fail closed.

`sumCharacterActionCoefficients` is the narrow execution helper for a single damage class and ATK/HP/DEF scaling. Ciaccona now uses it instead of a private curve reader. An engine must still prove the action occurs, which hits connect, resource/state prerequisites, damage rules and timing. The reader neither applies conditional effects nor supplies a rotation, uptime or DPS value. In particular, source values on a `PENDING_INTERPRETATION` fact remain source values only.

## Fast path for further Characters

1. Reuse current canonical data and the existing profile/mechanics import and review tools. Do not retranscribe verified rows.
2. Review new material by shared fact/mechanic family; add source-valid records to the owning catalogs. Preserve missing/disputed fields explicitly.
3. Reuse the shared action reader and existing combat primitives. Add Character-specific code only for actual execution semantics those primitives cannot express.
4. Run targeted tests during iteration and full Verify before integration. The normal build validates and exports the entire database batch.

Provider candidates remain evidence only. This export does not authorize new copying from unreviewed providers or automatic canonical promotion. Buling, Danjin and Xiangli Yao retain their mechanics source blockers; unresolved Max Energy fields stay null. BUG-008/010/028/029 and the six Reference Team dependencies remain open. No UI work is part of this backend slice.

## Batch 1: explicit ATK Basic Attack hits

Stack dependency: PR #182 / `codex/character-database-batch`, verified parent head `9240cfea5541de739f418e64fa124d4f388b1413`. This dependent batch remains a separate draft PR and has no merge authorization.

`src/combat/characterBasicHitAdapter.ts` supplies `listCharacterBasicHitSupport` and `evaluateCharacterBasicHit`. Family membership is derived from VERIFIED mechanics profiles and VERIFIED, MODEL_READY/MODELED, unconditional ATK actions whose source section/action kind/damage class are Basic Attack. It currently covers **268 actions across 52 Characters**. No Character allowlist, coefficient copy or automatic source promotion is added.

The caller selects the exact Character/fact, one coefficient component, an explicit landed-hit count within that component's source count, S0 and max skills. The caller also supplies the fully assembled ATK, bonuses, expected-crit inputs and defense/resistance/reduction multipliers at that hit. The primitive uses `readCharacterActionValues` and the existing `expectedDamage` kernel. Mixed components can have separate snapshots; a source-listed multi-hit attack is never assumed to land in full.

This boundary evaluates a hit whose occurrence and combat context have already been established by the caller. It does not automatically compose gear/passive/team effects, carry state between calls, apply S1/S2 effects, reconstruct resources or prove a rotation. Conditional attacks, other scaling, simultaneous damage classes, missing facts, invalid snapshots and unsupported sequence/skill selections fail closed. Raw Character fields such as unresolved Max Energy are not consumed or promoted. Canonical fact modeling statuses and profile readiness remain unchanged.

## Batch 2: standard direct-hit families

Stack dependency: draft PR #184 / `codex/character-basic-hit-batch`, verified parent head `86b6263e410b251846065798c456a697516308ce` (which depends on #182). This batch remains unmerged and has no merge authorization.

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
