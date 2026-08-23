# Echo game-data pipeline

## Purpose

Bellibing keeps raw Echo identity data separate from build recommendations and combat modeling.

The current raw layers are:

- `src/data/echoes.ts` — Echo species identity, COST and Sonata memberships.
- `src/data/sonatas.ts` — Sonata identity, activation thresholds and raw source text.
- `src/data/echoCatalogMeta.ts` — pinned upstream snapshot metadata.
- `src/echoCore*.ts` — rolling/stat/economy engine; this is a separate concern from species identity.

Future layers must remain separate:

- Echo Skill effects/damage/buffs/triggers.
- character-specific recommended Echo/main-stat/substat profiles.
- team/rotation/combat adapters.

## Source transport vs truth

`scripts/sync-echo-game-data.mjs` consumes the normalized public game-data snapshot from `DommyMM/wuwabuild`, which in turn documents Wuthery and Encore as upstream game-data sources.

Bellibing does **not** import that project's scoring, optimizer, combat or UI code. The script reduces the source data to Bellibing's own raw identity model.

The normalized snapshot is a transport/source-of-data signal, not permission to treat every mechanic as fully modeled. Imported records therefore remain `PARTIALLY_VERIFIED` / `DATA_ONLY` until the relevant Bellibing audit is completed.

Release freshness is independently checked against official patch information. The Version 3.6 bootstrap requires `Calamity Effigy` to exist in the generated snapshot.

## Conservative modeling rules

- COST must be one of `1 | 3 | 4`.
- COST 1 is safe to classify as `COMMON`.
- COST 3 is safe to classify as `ELITE`.
- COST 4 can represent Overlord or Calamity. The transport snapshot does not provide that distinction reliably, so `threatClass` stays `null` rather than being guessed.
- Sonata raw effect descriptions are audit text only. They are **not** executable buff/trigger/stack models.
- Echo records must never contain character recommendations, build slot, rolled main stats or substats.

## Updating after a game patch

1. Run the `Sync Echo Catalog` workflow manually.
2. Download the `bellibing-echo-catalog-candidate` artifact.
3. Audit the candidate against current official release notes and at least one additional current raw/database source.
4. Review catalog count changes, new/removed IDs, COST changes and Sonata memberships.
5. Update regression fixtures intentionally when the live roster really changed.
6. Commit the reviewed snapshot on a normal feature branch and merge through CI.

The sync workflow is intentionally read-only. It cannot commit to `main`.

## Version 3.6 bootstrap

Snapshot date: 2026-08-23.

- 181 Echo records.
- 34 Sonata records.
- Freshness gate: `Calamity Effigy`.
- `Calamity Effigy` raw membership: `Heart of Evil's Purge` + `Lamp of Nether Road`.

Echo Skill mechanics remain a future independent effect layer.
