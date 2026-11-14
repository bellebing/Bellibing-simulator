import test from 'node:test';
import assert from 'node:assert/strict';
import {initialSettings} from '../docs/ui-lab/v1.1/modules/settings-state.js';
import {captureWorkspaceSettings,restoreWorkspaceSettings} from '../docs/ui-lab/v1.1/modules/account-settings.js';
import {createLabResourceInventory} from '../docs/ui-lab/v1.1/modules/resource-state.js';

test('settings preserve Custom order, dormant minima and infeasible Flex intent without persisting readiness',()=>{
 const state={...initialSettings('augusta'),id:'augusta',gate:'+15',privateDiagnostic:'never saved',accountSettingsPending:'OLD',settingsMode:'Customize'};
 state.flexCount=13;const saved=captureWorkspaceSettings(state);assert.equal(saved.privateDiagnostic,undefined);assert.equal(saved.accountSettingsPending,undefined);
 const restored={...initialSettings('augusta'),gate:'+5',sourcePreferenceGuidance:{stale:true},accountSettingsPending:'OLD'};
 restoreWorkspaceSettings(restored,saved);assert.equal(restored.gate,'+15');assert.equal(restored.flexCount,13);assert.deepEqual(restored.minima,state.minima);assert.equal(restored.sourcePreferenceGuidance,null);
 const before=structuredClone(restored),bad=structuredClone(saved);bad.statSections.hard.push(bad.statSections.hard[0]);assert.throws(()=>restoreWorkspaceSettings(restored,bad));assert.deepEqual(restored,before);
});
test('real resource edits become visible only after persistence and failed saves keep the old balance',async()=>{
 let release;const wait=new Promise(r=>{release=r;});
 const inventory=createLabResourceInventory(undefined,{onSave:()=>wait});const pending=inventory.set('tuners','42');assert.equal(inventory.read().tuners.count,0);release();await pending;assert.equal(inventory.read().tuners.count,42);
 const failed=createLabResourceInventory(undefined,{onSave:async()=>{throw Error('Quota full');}});await assert.rejects(failed.set('tuners','42'),/Quota full/);assert.equal(failed.read().tuners.count,0);
});


test('rapid durable resource edits compose after commit and a failed save does not poison later edits',async()=>{
 const committed=[];let rejectNext=false;
 const inventory=createLabResourceInventory(undefined,{onSave:async next=>{
  await new Promise(resolve=>setTimeout(resolve,5));if(rejectNext){rejectNext=false;throw Error('SAVE_FAILED');}committed.push(structuredClone(next));
 }});
 await Promise.all([inventory.set('echoes','8'),inventory.set('tuners','90')]);
 assert.equal(inventory.read().echoes.count,8);assert.equal(inventory.read().tuners.count,90);assert.equal(committed[1].echoes.count,8);
 rejectNext=true;const failed=inventory.set('echoes','20'),later=inventory.set('tuners','100');await assert.rejects(failed,/SAVE_FAILED/);await later;
 assert.equal(inventory.read().echoes.count,8);assert.equal(inventory.read().tuners.count,100);
});
