# Working on Bellibing

This is a **quick reference**, not an AI instruction or a UI design rulebook.

Start with the **running interface and the task being requested**. Look at the affected source, make a coherent change, inspect the result in a real browser and adjust from feedback. Old concepts and review documents are historical examples, never mandatory layouts.

**Where things are:** [Project status](PROJECT_STATUS.md), [product/data meaning](PRODUCT_CONTRACT.md), [typography](UI_TYPOGRAPHY.md), [Windows local run](WINDOWS_LOCAL.md). GitHub code/CI identifies the actual implementation; Draft PR #365 is not merged `main`.

**Useful commands:** `npm test` for public regressions, `npm run build` for the web output, relevant browser tests for changed interactions. Test saved-state behavior when changing Build/Inventory/Improve; exercise scanner with real examples when changing OCR; source-related changes use the corresponding provenance and impact checks. Review the actual page for visual work rather than relying on test results alone.

The game-data pipeline, account persistence and private engine have their own **technical interfaces**; use them as implementation facts, not as instructions about colors, layouts, animation or text. Unsupported gameplay results are reported as Pending. Publishing or merging remains a distinct user decision.
