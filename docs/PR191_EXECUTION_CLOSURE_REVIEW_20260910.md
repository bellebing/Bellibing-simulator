# PR191 reuse and profile execution review

Main is the merged/post-merge-verified #190 baseline `c37b3ea5c0833f0483e2da2ac9cca36d42e1902f`. This review belongs to draft #191, `codex/reuse-first-execution-2026-09-10`; no further merge is authorized. It supersedes consumed recommendations in the historical #190 reuse audit, not that audit's source evidence.

## Completed checkpoints

- `2582a29`: record #190 integration and post-merge Verify1102/Export1001/Deploy147, 800/800 tests and live byte parity.
- `31abdf6`: Zhezhi/Lumi isolated Outro bindings; six presets/five Characters, canonical RAW_ONLY and unknown stack metadata preserved. Verify1103/Export1002 passed.
- `35acaaa`: Lorelei/Nightmare Lampylumen exact attack facts; Cantarella/Zhezhi pending edges gain existing hit capability. Verify1104/Export1003 passed at exact head `35acaaab16c9a21652ed773121e2fbbf70092044`; both downloaded logs show 809/809 tests, zero failures. Full paginated review inspection found zero unresolved threads, with no external AI pass observed.

The follow-ups add Sentry Construct's two explicit alternative damage facts, Roccia/Sanhua isolated Outro bindings, and Voidwing Moth's independent use-to-Outro ATK effect. All 83 pending edges, six Reference Team dependencies and readiness 43/3/9/2 remain open/unchanged. The semantic partition becomes **26 unreviewed / 24 primitive-available-needs-timeline / 7 source-conflict / 9 source-semantics / 17 profile-specific**; no edge is removed.

## Remaining Echo cohort review

Only missing semantics were researched; the two completed Echo facts and unchanged numeric effects were not re-transcribed.

| Exact Echo | Established evidence | Accepted scope / parked gap |
| --- | --- | --- |
| Sentry Construct `echo-60000835` | [Echo description and damage entries](https://wuthering.wiki/monster_330000120.html) explicitly separate a normal frontal strike and a charged aerial dive. Both entries are ATK/Glacio and agree with the Rank-5 description. | Two single-component alternative ACTIVE_CAST facts use the existing reader/kernel. Caller selects and proves the exact variant and landed count. They are not two hits of one cast. Capacitor threshold, initial state, charge/reset lifecycle, freeze and timing remain unmodeled. The published base cooldown is not a simulated reset policy. |
| Reminiscence: Denia `echo-60002005` | [Version 3.6.13 Echo text](https://wuwa.wiki/en/codex/echoes/60002005) and [explicit Rank-5 rendering](https://wuthering.gg/echos/reminiscence-denia) agree on summon identity, Fusion percentage and cooldown. Existing incoming Fusion transfer already has a canonical binding. | PARK attack promotion: inspected descriptions do not establish the scaling stat or a normalized damage-entry/component mapping. Gear's ATK main stat is not damage scaling proof. No new attack or duplicate transfer is created. |
| Voidwing Moth `echo-60001985` | [Version 3.6.13 Echo text](https://wuwa.wiki/en/codex/echoes/60001985) separates press from hold; the hold description is a maximum of 12 damage instances. | PARK active attack: scaling stat is missing and maximum hold hits do not establish actual landed count or a fixed complete hold action. Swap-cancel in Denia's profile does not prove a damage variant. The separately stated use-to-Outro ATK transfer is implemented at `8c17b31`; its acceptance does not authorize attack damage. |
| Nightmare: Mourning Aix `echo-60000925` | [Echo damage entry](https://wuthering.wiki/monster_330000200.html) establishes ATK/Spectro base damage but the skill also changes damage against Spectro Frazzle targets. | PARK: target qualification and the extra modifier's exact damage bucket remain outside the existing unconditional fact contract. Zani Heliacal Ember equivalence for Eternal Radiance does not establish this Echo's target condition. No unqualified base attack silently omits that requirement. |

These are bounded findings, not claims that no other source can ever resolve the parked fields. Data mirrors can share underlying game data and are not described as independent experiments. No provider code, unlicensed dataset or animation-derived timing is copied.

## Primitive-to-profile closure audit

The current work queue was joined to every owning preset, loadout, team and rotation. All **17** presets with pending edges still have `SOURCE_SEQUENCE_ONLY` rotations and no canonical `rotationSeconds`. No complete new ENGINE_MODELED path was found. Relative action order can prove some event identities but cannot supply hit occurrence, state, buff overlap or a DPS denominator.

| Close or representative profile | Pending / primitive-available | Missing execution proof |
| --- | --- | --- |
| Cartethyia | 2 / 0 | Defier's Thorn DEF timing remains source-blocked; full rotation duration/state is absent. Lowest edge count does not make this executable. |
| Calcharo | 4 / 2 | Void Thunder stack mutation/refresh and the profile event/timing recipe remain missing. |
| Carlotta | 5 / 3 | Sentry damage, The Last Dance and Frosty Resolve's Glacio window are available; Skill-stack lifecycle and exact rotation denominator remain missing. Variant occurrence and capacitor history still belong to the profile. |
| Lumi | 5 / 3 | Three equipment primitives and the isolated Outro binding do not resolve Heron evidence conflict or supply resource/state/rotation timing. |
| Rover Aero | 4 / 2 | Existing Unbound Flow/Fleurdelys ordering is reusable; optional Skyfall Severance, exact total duration and Bloodpact healing overlap remain BUG-012. |
| Denia Fusion / Tune | 6 / 1; 6 / 1 | Source sequence identifies owners and outgoing recipients, but flexible/cancelled Echo timing, mode/resource state and exact duration remain unproven. The new Voidwing transfer requires an actual proven use event; an intended swap-cancel alone does not supply it. |

No canonical numeric fact was sourced again for this audit. The 24 available edges remain pending; the six Reference Team blockers, BUG-008/010/012/028/029, other documented conflicts and null Max Energy fields remain untouched. Current detailed generated evidence is saved in `artifacts/pr191-profile-closure-audit.json` in the working checkout.

## Completed reuse and parked future work

The completed Roccia/Sanhua slice reuses the same isolated-transfer contract for Roccia (two presets/two Characters) and Sanhua (one). Their combined three additional consumers bring the four new Outro owners to nine presets/eight Characters. Existing canonical numeric facts and unknown stacks are unchanged. Sanhua's exact Silversnow wording is reviewed against [current game text](https://wuthering.wiki/character_1102.html), which states Basic Attack amplification; no generic Deepen alias is introduced. Wrong scope/owner/provenance, repeated activation, expiry, switch-out and explicit Basic-hit consumption are tested. Brant's PENDING_INTERPRETATION fact remains excluded.

1. Profile closure remains the goal; the audit above found no complete current event/duration proof. Do not manufacture a recipe merely because an equipment primitive now exists.
2. Implemented: Voidwing's separately stated use-to-Outro ATK effect reuses the existing transfer primitive with an exact use event (not the Denia/Hyvatia summon event). The Rank-5 source row owns the amount and both windows; the adapter requires rank, absence of a previous active transfer and explicit tied-event order. No damage/Intro prerequisite, early removal, refresh or profile timeline is added. Denia Tune's exact transfer edge remains pending but now has capability support. Database capability references expose this boundary without duplicating source values. Its damage scaling/variant execution stays parked independently.
3. Sonata S03/S10 need a bounded lifecycle review. Canonical values/caps/durations are present, but do not settle at-cap refresh or shared versus independent expiry. S03 also needs trigger-category independence resolved; do not implement a generic two-stack counter from prose alone. No Sonata fact changes here.
4. Action-resource evidence stays feasibility-first. The inspected Sanhua game-data page separates displayed Skill Concerto Regen from damage-entry Resonance/Concerto columns. This does not establish cast versus hit yield or ER interaction. No resource ingestion or automatic yield mapping is warranted by field labels.

The PR remains one bounded canonical-binding/exact-attack lane. Profile engines, resource ingestion and general stack-state infrastructure would be separately assessable scopes, not automatic additions merely to keep a long pass running.


## Integration review checkpoint — 2026-09-11

The full `main...PR191` diff was reviewed as one system, starting at `8c17b310c590ad6d6c7ba8756f59334749b9ecbb` (six commits, 24 files, +698/-51) against main `c37b3ea5c0833f0483e2da2ac9cca36d42e1902f`. The four later candidate checkpoints are `0c94f96` (Sentry), `f2b4bb6` (Roccia/Sanhua), `8c17b31` (Voidwing), and corrective runtime commit `ee7b6ffcfa0bece59cd742b9a59449fa1b92fe1a`. This documentation checkpoint freezes the reviewed scope. No further feature family or merge is authorized.

| Review area | Result |
| --- | --- |
| Character Outro adapter and both test suites | Four exact fact/owner/provenance joins retain VERIFIED/RAW_ONLY and null stacks. Values are parsed from canonical facts. Real Outro, recipient, absence of prior activation and tied query/switch order remain explicit. Recipient switch-out ends the isolated effect permanently. Mixed/repeated windows are rejected. Six independent terms are never automatically aggregated. Sanhua's exact wording alone maps Basic Deepen to amplification; Brant is rejected. Representative caller-proven Rover Havoc Basic-hit composition passes. |
| Echo facts, source review, registry/hit tests | Lorelei and Nightmare Lampylumen each have one exact Rank-5 ATK component. Sentry has two alternative ATK/Glacio facts. Echo descriptions and damage-entry scaling/class/components were re-read on 2026-09-11. Exact identity/rank/variant/component/landed count and the existing ATK/HP/DEF snapshot/kernel are preserved. No capacitor/reset/freeze or Intro-as-active behavior was added. |
| Voidwing canonical row, transfer adapter and tests | Independent Rank-5 Echo-use-to-Outro ATK transfer, confirmed against both recorded source mirrors. Denia/Hyvatia summon semantics are unchanged. No attack/Intro prerequisite, early switch removal, refresh policy or profile occurrence is inferred. Amount and both durations stay in the canonical effect row. |
| Database and queue composition | All exported support references join existing exact source facts, with detached output. Four new Outro owners are discoverable through nine presets/eight Characters. Gear has 66 effects/40 Echoes; attack registry has eight profiles/ten facts, nine ACTIVE_CAST. Only four queue classifications move from unreviewed to primitive-available; no profile dependency is removed. |
| Tests and architecture | Shared transfer state and existing hit kernel are reused. No second lifecycle engine, copied runtime numeric table, profile engine or UI layer is introduced. Existing tests retain legacy family checks while new tests exercise boundary failures and real damage composition. |
| Preservation | `web` tree is byte-identical to main (`a96ae396ee393a2623a29fa4bf13c7b536cb72ad`), including Alpha and `/ui-preview/`. Canonical Character facts, source-profile catalogs, backward-impact dependency definitions, Sonata effects and all unrelated integrated code are unchanged. Flamewing WIP remains outside this worktree/PR. |

### Defects found and corrected

Voidwing's optional caller catalog previously accepted a changed stat bucket, missing review provenance, unreviewed wielder restriction, nonpositive amount, or duplicate same-ID rows. This could apply an unsupported effect under an otherwise valid use/Outro event. Two regression tests failed against `8c17b31` before the bounded fix. `ee7b6ff` rejects those inputs while continuing to read legitimate canonical numeric values; detached activation results and existing Denia/Hyvatia behavior pass. No game fact or event semantics changed.

Documentation also retained the stale 28/22 queue partition, five-active-Echo count, RAW_ONLY-family exclusion wording and Voidwing-as-next recommendation. These are reconciled here; historical checkpoint evidence remains labeled as history.

### Truthful execution boundary

Fresh derivation finds **83 pending profile–dependency edges, referring to 72 distinct dependency IDs**. Reused IDs occur in multiple profiles; earlier shorthand “83 IDs” meant edges, not 83 unique strings. The edge partition remains **26 / 24 / 7 / 9 / 17**, with zero semantically-reviewed-implementation-pending edges. Readiness is still **43 / 3 / 9 / 2**, and only Augusta/Ciaccona are DPS_READY. All 17 pending profiles are SOURCE_SEQUENCE_ONLY and lack canonical rotationSeconds. No complete new executable profile path exists.

All six Reference Team dependencies remain PENDING. BUG-008/010/012/028/029, Zani's separate Frazzle-infliction mapping, Abyss Surges 587/588 conflict, unresolved Max Energy and Buling/Danjin/Xiangli Yao source-blocked mechanics remain open. Denia/Moth attack scaling, Moth landed hold count, Mourning Aix target/modifier, S03/S10 stack lifecycle, resource cast-vs-hit/ER semantics and profile timing/denominators remain parked. These future features are not defects blocking this integration candidate.

### Verification and decision protocol

Initial head `8c17b31`: downloaded Verify #1107 (`34530335246`) and Export #1006 (`34530335263`) logs both confirm **817/817 tests, zero failures**. Verify includes all required source/profile/readiness audits, strict build, three real-Chrome regressions and whitespace. Initial fully paginated review has zero reviews, threads, comments or requested reviewers; this is not external approval.

Reviewed runtime `ee7b6ff`: **819/819 local tests, zero failures**, all nine repository audit commands and strict build pass. Character mechanics/source tests are included in the full suite; profile closure/export references were independently re-derived. The documentation checkpoint changes no runtime tree relative to that commit. Final-head full Verify and Export must run after the checkpoint push; their exact SHA/run numbers/results and final fully paginated review readback are recorded in PR #191, AI Handoff and `artifacts/night-backend-resume.md`, avoiding stale/self-referential commit evidence here.

Engineering review is clean after the bounded validation fix. The final outcome is `PR191_READY_FOR_EXPLICIT_MERGE_AUTHORIZATION` only after the checkpoint's exact-head gates and PR/Handoff synchronization pass. Keep the PR DRAFT / OPEN / UNMERGED. Stop there: no next lane starts in this pass, and no absence of external review is described as approval.
