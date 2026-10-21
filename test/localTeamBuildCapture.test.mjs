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


test('source-calculator contexts capture explicit source enemy without altering the existing pilot reference',async()=>{
 const {default:contexts}=await import('../docs/ui-lab/v1.1/modules/character-contexts.json',{with:{type:'json'}});
 for(const id of ['guide-jinhsi-zhezhi-the-shorekeeper-jinhsi-slots-22','guide-jinhsi-zhezhi-verina-jinhsi-slots-22','guide-carlotta-zhezhi-the-shorekeeper-carlotta-slots-7','guide-camellya-roccia-verina-camellya-slots-6','guide-aemeath-denia-lupa-aemeath-slots-3']){
  const context=contexts.teams.find(t=>t.id===id),{records}=own({context});
  const captured=await captureLocalTeamBuilds({mode:'IMPROVE',team:context,selectedCharacterId:context.characterIds[0],records,scope:{},acceptReferenceInvestment:true});
  assert.equal(captured.status,'CAPTURED');assert.equal(captured.payload.current.enemy.defense,1592);
  assert.deepEqual(Object.values(captured.payload.current.enemy.resistanceByElement),Array(7).fill(0.2));
  assert.equal(captured.payload.current.builds.length,3);
  for(const b of captured.payload.current.builds)assert.equal(b.modeId,context.modeRequirements?.[b.characterId]??'default');
 }
 const {records}=own(),pilot=await captureLocalTeamBuilds({mode:'SANDBOX',team,selectedCharacterId:'augusta',records,scope:{},acceptReferenceInvestment:true});
 assert.equal(pilot.payload.current.enemy.defense,1520);assert.equal(pilot.payload.current.enemy.resistanceByElement.Electro,0.1);
});

test('Echo comparison captures equipped weapons and actual mixed Sequences without replacing Current',async()=>{
 const {default:contexts}=await import('../docs/ui-lab/v1.1/modules/character-contexts.json',{with:{type:'json'}}),context=contexts.teams.find(t=>t.id==='guide-jinhsi-zhezhi-the-shorekeeper-jinhsi-slots-22');
 const {records}=own({context}),jinhsi=records.find(r=>r.characterId==='jinhsi'),zhezhi=records.find(r=>r.characterId==='zhezhi');
 jinhsi.buildState.sequenceLevel=2;jinhsi.buildState.weaponId='lustrous-razor';zhezhi.buildState.sequenceLevel=1;
 for(const mode of ['IMPROVE','SANDBOX']){
 const input={mode,team:context,selectedCharacterId:'jinhsi',records,scope:{},acceptReferenceInvestment:true,candidates:[structuredClone(jinhsi.buildState.echoSets.sets.owned.slots[0])]},before=JSON.stringify(input);
 const r=await captureLocalTeamBuilds(input);assert.equal(r.status,'CAPTURED');
 for(const side of [r.payload.current,r.payload.candidate]){const b=side.builds.find(b=>b.characterId==='jinhsi');assert.equal(b.weapon.id,'lustrous-razor');assert.equal(b.baseline.sequenceLevel,2);assert.equal(side.builds.find(b=>b.characterId==='zhezhi').baseline.sequenceLevel,1);}
 assert.equal(JSON.stringify(input),before);
 const other=structuredClone(input);other.records.find(r=>r.characterId==='jinhsi').buildState.sequenceLevel=0;
 assert.notEqual((await captureLocalTeamBuilds(other)).payload.current.ownership.revision,r.payload.current.ownership.revision);
 }
});
