import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { auditCharacterActionsCoverage } from '../src/data/characterActionsCoverageAudit.ts';
import { auditCharacterForteRulesCoverage } from '../src/data/characterForteRulesCoverageAudit.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  CHARACTER_MECHANICS_PROFILE_BY_ID,
} from '../src/data/characterMechanics.ts';
import {
  auditCharacterInherentPassivesCoverage,
  renderCharacterInherentPassivesCoverageReport,
} from '../scripts/lib/character-inherent-passives-audit.ts';

test('released roster INHERENT_PASSIVES coverage matches all 114 pinned source rows', () => {
  const audit = auditCharacterInherentPassivesCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.sourceInherentSkillCount, 114);
  assert.equal(audit.verifiedCharacterIds.length, 57);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.deepEqual(audit.blockedCharacterIds, []);
  assert.deepEqual(audit.blockers, []);
  assert.deepEqual(audit.issues, []);
});

test('new Inherent Skill facts preserve the pinned source values for the three partial profiles', async () => {
  const source = JSON.parse(await readFile('data/source/character-forte-ui.json', 'utf8'));
  const byId = new Map(source.characters.map((character: { characterId: string }) => [character.characterId, character]));

  const buling = byId.get('buling') as any;
  const bulingTime = buling.moves.find((move: any) => move.id === 1004304);
  const bulingFlare = buling.moves.find((move: any) => move.id === 1004305);
  assert.deepEqual(bulingTime.descriptionParams, ['50%', '25%']);
  assert.deepEqual(bulingFlare.descriptionParams, ['4', '10']);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.get('buling-inherent-time-arrives-evil-declines')?.verificationStatus, 'VERIFIED');
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.get('buling-inherent-earthly-immortal-is-here')?.verificationStatus, 'VERIFIED');

  const danjin = byId.get('danjin') as any;
  const crimson = danjin.moves.find((move: any) => move.id === 1000804);
  const overflow = danjin.moves.find((move: any) => move.id === 1000805);
  assert.deepEqual(crimson.descriptionParams, ['20%']);
  assert.deepEqual(overflow.descriptionParams, ['30%', '5']);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.get('danjin-inherent-crimson-light')?.verificationStatus, 'VERIFIED');
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.get('danjin-inherent-overflow')?.verificationStatus, 'VERIFIED');

  const xiangli = byId.get('xiangli-yao') as any;
  const knowing = xiangli.moves.find((move: any) => move.id === 1002304);
  const focus = xiangli.moves.find((move: any) => move.id === 1002305);
  assert.deepEqual(knowing.descriptionParams, ['5%', '8', '4']);
  assert.deepEqual(focus.descriptionParams, []);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.get('xiangli-yao-inherent-knowing')?.verificationStatus, 'VERIFIED');
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.get('xiangli-yao-inherent-focus')?.verificationStatus, 'VERIFIED');
});

test('legacy Inherent Skill drift is normalized to exact pinned source identities and explicit values', () => {
  const expectedNames = new Map([
    ['cantarella-inherent-cure', 'Inherent Skill — "Cure"'],
    ['cantarella-inherent-poison', 'Inherent Skill — "Poison"'],
    ['cartethyia-inherent-a-hearts-truest-wishes', "Inherent Skill — A Heart's Truest Wishes"],
    ['cartethyia-inherent-winds-indelible-imprint', "Inherent Skill — Wind's Indelible Imprint"],
    ['hiyuki-forte-glacio-bite-and-fine-snow', 'Inherent Skill — Fine Snow'],
    ['lupa-inherent-applause-of-victory', 'Inherent Skill — Applause of Victory'],
    ['lynae-inherent-colors-never-fade', 'Inherent Skill — Colors Never Fade!'],
    ['lynae-inherent-adaptive-optics', 'Inherent Skill — "Adaptive Optics: Everyday Applications"'],
    ['rebecca-inherent-tag-youre-it', "Inherent Skill — Tag, You're It!"],
  ]);

  for (const [factId, name] of expectedNames) {
    assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.get(factId)?.name, name, factId);
  }

  assert.match(CHARACTER_MECHANIC_FACT_BY_ID.get('hiyuki-forte-glacio-bite-and-fine-snow')?.effectSummary ?? '', /30%.*40%.*102%.*30%/);
  assert.match(CHARACTER_MECHANIC_FACT_BY_ID.get('lynae-inherent-colors-never-fade')?.effectSummary ?? '', /600.*20% Lumiflow per second/);
  assert.match(CHARACTER_MECHANIC_FACT_BY_ID.get('lynae-inherent-adaptive-optics')?.effectSummary ?? '', /25%.*9s.*15s/);
});

test('INHERENT_PASSIVES completion does not change ACTIONS or FORTE_RULES coverage', () => {
  const actions = auditCharacterActionsCoverage();
  const forte = auditCharacterForteRulesCoverage();

  assert.equal(actions.releasedCount, 57);
  assert.equal(actions.verifiedCharacterIds.length, 55);
  assert.deepEqual(actions.partialCharacterIds, []);
  assert.deepEqual(actions.blockedCharacterIds, ['buling', 'xiangli-yao']);
  assert.deepEqual(actions.blockers.map((blocker) => blocker.blockerId), [
    'ACTIONS-BULING-1307031-DAMAGE-CLASS',
    'ACTIONS-XIANGLI-YAO-1305015-1305017-DAMAGE-CLASS',
  ]);

  assert.equal(forte.releasedCount, 57);
  assert.equal(forte.verifiedCharacterIds.length, 55);
  assert.deepEqual(forte.partialCharacterIds, []);
  assert.deepEqual(forte.blockedCharacterIds, ['buling', 'danjin']);
  assert.deepEqual(forte.blockers.map((blocker) => blocker.blockerId), [
    'FORTE-BULING-1307031-DAMAGE-CLASS',
    'FORTE-DANJIN-1000807-FULL-POWER-THRESHOLD',
  ]);
});

test('the three partial full mechanics profiles stay partial while only INHERENT_PASSIVES advances', () => {
  const expected = {
    buling: { actions: 'PARTIAL', forte: 'PARTIAL' },
    danjin: { actions: 'VERIFIED', forte: 'PARTIAL' },
    'xiangli-yao': { actions: 'PARTIAL', forte: 'VERIFIED' },
  } as const;

  for (const [characterId, states] of Object.entries(expected)) {
    const profile = CHARACTER_MECHANICS_PROFILE_BY_ID.get(characterId);
    assert.equal(profile?.verificationStatus, 'PARTIALLY_VERIFIED');
    assert.equal(profile?.coverage.find((entry) => entry.area === 'ACTIONS')?.status, states.actions);
    assert.equal(profile?.coverage.find((entry) => entry.area === 'FORTE_RULES')?.status, states.forte);
    assert.equal(profile?.coverage.find((entry) => entry.area === 'INHERENT_PASSIVES')?.status, 'VERIFIED');
    assert.equal(profile?.coverage.find((entry) => entry.area === 'OUTRO_EFFECT')?.status, 'PENDING');
    assert.equal(profile?.coverage.find((entry) => entry.area === 'RESOURCE_RULES')?.status, 'PENDING');
    assert.equal(profile?.coverage.find((entry) => entry.area === 'SEQUENCES')?.status, 'PENDING');
  }
});

test('qualitative or underspecified Inherent mechanics stay source-exact and non-executable', () => {
  const focus = CHARACTER_MECHANIC_FACT_BY_ID.get('xiangli-yao-inherent-focus');
  const knowing = CHARACTER_MECHANIC_FACT_BY_ID.get('xiangli-yao-inherent-knowing');
  const bulingHealing = CHARACTER_MECHANIC_FACT_BY_ID.get('buling-inherent-time-arrives-evil-declines');

  assert.equal(focus?.modelingStatus, 'PENDING_INTERPRETATION');
  assert.equal(knowing?.modelingStatus, 'PENDING_INTERPRETATION');
  assert.equal(bulingHealing?.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(focus?.notes?.join(' ') ?? '', /no numeric interruption-resistance magnitude/i);
  assert.match(knowing?.notes?.join(' ') ?? '', /not stated/i);
  assert.equal(bulingHealing?.durationSeconds, null);
});

test('checked-in INHERENT_PASSIVES report matches the deterministic render', async () => {
  const expected = renderCharacterInherentPassivesCoverageReport();
  const current = await readFile('docs/CHARACTER_INHERENT_PASSIVES_COVERAGE.md', 'utf8');
  assert.equal(current, expected);
});
