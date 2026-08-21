import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addContent,
  createContentRegistry,
  getContent,
  type CharacterContent,
  type EchoSetContent,
  type WeaponContent,
} from '../src/contentRegistry.ts';

const verifiedSource = {
  sourceLabels: ['verified-source-a', 'verified-source-b'],
  checkedAt: '2026-08-21',
} as const;

test('a newly verified Echo set can be onboarded without any character integration', () => {
  const set: EchoSetContent = {
    kind: 'ECHO_SET',
    id: 'test-set',
    name: 'Test Set',
    releaseStatus: 'RELEASED',
    verificationStatus: 'VERIFIED',
    integrationStatus: 'DATA_ONLY',
    provenance: verifiedSource,
  };

  const registry = createContentRegistry([set]);
  assert.equal(registry.echoSets.size, 1);
  assert.equal(registry.characters.size, 0);
  assert.equal(getContent(registry, 'ECHO_SET', 'test-set'), set);
});

test('character, weapon and Echo-set onboarding do not require each other', () => {
  const character: CharacterContent = {
    kind: 'CHARACTER',
    id: 'new-character',
    name: 'New Character',
    releaseStatus: 'RELEASED',
    verificationStatus: 'VERIFIED',
    integrationStatus: 'DATA_ONLY',
    provenance: verifiedSource,
  };

  const weapon: WeaponContent = {
    kind: 'WEAPON',
    id: 'new-weapon',
    name: 'New Weapon',
    releaseStatus: 'RELEASED',
    verificationStatus: 'VERIFIED',
    integrationStatus: 'DATA_ONLY',
    provenance: verifiedSource,
  };

  const set: EchoSetContent = {
    kind: 'ECHO_SET',
    id: 'new-set',
    name: 'New Set',
    releaseStatus: 'RELEASED',
    verificationStatus: 'VERIFIED',
    integrationStatus: 'ENGINE_READY',
    provenance: verifiedSource,
  };

  let registry = createContentRegistry([character]);
  assert.equal(registry.weapons.size, 0);
  assert.equal(registry.echoSets.size, 0);

  registry = addContent(registry, set);
  assert.equal(registry.echoSets.get('new-set')?.integrationStatus, 'ENGINE_READY');
  assert.equal(registry.weapons.size, 0);

  registry = addContent(registry, weapon);
  assert.equal(registry.characters.size, 1);
  assert.equal(registry.echoSets.size, 1);
  assert.equal(registry.weapons.size, 1);
});

test('data presence and engine integration are separate states', () => {
  const set: EchoSetContent = {
    kind: 'ECHO_SET',
    id: 'confirmed-not-modeled',
    name: 'Confirmed Not Modeled',
    releaseStatus: 'RELEASED',
    verificationStatus: 'VERIFIED',
    integrationStatus: 'DATA_ONLY',
    provenance: verifiedSource,
  };

  const registry = createContentRegistry([set]);
  const stored = registry.echoSets.get(set.id);
  assert.ok(stored);
  assert.equal(stored.verificationStatus, 'VERIFIED');
  assert.equal(stored.integrationStatus, 'DATA_ONLY');
  assert.equal(stored.effectModelId, undefined);
});

test('duplicate IDs are rejected instead of silently replacing verified data', () => {
  const set: EchoSetContent = {
    kind: 'ECHO_SET',
    id: 'stable-id',
    name: 'Stable Set',
    releaseStatus: 'RELEASED',
    verificationStatus: 'VERIFIED',
    integrationStatus: 'DATA_ONLY',
    provenance: verifiedSource,
  };

  assert.throws(() => createContentRegistry([set, { ...set, name: 'Other' }]), /Duplicate content id/);
});
