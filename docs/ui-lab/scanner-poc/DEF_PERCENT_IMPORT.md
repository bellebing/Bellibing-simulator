# Discord DEF 11.9% → canonical 11.8% investigation

Reviewed 2026-10-30 for Issue #352. This is a scanner compatibility rule, not a
canonical game-data change. Work remains local until owner publication approval.

## Comparison and evidence

| Source | Observed fact | What it establishes |
| --- | --- | --- |
| Owner's original Ciaccona 1920×1080 English Discord card, Echo 2 / row 5 | The pixels visibly say `DEF 11.9%`; OCR also returns `11.9%`. | This particular discrepancy already exists in the card. It is not our OCR misreading an 8 as a 9. The private original is retained outside Git. |
| [Kuro Games Korean probability disclosure](https://wutheringwaves.kurogames.com/p/language_ko/product_info.html) → [official PDF](https://sdk-prod-cdn-aws.kurogame-service.com/pro/agreement/common/language_ko/product_info.pdf), page 7, `방어력 보너스` (DEF bonus) | DEF% tiers are 8.1, 9.0, 10.0, 10.9, **11.8**, 12.8, 13.8, 14.7%; the 11.8% tier has probability 17.4757%. No 11.9% tier is listed. | Primary publisher evidence for the game's legal tier. |
| Bellibing `src/echoCoreRules.ts#SUBSTAT_VALUE_TABLE` and generated `statEditor.substats` | DEF% contains fraction `0.118` and not `0.119`. | Existing canonical data agrees with the publisher; no change is justified. |
| [Wuthering Tools September 12 update](https://www.wutheringtools.com/updates) | Identifies an importer fix for 11.8% coming in as 11.9%. | Corroborates the importer problem; the short release note alone does not explain the card pixels. |
| [Actual fix commit 023b324b55b5b7dc498692434c163f9d2f341396](https://github.com/ryanbenson/wuthering-waves-optimizer/commit/023b324b55b5b7dc498692434c163f9d2f341396) | Adds a targeted rule for labels `DEF` / `DEF Y`, exact value `11.9%` → `11.8%`. Its explanation calls this a Tesseract misread of a legal tier. The commit timestamp is September 12 UTC (September 11 in its author's timezone). | Verifies the specific importer compatibility mapping, not a general rounding rule. |

The official PDF fetched for this investigation has SHA-256
`d5b77d4789e4975164ea4e05737d9b7a64a1de48160aa67c0c87a594f6945bf1`.
Its stable entry URL redirects to a PDF viewer; the viewer's published script
resolves the PDF link above. The table was read directly from that PDF, rather
than promoting the repository's older community transcription to primary evidence.

The same exact Wuthering Tools rule remains in
`packages/build-card-scanner/src/parse.ts#correctKnownSubstatMisreads` at inspected
revision `df07fb93e8bed77557c364cced233d04baf3fc1d`. Its tier table also lists 11.8.
The repository is GPL-3.0; this investigation reuses the verified mapping fact,
not additional source code. The existing scanner program remains GPL-3.0.

## Conclusion and limits

The game's publisher-listed tier and Bellibing canonical value are **11.8%**.
The Discord card's literal observation is **11.9%**. Therefore the discrepancy
is in the card/import representation, with no evidence of an incorrect Bellibing
tier or an additional legal in-game 11.9% roll.

It is **not established as ordinary rounding**: rounding 11.8 to one decimal
does not produce 11.9. We do not have the Discord generator's raw response/code
or an in-game screenshot of this exact physical Echo. A formatter, higher-
precision intermediate or upstream card-data error cannot be distinguished from
the available evidence. Wuthering Tools' OCR explanation does not prove that
this particular card is an OCR error, since its pixels actually contain a 9.
Internal combat precision and exact-item in-game parity remain unverified.

## Narrow scanner behavior

- Only the supported Discord substat path, confidently resolved `DEF%`, an exact
  `11.9%` raw value and a recognized DEF label qualify for the named rule.
- The original `rawName` / `rawValue` are immutable scan evidence. The unconverted
  fractional observation is also retained as `observedValue: 0.119`.
- `value: 0.118` is the canonical proposal, guarded by the current canonical
  catalog actually containing that tier. Metadata identifies the verified
  importer mapping separately from its **unverified card-display cause**.
- `needsReview` and `normalization.requiresReview` remain true. The UI explicitly
  shows both values and still requires the existing review confirmation.
- Other near-tier conversions retain `UNVERIFIED_OCR_CONVERSION` status and a
  review flag. Unknown labels/rows do not gain a verified rule. A true legal
  11.8% observation is unchanged. No other stat, main stat, canonical source,
  evaluator or Inventory behavior is changed.

Focused regressions cover the exact alias, raw-value preservation, canonical
catalog guard, unchanged legal tier, unknown rows and unrelated conversions.
The real Ciaccona card is rescanned locally to verify this path end to end.
