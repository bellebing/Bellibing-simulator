import test from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../docs/ui-lab/v1.1/modules/character-contexts.json' with {type:'json'};
import {characterContext,selectCharacterTeam,teamMemberStandards} from '../docs/ui-lab/v1.1/modules/character-context.js';
import {recommendedGuidance} from '../docs/ui-lab/v1.1/modules/recommended-guidance.js';
import {dpsConceptMarkup} from '../docs/ui-lab/v1.1/modules/dps-concept.js';
import {createSandboxWorkspace} from '../docs/ui-lab/v1.1/modules/sandbox-state.js';
import {restoreRecommendedSettings} from '../docs/ui-lab/v1.1/modules/settings-state.js';
import {resolveCharacterDefaultTeam,sandboxSourceTeamContexts,CHARACTER_DEFAULT_TEAM_REVIEW,CHARACTER_SOURCE_TEAM_CONTEXTS} from '../src/characterDefaultTeams.mjs';

test('projection retains 59 Characters, five explicitly source-bound existing trios and two missing source compositions',()=>{
 assert.equal(catalog.characters.length,59);assert.equal(catalog.teams.length,397);
 assert.equal(catalog.characters.filter(c=>c.defaultContextId).length,59);
 for(const c of catalog.characters){
  const context=characterContext(c.characterId);
  assert.equal(context.memberIds[0],c.characterId);
  assert.ok(context.options.every(t=>t.characterIds.includes(c.characterId)&&t.sourceRefs.length));
  assert.ok(c.recommendations.sourceLinesSha256);
  assert.equal(c.coverage.standardBuild,'VALID');
  assert.equal(c.coverage.dps,'PENDING_VERIFIED_TEAM_EXECUTION');
  if(context.team){assert.equal(new Set(context.memberIds).size,3);assert.ok(teamMemberStandards(context).every(Boolean));}
  else assert.deepEqual(context.memberIds,[c.characterId,null,null]);
 }
});
test('source-first defaults work despite multiple alternatives and supports retain the real carry',()=>{
 assert.deepEqual(characterContext('iuno').memberIds,['iuno','jingran','the-shorekeeper']);
 assert.equal(characterContext('iuno').team.anchorCharacterId,'jingran');
 assert.deepEqual(characterContext('phrolova').memberIds,['phrolova','lucilla','qiuyuan']);
 assert.deepEqual(characterContext('camellya').memberIds,['camellya','lynae','mornye']);
 assert.deepEqual(characterContext('lupa').memberIds,['lupa','galbrena','mornye']);
 assert.equal(characterContext('lupa').team.anchorCharacterId,'galbrena');
 assert.deepEqual(characterContext('augusta').memberIds,['augusta','iuno','the-shorekeeper']);
 assert.equal(characterContext('aemeath').team.modeRequirements.aemeath,'fusion-burst');
 assert.ok(characterContext('aemeath').options.some(t=>t.modeRequirements.aemeath==='tune-rupture'));
 assert.ok(characterContext('iuno').options.some(t=>t.modeRequirements.iuno==='dps'));
});
test('explicit binding ignores catalog and review array order; model discovery never auto-promotes',()=>{
 const reversed={contexts:[...CHARACTER_SOURCE_TEAM_CONTEXTS].reverse(),bindings:[...CHARACTER_DEFAULT_TEAM_REVIEW.records].reverse()};
 for(const c of catalog.characters)assert.equal(resolveCharacterDefaultTeam(c.characterId,reversed).context?.id??null,c.defaultContextId);
 const exposed=sandboxSourceTeamContexts();
 const added=exposed.filter(c=>c.evidenceBasis==='PUBLISHED_MODEL_ROSTER_ONLY');
 assert.equal(added.length,5);assert.ok(added.every(c=>c.defaultSourceBindings.every(b=>b.compositionReview==='APPROVED_GUIDE_PROSE_MATCH_TO_EXISTING_CATALOG_TRIO')));
 assert.ok(!exposed.some(c=>c.id==='model-aemeath-240'),'unreviewed alternative mode is not auto-promoted');
 const source=CHARACTER_DEFAULT_TEAM_REVIEW.records.find(r=>r.characterId==='sigrika');
 assert.equal(resolveCharacterDefaultTeam('sigrika',{bindings:[{...source,compositionReview:'MISSING'}]}).context,null);
});
test('newly captured source trios have no invented timing and missing bindings fail explicitly',()=>{
 for(const id of ['chixia','lingyang']){
  const c=characterContext(id);assert.equal(c.status,'SOURCE_REVIEWED_DEFAULT');assert.equal(c.team.rotation.status,'TIMING_MODULES_MISSING');assert.deepEqual(c.team.rotation.variants,[]);
  assert.equal(resolveCharacterDefaultTeam(id,{contexts:CHARACTER_SOURCE_TEAM_CONTEXTS.filter(t=>t.id!==c.team.id)}).status,'PENDING_SOURCE_DEFAULT_BINDING');
 }
});
test('source choices retain Character ownership, retire expert context and reject cross-Character context IDs',()=>{
 const w=createSandboxWorkspace(),a=w.select('augusta'),f=w.select('phrolova');
 const id=characterContext('phrolova').options[0].id;
 f.sandboxEvaluationContext={kind:'SYNTHETIC_REFERENCE_TEAM'};selectCharacterTeam(f,id);
 assert.equal(f.sandboxEvaluationContext,null);assert.equal(w.select('phrolova').sandboxTeamContextId,id);
 assert.equal(a.sandboxTeamContextId,undefined);
 assert.throws(()=>selectCharacterTeam(a,id),/NOT_AVAILABLE/);
});
test('Phrolova exposes exact conditional CR/CD source guidance without manufacturing ER or Echo Hard/Flex',()=>{
 const w=createSandboxWorkspace(),f=w.select('phrolova');
 const before=structuredClone(f.statSections);f.settingsMode='Customize';f.erTarget={enabled:true,valuePercent:123};
 assert.equal(restoreRecommendedSettings(f),true);assert.deepEqual(f.statSections.hard,[]);assert.deepEqual(f.statSections.flex,['CRIT Rate','CRIT DMG','ATK%','Skill DMG','Flat ATK']);assert.equal(f.flexCount,null);assert.equal(f.erTarget.valuePercent,123);
 const markup=recommendedGuidance('phrolova');
 assert.match(markup,/60%\+ \(before Echo set bonuses\)/);assert.match(markup,/215-260%\+ \(before any Aftersound stacks\)/);
 assert.match(markup,/ER target Pending/);assert.match(markup,/Hard\/Flex thresholds Pending/);
});
test('comparison rows stay Pending even when passed synthetic, stale or flat values',()=>{
 const markup=dpsConceptMarkup({characterId:'chixia',hasCurrentBuild:true,teamTotal:123,calculationStatus:'VERIFIED'});
 assert.match(markup,/>Reference<.*>Simulated</s);
 assert.equal((markup.match(/<td/g)??[]).length,12);
 assert.doesNotMatch(markup,/No DPS context|DMG\/s|synthetic reference scenario/);
 assert.match(markup,/Team Total/);
});
