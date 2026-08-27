# Character Mechanics source import

This workflow exists to remove repetitive manual transcription from the roster-wide Character Mechanics source audit without weakening Bellibing's verification contract.

## Contract

The importer produces **review candidates only**.

Generated rows are always:

- `importStatus: CANDIDATE_ONLY`
- `verificationStatus: NOT_VERIFIED`

The importer cannot add a character to canonical `CharacterMechanicFact` coverage and cannot make a mechanics profile `VERIFIED`. Promotion still requires the existing source review plus `auditCharacterMechanicsCoverage` / `RAW_FACTS` structural gates.

## Source path

The default sync reads the current `DommyMM/wuwabuild` `public/Data/Characters.json` snapshot at an exact upstream commit SHA. That normalized snapshot is built from Wuthery/Encore game-data sources and already exposes the source material Bellibing otherwise has to transcribe manually: moves, English descriptions, Lv1-Lv10 value rows, S1-S6, skill-tree nodes and selected parsed inherent bonuses.

The exact upstream commit is written into every candidate snapshot. A later source audit may cross-check current live secondary sources when wording/classification is ambiguous or when two sources disagree.

## Run it

Roster-wide:

```bash
npm run sync:character-mechanics
```

One character:

```bash
npm run sync:character-mechanics -- --character baizhi
```

Use a previously downloaded compatible `Characters.json` snapshot:

```bash
npm run sync:character-mechanics -- --input path/to/Characters.json
```

Default outputs are ignored by git because they are review artifacts, not canonical data:

- `data/generated/character-mechanics-candidates.json`
- `data/generated/character-mechanics-candidates.summary.json`

The GitHub workflow **Import Character Mechanics Source** runs the same live-source import for relevant pull requests and manual dispatches, then uploads both files as a seven-day artifact.

## What is parsed automatically

For every Bellibing `RELEASED` character matched to the source roster, the candidate contains:

- move identity/type/name/description;
- all raw move value rows;
- exact ten-level percentage coefficient rows when they are structurally unambiguous;
- mixed coefficient components such as `a%*2+b%*3+c%` without pre-summing them;
- stable source hit counts when the same component shape exists at all ten levels;
- S1-S6 raw sequence text and parameters;
- skill-tree nodes;
- upstream inherent-bonus candidates when available.

A coefficient row is auto-parsed only if all ten levels parse and every level has the same number of components and the same hit-count shape. If that is not true, the raw row remains intact and goes to review.

## What is deliberately not inferred

The importer does **not** guess:

- `DAMAGE` vs `NON_DAMAGE` vs `UNKNOWN` action role;
- final Bellibing damage class when source wording is ambiguous;
- scaling stat when it is not explicit;
- Forte/resource state-machine semantics;
- trigger timing, uptime, stacks or conditional execution;
- disputed source values;
- whether a raw percentage row is actually a damage multiplier, a buff, healing, resource value or another percentage mechanic.

Those decisions belong in the audit/promotion step.

## Review loop

The intended roster workflow is now:

1. Run the source import once for the current upstream commit.
2. Read the compact summary first.
3. Review unmatched/ambiguous roster entries and percentage-like rows that could not be parsed safely.
4. Cross-check semantic classifications and source conflicts only where needed.
5. Promote reviewed material into canonical Character Mechanics facts in controlled batches.
6. Run the existing structural/source audits and tests.
7. Mark a character `VERIFIED` only when all six required mechanics areas actually pass.

This changes the expensive part from **transcribe every row by hand** to **review exceptions and semantics**.
