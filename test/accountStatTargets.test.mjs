import test from 'node:test';
import assert from 'node:assert/strict';
import priorities from '../docs/ui-lab/v1.1/modules/source-priorities.json' with {type:'json'};
import {createSandboxState} from '../docs/ui-lab/v1.1/modules/sandbox-state.js';
import {settingsSnapshot} from '../docs/ui-lab/v1.1/modules/simulation-configuration.js';
import {normalizeAccountStatSettings,accountStatTarget} from '../docs/ui-lab/v1.1/modules/account-stat-targets.js';
import {statPreference,rollPresentation} from '../docs/ui-lab/v1.1/modules/stat-guidance.js';
import {SUBSTAT_VALUE_TABLE} from '../docs/assets/echoCoreRules.js';
import {captureWorkspaceSettings} from '../docs/ui-lab/v1.1/modules/account-settings.js';

const target={hard:[{name:'CRIT Rate',minimum:.063},{name:'CRIT DMG',minimum:.126}],flex:[{name:'ATK%',minimum:.064}],flexCount:1};
test('all 59 source Characters have editable executable account stat targets without per-Echo ER',()=>{
 assert.equal(priorities.characters.length,59);
 for(const {characterId} of priorities.characters){
  const state=createSandboxState(characterId);state.accountProjection={};normalizeAccountStatSettings(state);
  const s=settingsSnapshot(state);
  assert.doesNotThrow(()=>captureWorkspaceSettings(state),characterId+' persisted settings');
  assert.ok(s.hard.length||s.flex.length,characterId);
  assert.ok(Number.isInteger(s.flexCount)&&s.flexCount>=1||s.flex.length===0,characterId);
  assert.ok(![...s.hard,...s.flex].some(r=>r.stat==='Energy Regen'),characterId);
  assert.ok(s.hard.length+(s.flex.length?s.flexCount:0)<=5,characterId);
  for(const entry of priorities.characters.find(c=>c.characterId===characterId).entries.filter(e=>e.rank<=3))for(const name of entry.stats)assert.match(statPreference(characterId,name),/wb-stat-priority/,characterId+' '+name);
 }
});
test('whole-build ER only requires the deficit of the selected replacement',()=>{
 const input={characterId:'augusta',target,erTarget:{enabled:true,valuePercent:120}};
 assert.equal(accountStatTarget({...input,baseER:1.24}).er.status,'COVERED_BY_BUILD');
 assert.deepEqual(accountStatTarget({...input,baseER:1.24}).target,target);
 const missing=accountStatTarget({...input,baseER:1.12});
 assert.equal(missing.er.status,'REQUIRED_FOR_BUILD');
 assert.equal(missing.target.hard.at(-1).name,'Energy Regen');
 assert.equal(missing.target.hard.at(-1).minimum,SUBSTAT_VALUE_TABLE['Energy Regen'].find(v=>v>=.08-1e-9));
 assert.equal(accountStatTarget({...input,baseER:1}).er.status,'NEEDS_OTHER_SLOTS_OR_MAIN_STAT');
 const progress=accountStatTarget({...input,baseER:1,currentER:1});
 assert.equal(progress.er.status,'PROGRESS_TOWARD_BUILD');
 assert.equal(progress.er.minimum,SUBSTAT_VALUE_TABLE['Energy Regen'][0]);
 const mainProgress=accountStatTarget({...input,erTarget:{enabled:true,valuePercent:160},baseER:1.32,currentER:1});
 assert.equal(mainProgress.er.minimum,0);assert.deepEqual(mainProgress.target,target,'an ER main stat can supply progress without a forced ER substat');
 assert.equal(accountStatTarget({...input,baseER:1,currentER:1.124}).er.status,'NEEDS_OTHER_SLOTS_OR_MAIN_STAT','never replace max ER with a lower roll as progress');
 assert.equal(accountStatTarget({...input,baseER:1,erTarget:{enabled:false}}).er.status,'DISABLED');
 assert.equal(accountStatTarget({...input,baseER:NaN}).er.status,'UNAVAILABLE');
 // Augusta's guide lower bound is sufficient; more ER is never a failure.
 assert.equal(accountStatTarget({...input,erTarget:{enabled:true,valuePercent:null},baseER:1.15}).er.status,'COVERED_BY_BUILD');
});
test('middle roll classification respects the existing four- and eight-step ladders',()=>{
 for(const [name,values] of Object.entries(SUBSTAT_VALUE_TABLE)){
  const middle=values.length===8?3:2;
  assert.match(rollPresentation(name,values[middle],'value'),/wb-roll-middle/);
  assert.match(rollPresentation(name,values.at(-1),'value'),/wb-roll-upper/);
 }
});
