import test from 'node:test';
import assert from 'node:assert/strict';
import {accountTeamContext,accountTeamContextId} from '../src/accountTeamContext.mjs';
import {ownedTeamContext,characterContext} from '../docs/ui-lab/v1.1/modules/character-context.js';
import {captureLocalTeamBuilds} from '../src/localTeamBuildCapture.mjs';
import {own} from './helpers/localTeamFixture.mjs';
test('a player trio is preserved as a declared module composition without claiming a guide recommends it',()=>{
 const ids=['calcharo','zhezhi','verina'],id=accountTeamContextId(ids),team=accountTeamContext(id);
 assert.deepEqual(team.characterIds,ids);assert.equal(team.anchorCharacterId,ids[0]);assert.equal(team.roleAssignment.support,undefined);
 assert.equal(team.relationship,'PLAYER_SELECTED_TRIO');assert.equal(team.compositionBasis,'EXPERIMENTAL_MEMBER_MODULES');
 assert.equal(ownedTeamContext('calcharo',[{characterIds:ids}]),id);
 assert.equal(characterContext('zhezhi',id).team.id,id);
 assert.equal(characterContext('jinhsi',id).team,null);
 for(const invalid of ['account-native:calcharo,calcharo,verina','account-native:calcharo,zhezhi,unknown','account-native:calcharo,zhezhi','account-native:calcharo,zhezhi,verina,aalto','account-native:../calcharo,zhezhi,verina'])assert.equal(accountTeamContext(invalid),null);
});
test('actual builds for an unregistered trio pass through the public capture unchanged',async()=>{
 const id=accountTeamContextId(['calcharo','zhezhi','verina']),team=accountTeamContext(id);
 const records=own({context:team}).records;
 const actualInvestments=Object.fromEntries(team.characterIds.map(id=>[id,{characterLevel:90,weaponLevel:90,weaponRefinement:1}]));
 const input={mode:'IMPROVE',selectedCharacterId:'zhezhi',team,records,actualInvestments,scope:{}},before=structuredClone(input);
 const result=await captureLocalTeamBuilds(input);assert.equal(result.status,'CAPTURED',result.reason);
 assert.equal(result.payload.current.teamContextId,id);assert.deepEqual(result.payload.current.builds.map(b=>b.characterId),team.characterIds);
 assert.equal(result.payload.current.enemy.defense,1592);assert.deepEqual(input,before);
});
