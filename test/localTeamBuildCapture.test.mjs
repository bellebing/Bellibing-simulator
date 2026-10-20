import test from 'node:test';
import assert from 'node:assert/strict';
import {captureLocalTeamBuilds} from '../src/localTeamBuildCapture.mjs';
import {team,own} from './helpers/localTeamFixture.mjs';
test('read-only actual account records require explicit investment and never fill missing teammates',async()=>{
 const {records}=own(),input={mode:'IMPROVE',team,selectedCharacterId:'augusta',records,scope:{settings:1},acceptReferenceInvestment:true};
 const before=JSON.stringify(input),result=await captureLocalTeamBuilds(input);assert.equal(result.status,'CAPTURED');assert.equal(JSON.stringify(input),before);
 assert.equal((await captureLocalTeamBuilds({...input,acceptReferenceInvestment:false})).reason,'CONFIRM_REFERENCE_INVESTMENT');
 assert.equal((await captureLocalTeamBuilds({...input,records:records.slice(0,2)})).reason,'COMPLETE_ACCOUNT_TEAM_REQUIRED');
 assert.ok(result.payload.current.builds.every(b=>b.kind==='ACCOUNT_BUILD'&&b.weapon.rank===1));
});
test('Sandbox copies account observations into distinct hypothetical context; Candidates replace only declared slots',async()=>{
 const {records}=own(),base={mode:'SANDBOX',team,selectedCharacterId:'augusta',records,scope:{resources:1},acceptReferenceInvestment:true};
 const candidate=structuredClone(records[0].buildState.echoSets.sets.owned.slots[0]);candidate.substats=candidate.substats.map(r=>r.name==='CRIT DMG'?{...r,value:0.21}:r);
 const result=await captureLocalTeamBuilds({...base,candidates:[candidate]});assert.equal(result.status,'CAPTURED');assert.deepEqual(result.payload.slots,[0]);
 assert.equal(result.payload.current.ownership.kind,'SANDBOX_BUILD');assert.equal(result.payload.candidate.builds[0].echoes[0].substats.find(r=>r.name==='CRIT DMG').value,0.21);
 assert.equal(result.payload.current.builds[0].echoes[0].substats.length,5);
 const changed=await captureLocalTeamBuilds({...base,scope:{resources:2}});assert.notEqual(changed.payload.current.ownership.revision,result.payload.current.ownership.revision);
 assert.equal(new Set(result.payload.current.builds.flatMap(b=>b.echoes.map(c=>c.id))).size,15);
});
