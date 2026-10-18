import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../docs/ui-lab/v1.1/modules/source-priorities.json' with {type:'json'};
import {createSandboxWorkspace} from '../docs/ui-lab/v1.1/modules/sandbox-state.js';
import {restoreRecommendedSettings} from '../docs/ui-lab/v1.1/modules/settings-state.js';
import {sourcePriorityGuidance} from '../src/characterPriorityGuidance.mjs';
import {sourcePriorityMode} from '../docs/ui-lab/v1.1/modules/source-priorities.js';

test('59 source priority rows have provenance, no inferred thresholds and no automatic execution claim',()=>{
 assert.equal(data.characters.length,59);
 const w=createSandboxWorkspace();
 for(const row of data.characters){assert.ok(row.orderedStats.length);assert.equal(row.authorizesExecution,false);assert.equal(row.flexCount,null);assert.ok(row.sourceLinesSha256);
  const state=w.select(row.characterId);if(row.characterId==='augusta'){assert.deepEqual(state.statSections.hard,['CRIT Rate','CRIT DMG']);assert.equal(state.flexCount,1);continue;}
  assert.equal(sourcePriorityMode(state),true);assert.equal(state.flexCount,null);assert.deepEqual(state.statSections.hard,[]);assert.deepEqual(state.statSections.flex,row.orderedStats);
 }
});
test('Recommended puts Phrolova crit/ATK/Skill priorities in Flex without manufacturing ER or minima',()=>{
 const s=createSandboxWorkspace().select('phrolova');
 assert.deepEqual(s.statSections.flex,['CRIT Rate','CRIT DMG','ATK%','Skill DMG','Flat ATK']);
 s.settingsMode='Customize';s.minima['CRIT Rate']=2;s.erTarget={enabled:true,valuePercent:123};
 restoreRecommendedSettings(s);assert.equal(s.minima['CRIT Rate'],2);assert.equal(s.erTarget.valuePercent,123);assert.equal(s.flexCount,null);
});
test('conditional total-stat guidance and unknown capture syntax never become per-Echo requirements',()=>{
 const r=sourcePriorityGuidance({characterId:'unit',sourceUrl:'https://example.test',sourceLinesSha256:'unit',substatPriorities:[{sourceLine:1,sourceText:'HP (Until 50000) > CRIT Rate = CRIT DMG > Unknown Stat'}]});
 assert.deepEqual(r.orderedStats,['CRIT Rate','CRIT DMG']);assert.equal(r.entries[0].buildMetric,'TOTAL_HP');assert.equal(r.entries[0].condition,'Until 50000');assert.equal(r.entries[1].rank,r.entries[2].rank);assert.equal(r.unresolved.length,1);
 const brant=data.characters.find(c=>c.characterId==='brant');assert.equal(brant.orderedStats.filter(s=>s==='Energy Regen').length,1);assert.equal(brant.entries.filter(e=>e.stats.includes('Energy Regen')).length,2);
});
