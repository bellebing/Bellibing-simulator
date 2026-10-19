import test from 'node:test';
import assert from 'node:assert/strict';
import {createImproveCandidateSession} from '../docs/ui-lab/v1.1/modules/improve-candidate.js';
import {createSandboxState} from '../docs/ui-lab/v1.1/modules/sandbox-state.js';
import {readProductionBuildRecord} from '../src/productionBuildRecord.mjs';
import {CHARACTER_CATALOG} from '../docs/ui-lab/v1.1/modules/catalog.js';
import {createLabResourceInventory} from '../docs/ui-lab/v1.1/modules/resource-state.js';
import {uxAccountFixture} from './helpers/uxAccountFixture.mjs';
import {accountProjection} from '../docs/ui-lab/v1.1/modules/account-projection.js';
const person=CHARACTER_CATALOG.find(c=>c.id==='augusta');
function fixture(){
 const f=uxAccountFixture(),bytes=JSON.stringify(f.account),state=createSandboxState('augusta'),inventory=createLabResourceInventory();
 state.configurationSession.active=[true,false,false,false,false];
 const owner={kind:'ACCOUNT_BUILD',state,record:readProductionBuildRecord({getItem:()=>bytes},person),inventory:inventory.read(),inventoryRevision:0};
 return {...f,bytes,owner};
}
test('real ACCOUNT_BUILD leases a separate bounded Echo search without exporting account equipment or false improvement metrics',async()=>{
 const f=fixture(),before=JSON.stringify(f.owner),changes=[];let wire;
 const session=createImproveCandidateSession({readOwner:()=>f.owner,onChange:r=>changes.push(r),clientFactory:options=>{
  wire=options.readContext();return {metrics:async()=>({status:'READY',metrics:{expectedCost:{status:'VERIFIED'},dps:{status:'VERIFIED'}}}),start:async()=>options.onChange({status:'GOAL_SUCCESS',runId:'test-run',view:{slots:[]},simulatedCost:{gross:{echoes:1}}}),invalidate(){},isBusy:()=>false,export:async()=>({kind:'TEST_SEARCH'})};
 }});
 assert.equal((await session.metrics()).status,'READY');await session.start();
 assert.equal(session.kind,'ACCOUNT_BUILD');assert.equal(wire.buildContext.kind,'SANDBOX_BUILD');assert.equal(wire.slots.filter(s=>s.active).length,1);
 assert.equal(JSON.stringify(wire).includes('buildState'),false);assert.equal(JSON.stringify(wire).includes(f.owner.record.ownerRecord.storageKey),false);
 assert.equal(session.snapshot().ownerKind,'ACCOUNT_BUILD');assert.equal(session.snapshot().dps.status,'PENDING');assert.equal(session.snapshot().improvementExpectedCost.status,'PENDING');
 assert.equal((await session.export()).owner.kind,'ACCOUNT_BUILD');assert.equal(JSON.stringify(f.owner),before);assert.ok(changes.length>0);
});
test('owner/settings/resources/selection drift invalidates async results and export',async()=>{
 for(const mutate of [f=>f.owner.record.buildState.weaponId='changed',f=>f.owner.state.minima['CRIT Rate']++,f=>f.owner.inventoryRevision++,f=>f.owner.state.selectedSlot++]){
  const f=fixture(),changes=[];let late;
  const session=createImproveCandidateSession({readOwner:()=>f.owner,onChange:r=>changes.push(r),clientFactory:o=>{late=o.onChange;return {metrics:async()=>({status:'READY'}),start:async()=>{},invalidate(){},export:async()=>({})};}});
  await session.metrics();mutate(f);assert.equal(session.checkFresh(),false);const count=changes.length;late({status:'GOAL_SUCCESS'});assert.equal(changes.length,count);await assert.rejects(()=>session.export(),/ACCOUNT_CANDIDATE_RUN_REQUIRED/);
 }
});
test('missing real Current, unsupported account ER and saved-policy blockers remain Pending',async()=>{
 for(const change of [f=>f.owner.record.status='PENDING',f=>f.owner.state.erTarget.enabled=true,f=>f.owner.state.accountSettingsPending='SAVED_CONTEXT_PENDING']){
  const f=fixture();change(f);const session=createImproveCandidateSession({readOwner:()=>f.owner,clientFactory:()=>assert.fail('Blocked input must not reach worker')});assert.equal((await session.metrics()).status,'PENDING');
 }
});
test('whole-build static dominance stays separate from mixed trades, ER, effects and ranking',()=>{
 const f=fixture();f.account.drafts.Augusta.build.echoSets.sets.owned.slots[0].substats[1].value=40;const storage={getItem:()=>JSON.stringify(f.account)},candidate=structuredClone(f.cards[0]);
 candidate.substats[0].value=360;let p=accountProjection(person,storage,{candidate,slot:0});assert.equal(p.comparison.status,'STATIC_DOMINANCE');assert.equal(p.comparison.authorizesCostRanking,false);assert.equal(p.comparison.authorizesAutomaticEquip,false);
 candidate.substats[1].value=30;p=accountProjection(person,storage,{candidate,slot:0});assert.equal(p.comparison.status,'PENDING');assert.equal(p.comparison.reason,'CROSS_STAT_TRADES_PENDING');
});

test('saved Custom settings are observed without resetting intent or writing persistence',async()=>{
 const {restoreOwnedSettings}=await import('../docs/ui-lab/v1.1/modules/account-settings.js');
 const source=(await import('../docs/ui-lab/v1.1/modules/production-settings.json',{with:{type:'json'}})).default.characters.find(c=>c.characterId==='augusta');
 const raw={version:3,characters:{augusta:{schemaVersion:3,characterId:'augusta',presetId:source.presetId,contextBinding:source.applicability.contextBinding,mode:'MANUAL',gate:5,rollQuality:'All Rolls',migration:null,
  overrides:{echoRequirements:{requiredOnEveryEcho:[{stat:'CRIT Rate',minimum:.063}],groups:[{id:'selected-flex',minimumCount:1,members:[{stat:'CRIT DMG',minimum:.126}]}]}}}},pendingV2Characters:{}};
 const bytes=JSON.stringify(raw),storage={getItem:key=>key==='bellibing.improve.policy.v3'?bytes:null,setItem:()=>assert.fail('Read-only observation')},state=createSandboxState('augusta');
 restoreOwnedSettings(state,storage);assert.equal(state.accountSettingsPending,null);assert.equal(state.settingsMode,'Customize');assert.deepEqual(state.statSections.hard,['CRIT Rate']);assert.deepEqual(state.statSections.flex,['CRIT DMG']);assert.equal(JSON.stringify(raw),bytes);
 raw.characters.augusta.contextBinding='stale';const old=JSON.stringify(state.statSections);restoreOwnedSettings(state,{getItem:key=>key==='bellibing.improve.policy.v3'?JSON.stringify(raw):null});assert.equal(state.accountSettingsPending,'ACCOUNT_SETTINGS_CONTEXT_PENDING');assert.equal(JSON.stringify(state.statSections),old);
});
