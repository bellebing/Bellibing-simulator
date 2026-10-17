# Hsin / Jingran — Character source-promotion gate

**Reviewed:** 2026-10-11. **Current main at review:** `a299e3878fb6ef2835f3ab966426ecdef15bded6`. This gate is an evidence register, **not a release of canonical Character stats or mechanics**. The full per-character research source reviews are [Hsin](research/CHARACTER_HSIN_FACTS_EVIDENCE.md) and [Jingran](research/CHARACTER_JINGRAN_FACTS_EVIDENCE.md).

## Approved facts already present in canonical Character catalog

| Identity | RELEASED | Element / Weapon | Still unverified in canonical |
| --- | --- | --- | --- |
| Hsin | Yes, v3.7 phase I | Electro / Rectifier | Lv90 HP, ATK, DEF, Max Energy; permanent Minor Fortes; exact Skills Lv1–10, Forte, Inherent, Outro and S1–S6 mechanics. |
| Jingran | Yes, v3.6 phase II | Fusion / Broadblade | Same missing canonical fields and source-bearing mechanic families. |

Both released identities have `PARTIALLY_VERIFIED` raw status; they are absent from the 57-character pinned Skills/Forte payload, intrinsic profiles and canonical Character Mechanics roster. **No source-backed DPS readiness or Build recommendation is conferred.** Suoming remains a separate upcoming identity. The two research reports are source candidates, not independently reviewed version-pinned ingestion evidence.

## Field-by-field promotion requirements

| Field family | Hsin | Jingran | Required evidence |
| --- | --- | --- | --- |
| HP / DEF | candidate HP 10,300 / DEF 1,112 | candidate HP 15,375 / displayed DEF 0 | Accept game's displayed Lv90 base convention; for Jingran establish whether 0 is **raw base DEF** or an effective kit-fixed rule. |
| ATK | 462 versus 463 | 312, 312.5 versus 313 | Confirm game-facing canonical integer under the reviewed published Lv90 convention and preserve any raw decimal/presentation alternatives in provenance. |
| Max Energy | candidate 140 labelled Max Resonance Energy; Liberation **cost 125** is distinct | candidates 125 / 140 with ambiguous labels; Liberation **cost 125** is distinct | Review exact **energy cap** field, independent of Liberation/Resonance Cost. Do not promote from ambiguous cost/label. |
| Skill motion-value curves | 37 candidate variable DMG rows have Lv1 + Lv10 only; **Lv2–9 missing (296 cells)** | Lv1 + Lv10 provider candidates; **Lv2–9 missing** | Acquire the complete versioned Lv1–Lv10 original source row array, skill IDs, param join, per-hit components and damage types; do not interpolate. |
| Forte / Inherent / Outro / S1–S6 | third-party text/trigger candidates only | third-party text/trigger candidates only | Provenance-pinned original skill/tree/text and independent six-area semantic review. Keep runtime state/ownership/timing pending if not stated. |
| Minor Forte | reported on third-party kit pages | reported on third-party kit pages | Exact source-nodes for each permanent stat, unlock and source-tree reconciliation; add to the existing canonical intrinsic owner only. |

## Implementation gate and audit consequences

- Raw HP/ATK/DEF/Max Energy stay `null` with exact exceptions in `src/data/characterRawAudit.ts` until source-reviewed; remove an exception only when that **exact field** is justified and populated.
- Character `verificationStatus` stays `PARTIALLY_VERIFIED` until the required full raw record plus inherent intrinsic totals are independently reviewed. A single resolved HP value does **not** promote the whole record.
- `CHARACTER_PRESENTATION_PENDING` and Skills/Sequence projection omissions stay explicit until reviewed canonical source identities and full curves exist; original provider captures are `canonicalAuthority:false`.
- `CharacterMechanics` must use existing separated ACTION/PASSIVE/RESOURCE/SEQUENCE owners. Raw text is not a modeled effect; runtime execution and DPS remain separate gates.
- Once evidence is sufficient, use two small independent reviewed Character PRs with strict source-vs-catalog checks, raw/intrinsic exceptions, UI source projection/coverage and backward-impact review. Run source audit, exact-head FULL, browser UI if affected, and post-merge verification.
- **Do not use a recommendation/weapon/signature association as gameplay source verification.** Build-guidance completeness is a separate workstream.

## Current disposition

**Hsin: BLOCKED_ON_PINNED_FULL_KIT_AND_LV90_SEMANTICS. Jingran: BLOCKED_ON_PINNED_FULL_KIT_AND_LV90_SEMANTICS.**

These are evidence gaps, not zero stats and not proof that the game lacks the data. Promoting partial values now would make Character coverage metrics misleading. Continue the other independent source-verification batches without claiming these two characters finished.
