# Bellibing Factory Evidence Report

Generator: `factory-evidence-report-v1`
Schema: `1`
Canonical promotion: `MANUAL_SOURCE_VALIDATION_REQUIRED`

## Summary

- Reconciliations: **2**
- Review candidates: **2**
- Exception queue: **0**
- Classifications: CONSENSUS 2, SINGLE_SOURCE 0, CONFLICT 0, MISSING 0, UNKNOWN 0

## Reconciliations

| Subject | Field | Classification | Route | Providers | Semantic fingerprints |
| --- | --- | --- | --- | --- | --- |
| abyss-surges | rarity.stars | CONSENSUS | REVIEW_CANDIDATE | frequency-manager<br>prydwen-profile-source | weapon-rarity-v1:stars=5 |
| ages-of-harvest | r1.attribute-dmg-bonus.value | CONSENSUS | REVIEW_CANDIDATE | frequency-manager<br>prydwen-profile-source | weapon-r1-attribute-dmg-bonus-v1:decimal=0.120000 |

## Review candidates

- `abyss-surges::rarity.stars`
- `ages-of-harvest::r1.attribute-dmg-bonus.value`

## Exception queue

- None.

## Provenance

| Candidate | Provider | State | Source version | Captured at | Source reference |
| --- | --- | --- | --- | --- | --- |
| weapon-rarity-v1:abyss-surges:frequency-manager:2 | frequency-manager | PRESENT | f585e47a868cb2b65845367b976a1781f130c758 | 2026-09-05T21:23:00Z | https://github.com/Voruzhu/FrequencyManager/blob/f585e47a868cb2b65845367b976a1781f130c758/adapters/game-definitions/wuthering-waves/weapons.ts |
| weapon-rarity-v1:abyss-surges:prydwen-profile-source:1 | prydwen-profile-source | PRESENT | live-weapons-index-review-2026-09-05 | 2026-09-05T21:23:00Z | https://www.prydwen.gg/wuthering-waves/weapons |
| weapon-r1-attribute-dmg-bonus-v1:ages-of-harvest:frequency-manager:2 | frequency-manager | PRESENT | f585e47a868cb2b65845367b976a1781f130c758 | 2026-09-05T18:58:00Z | https://github.com/Voruzhu/FrequencyManager/blob/f585e47a868cb2b65845367b976a1781f130c758/adapters/game-definitions/wuthering-waves/weapons.ts |
| weapon-r1-attribute-dmg-bonus-v1:ages-of-harvest:prydwen-profile-source:1 | prydwen-profile-source | PRESENT | live-page-review-2026-09-05 | 2026-09-05T18:58:00Z | https://www.prydwen.gg/wuthering-waves/characters/lumi |

> Factory evidence is review input only. This report never promotes provider evidence into canonical Bellibing runtime truth.
