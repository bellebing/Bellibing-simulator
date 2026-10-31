# Global Character import workspace — Issue #352

Compact global import → real OCR/image matching → Review in Build a Character
→ inline corrections → explicit session staging → detached Improve preview. One supported format:
**original English 1920×1080 wuwa-bot
Character cards, JPEG/PNG, with Skills and five fully rolled Echo panels**.
No production Build/Improve modifications, inventory writes, persistence,
backups, evaluator changes or deployment. PR #361's visual work is independent.

The implementation adapts WuWaBuilds, rather than inventing a general scanner.
Read [UPSTREAM.md](UPSTREAM.md) for the exact source pin, GPL-3.0 license and changes.

## Review import on the existing Bellibing page

For visual review, use the **original Build page from #361**, rather than the
scanner development shell. The source page is served from a separate unchanged
checkout at `9b457579818c212380d5911592a34c2076d64282`; its portable artifact SHA-256
is `a14a9af71df2a09a42adf48461ade5e31edf0bc240e545c92fbf11ad4c441c80`.
Only the Import Character trigger and compact drop component are mounted over it.
The component reuses the existing scanner markup/styles inside a Shadow DOM, so
those styles cannot change the page's Character, Weapon, Skills or Echo layout.
No source files in #361 are edited or copied into this scanner branch.

```sh
PYTHONPATH=/workspace/scanner-deps TESSDATA_PREFIX=/workspace/scanner-tessdata \
  OMP_THREAD_LIMIT=1 python docs/ui-lab/scanner-poc/serve.py --port 8766 \
  --existing-design-root /path/to/unchanged-design-checkout
```

Open `http://127.0.0.1:8766/existing-build#build`. The optional existing-page route
is absent without that explicit source-root option. `review_existing_site.py`
compares the original page with the added component at 1440×900 and captures it
at 1920×1080; it checks unchanged main DOM, Character/Echo geometry, storage and
actual file-picker/dismiss behavior. Private screenshots remain ignored.

This is **visual/input integration only**. Image ingestion uses the real local
scanner, but the adapter stops before binding values into the original Build
owner. It exposes no fake Review or account-save action. The older scanner shell
below remains an OCR/editor test fixture; it is not the accepted site's design.
Connecting a detached imported draft to the existing Build controls remains work
before claiming end-to-end integration on this page.

## Run the scanner development fixture

Requires Python 3.12+, Node 22.16+ and the Tesseract CLI (tested with 5.5.0).
On Linux install Tesseract through the operating system package manager first.
From the repository root:

```sh
bash docs/ui-lab/scanner-poc/setup.sh
TESSDATA_PREFIX="$PWD/docs/ui-lab/scanner-poc/tessdata" \
  docs/ui-lab/scanner-poc/.venv/bin/python docs/ui-lab/scanner-poc/serve.py
```

Open [the local preview](http://127.0.0.1:8765). The header has three zones:
Bellibing/home on the left; genuinely screen-centered Build / Improve / Team |
Echo Sandbox; Import Character / Inventory / Account on the right. At narrower
widths the centered tools row moves beneath the logo/account controls.

Import Character opens a compact, button-anchored popover over the current
workspace. It does not navigate, scroll the page or move the tool underneath.
The empty target shows only “Drag build card here”; click it to upload, drop one
image, or paste a screenshot with Ctrl / ⌘ + V. Escape, the trigger or an outside
click closes it. After recognition it stays compact and offers Review / Add to
account. Review opens the one editable workspace in Build a Character; there is no second import
editor. Add to account is disabled until persistent Inventory is connected.
Closing/reopening the popover retains the pending scan, and route changes retain
the active Build editor. File paste/drop from the embedded Sandbox also feeds the compact importer; Review still opens Build,
without injecting imported state into Sandbox. A failed upload preserves the
previous review.

In Build a Character, compare the original Echo panels with their editable
fields, correct any mistakes, check the review box and explicitly confirm. Cancel keeps editing.
Edits invalidate confirmation; reset restores the original scan without dropping
later rows. Confirmed Characters stay **staged / not saved** in this tab. After
confirmation, directly preview that staged Character in Improve.
Both **Add to account** entry points remain disabled until Inventory is
connected. Reload clears staging.
No success message claims that an owned Character or Echo has been saved.

Build is the single editable imported draft. Improve shows the confirmed equipment
as a detached, read-only preview.
Improve Current and Candidate remain separate and empty; no evaluator is added.
Team has a memory-only draft using staged Characters, without saved ownership or
team evaluation. Inventory lists staging, clearly labeled as not owned/saved.
Account is a guest-session surface; login/synchronization are deferred.

Echo Sandbox reuses the existing standalone V1.1 Sandbox without altering its
source files or state owners. Its private execution host is not connected by
this scanner server; execution stays Pending under the existing boundary.
Opening/closing import or navigating away does not recreate its frame/selection.
The compact popover and Build editor use ordinary DOM components, not an iframe or modal.
The only modal is the explicit confirmation before session staging.

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
   look-alike Echoes. A weak match gets SIFT/RANSAC geometric verification against
   same-cost templates: at least eight inliers, six distinct matching locations,
   sufficient spread/ratio and a margin over competing candidates. A legal
   canonical Sonata badge is required. If these checks fail, keep it unknown.
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
| Echo identity / Sonata | 5/5 each | 5/5 each | 5/5 each |
| Echo costs | 5/5 | 5/5 | 5/5 |
| Main / secondary name-value pairs | 5/5 each | 5/5 each | 5/5 each |
| Raw substat numeric reads | 25/25 | 25/25 | 25/25 |
| Final substats identical to displayed values | 25/25 | 25/25 | 24/25 |
| Final substats matching canonical tiers | 25/25 | 25/25 | 25/25 |

Remaining problems:

- Ciaccona Echo 2: Capitaneus now passes the partial-art geometric check (eight
  inliers, six distinct target/source locations, 0.8 inlier ratio, spread 0.116,
  inlier margin two) and its Gusts of Welkin badge. The original SIFT ratio floor
  is unchanged. All 15 identities/Sonatas are recognized without manual selection.
- Ciaccona Echo 2 roll 5 displays DEF **11.9%**; Bellibing's existing exact tier
  is **11.8%**. [The investigation](DEF_PERCENT_IMPORT.md) verifies that tier
  against Kuro's official table and the exact Wuthering Tools importer fix.
  Raw `11.9%` and observed fraction `0.119` are preserved; `0.118` is marked as a
  verified importer compatibility proposal that still requires review. Why this
  card prints 11.9% remains unverified; it is not established as ordinary rounding.
  Canonical data is unchanged. Literal image accuracy and canonical compatibility
  are reported separately rather than counting this as an identical read.
- All three Skill panels show level 10. These fixtures do not establish accuracy
  for lower levels, other node states or other investment values. Sequence tests
  cover the three S0 cards only. More distinct cards are needed before production.

Actual measured local runs are approximately 4–8 seconds per card; see
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
running server. It verifies all three cards through upload/drop/paste, automatic
identity/Sonata assignment, global import on every main route, retained
Team/Sandbox context, direct staged Improve navigation, review invalidation,
bad tiers/duplicates, reset, confirm/cancel, unchanged production/session storage,
malformed uploads, private-path/request gates and centered 1440/1920/390 layouts.
Keyboard clipboard-file ingress is exercised in Chromium. Native OS file dragging
and file-picker interaction still need user acceptance on the target platform.
`review_import_popover.py` is the focused overlay check: compact button anchoring
on all seven routes, unchanged page geometry/scroll, both desktop widths,
Escape/outside-click (including Sandbox), file-picker activation, one actual
Chisa scan, compact scan-result actions, Review-to-Build navigation, retained
Build corrections and explicit staging. Its screenshots stay local.
Use this for popover changes rather than repeating the full card/browser matrix:

```sh
python docs/ui-lab/scanner-poc/review_import_popover.py \
  --fixtures /path/to/private-fixtures --artifacts /tmp/import-popover-review
```

Install Playwright separately if running either optional review harness:

```sh
python -m pip install playwright
python docs/ui-lab/scanner-poc/review_browser.py \
  --fixtures /path/to/private-fixtures --artifacts /tmp/scanner-review
```

Private cards, full recognition records and screenshots stay in ignored local
folders. Only aggregate accuracy is committed. Local REVIEW evidence does not
claim FULL/MERGE readiness or deployment. Standard repository CI remains intact.
