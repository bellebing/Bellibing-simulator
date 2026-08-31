import { ECHO_ATTACK_PROFILES } from './data/echoAttacks.ts';
import {
  FLEURDELYS_CHARACTER_RESTRICTION_REVIEW,
  SIGILLUM_CHARACTER_RESTRICTION_REVIEW,
} from './data/echoCharacterRestrictedEffects.ts';
import { ECHO_EFFECT_MODELS } from './data/echoEffects.ts';
import {
  ECHO_SKILL_PENDING_ADAPTER_FACTS,
  ECHO_SKILL_SOURCE_REVIEW_V36,
  ECHO_SKILL_SOURCE_UNUSED_PARAM_RECORDS,
} from './data/echoSkillSourceReview.ts';
import { ECHO_CATALOG } from './data/echoes.ts';
import { ECHO_RAW_SOURCE_REVIEW_V36 } from './data/echoRawAudit.ts';
import { createEchoAttackRegistry } from './echoAttackRegistry.ts';
import { createEchoEffectRegistry } from './echoEffectRegistry.ts';

export interface EchoSkillCoverageSummary {
  readonly releasedEchoCount: number;
  readonly modeledEffectRowCount: number;
  readonly modeledEffectEchoCount: number;
  readonly attackProfileCount: number;
  readonly attackFactCount: number;
  readonly pendingAdapterFactCount: number;
  readonly sourceUnusedParamRecordCount: number;
}

export function auditEchoSkillCoverage(): EchoSkillCoverageSummary {
  const review = ECHO_SKILL_SOURCE_REVIEW_V36;
  const released = ECHO_CATALOG.filter((row) => row.releaseStatus === 'RELEASED');
  if (released.length !== review.expectedReleasedEchoCount) {
    throw new Error(`Echo skill review expected ${review.expectedReleasedEchoCount} released Echoes, got ${released.length}.`);
  }
  if (review.sourceCommit !== ECHO_RAW_SOURCE_REVIEW_V36.reviewedCurrentSourceCommit) {
    throw new Error('Echo skill source review commit drifted from the current raw Echo review commit.');
  }

  const knownEchoIds = new Set<string>(released.map((row) => row.id));
  const effectRegistry = createEchoEffectRegistry(ECHO_EFFECT_MODELS);
  const attackRegistry = createEchoAttackRegistry(ECHO_ATTACK_PROFILES);

  if (effectRegistry.byId.size !== review.expectedModeledEffectRowCount) {
    throw new Error(`Expected ${review.expectedModeledEffectRowCount} modeled Echo effect rows, got ${effectRegistry.byId.size}.`);
  }
  if (effectRegistry.byEchoId.size !== review.expectedModeledEffectEchoCount) {
    throw new Error(`Expected ${review.expectedModeledEffectEchoCount} Echoes with modeled effects, got ${effectRegistry.byEchoId.size}.`);
  }
  if (attackRegistry.byEchoId.size !== review.expectedAttackProfileCount) {
    throw new Error(`Expected ${review.expectedAttackProfileCount} Echo attack profiles, got ${attackRegistry.byEchoId.size}.`);
  }
  if (attackRegistry.attackById.size !== review.expectedAttackFactCount) {
    throw new Error(`Expected ${review.expectedAttackFactCount} Echo attack facts, got ${attackRegistry.attackById.size}.`);
  }

  const pendingKeys = new Set<string>();
  for (const row of ECHO_SKILL_PENDING_ADAPTER_FACTS) {
    if (!knownEchoIds.has(row.echoId)) throw new Error(`Pending Echo skill adapter references unknown Echo ${row.echoId}.`);
    const key = `${row.echoId}:${row.fact}`;
    if (pendingKeys.has(key)) throw new Error(`Duplicate pending Echo skill adapter fact: ${key}.`);
    pendingKeys.add(key);
  }

  for (const row of ECHO_SKILL_SOURCE_UNUSED_PARAM_RECORDS) {
    if (!knownEchoIds.has(row.echoId)) throw new Error(`Echo skill source discrepancy references unknown Echo ${row.echoId}.`);
  }
  if (ECHO_SKILL_SOURCE_UNUSED_PARAM_RECORDS.length !== review.expectedUnusedParamRecordCount) {
    throw new Error(`Expected ${review.expectedUnusedParamRecordCount} source unused-param records, got ${ECHO_SKILL_SOURCE_UNUSED_PARAM_RECORDS.length}.`);
  }

  const fleurdelys = effectRegistry.byId.get(FLEURDELYS_CHARACTER_RESTRICTION_REVIEW.effectId);
  if (!fleurdelys) throw new Error('Fleurdelys character-restricted Aero bonus is missing from the modeled Echo effect catalog.');
  if (fleurdelys.echoId !== FLEURDELYS_CHARACTER_RESTRICTION_REVIEW.echoId || fleurdelys.value !== 0.10) {
    throw new Error('Fleurdelys character-restricted Aero bonus drifted from the reviewed source contract.');
  }
  if (JSON.stringify([...(fleurdelys.wielderCharacterIds ?? [])].sort()) !== JSON.stringify(['cartethyia', 'rover-aero'])) {
    throw new Error('Fleurdelys character restriction must remain exactly Cartethyia + Rover (Aero).');
  }
  if (ECHO_SKILL_PENDING_ADAPTER_FACTS.some((row) => row.echoId === FLEURDELYS_CHARACTER_RESTRICTION_REVIEW.echoId && row.kind === 'CHARACTER_RESTRICTION')) {
    throw new Error('Fleurdelys character restriction cannot remain both modeled and pending.');
  }

  const sigillum = effectRegistry.byId.get(SIGILLUM_CHARACTER_RESTRICTION_REVIEW.effectId);
  if (!sigillum) throw new Error('Sigillum character-restricted Resonance Liberation bonus is missing from the modeled Echo effect catalog.');
  if (sigillum.echoId !== SIGILLUM_CHARACTER_RESTRICTION_REVIEW.echoId || sigillum.value !== 0.25) {
    throw new Error('Sigillum character-restricted Resonance Liberation bonus drifted from the reviewed source contract.');
  }
  if (JSON.stringify(sigillum.wielderCharacterIds ?? []) !== JSON.stringify(['aemeath'])) {
    throw new Error('Sigillum character restriction must remain exactly Aemeath.');
  }
  if (ECHO_SKILL_PENDING_ADAPTER_FACTS.some((row) => row.echoId === SIGILLUM_CHARACTER_RESTRICTION_REVIEW.echoId && row.kind === 'CHARACTER_RESTRICTION')) {
    throw new Error('Sigillum character restriction cannot remain both modeled and pending.');
  }

  const adam = effectRegistry.byEchoId.get('echo-60002015') ?? [];
  if (adam.some((row) => row.statOrEffect === 'CRIT Rate')) {
    throw new Error('Adam Smasher character-restricted CRIT Rate must remain pending until its row is migrated onto the character-restriction primitive.');
  }
  const collapsar = effectRegistry.byEchoId.get('echo-60001809') ?? [];
  if (collapsar.some((row) => row.statOrEffect === 'Electro DMG Bonus' || row.statOrEffect === 'Spectro DMG Bonus')) {
    throw new Error('Twin Nova: Collapsar Blade element-converting main-slot bonus must remain pending until loadout-state replacement is modeled.');
  }

  return {
    releasedEchoCount: released.length,
    modeledEffectRowCount: effectRegistry.byId.size,
    modeledEffectEchoCount: effectRegistry.byEchoId.size,
    attackProfileCount: attackRegistry.byEchoId.size,
    attackFactCount: attackRegistry.attackById.size,
    pendingAdapterFactCount: ECHO_SKILL_PENDING_ADAPTER_FACTS.length,
    sourceUnusedParamRecordCount: ECHO_SKILL_SOURCE_UNUSED_PARAM_RECORDS.length,
  };
}
