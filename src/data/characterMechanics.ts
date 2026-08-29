import type {
  CharacterMechanicFact,
  CharacterMechanicsProfile,
} from '../characterMechanicsDomain.ts';
import { AALTO_CHARACTER_MECHANIC_FACTS } from './characterMechanics/aaltoRawFacts.ts';
import { AEMEATH_CHARACTER_MECHANIC_FACTS } from './characterMechanics/aemeathRawFacts.ts';
import { AUGUSTA_CHARACTER_ACTION_FACTS } from './characterMechanics/augustaActionFacts.ts';
import { AUGUSTA_NON_ACTION_MECHANIC_FACTS } from './characterMechanics/augustaRawFacts.ts';
import { BAIZHI_CHARACTER_MECHANIC_FACTS } from './characterMechanics/baizhiRawFacts.ts';
import { BRANT_CHARACTER_MECHANIC_FACTS } from './characterMechanics/brantRawFacts.ts';
import { CALCHARO_CHARACTER_MECHANIC_FACTS } from './characterMechanics/calcharoRawFacts.ts';
import { CAMELLYA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/camellyaRawFacts.ts';
import { CARLOTTA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/carlottaRawFacts.ts';
import { CHANGLI_CHARACTER_MECHANIC_FACTS } from './characterMechanics/changliRawFacts.ts';
import { CHIXIA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/chixiaRawFacts.ts';
import { CIACCONA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/ciacconaRawFacts.ts';
import { CHISA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/chisaRawFacts.ts';
import { JIANXIN_CHARACTER_MECHANIC_FACTS } from './characterMechanics/jianxinRawFacts.ts';
import { JINHSI_CHARACTER_MECHANIC_FACTS } from './characterMechanics/jinhsiRawFacts.ts';
import { LUMI_CHARACTER_MECHANIC_FACTS } from './characterMechanics/lumiRawFacts.ts';
import { LUPA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/lupaRawFacts.ts';
import { PHOEBE_CHARACTER_MECHANIC_FACTS } from './characterMechanics/phoebeRawFacts.ts';
import { THE_SHOREKEEPER_CHARACTER_MECHANIC_FACTS } from './characterMechanics/theShorekeeperRawFacts.ts';
import { ENCORE_CHARACTER_MECHANIC_FACTS } from './characterMechanics/encoreRawFacts.ts';
import { FIFTH_BATCH_CHARACTER_MECHANICS_PROFILES } from './characterMechanics/fifthBatchProfiles.ts';
import { FOURTH_BATCH_CHARACTER_MECHANICS_PROFILES } from './characterMechanics/fourthBatchProfiles.ts';
import { JIYAN_CHARACTER_MECHANIC_FACTS } from './characterMechanics/jiyanRawFacts.ts';
import { IUNO_CHARACTER_MECHANIC_FACTS } from './characterMechanics/iunoRawFacts.ts';
import { LINGYANG_CHARACTER_MECHANIC_FACTS } from './characterMechanics/lingyangRawFacts.ts';
import { MORTEFI_CHARACTER_MECHANIC_FACTS } from './characterMechanics/mortefiRawFacts.ts';
import { ROCCIA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/rocciaRawFacts.ts';
import { ROVER_HAVOC_CHARACTER_MECHANIC_FACTS } from './characterMechanics/roverHavocRawFacts.ts';
import { ROVER_SPECTRO_CHARACTER_MECHANIC_FACTS } from './characterMechanics/roverSpectroRawFacts.ts';
import { SECOND_BATCH_CHARACTER_MECHANICS_PROFILES } from './characterMechanics/secondBatchProfiles.ts';
import { SEVENTH_BATCH_CHARACTER_MECHANICS_PROFILES } from './characterMechanics/seventhBatchProfiles.ts';
import { EIGHTH_BATCH_CHARACTER_MECHANICS_PROFILES } from './characterMechanics/eighthBatchProfiles.ts';
import { NINTH_BATCH_CHARACTER_MECHANICS_PROFILES } from './characterMechanics/ninthBatchProfiles.ts';
import { DENIA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/deniaRawFacts.ts';
import { HIYUKI_CHARACTER_MECHANIC_FACTS } from './characterMechanics/hiyukiRawFacts.ts';
import { QINGXIAO_CHARACTER_MECHANIC_FACTS } from './characterMechanics/qingxiaoRawFacts.ts';
import { ROVER_AERO_CHARACTER_MECHANIC_FACTS } from './characterMechanics/roverAeroRawFacts.ts';
import { TENTH_BATCH_CHARACTER_MECHANICS_PROFILES } from './characterMechanics/tenthBatchProfiles.ts';
import { MORNYE_CHARACTER_MECHANIC_FACTS } from './characterMechanics/mornyeRawFacts.ts';
import { PHROLOVA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/phrolovaRawFacts.ts';
import { QIUYUAN_CHARACTER_MECHANIC_FACTS } from './characterMechanics/qiuyuanRawFacts.ts';
import { SANHUA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/sanhuaRawFacts.ts';
import { SIGRIKA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/sigrikaRawFacts.ts';
import { ELEVENTH_BATCH_CHARACTER_MECHANICS_PROFILES } from './characterMechanics/eleventhBatchProfiles.ts';
import { CANTARELLA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/cantarellaRawFacts.ts';
import { CARTETHYIA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/cartethyiaRawFacts.ts';
import { LUCILLA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/lucillaRawFacts.ts';
import { GALBRENA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/galbrenaRawFacts.ts';
import { LYNAE_CHARACTER_MECHANIC_FACTS } from './characterMechanics/lynaeRawFacts.ts';
import { TWELFTH_BATCH_CHARACTER_MECHANICS_PROFILES } from './characterMechanics/twelfthBatchProfiles.ts';
import { FINAL_FOUR_CHARACTER_MECHANICS_PROFILES } from './characterMechanics/finalFourProfiles.ts';
import { FINAL_FOUR_TUNE_BREAK_FACTS } from './characterMechanics/finalFourTuneBreakFacts.ts';
import { LUCY_CHARACTER_MECHANIC_FACTS } from './characterMechanics/lucyRawFacts.ts';
import { REBECCA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/rebeccaRawFacts.ts';
import { ZANI_CHARACTER_MECHANIC_FACTS } from './characterMechanics/zaniRawFacts.ts';
import { LUUK_HERSSEN_CHARACTER_MECHANIC_FACTS } from './characterMechanics/luukHerssenRawFacts.ts';
import { YANGYANG_XUANLING_CHARACTER_MECHANIC_FACTS } from './characterMechanics/yangyangXuanlingRawFacts.ts';
import { SIXTH_BATCH_CHARACTER_MECHANICS_PROFILES } from './characterMechanics/sixthBatchProfiles.ts';
import { STARTER_BATCH_CHARACTER_MECHANICS_PROFILES } from './characterMechanics/starterBatchProfiles.ts';
import { TAOQI_CHARACTER_MECHANIC_FACTS } from './characterMechanics/taoqiRawFacts.ts';
import { THIRD_BATCH_CHARACTER_MECHANICS_PROFILES } from './characterMechanics/thirdBatchProfiles.ts';
import { CHARACTER_TUNE_BREAK_FACTS } from './characterMechanics/tuneBreakFacts.ts';
import { VERINA_CHARACTER_MECHANIC_FACTS } from './characterMechanics/verinaRawFacts.ts';
import { YANGYANG_CHARACTER_MECHANIC_FACTS } from './characterMechanics/yangyangRawFacts.ts';
import { YINLIN_CHARACTER_MECHANIC_FACTS } from './characterMechanics/yinlinRawFacts.ts';
import { YOUHU_CHARACTER_MECHANIC_FACTS } from './characterMechanics/youhuRawFacts.ts';
import { YUANWU_CHARACTER_MECHANIC_FACTS } from './characterMechanics/yuanwuRawFacts.ts';
import { ZHEZHI_CHARACTER_MECHANIC_FACTS } from './characterMechanics/zhezhiRawFacts.ts';

export { AUGUSTA_CHARACTER_ACTION_FACTS } from './characterMechanics/augustaActionFacts.ts';
export { BAIZHI_ACTION_FACTS } from './characterMechanics/baizhiRawFacts.ts';
export { BRANT_ACTION_FACTS } from './characterMechanics/brantRawFacts.ts';
export { CALCHARO_ACTION_FACTS } from './characterMechanics/calcharoRawFacts.ts';
export { CAMELLYA_ACTION_FACTS } from './characterMechanics/camellyaRawFacts.ts';
export { CARLOTTA_ACTION_FACTS } from './characterMechanics/carlottaRawFacts.ts';
export { CHANGLI_ACTION_FACTS } from './characterMechanics/changliRawFacts.ts';
export { CHIXIA_ACTION_FACTS } from './characterMechanics/chixiaRawFacts.ts';
export { CIACCONA_ACTION_FACTS } from './characterMechanics/ciacconaRawFacts.ts';
export { CHISA_ACTION_FACTS } from './characterMechanics/chisaRawFacts.ts';
export { JIANXIN_ACTION_FACTS } from './characterMechanics/jianxinRawFacts.ts';
export { JINHSI_ACTION_FACTS } from './characterMechanics/jinhsiRawFacts.ts';
export { LUMI_ACTION_FACTS } from './characterMechanics/lumiRawFacts.ts';
export { LUPA_ACTION_FACTS } from './characterMechanics/lupaRawFacts.ts';
export { PHOEBE_ACTION_FACTS } from './characterMechanics/phoebeRawFacts.ts';
export { THE_SHOREKEEPER_ACTION_FACTS } from './characterMechanics/theShorekeeperRawFacts.ts';
export { ENCORE_ACTION_FACTS } from './characterMechanics/encoreRawFacts.ts';
export {
  FIFTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  YOUHU_CHARACTER_MECHANICS_PROFILE,
  YUANWU_CHARACTER_MECHANICS_PROFILE,
} from './characterMechanics/fifthBatchProfiles.ts';
export {
  CALCHARO_CHARACTER_MECHANICS_PROFILE,
  FOURTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  LINGYANG_CHARACTER_MECHANICS_PROFILE,
  YINLIN_CHARACTER_MECHANICS_PROFILE,
} from './characterMechanics/fourthBatchProfiles.ts';
export { JIYAN_ACTION_FACTS } from './characterMechanics/jiyanRawFacts.ts';
export { IUNO_ACTION_FACTS } from './characterMechanics/iunoRawFacts.ts';
export { LINGYANG_ACTION_FACTS } from './characterMechanics/lingyangRawFacts.ts';
export { MORTEFI_ACTION_FACTS } from './characterMechanics/mortefiRawFacts.ts';
export { ROCCIA_ACTION_FACTS } from './characterMechanics/rocciaRawFacts.ts';
export { ROVER_HAVOC_ACTION_FACTS } from './characterMechanics/roverHavocRawFacts.ts';
export { ROVER_SPECTRO_ACTION_FACTS } from './characterMechanics/roverSpectroRawFacts.ts';
export {
  CAMELLYA_CHARACTER_MECHANICS_PROFILE,
  CARLOTTA_CHARACTER_MECHANICS_PROFILE,
  SEVENTH_BATCH_CHARACTER_MECHANICS_PROFILES,
} from './characterMechanics/seventhBatchProfiles.ts';
export {
  CIACCONA_CHARACTER_MECHANICS_PROFILE,
  EIGHTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  JIANXIN_CHARACTER_MECHANICS_PROFILE,
  JINHSI_CHARACTER_MECHANICS_PROFILE,
  LUMI_CHARACTER_MECHANICS_PROFILE,
  PHOEBE_CHARACTER_MECHANICS_PROFILE,
  THE_SHOREKEEPER_CHARACTER_MECHANICS_PROFILE,
} from './characterMechanics/eighthBatchProfiles.ts';
export {
  CHISA_CHARACTER_MECHANICS_PROFILE,
  IUNO_CHARACTER_MECHANICS_PROFILE,
  LUPA_CHARACTER_MECHANICS_PROFILE,
  NINTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  ROVER_HAVOC_CHARACTER_MECHANICS_PROFILE,
  ROVER_SPECTRO_CHARACTER_MECHANICS_PROFILE,
} from './characterMechanics/ninthBatchProfiles.ts';
export { DENIA_ACTION_FACTS } from './characterMechanics/deniaRawFacts.ts';
export { HIYUKI_ACTION_FACTS } from './characterMechanics/hiyukiRawFacts.ts';
export { QINGXIAO_ACTION_FACTS } from './characterMechanics/qingxiaoRawFacts.ts';
export { ROVER_AERO_ACTION_FACTS } from './characterMechanics/roverAeroRawFacts.ts';
export { YANGYANG_XUANLING_ACTION_FACTS } from './characterMechanics/yangyangXuanlingRawFacts.ts';
export { MORNYE_ACTION_FACTS } from './characterMechanics/mornyeRawFacts.ts';
export { PHROLOVA_ACTION_FACTS } from './characterMechanics/phrolovaRawFacts.ts';
export { QIUYUAN_ACTION_FACTS } from './characterMechanics/qiuyuanRawFacts.ts';
export { SANHUA_ACTION_FACTS } from './characterMechanics/sanhuaRawFacts.ts';
export { SIGRIKA_ACTION_FACTS } from './characterMechanics/sigrikaRawFacts.ts';
export { CANTARELLA_ACTION_FACTS } from './characterMechanics/cantarellaRawFacts.ts';
export { CARTETHYIA_ACTION_FACTS } from './characterMechanics/cartethyiaRawFacts.ts';
export { LUCILLA_ACTION_FACTS } from './characterMechanics/lucillaRawFacts.ts';
export { GALBRENA_ACTION_FACTS } from './characterMechanics/galbrenaRawFacts.ts';
export { LYNAE_ACTION_FACTS } from './characterMechanics/lynaeRawFacts.ts';
export {
  DENIA_CHARACTER_MECHANICS_PROFILE,
  HIYUKI_CHARACTER_MECHANICS_PROFILE,
  QINGXIAO_CHARACTER_MECHANICS_PROFILE,
  ROVER_AERO_CHARACTER_MECHANICS_PROFILE,
  TENTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  YANGYANG_XUANLING_CHARACTER_MECHANICS_PROFILE,
} from './characterMechanics/tenthBatchProfiles.ts';
export {
  ELEVENTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  MORNYE_CHARACTER_MECHANICS_PROFILE,
  PHROLOVA_CHARACTER_MECHANICS_PROFILE,
  QIUYUAN_CHARACTER_MECHANICS_PROFILE,
  SANHUA_CHARACTER_MECHANICS_PROFILE,
  SIGRIKA_CHARACTER_MECHANICS_PROFILE,
} from './characterMechanics/eleventhBatchProfiles.ts';
export {
  CANTARELLA_CHARACTER_MECHANICS_PROFILE,
  CARTETHYIA_CHARACTER_MECHANICS_PROFILE,
  GALBRENA_CHARACTER_MECHANICS_PROFILE,
  LUCILLA_CHARACTER_MECHANICS_PROFILE,
  LYNAE_CHARACTER_MECHANICS_PROFILE,
  TWELFTH_BATCH_CHARACTER_MECHANICS_PROFILES,
} from './characterMechanics/twelfthBatchProfiles.ts';
export { LUCY_ACTION_FACTS } from './characterMechanics/lucyRawFacts.ts';
export { REBECCA_ACTION_FACTS } from './characterMechanics/rebeccaRawFacts.ts';
export { ZANI_ACTION_FACTS } from './characterMechanics/zaniRawFacts.ts';
export { LUUK_HERSSEN_ACTION_FACTS } from './characterMechanics/luukHerssenRawFacts.ts';
export {
  FINAL_FOUR_CHARACTER_MECHANICS_PROFILES,
  LUCY_CHARACTER_MECHANICS_PROFILE,
  REBECCA_CHARACTER_MECHANICS_PROFILE,
  ZANI_CHARACTER_MECHANICS_PROFILE,
  LUUK_HERSSEN_CHARACTER_MECHANICS_PROFILE,
} from './characterMechanics/finalFourProfiles.ts';
export {
  FINAL_FOUR_TUNE_BREAK_FACTS,
  LUCY_TUNE_BREAK_FACT,
  REBECCA_TUNE_BREAK_FACT,
  ZANI_TUNE_BREAK_FACT,
  LUUK_HERSSEN_TUNE_BREAK_FACT,
} from './characterMechanics/finalFourTuneBreakFacts.ts';
export { TAOQI_ACTION_FACTS } from './characterMechanics/taoqiRawFacts.ts';
export {
  CHANGLI_CHARACTER_MECHANICS_PROFILE,
  JIYAN_CHARACTER_MECHANICS_PROFILE,
  SECOND_BATCH_CHARACTER_MECHANICS_PROFILES,
} from './characterMechanics/secondBatchProfiles.ts';
export {
  ROCCIA_CHARACTER_MECHANICS_PROFILE,
  SIXTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  ZHEZHI_CHARACTER_MECHANICS_PROFILE,
} from './characterMechanics/sixthBatchProfiles.ts';
export {
  CHIXIA_CHARACTER_MECHANICS_PROFILE,
  MORTEFI_CHARACTER_MECHANICS_PROFILE,
  STARTER_BATCH_CHARACTER_MECHANICS_PROFILES,
  YANGYANG_CHARACTER_MECHANICS_PROFILE,
} from './characterMechanics/starterBatchProfiles.ts';
export {
  ENCORE_CHARACTER_MECHANICS_PROFILE,
  TAOQI_CHARACTER_MECHANICS_PROFILE,
  THIRD_BATCH_CHARACTER_MECHANICS_PROFILES,
  VERINA_CHARACTER_MECHANICS_PROFILE,
} from './characterMechanics/thirdBatchProfiles.ts';
export {
  AALTO_TUNE_BREAK_FACT,
  AEMEATH_TUNE_BREAK_FACT,
  AUGUSTA_TUNE_BREAK_FACT,
  BAIZHI_TUNE_BREAK_FACT,
  BRANT_TUNE_BREAK_FACT,
  CALCHARO_TUNE_BREAK_FACT,
  CAMELLYA_TUNE_BREAK_FACT,
  CARLOTTA_TUNE_BREAK_FACT,
  CHANGLI_TUNE_BREAK_FACT,
  CHARACTER_TUNE_BREAK_FACTS,
  CHIXIA_TUNE_BREAK_FACT,
  ENCORE_TUNE_BREAK_FACT,
  JIYAN_TUNE_BREAK_FACT,
  LINGYANG_TUNE_BREAK_FACT,
  MORTEFI_TUNE_BREAK_FACT,
  ROCCIA_TUNE_BREAK_FACT,
  TAOQI_TUNE_BREAK_FACT,
  VERINA_TUNE_BREAK_FACT,
  YANGYANG_TUNE_BREAK_FACT,
  YINLIN_TUNE_BREAK_FACT,
  YOUHU_TUNE_BREAK_FACT,
  YUANWU_TUNE_BREAK_FACT,
  ZHEZHI_TUNE_BREAK_FACT,
} from './characterMechanics/tuneBreakFacts.ts';
export { VERINA_ACTION_FACTS } from './characterMechanics/verinaRawFacts.ts';
export { YANGYANG_ACTION_FACTS } from './characterMechanics/yangyangRawFacts.ts';
export { YINLIN_ACTION_FACTS } from './characterMechanics/yinlinRawFacts.ts';
export { YOUHU_ACTION_FACTS } from './characterMechanics/youhuRawFacts.ts';
export { YUANWU_ACTION_FACTS } from './characterMechanics/yuanwuRawFacts.ts';
export { ZHEZHI_ACTION_FACTS } from './characterMechanics/zhezhiRawFacts.ts';
export {
  CIACCONA_TUNE_BREAK_FACT,
  JIANXIN_TUNE_BREAK_FACT,
  JINHSI_TUNE_BREAK_FACT,
  LUMI_TUNE_BREAK_FACT,
  PHOEBE_TUNE_BREAK_FACT,
  THE_SHOREKEEPER_TUNE_BREAK_FACT,
} from './characterMechanics/tuneBreakFacts.ts';
export {
  CHISA_TUNE_BREAK_FACT,
  IUNO_TUNE_BREAK_FACT,
  LUPA_TUNE_BREAK_FACT,
  ROVER_HAVOC_TUNE_BREAK_FACT,
  ROVER_SPECTRO_TUNE_BREAK_FACT,
} from './characterMechanics/tuneBreakFacts.ts';
export {
  DENIA_TUNE_BREAK_FACT,
  HIYUKI_TUNE_BREAK_FACT,
  QINGXIAO_TUNE_BREAK_FACT,
  ROVER_AERO_TUNE_BREAK_FACT,
  YANGYANG_XUANLING_TUNE_BREAK_FACT,
} from './characterMechanics/tuneBreakFacts.ts';
export {
  MORNYE_TUNE_BREAK_FACT,
  PHROLOVA_TUNE_BREAK_FACT,
  QIUYUAN_TUNE_BREAK_FACT,
  SANHUA_TUNE_BREAK_FACT,
  SIGRIKA_TUNE_BREAK_FACT,
  CANTARELLA_TUNE_BREAK_FACT,
  CARTETHYIA_TUNE_BREAK_FACT,
  LUCILLA_TUNE_BREAK_FACT,
  GALBRENA_TUNE_BREAK_FACT,
  LYNAE_TUNE_BREAK_FACT,
} from './characterMechanics/tuneBreakFacts.ts';

export const CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...AUGUSTA_CHARACTER_ACTION_FACTS,
  ...AUGUSTA_NON_ACTION_MECHANIC_FACTS,
  ...AALTO_CHARACTER_MECHANIC_FACTS,
  ...AEMEATH_CHARACTER_MECHANIC_FACTS,
  ...BAIZHI_CHARACTER_MECHANIC_FACTS,
  ...BRANT_CHARACTER_MECHANIC_FACTS,
  ...CALCHARO_CHARACTER_MECHANIC_FACTS,
  ...CAMELLYA_CHARACTER_MECHANIC_FACTS,
  ...CARLOTTA_CHARACTER_MECHANIC_FACTS,
  ...CHANGLI_CHARACTER_MECHANIC_FACTS,
  ...CHIXIA_CHARACTER_MECHANIC_FACTS,
  ...ENCORE_CHARACTER_MECHANIC_FACTS,
  ...JIYAN_CHARACTER_MECHANIC_FACTS,
  ...LINGYANG_CHARACTER_MECHANIC_FACTS,
  ...MORTEFI_CHARACTER_MECHANIC_FACTS,
  ...ROCCIA_CHARACTER_MECHANIC_FACTS,
  ...TAOQI_CHARACTER_MECHANIC_FACTS,
  ...VERINA_CHARACTER_MECHANIC_FACTS,
  ...YANGYANG_CHARACTER_MECHANIC_FACTS,
  ...YINLIN_CHARACTER_MECHANIC_FACTS,
  ...YOUHU_CHARACTER_MECHANIC_FACTS,
  ...YUANWU_CHARACTER_MECHANIC_FACTS,
  ...ZHEZHI_CHARACTER_MECHANIC_FACTS,
  ...CIACCONA_CHARACTER_MECHANIC_FACTS,
  ...JIANXIN_CHARACTER_MECHANIC_FACTS,
  ...JINHSI_CHARACTER_MECHANIC_FACTS,
  ...LUMI_CHARACTER_MECHANIC_FACTS,
  ...PHOEBE_CHARACTER_MECHANIC_FACTS,
  ...THE_SHOREKEEPER_CHARACTER_MECHANIC_FACTS,
  ...CHISA_CHARACTER_MECHANIC_FACTS,
  ...IUNO_CHARACTER_MECHANIC_FACTS,
  ...LUPA_CHARACTER_MECHANIC_FACTS,
  ...ROVER_HAVOC_CHARACTER_MECHANIC_FACTS,
  ...ROVER_SPECTRO_CHARACTER_MECHANIC_FACTS,
  ...DENIA_CHARACTER_MECHANIC_FACTS,
  ...HIYUKI_CHARACTER_MECHANIC_FACTS,
  ...QINGXIAO_CHARACTER_MECHANIC_FACTS,
  ...ROVER_AERO_CHARACTER_MECHANIC_FACTS,
  ...YANGYANG_XUANLING_CHARACTER_MECHANIC_FACTS,
  ...SANHUA_CHARACTER_MECHANIC_FACTS,
  ...QIUYUAN_CHARACTER_MECHANIC_FACTS,
  ...SIGRIKA_CHARACTER_MECHANIC_FACTS,
  ...PHROLOVA_CHARACTER_MECHANIC_FACTS,
  ...MORNYE_CHARACTER_MECHANIC_FACTS,
  ...CANTARELLA_CHARACTER_MECHANIC_FACTS,
  ...CARTETHYIA_CHARACTER_MECHANIC_FACTS,
  ...LUCILLA_CHARACTER_MECHANIC_FACTS,
  ...GALBRENA_CHARACTER_MECHANIC_FACTS,
  ...LYNAE_CHARACTER_MECHANIC_FACTS,
  ...LUCY_CHARACTER_MECHANIC_FACTS,
  ...REBECCA_CHARACTER_MECHANIC_FACTS,
  ...ZANI_CHARACTER_MECHANIC_FACTS,
  ...LUUK_HERSSEN_CHARACTER_MECHANIC_FACTS,
  ...CHARACTER_TUNE_BREAK_FACTS,
  ...FINAL_FOUR_TUNE_BREAK_FACTS,
] as const;

export const CHARACTER_MECHANIC_FACT_BY_ID: ReadonlyMap<string, CharacterMechanicFact> = (() => {
  const map = new Map<string, CharacterMechanicFact>();
  for (const fact of CHARACTER_MECHANIC_FACTS) {
    if (map.has(fact.factId)) throw new Error(`Duplicate character mechanic fact: ${fact.factId}`);
    map.set(fact.factId, fact);
  }
  return map;
})();

export function getCharacterMechanicFact(factId: string): CharacterMechanicFact | null {
  return CHARACTER_MECHANIC_FACT_BY_ID.get(factId) ?? null;
}

export function getCharacterActionFact(factId: string) {
  const fact = getCharacterMechanicFact(factId);
  return fact?.kind === 'ACTION' ? fact : null;
}

/**
 * Raw mechanics coverage is independent from executable combat coverage.
 * Augusta's current live Character-owned ACTION catalog is source-complete at
 * Lv1-Lv10 while shared-system Tune Break access is represented separately.
 * The existing V9.15 Standard engine keeps its selected-level aggregate values
 * in a separate parity fixture. This prevents either historical parity or the
 * shared combat-system formula from being mistaken for Character source data.
 */
export const AUGUSTA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'augusta',
  verificationStatus: 'VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'Full current Basic/Heavy/Mid-air/Dodge, Skill, Forte, Liberation, Intro and Tune Break coverage is explicit. Character-owned damage carries exact Lv1-Lv10 source representations; Tune Break is typed as shared-system damage without a fabricated Character coefficient. The V9.15 Standard selected-level aggregates remain a separate parity fixture.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Prowess/Ascendancy/Majesty, Undying Sunlight gating and Sworn Allegiance rules are source-audited.' },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'S1-S6 raw text is verified; sequence effects remain RAW_ONLY until a sequence-aware combat adapter consumes them.' },
  ],
  factIds: CHARACTER_MECHANIC_FACTS.filter((fact) => fact.characterId === 'augusta').map((fact) => fact.factId),
  provenance: {
    sourceLabels: [
      'Wuthering Waves Wiki/Fandom — current Augusta combat tables',
      'Wuthering.gg — current Augusta kit',
      'Prydwen — current Augusta kit',
      'Index Game Center — current Augusta Lv10 endpoints',
      '鳴潮 Wiki* — current Augusta live endpoints',
      'Wutheringlab — current page retained as discrepancy evidence',
    ],
    sourceUrls: [
      'https://wutheringwaves.fandom.com/wiki/Augusta/Combat',
      'https://wuthering.gg/characters/augusta',
      'https://www.prydwen.gg/wuthering-waves/characters/augusta',
      'https://www.indexgame.in.th/en/guide/wutheringwavesuid/augusta',
      'https://wikiwiki.jp/w-w/%E3%82%AA%E3%83%BC%E3%82%AC%E3%82%B9%E3%82%BF',
      'https://wutheringlab.com/character/augusta-build/',
    ],
    checkedAt: '2026-08-27',
    notes: [
      'Source-level raw mechanics coverage is complete for the six required Character Mechanics areas, including the current Tune Break entry whose own provenance is attached to its shared-system action fact.',
      'The current Fandom Everbright Protector Lv1 first-component cell conflicts with current Wuthering.gg/Japanese-wiki evidence; the independently corroborated 120.00% value is used and the conflicting 20.00% cell remains provenance evidence.',
      "Current Warrior's Blade source consensus is 110.00%*3 at Lv1, 218.70%*3 at Lv10 and 15s cooldown; current Japanese-wiki/Wutheringlab conflicting older cells remain provenance evidence rather than overriding the live consensus.",
      'Current Undying Sunlight: Plunge source structure is 43.55% + 391.95% at Lv1 through 86.59% + 779.24% at Lv10; stale split-component mirrors remain recorded rather than silently flattened into the same aggregate.',
      'MODEL_READY/MODELED/PENDING_INTERPRETATION remain independent from source VERIFIED coverage. Augusta Standard remains the existing narrow exact-parity combat fixture; the shared Tune Break damage formula is also a separate combat-system modeling concern.',
    ],
  },
};

export const AALTO_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'aalto',
  verificationStatus: 'VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'Basic/Heavy/Mid-air/Dodge, Skill, Forte, Liberation and Intro damaging actions carry source-backed Lv1-Lv10 motion-value curves; current Tune Break: Pistols access is explicit shared-system damage without a fabricated Character coefficient.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Mistcloak Dash, Mist Drop acquisition/consumption and Mist Missile generation are source-audited; executable dash cadence remains separate from raw coverage.' },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: 'Perfect Performance and Mid-game Break are source-audited.' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: 'Dissolving Mist 23% Aero DMG Amplification / 14s / switch-out termination is source-audited.' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: 'Mist Drops max 6 and generation/consumption rules are source-audited.' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact S1-S6 raw mechanics are source-audited. Sequence execution remains a later sequence-aware combat concern.' },
  ],
  factIds: CHARACTER_MECHANIC_FACTS.filter((fact) => fact.characterId === 'aalto').map((fact) => fact.factId),
  provenance: {
    sourceLabels: ['Wuthering.wiki — Aalto raw skill data', 'Prydwen — current Aalto kit', 'Wutheringlab — current Aalto kit'],
    sourceUrls: [
      'https://wuthering.wiki/character_1403.html',
      'https://www.prydwen.gg/wuthering-waves/characters/aalto',
      'https://wutheringlab.com/character/aalto-build/',
    ],
    checkedAt: '2026-08-27',
    notes: [
      'Source-level raw mechanics coverage is complete for the six required Character Mechanics areas, including the current Tune Break entry whose own provenance is attached to its shared-system action fact.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION statuses remain distinct from source verification; VERIFIED profile coverage does not claim an Aalto rotation/DPS adapter or shared Tune Break damage formula exists.',
    ],
  },
};

export const AEMEATH_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'aemeath',
  verificationStatus: 'VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'Aemeath/Mech Basic, Heavy, Mid-air, Dodge, Sync Strike, Liberation, Seraphic Duet, Tune-AMP response and Intro actions carry exact Lv1-Lv10 source representations. Mixed-hit expressions remain explicit components. Unlanded Melody is explicit shared-system Tune Break damage and keeps its Basic Stage 3 / Starburst transition semantics without duplicating Starburst motion values.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Seraphic Duo/Duet, Resonance Mode trails, Tune Rupture/Fusion Burst response state, Starflux and Tune-AMP coefficients are source-audited; encounter timing remains separate.' },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: 'Before All Sounds and Between the Stars are source-audited without assuming state uptime or team triggers.' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: 'Silent Protection team amplification and 20-second duration are source-audited; qualifying 20% branch remains conditional.' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: 'Synchronization Rate 200, Resonance Rate 4 and Starflux 600 caps plus current gain/consumption rules are source-audited.' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'S1-S6 raw mechanics are source-audited against the current raw-data/multi-source consensus; conflicting secondary wording remains provenance evidence rather than executable guesswork.' },
  ],
  factIds: CHARACTER_MECHANIC_FACTS.filter((fact) => fact.characterId === 'aemeath').map((fact) => fact.factId),
  provenance: {
    sourceLabels: [
      'Prydwen — current Aemeath kit',
      'Wutheringlab — current Aemeath kit/multiplier tables',
      'WuWaBuilds — current Aemeath kit/multiplier tables',
      'Wuthering Waves Wiki/Fandom — current Aemeath combat tables',
      'WutheringDB — current raw-data mirror',
    ],
    sourceUrls: [
      'https://www.prydwen.gg/wuthering-waves/characters/aemeath',
      'https://wutheringlab.com/character/aemeath-build/',
      'https://wuwa.build/characters/1210',
      'https://wutheringwaves.fandom.com/wiki/Aemeath/Combat',
      'https://wutheringdb.com/zh/characters/aemeath',
    ],
    checkedAt: '2026-08-27',
    notes: [
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas, including the current Unlanded Melody Tune Break entry whose own provenance is attached to its shared-system action fact.',
      'WWPlus malformed/repeated table cells, stale Synchronization tooltip ordering and the current Seraphic Duet Overture/Encore label disagreement remain provenance discrepancies rather than guessed executable truth.',
      'S6 max-trail-limit combat-state wording conflicts across current secondary sources; the current WutheringDB raw-data mirror plus WuWaBuilds/PlayAware/Wuthering.gg in-combat consensus is used while Wutheringlab/WutheringTools out-of-combat wording remains explicit provenance evidence.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Aemeath build, rotation, DPS adapter or shared Tune Break damage formula is implied by this profile.',
    ],
  },
};

export const BAIZHI_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'baizhi',
  verificationStatus: 'VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'Destined Promise Basic/Heavy/Mid-air/Dodge, Emergency Plan, Remnant Entities and Intro damage carry exact current Lv1-Lv10 source curves with source-backed scaling and hit counts. Tune Break: Rectifier is explicit shared-system damage without a fabricated Character coefficient.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: "You'tan shared-stat behavior, Concentration gain/max/consume rules, healing cadence and source-listed recovery values are audited; unresolved per-stack versus per-cast execution of the base recovery table remains PENDING_INTERPRETATION rather than guessed." },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: 'Harmonic Range/Euphonia and Stimulus Feedback are source-audited.' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: 'Rejuvinating Flow 1.54% Max-HP healing every 3s for 30s plus 15% DMG Amplification for 6s is source-audited; refresh timing remains executable state.' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: 'Concentration max 4, +1 per Basic Attack hit and all-stack consumption by Heavy Attack/Emergency Plan are source-audited.' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw mechanics are source-audited; sequence execution remains separate from raw coverage.' },
  ],
  factIds: CHARACTER_MECHANIC_FACTS.filter((fact) => fact.characterId === 'baizhi').map((fact) => fact.factId),
  provenance: {
    sourceLabels: [
      'wuwabuild normalized Character snapshot — pinned source candidate',
      'Wuthering.gg — current Baizhi kit',
      'Prydwen — current Baizhi kit',
      'Wuthering Waves Wiki/Fandom — current Baizhi skill tables/scaling',
      '鸣潮WIKI/Bilibili — current Baizhi full skill tables',
      'Wuthering.wiki — raw damage-data mirror for scaling/type/discrepancy evidence',
    ],
    sourceUrls: [
      'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json',
      'https://wuthering.gg/characters/baizhi',
      'https://www.prydwen.gg/wuthering-waves/characters/baizhi',
      'https://wutheringwaves.fandom.com/wiki/Emergency_Plan',
      'https://wutheringwaves.fandom.com/wiki/Momentary_Union',
      'https://wiki.biligame.com/wutheringwaves/%E5%85%B1%E9%B8%A3%E8%80%85/%E7%99%BD%E8%8A%B7',
      'https://wuthering.wiki/character_1103.html',
    ],
    checkedAt: '2026-08-27',
    notes: [
      'PR #61 candidate extraction removed transcription work but did not count as verification; this profile was promoted only after current source/semantic review.',
      'Emergency Plan and Remnant Entities are source-backed HP-scaling damage, while Destined Promise and Overflowing Frost damage are ATK-scaling. Remnant Entities is simultaneously a coordinated attack and raw Type=LIBERATION.',
      'Current displayed healing values and the raw damage-data mirror differ by 0.01 percentage point at several Lv10 backend/display cells (Emergency Plan 5.76 vs 5.77, Intro 0.75 vs 0.76, Concentration 0.31 vs 0.32). Bellibing keeps the current displayed multi-source values and records the backend precision discrepancy instead of guessing a silent correction.',
      'Healing tables remain raw utility summaries because the current Character Mechanics domain has an exact typed Lv1-Lv10 contract for Character-owned damage motion values but no fake reuse of damage fields for healing. This does not imply healing uptime or a healer combat adapter.',
      'Tune Break: Rectifier is source-verified as Character access to the shared Tune Break damage system; the shared damage formula remains separate pending combat-system modeling.',
      'Broad DPS remains blocked by the rest of roster-wide Character Mechanics coverage.',
    ],
  },
};

export const BRANT_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'brant',
  verificationStatus: 'VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED', notes: "Captain's Rhapsody Basic/Heavy/Mid-air/Dodge branches, Anchors Aweigh!, Plunging Attack, To the Horizon, Applaud for Me! and Returned from Ashes carry exact current Lv1-Lv10 source representations with explicit hit shapes and source damage buckets. Tune Break: Sword is explicit shared-system damage without a fabricated Character coefficient." },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Bravo max/gain/threshold/consume rules, Theatrical Moment, Aflame/My Moment replacement, Waves of Acclaims and Returned from Ashes shield/state semantics are source-audited; executable resource/state timing remains separate.' },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: "Voyager's Blaze and Trial by Fire and Tide are source-audited." },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: 'The Course is Set! 20% Fusion DMG Amplification + 25% Resonance Skill DMG Amplification / 14s / switch-out termination is source-audited.' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: 'Bravo max 100, hit-based gain families, 25/50/75/100 healing thresholds, Aflame gain-efficiency change and full-gauge Returned from Ashes consumption are source-audited.' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw mechanics are source-audited. The current Wutheringlab S2 off-field wording conflict remains provenance evidence instead of overriding the raw-data/current multi-source consensus.' },
  ],
  factIds: CHARACTER_MECHANIC_FACTS.filter((fact) => fact.characterId === 'brant').map((fact) => fact.factId),
  provenance: {
    sourceLabels: [
      'wuwabuild normalized Character snapshot — pinned source candidate',
      'Wuthering.gg — current Brant kit',
      'Prydwen — current Brant kit',
      'Wuthering.wiki — full Brant tables/raw damage data',
      'WutheringDB — current Brant kit/raw sequence text',
      'Wutheringlab — current Brant kit and discrepancy evidence',
    ],
    sourceUrls: [
      'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json',
      'https://wuthering.gg/characters/brant',
      'https://www.prydwen.gg/wuthering-waves/characters/brant',
      'https://wuthering.wiki/character_1206.html',
      'https://wuwa.incin.net/resonators/1206',
      'https://wutheringlab.com/character/brant-build/',
    ],
    checkedAt: '2026-08-27',
    notes: [
      'PR #61 candidate extraction removed transcription work but did not count as verification; Brant was promoted only after current source/semantic review.',
      'All Character-owned damage facts are ATK-scaling. Raw damage data confirms special source damage buckets including Anchors Aweigh! as Skill, Plunging Attack and Returned from Ashes as Basic, To the Horizon as Liberation and Applaud for Me! as Intro.',
      'Healing/shield source tables use Energy Regen as their raw scaling attribute and remain utility facts instead of being forced into Character damage motion-value fields.',
      'Current WutheringDB/Wuthering.gg/Prydwen plus the pinned source say S2 remains active when Brant is switched off field; current Wutheringlab says it ends early if Brant leaves the team. Bellibing retains the multi-source/raw-data consensus and the conflict provenance.',
      'Current external profile headers disagree on Brant Max Energy (125 versus 140); To the Horizon Resonance Cost is separately 175. Static Character core data is outside this mechanics promotion and is not changed or inferred here.',
      'Tune Break: Sword is source-verified as Character access to the shared Tune Break system; its shared damage formula remains outside Character mechanics motion values pending shared combat-system modeling.',
      'Broad DPS remains blocked by the remaining released-roster Character Mechanics coverage.',
    ],
  },
};

export const CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  AUGUSTA_CHARACTER_MECHANICS_PROFILE,
  AALTO_CHARACTER_MECHANICS_PROFILE,
  AEMEATH_CHARACTER_MECHANICS_PROFILE,
  BAIZHI_CHARACTER_MECHANICS_PROFILE,
  BRANT_CHARACTER_MECHANICS_PROFILE,
  ...STARTER_BATCH_CHARACTER_MECHANICS_PROFILES,
  ...SECOND_BATCH_CHARACTER_MECHANICS_PROFILES,
  ...THIRD_BATCH_CHARACTER_MECHANICS_PROFILES,
  ...FOURTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  ...FIFTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  ...SIXTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  ...SEVENTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  ...EIGHTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  ...NINTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  ...TENTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  ...ELEVENTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  ...TWELFTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  ...FINAL_FOUR_CHARACTER_MECHANICS_PROFILES,
] as const;

export const CHARACTER_MECHANICS_PROFILE_BY_ID: ReadonlyMap<string, CharacterMechanicsProfile> = (() => {
  const map = new Map<string, CharacterMechanicsProfile>();
  for (const profile of CHARACTER_MECHANICS_PROFILES) {
    if (map.has(profile.characterId)) throw new Error(`Duplicate character mechanics profile: ${profile.characterId}`);
    for (const factId of profile.factIds) {
      const fact = CHARACTER_MECHANIC_FACT_BY_ID.get(factId);
      if (!fact) throw new Error(`${profile.characterId} references unknown mechanic fact ${factId}`);
      if (fact.characterId !== profile.characterId) throw new Error(`${profile.characterId} references mechanic fact owned by ${fact.characterId}: ${factId}`);
    }
    map.set(profile.characterId, profile);
  }
  return map;
})();

export function getCharacterMechanicsProfile(characterId: string): CharacterMechanicsProfile | null {
  return CHARACTER_MECHANICS_PROFILE_BY_ID.get(characterId) ?? null;
}