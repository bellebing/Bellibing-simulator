# Buling — Five Thunders Spell Array damage-class evidence review (2026-10-11)

**Worker:** Research worker 1. **Scope:** the existing `ACTIONS-BULING-1307031-DAMAGE-CLASS` and `FORTE-BULING-1307031-DAMAGE-CLASS` source blockers only. This is a **research record**, not a gameplay-rule promotion.

**Selection:** No narrower research topic was named in the worker request. This bounded, currently documented blocker was selected from `docs/PROJECT_STATUS.md` / `docs/CHARACTER_ACTIONS_COVERAGE.md`. Other research workstreams remain untouched.

**Repository baseline:** `main@102b66edec165f3d2a313a562de4049a26424924` (2026-10-08 merge). **Checked:** 2026-10-11. **Current live game version:** 3.7, whose release on 2026-09-30 is confirmed by Kuro's [official 3.7 patch announcement](https://mc.kurogames.com/main/news/detail/5569). Unless stated otherwise, the following live database pages do **not** publish immutable content versions or per-field update timestamps; an observation made during Version 3.7 is **not** proof that the site text was revised for Version 3.7.

## Question and answer

**Question:** Which Character damage-bonus class (Basic / Heavy / Resonance Skill / Resonance Liberation / other) applies to the *individual periodic Electro damage ticks* of Buling's **Five Thunders Spell Array**, as distinct from the **Flashing Thunder Spell: Harmony** impact and from Electro Flare damage?

**Result:** **PENDING — CLASS UNRESOLVED.** Independently checked public descriptions and the separately published Chinese description agree on the array's Electro damage and its timed application, but do not expressly classify the *array ticks* for damage-bonus calculations. There is no supported basis in the checked evidence to assign either Resonance Skill or Resonance Liberation damage bonus to these ticks. This review **does not close** either existing blocker or change Character Mechanics coverage.

## Reused Bellibing canonical facts (not researched anew)

- `src/data/characterMechanics/rosterActionCompletion.ts`, `BULING_ACTION_FACTS`: `factId: buling-forte-five-thunders-spell-array`, source move `1004307` (`Thunder Begets Life`), value row `1307031`. Current canonical object has `actionRole: DAMAGE`, `section: FORTE_CIRCUIT`, `actionKind: FORTE`, `scalingStat: ATK`, **`damageClass: null`**, `verificationStatus: PARTIALLY_VERIFIED`, and `modelingStatus: PENDING_INTERPRETATION`. The exact Lv1–Lv10 coefficient curve is **[0.1000, 0.1082, 0.1164, 0.1279, 0.1361, 0.1456, 0.1587, 0.1718, 0.1849, 0.1989]**, with source hit-count representation 1. Values are existing canonical source facts; **no new coefficients or tick-count inference** is proposed.
- Primary existing source pin: [DommyMM/wuwabuild `Characters.json` at `2b57a127b26b062ab58d272cd6735338507de1cd`](https://github.com/DommyMM/wuwabuild/blob/2b57a127b26b062ab58d272cd6735338507de1cd/public/Data/Characters.json); this is reused provenance **not a second independently observed provider**.
- `src/data/characterMechanics/rosterForteCompletion.ts`: `buling-forte-five-thunders-spell-array-state` already owns the 24s/2s and team-state facts, explicitly excluding an inference about tick damage class. `docs/CHARACTER_ACTIONS_COVERAGE.md` and `docs/CHARACTER_FORTE_RULES_COVERAGE.md` independently record the same unresolved class dependency; `docs/CHARACTER_MECHANICS_SOURCE_REVIEW.md` explains why the team Resonance Skill bonus cannot prove the array's own damage class.

## External source observations

| ID | Source / version indication | Exact relevant observation at 2026-10-11 | Disposition |
| --- | --- | --- | --- |
| E1 | [Wuthering.gg — Buling (EN)](https://wuthering.gg/characters/buling); provider content version **not stated**; viewed during game v3.7 | Under `Thunder Begets Life — Forte Circuit`, `Flashing Thunder Spell - Harmony` generates the array. The array deals **Electro DMG**, applies **2 Electro Flare stacks every 2 seconds for 24 seconds**. Its **separate** level-1 multiplier row is `Five Thunders Spell Array Continuous DMG — 10.00%`; the `Flashing Thunder Spell - Harmony DMG` row is `270.00%`. A **team state**, `Thunder Spell - Yin and Yang`, grants 10% Resonance Skill DMG Bonus and a later state grants 25%. **No classification for the periodic array damage is stated.** | **VERIFIED** as webpage observations; **PENDING** damage class. |
| E2 | [Wuthering.gg — Buling (Simplified Chinese)](https://wuthering.gg/zh-Hans/characters/buling); same provider/localized view, **not an independent provider** | The Chinese description calls the array `五雷荡煞阵`, the periodic row `五雷荡煞阵持续伤害` (**10.00%** at Lv1), and specifies `导电伤害` each 2 seconds for 24 seconds. `共鸣技能伤害加成` occurs in the **separate team-state description**, not as a class declaration about `五雷荡煞阵持续伤害`. | **VERIFIED** as cross-language semantic check, **not** independent consensus on damage class. |
| E3 | [Prydwen — Buling character kit](https://www.prydwen.gg/wuthering-waves/characters/buling); content version **not stated**; crawled/current during v3.7 | Lists the array under Buling's Forte Circuit / Harmony narrative, Electro damage, the same periodic 2s / 24s application and the separate team 10% / 25% Resonance Skill DMG Bonus states. No explicit periodic-tick damage-bonus classification is provided in the displayed kit narrative. | **VERIFIED** as separate-provider description. Does **not** establish class. |
| E4 | [Wuthering Waves Wiki — Thunder Begets Life](https://wutheringwaves.fandom.com/wiki/Thunder_Begets_Life); provider content version **not stated** | Categorizes the **ability page** as `Forte Circuit`, lists the continuous damage Lv1–Lv10 row **10.00%, 10.82%, 11.64%, 12.79%, 13.61%, 14.56%, 15.87%, 17.18%, 18.49%, 19.89%**, and describes the array/team-state separately. `Forte Circuit` is the skill-tree section, **not proof of a Character damage-bonus class**. | **VERIFIED** description/curve corroboration; **PENDING** class. |
| E5 | [Kuro community wiki — Buling](https://wiki.kurobbs.com/mc/item/1429461100965666816), Chinese; original page dynamically rendered, search-index excerpt reviewed; no immutable version | Public indexed excerpt likewise says `五雷荡煞阵` causes Electro damage each 2s and describes the **10% then 25% team Resonance Skill bonus** as a distinct state. Because the full live page was not extracted, this is **secondary search-index corroboration**, not a fully independently archived page. | **VERIFIED (limited excerpt only)** for wording seen; **PENDING** class. |
| E6 | [Game8 — Buling guide](https://game8.co/games/Wuthering-Waves/archives/557981); page publication timing not a source pin | Describes deploying the array with the empowered Liberation, periodic Electro Flare and team Skill DMG buffs. Neither a Liberation cast nor Skill bonus proves the resulting **array tick's own** classification. | **VERIFIED** guide observations; **PENDING** class. |

These descriptions are consistent about *what happens* and do **not** supply a direct classification of **which damage-bonus multiplier governs the periodic hit**. Cross-provider agreement on a shared wording omission is not positive mechanical proof. **No affirmative contradictory classification** (e.g. one source explicitly `RESONANCE_SKILL` and another explicitly `RESONANCE_LIBERATION`) was found in this bounded review, so it is **PENDING**, not a fabricated **CONFLICT**.

### Precise claim taxonomy

- **VERIFIED — existing canonical:** action identity/value row, Lv1–Lv10 coefficients, existing ATK source-scaling disposition, current `damageClass: null`; array periodic Electro damage, 2s application cadence, 24s lifetime, Electro Flare application; independent **team** Resonance Skill DMG Bonus states. No new gameplay truth promoted.
- **PENDING — material:** whether an array **damage tick** receives Basic, Heavy, Resonance Skill, Resonance Liberation or another class-specific bonus; whether a stronger firsthand source/measurement will settle that classification. No supported automated uptime/bonus application follows from the team-state language.
- **CONFLICT — none on the scoped classification.** Historical/pre-release descriptions of other team buff percentages must not be treated as a classification conflict or used to overwrite current canonical separate team-state facts.

## Why the apparent shortcuts fail

1. **Ability ownership ≠ damage class.** `Flashing Thunder Spell: Harmony` is used in place of a Liberation, but it **creates** an array; ownership of the cast does not formally type the subsequent ticks.
2. **Forte Circuit tab ≠ damage class.** The levelled coefficient exists within Forte Circuit. Bellibing's `section` and `actionKind` are not equivalent to `damageClass`.
3. **Team buff ≠ self-classification.** The explicit 10%/25% Resonance Skill DMG Bonus is granted to team members via a state after Intro Skills. It is not a declaration that array ticks count as Resonance Skill damage.
4. **Electro Flare ≠ array impact.** Electro Flare stacks/status effects can cause additional numbers; confusing those with the 10% ATK array periodic coefficient could produce a false in-game damage-type test.

## Minimal sufficient new evidence / repeatable test

Preferred resolution: one **firsthand source-explicit** current-version in-game tooltip or upstream gameplay definition that names the class for the *periodic array tick*, with **original language**, skill/action/source ID and version, plus independent corroboration.

If the client does not expose the class, seek a **documented in-game controlled comparison** (v3.7 or later, explicit date and build) recording:
1. Buling level, Forte skill level, sequence, weapon, Echo sets/substats, ATK/Crit/Electro/other DMG bonuses, enemy and enemy level/resistance; verify fixed team, food, temporary buffs and target state.
2. Generate Harmony and capture a **specific array tick**, isolating its damage number from Harmony's initial hit and Electro Flare/status-trigger numbers. Log tick timing and two unmodified control reproductions.
3. Change **only one known class-specific bonus** at a time (Skill versus Liberation, and other candidates if necessary), keeping ATK/element/all-DMG/crit/enemy conditions unchanged; show the before/after equipment and actual stat pages. Avoid using Buling's own Intro-triggered team buff as the only test variable, as it may alter other team-state conditions.
4. Repeat each comparison, control Crit variability, preserve raw video/frame timestamps and damage-number tables, and state the candidate formula/hypothesis *before* comparing results. A failed/ambiguous isolation remains **PENDING**.
5. Cross-check any proposed promotion against the pinned/source-localized terminology and the existing ACTIONS/FORTE audit gates; require the normal manual source-validity review before a separate implementation PR.

No gameplay client or controlled video measurements were available in this research pass. **No such experiment is claimed.**

## Downstream disposition and verification

- **Keep unchanged:** `buling-forte-five-thunders-spell-array.damageClass = null`; `PARTIALLY_VERIFIED` action; `ACTIONS-BULING-1307031-DAMAGE-CLASS` and `FORTE-BULING-1307031-DAMAGE-CLASS` blockers; existing Forte team-state facts; Buling's non-`VERIFIED` full-profile status. No changes to source facts, profiles, combat/DPS or UI.
- **Required review before any future promotion:** new source/version/provenance and exact direct class claim or replicable in-game isolation; backward-impact and relevant deterministic audits, followed by a separately reviewed code change.
- **Verification level:** `FAST / docs-only`. Per `docs/DEVELOPMENT_PROCESS.md`: check source URLs, version qualifiers, link structure and the one-file branch diff. No simulator tests/build/CI success or UI runtime claims are implied by this evidence-only record. Full MERGE gate is **not** claimed. No Handoff / Buggar update is warranted: no bug status or product readiness changed.

**Bottom line:** Evidence for *damage existence, cadence and coefficient* is reusable and already canonical. Evidence for *periodic damage-bonus class* is still missing. **Remain blocked; do not guess.**
