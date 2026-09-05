import type { EchoEffectModel } from '../echoEffectDomain.ts';
import { ECHO_EFFECT_MODELS } from '../data/echoEffects.ts';

const FALLACY_ECHO_ID = 'echo-60000605';
const FALLACY_TEAM_ATK_EFFECT_ID = 'FALLACY_TEAM_ATK';
const FALLACY_WIELDER_ER_EFFECT_ID = 'FALLACY_WIELDER_ER';
const FALLACY_CAST_TRIGGER = 'Cast Fallacy of No Return Echo Skill';
const ADAPTER_ID = 'fallacy-support-windows-v1';

export interface FallacyEchoCastEvent {
  readonly kind: 'ECHO_SKILL_CAST';
  readonly actorId: string;
  readonly echoId: string;
  readonly atSeconds: number;
}

export interface FallacySupportWindow {
  readonly adapterId: typeof ADAPTER_ID;
  readonly sourceLayer: 'ECHO';
  readonly effectId: string;
  readonly sourceId: string;
  readonly sourceActorId: string;
  readonly statOrEffect: string;
  readonly value: number;
  readonly appliesTo: 'TEAM' | 'WIELDER';
  readonly teamMemberIds: readonly string[];
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
}

export interface FallacySupportActivation {
  readonly teamAtk: FallacySupportWindow;
  readonly wielderEr: FallacySupportWindow;
}

export const FALLACY_SUPPORT_SEMANTIC_SPLIT = {
  adapterId: ADAPTER_ID,
  echoId: FALLACY_ECHO_ID,
  reviewedAt: '2026-09-04',
  closesPendingExecutionIds: [] as readonly string[],
  requiresProfileEventTimeline: true,
  resolvedSemantics: [
    'generic Fallacy Echo Skill cast activates the canonical non-damage ON_ECHO_CAST effects',
    'team ATK and wielder Energy Regen retain their separate canonical target scopes',
    'effect values and durations remain owned by EchoEffectModel and are read at activation time',
  ],
  notes: [
    'This adapter intentionally models only non-damage cast effects. It does not select normal/tap versus hold/release active-damage execution.',
    'A generic ECHO_SKILL_CAST event must not be used as proof for FALLACY_INITIAL_BLAST, hold-flurry hit count or the hold-release finisher tracked by BUG-010.',
    'Reference Team timing still requires an explicit Fallacy cast timestamp before either window can overlap Augusta or contribute to Shorekeeper ER state.',
  ],
} as const;

interface FallacyEffectContract {
  readonly effectId: string;
  readonly appliesTo: 'TEAM' | 'WIELDER';
}

const FALLACY_EFFECT_CONTRACTS: readonly FallacyEffectContract[] = [
  { effectId: FALLACY_TEAM_ATK_EFFECT_ID, appliesTo: 'TEAM' },
  { effectId: FALLACY_WIELDER_ER_EFFECT_ID, appliesTo: 'WIELDER' },
] as const;

function effectsById(catalog: readonly EchoEffectModel[], effectId: string): readonly EchoEffectModel[] {
  return catalog.filter((effect) => effect.effectId === effectId);
}

function uniqueEffectById(catalog: readonly EchoEffectModel[], effectId: string): EchoEffectModel | null {
  const matches = effectsById(catalog, effectId);
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Duplicate Echo effect id ${effectId}`);
  return matches[0];
}

function validateEventTime(atSeconds: number): void {
  if (!Number.isFinite(atSeconds) || atSeconds < 0) {
    throw new Error(`Fallacy cast event time must be a finite non-negative number: ${atSeconds}`);
  }
}

function validateTeamMemberIds(teamMemberIds: readonly string[], wielderId: string): readonly string[] {
  if (teamMemberIds.length === 0) throw new Error('Fallacy selected team must not be empty');
  for (const characterId of teamMemberIds) {
    if (!characterId.trim()) throw new Error('Fallacy selected team member id must not be blank');
  }
  if (new Set(teamMemberIds).size !== teamMemberIds.length) {
    throw new Error('Fallacy selected team contains duplicate Character ids');
  }
  if (!teamMemberIds.includes(wielderId)) {
    throw new Error(`Fallacy selected team must include wielder ${wielderId}`);
  }
  return Object.freeze([...teamMemberIds]);
}

export function validateFallacySupportContracts(
  catalog: readonly EchoEffectModel[] = ECHO_EFFECT_MODELS,
): readonly string[] {
  const issues: string[] = [];
  const resolved: EchoEffectModel[] = [];

  for (const contract of FALLACY_EFFECT_CONTRACTS) {
    const matches = effectsById(catalog, contract.effectId);
    if (matches.length === 0) {
      issues.push(`missing canonical Fallacy Echo effect ${contract.effectId}`);
      continue;
    }
    if (matches.length > 1) {
      issues.push(`duplicate canonical Fallacy Echo effect ${contract.effectId}`);
      continue;
    }

    const effect = matches[0];
    resolved.push(effect);
    if (effect.echoId !== FALLACY_ECHO_ID) issues.push(`${contract.effectId} Echo id drift`);
    if (effect.activation !== 'ON_ECHO_CAST') issues.push(`${contract.effectId} must remain ON_ECHO_CAST`);
    if (effect.trigger !== FALLACY_CAST_TRIGGER) issues.push(`${contract.effectId} trigger drift`);
    if (effect.appliesTo !== contract.appliesTo) issues.push(`${contract.effectId} scope drift`);
    if (effect.mechanicsStatus !== 'VERIFIED_MODELED') issues.push(`${contract.effectId} must remain VERIFIED_MODELED`);
    if (!Number.isFinite(effect.value)) issues.push(`${contract.effectId} value must remain finite`);
    if (effect.durationSeconds === null || !Number.isFinite(effect.durationSeconds) || effect.durationSeconds <= 0) {
      issues.push(`${contract.effectId} must retain a positive finite duration`);
    }
  }

  if (resolved.length === FALLACY_EFFECT_CONTRACTS.length) {
    const [first, ...rest] = resolved;
    for (const effect of rest) {
      if (effect.echoId !== first.echoId) issues.push('Fallacy support effects must share one Echo identity');
      if (effect.trigger !== first.trigger) issues.push('Fallacy support effects must share one cast trigger');
      if (effect.durationSeconds !== first.durationSeconds) issues.push('Fallacy support effects duration drifted apart');
    }
  }

  return issues;
}

const CONTRACT_ISSUES = validateFallacySupportContracts();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Fallacy support contracts: ${CONTRACT_ISSUES.join('; ')}`);
}

function windowFromEffect(params: {
  readonly effect: EchoEffectModel;
  readonly wielderId: string;
  readonly teamMemberIds: readonly string[];
  readonly atSeconds: number;
}): FallacySupportWindow {
  const { effect, wielderId, teamMemberIds, atSeconds } = params;
  if (effect.appliesTo !== 'TEAM' && effect.appliesTo !== 'WIELDER') {
    throw new Error(`Fallacy support effect ${effect.effectId} has unsupported scope ${effect.appliesTo}`);
  }
  const durationSeconds = effect.durationSeconds;
  if (durationSeconds === null || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new Error(`Fallacy support effect ${effect.effectId} has no executable duration`);
  }
  if (!Number.isFinite(effect.value)) throw new Error(`Fallacy support effect ${effect.effectId} has no finite value`);

  return {
    adapterId: ADAPTER_ID,
    sourceLayer: 'ECHO',
    effectId: effect.effectId,
    sourceId: effect.echoId,
    sourceActorId: wielderId,
    statOrEffect: effect.statOrEffect,
    value: effect.value,
    appliesTo: effect.appliesTo,
    teamMemberIds,
    startedAtSeconds: atSeconds,
    expiresAtSeconds: atSeconds + durationSeconds,
  };
}

export function activateFallacySupportWindows(params: {
  readonly event: FallacyEchoCastEvent;
  readonly wielderId: string;
  readonly selectedMainEchoId: string | undefined;
  readonly teamMemberIds: readonly string[];
  readonly catalog?: readonly EchoEffectModel[];
}): FallacySupportActivation | null {
  const { event, wielderId, selectedMainEchoId, teamMemberIds, catalog = ECHO_EFFECT_MODELS } = params;
  if (event.kind !== 'ECHO_SKILL_CAST') {
    throw new Error(`unsupported Fallacy cast event kind: ${String(event.kind)}`);
  }
  if (!event.actorId.trim() || !event.echoId.trim() || !wielderId.trim()) {
    throw new Error('Fallacy cast event ids and wielderId must not be blank');
  }
  validateEventTime(event.atSeconds);

  if (event.actorId !== wielderId) return null;
  if (selectedMainEchoId !== FALLACY_ECHO_ID) return null;
  if (event.echoId !== selectedMainEchoId) return null;

  const selectedTeamMemberIds = validateTeamMemberIds(teamMemberIds, wielderId);
  const teamAtk = uniqueEffectById(catalog, FALLACY_TEAM_ATK_EFFECT_ID);
  const wielderEr = uniqueEffectById(catalog, FALLACY_WIELDER_ER_EFFECT_ID);
  if (!teamAtk) throw new Error(`Missing Echo effect ${FALLACY_TEAM_ATK_EFFECT_ID}`);
  if (!wielderEr) throw new Error(`Missing Echo effect ${FALLACY_WIELDER_ER_EFFECT_ID}`);

  return {
    teamAtk: windowFromEffect({
      effect: teamAtk,
      wielderId,
      teamMemberIds: selectedTeamMemberIds,
      atSeconds: event.atSeconds,
    }),
    wielderEr: windowFromEffect({
      effect: wielderEr,
      wielderId,
      teamMemberIds: selectedTeamMemberIds,
      atSeconds: event.atSeconds,
    }),
  };
}

export function isFallacySupportWindowActive(
  window: FallacySupportWindow,
  targetCharacterId: string,
  atSeconds: number,
): boolean {
  if (!targetCharacterId.trim()) throw new Error('Fallacy support target Character id must not be blank');
  if (!Number.isFinite(atSeconds) || atSeconds < 0) {
    throw new Error(`Fallacy support query time must be a finite non-negative number: ${atSeconds}`);
  }
  if (atSeconds < window.startedAtSeconds || atSeconds >= window.expiresAtSeconds) return false;
  if (window.appliesTo === 'WIELDER') return targetCharacterId === window.sourceActorId;
  return window.teamMemberIds.includes(targetCharacterId);
}
