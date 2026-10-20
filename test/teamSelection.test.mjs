import test from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../docs/ui-lab/v1.1/modules/character-contexts.json' with {type:'json'};
import {characterContext} from '../docs/ui-lab/v1.1/modules/character-context.js';
import {createSandboxWorkspace} from '../docs/ui-lab/v1.1/modules/sandbox-state.js';
import {sourceTeamRoles,sourceTeamView,sourceTeamChoices,sourceTeamModeChoices,chooseSourceTeam,chooseSourceTeamRole} from '../docs/ui-lab/v1.1/modules/team-selection.js';
import {dpsConceptMarkup} from '../docs/ui-lab/v1.1/modules/dps-concept.js';

const roles=sourceTeamRoles;
const has=(t,ids)=>ids.every(id=>t.characterIds.includes(id));
const match=(view,main,partner,third)=>view.options.find(t=>{
 const r=roles(t);
 return r.main===main&&r.partner===partner&&r.third===third;
});
const selected=(id)=>({id});

test('all 59 RELEASED Characters own one default and can reach every one of the 397 reviewed contexts',()=>{
 assert.equal(catalog.characters.length,59);
 assert.equal(catalog.teams.length,397);
 const reached=new Map();
 for(const c of catalog.characters){
  const state=selected(c.characterId),view=sourceTeamView(state);
  assert.equal(view.team?.id,c.defaultContextId,c.characterId);
  assert.equal(view.activeContextId,c.defaultContextId,c.characterId);
  assert.ok(view.team.sourceRefs?.length,c.characterId);
  assert.deepEqual([...view.memberIds].sort(),[...view.team.characterIds].sort(),c.characterId);
  assert.ok(view.memberIds.every(Boolean),c.characterId);
  for(const team of view.options){
   assert.ok(team.characterIds.includes(c.characterId),team.id);
   assert.ok(team.sourceRefs.length,team.id);
   if(team.relationship==='UNRANKED_MODEL_CANDIDATE')
    assert.ok(team.defaultSourceBindings?.length&&team.defaultSourceBindings.every(b=>b.compositionReview==='APPROVED_GUIDE_PROSE_MATCH_TO_EXISTING_CATALOG_TRIO'),team.id);
   if(team.catalogEvidenceBasis==='PUBLISHED_MODEL_ROSTER_ONLY'){
    assert.ok(team.defaultSourceBindings?.length,team.id);
    assert.ok(team.defaultSourceBindings.every(b=>b.compositionReview==='APPROVED_GUIDE_PROSE_MATCH_TO_EXISTING_CATALOG_TRIO'),team.id);
   }
   assert.deepEqual([...new Set(team.characterIds)].sort(),[...team.characterIds].sort());
   const r=roles(team);
   assert.deepEqual([r.main,r.partner,r.third].sort(),[...team.characterIds].sort(),team.id);
   const seen=reached.get(team.id)??new Set();
   seen.add(c.characterId);reached.set(team.id,seen);
  }
 }
 assert.equal(reached.size,397);
 for(const team of catalog.teams)assert.deepEqual([...reached.get(team.id)].sort(),[...team.characterIds].sort(),team.id);
});

test('Augusta/Iuno/Shorekeeper -> Mortefi retains Shorekeeper only via reviewed full trio',()=>{
 const state=selected('augusta'),current=sourceTeamView(state);
 assert.deepEqual(current.memberIds,['augusta','iuno','the-shorekeeper']);
 const choice=sourceTeamChoices(state,'partner').find(c=>c.characterId==='mortefi'&&roles(c.team).third==='the-shorekeeper');
 assert.ok(choice,'reviewed Augusta/Mortefi/Shorekeeper option exists');
 const view=chooseSourceTeamRole(state,'partner',choice.contextId);
 assert.equal(view.pendingSupport,false);
 assert.deepEqual(view.memberIds,['augusta','mortefi','the-shorekeeper']);
 assert.equal(view.activeContextId,choice.contextId);
 assert.ok(view.team.sourceRefs.length);
 assert.equal(view.selectedTeam.id,choice.contextId);
});

test('Qingxiao/Lynae/Shorekeeper -> Denia explicitly clears Support until Mornye is chosen',()=>{
 const state=selected('qingxiao'),initial=sourceTeamView(state);
 const lynae=match(initial,'qingxiao','lynae','the-shorekeeper');
 assert.ok(lynae);
 chooseSourceTeam(state,lynae.id);
 const denia=sourceTeamChoices(state,'partner').find(c=>c.characterId==='denia'&&roles(c.team).third==='mornye');
 assert.ok(denia,'mode-scoped reviewed Denia core exists');
 const draft=chooseSourceTeamRole(state,'partner',denia.contextId);
 assert.equal(draft.pendingSupport,true);
 assert.equal(draft.selectedTeam,null);
 assert.equal(draft.activeContextId,null);
 assert.deepEqual(draft.memberIds,['qingxiao','denia',null]);
 assert.equal(draft.pendingCore.main,'qingxiao');
 assert.ok(!sourceTeamChoices(state,'third').some(c=>c.characterId==='the-shorekeeper'));
 assert.ok(sourceTeamChoices(state,'third').some(c=>c.characterId==='mornye'));
 assert.deepEqual(sourceTeamModeChoices(state),[],'mode cannot implicitly fill the empty Support');
 const mornye=sourceTeamChoices(state,'third').find(c=>c.characterId==='mornye');
 const done=chooseSourceTeamRole(state,'third',mornye.contextId);
 assert.equal(done.pendingSupport,false);
 assert.deepEqual(done.memberIds,['qingxiao','denia','mornye']);
 assert.equal(done.activeContextId,mornye.contextId);
 chooseSourceTeam(state,null);
 assert.equal(sourceTeamView(state).activeContextId,initial.team.id);
});

test('source member roles, modes and conditions remain available without invented global roles',()=>{
 for(const id of ['iuno','lupa','the-shorekeeper','youhu']){
  const view=sourceTeamView(selected(id));
  assert.ok(view.team.characterIds.includes(id));
  assert.deepEqual([view.roles.main,view.roles.partner,view.roles.third].sort(),[...view.team.characterIds].sort());
 }
 const hsin=sourceTeamView(selected('hsin'));
 assert.ok(hsin.options.some(t=>t.modeRequirements.hsin==='electro-flare'));
 assert.ok(hsin.options.some(t=>t.modeRequirements.hsin==='unison'));
 const zani=sourceTeamView(selected('zani'));
 assert.ok(zani.options.some(t=>t.conditions.some(s=>/frazzle/i.test(s))));
 const cart=sourceTeamView(selected('cartethyia'));
 assert.ok(cart.options.some(t=>t.conditions.some(s=>/erosion/i.test(s))));
 const baizhi=sourceTeamView(selected('baizhi'));
 assert.ok(baizhi.options.length>0);
 assert.ok(!baizhi.options.some(t=>roles(t).third==='baizhi'&&t.characterIds.some(id=>['yinlin','zhezhi','mortefi'].includes(id))));
 const youhu=sourceTeamView(selected('youhu'));
 assert.ok(youhu.options.some(t=>t.conditions.some(s=>/coordinated|yinlin|zhezhi/i.test(s))));
});

test('team selections preserve independent Echo, Weapon, Settings and Improve Candidate state',()=>{
 for(const id of ['augusta','qingxiao']){
  const state={id,sandboxBuild:{weaponId:'source-weapon',revision:7},accountCandidates:[{id:'existing'}],
   configurationSession:{revision:5},statSections:{hard:['CRIT Rate']},gate:'+20',erTarget:{valuePercent:120}};
  const immutable=structuredClone({sandboxBuild:state.sandboxBuild,accountCandidates:state.accountCandidates,configurationSession:state.configurationSession,statSections:state.statSections,gate:state.gate,erTarget:state.erTarget});
  const choices=sourceTeamView(state).options;
  chooseSourceTeam(state,choices.at(-1).id);
  chooseSourceTeam(state,null);
  assert.deepEqual({sandboxBuild:state.sandboxBuild,accountCandidates:state.accountCandidates,configurationSession:state.configurationSession,statSections:state.statSections,gate:state.gate,erTarget:state.erTarget},immutable);
 }
 const workspace=createSandboxWorkspace(),a=workspace.select('augusta'),q=workspace.select('qingxiao');
 chooseSourceTeam(q,sourceTeamView(q).options.at(-1).id);
 assert.equal(workspace.select('augusta'),a);
 assert.equal(a.sandboxTeamContextId,undefined);
 assert.equal(workspace.select('qingxiao'),q);
});

test('both Sandbox and Improve keep Team DPS Pending after reviewed selection or a pending Support',()=>{
 for(const mode of ['SANDBOX','IMPROVE']){
  const state=selected('qingxiao'),lynae=match(sourceTeamView(state),'qingxiao','lynae','the-shorekeeper');
  chooseSourceTeam(state,lynae.id);
  const before=dpsConceptMarkup({characterId:state.id,selection:sourceTeamView(state),comparisonMode:mode});
  assert.match(before,/data-context-status/);
  assert.match(before,/data-dps-scenario="(RECOMMENDED|CURRENT)"/);
  assert.match(before,/data-status="PENDING"/);
  assert.doesNotMatch(before,/data-dps-scenario=".*?".*?\d[,.]\d/s);
  const denia=sourceTeamChoices(state,'partner').find(c=>c.characterId==='denia');
  chooseSourceTeamRole(state,'partner',denia.contextId);
  const after=dpsConceptMarkup({characterId:state.id,selection:sourceTeamView(state),comparisonMode:mode});
  assert.match(after,/Support Pending/);
  assert.match(after,/Choose a teammate/);
  assert.match(after,/data-active-context-id=""/);
  assert.match(after,/data-status="PENDING"/);
 }
});
