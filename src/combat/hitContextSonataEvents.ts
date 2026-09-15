import { SONATA_EFFECT_MODELS } from '../data/sonataEffects.ts';
import { activateSonataCastWindow, isSonataCastWindowActive, type SonataCastEvent } from './sonataCastWindowAdapter.ts';
import type { ProvenHitWeaponCast } from './hitContextWeaponEvents.ts';

export interface HitContextSonataEvents {
  readonly echoStatKey: string;
  /** Exact ordered species/set/main-slot evidence from this build's selection. */
  readonly equipmentKey: string;
  readonly eventContextId: string;
  readonly evidenceId: string;
  readonly casts: readonly (Omit<ProvenHitWeaponCast, 'event'> & { readonly event: SonataCastEvent })[];
}
const text = (x: unknown): x is string => typeof x === 'string' && x.trim().length > 0;

/** The existing primitive owns cast semantics. The consumer supplies actual
 * equipped piece counts, per-build evidence and an isolated activation query. */
export function evaluateHitContextSonataCasts(input: {
  readonly characterId: string;
  readonly hitAtSeconds: number;
  readonly eventContextId: string;
  readonly echoStatKey: string;
  readonly equipmentKey: string;
  readonly pieceCounts: ReadonlyMap<string, number>;
  readonly proof: HitContextSonataEvents;
}) {
  const { proof } = input;
  if (!Number.isFinite(input.hitAtSeconds) || input.hitAtSeconds < 0
    || !proof || proof.echoStatKey !== input.echoStatKey || proof.equipmentKey !== input.equipmentKey
    || proof.eventContextId !== input.eventContextId || !text(proof.evidenceId) || !Array.isArray(proof.casts)
    || new Set(proof.casts.map(c => c.effectId)).size !== proof.casts.length) {
    throw new Error('Require exact per-build Sonata event/equipment proof, query time and unique activations');
  }
  return proof.casts.map(c => {
    const rows = SONATA_EFFECT_MODELS.filter(e => e.effectId === c.effectId);
    const effect = rows[0];
    if (rows.length !== 1 || (input.pieceCounts.get(effect.sonataSetId) ?? 0) < effect.pieces
      || !text(c.evidenceId) || c.sourceQualification !== 'SOURCE_PROVEN_CAST'
      || c.equipmentAtEventQualified !== true || c.priorActivationState !== 'NONE_ACTIVE'
      || c.noLaterActivationThroughHit !== true || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(c.sameTimestampOrder)
      || !c.event || c.event.actorId !== input.characterId || input.hitAtSeconds < c.event.atSeconds) {
      throw new Error('Require exact equipped Sonata pieces/owner, proven cast and isolated query ordering');
    }
    const window = activateSonataCastWindow({ effectId: c.effectId, ownerId: input.characterId, event: c.event });
    if (!window) throw new Error('The supplied event does not activate this canonical Sonata effect');
    const active = isSonataCastWindowActive(window, input.hitAtSeconds)
      && !(input.hitAtSeconds === window.startedAtSeconds && c.sameTimestampOrder === 'BEFORE_TRIGGER');
    return { sourceId: `sonata:${c.effectId}`, stat: window.statOrEffect, value: active ? window.value : 0,
      status: 'EVENT_QUALIFIED_ASSEMBLED' as const, active, evidenceId: c.evidenceId,
      magnitudeDependsOnEchoStats: false as const, activationProof: 'PER_BUILD_EXPLICIT_EVENT' as const,
      sourceKey: JSON.stringify(effect), window: { ...window } };
  });
}
