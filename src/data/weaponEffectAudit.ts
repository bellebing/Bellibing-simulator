import type { WeaponGameData } from '../gameDataDomain.ts';
import type { WeaponEffectData } from '../effectDomain.ts';
import { WEAPON_EFFECT_CATALOG } from './weaponEffectCatalog.ts';
import { WEAPON_CATALOG } from './weapons.ts';

/** Explicit released-roster source-audit backlog. Empty means every released weapon has an audited coverage class. */
export const WEAPON_EFFECT_PENDING_SOURCE_AUDIT_IDS_V36 = [] as const;

/** Released weapons verified to have no combat-affecting passive/effect. */
export const WEAPON_EFFECT_VERIFIED_NO_COMBAT_EFFECT_IDS_V36 = [] as const;

export const WEAPON_EFFECT_ROSTER_AUDIT_V36 = {
  patch: '3.6',
  checkedAt: '2026-08-26',
  expectedReleasedCount: 121,
  notes: [
    '236 source-audited effect rows cover all 121 currently RELEASED weapons; PENDING_SOURCE_AUDIT is zero.',
    'Released source coverage is complete by weapon type: Pistols 22/22, Rectifiers 27/27, Broadblades 23/23, Gauntlets 22/22 and Swords 27/27.',
    'VERIFIED_RAW_PENDING_MODEL mechanics remain explicit modeling gaps; source coverage complete does not mean every conditional/cross-effect mechanic is executable.',
    'Sword conflicts retained explicitly include Blazing Brilliance cleanup timing, Defier’s Thorn 15s timing semantics, Emerald Sentence duration/reset wording and Everbright Polestar Fusion RES rank scaling.',
    'Thousandfold Deliverance is CONFIRMED_UPCOMING and remains outside the released-roster effect gate until it goes live.',
  ],
} as const;

export interface WeaponEffectBackwardImpactReview {
  reviewId: string;
  checkedAt: string;
  weaponIds: readonly string[];
  weaponType: string;
  reviewedReleasedCharacterIds: readonly string[];
  existingWeaponRecommendationProfileIds: readonly string[];
  result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE' | 'IMPACT_FOUND';
  notes: readonly string[];
}

const PISTOL_USERS = ['aalto', 'carlotta', 'chixia', 'ciaccona', 'galbrena', 'lucy', 'lynae', 'mortefi', 'rebecca'] as const;
const RECTIFIER_USERS = ['baizhi', 'buling', 'cantarella', 'denia', 'encore', 'lucilla', 'phoebe', 'phrolova', 'suisui', 'the-shorekeeper', 'verina', 'yinlin', 'zhezhi'] as const;
const BROADBLADE_USERS = ['augusta', 'calcharo', 'chisa', 'jinhsi', 'jiyan', 'lumi', 'lupa', 'mornye', 'taoqi'] as const;
const GAUNTLET_USERS = ['iuno', 'jianxin', 'lingyang', 'luuk-herssen', 'roccia', 'sigrika', 'xiangli-yao', 'youhu', 'yuanwu', 'zani'] as const;
const SWORD_USERS = ['aemeath', 'brant', 'camellya', 'cartethyia', 'changli', 'danjin', 'hiyuki', 'qingxiao', 'qiuyuan', 'rover-aero', 'rover-electro', 'rover-havoc', 'rover-spectro', 'sanhua', 'yangyang', 'yangyang-xuanling'] as const;

/** Mandatory backward-impact evidence for source-audited Weapon Effect batches. */
export const WEAPON_EFFECT_BACKWARD_IMPACT_REVIEWS_V36 = [
  {
    reviewId: 'WEAPON-EFFECT-PISTOLS-2026-08-25-01', checkedAt: '2026-08-25', weaponIds: ['relativistic-jet', 'woodland-aria'], weaponType: 'Pistols', reviewedReleasedCharacterIds: PISTOL_USERS, existingWeaponRecommendationProfileIds: [], result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: ['Full released Pistol roster screened; no production Pistol recommendation profile exists.'],
  },
  {
    reviewId: 'WEAPON-EFFECT-PISTOLS-2026-08-25-02', checkedAt: '2026-08-25', weaponIds: ['cadenza', 'pistols-of-voyager', 'pistols-of-night', 'guardian-pistols', 'originite-type-iii', 'tyro-pistols', 'training-pistols', 'undying-flame', 'novaburst', 'thunderbolt'], weaponType: 'Pistols', reviewedReleasedCharacterIds: PISTOL_USERS, existingWeaponRecommendationProfileIds: [], result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: ['Full released Pistol roster re-screened; source conflicts and event uptime remain explicit.'],
  },
  {
    reviewId: 'WEAPON-EFFECT-PISTOLS-2026-08-25-03', checkedAt: '2026-08-25', weaponIds: ['lux-and-umbra', 'phasic-homogenizer', 'skull-thrasher', 'spectral-trigger', 'static-mist', 'the-last-dance', 'pistols-26', 'romance-in-farewell', 'solar-flame'], weaponType: 'Pistols', reviewedReleasedCharacterIds: PISTOL_USERS, existingWeaponRecommendationProfileIds: [], result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: ['Closed 22/22 released Pistol source coverage; pending-model state mutations remain explicit.'],
  },
  {
    reviewId: 'WEAPON-EFFECT-RECTIFIERS-2026-08-25-01', checkedAt: '2026-08-25', weaponIds: ['boson-astrolabe', 'cosmic-ripples', 'firstlights-herald', 'luminous-hymn', 'stellar-symphony'], weaponType: 'Rectifier', reviewedReleasedCharacterIds: RECTIFIER_USERS, existingWeaponRecommendationProfileIds: [], result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: ['All released Rectifier users screened; Firstlight’s Herald conflict stays pending-model.'],
  },
  {
    reviewId: 'WEAPON-EFFECT-RECTIFIERS-2026-08-25-02', checkedAt: '2026-08-25', weaponIds: ['augment', 'call-of-the-abyss', 'comet-flare', 'fusion-accretion', 'jinzhou-keeper'], weaponType: 'Rectifier', reviewedReleasedCharacterIds: RECTIFIER_USERS, existingWeaponRecommendationProfileIds: [], result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: ['All released Rectifier users re-screened; no recommendation profile exists.'],
  },
  {
    reviewId: 'WEAPON-EFFECT-RECTIFIERS-2026-08-25-03', checkedAt: '2026-08-25', weaponIds: ['oceans-gift', 'radiant-dawn', 'rectifier-25', 'variation', 'waltz-in-masquerade'], weaponType: 'Rectifier', reviewedReleasedCharacterIds: RECTIFIER_USERS, existingWeaponRecommendationProfileIds: [], result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: ['Rectifier#25 exact-60% semantics remain unresolved instead of guessed.'],
  },
  {
    reviewId: 'WEAPON-EFFECT-RECTIFIERS-2026-08-25-04', checkedAt: '2026-08-25', weaponIds: ['guardian-rectifier', 'originite-type-v', 'rectifier-of-night', 'rectifier-of-voyager', 'tyro-rectifier', 'training-rectifier'], weaponType: 'Rectifier', reviewedReleasedCharacterIds: RECTIFIER_USERS, existingWeaponRecommendationProfileIds: [], result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: ['Closed 27/27 released Rectifier source coverage; Night-series source discrepancy remains provenance evidence.'],
  },
  {
    reviewId: 'WEAPON-EFFECT-BROADBLADES-2026-08-25-01', checkedAt: '2026-08-25', weaponIds: ['radiance-cleaver', 'thunderflare-dominion', 'aureate-zenith', 'broadblade-41', 'dauntless-evernight', 'discord', 'meditations-on-mercy', 'waning-redshift', 'beguiling-melody', 'broadblade-of-night', 'broadblade-of-voyager', 'guardian-broadblade', 'originite-type-i', 'tyro-broadblade', 'training-broadblade'], weaponType: 'Broadblade', reviewedReleasedCharacterIds: BROADBLADE_USERS, existingWeaponRecommendationProfileIds: ['augusta-standard-weapons'], result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: ['Closed 23/23 released Broadblade source coverage; Augusta recommendation relations/ranking remain regression-locked and unchanged.'],
  },
  {
    reviewId: 'WEAPON-EFFECT-GAUNTLETS-2026-08-25-01', checkedAt: '2026-08-25', weaponIds: ['abyss-surges', 'blazing-justice', 'daybreakers-spine', 'moongazers-sigil', 'pulsation-bracer', 'solsworn-ciphers', 'tragicomedy', 'veritys-handle', 'aether-strike', 'amity-accord', 'celestial-spiral', 'gauntlets-21d', 'hollow-mirage', 'legend-of-drunken-hero', 'marcato', 'stonard', 'gauntlets-of-night', 'gauntlets-of-voyager', 'guardian-gauntlets', 'originite-type-iv', 'tyro-gauntlets', 'training-gauntlets'], weaponType: 'Gauntlets', reviewedReleasedCharacterIds: GAUNTLET_USERS, existingWeaponRecommendationProfileIds: [], result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: ['Closed 22/22 released Gauntlet source coverage; verified disputed/cross-effect mechanics stay pending-model.'],
  },
  {
    reviewId: 'WEAPON-EFFECT-SWORDS-2026-08-26-01',
    checkedAt: '2026-08-26',
    weaponIds: ['blazing-brilliance', 'bloodpacts-pledge', 'defiers-thorn', 'emerald-sentence', 'emerald-of-genesis', 'everbright-polestar', 'frostburn', 'laser-shearer', 'red-spring', 'unflickering-valor', 'glint-of-clouds', 'commando-of-conviction', 'endless-collapse', 'fables-of-wisdom', 'feather-edge', 'lumingloss', 'lunar-cutter', 'overture', 'somnoire-anchor', 'sword-18', 'guardian-sword', 'originite-type-ii', 'sword-of-night', 'sword-of-voyager', 'tyro-sword', 'training-sword'],
    weaponType: 'Sword',
    reviewedReleasedCharacterIds: SWORD_USERS,
    existingWeaponRecommendationProfileIds: [],
    result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: [
      'Final 26 pending Swords audited; with Azure Oath already covered, released Sword coverage is 27/27.',
      'All 16 released Sword users were screened. No production Sword Weapon Recommendation profile exists.',
      'Blazing Brilliance, Defier’s Thorn, Glint of Clouds, Lunar Cutter and Somnoire Anchor retain explicit pending-model state/timing mechanics rather than guessed execution.',
      'Everbright Polestar and Emerald Sentence keep current multi-source consensus while conflicting secondary representations remain provenance evidence.',
      'Released Weapon Effect source coverage is now 121/121; this does not mark VERIFIED_RAW_PENDING_MODEL mechanics as executable.',
    ],
  },
] as const satisfies readonly WeaponEffectBackwardImpactReview[];

export type WeaponEffectCoverageStatus = 'AUDITED_EFFECTS' | 'VERIFIED_NO_COMBAT_EFFECT' | 'PENDING_SOURCE_AUDIT' | 'MISSING_COVERAGE_STATUS' | 'NOT_RELEASED' | 'UNKNOWN_WEAPON';
export type WeaponEffectCoverageIssueCode = 'RELEASED_COUNT_MISMATCH' | 'MISSING_COVERAGE_STATUS' | 'PENDING_ID_NOT_RELEASED' | 'NO_EFFECT_ID_NOT_RELEASED' | 'PENDING_OVERLAPS_EFFECT_DATA' | 'NO_EFFECT_OVERLAPS_EFFECT_DATA';

export interface WeaponEffectCoverageIssue { code: WeaponEffectCoverageIssueCode; weaponId?: string; detail: string; }
export interface WeaponEffectRosterAudit { releasedCount: number; auditedEffectWeaponCount: number; verifiedNoCombatEffectCount: number; pendingSourceAuditCount: number; explicitCoverageCount: number; fullReleasedRosterComplete: boolean; issues: readonly WeaponEffectCoverageIssue[]; }

function effectWeaponIds(effects: readonly WeaponEffectData[]): Set<string> { return new Set(effects.map((effect) => effect.weaponId)); }

export function getWeaponEffectCoverageStatus(weaponId: string, catalog: readonly WeaponGameData[] = WEAPON_CATALOG, effects: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG): WeaponEffectCoverageStatus {
  const weapon = catalog.find((row) => row.id === weaponId);
  if (!weapon) return 'UNKNOWN_WEAPON';
  if (weapon.releaseStatus !== 'RELEASED') return 'NOT_RELEASED';
  const effectIds = effectWeaponIds(effects);
  if (effectIds.has(weaponId)) return 'AUDITED_EFFECTS';
  if ((WEAPON_EFFECT_VERIFIED_NO_COMBAT_EFFECT_IDS_V36 as readonly string[]).includes(weaponId)) return 'VERIFIED_NO_COMBAT_EFFECT';
  if ((WEAPON_EFFECT_PENDING_SOURCE_AUDIT_IDS_V36 as readonly string[]).includes(weaponId)) return 'PENDING_SOURCE_AUDIT';
  return 'MISSING_COVERAGE_STATUS';
}

export function auditWeaponEffectCoverage(catalog: readonly WeaponGameData[] = WEAPON_CATALOG, effects: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG): WeaponEffectRosterAudit {
  const released = catalog.filter((weapon) => weapon.releaseStatus === 'RELEASED');
  const releasedIds = new Set(released.map((weapon) => weapon.id));
  const effectIds = effectWeaponIds(effects);
  const pendingIds = new Set<string>(WEAPON_EFFECT_PENDING_SOURCE_AUDIT_IDS_V36);
  const noEffectIds = new Set<string>(WEAPON_EFFECT_VERIFIED_NO_COMBAT_EFFECT_IDS_V36);
  const issues: WeaponEffectCoverageIssue[] = [];

  if (released.length !== WEAPON_EFFECT_ROSTER_AUDIT_V36.expectedReleasedCount) issues.push({ code: 'RELEASED_COUNT_MISMATCH', detail: `Expected ${WEAPON_EFFECT_ROSTER_AUDIT_V36.expectedReleasedCount} released weapons for patch ${WEAPON_EFFECT_ROSTER_AUDIT_V36.patch}, found ${released.length}.` });
  for (const weaponId of pendingIds) {
    if (!releasedIds.has(weaponId)) issues.push({ code: 'PENDING_ID_NOT_RELEASED', weaponId, detail: `${weaponId} is registered as pending Weapon Effect source audit but is not RELEASED in the supplied catalog.` });
    if (effectIds.has(weaponId)) issues.push({ code: 'PENDING_OVERLAPS_EFFECT_DATA', weaponId, detail: `${weaponId} has audited effect data and must be removed from the pending-source-audit set.` });
  }
  for (const weaponId of noEffectIds) {
    if (!releasedIds.has(weaponId)) issues.push({ code: 'NO_EFFECT_ID_NOT_RELEASED', weaponId, detail: `${weaponId} is registered as verified no-combat-effect but is not RELEASED in the supplied catalog.` });
    if (effectIds.has(weaponId)) issues.push({ code: 'NO_EFFECT_OVERLAPS_EFFECT_DATA', weaponId, detail: `${weaponId} cannot have effect rows and VERIFIED_NO_COMBAT_EFFECT coverage simultaneously.` });
  }

  let auditedEffectWeaponCount = 0;
  let verifiedNoCombatEffectCount = 0;
  let pendingSourceAuditCount = 0;
  let explicitCoverageCount = 0;
  for (const weapon of released) {
    const status = getWeaponEffectCoverageStatus(weapon.id, catalog, effects);
    if (status === 'AUDITED_EFFECTS') auditedEffectWeaponCount += 1;
    if (status === 'VERIFIED_NO_COMBAT_EFFECT') verifiedNoCombatEffectCount += 1;
    if (status === 'PENDING_SOURCE_AUDIT') pendingSourceAuditCount += 1;
    if (status === 'AUDITED_EFFECTS' || status === 'VERIFIED_NO_COMBAT_EFFECT' || status === 'PENDING_SOURCE_AUDIT') explicitCoverageCount += 1;
    else issues.push({ code: 'MISSING_COVERAGE_STATUS', weaponId: weapon.id, detail: `Released weapon ${weapon.id} has no explicit Weapon Effect coverage status.` });
  }

  return { releasedCount: released.length, auditedEffectWeaponCount, verifiedNoCombatEffectCount, pendingSourceAuditCount, explicitCoverageCount, fullReleasedRosterComplete: issues.length === 0 && pendingSourceAuditCount === 0, issues };
}