import type { CharacterActionFact, CharacterMechanicFact } from '../characterMechanicsDomain.ts';
import { CHARACTER_MECHANIC_FACTS, getCharacterMechanicFact } from '../data/characterMechanics.ts';
import { evaluateCharacterDirectHit, supportsCharacterDirectHit } from './characterDirectHitAdapter.ts';

export const CHARACTER_BASIC_HIT_PRIMITIVE_ID = 'character-atk-basic-explicit-hit-v1';

function supported(fact: CharacterMechanicFact): fact is CharacterActionFact {
  return supportsCharacterDirectHit(fact) && fact.section === 'BASIC_ATTACK' && fact.actionKind === 'BASIC'
    && fact.damageClass === 'BASIC' && fact.scalingStat === 'ATK';
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
  const s = input.snapshot;
  if (!s) throw new Error('Basic hit requires a complete finite combat snapshot.');
  const result = evaluateCharacterDirectHit({ ...input, snapshot: {
    ...s, totalScalingStat: s.totalAttack, scalingStat: 'ATK', damageClass: 'BASIC',
  } });
  return {
    primitiveId: CHARACTER_BASIC_HIT_PRIMITIVE_ID,
    scope: 'EXPLICIT_HITS_ONLY' as const,
    characterId: fact.characterId,
    factId: fact.factId,
    componentIndex: input.componentIndex,
    landedHitCount: input.landedHitCount,
    motionValue: result.motionValue,
    expectedDamage: result.expectedDamage,
  };
}
