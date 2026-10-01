import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { ECHO_SKILL_RAW } from '../src/data/echoSkillRaw.ts';
import { ECHO_SKILL_SOURCE_REVIEW_V36 } from '../src/data/echoSkillSourceReview.ts';
import { projectEchoIdentityUiCatalog } from '../src/echoIdentityUiProjection.ts';

test('pinned raw Echo Skill coverage is exact and every released identity renders Rank-5 text', () => {
  const projected = projectEchoIdentityUiCatalog();
  const released = ECHO_CATALOG.filter(row => row.releaseStatus === 'RELEASED');
  assert.equal(projected.length, 187);
  assert.equal(ECHO_SKILL_RAW.length, ECHO_SKILL_SOURCE_REVIEW_V36.expectedEnglishDescriptionCount);
  assert.deepEqual(projected.map(row => row.echoId), released.map(row => row.id));
  assert.ok(projected.every(row => row.sourceStatus === 'VERIFIED' && row.skillDescription && row.cooldownSeconds));
  assert.ok(projected.every(row => !/[{}<>]/.test(row.skillDescription)));
});

test('demo Echo and special source markup render deterministically without guessed values', () => {
  const projected = projectEchoIdentityUiCatalog();
  const abyssal = projected.find(row => row.echoId === 'echo-60000775');
  assert.ok(abyssal);
  assert.match(abyssal.skillDescription, /268\.2% Glacio DMG/);
  assert.match(abyssal.skillDescription, /CD: 15s/);
  assert.equal(abyssal.cooldownSeconds, 15);
  const leviathan = projected.find(row => row.echoId === 'echo-60001675');
  assert.ok(leviathan);
  assert.doesNotMatch(leviathan.skillDescription, /SapTag|Cus:Sap/);
});
