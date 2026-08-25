# Game-data verification policy

## Goal

Minimize manual input for the user without turning third-party tools into hidden sources of truth, and prevent existing builds from becoming stale when new compatible content arrives.

## Source roles

1. DPR Calc Results
   - quantitative benchmark / rotation comparisons when available and context-compatible.
2. Prydwen and Game8
   - published standard recommendations, rotation descriptions and cross-checks.
3. Tethys and theorycraft resources
   - mechanics/rotation support and edge cases.
4. Wutheringlab, Nanoka and structured databases
   - raw data/scaffolding inputs.
5. Official patch notes / in-game release state
   - release status and changed mechanics.
6. International tools/sites (CN/JP/KR/Arabic/etc.)
   - discovery, implementation ideas, alternate descriptions and cross-checks.
   - never sufficient alone for a contested mechanic.

## Required data status

Every combat-affecting value should be representable as one of:
- verified base/raw value;
- verified modeled effect;
- conditional effect;
- pending/unmodeled effect;
- WIP/unreleased (must not route into production calculations).

A missing value is not zero. A pending effect is not inactive by definition. A published recommendation is not automatically a quantified DPS result.

## Character Level-90 stat convention

Bellibing's `CharacterGameData.level90` is a source-backed **game-facing integer stat layer**, not a locally rounded copy of a decimal database.

Rules:

- prefer the current published Level-90 integer convention used by Bellibing's benchmark/profile source family, led by Prydwen when that character is present there;
- use current structured/raw databases such as CYZED/Wuwa Wiki/Wutheringlab to cross-check the underlying stat family and identify source/presentation differences;
- do not create a universal `round()`/`floor()` rule from decimal values — different public databases expose different integer presentations of the same underlying progression;
- an adjacent `±1` database integer is not automatically a game-data conflict when a raw decimal source explains both displays and Bellibing's canonical published integer is source-backed;
- true semantic conflicts remain pending. In particular, `Max Energy` is not inferred from Resonance Liberation `Resonance Cost` or from an ambiguously labelled `Energy` field.

Released characters are additionally guarded by `characterRawAudit.ts`: a required raw field may be null only when the exact character+field is registered in `RELEASED_CHARACTER_RAW_PENDING` with a dated reason. CI fails on both unregistered missing fields and stale pending exceptions.

## Character ingestion

A future generator may import raw character/weapon/action structures from a machine-readable source, but generated output is initially non-routable. The ingestion step should create:
- provenance for each imported block;
- a review checklist;
- explicit pending entries for effects that require interpretation;
- parity tests when a V9.15/DPR benchmark exists;
- a Character Preflight record covering the fields required by the intended support level.

Only verified contexts become selectable in production.

## Patch-impact verification

Verification is not finished at the boundary of the new record.

Every new or changed combat-affecting item must also pass the appropriate backward-impact audit in [`CONTENT_PREFLIGHT_AND_IMPACT_AUDIT.md`](CONTENT_PREFLIGHT_AND_IMPACT_AUDIT.md).

Examples:

- a new weapon must be screened against existing users of that weapon type;
- a new Sonata set must be screened against existing modes compatible with its stats/triggers/scope;
- a new Echo must be screened against compatible Sonata/main-Echo uses;
- a new character must be screened both for their own build and as a teammate/support for existing characters;
- a newly modeled passive that was previously pending is treated as a changed combat fact and triggers the same downstream review.

For plausible affected old profiles, comparisons must reuse a coherent existing benchmark context or create a separately versioned context. Do not mix incompatible teams/rotations to manufacture a ranking.

`Reviewed — no impact` is an acceptable result. Skipping the review is not.

## Integration gate

A content item may be `VERIFIED + DATA_ONLY` while modeling or relationship work is pending.

`INTEGRATED` means the intended user-facing integration is tested **and** required backward-impact candidates have been reviewed. This prevents new content from silently leaving old Character↔Weapon, Echo/Sonata, Team, Rotation or DPS profiles stale.
