import assert from 'node:assert/strict';
import test from 'node:test';

import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { resolveBuildPreset } from '../src/profileRegistry.ts';
import {
  buildRollAssistHref,
  getDefaultRollAssistProfileBinding,
  listRollAssistProfileBindings,
  resolveRollAssistProfileBinding,
} from '../src/rollAssistProfileRegistry.ts';

test('current Roll Assist registry binds only the verified Augusta canonical preset', () => {
  assert.deepEqual(listRollAssistProfileBindings().map((row) => row.presetId), ['augusta-standard']);
  const binding = getDefaultRollAssistProfileBinding();
  assert.equal(binding.characterId, 'augusta');
  assert.equal(binding.policy.id, 'AUGUSTA_RECOMMENDED_V915');
  assert.equal(buildRollAssistHref(binding), './roll-assistant.html?character=augusta&preset=augusta-standard');
});

test('Augusta Roll Assist policy slot contract matches canonical Echo loadout', () => {
  const binding = resolveRollAssistProfileBinding('augusta-standard');
  assert.ok(binding);
  const resolved = resolveBuildPreset(PROFILE_REGISTRY, binding.presetId);
  assert.equal(resolved.echoLoadout.slots.length, binding.policy.slots.length);
  binding.policy.slots.forEach((policySlot, index) => {
    const canonicalSlot = resolved.echoLoadout.slots[index]!;
    assert.equal(canonicalSlot.cost, policySlot.cost);
    assert.ok(canonicalSlot.primaryMainStats.some((row) => row.stat === policySlot.primaryMain));
  });
});

test('DPS readiness does not fabricate a Roll Assist policy', () => {
  assert.equal(resolveRollAssistProfileBinding('ciaccona-cartethyia-aero'), null);
  assert.equal(resolveRollAssistProfileBinding('carlotta-standard'), null);
});
