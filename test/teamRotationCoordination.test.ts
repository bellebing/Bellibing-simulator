import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { coordinateTeamRotation as coordinate } from '../src/teamRotationCoordination.ts';
import { TEAM_ROTATION_CASES, TEAM_ROTATION_PROOFS, ROTATION_PARTICIPATION, TEAM_ROTATION_COORDINATION_REVIEW as review } from '../src/data/teamRotationCoordination.ts';
import { TEAM_AWARE_ROTATION_REFERENCES } from '../src/data/teamAwareRotationReferences.ts';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';
import type { TeamRotationCoordinationInput } from '../src/teamRotationCoordinationDomain.ts';
const team = (...ids:string[]):TeamRotationCoordinationInput => ({members:ids.map(characterId=>({characterId}))});

test('all 96 references are sorted once; reviewed cases have live canonical joins and source pins',()=>{
  assert.equal(ROTATION_PARTICIPATION.length,96);
  assert.deepEqual(ROTATION_PARTICIPATION.map(row=>row.referenceId).sort(),TEAM_AWARE_ROTATION_REFERENCES.map(row=>row.id).sort());
  assert.equal(new Set(ROTATION_PARTICIPATION.map(row=>row.referenceId)).size,96);
  assert.equal(TEAM_ROTATION_CASES.length,19);
  const refs = new Map(TEAM_AWARE_ROTATION_REFERENCES.map(row=>[row.id,row]));
  for (const item of TEAM_ROTATION_CASES) {
    assert.ok(item.proofIds.length);
    assert.equal(item.flowBasis,'REVIEWED_MEMBER_GUIDANCE_SYNTHESIS');
    for (const member of item.members) for (const id of member.referenceHints) assert.equal(refs.get(id)?.characterId,member.characterId);
    for (const id of item.proofIds) {
      const proof=TEAM_ROTATION_PROOFS.find(row=>row.id===id)!;assert.ok(proof);
      const ref=TEAM_AWARE_ROTATION_REFERENCES.find(row=>row.characterId===proof.characterId)!;
      assert.equal(proof.sectionSha256,ref.source.sectionSha256);assert.equal(proof.sourceUrl,ref.source.url);
    }
  }
  assert.equal(createHash('sha256').update(readFileSync(review.sourceArtifact)).digest('hex'),review.sourceArtifactSha256);
  const generator=spawnSync(process.execPath,['--experimental-strip-types','scripts/generate-team-rotation-coordination.mjs','--check'],{encoding:'utf8'});
  assert.equal(generator.status,0,generator.stderr||generator.stdout);
});

test('Augusta team connects the documented semi-DPS Iuno rather than silently replacing it with the old hybrid',()=>{
  const plan=coordinate(team('augusta','iuno','the-shorekeeper'));
  assert.equal(plan.pattern.id,'SINGLE_CARRY');assert.equal(plan.descriptionBasis,'REVIEWED_SOURCE_CASE');
  assert.equal(plan.members.find(row=>row.characterId==='iuno')?.referenceId,'prydwen-iuno-augusta-semi-dps');
  assert.equal(plan.members.find(row=>row.characterId==='the-shorekeeper')?.referenceId,null);
  assert.ok(plan.info.some(row=>row.code==='REFERENCE_CHOICE_NEEDED'));
  const changed=coordinate({members:[{characterId:'augusta'},{characterId:'iuno',modeKey:'hybrid',referenceId:'prydwen-iuno-hybrid'},{characterId:'the-shorekeeper'}]});
  assert.equal(changed.members.find(row=>row.characterId==='iuno')?.referenceId,'prydwen-iuno-hybrid');
  assert.equal(changed.descriptionStatus,'SOURCE_CASE_WITH_DIFFERENCES');
  assert.ok(changed.info.some(row=>row.code==='REFERENCE_VARIANT_DIFFERS'));
});

test('Hsin Unison keeps a five-window description without concatenating two complete Jinhsi guide loops',()=>{
  const plan=coordinate(team('hsin','jinhsi','the-shorekeeper'));
  assert.equal(plan.pattern.id,'CARRY_REENTRY');assert.equal(plan.broadFlowSv.length,5);
  assert.equal(plan.members.find(row=>row.characterId==='hsin')?.referenceId,'prydwen-hsin-unison');
  assert.ok(plan.info.some(row=>/hela hennes personliga referens/.test(row.messageSv)));
  assert.equal(Object.hasOwn(plan,'actionSchedule'),false);assert.equal(plan.flowPrecision,'WINDOWS_NOT_ACTION_TIMELINE');
  const different=coordinate({members:[{characterId:'hsin',referenceId:'prydwen-hsin-electro-flare'},{characterId:'jinhsi'},{characterId:'the-shorekeeper'}]});
  assert.equal(different.sourceCaseId,null);assert.ok(different.info.some(row=>row.code==='SOURCE_MODE_DIFFERS'));
});

test('Cartethyia distinguishes the whole Chisa/Aero pair from a partial pair and source-supported Cia supports',()=>{
  assert.equal(coordinate(team('cartethyia','ciaccona','the-shorekeeper')).sourceCaseId,'cartethyia-ciaccona-the-shorekeeper');
  assert.equal(coordinate(team('cartethyia','chisa','rover-aero')).sourceCaseId,'cartethyia-chisa-rover-aero');
  const low=coordinate(team('cartethyia','chisa','verina'));
  assert.equal(low.sourceCaseId,'cartethyia-low-erosion');
  assert.equal(low.members.find(row=>row.characterId==='cartethyia')?.referenceId,'prydwen-cartethyia-low-aero-erosion');
  assert.equal(low.partyEvidence,'PARTNER_CONTEXT');
});

test('off-field Phrolova selects the adapted Lucilla/Cantarella reference and preserves incoming caller order',()=>{
  const input=team('qiuyuan','lucilla','phrolova'),original=structuredClone(input);
  const plan=coordinate(input);assert.deepEqual(input,original);assert.deepEqual(plan.party,['qiuyuan','lucilla','phrolova']);
  assert.equal(plan.pattern.id,'OFF_FIELD_ANCHOR');
  assert.equal(plan.members.find(row=>row.characterId==='lucilla')?.referenceId,'prydwen-lucilla-phrolova');
  const cant=coordinate(team('cantarella','phrolova','the-shorekeeper'));
  assert.equal(cant.members.find(row=>row.characterId==='cantarella')?.referenceId,'prydwen-cantarella-phrolova');
  assert.equal(cant.partyEvidence,'PARTNER_CONTEXT');
});

test('Havoc Rover/Danjin basic hypercarry and explicit shared-DPS mode select different source paths',()=>{
  const hyper=coordinate(team('rover-havoc','danjin','verina'));
  assert.equal(hyper.pattern.id,'SINGLE_CARRY');assert.equal(hyper.members.find(row=>row.characterId==='danjin')?.referenceId,'prydwen-danjin-hybrid');
  const shared=coordinate({members:[{characterId:'rover-havoc',modeKey:'shared-dps'},{characterId:'danjin',modeKey:'dps'},{characterId:'verina'}]});
  assert.equal(shared.pattern.id,'SHARED_FIELD_TIME');assert.equal(shared.members.find(row=>row.characterId==='rover-havoc')?.referenceId,'prydwen-rover-havoc-short-burst');
  assert.equal(shared.members.find(row=>row.characterId==='danjin')?.referenceId,'prydwen-danjin-damage-dealer');
  assert.equal(shared.info.some(row=>row.code==='SOURCE_MODE_DIFFERS'),false);
});

test('unknown parties get member guidance or explicitly labeled player-role synthesis, never source-confirmed flow',()=>{
  const unclassified=coordinate(team('aalto','jiyan','verina'));
  assert.equal(unclassified.pattern.id,'MEMBER_GUIDANCE_ONLY');assert.equal(unclassified.sourceCaseId,null);
  const declared=coordinate({members:[{characterId:'aalto',role:'SUB_DPS'},{characterId:'jiyan',role:'DPS'},{characterId:'verina',role:'SUPPORT'}]});
  assert.equal(declared.pattern.id,'SINGLE_CARRY');assert.equal(declared.descriptionBasis,'PLAYER_ROLE_SYNTHESIS');
  assert.equal(declared.descriptionStatus,'UNCONFIRMED_TEAM_DESCRIPTION');assert.ok(declared.info.some(row=>row.code==='TEAM_FLOW_NOT_SOURCE_CONFIRMED'));
  const unspecifiedMode=coordinate(team('iuno','jiyan','verina'));
  assert.equal(unspecifiedMode.members[0].modeKey,null);
  assert.ok(unspecifiedMode.members[0].contextNeedsReview.includes('MODE'));
  assert.ok(unspecifiedMode.info.some(row=>row.code==='SOURCE_MODE_UNCONFIRMED'));
  assert.equal(coordinate({members:[{characterId:'aalto',modeKey:'fake'},{characterId:'jiyan'},{characterId:'verina'}]}).members[0].referenceId,null);
});

test('invalid identities and incompatible explicit choices do not quietly change the player build',()=>{
  assert.throws(()=>coordinate(team('aalto','aalto','verina')),/three unique/);
  assert.throws(()=>coordinate(team('aalto','suoming','verina')),/three unique/);
  assert.throws(()=>coordinate({members:[{characterId:'aalto',referenceId:'prydwen-jiyan-standard'},{characterId:'jiyan'},{characterId:'verina'}]}),/must belong/);
  const plan=coordinate({members:[{characterId:'lucilla',referenceId:'prydwen-lucilla-standard',modeKey:'echo-skill'},{characterId:'phrolova'},{characterId:'qiuyuan'}]});
  assert.equal(plan.members[0].referenceId,'prydwen-lucilla-standard');assert.equal(plan.members[0].contextCompatible,false);
  assert.ok(plan.info.some(row=>row.code==='REFERENCE_CONTEXT_DIFFERS'));
});

test('description and detached export do not grant DPS, engine registrations or an upgrade verdict',()=>{
  for (const input of [team('augusta','iuno','the-shorekeeper'),team('hsin','jinhsi','the-shorekeeper'),team('aalto','jiyan','verina')]) {
    const plan=coordinate(input);assert.equal(plan.teamDpsReady,false);assert.equal(plan.rotationDps,null);assert.equal(plan.authorizesUpgradeVerdict,false);
  }
  const db=buildCharacterDatabase();assert.equal(db.teamRotationCoordination.cases.length,19);
  (db.teamRotationCoordination.cases[0] as {summarySv:string}).summarySv='client mutation';
  assert.notEqual(TEAM_ROTATION_CASES[0].summarySv,'client mutation');
  assert.notEqual(buildCharacterDatabase().teamRotationCoordination.cases[0].summarySv,'client mutation');
});
