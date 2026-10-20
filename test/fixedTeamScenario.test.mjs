import test from 'node:test';
import assert from 'node:assert/strict';
import {createFixedTeamScenarioRequest,fixedTeamComparisonContext,sameFixedTeamComparisonContext} from '../src/fixedTeamScenario.mjs';
import contexts from '../docs/ui-lab/v1.1/modules/character-contexts.json' with {type:'json'};
const team=contexts.teams.find(t=>t.id==='guide-augusta-iuno-the-shorekeeper-augusta-slots-4');
function input(mode='SANDBOX'){
 const ownership={kind:mode==='SANDBOX'?'SANDBOX_BUILD':'ACCOUNT_BUILD',id:'local-owner',revision:'revision-1'};
 return {mode,selectedCharacterId:'augusta',teamContextId:team.id,ownership,builds:team.characterIds.map(characterId=>({characterId,kind:ownership.kind,ownerId:ownership.id,ownerRevision:ownership.revision,
  modeId:team.modeRequirements[characterId]??'default',baseline:{sequenceLevel:0},weapon:{id:'test'},echoes:[]})),cycleNumber:2,enemy:{defense:1520},acceptReferenceStateSchedule:true};
}
test('both workspaces capture the same source-selected complete party without inventing teammates',()=>{
 for(const mode of ['SANDBOX','IMPROVE']){
  const value=input(mode),before=structuredClone(value),r=createFixedTeamScenarioRequest(value);
  assert.equal(r.status,'CAPTURED');assert.deepEqual(value,before);assert.notEqual(r.request.builds,value.builds);
  r.request.builds[0].echoes.push({id:'new'});assert.deepEqual(value,before);
 }
});
test('all 397 reviewed contexts can bind their own three builds and exact declared modes',()=>{
 for(const t of contexts.teams){const v=input();v.teamContextId=t.id;v.selectedCharacterId=t.characterIds[0];v.builds=t.characterIds.map(characterId=>({...v.builds[0],characterId,modeId:t.modeRequirements[characterId]??'default'}));
  assert.equal(createFixedTeamScenarioRequest(v).status,'CAPTURED',t.id);}
});
test('partial, duplicate, wrong party/modes and wrong owners remain Pending',()=>{
 for(const [edit,reason]of [
  [v=>v.builds.pop(),'COMPLETE_SELECTED_TEAM_BUILDS_REQUIRED'],
  [v=>v.builds[0].characterId=v.builds[1].characterId,'COMPLETE_SELECTED_TEAM_BUILDS_REQUIRED'],
  [v=>v.builds[0].ownerId='other','BUILD_OWNER_CONTEXT_MISMATCH'],
  [v=>v.builds[0].kind='ACCOUNT_BUILD','BUILD_OWNER_CONTEXT_MISMATCH'],
  [v=>v.builds[0].ownerRevision='stale','BUILD_OWNER_CONTEXT_MISMATCH'],
  [v=>v.builds.find(b=>b.characterId==='iuno').modeId='default','SOURCE_TEAM_MODE_MISMATCH'],
  [v=>v.teamContextId='unknown','SOURCE_TEAM_CONTEXT_PENDING'],
  [v=>v.acceptReferenceStateSchedule=false,'FIXED_REFERENCE_SCENARIO_NOT_SELECTED']]){
  const v=input();edit(v);assert.equal(createFixedTeamScenarioRequest(v).reason,reason);
 }
});
test('comparison context retains all fixed conditions and ownership but permits changed Echo observations',()=>{
 const a=createFixedTeamScenarioRequest(input()).request,b=structuredClone(a);b.builds[0].echoes.push({id:'different'});
 assert.equal(sameFixedTeamComparisonContext(a,b),true);
 for(const edit of [v=>v.ownership.revision='new',v=>v.builds[1].weapon.id='new',v=>v.builds[1].baseline.sequenceLevel=1,v=>v.cycleNumber=3,v=>v.enemy.defense=1000,v=>v.teamContextId='new',v=>v.selectedCharacterId='iuno']){
  const c=structuredClone(b);edit(c);assert.equal(sameFixedTeamComparisonContext(a,c),false);
 }
 assert.equal(fixedTeamComparisonContext(null),null);assert.equal(sameFixedTeamComparisonContext(null,null),false);
});
