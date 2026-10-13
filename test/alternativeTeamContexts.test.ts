import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {ALTERNATIVE_TEAM_CONTEXTS as contexts,ALTERNATIVE_TEAM_CONTEXT_REVIEW as meta,ALTERNATIVE_TEAM_CHARACTER_COVERAGE as coverage} from '../src/data/alternativeTeamContexts.ts';
import {CHARACTER_CATALOG} from '../src/data/characters.ts';
import {findAlternativeTeamContexts as find,findTeamSupportAlternatives as supports} from '../src/alternativeTeamContexts.ts';
const same=(row:{characterIds:readonly string[]},party:string[])=>party.every(id=>row.characterIds.includes(id));

test('Galbrena/Mortefi/Verina is a guide-supported alternative with non-limited partners',()=>{
 const option=find({anchorCharacterId:'galbrena'}).find(r=>same(r,['galbrena','mortefi','verina']))!;
 assert.ok(option);assert.equal(option.relationship,'ALTERNATIVE');
 assert.equal(option.accessibility,'NON_LIMITED_PARTNERS');
 assert.deepEqual(option.partnerAccess.map(p=>p.kind),['FOUR_STAR','STANDARD_FIVE_STAR']);
 assert.equal(option.rotationTimingStatus,'NOT_RESEARCHED_FOR_THIS_ALTERNATIVE_CONTEXT');
 assert.equal(option.modeRequirements.lucilla,undefined);
});

test('Qingxiao premium Lynae alternatives stay separate from the Denia/Mornye BiS reference',()=>{
 const all=find({anchorCharacterId:'qingxiao',includeRecommendedCore:true});
 assert.equal(all.find(r=>same(r,['qingxiao','denia','mornye']))!.relationship,'SOURCE_BIS_REFERENCE');
 const lynae=find({anchorCharacterId:'qingxiao'});
 assert.equal(lynae.length,3);
 assert.ok(lynae.every(r=>r.relationship==='ALTERNATIVE'&&r.modeRequirements.lynae==='tune-strain'));
 assert.ok(lynae.some(r=>same(r,['qingxiao','lynae','the-shorekeeper'])));
 assert.ok(!all.some(r=>r.characterIds.includes('denia')&&r.characterIds.includes('verina')));
});

test('support substitutions remain scoped to the actual reviewed core and owned party',()=>{
 const healing=supports('galbrena','mortefi');
 assert.deepEqual(new Set(healing.map(r=>r.roleAssignment.support)),new Set(['mornye','the-shorekeeper','verina']));
 assert.equal(supports('qingxiao','denia').length,1);
 assert.equal(supports('qingxiao','denia')[0].roleAssignment.support,'mornye');
 assert.equal(find({anchorCharacterId:'galbrena',ownedCharacterIds:['galbrena','mortefi','verina']}).length,1);
 assert.equal(find({anchorCharacterId:'galbrena',excludeCharacterIds:['mortefi']}).some(r=>r.characterIds.includes('mortefi')),false);
});

test('Baizhi and Youhu fallbacks preserve their distinct target restrictions',()=>{
 assert.ok(contexts.some(r=>same(r,['calcharo','lynae','baizhi'])&&r.evidenceBasis!=='PUBLISHED_MODEL_ROSTER_ONLY'));
 assert.ok(!contexts.some(r=>r.roleAssignment.support==='baizhi'&&r.characterIds.some(id=>['yinlin','zhezhi','mortefi'].includes(id))));
 const youhu=find({anchorCharacterId:'calcharo'}).find(r=>r.characterIds.includes('youhu'))!;
 assert.equal(youhu.roleAssignment.partner,'yinlin');
 assert.ok(youhu.conditionsSv.some(s=>s.includes('yinlin')));
});

test('mode-sensitive choices and sustained healing are not implicitly interchangeable',()=>{
 const gal=find({anchorCharacterId:'galbrena',includeRecommendedCore:true}).find(r=>r.characterIds.includes('lucilla'))!;
 assert.equal(gal.modeRequirements.lucilla,'echo-skill');
 const hiyuki=find({anchorCharacterId:'hiyuki',includeRecommendedCore:true}).find(r=>r.characterIds.includes('lucilla'))!;
 assert.equal(hiyuki.modeRequirements.lucilla,'glacio-chafe');
 assert.ok(contexts.filter(r=>r.anchorCharacterId==='zani'&&r.roleAssignment.partner==='mortefi'&&r.evidenceBasis!=='PUBLISHED_MODEL_ROSTER_ONLY').every(r=>r.characterIds.includes('rover-spectro')||r.characterIds.includes('ciaccona')));
});

test('the published discovery pool is opt-in, unranked and contains no unreleased identities',()=>{
 assert.ok(find({anchorCharacterId:'qingxiao',includeModelCandidates:true}).some(r=>r.relationship==='UNRANKED_MODEL_CANDIDATE'));
 assert.ok(find({anchorCharacterId:'qingxiao'}).every(r=>r.evidenceBasis!=='PUBLISHED_MODEL_ROSTER_ONLY'));
 const released=new Set(CHARACTER_CATALOG.filter(c=>c.releaseStatus==='RELEASED').map(c=>c.id));
 assert.deepEqual(new Set(coverage.map(c=>c.characterId)),released);
 assert.ok(coverage.every(c=>c.asMember>0));
 for(const row of contexts){
  assert.equal(new Set(row.characterIds).size,3);assert.ok(row.characterIds.every(id=>released.has(id)));
  assert.ok(row.sourceRefs.length);assert.equal(row.ranking,'NO_INFERRED_DPS_RANK');
 }
 for(const name of ['guide','model'])assert.equal(createHash('sha256').update(readFileSync(meta[name+'Artifact'])).digest('hex'),meta[name+'Sha256']);
 assert.equal(find({anchorCharacterId:'unknown'}).length,0);
});
