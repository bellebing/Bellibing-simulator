# Bellibing Simulator

A Wuthering Waves Echo-building decision engine.

## Open Bellibing

- **New UI/UX preview:** https://bellebing.github.io/Bellibing-simulator/ui-preview/
- **Current Alpha / runtime regression site:** https://bellebing.github.io/Bellibing-simulator/

The UI preview is intentionally published as a separate route while the current Alpha root remains available for runtime/regression verification.

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

PR #198 is integrated on `main`. The backend now assembles a bounded partial subset of Character-hit context across the existing 54 Character / 492 isolated direct-hit paths, with PARTIAL_L3 = **54** and PARTIAL_L4 = **28**; residual and complete context remain `CALLER_QUALIFIED`, not independently engine/source-resolved. This does not create additional DPS-ready profiles: Augusta and Ciaccona remain the only DPS_READY Characters, readiness is **43/3/9/2**, and all **83 pending execution edges / 72 dependency IDs** plus six Reference Team blockers remain open.

See [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) for the authoritative current completion matrix and roadmap. Dated audit/campaign documents preserve historical checkpoints and should not be read as the current branch state.

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
