# Team-aware Prydwen rotation references

## Scope

These profiles map basic **Prydwen-only** gameplay references for the 59 released catalog identities, captured and source-reviewed on 2026-10-11. They record commands, sequence stages, required teammate turns, preparation, mode/Intro distinctions, Echo placement and short guide conditions. The objective is a rotation to refer to, not a complete team timeline or DPS evaluator.

Coverage is **96 references**: 57 baseline sequences, 21 necessary team/mode/input variants, 16 setup/opener references and two priority-only references. **57 Characters have ordered source sequences**. Jianxin has support priorities and Yuanwu explicitly has no fixed rotation; neither receives an invented ordered loop. Upcoming identities have no reference IDs.

Advanced optimizations, high-sequence recipes and all conceivable team variations are outside the coverage claim. The source's easy/basic path is preferred for Encore, Calcharo and Hiyuki. One explicit Aemeath quickswap example is retained because the guide specifically explains its use with Changli. Short/medium Havoc Rover and hybrid/DPS Danjin distinguish basic roles. Where modes share commands (Aemeath/Denia), a reference can carry both mode keys rather than duplicating the sequence.

## Canonical ownership

- `data/source/prydwen-rotation-review-2026-10-11.json` owns reviewed source ranges, context summaries and explicit adaptations. Source hashes cover Gameplay/Rotation and Synergies, so teammate context is part of the evidence.
- `data/source/prydwen-rotation-references-2026-10-11.json` retains the selected command facts and coverage inventory. Full guide prose/reviews are not republished. Capture reads connected-web line views from an external scratch directory, checks the reviewed section hashes, deduplicates overlapping line views and bounds command extraction before Synergies. Non-bullet handoff/input instructions remain in the sequence.
- `data/source/prydwen-rotation-publication-review-2026-10-11.json` pins the explicitly approved capture hash and reference IDs. Neither refreshed pages nor changed capture data can silently promote themselves.
- `src/data/teamAwareRotationReferences.ts` is the deterministic canonical reference projection. `src/teamAwareRotationDomain.ts` defines its types; `src/teamAwareRotationReferences.ts` provides contextual lookup.

Existing `RotationProfile` presets require a complete selected team and, for execution, an actual engine binding. These references often have only partial team context. They therefore use a reference kind and remain separate from `PROFILE_CATALOGS.rotations`; no inferred complete parties, new presets or fabricated engine dependencies are created. The existing `SOURCE_SEQUENCE_ONLY` distinction is retained; unordered guide material has `SOURCE_PRIORITY_ONLY` and empty `steps`.

## Context and order

`steps[].order` is guide command order, with stage names, repetitions, optional inputs, animation-cancel instructions and switches preserved. It is not a timestamp, hit event stream or proof that every conditional action will be available. `phase` separates ordinary references, explicit loops, openers and preparation. Setup commands embedded in a printed recipe remain labeled as conditional, such as Brant's fight-start-only Skill. `priorityGuidance[].displayOrder` is guide presentation order, never a timeline.

Team combinations are OR between combinations and AND within each combination. Cartethyia's standard reference is paired with Ciaccona or the Chisa/Aero-Rover pair; the low-Erosion reference excludes those combinations. A partially matching Chisa party is insufficient to count as the full pair. Named `exampleTeams` stay examples and do not limit eligibility. Hsin/Unison names the current Jinhsi partner. Intro allocation and guide prerequisites remain explicit rather than inferred from a selected party.

Examples of preserved source distinctions:

| Case | Reference behavior |
| --- | --- |
| Hsin | Separate Electro Flare and Unison; Unison includes the secondary partner's second Outro between Hsin entries. |
| Jinhsi | Basic opener and loop; the loop includes a second hybrid/buffer turn between two Jinhsi entries. |
| Phoebe | Absolution carry versus Confession for the cited Zani use case; Confession opener setup is recorded as a condition. |
| Lucilla + Phrolova | Source footnote moves Hold Skill before entry and after Letting It Go; the ordinary recipe is retained separately. |
| Cantarella + Phrolova | Echo interruption uses Dash/Liberation; remain on field until Perception Drain lands. |
| Zhezhi + Jinhsi | Conditional later turn without Liberation, with the source-described extra Basic chain/Skill if Concerto needs it. |
| Electro Rover + Hsin/Buling | Explicit double-Intro example with an intervening partner handoff; the named party is an example. |
| Shorekeeper | Concerto-weapon R1 versus no-Concerto opener/alternating loop. R0 means no Concerto weapon, not an equipped weapon at rank zero. |
| Verina / Buling | Intro and no-Intro references preserve handoff allocation and, for Verina, Concerto-weapon access. |
| Youhu | The simple Rotation 1 requires Marcato; a generic weapon does not inherit that assumption. |
| Ciaccona | Frazzle use requires switching mode after Liberation and before Outro; both basic references retain this guide condition. |

Echo timing outside a printed sequence stays an annotation, rather than an invented insertion point. Examples include free Summons, mode-dependent Denia/Lucilla timing and omitting Nightmare: Kelpie's active cast for Ciaccona. Optional attacks stay optional. The printed Mortefi list ends at Echo; an additional Outro command is not manufactured from surrounding discussion.

## Lookup and export

```ts
import { findTeamAwareRotationReferences } from './src/teamAwareRotationReferences.ts';

const matches = findTeamAwareRotationReferences('hsin', {
  modeKey: 'unison',
  teamCharacterIds: ['hsin', 'jinhsi', 'the-shorekeeper'],
  introAvailable: true,
});
```

The helper returns **all** matching references in source order, with `contextStatus`, `needsReview` and source-example affinity. It does not choose a default or rank rotations. Unknown modes yield no mode match; absent mode/team/Intro input remains `NEEDS_CONTEXT_REVIEW` where relevant. Human-readable guide conditions always require review and are not evaluated as gameplay predicates. A match confirms declared reference context only, not legal execution or universally optimal team suitability.

`buildCharacterDatabase()` exposes `rotationReferences.references` and `rotationReferences.coverage`. Each `characters[].rotationReferenceIds` joins those canonical references; upcoming identities have an empty list. Exports are detached copies. Existing preset rotations, engines, gear, targets, team identities and readiness stay in their existing owners.

## Source limits and verification

Guide command labels may abbreviate in-game abilities. This layer does not map them automatically to exact mechanic fact IDs, hit components or inputs. It does not supply per-action time, duration, energy/Concerto ledgers, buff uptime, full teammate actions, damage or DPS. A partner handoff is a reference instruction, not a complete synthesized teammate rotation. Source descriptions of conditional changes are explicitly labeled `SOURCE_DESCRIBED_ADAPTATION` and retain the supporting source line numbers.

The existing Danjin raw Forte-threshold dispute remains open; a guide sequence does not settle it. High-sequence/advanced recipes and team contexts without an explicit source recipe are not manufactured. Source headings outside the selected scope remain in the coverage inventory for future source review.

Focused checks cover the complete identity/source joins, context OR/AND matching, unknown modes/parties, example-versus-requirement semantics, actual partner turns, Phrolova adaptations, Intro/Concerto prerequisites, pinned publication rejection, deterministic generation and detached exports. Existing profile registry/readiness, prior rotation-refresh tests and normal strict build/export are checked. Automatic draft FAST applies; FULL verification and landing remain separate.

Reproduction with fresh connected-web line captures:

```sh
python scripts/capture-prydwen-rotation-references.py --source-dir /path/to/line-captures --check
node --experimental-strip-types scripts/generate-team-aware-rotation-references.mjs --check
node --experimental-strip-types --test test/teamAwareRotationReferences.test.ts
```

Source drift requires an explicit new review; do not update pins merely to silence a failure.

## Character coverage

Each row links the Prydwen page used for its references. Variant names identify scope, not relative performance.

| Character | Recorded reference variants | Coverage |
| --- | --- | --- |
| [Aalto](https://www.prydwen.gg/wuthering-waves/characters/aalto) | standard | Basic sequence |
| [Aemeath](https://www.prydwen.gg/wuthering-waves/characters/aemeath) | mech-preparation, standard, changli-quickswap | Basic sequence |
| [Augusta](https://www.prydwen.gg/wuthering-waves/characters/augusta) | standard | Basic sequence |
| [Baizhi](https://www.prydwen.gg/wuthering-waves/characters/baizhi) | standard | Basic sequence |
| [Brant](https://www.prydwen.gg/wuthering-waves/characters/brant) | standard, main-dps-double-forte | Basic sequence |
| [Buling](https://www.prydwen.gg/wuthering-waves/characters/buling) | no-intro, intro | Basic sequence |
| [Calcharo](https://www.prydwen.gg/wuthering-waves/characters/calcharo) | standard | Basic sequence |
| [Camellya](https://www.prydwen.gg/wuthering-waves/characters/camellya) | standard, white-hair | Basic sequence |
| [Cantarella](https://www.prydwen.gg/wuthering-waves/characters/cantarella) | phrolova, standard | Basic sequence |
| [Carlotta](https://www.prydwen.gg/wuthering-waves/characters/carlotta) | skill-preparation, standard | Basic sequence |
| [Cartethyia](https://www.prydwen.gg/wuthering-waves/characters/cartethyia) | standard, low-aero-erosion | Basic sequence |
| [Changli](https://www.prydwen.gg/wuthering-waves/characters/changli) | opening-liberation, standard, double-intro | Basic sequence |
| [Chisa](https://www.prydwen.gg/wuthering-waves/characters/chisa) | opener, standard | Basic sequence |
| [Chixia](https://www.prydwen.gg/wuthering-waves/characters/chixia) | standard | Basic sequence |
| [Ciaccona](https://www.prydwen.gg/wuthering-waves/characters/ciaccona) | standard, opener | Basic sequence |
| [Danjin](https://www.prydwen.gg/wuthering-waves/characters/danjin) | damage-dealer, hybrid | Basic sequence |
| [Denia](https://www.prydwen.gg/wuthering-waves/characters/denia) | standard, opener | Basic sequence |
| [Encore](https://www.prydwen.gg/wuthering-waves/characters/encore) | standard | Basic sequence |
| [Galbrena](https://www.prydwen.gg/wuthering-waves/characters/galbrena) | standard | Basic sequence |
| [Hiyuki](https://www.prydwen.gg/wuthering-waves/characters/hiyuki) | standard | Basic sequence |
| [Hsin](https://www.prydwen.gg/wuthering-waves/characters/hsin) | electro-flare, unison | Basic sequence |
| [Iuno](https://www.prydwen.gg/wuthering-waves/characters/iuno) | hybrid, augusta-semi-dps, main-dps | Basic sequence |
| [Jianxin](https://www.prydwen.gg/wuthering-waves/characters/jianxin) | support-priorities | Priority guidance only |
| [Jingran](https://www.prydwen.gg/wuthering-waves/characters/jingran) | standard | Basic sequence |
| [Jinhsi](https://www.prydwen.gg/wuthering-waves/characters/jinhsi) | opener, standard | Basic sequence |
| [Jiyan](https://www.prydwen.gg/wuthering-waves/characters/jiyan) | standard | Basic sequence |
| [Lingyang](https://www.prydwen.gg/wuthering-waves/characters/lingyang) | standard | Basic sequence |
| [Lucilla](https://www.prydwen.gg/wuthering-waves/characters/lucilla) | phrolova, standard | Basic sequence |
| [Lucy](https://www.prydwen.gg/wuthering-waves/characters/lucy) | opener, standard | Basic sequence |
| [Lumi](https://www.prydwen.gg/wuthering-waves/characters/lumi) | standard | Basic sequence |
| [Lupa](https://www.prydwen.gg/wuthering-waves/characters/lupa) | opener, standard | Basic sequence |
| [Luuk Herssen](https://www.prydwen.gg/wuthering-waves/characters/luuk-herssen) | standard | Basic sequence |
| [Lynae](https://www.prydwen.gg/wuthering-waves/characters/lynae) | standard, mobile | Basic sequence |
| [Mornye](https://www.prydwen.gg/wuthering-waves/characters/mornye) | opener, standard | Basic sequence |
| [Mortefi](https://www.prydwen.gg/wuthering-waves/characters/mortefi) | standard | Basic sequence |
| [Phoebe](https://www.prydwen.gg/wuthering-waves/characters/phoebe) | absolution, confession | Basic sequence |
| [Phrolova](https://www.prydwen.gg/wuthering-waves/characters/phrolova) | opener, standard | Basic sequence |
| [Qingxiao](https://www.prydwen.gg/wuthering-waves/characters/qingxiao) | standard | Basic sequence |
| [Qiuyuan](https://www.prydwen.gg/wuthering-waves/characters/qiuyuan) | standard | Basic sequence |
| [Rebecca](https://www.prydwen.gg/wuthering-waves/characters/rebecca) | opener, standard | Basic sequence |
| [Roccia](https://www.prydwen.gg/wuthering-waves/characters/roccia) | standard | Basic sequence |
| [Rover (Aero)](https://www.prydwen.gg/wuthering-waves/characters/rover-aero) | standard, opener | Basic sequence |
| [Rover (Electro)](https://www.prydwen.gg/wuthering-waves/characters/rover-electro) | standard, double-intro | Basic sequence |
| [Rover (Havoc)](https://www.prydwen.gg/wuthering-waves/characters/rover-havoc) | short-burst, medium-burst | Basic sequence |
| [Rover (Spectro)](https://www.prydwen.gg/wuthering-waves/characters/rover-spectro) | standard | Basic sequence |
| [Sanhua](https://www.prydwen.gg/wuthering-waves/characters/sanhua) | standard | Basic sequence |
| [Sigrika](https://www.prydwen.gg/wuthering-waves/characters/sigrika) | standard | Basic sequence |
| [Suisui](https://www.prydwen.gg/wuthering-waves/characters/suisui) | opener, standard | Basic sequence |
| [Taoqi](https://www.prydwen.gg/wuthering-waves/characters/taoqi) | standard | Basic sequence |
| [The Shorekeeper](https://www.prydwen.gg/wuthering-waves/characters/the-shorekeeper) | concerto-r1-opener, concerto-r1-loop, no-concerto-opener, no-concerto-alternating-loop | Basic sequence |
| [Verina](https://www.prydwen.gg/wuthering-waves/characters/verina) | no-intro-concerto-r1, no-intro-no-concerto, intro-concerto-r1, intro-no-concerto | Basic sequence |
| [Xiangli Yao](https://www.prydwen.gg/wuthering-waves/characters/xiangli-yao) | standard | Basic sequence |
| [Yangyang](https://www.prydwen.gg/wuthering-waves/characters/yangyang) | standard | Basic sequence |
| [Yangyang: Xuanling](https://www.prydwen.gg/wuthering-waves/characters/yangyang-xuanling) | standard | Basic sequence |
| [Yinlin](https://www.prydwen.gg/wuthering-waves/characters/yinlin) | standard | Basic sequence |
| [Youhu](https://www.prydwen.gg/wuthering-waves/characters/youhu) | standard | Basic sequence |
| [Yuanwu](https://www.prydwen.gg/wuthering-waves/characters/yuanwu) | support-priorities | Priority guidance only |
| [Zani](https://www.prydwen.gg/wuthering-waves/characters/zani) | standard | Basic sequence |
| [Zhezhi](https://www.prydwen.gg/wuthering-waves/characters/zhezhi) | jinhsi-no-liberation, standard | Basic sequence |
