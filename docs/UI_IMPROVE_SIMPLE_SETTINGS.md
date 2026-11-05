# Improve Settings — functional behavior notes

This is implementation context, **not an instruction to reproduce a particular layout**. Inspect the running Improve UI when designing it.

## Inputs and stored state

- Existing inputs include Character Target, Gate (+5/+10/+15/+20/+25), Hard Requirements, Flex Stats and Recommended/Customize. Presentation labels and arrangement can change; underlying stored meaning cannot silently change.
- Hard Requirements map to `echoRequirements` / per-Echo minimum conditions. With an explicit Flex count, acceptance is all Hard Requirements **AND** at least N distinct configured Flex Stats meeting their minima. Legacy count-less preferences remain preferences, not implicit strict acceptance.
- There are 13 canonical Echo substat identities. The user's stat selection, order, active state, dormant minima and explicit overrides persist per Character. A move into an inactive set does not silently discard those values.
- The currently implemented Flex count range is 1 through `min(M, 5 − hard requirement count)` for a selected pool of size M. Infeasible saved intent requires repair, not silent mutation.
- Recommended Target requires an unambiguous source-backed modern DEFAULT Calc reference. Missing or conflicting reference stays Pending rather than borrowing another provider/source family.
- Fresh Augusta/default settings currently use CRIT Rate and CRIT DMG as Hard Requirements, and ATK%, Heavy Attack DMG, Energy Regen and Flat ATK as Flex (minimum 1 of 4), using the lowest existing canonical roll tiers. This is user-defined configuration, not verified game policy. Existing custom intent wins.
- Character/settings isolation, unsupported-schema recovery, storage-failure preservation, and non-destructive v2/v3 migration are essential functional semantics.
- Shared resource inventory has six relevant inputs (Echoes, Tuners and four Sealed Tube denominations); finite zero is distinct from unlimited `∞`. Item identity/provenance is in [resource manifest](ui-prototypes/assets/resource-icons/manifest.json). Resource counts are separate from CharacterBuildState.
- Current/Simulate use existing shared owner state without copying or spending real inventory. The browser-facing API exposes user inputs and status, not private evaluation/calibration.
- Public evaluator/Improvement Cost and unsupported gameplay outputs remain Pending until supported private execution is available.

Historical four-column layout, headings, gold highlight placement, typography sizes and slider/drag appearance have been retired as mandatory design patterns. Keep or redesign any of those interactions according to actual usability, with browser verification.
