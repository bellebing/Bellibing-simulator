import assert from 'node:assert/strict';
import test from 'node:test';

import { ECHO_EFFECT_MODELS } from '../src/data/echoEffects.ts';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { createEchoEffectRegistry } from '../src/echoEffectRegistry.ts';
import { resolvePresetMainEchoEffects } from '../src/profileEchoEffectResolver.ts';

const echoEffects = createEchoEffectRegistry(ECHO_EFFECT_MODELS);

test('existing Lucy and Aemeath presets receive only their source-bound main-slot bonus', () => {
  assert.deepEqual(resolvePresetMainEchoEffects(PROFILE_REGISTRY, echoEffects, 'lucy-standard')
    .map((row) => [row.statOrEffect, row.value]), [['CRIT Rate', 0.15]]);
  assert.deepEqual(resolvePresetMainEchoEffects(PROFILE_REGISTRY, echoEffects, 'aemeath-standard')
    .map((row) => [row.statOrEffect, row.value]), [['Resonance Liberation DMG Bonus', 0.25]]);
  // Rebecca's actual preset selects Bell-Borne, so eligibility for another Echo
  // must never add that other Echo's bonus or silently change her recommendation.
  assert.equal(resolvePresetMainEchoEffects(PROFILE_REGISTRY, echoEffects, 'rebecca-standard')
    .some((row) => row.effectId === 'ECHO_60002015_CRIT_RATE_LUCY_REBECCA'), false);
});

test('replacing a selected main Echo removes its identity-specific static bonus', () => {
  const echoLoadouts = new Map(PROFILE_REGISTRY.echoLoadouts);
  const original = echoLoadouts.get('lucy-standard-echoes')!;
  echoLoadouts.set(original.id, { ...original, mainEchoId: 'echo-60001915' });
  assert.deepEqual(resolvePresetMainEchoEffects({ ...PROFILE_REGISTRY, echoLoadouts }, echoEffects, 'lucy-standard'), []);
  assert.equal(resolvePresetMainEchoEffects(PROFILE_REGISTRY, echoEffects, 'lucy-standard')[0].value, 0.15);
});

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
