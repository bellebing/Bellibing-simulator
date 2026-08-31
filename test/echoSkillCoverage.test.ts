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
  assert.equal(review.expectedModeledEffectRowCount, 64);
  assert.equal(review.expectedAttackProfileCount, 6);
  assert.equal(review.expectedAttackFactCount, 7);
});

test('Echo skill coverage audit fails closed around modeled and pending boundaries', () => {
  const summary = auditEchoSkillCoverage();
  assert.deepEqual(summary, {
    releasedEchoCount: 181,
    modeledEffectRowCount: 64,
    modeledEffectEchoCount: 37,
    attackProfileCount: 6,
    attackFactCount: 7,
    pendingAdapterFactCount: 6,
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
  assert.equal(ECHO_SKILL_PENDING_ADAPTER_FACTS.length, 6);
  assert.equal(
    ECHO_SKILL_PENDING_ADAPTER_FACTS.some((row) => row.echoId === 'echo-60001065' && row.kind === 'CHARACTER_RESTRICTION'),
    false,
  );
  assert.ok(ECHO_SKILL_PENDING_ADAPTER_FACTS.some((row) => row.echoId === 'echo-60001809' && row.kind === 'LOADOUT_STATE_REPLACEMENT'));
  assert.ok(ECHO_SKILL_PENDING_ADAPTER_FACTS.some((row) => row.echoId === 'echo-60002015' && row.kind === 'CHARACTER_RESTRICTION'));
  assert.ok(ECHO_SKILL_PENDING_ADAPTER_FACTS.some((row) => row.echoId === 'echo-60000905' && row.kind === 'ECHO_SKILL_LOCAL_STATE'));
});
