import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ECHO_SKILL_PENDING_ADAPTER_FACTS,
  ECHO_SKILL_SOURCE_REVIEW_V36,
  ECHO_SKILL_SOURCE_UNUSED_PARAM_RECORDS,
} from '../src/data/echoSkillSourceReview.ts';
import { auditEchoSkillCoverage } from '../src/echoSkillCoverageRegistry.ts';

test('Version 3.6 Echo skill source review is roster-wide and execution-explicit', () => {
  const review = ECHO_SKILL_SOURCE_REVIEW_V36;
  assert.equal(review.expectedReleasedEchoCount, 181);
  assert.equal(review.expectedEnglishDescriptionCount, 181);
  assert.equal(review.expectedFiveRankParamRecordCount, 181);
  assert.equal(review.expectedCooldownRecordCount, 181);
  assert.equal(review.expectedSkillNameFieldCount, 0);
  assert.equal(review.expectedDamageTextRecordCount, 170);
  assert.equal(review.expectedNoDamageTextRecordCount, 11);
  assert.equal(review.expectedAttackProfileCount, 3);
  assert.equal(review.expectedAttackFactCount, 4);
});

test('Echo skill coverage audit fails closed around modeled and pending boundaries', () => {
  const summary = auditEchoSkillCoverage();
  assert.deepEqual(summary, {
    releasedEchoCount: 181,
    modeledEffectRowCount: 62,
    modeledEffectEchoCount: 37,
    attackProfileCount: 3,
    attackFactCount: 4,
    pendingAdapterFactCount: 7,
    sourceUnusedParamRecordCount: 3,
  });
});

test('known source parameter discrepancies stay explicit instead of being interpreted', () => {
  assert.deepEqual(
    ECHO_SKILL_SOURCE_UNUSED_PARAM_RECORDS.map((row) => [row.echoId, [...row.unusedRankParamIndexes]]),
    [
      ['echo-60001905', [2, 3]],
      ['echo-60000555', [3]],
      ['echo-60001725', [3]],
    ],
  );
});

test('specialized Echo effect semantics remain explicit pending adapter facts', () => {
  assert.equal(ECHO_SKILL_PENDING_ADAPTER_FACTS.length, 7);
  assert.ok(ECHO_SKILL_PENDING_ADAPTER_FACTS.some((row) => row.echoId === 'echo-60001809' && row.kind === 'LOADOUT_STATE_REPLACEMENT'));
  assert.ok(ECHO_SKILL_PENDING_ADAPTER_FACTS.some((row) => row.echoId === 'echo-60002015' && row.kind === 'CHARACTER_RESTRICTION'));
  assert.ok(ECHO_SKILL_PENDING_ADAPTER_FACTS.some((row) => row.echoId === 'echo-60000905' && row.kind === 'ECHO_SKILL_LOCAL_STATE'));
});
