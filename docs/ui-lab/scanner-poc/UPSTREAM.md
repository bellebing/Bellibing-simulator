# WuWaBuilds reuse and license

This isolated scanner program is licensed under **GNU GPL version 3**. See
[LICENSE](LICENSE). It is separate from Bellibing's private engine and exchanges
only public canonical game-data projections with the repository.

Upstream: [DommyMM/wuwa-ocr](https://github.com/DommyMM/wuwa-ocr), by Dominic A,
commit `f7eb67cbe0d0749b8902f318230f403e0bd3e7ea` (inspected 2026-10-30).
Upstream's root LICENSE is GPL-3.0. Source and license are retained here; this
notice does not relicense the rest of Bellibing or third-party game artwork.

## Reused material

- `vendor/card.py`: adapted recognition code. Its fixed subregions, banded stat
  OCR, batched Tesseract calls, character/weapon image matching, cost matching,
  sequence detection and Echo-family disambiguation are reused.
- `vendor/image_integrity.py` and `vendor/assets/chrome_ref_*.npy`: unchanged
  card-header and fixed-chrome checks/reference arrays. Bellibing additionally
  refuses recognition if those reference arrays are missing.
- `vendor/Costs/cost*.jpg`: upstream cost-badge matching references.
- The nine applicable outer regions in `scanner.py` come from upstream
  `server.py#IMPORT_REGIONS`; the player watermark region is intentionally unused.

Changes to `card.py`: canonical asset-path injection; deterministic BF matching
instead of randomized FLANN; a guard for short matcher results; unresolved
substat bands retain their row index; Character-name OCR has a similarity floor.
`vendor/data.py` is a Bellibing adapter, replacing the upstream data loader. No
upstream Character/Weapon/Echo/stat database is imported. It uses existing
canonical JSON exports, asset manifests and released Character catalog through
`canonical.mjs`. Stat aliases only translate labels/units; they add no game facts.
Set recognition uses canonical legal sets and image hues/features, rather than
the upstream independently maintained numerical set table.

`scanner.py` uses the recognition primitives rather than the upstream all-in-one
`process_card` entry point. In particular, its main-stat defaulting, inferred
Lv90 fallback and server storage/reporting code are **not used**. Main/secondary
values are actually read. Rank, Echo level and refinement stay unknown. The
existing small legal-tier tolerance is retained for substat display rounding,
with raw text and a visible normalization marker; it is not applied silently.

The whole scanner directory, including the new server/review UI, is distributed
with GPL-3.0 source. Original game images remain attributable to Kuro Games and
retain the repository's existing asset provenance/rights boundaries. This proof
does not bundle private engine code, owner card images or player identifiers.

## OCR model

The setup downloads English `tessdata_best` at commit
`9ddc24e750eec0994223a9edc3fcb434a2244f3b`, SHA-256
`8280aed0782fe27257a68ea10fe7ef324ca0f8d85bd2fd145d1c2b560bcb66ba`, matching
upstream's production model pin. The downloaded model is not committed. Its
[Apache-2.0 license](https://github.com/tesseract-ocr/tessdata_best/blob/main/LICENSE)
is independent of the scanner's GPL license.
