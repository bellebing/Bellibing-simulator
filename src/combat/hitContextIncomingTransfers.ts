import { SONATA_EFFECT_MODELS } from '../data/sonataEffects.ts';
import { ECHO_EFFECT_MODELS } from '../data/echoEffects.ts';
import { ECHO_CATALOG } from '../data/echoes.ts';
import { WEAPON_CATALOG } from '../data/weapons.ts';
import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import { CHARACTER_CATALOG } from '../data/characters.ts';
import { activateSonataOutroTransfer, listSonataOutroTransferSupport } from './sonataOutroTransferAdapter.ts';
import { activateEchoTransferWindow, listEchoTransferWindowSupport, type EchoTransferArmEvent } from './echoTransferWindowAdapter.ts';
import { activateStaticMistOutroTransfer, listStaticMistOutroTransferSupport,
  activateSharedRejuvenatingGlowWindow, isSharedHealingTeamWindowActive, listSharedRejuvenatingGlowSupport,
  type QualifiedAllyHealEvent } from './sharedSupportStatWindows.ts';
import { isIncomingTransferWindowActive, type OutgoingSwitchEvent } from './incomingTransferState.ts';
import { activateStellarSymphonyTeamAtkWindow, isShorekeeperHealingSupportWindowActive,
  listStellarSymphonyTeamAtkSupport, type ShorekeeperHealingSkillCastEvent } from './shorekeeperHealingSupportWindowAdapter.ts';
import { activateFallacySupportWindows, isFallacySupportWindowActive, listFallacyTeamAtkSupport,
  type FallacyEchoCastEvent } from './fallacySupportWindowAdapter.ts';
import { activateFreezeFrameGlacioChafeWindows, isFreezeFrameGlacioChafeWindowActive,
  listFreezeFrameGlacioChafeWindowSupport, type QualifiedGlacioChafeApplicationEvent } from './freezeFrameGlacioChafeWindowAdapter.ts';

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

export interface ProvenHitFallacyTeamWindow {
  readonly effectId: 'FALLACY_TEAM_ATK';
  readonly evidenceId: string;
  readonly sourceWielderId: string;
  readonly sourceEquipmentEvidenceId: string;
  readonly sourceMainEchoId: 'echo-60000605';
  readonly sourceQualification: 'SOURCE_PROVEN_FALLACY_CAST';
  readonly sourceMainSlotAtEventQualified: true;
  readonly teamMemberIds: readonly string[];
  readonly event: FallacyEchoCastEvent;
  readonly priorActivationState: 'NONE_ACTIVE';
  readonly noLaterActivationThroughHit: true;
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
}

export interface ProvenHitFreezeFrameTeamWindow {
  readonly effectId: 'FF-TEAM-ATK';
  readonly evidenceId: string;
  readonly sourceWielderId: string;
  readonly sourceEquipmentEvidenceId: string;
  readonly sourceWeaponId: 'freeze-frame';
  readonly sourceWeaponRank: 1 | 2 | 3 | 4 | 5;
  readonly sourceQualification: 'SOURCE_PROVEN_GLACIO_CHAFE_APPLICATION';
  readonly sourceEquipmentAtEventQualified: true;
  readonly teamMemberIds: readonly string[];
  readonly event: QualifiedGlacioChafeApplicationEvent;
  readonly priorActivationState: 'NONE_ACTIVE';
  readonly noLaterActivationThroughHit: true;
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
}

export interface ProvenHitStellarSymphonyTeamWindow {
  readonly effectId: 'SSY-TEAM-ATK';
  readonly evidenceId: string;
  readonly sourceWielderId: 'the-shorekeeper';
  readonly sourceEquipmentEvidenceId: string;
  readonly sourceWeaponId: 'stellar-symphony';
  readonly sourceWeaponRank: 1 | 2 | 3 | 4 | 5;
  readonly sourceQualification: 'SOURCE_PROVEN_HEALING_SKILL_CAST';
  readonly sourceEquipmentAtEventQualified: true;
  readonly teamMemberIds: readonly string[];
  readonly event: ShorekeeperHealingSkillCastEvent;
  readonly priorActivationState: 'NONE_ACTIVE';
  readonly noLaterActivationThroughHit: true;
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
}

export interface ProvenHitRejuvenatingGlowTeamWindow {
  readonly effectId: 'REJUV_ATK';
  readonly evidenceId: string;
  readonly sourceWielderId: string;
  readonly sourceEquipmentEvidenceId: string;
  readonly sourceSonataSetId: 'sonata-7';
  readonly sourcePieces: 5;
  readonly sourceQualification: 'SOURCE_PROVEN_HEAL';
  readonly sourceEquipmentAtEventQualified: true;
  readonly teamMemberIds: readonly string[];
  readonly event: QualifiedAllyHealEvent;
  readonly priorActivationState: 'NONE_ACTIVE';
  readonly noLaterActivationThroughHit: true;
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
}

export interface ProvenHitWeaponOutroTransfer {
  readonly effectId: 'STM-NEXT-ATK';
  readonly evidenceId: string;
  readonly sourceWielderId: string;
  readonly sourceEquipmentEvidenceId: string;
  readonly sourceWeaponId: 'static-mist';
  readonly sourceWeaponRank: 1 | 2 | 3 | 4 | 5;
  readonly sourceQualification: 'SOURCE_PROVEN_WEAPON_OUTRO_TRANSFER';
  readonly sourceEquipmentAtEventQualified: true;
  readonly event: OutgoingSwitchEvent;
  readonly priorActivationState: 'NONE_ACTIVE';
  readonly noLaterActivationThroughHit: true;
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
}

export interface ProvenHitEchoTransfer {
  readonly effectId:
    | 'VOIDWING_MOTH_INCOMING_ATK'
    | 'REMINISCENCE_DENIA_INCOMING_FUSION'
    | 'HYVATIA_INCOMING_ALL_ATTRIBUTE';
  readonly evidenceId: string;
  readonly sourceWielderId: string;
  readonly sourceEquipmentEvidenceId: string;
  readonly sourceMainEchoId: string;
  /** Explicitly 5 only where the reviewed source contract is Rank-5-specific; otherwise null. */
  readonly sourceEchoRank: number | null;
  readonly sourceQualification: 'SOURCE_PROVEN_ECHO_TRANSFER';
  readonly sourceMainSlotAtArmQualified: true;
  readonly armEvent: EchoTransferArmEvent;
  readonly outroEvent: OutgoingSwitchEvent;
  /** Bridge-level isolated activation; refresh/overlap is not inferred. */
  readonly priorActivationState: 'NONE_ACTIVE';
  readonly noLaterActivationThroughHit: true;
  /** Tied arm/Outro timestamps require explicit Echo-before-Outro proof. */
  readonly sameTimestampArmOrder: 'NOT_TIED' | 'ECHO_BEFORE_OUTRO';
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
}

export interface HitContextIncomingTransfers {
  readonly echoStatKey: string;
  readonly eventContextId: string;
  readonly evidenceId: string;
  readonly sonataOutros: readonly ProvenHitSonataOutroTransfer[];
  readonly teamEchoCasts?: readonly ProvenHitFallacyTeamWindow[];
  readonly teamWeaponStatusApplications?: readonly ProvenHitFreezeFrameTeamWindow[];
  readonly teamWeaponCasts?: readonly ProvenHitStellarSymphonyTeamWindow[];
  readonly teamHeals?: readonly ProvenHitRejuvenatingGlowTeamWindow[];
  readonly weaponOutros?: readonly ProvenHitWeaponOutroTransfer[];
  readonly echoTransfers?: readonly ProvenHitEchoTransfer[];
}

const text = (x: unknown): x is string => typeof x === 'string' && x.trim().length > 0;
const releasedCharacter = (id: string) => CHARACTER_CATALOG.find(character =>
  character.id === id && character.releaseStatus === 'RELEASED');
const releasedEcho = (id: string) => ECHO_CATALOG.find(echo =>
  echo.id === id && echo.releaseStatus === 'RELEASED');
const releasedWeapon = (id: string) => WEAPON_CATALOG.find(weapon =>
  weapon.id === id && weapon.releaseStatus === 'RELEASED' && weapon.verificationStatus === 'VERIFIED');

/**
 * Cross-owner transfer evidence is intentionally separate from the selected
 * Character's own equipment. The caller must prove the source member's exact
 * source gear plus the actual transfer event(s) independently for each build.
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
    || !text(proof.evidenceId) || !Array.isArray(proof.sonataOutros)
    || (proof.teamEchoCasts !== undefined && !Array.isArray(proof.teamEchoCasts))
    || (proof.teamWeaponStatusApplications !== undefined && !Array.isArray(proof.teamWeaponStatusApplications))
    || (proof.teamWeaponCasts !== undefined && !Array.isArray(proof.teamWeaponCasts))
    || (proof.teamHeals !== undefined && !Array.isArray(proof.teamHeals))
    || (proof.weaponOutros !== undefined && !Array.isArray(proof.weaponOutros))
    || (proof.echoTransfers !== undefined && !Array.isArray(proof.echoTransfers))) {
    throw new Error('Require exact per-build incoming-transfer proof and hit query');
  }
  if (new Set(proof.sonataOutros.map(row => row.effectId)).size !== proof.sonataOutros.length) {
    throw new Error('Require one isolated activation per incoming Sonata effect; duplicate stacking is unreviewed');
  }
  if (new Set((proof.teamEchoCasts ?? []).map(row => row.effectId)).size !== (proof.teamEchoCasts ?? []).length) {
    throw new Error('Require one isolated activation per team Echo cast effect; duplicate stacking is unreviewed');
  }
  if (new Set((proof.teamWeaponStatusApplications ?? []).map(row => row.effectId)).size
    !== (proof.teamWeaponStatusApplications ?? []).length) {
    throw new Error('Require one isolated activation per team Weapon status effect; same-name stacking is unreviewed');
  }
  if (new Set((proof.teamWeaponCasts ?? []).map(row => row.effectId)).size !== (proof.teamWeaponCasts ?? []).length) {
    throw new Error('Require one isolated activation per team Weapon cast effect; duplicate stacking is unreviewed');
  }
  if (new Set((proof.teamHeals ?? []).map(row => row.effectId)).size !== (proof.teamHeals ?? []).length) {
    throw new Error('Require one isolated activation per team-heal Sonata effect; duplicate stacking is unreviewed');
  }
  if (new Set((proof.weaponOutros ?? []).map(row => row.effectId)).size !== (proof.weaponOutros ?? []).length) {
    throw new Error('Require one isolated activation per incoming Weapon effect; duplicate stacking is unreviewed');
  }
  if (new Set((proof.echoTransfers ?? []).map(row => row.effectId)).size !== (proof.echoTransfers ?? []).length) {
    throw new Error('Require one isolated activation per incoming Echo effect; duplicate stacking is unreviewed');
  }

  const sonataSupport = listSonataOutroTransferSupport();
  const sonata = proof.sonataOutros.map(row => {
    const contract = sonataSupport.find(item => item.effectId === row.effectId);
    const effects = SONATA_EFFECT_MODELS.filter(effect => effect.effectId === row.effectId);
    const effect = effects[0];
    if (!contract || effects.length !== 1 || contract.pieces !== 5
      || !releasedCharacter(row.sourceWielderId)
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

  const teamEchoSupport = listFallacyTeamAtkSupport();
  const teamEcho = (proof.teamEchoCasts ?? []).map(row => {
    const contract = teamEchoSupport.find(item => item.effectId === row.effectId);
    const effects = ECHO_EFFECT_MODELS.filter(effect => effect.effectId === row.effectId);
    const effect = effects[0];
    if (!contract || effects.length !== 1 || !effect || !releasedCharacter(row.sourceWielderId)
      || row.sourceWielderId === input.characterId || !releasedEcho(row.sourceMainEchoId)
      || row.sourceMainEchoId !== contract.echoId
      || !text(row.evidenceId) || !text(row.sourceEquipmentEvidenceId)
      || row.sourceQualification !== 'SOURCE_PROVEN_FALLACY_CAST'
      || row.sourceMainSlotAtEventQualified !== true || row.priorActivationState !== 'NONE_ACTIVE'
      || row.noLaterActivationThroughHit !== true || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(row.sameTimestampOrder)
      || !Array.isArray(row.teamMemberIds) || row.teamMemberIds.length === 0
      || new Set(row.teamMemberIds).size !== row.teamMemberIds.length
      || row.teamMemberIds.some((id: string) => !releasedCharacter(id))
      || !row.teamMemberIds.includes(input.characterId) || !row.teamMemberIds.includes(row.sourceWielderId)
      || !row.event || row.event.actorId !== row.sourceWielderId || row.event.echoId !== row.sourceMainEchoId
      || input.hitAtSeconds < row.event.atSeconds) {
      throw new Error('Require exact source Fallacy main-Echo/team, cast occurrence and isolated query ordering');
    }
    const activation = activateFallacySupportWindows({
      event: row.event,
      wielderId: row.sourceWielderId,
      selectedMainEchoId: row.sourceMainEchoId,
      teamMemberIds: row.teamMemberIds,
    });
    if (!activation || activation.teamAtk.effectId !== row.effectId || activation.teamAtk.statOrEffect !== contract.statOrEffect) {
      throw new Error('The supplied source Echo/team/cast does not activate the reviewed Fallacy team ATK window');
    }
    const active = isFallacySupportWindowActive(activation.teamAtk, input.characterId, input.hitAtSeconds)
      && !(input.hitAtSeconds === activation.teamAtk.startedAtSeconds && row.sameTimestampOrder === 'BEFORE_TRIGGER');
    return {
      sourceId: `team:echo-cast:${row.effectId}:${row.sourceWielderId}`,
      canonicalEffectId: row.effectId,
      stat: activation.teamAtk.statOrEffect,
      value: active ? activation.teamAtk.value : 0,
      status: 'EVENT_QUALIFIED_ASSEMBLED' as const,
      active,
      evidenceId: row.evidenceId,
      sourceEquipmentEvidenceId: row.sourceEquipmentEvidenceId,
      magnitudeDependsOnEchoStats: false as const,
      activationProof: 'PER_BUILD_EXPLICIT_TEAM_ECHO_CAST' as const,
      sourceKey: JSON.stringify(effect),
      window: { ...activation.teamAtk },
    };
  });

  const freezeFrameTeamSupport = listFreezeFrameGlacioChafeWindowSupport()
    .find(item => item.effectId === 'FF-TEAM-ATK')!;
  const teamWeaponStatus = (proof.teamWeaponStatusApplications ?? []).map(row => {
    const effects = WEAPON_EFFECT_CATALOG.filter(effect => effect.effectId === row.effectId);
    const effect = effects[0];
    const sourceCharacter = releasedCharacter(row.sourceWielderId);
    const sourceWeapon = releasedWeapon(row.sourceWeaponId);
    if (!freezeFrameTeamSupport || effects.length !== 1 || !effect || !sourceCharacter || !sourceWeapon
      || row.sourceWielderId === input.characterId
      || row.sourceWeaponId !== freezeFrameTeamSupport.weaponId
      || sourceWeapon.weaponType !== sourceCharacter.weaponType
      || !Number.isInteger(row.sourceWeaponRank) || row.sourceWeaponRank < 1 || row.sourceWeaponRank > 5
      || !text(row.evidenceId) || !text(row.sourceEquipmentEvidenceId)
      || row.sourceQualification !== 'SOURCE_PROVEN_GLACIO_CHAFE_APPLICATION'
      || row.sourceEquipmentAtEventQualified !== true || row.priorActivationState !== 'NONE_ACTIVE'
      || row.noLaterActivationThroughHit !== true || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(row.sameTimestampOrder)
      || !Array.isArray(row.teamMemberIds) || row.teamMemberIds.length === 0
      || new Set(row.teamMemberIds).size !== row.teamMemberIds.length
      || row.teamMemberIds.some((id: string) => !releasedCharacter(id))
      || !row.teamMemberIds.includes(input.characterId) || !row.teamMemberIds.includes(row.sourceWielderId)
      || !row.event || row.event.actorId !== row.sourceWielderId || input.hitAtSeconds < row.event.atSeconds) {
      throw new Error('Require exact source Freeze Frame rank/team, Glacio Chafe application and isolated query ordering');
    }
    const windows = activateFreezeFrameGlacioChafeWindows({
      selectedWeapon: { id: row.sourceWeaponId, rank: row.sourceWeaponRank },
      wielderId: row.sourceWielderId,
      teamMemberIds: row.teamMemberIds,
      event: row.event,
    });
    if (!windows || windows.teamAtk.effectId !== row.effectId) {
      throw new Error('The supplied source weapon/team/Glacio Chafe event does not activate Freeze Frame team ATK');
    }
    const active = isFreezeFrameGlacioChafeWindowActive(windows.teamAtk, {
      actorId: input.characterId,
      atSeconds: input.hitAtSeconds,
      sameTimestampOrder: row.sameTimestampOrder,
    });
    return {
      sourceId: `team:weapon-status:${row.effectId}:${row.sourceWielderId}`,
      canonicalEffectId: row.effectId,
      stat: windows.teamAtk.statOrEffect,
      value: active ? windows.teamAtk.value : 0,
      status: 'EVENT_QUALIFIED_ASSEMBLED' as const,
      active,
      evidenceId: row.evidenceId,
      sourceEquipmentEvidenceId: row.sourceEquipmentEvidenceId,
      magnitudeDependsOnEchoStats: false as const,
      activationProof: 'PER_BUILD_EXPLICIT_TEAM_STATUS_APPLICATION' as const,
      sourceKey: JSON.stringify(effect),
      triggerTargetId: row.event.targetId,
      sourceFactId: row.event.sourceFactId,
      appliedStacks: row.event.stacksApplied,
      window: { ...windows.teamAtk },
    };
  });

  const teamWeaponSupport = listStellarSymphonyTeamAtkSupport();
  const teamWeapon = (proof.teamWeaponCasts ?? []).map(row => {
    const contract = teamWeaponSupport.find(item => item.effectId === row.effectId);
    const effects = WEAPON_EFFECT_CATALOG.filter(effect => effect.effectId === row.effectId);
    const effect = effects[0];
    const sourceCharacter = releasedCharacter(row.sourceWielderId);
    const sourceWeapon = releasedWeapon(row.sourceWeaponId);
    if (!contract || effects.length !== 1 || !effect || !sourceCharacter || !sourceWeapon
      || row.sourceWielderId !== contract.sourceCharacterId || row.sourceWielderId === input.characterId
      || row.sourceWeaponId !== contract.weaponId || sourceWeapon.weaponType !== sourceCharacter.weaponType
      || !Number.isInteger(row.sourceWeaponRank) || row.sourceWeaponRank < contract.rankRange[0]
      || row.sourceWeaponRank > contract.rankRange[1]
      || !text(row.evidenceId) || !text(row.sourceEquipmentEvidenceId)
      || row.sourceQualification !== 'SOURCE_PROVEN_HEALING_SKILL_CAST'
      || row.sourceEquipmentAtEventQualified !== true || row.priorActivationState !== 'NONE_ACTIVE'
      || row.noLaterActivationThroughHit !== true || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(row.sameTimestampOrder)
      || !Array.isArray(row.teamMemberIds) || row.teamMemberIds.length === 0
      || row.teamMemberIds.some((id: string) => !releasedCharacter(id))
      || !row.teamMemberIds.includes(input.characterId) || !row.teamMemberIds.includes(row.sourceWielderId)
      || !row.event || row.event.actorId !== row.sourceWielderId
      || row.event.healingSourceFactId !== contract.sourceFactId || input.hitAtSeconds < row.event.atSeconds) {
      throw new Error('Require exact Shorekeeper Stellar Symphony rank/team, healing Skill cast and isolated query ordering');
    }
    const window = activateStellarSymphonyTeamAtkWindow({
      event: row.event,
      selectedWeapon: { id: row.sourceWeaponId, rank: row.sourceWeaponRank },
      teamMemberIds: row.teamMemberIds,
    });
    if (!window) throw new Error('The supplied Shorekeeper weapon/team/cast does not activate Stellar Symphony');
    const active = isShorekeeperHealingSupportWindowActive(window, input.characterId, input.hitAtSeconds)
      && !(input.hitAtSeconds === window.startedAtSeconds && row.sameTimestampOrder === 'BEFORE_TRIGGER');
    return {
      sourceId: `team:weapon-cast:${row.effectId}:${row.sourceWielderId}`,
      canonicalEffectId: row.effectId,
      stat: window.statOrEffect,
      value: active ? window.value : 0,
      status: 'EVENT_QUALIFIED_ASSEMBLED' as const,
      active,
      evidenceId: row.evidenceId,
      sourceEquipmentEvidenceId: row.sourceEquipmentEvidenceId,
      magnitudeDependsOnEchoStats: false as const,
      activationProof: 'PER_BUILD_EXPLICIT_TEAM_CAST' as const,
      sourceKey: JSON.stringify(effect),
      window: { ...window },
    };
  });

  const teamHealSupport = listSharedRejuvenatingGlowSupport();
  const teamHeal = (proof.teamHeals ?? []).map(row => {
    const contract = teamHealSupport.find(item => item.effectId === row.effectId);
    const effects = SONATA_EFFECT_MODELS.filter(effect => effect.effectId === row.effectId);
    const effect = effects[0];
    if (!contract || effects.length !== 1 || !effect || !releasedCharacter(row.sourceWielderId)
      || row.sourceWielderId === input.characterId
      || row.sourceSonataSetId !== contract.sonataSetId || row.sourcePieces !== contract.pieces
      || !text(row.evidenceId) || !text(row.sourceEquipmentEvidenceId)
      || row.sourceQualification !== 'SOURCE_PROVEN_HEAL' || row.sourceEquipmentAtEventQualified !== true
      || row.priorActivationState !== 'NONE_ACTIVE' || row.noLaterActivationThroughHit !== true
      || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(row.sameTimestampOrder)
      || !Array.isArray(row.teamMemberIds) || row.teamMemberIds.length === 0
      || row.teamMemberIds.some((id: string) => !releasedCharacter(id))
      || !row.teamMemberIds.includes(input.characterId) || !row.teamMemberIds.includes(row.sourceWielderId)
      || !row.event || row.event.healerId !== row.sourceWielderId || input.hitAtSeconds < row.event.atSeconds) {
      throw new Error('Require exact source Rejuvenating Glow 5-piece owner/team, applied heal and isolated query ordering');
    }
    const window = activateSharedRejuvenatingGlowWindow({
      ownerId: row.sourceWielderId,
      event: row.event,
      selectedSet: { id: row.sourceSonataSetId, pieces: row.sourcePieces },
      teamMemberIds: row.teamMemberIds,
    });
    if (!window) throw new Error('The supplied source set/team/heal does not activate this canonical Rejuvenating Glow window');
    const active = isSharedHealingTeamWindowActive(window, input.characterId, input.hitAtSeconds)
      && !(input.hitAtSeconds === window.startedAtSeconds && row.sameTimestampOrder === 'BEFORE_TRIGGER');
    return {
      sourceId: `team:sonata-heal:${row.effectId}:${row.sourceWielderId}`,
      canonicalEffectId: row.effectId,
      stat: window.statOrEffect,
      value: active ? window.value : 0,
      status: 'EVENT_QUALIFIED_ASSEMBLED' as const,
      active,
      evidenceId: row.evidenceId,
      sourceEquipmentEvidenceId: row.sourceEquipmentEvidenceId,
      magnitudeDependsOnEchoStats: false as const,
      activationProof: 'PER_BUILD_EXPLICIT_TEAM_HEAL' as const,
      sourceKey: JSON.stringify(effect),
      window: { ...window },
    };
  });

  const weaponSupport = listStaticMistOutroTransferSupport();
  const weapon = (proof.weaponOutros ?? []).map(row => {
    const contract = weaponSupport.find(item => item.effectId === row.effectId);
    const weaponRows = WEAPON_CATALOG.filter(item => item.id === row.sourceWeaponId);
    const effects = WEAPON_EFFECT_CATALOG.filter(item => item.effectId === row.effectId);
    const effect = effects[0];
    const sourceWeapon = releasedWeapon(row.sourceWeaponId);
    const sourceCharacter = releasedCharacter(row.sourceWielderId);
    if (!contract || weaponRows.length !== 1 || effects.length !== 1 || !effect || !sourceWeapon || !sourceCharacter
      || sourceWeapon.weaponType !== sourceCharacter.weaponType
      || row.sourceWeaponId !== contract.weaponId
      || !Number.isInteger(row.sourceWeaponRank) || row.sourceWeaponRank < contract.rankRange[0]
      || row.sourceWeaponRank > contract.rankRange[1]
      || !text(row.evidenceId) || !text(row.sourceEquipmentEvidenceId)
      || row.sourceQualification !== 'SOURCE_PROVEN_WEAPON_OUTRO_TRANSFER'
      || row.sourceEquipmentAtEventQualified !== true || row.priorActivationState !== 'NONE_ACTIVE'
      || row.noLaterActivationThroughHit !== true || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(row.sameTimestampOrder)
      || !row.event || row.event.actorId !== row.sourceWielderId
      || row.event.incomingResonatorId !== input.characterId || input.hitAtSeconds < row.event.atSeconds) {
      throw new Error('Require exact source weapon/rank/owner, Outro recipient and isolated query ordering');
    }
    const window = activateStaticMistOutroTransfer({
      selectedWeapon: { id: row.sourceWeaponId, rank: row.sourceWeaponRank },
      wielderId: row.sourceWielderId,
      event: row.event,
    });
    if (!window) throw new Error('The supplied weapon/Outro event does not activate this canonical incoming transfer');
    const active = isIncomingTransferWindowActive(window, input.characterId, input.hitAtSeconds)
      && !(input.hitAtSeconds === window.startedAtSeconds && row.sameTimestampOrder === 'BEFORE_TRIGGER');
    return {
      sourceId: `team:weapon:${row.effectId}:${row.sourceWielderId}`,
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

  const echoSupport = listEchoTransferWindowSupport();
  const echo = (proof.echoTransfers ?? []).map(row => {
    const contract = echoSupport.find(item => item.effectId === row.effectId);
    const effects = ECHO_EFFECT_MODELS.filter(effect => effect.effectId === row.effectId);
    const effect = effects[0];
    const tied = row.armEvent?.atSeconds === row.outroEvent?.atSeconds;
    if (!contract || effects.length !== 1 || !releasedCharacter(row.sourceWielderId)
      || !releasedEcho(row.sourceMainEchoId) || row.sourceMainEchoId !== contract.echoId
      || row.armEvent?.echoId !== contract.echoId || row.armEvent?.actorId !== row.sourceWielderId
      || row.outroEvent?.actorId !== row.sourceWielderId || row.outroEvent?.incomingResonatorId !== input.characterId
      || row.armEvent?.kind !== contract.armEventKind
      || (contract.requiredRank === null ? row.sourceEchoRank !== null : row.sourceEchoRank !== contract.requiredRank)
      || !text(row.evidenceId) || !text(row.sourceEquipmentEvidenceId)
      || row.sourceQualification !== 'SOURCE_PROVEN_ECHO_TRANSFER' || row.sourceMainSlotAtArmQualified !== true
      || row.priorActivationState !== 'NONE_ACTIVE' || row.noLaterActivationThroughHit !== true
      || (tied ? row.sameTimestampArmOrder !== 'ECHO_BEFORE_OUTRO' : row.sameTimestampArmOrder !== 'NOT_TIED')
      || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(row.sameTimestampOrder)
      || input.hitAtSeconds < row.outroEvent.atSeconds) {
      throw new Error('Require exact source main-Echo/rank, arm event, Outro recipient and isolated query ordering');
    }
    const window = activateEchoTransferWindow({
      effectId: row.effectId,
      wielderId: row.sourceWielderId,
      armEvent: row.armEvent,
      outroEvent: row.outroEvent,
      rank: row.sourceEchoRank ?? undefined,
      priorActivationState: row.priorActivationState,
      sameTimestampArmOrder: tied ? row.sameTimestampArmOrder : undefined,
    });
    if (!window) throw new Error('The supplied Echo arm/Outro events do not activate this canonical incoming transfer');
    const active = isIncomingTransferWindowActive(window, input.characterId, input.hitAtSeconds)
      && !(input.hitAtSeconds === window.startedAtSeconds && row.sameTimestampOrder === 'BEFORE_TRIGGER');
    return {
      sourceId: `team:echo:${row.effectId}:${row.sourceWielderId}`,
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

  return [...sonata, ...teamEcho, ...teamWeaponStatus, ...teamWeapon, ...teamHeal, ...weapon, ...echo];
}
