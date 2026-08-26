import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterMechanicModelStatus,
  CharacterMotionValueComponent,
  CharacterMotionValueCurve,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-26';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/aemeath';
const WUTHERINGLAB = 'https://wutheringlab.com/character/aemeath-build/';
const WUWA_BUILDS = 'https://wuwa.build/characters/1210';
const FANDOM_COMBAT = 'https://wutheringwaves.fandom.com/wiki/Aemeath/Combat';

const AEMEATH_PROVENANCE = {
  sourceLabels: [
    'Prydwen — current Aemeath kit',
    'Wutheringlab — current Aemeath kit/multiplier tables',
    'WuWaBuilds — current Aemeath kit/multiplier tables',
    'Wuthering Waves Wiki/Fandom — current Aemeath combat tables',
  ],
  sourceUrls: [PRYDWEN, WUTHERINGLAB, WUWA_BUILDS, FANDOM_COMBAT],
  checkedAt: CHECKED_AT,
  notes: [
    'Current multi-source consensus is used for kit identity, resource rules and Lv1-Lv10 curves; source disagreements remain explicit rather than being silently normalized.',
    'WWPlus currently repeats several Lv2 Basic-table cells at Lv3 and has a malformed Starburst Lv6 cell. Bellibing uses the progressing current Fandom combat table, cross-checked against current endpoints, and records those WWPlus cells as source-display errors rather than game mechanics.',
    'Current Prydwen/Wutheringlab/WuWaBuilds/Game8 consensus restores 40 Synchronization Rate from Intro and 30 from Heavenfall Edict: Overdrive. Stale tooltip representations reversing those values are not adopted.',
    'Seraphic Duet labels conflict across current sources. Bellibing follows Fandom/WuWaBuilds/Wuthering.gg consensus: Encore is the 9%*4+18%*3+90% line and Overture is the 9%+7.5%*6+12%*3+30%*3 line; Wutheringlab/WWPlus currently display the labels reversed.',
    'Source-facing mixed damage expressions are stored as independent coefficient curves with explicit hit counts, never flattened into one raw total.',
  ],
} as const;

function pct(values: CharacterMotionValueCurve): CharacterMotionValueCurve {
  return values.map((value) => value / 100) as unknown as CharacterMotionValueCurve;
}

function component(curve: CharacterMotionValueCurve, hitCount = 1): CharacterMotionValueComponent {
  return { curve, hitCount };
}

function action(
  input: Omit<
    CharacterActionFact,
    'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'
  > & { modelingStatus?: CharacterMechanicModelStatus },
): CharacterActionFact {
  const { modelingStatus = 'MODEL_READY', ...rest } = input;
  return {
    ...rest,
    characterId: 'aemeath',
    kind: 'ACTION',
    verificationStatus: 'VERIFIED',
    modelingStatus,
    motionValue: null,
    provenance: AEMEATH_PROVENANCE,
  };
}

function passive(
  input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>
    & { modelingStatus?: CharacterMechanicModelStatus },
): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return {
    ...rest,
    characterId: 'aemeath',
    kind: 'PASSIVE',
    verificationStatus: 'VERIFIED',
    modelingStatus,
    provenance: AEMEATH_PROVENANCE,
  };
}

function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return {
    ...input,
    characterId: 'aemeath',
    kind: 'RESOURCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: AEMEATH_PROVENANCE,
  };
}

function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return {
    ...input,
    characterId: 'aemeath',
    kind: 'SEQUENCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: AEMEATH_PROVENANCE,
  };
}

const CURVE_CONTEXT = 'Current source Lv1-Lv10 listed coefficient curve; raw data does not implicitly choose a talent level or flatten mixed hit components.';

const BASIC_1 = pct([23.31, 25.23, 27.14, 29.81, 31.73, 33.92, 36.98, 40.04, 43.10, 46.35]);
const BASIC_2_A = pct([6.99, 7.56, 8.14, 8.94, 9.51, 10.17, 11.09, 12, 12.92, 13.89]);
const BASIC_2_B = pct([10.48, 11.34, 12.20, 13.41, 14.26, 15.25, 16.63, 18, 19.38, 20.84]);
const BASIC_2_C = pct([17.47, 18.90, 20.33, 22.34, 23.77, 25.42, 27.71, 30, 32.29, 34.73]);
const BASIC_3_A = pct([4.69, 5.07, 5.46, 5.99, 6.38, 6.82, 7.43, 8.05, 8.66, 9.32]);
const BASIC_3_B = pct([9.37, 10.14, 10.91, 11.98, 12.75, 13.63, 14.86, 16.09, 17.32, 18.63]);
const BASIC_3_C = pct([23.42, 25.34, 27.26, 29.95, 31.87, 34.08, 37.15, 40.22, 43.29, 46.56]);
const BASIC_4_A = pct([3.39, 3.67, 3.94, 4.33, 4.61, 4.93, 5.37, 5.82, 6.26, 6.73]);
const BASIC_4_B = pct([50.77, 54.94, 59.10, 64.93, 69.09, 73.88, 80.54, 87.20, 93.86, 100.94]);
const HEAVY_I_A = pct([9.34, 10.11, 10.87, 11.95, 12.71, 13.59, 14.82, 16.04, 17.27, 18.57]);
const HEAVY_I_B = pct([37.36, 40.42, 43.48, 47.77, 50.83, 54.36, 59.26, 64.16, 69.06, 74.26]);
const HEAVY_II_A = pct([5.84, 6.32, 6.80, 7.47, 7.94, 8.49, 9.26, 10.03, 10.79, 11.60]);
const HEAVY_II_B = pct([93.36, 101.01, 108.67, 119.38, 127.04, 135.84, 148.09, 160.34, 172.58, 185.60]);
const MID_AIR = pct([43.40, 46.96, 50.52, 55.50, 59.06, 63.16, 68.85, 74.54, 80.24, 86.29]);
const DODGE_A = pct([13.09, 14.16, 15.23, 16.74, 17.81, 19.04, 20.76, 22.48, 24.19, 26.02]);
const DODGE_B = pct([26.17, 28.32, 30.46, 33.47, 35.61, 38.08, 41.51, 44.95, 48.38, 52.03]);
const DODGE_C = pct([65.42, 70.78, 76.15, 83.66, 89.02, 95.19, 103.77, 112.36, 120.94, 130.06]);

const ARMAMENT_A = pct([13.54, 14.65, 15.76, 17.32, 18.43, 19.70, 21.48, 23.26, 25.03, 26.92]);
const ARMAMENT_B = pct([20.31, 21.98, 23.64, 25.97, 27.64, 29.55, 32.22, 34.88, 37.55, 40.38]);
const ARMAMENT_C = pct([33.85, 36.63, 39.40, 43.29, 46.06, 49.25, 53.69, 58.13, 62.57, 67.29]);
const CALL_A = pct([8.22, 8.89, 9.56, 10.51, 11.18, 11.95, 13.03, 14.11, 15.18, 16.33]);
const CALL_B = pct([57.48, 62.20, 66.91, 73.51, 78.22, 83.64, 91.18, 98.72, 106.26, 114.28]);
const MECH_BASIC_1 = pct([11.67, 12.63, 13.58, 14.92, 15.88, 16.98, 18.51, 20.04, 21.57, 23.20]);
const MECH_BASIC_3_A = pct([1.96, 2.12, 2.28, 2.50, 2.66, 2.85, 3.10, 3.36, 3.62, 3.89]);
const MECH_BASIC_3_B = pct([41.02, 44.38, 47.74, 52.45, 55.82, 59.68, 65.06, 70.44, 75.83, 81.54]);
const MECH_BASIC_3_C = pct([5.86, 6.34, 6.82, 7.50, 7.98, 8.53, 9.30, 10.07, 10.84, 11.65]);
const MECH_BASIC_4_A = pct([20.31, 21.98, 23.64, 25.97, 27.64, 29.55, 32.22, 34.88, 37.55, 40.38]);
const MECH_BASIC_4_B = pct([47.39, 51.27, 55.16, 60.60, 64.48, 68.95, 75.17, 81.39, 87.60, 94.21]);
const MECH_HEAVY_I = pct([46.69, 50.52, 54.35, 59.71, 63.54, 67.94, 74.07, 80.20, 86.32, 92.83]);
const MECH_HEAVY_II = pct([116.69, 126.26, 135.83, 149.23, 158.80, 169.80, 185.11, 200.42, 215.73, 232.00]);
const MECH_MIDAIR_A = pct([36.89, 39.92, 42.94, 47.18, 50.20, 53.68, 58.52, 63.36, 68.20, 73.35]);
const MECH_MIDAIR_B = pct([2.17, 2.35, 2.53, 2.78, 2.96, 3.16, 3.45, 3.73, 4.02, 4.32]);
const MECH_DODGE_A = pct([4.76, 5.15, 5.54, 6.08, 6.47, 6.92, 7.54, 8.17, 8.79, 9.45]);
const MECH_DODGE_B = pct([99.82, 108, 116.19, 127.65, 135.83, 145.24, 158.34, 171.43, 184.53, 198.44]);
const MECH_DODGE_C = pct([14.26, 15.43, 16.60, 18.24, 19.41, 20.75, 22.62, 24.49, 26.37, 28.35]);

const OVERDRIVE_A = pct([101, 109.29, 117.57, 129.16, 137.45, 146.97, 160.22, 173.47, 186.72, 200.80]);
const OVERDRIVE_B = pct([134.67, 145.71, 156.76, 172.22, 183.26, 195.96, 213.63, 231.29, 248.96, 267.74]);
const FINALE = pct([900, 973.8, 1047.6, 1150.92, 1224.72, 1309.59, 1427.67, 1545.75, 1663.83, 1789.29]);

const ENCORE_A = pct([9, 9.74, 10.48, 11.51, 12.25, 13.10, 14.28, 15.46, 16.64, 17.90]);
const ENCORE_B = pct([18, 19.48, 20.96, 23.02, 24.50, 26.20, 28.56, 30.92, 33.28, 35.79]);
const ENCORE_C = pct([90, 97.38, 104.76, 115.10, 122.48, 130.96, 142.77, 154.58, 166.39, 178.93]);
const OVERTURE_A = ENCORE_A;
const OVERTURE_B = pct([7.5, 8.12, 8.73, 9.60, 10.21, 10.92, 11.90, 12.89, 13.87, 14.92]);
const OVERTURE_C = pct([12, 12.99, 13.97, 15.35, 16.33, 17.47, 19.04, 20.61, 22.19, 23.86]);
const OVERTURE_D = pct([30, 32.46, 34.92, 38.37, 40.83, 43.66, 47.59, 51.53, 55.47, 59.65]);
const STARBURST = pct([300, 324.6, 349.2, 383.64, 408.24, 436.53, 475.89, 515.25, 554.61, 596.43]);
const DUET_BONUS = pct([55, 59.51, 64.02, 70.34, 74.85, 80.04, 87.25, 94.47, 101.68, 109.35]);

const INTRO_SONGS_A = pct([6.77, 7.33, 7.88, 8.66, 9.22, 9.85, 10.74, 11.63, 12.52, 13.46]);
const INTRO_SONGS_B = pct([54.16, 58.60, 63.04, 69.25, 73.70, 78.80, 85.91, 93.01, 100.12, 107.66]);
const INTRO_DEBUT_A = pct([32.85, 35.54, 38.24, 42.01, 44.70, 47.80, 52.11, 56.41, 60.72, 65.30]);
const INTRO_DEBUT_B = pct([49.27, 53.31, 57.35, 63.01, 67.05, 71.69, 78.16, 84.62, 91.08, 97.95]);

export const AEMEATH_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'aemeath-basic-infinity-calibration-1', name: 'Basic Attack — Infinity Calibration Stage 1', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: BASIC_1, hitCount: 1, conditional: false }),
  action({ factId: 'aemeath-basic-infinity-calibration-2', name: 'Basic Attack — Infinity Calibration Stage 2', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(BASIC_2_A), component(BASIC_2_B), component(BASIC_2_C)], hitCount: null, conditional: false }),
  action({ factId: 'aemeath-basic-infinity-calibration-3', name: 'Basic Attack — Infinity Calibration Stage 3', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(BASIC_3_A, 3), component(BASIC_3_B), component(BASIC_3_C)], hitCount: null, conditional: false }),
  action({ factId: 'aemeath-basic-infinity-calibration-4', name: 'Basic Attack — Infinity Calibration Stage 4', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(BASIC_4_A, 5), component(BASIC_4_B)], hitCount: null, conditional: false, notes: ['Casting Aemeath or Mech Basic Stage 4 also enters Seraphic Duo for 5 seconds; that state is stored separately.'] }),
  action({ factId: 'aemeath-heavy-charged-i', name: 'Heavy Attack — Aemeath Charged I', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(HEAVY_I_A), component(HEAVY_I_B)], hitCount: null, conditional: false }),
  action({ factId: 'aemeath-heavy-charged-ii', name: 'Heavy Attack — Aemeath Charged II', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(HEAVY_II_A, 4), component(HEAVY_II_B)], hitCount: null, conditional: false, notes: ['Current kit sources explicitly classify Charged II damage as Resonance Liberation DMG; Charged I remains Heavy Attack DMG.'] }),
  action({ factId: 'aemeath-midair-infinity-calibration', name: 'Mid-air Attack — Infinity Calibration', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: MID_AIR, hitCount: 1, conditional: false }),
  action({ factId: 'aemeath-dodge-counter-infinity-calibration', name: 'Dodge Counter — Infinity Calibration', section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(DODGE_A, 3), component(DODGE_B), component(DODGE_C)], hitCount: null, conditional: true }),

  action({ factId: 'aemeath-skill-sync-strike-armament-merge', name: 'Resonance Skill — Sync Strike: Armament Merge', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(ARMAMENT_A), component(ARMAMENT_B), component(ARMAMENT_C)], hitCount: null, conditional: false }),
  action({ factId: 'aemeath-skill-sync-strike-call-of-dawn', name: 'Resonance Skill — Sync Strike: Call of Dawn', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(CALL_A, 3), component(CALL_B)], hitCount: null, conditional: false }),
  action({ factId: 'aemeath-mech-basic-1', name: 'Basic Attack — Mech Stage 1', section: 'RESONANCE_SKILL', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: MECH_BASIC_1, hitCount: 3, conditional: true }),
  action({ factId: 'aemeath-mech-basic-2', name: 'Basic Attack — Mech Stage 2', section: 'RESONANCE_SKILL', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(HEAVY_I_A), component(HEAVY_I_B)], hitCount: null, conditional: true }),
  action({ factId: 'aemeath-mech-basic-3', name: 'Basic Attack — Mech Stage 3', section: 'RESONANCE_SKILL', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(MECH_BASIC_3_A, 6), component(MECH_BASIC_3_B), component(MECH_BASIC_3_C)], hitCount: null, conditional: true }),
  action({ factId: 'aemeath-mech-basic-4', name: 'Basic Attack — Mech Stage 4', section: 'RESONANCE_SKILL', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(MECH_BASIC_4_A), component(MECH_BASIC_4_B)], hitCount: null, conditional: true }),
  action({ factId: 'aemeath-mech-heavy-charged-i', name: 'Heavy Attack — Mech Charged I', section: 'RESONANCE_SKILL', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: MECH_HEAVY_I, hitCount: 1, conditional: true }),
  action({ factId: 'aemeath-mech-heavy-charged-ii', name: 'Heavy Attack — Mech Charged II', section: 'RESONANCE_SKILL', actionKind: 'HEAVY', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: MECH_HEAVY_II, hitCount: 1, conditional: true, notes: ['Current kit sources explicitly classify Mech Charged II as Resonance Liberation DMG.'] }),
  action({ factId: 'aemeath-mech-midair', name: 'Mid-air Attack — Mech', section: 'RESONANCE_SKILL', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(MECH_MIDAIR_A), component(MECH_MIDAIR_B, 3)], hitCount: null, conditional: true }),
  action({ factId: 'aemeath-mech-dodge-counter', name: 'Dodge Counter — Mech', section: 'RESONANCE_SKILL', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(MECH_DODGE_A, 6), component(MECH_DODGE_B), component(MECH_DODGE_C)], hitCount: null, conditional: true }),

  action({ factId: 'aemeath-liberation-heavenfall-overdrive', name: 'Resonance Liberation — Heavenfall Edict: Overdrive', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(OVERDRIVE_A), component(OVERDRIVE_B, 3)], hitCount: null, conditional: false }),
  action({ factId: 'aemeath-liberation-heavenfall-finale', name: 'Resonance Liberation — Heavenfall Edict: Finale', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: FINALE, hitCount: 1, conditional: true }),

  action({ factId: 'aemeath-forte-seraphic-duet-encore', name: 'Forte Circuit — Seraphic Duet: Encore', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(ENCORE_A, 4), component(ENCORE_B, 3), component(ENCORE_C)], hitCount: null, conditional: true, notes: ['Current Fandom/WuWaBuilds/Wuthering.gg label consensus is used; Wutheringlab/WWPlus currently swap the Overture/Encore table labels.'] }),
  action({ factId: 'aemeath-forte-seraphic-duet-overture', name: 'Forte Circuit — Seraphic Duet: Overture', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(OVERTURE_A), component(OVERTURE_B, 6), component(OVERTURE_C, 3), component(OVERTURE_D, 3)], hitCount: null, conditional: true, notes: ['Current Fandom/WuWaBuilds/Wuthering.gg label consensus is used; Wutheringlab/WWPlus currently swap the Overture/Encore table labels.'] }),
  action({ factId: 'aemeath-forte-starburst', name: 'Forte Circuit — Tune Rupture Response: Starburst', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'OTHER', scalingStat: 'TUNE_AMP', motionValueContext: CURVE_CONTEXT, motionValueCurve: STARBURST, hitCount: 1, conditional: true, modelingStatus: 'PENDING_INTERPRETATION', notes: ['Starburst is source-classified Tune Rupture DMG and scales on Tune AMP. WWPlus currently has a malformed Lv6 table cell; current Fandom combat data gives 436.53% Tune AMP.'] }),
  action({ factId: 'aemeath-forte-seraphic-duet-bonus-instance', name: 'Forte Circuit — Seraphic Duet Bonus DMG (Per Instance)', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'OTHER', scalingStat: 'TUNE_AMP', motionValueContext: CURVE_CONTEXT, motionValueCurve: DUET_BONUS, hitCount: 1, conditional: true, modelingStatus: 'PENDING_INTERPRETATION', notes: ['Source table exposes this as a separate Tune AMP-scaled bonus-damage coefficient per instance; exact encounter/status execution remains separate.'] }),

  action({ factId: 'aemeath-intro-songs-across-universe', name: 'Intro Skill — Songs Across the Universe', section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(INTRO_SONGS_A, 2), component(INTRO_SONGS_B)], hitCount: null, conditional: false }),
  action({ factId: 'aemeath-intro-debut-meteoric-radiance', name: 'Intro Skill — Debut of Meteoric Radiance', section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [component(INTRO_DEBUT_A), component(INTRO_DEBUT_B)], hitCount: null, conditional: false }),
] as const;

export const AEMEATH_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({
    factId: 'aemeath-resource-synchronization-rate',
    name: 'Synchronization Rate',
    section: 'FORTE_CIRCUIT',
    conditional: false,
    resourceName: 'Synchronization Rate',
    maxValue: 200,
    ruleSummary: 'Synchronization Rate is capped at 200. Songs Across the Universe or Debut of Meteoric Radiance restores 40. Heavenfall Edict: Overdrive restores 30. While Instant Response and Heavenfall Edict: Unbound are both active, Aemeath Charged II or Mech Charged II restores 200. Seraphic Duet costs 100 Synchronization Rate.',
    notes: ['Current multi-source consensus is Intro +40 / Overdrive +30; stale tooltip representations reversing these two values are retained only as provenance discrepancy.'],
  }),
  resource({
    factId: 'aemeath-resource-resonance-rate',
    name: 'Resonance Rate',
    section: 'RESONANCE_LIBERATION',
    conditional: false,
    resourceName: 'Resonance Rate',
    maxValue: 4,
    ruleSummary: 'Resonance Rate is capped at 4. Casting Seraphic Duet restores 1. Casting Heavenfall Edict: Overdrive restores 1, plus 1 additional point while Starlume Acceleration is active. Heavenfall Edict: Finale requires Heavenfall Edict: Unbound and capped Resonance Rate together with capped Synchronization Rate.',
  }),
  resource({
    factId: 'aemeath-resource-starflux',
    name: 'Starflux',
    section: 'FORTE_CIRCUIT',
    conditional: false,
    resourceName: 'Starflux',
    maxValue: 600,
    ruleSummary: 'Starflux is capped at 600 and recovers naturally over time; current sources state recovery is slower while in combat. In Mech form, Starflux Thrust becomes available above 200 and consumes Starflux continuously while soaring.',
  }),
] as const;

export const AEMEATH_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'aemeath-skill-form-switch',
    name: 'Resonance Skill — Form Switch',
    section: 'RESONANCE_SKILL',
    conditional: false,
    scope: 'SELF',
    triggerSummary: 'Use Resonance Skill Form Switch or a kit transition that switches between Aemeath and Mech.',
    effectSummary: 'Aemeath can switch between her Aemeath and Mech forms. The Mech inherits Aemeath combat stats; specific follow-up windows can route directly into Stage 2 attacks.',
    durationSeconds: null,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'aemeath-forte-seraphic-duo-state',
    name: 'Forte Circuit — Seraphic Duo',
    section: 'FORTE_CIRCUIT',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Cast Basic Attack — Aemeath Stage 4 or Basic Attack — Mech Stage 4.',
    effectSummary: 'Enter Seraphic Duo for 5 seconds. With at least 100 Synchronization Rate, the appropriate Seraphic Duet can be cast at a cost of 100, deals Fusion DMG considered Resonance Liberation DMG, switches form, and exits Seraphic Duo.',
    durationSeconds: 5,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'aemeath-forte-resonance-mode-trails',
    name: 'Forte Circuit — Resonance Mode and Trails',
    section: 'FORTE_CIRCUIT',
    conditional: true,
    scope: 'TARGET',
    triggerSummary: 'Aemeath operates in Tune Rupture or Fusion Burst Resonance Mode and qualifying team actions interact with the corresponding status.',
    effectSummary: 'Tune Rupture responses inflict 10 Rupturous Trail stacks for 30 seconds, up to 30. Fusion Burst inflictions add 1 Fusion Trail for 30 seconds, up to 30. Qualifying Aemeath skills can inflict the mode status on a target; the same skill can trigger that status application on the same target once every 3 seconds. Trail consumption modifies the corresponding response/burst damage.',
    durationSeconds: 30,
    maxStacks: 30,
    modelingStatus: 'PENDING_INTERPRETATION',
    notes: ['Target trail/status transition timing is raw verified but not converted into automatic uptime or stack assumptions.'],
  }),
  passive({
    factId: 'aemeath-liberation-stardust-resonance',
    name: 'Resonance Liberation — Stardust Resonance',
    section: 'RESONANCE_LIBERATION',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Cast Heavenfall Edict: Overdrive.',
    effectSummary: 'Enter Stardust Resonance for 30 seconds. The next Seraphic Duet within the window gains mode-specific enhancements; current sources also describe a protected next-Duet trail-consumption interaction in this state.',
    durationSeconds: 30,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'aemeath-liberation-heavenfall-unbound',
    name: 'Resonance Liberation — Heavenfall Edict: Unbound / Instant Response',
    section: 'RESONANCE_LIBERATION',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Cast Heavenfall Edict: Overdrive; Instant Response becomes available when Heavenfall Edict: Unbound is active and Resonance Rate reaches its cap.',
    effectSummary: 'Heavenfall Edict: Unbound lasts 60 seconds and replaces Overdrive with Finale. Instant Response remains tied to the Unbound window and accelerates Heavy Attack charging; with both states active, Charged II restores 200 Synchronization Rate.',
    durationSeconds: 60,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'aemeath-intro-starlume-acceleration',
    name: 'Intro Skill — Starlume Acceleration',
    section: 'INTRO_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Cast Songs Across the Universe or Debut of Meteoric Radiance.',
    effectSummary: 'Enter Starlume Acceleration for 15 seconds. While active, Heavenfall Edict: Overdrive restores 1 additional Resonance Rate; casting Overdrive ends Starlume Acceleration.',
    durationSeconds: 15,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'aemeath-forte-unlanded-melody',
    name: 'Forte Circuit — Unlanded Melody / response state',
    section: 'FORTE_CIRCUIT',
    conditional: true,
    scope: 'TARGET',
    triggerSummary: 'In the relevant Resonance Mode, Aemeath responds to Tune Rupture - Interfered or the corresponding Fusion Burst state on a target.',
    effectSummary: 'Tune Rupture Response — Starburst deals Fusion DMG considered Tune Rupture DMG. Current sources state the same target can only be damaged by this response once every 8 seconds. Fusion Burst mode uses its own burst/trail response rules.',
    durationSeconds: null,
    maxStacks: null,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'aemeath-inherent-before-all-sounds',
    name: 'Inherent Skill — Before All Sounds',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Aemeath is in Instant Response.',
    effectSummary: 'Heavy Attack — Aemeath and Heavy Attack — Mech gain 200% DMG Amplification.',
    durationSeconds: null,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'aemeath-inherent-between-the-stars',
    name: 'Inherent Skill — Between the Stars',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Team Resonators trigger the current Resonance Mode status interaction; each Resonator can trigger the stack gain once.',
    effectSummary: 'Tune Rupture mode grants Aemeath 20% Crit DMG per trigger, up to 3 stacks; at 3 stacks Finale DMG is Amplified by 25%. Fusion Burst mode grants 30% Crit DMG per trigger, up to 2 stacks; at 2 stacks Finale DMG is Amplified by 25%. Joining the team or switching Resonance Mode resets the effect.',
    durationSeconds: null,
    maxStacks: 3,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'aemeath-outro-silent-protection',
    name: 'Outro Skill — Silent Protection',
    section: 'OUTRO_SKILL',
    conditional: true,
    scope: 'TEAM',
    triggerSummary: 'Aemeath casts Outro Skill.',
    effectSummary: 'All Resonators in the team other than Aemeath gain 10% All-DMG Amplification for 20 seconds. Qualifying Resonators that can trigger Tune Rupture or Fusion Burst receive 20% instead. Recasting the Outro resets the duration.',
    durationSeconds: 20,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
] as const;

export const AEMEATH_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({
    factId: 'aemeath-s1-gilded-glimmer-first-dawn',
    name: 'S1 — Gilded Glimmer of the First Dawn',
    section: 'RESONANCE_CHAIN',
    sequence: 1,
    conditional: true,
    triggerSummary: 'Active at Sequence 1; multiple branches depend on Instant Response, Heavenfall Edict: Unbound and the Sealed Trail/Brilliance state conditions.',
    effectSummary: 'Instant Response Heavy Attack — Aemeath and Heavy Attack — Mech gain 300% Crit DMG. The sequence adds its source-specified pull/Brilliance behavior, extra Synchronization Rate generation after the qualifying state duration, and Sealed Trail carryover for 10 seconds.',
  }),
  sequence({
    factId: 'aemeath-s2-downy-notes-snowfluff',
    name: 'S2 — Downy Notes of Snowfluff',
    section: 'RESONANCE_CHAIN',
    sequence: 2,
    conditional: true,
    triggerSummary: 'Active at Sequence 2; additional branches depend on current Resonance Mode and target trail/status state.',
    effectSummary: 'Increases both Seraphic Duet multipliers by 100%. In Tune Rupture mode, each removed Rupturous Trail stack adds 20% to the response multiplier for 1 second, up to 5 stacks. In Fusion Burst mode, Stardust Resonance adds a 400% main-target multiplier branch and each Fusion Trail stack contributes 15%; defeating nearby targets can automatically trigger Fusion Burst under the source conditions.',
  }),
  sequence({
    factId: 'aemeath-s3-stellar-song-silent-cosmos',
    name: 'S3 — Stellar Song Across the Silent Cosmos',
    section: 'RESONANCE_CHAIN',
    sequence: 3,
    conditional: true,
    triggerSummary: 'Active at Sequence 3; status application and replacement Between the Stars behavior depend on current Resonance Mode.',
    effectSummary: 'Increases Heavenfall Edict: Finale DMG Multiplier by 100% and Heavenfall Edict: Overdrive DMG Multiplier by 40%. Instant Response Heavy Attacks gain the source-specified mode-status application. Between the Stars is replaced by the S3 mode effect that grants 60% Crit DMG and 25% Finale DMG Amplification under its corresponding trigger conditions.',
  }),
  sequence({
    factId: 'aemeath-s4-ethereal-waltz-binary-tides',
    name: 'S4 — Ethereal Waltz on Binary Tides',
    section: 'RESONANCE_CHAIN',
    sequence: 4,
    conditional: true,
    triggerSummary: 'Cast Intro Skill Songs Across the Universe or Debut of Meteoric Radiance, Resonance Skill Sync Strike, or Resonance Skill Seraphic Duet.',
    effectSummary: 'Resonators in the team gain 20% All-Attribute DMG Bonus for 30 seconds.',
  }),
  sequence({
    factId: 'aemeath-s5-return-stardust',
    name: 'S5 — Return from Stardust',
    section: 'RESONANCE_CHAIN',
    sequence: 5,
    conditional: true,
    triggerSummary: 'Defeat a target or receive fatal damage while the sequence conditions permit the corresponding branch.',
    effectSummary: 'Defeating a target resets Starflux to 100%. On fatal damage, the source-defined 2D ghost state lasts 5 seconds, grants the team a shield equal to 360% of Aemeath ATK for 5 seconds, then revives Aemeath at 100% HP and restores 30 Resonance Energy. The fatal-damage branch can trigger once every 10 minutes.',
  }),
  sequence({
    factId: 'aemeath-s6-beyond-limitless-horizon',
    name: 'S6 — Beyond the Limitless Horizon',
    section: 'RESONANCE_CHAIN',
    sequence: 6,
    conditional: true,
    triggerSummary: 'Active at Sequence 6; response and trail branches depend on current Resonance Mode and nearby target states.',
    effectSummary: 'Targets take 40% more Resonance Liberation DMG from Aemeath. Tune Rupture DMG and Fusion Burst triggered near the active Resonator can critically hit with fixed 80% Crit Rate and 275% Crit DMG. Trail stacks inflicted are doubled, maximum trail stacks increase to 60, and Seraphic Duet inflicts 10 trail stacks for 30 seconds under the corresponding mode rules.',
  }),
] as const;

export const AEMEATH_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...AEMEATH_ACTION_FACTS,
  ...AEMEATH_RESOURCE_FACTS,
  ...AEMEATH_PASSIVE_FACTS,
  ...AEMEATH_SEQUENCE_FACTS,
] as const;
