import assert from 'node:assert/strict';
import test from 'node:test';

import { AUGUSTA_RECOMMENDED_V915 } from '../src/characters/augustaRecommended.ts';
import { createRank5EchoAtLevel0, type Echo } from '../src/echoCore.ts';
import { evaluateRollAssistantCheckpoint } from '../src/rollAssistantCheckpoint.ts';
import { createRollAssistantSession, startCandidate } from '../src/rollAssistantSession.ts';

function freshSession() {
  const candidate = createRank5EchoAtLevel0({
    id: 'bug-001-candidate',
    cost: 4,
    primaryMainStat: 'CRIT Rate',
  });
  return startCandidate(createRollAssistantSession('RECOMMENDED'), 0, candidate);
}

function checkpointEcho(session: ReturnType<typeof freshSession>, level: 5 | 10, substats: Echo['substats']): Echo {
  const echo = session.slots[0]?.echo;
  assert.ok(echo);
  return {
    ...echo,
    level,
    substats,
  };
}

test('BUG-001 path: +5 CRIT Rate 6.3% is a real policy DISCARD', () => {
  const session = freshSession();
  const result = evaluateRollAssistantCheckpoint(
    session,
    AUGUSTA_RECOMMENDED_V915,
    checkpointEcho(session, 5, [{ name: 'CRIT Rate', value: 0.063 }]),
  );

  assert.equal(result.evaluation.assessment.decision, 'DISCARD');
  assert.equal(result.instruction.action, 'DISCARD');
});

test('BUG-001 path: +5 CRIT Rate 9.3% continues to +10', () => {
  const session = freshSession();
  const result = evaluateRollAssistantCheckpoint(
    session,
    AUGUSTA_RECOMMENDED_V915,
    checkpointEcho(session, 5, [{ name: 'CRIT Rate', value: 0.093 }]),
  );

  assert.equal(result.evaluation.assessment.decision, 'ROLL');
  assert.equal(result.instruction.action, 'ROLL');
  if (result.instruction.action === 'ROLL') assert.equal(result.instruction.toLevel, 10);
  assert.equal(result.session.slots[0]?.echo?.level, 5);
});

test('BUG-001 path: strong CRIT Rate plus Flat DEF at +10 still continues to +15', () => {
  const initial = freshSession();
  const at5 = evaluateRollAssistantCheckpoint(
    initial,
    AUGUSTA_RECOMMENDED_V915,
    checkpointEcho(initial, 5, [{ name: 'CRIT Rate', value: 0.093 }]),
  );
  const at10Echo = checkpointEcho(at5.session as ReturnType<typeof freshSession>, 10, [
    { name: 'CRIT Rate', value: 0.093 },
    { name: 'Flat DEF', value: 40 },
  ]);
  const at10 = evaluateRollAssistantCheckpoint(at5.session, AUGUSTA_RECOMMENDED_V915, at10Echo);

  assert.equal(at10.evaluation.assessment.decision, 'ROLL');
  assert.equal(at10.instruction.action, 'ROLL');
  if (at10.instruction.action === 'ROLL') assert.equal(at10.instruction.toLevel, 15);
  assert.equal(at10.evaluation.state.deadCount, 1);
});

test('integration faults throw instead of being converted into a DISCARD verdict', () => {
  const session = freshSession();
  assert.throws(
    () => evaluateRollAssistantCheckpoint(
      session,
      AUGUSTA_RECOMMENDED_V915,
      checkpointEcho(session, 10, [
        { name: 'CRIT Rate', value: 0.093 },
        { name: 'Flat DEF', value: 40 },
      ]),
    ),
    /Expected checkpoint \+5, got \+10/,
  );
});
