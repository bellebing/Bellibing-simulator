import {createLabResourceInventory} from '../docs/ui-lab/v1.1/modules/resource-state.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {accountProjection} from '../docs/ui-lab/v1.1/modules/account-projection.js';
import {CHARACTER_CATALOG} from '../docs/ui-lab/v1.1/modules/catalog.js';
import {characterContext,teamSlotAlternatives,selectTeamSlot} from '../docs/ui-lab/v1.1/modules/character-context.js';
import {createConfigurationSession,activateConfigurationSlot,configurationSnapshot} from '../docs/ui-lab/v1.1/modules/simulation-configuration.js';
import {createSandboxState} from '../docs/ui-lab/v1.1/modules/sandbox-state.js';
import {uxAccountFixture} from './helpers/uxAccountFixture.mjs';
const person=CHARACTER_CATALOG.find(c=>c.id==='augusta');
test('Current/Candidate reads five owned Echoes and replaces exactly one without writing the account',()=>{
 const {account,candidate}=uxAccountFixture(),before=JSON.stringify(account),storage={getItem:()=>JSON.stringify(account),setItem:()=>assert.fail('Read-only projection')};
 const current=accountProjection(person,storage),comparison=accountProjection(person,storage,{candidate,slot:0});
 assert.equal(comparison.currentValues.ELECTRO_DMG_BONUS,'70%','Reuse reviewed permanent Sonata effects');assert.equal(comparison.kind,'ACCOUNT_BUILD');assert.equal(comparison.status,'STATIC_COMPARISON');assert.deepEqual(comparison.current,current.current);assert.notEqual(comparison.candidate.critRate,comparison.current.critRate);assert.ok(comparison.current.echoCardCount===5&&comparison.candidate.echoCardCount===5);assert.equal(JSON.stringify(account),before);
 for(const mutate of [a=>a.characters=[],a=>a.drafts.Augusta.build.echoSets.sets.owned.slots[4]=null,a=>a.drafts.Augusta.build.forte=null]){const a=structuredClone(account);mutate(a);const p=accountProjection(person,{getItem:()=>JSON.stringify(a)},{candidate,slot:0});assert.equal(p.status,'PENDING');assert.equal(p.candidate,null);}
 assert.equal(accountProjection(person,storage,{candidate:{...candidate,mainStat:{name:'CRIT Rate',value:999}},slot:0}).status,'PENDING');
});
test('per-portrait alternatives preserve the other two members and only choose an existing source context',()=>{
 const s=createSandboxState('augusta'),context=characterContext('augusta'),options=teamSlotAlternatives(context,1),replacement=options.find(t=>t.characterId==='mortefi');assert.ok(replacement);
 const selected=selectTeamSlot(s,1,replacement.contextId);assert.deepEqual(selected.memberIds,[context.memberIds[0],'mortefi',context.memberIds[2]]);assert.equal(selected.team.id,replacement.contextId);assert.throws(()=>selectTeamSlot(s,2,'invented'),/NOT_AVAILABLE/);assert.equal(s.sandboxEvaluationContext,null);
});
test('an empty slot can switch On/Off while remaining invalid for simulation until configured',async()=>{
 const s=createSandboxState('augusta');s.configurationSession=createConfigurationSession('augusta',{initializeDefaults:false});const before=structuredClone(s.configurationSession.current);
 activateConfigurationSlot(s.configurationSession,3,true);assert.equal(s.configurationSession.active[3],true);assert.equal(s.configurationSession.configurations[3],null);const snap=await configurationSnapshot(s,createLabResourceInventory().read());assert.ok(snap.validation.issues.includes('ACTIVE_SLOT_NOT_CONFIGURED'));
 activateConfigurationSlot(s.configurationSession,3,false);assert.deepEqual(s.configurationSession.current,before);assert.equal(s.configurationSession.active[2],false);
});
