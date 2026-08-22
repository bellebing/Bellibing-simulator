import assert from 'node:assert/strict';
import test from 'node:test';
import type { Echo, EchoLevel } from '../src/echoCoreDomain.ts';
import {
  applyCheckpointAssessment,
  createRollAssistantSession,
  getNextInstruction,
  recordCheckpoint,
  setUpgradeTarget,
  startCandidate,
  type RollAssistantSession,
} from '../src/rollAssistantSession.ts';

function echo(id: string, level: EchoLevel, stats: Echo['substats'] = []): Echo {
  return {
    id,
    rank: 5,
    cost: 3,
    mainStat: { name: 'Electro DMG', value: 0.3 },
    secondaryMainStat: { name: 'Flat ATK', value: 100 },
    level,
    substats: stats,
  };
}

function advanceTo(
  session: RollAssistantSession,
  id: string,
  target: Exclude<EchoLevel, 0>,
  finalStats: Echo['substats'] = [],
): RollAssistantSession {
  for (const level of [5, 10, 15, 20, 25] as const) {
    const stats = level === target ? finalStats : [];
    session = recordCheckpoint(session, echo(id, level, stats));
    if (level === target) return session;
    session = applyCheckpointAssessment(session, { decision: 'ROLL' }).session;
  }
  throw new Error(`Unable to reach +${target}.`);
}

test('normal mode starts by telling the user only which Echo to start', () => {
  const session = createRollAssistantSession('RECOMMENDED');
  assert.deepEqual(getNextInstruction(session), {
    action: 'START',
    slotIndex: 0,
    headline: 'START NEW ECHO',
  });
});

test('an active +0 candidate produces the simple ROLL TO +5 instruction', () => {
  const session = startCandidate(createRollAssistantSession(), 0, echo('candidate-a', 0));
  assert.deepEqual(getNextInstruction(session), {
    action: 'ROLL',
    slotIndex: 0,
    toLevel: 5,
    headline: 'ROLL TO +5',
  });
});

test('checkpoint entry cannot skip ahead of the instruction', () => {
  const session = startCandidate(createRollAssistantSession(), 0, echo('candidate-a', 0));
  assert.throws(
    () => recordCheckpoint(session, echo('candidate-a', 15, [{ name: 'CRIT Rate', value: 0.075 }])),
    /Expected checkpoint \+5, got \+15/,
  );
});

test('DISCARD retries the same slot instead of moving the build forward', () => {
  let session = startCandidate(createRollAssistantSession(), 0, echo('bad-a', 0));
  session = recordCheckpoint(session, echo('bad-a', 5, [{ name: 'Flat DEF', value: 40 }]));

  const result = applyCheckpointAssessment(session, {
    decision: 'DISCARD',
    reason: 'This branch no longer reaches the selected build target cheaply enough.',
  });

  assert.equal(result.instruction.action, 'DISCARD');
  assert.equal(result.session.slots[0]?.status, 'EMPTY');
  assert.equal(result.session.slots[0]?.attempts, 1);
  assert.equal(getNextInstruction(result.session).slotIndex, 0);
});

test('ROLL decision advances only the instruction, never invents a good/bad stat rule', () => {
  let session = startCandidate(createRollAssistantSession(), 0, echo('mixed-a', 0));
  session = recordCheckpoint(session, echo('mixed-a', 5, [{ name: 'Flat DEF', value: 40 }]));

  const result = applyCheckpointAssessment(session, {
    decision: 'ROLL',
    reason: 'External evaluator says the branch is still viable.',
  });

  assert.deepEqual(result.instruction, {
    action: 'ROLL',
    slotIndex: 0,
    toLevel: 10,
    headline: 'ROLL TO +10',
  });
  assert.equal(result.session.slots[0]?.status, 'ROLLING');
});

test('TEMPORARY means usable now and moves the assistant to the next empty slot', () => {
  let session = startCandidate(createRollAssistantSession(), 0, echo('temp-a', 0));
  session = advanceTo(session, 'temp-a', 20, [
    { name: 'ATK%', value: 0.079 },
    { name: 'Heavy Attack DMG', value: 0.094 },
    { name: 'Flat DEF', value: 40 },
    { name: 'CRIT Rate', value: 0.063 },
  ]);

  const result = applyCheckpointAssessment(session, { decision: 'TEMPORARY' });
  assert.equal(result.instruction.headline, 'USE FOR NOW');
  assert.equal(result.session.slots[0]?.status, 'TEMPORARY');
  assert.deepEqual(getNextInstruction(result.session), {
    action: 'START',
    slotIndex: 1,
    headline: 'START NEW ECHO',
  });
});

test('five usable Echoes enter upgrade mode; upgrade target is supplied externally', () => {
  let session = createRollAssistantSession('HIGH_END');

  for (let slot = 0; slot < 5; slot += 1) {
    const id = `echo-${slot}`;
    session = startCandidate(session, slot, echo(id, 0));
    session = advanceTo(session, id, 25, [
      { name: 'CRIT Rate', value: 0.075 },
      { name: 'CRIT DMG', value: 0.15 },
    ]);
    session = applyCheckpointAssessment(session, {
      decision: slot === 4 ? 'KEEP' : 'TEMPORARY',
    }).session;
  }

  assert.equal(session.phase, 'UPGRADE');
  assert.throws(() => getNextInstruction(session), /externally evaluated upgrade target/);

  session = setUpgradeTarget(session, 3);
  assert.deepEqual(getNextInstruction(session), {
    action: 'UPGRADE',
    slotIndex: 3,
    headline: 'UPGRADE THIS ECHO',
  });
});

test('the whole-build evaluator can mark the build done without forcing another upgrade', () => {
  let session = createRollAssistantSession();
  for (let slot = 0; slot < 5; slot += 1) {
    const id = `kept-${slot}`;
    session = startCandidate(session, slot, echo(id, 0));
    session = advanceTo(session, id, 25, [{ name: 'CRIT Rate', value: 0.093 }]);
    session = applyCheckpointAssessment(session, { decision: 'KEEP' }).session;
  }

  session = setUpgradeTarget(session, null);
  assert.deepEqual(getNextInstruction(session), { action: 'DONE', headline: 'BUILD DONE' });
});
