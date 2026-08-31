import assert from 'node:assert/strict';
import test from 'node:test';

import { augustaStandardEchoDamageEvaluator } from '../src/characters/augustaEchoEvaluator.ts';
import type { Echo } from '../src/echoCore.ts';
import {
  analyzeOwnedBuild,
  listOwnedBuildDpsBindings,
  resolveOwnedBuildDpsBinding,
} from '../src/ownedBuildAnalysis.ts';
import { buildOwnedEchoFromCheckpointInput } from '../src/ownedEchoCheckpointAnalysis.ts';
import { buildContextFromVerifiedPreset } from '../src/profileBuildContext.ts';

const AUGUSTA_OWNED_SUBSTATS = [
  [
    { name: 'CRIT DMG', value: 0.174 },
    { name: 'ATK%', value: 0.064 },
    { name: 'Energy Regen', value: 0.092 },
    { name: 'Flat DEF', value: 40 },
    { name: 'Flat HP', value: 470 },
  ],
  [
    { name: 'CRIT DMG', value: 0.174 },
    { name: 'Flat ATK', value: 30 },
    { name: 'Energy Regen', value: 0.092 },
    { name: 'Flat DEF', value: 50 },
    { name: 'Liberation DMG', value: 0.094 },
  ],
  [
    { name: 'CRIT DMG', value: 0.15 },
    { name: 'Heavy Attack DMG', value: 0.094 },
    { name: 'Basic Attack DMG', value: 0.086 },
    { name: 'Flat HP', value: 430 },
    { name: 'CRIT Rate', value: 0.063 },
  ],
  [
    { name: 'CRIT Rate', value: 0.093 },
    { name: 'HP%', value: 0.086 },
    { name: 'Heavy Attack DMG', value: 0.094 },
    { name: 'ATK%', value: 0.079 },
    { name: 'Skill DMG', value: 0.079 },
  ],
  [
    { name: 'Heavy Attack DMG', value: 0.079 },
    { name: 'CRIT Rate', value: 0.081 },
    { name: 'HP%', value: 0.086 },
    { name: 'ATK%', value: 0.064 },
    { name: 'Liberation DMG', value: 0.101 },
  ],
] as const;

function augustaOwnedEchoes(): Echo[] {
  return AUGUSTA_OWNED_SUBSTATS.map((substats, slotIndex) => buildOwnedEchoFromCheckpointInput({
    presetId: 'augusta-standard',
    slotIndex,
    level: 25,
    substats: substats.map((roll) => ({ ...roll })),
  }));
}

test('owned-build DPS binding remains explicit even when more than one DPS_READY profile has a reviewed product context', () => {
  assert.deepEqual(
    listOwnedBuildDpsBindings().map((row) => row.presetId),
    ['augusta-standard', 'ciaccona-cartethyia-aero'],
  );
  assert.equal(resolveOwnedBuildDpsBinding('augusta-standard')?.engineModelId, 'AUGUSTA_STD_V1');
  const ciaccona = resolveOwnedBuildDpsBinding('ciaccona-cartethyia-aero');
  assert.equal(ciaccona?.engineModelId, 'CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1');
  assert.match(ciaccona?.contextLabel ?? '', /Lorelei VI/);
  assert.equal(resolveOwnedBuildDpsBinding('cartethyia-aero-erosion'), null);
});

test('five exact +25 Augusta Echo cards evaluate through the existing verified DamageEvaluator', () => {
  const echoes = augustaOwnedEchoes();
  const direct = augustaStandardEchoDamageEvaluator.evaluate(buildContextFromVerifiedPreset('augusta-standard', echoes));
  const result = analyzeOwnedBuild({ presetId: 'augusta-standard', echoes });

  assert.equal(result.engineModelId, 'AUGUSTA_STD_V1');
  assert.equal(result.contextLabel, undefined);
  assert.equal(result.erGate, 'PASS');
  assert.equal(result.headline, 'PERSONAL ROTATION DPS');
  assert.equal(result.energyRegen, direct.energyRegen);
  assert.equal(result.personalRotationDps, direct.personalRotationDps);
  assert.ok(result.personalRotationDps > 0);
});

test('owned-build DPS rejects incomplete or non-canonical loadouts instead of inventing build state', () => {
  const echoes = augustaOwnedEchoes();
  assert.throws(() => analyzeOwnedBuild({
    presetId: 'augusta-standard',
    echoes: echoes.slice(0, 4),
  }), /exactly five Echoes/);

  const wrongCost = { ...echoes[1]!, cost: 1 as const };
  assert.throws(() => analyzeOwnedBuild({
    presetId: 'augusta-standard',
    echoes: [echoes[0]!, wrongCost, ...echoes.slice(2)],
  }), /does not match canonical COST/);

  assert.throws(() => analyzeOwnedBuild({
    presetId: 'ciaccona-cartethyia-aero',
    echoes,
  }), /outside the canonical slot recommendation/);

  assert.throws(() => analyzeOwnedBuild({
    presetId: 'cartethyia-aero-erosion',
    echoes,
  }), /no verified owned-build DPS adapter/);
});