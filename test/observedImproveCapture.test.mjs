import test from 'node:test';import assert from 'node:assert/strict';
import {captureObservedImproveCurrent} from '../src/observedImproveCapture.mjs';
import {own,team} from './helpers/localTeamFixture.mjs';
const fixture=()=>({mode:'IMPROVE',selectedCharacterId:'augusta',team,records:own().records,actualInvestments:Object.fromEntries(team.characterIds.map(id=>[id,{characterLevel:90,weaponLevel:90,weaponRefinement:1}])),scope:'workspace revision 1'});
test('observed Current identity survives stock, active-slot and Settings revisions while capturing actual builds',async()=>{
 const input=fixture(),before=structuredClone(input),a=await captureObservedImproveCurrent(input),b=await captureObservedImproveCurrent({...input,scope:'workspace revision 2: zero resources, slot 3, different gate',candidates:[{fake:true}]});
 assert.equal(a.status,'CAPTURED');assert.equal(b.status,'CAPTURED');assert.deepEqual(a.payload.current,b.payload.current);assert.equal(b.payload.candidate,undefined);assert.equal(a.payload.current.ownership.kind,'ACCOUNT_BUILD');assert.equal(a.payload.current.builds.length,3);assert.ok(a.payload.current.builds.every(b=>b.echoes.length===5));assert.deepEqual(input,before);
});
test('actual teammate equipment and investment changes still bind new Current identities',async()=>{
 const input=fixture(),a=await captureObservedImproveCurrent(input),gear=structuredClone(input);gear.records.find(r=>r.characterId==='iuno').buildState.weaponId='changed-actual-weapon';const b=await captureObservedImproveCurrent(gear);
 assert.equal(b.status,'CAPTURED');assert.notEqual(a.payload.current.ownership.revision,b.payload.current.ownership.revision);assert.equal(b.payload.current.builds.find(r=>r.characterId==='iuno').weapon.id,'changed-actual-weapon');
 const investment=structuredClone(input);investment.actualInvestments.augusta.characterLevel=80;const c=await captureObservedImproveCurrent(investment);assert.equal(c.status,'CAPTURED');assert.notEqual(c.payload.current.ownership.revision,a.payload.current.ownership.revision);assert.equal(c.payload.current.builds.find(r=>r.characterId==='augusta').baseline.characterLevel,80);
});
test('observed capture requires real Improve mode and explicit actual investments',async()=>{
 assert.equal((await captureObservedImproveCurrent({...fixture(),mode:'SANDBOX'})).status,'PENDING');const input=fixture();delete input.actualInvestments;input.acceptReferenceInvestment=true;assert.equal((await captureObservedImproveCurrent(input)).reason,'CONFIRM_REFERENCE_INVESTMENT');
});
