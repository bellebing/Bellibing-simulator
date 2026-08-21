# Reference tools and patterns

This document is a behavior/architecture reference map, not a data authority list.
Bellibing may study public tools to understand useful UX and engineering patterns,
but character/weapon/Echo/mechanic values must still pass the project's own source
verification policy before entering the combat engine.

## Tacet Lab / WuWa-Optimizer (DhruvJ12421)

Reference: https://github.com/DhruvJ12421/WuWa-Optimizer

Useful patterns:
- Browser-first, local-first UX.
- Echo screenshot/window capture -> review -> local storage.
- Indexed local inventory instead of requiring an account/backend.
- PWA/GitHub Pages delivery is viable for a substantial WuWa tool.
- Clear coverage warnings for mechanics that are not fully audited.

Bellibing decision:
- Adopt the local-first product shape and later screenshot-review flow.
- Do not use its damage output as Bellibing truth.

## Wuthering Waves Optimizer / WutheringTools (ryanbenson)

Reference: https://github.com/ryanbenson/wuthering-waves-optimizer

Useful patterns:
- Generate character/weapon structures from machine-readable live data, then emit a
  human review checklist for mechanics that cannot be safely inferred.
- Keep characters in isolated folders/modules rather than one global formula table.
- Automated tests and deploy previews.

Bellibing decision:
- Build ingestion as "scaffold + provenance + manual verification", never as blind import.
- A new character should be cheap to onboard structurally while complex passives remain explicit.

## FrequencyManager (Voruzhu)

Reference: https://github.com/Voruzhu/FrequencyManager

Useful patterns:
- Inventory-driven optimizer: tell the app what the user actually owns.
- OCR plus optimizer as one workflow.
- Game packages separate game data from the generic optimizer core.

Bellibing decision:
- Keep combat/data packages separated from the Echo decision engine.
- Owned-Echo analysis is a first-class workflow, not an afterthought.

## Chinese front-end damage calculators

Examples:
- https://github.com/chuan-hane/wuwa-damage-calculator
- https://github.com/GZXiaoBai/wuwa-dps-calc

Useful patterns:
- Pure browser calculation can still model substantial combat state.
- Buffs should be evaluated from prerequisites/state for the action being calculated,
  not merely because the character/team possesses the buff.
- Structured character/weapon/Echo data can support a fast UI without a server round trip.

Bellibing decision:
- Preserve event/state semantics from V9.15 rather than collapsing everything into stat weights.

## Echo Value Calculator / EVC-style tools

Useful pattern:
- Very fast explanation of Echo quality and ER-aware full-set scoring.

Bellibing decision:
- A weight score may be useful as a secondary explanation or quick heuristic.
- It must never be the final judge when whole-build rotation DPS can answer the question.

## Implementation rule

We may reproduce public behavior, interaction ideas, and general architectural patterns.
We do not copy source code into Bellibing unless its license is deliberately accepted and
its obligations are compatible with this project. Default approach: independent implementation.
