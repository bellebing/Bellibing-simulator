# Hero Card & Teams — design review

**2026-10-28 · Europe/Stockholm. Interactive concept, not production or owner-approved design.**

The Inventory concept connects to a full-workspace Hero composition and a Team workbench. The same header and memory-only item references are retained. Public main, the production Build/Improve/Sandbox pages, private engine, schemas, sources and CI definitions are untouched.

## Hero: rendered environment study

The CSS room is replaced by an original offline 3D-rendered chamber. Three camera-matched image planes provide a textured room with receding perspective, a temporary figure with its support/contact shadow, and a nearer foreground. The default **Figure study** is explicitly a faceless original demonstration, not game Character art. **Character artwork** returns to the existing reviewed upper-body source; its full-body integration remains blocked. **Scene only / Show cards** compares the same composition with and without functional cards. See [method, reference analysis, assets and limitations](HERO_DEPTH_STUDY.md).

Cinematic Still is the primary review. Subtle Parallax uses delayed, rigid translation only (background/subject up to 2px, foreground up to 6px); reduced motion retains the same still render. No runtime depth/normal maps, body warp, renderer, new infrastructure or provider work is added. This is a visual technique study, not owner-approved final Character presentation.

Three separate left Bellibing cards hold Character Stats, Weapon and visible real Skills/Forte; five right Echo cards retain primary/secondary/substat hierarchy. Skills select Augusta/Jiyan/Calcharo from the existing source-backed runtime projection and reuse the canonical builder/Forte owner. Source names, icons, prerequisites and Lv10 demo investment are unchanged. Optional details scroll within their left owner. An Echo opens the same inline Inventory Workspace and Character/slot return path; no production iframe/modal or Build Score is introduced.

A permitted full-body Character original plus reviewed light/matte/contact integration is still needed. The neutral demonstration proves neither actual Character geometry nor game readiness. Existing cutouts remain unchanged; no legs, feet or Character art were fabricated. Uniform color adjustment is not physical relighting. Browser/source checks do not replace subjective owner review.

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

Hero cutouts and member portraits reuse the repository's existing reviewed, pinned assets under the project's established selective fan-companion preview convention. Kuro Games retains copyright; this is **not** a blanket art license or production redistribution clearance. No new external artwork or font binary was added; Skill/stat icons reuse existing pinned builder assets. Image bytes and source manifests are unchanged. Original Inventory SVGs and original rendered environment are separate from the game art.

Reference manifests: `docs/ui-prototypes/assets/characters/hero-art/manifest.json` and `portraits/manifest.json`; the former records reviewed CONTAIN framing and source blobs. The accepted `Etna, Inter, system-ui` family order remains, with no new font request. Font availability and any later self-hosting rights remain a separate visual/production dependency. This concept does not claim ETNA pixel parity on a system-font fallback.

## Owner review and checks

Review **still depth first**, then subtle parallax/reduced motion, workspace-wide scene, five-card readability, visible source-backed Skills, Team sidebar/card proportions, equipment expansion, four distinct endgame comparisons and the research-pending language. Approving these visuals does not authorize production, migration, a team/DPS engine or release.

Focused Chromium review covers 1440×900, 1920×1080 and 2560×1440, actual pointer/keyboard controls, perspective preserved in reduced motion, bounded parallax, aligned values, inline panels, ownership navigation, model-Pending behavior and source/score invalidation. Current [depth-study evidence](hero-depth-review/identity.json) covers the rendered composition and preserved flows. Earlier `hero-team-review/` and `hero-correction-review/` folders retain historical candidates. Standing full-body Character acceptance remains blocked. Native `file://` navigation is blocked by managed Chromium; the portable HTML is exercised through permitted local HTTP, then offline with embedded images and no external subresources. No FULL suite, broad build or deployment is part of this review.
