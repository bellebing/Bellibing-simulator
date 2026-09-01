import type { WeaponCastEventKind } from './weaponCastWindowAdapter.ts';

export const JINHSI_STANDARD_OPENER_SKILL_TRIGGER_CHECKPOINT_PRIMITIVE_ID =
  'jinhsi-standard-opener-skill-trigger-checkpoints-v1';

export const JINHSI_STANDARD_OPENER_AH_SKILL_PENDING_EXECUTION_ID =
  'weapon:ages-of-harvest:AH-SKILL:trigger-uptime-adapter';

export interface JinhsiStandardOpenerSkillCastCheckpoint {
  readonly step: 5 | 11;
  readonly sourceStep: 'Skill: Overflowing Radiance' | 'Skill: Illuminous Epiphany';
  readonly eventKind: Extract<WeaponCastEventKind, 'RESONANCE_SKILL_CAST'>;
  readonly weaponEffectId: 'AH-SKILL';
  readonly exactAtSeconds: null;
  readonly sourceProvesTriggerIdentity: true;
  readonly exactWindowPlacementKnown: false;
}

export interface JinhsiStandardOpenerSkillDamageOnlyCheckpoint {
  readonly step: 7 | 8 | 9 | 10;
  readonly sourceStep:
    | 'Incarnation Basic P1'
    | 'Incarnation Basic P2'
    | 'Incarnation Basic P3'
    | 'Incarnation Basic P4';
  readonly damageClassification: 'RESONANCE_SKILL_DMG';
  readonly isResonanceSkillCast: false;
  readonly triggersAgesSkillWindow: false;
}

export interface JinhsiStandardOpenerSkillTriggerResolution {
  readonly primitiveId: typeof JINHSI_STANDARD_OPENER_SKILL_TRIGGER_CHECKPOINT_PRIMITIVE_ID;
  readonly presetId: 'jinhsi-standard-opener';
  readonly rotationId: 'jinhsi-standard-opener-source-sequence';
  readonly pendingExecutionId: typeof JINHSI_STANDARD_OPENER_AH_SKILL_PENDING_EXECUTION_ID;
  readonly skillCastCheckpoints: readonly JinhsiStandardOpenerSkillCastCheckpoint[];
  readonly skillDamageOnlyCheckpoints: readonly JinhsiStandardOpenerSkillDamageOnlyCheckpoint[];
  readonly exactActionTimestampsKnown: false;
  readonly sameEffectRetriggerLifecycleKnown: false;
  readonly dependencyClosed: false;
}

const EXPECTED_STANDARD_OPENER = [
  'Basic P1',
  'Basic P2',
  'Basic P3',
  'Basic P4',
  'Skill: Overflowing Radiance',
  'Ultimate',
  'Incarnation Basic P1',
  'Incarnation Basic P2',
  'Incarnation Basic P3',
  'Incarnation Basic P4',
  'Skill: Illuminous Epiphany',
  'Outro',
] as const;

const SKILL_CAST_CHECKPOINTS: readonly JinhsiStandardOpenerSkillCastCheckpoint[] = Object.freeze([
  {
    step: 5,
    sourceStep: 'Skill: Overflowing Radiance',
    eventKind: 'RESONANCE_SKILL_CAST',
    weaponEffectId: 'AH-SKILL',
    exactAtSeconds: null,
    sourceProvesTriggerIdentity: true,
    exactWindowPlacementKnown: false,
  },
  {
    step: 11,
    sourceStep: 'Skill: Illuminous Epiphany',
    eventKind: 'RESONANCE_SKILL_CAST',
    weaponEffectId: 'AH-SKILL',
    exactAtSeconds: null,
    sourceProvesTriggerIdentity: true,
    exactWindowPlacementKnown: false,
  },
]);

const SKILL_DAMAGE_ONLY_CHECKPOINTS: readonly JinhsiStandardOpenerSkillDamageOnlyCheckpoint[] = Object.freeze([
  {
    step: 7,
    sourceStep: 'Incarnation Basic P1',
    damageClassification: 'RESONANCE_SKILL_DMG',
    isResonanceSkillCast: false,
    triggersAgesSkillWindow: false,
  },
  {
    step: 8,
    sourceStep: 'Incarnation Basic P2',
    damageClassification: 'RESONANCE_SKILL_DMG',
    isResonanceSkillCast: false,
    triggersAgesSkillWindow: false,
  },
  {
    step: 9,
    sourceStep: 'Incarnation Basic P3',
    damageClassification: 'RESONANCE_SKILL_DMG',
    isResonanceSkillCast: false,
    triggersAgesSkillWindow: false,
  },
  {
    step: 10,
    sourceStep: 'Incarnation Basic P4',
    damageClassification: 'RESONANCE_SKILL_DMG',
    isResonanceSkillCast: false,
    triggersAgesSkillWindow: false,
  },
]);

function validateExactStandardOpener(sourceSequence: readonly string[]): void {
  if (sourceSequence.length !== EXPECTED_STANDARD_OPENER.length) {
    throw new Error(`Jinhsi Standard Opener source sequence length drift: ${sourceSequence.length}`);
  }
  for (let index = 0; index < EXPECTED_STANDARD_OPENER.length; index += 1) {
    if (sourceSequence[index] !== EXPECTED_STANDARD_OPENER[index]) {
      throw new Error(
        `Jinhsi Standard Opener source sequence drift at step ${index + 1}: ${String(sourceSequence[index])}`,
      );
    }
  }
}

/**
 * Source-specific checkpoint identity for Ages of Harvest AH-SKILL.
 *
 * The canonical Standard Opener source explicitly names Overflowing Radiance
 * and Illuminous Epiphany as Resonance Skill casts. Those two steps therefore
 * establish trigger identity for the reusable weapon cast-window primitive.
 *
 * Incarnation Basic P1-P4 are separately source-classified as Resonance Skill
 * DMG. Damage classification is not treated as a Resonance Skill cast event,
 * so these Basic Attack actions cannot accidentally retrigger AH-SKILL.
 *
 * This resolver deliberately does not invent timestamps or same-effect
 * retrigger/refresh lifecycle. Trigger identity alone is insufficient to close
 * the timed uptime dependency.
 */
export function resolveJinhsiStandardOpenerSkillTriggerCheckpoints(
  sourceSequence: readonly string[],
): JinhsiStandardOpenerSkillTriggerResolution {
  validateExactStandardOpener(sourceSequence);

  return {
    primitiveId: JINHSI_STANDARD_OPENER_SKILL_TRIGGER_CHECKPOINT_PRIMITIVE_ID,
    presetId: 'jinhsi-standard-opener',
    rotationId: 'jinhsi-standard-opener-source-sequence',
    pendingExecutionId: JINHSI_STANDARD_OPENER_AH_SKILL_PENDING_EXECUTION_ID,
    skillCastCheckpoints: SKILL_CAST_CHECKPOINTS,
    skillDamageOnlyCheckpoints: SKILL_DAMAGE_ONLY_CHECKPOINTS,
    exactActionTimestampsKnown: false,
    sameEffectRetriggerLifecycleKnown: false,
    dependencyClosed: false,
  };
}

export const JINHSI_STANDARD_OPENER_SKILL_TRIGGER_SOURCE_REVIEW = {
  reviewedAt: '2026-09-01',
  sourceUrl: 'https://www.prydwen.gg/wuthering-waves/characters/jinhsi',
  sourceLastUpdated: '2026-08-20',
  presetId: 'jinhsi-standard-opener',
  rotationId: 'jinhsi-standard-opener-source-sequence',
  primitiveId: JINHSI_STANDARD_OPENER_SKILL_TRIGGER_CHECKPOINT_PRIMITIVE_ID,
  pendingExecutionId: JINHSI_STANDARD_OPENER_AH_SKILL_PENDING_EXECUTION_ID,
  closesPendingExecutionIds: [] as readonly string[],
  sourceEstablished: [
    'The exact canonical Standard Opener contains two explicitly named Resonance Skill casts: Overflowing Radiance at step 5 and Illuminous Epiphany at step 11.',
    'Ages of Harvest AH-SKILL is source-triggered by casting Resonance Skill, so those two canonical checkpoints establish trigger identity without requiring an Intro or teammate predecessor.',
    'Incarnation Basic P1-P4 deal damage considered Resonance Skill DMG but remain Basic Attack actions; damage classification alone is not promoted into a Resonance Skill cast trigger.',
  ],
  boundaries: [
    'No exact action timestamps are published for the canonical Standard Opener, so the 12-second AH-SKILL window cannot be placed on an executable time axis.',
    'The source sequence establishes the order of the two Skill casts but not the same-effect retrigger/refresh lifecycle needed to derive exact uptime between them.',
    'Expert Opener roughly-2-second timing is a different variant and is not transferred to the canonical Standard Opener.',
    'AH-SKILL therefore remains pending and no opener damage, duration, DPS denominator, ENGINE_MODELED state or product authorization follows from these checkpoints.',
  ],
} as const;
