import assert from 'node:assert/strict';
import test from 'node:test';

import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import {
  createSonataEffectRegistry,
  getSonataEffects,
} from '../src/sonataEffectRegistry.ts';

const registry = createSonataEffectRegistry(SONATA_EFFECT_MODELS);

test('Sonata effect foundation contains only the audited V9.15 slice', () => {
  assert.equal(SONATA_EFFECT_MODELS.length, 10);
  assert.equal(new Set(SONATA_EFFECT_MODELS.map((row) => row.sonataSetId)).size, 7);
  assert.equal(registry.byId.size, 10);
});

test('Augusta set effects resolve independently from her character profile', () => {
  const crown = getSonataEffects(registry, 'sonata-20');
  assert.deepEqual(crown.map((row) => row.effectId), ['COV_ATK', 'COV_CD']);
  assert.equal(crown[0]?.value, 0.06);
  assert.equal(crown[0]?.maxStacks, 5);
  assert.equal(crown[0]?.stackIntervalSeconds, 0.5);

  const voidThunder = getSonataEffects(registry, 'sonata-3');
  assert.equal(voidThunder[0]?.effectId, 'VT_2PC_ELECTRO');
  assert.equal(voidThunder[0]?.value, 0.10);
  assert.equal(voidThunder[0]?.pieces, 2);
});

test('support and mode-specific Sonata effects preserve conditional mechanics', () => {
  assert.equal(registry.byId.get('REJUV_ATK')?.value, 0.15);
  assert.equal(registry.byId.get('CHROMATIC_INCOMING_FUSION')?.value, 0.25);
  assert.equal(registry.byId.get('PACT_INCOMING_ATK')?.value, 0.15);
  assert.equal(registry.byId.get('PACT_TBB_ATK')?.value, 0.003);
  assert.equal(registry.byId.get('PACT_TBB_ATK')?.capValue, 0.15);
  assert.equal(registry.byId.get('HALO_TEAM_ATK')?.value, 0.002);
  assert.equal(registry.byId.get('HALO_TEAM_ATK')?.capValue, 0.25);
});

test('Song of Feathered Trace values are present without pretending activation is solved', () => {
  const song = getSonataEffects(registry, 'sonata-33');
  assert.deepEqual(song.map((row) => [row.effectId, row.value]), [
    ['SONG5_CR', 0.20],
    ['SONG5_HEAVY', 0.35],
  ]);
  assert.ok(song.every((row) => row.mechanicsStatus === 'VALUE_VERIFIED_TRIGGER_PENDING'));
});

test('missing Sonata model means pending migration rather than no passive', () => {
  assert.deepEqual(getSonataEffects(registry, 'sonata-34'), []);
});

test('Sonata effect records never embed character/team recommendation relationships', () => {
  for (const row of SONATA_EFFECT_MODELS) {
    for (const forbidden of ['characterId', 'teamProfileId', 'rotationProfileId', 'recommendedFor']) {
      assert.equal(Object.hasOwn(row, forbidden), false, `${row.effectId} leaked ${forbidden}`);
    }
  }
});

test('registry rejects dangling Sonata IDs and impossible piece activations', () => {
  const base = SONATA_EFFECT_MODELS[0]!;
  assert.throws(
    () => createSonataEffectRegistry([{ ...base, effectId: 'BROKEN_SET', sonataSetId: 'sonata-missing' }]),
    /Unknown Sonata id/,
  );
  assert.throws(
    () => createSonataEffectRegistry([{ ...base, effectId: 'BROKEN_PIECES', pieces: 5 }]),
    /does not support that activation/,
  );
});
