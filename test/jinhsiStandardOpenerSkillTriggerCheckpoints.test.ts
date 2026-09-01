import assert from 'node:assert/strict';
import test from 'node:test';

import {
  JINHSI_STANDARD_OPENER_AH_SKILL_PENDING_EXECUTION_ID,
  JINHSI_STANDARD_OPENER_SKILL_TRIGGER_CHECKPOINT_PRIMITIVE_ID,
  JINHSI_STANDARD_OPENER_SKILL_TRIGGER_SOURCE_REVIEW,
  resolveJinhsiStandardOpenerSkillTriggerCheckpoints,
} from '../src/combat/jinhsiStandardOpenerSkillTriggerCheckpoints.ts';
import { JINHSI_STANDARD_OPENER_EXECUTION_REVIEW_20260901 } from '../src/data/jinhsiStandardOpenerExecutionReview20260901.ts';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { resolveBuildPreset } from '../src/profileRegistry.ts';

const resolved = resolveBuildPreset(PROFILE_REGISTRY, 'jinhsi-standard-opener');
const sourceSequence = resolved.rotation.sourceSequence ?? [];

test('canonical Standard Opener source proves exactly two AH-SKILL cast-trigger checkpoints', () => {
  const result = resolveJinhsiStandardOpenerSkillTriggerCheckpoints(sourceSequence);

  assert.equal(result.primitiveId, JINHSI_STANDARD_OPENER_SKILL_TRIGGER_CHECKPOINT_PRIMITIVE_ID);
  assert.equal(result.pendingExecutionId, JINHSI_STANDARD_OPENER_AH_SKILL_PENDING_EXECUTION_ID);
  assert.deepEqual(
    result.skillCastCheckpoints.map((row) => ({ step: row.step, sourceStep: row.sourceStep, eventKind: row.eventKind })),
    [
      { step: 5, sourceStep: 'Skill: Overflowing Radiance', eventKind: 'RESONANCE_SKILL_CAST' },
      { step: 11, sourceStep: 'Skill: Illuminous Epiphany', eventKind: 'RESONANCE_SKILL_CAST' },
    ],
  );
  assert.ok(result.skillCastCheckpoints.every((row) => row.weaponEffectId === 'AH-SKILL'));
  assert.ok(result.skillCastCheckpoints.every((row) => row.sourceProvesTriggerIdentity));
  assert.ok(result.skillCastCheckpoints.every((row) => row.exactAtSeconds === null));
  assert.ok(result.skillCastCheckpoints.every((row) => row.exactWindowPlacementKnown === false));
});

test('Incarnation Basics stay Resonance Skill DMG without becoming Resonance Skill cast triggers', () => {
  const result = resolveJinhsiStandardOpenerSkillTriggerCheckpoints(sourceSequence);

  assert.deepEqual(result.skillDamageOnlyCheckpoints.map((row) => row.step), [7, 8, 9, 10]);
  assert.ok(result.skillDamageOnlyCheckpoints.every((row) => row.damageClassification === 'RESONANCE_SKILL_DMG'));
  assert.ok(result.skillDamageOnlyCheckpoints.every((row) => row.isResonanceSkillCast === false));
  assert.ok(result.skillDamageOnlyCheckpoints.every((row) => row.triggersAgesSkillWindow === false));
});

test('trigger checkpoints remain evidence-only until exact timestamps and retrigger lifecycle exist', () => {
  const result = resolveJinhsiStandardOpenerSkillTriggerCheckpoints(sourceSequence);

  assert.equal(result.exactActionTimestampsKnown, false);
  assert.equal(result.sameEffectRetriggerLifecycleKnown, false);
  assert.equal(result.dependencyClosed, false);
  assert.deepEqual(JINHSI_STANDARD_OPENER_SKILL_TRIGGER_SOURCE_REVIEW.closesPendingExecutionIds, []);
  assert.equal(
    JINHSI_STANDARD_OPENER_EXECUTION_REVIEW_20260901.weapon.skillWindow.exactWindowPlacementKnown,
    false,
  );
  assert.equal(JINHSI_STANDARD_OPENER_EXECUTION_REVIEW_20260901.engineModeled, false);
  assert.equal(JINHSI_STANDARD_OPENER_EXECUTION_REVIEW_20260901.dpsReady, false);
});

test('skill-trigger resolver fails closed on sequence drift and cannot inherit Expert/Advanced variants', () => {
  assert.throws(
    () => resolveJinhsiStandardOpenerSkillTriggerCheckpoints(sourceSequence.slice(1)),
    /source sequence length drift/,
  );
  assert.throws(
    () => resolveJinhsiStandardOpenerSkillTriggerCheckpoints(
      sourceSequence.map((step, index) => index === 4 ? 'Skill: Crescent Divinity' : step),
    ),
    /source sequence drift at step 5/,
  );
});
