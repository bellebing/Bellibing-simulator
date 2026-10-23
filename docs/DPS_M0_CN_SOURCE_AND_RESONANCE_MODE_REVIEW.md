# DPS M0 — Chinese source leads and selectable Resonance Mode review (2026-10-22)

**Scope:** source research and a minimal contract proposal only. This is a **stacked Draft review on public #349**, not a change to canonical character mechanics, source pins, runtime admission, game stats, recommended defaults or UI behavior. No privately owned numeric engine details are reproduced here.

## Readiness boundary and baseline

At the reviewed #349 public head / paired private Draft #40: **48/59** selected Character native references and independent numerical parity, **47/59** genuine Chromium reference/five-Echo comparisons, **0/59** gameplay-qualified. These are *Draft experimental model* results, not current production/main readiness. The 11 missing selected executions are Aalto, Baizhi, Calcharo, Chixia, Jianxin, Lingyang, Lumi, Taoqi, Yangyang, Youhu and Yuanwu. Changli separately has a reviewed executable alternative not reachable from its current chooser. Do not convert any source lead below directly into model coverage or infer an unverified reference rotation.

Current project evidence: [public coverage](DPS_FIRST_TEAM_COVERAGE.md), [Issue #348](https://github.com/bellebing/Bellibing-simulator/issues/348), public [PR #349](https://github.com/bellebing/Bellibing-simulator/pull/349), private companion [PR #40](https://github.com/bellebing/Bellibing-engine-private/pull/40).

## Verified **source claims**: selectable modes, not executable-model admissions

Kuro's [3.0 release notes (Huiji transcription)](https://wuwa.huijiwiki.com/wiki/3.0%E7%89%88%E6%9C%AC) introduced a switch on the Character skill screen for some resonators; [3.3 release notes (Huiji transcription)](https://wuwa.huijiwiki.com/wiki/3.3%E7%89%88%E6%9C%AC%E3%80%8C%E8%87%AA%E6%98%9F%E6%B5%B7%E5%B0%BD%E5%A4%84%E5%9B%9E%E5%93%8D%E3%80%8D) add shortcut switching on party setup. It is a per-character gameplay setting: **one canonical Character identity and owned Build, multiple choices**.

| Canonical ID / Chinese name | Mode A | Mode B | Direct basis | Admission warning |
|---|---|---|---|---|
| `hsin` / 心 | Electro Flare — 共鸣模态·电磁 | Unison — 共鸣模态·同奏 | [Kuro official 3.7 notes](https://mc.kurogames.com/main/news/detail/5569), [TapTap detailed community guide](https://www.taptap.cn/moment/854680763013009342), existing project/native reviewed names | Only Electro Flare has a verified **experimental native** route; Unison stays Pending/rejected. Do not claim the unavailable Kin/Bilibili rotation was inspected. |
| `aemeath` / 爱弥斯 | Tune Rupture — 共鸣模态·震谐 | Fusion Burst — 共鸣模态·聚爆 | [Huiji original skill text](https://wuwa.huijiwiki.com/wiki/%E7%88%B1%E5%BC%A5%E6%96%AF/%E6%8A%80%E8%83%BD%E8%AF%A6%E6%83%85), [Prydwen English kit](https://www.prydwen.gg/wuthering-waves/characters/aemeath) | Form: 爱弥斯形态/机兵形态 is a *combat transformation*, not an additional selectable mode. Each mode needs separate exact source profile/model proof. |
| `lynae` / 琳奈 | Tune Rupture — 共鸣模态·震谐 | Tune Strain — 共鸣模态·集谐 | [Chinese kit](https://wuthering.gg/zh-Hans/characters/lynae), [English direct mode naming](https://www.prydwen.gg/wuthering-waves/characters/lynae) | Her mode is independent of party role and any alternate rotation. Do not reuse Tune Rupture source buffs on Tune Strain. |
| `denia` / 达妮娅 | Fusion Burst — 共鸣模态·聚爆 | Tune Strain — 共鸣模态·集谐 | [Chinese kit](https://wuthering.gg/zh-Hans/characters/denia), [English mode/buff comparison](https://www.prydwen.gg/wuthering-waves/characters/denia) | Mode-dependent Outro and party effects (plus differences in recommended Echo sets/weapons) require separate source/effect/profile checks. 布景之形/幻灭之形 are *forms*, not extra selectable modes. |

**Coverage qualification:** four positively corroborated IDs here, **not yet a 59/59 canonical all-roster exclusion audit**. Explicitly scan all RELEASED skill records for true selectable 共鸣模态切换 before declaring inventory complete. Do not create additional modes based only on a team archetype name, intro/outro variant, transformation, Sequences or a source module's `semanticMode`.

**False-positive investigation:** `mornye` / 莫宁 can **respond to both** Tune Rupture/Tune Strain; see [Chinese kit](https://wuthering.gg/zh-Hans/characters/mornye) and [3.0 release description](https://wuwa.huijiwiki.com/wiki/3.0%E7%89%88%E6%9C%AC). That does **not** establish a selectable resonance-mode toggle. Her 基准模式/广域观测模式 are combat forms; keep Mornye as **NOT_CONFIRMED_SELECTABLE**, pending canonical client switch proof. Also no extra modes for Phoebe's damage/support combat styles absent selectable Resonance Mode evidence.

## Source-backed team leads; execution is a separate gate

- **Aemeath / Tune Rupture:** 爱弥斯 + 琳奈 + 莫宁. **Aemeath / Fusion Burst:** 爱弥斯 + 达妮娅 + 千咲. [Prydwen's distinct archetype section](https://www.prydwen.gg/wuthering-waves/characters/aemeath) and [Chinese TapTap rotation discussion](https://www.taptap.cn/moment/768444590389725453) corroborate the distinction. Existing public source-team contexts already contain these member cores; selection must bind mode requirements for **each member**. Both full actual-build model paths still need their own explicit admission/parity status.
- **Hsin / Electro Flare:** 心 + 漂泊者·导电 + 穗穗; guide alternatives include 卜灵 or 千咲 as documented, *not* auto-executable substitutions. [October 1 TapTap player guide](https://www.taptap.cn/moment/854680763013009342) supports the composition, not exact animation/hit timings. **Unison**: the same writer explicitly speculates about 心 + 锁暝 + 守岸人 and does not establish a measured executable trio. Keep Unison Pending.
- **Calcharo source-recovery lead:** Kuro **player-authored**, hosted guide [卡卡罗+吟霖+维里奈](https://wuwaguide.kurogames.com/zh-Hans/?role_id=1301&strategy_id=10118) contains explicit `启动轴` and `循环轴`, ordered actions and gear/ER discussion. The hosting domain **does not make the community author an official mechanics authority**. This is an actionable source candidate for the current blocked `calcharo` row; translate every action and test available original-client/native profile and complete clock/hit mapping independently before admission.
- **Baizhi source-recovery lead:** [player-written Camellya+Sanhua+Baizhi simple rotation](https://www.taptap.cn/moment/608732366948534582) gives Baizhi `AAAEAAAA重击QR` at unspecified investment, with no verified hit/time/event annotations. Current default source context is Camellya/Sanhua/Baizhi. Record as ordered-rotation candidate **only**; no model coverage claim.
- **Jianxin:** existing reviewed Iuno/Jianxin/Shorekeeper S0/R1 written guide exposes only a passing *Jianxin segment* with native cast/ER; full team action/form/hits/timing remains Pending. Do not silently import S2 requirements, filler frames or unsupported Forte events.
- **Other eight blocked IDs** Aalto, Chixia, Lingyang, Lumi, Taoqi, Yangyang, Youhu, Yuanwu: no new complete, source-verifiable native rotation obtained in this bounded review. Older composition-only recommendations do not close a gap.

**Access limits:** The specific Kin Kuro-hosted Hsin guide and Bilibili video previously logged in private follow-up were not directly readable; do not attribute a 30s/25s rotation to their original content. Bilibili's *public wiki* can be readable even when `bilibili.com/video` is HTTP 412. Do not bypass site controls.

### Source promotion gates

1. Preserve source title, author, original URL, version/date, Chinese name, exact ordered action notation, investment (S0–S2 and R1 where applicable), kit/mode/team requirements, and immutable capture digest where possible.
2. Independently join current original-client skill/action/hit/energy and existing pinned private native source module. Distinguish real actions from user-written shorthand. Source order **does not** supply precise frames or total cycle duration.
3. Map all three members and their mode settings, roles, sequences, equipment, buffs, cast and ER requirements. Unresolved / incompatible input yields Pending, not zero, and does not change original engine pins.
4. Only after bounded approved source review: explicit separate reference/profile admission, original-TypeScript independent numeric parity, actual five-card browser in Sandbox **and owned Current/Candidate**; check stale outputs. Gameplay qualification is a later, independent gate.

## Minimal proposed mode contract (NOT implemented)

Preserve `Character{id}`, `CharacterBuildState`, the current source-context catalog and private profiles. Add only **source-reviewed selection descriptors** in a separate relation:
```ts
type ResonanceModeOption = {
  characterId: string; modeId: string; label: string;
  sourceRefs: { url: string; sourceKey?: string }[];
  modeSourceStatus: 'REVIEWED_SELECTABLE' | 'PENDING';
};
type SelectedMember = { characterId: string; resonanceModeId: string | null };
type ModeScenario = {
  selectedCharacterId: string;
  members: [SelectedMember, SelectedMember, SelectedMember];
  teamContextId: string | null; // exact reviewed team context
  scenarioRevision: number;
};
```
The existing `team.modeRequirements: Record<characterId, mode>` is a **constraint**, not independent proof of player selection; don't confuse `semanticMode` (model role) with `resonanceModeId` (gameplay toggle). Match all three selected mode IDs to the reviewed source context, resolve a compatible mode-bound rotation/profile/ER/effects/equipment recommendation, and reject ambiguous mismatches. A user switch never writes owned gear or creates a new Build. No matching team/context => explicitly Pending; no executable native profile => no DPS. Changing any member mode must retire cached/replayed results and increment the existing scenario/team revision before Worker requests. Include ordered member IDs+modes, source context, source profile/rotation ID and existing build/equipment revisions in stable scenario identity.

Existing reusable pieces: public `src/characterDefaultTeams.mjs`, `docs/ui-lab/v1.1/modules/character-context.js`, `team-selection.js` (`modeRequirements`, `sourceTeamModeChoices`, `changed`), `sandbox-state.js` (`advanceContext`, lease freshness); private `source-role-mode-bindings.mjs` and `sandbox-reference.mjs` already fail closed on incompatible source modules. These are starting points, not a license for a large Build redesign.

### Isolated visual sketch — owner approval required before larger UI work

```
Hsin                                  [Build unchanged]
Resonance Mode     [ Electro Flare ● ] [ Unison ]
Source team        [ Hsin / Electro Rover / Suisui ]  [Other teams]
Team DPS           Experimental native model / Pending per exact context

On [Unison]: new reviewed Unison source team or "Team Pending";
               "DPS Pending — Unison model unsupported".
```

### Required checks for any future implementation

- Canonical: 59 unchanged RELEASED Character IDs, no duplicate owned builds or synthetic Characters; detect valid selectable mode roster and false positives (Mornye forms).
- Selection: all three independent member modes preserved/validated; mismatched `team.modeRequirements`, unsupported team or stale source profile fail closed.
- Revision/persistence: change one mode invalidates old team, cached worker results, current/candidate comparisons and ER acceptance; no mutation to user Weapon/Echoes, default/Custom intent or other Character builds across reload.
- DPS: Hsin Flare retains the existing experimental guarded path; Unison stays Pending. Aemeath, Lynae and Denia require mode-by-mode native parity/gate proof *before* any new DPS display; no copied buffs/rotations.
- UI: isolated desktop/mobile concept, keyboard/touch and explicit Pending; user visually approves before shared Build/Sandbox UI integration.
- CI: focused data/source/audit tests, strict build, relevant true Chromium owner + no-account paths, exact public/private heads for any final candidate; no merge or deployment without separate owner GO.

**Review disposition:** reference leads only. No numeric source pin, canonical gameplay record, evaluator, build or UI state changed. Public/private Drafts, 59/59 target and all Pending guards remain as-is.
