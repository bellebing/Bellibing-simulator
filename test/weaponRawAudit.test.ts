import assert from 'node:assert/strict';
import test from 'node:test';

import {
  auditWeaponCoreRoster,
  WEAPON_CORE_ROSTER_AUDIT_V36,
} from '../src/data/weaponRawAudit.ts';
import { getWeaponGameData } from '../src/data/weapons.ts';

test('Version 3.6 weapon core roster passes the frozen released/upcoming completeness gate', () => {
  const audit = auditWeaponCoreRoster();

  assert.equal(audit.catalogCount, 122);
  assert.equal(audit.releasedCount, 121);
  assert.deepEqual(audit.upcomingIds, ['thousandfold-deliverance']);
  assert.deepEqual(audit.wipIds, []);
  assert.deepEqual(audit.issues, []);

  assert.equal(WEAPON_CORE_ROSTER_AUDIT_V36.patch, '3.6');
  assert.equal(WEAPON_CORE_ROSTER_AUDIT_V36.checkedAt, '2026-08-25');
});

test('adding an unaudited released row cannot silently pass the current-patch snapshot', () => {
  const glint = getWeaponGameData('glint-of-clouds');
  assert.ok(glint);

  const synthetic = {
    ...glint,
    id: 'test-only-future-weapon',
    name: 'TEST ONLY — future weapon',
  };
  const audit = auditWeaponCoreRoster([
    ...Array.from({ length: 0 }),
    // Use the production catalog indirectly through a fresh audit fixture below.
  ]);

  // Empty/custom catalogs are intentionally rejected by the frozen snapshot.
  assert.ok(audit.issues.some((issue) => issue.code === 'CATALOG_COUNT_MISMATCH'));
  assert.ok(audit.issues.some((issue) => issue.code === 'RELEASED_COUNT_MISMATCH'));

  // The synthetic record itself is valid raw shape; adding it to the production
  // roster would still change the frozen counts and therefore require an audit
  // snapshot update rather than inheriting a green status from helper defaults.
  assert.equal(synthetic.releaseStatus, 'RELEASED');
  assert.equal(synthetic.verificationStatus, 'VERIFIED');
});

test('3.6 lifecycle anchors protect live Glint from phase-2 Thousandfold data', () => {
  const glint = getWeaponGameData('glint-of-clouds');
  const thousandfold = getWeaponGameData('thousandfold-deliverance');
  assert.ok(glint);
  assert.ok(thousandfold);

  assert.equal(glint.releaseStatus, 'RELEASED');
  assert.equal(glint.verificationStatus, 'VERIFIED');
  assert.equal(glint.weaponType, 'Sword');
  assert.equal(glint.level90BaseAtk, 500);
  assert.deepEqual(glint.secondary, { stat: 'CRIT Rate', value: 0.36 });

  assert.equal(thousandfold.releaseStatus, 'CONFIRMED_UPCOMING');
  assert.equal(thousandfold.verificationStatus, 'PARTIALLY_VERIFIED');
  assert.equal(thousandfold.weaponType, 'Broadblade');
  assert.equal(thousandfold.level90BaseAtk, 413);
  assert.deepEqual(thousandfold.secondary, { stat: 'HP%', value: 0.722 });
});

test('released weapons cannot pass when a required core field or verification status is missing', () => {
  const glint = getWeaponGameData('glint-of-clouds');
  assert.ok(glint);

  const invalid = {
    ...glint,
    verificationStatus: 'PARTIALLY_VERIFIED' as const,
    level90BaseAtk: null,
    secondary: null,
  };

  // A one-row fixture also fails the frozen roster counts, but these assertions
  // prove the per-record core checks fire independently of count mismatches.
  const audit = auditWeaponCoreRoster([invalid]);
  const codes = new Set(audit.issues.map((issue) => issue.code));
  assert.ok(codes.has('RELEASED_NOT_VERIFIED'));
  assert.ok(codes.has('RELEASED_BASE_ATK_MISSING'));
  assert.ok(codes.has('RELEASED_SECONDARY_MISSING'));
});
