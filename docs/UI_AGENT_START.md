# Bellibing UI Agent Start

Reference index for authorized UI work, not an additional mandatory startup checklist. Use [AGENTS.md](../AGENTS.md) for ground rules and read only the relevant sections below. Existing exact owner approval remains valid; [Owner UI Control](OWNER_UI_CONTROL.md) governs any new visible difference and overrides historical design directions.

| Need | Reference |
| --- | --- |
| Product behavior, owner decisions, accepted reusable patterns | [UI/UX Status](UI_UX_STATUS.md) |
| Fonts and typography | [Typography](UI_TYPOGRAPHY.md) |
| Containment, inline expansion, motion, carousel pointer thresholds, desktop sizes | [Layout & Motion](UI_LAYOUT_MOTION_CONTRACT.md) |
| Historical v34 composition/parity reference | [Build Handoff](UI_BUILD_HANDOFF_V34.md) |
| Source/data safety, checks, recovery, publication/merge | [Development Process](DEVELOPMENT_PROCESS.md) |

Preserve the affected surface's approved reference and current implementation. Read code for implementation truth; old measurements or documents do not authorize redesigns, restoring removed UI or adopting unaccepted candidates. Report conflicts rather than choosing a new appearance. The old Alpha is legacy regression material, not the forward design reference.

## Requested preview

Provide the usable review path, revision and relevant checks; a preview request does not itself require commit, push, FULL Verify, merge or deployment. Follow the requested local Live Preview when applicable. A local/candidate preview is not deployed-main evidence.

For an already committed standalone v34 entrypoint, the immutable source format is `https://rawcdn.githack.com/bellebing/Bellibing-simulator/<HEAD_SHA>/docs/ui-prototypes/v34-functional.html`. Use it only when that entrypoint matches the requested surface; update the reference if it moves. Otherwise use the actual matching build/artifact. Do not claim preview availability without checking it.

If remote review is unavailable, report that and use a suitable local preview. The built-product fallback is `npm run build`, then serve `dist` with `python3 -m http.server 4173 --directory dist` when those tools are available. No publication or merge merely to obtain a preview.
