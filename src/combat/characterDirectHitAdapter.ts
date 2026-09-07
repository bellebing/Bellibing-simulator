import { readCharacterActionValues } from '../characterActionValues.ts';
import type { CharacterActionFact, CharacterMechanicFact } from '../characterMechanicsDomain.ts';
import { CHARACTER_MECHANIC_FACTS, getCharacterMechanicFact, getCharacterMechanicsProfile } from '../data/characterMechanics.ts';
import { expectedDamage } from './damageKernel.ts';

export const CHARACTER_DIRECT_HIT_PRIMITIVE_ID = 'character-standard-explicit-hit-v1';
export const DIRECT_HIT_DAMAGE_CLASSES = ['BASIC', 'HEAVY', 'SKILL', 'LIBERATION', 'INTRO', 'OUTRO'] as const;
export type DirectHitDamageClass = typeof DIRECT_HIT_DAMAGE_CLASSES[number];
export type DirectHitScalingStat = 'ATK' | 'HP' | 'DEF';

/** Capability boundary only; action/section ownership never substitutes for source damage class. */
export function supportsCharacterDirectHit(fact: CharacterMechanicFact): fact is CharacterActionFact {
  const profile = getCharacterMechanicsProfile(fact.characterId);
  return profile?.verificationStatus === 'VERIFIED' && profile.factIds.includes(fact.factId)
    && fact.kind === 'ACTION' && fact.verificationStatus === 'VERIFIED'
    && (fact.modelingStatus === 'MODEL_READY' || fact.modelingStatus === 'MODELED')
    && fact.actionRole === 'DAMAGE' && !fact.conditional
    && (fact.damageClasses ?? null) === null && fact.damageClass !== null
    && DIRECT_HIT_DAMAGE_CLASSES.some((kind) => kind === fact.damageClass)
    && ['ATK', 'HP', 'DEF'].includes(fact.scalingStat);
}

export function listCharacterDirectHitSupport() {
  return CHARACTER_MECHANIC_FACTS.filter(supportsCharacterDirectHit).map((fact) => ({
    characterId: fact.characterId,
    factId: fact.factId,
    primitiveId: CHARACTER_DIRECT_HIT_PRIMITIVE_ID,
    scope: 'EXPLICIT_HITS_ONLY' as const,
    sourceDamageClass: fact.damageClass as DirectHitDamageClass,
    scalingStat: fact.scalingStat as DirectHitScalingStat,
    sequence: 0 as const,
    skillLevel: 10 as const,
  })).sort((a, b) => a.factId < b.factId ? -1 : a.factId > b.factId ? 1 : 0);
}

/** Caller-proven, fully assembled values at the hit, tagged by source class/stat. */
export interface CharacterDirectHitSnapshot {
  readonly damageClass: DirectHitDamageClass;
  readonly scalingStat: DirectHitScalingStat;
  readonly totalScalingStat: number;
  readonly damageBonus: number;
  readonly amplification: number;
  readonly critRate: number;
  readonly critDamage: number;
  readonly defenseMultiplier: number;
  readonly resistanceMultiplier: number;
  readonly damageReduction: number;
}

export interface CharacterDirectHitInput {
  readonly characterId: string;
  readonly factId: string;
  readonly sequence: 0 | 1 | 2;
  readonly maxSkills: boolean;
  readonly componentIndex: number;
  readonly landedHitCount: number;
  readonly snapshot: CharacterDirectHitSnapshot;
}

/** No automatic action occurrence, conditional execution, effects, state, timing or DPS. */
export function evaluateCharacterDirectHit(input: CharacterDirectHitInput) {
  if (input.sequence !== 0 || input.maxSkills !== true) {
    throw new Error('Direct hit primitive supports S0 and max skills only; sequence effects are not inferred.');
  }
  const fact = getCharacterMechanicFact(input.factId);
  if (!fact || fact.characterId !== input.characterId || !supportsCharacterDirectHit(fact)) {
    throw new Error(`${input.characterId}/${input.factId}: unsupported canonical direct-hit context.`);
  }
  const values = readCharacterActionValues(fact, 10);
  if (values.status !== 'SOURCE_VALUES' || values.kind !== 'COEFFICIENTS') {
    throw new Error(`${fact.factId}: exact direct-hit coefficients unavailable.`);
  }
  if (!Number.isInteger(input.componentIndex) || input.componentIndex < 0 || input.componentIndex >= values.components.length) {
    throw new Error('Select an existing source coefficient component.');
  }
  const component = values.components[input.componentIndex];
  if (!Number.isInteger(input.landedHitCount) || input.landedHitCount < 0 || input.landedHitCount > component.hitCount) {
    throw new Error('Landed hit count must be explicit and within the selected source component.');
  }
  const s = input.snapshot;
  if (!s || [s.totalScalingStat, s.damageBonus, s.amplification, s.critRate, s.critDamage,
    s.defenseMultiplier, s.resistanceMultiplier, s.damageReduction].some((value) => !Number.isFinite(value))) {
    throw new Error('Direct hit requires a complete finite combat snapshot.');
  }
  if (s.scalingStat !== fact.scalingStat || s.damageClass !== fact.damageClass) {
    throw new Error('Combat snapshot must match the canonical scaling stat and source damage class.');
  }
  if (s.totalScalingStat <= 0 || s.damageBonus < -1 || s.amplification < -1 || s.critRate < 0 || s.critDamage < 1
      || s.defenseMultiplier < 0 || s.defenseMultiplier > 1 || s.resistanceMultiplier < 0
      || s.damageReduction < 0 || s.damageReduction > 1) {
    throw new Error('Direct hit combat snapshot is outside supported bounds.');
  }
  const motionValue = component.coefficient * input.landedHitCount;
  const damage = expectedDamage({ ...s, scalingStat: s.totalScalingStat, motionValue });
  if (!Number.isFinite(damage)) throw new Error('Direct hit damage exceeded the supported numeric range.');
  return {
    primitiveId: CHARACTER_DIRECT_HIT_PRIMITIVE_ID,
    scope: 'EXPLICIT_HITS_ONLY' as const,
    characterId: fact.characterId,
    factId: fact.factId,
    damageClass: s.damageClass,
    scalingStat: s.scalingStat,
    componentIndex: input.componentIndex,
    landedHitCount: input.landedHitCount,
    motionValue,
    expectedDamage: damage,
  };
}
