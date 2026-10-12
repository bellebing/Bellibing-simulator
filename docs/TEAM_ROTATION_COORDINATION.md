# Team rotation coordination and combat preparation

## Purpose and source coverage

This layer turns the merged Prydwen member references into broad, explainable team descriptions: which reference belongs in the chosen team, why that variant is relevant, where partner work occurs and what differs from the guide example. It prepares later player-build combat evaluation; it does not synthesize a full action timeline or calculate approximate team DPS from guessed durations.

All **96 references / 59 released identities** are classified once as field window, re-entry, shared window, setup or priorities. Six team-description patterns are available. **19 reviewed team/partner cases** connect reference IDs to roles, source reasons, broad windows and short informational differences. Cases are a bounded source-supported set, not all possible teams. Remaining combinations retain member references; caller-declared roles can produce a clearly labeled structural description.

Prydwen Gameplay/Rotation/Synergies evidence for the relevant pages was re-read on **2026-10-12** and matched the pinned reference sections. The source review retains URLs, line numbers, section hashes and short paraphrased claims. It separates a named trio from a partner context whose third member is not established. Broad flow remains `REVIEWED_MEMBER_GUIDANCE_SYNTHESIS`, even when the source directly explains a particular handoff: this does not claim that a complete measured team timeline was published.

## Ownership

- `data/source/team-rotation-coordination-review-2026-10-12.json` owns the reviewed pattern definitions, all-reference classifications, cases, evidence and the first reference-to-fact hit binding. It pins the merged reference artifact.
- `src/data/teamRotationCoordination.ts` is the deterministic typed projection. Existing references own action order; Character facts own coefficients; combat adapters own math. No attack curves, weapon values or buff durations are copied.
- `coordinateTeamRotation()` in `src/teamRotationCoordination.ts` resolves a description for three unique released Characters.
- `src/combat/teamRotationReferenceBridge.ts` discovers actual combat capability and delegates a reviewed single-hit/Echo comparison to existing adapters.
- `buildCharacterDatabase().teamRotationCoordination` exports the catalog as detached data alongside the existing references. Existing profiles, engines, default gear, Current/Candidate state and readiness are unchanged.

## Description and choice

```ts
const description = coordinateTeamRotation({ members: [
  { characterId: 'hsin', modeKey: 'unison' },
  { characterId: 'jinhsi' },
  { characterId: 'the-shorekeeper' },
] });
```

The consumer can display the pattern label, `summarySv`, `broadFlowSv` and a compact `info` note. Members carry the chosen/suggested reference, alternative candidates, preparation references, participation explanation and role basis. `PLAYER_SELECTED` and `SOURCE_SUGGESTION` are distinct: a source hint is not persisted as the player's build choice. Missing source modes remain hints; teammates do not silently select a player mode.

Case matching uses the complete required combination, exclusions and explicit mode/ref choices. More specific matching parties are considered first; this is context matching, not a performance rank. Certain variants require an explicit mode to avoid making shared-DPS the automatic default. A case's role is a hint; caller roles/refs remain visible. Incompatible explicit refs remain shown with an info point and cannot use the numeric binding. Source differences are labeled rather than silently replaced.

Unknown parties produce `MEMBER_GUIDANCE_ONLY`, or `PLAYER_ROLE_SYNTHESIS` when the caller provides a role structure. That is not a source-confirmed team. Partial partner cases identify the missing third-member evidence. No source percentage, Calc target or recommendation rank becomes damage, uptime or a rotation duration.

| Team-description pattern | Broad meaning |
| --- | --- |
| Single carry | Partners prepare support/status before the main damage window. |
| Carry re-entry | The main work is split by an intervening partner handoff. |
| Shared field time | More than one damage contributor uses the team's field time; weaving requires source support. |
| Off-field anchor | Damage continues while partners act; their Echo/Skill timing matters. |
| Buff chain | Handoffs feed more than one damage contribution. |
| Member guidance only | Personal references are known; a team cycle is not established. |

Jianxin/Yuanwu retain priorities, not invented loops. Setups and openers stay separate from repeatable windows. A re-entry description is not permission to replay an entire personal guide list at each short window: Hsin/Jinhsi is an explicit example where this would duplicate work.

## Concrete source cases and differences

- **Augusta/Iuno/Shorekeeper:** the guide's three-Forte Augusta case uses Iuno's semi-DPS variant. Selecting the old shorter hybrid gets a small variant note. Shorekeeper's Concerto/carry-over alternatives remain a choice, not an assumed weapon.
- **Hsin/Jinhsi/Shorekeeper:** support → partner → Hsin → partner → Hsin in broad terms. Jinhsi's whole multi-entry guide sequence is not inserted twice.
- **Hsin/Electro Rover/Buling or Suisui:** ordinary Flare support/partner/carry flow; Rover double-Intro is an informational alternative with partner work, not an invented extra Hsin cycle.
- **Cartethyia:** Ciaccona or the full Chisa/Aero-Rover pair distinguish the standard Erosion case. A partial Chisa pair alone goes to Low Erosion. The supported Ciaccona third-slot choices and source conditions are retained.
- **Aemeath/Changli:** pre-Intro work keeps important attacks inside Changli's short Outro window. Third-member timing is not established by the partner case. Lynae/Mornye has the more consolidated standard reference.
- **Phrolova/Lucilla/Qiuyuan or Cantarella partner case:** off-field Hecate changes partner Skill/Echo interruption. Ending a partner window too early differs from the guide.
- **Havoc Rover/Danjin:** medium/hybrid describes basic hypercarry; an explicitly chosen shared-DPS context uses short burst and Danjin's damage-dealer reference. Danjin's existing raw Forte dispute remains unresolved.
- **Zhezhi/Jinhsi:** the later no-Liberation adaptation is conditional, not automatically used every turn.

## Existing combat integration

`describeTeamRotationCombatCoverage(input)` exposes available canonical hit IDs, reviewed reference hit bindings and the actual registration state of legacy engine declarations. A supported action somewhere in a Character kit does **not** prove that every guide step has a mapped executable action.

Current public code has **no active rotation engine registrations**, although legacy presets still declare `AUGUSTA_STD_V1` and `CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1`. The existing `buildContextFromVerifiedPreset` consequently retains its private-runtime-unavailable guard. This task does not restore a proprietary runtime or promote those labels into engine capability. Existing direct-hit, static/conditional context and Echo comparison adapters remain useful preparation points.

The first reviewed numeric join is **Aalto standard step 5, Basic P1 → `aalto-basic-half-truths-1`**. The binding checks exact Character, reference, step/source line, action identity and compatible selected context. `evaluateCoordinatedReferenceHit()` reuses `evaluateCharacterDirectHit`; `compareCoordinatedReferenceEchoReplacement()` reuses `compareCharacterHitEchoReplacement` with actual Current/Candidate Echo cards and independently qualified snapshots.

The adapters currently support **S0 / Lv10** for this hit. Another skill level or sequence is not extrapolated. The caller supplies the complete qualified non-Echo state, including the actual weapon, team/enemy effects and scaling base; a profile's default weapon/target does not replace the player's build. The Echo comparator reprojects the cards and retains its one-slot replacement, COST, per-build equipment/state and pending-context checks. Qualification labels remain caller assertions, not new engine-issued proof.

Results expose one expected hit and, when supported, its Echo replacement delta. They retain `rotationDps: null`, `authorizesRotationDps: false` and `authorizesUpgradeVerdict: false`. A single-hit gain is not a team-DPS upgrade verdict. Unknown contexts remain pending; no duration is invented to divide hit damage into DPS.

The remaining path to the user's DPS/upgrade goal is explicit:

1. Map the selected guide actions/segments to exact canonical components, landed hits and special/conditional damage systems.
2. Support the player's actual skill/Sequence choice, weapon/rank and complete Echo builds through the owning source and context adapters.
3. Qualify enemy state, team buffs, duration/ownership, resource generation and availability separately for Current and Candidate.
4. Establish a repeatable, source-supported team cycle and timings; do not sum complete personal lists across partial partner windows.
5. Connect a registered validated rotation runtime before reporting damage/time or upgrade potential for the full team.

## Verification

Focused tests cover all-reference/case joins and pins, mode/ref/context selection, partner-combination matching, caller-state preservation, source-versus-role synthesis, actual re-entry descriptions, source differences, detached export and rejection of false numeric capability. The pilot has independent expected-damage/Echo-delta checks and retains the existing S0/max-skill and pending guards. Existing reference, database, team-execution and hit/Echo-comparison tests plus the normal strict build are checked. FULL and landing remain separate from this draft/source preparation.

```sh
node --experimental-strip-types scripts/generate-team-rotation-coordination.mjs --check
node --experimental-strip-types --test test/teamRotationCoordination.test.ts test/teamRotationReferenceBridge.test.ts
```

## Reviewed case inventory

Case scope describes evidence coverage, not team strength.

| Case | Pattern | Party evidence |
| --- | --- | --- |
| augusta-iuno-shorekeeper | SINGLE_CARRY | NAMED_TRIO |
| hsin-jinhsi-shorekeeper-unison | CARRY_REENTRY | NAMED_TRIO |
| hsin-rover-electro-buling-flare | SINGLE_CARRY | NAMED_TRIO |
| hsin-rover-electro-suisui-flare | SINGLE_CARRY | NAMED_TRIO |
| aemeath-lynae-mornye | SINGLE_CARRY | NAMED_TRIO |
| aemeath-changli-quickswap | SHARED_FIELD_TIME | PARTNER_CONTEXT |
| cartethyia-ciaccona-rover-aero | SINGLE_CARRY | NAMED_TRIO |
| cartethyia-chisa-rover-aero | SINGLE_CARRY | NAMED_TRIO |
| cartethyia-low-erosion | SINGLE_CARRY | PARTNER_CONTEXT |
| brant-lupa-mornye-dps | CARRY_REENTRY | NAMED_TRIO |
| changli-brant-lupa | BUFF_CHAIN | NAMED_TRIO |
| zani-phoebe-confession | SINGLE_CARRY | PARTNER_CONTEXT |
| phrolova-lucilla-qiuyuan | OFF_FIELD_ANCHOR | NAMED_TRIO |
| phrolova-cantarella | OFF_FIELD_ANCHOR | PARTNER_CONTEXT |
| jinhsi-zhezhi | CARRY_REENTRY | PARTNER_CONTEXT |
| cartethyia-ciaccona-chisa | SINGLE_CARRY | NAMED_TRIO |
| cartethyia-ciaccona-the-shorekeeper | SINGLE_CARRY | NAMED_TRIO |
| rover-havoc-danjin-hypercarry | SINGLE_CARRY | PARTNER_CONTEXT |
| rover-havoc-danjin-shared-dps | SHARED_FIELD_TIME | PARTNER_CONTEXT |
