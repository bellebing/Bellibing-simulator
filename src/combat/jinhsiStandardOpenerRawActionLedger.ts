import type {
  CharacterActionFact,
  CharacterActionKind,
  CharacterDamageClass,
} from '../characterMechanicsDomain.ts';
import { requireSingleCharacterDamageClass } from '../characterMechanicsDomain.ts';
import {
  getCharacterActionFact,
  getCharacterMechanicFact,
} from '../data/characterMechanics.ts';
import { JINHSI_STANDARD_OPENER_ACTION_MAP } from './jinhsiStandardOpenerState.ts';

export const JINHSI_STANDARD_OPENER_RAW_ACTION_LEDGER_PRIMITIVE_ID =
  'jinhsi-standard-opener-raw-action-ledger-v1';

export const JINHSI_STANDARD_OPENER_INCANDESCENCE_MULTIPLIER_FACT_ID =
  'jinhsi-forte-incandescence-damage-multiplier';

export interface JinhsiStandardOpenerRawDamageFact {
  readonly step: number;
  readonly sourceStep: string;
  readonly sourceFactId: string;
  readonly actionKind: CharacterActionKind;
  readonly damageClass: CharacterDamageClass;
  readonly scalingStat: 'ATK';
  readonly skillLevel: number;
  readonly baseMotionValue: number;
  readonly conditional: boolean;
}

export interface JinhsiStandardOpenerRawActionLedgerResolution {
  readonly primitiveId: typeof JINHSI_STANDARD_OPENER_RAW_ACTION_LEDGER_PRIMITIVE_ID;
  readonly presetId: 'jinhsi-standard-opener';
  readonly rotationId: 'jinhsi-standard-opener-source-sequence';
  readonly canonicalResonanceChainSequence: 0;
  readonly skillLevel: number;
  readonly damageFacts: readonly JinhsiStandardOpenerRawDamageFact[];
  readonly damageBearingSteps: readonly number[];
  readonly totalBaseMotionValue: number;
  readonly additionalIncandescenceFactId: typeof JINHSI_STANDARD_OPENER_INCANDESCENCE_MULTIPLIER_FACT_ID;
  readonly additionalIncandescenceMotionValue: null;
  readonly resonanceChainBonusesApplied: false;
  readonly s2OutOfCombatRestoreAuthorized: false;
  readonly exactHitTimestampsKnown: false;
  readonly agesSkillTimedUptimeResolved: false;
  readonly jueContributionResolved: false;
  readonly exactOpenerDamageAuthorized: false;
  readonly engineModelAuthorized: false;
}

function validateSkillLevel(skillLevel: number): void {
  if (!Number.isInteger(skillLevel) || skillLevel < 1 || skillLevel > 10) {
    throw new Error(`Jinhsi skillLevel must be an integer 1-10, got ${skillLevel}.`);
  }
}

function validateExactStandardOpener(sourceSequence: readonly string[]): void {
  if (sourceSequence.length !== JINHSI_STANDARD_OPENER_ACTION_MAP.length) {
    throw new Error(`Jinhsi Standard Opener source sequence length drift: ${sourceSequence.length}`);
  }
  for (let index = 0; index < JINHSI_STANDARD_OPENER_ACTION_MAP.length; index += 1) {
    const expected = JINHSI_STANDARD_OPENER_ACTION_MAP[index]!.sourceStep;
    if (sourceSequence[index] !== expected) {
      throw new Error(
        `Jinhsi Standard Opener source sequence drift at step ${index + 1}: ${String(sourceSequence[index])}`,
      );
    }
  }
}

function motionValueAtLevel(fact: CharacterActionFact, skillLevel: number): number {
  const index = skillLevel - 1;
  if (fact.motionValueCurve) {
    if (fact.hitCount === null) throw new Error(`${fact.factId}: motionValueCurve requires explicit hitCount.`);
    return fact.motionValueCurve[index] * fact.hitCount;
  }
  if (fact.motionValueComponents) {
    return fact.motionValueComponents.reduce(
      (sum, component) => sum + component.curve[index] * component.hitCount,
      0,
    );
  }
  if (fact.sourceFixedMotionValue !== null && fact.sourceFixedMotionValue !== undefined) {
    if (fact.hitCount === null) throw new Error(`${fact.factId}: sourceFixedMotionValue requires explicit hitCount.`);
    return fact.sourceFixedMotionValue * fact.hitCount;
  }
  if (fact.sourceFixedMotionValueComponents) {
    return fact.sourceFixedMotionValueComponents.reduce(
      (sum, component) => sum + component.coefficient * component.hitCount,
      0,
    );
  }
  if (fact.sourceFixedFlatDamage !== null && fact.sourceFixedFlatDamage !== undefined) {
    throw new Error(`${fact.factId}: flat damage is not a motion value and cannot enter the Jinhsi raw-action ledger.`);
  }
  if (fact.motionValue !== null) return fact.motionValue;
  throw new Error(`${fact.factId}: no executable motion value for skill level ${skillLevel}.`);
}

function resolveDamageFact(
  step: number,
  sourceStep: string,
  sourceFactId: string,
  skillLevel: number,
): JinhsiStandardOpenerRawDamageFact | null {
  const mechanicFact = getCharacterMechanicFact(sourceFactId);
  if (!mechanicFact) throw new Error(`Missing Jinhsi Standard Opener mechanic fact ${sourceFactId}.`);
  if (mechanicFact.characterId !== 'jinhsi') {
    throw new Error(`Jinhsi Standard Opener cannot consume ${mechanicFact.characterId} fact ${sourceFactId}.`);
  }
  if (mechanicFact.kind !== 'ACTION') return null;

  const fact = getCharacterActionFact(sourceFactId);
  if (!fact) throw new Error(`Expected Character action fact ${sourceFactId}.`);
  if (fact.actionRole !== 'DAMAGE') {
    throw new Error(`Jinhsi Standard Opener action fact ${sourceFactId} is not Character-owned DAMAGE.`);
  }
  if (fact.scalingStat !== 'ATK') {
    throw new Error(`Jinhsi Standard Opener requires ATK-scaling damage fact ${sourceFactId}.`);
  }

  return {
    step,
    sourceStep,
    sourceFactId,
    actionKind: fact.actionKind,
    damageClass: requireSingleCharacterDamageClass(fact),
    scalingStat: 'ATK',
    skillLevel,
    baseMotionValue: motionValueAtLevel(fact, skillLevel),
    conditional: fact.conditional,
  };
}

/**
 * Resolves only source-backed Character-owned base coefficients for the exact
 * canonical Standard Opener at an explicit caller-selected skill level.
 *
 * This is deliberately not a rotation engine. It does not schedule hits, apply
 * Ages/Jué/Sonata windows, invent Incandescence, apply Resonance Chain bonuses,
 * divide by a duration or register an ENGINE_MODELED profile. The canonical
 * build preset is sequence 0, so S1-S6 facts are not executable profile inputs;
 * in particular S2's out-of-combat 50-Incandescence restore cannot seed this
 * opener. The additional Stella Glamor multiplier from Incandescence remains a
 * separate unresolved resource contribution even though the base Solar
 * Flare/Stella Glamor curves are exact.
 */
export function resolveJinhsiStandardOpenerRawActionLedger(
  sourceSequence: readonly string[],
  skillLevel: number,
): JinhsiStandardOpenerRawActionLedgerResolution {
  validateExactStandardOpener(sourceSequence);
  validateSkillLevel(skillLevel);

  const damageFacts: JinhsiStandardOpenerRawDamageFact[] = [];
  for (const row of JINHSI_STANDARD_OPENER_ACTION_MAP) {
    for (const factId of row.factIds) {
      const resolved = resolveDamageFact(row.step, row.sourceStep, factId, skillLevel);
      if (resolved) damageFacts.push(resolved);
    }
  }

  const incandescenceFact = getCharacterMechanicFact(JINHSI_STANDARD_OPENER_INCANDESCENCE_MULTIPLIER_FACT_ID);
  if (!incandescenceFact || incandescenceFact.characterId !== 'jinhsi') {
    throw new Error(`Missing Jinhsi Incandescence multiplier fact ${JINHSI_STANDARD_OPENER_INCANDESCENCE_MULTIPLIER_FACT_ID}.`);
  }

  return {
    primitiveId: JINHSI_STANDARD_OPENER_RAW_ACTION_LEDGER_PRIMITIVE_ID,
    presetId: 'jinhsi-standard-opener',
    rotationId: 'jinhsi-standard-opener-source-sequence',
    canonicalResonanceChainSequence: 0,
    skillLevel,
    damageFacts,
    damageBearingSteps: [...new Set(damageFacts.map((row) => row.step))],
    totalBaseMotionValue: damageFacts.reduce((sum, row) => sum + row.baseMotionValue, 0),
    additionalIncandescenceFactId: JINHSI_STANDARD_OPENER_INCANDESCENCE_MULTIPLIER_FACT_ID,
    additionalIncandescenceMotionValue: null,
    resonanceChainBonusesApplied: false,
    s2OutOfCombatRestoreAuthorized: false,
    exactHitTimestampsKnown: false,
    agesSkillTimedUptimeResolved: false,
    jueContributionResolved: false,
    exactOpenerDamageAuthorized: false,
    engineModelAuthorized: false,
  };
}

export const JINHSI_STANDARD_OPENER_RAW_ACTION_LEDGER_SEMANTIC_REVIEW = {
  primitiveId: JINHSI_STANDARD_OPENER_RAW_ACTION_LEDGER_PRIMITIVE_ID,
  reviewedAt: '2026-09-01',
  presetId: 'jinhsi-standard-opener',
  rotationId: 'jinhsi-standard-opener-source-sequence',
  canonicalResonanceChainSequence: 0,
  sourceBackedDamageFactCount: 12,
  skillLevelMustBeExplicit: true,
  resonanceChainBonusesAuthorized: false,
  s2OutOfCombatRestoreAuthorized: false,
  closesPendingExecutionIds: [] as readonly string[],
  notes: [
    'The exact Standard Opener action map resolves twelve Character-owned ATK-scaling damage facts across steps 1-11; Outro is non-damage state/effect only.',
    'Incarnation Basic P1-P4 remain BASIC actions with SKILL damage classification; action kind and damage taxonomy are kept separate.',
    'Illuminous Epiphany resolves exact Solar Flare and base Stella Glamor curves, while the conditional additional Stella Glamor multiplier per Incandescence remains separate and unresolved for the canonical opener.',
    'The canonical jinhsi-standard-opener preset is Resonance Chain sequence 0; S1-S6 raw facts are not active profile inputs, including S2 Chronofrost Repose and its out-of-combat 50-Incandescence restore.',
    'The resolver requires an explicit skill level 1-10 and never chooses a talent level for the profile.',
    'No hit timestamps, timed effect overlap, Jué placement, Incandescence predecessor state, opener duration, damage total, DPS denominator, ENGINE_MODELED state or product authorization is created by this ledger.',
  ],
} as const;
