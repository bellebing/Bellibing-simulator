import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SIGRIKA_STANDARD_CHARACTER_ECHO_DAMAGE_TRIGGER_SEMANTICS,
  SIGRIKA_STANDARD_SOURCE_EVENT_BOUNDARIES,
  SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON,
  SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON_REVIEW,
  validateSigrikaStandardSourceEventSkeleton,
} from '../src/combat/sigrikaStandardSourceEventSkeleton.ts';
import { SIGRIKA_STANDARD_CANONICAL_SOURCE_SEQUENCE } from '../src/combat/sigrikaStandardSourceCheckpoints.ts';
import { SIGRIKA_STANDARD_PENDING_EXECUTION_IDS } from '../src/data/sigrikaExecutionPreflight20260901.ts';

test('Sigrika canonical event skeleton binds all fixed source steps without timestamps', () => {
  assert.deepEqual(validateSigrikaStandardSourceEventSkeleton(), []);
  assert.equal(SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON.length, 14);
  assert.deepEqual(
    SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON.map((row) => row.sourceLabel),
    SIGRIKA_STANDARD_CANONICAL_SOURCE_SEQUENCE,
  );
  assert.equal(SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON.every((row) => row.exactTimestampSeconds === null), true);
  assert.equal(SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON_REVIEW.closesPendingExecutionIds.length, 0);
  assert.equal(SIGRIKA_STANDARD_PENDING_EXECUTION_IDS.length, 10);
});

test('fixed Sigrika source order proves trigger checkpoints but not timed-window overlap', () => {
  assert.equal(SIGRIKA_STANDARD_SOURCE_EVENT_BOUNDARIES.introSkillCastStepIndex, 0);
  assert.equal(SIGRIKA_STANDARD_SOURCE_EVENT_BOUNDARIES.firstEchoSkillDamageStepIndex, 4);
  assert.deepEqual(SIGRIKA_STANDARD_SOURCE_EVENT_BOUNDARIES.echoSkillDamageStepIndexes, [4, 5, 6, 10, 11, 12]);
  assert.equal(SIGRIKA_STANDARD_SOURCE_EVENT_BOUNDARIES.fixedMainEchoCastStepIndex, null);
  assert.equal(SIGRIKA_STANDARD_SOURCE_EVENT_BOUNDARIES.mainEchoPlacement, 'FLEXIBLE_NOT_PART_OF_FIXED_SOURCE_SEQUENCE');
  assert.equal(SIGRIKA_STANDARD_SOURCE_EVENT_BOUNDARIES.exactActionTimestampsAvailable, false);
  assert.equal(SIGRIKA_STANDARD_SOURCE_EVENT_BOUNDARIES.exactTimedWindowOverlapAvailable, false);
  assert.equal(SIGRIKA_STANDARD_SOURCE_EVENT_BOUNDARIES.exactRotationSecondsAvailable, false);
});

test('first Schemata is high-Vitality guaranteed while second modifier branch remains unresolved', () => {
  assert.equal(SIGRIKA_STANDARD_SOURCE_EVENT_BOUNDARIES.firstSchemataHighVitalityPathGuaranteed, true);
  assert.equal(SIGRIKA_STANDARD_SOURCE_EVENT_BOUNDARIES.secondSchemataHighVitalityPathGuaranteed, false);

  const chainWhip = SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON[5];
  assert.equal(chainWhip.damageEventKind, 'ECHO_SKILL_DAMAGE');
  assert.deepEqual(chainWhip.damageFactIds, [
    'sigrika-forte-circuit-within-infinity-s-embrace-heavy-attack-schemata-of-runes-dmg',
    'sigrika-forte-circuit-within-infinity-s-embrace-runic-chain-whip-dmg',
  ]);
  assert.equal(chainWhip.cancelIntoNext, 'ULTIMATE_ON_HIT');
  assert.equal(chainWhip.sourceStateFacts.some((note) => note.includes('>=30 Soliskin Vitality')), true);

  const outburst = SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON[11];
  assert.equal(outburst.damageEventKind, 'ECHO_SKILL_DAMAGE');
  assert.deepEqual(outburst.damageFactIds, [
    'sigrika-forte-circuit-within-infinity-s-embrace-heavy-attack-schemata-of-runes-dmg',
    'sigrika-forte-circuit-within-infinity-s-embrace-runic-outburst-dmg',
  ]);
  assert.equal(outburst.cancelIntoNext, 'HOLD_SKILL');
  assert.equal(outburst.sourceStateFacts.some((note) => note.includes('remain unresolved')), true);
});

test('Character Echo Skill DMG stays separate from equipped Echo Skill cast triggers', () => {
  const echoDamageSteps = SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON.filter((row) => row.damageEventKind === 'ECHO_SKILL_DAMAGE');
  assert.equal(echoDamageSteps.length, 6);
  assert.equal(echoDamageSteps.some((row) => row.castEventKind === 'INTRO_SKILL_CAST'), false);
  assert.equal(echoDamageSteps.some((row) => row.castEventKind === 'OUTRO_SKILL_CAST'), false);

  assert.deepEqual(SIGRIKA_STANDARD_CHARACTER_ECHO_DAMAGE_TRIGGER_SEMANTICS, {
    sourceLabel: 'Game8 — Sigrika Echo Skill damage/cast distinction',
    sourceUrl: 'https://game8.co/games/Wuthering-Waves/archives/507924',
    fixedCharacterEchoSkillDamageCountsAsEquippedEchoSkillCast: false,
    fixedCharacterEchoSkillDamageCanFeedSoliskinVitalityEchoCastTrigger: false,
    fixedCharacterEchoSkillDamageCanFeedBlessingOfRunesEchoCastTrigger: false,
    fixedCharacterEchoSkillDamageCanTriggerSolswornEchoCastWindow: false,
    fixedCharacterEchoSkillDamageCanTriggerEchoSkillDamageWindows: true,
  });

  assert.equal(SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON[0].castEventKind, 'INTRO_SKILL_CAST');
  assert.equal(SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON[6].castEventKind, 'RESONANCE_LIBERATION_CAST');
  assert.equal(SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON[12].castEventKind, 'FORTE_HOLD_CAST');
  assert.equal(SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON[13].castEventKind, 'OUTRO_SKILL_CAST');
});
