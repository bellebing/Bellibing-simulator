import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { auditCharacterActionsCoverage } from '../src/data/characterActionsCoverageAudit.ts';
import { auditCharacterForteRulesCoverage } from '../src/data/characterForteRulesCoverageAudit.ts';
import {
  CHARACTER_MECHANIC_FACTS,
  CHARACTER_MECHANIC_FACT_BY_ID,
  CHARACTER_MECHANICS_PROFILE_BY_ID,
} from '../src/data/characterMechanics.ts';
import { CHARACTER_MECHANICS_PROFILES as BASE_CHARACTER_MECHANICS_PROFILES } from '../src/data/characterMechanicsBase.ts';
import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import { FINAL_BLOCKER_RESOLVED_CHARACTER_MECHANICS_PROFILES } from '../src/data/characterMechanics/finalBlockerResolvedProfiles.ts';
import {
  CHARACTER_ACTION_SOURCE_BLOCKERS,
  XIANGLI_YAO_ACTION_FACTS,
} from '../src/data/characterMechanics/rosterActionCompletion.ts';
import { CHARACTER_FORTE_RULE_SOURCE_BLOCKERS } from '../src/data/characterMechanics/rosterForteCompletion.ts';
import { CHARACTER_INHERENT_PASSIVE_SOURCE_BLOCKERS } from '../src/data/characterMechanics/rosterInherentPassiveCompletion.ts';
import {
  CHARACTER_OUTRO_EFFECT_SOURCE_BLOCKERS,
  ROSTER_OUTRO_COMPLETION_FACTS,
  ROSTER_OUTRO_COMPLETION_PROFILES,
} from '../src/data/characterMechanics/rosterOutroCompletion.ts';
import { auditCharacterInherentPassivesCoverage } from '../scripts/lib/character-inherent-passives-audit.ts';
import {
  auditCharacterOutroEffectsCoverage,
  renderCharacterOutroEffectsCoverageReport,
} from '../scripts/lib/character-outro-effects-audit.ts';

function renderSourceText(template: string, params: readonly string[]): string {
  return template
    .replace(/\{(\d+)\}/g, (_, index: string) => params[Number(index)] ?? '')
    .replace(/<[^>]*>/g, '');
}

test('released roster OUTRO_EFFECT coverage matches all 57 pinned source rows', () => {
  const audit = auditCharacterOutroEffectsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.sourceOutroSkillCount, 57);
  assert.equal(audit.verifiedCharacterIds.length, 57);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.deepEqual(audit.blockedCharacterIds, []);
  assert.deepEqual(audit.blockers, []);
  assert.deepEqual(audit.issues, []);
});

test('Buling, Danjin and Xiangli Yao Outro facts re-derive the exact pinned source rows', async () => {
  const source = JSON.parse(await readFile('data/source/character-forte-ui.json', 'utf8'));
  const byId = new Map(source.characters.map((character: { characterId: string }) => [character.characterId, character]));

  const expected = [
    {
      characterId: 'buling',
      moveId: 1004309,
      name: 'Exorcism Spell',
      description: "Heal the active Resonator in the team by 18% of Buling's ATK per second for 16s. All nearby Resonators in the team have their DMG Amplified by 15% for 30s.",
    },
    {
      characterId: 'danjin',
      moveId: 1000809,
      name: 'Duality',
      description: 'The incoming Resonator has their Havoc DMG Amplified by 23% for 14s or until they are switched out.',
    },
    {
      characterId: 'xiangli-yao',
      moveId: 1002309,
      name: 'Chain Rule',
      description: "Xiangli Yao will call down a laser beam upon the first target the incoming Resonator's Basic Attack hits, dealing Electro DMG equal to 237.63% of Xiangli Yao's ATK to an area. This effect lasts for 8s and can be triggered once every 2s, up to 3 times.",
    },
  ] as const;

  for (const row of expected) {
    const character = byId.get(row.characterId) as any;
    const move = character.moves.find((candidate: any) => candidate.id === row.moveId);
    assert.equal(move.type, 11, row.characterId);
    assert.equal(move.name, row.name, row.characterId);
    assert.equal(renderSourceText(move.description, move.descriptionParams), row.description, row.characterId);
  }
});

test('new Outro facts preserve ownership, section, source kind and source-explicit semantics', () => {
  assert.equal(ROSTER_OUTRO_COMPLETION_FACTS.length, 3);
  assert.equal(new Set(ROSTER_OUTRO_COMPLETION_FACTS.map((fact) => fact.factId)).size, 3);
  assert.deepEqual(ROSTER_OUTRO_COMPLETION_FACTS.map((fact) => fact.characterId).sort(), ['buling', 'danjin', 'xiangli-yao']);

  for (const fact of ROSTER_OUTRO_COMPLETION_FACTS) {
    assert.equal(fact.section, 'OUTRO_SKILL');
    assert.equal(fact.verificationStatus, 'VERIFIED');
    assert.equal(fact.modelingStatus, 'PENDING_INTERPRETATION');
  }

  const buling = CHARACTER_MECHANIC_FACT_BY_ID.get('buling-outro-exorcism-spell');
  assert.equal(buling?.kind, 'PASSIVE');
  if (buling?.kind === 'PASSIVE') {
    assert.equal(buling.scope, 'TEAM');
    assert.equal(buling.durationSeconds, 30);
    assert.equal(buling.maxStacks, null);
    assert.match(buling.effectSummary, /18%.*16s.*15%.*30s/);
  }

  const danjin = CHARACTER_MECHANIC_FACT_BY_ID.get('danjin-outro-duality');
  assert.equal(danjin?.kind, 'PASSIVE');
  if (danjin?.kind === 'PASSIVE') {
    assert.equal(danjin.scope, 'NEXT_CHARACTER');
    assert.equal(danjin.durationSeconds, 14);
    assert.equal(danjin.maxStacks, null);
    assert.match(danjin.effectSummary, /23%.*14s.*switched out/);
  }

  const xiangli = CHARACTER_MECHANIC_FACT_BY_ID.get('xiangli-yao-outro-chain-rule');
  const preExistingXiangliOutro = XIANGLI_YAO_ACTION_FACTS.find((fact) => fact.factId === 'xiangli-yao-outro-chain-rule');
  assert.strictEqual(xiangli, preExistingXiangliOutro, 'OUTRO_EFFECT must reuse the pre-existing ACTIONS fact unchanged');
  assert.equal(xiangli?.kind, 'ACTION');
  if (xiangli?.kind === 'ACTION') {
    assert.equal(xiangli.actionKind, 'OUTRO');
    assert.equal(xiangli.actionRole, 'DAMAGE');
    assert.equal(xiangli.damageClass, 'OUTRO');
    assert.equal(xiangli.scalingStat, 'ATK');
    assert.equal(xiangli.motionValue, null);
    assert.equal(xiangli.sourceFixedMotionValue, 2.3763);
    assert.equal(xiangli.hitCount, 1);
    assert.equal(xiangli.motionValueCurve ?? null, null);
    assert.equal(xiangli.motionValueComponents ?? null, null);
    assert.equal(xiangli.sourceFixedMotionValueComponents ?? null, null);
    assert.equal(xiangli.sourceFixedFlatDamage ?? null, null);
    const xiangliNotes = xiangli.notes?.join(' ') ?? '';
    assert.match(xiangliNotes, /\b8s\b/i);
    assert.match(xiangliNotes, /once every 2s/i);
    assert.match(xiangliNotes, /up to 3/i);
  }
});

test('VERIFIED OUTRO_EFFECT coverage is backed by linked VERIFIED Outro facts with no duplicate facts', () => {
  assert.equal(new Set(CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId)).size, CHARACTER_MECHANIC_FACTS.length);

  const audit = auditCharacterOutroEffectsCoverage();
  for (const characterId of audit.verifiedCharacterIds) {
    const profile = CHARACTER_MECHANICS_PROFILE_BY_ID.get(characterId);
    assert.equal(profile?.coverage.find((entry) => entry.area === 'OUTRO_EFFECT')?.status, 'VERIFIED', characterId);
    const facts = profile?.factIds
      .map((factId) => CHARACTER_MECHANIC_FACT_BY_ID.get(factId))
      .filter((fact) => fact?.section === 'OUTRO_SKILL' && (fact.kind === 'PASSIVE' || fact.kind === 'ACTION')) ?? [];
    assert.ok(facts.length > 0, characterId);
    assert.ok(facts.every((fact) => fact?.verificationStatus === 'VERIFIED'), characterId);
    assert.ok(facts.every((fact) => fact?.characterId === characterId), characterId);
  }
});

test('OUTRO_EFFECT completion leaves ACTIONS, FORTE_RULES and INHERENT_PASSIVES coverage exactly unchanged', () => {
  const actions = auditCharacterActionsCoverage();
  assert.equal(actions.releasedCount, 57);
  assert.equal(actions.verifiedCharacterIds.length, 55);
  assert.deepEqual(actions.partialCharacterIds, []);
  assert.deepEqual(actions.blockedCharacterIds, ['buling', 'xiangli-yao']);
  assert.deepEqual(actions.blockers.map((blocker) => blocker.blockerId), [
    'ACTIONS-BULING-1307031-DAMAGE-CLASS',
    'ACTIONS-XIANGLI-YAO-1305015-1305017-DAMAGE-CLASS',
  ]);

  const forte = auditCharacterForteRulesCoverage();
  assert.equal(forte.releasedCount, 57);
  assert.equal(forte.verifiedCharacterIds.length, 55);
  assert.deepEqual(forte.partialCharacterIds, []);
  assert.deepEqual(forte.blockedCharacterIds, ['buling', 'danjin']);
  assert.deepEqual(forte.blockers.map((blocker) => blocker.blockerId), [
    'FORTE-BULING-1307031-DAMAGE-CLASS',
    'FORTE-DANJIN-1000807-FULL-POWER-THRESHOLD',
  ]);

  const inherent = auditCharacterInherentPassivesCoverage();
  assert.equal(inherent.verifiedCharacterIds.length, 57);
  assert.deepEqual(inherent.partialCharacterIds, []);
  assert.deepEqual(inherent.blockedCharacterIds, []);
});

test('current ACTIONS/FORTE source blockers remain unchanged and OUTRO adds none', () => {
  assert.deepEqual(CHARACTER_ACTION_SOURCE_BLOCKERS.map((blocker) => blocker.blockerId), [
    'ACTIONS-BULING-1307031-DAMAGE-CLASS',
    'ACTIONS-XIANGLI-YAO-1305015-1305017-DAMAGE-CLASS',
  ]);
  assert.deepEqual(CHARACTER_FORTE_RULE_SOURCE_BLOCKERS.map((blocker) => blocker.blockerId), [
    'FORTE-BULING-1307031-DAMAGE-CLASS',
    'FORTE-DANJIN-1000807-FULL-POWER-THRESHOLD',
  ]);
  assert.deepEqual(CHARACTER_INHERENT_PASSIVE_SOURCE_BLOCKERS, []);
  assert.deepEqual(CHARACTER_OUTRO_EFFECT_SOURCE_BLOCKERS, []);
});

test('the three partial profiles advance only OUTRO_EFFECT; RESOURCE_RULES and SEQUENCES remain untouched', () => {
  const expected = {
    buling: { actions: 'PARTIAL', forte: 'PARTIAL' },
    danjin: { actions: 'VERIFIED', forte: 'PARTIAL' },
    'xiangli-yao': { actions: 'PARTIAL', forte: 'VERIFIED' },
  } as const;

  assert.deepEqual(ROSTER_OUTRO_COMPLETION_PROFILES.map((profile) => profile.characterId).sort(), ['buling', 'danjin', 'xiangli-yao']);
  for (const [characterId, states] of Object.entries(expected)) {
    const profile = CHARACTER_MECHANICS_PROFILE_BY_ID.get(characterId);
    assert.equal(profile?.verificationStatus, 'PARTIALLY_VERIFIED');
    assert.equal(profile?.coverage.find((entry) => entry.area === 'ACTIONS')?.status, states.actions);
    assert.equal(profile?.coverage.find((entry) => entry.area === 'FORTE_RULES')?.status, states.forte);
    assert.equal(profile?.coverage.find((entry) => entry.area === 'INHERENT_PASSIVES')?.status, 'VERIFIED');
    assert.equal(profile?.coverage.find((entry) => entry.area === 'OUTRO_EFFECT')?.status, 'VERIFIED');
    assert.equal(profile?.coverage.find((entry) => entry.area === 'RESOURCE_RULES')?.status, 'PENDING');
    assert.equal(profile?.coverage.find((entry) => entry.area === 'SEQUENCES')?.status, 'PENDING');
  }

  const mechanics = auditCharacterMechanicsCoverage();
  assert.equal(mechanics.verifiedCharacterIds.length, 54);
  assert.deepEqual([...mechanics.partialCharacterIds].sort(), ['buling', 'danjin', 'xiangli-yao']);
  assert.deepEqual(mechanics.unstartedCharacterIds, []);
});

test('the existing 54 fully verified Character profiles are unchanged by the isolated completion layer', () => {
  const previousVerifiedProfiles = [
    ...BASE_CHARACTER_MECHANICS_PROFILES,
    ...FINAL_BLOCKER_RESOLVED_CHARACTER_MECHANICS_PROFILES,
  ];
  assert.equal(previousVerifiedProfiles.length, 54);

  for (const previous of previousVerifiedProfiles) {
    assert.deepEqual(CHARACTER_MECHANICS_PROFILE_BY_ID.get(previous.characterId), previous, previous.characterId);
  }
});

test('checked-in OUTRO_EFFECT report matches the deterministic render', async () => {
  const expected = renderCharacterOutroEffectsCoverageReport();
  const current = await readFile('docs/CHARACTER_OUTRO_EFFECT_COVERAGE.md', 'utf8');
  assert.equal(current, expected);
});
