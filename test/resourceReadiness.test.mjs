import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyResourceInventory} from '../docs/assets/resourceInventory.js';
import {resourceReadiness} from '../docs/ui-lab/v1.1/modules/resource-readiness.js';
import {mountResourceCost, resourceCostValues} from '../docs/ui-lab/v1.1/modules/resource-cost.js';

const supplied = () => {
  const inventory = emptyResourceInventory();
  inventory.echoes.count = 1;
  inventory.tuners.count = 10;
  inventory.tubes.premium.count = 1;
  return inventory;
};

test('an empty budget identifies all missing groups without changing inventory', () => {
  const inventory = emptyResourceInventory(), before = structuredClone(inventory);
  assert.deepEqual(resourceReadiness(inventory), {missing: ['echoes', 'tuners', 'xp'], text: 'Missing resources'});
  assert.deepEqual(inventory, before);
});

test('single blockers identify Echoes, Tuners or XP; a small nonzero budget is not sufficient', () => {
  for (const [id, text] of [['echoes', 'Missing Echoes'], ['tuners', 'Missing Tuners'], ['xp', 'Missing Echo XP']]) {
    const inventory = supplied();
    if (id === 'xp') inventory.tubes.premium.count = 0;
    else inventory[id].count = id === 'tuners' ? 9 : 0;
    assert.deepEqual(resourceReadiness(inventory), {missing: [id], text});
  }
});

test('mixed Tube denominations and any unlimited XP denomination can fund the first reveal', () => {
  const inventory = supplied();
  inventory.tubes.premium.count = 0;
  inventory.tubes.advanced.count = 1;
  inventory.tubes.basic.count = 5;
  assert.equal(resourceReadiness(inventory).text, null);
  inventory.tubes.basic.count = 4;
  assert.equal(resourceReadiness(inventory).text, 'Missing Echo XP');
  inventory.tubes.basic = {kind: 'UNLIMITED'};
  inventory.echoes = {kind: 'UNLIMITED'};
  inventory.tuners = {kind: 'UNLIMITED'};
  assert.deepEqual(resourceReadiness(inventory), {missing: [], text: null});
});

test('cost cells round Echoes and Tuners but preserve exact records, Gold equivalents and Pending', () => {
  const cells = {expected: Array.from({length: 3}, () => ({setAttribute() {}})), simulated: Array.from({length: 3}, () => ({setAttribute() {}}))};
  const host = {innerHTML: '', insertAdjacentHTML() {}, querySelector: () => ({innerHTML: ''}), querySelectorAll: selector => cells[selector.includes('expected') ? 'expected' : 'simulated']};
  const cost = mountResourceCost(host);
  const record = {status: 'VERIFIED', echoes: 78.47561, tuners: 1234.8, tubes: {premium: 1, advanced: 1, medium: 0, basic: 0}};
  const before = structuredClone(record);
  cost.present({expected: record});
  assert.equal(cells.expected[0].textContent, '≈ 78');
  assert.match(cells.expected[1].textContent, /≈ 1\D235$/);
  assert.equal(cells.expected[2].textContent, '≈ 1.4');
  assert.equal(cells.simulated[0].textContent, '—');
  assert.equal(resourceCostValues(record)[0], 78.47561);
  assert.deepEqual(record, before);
});
