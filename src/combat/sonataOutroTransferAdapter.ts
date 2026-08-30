import type { SonataEffectModel } from '../sonataEffectDomain.ts';
import { SONATA_EFFECT_MODELS } from '../data/sonataEffects.ts';
import {
  createIncomingTransferWindow,
  type IncomingTransferWindow,
  type OutgoingSwitchEvent,
} from './incomingTransferState.ts';

interface SonataOutroTransferContract {
  readonly effectId: string;
  readonly sonataSetId: string;
  readonly expectedSourceTrigger: string;
  readonly durationSeconds: number;
}

export const SONATA_OUTRO_TRANSFER_CONTRACTS: readonly SonataOutroTransferContract[] = [
  {
    effectId: 'S08_5PC_INCOMING_ATK',
    sonataSetId: 'sonata-8',
    expectedSourceTrigger: 'Cast Outro Skill; apply to next Resonator',
    durationSeconds: 15,
  },
  {
    effectId: 'S12_5PC_INCOMING_HAVOC',
    sonataSetId: 'sonata-12',
    expectedSourceTrigger: 'Trigger Outro Skill; apply to incoming Resonator',
    durationSeconds: 15,
  },
] as const;

export const SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT = {
  adapterId: 'sonata-outro-incoming-transfer-v1',
  reviewedAt: '2026-08-30',
  directOutroPendingExecutionIds: [
    'sonata:sonata-8:S08_5PC_INCOMING_ATK:outro-transfer-adapter',
    'sonata:sonata-12:S12_5PC_INCOMING_HAVOC:outro-transfer-adapter',
  ],
  closesPendingExecutionIds: [] as readonly string[],
  requiresProfileEventTimeline: true,
  notes: [
    'Moonlit Clouds and Midnight Veil share the low-level Outro -> actual incoming Resonator timed-transfer mechanic.',
    'Other INCOMING_RESONATOR Sonata rows have extra Intro, self-state, scaling or state-removal prerequisites and are not admitted by this adapter merely because their target is incoming.',
    'The primitive does not close canonical pending IDs until an executable profile timeline supplies the actual outgoing actor, incoming Resonator and switch time.',
  ],
} as const;

function effectById(catalog: readonly SonataEffectModel[], effectId: string): SonataEffectModel | null {
  return catalog.find((effect) => effect.effectId === effectId) ?? null;
}

export function validateSonataOutroTransferContracts(
  catalog: readonly SonataEffectModel[] = SONATA_EFFECT_MODELS,
): readonly string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const contract of SONATA_OUTRO_TRANSFER_CONTRACTS) {
    if (seen.has(contract.effectId)) issues.push(`duplicate Sonata Outro transfer contract ${contract.effectId}`);
    seen.add(contract.effectId);
    const effect = effectById(catalog, contract.effectId);
    if (!effect) {
      issues.push(`missing Sonata transfer effect ${contract.effectId}`);
      continue;
    }
    if (effect.sonataSetId !== contract.sonataSetId) issues.push(`${contract.effectId} Sonata set id drift`);
    if (effect.trigger !== contract.expectedSourceTrigger) issues.push(`${contract.effectId} trigger drift`);
    if (effect.effectType !== 'TRIGGERED') issues.push(`${contract.effectId} must remain TRIGGERED`);
    if (effect.valueMode !== 'FLAT') issues.push(`${contract.effectId} must remain FLAT`);
    if (effect.appliesTo !== 'INCOMING_RESONATOR') issues.push(`${contract.effectId} must remain INCOMING_RESONATOR`);
    if (effect.mechanicsStatus !== 'VERIFIED_CONDITIONAL') issues.push(`${contract.effectId} must remain VERIFIED_CONDITIONAL`);
    if (effect.durationSeconds !== contract.durationSeconds) issues.push(`${contract.effectId} duration drift`);
    if (!Number.isFinite(effect.value)) issues.push(`${contract.effectId} value must remain finite`);
  }

  return issues;
}

const CONTRACT_ISSUES = validateSonataOutroTransferContracts();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Sonata Outro transfer contracts: ${CONTRACT_ISSUES.join('; ')}`);
}

export function activateSonataOutroTransfer(params: {
  readonly effectId: string;
  readonly wielderId: string;
  readonly event: OutgoingSwitchEvent;
  readonly catalog?: readonly SonataEffectModel[];
}): IncomingTransferWindow | null {
  const { effectId, wielderId, event, catalog = SONATA_EFFECT_MODELS } = params;
  const contract = SONATA_OUTRO_TRANSFER_CONTRACTS.find((row) => row.effectId === effectId);
  if (!contract) throw new Error(`No verified direct Sonata Outro transfer contract for ${effectId}`);
  const effect = effectById(catalog, effectId);
  if (!effect) throw new Error(`Missing Sonata transfer effect ${effectId}`);

  return createIncomingTransferWindow({
    adapterId: 'sonata-outro-incoming-transfer-v1',
    sourceLayer: 'SONATA',
    effectId,
    sourceId: effect.sonataSetId,
    sourceActorId: wielderId,
    statOrEffect: effect.statOrEffect,
    value: effect.value,
    durationSeconds: contract.durationSeconds,
    requiresIncomingIntro: false,
  }, event);
}
