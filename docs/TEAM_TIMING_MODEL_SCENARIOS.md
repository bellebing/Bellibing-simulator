# Timing references for the remaining team cases

All **19 coordination cases now have either published timing budgets or a declared standard alternative**. The first batch's ten source-table relations remain intact. This adds twelve model scenarios: the nine formerly missing cases plus complete-visit alternatives for Brant double Forte, Jinhsi/Zhezhi and Zani/Phoebe. Five scenarios explicitly change the guide context rather than claiming to time its exact commands.

## Method and authority

[Riley Calcs](https://riley31415.github.io/wuwa_calc/) publishes a calculator and [its source](https://github.com/riley31415/wuwa_calc/tree/195a22f1b7a1b55b953224e26742b896a719e1c3). We replay the pinned source's written team/member recipes and animation timing model. The source revision dates from October 3; including Hsin in this model does not establish live animation measurements. The timings are **declared reproducible scenarios**, not measured average player execution or independently verified gameplay facts.

Bellibing restores explicit `CancelledStep` wrappers and canceled action forms to their underlying complete actions. Ordinary swaps, kit-native timing and Echo exit placeholders remain. This removes reliance on tight action-cancel windows; it does not claim a new independently measured no-cancel animation library. Brant's one deliberate mid-cycle handoff remains necessary for his double-Forte shape. Lucilla's source kit timing/charge behavior remains a model assumption.

The model's clock is explicit: **60 model frames per second, excluding its modeled time-stop windows**. The provider also keeps a real animation clock in the evidence. This is not a requirement that the player render at 60 FPS. Do not mix this denominator with Arab WuWa's `SOURCE_CLOCK_UNSPECIFIED` tables. Any future buff/DPS integration must choose one clock and resolve actual trigger events against it.

Visits follow the replayed actor changes. Field time includes waiting owned by that actor; **work and wait are separately reported**. A closing Intro is credited to the ending cycle by the publisher's scheduler, and is marked `CYCLE_CLOSING_INTRO`: it is not a second full damage rotation. Off-field hits never become additional active visits. Opening plus three later cycles are retained, with mean later-member time as a scenario summary.

## The former gaps

Rounded seconds below use the third modeled rotation; the artifact retains integer frame values, all visits and all three later loops. A `+ closing Intro` portion belongs to the source scheduler's boundary convention.

| Existing case / new reference context | Character portions | Cycle | Difference |
| --- | --- | --- | --- |
| Hsin/Jinhsi/Shorekeeper Unison | Jinhsi 5.05 → Hsin 5.55 → Shorekeeper 4.93 → Jinhsi 5.90 → Hsin 6.08 → Jinhsi closing Intro 1.00 | 28.52 | Two visits each for Hsin/Jinhsi; no copying their full personal rotation twice. |
| Hsin/Electro Rover/Buling Flare | Buling 5.98 → Rover 7.95 → Hsin 12.47 → Buling closing Intro 1.33 | 27.73 | Buling/Rover S6, Hsin S0. |
| Hsin/Electro Rover/Suisui Flare | Suisui 5.05 → Rover 7.93 → Hsin 12.47 → Suisui closing Intro 1.30 | 26.75 | Longer Suisui opening separately retained. |
| Aemeath/Changli with Shorekeeper | Shorekeeper 3.58 → Changli 12.32 → Aemeath 12.25 → support closing Intro 1.35 | 29.50 | **New sequential Tune Rupture context**; old advanced quickswap is not timed by this model. |
| Cartethyia/Chisa/Aero Rover | Chisa 7.67 → Rover 9.62 → Cartethyia 15.60 → Chisa closing Intro 0.92 | 33.80 | Complete source-model actor phases, Rover S6. |
| Cartethyia low-Erosion | Shorekeeper 3.58 → Sanhua 4.00 → Cartethyia 16.07 → support closing Intro 1.35 | 25.00 | **Concrete Sanhua/support alternative**, without Ciaccona; simpler modeled combo instead of guide's repeated transformations. |
| Phrolova/Lucilla/Qiuyuan | Phrolova 9.60 → Qiuyuan 7.05 → Lucilla 8.78 → Phrolova closing Intro 1.55 | 26.98 | Exact trio, Lucilla Echo mode; no timing copied from Cantarella. |
| Havoc Rover/Danjin carry | Shorekeeper 3.58 → Danjin 8.78 → Rover 11.28 → support closing Intro 1.35 | 25.00 | **Composed S2 Rover recipe** with two Umbra strings; Rover portion includes 3.35s wait. |
| Havoc Rover/Danjin shared contribution | Same field budgets as above | 25.00 | **Simple sequential one-Umbra recipe**. Rover has 4.40s wait instead; fewer attacks do not beat support cooldown. |

Havoc Rover's published source module is not registered in its published team list. We compose its member model with Danjin and Shorekeeper, and explicitly label that as Bellibing synthesis. The source fails at Rover S4 because a stat hook mutates state; the scenario selects **Rover S2** rather than modifying the external mechanic. Danjin uses the source's ordinary 60-Ruby route, avoiding the disputed full-power threshold. The final extra Wingblade is omitted because it otherwise adds an 8.8-second cooldown wait. Two versus one enhanced strings define the carry/shared variants. These changes are visible in the capture script and reviewed context, not silently attributed to a published complete team.

## Additional unresolved-visit alternatives

- **Brant/Lupa/Mornye double Forte:** Mornye 4.15 → Brant 8.13 → Lupa 8.12 → Brant 13.27 → Mornye closing Intro 1.75; **35.42s**. This finally supplies two Brant visits; the earlier one-Anchor data remains its own variant.
- **Jinhsi/Zhezhi/Shorekeeper:** support 3.58 → Jinhsi 7.20 → Zhezhi 7.78 → Jinhsi 6.87 → support closing Intro 1.35; **26.78s**. This is a different source model from the Arab table, not an inferred split of its 12.04-second total.
- **Zani/Phoebe/Shorekeeper:** support 3.58 → Phoebe 7.20 → Zani 13.88 → support closing Intro 1.35; **26.02s**. Contiguous Confession alternative; it does not infer times for the older split Phoebe recipe.

## Artifacts and consumption

- `data/source/team-timing-model-evidence-2026-10-12.json`: pinned provider source-file hashes, builds and replayed action/visit traces. No provider damage/DPS values are exported.
- `data/source/team-timing-model-review-2026-10-12.json`: explicit case/recipe/context review, source paths and adaptation notes.
- `src/data/teamTimingModelScenarios.ts`: deterministic timing-only projection and complete 19-case research inventory.
- `getTeamTimingResearchCoverage(caseId)`: lists source-table and model choices separately. A covered research case is not an executable-ready team.
- `describeTeamTimingModelScenario(...)`: requires a chosen scenario, its actual three members and rotation number. Changed contexts require `acceptContextVariant`; this is a caller contract, not another user approval flow. It returns field/work/wait times, ordered visits, source builds and provenance. Automatic buff uptime, DPS and upgrade readiness remain absent.

Replay:

```sh
git clone https://github.com/riley31415/wuwa_calc.git /tmp/riley-timing
git -C /tmp/riley-timing checkout 195a22f1b7a1b55b953224e26742b896a719e1c3
# In that checkout: npm ci --ignore-scripts; node node_modules/typescript/bin/tsc -p tsconfig.json --sourceMap false
node scripts/capture-team-timing-model-scenarios.mjs /tmp/riley-timing /tmp/model-candidate.json
node --experimental-strip-types scripts/generate-team-timing-model-scenarios.mjs --check
```

The provider's pinned TypeScript 5.6.3 dependency compiles successfully. Replaying was byte-identical. Capturing a different code/recipe output requires renewed review and hash updates; it cannot silently promote source changes. This work supplies usable standard timing scenarios without claiming that every historical guide variant, mechanic or damage model is independently verified.
