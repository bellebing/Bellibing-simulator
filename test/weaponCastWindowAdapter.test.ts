import test from 'node:test';
import assert from 'node:assert/strict';

import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import {
  activateWeaponCastWindow,
  isWeaponCastWindowActive,
  validateWeaponCastWindowContracts,
  WEAPON_CAST_WINDOW_CONTRACTS,
  WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT,
} from '../src/combat/weaponCastWindowAdapter.ts';
import { buildProfileAdapterDependencyMatrix } from '../src/profileAdapterDependencyMatrix.ts';

test('weapon trigger-uptime fanout includes seven canonical edges while cast-window execution retains five reviewed edges', () => {
  const matrix = buildProfileAdapterDependencyMatrix();
  const triggerEdges = matrix.edges.filter((edge) => edge.syntacticPrimitiveKey === 'weapon:trigger-uptime-adapter');
  const canonicalPendingIds = [...new Set(triggerEdges.map((edge) => edge.pendingExecutionId))].sort();
  const reviewedPendingIds = [
    ...WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT.castWindowPendingExecutionIds,
    ...WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT.targetStatusPendingExecutionIds,
  ].sort();

  assert.equal(triggerEdges.length, 7);
  assert.deepEqual(canonicalPendingIds, reviewedPendingIds);
  assert.equal(WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT.castWindowPendingExecutionIds.length, 5);
  assert.deepEqual(WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT.targetStatusPendingExecutionIds, [
    'weapon:blazing-justice:BJ-DEF:trigger-uptime-adapter',
    'weapon:blazing-justice:BJ-FRAZZLE:trigger-uptime-adapter',
  ]);
  assert.deepEqual(WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT.closesPendingExecutionIds, []);
  assert.equal(WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT.requiresProfileEventTimeline, true);
});

test('cast-window contracts stay locked to the exact canonical source-backed Weapon Effect rows', () => {
  assert.deepEqual(validateWeaponCastWindowContracts(), []);
  assert.deepEqual(WEAPON_CAST_WINDOW_CONTRACTS.map((row) => row.effectId), [
    'AH-INTRO',
    'AH-SKILL',
    'WM-LIB',
    'TLD-SKILL',
    'MGS-LIB',
  ]);

  const drifted = WEAPON_EFFECT_CATALOG.map((effect) => effect.effectId === 'AH-INTRO'
    ? { ...effect, trigger: 'Resonance Skill' }
    : effect);
  assert.ok(validateWeaponCastWindowContracts(drifted).some((issue) => issue.includes('AH-INTRO trigger drift')));

  const conditional = WEAPON_EFFECT_CATALOG.map((effect) => effect.effectId === 'TLD-SKILL'
    ? { ...effect, conditions: ['Future source prerequisite'] }
    : effect);
  assert.ok(validateWeaponCastWindowContracts(conditional).some((issue) => issue.includes('TLD-SKILL has additional source conditions')));

  const duplicate = [...WEAPON_EFFECT_CATALOG, WEAPON_EFFECT_CATALOG.find((effect) => effect.effectId === 'MGS-LIB')!];
  assert.ok(validateWeaponCastWindowContracts(duplicate).some((issue) => issue.includes('duplicate weapon effect id MGS-LIB')));
});

test('cast-window primitive activates only from an explicitly matching wielder cast event', () => {
  const intro = activateWeaponCastWindow({
    effectId: 'AH-INTRO',
    rank: 1,
    wielderId: 'lumi',
    event: { kind: 'INTRO_SKILL_CAST', actorId: 'lumi', atSeconds: 2 },
  });
  assert.deepEqual(intro, {
    adapterId: 'weapon-cast-timed-self-window-v1',
    effectId: 'AH-INTRO',
    weaponId: 'ages-of-harvest',
    actorId: 'lumi',
    statOrEffect: 'Resonance Skill DMG',
    value: 0.24,
    valueUnit: 'DECIMAL_MULTIPLIER',
    startedAtSeconds: 2,
    expiresAtSeconds: 14,
  });

  assert.equal(activateWeaponCastWindow({
    effectId: 'AH-INTRO',
    rank: 1,
    wielderId: 'lumi',
    event: { kind: 'RESONANCE_SKILL_CAST', actorId: 'lumi', atSeconds: 2 },
  }), null);

  assert.equal(activateWeaponCastWindow({
    effectId: 'AH-INTRO',
    rank: 1,
    wielderId: 'lumi',
    event: { kind: 'INTRO_SKILL_CAST', actorId: 'other-character', atSeconds: 2 },
  }), null);
});

test('Intro-or-Liberation contracts preserve their source durations and rank values without assuming profile uptime', () => {
  const wildfireIntro = activateWeaponCastWindow({
    effectId: 'WM-LIB',
    rank: 1,
    wielderId: 'calcharo',
    event: { kind: 'INTRO_SKILL_CAST', actorId: 'calcharo', atSeconds: 3 },
  });
  const wildfireLib = activateWeaponCastWindow({
    effectId: 'WM-LIB',
    rank: 1,
    wielderId: 'calcharo',
    event: { kind: 'RESONANCE_LIBERATION_CAST', actorId: 'calcharo', atSeconds: 8 },
  });
  assert.equal(wildfireIntro?.value, 0.24);
  assert.equal(wildfireIntro?.expiresAtSeconds, 9);
  assert.equal(wildfireLib?.expiresAtSeconds, 14);

  const lastDance = activateWeaponCastWindow({
    effectId: 'TLD-SKILL',
    rank: 1,
    wielderId: 'carlotta',
    event: { kind: 'RESONANCE_LIBERATION_CAST', actorId: 'carlotta', atSeconds: 4 },
  });
  assert.equal(lastDance?.value, 0.48);
  assert.equal(lastDance?.expiresAtSeconds, 9);

  const moongazer = activateWeaponCastWindow({
    effectId: 'MGS-LIB',
    rank: 1,
    wielderId: 'iuno',
    event: { kind: 'INTRO_SKILL_CAST', actorId: 'iuno', atSeconds: 1 },
  });
  assert.equal(moongazer?.value, 0.20);
  assert.equal(moongazer?.expiresAtSeconds, 16);
});

test('active-window boundary is deterministic and does not extend itself without a new executable event', () => {
  const window = activateWeaponCastWindow({
    effectId: 'AH-SKILL',
    rank: 1,
    wielderId: 'lumi',
    event: { kind: 'RESONANCE_SKILL_CAST', actorId: 'lumi', atSeconds: 5 },
  });
  assert.ok(window);
  assert.equal(isWeaponCastWindowActive(window, 5), true);
  assert.equal(isWeaponCastWindowActive(window, 16.999), true);
  assert.equal(isWeaponCastWindowActive(window, 17), false);
  assert.throws(() => isWeaponCastWindowActive(window, -1), /finite non-negative/);
});

test('cast-window runtime rejects invalid rank, identity and timestamp input instead of returning malformed windows', () => {
  assert.throws(() => activateWeaponCastWindow({
    effectId: 'AH-SKILL',
    rank: 6 as 1,
    wielderId: 'lumi',
    event: { kind: 'RESONANCE_SKILL_CAST', actorId: 'lumi', atSeconds: 5 },
  }), /integer from 1 through 5/);
  assert.throws(() => activateWeaponCastWindow({
    effectId: 'AH-SKILL',
    rank: 1,
    wielderId: ' ',
    event: { kind: 'RESONANCE_SKILL_CAST', actorId: 'lumi', atSeconds: 5 },
  }), /wielderId must be non-blank/);
  assert.throws(() => activateWeaponCastWindow({
    effectId: 'AH-SKILL',
    rank: 1,
    wielderId: 'lumi',
    event: { kind: 'RESONANCE_SKILL_CAST', actorId: 'lumi', atSeconds: Number.NaN },
  }), /finite non-negative/);
});

test('Woodland Aria cannot enter the cast-window primitive through syntactic trigger-uptime similarity', () => {
  assert.throws(() => activateWeaponCastWindow({
    effectId: 'WA-AERO',
    rank: 1,
    wielderId: 'ciaccona',
    event: { kind: 'RESONANCE_SKILL_CAST', actorId: 'ciaccona', atSeconds: 1 },
  }), /No verified cast-window contract/);
});
