# Hero Card & Teams — design review

**2026-10-28 · Europe/Stockholm. Interactive concept, not production or owner-approved design.**

The Inventory concept connects to a full-workspace Hero composition and a Team workbench. The same header and memory-only item references are retained. Public main, the production Build/Improve/Sandbox pages, private engine, schemas, sources and CI definitions are untouched.

## Hero: one workspace, depth before motion

Build is one full-width environment behind the functional cards, not an image panel between three independent columns. Ceiling rings/columns extend behind both sides, a distant wall separates the Character silhouette, and a projected floor continues underneath the cards. Seven scene planes provide static perspective, light separation and foreground depth. The room has no central card border or rounded image frame. Three separate left cards use the accepted Improve/Sandbox dark blue-black surfaces, restrained gold details and solid readable text: Character Stats, Weapon, Skills/Forte. Five right Echo cards retain primary/secondary/substat hierarchy. Inventory and Team composition are preserved.

**Cinematic Still** has no pointer movement. **Subtle Parallax** moves distant planes opposite the Character (≤6px horizontally; foreground ≤10px). Leaving the workspace resets movement. Reduced motion retains the static projected floor. Optional source details scroll within the left owner without changing the environment or Character framing.

Skills are visible by default: five real Character-specific icons, actual identities, Lv10 demonstration investment and the existing prerequisite-node structure. `hero-presentation.mjs` selects Augusta/Jiyan/Calcharo from the existing source-backed `assets/skills-runtime.json`; `src/characterBuilderAssets.ts` and `src/characterForteUi.mjs` remain the canonical owners. The browser reuses `FORTE_COLUMNS`, `normalizeForteState` and `forteValue`, not new gameplay rules. Selection shows the actual Skill name; deeper details use its existing source description/values. No account or Build Stats mutation is implied.

**Full-body artwork is a blocking design dependency.** The existing reviewed cutouts remain byte-identical, visibly upper-body artwork. Their lower fade is original source content. No legs/feet, false foot-contact shadow, stretched anatomy or generative reconstruction were added. The current delivery explicitly says “Full-body artwork pending · composition review only”. This is a corrected composition study, **not** fulfillment of the owner's standing-full-body Definition of Done. See [asset investigation and actual-delivery review](HERO_CORRECTION_REVIEW.md).

Select an Echo to open the existing concept's inline Echo Workspace in Inventory with the same Character/slot return path. No production editor iframe/modal or Build Score is introduced. CSS layers add no renderer dependency, body geometry, new pose, depth map or physically correct relighting. Owner visual acceptance remains separate from browser checks.

## Teams: one workbench, two tasks

**My Teams** retains a left collection with three member portraits per saved example. Team DPS sorting preserves selected-team identity. The right side shows three members, their clearly synthetic damage contributions, actual demo equipment references where entered, and a rotation-structure disclosure. It is not a playable/sourced rotation. An unsupported example clears numbers and rotation rather than retaining stale figures.

**Endgame** keeps the same left/right composition. The right side switches between Matrix and Tower, sample encounters, optional Circuit selection, team assignment, order, round/stage and source-status disclosures. Independent summary fields distinguish single-team DPS, a sample roster combination, order and projected score. No sum of unrelated Team DPS is called an endgame score.

The three visible encounter assignments/round buttons are a finite illustration, not a claimed Matrix team cap or Tower stage count.

The example plan deliberately uses the lower-DPS Augusta Core alongside Jiyan Vanguard rather than the highest individual Double Carry, illustrating the roster-overlap trade-off. This is a fixed fixture, not proof of a best allocation. Assignments are stored per round; sample available uses count across rounds. Conflicts clear the example score. A Circuit edit/order change also clears it. Loading the example explicitly restores its fixed settings/figures.

Team lists, selection, sorting, equipment inspection, mode switching, round/order editing, example availability conflicts and navigation are functional UI. All DPS/contribution/availability/HP/score figures are synthetic. **No combat, global optimization, game legality or score formula runs.** The optional roster-improvement disclosure links back to Build; cost-effective Echo ranking still requires the real private Improve service, which is not connected here.

## Rules/source findings and withheld claims

| Source reviewed | What informs this concept / what remains unverified |
| --- | --- |
| [Kuro's 3.2 release notes](https://wutheringwaves.kurogames.com/en/main/news/detail/4447) | Establish Endstate Matrix as recurring content. The launch/cycle announcement is historical, not proof of the current October phase. |
| [Game-data mirror: Adversity Vanguard S2 Phase 3](https://wuthering.th.gl/db/endstate-matrix/matrix_8) | Describes three-member teams, separate zones, Power Circuits, Vigor and equipment occupation; lists sample encounter/Circuit names. Version range alone does not verify the player's current cycle, server, enhancements or balances. The UI labels these as research/sample context. |
| [Tower system reference](https://wuthering.gg/guide/system/tower-of-adversity) | Describes stage-dependent Vigor, recovery by resetting a result and Area Effects. Tower does not inherit Matrix's sample use counter, HP carry-over or score. Current stage costs/buffs remain pending. |
| [Matrix HP/score discussion](https://allthings.how/endstate-matrix-score-guide-how-to-hit-100k-points-in-wuthering-waves/) | Secondary reporting suggests HP continuity and round multipliers. It is not promoted into canonical mechanics or a score formula; the HP disclosure is explicitly an unverified illustration. Other guides conflict about Vigor and cycle details. |
| [Tacet Lab](https://dj12421.github.io/Tacet-Lab/) | Functional/reference research only. Its collection and team paths are not a visual template; no DOM, screenshots or artwork were imported from it. |

Consequently there is no live-cycle badge, real “best legal team” verdict, predicted clear, computed buff effect, real HP transition, optimal order or score guarantee. Matrix's 1/2-use demo fixture is not a canonical per-Character Vigor table. Tower's real Vigor/score remain Pending. The 42,800 example points are an authored presentation number, not a derivation from DPS or the encounter list.

## Artwork and ownership boundary

Hero cutouts and member portraits reuse the repository's existing reviewed, pinned assets under the project's established selective fan-companion preview convention. Kuro Games retains copyright; this is **not** a blanket art license or production redistribution clearance. No new external artwork or font binary was added; Skill/stat icons reuse existing pinned builder assets. Image bytes and source manifests are unchanged. Original Inventory SVGs and new CSS architecture are separate from the game art.

Reference manifests: `docs/ui-prototypes/assets/characters/hero-art/manifest.json` and `portraits/manifest.json`; the former records reviewed CONTAIN framing and source blobs. The accepted `Etna, Inter, system-ui` family order remains, with no new font request. Font availability and any later self-hosting rights remain a separate visual/production dependency. This concept does not claim ETNA pixel parity on a system-font fallback.

## Owner review and checks

Review **still depth first**, then subtle parallax/reduced motion, workspace-wide scene, five-card readability, visible source-backed Skills, Team sidebar/card proportions, equipment expansion, four distinct endgame comparisons and the research-pending language. Approving these visuals does not authorize production, migration, a team/DPS engine or release.

Focused Chromium review covers 1440×900, 1920×1080 and 2560×1440, actual pointer/keyboard controls, perspective preserved in reduced motion, bounded parallax, aligned values, inline panels, ownership navigation, model-Pending behavior and source/score invalidation. Current [correction evidence](hero-correction-review/identity.json) includes 18 Hero/Team, 14 Inventory, 4 portable and 7 packaged correction checks. Earlier `hero-team-review/` evidence is historical. The standing-full-body acceptance remains blocked. Native `file://` navigation is blocked by managed Chromium; the portable HTML is exercised through permitted local HTTP, then offline with embedded images and no external subresources. No FULL suite, broad build or deployment is part of this review.
