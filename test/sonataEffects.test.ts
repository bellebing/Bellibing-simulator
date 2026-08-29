import assert from 'node:assert/strict';
import test from 'node:test';

import { SONATA_EFFECT_SOURCE_REVIEWS } from '../src/data/sonataEffectSourceReview.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { auditSonataEffectCoverage } from '../src/sonataEffectCoverageRegistry.ts';
import {
  createSonataEffectRegistry,
  getSonataEffects,
} from '../src/sonataEffectRegistry.ts';

const registry = createSonataEffectRegistry(SONATA_EFFECT_MODELS);

test('Sonata effect source coverage is roster-wide and fail-closed', () => {
  const summary = auditSonataEffectCoverage();
  assert.equal(summary.releasedSonataCount, 34);
  assert.equal(summary.reviewedActivationCount, 62);
  assert.equal(summary.modeledEffectCount, 86);
  assert.deepEqual(summary.statusCounts, {
    MODELED: 58,
    SOURCE_CONFLICT: 2,
    MODELED_WITH_PENDING_DAMAGE_ADAPTER: 1,
    MODELED_WITH_PENDING_STATE_ADAPTER: 1,
  });
  assert.equal(new Set(SONATA_EFFECT_MODELS.map((row) => row.sonataSetId)).size, 34);
  assert.equal(registry.byId.size, 86);
});

test('source-conflicted activations stay unmodeled instead of receiving guessed values', () => {
  const conflicts = SONATA_EFFECT_SOURCE_REVIEWS.filter((row) => row.status === 'SOURCE_CONFLICT');
  assert.deepEqual(conflicts.map((row) => [row.sonataSetId, row.pieces]), [
    ['sonata-1', 5],
    ['sonata-6', 5],
  ]);
  assert.equal(getSonataEffects(registry, 'sonata-1').some((row) => row.pieces === 5), false);
  assert.equal(getSonataEffects(registry, 'sonata-6').some((row) => row.pieces === 5), false);
  assert.match(conflicts[0]!.notes, /30%/);
  assert.match(conflicts[1]!.notes, /7\.5%/);
});

test('Crown of Valor and legacy audited IDs preserve their exact facts', () => {
  const crown = getSonataEffects(registry, 'sonata-20');
  assert.deepEqual(crown.map((row) => row.effectId), ['COV_ATK', 'COV_CD']);
  assert.equal(crown[0]?.value, 0.06);
  assert.equal(crown[0]?.maxStacks, 5);
  assert.equal(crown[0]?.stackIntervalSeconds, 0.5);

  assert.equal(registry.byId.get('VT_2PC_ELECTRO')?.value, 0.10);
  assert.equal(registry.byId.get('REJUV_ATK')?.value, 0.15);
  assert.equal(registry.byId.get('PACT_TBB_ATK')?.value, 0.003);
  assert.equal(registry.byId.get('PACT_TBB_ATK')?.capValue, 0.15);
  assert.equal(registry.byId.get('HALO_TEAM_ATK')?.capValue, 0.25);
});

test('one-piece Sonata activation is modeled explicitly', () => {
  const shadow = getSonataEffects(registry, 'sonata-32');
  assert.deepEqual(shadow.map((row) => [row.pieces, row.statOrEffect, row.value, row.durationSeconds]), [
    [1, 'Basic Attack DMG Bonus', 0.35, 15],
    [1, 'Heavy Attack DMG Bonus', 0.35, 15],
  ]);
  const review = SONATA_EFFECT_SOURCE_REVIEWS.find(
    (row) => row.sonataSetId === 'sonata-32' && row.pieces === 1,
  );
  assert.equal(review?.status, 'MODELED');
  assert.match(review?.notes ?? '', /unused 15%/);
});

test('Midnight Veil keeps exact damage event pending while modeling its transfer buff', () => {
  const midnight = getSonataEffects(registry, 'sonata-12').filter((row) => row.pieces === 5);
  assert.deepEqual(midnight.map((row) => [row.statOrEffect, row.value, row.appliesTo]), [
    ['Havoc DMG Bonus', 0.15, 'INCOMING_RESONATOR'],
  ]);
  const review = SONATA_EFFECT_SOURCE_REVIEWS.find(
    (row) => row.sonataSetId === 'sonata-12' && row.pieces === 5,
  );
  assert.equal(review?.status, 'MODELED_WITH_PENDING_DAMAGE_ADAPTER');
  assert.match(review?.notes ?? '', /480%/);
  assert.match(review?.notes ?? '', /Outro Skill DMG/);
});

test('Wishes of Quiet Snowfall exposes numeric branches without faking its state machine', () => {
  const snowfall = getSonataEffects(registry, 'sonata-30').filter((row) => row.pieces === 5);
  assert.deepEqual(snowfall.map((row) => [row.effectId, row.value, row.durationSeconds]), [
    ['S30_5PC_GLACIO', 0.10, 15],
    ['S30_5PC_CR', 0.25, 6],
    ['S30_5PC_INCOMING_GLACIO', 0.25, 15],
  ]);
  const review = SONATA_EFFECT_SOURCE_REVIEWS.find(
    (row) => row.sonataSetId === 'sonata-30' && row.pieces === 5,
  );
  assert.equal(review?.status, 'MODELED_WITH_PENDING_STATE_ADAPTER');
  assert.match(review?.notes ?? '', /\+4s/);
  assert.match(review?.notes ?? '', /0\.5s/);
  assert.match(review?.notes ?? '', /6 extensions/);
});

test('Song of Feathered Trace includes both source branches without assuming uptime', () => {
  const song = getSonataEffects(registry, 'sonata-33').filter((row) => row.pieces === 5);
  assert.deepEqual(song.map((row) => [row.effectId, row.value]), [
    ['SONG5_CR', 0.20],
    ['SONG5_HEAVY', 0.35],
    ['S33_5PC_TEAM_ATK', 0.001],
  ]);
  assert.equal(registry.byId.get('S33_5PC_TEAM_ATK')?.capValue, 0.25);
  assert.equal(registry.byId.get('S33_5PC_TEAM_ATK')?.appliesTo, 'TEAM');
});

test('coverage audit fails closed on missing reviews, row-count drift and impossible activations', () => {
  assert.throws(
    () => auditSonataEffectCoverage(SONATA_EFFECT_MODELS, SONATA_EFFECT_SOURCE_REVIEWS.slice(1)),
    /Unreviewed released Sonata activations/,
  );

  const alteredReviews = SONATA_EFFECT_SOURCE_REVIEWS.map((row) =>
    row.sonataSetId === 'sonata-20' && row.pieces === 3
      ? { ...row, expectedModeledEffectCount: 1 }
      : row,
  );
  assert.throws(
    () => auditSonataEffectCoverage(SONATA_EFFECT_MODELS, alteredReviews),
    /expected 1 modeled effect rows but found 2/,
  );

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

test('Sonata effect records never embed recommendation or rotation relationships', () => {
  for (const row of SONATA_EFFECT_MODELS) {
    for (const forbidden of ['characterId', 'teamProfileId', 'rotationProfileId', 'recommendedFor']) {
      assert.equal(Object.hasOwn(row, forbidden), false, `${row.effectId} leaked ${forbidden}`);
    }
  }
});
