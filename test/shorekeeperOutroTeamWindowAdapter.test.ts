import assert from 'node:assert/strict';
import test from 'node:test';

import {
  activateShorekeeperOutroTeamWindow,
  isShorekeeperOutroTeamWindowActive,
  resolveShorekeeperOutroTeamWindowContract,
  SHOREKEEPER_OUTRO_TEAM_WINDOW_SEMANTIC_SPLIT,
  validateShorekeeperOutroTeamWindowContract,
} from '../src/combat/shorekeeperOutroTeamWindowAdapter.ts';
import { THE_SHOREKEEPER_PASSIVE_FACTS } from '../src/data/characterMechanics/theShorekeeperRawFacts.ts';

const REFERENCE_TEAM_IDS = ['augusta', 'iuno', 'the-shorekeeper'] as const;

test('Shorekeeper Outro contract derives team amplification and duration from canonical Character fact', () => {
  assert.deepEqual(validateShorekeeperOutroTeamWindowContract(), []);
  const contract = resolveShorekeeperOutroTeamWindowContract();

  assert.equal(contract.sourceFactId, 'the-shorekeeper-outro-binary-butterfly');
  assert.equal(contract.sourceCharacterId, 'the-shorekeeper');
  assert.equal(contract.scope, 'TEAM');
  assert.equal(contract.statOrEffect, 'DMG Amplification');
  assert.equal(contract.amplification, 0.15);
  assert.equal(contract.durationSeconds, 30);
  assert.equal(SHOREKEEPER_OUTRO_TEAM_WINDOW_SEMANTIC_SPLIT.requiresProfileEventTimeline, true);
  assert.deepEqual(SHOREKEEPER_OUTRO_TEAM_WINDOW_SEMANTIC_SPLIT.closesPendingExecutionIds, []);
});

test('Shorekeeper Outro activates only from an explicit Shorekeeper cast and binds selected team membership', () => {
  const window = activateShorekeeperOutroTeamWindow({
    event: {
      kind: 'OUTRO_SKILL_CAST',
      actorId: 'the-shorekeeper',
      atSeconds: 5,
    },
    teamMemberIds: REFERENCE_TEAM_IDS,
  });

  assert.ok(window);
  assert.equal(window.sourceLayer, 'CHARACTER');
  assert.equal(window.sourceFactId, 'the-shorekeeper-outro-binary-butterfly');
  assert.equal(window.value, 0.15);
  assert.deepEqual(window.teamMemberIds, [...REFERENCE_TEAM_IDS]);
  assert.equal(window.startedAtSeconds, 5);
  assert.equal(window.expiresAtSeconds, 35);

  assert.equal(isShorekeeperOutroTeamWindowActive(window, 'augusta', 5), true);
  assert.equal(isShorekeeperOutroTeamWindowActive(window, 'iuno', 34.999), true);
  assert.equal(isShorekeeperOutroTeamWindowActive(window, 'the-shorekeeper', 10), true);
  assert.equal(isShorekeeperOutroTeamWindowActive(window, 'cartethyia', 10), false);
  assert.equal(isShorekeeperOutroTeamWindowActive(window, 'augusta', 35), false);
});

test('Shorekeeper Outro fails closed on wrong actor, malformed events and invalid team identity', () => {
  assert.equal(activateShorekeeperOutroTeamWindow({
    event: {
      kind: 'OUTRO_SKILL_CAST',
      actorId: 'iuno',
      atSeconds: 5,
    },
    teamMemberIds: REFERENCE_TEAM_IDS,
  }), null);

  assert.throws(() => activateShorekeeperOutroTeamWindow({
    event: {
      kind: 'FAKE_EVENT' as never,
      actorId: 'the-shorekeeper',
      atSeconds: 5,
    },
    teamMemberIds: REFERENCE_TEAM_IDS,
  }), /unsupported Shorekeeper Outro event kind/);

  assert.throws(() => activateShorekeeperOutroTeamWindow({
    event: {
      kind: 'OUTRO_SKILL_CAST',
      actorId: 'the-shorekeeper',
      atSeconds: 5,
    },
    teamMemberIds: ['augusta', 'iuno'],
  }), /must include the-shorekeeper/);

  assert.throws(() => activateShorekeeperOutroTeamWindow({
    event: {
      kind: 'OUTRO_SKILL_CAST',
      actorId: 'the-shorekeeper',
      atSeconds: 5,
    },
    teamMemberIds: ['augusta', 'the-shorekeeper', 'augusta'],
  }), /duplicate Character ids/);
});

test('Shorekeeper Outro source drift fails instead of retaining stale team values', () => {
  const driftedScope = THE_SHOREKEEPER_PASSIVE_FACTS.map((fact) => fact.factId === 'the-shorekeeper-outro-binary-butterfly'
    ? { ...fact, scope: 'SELF' as const }
    : fact);
  assert.ok(validateShorekeeperOutroTeamWindowContract(driftedScope).some((issue) => issue.includes('TEAM scope')));

  const driftedText = THE_SHOREKEEPER_PASSIVE_FACTS.map((fact) => fact.factId === 'the-shorekeeper-outro-binary-butterfly'
    ? { ...fact, effectSummary: 'Source text intentionally drifted for test coverage.' }
    : fact);
  assert.ok(validateShorekeeperOutroTeamWindowContract(driftedText).some((issue) => issue.includes('parseable team DMG Amplification')));
  assert.throws(
    () => resolveShorekeeperOutroTeamWindowContract(driftedText),
    /Invalid Shorekeeper Outro team-window contract/,
  );
});
