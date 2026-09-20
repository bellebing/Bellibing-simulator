import type { Echo } from '../echoCore.ts';
import type { Element } from '../gameDataDomain.ts';
import { projectRank5EchoStats } from '../echoStatProjection.ts';
import { validateEchoLoadout } from '../loadoutValidator.ts';
import { getCharacterActionFact } from '../data/characterMechanics.ts';
import { readCharacterActionValues } from '../characterActionValues.ts';
import { evaluateCharacterDirectHit, listCharacterDirectHitSupport, supportsCharacterDirectHit,
  type CharacterDirectHitInput, type CharacterDirectHitSnapshot } from './characterDirectHitAdapter.ts';

export const CHARACTER_ECHO_COMPARISON_ID = 'character-explicit-hit-echo-comparison-v1';
type Hit = Omit<CharacterDirectHitInput, 'snapshot'>;

/** Complete snapshots remain caller-qualified, including when Bellibing assembled
 * part of their values. Evidence IDs and card keys are labels/identity, not proof. */
export type EchoBuildHitContext = { readonly status: 'PENDING'; readonly reason: string } | {
  readonly status: 'QUALIFIED';
  readonly provenance: 'CALLER_QUALIFIED';
  readonly characterId: string;
  readonly factId: string;
  readonly componentIndex: number;
  readonly landedHitCount: number;
  readonly eventContextId: string;
  readonly echoStatKey: string;
  readonly evidenceId: string;
  /** The selected hit's caller-qualified attribute; never inferred from a Character label. */
  readonly damageElement: Element;
  /** Includes all Character, weapon, main-Echo, Sonata, team/enemy/state effects,
   * but excludes the primary/secondary/substat card values added below. */
  readonly nonEchoSnapshot: CharacterDirectHitSnapshot;
  /** The exact ATK/HP/DEF base to which the Echo's percentage stat applies.
   * The caller qualifies its source, including weapon base ATK where applicable. */
  readonly scalingBaseBeforePercentBonuses: number;
  /** Assertions required of the trusted caller; not engine-issued source proof. */
  readonly callerAssertions: {
    readonly allNonEchoSourcesQualified: true;
    readonly echoDependentEffectsRecomputed: true;
    readonly equipmentStateQualified: true;
  };
};

export interface CharacterEchoComparisonInput {
  readonly hit: Hit;
  /** Same actual or explicitly modeled hit/target/context in both scenarios. */
  readonly eventContextId: string;
  readonly slotIndex: number;
  readonly current: { readonly echoes: readonly Echo[]; readonly context: EchoBuildHitContext };
  readonly candidate: { readonly echoes: readonly Echo[]; readonly context: EchoBuildHitContext };
}

export function listCharacterEchoComparisonSupport() {
  return listCharacterDirectHitSupport().map(row => ({ ...row,
    primitiveId: CHARACTER_ECHO_COMPARISON_ID, scope: 'SAME_HIT_ECHO_REPLACEMENT' as const,
    requiresPerBuildContext: true as const, authorizesRotationDps: false as const }));
}

const classStat = { BASIC: 'Basic Attack DMG', HEAVY: 'Heavy Attack DMG', SKILL: 'Skill DMG',
  LIBERATION: 'Liberation DMG', INTRO: null, OUTRO: null } as const;
const text = (s: unknown): s is string => typeof s === 'string' && s.trim().length > 0;

/** Recompute one chosen component/hit set. Never a rotation, ER gate or whole-build upgrade verdict. */
export function compareCharacterHitEchoReplacement(input: CharacterEchoComparisonInput) {
  const hit = input.hit;
  const fact = getCharacterActionFact(hit?.factId);
  if (!fact || hit.characterId !== fact.characterId || !supportsCharacterDirectHit(fact)
    || hit.sequence !== 0 || hit.maxSkills !== true || !text(input.eventContextId)) {
    throw new Error('Require exact supported S0/max-skill Character action and event context');
  }
  const values = readCharacterActionValues(fact, 10);
  if (values.status !== 'SOURCE_VALUES' || values.kind !== 'COEFFICIENTS'
    || !Number.isInteger(hit.componentIndex) || hit.componentIndex < 0 || !values.components[hit.componentIndex]
    || !Number.isInteger(hit.landedHitCount) || hit.landedHitCount < 0
    || hit.landedHitCount > values.components[hit.componentIndex].hitCount) {
    throw new Error('Require explicit canonical component and landed-hit count');
  }
  if (!Number.isInteger(input.slotIndex) || input.slotIndex < 0 || input.slotIndex >= 5) {
    throw new Error('Require an exact Echo replacement slot');
  }
  const current = projectRank5EchoStats(input.current.echoes);
  const candidate = projectRank5EchoStats(input.candidate.echoes);
  for (const [side, projection] of [['current', current], ['candidate', candidate]] as const) {
    const loadout = validateEchoLoadout(projection.cards);
    if (!loadout.valid) throw new Error(`${side} Echo loadout is invalid: ${loadout.violations.join(', ')}`);
  }
  if (current.cards[input.slotIndex].cost !== candidate.cards[input.slotIndex].cost) {
    throw new Error('Replacement must retain the selected slot COST');
  }
  current.cards.forEach((card, index) => {
    if (index !== input.slotIndex && JSON.stringify(card) !== JSON.stringify(candidate.cards[index])) {
      throw new Error('Only the selected Echo card may change');
    }
  });
  const validateContext = (context: EchoBuildHitContext, key: string) => {
    if (context?.status === 'PENDING') {
      if (!text(context.reason)) throw new Error('Pending combat context requires its missing evidence');
      return;
    }
    if (!context || context.status !== 'QUALIFIED' || context.provenance !== 'CALLER_QUALIFIED'
      || context.characterId !== hit.characterId
      || context.factId !== hit.factId || context.eventContextId !== input.eventContextId
      || context.componentIndex !== hit.componentIndex || context.landedHitCount !== hit.landedHitCount
      || context.echoStatKey !== key || !text(context.evidenceId)
      || !['Aero', 'Electro', 'Fusion', 'Glacio', 'Havoc', 'Spectro'].includes(context.damageElement)
      || context.callerAssertions?.allNonEchoSourcesQualified !== true
      || context.callerAssertions?.echoDependentEffectsRecomputed !== true
      || context.callerAssertions?.equipmentStateQualified !== true || !Number.isFinite(context.scalingBaseBeforePercentBonuses)
      || context.scalingBaseBeforePercentBonuses <= 0) {
      throw new Error('Require independently qualified combat context bound to these exact Echo cards');
    }
    // Reuse the existing validation for tags, numeric limits and source ownership.
    evaluateCharacterDirectHit({ ...hit, snapshot: context.nonEchoSnapshot });
  };
  validateContext(input.current.context, current.key);
  validateContext(input.candidate.context, candidate.key);
  const boundary = { primitiveId: CHARACTER_ECHO_COMPARISON_ID, scope: 'SAME_HIT_ECHO_REPLACEMENT' as const,
    characterId: hit.characterId, factId: hit.factId, componentIndex: hit.componentIndex,
    landedHitCount: hit.landedHitCount, slotIndex: input.slotIndex,
    authorizesRotationDps: false as const, authorizesUpgradeVerdict: false as const,
    resourceFeasibility: 'NOT_EVALUATED' as const };
  if (input.current.context.status === 'PENDING' || input.candidate.context.status === 'PENDING') {
    return { ...boundary, status: 'PENDING' as const,
      reasons: [input.current.context, input.candidate.context].flatMap(c => c.status === 'PENDING' ? [c.reason] : []) };
  }
  if (input.current.context.damageElement !== input.candidate.context.damageElement
    || input.current.context.scalingBaseBeforePercentBonuses !== input.candidate.context.scalingBaseBeforePercentBonuses) {
    throw new Error('Same-hit Echo comparison must retain the damage element and base scaling stat');
  }
  const evaluate = (projection: ReturnType<typeof projectRank5EchoStats>, context: Extract<EchoBuildHitContext, { status: 'QUALIFIED' }>) => {
    const s = context.nonEchoSnapshot, totals = projection.totals;
    const stat = (name: string) => totals[name] ?? 0;
    const damageStat = classStat[s.damageClass];
    const snapshot = { ...s,
      totalScalingStat: s.totalScalingStat + context.scalingBaseBeforePercentBonuses * stat(s.scalingStat + '%') + stat('Flat ' + s.scalingStat),
      critRate: s.critRate + stat('CRIT Rate'), critDamage: s.critDamage + stat('CRIT DMG'),
      damageBonus: s.damageBonus + stat(context.damageElement + ' DMG') + (damageStat ? stat(damageStat) : 0),
    };
    return { expectedDamage: evaluateCharacterDirectHit({ ...hit, snapshot }).expectedDamage,
      snapshot, echoStats: projection.totals, evidenceId: context.evidenceId,
      provenance: context.provenance };
  };
  const before = evaluate(current, input.current.context), after = evaluate(candidate, input.candidate.context);
  const delta = after.expectedDamage - before.expectedDamage;
  return { ...boundary, status: 'EVALUATED_HIT_COMPARISON' as const, current: before, candidate: after,
    expectedDamageDelta: delta,
    relativeExpectedDamageDelta: before.expectedDamage > 0 ? delta / before.expectedDamage : null };
}
