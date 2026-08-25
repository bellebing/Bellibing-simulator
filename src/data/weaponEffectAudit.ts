import type { WeaponGameData } from '../gameDataDomain.ts';
import type { WeaponEffectData } from '../effectDomain.ts';
import { WEAPON_EFFECT_CATALOG } from './weaponEffectCatalog.ts';
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
  'commando-of-conviction',
  'endless-collapse',
  'fables-of-wisdom',
  'feather-edge',
  'lumingloss',
  'lunar-cutter',
  'overture',
  'somnoire-anchor',
  'sword-18',
  'guardian-sword',
  'originite-type-ii',
  'sword-of-night',
  'sword-of-voyager',
  'tyro-sword',
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
    '180 audited effect rows now cover 95 released weapons after closing released Gauntlet coverage.',
    '26 released weapons remain explicitly PENDING_SOURCE_AUDIT; all are Swords and this is not zero-effect data.',
    'All 22 RELEASED Pistols, all 27 RELEASED Rectifiers, all 23 RELEASED Broadblades and all 22 RELEASED Gauntlets now have source-audited effect records.',
    'Blazing Justice ATK and effect magnitudes/duration are verified, while current sources still conflict on Basic Attack vs Resonance Liberation as the trigger; executable trigger semantics remain VERIFIED_RAW_PENDING_MODEL.',
    'Pulsation Bracer uses the current PlayAware/Arab Wuwa/Game8 6/6.7/7.5/8.2/9% series while a conflicting current Wutheringlab 6/6.7/7.4/8.1/8.8 series remains explicit provenance evidence.',
    'Moongazer\'s Sigil forced max-stack state, Verity\'s Handle duration extension and Hollow Mirage stack mutations are raw-verified cross-effect mechanics that remain explicit pending-model rather than invented execution logic.',
    'Aureate Zenith and the Night-series source conflicts remain documented from the completed Broadblade/Rectifier audits.',
    'Firstlight\'s Herald team-ATK magnitude remains raw-verified while its conflicting trigger-state wording remains explicitly pending-model.',
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
      'aalto', 'carlotta', 'chixia', 'ciaccona', 'galbrena', 'lucy', 'lynae', 'mortefi', 'rebecca',
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
  {
    reviewId: 'WEAPON-EFFECT-PISTOLS-2026-08-25-02',
    checkedAt: '2026-08-25',
    weaponIds: [
      'cadenza', 'pistols-of-voyager', 'pistols-of-night', 'guardian-pistols', 'originite-type-iii',
      'tyro-pistols', 'training-pistols', 'undying-flame', 'novaburst', 'thunderbolt',
    ],
    weaponType: 'Pistols',
    reviewedReleasedCharacterIds: [
      'aalto', 'carlotta', 'chixia', 'ciaccona', 'galbrena', 'lucy', 'lynae', 'mortefi', 'rebecca',
    ],
    existingWeaponRecommendationProfileIds: [],
    result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: [
      'All currently RELEASED Pistol users were screened again because newly modeled old passives are changed combat facts even when the weapons themselves are old.',
      'No production Weapon Recommendation profile currently belongs to a Pistol character, so there is no existing profile relation/ranking to mutate in this batch.',
      'Published build sources show multiple compatibility candidates for Cadenza, Voyager, Undying Flame, Novaburst, Thunderbolt and Guardian Pistols; those observations remain audit evidence only and do not create recommendation data.',
      'Pistols of Night uses the Intro Skill trigger supported by Game8, Pocket Tactics and PlayAware. A lower-priority Slyraf page currently says Outro at R5; the source conflict is preserved in effect provenance rather than silently overriding the higher-confidence trigger.',
      'All triggered/stacking/instant event effects remain MANUAL; rotation state must prove activation, stack count and overlap.',
    ],
  },
  {
    reviewId: 'WEAPON-EFFECT-PISTOLS-2026-08-25-03',
    checkedAt: '2026-08-25',
    weaponIds: [
      'lux-and-umbra', 'phasic-homogenizer', 'skull-thrasher', 'spectral-trigger', 'static-mist',
      'the-last-dance', 'pistols-26', 'romance-in-farewell', 'solar-flame',
    ],
    weaponType: 'Pistols',
    reviewedReleasedCharacterIds: [
      'aalto', 'carlotta', 'chixia', 'ciaccona', 'galbrena', 'lucy', 'lynae', 'mortefi', 'rebecca',
    ],
    existingWeaponRecommendationProfileIds: [],
    result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: [
      'This review closes source-audited Weapon Effect coverage for every currently RELEASED Pistol while preserving the same full nine-character compatibility screen.',
      'No production Pistol Weapon Recommendation profile exists yet, so verified compatibility observations do not mutate or create ranking/profile data.',
      'Static Mist requires NEXT_RESONATOR scope rather than TEAM/SELF; Lux & Umbra and Spectral Trigger require state-conditional mechanics rather than fabricated independent durations.',
      'Pistols#26 stack removal on taking damage is verified raw data but executable cross-effect stack mutation remains explicitly VERIFIED_RAW_PENDING_MODEL.',
      'Phasic Homogenizer R2 ATK has a current source discrepancy: Wutheringlab, ArabWuwa and Wiki data support 15%, while Game8 shows 14%; provenance retains that conflict.',
      'Solar Flame has a guide/display precision difference between rounded weapon-facing values and a more precise character table; the effect layer keeps the published weapon-facing values and documents the difference.',
    ],
  },
  {
    reviewId: 'WEAPON-EFFECT-RECTIFIERS-2026-08-25-01',
    checkedAt: '2026-08-25',
    weaponIds: ['boson-astrolabe', 'cosmic-ripples', 'firstlights-herald', 'luminous-hymn', 'stellar-symphony'],
    weaponType: 'Rectifier',
    reviewedReleasedCharacterIds: [
      'baizhi', 'buling', 'cantarella', 'denia', 'encore', 'lucilla', 'phoebe', 'phrolova', 'suisui',
      'the-shorekeeper', 'verina', 'yinlin', 'zhezhi',
    ],
    existingWeaponRecommendationProfileIds: [],
    result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: [
      'All 13 currently RELEASED Rectifier users in the raw Character catalog were screened; tests derive the current list from CHARACTER_CATALOG so future roster changes cannot silently bypass this review contract.',
      'The only production Weapon Recommendation profile remains Augusta Broadblade, so no existing Rectifier profile relation or ranking is mutated by this batch.',
      'Boson Astrolabe, Cosmic Ripples, Luminous Hymn and Stellar Symphony expose source-audited conditional mechanics only; event/stack uptime remains MANUAL.',
      'Firstlight\'s Herald has current-source disagreement over the exact team-buff state wording. HP, Concerto gain and 20/25/30/35/40% team-ATK magnitude are retained, while executable trigger-state behavior stays VERIFIED_RAW_PENDING_MODEL.',
      'Luminous Hymn uses the 30/37.5/45/52.5/60% Spectro Frazzle amplification supported by PlayAware, Wuthering Wiki, Arab Wuwa and the current Wutheringlab Phrolova page; conflicting 50-100% secondary-page representations remain provenance evidence, not hidden overrides.',
      'Published compatibility observations remain audit evidence only and do not create new weapon recommendations.',
    ],
  },
  {
    reviewId: 'WEAPON-EFFECT-RECTIFIERS-2026-08-25-02',
    checkedAt: '2026-08-25',
    weaponIds: ['augment', 'call-of-the-abyss', 'comet-flare', 'fusion-accretion', 'jinzhou-keeper'],
    weaponType: 'Rectifier',
    reviewedReleasedCharacterIds: [
      'baizhi', 'buling', 'cantarella', 'denia', 'encore', 'lucilla', 'phoebe', 'phrolova', 'suisui',
      'the-shorekeeper', 'verina', 'yinlin', 'zhezhi',
    ],
    existingWeaponRecommendationProfileIds: [],
    result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: [
      'All 13 currently RELEASED Rectifier users are screened again because each newly modeled old passive is a changed combat fact for the whole compatible weapon class.',
      'No production Rectifier Weapon Recommendation profile exists, so this batch does not mutate or create rankings or profile relations.',
      'Augment, Call of the Abyss, Fusion Accretion and Jinzhou Keeper are event-triggered facts with MANUAL uptime; Comet Flare is a MANUAL three-stack effect with a verified 0.6-second trigger interval.',
      'Comet Flare uses the current 3/3.75/4.5/5.25/6% Healing Bonus series supported by current PlayAware/Wuthering Wiki/GameVika data; older 3/3.5/4/4.5/5% third-party pages remain explicit provenance conflict evidence.',
      'Jinzhou Keeper uses the current 8/10/12/14/16% ATK and 10/12.5/15/17.5/20% HP sequences; stale alternate HP summaries are not promoted into executable data.',
      'Compatibility observations remain audit evidence only and do not create recommendation data.',
    ],
  },
  {
    reviewId: 'WEAPON-EFFECT-RECTIFIERS-2026-08-25-03',
    checkedAt: '2026-08-25',
    weaponIds: ['oceans-gift', 'radiant-dawn', 'rectifier-25', 'variation', 'waltz-in-masquerade'],
    weaponType: 'Rectifier',
    reviewedReleasedCharacterIds: [
      'baizhi', 'buling', 'cantarella', 'denia', 'encore', 'lucilla', 'phoebe', 'phrolova', 'suisui',
      'the-shorekeeper', 'verina', 'yinlin', 'zhezhi',
    ],
    existingWeaponRecommendationProfileIds: [],
    result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: [
      'All 13 currently RELEASED Rectifier users are screened again; newly modeled old passives remain changed combat facts for the whole compatible class.',
      'No production Rectifier Weapon Recommendation profile exists, so this source-audit batch does not create or mutate ranking/profile data.',
      'Ocean’s Gift and Waltz in Masquerade remain MANUAL stacking facts; Radiant Dawn and Variation remain MANUAL event-triggered facts.',
      'Rectifier#25 preserves the source’s literal below-60% healing and above-60% ATK branches. Exact 60% behavior remains explicit unresolved source semantics rather than a fabricated >= or <= rule.',
      'Compatibility observations remain audit evidence only and do not create recommendation data.',
    ],
  },
  {
    reviewId: 'WEAPON-EFFECT-RECTIFIERS-2026-08-25-04',
    checkedAt: '2026-08-25',
    weaponIds: ['guardian-rectifier', 'originite-type-v', 'rectifier-of-night', 'rectifier-of-voyager', 'tyro-rectifier', 'training-rectifier'],
    weaponType: 'Rectifier',
    reviewedReleasedCharacterIds: [
      'baizhi', 'buling', 'cantarella', 'denia', 'encore', 'lucilla', 'phoebe', 'phrolova', 'suisui',
      'the-shorekeeper', 'verina', 'yinlin', 'zhezhi',
    ],
    existingWeaponRecommendationProfileIds: [],
    result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: [
      'This review closes source-audited Weapon Effect coverage for all 27 currently RELEASED Rectifiers while repeating the exact 13-character compatibility screen.',
      'Guardian Rectifier, Tyro Rectifier and Training Rectifier are unconditional low-rarity facts; Originite Type V and Rectifier of Voyager remain MANUAL event/resource facts.',
      'Rectifier of Night uses the Intro Skill trigger supported by current PlayAware, Fandom and Wuwa Wiki data. A lower-priority Slyraf list exposes Outro wording at R5; the discrepancy remains provenance evidence instead of silently overriding the current multi-source consensus.',
      'No production Rectifier Weapon Recommendation profile exists, so closing raw effect coverage does not invent recommendations or rankings.',
    ],
  },
  {
    reviewId: 'WEAPON-EFFECT-BROADBLADES-2026-08-25-01',
    checkedAt: '2026-08-25',
    weaponIds: [
      'radiance-cleaver',
      'thunderflare-dominion',
      'aureate-zenith',
      'broadblade-41',
      'dauntless-evernight',
      'discord',
      'meditations-on-mercy',
      'waning-redshift',
      'beguiling-melody',
      'broadblade-of-night',
      'broadblade-of-voyager',
      'guardian-broadblade',
      'originite-type-i',
      'tyro-broadblade',
      'training-broadblade',
    ],
    weaponType: 'Broadblade',
    reviewedReleasedCharacterIds: [
      'augusta', 'calcharo', 'chisa', 'jinhsi', 'jiyan', 'lumi', 'lupa', 'mornye', 'taoqi',
    ],
    existingWeaponRecommendationProfileIds: ['augusta-standard-weapons'],
    result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: [
      'This review closes source-audited Weapon Effect coverage for all 23 currently RELEASED Broadblades and screens all 9 currently RELEASED Broadblade users.',
      'Unlike the completed Pistol and Rectifier slices, Broadblade already has a production Weapon Recommendation profile: augusta-standard-weapons. Its existing relations/ranks are regression-screened but are not recalculated or silently mutated merely because raw effect coverage became complete.',
      'Thunderflare Dominion, Radiance Cleaver, Aureate Zenith, Waning Redshift and Meditations on Mercy already appear in Augusta’s production profile. Their newly source-audited effect facts remain independent from recommendation ranking data.',
      'Aureate Zenith keeps the current multi-source Heavy Attack DMG wording while the conflicting Wutheringlab Resonance Liberation label remains provenance evidence; Broadblade of Night similarly keeps the current Intro Skill consensus while preserving the lower-priority Outro discrepancy.',
      'All triggered, stacking, resource and HP-state effects remain MANUAL unless character/rotation/encounter state proves activation, stack count and overlap.',
      'Low-rarity compatibility does not create new recommendation entries or profiles.',
    ],
  },
  {
    reviewId: 'WEAPON-EFFECT-GAUNTLETS-2026-08-25-01',
    checkedAt: '2026-08-25',
    weaponIds: [
      'abyss-surges',
      'blazing-justice',
      'daybreakers-spine',
      'moongazers-sigil',
      'pulsation-bracer',
      'solsworn-ciphers',
      'tragicomedy',
      'veritys-handle',
      'aether-strike',
      'amity-accord',
      'celestial-spiral',
      'gauntlets-21d',
      'hollow-mirage',
      'legend-of-drunken-hero',
      'marcato',
      'stonard',
      'gauntlets-of-night',
      'gauntlets-of-voyager',
      'guardian-gauntlets',
      'originite-type-iv',
      'tyro-gauntlets',
      'training-gauntlets',
    ],
    weaponType: 'Gauntlets',
    reviewedReleasedCharacterIds: [
      'iuno', 'jianxin', 'lingyang', 'luuk-herssen', 'roccia', 'sigrika', 'xiangli-yao', 'youhu', 'yuanwu', 'zani',
    ],
    existingWeaponRecommendationProfileIds: [],
    result: 'REVIEWED_NO_EXISTING_PROFILE_CHANGE',
    notes: [
      'This review closes source-audited Weapon Effect coverage for all 22 currently RELEASED Gauntlets and screens all 10 currently RELEASED Gauntlet users.',
      'The only production Weapon Recommendation profile remains Augusta Broadblade, so Gauntlet source-audit completion does not mutate or invent recommendation rankings.',
      'Blazing Justice keeps verified ATK, DEF-ignore/Frazzle magnitudes and 6s duration while Basic Attack vs Resonance Liberation trigger wording remains explicit VERIFIED_RAW_PENDING_MODEL.',
      'Moongazer\'s Sigil forced max-stack state, Verity\'s Handle duration extension and Hollow Mirage stack assignment/loss are cross-effect state mutations kept raw-verified pending-model rather than silently approximated.',
      'Pulsation Bracer preserves the current three-source rank series while the conflicting current Wutheringlab series remains provenance evidence.',
      'All event, stack, resource and state-dependent uptime remains MANUAL unless later character/rotation/encounter execution state proves it.',
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
