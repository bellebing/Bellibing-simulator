import assert from 'node:assert/strict';
import test from 'node:test';

import {
  JINHSI_STANDARD_OPENER_COMBAT_START_CLOSED_PENDING_EXECUTION_IDS,
  JINHSI_STANDARD_OPENER_COMBAT_START_SOURCE_REVIEW,
  resolveJinhsiStandardOpenerCombatStartState,
} from '../src/combat/jinhsiStandardOpenerCombatStartState.ts';

const CANONICAL_STANDARD_OPENER = [
  'Basic P1',
  'Basic P2',
  'Basic P3',
  'Basic P4',
  'Skill: Overflowing Radiance',
  'Ultimate',
  'Incarnation Basic P1',
  'Incarnation Basic P2',
  'Incarnation Basic P3',
  'Incarnation Basic P4',
  'Skill: Illuminous Epiphany',
  'Outro',
] as const;

test('combat-start Standard Opener proves Intro windows inactive without inventing other state', () => {
  const resolved = resolveJinhsiStandardOpenerCombatStartState(CANONICAL_STANDARD_OPENER);

  assert.equal(resolved.sourceScope, 'SOURCE_DEFINED_COMBAT_START_BEFORE_TEAM_SETUP');
  assert.equal(resolved.canonicalIntroSkillCastPresent, false);
  assert.equal(resolved.agesIntroWindowActive, false);
  assert.equal(resolved.celestialIntroWindowActive, false);
  assert.equal(resolved.teamIncomingStateActive, false);
  assert.equal(resolved.zhezhiIncomingStateActive, false);
  assert.equal(resolved.verinaIncomingStateActive, false);

  assert.equal(resolved.agesSkillWindowResolved, false);
  assert.equal(resolved.jueCastResolved, false);
  assert.equal(resolved.incandescenceTimelineResolved, false);
  assert.equal(resolved.exactTimelineResolved, false);
});

test('combat-start review closes only the two source-proven inactive Intro-trigger edges', () => {
  assert.deepEqual(JINHSI_STANDARD_OPENER_COMBAT_START_CLOSED_PENDING_EXECUTION_IDS, [
    'weapon:ages-of-harvest:AH-INTRO:trigger-uptime-adapter',
    'sonata:sonata-5:S05_5PC_SPECTRO:trigger-uptime-adapter',
  ]);
  assert.deepEqual(
    JINHSI_STANDARD_OPENER_COMBAT_START_SOURCE_REVIEW.closesPendingExecutionIds,
    JINHSI_STANDARD_OPENER_COMBAT_START_CLOSED_PENDING_EXECUTION_IDS,
  );
  assert.ok(JINHSI_STANDARD_OPENER_COMBAT_START_SOURCE_REVIEW.boundaries.some((note) => note.includes('AH-SKILL remains pending')));
  assert.ok(JINHSI_STANDARD_OPENER_COMBAT_START_SOURCE_REVIEW.boundaries.some((note) => note.includes('Jué remains pending')));
  assert.ok(JINHSI_STANDARD_OPENER_COMBAT_START_SOURCE_REVIEW.boundaries.some((note) => note.includes('incoming-state dependency remains pending')));
  assert.ok(JINHSI_STANDARD_OPENER_COMBAT_START_SOURCE_REVIEW.boundaries.some((note) => note.includes('Incandescence remains pending')));
});

test('combat-start resolver fails closed on source-sequence drift', () => {
  assert.throws(
    () => resolveJinhsiStandardOpenerCombatStartState([
      'Intro',
      ...CANONICAL_STANDARD_OPENER.slice(1),
    ]),
    /source sequence drift at step 1/,
  );
});
