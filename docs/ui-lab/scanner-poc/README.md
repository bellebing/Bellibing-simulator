# Discord card scanner proof of concept — Issue #352

Local upload → real OCR/image matching → inline corrections → explicit review
confirmation. One supported format: **original English 1920×1080 wuwa-bot
Character cards, JPEG/PNG, with Skills and five fully rolled Echo panels**.
No production Build/Improve modifications, inventory writes, persistence,
backups, evaluator changes or deployment. PR #361's visual work is independent.

The implementation adapts WuWaBuilds, rather than inventing a general scanner.
Read [UPSTREAM.md](UPSTREAM.md) for the exact source pin, GPL-3.0 license and changes.

## Run the working preview

Requires Python 3.12+, Node 22.16+ and the Tesseract CLI (tested with 5.5.0).
On Linux install Tesseract through the operating system package manager first.
From the repository root:

```sh
bash docs/ui-lab/scanner-poc/setup.sh
TESSDATA_PREFIX="$PWD/docs/ui-lab/scanner-poc/tessdata" \
  docs/ui-lab/scanner-poc/.venv/bin/python docs/ui-lab/scanner-poc/serve.py
```

Open [the local preview](http://127.0.0.1:8765). Choose an original card, compare
the five panel images to their inline fields, correct any mistakes, check the
review box and confirm the draft. Cancel keeps editing. Further edits invalidate
confirmation. Reset restores the original scan; a new upload starts a new draft.
The **Save to Inventory** button is explicitly disconnected. Confirming only
keeps a detached copy for the current session; it never claims an inventory save.

The server binds only to loopback, accepts same-origin raw image uploads, limits
uploads to 5 MiB and checks header dimensions before decoding. Fixed-chrome
checks reject other layouts. Images are processed locally. Temporary OCR crops
are removed by the recognition code; originals/results are not stored or logged
by the server. Reload loses the draft. No external scanner API, accounts,
credentials, player UID parsing or third-party image upload is involved.

## Recognition and validation

1. Validate dimensions and fixed card chrome; this does not prove authenticity.
2. Crop nine known regions. Character/Weapon use SIFT with confidence/margin
   floors and text fallback; levels are read separately. Skills use their five
   known text boxes; Sequence uses the upstream node-color classifier.
3. Match Echo artwork against Bellibing's existing asset manifests. Cost badges
   narrow the search. Canonical legal Sonata badges and colors disambiguate
   look-alike Echoes. Weak matches stay unknown with an explicit suggestion.
4. Read each main/secondary strip and each of five substat rows separately.
   Names and numbers have independent crops and scale/grayscale retries.
   Unreadable bands stay in place. Raw substat text is retained, including
   any display-to-canonical normalization.
5. Validate using Bellibing's existing `echoes/browser-data.json#statEditor`,
   released identities/Weapon types, legal Sonatas, exact tiers, unique substat
   types and the existing five-slot/endgame cost-12 scope. Recommendations and
   prescribed DPS loadouts do not determine inventory legality.

Canonical definitions are not copied into a second editable catalog. The runtime
adapter reads existing generated exports and imports `CHARACTER_CATALOG` from
source. The validation endpoint is shared by initial extraction and corrections.
This is a detached scanner-review shape, **not the future account/backup schema**.
Future Inventory integration should accept this reviewed observation through its
single validation/ownership boundary, with explicit save and assignment actions.

Rank, Echo upgrade level and Weapon refinement are not printed on these three
cards and remain unknown. Rank-5 +25 stat compatibility is checked separately;
it does not establish those hidden observations. Other ranks, partial cards,
other languages, crops/resizes, arbitrary screenshots and alternate layouts are
unsupported. Similarity scores are heuristics, never calibrated confidence or
measured accuracy percentages.

## Measured recognition on the three supplied cards

The owner-provided originals were retrieved from the named private Drive folder
and manually checked against their visible text, including enlarged row crops.
Locale: English. Game/card-generator version: not supplied. This is a small
development fixture set, not independent held-out evaluation.

| Field | Lupa | Chisa | Ciaccona |
| --- | --- | --- | --- |
| Character + level | 2/2 | 2/2 | 2/2 |
| Weapon + level | 2/2 | 2/2 | 2/2 |
| Skill levels | 5/5 | 5/5 | 5/5 |
| Sequence | 1/1 | 1/1 | 1/1 |
| Echo identity / Sonata | 5/5 each | 5/5 each | 4/5 each |
| Echo costs | 5/5 | 5/5 | 5/5 |
| Main / secondary name-value pairs | 5/5 each | 5/5 each | 5/5 each |
| Raw substat numeric reads | 25/25 | 25/25 | 25/25 |
| Final substats identical to displayed values | 25/25 | 25/25 | 24/25 |
| Final substats matching canonical tiers | 25/25 | 25/25 | 25/25 |

Remaining problems:

- Ciaccona Echo 2: Capitaneus is the best image match but below the acceptance
  floor. Identity and Sonata remain unconfirmed; one explicit suggestion button
  fills them for review. Its independently read cost and stats are preserved.
- Ciaccona Echo 2 roll 5 displays DEF **11.9%**; Bellibing's existing exact tier
  is **11.8%**. Raw `11.9%` is preserved, `11.8%` is visibly marked as a proposed
  canonical normalization, and review confirmation is required. Canonical data
  is unchanged. Literal image accuracy and canonical compatibility are reported
  separately rather than counting this as an identical read.
- All three Skill panels show level 10. These fixtures do not establish accuracy
  for lower levels, other node states or other investment values. Sequence tests
  cover the three S0 cards only. More distinct cards are needed before production.

Actual measured local runs are approximately 4–7 seconds per card; see
[ACCURACY.json](ACCURACY.json) for this implementation's results. No general speed
or accuracy guarantee follows from three cards.

## Verification and private fixtures

Focused synthetic regressions (no private images needed):

```sh
TESSDATA_PREFIX="$PWD/docs/ui-lab/scanner-poc/tessdata" \
  docs/ui-lab/scanner-poc/.venv/bin/python -m unittest discover \
  -s docs/ui-lab/scanner-poc -p 'test_*.py' -v
```

Real fixture recognition:

```sh
TESSDATA_PREFIX="$PWD/docs/ui-lab/scanner-poc/tessdata" \
  docs/ui-lab/scanner-poc/.venv/bin/python docs/ui-lab/scanner-poc/benchmark.py \
  /path/to/private-fixtures --out /tmp/accuracy.json
```

That folder contains `lupa.jpg`, `chisa.jpg`, `ciaccona.jpg` and a separately
transcribed `expected.json`: keyed by Character ID, with `weapon`, five
`echoNames`, numerical `sonatas`, `mains` and five `subs` lists. Each stat is a
`[canonicalName, visibleNumber]` pair; percentages are transcribed as displayed,
not silently converted to canonical tiers. Character/Weapon levels, Skills and
Sequence are the manually verified 90/90/10/S0 fixture contract. The benchmark
runs OCR again; it does not load recorded recognition results.

`review_browser.py` uses Python Playwright and installed Chromium against the
running server. It verifies actual uploads of all three cards, corrections,
bad tiers/duplicates, reset, explicit confirm/cancel, unchanged production
localStorage, malformed uploads, request gates and 1440/1920/390 layouts.
Install Playwright separately if running this optional review harness:

```sh
python -m pip install playwright
python docs/ui-lab/scanner-poc/review_browser.py \
  --fixtures /path/to/private-fixtures --artifacts /tmp/scanner-review
```

Private cards, full recognition records and screenshots stay in ignored local
folders. Only aggregate accuracy is committed. Local REVIEW evidence does not
claim FULL/MERGE readiness or deployment. Standard repository CI remains intact.
