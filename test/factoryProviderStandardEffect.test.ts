import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { activateWeaponCastWindow } from '../src/combat/weaponCastWindowAdapter.ts';
import {
  FACTORY_WEAPON_ATTRIBUTE_DMG_PROTOTYPE_PROVIDER_IDS,
  buildWeaponR1AttributeDmgEvidenceReport,
  normalizeWeaponR1AttributeDmgEvidence,
  type FactoryWeaponAttributeDmgEvidenceSnapshot,
} from '../src/factory/providerMappings/weaponAttributeDmg.ts';
import {
  FACTORY_STANDARD_EFFECT_SOURCE_AUTHORITY,
  FACTORY_STANDARD_EFFECT_SPECS,
  activateFactoryGeneratedWeaponCastTimedSelfEffect,
  compileFactoryStandardEffects,
  type FactoryWeaponCastTimedSelfSpec,
} from '../src/factory/standardEffects.ts';

const SNAPSHOT_URL = new URL(
  '../data/factory/evidence/ages-of-harvest-r1-attribute-dmg-2026-09-05.json',
  import.meta.url,
);

function loadSnapshot(): FactoryWeaponAttributeDmgEvidenceSnapshot {
  return JSON.parse(readFileSync(SNAPSHOT_URL, 'utf8')) as FactoryWeaponAttributeDmgEvidenceSnapshot;
}

test('Factory maps exactly two bounded provider lanes to Ages of Harvest R1 attribute-DMG consensus', () => {
  const snapshot = loadSnapshot();
  const candidates = normalizeWeaponR1AttributeDmgEvidence(snapshot);
  const report = buildWeaponR1AttributeDmgEvidenceReport(snapshot);

  assert.deepEqual(FACTORY_WEAPON_ATTRIBUTE_DMG_PROTOTYPE_PROVIDER_IDS, [
    'prydwen-profile-source',
    'frequency-manager',
  ]);
  assert.deepEqual(candidates.map((candidate) => candidate.evidenceState), ['PRESENT', 'PRESENT']);
  assert.equal(new Set(candidates.map((candidate) => candidate.semanticFingerprint)).size, 1);
  assert.equal(report.reconciliation.classification, 'CONSENSUS');
  assert.equal(report.reconciliation.route, 'REVIEW_CANDIDATE');
  assert.equal(report.reconciliation.canonicalPromotion, 'MANUAL_SOURCE_VALIDATION_REQUIRED');
  assert.deepEqual(report.reconciliation.presentProviderIds, ['frequency-manager', 'prydwen-profile-source']);
  assert.deepEqual(report.exceptionQueue, []);
});

test('Factory sends provider disagreement to exception queue instead of choosing a winner', () => {
  const snapshot = loadSnapshot();
  const providers = snapshot.providers.map((provider) => provider.providerId === 'frequency-manager'
    ? { ...provider, raw: { ...provider.raw, valuePercent: 15 } }
    : provider);
  const conflictSnapshot = { ...snapshot, providers } satisfies FactoryWeaponAttributeDmgEvidenceSnapshot;
  const report = buildWeaponR1AttributeDmgEvidenceReport(conflictSnapshot);

  assert.equal(report.reconciliation.classification, 'CONFLICT');
  assert.equal(report.reconciliation.route, 'EXCEPTION_QUEUE');
  assert.equal(report.reconciliation.canonicalPromotion, 'MANUAL_SOURCE_VALIDATION_REQUIRED');
  assert.equal(report.exceptionQueue.length, 1);
});

test('Factory provider evidence does not become canonical runtime authority', () => {
  const snapshot = loadSnapshot();
  const report = buildWeaponR1AttributeDmgEvidenceReport(snapshot);
  const canonical = WEAPON_EFFECT_CATALOG.find((effect) => effect.effectId === 'AH-ATTR');

  assert.ok(canonical);
  assert.equal(canonical.weaponId, 'ages-of-harvest');
  assert.equal(canonical.rankValues[0], 0.12);
  assert.equal(canonical.effectType, 'PERMANENT');
  assert.equal(report.reconciliation.canonicalPromotion, 'MANUAL_SOURCE_VALIDATION_REQUIRED');
});

test('Factory compiles Ages of Harvest cast-window specs from canonical Bellibing identities only', () => {
  const compiled = compileFactoryStandardEffects();

  assert.deepEqual(FACTORY_STANDARD_EFFECT_SPECS.map((spec) => spec.effectId), ['AH-INTRO', 'AH-SKILL']);
  assert.deepEqual(compiled.map((effect) => ({
    effectId: effect.effectId,
    weaponId: effect.weaponId,
    sourceAuthority: effect.sourceAuthority,
    runtimeAdapterId: effect.runtimeAdapterId,
  })), [
    {
      effectId: 'AH-INTRO',
      weaponId: 'ages-of-harvest',
      sourceAuthority: FACTORY_STANDARD_EFFECT_SOURCE_AUTHORITY,
      runtimeAdapterId: 'weapon-cast-timed-self-window-v1',
    },
    {
      effectId: 'AH-SKILL',
      weaponId: 'ages-of-harvest',
      sourceAuthority: FACTORY_STANDARD_EFFECT_SOURCE_AUTHORITY,
      runtimeAdapterId: 'weapon-cast-timed-self-window-v1',
    },
  ]);
});

test('generated timed self-window execution is identical to the existing reviewed runtime primitive', () => {
  const event = { kind: 'INTRO_SKILL_CAST', actorId: 'jinhsi', atSeconds: 3 } as const;
  const generated = activateFactoryGeneratedWeaponCastTimedSelfEffect({
    specId: 'ages-of-harvest-ageless-marking-v1',
    rank: 1,
    wielderId: 'jinhsi',
    event,
  });
  const direct = activateWeaponCastWindow({
    effectId: 'AH-INTRO',
    rank: 1,
    wielderId: 'jinhsi',
    event,
  });

  assert.deepEqual(generated, direct);
  assert.equal(generated?.value, 0.24);
  assert.equal(generated?.startedAtSeconds, 3);
  assert.equal(generated?.expiresAtSeconds, 15);

  assert.equal(activateFactoryGeneratedWeaponCastTimedSelfEffect({
    specId: 'ages-of-harvest-ageless-marking-v1',
    rank: 1,
    wielderId: 'jinhsi',
    event: { kind: 'RESONANCE_SKILL_CAST', actorId: 'jinhsi', atSeconds: 3 },
  }), null);
});

test('Factory standard-effect compiler fails closed if a spec claims provider evidence as runtime authority', () => {
  const invalid = {
    specId: 'invalid-provider-authority',
    familyId: 'weapon-cast-timed-self-window-v1',
    sourceAuthority: 'EXTERNAL_PROVIDER_EVIDENCE',
    effectId: 'AH-INTRO',
  } as unknown as FactoryWeaponCastTimedSelfSpec;

  assert.throws(
    () => compileFactoryStandardEffects([invalid]),
    /external\/provider evidence cannot be runtime source authority/,
  );
});
