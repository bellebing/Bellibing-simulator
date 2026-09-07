import type { CharacterActionFact } from './characterMechanicsDomain.ts';
import { requireSingleCharacterDamageClass } from './characterMechanicsDomain.ts';

/** Source arithmetic only: no hit confirmation, triggers, buffs, timing or DPS. */
export type CharacterActionValues =
  | {
    readonly status: 'SOURCE_VALUES';
    readonly kind: 'COEFFICIENTS';
    readonly components: readonly { readonly coefficient: number; readonly hitCount: number }[];
  }
  | {
    readonly status: 'SOURCE_VALUES';
    readonly kind: 'FLAT_DAMAGE';
    readonly damagePerHit: number;
    readonly hitCount: number;
  }
  | {
    readonly status: 'UNAVAILABLE';
    readonly reason: 'UNVERIFIED' | 'NOT_CHARACTER_DAMAGE' | 'NO_EXACT_REPRESENTATION';
  };

/** Reads exact source curves for any Character; availability never promotes modelingStatus. */
export function readCharacterActionValues(fact: CharacterActionFact, skillLevel = 10): CharacterActionValues {
  if (!Number.isInteger(skillLevel) || skillLevel < 1 || skillLevel > 10) {
    throw new Error('Character skill level must be an integer 1-10.');
  }
  if (fact.verificationStatus !== 'VERIFIED') return { status: 'UNAVAILABLE', reason: 'UNVERIFIED' };
  if (fact.actionRole !== 'DAMAGE') return { status: 'UNAVAILABLE', reason: 'NOT_CHARACTER_DAMAGE' };

  const invalid = (detail: string): never => { throw new Error(`${fact.factId}: ${detail}`); };
  const coefficient = (value: number): number => {
    if (!Number.isFinite(value) || value < 0) invalid('invalid source damage value');
    return value;
  };
  const hits = (value: number | null): number => {
    if (value === null || !Number.isInteger(value) || value <= 0) return invalid('invalid source hit count');
    return value;
  };
  const atLevel = (curve: readonly number[]): number => {
    if (curve.length !== 10) invalid('expected an exact ten-level source curve');
    curve.forEach(coefficient);
    return curve[skillLevel - 1];
  };
  const representations = [fact.motionValueCurve, fact.motionValueComponents, fact.sourceFixedMotionValue,
    fact.sourceFixedMotionValueComponents, fact.sourceFixedFlatDamage, fact.motionValue]
    .filter((value) => value !== null && value !== undefined);
  if (representations.length > 1) invalid('ambiguous source damage representations');
  // A legacy selected-level scalar has no machine-readable level binding.
  if (representations.length === 0 || fact.motionValue !== null) {
    return { status: 'UNAVAILABLE', reason: 'NO_EXACT_REPRESENTATION' };
  }
  if (fact.sourceFixedFlatDamage !== null && fact.sourceFixedFlatDamage !== undefined) {
    if (fact.scalingStat !== 'FIXED') invalid('flat damage requires FIXED scaling');
    return { status: 'SOURCE_VALUES', kind: 'FLAT_DAMAGE',
      damagePerHit: coefficient(fact.sourceFixedFlatDamage), hitCount: hits(fact.hitCount) };
  }
  if (fact.motionValueCurve) {
    return { status: 'SOURCE_VALUES', kind: 'COEFFICIENTS',
      components: [{ coefficient: atLevel(fact.motionValueCurve), hitCount: hits(fact.hitCount) }] };
  }
  if (fact.sourceFixedMotionValue !== null && fact.sourceFixedMotionValue !== undefined) {
    return { status: 'SOURCE_VALUES', kind: 'COEFFICIENTS',
      components: [{ coefficient: coefficient(fact.sourceFixedMotionValue), hitCount: hits(fact.hitCount) }] };
  }
  if (fact.hitCount !== null) invalid('component values cannot also have an action hit count');
  const components = fact.motionValueComponents
    ? fact.motionValueComponents.map((part) => ({ coefficient: atLevel(part.curve), hitCount: hits(part.hitCount) }))
    : (fact.sourceFixedMotionValueComponents ?? []).map((part) => ({
      coefficient: coefficient(part.coefficient), hitCount: hits(part.hitCount),
    }));
  if (components.length === 0) invalid('empty source components');
  return { status: 'SOURCE_VALUES', kind: 'COEFFICIENTS', components };
}

/** Call only after an engine has established the action's execution and scaling context. */
export function sumCharacterActionCoefficients(fact: CharacterActionFact, skillLevel = 10): number {
  requireSingleCharacterDamageClass(fact);
  if (!['ATK', 'HP', 'DEF'].includes(fact.scalingStat)) {
    throw new Error(`${fact.factId}: coefficient sum requires one supported scaling stat.`);
  }
  const values = readCharacterActionValues(fact, skillLevel);
  if (values.status !== 'SOURCE_VALUES' || values.kind !== 'COEFFICIENTS') {
    throw new Error(`${fact.factId}: no exact Character damage coefficients for level ${skillLevel}.`);
  }
  return values.components.reduce((sum, part) => sum + part.coefficient * part.hitCount, 0);
}
