import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectCommittedSonataGroups, projectSonataUiCatalog } from '../src/echoSonataUiProjection.ts';

const catalog = projectSonataUiCatalog();
const byName = (name: string) => {
  const set = catalog.find(row => row.name === name);
  assert.ok(set, `Missing ${name}`);
  return set;
};

test('canonical activation pieces and whole-set descriptions preserve every section in piece order', () => {
  const crown = byName('Crown of Valor');
  const thunder = byName('Void Thunder');
  assert.deepEqual(crown.activationPieces, [3]);
  assert.deepEqual(thunder.activationPieces, [2, 5]);
  assert.deepEqual(thunder.sections.map(section => section.pieces), [2, 5]);
  assert.match(thunder.fullDescription, /^2-PC — .+\n5-PC — .+/s);
  assert.equal(thunder.fullDescription.includes('{0}'), false);
  assert.equal(Object.hasOwn(thunder, 'selectedThreshold'), false);
  assert.equal(Object.hasOwn(thunder.sections[0], 'selected'), false);
});

test('committed assignments count once per owned slot; compatible identity sets do not count', () => {
  const crown = byName('Crown of Valor'), thunder = byName('Void Thunder');
  const slots = [
    { selectedSonataSetId: thunder.id, sonataSetIds: [thunder.id, crown.id] },
    { selectedSonataSetId: crown.id, sonataSetIds: [thunder.id, crown.id] },
    { selectedSonataSetId: crown.id }, null, null,
  ];
  const result = projectCommittedSonataGroups(slots, [thunder, crown]);
  assert.deepEqual(result.map(group => group.sonataSetId), [crown.id, thunder.id]);
  assert.deepEqual(result.map(group => group.count), [2, 1]);
  assert.deepEqual(result[0].thresholds, [{ pieces: 3, count: 2, reached: false }]);
  assert.deepEqual(result[1].thresholds, [{ pieces: 2, count: 1, reached: false }, { pieces: 5, count: 1, reached: false }]);
  assert.deepEqual(projectCommittedSonataGroups([null, { sonataSetIds: [crown.id] }], catalog), []);
});

test('three-piece and classic two/five-piece thresholds cap count and mark reached only at threshold', () => {
  const crown = byName('Crown of Valor'), thunder = byName('Void Thunder');
  const three = projectCommittedSonataGroups(Array(3).fill({ selectedSonataSetId: crown.id }), [crown]);
  assert.deepEqual(three[0].thresholds, [{ pieces: 3, count: 3, reached: true }]);
  const two = projectCommittedSonataGroups(Array(2).fill({ selectedSonataSetId: thunder.id }), [thunder]);
  assert.deepEqual(two[0].thresholds, [{ pieces: 2, count: 2, reached: true }, { pieces: 5, count: 2, reached: false }]);
  const five = projectCommittedSonataGroups(Array(5).fill({ selectedSonataSetId: thunder.id }), [thunder]);
  assert.deepEqual(five[0].thresholds, [{ pieces: 2, count: 2, reached: true }, { pieces: 5, count: 5, reached: true }]);
});

test('modeled effects use reviewed values, triggers, stacks, duration and targets', () => {
  const crown = byName('Crown of Valor');
  assert.equal(crown.sections[0].reviewStatus, 'MODELED');
  assert.match(crown.fullDescription, /ATK% \+6% per stack; up to 5 stacks; Trigger: Gain Shield; Duration: 4s/);
  assert.match(crown.fullDescription, /CRIT DMG \+4% per stack/);
  assert.equal(crown.fullDescription.includes('{'), false);
});

test('conflicted activation stays pending while a modeled activation remains readable', () => {
  const frost = byName('Freezing Frost');
  assert.deepEqual(frost.sections.map(section => section.reviewStatus), ['MODELED', 'SOURCE_CONFLICT']);
  assert.match(frost.fullDescription, /2-PC — Glacio DMG Bonus \+10%/);
  assert.match(frost.fullDescription, /5-PC — Effect pending source verification\./);
  assert.doesNotMatch(frost.fullDescription, /\{\d+\}/);
});
