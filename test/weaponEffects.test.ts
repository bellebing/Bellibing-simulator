import assert from 'node:assert/strict';
import test from 'node:test';

import { getWeaponEffectCoverageStatus } from '../src/data/weaponEffectAudit.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import {
  WEAPON_EFFECT_CATALOG_META,
  getWeaponEffect,
  getWeaponEffects,
} from '../src/effectRegistry.ts';

test('Weapon Effect roster completion remains partial while released coverage is explicit', () => {
  assert.equal(WEAPON_EFFECT_CATALOG.length, 135);
  assert.equal(WEAPON_EFFECT_CATALOG_META.migratedEffectCount, 135);
  assert.equal(WEAPON_EFFECT_CATALOG_META.coveredWeaponCount, 73);
  assert.equal(WEAPON_EFFECT_CATALOG_META.totalWeaponCount, 122);
  assert.equal(WEAPON_EFFECT_CATALOG_META.releasedWeaponCount, 121);
  assert.equal(WEAPON_EFFECT_CATALOG_META.releasedExplicitCoverageCount, 121);
  assert.equal(WEAPON_EFFECT_CATALOG_META.pendingSourceAuditCount, 48);
  assert.equal(WEAPON_EFFECT_CATALOG_META.fullReleasedRosterComplete, false);
  assert.equal(WEAPON_EFFECT_CATALOG_META.completeness, 'PARTIAL');
  assert.equal(new Set(WEAPON_EFFECT_CATALOG.map((row) => row.effectId)).size, 135);
});

test('each effect carries source-backed rank values and explicit mechanics metadata', () => {
  for (const effect of WEAPON_EFFECT_CATALOG) {
    assert.equal(effect.rankValues.length, 5, effect.effectId);
    assert.ok(effect.rankValues.every((value) => Number.isFinite(value) && value >= 0), effect.effectId);
    assert.ok(effect.maxStacks >= 1, effect.effectId);
    assert.ok(effect.provenance.sourceLabels.length >= 1, effect.effectId);
    assert.ok(effect.provenance.sourceUrls.length >= 1, effect.effectId);
    assert.ok(effect.provenance.checkedAt.length > 0, effect.effectId);
    assert.ok(['DECIMAL_MULTIPLIER', 'FLAT_AMOUNT'].includes(effect.valueUnit), effect.effectId);
    assert.ok(Array.isArray(effect.conditions), effect.effectId);

    if (effect.effectType === 'PERMANENT') {
      assert.equal(effect.durationSeconds, null, effect.effectId);
      assert.equal(effect.trigger, 'Passive', effect.effectId);
      assert.equal(effect.triggerCooldownSeconds, null, effect.effectId);
    } else if (effect.effectType === 'INSTANT') {
      assert.equal(effect.durationSeconds, null, effect.effectId);
      assert.notEqual(effect.trigger, 'Passive', effect.effectId);
    } else if (effect.effectType === 'STATE_CONDITIONAL') {
      assert.equal(effect.durationSeconds, null, effect.effectId);
      assert.ok(effect.conditions.length > 0, effect.effectId);
      assert.equal(effect.simulatorMode, 'MANUAL', effect.effectId);
    } else {
      assert.ok((effect.durationSeconds ?? 0) > 0, effect.effectId);
    }
  }
});

test('effect records stay independent from character/team/build recommendation records', () => {
  for (const effect of WEAPON_EFFECT_CATALOG) {
    for (const forbidden of [
      'characterId',
      'recommendedCharacterId',
      'teamProfileId',
      'rotationProfileId',
      'isBestInSlot',
      'uiSelectable',
      'conditionalAudit',
    ]) {
      assert.equal(Object.hasOwn(effect, forbidden), false, `${effect.effectId}: leaked ${forbidden}`);
    }
  }
});

test('permanent and stack-dependent weapon effects can coexist under one weapon', () => {
  const stringmaster = getWeaponEffects('stringmaster');
  assert.deepEqual(stringmaster.map((row) => row.effectId), ['SM-ATTR', 'SM-ATK']);
  assert.equal(stringmaster[0]?.effectType, 'PERMANENT');
  assert.equal(stringmaster[1]?.effectType, 'STACKING');
  assert.equal(stringmaster[1]?.maxStacks, 2);
});

test('conditional team effects remain conditional data rather than automatic uptime', () => {
  const kumokiri = getWeaponEffect('KUMO-TEAM');
  const spectrum = getWeaponEffect('SB-TEAM');
  const starfield = getWeaponEffect('SC-TEAM-CD');
  assert.ok(kumokiri && spectrum && starfield);
  assert.equal(kumokiri.mechanicsStatus, 'VERIFIED_CONDITIONAL');
  assert.equal(spectrum.mechanicsStatus, 'VERIFIED_CONDITIONAL');
  assert.equal(starfield.mechanicsStatus, 'VERIFIED_CONDITIONAL');
  assert.equal(spectrum.maxStacks, 3);
  assert.deepEqual(spectrum.rankValues, [.08, .10, .12, .14, .16]);
});

test('Relativistic Jet separates instant flat Energy from the timed ATK window', () => {
  const rows = getWeaponEffects('relativistic-jet');
  assert.deepEqual(rows.map((row) => row.effectId), ['RJ-ENERGY', 'RJ-ATK']);
  assert.equal(rows[0]?.valueUnit, 'FLAT_AMOUNT');
  assert.equal(rows[0]?.effectType, 'INSTANT');
  assert.deepEqual(rows[0]?.rankValues, [6, 7, 8, 9, 10]);
  assert.equal(rows[0]?.triggerCooldownSeconds, 20);
  assert.equal(rows[1]?.durationSeconds, 16);
  assert.equal(rows[1]?.simulatorMode, 'MANUAL');
});

test('Woodland Aria keeps self buffs separate from the target Aero RES debuff', () => {
  const rows = getWeaponEffects('woodland-aria');
  assert.deepEqual(rows.map((row) => row.effectId), ['WA-ATK', 'WA-AERO', 'WA-AERO-RES']);
  assert.equal(rows[0]?.effectType, 'PERMANENT');
  assert.equal(rows[1]?.durationSeconds, 10);
  assert.equal(rows[2]?.appliesTo, 'TARGET');
  assert.deepEqual(rows[2]?.rankValues, [.10, .115, .13, .145, .16]);
});

test('Pistol batch 2 preserves raw R1-R5 mechanics without assuming event uptime', () => {
  const expected = [
    ['cadenza', 'CAD-CONCERTO', [8, 10, 12, 14, 16], 'INSTANT', 'FLAT_AMOUNT', 1, 20],
    ['pistols-of-voyager', 'POV-ENERGY', [8, 9, 10, 11, 12], 'INSTANT', 'FLAT_AMOUNT', 1, 20],
    ['pistols-of-night', 'PON-ATK', [.08, .10, .12, .14, .16], 'TRIGGERED', 'DECIMAL_MULTIPLIER', 1, null],
    ['guardian-pistols', 'GP-SKILL', [.12, .15, .18, .21, .24], 'PERMANENT', 'DECIMAL_MULTIPLIER', 1, null],
    ['originite-type-iii', 'O3-HEAL', [.016, .02, .024, .028, .032], 'INSTANT', 'DECIMAL_MULTIPLIER', 1, 6],
    ['tyro-pistols', 'TYRO-P-ATK', [.05, .0625, .075, .0875, .10], 'PERMANENT', 'DECIMAL_MULTIPLIER', 1, null],
    ['training-pistols', 'TRAIN-P-ATK', [.04, .05, .06, .07, .08], 'PERMANENT', 'DECIMAL_MULTIPLIER', 1, null],
    ['undying-flame', 'UF-SKILL', [.20, .25, .30, .35, .40], 'TRIGGERED', 'DECIMAL_MULTIPLIER', 1, null],
    ['novaburst', 'NB-ATK', [.04, .05, .06, .07, .08], 'STACKING', 'DECIMAL_MULTIPLIER', 3, null],
    ['thunderbolt', 'TB-SKILL', [.07, .11, .15, .19, .23], 'STACKING', 'DECIMAL_MULTIPLIER', 3, 1],
  ] as const;

  for (const [weaponId, effectId, rankValues, effectType, valueUnit, maxStacks, triggerCooldownSeconds] of expected) {
    const rows = getWeaponEffects(weaponId);
    assert.equal(rows.length, 1, weaponId);
    const effect = rows[0];
    assert.ok(effect);
    assert.equal(effect.effectId, effectId);
    assert.deepEqual(effect.rankValues, rankValues);
    assert.equal(effect.effectType, effectType);
    assert.equal(effect.valueUnit, valueUnit);
    assert.equal(effect.maxStacks, maxStacks);
    assert.equal(effect.triggerCooldownSeconds, triggerCooldownSeconds);
    if (effectType === 'PERMANENT') assert.equal(effect.simulatorMode, 'ALWAYS');
    else assert.equal(effect.simulatorMode, 'MANUAL');
  }
});

test('Lux & Umbra models overlap DEF ignore as state-conditional rather than inventing a timer', () => {
  const rows = getWeaponEffects('lux-and-umbra');
  assert.deepEqual(rows.map((row) => row.effectId), ['LU-ATK', 'LU-HEAVY-AMP', 'LU-ECHO-AMP', 'LU-DEF']);
  const def = getWeaponEffect('LU-DEF');
  assert.ok(def);
  assert.equal(def.effectType, 'STATE_CONDITIONAL');
  assert.equal(def.durationSeconds, null);
  assert.deepEqual(def.conditions, ['LU-HEAVY-AMP is active', 'LU-ECHO-AMP is active']);
  assert.deepEqual(def.rankValues, [.08, .10, .12, .14, .16]);
});

test('Phasic Homogenizer keeps permanent ATK separate from conditional Tune Break DMG', () => {
  const rows = getWeaponEffects('phasic-homogenizer');
  assert.deepEqual(rows.map((row) => row.effectId), ['PH-ATK', 'PH-ATTR']);
  assert.deepEqual(rows[0]?.rankValues, [.12, .15, .18, .21, .24]);
  assert.deepEqual(rows[1]?.rankValues, [.20, .225, .25, .275, .30]);
  assert.equal(rows[1]?.durationSeconds, 14);
  assert.equal(rows[1]?.simulatorMode, 'MANUAL');
});

test('Skull Thrasher separates personal and team Hack effects', () => {
  const rows = getWeaponEffects('skull-thrasher');
  assert.deepEqual(rows.map((row) => row.effectId), ['SKT-ATK', 'SKT-INTRO-BASIC', 'SKT-HACK-BASIC', 'SKT-HACK-TEAM']);
  assert.equal(rows[2]?.appliesTo, 'SELF');
  assert.equal(rows[2]?.durationSeconds, 14);
  assert.equal(rows[3]?.appliesTo, 'TEAM');
  assert.equal(rows[3]?.durationSeconds, 30);
  assert.deepEqual(rows[3]?.rankValues, [.24, .30, .36, .42, .48]);
});

test('Spectral Trigger keeps Heavy DEF ignore tied to the Heavy amplification state', () => {
  const rows = getWeaponEffects('spectral-trigger');
  assert.deepEqual(rows.map((row) => row.effectId), ['SPT-ATK', 'SPT-SPECTRO', 'SPT-HEAVY-AMP', 'SPT-HEAVY-DEF']);
  assert.equal(rows[1]?.effectType, 'STACKING');
  assert.equal(rows[1]?.maxStacks, 2);
  assert.equal(rows[3]?.effectType, 'STATE_CONDITIONAL');
  assert.equal(rows[3]?.durationSeconds, null);
  assert.deepEqual(rows[3]?.rankValues, [.10, .125, .15, .175, .20]);
});

test('Static Mist uses NEXT_RESONATOR rather than mislabeling the Outro ATK buff as TEAM', () => {
  const rows = getWeaponEffects('static-mist');
  assert.deepEqual(rows.map((row) => row.effectId), ['STM-ER', 'STM-NEXT-ATK']);
  assert.deepEqual(rows[0]?.rankValues, [.128, .16, .192, .224, .256]);
  assert.equal(rows[1]?.appliesTo, 'NEXT_RESONATOR');
  assert.notEqual(rows[1]?.appliesTo, 'TEAM');
  assert.deepEqual(rows[1]?.rankValues, [.10, .125, .15, .175, .20]);
  assert.equal(rows[1]?.durationSeconds, 14);
});

test('The Last Dance keeps its short Skill window conditional', () => {
  const rows = getWeaponEffects('the-last-dance');
  assert.deepEqual(rows.map((row) => row.effectId), ['TLD-ATK', 'TLD-SKILL']);
  assert.deepEqual(rows[1]?.rankValues, [.48, .60, .72, .84, .96]);
  assert.equal(rows[1]?.durationSeconds, 5);
  assert.equal(rows[1]?.simulatorMode, 'MANUAL');
});

test('Pistols#26 preserves damage-triggered heal and explicit pending stack mutation', () => {
  const rows = getWeaponEffects('pistols-26');
  assert.deepEqual(rows.map((row) => row.effectId), ['P26-ATK', 'P26-HEAL', 'P26-STACK-LOSS']);
  assert.equal(rows[0]?.effectType, 'STACKING');
  assert.equal(rows[0]?.maxStacks, 2);
  assert.equal(rows[0]?.stackIntervalSeconds, 5);
  assert.deepEqual(rows[1]?.rankValues, [.05, .0625, .075, .0875, .10]);
  assert.equal(rows[2]?.mechanicsStatus, 'VERIFIED_RAW_PENDING_MODEL');
  assert.equal(rows[2]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(rows[2]?.rankValues, [1, 1, 1, 1, 1]);
});

test('Romance in Farewell and Solar Flame retain stack timing without automatic uptime', () => {
  const romance = getWeaponEffect('RIF-ATK');
  assert.ok(romance);
  assert.deepEqual(romance.rankValues, [.04, .05, .06, .07, .08]);
  assert.equal(romance.maxStacks, 4);
  assert.equal(romance.durationSeconds, 10);
  assert.equal(romance.triggerCooldownSeconds, 1);
  assert.equal(romance.simulatorMode, 'MANUAL');

  const solar = getWeaponEffects('solar-flame');
  assert.deepEqual(solar.map((row) => row.effectId), ['SF-ATK', 'SF-HEAVY']);
  for (const effect of solar) {
    assert.deepEqual(effect.rankValues, [.022, .034, .047, .059, .072]);
    assert.equal(effect.maxStacks, 4);
    assert.equal(effect.durationSeconds, 7);
    assert.equal(effect.triggerCooldownSeconds, 1);
    assert.equal(effect.stackIntervalSeconds, 1);
    assert.equal(effect.simulatorMode, 'MANUAL');
  }
});

test('Boson Astrolabe separates permanent ATK from its Tune Break windows', () => {
  const rows = getWeaponEffects('boson-astrolabe');
  assert.deepEqual(rows.map((row) => row.effectId), ['BOS-ATK', 'BOS-TUNE-ATK', 'BOS-TUNE-BASIC']);
  assert.deepEqual(rows[0]?.rankValues, [.12, .15, .18, .21, .24]);
  for (const effect of rows.slice(1)) {
    assert.deepEqual(effect.rankValues, [.12, .135, .15, .165, .18]);
    assert.equal(effect.durationSeconds, 14);
    assert.equal(effect.simulatorMode, 'MANUAL');
  }
});

test('Cosmic Ripples preserves the 0.5-second Basic stack trigger without assuming five stacks', () => {
  const rows = getWeaponEffects('cosmic-ripples');
  assert.deepEqual(rows.map((row) => row.effectId), ['COS-ER', 'COS-BASIC']);
  assert.deepEqual(rows[0]?.rankValues, [.128, .16, .192, .224, .256]);
  assert.deepEqual(rows[1]?.rankValues, [.032, .04, .048, .056, .064]);
  assert.equal(rows[1]?.effectType, 'STACKING');
  assert.equal(rows[1]?.maxStacks, 5);
  assert.equal(rows[1]?.durationSeconds, 8);
  assert.equal(rows[1]?.triggerCooldownSeconds, .5);
  assert.equal(rows[1]?.stackIntervalSeconds, .5);
  assert.equal(rows[1]?.simulatorMode, 'MANUAL');
});

test("Firstlight's Herald keeps verified values while conflicting team-state semantics stay pending-model", () => {
  const rows = getWeaponEffects('firstlights-herald');
  assert.deepEqual(rows.map((row) => row.effectId), ['FH-HP', 'FH-CONCERTO', 'FH-TEAM-ATK']);
  assert.deepEqual(rows[0]?.rankValues, [.12, .15, .18, .21, .24]);
  assert.equal(rows[1]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(rows[1]?.rankValues, [8, 10, 12, 14, 16]);
  assert.equal(rows[1]?.triggerCooldownSeconds, 20);
  assert.deepEqual(rows[2]?.rankValues, [.20, .25, .30, .35, .40]);
  assert.equal(rows[2]?.effectType, 'STATE_CONDITIONAL');
  assert.equal(rows[2]?.mechanicsStatus, 'VERIFIED_RAW_PENDING_MODEL');
  assert.equal(rows[2]?.durationSeconds, null);
  assert.equal(rows[2]?.appliesTo, 'TEAM');
});

test('Luminous Hymn separates self stacks from target-side Spectro Frazzle amplification', () => {
  const rows = getWeaponEffects('luminous-hymn');
  assert.deepEqual(rows.map((row) => row.effectId), ['LH-ATK', 'LH-BASIC', 'LH-HEAVY', 'LH-FRAZZLE-AMP']);
  assert.deepEqual(rows[0]?.rankValues, [.12, .15, .18, .21, .24]);
  for (const effect of rows.slice(1, 3)) {
    assert.deepEqual(effect.rankValues, [.14, .175, .21, .245, .28]);
    assert.equal(effect.effectType, 'STACKING');
    assert.equal(effect.maxStacks, 3);
    assert.equal(effect.durationSeconds, 6);
  }
  assert.deepEqual(rows[3]?.rankValues, [.30, .375, .45, .525, .60]);
  assert.equal(rows[3]?.appliesTo, 'TARGET');
  assert.equal(rows[3]?.durationSeconds, 30);
  assert.equal(rows[3]?.simulatorMode, 'MANUAL');
});

test('Stellar Symphony separates HP, flat Concerto and conditional team ATK', () => {
  const rows = getWeaponEffects('stellar-symphony');
  assert.deepEqual(rows.map((row) => row.effectId), ['SSY-HP', 'SSY-CONCERTO', 'SSY-TEAM-ATK']);
  assert.deepEqual(rows[0]?.rankValues, [.12, .15, .18, .21, .24]);
  assert.equal(rows[1]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(rows[1]?.rankValues, [8, 10, 12, 14, 16]);
  assert.equal(rows[1]?.triggerCooldownSeconds, 20);
  assert.deepEqual(rows[2]?.rankValues, [.14, .175, .21, .245, .28]);
  assert.equal(rows[2]?.appliesTo, 'TEAM');
  assert.equal(rows[2]?.durationSeconds, 30);
  assert.equal(rows[2]?.simulatorMode, 'MANUAL');
});

test('Rectifier batch 2 preserves audited event and stack mechanics without inventing uptime', () => {
  const augment = getWeaponEffects('augment');
  assert.deepEqual(augment.map((row) => row.effectId), ['AUG-ATK']);
  assert.deepEqual(augment[0]?.rankValues, [.15, .2325, .315, .3975, .48]);
  assert.equal(augment[0]?.durationSeconds, 15);
  assert.equal(augment[0]?.simulatorMode, 'MANUAL');

  const abyss = getWeaponEffects('call-of-the-abyss');
  assert.deepEqual(abyss.map((row) => row.effectId), ['COA-HEAL']);
  assert.deepEqual(abyss[0]?.rankValues, [.16, .20, .24, .28, .32]);
  assert.equal(abyss[0]?.durationSeconds, 15);

  const comet = getWeaponEffects('comet-flare');
  assert.deepEqual(comet.map((row) => row.effectId), ['CF-HEAL']);
  assert.deepEqual(comet[0]?.rankValues, [.03, .0375, .045, .0525, .06]);
  assert.equal(comet[0]?.effectType, 'STACKING');
  assert.equal(comet[0]?.maxStacks, 3);
  assert.equal(comet[0]?.durationSeconds, 8);
  assert.equal(comet[0]?.triggerCooldownSeconds, .6);
  assert.equal(comet[0]?.stackIntervalSeconds, .6);
  assert.equal(comet[0]?.simulatorMode, 'MANUAL');

  const fusion = getWeaponEffects('fusion-accretion');
  assert.deepEqual(fusion.map((row) => row.effectId), ['FA-ENERGY', 'FA-ATK']);
  assert.equal(fusion[0]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(fusion[0]?.rankValues, [6, 7, 8, 9, 10]);
  assert.equal(fusion[0]?.triggerCooldownSeconds, 20);
  assert.deepEqual(fusion[1]?.rankValues, [.10, .125, .15, .175, .20]);
  assert.equal(fusion[1]?.durationSeconds, 16);
  assert.equal(fusion[1]?.triggerCooldownSeconds, 20);

  const keeper = getWeaponEffects('jinzhou-keeper');
  assert.deepEqual(keeper.map((row) => row.effectId), ['JK-ATK', 'JK-HP']);
  assert.deepEqual(keeper[0]?.rankValues, [.08, .10, .12, .14, .16]);
  assert.deepEqual(keeper[1]?.rankValues, [.10, .125, .15, .175, .20]);
  for (const effect of keeper) {
    assert.equal(effect.durationSeconds, 15);
    assert.equal(effect.simulatorMode, 'MANUAL');
  }
});

test('Rectifier completion preserves source semantics and low-rarity mechanics', () => {
  const ocean = getWeaponEffects('oceans-gift');
  assert.deepEqual(ocean.map((row) => row.effectId), ['OG-SPECTRO']);
  assert.deepEqual(ocean[0]?.rankValues, [.06, .07, .08, .09, .10]);
  assert.equal(ocean[0]?.effectType, 'STACKING');
  assert.equal(ocean[0]?.durationSeconds, 6);
  assert.equal(ocean[0]?.maxStacks, 4);
  assert.equal(ocean[0]?.triggerCooldownSeconds, 1);
  assert.equal(ocean[0]?.stackIntervalSeconds, 1);
  assert.deepEqual(ocean[0]?.conditions, ['Damaged target is affected by Spectro Frazzle']);

  const radiant = getWeaponEffects('radiant-dawn');
  assert.deepEqual(radiant.map((row) => row.effectId), ['RD-ATK', 'RD-BASIC']);
  for (const effect of radiant) {
    assert.deepEqual(effect.rankValues, [.09, .139, .189, .238, .288]);
    assert.equal(effect.durationSeconds, 10);
    assert.equal(effect.simulatorMode, 'MANUAL');
  }

  const rectifier25 = getWeaponEffects('rectifier-25');
  assert.deepEqual(rectifier25.map((row) => row.effectId), ['R25-HEAL', 'R25-ATK']);
  assert.deepEqual(rectifier25[0]?.conditions, ['Wielder HP is below 60% when Resonance Skill is cast']);
  assert.equal(rectifier25[0]?.triggerCooldownSeconds, 8);
  assert.deepEqual(rectifier25[0]?.rankValues, [.05, .0625, .075, .0875, .10]);
  assert.deepEqual(rectifier25[1]?.conditions, ['Wielder HP is above 60% when Resonance Skill is cast']);
  assert.equal(rectifier25[1]?.triggerCooldownSeconds, null);
  assert.deepEqual(rectifier25[1]?.rankValues, [.12, .15, .18, .21, .24]);
  assert.match(rectifier25[1]?.notes ?? '', /exactly 60%.*unresolved/i);

  const variation = getWeaponEffects('variation');
  assert.deepEqual(variation.map((row) => row.effectId), ['VAR-CONCERTO']);
  assert.equal(variation[0]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(variation[0]?.rankValues, [8, 10, 12, 14, 16]);
  assert.equal(variation[0]?.triggerCooldownSeconds, 20);

  const waltz = getWeaponEffects('waltz-in-masquerade');
  assert.deepEqual(waltz.map((row) => row.effectId), ['WIM-ATK']);
  assert.equal(waltz[0]?.effectType, 'STACKING');
  assert.equal(waltz[0]?.durationSeconds, 10);
  assert.equal(waltz[0]?.maxStacks, 4);
  assert.equal(waltz[0]?.triggerCooldownSeconds, 1);
  assert.equal(waltz[0]?.stackIntervalSeconds, 1);

  const guardian = getWeaponEffects('guardian-rectifier');
  assert.deepEqual(guardian.map((row) => row.effectId), ['GR-BASIC', 'GR-HEAVY']);
  for (const effect of guardian) {
    assert.deepEqual(effect.rankValues, [.12, .15, .18, .21, .24]);
    assert.equal(effect.effectType, 'PERMANENT');
    assert.equal(effect.simulatorMode, 'ALWAYS');
  }

  const originite = getWeaponEffects('originite-type-v');
  assert.deepEqual(originite.map((row) => row.effectId), ['O5-HEAL']);
  assert.deepEqual(originite[0]?.rankValues, [.05, .0625, .075, .0875, .10]);
  assert.equal(originite[0]?.triggerCooldownSeconds, 20);

  const night = getWeaponEffects('rectifier-of-night');
  assert.deepEqual(night.map((row) => row.effectId), ['RON-ATK']);
  assert.equal(night[0]?.trigger, 'Cast Intro Skill');
  assert.deepEqual(night[0]?.rankValues, [.08, .10, .12, .14, .16]);
  assert.equal(night[0]?.durationSeconds, 10);

  const voyager = getWeaponEffects('rectifier-of-voyager');
  assert.deepEqual(voyager.map((row) => row.effectId), ['ROV-ENERGY']);
  assert.equal(voyager[0]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(voyager[0]?.rankValues, [8, 9, 10, 11, 12]);
  assert.equal(voyager[0]?.triggerCooldownSeconds, 20);

  const tyro = getWeaponEffects('tyro-rectifier');
  const training = getWeaponEffects('training-rectifier');
  assert.deepEqual(tyro[0]?.rankValues, [.05, .0625, .075, .0875, .10]);
  assert.deepEqual(training[0]?.rankValues, [.04, .05, .06, .07, .08]);
  assert.equal(tyro[0]?.effectType, 'PERMANENT');
  assert.equal(training[0]?.effectType, 'PERMANENT');
});

test('pending effect audit is explicit and cannot be consumed as an empty passive', () => {
  assert.equal(getWeaponEffectCoverageStatus('abyss-surges'), 'PENDING_SOURCE_AUDIT');
  assert.throws(
    () => getWeaponEffects('abyss-surges'),
    /PENDING_SOURCE_AUDIT.*must not be interpreted as zero effect/,
  );
  assert.equal(getWeaponEffect('DOES-NOT-EXIST'), null);
});

test('upcoming weapon effect coverage stays outside the released gate instead of reading as zero', () => {
  assert.equal(getWeaponEffectCoverageStatus('thousandfold-deliverance'), 'NOT_RELEASED');
  assert.throws(
    () => getWeaponEffects('thousandfold-deliverance'),
    /NOT_RELEASED.*must not be interpreted as zero effect/,
  );
});
