import assert from 'node:assert/strict';
import test from 'node:test';

import {
  activateMoongazersSigilIntroForcedMaxWindow,
  applyMoongazersSigilShieldEvent,
  createMoongazersSigilKnownShieldState,
  isMoongazersSigilIntroForcedMaxActive,
  MOONGAZERS_SIGIL_SHIELD_STACK_SEMANTIC_REVIEW,
  resolveMoongazersSigilOrganicDefIgnore,
  validateMoongazersSigilShieldStackContract,
} from '../src/combat/moongazersSigilShieldStackAdapter.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';

test('Moongazer shield-stack contract locks exact raw facts but closes no Lingyang dependency', () => {
  assert.deepEqual(validateMoongazersSigilShieldStackContract(), []);
  assert.equal(MOONGAZERS_SIGIL_SHIELD_STACK_SEMANTIC_REVIEW.status, 'BLOCKED_SOURCE_SEMANTICS');
  assert.equal(MOONGAZERS_SIGIL_SHIELD_STACK_SEMANTIC_REVIEW.blockerId, 'BUG-017');
  assert.deepEqual(MOONGAZERS_SIGIL_SHIELD_STACK_SEMANTIC_REVIEW.closesPendingExecutionIds, []);
  assert.deepEqual(MOONGAZERS_SIGIL_SHIELD_STACK_SEMANTIC_REVIEW.pendingExecutionIds, [
    'weapon:moongazers-sigil:MGS-DEF:shield-stack-state-adapter',
    'weapon:moongazers-sigil:MGS-MAX-STACK:cross-effect-stack-override-adapter',
  ]);
});

test('explicit owner Shield events grant independent seven-second stacks at most once every 0.5 seconds', () => {
  let state = createMoongazersSigilKnownShieldState({
    ownerId: 'lingyang',
    knownAtSeconds: 0,
    organicStackExpiriesSeconds: [],
    lastAcceptedShieldAtSeconds: null,
  });

  const first = applyMoongazersSigilShieldEvent(state, { actorId: 'lingyang', atSeconds: 0 });
  assert.equal(first.status, 'STACK_GRANTED');
  assert.equal(first.grantedStackExpiresAtSeconds, 7);
  state = first.state;

  const cooldown = applyMoongazersSigilShieldEvent(state, { actorId: 'lingyang', atSeconds: 0.49 });
  assert.equal(cooldown.status, 'TRIGGER_COOLDOWN');
  assert.equal(cooldown.state.organicStackExpiriesSeconds.length, 1);
  state = cooldown.state;

  const second = applyMoongazersSigilShieldEvent(state, { actorId: 'lingyang', atSeconds: 0.5 });
  assert.equal(second.status, 'STACK_GRANTED');
  assert.deepEqual(second.state.organicStackExpiriesSeconds, [7, 7.5]);
  state = second.state;

  for (const atSeconds of [1, 1.5, 2]) {
    const result = applyMoongazersSigilShieldEvent(state, { actorId: 'lingyang', atSeconds });
    assert.equal(result.status, 'STACK_GRANTED');
    state = result.state;
  }

  const read = resolveMoongazersSigilOrganicDefIgnore({ state, rank: 1, atSeconds: 2 });
  assert.equal(read.damageClass, 'RESONANCE_LIBERATION');
  assert.equal(read.activeOrganicStackCount, 5);
  assert.equal(read.valuePerStack, 0.072);
  assert.ok(Math.abs(read.totalOrganicValue - 0.36) < 1e-12);

  const afterFirstExpiry = resolveMoongazersSigilOrganicDefIgnore({ state, rank: 1, atSeconds: 7 });
  assert.equal(afterFirstExpiry.activeOrganicStackCount, 4);
});

test('eligible Shield event at five active stacks fails closed instead of guessing cap refresh semantics', () => {
  let state = createMoongazersSigilKnownShieldState({
    ownerId: 'lingyang',
    knownAtSeconds: 0,
    organicStackExpiriesSeconds: [],
    lastAcceptedShieldAtSeconds: null,
  });
  for (const atSeconds of [0, 0.5, 1, 1.5, 2]) {
    const result = applyMoongazersSigilShieldEvent(state, { actorId: 'lingyang', atSeconds });
    assert.equal(result.status, 'STACK_GRANTED');
    state = result.state;
  }

  const atCap = applyMoongazersSigilShieldEvent(state, { actorId: 'lingyang', atSeconds: 2.5 });
  assert.equal(atCap.status, 'SOURCE_CAP_REFRESH_UNRESOLVED');
  assert.equal(atCap.state.organicStackExpiriesSeconds.length, 5);
  assert.ok(atCap.unresolvedSemantics.some((note) => note.includes('refresh/replacement/ignore')));
  assert.equal(atCap.state.lastAcceptedShieldAtSeconds, 2);
});

test('known Shield state is monotonic and cannot hide cooldown history', () => {
  assert.throws(
    () => createMoongazersSigilKnownShieldState({
      ownerId: 'lingyang',
      knownAtSeconds: 1,
      organicStackExpiriesSeconds: [7],
      lastAcceptedShieldAtSeconds: null,
    }),
    /known last accepted Shield event/,
  );
  assert.throws(
    () => createMoongazersSigilKnownShieldState({
      ownerId: 'lingyang',
      knownAtSeconds: 1,
      organicStackExpiriesSeconds: [7.2],
      lastAcceptedShieldAtSeconds: 0,
    }),
    /seven-second expiry/,
  );

  const state = createMoongazersSigilKnownShieldState({
    ownerId: 'lingyang',
    knownAtSeconds: 1,
    organicStackExpiriesSeconds: [7.5],
    lastAcceptedShieldAtSeconds: 0.5,
  });
  assert.throws(
    () => applyMoongazersSigilShieldEvent(state, { actorId: 'lingyang', atSeconds: 0.9 }),
    /must not move backward/,
  );
  assert.throws(
    () => resolveMoongazersSigilOrganicDefIgnore({ state, rank: 1, atSeconds: 0.9 }),
    /cannot move backward/,
  );

  const ignored = applyMoongazersSigilShieldEvent(state, { actorId: 'shorekeeper', atSeconds: 1.25 });
  assert.equal(ignored.status, 'IGNORED_OTHER_ACTOR');
  assert.equal(ignored.state.knownAtSeconds, 1.25);
  assert.equal(ignored.state.lastAcceptedShieldAtSeconds, 0.5);
});

test('Intro creates only a three-second forced-max window and does not manufacture organic stack expiries', () => {
  const window = activateMoongazersSigilIntroForcedMaxWindow({
    ownerId: 'lingyang',
    event: { actorId: 'lingyang', atSeconds: 3 },
  });
  assert.ok(window);
  assert.equal(window.forcedStackCount, 5);
  assert.equal(window.startedAtSeconds, 3);
  assert.equal(window.expiresAtSeconds, 6);
  assert.equal(isMoongazersSigilIntroForcedMaxActive(window, 3), true);
  assert.equal(isMoongazersSigilIntroForcedMaxActive(window, 5.999), true);
  assert.equal(isMoongazersSigilIntroForcedMaxActive(window, 6), false);

  assert.equal(activateMoongazersSigilIntroForcedMaxWindow({
    ownerId: 'lingyang',
    event: { actorId: 'shorekeeper', atSeconds: 3 },
  }), null);
});

test('Moongazer contract validation fails closed on effect drift', () => {
  const drifted = WEAPON_EFFECT_CATALOG.map((effect) =>
    effect.effectId === 'MGS-DEF'
      ? { ...effect, durationSeconds: 8 }
      : effect,
  );
  const issues = validateMoongazersSigilShieldStackContract(drifted);
  assert.ok(issues.some((issue) => issue.includes('duration drift')));
});
