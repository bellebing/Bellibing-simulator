import type { CharacterPassiveFact } from '../characterMechanicsDomain.ts';
import { QIUYUAN_PASSIVE_FACTS } from '../data/characterMechanics/qiuyuanRawFacts.ts';
import type { OutgoingSwitchEvent } from './incomingTransferState.ts';

export interface CharacterOutroIncomingTransferContract {
  readonly factId: string;
  readonly sourceActorId: string;
  readonly expectedScope: CharacterPassiveFact['scope'];
  readonly expectedDurationSeconds: number;
  readonly statOrEffect: string;
  readonly value: number;
  readonly triggerSummaryContains: string;
  readonly effectSummaryContains: readonly string[];
}

export interface ActiveCharacterIncomingTransferWindow {
  readonly adapterId: 'character-outro-incoming-transfer-v1';
  readonly factId: string;
  readonly sourceActorId: string;
  readonly incomingResonatorId: string;
  readonly statOrEffect: string;
  readonly value: number;
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
  readonly terminatedAtSeconds: number | null;
}

export interface ResonatorSwitchOutEvent {
  readonly kind: 'RESONATOR_SWITCH_OUT';
  readonly actorId: string;
  readonly atSeconds: number;
}

export const CHARACTER_OUTRO_INCOMING_TRANSFER_CONTRACTS: readonly CharacterOutroIncomingTransferContract[] = [
  {
    factId: 'qiuyuan-outro-strike-before-ready-amplification',
    sourceActorId: 'qiuyuan',
    expectedScope: 'NEXT_CHARACTER',
    expectedDurationSeconds: 14,
    statOrEffect: 'Echo Skill DMG Amplification',
    value: 0.50,
    triggerSummaryContains: 'Casting Outro Skill',
    effectSummaryContains: [
      '50% Echo Skill DMG Amplification',
      '14s or until switched out',
    ],
  },
] as const;

function allPassiveFacts(): readonly CharacterPassiveFact[] {
  return QIUYUAN_PASSIVE_FACTS;
}

function passiveFactById(factId: string, facts: readonly CharacterPassiveFact[]): CharacterPassiveFact | null {
  const matches = facts.filter((fact) => fact.factId === factId);
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Duplicate Character passive fact ${factId}`);
  return matches[0];
}

export function validateCharacterOutroIncomingTransferContracts(
  facts: readonly CharacterPassiveFact[] = allPassiveFacts(),
): readonly string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const contract of CHARACTER_OUTRO_INCOMING_TRANSFER_CONTRACTS) {
    if (seen.has(contract.factId)) issues.push(`duplicate Character Outro transfer contract ${contract.factId}`);
    seen.add(contract.factId);

    const matches = facts.filter((fact) => fact.factId === contract.factId);
    if (matches.length === 0) {
      issues.push(`missing Character passive fact ${contract.factId}`);
      continue;
    }
    if (matches.length > 1) {
      issues.push(`duplicate Character passive fact ${contract.factId}`);
      continue;
    }

    const fact = matches[0];
    if (fact.characterId !== contract.sourceActorId) {
      issues.push(`${contract.factId} source actor drift: expected ${contract.sourceActorId}, got ${fact.characterId}`);
    }
    if (fact.scope !== contract.expectedScope) {
      issues.push(`${contract.factId} scope drift: expected ${contract.expectedScope}, got ${fact.scope}`);
    }
    if (fact.durationSeconds !== contract.expectedDurationSeconds) {
      issues.push(`${contract.factId} duration drift: expected ${contract.expectedDurationSeconds}, got ${String(fact.durationSeconds)}`);
    }
    if (!fact.triggerSummary.includes(contract.triggerSummaryContains)) {
      issues.push(`${contract.factId} trigger summary no longer proves ${contract.triggerSummaryContains}`);
    }
    for (const fragment of contract.effectSummaryContains) {
      if (!fact.effectSummary.includes(fragment)) {
        issues.push(`${contract.factId} effect summary no longer proves ${fragment}`);
      }
    }
    if (fact.modelingStatus !== 'RAW_ONLY') {
      issues.push(`${contract.factId} unexpectedly changed modelingStatus from RAW_ONLY to ${fact.modelingStatus}`);
    }
  }

  return issues;
}

const CONTRACT_ISSUES = validateCharacterOutroIncomingTransferContracts();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Character Outro incoming-transfer contracts: ${CONTRACT_ISSUES.join('; ')}`);
}

function finiteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a finite non-negative number: ${value}`);
}

function nonBlank(value: string, label: string): void {
  if (!value.trim()) throw new Error(`${label} must not be blank`);
}

export function activateCharacterOutroIncomingTransfer(params: {
  readonly factId: string;
  readonly event: OutgoingSwitchEvent;
  readonly facts?: readonly CharacterPassiveFact[];
}): ActiveCharacterIncomingTransferWindow | null {
  const { factId, event, facts = allPassiveFacts() } = params;
  const contract = CHARACTER_OUTRO_INCOMING_TRANSFER_CONTRACTS.find((row) => row.factId === factId);
  if (!contract) throw new Error(`No verified Character Outro incoming-transfer contract for ${factId}`);
  nonBlank(event.actorId, 'outgoing actor id');
  nonBlank(event.incomingResonatorId, 'incoming Resonator id');
  finiteNonNegative(event.atSeconds, 'outgoing switch time');
  if (event.kind !== 'OUTRO_SWITCH') throw new Error(`unsupported Character Outro transfer event kind: ${String(event.kind)}`);
  if (event.actorId !== contract.sourceActorId) return null;
  if (event.incomingResonatorId === event.actorId) return null;

  const fact = passiveFactById(factId, facts);
  if (!fact) throw new Error(`Missing Character passive fact ${factId}`);
  if (fact.durationSeconds === null || fact.durationSeconds <= 0) {
    throw new Error(`Character passive fact ${factId} has no executable positive duration`);
  }

  return {
    adapterId: 'character-outro-incoming-transfer-v1',
    factId,
    sourceActorId: contract.sourceActorId,
    incomingResonatorId: event.incomingResonatorId,
    statOrEffect: contract.statOrEffect,
    value: contract.value,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + fact.durationSeconds,
    terminatedAtSeconds: null,
  };
}

export function terminateCharacterIncomingTransferOnSwitchOut(
  window: ActiveCharacterIncomingTransferWindow,
  event: ResonatorSwitchOutEvent,
): ActiveCharacterIncomingTransferWindow {
  nonBlank(event.actorId, 'switch-out actor id');
  finiteNonNegative(event.atSeconds, 'switch-out time');
  if (event.kind !== 'RESONATOR_SWITCH_OUT') {
    throw new Error(`unsupported Character incoming-transfer termination event kind: ${String(event.kind)}`);
  }
  if (event.actorId !== window.incomingResonatorId) return window;
  if (event.atSeconds < window.startedAtSeconds || event.atSeconds >= window.expiresAtSeconds) return window;
  if (window.terminatedAtSeconds !== null && window.terminatedAtSeconds <= event.atSeconds) return window;
  return { ...window, terminatedAtSeconds: event.atSeconds };
}

export function isCharacterIncomingTransferActive(
  window: ActiveCharacterIncomingTransferWindow,
  actorId: string,
  atSeconds: number,
): boolean {
  nonBlank(actorId, 'Character incoming-transfer query actor id');
  finiteNonNegative(atSeconds, 'Character incoming-transfer query time');
  const end = window.terminatedAtSeconds === null
    ? window.expiresAtSeconds
    : Math.min(window.expiresAtSeconds, window.terminatedAtSeconds);
  return actorId === window.incomingResonatorId
    && atSeconds >= window.startedAtSeconds
    && atSeconds < end;
}
