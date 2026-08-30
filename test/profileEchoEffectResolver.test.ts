import assert from 'node:assert/strict';
import test from 'node:test';

import { ECHO_EFFECT_MODELS } from '../src/data/echoEffects.ts';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { createEchoEffectRegistry } from '../src/echoEffectRegistry.ts';
import { resolvePresetMainEchoEffects } from '../src/profileEchoEffectResolver.ts';

const echoEffects = createEchoEffectRegistry(ECHO_EFFECT_MODELS);

function aeroBonusTotal(presetId: string): number {
  return resolvePresetMainEchoEffects(PROFILE_REGISTRY, echoEffects, presetId)
    .filter((effect) => effect.statOrEffect === 'Aero DMG Bonus')
    .reduce((sum, effect) => sum + effect.value, 0);
}

test('Fleurdelys profile resolver proves the static +20% Aero main-slot package for both eligible wielders', () => {
  assert.equal(aeroBonusTotal('cartethyia-aero-erosion'), 0.20);
  assert.equal(aeroBonusTotal('rover-aero-cartethyia-ciaccona'), 0.20);
});

test('profile Echo effect resolution remains static and does not authorize active damage or rotation execution', () => {
  for (const presetId of ['cartethyia-aero-erosion', 'rover-aero-cartethyia-ciaccona']) {
    const resolved = resolvePresetMainEchoEffects(PROFILE_REGISTRY, echoEffects, presetId);
    assert.ok(resolved.length > 0);
    assert.ok(resolved.every((effect) => effect.activation === 'MAIN_SLOT_PASSIVE'));
    assert.ok(resolved.every((effect) => effect.durationSeconds === null));
    assert.ok(resolved.every((effect) => !Object.hasOwn(effect, 'motionValue')));
  }
});
