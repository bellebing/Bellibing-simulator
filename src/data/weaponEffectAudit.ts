import type { WeaponGameData } from '../gameDataDomain.ts';
import type { WeaponEffectData } from '../effectDomain.ts';
import { WEAPON_EFFECT_CATALOG } from './weaponEffects.ts';
import { WEAPON_CATALOG } from './weapons.ts';

/**
 * Explicit current-patch coverage for released weapons whose passive/effect
 * source audit has not been completed yet.
 *
 * This list is intentionally frozen and explicit. A future RELEASED weapon is
 * therefore not automatically classified as pending: it must be reviewed and
 * added to an audited coverage class, otherwise the roster gate fails.
 */
export const WEAPON_EFFECT_PENDING_SOURCE_AUDIT_IDS_V36 = [
  'radiance-cleaver',
  'thunderflare-dominion',
  'abyss-surges',
  'blazing-justice',
  'daybreakers-spine',
  'moongazers-sigil',
  'pulsation-bracer',
  'solsworn-ciphers',
  'tragicomedy',
  'veritys-handle',
  'lux-and-umbra',
  'phasic-homogenizer',
  'skull-thrasher',
  'spectral-trigger',
  'static-mist',
  'the-last-dance',
  'boson-astrolabe',
  'cosmic-ripples',
  'firstlights-herald',
  'luminous-hymn',
  'stellar-symphony',
  'blazing-brilliance',
  'bloodpacts-pledge',
  'defiers-thorn',
  'emerald-sentence',
  'emerald-of-genesis',
  'everbright-polestar',
  'frostburn',
  'laser-shearer',
  'red-spring',
  'unflickering-valor',
  'glint-of-clouds',
  'aureate-zenith',
  'broadblade-41',
  'dauntless-evernight',
  'discord',
  'meditations-on-mercy',
  'waning-redshift',
  'aether-strike',
  'amity-accord',
  'celestial-spiral',
  'gauntlets-21d',
  'hollow-mirage',
  'legend-of-drunken-hero',
  'marcato',
  'stonard',
  'cadenza',
  'novaburst',
  'pistols-26',
  'romance-in-farewell',
  'solar-flame',
  'thunderbolt',
  'undying-flame',
  'augment',
  'call-of-the-abyss',
  'comet-flare',
  'fusion-accretion',
  'jinzhou-keeper',
  'oceans-gift',
  'radiant-dawn',
  'rectifier-25',
  'variation',
  'waltz-in-masquerade',
  'commando-of-conviction',
  'endless-collapse',
  'fables-of-wisdom',
  'feather-edge',
  'lumingloss',
  'lunar-cutter',
  'overture',
  'somnoire-anchor',
  'sword-18',
  'beguiling-melody',
  'broadblade-of-night',
  'broadblade-of-voyager',
  'guardian-broadblade',
  'originite-type-i',
  'gauntlets-of-night',
  'gauntlets-of-voyager',
  'guardian-gauntlets',
  'originite-type-iv',
  'guardian-pistols',
  'originite-type-iii',
  'pistols-of-night',
  'pistols-of-voyager',
  'guardian-rectifier',
  'originite-type-v',
  'rectifier-of-night',
  'rectifier-of-voyager',
  'guardian-sword',
  'originite-type-ii',
  'sword-of-night',
  'sword-of-voyager',
  'tyro-broadblade',
  'tyro-gauntlets',
  'tyro-pistols',
  'tyro-rectifier',
  'tyro-sword',
  'training-broadblade',
  'training-gauntlets',
  'training-pistols',
  'training-rectifier',
  'training-sword',
] as const;

/**
 * Released weapons that were source-verified to have no combat-affecting
 * passive/effect. Empty until such a weapon is actually verified.
 */
export const WEAPON_EFFECT_VERIFIED_NO_COMBAT_EFFECT_IDS_V36 = [] as const;

export const WEAPON_EFFECT_ROSTER_AUDIT_V36 = {
  patch: '3.6',
  checkedAt: '2026-08-25',
  expectedReleasedCount: 121,
  notes: [
    '41 audited effect rows now cover 18 released weapons after Pistol audit batch 1.',
    '103 released weapons remain explicitly PENDING_SOURCE_AUDIT; this is not zero-effect data.',
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

/**
 * Mandatory backward-impact evidence for effects added after the project-wide
 * Content Preflight + Backward Impact contract was locked.
 */
export const WEAPON_EFFECT_BACKWARD_IMPACT_REVIEWS_V36 = [
  {
    reviewId: 'WEAPON-EFFECT-PISTOLS-2026-08-25-01',
    checkedAt: '2026-08-25',
    weaponIds: ['relativistic-jet', 'woodland-aria'],
    weaponType: 'Pistols',
    reviewedReleasedCharacterIds: [
      'aalto',
      'carlotta',
      'chixia',
      'ciaccona',
      'galbrena',
      'lucy',
      'lynae',
      'mortefi',
      'rebecca',
    ],
    existingWeaponRecommendationProfileIds: [],
    result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: [
      'All currently RELEASED Pistol users in the raw Character catalog were screened; the regression test locks this list to the roster rather than trusting the manual snapshot.',
      'No current production Weapon Recommendation profile belongs to a Pistol character, so this batch changes no existing profile relation or ranking.',
      'Published current sources identify Relativistic Jet as a viable Pistol option for multiple users and Woodland Aria as Ciaccona’s primary option; those observations are audit evidence only and are not promoted into recommendation data here.',
      'Conditional Aero Erosion uptime remains character/rotation state. Woodland Aria effects are not assumed active merely because the weapon can be equipped.',
    ],
  },
] as const satisfies readonly WeaponEffectBackwardImpactReview[];

export type WeaponEffectCoverageStatus =
  | 'AUDITED_EFFECTS'
  | 'VERIFIED_NO_COMBAT_EFFECT'
  | 'PENDING_SOURCE_AUDIT'
  | 'MISSING_COVERAGE_STATUS'
  | 'NOT_RELEASED'
  | 'UNKNOWN_WEAPON';

export type WeaponEffectCoverageIssueCode =
  | 'RELEASED_COUNT_MISMATCH'
  | 'MISSING_COVERAGE_STATUS'
  | 'PENDING_ID_NOT_RELEASED'
  | 'NO_EFFECT_ID_NOT_RELEASED'
  | 'PENDING_OVERLAPS_EFFECT_DATA'
  | 'NO_EFFECT_OVERLAPS_EFFECT_DATA';

export interface WeaponEffectCoverageIssue {
  code: WeaponEffectCoverageIssueCode;
  weaponId?: string;
  detail: string;
}

export interface WeaponEffectRosterAudit {
  releasedCount: number;
  auditedEffectWeaponCount: number;
  verifiedNoCombatEffectCount: number;
  pendingSourceAuditCount: number;
  explicitCoverageCount: number;
  fullReleasedRosterComplete: boolean;
  issues: readonly WeaponEffectCoverageIssue[];
}

function effectWeaponIds(effects: readonly WeaponEffectData[]): Set<string> {
  return new Set(effects.map((effect) => effect.weaponId));
}

export function getWeaponEffectCoverageStatus(
  weaponId: string,
  catalog: readonly WeaponGameData[] = WEAPON_CATALOG,
  effects: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
): WeaponEffectCoverageStatus {
  const weapon = catalog.find((row) => row.id === weaponId);
  if (!weapon) return 'UNKNOWN_WEAPON';
  if (weapon.releaseStatus !== 'RELEASED') return 'NOT_RELEASED';

  const effectIds = effectWeaponIds(effects);
  if (effectIds.has(weaponId)) return 'AUDITED_EFFECTS';
  if ((WEAPON_EFFECT_VERIFIED_NO_COMBAT_EFFECT_IDS_V36 as readonly string[]).includes(weaponId)) {
    return 'VERIFIED_NO_COMBAT_EFFECT';
  }
  if ((WEAPON_EFFECT_PENDING_SOURCE_AUDIT_IDS_V36 as readonly string[]).includes(weaponId)) {
    return 'PENDING_SOURCE_AUDIT';
  }
  return 'MISSING_COVERAGE_STATUS';
}

export function auditWeaponEffectCoverage(
  catalog: readonly WeaponGameData[] = WEAPON_CATALOG,
  effects: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
): WeaponEffectRosterAudit {
  const released = catalog.filter((weapon) => weapon.releaseStatus === 'RELEASED');
  const releasedIds = new Set(released.map((weapon) => weapon.id));
  const effectIds = effectWeaponIds(effects);
  const pendingIds = new Set<string>(WEAPON_EFFECT_PENDING_SOURCE_AUDIT_IDS_V36);
  const noEffectIds = new Set<string>(WEAPON_EFFECT_VERIFIED_NO_COMBAT_EFFECT_IDS_V36);
  const issues: WeaponEffectCoverageIssue[] = [];

  if (released.length !== WEAPON_EFFECT_ROSTER_AUDIT_V36.expectedReleasedCount) {
    issues.push({
      code: 'RELEASED_COUNT_MISMATCH',
      detail: `Expected ${WEAPON_EFFECT_ROSTER_AUDIT_V36.expectedReleasedCount} released weapons for patch ${WEAPON_EFFECT_ROSTER_AUDIT_V36.patch}, found ${released.length}.`,
    });
  }

  for (const weaponId of pendingIds) {
    if (!releasedIds.has(weaponId)) {
      issues.push({
        code: 'PENDING_ID_NOT_RELEASED',
        weaponId,
        detail: `${weaponId} is registered as pending Weapon Effect source audit but is not RELEASED in the supplied catalog.`,
      });
    }
    if (effectIds.has(weaponId)) {
      issues.push({
        code: 'PENDING_OVERLAPS_EFFECT_DATA',
        weaponId,
        detail: `${weaponId} has audited effect data and must be removed from the pending-source-audit set.`,
      });
    }
  }

  for (const weaponId of noEffectIds) {
    if (!releasedIds.has(weaponId)) {
      issues.push({
        code: 'NO_EFFECT_ID_NOT_RELEASED',
        weaponId,
        detail: `${weaponId} is registered as verified no-combat-effect but is not RELEASED in the supplied catalog.`,
      });
    }
    if (effectIds.has(weaponId)) {
      issues.push({
        code: 'NO_EFFECT_OVERLAPS_EFFECT_DATA',
        weaponId,
        detail: `${weaponId} cannot have effect rows and VERIFIED_NO_COMBAT_EFFECT coverage simultaneously.`,
      });
    }
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
    if (
      status === 'AUDITED_EFFECTS'
      || status === 'VERIFIED_NO_COMBAT_EFFECT'
      || status === 'PENDING_SOURCE_AUDIT'
    ) {
      explicitCoverageCount += 1;
    } else {
      issues.push({
        code: 'MISSING_COVERAGE_STATUS',
        weaponId: weapon.id,
        detail: `Released weapon ${weapon.id} has no explicit Weapon Effect coverage status.`,
      });
    }
  }

  return {
    releasedCount: released.length,
    auditedEffectWeaponCount,
    verifiedNoCombatEffectCount,
    pendingSourceAuditCount,
    explicitCoverageCount,
    fullReleasedRosterComplete: issues.length === 0 && pendingSourceAuditCount === 0,
    issues,
  };
}
