import { CHARACTER_CATALOG } from '../data/characters.ts';
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

export interface HitContextAmplificationEvents {
  readonly echoStatKey: string;
  readonly eventContextId: string;
  readonly evidenceId: string;
  readonly shorekeeperOutros?: readonly ProvenHitShorekeeperOutroTeamAmplification[];
}

const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const releasedCharacter = (id: string) => CHARACTER_CATALOG.find(character =>
  character.id === id && character.releaseStatus === 'RELEASED');

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

export function evaluateHitContextAmplificationEvents(input: {
  readonly characterId: string;
  readonly hitAtSeconds: number;
  readonly eventContextId: string;
  readonly echoStatKey: string;
  readonly proof: HitContextAmplificationEvents;
}): readonly QualifiedScopedAmplificationTerm[] {
  const { proof } = input;
  if (!Number.isFinite(input.hitAtSeconds) || input.hitAtSeconds < 0
    || !proof || proof.echoStatKey !== input.echoStatKey || proof.eventContextId !== input.eventContextId
    || !text(proof.evidenceId)
    || (proof.shorekeeperOutros !== undefined && !Array.isArray(proof.shorekeeperOutros))) {
    throw new Error('Require exact per-build scoped amplification proof and hit query');
  }
  if (new Set((proof.shorekeeperOutros ?? []).map(row => row.sourceFactId)).size
    !== (proof.shorekeeperOutros ?? []).length) {
    throw new Error('Require one isolated Shorekeeper Outro activation; duplicate stacking is unreviewed');
  }

  const support = listShorekeeperOutroHitAmplificationSupport()[0];
  return (proof.shorekeeperOutros ?? []).map(row => {
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
}
