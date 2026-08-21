# V9.15 → App migration map

Source workbook: `Bellibling Echo Simulator — V9.15 RESTRUCTURE CLEAN — 2026-08-13`

## What the live sheet already proves

- `Build Simulator` is the current front end.
- `Strategy Cache` stores simulation/economic state and per-slot ledgers.
- `Echo Source Map` produces one effective five-Echo build from Simulated / Owned Echo sources.
- `DPS Contexts / Actions / Buffs / Events / Adapters / Engine` are already moving toward a declarative combat model.
- Upgrade Monte Carlo is already conceptually separate from the static Weakest marker.

## App modules

| V9.15 concept | App destination |
| --- | --- |
| Build Simulator setup | `BuildContext` + UI form |
| Owned Echo input | `Echo` domain object + image/manual intake |
| Echo Source Map | effective build composer |
| Strategy Cache probability/economics | roll simulation engine + persisted run result |
| Weakest heuristic | explanatory secondary signal only |
| Upgrade Plan | upgrade economics service |
| DPS Contexts/Actions/Buffs/Events/Adapters | versioned character combat data |
| DPS Engine | pure calculation engine |
| Snapshot / baseline | saved build comparison |

## First parity target

Use Augusta as Character 1 because the spreadsheet already has a working, weapon-dynamic Personal Rotation DPS reference and upgrade economics.

The first app milestone is not visual parity. It is semantic parity:

1. Same build inputs.
2. Same locked Augusta combat context.
3. Same Current Personal Rotation DPS within an explicitly defined tolerance.
4. Same ER gate result.
5. Candidate Echo replacement agrees on upgrade / no-upgrade / invalid-ER.
6. Upgrade simulations preserve incumbent-until-better behavior.

Only after this parity target passes should the app become the source of truth for that character.

## Live-data extraction checkpoint — 2026-08-21

The app repo now contains a deliberately narrow first extraction from the live workbook:

- `data/v9_15/substat-rolls.json` — exact roll magnitudes read from `Build!AZ36:BL50`.
- `data/v9_15/roll-economy-contract.json` — what the live UI/cache proves about checkpoints, resource accounting and replacement semantics, while leaving unavailable V1.2.13 runtime constants explicitly pending.
- `fixtures/v9_15/augusta-live-2026-08-21.json` — an observed live-sheet regression snapshot.

The locally available Apps Script is stamped `V7 NO-ZIP`; it is historical only and must not be used to fill V9.15 runtime gaps.
