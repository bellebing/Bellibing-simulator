# Echo game-data pipeline

## Purpose

Bellibing keeps raw Echo identity data separate from build recommendations and combat modeling.

The current raw layers are:

- `src/data/echoes.ts` — Echo species identity, COST and Sonata memberships.
- `src/data/sonatas.ts` — Sonata identity, activation thresholds and raw source text.
- `src/data/echoCatalogMeta.ts` — pinned upstream snapshot metadata.
- `src/data/echoRawAudit.ts` — frozen current-patch source-review contract plus fail-closed raw invariants.
- `src/echoCore*.ts` — rolling/stat/economy engine; this is a separate concern from species identity.

Future layers must remain separate:

- Echo Skill effects/damage/buffs/triggers.
- character-specific recommended Echo/main-stat/substat profiles.
- team/rotation/combat adapters.

## Source transport vs truth

`scripts/sync-echo-game-data.mjs` consumes the normalized public game-data snapshot from `DommyMM/wuwabuild`, which in turn documents Wuthery and Encore as upstream game-data sources.

Bellibing does **not** import that project's scoring, optimizer, combat or UI code. The script reduces the source data to Bellibing's own raw identity model.

The normalized snapshot is a transport/source-of-data signal, not permission to treat every mechanic as fully modeled. Raw catalog records therefore remain `PARTIALLY_VERIFIED` / `DATA_ONLY`; the separate raw-roster audit can establish `VERIFIED CURRENT` for the source-reviewed raw projection without pretending that Echo Skill or Sonata combat semantics are complete.

Release freshness is independently checked against official patch information. Version 3.6 requires `Calamity Effigy` to exist as a released Echo.

## Current Version 3.6 raw audit

Source review date: 2026-08-29.

Bellibing's pinned raw snapshot is `DommyMM/wuwabuild@0a2e49c649c857c690be709577e6ce98832b2d43`. The source review compared that projection with current upstream head `5fa70b11f1d84fb644e4dbed47873708da0fe66f` plus current release/source references.

The review found:

- **A. VERIFIED CURRENT:** 181 released Echoes and 34 released Sonata sets.
- **B. STALE / WRONG:** 0.
- **C. MISSING:** 0.
- **D. SOURCE_CONFLICT:** 0.
- **E. EXTRA / OBSOLETE:** 0.

The later upstream head does not change `public/Data/Echoes.json` relative to Bellibing's pinned snapshot. Its `public/Data/Fetters.json` change adds upstream `displayBonuses` metadata only; Bellibing's raw Sonata projection consumes identity, activation thresholds and raw effect-description text, so no raw Bellibing field changed.

This is deliberately a **projection audit**, not a whole-file byte-equality rule. Upstream display/UI metadata may change without invalidating Bellibing, while a changed Echo identity, COST, Sonata membership, Sonata identity, activation threshold or raw effect-description row fails the source-facing gate.

Run:

```bash
npm run audit:echo-raw
```

The command resolves the current upstream commit at runtime, projects only the raw fields Bellibing owns, and fails on missing/stale/extra records or unregistered conflicts. A future real source contradiction must be recorded through the explicit `sourceConflicts` contract; conflicted records are excluded from `VERIFIED CURRENT` rather than guessed into agreement.

The gate runs in Verify, Export and Deploy so a future source drift cannot silently ship behind an old `181 / 34` count fixture.

## Conservative modeling rules

- COST must be one of `1 | 3 | 4`.
- COST 1 is safe to classify as `COMMON`.
- COST 3 is safe to classify as `ELITE`.
- COST 4 can represent Overlord or Calamity. The transport snapshot does not provide that distinction reliably, so `threatClass` stays `null` rather than being guessed.
- Every released Echo must resolve all Sonata memberships to real Sonata records.
- Sonata raw effect descriptions are audit text only. They are **not** executable buff/trigger/stack models.
- Echo records must never contain character recommendations, build slot, rolled main stats or substats.
- Raw-roster verification does not imply Echo attack/effect, Sonata effect, profile, rotation or DPS completeness.

## Updating after a game patch

1. Run the `Sync Echo Catalog` workflow manually and download the `bellibing-echo-catalog-candidate` artifact.
2. Run `npm run audit:echo-raw` against the current source head.
3. Audit the candidate against current official release information and at least one additional current raw/database source.
4. Review catalog count changes, new/removed IDs, lifecycle, COST changes and Sonata memberships.
5. Register genuine source conflicts explicitly instead of selecting one side by guesswork.
6. Update the frozen current-patch contract and regression fixtures intentionally when the live roster really changed.
7. Commit the reviewed snapshot on a normal feature branch and merge through CI.

The sync workflow is intentionally read-only. It cannot commit to `main`.

## Version 3.6 freshness anchor

- 181 Echo records, all current released.
- 34 Sonata records, all current released.
- Freshness gate: `Calamity Effigy`.
- `Calamity Effigy` raw membership: `Heart of Evil's Purge` + `Lamp of Nether Road`.

Echo Skill mechanics and executable Sonata effects remain independent later layers. See `docs/ECHO_SONATA_EFFECT_COVERAGE.md` for the current inventory and next source-audit boundary.
