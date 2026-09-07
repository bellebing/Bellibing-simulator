import { readCharacterActionValues } from '../characterActionValues.ts';
import type { CharacterActionFact, CharacterMechanicFact } from '../characterMechanicsDomain.ts';
import { CHARACTER_MECHANIC_FACTS, getCharacterMechanicFact, getCharacterMechanicsProfile } from '../data/characterMechanics.ts';
import { expectedDamage } from './damageKernel.ts';

export const CHARACTER_BASIC_HIT_PRIMITIVE_ID = 'character-atk-basic-explicit-hit-v1';

function supported(fact: CharacterMechanicFact): fact is CharacterActionFact {
  const profile = getCharacterMechanicsProfile(fact.characterId);
  return profile?.verificationStatus === 'VERIFIED' && profile.factIds.includes(fact.factId)
    && fact.kind === 'ACTION' && fact.verificationStatus === 'VERIFIED'
    && (fact.modelingStatus === 'MODEL_READY' || fact.modelingStatus === 'MODELED')
    && fact.actionRole === 'DAMAGE' && fact.section === 'BASIC_ATTACK' && fact.actionKind === 'BASIC'
    && fact.damageClass === 'BASIC' && (fact.damageClasses ?? null) === null
    && fact.scalingStat === 'ATK' && !fact.conditional;
}

/** Derived family membership; no Character allowlist or copied coefficients. */
export function listCharacterBasicHitSupport() {
  return CHARACTER_MECHANIC_FACTS.filter(supported).map((fact) => ({
    characterId: fact.characterId,
    factId: fact.factId,
    primitiveId: CHARACTER_BASIC_HIT_PRIMITIVE_ID,
    scope: 'EXPLICIT_HITS_ONLY' as const,
    sequence: 0 as const,
    skillLevel: 10 as const,
  })).sort((a, b) => a.factId < b.factId ? -1 : a.factId > b.factId ? 1 : 0);
}

/** Fully assembled ATK/bonus/target context at the explicit hit, owned by the caller. */
export interface CharacterBasicHitSnapshot {
  readonly totalAttack: number;
  readonly damageBonus: number;
  readonly amplification: number;
  readonly critRate: number;
  readonly critDamage: number;
  readonly defenseMultiplier: number;
  readonly resistanceMultiplier: number;
  readonly damageReduction: number;
}

/**
 * One explicitly selected source coefficient component at one caller-proven
 * combat snapshot. Does not choose an action, execute passives, confirm a whole
 * attack connects, apply teammates, simulate a sequence or provide rotation DPS.
 */
export function evaluateCharacterBasicHit(input: {
  readonly characterId: string;
  readonly factId: string;
  readonly sequence: 0 | 1 | 2;
  readonly maxSkills: boolean;
  readonly componentIndex: number;
  readonly landedHitCount: number;
  readonly snapshot: CharacterBasicHitSnapshot;
}) {
  if (input.sequence !== 0 || input.maxSkills !== true) {
    throw new Error('Basic hit primitive supports S0 and max skills only; sequence effects are not inferred.');
  }
  const fact = getCharacterMechanicFact(input.factId);
  if (!fact || fact.characterId !== input.characterId || !supported(fact)) {
    throw new Error(`${input.characterId}/${input.factId}: unsupported canonical basic-hit context.`);
  }
  const values = readCharacterActionValues(fact, 10);
  if (values.status !== 'SOURCE_VALUES' || values.kind !== 'COEFFICIENTS') {
    throw new Error(`${fact.factId}: exact basic-hit coefficients unavailable.`);
  }
  if (!Number.isInteger(input.componentIndex) || input.componentIndex < 0 || input.componentIndex >= values.components.length) {
    throw new Error('Select an existing source coefficient component.');
  }
  const component = values.components[input.componentIndex];
  if (!Number.isInteger(input.landedHitCount) || input.landedHitCount < 0 || input.landedHitCount > component.hitCount) {
    throw new Error('Landed hit count must be explicit and within the selected source component.');
  }
  const s = input.snapshot;
  if (!s || [s.totalAttack, s.damageBonus, s.amplification, s.critRate, s.critDamage,
    s.defenseMultiplier, s.resistanceMultiplier, s.damageReduction].some((value) => !Number.isFinite(value))) {
    throw new Error('Basic hit requires a complete finite combat snapshot.');
  }
  if (s.totalAttack <= 0 || s.damageBonus < -1 || s.amplification < -1 || s.critRate < 0 || s.critDamage < 1
      || s.defenseMultiplier < 0 || s.defenseMultiplier > 1 || s.resistanceMultiplier < 0
      || s.damageReduction < 0 || s.damageReduction > 1) {
    throw new Error('Basic hit combat snapshot is outside supported bounds.');
  }
  const motionValue = component.coefficient * input.landedHitCount;
  const damage = expectedDamage({ ...s, scalingStat: s.totalAttack, motionValue });
  if (!Number.isFinite(damage)) throw new Error('Basic hit damage exceeded the supported numeric range.');
  return {
    primitiveId: CHARACTER_BASIC_HIT_PRIMITIVE_ID,
    scope: 'EXPLICIT_HITS_ONLY' as const,
    characterId: fact.characterId,
    factId: fact.factId,
    componentIndex: input.componentIndex,
    landedHitCount: input.landedHitCount,
    motionValue,
    expectedDamage: damage,
  };
}
