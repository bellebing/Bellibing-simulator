# PR #365 integrated static preview

Packaged from the existing clean public build at `57313f5c16f139178de36649ea210aed3e283358`.
This directory contains the actual integrated application, not the #361 concept.
Only file-based navigation is adapted for GitHack; product source/layouts are unchanged.
Open `build/index.html`; its navigation opens Improve, Sandbox, My Teams and Inventory.
Import is available in Build. IndexedDB account data stays in the reviewing browser.

Hosted/private engine execution is disabled in this static package. OCR requires
its documented local scanner/prepared browser assets and is not provided by GitHack.
The owner performs remote visual verification; publication does not assert it passed.

No archives, owner images, credentials, private engine source or local test artifacts
are packaged. Existing asset content uses the same Git blobs as its tracked source.
