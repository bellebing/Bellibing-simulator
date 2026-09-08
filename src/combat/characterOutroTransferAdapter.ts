import type { CharacterMechanicFact } from '../characterMechanicsDomain.ts';
import { CHARACTER_CATALOG } from '../data/characters.ts';
import { CHARACTER_MECHANIC_FACTS, getCharacterMechanicsProfile } from '../data/characterMechanics.ts';
import {
  createIncomingTransferWindow, isIncomingTransferWindowActive,
  type IncomingTransferWindow, type OutgoingSwitchEvent, type ResonatorSwitchOutEvent,
} from './incomingTransferState.ts';

export const CHARACTER_OUTRO_TRANSFER_ADAPTER_ID = 'character-outro-source-amplifications-v1';

export interface CharacterOutroAmplification {
  readonly statOrEffect: string;
  readonly value: number;
}

interface CharacterOutroContract {
  readonly factId: string;
  readonly characterId: string;
  readonly durationSeconds: number;
  readonly amplifications: readonly CharacterOutroAmplification[];
}

/**
 * Exact reviewed source sentence shapes only. Each amplification stays a
 * separate term; this parser does not choose how different damage scopes
 * combine. Other text, pending modeling and periodic resource effects stay out.
 */
export function resolveCharacterOutroTransferContract(fact: CharacterMechanicFact): CharacterOutroContract | null {
  const profile = getCharacterMechanicsProfile(fact.characterId);
  if (profile?.verificationStatus !== 'VERIFIED' || !profile.factIds.includes(fact.factId)
      || fact.kind !== 'PASSIVE' || fact.verificationStatus !== 'VERIFIED'
      || !['MODEL_READY', 'MODELED'].includes(fact.modelingStatus)
      || fact.section !== 'OUTRO_SKILL' || fact.scope !== 'NEXT_CHARACTER' || fact.maxStacks !== 1) return null;
  const character = CHARACTER_CATALOG.find((row) => row.id === fact.characterId);
  if (fact.triggerSummary !== `${character?.name} casts Outro Skill and the incoming Resonator takes the field.`) return null;

  const single = fact.effectSummary.match(/^The incoming Resonator gains ([0-9]+(?:\.[0-9]+)?)% (Aero DMG|Heavy Attack DMG) Amplification for ([0-9]+(?:\.[0-9]+)?) seconds or until (?:they switch out|that character switches out)\.$/);
  const scoped = fact.effectSummary.match(/^The incoming Resonator has (?:(Fusion|Electro) DMG Amplified by ([0-9]+(?:\.[0-9]+)?)% and )?(Resonance Liberation|Resonance Skill) DMG Amplified by ([0-9]+(?:\.[0-9]+)?)% for ([0-9]+(?:\.[0-9]+)?)(?:s| seconds) or until switched out\.$/);
  let durationSeconds: number;
  let amplifications: CharacterOutroAmplification[];
  if (single) {
    durationSeconds = Number(single[3]);
    amplifications = [{ statOrEffect: `${single[2]} Amplification`, value: Number(single[1]) / 100 }];
  } else if (scoped) {
    durationSeconds = Number(scoped[5]);
    amplifications = [
      ...(scoped[1] ? [{ statOrEffect: `${scoped[1]} DMG Amplification`, value: Number(scoped[2]) / 100 }] : []),
      { statOrEffect: `${scoped[3]} DMG Amplification`, value: Number(scoped[4]) / 100 },
    ];
  } else return null;
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds !== fact.durationSeconds
      || amplifications.some((term) => !Number.isFinite(term.value) || term.value <= 0)) return null;
  return { factId: fact.factId, characterId: fact.characterId, durationSeconds, amplifications };
}

export function listCharacterOutroTransferSupport() {
  return CHARACTER_MECHANIC_FACTS.flatMap((fact) => {
    const contract = resolveCharacterOutroTransferContract(fact);
    return contract ? [{ ...contract, primitiveId: CHARACTER_OUTRO_TRANSFER_ADAPTER_ID,
      scope: 'EXPLICIT_OUTRO_TRANSFER_ONLY' as const, endsOnIncomingSwitchOut: true as const }] : [];
  }).sort((a, b) => a.factId < b.factId ? -1 : a.factId > b.factId ? 1 : 0);
}

export function activateCharacterOutroTransfers(params: {
  readonly factId: string;
  readonly event: OutgoingSwitchEvent;
}): readonly IncomingTransferWindow[] {
  const fact = CHARACTER_MECHANIC_FACTS.find((row) => row.factId === params.factId);
  const contract = fact && resolveCharacterOutroTransferContract(fact);
  if (!contract) throw new Error(`${params.factId}: unsupported canonical Outro transfer`);
  const expiresAt = params.event.atSeconds + contract.durationSeconds;
  if (!Number.isFinite(expiresAt) || expiresAt <= params.event.atSeconds) throw new Error('Outro expiration is not representable');
  return contract.amplifications.flatMap((term) => {
    const window = createIncomingTransferWindow({
      adapterId: CHARACTER_OUTRO_TRANSFER_ADAPTER_ID,
      sourceLayer: 'CHARACTER', sourceId: contract.factId,
      effectId: `${contract.factId}:${term.statOrEffect}`, sourceActorId: contract.characterId,
      statOrEffect: term.statOrEffect, value: term.value, durationSeconds: contract.durationSeconds,
      requiresIncomingIntro: false, endsOnIncomingSwitchOut: true,
    }, params.event);
    return window ? [window] : [];
  });
}

/** Explicit history is mandatory; independent terms are not combined into DPS. */
export function activeCharacterOutroAmplifications(
  windows: readonly IncomingTransferWindow[], actorId: string, atSeconds: number,
  switchOutEvents: readonly ResonatorSwitchOutEvent[],
): readonly IncomingTransferWindow[] {
  if (!Array.isArray(switchOutEvents)) throw new Error('Outro query requires explicit recipient switch-out history');
  for (const window of windows) {
    if (window.adapterId !== CHARACTER_OUTRO_TRANSFER_ADAPTER_ID || window.sourceLayer !== 'CHARACTER') {
      throw new Error('Outro query requires a Character Outro transfer window');
    }
  }
  return windows.filter((window) => isIncomingTransferWindowActive(window, actorId, atSeconds, switchOutEvents));
}
