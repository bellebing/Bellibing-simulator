import { SONATA_EFFECT_MODELS } from '../data/sonataEffects.ts';
import type { SonataActivationPieceCount, SonataEffectModel } from '../sonataEffectDomain.ts';

export type SonataDamageEventKind = 'ECHO_SKILL_DAMAGE';

export interface SonataDamageEvent {
  readonly kind: SonataDamageEventKind;
  readonly actorId: string;
  readonly atSeconds: number;
}

export interface SonataDamageWindowContract {
  readonly effectId: string;
  readonly expectedSonataSetId: string;
  readonly expectedPieces: SonataActivationPieceCount;
  readonly expectedStatOrEffect: string;
  readonly expectedValue: number;
  readonly expectedDurationSeconds: number;
  readonly expectedTrigger: string;
  readonly triggerEvents: readonly SonataDamageEventKind[];
}

export interface ActiveSonataDamageWindow {
  readonly adapterId: 'sonata-damage-timed-self-window-v1';
  readonly effectId: string;
  readonly sonataSetId: string;
  readonly actorId: string;
  readonly statOrEffect: string;
  readonly value: number;
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
}

export const SONATA_DAMAGE_WINDOW_CONTRACTS: readonly SonataDamageWindowContract[] = [
  {
    effectId: 'S29_5PC_ECHO_CR',
    expectedSonataSetId: 'sonata-29',
    expectedPieces: 5,
    expectedStatOrEffect: 'Echo Skill CRIT Rate',
    expectedValue: 0.20,
    expectedDurationSeconds: 5,
    expectedTrigger: 'Deal Echo Skill DMG',
    triggerEvents: ['ECHO_SKILL_DAMAGE'],
  },
  {
    effectId: 'S29_5PC_AERO',
    expectedSonataSetId: 'sonata-29',
    expectedPieces: 5,
    expectedStatOrEffect: 'Aero DMG Bonus',
    expectedValue: 0.15,
    expectedDurationSeconds: 5,
    expectedTrigger: 'Deal Echo Skill DMG',
    triggerEvents: ['ECHO_SKILL_DAMAGE'],
  },
] as const;

function effectsById(catalog: readonly SonataEffectModel[], effectId: string): readonly SonataEffectModel[] {
  return catalog.filter((effect) => effect.effectId === effectId);
}

function uniqueEffectById(catalog: readonly SonataEffectModel[], effectId: string): SonataEffectModel | null {
  const matches = effectsById(catalog, effectId);
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Duplicate Sonata effect id ${effectId}`);
  return matches[0];
}

export function validateSonataDamageWindowContracts(
  catalog: readonly SonataEffectModel[] = SONATA_EFFECT_MODELS,
): readonly string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const contract of SONATA_DAMAGE_WINDOW_CONTRACTS) {
    if (seen.has(contract.effectId)) issues.push(`duplicate Sonata damage-window contract ${contract.effectId}`);
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
    if (effect.trigger !== contract.expectedTrigger) {
      issues.push(`${contract.effectId} trigger drift: expected "${contract.expectedTrigger}", got "${effect.trigger}"`);
    }
    if (effect.valueMode !== 'FLAT') issues.push(`${contract.effectId} must remain FLAT`);
    if (effect.effectType !== 'TRIGGERED') issues.push(`${contract.effectId} must remain TRIGGERED`);
    if (effect.appliesTo !== 'SELF') issues.push(`${contract.effectId} must remain SELF`);
    if (effect.mechanicsStatus !== 'VERIFIED_CONDITIONAL') issues.push(`${contract.effectId} must remain VERIFIED_CONDITIONAL`);
    if (contract.triggerEvents.length === 0) issues.push(`${contract.effectId} has no executable trigger events`);
    if (new Set(contract.triggerEvents).size !== contract.triggerEvents.length) {
      issues.push(`${contract.effectId} repeats an executable trigger event`);
    }
  }

  return issues;
}

const CONTRACT_ISSUES = validateSonataDamageWindowContracts();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Sonata damage-window contracts: ${CONTRACT_ISSUES.join('; ')}`);
}

export function activateSonataDamageWindow(params: {
  readonly effectId: string;
  readonly ownerId: string;
  readonly event: SonataDamageEvent;
  readonly catalog?: readonly SonataEffectModel[];
}): ActiveSonataDamageWindow | null {
  const { effectId, ownerId, event, catalog = SONATA_EFFECT_MODELS } = params;
  const contract = SONATA_DAMAGE_WINDOW_CONTRACTS.find((row) => row.effectId === effectId);
  if (!contract) throw new Error(`No verified damage-window contract for Sonata effect ${effectId}`);
  if (!ownerId.trim()) throw new Error('Sonata damage-window ownerId must be non-blank');
  if (!event.actorId.trim()) throw new Error('Sonata damage event actorId must be non-blank');
  if (!Number.isFinite(event.atSeconds) || event.atSeconds < 0) {
    throw new Error(`Sonata damage event time must be a finite non-negative number: ${event.atSeconds}`);
  }
  if (event.actorId !== ownerId) return null;
  if (!contract.triggerEvents.includes(event.kind)) return null;

  const effect = uniqueEffectById(catalog, effectId);
  if (!effect) throw new Error(`Missing Sonata effect ${effectId}`);
  const durationSeconds = effect.durationSeconds;
  if (durationSeconds === null || durationSeconds <= 0) {
    throw new Error(`Sonata effect ${effectId} has no executable damage-window duration`);
  }
  if (!Number.isFinite(effect.value)) throw new Error(`Sonata effect ${effectId} has no finite value`);

  return {
    adapterId: 'sonata-damage-timed-self-window-v1',
    effectId,
    sonataSetId: effect.sonataSetId,
    actorId: ownerId,
    statOrEffect: effect.statOrEffect,
    value: effect.value,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + durationSeconds,
  };
}

export function isSonataDamageWindowActive(window: ActiveSonataDamageWindow, atSeconds: number): boolean {
  if (!Number.isFinite(atSeconds) || atSeconds < 0) {
    throw new Error(`Sonata damage window query time must be a finite non-negative number: ${atSeconds}`);
  }
  return atSeconds >= window.startedAtSeconds && atSeconds < window.expiresAtSeconds;
}
