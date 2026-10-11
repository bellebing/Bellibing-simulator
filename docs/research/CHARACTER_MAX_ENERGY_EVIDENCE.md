# Character Max Energy — evidence review (Worker 10)

**Review date:** 2026-10-11. **Base:** \`main\` at \`102b66edec165f3d2a313a562de4049a26424924\`. **Scope:** Qingxiao, Rover (Electro), Suisui; research only. No canonical or gameplay edits.

## Decision rule and current disposition

\`CharacterGameData.level90.maxEnergy\` means the character's **maximum Resonance Energy capacity**. It is **not** a synonym for Resonance Liberation's \`Resonance Cost\`, \`Energy Regen\` percentage, Concerto Energy, or a character's Forte-specific gauge. A guide field named simply \`Energy\` does not establish its semantics. Do not infer a cap from a skill's spend, even if both happen to have the same number.

- **VERIFIED:** version-pinned, identity-matched evidence unambiguously describes the maximum *capacity*, independently checked against an actual game display or a named, separately mapped cap field in structured client/game data.
- **CONFLICT:** available sources make incompatible claims or mix incompatible meanings; the disagreement must be investigated rather than averaged.
- **PENDING:** insufficient trustworthy evidence to choose a cap. A source labelled "Max Energy" can be a candidate without making the Bellibing field VERIFIED.
- **Decision:** **all three remain \`CONFLICT\` at the research/source level and \`PENDING\` (\`null\`) in canonical data.** There is no approved replacement value or evidence to remove any audit exception.

Reviewed with [AGENTS](../../AGENTS.md), [Development Process v2](../DEVELOPMENT_PROCESS.md), [Project Status](../PROJECT_STATUS.md), [Data Verification Policy](../DATA_VERIFICATION_POLICY.md), [characters.ts](../../src/data/characters.ts), [characterRawAudit.ts](../../src/data/characterRawAudit.ts), and Worker 6's **unmerged** [Character Facts Audit, PR #257](https://github.com/bellebing/Bellibing-simulator/pull/257) ([audit file on its own branch](https://github.com/bellebing/Bellibing-simulator/blob/research/worker-6-character-build-data-coverage-20261011/docs/research/CHARACTER_FACTS_COVERAGE.md)). That audit flags all three \`X/CONFLICT\`; it is a research input, not merged main.

## Common provider defect: the apparent 140 cap

As checked on 2026-10-11, **Wuthering.gg says "Max Resonance Energy: 140" for all three targets** and also for these unrelated controls:

| Control | Wuthering.gg header | Independent Prydwen Lv90 **Max Energy** | Read-through |
| --- | ---: | ---: | --- |
| [Aalto](https://wuthering.gg/characters/aalto) | 140 | 150 | Header demonstrably disagrees. |
| [Sanhua](https://wuthering.gg/characters/sanhua) | 140 | 100 | Header demonstrably disagrees. |
| [Verina](https://wuthering.gg/characters/verina) | 140 | 175 | Header demonstrably disagrees. |
| [Augusta](https://wuthering.gg/characters/augusta) | 140 | 125 | Disagrees with Bellibing's verified golden raw reference. |

Independent reference: [Prydwen Stats roster](https://www.prydwen.gg/wuthering-waves/stats), marked **last updated 2026-10-08**, explicitly labels its column \`Max Energy\`. It **omits Qingxiao, Rover (Electro), and Suisui**, so it verifies the control check but **cannot settle any of the three targets**. The repeated 140 alongside four incompatible control records is strong evidence of an erroneous **site-wide default/template/mapping** on Wuthering.gg, *not* evidence that 140 is these characters' live capacity. Wuthering.gg also mislabels their identity subtitles (Qingxiao as "Lumi", Electro Rover as "Rover: Aero", Suisui as "Carlotta"), increasing mapping risk. A shared bad field or import is a better-supported explanation than a three-character balance change. The website does not pin a gameplay version for its header; do not label it Version 3.7 game data simply because it was retrieved during Version 3.7.

The site's Liberation \`Resonance Cost\` rows are **separate** (Qingxiao 125, Electro Rover 125, Suisui 175). That separation shows precisely why its displayed 140 cannot be rescued by reading a neighboring skill value into the max-cap field.

## 1. Qingxiao — \`qingxiao\`

**Existing Bellibing:** \`RELEASED\`, 5★ Aero/Sword, Lv90 HP 10300 / ATK 462 / DEF 1112; \`level90.maxEnergy: null\`; record \`PARTIALLY_VERIFIED\`. The exact \`qingxiao:maxEnergy\` exception in \`RELEASED_CHARACTER_RAW_PENDING\` is dated **2026-08-25**. Release was reviewed as **Version 3.6 phase 1**, independently from energy semantics.

| Candidate | Exact source/field | Source version/date | Reliability and limitation |
| --- | --- | --- | --- |
| **125 max** | [ArabWuwa Qingxiao](https://arabwuwa.com/characters/qingxiao/), Lv90 \`Base stats → Max Energy 125\` | Character explicitly **v3.6**; guide review updated **2026-08-21** | **Medium, explicit label:** genuine cap candidate, but a third-party guide with no exposed raw client field ID or independently reproduced in-game cap. Its displayed ATK 463 versus Bellibing's 462 shows differing presentation/import conventions, not necessarily a different energy cap. |
| **140 max** | [Wuthering.gg Qingxiao](https://wuthering.gg/characters/qingxiao), \`Max Resonance Energy 140\` | No source patch pin; retrieved **2026-10-11** | **Low:** same apparent 140 template problem on controls; also incorrect "Lumi" identity subtitle. |
| **125 cost, *not cap*** | [Wuthering.gg Qingxiao](https://wuthering.gg/characters/qingxiao), \`Billows Beneath Heaven → Resonance Cost 125\` | No source patch pin; retrieved **2026-10-11** | **Useful for cost distinction only.** It cannot independently confirm the 125 maximum. |

**Why the values differ:** an explicit Lv90 max claim (125) conflicts with a different site's nominal max (140); the 140 provider has demonstrated cross-character field failure. Shared numbers between ArabWuwa's max and the Liberation cost are **correlation**, not proof that the provider independently measured capacity. Neither translation nor a source-documented Version 3.6 → 3.7 change currently explains 140.

**Conclusion: CONFLICT / canonical PENDING.** **125 is the leading separately labelled candidate, not VERIFIED.** Needed: a live version-labelled cap observation or client-data mapping that proves a dedicated max-cap field for Qingxiao separately from Liberation cost. **Impacted:** \`characters.ts → qingxiao.level90.maxEnergy\`, associated provenance/verification, and \`characterRawAudit.ts → qingxiao/maxEnergy\` exception. **No changes made.**

## 2. Rover (Electro) — \`rover-electro\`

**Existing Bellibing:** \`RELEASED\`, 5★ Electro/Sword, Lv90 HP 10775 / ATK 438 / DEF 1136; \`level90.maxEnergy: null\`; \`PARTIALLY_VERIFIED\`. The exact \`rover-electro:maxEnergy\` audit exception is dated **2026-08-25**. Rover's elemental forms are distinct identities; an Aero/Havoc/Spectro cap cannot establish Electro's value.

| Candidate | Exact source/field | Source version/date | Reliability and limitation |
| --- | --- | --- | --- |
| **125 energy-labelled** | [Wutheringlab Rover Electro](https://wutheringlab.com/character/rover-electro-build/); Bellibing's 2026-08-25 source review records a 125 candidate. The current live page also has **"Energy Regen (125%~130%)"** in build priorities. | Current page checked **2026-10-11**; game-data version not pinned | **Low for a cap.** The visible 125–130 is an **Energy Regen target percentage**, *not* a 125-point capacity. Without a clearly preserved \`Max Energy\` field, the earlier generic \`Energy 125\` report must not be upgraded. |
| **140 max** | [Wuthering.gg Rover (Electro)](https://wuthering.gg/characters/rover-electro), \`Max Resonance Energy 140\` | No patch pin; retrieved **2026-10-11** | **Low:** recurring 140 header defect; incorrect "Rover: Aero" subtitle. |
| **125 cost, *not cap*** | [Wuthering.gg Rover (Electro)](https://wuthering.gg/characters/rover-electro), \`Ultimate Tactics → Resonance Cost 125\` | No patch pin; retrieved **2026-10-11** | **Separate Liberation mechanic**, not a measurement of maximum capacity. |

**Why the values differ:** "Energy" without a cap definition, a **percent Energy Regen build target**, a Liberation **spend**, and a templated \`Max Resonance Energy\` header are four distinct semantic surfaces. The controls falsify Wuthering.gg's 140 header as a generally reliable fact. No current game-version-specific source establishes a 125 cap for **Electro** rather than another Rover form.

**Conclusion: CONFLICT / canonical PENDING.** **125 is a plausible candidate through cost and legacy ambiguous labels, but not a VERIFIED capacity.** Needed: a version-pinned, Electro-form-specific max-cap field or in-game measurement; inspect the actual form identifier, not just "Rover." **Impacted:** \`characters.ts → rover-electro.level90.maxEnergy\`, provenance/verification, and \`characterRawAudit.ts → rover-electro/maxEnergy\` exception. **No changes made.**

## 3. Suisui — \`suisui\`

**Existing Bellibing:** \`RELEASED\`, 5★ Glacio/Rectifier, Lv90 HP 16713 / ATK 288 / DEF 1100; \`level90.maxEnergy: null\`; \`PARTIALLY_VERIFIED\`. The exact \`suisui:maxEnergy\` audit exception is dated **2026-08-25**. The existing audit lists **125 / 140 / 175** under conflicting **energy-labelled** provider fields without a proved common schema.

| Candidate | Exact source/field | Source version/date | Reliability and limitation |
| --- | --- | --- | --- |
| **175 max** | [ArabWuwa Suisui](https://arabwuwa.com/characters/suisui/), Lv90 \`Base stats → Max Energy 175\` | Character explicitly **v3.5**; guide review updated **2026-08-04** | **Medium, explicit label:** best direct cap candidate, but third-party mapping only; no published raw-field identifier or independent live-game validation. |
| **175 cost, *not cap*** | [Wuthering.gg Suisui](https://wuthering.gg/characters/suisui), \`Song of Thoroughfare → Resonance Cost 175\` | No patch pin; retrieved **2026-10-11** | **Cost evidence, not capacity evidence.** Match to ArabWuwa's 175 is not independent cap confirmation. |
| **140 max** | [Wuthering.gg Suisui](https://wuthering.gg/characters/suisui), \`Max Resonance Energy 140\` | No patch pin; retrieved **2026-10-11** | **Low:** repeated header defect; incorrect "Carlotta" identity subtitle. |
| **125 energy-labelled** | [Bellibing source audit](../../src/data/characterRawAudit.ts) / [catalog review notes](../../src/data/characters.ts) preserve a pre-existing 125 candidate from secondary databases, not a version-pinned dedicated \`Max Energy\` field | Recorded **2026-08-25**; original field/version unproven | **Unresolved / not independently reproduced.** Do not present 125 as a newly verified Suisui cap or as a definite current Wutheringlab label. |

**Why the values differ:** 175 is explicitly styled as a Lv90 max by one source **and** as Liberation spend by another; neither independently establishes that the two use a shared underlying stat. 140 has strong indications of a provider-wide template defect. The legacy 125 lacks reproducible semantic ownership; it might be another imported energy field or a stale version, **but those explanations are hypotheses, not findings**. Suisui's Forte resources \`Cloud Breath\` (120) and \`Floral Epistle\` (600) are **not Resonance Energy** and cannot settle this dispute.

**Conclusion: CONFLICT / canonical PENDING.** **175 is the leading explicitly max-labelled candidate, not VERIFIED.** Needed: version-labelled Suisui max-cap gameplay capture or mapped client cap field independent of \`Song of Thoroughfare\` cost. **Impacted:** \`characters.ts → suisui.level90.maxEnergy\`, provenance/verification, and \`characterRawAudit.ts → suisui/maxEnergy\` exception. **No changes made.**

## Evidence gap and next verification action

1. **Version-pinned live game capture:** record the game's exact client version/build (current context **3.7**), character identity **and Rover element/form**, a screenshot/video of any UI that **explicitly gives Resonance Energy capacity** (not \`Energy Regen\`, Forte gauge, or \`Resonance Cost\`), plus an independent view of the Liberation cost. If the client UI does not expose a numeric cap, note that absence; a full-looking gauge alone is not a quantified 125/140/175 observation.
2. **Structured client-game-data cross-check:** obtain lawful, provenance-pinned game data specifying **file/table, character numeric ID, build/version, raw key for maximum Resonance Energy, unit, and a *different* key for Liberation cost**. Show mapping on controls **Aalto/Sanhua/Verina/Augusta**, whose capacities differ. A field producing 140 for all controls fails. A site UI label without raw provenance is not equivalent.
3. **Promotion requires review:** corroborate the cap independently, resolve any surviving source conflict, then propose a **separate** source/data PR modifying the appropriate \`level90.maxEnergy\` row, per-row provenance/verification, and its exact stale \`RELEASED_CHARACTER_RAW_PENDING\` exception **together**, followed by the released-character completeness audit and affected generated/export consumers. Never modify a canonical cap merely because its Liberation cost is 125 or 175.

**Evidence collected:** currently reachable third-party HTML pages, one explicit Prydwen Lv90 controls table, and current Bellibing/Worker 6 reviews. **Not collected:** verified in-game screenshots, independently mapped client max-cap field with a game build ID, provider version history, or a changed official cap. Thus a translation, specific patch change, or raw-struct offset **cannot be confirmed as the cause**. The directly demonstrated source-side problem is Wuthering.gg's repeated 140 header (and identity-label defects). **No value is VERIFIED for promotion.**

## Affected files and checks

**Read-only scope:** \`src/data/characters.ts\` (\`level90.maxEnergy\`, per-row source notes/status); \`src/data/characterRawAudit.ts\` (\`RELEASED_CHARACTER_RAW_PENDING\` exact exceptions); the character data domain and generated Character Database/export are **potential downstream consumers, not edit targets**. Liberation cost belongs to distinct Character action/skill facts; it is **not** imported into \`level90.maxEnergy\`.

**Research-only FAST expectation:** this Markdown file is the sole branch change. Review heading/table structure, explicit source links and date/patch distinctions, and whitespace/diff. No gameplay test, canonical promotion, UI claim, Draft→Ready or merge is authorized here.
