# Content Onboarding

## Principle

New Wuthering Waves content is added as independent verified data first and connected to other systems only when that connection is ready.

Adding one content type must not force unrelated implementation work, but **every content batch must still audit whether the new content changes already-supported builds**.

Examples:
- a new Echo set can be registered before any character recommends it;
- a new character can be registered before their rotation/DPS model is finished;
- a new weapon can be registered before any character ranking uses it;
- Echo Core may understand a new set before Roll Advisor or Character DPS consumes its effect.

The detailed mandatory checklist is [`CONTENT_PREFLIGHT_AND_IMPACT_AUDIT.md`](CONTENT_PREFLIGHT_AND_IMPACT_AUDIT.md).

## Three separate questions

Every content item or patch batch answers three independent questions:

1. **Is the new/changed data verified?**
2. **Is the required app integration implemented?**
3. **Has backward impact on existing supported content been audited?**

A record may therefore be:

`VERIFIED + DATA_ONLY + impact audit pending`

This is valid and expected. Verified existence/raw data does not imply that effects are already modeled, and modeling the new item does not prove that old character recommendations remain current.

## Statuses

### Release status
- `RELEASED`
- `CONFIRMED_UPCOMING`
- `UNRELEASED_WIP`

### Verification status
- `VERIFIED`
- `PARTIALLY_VERIFIED`
- `PENDING`

### Integration status
- `DATA_ONLY` — stored and source-backed, no engine behavior promised.
- `ENGINE_READY` — relevant effect/mechanics model exists and is tested.
- `INTEGRATED` — connected to the intended user-facing character/build/advisor flow **and the required backward-impact audit is complete**.

These labels must not be collapsed into one generic “done” flag.

## Normal release workflow

For a newly released patch:

1. Verify release status through official/current release material.
2. Gather raw data from multiple relevant sources.
3. Add new Echo sets / Echoes / characters / weapons independently to the registry.
4. Mark each record with provenance and verification status.
5. Run the content-type preflight before enabling deeper integration.
6. Model only the mechanics needed by the corresponding engine.
7. Add integration adapters separately.
8. Run the mandatory backward-impact audit:
   - new character -> own build **and** possible support/team impact on old characters;
   - new weapon -> old characters of the same weapon type, narrowed by effect compatibility;
   - new Sonata set -> old modes compatible with its stats/triggers/scope;
   - new Echo -> compatible Sonata/main-Echo modes and active-effect use cases.
9. Rebenchmark affected old profiles under their existing comparable contexts.
10. Record explicit `reviewed — no impact` where nothing changes.
11. Run regression tests for existing Echo Core, profiles, characters and advisor behavior.

A new set should therefore be a small data/model addition, not a reason to rewrite character code. But its patch work is not complete until existing compatible characters were screened.

## Dependency direction

```text
Content Registry
   ├── Echo Sets ──> Echo Core set-effect adapters
   ├── Echoes ─────> Echo attack/effect adapters
   ├── Characters ─> Character Profile / DPS model
   └── Weapons ────> Weapon effect adapters

Profiles / Teams / Rotations
          ↓
Character DPS + Echo Core
          ↓
      Roll Advisor
```

The registry itself contains content identity, lifecycle status and provenance. It does not decide character recommendations.

Recommendation relations are many-to-many and must be re-audited when new compatible content arrives.

## Character onboarding gate

Before a released character is considered normal-flow supported, verify at minimum:

- identity, release status, rarity, element and weapon type;
- Level-90 HP/ATK/DEF and Max Energy;
- base CR/CD/ER and intrinsic/static stat nodes;
- required skill/Forte/passive/sequence facts for the supported mode;
- Weapon Recommendation profile;
- Echo Loadout / Sonata / main Echo / five main-stat slots;
- Stat Target requirements and mandatory gates;
- Team profile;
- Rotation profile;
- Character Build Preset;
- fallback Roll Advisor requirements if DPS is not yet available;
- verified combat context and parity gates before DPS is allowed to become the final judge.

Missing or disputed fields remain explicit pending. Never inherit another character's values merely to make the profile complete.

## Backward-impact examples

### New weapon

A signature Sword is still screened against every released Sword user. If its trigger/mechanics plausibly fit an old character, benchmark it under that character's current context and update the Character↔Weapon relation only if supported.

### New Sonata set

Screen existing modes for matching scaling, element, attack type, ER need, team role and trigger access. A set may change an old character's main Echo, main stats, substat targets, ER gate, rotation or DPS.

### New support character

Screen existing DPS modes against the new character's buffs, amplification, energy, element/attack-type bonuses, resistance effects, off-field damage and rotation support. A new support may improve an old character's Personal/Team DPS even though that old character's raw data did not change.

## Example

If a patch introduces one character, one signature weapon and one Echo set, all three may be registered immediately once verified.

The set may become `ENGINE_READY` first and be usable in Echo simulation while the new character remains `DATA_ONLY` because their rotation is still being audited.

Separately, the weapon must be screened against existing users of its weapon type, the set against existing compatible builds, and the new character against old teams they may improve.

Later, when the character DPS model is verified, the character becomes `ENGINE_READY`. Only after recommendation/loadout integration **and backward-impact review** are tested does it become `INTEGRATED`.

This keeps patch updates additive while preventing old character builds and DPS contexts from silently going stale.
