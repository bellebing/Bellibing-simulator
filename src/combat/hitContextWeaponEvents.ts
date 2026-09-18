import { getWeaponEffect } from '../effectRegistry.ts';
import { activateWeaponCastWindow, isWeaponCastWindowActive, type WeaponCastEvent } from './weaponCastWindowAdapter.ts';
import { activateWeaponCooldownCastWindow, isWeaponCooldownCastWindowActive,
  type CooldownCastWindowEffectId } from './weaponCooldownCastWindowAdapter.ts';
import { activateWeaponDamageWindow, isWeaponDamageWindowActive, type QualifiedWeaponDamageEvent } from './weaponDamageWindowAdapter.ts';
import { activateWeaponHealingWindow, isWeaponHealingWindowActive } from './weaponHealingWindowAdapter.ts';
import { activateWeaponTargetWindow, isWeaponTargetWindowActive, type WeaponTargetHitEvent } from './weaponTargetWindowAdapter.ts';
import { activateWeaponStatusApplicationWindow, isWeaponStatusApplicationWindowActive,
  type QualifiedAeroErosionApplicationEvent } from './weaponStatusApplicationWindowAdapter.ts';
import type { ExplicitPreAttackTarget } from './sonataTargetWindowAdapter.ts';
import type { QualifiedAllyHealEvent } from './sharedSupportStatWindows.ts';
import { CHARACTER_CATALOG } from '../data/characters.ts';
import { activateFreezeFrameGlacioChafeWindows, isFreezeFrameGlacioChafeWindowActive,
  type QualifiedGlacioChafeApplicationEvent } from './freezeFrameGlacioChafeWindowAdapter.ts';

export interface ProvenHitWeaponCooldownCast {
  readonly effectId: CooldownCastWindowEffectId;
  readonly evidenceId: string;
  readonly event: WeaponCastEvent;
  readonly sourceQualification: 'SOURCE_PROVEN_CAST';
  readonly equipmentAtEventQualified: true;
  readonly cooldownReadyAtEventQualified: true;
  readonly cooldownReadyAtSeconds: number;
  readonly priorActivationState: 'NONE_ACTIVE';
  readonly noLaterActivationThroughHit: true;
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
}
export interface ProvenHitWeaponCast {
  readonly effectId: string;
  readonly evidenceId: string;
  readonly event: WeaponCastEvent;
  readonly sourceQualification: 'SOURCE_PROVEN_CAST';
  readonly equipmentAtEventQualified: true;
  /** This bridge supports one isolated activation, never a guessed refresh. */
  readonly priorActivationState: 'NONE_ACTIVE';
  readonly noLaterActivationThroughHit: true;
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
}
export interface ProvenHitWeaponStatusApplication {
  readonly effectId: 'WA-AERO';
  readonly evidenceId: string;
  readonly event: QualifiedAeroErosionApplicationEvent;
  readonly equipmentAtEventQualified: true;
  readonly priorActivationState: 'NONE_ACTIVE';
  readonly noLaterActivationThroughHit: true;
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
}
export interface ProvenHitFreezeFrameApplication {
  readonly evidenceId: string;
  readonly event: QualifiedGlacioChafeApplicationEvent;
  readonly teamMemberIds: readonly string[];
  readonly equipmentAtEventQualified: true;
  readonly priorActivationState: 'NONE_ACTIVE';
  readonly noLaterActivationThroughHit: true;
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
}
export interface ProvenHitWeaponTarget {
  readonly effectId: 'WA-AERO-RES';
  readonly evidenceId: string;
  readonly event: WeaponTargetHitEvent;
  readonly target: ExplicitPreAttackTarget;
  readonly equipmentAtEventQualified: true;
  readonly priorActivationState: 'NONE_ACTIVE';
  readonly noLaterActivationThroughHit: true;
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
}
export interface ProvenHitWeaponHeal {
  readonly effectId: string;
  readonly evidenceId: string;
  readonly event: QualifiedAllyHealEvent;
  readonly teamMemberIds: readonly string[];
  readonly sourceQualification: 'SOURCE_PROVEN_HEAL';
  readonly equipmentAtEventQualified: true;
  /** The existing window models one source-qualified heal activation only. */
  readonly priorActivationState: 'NONE_ACTIVE';
  readonly noLaterActivationThroughHit: true;
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
}
export interface HitContextWeaponEvents {
  readonly echoStatKey: string;
  readonly weapon: { readonly id: string; readonly rank: number };
  readonly eventContextId: string;
  readonly evidenceId: string;
  readonly casts: readonly ProvenHitWeaponCast[];
  readonly cooldownCasts?: readonly ProvenHitWeaponCooldownCast[];
  readonly damages?: readonly (Omit<ProvenHitWeaponCast, 'event' | 'sourceQualification'> & { readonly event: QualifiedWeaponDamageEvent })[];
  readonly statusApplications?: readonly ProvenHitWeaponStatusApplication[];
  readonly freezeFrameApplications?: readonly ProvenHitFreezeFrameApplication[];
  readonly targets?: readonly ProvenHitWeaponTarget[];
  readonly heals?: readonly ProvenHitWeaponHeal[];
}
const text = (x: unknown): x is string => typeof x === 'string' && x.trim().length > 0;

/** Reuse the existing source-contract validators and timed windows. This is a
 * context consumer, not an event generator, refresh model or profile engine. */
export function evaluateHitContextWeaponEvents(input: {
  readonly characterId: string;
  readonly weapon: { readonly id: string; readonly rank: number };
  readonly hitAtSeconds: number;
  readonly eventContextId: string;
  readonly echoStatKey: string;
  readonly proof: HitContextWeaponEvents;
}) {
  const { proof } = input;
  if (!Number.isFinite(input.hitAtSeconds) || input.hitAtSeconds < 0
    || !proof || proof.echoStatKey !== input.echoStatKey || proof.eventContextId !== input.eventContextId
    || proof.weapon?.id !== input.weapon.id || proof.weapon.rank !== input.weapon.rank
    || !text(proof.evidenceId) || !Array.isArray(proof.casts)
    || (proof.cooldownCasts !== undefined && !Array.isArray(proof.cooldownCasts))
    || (proof.damages !== undefined && !Array.isArray(proof.damages))
    || (proof.statusApplications !== undefined && !Array.isArray(proof.statusApplications))
    || (proof.freezeFrameApplications !== undefined && !Array.isArray(proof.freezeFrameApplications))
    || (proof.targets !== undefined && !Array.isArray(proof.targets))
    || (proof.heals !== undefined && !Array.isArray(proof.heals))) {
    throw new Error('Require exact per-build event proof, hit query time and unique effect activations');
  }
  const all = [...proof.casts, ...(proof.cooldownCasts ?? []), ...(proof.damages ?? []), ...(proof.statusApplications ?? []),
    ...(proof.targets ?? []), ...(proof.heals ?? [])];
  if (new Set(all.map(c => c.effectId)).size !== all.length) throw new Error('Require unique effect activations across event families');
  if ((proof.freezeFrameApplications ?? []).length > 1) {
    throw new Error('Freeze Frame same-name refresh/stacking is unreviewed; require one isolated application');
  }
  if ((proof.freezeFrameApplications ?? []).length
    && all.some(c => c.effectId === 'FF-GLACIO' || c.effectId === 'FF-TEAM-ATK')) {
    throw new Error('Freeze Frame paired application cannot be duplicated through another event family');
  }
  const cooldownCasts = (proof.cooldownCasts ?? []).map(c => {
    const effect = getWeaponEffect(c.effectId);
    if (!effect || effect.weaponId !== input.weapon.id || effect.valueUnit !== 'DECIMAL_MULTIPLIER'
      || !text(c.evidenceId) || c.sourceQualification !== 'SOURCE_PROVEN_CAST'
      || c.equipmentAtEventQualified !== true || c.cooldownReadyAtEventQualified !== true
      || !Number.isFinite(c.cooldownReadyAtSeconds) || c.cooldownReadyAtSeconds < 0
      || c.priorActivationState !== 'NONE_ACTIVE' || c.noLaterActivationThroughHit !== true
      || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(c.sameTimestampOrder)
      || !c.event || c.event.actorId !== input.characterId || input.hitAtSeconds < c.event.atSeconds) {
      throw new Error('Require exact weapon/owner, proven cast/cooldown readiness, isolated activation and explicit query ordering');
    }
    const window = activateWeaponCooldownCastWindow({
      effectId: c.effectId,
      selectedWeapon: input.weapon,
      wielderId: input.characterId,
      event: c.event,
      cooldownReadyAtSeconds: c.cooldownReadyAtSeconds,
    });
    if (!window) throw new Error('The supplied cast/cooldown state does not activate this canonical weapon effect');
    const active = isWeaponCooldownCastWindowActive(window, {
      actorId: input.characterId,
      atSeconds: input.hitAtSeconds,
      sameTimestampOrder: c.sameTimestampOrder,
    });
    return {
      sourceId: `weapon:${c.effectId}`,
      stat: window.statOrEffect,
      value: active ? window.value : 0,
      status: 'EVENT_QUALIFIED_ASSEMBLED' as const,
      active,
      evidenceId: c.evidenceId,
      magnitudeDependsOnEchoStats: false as const,
      activationProof: 'PER_BUILD_EXPLICIT_CAST_AND_COOLDOWN_STATE' as const,
      sourceKey: JSON.stringify(effect),
      cooldownReadyAtSeconds: c.cooldownReadyAtSeconds,
      nextCooldownReadyAtSeconds: window.nextCooldownReadyAtSeconds,
      window: { ...window },
    };
  });
  const casts = proof.casts.map(c => {
    const effect = getWeaponEffect(c.effectId);
    if (!effect || effect.weaponId !== input.weapon.id || effect.valueUnit !== 'DECIMAL_MULTIPLIER'
      || !text(c.evidenceId) || c.sourceQualification !== 'SOURCE_PROVEN_CAST'
      || c.equipmentAtEventQualified !== true || c.priorActivationState !== 'NONE_ACTIVE'
      || c.noLaterActivationThroughHit !== true
      || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(c.sameTimestampOrder)
      || !c.event || c.event.actorId !== input.characterId || input.hitAtSeconds < c.event.atSeconds) {
      throw new Error('Require exact weapon/owner, proven cast, isolated activation and explicit query ordering');
    }
    const window = activateWeaponCastWindow({ effectId: c.effectId, rank: input.weapon.rank as 1 | 2 | 3 | 4 | 5,
      wielderId: input.characterId, event: c.event });
    if (!window) throw new Error('The supplied event does not activate this canonical weapon effect');
    const active = isWeaponCastWindowActive(window, input.hitAtSeconds)
      && !(input.hitAtSeconds === window.startedAtSeconds && c.sameTimestampOrder === 'BEFORE_TRIGGER');
    return { sourceId: `weapon:${c.effectId}`, stat: window.statOrEffect, value: active ? window.value : 0,
      status: 'EVENT_QUALIFIED_ASSEMBLED' as const, active, evidenceId: c.evidenceId,
      magnitudeDependsOnEchoStats: false as const, activationProof: 'PER_BUILD_EXPLICIT_EVENT' as const,
      // Source signature invalidates downstream proof if the reviewed effect changes.
      sourceKey: JSON.stringify(effect), window: { ...window } };
  });
  const damages = (proof.damages ?? []).map(c => {
    const effect = getWeaponEffect(c.effectId);
    if (!effect || effect.weaponId !== input.weapon.id || !text(c.evidenceId)
      || c.equipmentAtEventQualified !== true || c.priorActivationState !== 'NONE_ACTIVE'
      || c.noLaterActivationThroughHit !== true || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(c.sameTimestampOrder)
      || !c.event || c.event.actorId !== input.characterId || input.hitAtSeconds < c.event.atSeconds) {
      throw new Error('Require exact weapon/owner, proven damage, isolated activation and explicit query ordering');
    }
    const window = activateWeaponDamageWindow({ effectId: c.effectId, selectedWeapon: input.weapon,
      wielderId: input.characterId, event: c.event });
    if (!window) throw new Error('The supplied damage event does not activate this canonical weapon effect');
    const active = isWeaponDamageWindowActive(window, { actorId: input.characterId, atSeconds: input.hitAtSeconds,
      sameTimestampOrder: c.sameTimestampOrder });
    return { sourceId: `weapon:${c.effectId}`, stat: window.statOrEffect, value: active ? window.value : 0,
      status: 'EVENT_QUALIFIED_ASSEMBLED' as const, active, evidenceId: c.evidenceId,
      magnitudeDependsOnEchoStats: false as const, activationProof: 'PER_BUILD_EXPLICIT_EVENT' as const,
      sourceKey: JSON.stringify(effect), window: { ...window } };
  });
  const statusApplications = (proof.statusApplications ?? []).map(c => {
    const effect = getWeaponEffect(c.effectId);
    if (!effect || effect.weaponId !== input.weapon.id || !text(c.evidenceId)
      || c.equipmentAtEventQualified !== true || c.priorActivationState !== 'NONE_ACTIVE'
      || c.noLaterActivationThroughHit !== true || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(c.sameTimestampOrder)
      || !c.event || c.event.actorId !== input.characterId || input.hitAtSeconds < c.event.atSeconds) {
      throw new Error('Require exact weapon/owner, source-qualified status application, isolated activation and explicit query ordering');
    }
    const window = activateWeaponStatusApplicationWindow({
      effectId: c.effectId,
      selectedWeapon: input.weapon,
      wielderId: input.characterId,
      event: c.event,
    });
    if (!window) throw new Error('The supplied status application does not activate this canonical weapon effect');
    const active = isWeaponStatusApplicationWindowActive(window, {
      actorId: input.characterId,
      atSeconds: input.hitAtSeconds,
      sameTimestampOrder: c.sameTimestampOrder,
    });
    return {
      sourceId: `weapon:${c.effectId}`,
      stat: window.statOrEffect,
      value: active ? window.value : 0,
      status: 'EVENT_QUALIFIED_ASSEMBLED' as const,
      active,
      evidenceId: c.evidenceId,
      magnitudeDependsOnEchoStats: false as const,
      activationProof: 'PER_BUILD_EXPLICIT_STATUS_APPLICATION' as const,
      sourceKey: JSON.stringify(effect),
      sourceFactId: c.event.sourceFactId,
      triggerTargetId: c.event.targetId,
      appliedStacks: c.event.stacksApplied,
      window: { ...window },
    };
  });
  const freezeFrame = (proof.freezeFrameApplications ?? []).flatMap(c => {
    const selfEffect = getWeaponEffect('FF-GLACIO');
    const teamEffect = getWeaponEffect('FF-TEAM-ATK');
    const releasedTeam = Array.isArray(c.teamMemberIds) && c.teamMemberIds.length > 0
      && new Set(c.teamMemberIds).size === c.teamMemberIds.length
      && c.teamMemberIds.every(id => CHARACTER_CATALOG.some(character =>
        character.id === id && character.releaseStatus === 'RELEASED'));
    if (!selfEffect || !teamEffect || selfEffect.weaponId !== input.weapon.id || teamEffect.weaponId !== input.weapon.id
      || !text(c.evidenceId) || c.equipmentAtEventQualified !== true || c.priorActivationState !== 'NONE_ACTIVE'
      || c.noLaterActivationThroughHit !== true || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(c.sameTimestampOrder)
      || !releasedTeam || !c.teamMemberIds.includes(input.characterId)
      || !c.event || c.event.actorId !== input.characterId || input.hitAtSeconds < c.event.atSeconds) {
      throw new Error('Require exact Freeze Frame owner/equipment, selected team, Glacio Chafe application and isolated query ordering');
    }
    const windows = activateFreezeFrameGlacioChafeWindows({
      selectedWeapon: input.weapon,
      wielderId: input.characterId,
      teamMemberIds: c.teamMemberIds,
      event: c.event,
    });
    if (!windows) throw new Error('The supplied Glacio Chafe application does not activate Freeze Frame');
    return [windows.selfGlacio, windows.teamAtk].map(window => {
      const active = isFreezeFrameGlacioChafeWindowActive(window, {
        actorId: input.characterId,
        atSeconds: input.hitAtSeconds,
        sameTimestampOrder: c.sameTimestampOrder,
      });
      const effect = window.effectId === 'FF-GLACIO' ? selfEffect : teamEffect;
      return {
        sourceId: `weapon:${window.effectId}`,
        stat: window.statOrEffect,
        value: active ? window.value : 0,
        status: 'EVENT_QUALIFIED_ASSEMBLED' as const,
        active,
        evidenceId: c.evidenceId,
        magnitudeDependsOnEchoStats: false as const,
        activationProof: 'PER_BUILD_EXPLICIT_GLACIO_CHAFE_APPLICATION' as const,
        sourceKey: JSON.stringify(effect),
        triggerTargetId: c.event.targetId,
        sourceFactId: c.event.sourceFactId,
        appliedStacks: c.event.stacksApplied,
        window: { ...window },
      };
    });
  });
  const targets = (proof.targets ?? []).map(c => {
    const effect = getWeaponEffect(c.effectId);
    if (!effect || effect.weaponId !== input.weapon.id || !text(c.evidenceId)
      || c.equipmentAtEventQualified !== true || c.priorActivationState !== 'NONE_ACTIVE'
      || c.noLaterActivationThroughHit !== true || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(c.sameTimestampOrder)
      || !c.event || c.event.actorId !== input.characterId || input.hitAtSeconds < c.event.atSeconds
      || !c.target) {
      throw new Error('Require exact weapon/owner, proven target hit/state, isolated activation and explicit query ordering');
    }
    const window = activateWeaponTargetWindow({
      effectId: c.effectId,
      selectedWeapon: input.weapon,
      wielderId: input.characterId,
      event: c.event,
      target: c.target,
    });
    if (!window) throw new Error('The supplied target hit/state does not activate this canonical weapon effect');
    const active = isWeaponTargetWindowActive(window, {
      actorId: input.characterId,
      targetId: window.targetId,
      atSeconds: input.hitAtSeconds,
      sameTimestampOrder: c.sameTimestampOrder,
    });
    return {
      sourceId: `weapon:${c.effectId}`,
      stat: window.statOrEffect,
      value: active ? window.value : 0,
      status: 'EVENT_QUALIFIED_ASSEMBLED' as const,
      active,
      evidenceId: c.evidenceId,
      magnitudeDependsOnEchoStats: false as const,
      activationProof: 'PER_BUILD_EXPLICIT_TARGET_EVENT' as const,
      sourceKey: JSON.stringify(effect),
      targetProof: structuredClone(c.target),
      sourceFactId: c.event.sourceFactId,
      window: { ...window },
    };
  });
  const heals = (proof.heals ?? []).map(c => {
    const effect = getWeaponEffect(c.effectId);
    if (!effect || effect.weaponId !== input.weapon.id || effect.valueUnit !== 'DECIMAL_MULTIPLIER'
      || !text(c.evidenceId) || c.sourceQualification !== 'SOURCE_PROVEN_HEAL'
      || c.equipmentAtEventQualified !== true || c.priorActivationState !== 'NONE_ACTIVE'
      || c.noLaterActivationThroughHit !== true || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(c.sameTimestampOrder)
      || !c.event || c.event.healerId !== input.characterId || input.hitAtSeconds < c.event.atSeconds
      || !Array.isArray(c.teamMemberIds)) {
      throw new Error('Require exact weapon/healer/team, proven applied heal, isolated activation and explicit query ordering');
    }
    const window = activateWeaponHealingWindow({ effectId: c.effectId, selectedWeapon: input.weapon,
      wielderId: input.characterId, teamMemberIds: c.teamMemberIds, event: c.event });
    if (!window) throw new Error('The supplied heal event does not activate this canonical weapon effect');
    const active = isWeaponHealingWindowActive(window, { actorId: input.characterId, atSeconds: input.hitAtSeconds,
      sameTimestampOrder: c.sameTimestampOrder });
    return { sourceId: `weapon:${c.effectId}`, stat: window.statOrEffect, value: active ? window.value : 0,
      status: 'EVENT_QUALIFIED_ASSEMBLED' as const, active, evidenceId: c.evidenceId,
      magnitudeDependsOnEchoStats: false as const, activationProof: 'PER_BUILD_EXPLICIT_EVENT' as const,
      sourceKey: JSON.stringify(effect), window: { ...window } };
  });
  return [...casts, ...cooldownCasts, ...damages, ...statusApplications, ...freezeFrame, ...targets, ...heals];
}
