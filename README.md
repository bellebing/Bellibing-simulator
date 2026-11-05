# Bellibing Simulator

Wuthering Waves Character Build, Inventory, Teams, Improve and isolated Echo Sandbox.

**Design starts in the running app and the current user request.** Earlier UI sketches, measurements and approvals are historical references, not instructions. Bellibing uses **ETNA** for display headings and **Inter/system sans** for utility text; see [font provenance](docs/UI_TYPOGRAPHY.md).

- [Published UI preview (merged main)](https://bellebing.github.io/Bellibing-simulator/ui-preview/)
- [Project status and active work](docs/PROJECT_STATUS.md)
- [How to run and check locally](docs/DEVELOPMENT_PROCESS.md)
- [Functional product/data semantics](docs/PRODUCT_CONTRACT.md)

Local Windows launcher: `START_BELLIBING_LOCAL.bat` (see [Windows local](docs/WINDOWS_LOCAL.md)).
Public regression suite: `npm test`. Production web build: `npm run build`. These checks test implementation, not the quality of the visual design.

The current integration candidate lives in Draft PR #365; it is distinct from published `main`. Actual game data and private decision-engine readiness are documented separately from presentation.
