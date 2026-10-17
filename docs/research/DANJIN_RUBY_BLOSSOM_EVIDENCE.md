# Danjin — Ruby Blossom / full-power Chaoscleave evidence

**Worker 12 · research only · checked 2026-10-11 · base: `main` at `102b66edec165f3d2a313a562de4049a26424924`**

**Disposition: ENGLISH TEXT CONFLICT EXPLAINED BY LOCALE EVIDENCE; RUNTIME THRESHOLD STILL PENDING.** English source text requires **over 120** Ruby Blossom while setting maximum capacity to **120**. Current Simplified Chinese, Japanese and Korean descriptions instead support full-power at **120**. That is positive source evidence, **not** a convenience reinterpretation of English; the external sites are mirrors rather than authenticated, version-pinned game-client captures. Do **not** automatically change canonical mechanics or remove `FORTE-DANJIN-1000807-FULL-POWER-THRESHOLD`.

## 1. Existing contradiction and repository baseline

The pre-existing, reviewed `DommyMM/wuwabuild` English source (character `1602`, move `1000807`, *Serene Vigil*) contains description parameters **`[60, 120, 120, 120]`** and simultaneously states:

- Chaoscleave becomes available after **60** Ruby Blossom.
- The full-power branch requires Ruby Blossom to reach **over 120**.
- Ruby Blossom is capped at **120**; full-power consumes **120**.

With a hard maximum of 120, the stated English predicate `resource > 120` cannot be satisfied. Parameter values do not themselves prove an operator. The baseline is `src/data/characterMechanicsSourceReview.ts` (checked 2026-08-29, pinned upstream `5fa70b11f1d84fb644e4dbed47873708da0fe66f`) and [Character Mechanics Source Review](../CHARACTER_MECHANICS_SOURCE_REVIEW.md).

On current `main`, `src/data/characterMechanics/rosterForteCompletion.ts` keeps the exact blocker `FORTE-DANJIN-1000807-FULL-POWER-THRESHOLD` on fact `danjin-forte-full-power-threshold-conflict`, `verificationStatus: PENDING`, `modelingStatus: PENDING_INTERPRETATION`. Another fact, `danjin-forte-chaoscleave-scatterbloom-chain`, independently preserves the 60-resource unlock and follow-up relationship. Danjin is **PARTIALLY_VERIFIED** with Forte incomplete, while her **ACTIONS are VERIFIED** for source curves/classes, not full branch execution.

`src/data/characterMechanics/rosterActionCompletion.ts` preserves the original/enhanced action rows without selecting the impossible trigger: `5700022` (Chaoscleave), `5700023` (Scatterbloom), `5700024` (Full Energy Chaoscleave), `5700025` (Full Energy Scatterbloom), all from move `1000807`. The two Full Energy actions retain `PENDING_INTERPRETATION` for activation.

Worker 6's **unmerged Draft PR [#257](https://github.com/bellebing/Bellibing-simulator/pull/257)**, [Character Facts Coverage](https://github.com/bellebing/Bellibing-simulator/blob/research/worker-6-character-build-data-coverage-20261011/docs/research/CHARACTER_FACTS_COVERAGE.md), independently tags Danjin Forte as **X / CONFLICT** and effects as **P/P**, with no inferred ≥120 rule. It is *candidate review material*, not main's canonical state.

## 2. Original-language wording

The following excerpts are from visible language-specific displays of the game text, **not from an independently fetched first-party text map**. Chinese `彤华`, Japanese `心紅` and Korean `단화` are the locale-specific Ruby Blossom resource; Chinese `缭乱` / Japanese `繚乱` denote Chaoscleave and `纷落` / `零れ華` denote Scatterbloom.

| Language | Short exact excerpt | Meaning and evidence source |
| --- | --- | --- |
| **English** | “reaches over 120”; “can hold up to 120” | Strict **>120** and max **120**; contradictory. [Wuthering.gg EN](https://wuthering.gg/characters/danjin); compatible with Bellibing's pinned English source review. |
| **Simplified Chinese** | `若〖彤华〗积攒至120点时`; `〖彤华〗上限120点` | “When accumulated **to 120**”; maximum **120**. [Wuthering.gg ZH](https://wuthering.gg/zh-Hans/characters/danjin); [older Wuthering.wiki CN](https://wuthering.wiki/cn/character_1602.html); [Bilibili CN](https://wiki.biligame.com/wutheringwaves/%E5%85%B1%E9%B8%A3%E8%80%85/%E4%B8%B9%E7%91%BE). |
| **Simplified Chinese (normal trigger)** | `〖彤华〗积攒60点以上时` | “At least 60 points”; **a different condition** from full-power 120. Same Chinese sources. |
| **Japanese** | `〖心紅〗が120Pt以上溜まった場合`; `〖心紅〗は最大120Pt` | **120 or more**, capped at **120**. [Wuthering.gg JA](https://wuthering.gg/ja/characters/danjin). |
| **Korean** | `「단화」 120pt까지 축적 시`; `최대 누적 가능: 120pt` | Accumulated **to 120**, max **120**. [Wuthering.gg KO](https://wuthering.gg/ko/characters/danjin). |

**Interpretation:** Chinese explicitly says reaches 120, Japanese says ≥120, Korean says to 120. This is substantive evidence for a candidate `resource == 120` (equivalently `>=120` if the maximum is truly 120). English `>120` remains preserved as a conflicting locale string; **it has not been silently edited**. Because these sites can mirror a shared upstream data dump, the multilingual agreement is **not independent runtime proof**. A live first-party/client text comparison is still required to close the blocker.

## 3. Mechanics: text-verified versus runtime-unverified

| Mechanic | Supported by text/source | Still unverified |
| --- | --- | --- |
| Ruby Blossom generation | The Forte says Resonance Skill **Crimson Fragment** grants Ruby Blossom. | Exactly which hit/cast, per-event amount, timing and overflow behavior. |
| Resource capacity | **120** is stated by EN/CN/JA/KO and Bellibing's pinned review. | Instrumented hard cap versus a display cap or hidden excess. |
| Normal Chaoscleave | From **60 Ruby Blossom**; hold Basic Attack, consume held Ruby Blossom, deal Havoc damage **classified as Heavy Attack**, heal Danjin. | Exact input timing, accounting and recovery order in a real client. |
| Full-power Chaoscleave | Locale-text **candidate at 120**; spend **120** for higher Chaoscleave **and Scatterbloom** multipliers on the same use. | Actual runtime predicate/operator, branch selection and accounting. |
| Scatterbloom | A **Basic Attack after Chaoscleave** performs the follow-up; the source classifies it as Havoc **Heavy Attack** damage. | It is not an automatic hit. Chinese says “within a certain time” (`一定时间内`); no exact duration, cancel or interruption policy is established here. |
| Lv1 normal curves | Chaoscleave `5700022` **30.00% × 7**; Scatterbloom `5700023` **90.00%**. | Numbers are sourced curves, not a measured combat test. |
| Lv1 full-energy curves | Chaoscleave `5700024` **72.00% × 7**; Scatterbloom `5700025` **216.00%**. | Source damage coefficients/class/scaling verified; trigger remains PENDING. |

All four actions use source-explicit **ATK scaling** and the **HEAVY** damage class in Bellibing's ACTION layer. The source names an enhanced attack path, but the English full-power predicate cannot be executed literally at the source cap. Do not confuse a valid coefficient row with verified resource-driven execution.

## 4. Versions, observations and competing explanations

**Versions checked / limits.** The original character appeared in **Wuthering Waves v1.0** ([Danjin Fandom change history](https://wutheringwaves.fandom.com/wiki/Danjin)). Older [EN](https://wuthering.wiki/character_1602.html) and [CN](https://wuthering.wiki/cn/character_1602.html) mirror pages contain the same cross-language disagreement; their web crawl age does **not** identify an immutable game build. Bellibing's original pinned review used `wuwabuild@5fa70b11`, and the later source-driven ACTIONS/FORTE work used `wuwabuild@2b57a127`. A cross-language/commit-specific diff for move `1000807` was **not extracted directly** from the large upstream files in this investigation. A stable commit hash is provenance, not proof that the language variants were re-fetched here.

As of **2026-10-11**, EN/CN/JA/KO mirrors still disagree. [Version 3.7 was published around 2026-09-30](https://steampeaks.com/app/3513350/wuthering-waves/patches), but these mirror pages do **not** document the build version they extracted. **No independently verified Danjin-specific threshold revision between versions** has been established. The possibilities are a longstanding English localization error, stale third-party translations, or undocumented client/source changes. The source record does **not** distinguish these with certainty.

**Gameplay reports (secondary, not controlled proof).** A [DanjinMains post dated 2024-11-19](https://www.reddit.com/r/DanjinMains/comments/1gul8wc) discusses different swap-cancel behavior for **60 versus 120 Ruby Blossom** Heavy Attack variants and attaches a video. [Pity.gg's Danjin guide, updated 2026-08-19 and checked through v3.6](https://pity.gg/wuthering-waves/characters/danjin/guide) says 120 is the full-multiplier gauge. Together, these make a usable full-gauge branch plausible. They do **not** isolate exact hit multipliers, show instrumented Ruby Blossom values or establish the code operator. The Reddit video was **not** independently frame-verified in this work. No controlled in-game test was performed.

## 5. Remaining uncertainties and promotion evidence required

**Best-supported candidate:** full-power activates *on reaching 120*, not after 120. The basis is **specific CN/JA/KO text**, **not** “what logically must work.” **Not yet verified:** executable predicate, true runtime cap, branch/spend timing, Scatterbloom execution window and any cross-version changes.

To remove the blocker safely:

1. **Record first-party text on an identified build:** EN and ZH (ideally also JA) Serene Vigil screens, exact patch/build ID, date, original screenshots/video and source hashes. If feasible capture immutable locale textmaps + description parameter mappings for move `1000807` from the **same** client version.
2. **Controlled S0 game test:** Capture reachable gauge states below 60, **60**, one reachable intermediate below 120 (ideally **119**), exactly displayed **120**, and an attempt to over-generate at full bar. Record resource before/after Chaoscleave; demonstrate separately normal/full-power **Chaoscleave and subsequent Scatterbloom** on the same fixed enemy with fixed attack, Forte level, buffs, crit conditions, resistance and defense. Observe damage/hit count and whether resource overflow is possible. Do not invent a 119 state if charging granularity forbids it.
3. **If claiming a version change, compare equivalent primary EN/ZH artifacts or controlled gameplay from two named builds.** Without them, historical drift stays **UNKNOWN**.
4. **Manual source-validity disposition:** Reconcile locale evidence and observations, record authoritative source/operator/consumption precisely, then and only then revise the owning Forte/RESOURCE fact and source-blocker registry. Add boundary regressions for below-60, 60, intermediate, 120, attempted overflow, spent resource and Scatterbloom eligibility. Preserve raw action data and layer separation.
5. **Keep the full-character gate separate:** Even after threshold resolution, Danjin remains `PARTIALLY_VERIFIED` until all six Character Mechanics areas independently qualify. This report does not establish DPS readiness.

**Deliverable boundary:** Documentation-only research. **No gameplay code, no canonical promotion, no merge.**

## Source index

- Current repo contracts: [Character Mechanics Source Review](../CHARACTER_MECHANICS_SOURCE_REVIEW.md); [blocker registry](../../src/data/characterMechanicsSourceReview.ts); [Forte facts](../../src/data/characterMechanics/rosterForteCompletion.ts); [ACTION facts](../../src/data/characterMechanics/rosterActionCompletion.ts); [Forte audit](../CHARACTER_FORTE_RULES_COVERAGE.md). Repository `main` as of the stated SHA.
- Worker 6 [Draft PR #257](https://github.com/bellebing/Bellibing-simulator/pull/257), not merged: [Character Facts Coverage audit](https://github.com/bellebing/Bellibing-simulator/blob/research/worker-6-character-build-data-coverage-20261011/docs/research/CHARACTER_FACTS_COVERAGE.md).
- Historical pinned sources (references verified from Bellibing's source-review code; raw large JSON not re-fetched here): [wuwabuild @ 5fa70b11 Characters.json](https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json), [wuwabuild @ 2b57a127 Characters.json](https://github.com/DommyMM/wuwabuild/blob/2b57a127b26b062ab58d272cd6735338507de1cd/public/Data/Characters.json).
- Language mirrors checked 2026-10-11: [EN](https://wuthering.gg/characters/danjin), [ZH](https://wuthering.gg/zh-Hans/characters/danjin), [JA](https://wuthering.gg/ja/characters/danjin), [KO](https://wuthering.gg/ko/characters/danjin); historical-style [EN](https://wuthering.wiki/character_1602.html), [CN](https://wuthering.wiki/cn/character_1602.html), [Bilibili CN](https://wiki.biligame.com/wutheringwaves/%E5%85%B1%E9%B8%A3%E8%80%85/%E4%B8%B9%E7%91%BE).
- Supplemental, not controlling: [DanjinMains, 2024-11-19](https://www.reddit.com/r/DanjinMains/comments/1gul8wc); [Pity.gg v3.6-checked guide](https://pity.gg/wuthering-waves/characters/danjin/guide).
