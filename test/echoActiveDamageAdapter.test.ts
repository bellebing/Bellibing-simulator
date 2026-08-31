import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ECHO_ACTIVE_DAMAGE_PRIMITIVE_ID,
  resolveExactEchoActiveDamage,
} from '../src/combat/echoActiveDamageAdapter.ts';

test('exact active Echo primitive resolves Fleurdelys Rank-5 Windcleaver without inventing timing', () => {
  const resolved = resolveExactEchoActiveDamage('echo-60001065', 'FLEURDELYS_WINDCLEAVER_SUMMON');
  assert.equal(resolved.primitiveId, ECHO_ACTIVE_DAMAGE_PRIMITIVE_ID);
  assert.equal(resolved.echoId, 'echo-60001065');
  assert.equal(resolved.attackId, 'FLEURDELYS_WINDCLEAVER_SUMMON');
  assert.equal(resolved.element, 'Aero');
  assert.equal(resolved.scalingStat, 'ATK');
  assert.ok(Math.abs(resolved.motionValue - 3.5568) < 1e-12);
  assert.equal(Object.hasOwn(resolved, 'timestamp'), false);
  assert.equal(Object.hasOwn(resolved, 'uptime'), false);
});

test('exact active Echo primitive rejects attacks not owned by the requested Echo', () => {
  assert.throws(
    () => resolveExactEchoActiveDamage('echo-60001065', 'FALSE_SOV_ACTIVE_SPIN'),
    /does not own exact Echo attack/,
  );
});

test('exact active Echo primitive does not reinterpret automatic summons as active casts', () => {
  assert.throws(
    () => resolveExactEchoActiveDamage('echo-60001215', 'FALSE_SOV_INTRO_SUMMON'),
    /not an ACTIVE_CAST attack/,
  );
});

test('exact active Echo primitive fails closed when no exact attack profile exists', () => {
  assert.throws(
    () => resolveExactEchoActiveDamage('echo-60000905', 'UNMODELED_NIGHTMARE_CROWNLESS_ACTIVE'),
    /No exact Echo attack profile/,
  );
});
