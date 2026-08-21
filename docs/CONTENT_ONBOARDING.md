# Content Onboarding

## Principle

New Wuthering Waves content is added as independent verified data first and connected to other systems only when that connection is ready.

Adding one content type must not force unrelated implementation work.

Examples:
- a new Echo set can be registered before any character recommends it;
- a new character can be registered before their rotation/DPS model is finished;
- a new weapon can be registered before any character ranking uses it;
- Echo Core may understand a new set before Roll Advisor or Character DPS consumes its effect.

## Two separate questions

Every content item answers two independent questions:

1. **Is the data verified?**
2. **Is the app integration implemented?**

A record may therefore be:

`VERIFIED + DATA_ONLY`

This is valid and expected. Verified existence/raw data does not imply that effects are already modeled.

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
- `INTEGRATED` — connected to the intended user-facing character/build/advisor flow.

These labels must not be collapsed into one generic “done” flag.

## Normal release workflow

For a newly released patch:

1. Verify release status through official patch notes.
2. Gather raw data from multiple relevant sources.
3. Add new Echo sets / characters / weapons independently to the registry.
4. Mark each record with provenance and verification status.
5. Model only the mechanics needed by the corresponding engine.
6. Add integration adapters separately.
7. Run regression tests for existing Echo Core, characters and advisor behavior.

A new set should therefore be a small data/model addition, not a reason to rewrite character code.

## Dependency direction

```text
Content Registry
   ├── Echo Sets ──> Echo Core set-effect adapters
   ├── Characters ─> Character Profile / DPS model
   └── Weapons ────> Weapon effect adapters

Echo Core + Character DPS
          ↓
      Roll Advisor
```

The registry itself contains content identity, lifecycle status and provenance. It does not decide character recommendations.

## Example

If a patch introduces one character, one signature weapon and one Echo set, all three may be registered immediately once verified.

The set may become `ENGINE_READY` first and be usable in Echo simulation while the new character remains `DATA_ONLY` because their rotation is still being audited.

Later, when the character DPS model is verified, the character becomes `ENGINE_READY`. Only after the recommendation/loadout integration is tested does it become `INTEGRATED`.

This keeps patch updates additive and prevents one unfinished system from blocking or destabilizing another.
