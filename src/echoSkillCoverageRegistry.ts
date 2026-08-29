import { ECHO_ATTACK_PROFILES } from './data/echoAttacks.ts';
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

  const knownEchoIds = new Set(released.map((row) => row.id));
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
    if (row.unusedRankParamIndexes.length === 0) throw new Error(`${row.echoId} source discrepancy has no unused parameter indexes.`);
  }
  if (ECHO_SKILL_SOURCE_UNUSED_PARAM_RECORDS.length !== review.expectedUnusedParamRecordCount) {
    throw new Error(`Expected ${review.expectedUnusedParamRecordCount} source unused-param records, got ${ECHO_SKILL_SOURCE_UNUSED_PARAM_RECORDS.length}.`);
  }

  const adam = effectRegistry.byEchoId.get('echo-60002015') ?? [];
  if (adam.some((row) => row.statOrEffect === 'CRIT Rate')) {
    throw new Error('Adam Smasher character-restricted CRIT Rate must remain pending until a character-restriction adapter exists.');
  }
  const sigillum = effectRegistry.byEchoId.get('echo-60001915') ?? [];
  if (sigillum.some((row) => row.statOrEffect === 'Resonance Liberation DMG Bonus')) {
    throw new Error('Sigillum character-restricted Resonance Liberation bonus must remain pending.');
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
