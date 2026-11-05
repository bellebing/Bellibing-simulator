# Bellibing UI agent — lightweight workflow

**Owner reset 2026-11-05:** No mandatory UI design/layout rulebooks and no per-detail `UI DECISION` gate. [Owner UI Control](OWNER_UI_CONTROL.md) records retirement of the former lock.

1. Understand the user's current goal; inspect the actual running UI and affected code. For broad changes, also check current GitHub PR/branch, PROJECT_STATUS and Handoff.
2. ETNA display / Inter-system utility is the retained visual font identity ([Typography](UI_TYPOGRAPHY.md)); old v34/#361/Improve designs are optional inspiration.
3. Propose or implement a coherent scoped design with real interactive HTML/CSS/JS. Never fake components with screenshots or mislabel crops/edits as new art.
4. Preserve real data, equipment ownership, import/OCR correction, Current/Candidate, Sandbox, recovery and pending/game-source semantics.
5. Show real browser captures and test changed interactions. Iterate from owner feedback; no separate permission for each visible difference. Merge/deployment still require explicit authorization.

Local built-preview fallback: `npm run build`, serve `dist` with `python3 -m http.server 4173 --directory dist` and open the actual route. A preview is not evidence of a live deployment or current PR head unless verified.
