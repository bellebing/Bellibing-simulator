import test from 'node:test';
import assert from 'node:assert/strict';
import {productDraftFromAccount,productDraftBuildIdentity} from '../src/productBuildDraft.mjs';
import {emptyAccount,saveReviewedScan} from '../src/inventoryAccount.mjs';
import {catalog,scan} from './fixtures/inventory.mjs';
import {ownedTeamContext,characterContext} from '../docs/ui-lab/v1.1/modules/character-context.js';
import {captureLocalTeamBuilds} from '../src/localTeamBuildCapture.mjs';
import {own,team} from './helpers/localTeamFixture.mjs';

test('unchanged build ignores evidence/order; material edits and physical swaps remain changes',()=>{
 const account=saveReviewedScan(emptyAccount(),scan(),catalog,{reviewed:true,assign:true});
 const draft=productDraftFromAccount(account,Object.keys(account.characters)[0],{nodes:[]}),same=structuredClone(draft);
 same.echoes[0].evidence={extra:'recovery'};same.importObservation={retained:true};
 same.echoes[0].mainStat={value:same.echoes[0].mainStat.value,name:same.echoes[0].mainStat.name};
 assert.equal(productDraftBuildIdentity(same),productDraftBuildIdentity(draft));
 for(const edit of [d=>d.sequence++,d=>d.weaponRank=2,d=>d.weaponLevel=80,d=>d.echoes[0].instanceId='another-physical-item',d=>d.echoes[0].substats[0].value+=.001]){
  const changed=structuredClone(draft);edit(changed);assert.notEqual(productDraftBuildIdentity(changed),productDraftBuildIdentity(draft));
 }
});
test('saved exact trio wins without inventing a rotation',()=>{
 const context=characterContext('jinhsi'),alternative=context.options.find(t=>!t.characterIds.every(id=>context.team.characterIds.includes(id)));
 assert.ok(alternative);assert.equal(ownedTeamContext('jinhsi',[{characterIds:alternative.characterIds}]),alternative.id);
 assert.equal(ownedTeamContext('jinhsi',[{characterIds:['jinhsi','aalto','chixia']}]),null);
});
test('actual account capture retains an empty secondary slot and actual investments',async()=>{
 const {records}=own();for(const record of records)record.buildState.echoSets.sets.owned.slots[4]=null;
 const actualInvestments=Object.fromEntries(team.characterIds.map(id=>[id,{characterLevel:90,weaponLevel:90,weaponRefinement:1}]));
 const before=JSON.stringify(records),result=await captureLocalTeamBuilds({mode:'IMPROVE',team,selectedCharacterId:'augusta',records,actualInvestments,scope:{}});
 assert.equal(result.status,'CAPTURED');assert.ok(result.payload.current.builds.every(b=>b.echoes[4]===null&&b.kind==='ACCOUNT_BUILD'));assert.equal(JSON.stringify(records),before);
});
