import test from 'node:test';
import assert from 'node:assert/strict';

import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import {
  activateSonataCastWindow,
  isSonataCastWindowActive,
  SONATA_CAST_WINDOW_CONTRACTS,
  SONATA_CAST_WINDOW_SEMANTIC_SPLIT,
  validateSonataCastWindowContracts,
} from '../src/combat/sonataCastWindowAdapter.ts';

test('source-clean Sonata cast-window contracts stay locked to exact canonical rows', () => {
  assert.deepEqual(validateSonataCastWindowContracts(), []);
  assert.deepEqual(SONATA_CAST_WINDOW_CONTRACTS, [
    {
      effectId: 'S02_5PC_FUSION',
      expectedSonataSetId: 'sonata-2',
      expectedPieces: 5,
      expectedStatOrEffect: 'Fusion DMG Bonus',
      expectedValue: 0.30,
      expectedDurationSeconds: 15,
      triggerEvents: ['RESONANCE_SKILL_CAST'],
    },
    {
      effectId: 'S05_5PC_SPECTRO',
      expectedSonataSetId: 'sonata-5',
      expectedPieces: 5,
      expectedStatOrEffect: 'Spectro DMG Bonus',
      expectedValue: 0.30,
      expectedDurationSeconds: 15,
      triggerEvents: ['INTRO_SKILL_CAST'],
    },
  ]);
  assert.deepEqual(SONATA_CAST_WINDOW_SEMANTIC_SPLIT.pendingExecutionIds, [
    'sonata:sonata-2:S02_5PC_FUSION:trigger-uptime-adapter',
    'sonata:sonata-5:S05_5PC_SPECTRO:trigger-uptime-adapter',
  ]);
  assert.equal(SONATA_CAST_WINDOW_SEMANTIC_SPLIT.requiresProfileEventTimeline, true);
  assert.deepEqual(SONATA_CAST_WINDOW_SEMANTIC_SPLIT.closesPendingExecutionIds, []);

  const drifted = SONATA_EFFECT_MODELS.map((effect) => effect.effectId === 'S05_5PC_SPECTRO'
    ? { ...effect, durationSeconds: 14 }
    : effect);
  assert.ok(validateSonataCastWindowContracts(drifted).some((issue) => issue.includes('S05_5PC_SPECTRO duration drift')));
});

test('Molten Rift primitive activates only from an explicit owner Resonance Skill cast event', () => {
  const window = activateSonataCastWindow({
    effectId: 'S02_5PC_FUSION',
    ownerId: 'changli',
    event: { kind: 'RESONANCE_SKILL_CAST', actorId: 'changli', atSeconds: 4 },
  });

  assert.deepEqual(window, {
    adapterId: 'sonata-cast-timed-self-window-v1',
    effectId: 'S02_5PC_FUSION',
    sonataSetId: 'sonata-2',
    actorId: 'changli',
    statOrEffect: 'Fusion DMG Bonus',
    value: 0.30,
    startedAtSeconds: 4,
    expiresAtSeconds: 19,
  });

  assert.equal(activateSonataCastWindow({
    effectId: 'S02_5PC_FUSION',
    ownerId: 'changli',
    event: { kind: 'RESONANCE_SKILL_CAST', actorId: 'other-character', atSeconds: 4 },
  }), null);
});

test('Celestial Light primitive requires the actual owner Intro event and never equipment-only uptime', () => {
  const window = activateSonataCastWindow({
    effectId: 'S05_5PC_SPECTRO',
    ownerId: 'jinhsi',
    event: { kind: 'INTRO_SKILL_CAST', actorId: 'jinhsi', atSeconds: 1.5 },
  });

  assert.deepEqual(window, {
    adapterId: 'sonata-cast-timed-self-window-v1',
    effectId: 'S05_5PC_SPECTRO',
    sonataSetId: 'sonata-5',
    actorId: 'jinhsi',
    statOrEffect: 'Spectro DMG Bonus',
    value: 0.30,
    startedAtSeconds: 1.5,
    expiresAtSeconds: 16.5,
  });

  assert.equal(activateSonataCastWindow({
    effectId: 'S05_5PC_SPECTRO',
    ownerId: 'jinhsi',
    event: { kind: 'RESONANCE_SKILL_CAST', actorId: 'jinhsi', atSeconds: 1.5 },
  }), null);
  assert.equal(activateSonataCastWindow({
    effectId: 'S05_5PC_SPECTRO',
    ownerId: 'jinhsi',
    event: { kind: 'INTRO_SKILL_CAST', actorId: 'zhezhi', atSeconds: 1.5 },
  }), null);
});

test('Sonata active-window boundary is deterministic and fail closed', () => {
  const window = activateSonataCastWindow({
    effectId: 'S02_5PC_FUSION',
    ownerId: 'changli',
    event: { kind: 'RESONANCE_SKILL_CAST', actorId: 'changli', atSeconds: 2 },
  });
  assert.ok(window);
  assert.equal(isSonataCastWindowActive(window, 2), true);
  assert.equal(isSonataCastWindowActive(window, 16.999), true);
  assert.equal(isSonataCastWindowActive(window, 17), false);
  assert.throws(() => isSonataCastWindowActive(window, -1), /finite non-negative/);
  assert.throws(() => activateSonataCastWindow({
    effectId: 'S08_2PC_ENERGY_REGEN',
    ownerId: 'changli',
    event: { kind: 'RESONANCE_SKILL_CAST', actorId: 'changli', atSeconds: 2 },
  }), /No verified cast-window contract/);
});
