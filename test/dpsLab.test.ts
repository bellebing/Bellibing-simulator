import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeDpsLab,TRACKS} from '../web/dps-lab/lab.js';

const sample=()=>({
 protocol:'BELLIBING_DPS_LAB_V1',
 result:{
  status:'EXPERIMENTAL',runIdentity:'native:one-run',
  rotation:{id:'fixture-only',characterIds:['a','b','c']},
  durationSeconds:10,totalDamage:300,teamTotal:30,
  characterContributions:[
   {characterId:'a',damage:100,dps:10},
   {characterId:'b',damage:120,dps:12},
   {characterId:'c',damage:80,dps:8}
  ],
  coverage:{onField:'EXPOSED',swap:'PARTIAL',buffs:'NOT_EXPOSED',offField:'NOT_EXPOSED'},
  events:[{id:'e1',runIdentity:'native:one-run',atSeconds:2,track:'onField',kind:'NATIVE_ACTION',name:'Test action',characterId:'a'}]
 }
});
test('DPS Lab has exactly four tracks on one shared clock, with no fabricated fallbacks',()=>{
 assert.deepEqual(TRACKS.map(t=>t.id),['onField','swap','buffs','offField']);
 assert.equal(normalizeDpsLab({status:'PENDING'}).status,'PENDING');
 assert.equal(normalizeDpsLab(sample()).status,'EXPERIMENTAL');
});
test('same-run contribution, duration, event bounds and identity are hard gates',()=>{
 const wrongDamage=sample();wrongDamage.result.totalDamage=299;
 assert.equal(normalizeDpsLab(wrongDamage).reason,'RESULT_IDENTITY_OR_TOTAL_MISMATCH');
 const wrongMember=sample();wrongMember.result.characterContributions[0].damage=99;
 assert.equal(normalizeDpsLab(wrongMember).reason,'MEMBER_CONTRIBUTIONS_PENDING');
 const wrongClock=sample();wrongClock.result.events[0].atSeconds=10.01;
 assert.equal(normalizeDpsLab(wrongClock).reason,'EVENT_TIMELINE_INVALID');
 const wrongRun=sample();wrongRun.result.events[0].runIdentity='another-run';
 assert.equal(normalizeDpsLab(wrongRun).reason,'EVENT_TIMELINE_INVALID');
 const unknownTrack=sample();unknownTrack.result.events[0].track='imaginary';
 assert.equal(normalizeDpsLab(unknownTrack).reason,'EVENT_TIMELINE_INVALID');
});
