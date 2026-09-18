import { CHARACTER_CATALOG } from '../data/characters.ts';
import { WEAPON_CATALOG } from '../data/weapons.ts';
import type { Element } from '../gameDataDomain.ts';
import {
  activateShorekeeperOutroTeamWindow,
  isShorekeeperOutroTeamWindowActive,
  resolveShorekeeperOutroTeamWindowContract,
  type ShorekeeperOutroCastEvent,
} from './shorekeeperOutroTeamWindowAdapter.ts';
import {
  classifyCharacterHitAmplificationScope,
  type QualifiedScopedAmplificationTerm,
} from './scopedAmplificationComposition.ts';
import {
  activateWeaponTeamAmplifyWindow,
  listWeaponTeamAmplifySupport,
  weaponTeamAeroAmplificationAt,
  type WeaponTeamCastEvent,
} from './weaponTeamAmplifyWindowAdapter.ts';

export interface ProvenHitShorekeeperOutroTeamAmplification {
  readonly sourceFactId: 'the-shorekeeper-outro-binary-butterfly';
  readonly evidenceId: string;
  readonly sourceWielderId: 'the-shorekeeper';
  readonly sourceQualification: 'SOURCE_PROVEN_SHOREKEEPER_OUTRO';
  readonly teamMemberIds: readonly string[];
  readonly event: ShorekeeperOutroCastEvent;
  readonly priorActivationState: 'NONE_ACTIVE';
  readonly noLaterActivationThroughHit: true;
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
}

export interface ProvenHitBloodpactsPledgeTeamAmplification {
  readonly effectId: 'BPP-TEAM-AERO';
  readonly evidenceId: string;
  readonly sourceWielderId: 'rover-aero';
  readonly sourceEquipmentEvidenceId: string;
  readonly sourceWeaponId: 'bloodpacts-pledge';
  readonly sourceWeaponRank: 1 | 2 | 3 | 4 | 5;
  readonly sourceQualification: 'SOURCE_PROVEN_UNBOUND_FLOW_CAST';
  readonly sourceEquipmentAtEventQualified: true;
  readonly recipientEligibility: 'VERIFIED_ELIGIBLE' | 'VERIFIED_INELIGIBLE';
  readonly event: WeaponTeamCastEvent;
  readonly priorActivationState: 'NONE_ACTIVE';
  readonly noLaterActivationThroughHit: true;
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
}

export interface HitContextAmplificationEvents {
  readonly echoStatKey: string;
  readonly eventContextId: string;
  readonly evidenceId: string;
  readonly shorekeeperOutros?: readonly ProvenHitShorekeeperOutroTeamAmplification[];
  readonly weaponTeamAmplifications?: readonly ProvenHitBloodpactsPledgeTeamAmplification[];
}

const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const releasedCharacter = (id: string) => CHARACTER_CATALOG.find(character =>
  character.id === id && character.releaseStatus === 'RELEASED');
const releasedWeapon = (id: string) => WEAPON_CATALOG.find(weapon =>
  weapon.id === id && weapon.releaseStatus === 'RELEASED' && weapon.verificationStatus === 'VERIFIED');

export function listShorekeeperOutroHitAmplificationSupport() {
  const contract = resolveShorekeeperOutroTeamWindowContract();
  const scope = classifyCharacterHitAmplificationScope(contract.statOrEffect);
  if (!scope) throw new Error('Shorekeeper Outro amplification scope is not supported by Character direct hits');
  return [{
    sourceFactId: contract.sourceFactId,
    sourceCharacterId: contract.sourceCharacterId,
    statOrEffect: contract.statOrEffect,
    scope,
    primitiveId: contract.adapterId,
    contextScope: 'EXPLICIT_TEAM_OUTRO_SINGLE_ACTIVE_AMPLIFICATION' as const,
  }];
}

export function listBloodpactsPledgeHitAmplificationSupport() {
  return listWeaponTeamAmplifySupport().map(contract => {
    const scope = classifyCharacterHitAmplificationScope(contract.statOrEffect);
    if (!scope) throw new Error('Bloodpact team amplification scope is not supported by Character direct hits');
    return {
      ...contract,
      scope,
      contextScope: 'EXPLICIT_UNBOUND_FLOW_SINGLE_ACTIVE_AERO_AMPLIFICATION' as const,
    };
  });
}

export function evaluateHitContextAmplificationEvents(input: {
  readonly characterId: string;
  readonly hitAtSeconds: number;
  readonly eventContextId: string;
  readonly echoStatKey: string;
  readonly damageElement: Element;
  readonly proof: HitContextAmplificationEvents;
}): readonly QualifiedScopedAmplificationTerm[] {
  const { proof } = input;
  if (!Number.isFinite(input.hitAtSeconds) || input.hitAtSeconds < 0
    || !proof || proof.echoStatKey !== input.echoStatKey || proof.eventContextId !== input.eventContextId
    || !['Aero', 'Electro', 'Fusion', 'Glacio', 'Havoc', 'Spectro'].includes(input.damageElement)
    || !text(proof.evidenceId)
    || (proof.shorekeeperOutros !== undefined && !Array.isArray(proof.shorekeeperOutros))
    || (proof.weaponTeamAmplifications !== undefined && !Array.isArray(proof.weaponTeamAmplifications))) {
    throw new Error('Require exact per-build scoped amplification proof and hit query');
  }
  if (new Set((proof.shorekeeperOutros ?? []).map(row => row.sourceFactId)).size
    !== (proof.shorekeeperOutros ?? []).length) {
    throw new Error('Require one isolated Shorekeeper Outro activation; duplicate stacking is unreviewed');
  }

  if (new Set((proof.weaponTeamAmplifications ?? []).map(row => row.effectId)).size
    !== (proof.weaponTeamAmplifications ?? []).length) {
    throw new Error('Require one isolated Bloodpact team amplification activation; duplicate stacking is unreviewed');
  }

  const support = listShorekeeperOutroHitAmplificationSupport()[0];
  const shorekeeper = (proof.shorekeeperOutros ?? []).map(row => {
    if (row.sourceFactId !== support.sourceFactId || row.sourceWielderId !== support.sourceCharacterId
      || !releasedCharacter(row.sourceWielderId) || !text(row.evidenceId)
      || row.sourceQualification !== 'SOURCE_PROVEN_SHOREKEEPER_OUTRO'
      || row.priorActivationState !== 'NONE_ACTIVE' || row.noLaterActivationThroughHit !== true
      || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(row.sameTimestampOrder)
      || !Array.isArray(row.teamMemberIds) || row.teamMemberIds.length === 0
      || new Set(row.teamMemberIds).size !== row.teamMemberIds.length
      || row.teamMemberIds.some((id: string) => !releasedCharacter(id))
      || !row.teamMemberIds.includes(row.sourceWielderId) || !row.teamMemberIds.includes(input.characterId)
      || !row.event || row.event.actorId !== row.sourceWielderId || input.hitAtSeconds < row.event.atSeconds) {
      throw new Error('Require exact Shorekeeper Outro owner/team, cast occurrence and isolated query ordering');
    }
    const window = activateShorekeeperOutroTeamWindow({
      event: row.event,
      teamMemberIds: row.teamMemberIds,
    });
    if (!window || window.sourceFactId !== row.sourceFactId
      || window.statOrEffect !== support.statOrEffect) {
      throw new Error('The supplied Shorekeeper team/Outro event does not activate the reviewed amplification');
    }
    const active = isShorekeeperOutroTeamWindowActive(window, input.characterId, input.hitAtSeconds)
      && !(input.hitAtSeconds === window.startedAtSeconds && row.sameTimestampOrder === 'BEFORE_TRIGGER');
    return {
      sourceId: `team:character-outro:${row.sourceFactId}:${row.sourceWielderId}`,
      canonicalSourceId: row.sourceFactId,
      statOrEffect: window.statOrEffect,
      value: window.value,
      active,
      evidenceId: row.evidenceId,
      scope: support.scope,
    };
  });

  const bppSupport = listBloodpactsPledgeHitAmplificationSupport()[0];
  const bpp = (proof.weaponTeamAmplifications ?? []).map(row => {
    const sourceCharacter = releasedCharacter(row.sourceWielderId);
    const sourceWeapon = releasedWeapon(row.sourceWeaponId);
    if (!bppSupport || !sourceCharacter || !sourceWeapon
      || row.effectId !== bppSupport.effectId || row.sourceWielderId !== bppSupport.sourceCharacterId
      || row.sourceWeaponId !== bppSupport.weaponId || sourceWeapon.weaponType !== sourceCharacter.weaponType
      || !Number.isInteger(row.sourceWeaponRank) || row.sourceWeaponRank < bppSupport.rankRange[0]
      || row.sourceWeaponRank > bppSupport.rankRange[1]
      || !text(row.evidenceId) || !text(row.sourceEquipmentEvidenceId)
      || row.sourceQualification !== 'SOURCE_PROVEN_UNBOUND_FLOW_CAST'
      || row.sourceEquipmentAtEventQualified !== true
      || !['VERIFIED_ELIGIBLE', 'VERIFIED_INELIGIBLE'].includes(row.recipientEligibility)
      || row.priorActivationState !== 'NONE_ACTIVE' || row.noLaterActivationThroughHit !== true
      || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(row.sameTimestampOrder)
      || !row.event || row.event.actorId !== row.sourceWielderId
      || input.hitAtSeconds < row.event.atSeconds) {
      throw new Error('Require exact Rover Aero Bloodpact rank/equipment, Unbound Flow cast and recipient eligibility');
    }
    const window = activateWeaponTeamAmplifyWindow({
      weaponId: row.sourceWeaponId,
      rank: row.sourceWeaponRank,
      wielderId: row.sourceWielderId,
      wielderCharacterId: row.sourceWielderId,
      event: row.event,
    });
    if (!window) throw new Error('The supplied Rover Aero weapon/cast does not activate Bloodpact team amplification');
    const applied = weaponTeamAeroAmplificationAt(window, {
      atSeconds: input.hitAtSeconds,
      triggerOrder: row.sameTimestampOrder,
      nearbyOnFieldEligibility: row.recipientEligibility,
      damageElement: input.damageElement,
    });
    return {
      sourceId: `team:weapon-amplification:${row.effectId}:${row.sourceWielderId}`,
      canonicalSourceId: row.effectId,
      statOrEffect: bppSupport.statOrEffect,
      value: window.value,
      active: applied > 0,
      evidenceId: row.evidenceId,
      scope: bppSupport.scope,
    };
  });

  return [...shorekeeper, ...bpp];
}
