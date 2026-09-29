import type { WeaponEffectData } from './effectDomain.ts';

export const WEAPON_BUILD_STAT_CLASSIFICATIONS = Object.freeze([
  'STATIC_BUILD_STAT',
  'NON_STATIC_MECHANIC',
  'PENDING',
] as const);

export type WeaponBuildStatClassification = typeof WEAPON_BUILD_STAT_CLASSIFICATIONS[number];

export interface WeaponBuildStatReviewRow {
  weaponId: string;
  effectId: string;
  classification: WeaponBuildStatClassification;
  buildStat?: string;
}

export interface WeaponBuildStatReviewData {
  schemaVersion: number;
  role: string;
  summary: {
    releasedWeapons: number;
    reviewedEffects: number;
    staticBuildStatEffects: number;
    nonStaticMechanicEffects: number;
    pendingEffects: number;
  };
  effects: readonly WeaponBuildStatReviewRow[];
}

export interface ReviewedWeaponBuildStatEffect {
  weaponId: string;
  effectId: string;
  classification: WeaponBuildStatClassification;
  staticBuildStat: null | {
    stat: string;
    rankValues: readonly [number, number, number, number, number];
    sourceWeaponEffect: { weaponId: string; effectId: string };
    provenance: WeaponEffectData['provenance'];
  };
}

const CLASSIFICATIONS = new Set<string>(WEAPON_BUILD_STAT_CLASSIFICATIONS);
const SOURCE_TO_BUILD_STAT = Object.freeze({
  'ATK%': 'ATK%', 'HP%': 'HP%', 'DEF%': 'DEF%', 'CRIT Rate': 'CRIT Rate', 'CRIT DMG': 'CRIT DMG',
  'Energy Regen': 'Energy Regen', 'Healing Bonus': 'Healing Bonus',
  'All Attribute DMG': 'All Attribute DMG', 'All-Attribute DMG': 'All Attribute DMG',
  'Basic Attack DMG': 'Basic Attack DMG', 'Heavy Attack DMG': 'Heavy Attack DMG',
  'Resonance Skill DMG': 'Skill DMG', 'Resonance Liberation DMG': 'Liberation DMG',
  'Aero DMG': 'Aero DMG', 'Fusion DMG': 'Fusion DMG', 'Glacio DMG': 'Glacio DMG',
  'Electro DMG': 'Electro DMG', 'Spectro DMG': 'Spectro DMG', 'Havoc DMG': 'Havoc DMG',
} as const);

const fail = (message: string): never => { throw new Error('Weapon build-stat review: ' + message); };
const key = (weaponId: string, effectId: string) => weaponId + '::' + effectId;

function strictStatic(effect: WeaponEffectData): boolean {
  return effect.effectType === 'PERMANENT'
    && effect.appliesTo === 'SELF'
    && effect.durationSeconds === null
    && effect.maxStacks === 1
    && effect.conditions.length === 0
    && effect.valueUnit === 'DECIMAL_MULTIPLIER'
    && effect.simulatorMode === 'ALWAYS'
    && Object.hasOwn(SOURCE_TO_BUILD_STAT, effect.statOrEffect);
}

export function projectWeaponBuildStatReview(
  effectCatalog: readonly WeaponEffectData[],
  releasedWeaponIds: readonly string[],
  review: WeaponBuildStatReviewData,
): readonly ReviewedWeaponBuildStatEffect[] {
  if (!review || review.schemaVersion !== 1 || review.role !== 'character-builder.weapon-build-stat-review') fail('Unsupported review schema');
  const released = new Set(releasedWeaponIds);
  if (released.size !== releasedWeaponIds.length) fail('Duplicate released Weapon ID');
  const sourceEffects = effectCatalog.filter(effect => released.has(effect.weaponId));
  const source = new Map<string, WeaponEffectData>();
  for (const effect of sourceEffects) {
    const id = key(effect.weaponId, effect.effectId);
    if (source.has(id)) fail('Duplicate source effect ' + id);
    source.set(id, effect);
  }
  const reviewed = new Map<string, WeaponBuildStatReviewRow>();
  for (const row of review.effects ?? []) {
    if (!row || !released.has(row.weaponId) || !CLASSIFICATIONS.has(row.classification)) fail('Invalid review row');
    const id = key(row.weaponId, row.effectId);
    if (reviewed.has(id)) fail('Duplicate review row ' + id);
    reviewed.set(id, row);
  }
  if (source.size !== reviewed.size) fail('Source/review effect count mismatch');
  for (const weaponId of released) {
    if (!sourceEffects.some(effect => effect.weaponId === weaponId)) fail('Released Weapon has no source effects ' + weaponId);
    if (!(review.effects ?? []).some(row => row.weaponId === weaponId)) fail('Released Weapon has no explicit review ' + weaponId);
  }
  const projected = sourceEffects.map((effect): ReviewedWeaponBuildStatEffect => {
    const id = key(effect.weaponId, effect.effectId);
    const row = reviewed.get(id);
    if (!row) fail('Missing review row ' + id);
    const isStatic = strictStatic(effect);
    const mapped = SOURCE_TO_BUILD_STAT[effect.statOrEffect as keyof typeof SOURCE_TO_BUILD_STAT] ?? null;
    if (isStatic && row.classification !== 'STATIC_BUILD_STAT') fail('Unconditional permanent Build stat was not classified STATIC_BUILD_STAT ' + id);
    if (!isStatic && row.classification === 'STATIC_BUILD_STAT') fail('Non-static mechanic was classified STATIC_BUILD_STAT ' + id);
    if (row.classification === 'STATIC_BUILD_STAT') {
      if (!mapped || row.buildStat !== mapped) fail('Static Build stat mapping mismatch ' + id);
      if (!effect.rankValues.every(value => typeof value === 'number' && Number.isFinite(value))) fail('Static Build stat has unresolved rank value ' + id);
      return {weaponId:effect.weaponId,effectId:effect.effectId,classification:row.classification,staticBuildStat:{stat:row.buildStat,rankValues:[...effect.rankValues],sourceWeaponEffect:{weaponId:effect.weaponId,effectId:effect.effectId},provenance:{...effect.provenance}}};
    }
    if (row.buildStat !== undefined) fail('Non-static/PENDING row carries a Build stat ' + id);
    return {weaponId:effect.weaponId,effectId:effect.effectId,classification:row.classification,staticBuildStat:null};
  });
  const s=projected.filter(row=>row.classification==='STATIC_BUILD_STAT').length;
  const n=projected.filter(row=>row.classification==='NON_STATIC_MECHANIC').length;
  const p=projected.filter(row=>row.classification==='PENDING').length;
  if(review.summary.releasedWeapons!==released.size||review.summary.reviewedEffects!==projected.length||review.summary.staticBuildStatEffects!==s||review.summary.nonStaticMechanicEffects!==n||review.summary.pendingEffects!==p) fail('Review summary mismatch');
  return Object.freeze(projected);
}

export function activeWeaponBuildStats(reviewedEffects: readonly ReviewedWeaponBuildStatEffect[], weaponId: string, rank = 1) {
  if (!Number.isInteger(rank) || rank < 1 || rank > 5) fail('Invalid Weapon rank');
  return reviewedEffects
    .filter(row => row.weaponId === weaponId && row.classification === 'STATIC_BUILD_STAT' && row.staticBuildStat)
    .map(row => ({stat:row.staticBuildStat!.stat,value:row.staticBuildStat!.rankValues[rank-1],sourceWeaponEffect:{...row.staticBuildStat!.sourceWeaponEffect,rank},provenance:{...row.staticBuildStat!.provenance}}));
}
