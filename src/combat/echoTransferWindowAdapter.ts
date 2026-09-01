import type { EchoEffectModel } from '../echoEffectDomain.ts';
import { ECHO_EFFECT_MODELS } from '../data/echoEffects.ts';
import {
  createIncomingTransferWindow,
  type IncomingTransferWindow,
  type OutgoingSwitchEvent,
} from './incomingTransferState.ts';

export interface EchoTransferArmEvent {
  readonly kind: 'ECHO_SKILL_SUMMON';
  readonly echoId: string;
  readonly actorId: string;
  readonly atSeconds: number;
}

interface EchoTransferContract {
  readonly effectId: string;
  readonly echoId: string;
  readonly expectedSourceTrigger: string;
  readonly activationWindowSeconds: number;
  readonly durationSeconds: number;
  readonly requiresIncomingIntro: boolean;
}

export const ECHO_TRANSFER_WINDOW_CONTRACTS: readonly EchoTransferContract[] = [
  {
    effectId: 'REMINISCENCE_DENIA_INCOMING_FUSION',
    echoId: 'echo-60002005',
    expectedSourceTrigger: 'Within 15s after summoning Reminiscence: Denia, the wielder casts Outro Skill',
    activationWindowSeconds: 15,
    durationSeconds: 15,
    requiresIncomingIntro: false,
  },
  {
    effectId: 'GLOMMOTH_INCOMING_GLACIO',
    echoId: 'echo-60001955',
    expectedSourceTrigger: 'Within 15s after summoning Glommoth, the wielder casts Outro Skill',
    activationWindowSeconds: 15,
    durationSeconds: 15,
    requiresIncomingIntro: false,
  },
  {
    effectId: 'HYVATIA_INCOMING_ALL_ATTRIBUTE',
    echoId: 'echo-60001895',
    expectedSourceTrigger: 'Within 15s after summoning Hyvatia, the wielder casts Outro; the next Resonator uses Intro Skill',
    activationWindowSeconds: 15,
    durationSeconds: 15,
    requiresIncomingIntro: true,
  },
] as const;

export const IMPERMANENCE_HERON_TRANSFER_DISPOSITION = {
  status: 'BLOCKED_SOURCE_CONFLICT',
  echoId: 'echo-60000525',
  reviewedAt: '2026-08-30',
  pendingExecutionId: 'echo:echo-60000525:impermanence-heron-active-transfer-adapter',
  closesPendingExecutionIds: [] as readonly string[],
  sourceConflict: [
    {
      source: 'Pinned current DommyMM/wuwabuild Echoes.json',
      url: 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Echoes.json',
      claim: 'The rendered skill text ties the 10 Resonance Energy gain to the initial hit and then says Outro within the next 15s transfers +12% damage for 15s.',
    },
    {
      source: 'Current Prydwen Impermanence Heron usage guidance',
      url: 'https://www.prydwen.gg/wuthering-waves/echoes/impermanence-heron/',
      claim: 'Current usage guidance states the Echo can be cancelled before damage/Energy while still applying the incoming-character buff.',
    },
  ],
  notes: [
    'Bellibing does not choose hit-armed versus cast-armed transfer semantics while current source evidence conflicts.',
    'The shared transfer core may be reused after the Heron arm condition is independently resolved; until then all canonical Heron profile dependencies remain pending.',
  ],
} as const;

function effectById(catalog: readonly EchoEffectModel[], effectId: string): EchoEffectModel | null {
  return catalog.find((effect) => effect.effectId === effectId) ?? null;
}

export function validateEchoTransferWindowContracts(
  catalog: readonly EchoEffectModel[] = ECHO_EFFECT_MODELS,
): readonly string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const contract of ECHO_TRANSFER_WINDOW_CONTRACTS) {
    if (seen.has(contract.effectId)) issues.push(`duplicate Echo transfer contract ${contract.effectId}`);
    seen.add(contract.effectId);
    const effect = effectById(catalog, contract.effectId);
    if (!effect) {
      issues.push(`missing Echo transfer effect ${contract.effectId}`);
      continue;
    }
    if (effect.echoId !== contract.echoId) issues.push(`${contract.effectId} Echo id drift`);
    if (effect.trigger !== contract.expectedSourceTrigger) issues.push(`${contract.effectId} trigger drift`);
    if (effect.activation !== 'TRANSFER_WINDOW') issues.push(`${contract.effectId} must remain TRANSFER_WINDOW`);
    if (effect.appliesTo !== 'INCOMING_RESONATOR') issues.push(`${contract.effectId} must remain INCOMING_RESONATOR`);
    if (effect.mechanicsStatus !== 'VERIFIED_CONDITIONAL') issues.push(`${contract.effectId} must remain VERIFIED_CONDITIONAL`);
    if (effect.activationWindowSeconds !== contract.activationWindowSeconds) issues.push(`${contract.effectId} activation window drift`);
    if (effect.durationSeconds !== contract.durationSeconds) issues.push(`${contract.effectId} duration drift`);
    if (Boolean(effect.requiresIncomingIntro) !== contract.requiresIncomingIntro) issues.push(`${contract.effectId} incoming Intro requirement drift`);
    if (!Number.isFinite(effect.value)) issues.push(`${contract.effectId} value must remain finite`);
  }

  return issues;
}

const CONTRACT_ISSUES = validateEchoTransferWindowContracts();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Echo transfer contracts: ${CONTRACT_ISSUES.join('; ')}`);
}

export function activateEchoTransferWindow(params: {
  readonly effectId: string;
  readonly wielderId: string;
  readonly armEvent: EchoTransferArmEvent;
  readonly outroEvent: OutgoingSwitchEvent;
  readonly catalog?: readonly EchoEffectModel[];
}): IncomingTransferWindow | null {
  const { effectId, wielderId, armEvent, outroEvent, catalog = ECHO_EFFECT_MODELS } = params;
  const contract = ECHO_TRANSFER_WINDOW_CONTRACTS.find((row) => row.effectId === effectId);
  if (!contract) throw new Error(`No verified Echo transfer contract for ${effectId}`);
  if (armEvent.kind !== 'ECHO_SKILL_SUMMON') {
    throw new Error(`unsupported Echo transfer arm event kind: ${String(armEvent.kind)}`);
  }
  if (!armEvent.echoId.trim() || !armEvent.actorId.trim()) {
    throw new Error('Echo transfer arm event ids must not be blank');
  }
  if (!Number.isFinite(armEvent.atSeconds) || armEvent.atSeconds < 0) {
    throw new Error(`Echo transfer arm time must be a finite non-negative number: ${armEvent.atSeconds}`);
  }
  if (armEvent.echoId !== contract.echoId || armEvent.actorId !== wielderId) return null;

  const effect = effectById(catalog, effectId);
  if (!effect) throw new Error(`Missing Echo transfer effect ${effectId}`);

  return createIncomingTransferWindow({
    adapterId: 'echo-transfer-window-v1',
    sourceLayer: 'ECHO',
    effectId,
    sourceId: effect.echoId,
    sourceActorId: wielderId,
    statOrEffect: effect.statOrEffect,
    value: effect.value,
    durationSeconds: contract.durationSeconds,
    requiresIncomingIntro: contract.requiresIncomingIntro,
    armedAtSeconds: armEvent.atSeconds,
    activationWindowSeconds: contract.activationWindowSeconds,
  }, outroEvent);
}
