import { SONATA_EFFECT_MODELS } from '../data/sonataEffects.ts';
import { CHARACTER_CATALOG } from '../data/characters.ts';
import { activateSonataOutroTransfer, listSonataOutroTransferSupport } from './sonataOutroTransferAdapter.ts';
import { isIncomingTransferWindowActive, type OutgoingSwitchEvent } from './incomingTransferState.ts';

export interface ProvenHitSonataOutroTransfer {
  readonly effectId: 'S08_5PC_INCOMING_ATK' | 'S12_5PC_INCOMING_HAVOC';
  readonly evidenceId: string;
  readonly sourceWielderId: string;
  readonly sourceEquipmentEvidenceId: string;
  readonly sourceSonataSetId: string;
  readonly sourcePieces: 5;
  readonly sourceQualification: 'SOURCE_PROVEN_OUTRO_TRANSFER';
  readonly sourceEquipmentAtEventQualified: true;
  readonly event: OutgoingSwitchEvent;
  /** This hit bridge consumes one isolated activation; refresh/overlap remains caller-owned. */
  readonly priorActivationState: 'NONE_ACTIVE';
  readonly noLaterActivationThroughHit: true;
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
}

export interface HitContextIncomingTransfers {
  readonly echoStatKey: string;
  readonly eventContextId: string;
  readonly evidenceId: string;
  readonly sonataOutros: readonly ProvenHitSonataOutroTransfer[];
}

const text = (x: unknown): x is string => typeof x === 'string' && x.trim().length > 0;

/**
 * Cross-owner transfer evidence is intentionally separate from the selected
 * Character's own Sonata equipment. The caller must prove the source member's
 * exact 5-piece qualification and the actual Outro -> incoming event per build.
 */
export function evaluateHitContextIncomingTransfers(input: {
  readonly characterId: string;
  readonly hitAtSeconds: number;
  readonly eventContextId: string;
  readonly echoStatKey: string;
  readonly proof: HitContextIncomingTransfers;
}) {
  const { proof } = input;
  if (!Number.isFinite(input.hitAtSeconds) || input.hitAtSeconds < 0
    || !proof || proof.echoStatKey !== input.echoStatKey || proof.eventContextId !== input.eventContextId
    || !text(proof.evidenceId) || !Array.isArray(proof.sonataOutros)) {
    throw new Error('Require exact per-build incoming-transfer proof and hit query');
  }
  if (new Set(proof.sonataOutros.map(row => row.effectId)).size !== proof.sonataOutros.length) {
    throw new Error('Require one isolated activation per incoming Sonata effect; duplicate stacking is unreviewed');
  }

  const support = listSonataOutroTransferSupport();
  return proof.sonataOutros.map(row => {
    const contract = support.find(item => item.effectId === row.effectId);
    const effects = SONATA_EFFECT_MODELS.filter(effect => effect.effectId === row.effectId);
    const effect = effects[0];
    const sourceCharacter = CHARACTER_CATALOG.find(character => character.id === row.sourceWielderId);
    if (!contract || effects.length !== 1 || contract.pieces !== 5
      || !sourceCharacter || sourceCharacter.releaseStatus !== 'RELEASED'
      || row.sourceSonataSetId !== contract.sonataSetId || row.sourcePieces !== contract.pieces
      || !text(row.evidenceId) || !text(row.sourceWielderId) || !text(row.sourceEquipmentEvidenceId)
      || row.sourceQualification !== 'SOURCE_PROVEN_OUTRO_TRANSFER'
      || row.sourceEquipmentAtEventQualified !== true || row.priorActivationState !== 'NONE_ACTIVE'
      || row.noLaterActivationThroughHit !== true || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(row.sameTimestampOrder)
      || !row.event || row.event.actorId !== row.sourceWielderId
      || row.event.incomingResonatorId !== input.characterId || input.hitAtSeconds < row.event.atSeconds) {
      throw new Error('Require exact source 5-piece Sonata owner/equipment, Outro recipient and isolated query ordering');
    }
    const window = activateSonataOutroTransfer({
      effectId: row.effectId, wielderId: row.sourceWielderId, event: row.event,
    });
    if (!window) throw new Error('The supplied Outro event does not activate this canonical Sonata transfer');
    const active = isIncomingTransferWindowActive(window, input.characterId, input.hitAtSeconds)
      && !(input.hitAtSeconds === window.startedAtSeconds && row.sameTimestampOrder === 'BEFORE_TRIGGER');
    return {
      sourceId: `team:sonata:${row.effectId}:${row.sourceWielderId}`,
      canonicalEffectId: row.effectId,
      stat: window.statOrEffect,
      value: active ? window.value : 0,
      status: 'EVENT_QUALIFIED_ASSEMBLED' as const,
      active,
      evidenceId: row.evidenceId,
      sourceEquipmentEvidenceId: row.sourceEquipmentEvidenceId,
      magnitudeDependsOnEchoStats: false as const,
      activationProof: 'PER_BUILD_EXPLICIT_TRANSFER' as const,
      sourceKey: JSON.stringify(effect),
      window: { ...window },
    };
  });
}
