import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectCommittedSonataGroups, projectSonataUiCatalog } from '../src/echoSonataUiProjection.ts';

const catalog = projectSonataUiCatalog();
function set(name: string) {
  const result = catalog.find(row => row.name === name);
  assert.ok(result);
  return result;
}
const slots = (id: string, count: number) => Array.from({ length: count }, () => ({ selectedSonataSetId: id }));

test('only reached canonical activation pieces become visible', () => {
  const thunder = set('Void Thunder'), crown = set('Crown of Valor');
  for (const count of [0, 1]) assert.deepEqual(projectCommittedSonataGroups(slots(thunder.id, count), catalog), []);
  for (const count of [2, 3, 4]) {
    const result = projectCommittedSonataGroups(slots(thunder.id, count), catalog);
    assert.deepEqual(result[0].activeEffects.map(row => row.pieces), [2]);
  }
  assert.deepEqual(projectCommittedSonataGroups(slots(thunder.id, 5), catalog)[0].activeEffects.map(row => row.pieces), [2, 5]);
  assert.deepEqual(projectCommittedSonataGroups(slots(crown.id, 2), catalog), []);
  assert.deepEqual(projectCommittedSonataGroups(slots(crown.id, 3), catalog)[0].activeEffects.map(row => row.pieces), [3]);
});

test('compatibility does not count; multiple committed sets appear together', () => {
  const thunder = set('Void Thunder'), crown = set('Crown of Valor');
  const owned = [...slots(thunder.id, 2), ...slots(crown.id, 3), { sonataSetIds: [thunder.id, crown.id] }];
  assert.deepEqual(projectCommittedSonataGroups(owned, catalog).map(row => [row.name, row.activeEffects.map(effect => effect.pieces)]),
    [['Crown of Valor', [3]], ['Void Thunder', [2]]]);
  assert.deepEqual(projectCommittedSonataGroups([{ sonataSetIds: [thunder.id] }], catalog), []);
});

test('reviewed text is UI-safe and source conflicts stay pending', () => {
  const crown = set('Crown of Valor');
  assert.match(crown.sections[0].description, /ATK% \+6% per stack; up to 5 stacks/);
  const frost = set('Freezing Frost');
  assert.equal(frost.sections[1].reviewStatus, 'SOURCE_CONFLICT');
  assert.equal(projectCommittedSonataGroups(slots(frost.id, 5), catalog)[0].activeEffects[1].description,
    'Effect pending source verification.');
  assert.equal(JSON.stringify(catalog).includes('{0}'), false);
});
