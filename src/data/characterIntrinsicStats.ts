import type { VerificationStatus } from '../contentRegistry.ts';
import type { CharacterIntrinsicStat, CharacterIntrinsicStatName } from '../gameDataDomain.ts';

export interface CharacterIntrinsicProfile {
  characterId: string;
  stats: readonly CharacterIntrinsicStat[];
  verificationStatus: VerificationStatus;
  provenance: {
    sourceLabels: readonly string[];
    checkedAt: string;
    notes?: readonly string[];
  };
}

export interface CharacterIntrinsicPendingStat {
  characterId: string;
  stat: CharacterIntrinsicStatName;
  checkedAt: string;
  reason: string;
}

const CHECKED_AT = '2026-08-25';
const PRYDWEN = ['Prydwen — current Minor Fortes'] as const;

function verified(
  characterId: string,
  stats: readonly CharacterIntrinsicStat[],
  sourceLabels: readonly string[] = PRYDWEN,
  notes?: readonly string[],
  checkedAt: string = CHECKED_AT,
): CharacterIntrinsicProfile {
  return {
    characterId,
    stats,
    verificationStatus: 'VERIFIED',
    provenance: { sourceLabels, checkedAt, notes },
  };
}

/**
 * Static Minor-Forte totals for every currently RELEASED character.
 *
 * These are raw permanent stat nodes only. Inherent passives, conditional
 * effects, sequence effects and modeled uptime do not belong in this catalog.
 */
export const CHARACTER_INTRINSIC_PROFILES: readonly CharacterIntrinsicProfile[] = [
  verified('aalto', [{ stat: 'Aero DMG', value: 0.12 }, { stat: 'ATK%', value: 0.12 }]),
  verified('aemeath', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('augusta', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('baizhi', [{ stat: 'HP%', value: 0.12 }, { stat: 'Healing Bonus', value: 0.12 }]),
  verified('brant', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('buling', [{ stat: 'Healing Bonus', value: 0.12 }, { stat: 'ATK%', value: 0.12 }]),
  verified('calcharo', [{ stat: 'CRIT DMG', value: 0.16 }, { stat: 'ATK%', value: 0.12 }]),
  verified('camellya', [{ stat: 'CRIT DMG', value: 0.16 }, { stat: 'ATK%', value: 0.12 }]),
  verified('cantarella', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('carlotta', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('cartethyia', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'HP%', value: 0.12 }]),
  verified('changli', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('chisa', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('chixia', [{ stat: 'Fusion DMG', value: 0.12 }, { stat: 'ATK%', value: 0.12 }]),
  verified('ciaccona', [{ stat: 'CRIT DMG', value: 0.16 }, { stat: 'ATK%', value: 0.12 }]),
  verified('danjin', [{ stat: 'Havoc DMG', value: 0.12 }, { stat: 'ATK%', value: 0.12 }]),
  verified('denia', [{ stat: 'CRIT DMG', value: 0.16 }, { stat: 'ATK%', value: 0.12 }]),
  verified('encore', [{ stat: 'Fusion DMG', value: 0.12 }, { stat: 'ATK%', value: 0.12 }]),
  verified('galbrena', [{ stat: 'CRIT DMG', value: 0.16 }, { stat: 'ATK%', value: 0.12 }]),
  verified('hiyuki', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('iuno', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('jianxin', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('jinhsi', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('jiyan', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('lingyang', [{ stat: 'Glacio DMG', value: 0.12 }, { stat: 'ATK%', value: 0.12 }]),
  verified('lucilla', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('lucy', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('lumi', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('lupa', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('luuk-herssen', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('lynae', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified(
    'mornye',
    [{ stat: 'Healing Bonus', value: 0.12 }, { stat: 'DEF%', value: 0.152 }],
    [
      'Arikatsu/WutheringWaves_Data skilltree.json — GameVer 3.6.0 @353f2eaed119bc9f680eab92807d20ac75a79b40',
      'Arikatsu/WutheringWaves_Data skilltree.json — GameVer 3.7.0 @9218d612ad815e398e064e577e42aaf878899968',
      'DommyMM/wuwabuild Characters.json — @2b57a127b26b062ab58d272cd6735338507de1cd',
      'Game8 — itemized Mornye Forte stat nodes',
    ],
    [
      'Healing Bonus: original tree nodes 697/701 and 700/704 grant 1.80% + 4.20% per strand = 12.00% fully unlocked; unchanged in GameVer 3.6.0 and 3.7.0.',
      'DEF%: original tree nodes 698/702 and 699/703 grant 2.28% + 5.32% per strand = 15.20% fully unlocked.',
      'Prydwen/Wutheringlab aggregate +10% Healing totals disagree with the original game nodes; no alternate unlock state was verified.',
    ],
    '2026-10-11',
  ),
  verified('mortefi', [{ stat: 'Fusion DMG', value: 0.12 }, { stat: 'ATK%', value: 0.12 }]),
  verified('phoebe', [{ stat: 'CRIT DMG', value: 0.16 }, { stat: 'ATK%', value: 0.12 }]),
  verified('phrolova', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified(
    'qingxiao',
    [{ stat: 'CRIT DMG', value: 0.16 }, { stat: 'ATK%', value: 0.12 }],
    ['Prydwen — current Minor Fortes', 'Wutheringlab — current Forte nodes'],
    ['Wutheringlab explicitly labels the first current node as CRIT DMG +16%; Prydwen exposes the same +16%/+12% totals but its parsed first label is incomplete.'],
  ),
  verified('qiuyuan', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('rebecca', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('roccia', [{ stat: 'CRIT DMG', value: 0.16 }, { stat: 'ATK%', value: 0.12 }]),
  verified('rover-aero', [{ stat: 'Healing Bonus', value: 0.12 }, { stat: 'ATK%', value: 0.12 }]),
  verified('rover-electro', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('rover-havoc', [{ stat: 'Havoc DMG', value: 0.12 }, { stat: 'ATK%', value: 0.12 }]),
  verified('rover-spectro', [{ stat: 'Spectro DMG', value: 0.12 }, { stat: 'ATK%', value: 0.12 }]),
  verified('sanhua', [{ stat: 'Glacio DMG', value: 0.12 }, { stat: 'ATK%', value: 0.12 }]),
  verified('sigrika', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified(
    'suisui',
    [{ stat: 'Healing Bonus', value: 0.12 }, { stat: 'HP%', value: 0.12 }],
    ['Prydwen — current Minor Fortes', 'Wutheringlab — current Forte nodes'],
    ['Wutheringlab explicitly confirms Healing Bonus +12% and HP +12%; current Prydwen exposes the same totals while its parsed first label is incomplete.'],
  ),
  verified(
    'taoqi',
    [{ stat: 'Havoc DMG', value: 0.12 }, { stat: 'DEF%', value: 0.152 }],
    ['Prydwen — current Minor Fortes', 'Wutheringlab — current Forte nodes'],
  ),
  verified('the-shorekeeper', [{ stat: 'HP%', value: 0.12 }, { stat: 'Healing Bonus', value: 0.12 }]),
  verified('verina', [{ stat: 'ATK%', value: 0.12 }, { stat: 'Healing Bonus', value: 0.12 }]),
  verified('xiangli-yao', [{ stat: 'CRIT DMG', value: 0.16 }, { stat: 'ATK%', value: 0.12 }]),
  verified('yangyang', [{ stat: 'Aero DMG', value: 0.12 }, { stat: 'ATK%', value: 0.12 }]),
  verified('yangyang-xuanling', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('yinlin', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('youhu', [{ stat: 'ATK%', value: 0.12 }, { stat: 'CRIT Rate', value: 0.08 }]),
  verified(
    'yuanwu',
    [{ stat: 'Electro DMG', value: 0.12 }, { stat: 'DEF%', value: 0.152 }],
    ['Prydwen — current Minor Fortes', 'Wutheringlab — current Forte nodes'],
  ),
  verified('zani', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
  verified('zhezhi', [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }]),
] as const;

export const RELEASED_CHARACTER_INTRINSIC_PENDING: readonly CharacterIntrinsicPendingStat[] = [] as const;

export const CHARACTER_INTRINSIC_BY_ID: ReadonlyMap<string, CharacterIntrinsicProfile> = (() => {
  const map = new Map<string, CharacterIntrinsicProfile>();
  for (const profile of CHARACTER_INTRINSIC_PROFILES) {
    if (map.has(profile.characterId)) throw new Error(`Duplicate intrinsic profile: ${profile.characterId}`);
    const names = profile.stats.map((stat) => stat.stat);
    if (new Set(names).size !== names.length) throw new Error(`Duplicate intrinsic stat for ${profile.characterId}.`);
    if (profile.stats.some((stat) => !(stat.value > 0))) throw new Error(`Invalid intrinsic value for ${profile.characterId}.`);
    map.set(profile.characterId, profile);
  }
  return map;
})();

export function getCharacterIntrinsicProfile(characterId: string): CharacterIntrinsicProfile | null {
  return CHARACTER_INTRINSIC_BY_ID.get(characterId) ?? null;
}

export function getCharacterIntrinsicStats(characterId: string): readonly CharacterIntrinsicStat[] | null {
  return getCharacterIntrinsicProfile(characterId)?.stats ?? null;
}
