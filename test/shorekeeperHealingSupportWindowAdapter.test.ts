import assert from 'node:assert/strict';
import test from 'node:test';

import {
  activateRejuvenatingGlowTeamAtkWindow,
  activateStellarSymphonyTeamAtkWindow,
  isShorekeeperHealingSupportWindowActive,
  SHOREKEEPER_HEALING_SUPPORT_SEMANTIC_SPLIT,
  validateShorekeeperHealingSupportContracts,
} from '../src/combat/shorekeeperHealingSupportWindowAdapter.ts';
import { THE_SHOREKEEPER_PASSIVE_FACTS } from '../src/data/characterMechanics/theShorekeeperRawFacts.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';

const TEAM_IDS = ['augusta', 'iuno', 'the-shorekeeper'] as const;

test('Shorekeeper healing support contracts remain source-locked without copied runtime values', () => {
  assert.deepEqual(validateShorekeeperHealingSupportContracts(), []);
  assert.equal(SHOREKEEPER_HEALING_SUPPORT_SEMANTIC_SPLIT.requiresProfileEventTimeline, true);
  assert.deepEqual(SHOREKEEPER_HEALING_SUPPORT_SEMANTIC_SPLIT.closesPendingExecutionIds, []);
});

test('Stellar Symphony team ATK activates from explicit Shorekeeper healing Skill cast and selected weapon rank', () => {
  const window = activateStellarSymphonyTeamAtkWindow({
    event: {
      kind: 'RESONANCE_SKILL_CAST',
      actorId: 'the-shorekeeper',
      healingSourceFactId: 'the-shorekeeper-skill-chaos-theory-healing',
      atSeconds: 2,
    },
    selectedWeapon: { id: 'stellar-symphony', rank: 1 },
    teamMemberIds: TEAM_IDS,
  });

  assert.ok(window);
  assert.equal(window.sourceLayer, 'WEAPON');
  assert.equal(window.effectId, 'SSY-TEAM-ATK');
  assert.equal(window.sourceId, 'stellar-symphony');
  assert.equal(window.value, 0.14);
  assert.equal(window.startedAtSeconds, 2);
  assert.equal(window.expiresAtSeconds, 32);
  assert.equal(isShorekeeperHealingSupportWindowActive(window, 'augusta', 31.999), true);
  assert.equal(isShorekeeperHealingSupportWindowActive(window, 'augusta', 32), false);
  assert.equal(isShorekeeperHealingSupportWindowActive(window, 'cartethyia', 10), false);
});

test('Stellar Symphony fails closed for wrong actor, source fact or unequipped weapon', () => {
  const base = {
    event: {
      kind: 'RESONANCE_SKILL_CAST' as const,
      actorId: 'the-shorekeeper',
      healingSourceFactId: 'the-shorekeeper-skill-chaos-theory-healing' as const,
      atSeconds: 2,
    },
    selectedWeapon: { id: 'stellar-symphony', rank: 1 },
    teamMemberIds: TEAM_IDS,
  };

  assert.equal(activateStellarSymphonyTeamAtkWindow({
    ...base,
    event: { ...base.event, actorId: 'iuno' },
  }), null);
  assert.equal(activateStellarSymphonyTeamAtkWindow({
    ...base,
    event: { ...base.event, healingSourceFactId: 'wrong-fact' as never },
  }), null);
  assert.equal(activateStellarSymphonyTeamAtkWindow({
    ...base,
    selectedWeapon: { id: 'variation', rank: 1 },
  }), null);
});

test('Rejuvenating Glow requires explicit heal-applied event and selected Sonata set', () => {
  const window = activateRejuvenatingGlowTeamAtkWindow({
    event: {
      kind: 'HEAL_APPLIED',
      healerId: 'the-shorekeeper',
      targetId: 'augusta',
      healingSourceFactId: 'the-shorekeeper-skill-chaos-theory-healing',
      atSeconds: 2.1,
    },
    selectedSonataSetIds: ['sonata-7'],
    teamMemberIds: TEAM_IDS,
  });

  assert.ok(window);
  assert.equal(window.sourceLayer, 'SONATA');
  assert.equal(window.effectId, 'REJUV_ATK');
  assert.equal(window.sourceId, 'sonata-7');
  assert.equal(window.value, 0.15);
  assert.equal(window.startedAtSeconds, 2.1);
  assert.equal(window.expiresAtSeconds, 32.1);
  assert.equal(isShorekeeperHealingSupportWindowActive(window, 'iuno', 20), true);
});

test('Rejuvenating Glow does not infer a heal from Skill cast or apply to unselected targets/sets', () => {
  assert.equal(activateRejuvenatingGlowTeamAtkWindow({
    event: {
      kind: 'HEAL_APPLIED',
      healerId: 'the-shorekeeper',
      targetId: 'cartethyia',
      healingSourceFactId: 'the-shorekeeper-skill-chaos-theory-healing',
      atSeconds: 2.1,
    },
    selectedSonataSetIds: ['sonata-7'],
    teamMemberIds: TEAM_IDS,
  }), null);

  assert.equal(activateRejuvenatingGlowTeamAtkWindow({
    event: {
      kind: 'HEAL_APPLIED',
      healerId: 'the-shorekeeper',
      targetId: 'augusta',
      healingSourceFactId: 'the-shorekeeper-skill-chaos-theory-healing',
      atSeconds: 2.1,
    },
    selectedSonataSetIds: ['sonata-8'],
    teamMemberIds: TEAM_IDS,
  }), null);

  assert.throws(() => activateRejuvenatingGlowTeamAtkWindow({
    event: {
      kind: 'RESONANCE_SKILL_CAST' as never,
      healerId: 'the-shorekeeper',
      targetId: 'augusta',
      healingSourceFactId: 'the-shorekeeper-skill-chaos-theory-healing',
      atSeconds: 2.1,
    },
    selectedSonataSetIds: ['sonata-7'],
    teamMemberIds: TEAM_IDS,
  }), /unsupported Shorekeeper heal event kind/);
});

test('Shorekeeper healing-support source drift fails closed', () => {
  const driftedCharacterFacts = THE_SHOREKEEPER_PASSIVE_FACTS.map((fact) =>
    fact.factId === 'the-shorekeeper-skill-chaos-theory-healing'
      ? { ...fact, effectSummary: 'Source text intentionally drifted for test coverage.' }
      : fact);
  assert.ok(validateShorekeeperHealingSupportContracts({
    characterFacts: driftedCharacterFacts,
  }).some((issue) => issue.includes('healing semantic drift')));

  const driftedWeaponCatalog = WEAPON_EFFECT_CATALOG.map((effect) =>
    effect.effectId === 'SSY-TEAM-ATK'
      ? { ...effect, trigger: 'Automatic' }
      : effect);
  assert.ok(validateShorekeeperHealingSupportContracts({
    weaponCatalog: driftedWeaponCatalog,
  }).some((issue) => issue.includes('trigger drift')));

  const driftedSonataCatalog = SONATA_EFFECT_MODELS.map((effect) =>
    effect.effectId === 'REJUV_ATK'
      ? { ...effect, appliesTo: 'SELF' as const }
      : effect);
  assert.ok(validateShorekeeperHealingSupportContracts({
    sonataCatalog: driftedSonataCatalog,
  }).some((issue) => issue.includes('must remain TEAM')));
});
