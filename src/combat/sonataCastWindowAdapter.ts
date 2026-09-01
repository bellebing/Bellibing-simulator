import { SONATA_EFFECT_MODELS } from '../data/sonataEffects.ts';
import type { SonataActivationPieceCount, SonataEffectModel } from '../sonataEffectDomain.ts';

export type SonataCastEventKind = 'INTRO_SKILL_CAST' | 'RESONANCE_SKILL_CAST';

export interface SonataCastEvent {
  readonly kind: SonataCastEventKind;
  readonly actorId: string;
  readonly atSeconds: number;
}

export interface SonataCastWindowContract {
  readonly effectId: string;
  readonly expectedSonataSetId: string;
  readonly expectedPieces: SonataActivationPieceCount;
  readonly expectedStatOrEffect: string;
  readonly expectedValue: number;
  readonly expectedDurationSeconds: number;
  readonly triggerEvents: readonly SonataCastEventKind[];
}

export interface ActiveSonataSelfWindow {
  readonly adapterId: 'sonata-cast-timed-self-window-v1';
  readonly effectId: string;
  readonly sonataSetId: string;
  readonly actorId: string;
  readonly statOrEffect: string;
  readonly value: number;
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
}

/**
 * Explicit semantic mapping for source-clean cast-triggered SELF Sonata windows.
 *
 * The adapter deliberately does not parse human-readable trigger strings. A row
 * enters this primitive only after manual semantic review maps its canonical
 * effect ID to an executable event kind and locks the source-backed value and
 * duration below.
 */
export const SONATA_CAST_WINDOW_CONTRACTS: readonly SonataCastWindowContract[] = [
  {
    effectId: 'S02_5PC_FUSION',
    expectedSonataSetId: 'sonata-2',
    expectedPieces: 5,
    expectedStatOrEffect: 'Fusion DMG Bonus',
    expectedValue: 0.30,
    expectedDurationSeconds: 15,
    triggerEvents: ['RESONANCE_SKILL_CAST'],
  },
  {
    effectId: 'S05_5PC_SPECTRO',
    expectedSonataSetId: 'sonata-5',
    expectedPieces: 5,
    expectedStatOrEffect: 'Spectro DMG Bonus',
    expectedValue: 0.30,
    expectedDurationSeconds: 15,
    triggerEvents: ['INTRO_SKILL_CAST'],
  },
] as const;

export const SONATA_CAST_WINDOW_SEMANTIC_SPLIT = {
  adapterId: 'sonata-cast-timed-self-window-v1',
  reviewedAt: '2026-09-01',
  pendingExecutionIds: [
    'sonata:sonata-2:S02_5PC_FUSION:trigger-uptime-adapter',
  ],
  closesPendingExecutionIds: [
    'sonata:sonata-5:S05_5PC_SPECTRO:trigger-uptime-adapter',
  ] as const,
  requiresProfileEventTimeline: true,
  notes: [
    'Molten Rift 5-piece is source-clean as an executed Resonance Skill cast -> 15-second SELF Fusion DMG window and remains pending for Changli timeline execution.',
    'Celestial Light 5-piece remains a reusable source-clean Intro Skill cast -> 15-second SELF Spectro DMG contract.',
    'The exact Jinhsi Standard Opener Celestial dependency is now closed separately by jinhsi-standard-opener-combat-start-prebuff-v1 because current source explicitly starts combat with the no-Intro opener; this does not remove the reusable cast-window contract.',
    'Neither primitive contract grants uptime from equipment alone; callers must supply the matching owner event and exact timestamp unless a source-specific profile review proves the trigger cannot occur in the supported artifact.',
    'No generic trigger-text parsing or blanket uptime is authorized by this semantic split.',
  ],
} as const;

function effectsById(catalog: readonly SonataEffectModel[], effectId: string): readonly SonataEffectModel[] {
  return catalog.filter((effect) => effect.effectId === effectId);
}

function uniqueEffectById(catalog: readonly SonataEffectModel[], effectId: string): SonataEffectModel | null {
  const matches = effectsById(catalog, effectId);
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Duplicate Sonata effect id ${effectId}`);
  return matches[0];
}

export function validateSonataCastWindowContracts(
  catalog: readonly SonataEffectModel[] = SONATA_EFFECT_MODELS,
): readonly string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const contract of SONATA_CAST_WINDOW_CONTRACTS) {
    if (seen.has(contract.effectId)) issues.push(`duplicate Sonata cast-window contract ${contract.effectId}`);
    seen.add(contract.effectId);

    const matches = effectsById(catalog, contract.effectId);
    if (matches.length === 0) {
      issues.push(`missing Sonata effect ${contract.effectId}`);
      continue;
    }
    if (matches.length > 1) {
      issues.push(`duplicate Sonata effect id ${contract.effectId}`);
      continue;
    }

    const effect = matches[0];
    if (effect.sonataSetId !== contract.expectedSonataSetId) {
      issues.push(`${contract.effectId} Sonata set drift: expected ${contract.expectedSonataSetId}, got ${effect.sonataSetId}`);
    }
    if (effect.pieces !== contract.expectedPieces) {
      issues.push(`${contract.effectId} piece-count drift: expected ${contract.expectedPieces}, got ${effect.pieces}`);
    }
    if (effect.statOrEffect !== contract.expectedStatOrEffect) {
      issues.push(`${contract.effectId} stat drift: expected ${contract.expectedStatOrEffect}, got ${effect.statOrEffect}`);
    }
    if (effect.value !== contract.expectedValue) {
      issues.push(`${contract.effectId} value drift: expected ${contract.expectedValue}, got ${effect.value}`);
    }
    if (effect.durationSeconds !== contract.expectedDurationSeconds) {
      issues.push(`${contract.effectId} duration drift: expected ${contract.expectedDurationSeconds}, got ${String(effect.durationSeconds)}`);
    }
    if (effect.valueMode !== 'FLAT') issues.push(`${contract.effectId} must remain FLAT`);
    if (effect.effectType !== 'TRIGGERED') issues.push(`${contract.effectId} must remain TRIGGERED`);
    if (effect.appliesTo !== 'SELF') issues.push(`${contract.effectId} must remain SELF`);
    if (effect.mechanicsStatus !== 'VERIFIED_CONDITIONAL') {
      issues.push(`${contract.effectId} must remain VERIFIED_CONDITIONAL`);
    }
    if (contract.triggerEvents.length === 0) issues.push(`${contract.effectId} has no executable trigger events`);
    if (new Set(contract.triggerEvents).size !== contract.triggerEvents.length) {
      issues.push(`${contract.effectId} repeats an executable trigger event`);
    }
  }

  return issues;
}

const CONTRACT_ISSUES = validateSonataCastWindowContracts();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Sonata cast-window contracts: ${CONTRACT_ISSUES.join('; ')}`);
}

export function activateSonataCastWindow(params: {
  readonly effectId: string;
  readonly ownerId: string;
  readonly event: SonataCastEvent;
  readonly catalog?: readonly SonataEffectModel[];
}): ActiveSonataSelfWindow | null {
  const { effectId, ownerId, event, catalog = SONATA_EFFECT_MODELS } = params;
  const contract = SONATA_CAST_WINDOW_CONTRACTS.find((row) => row.effectId === effectId);
  if (!contract) throw new Error(`No verified cast-window contract for Sonata effect ${effectId}`);
  if (!ownerId.trim()) throw new Error('Sonata cast-window ownerId must be non-blank');
  if (!event.actorId.trim()) throw new Error('Sonata cast event actorId must be non-blank');
  if (!Number.isFinite(event.atSeconds) || event.atSeconds < 0) {
    throw new Error(`Sonata cast event time must be a finite non-negative number: ${event.atSeconds}`);
  }
  if (event.actorId !== ownerId) return null;
  if (!contract.triggerEvents.includes(event.kind)) return null;

  const effect = uniqueEffectById(catalog, effectId);
  if (!effect) throw new Error(`Missing Sonata effect ${effectId}`);
  const durationSeconds = effect.durationSeconds;
  if (durationSeconds === null || durationSeconds <= 0) {
    throw new Error(`Sonata effect ${effectId} has no executable cast-window duration`);
  }
  if (!Number.isFinite(effect.value)) throw new Error(`Sonata effect ${effectId} has no finite value`);

  return {
    adapterId: 'sonata-cast-timed-self-window-v1',
    effectId,
    sonataSetId: effect.sonataSetId,
    actorId: ownerId,
    statOrEffect: effect.statOrEffect,
    value: effect.value,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + durationSeconds,
  };
}

export function isSonataCastWindowActive(window: ActiveSonataSelfWindow, atSeconds: number): boolean {
  if (!Number.isFinite(atSeconds) || atSeconds < 0) {
    throw new Error(`Sonata window query time must be a finite non-negative number: ${atSeconds}`);
  }
  return atSeconds >= window.startedAtSeconds && atSeconds < window.expiresAtSeconds;
}
