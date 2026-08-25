# Bellibing Simulator

A Wuthering Waves Echo-building decision engine.

Bellibing's product question is:

**"I am building this character and I just rolled this Echo. What should I do with it now?"**

The answer must use verified Echo mechanics, the selected build/profile, resource economics and — once that character has a verified combat model — actual whole-build Personal Rotation DPS rather than a universal visual Echo score.

## Architecture

The application is built from independent, composable layers:

- Echo Core and Echo Lab
- raw Character / Weapon / Echo / Sonata catalogs
- Weapon / Sonata / Echo effect catalogs
- Echo attack facts
- Weapon Recommendation / Echo Loadout / Stat Target / Team / Rotation / Character Preset catalogs
- character combat models
- whole-build DPS/gate evaluation
- Roll Assistant / upgrade economics
- browser UI

Raw game data never owns character recommendations. The UI should resolve profiles and IDs rather than hard-code character-specific data.

## Current state

The horizontal foundation is established, but several catalogs are intentionally only partially populated. Broad character DPS expansion is gated until the pre-DPS foundation is complete.

See [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) for the authoritative completion matrix and build order.

Known headline gaps include:

- Rank-5 Echo main-stat progression at +5 / +10 / +15 / +20;
- full Character static/fact audit;
- full Weapon Effect coverage;
- full Sonata Effect coverage;
- broad Echo effect/attack fact coverage;
- profile population beyond the first golden fixture;
- final DPS-aware checkpoint stopping logic;
- a live Roll Assist blocker where the current test page can return `DISCARD` incorrectly.

## Quality rules

- Never guess Wuthering Waves data.
- Missing or disputed data stays explicit `PENDING`, conditional or partially verified.
- Character, weapon, Echo, effect, profile, combat and UI layers stay separate.
- Echo Core must remain character-free.
- Whole-build DPS and mandatory gates outrank generic stat labels once a character combat model is verified.
- Every new content path must be regression-tested before it is treated as supported.

## Run tests

```bash
npm test
```

The browser app is also built under strict TypeScript checks in CI.
