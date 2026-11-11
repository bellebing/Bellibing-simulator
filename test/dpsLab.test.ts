import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeDpsLab,TRACKS,timelineView,placeTimelineObjects} from '../web/dps-lab/lab.js';

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
const typed=()=>{
 const fixture=sample(),id=fixture.result.runIdentity;
 fixture.result.timeline={
  version:'BELLIBING_DPS_TIMELINE_V1',runIdentity:id,
  timebase:'SOURCE_NATIVE_GAME_FRAMES_60_PER_SECOND',originFrame:600,
  dpsCycleSeconds:10,activeRotationSeconds:null,visibleEndSeconds:25,
  unlinkedHitCount:0,
  instants:[{id:'e1',runIdentity:id,type:'NATIVE_ACTION_START',track:'onField',atSeconds:2,name:'Test action',characterId:'a'}],
  intervals:[{id:'span-1',runIdentity:id,type:'NATIVE_ACTION_CLOCK_SPAN',track:'onField',name:'Test action',characterId:'a',startSeconds:2,endSeconds:25,sourceEventId:'e1'}],
  links:[{fromId:'e1',toId:'span-1',relation:'CLOCK_SPAN_OF_ACTION'}]
 };
 return fixture;
};

test('DPS Lab retains 4 tracks, source-only points, and no invented intervals',()=>{
 assert.deepEqual(TRACKS.map(t=>t.id),['onField','swap','buffs','offField']);
 assert.equal(normalizeDpsLab({status:'PENDING'}).status,'PENDING');
 const v0=normalizeDpsLab(sample());assert.equal(v0.status,'EXPERIMENTAL');
 assert.equal(timelineView(v0).intervals.length,0);
 assert.equal(timelineView(v0).visibleEndSeconds,10);
});

test('same-run damage, cycle length, source events and owners are hard gates',()=>{
 const bad=sample();bad.result.totalDamage=299;
 assert.equal(normalizeDpsLab(bad).reason,'RESULT_IDENTITY_OR_TOTAL_MISMATCH');
 const wrongMember=sample();wrongMember.result.characterContributions[0].damage=99;
 assert.equal(normalizeDpsLab(wrongMember).reason,'MEMBER_CONTRIBUTIONS_PENDING');
 const wrongClock=sample();wrongClock.result.events[0].atSeconds=10.01;
 assert.equal(normalizeDpsLab(wrongClock).reason,'EVENT_TIMELINE_INVALID');
 const wrongRun=sample();wrongRun.result.events[0].runIdentity='another-run';
 assert.equal(normalizeDpsLab(wrongRun).reason,'EVENT_TIMELINE_INVALID');
 const unknownTrack=sample();unknownTrack.result.events[0].track='imaginary';
 assert.equal(normalizeDpsLab(unknownTrack).reason,'EVENT_TIMELINE_INVALID');
});

test('verified source interval may outlive DPS cycle; wider view never changes its denominator',()=>{
 const run=normalizeDpsLab(typed());assert.equal(run.status,'EXPERIMENTAL',run.reason);
 const auto=timelineView(run),longer=timelineView(run,60);
 assert.equal(auto.dpsCycleSeconds,10);assert.equal(auto.visibleEndSeconds,25);
 assert.equal(auto.displayEndSeconds,25);assert.equal(longer.displayEndSeconds,60);
 assert.equal(run.teamTotal,30);assert.equal(run.totalDamage/run.durationSeconds,30);
 assert.equal(longer.intervals[0].startSeconds,2);assert.equal(longer.intervals[0].endSeconds,25);
 assert.equal(longer.activeRotationSeconds,null);
});

test('missing/unverified interval end, wrong cause and forged run are rejected, never filled in',()=>{
 const missing=typed();delete missing.result.timeline.intervals[0].endSeconds;
 assert.equal(normalizeDpsLab(missing).reason,'TIMELINE_INTERVAL_INVALID');
 const backwards=typed();backwards.result.timeline.intervals[0].endSeconds=1;
 assert.equal(normalizeDpsLab(backwards).reason,'TIMELINE_INTERVAL_INVALID');
 const wrongSource=typed();wrongSource.result.timeline.intervals[0].sourceEventId='guess';
 assert.equal(normalizeDpsLab(wrongSource).reason,'TIMELINE_CAUSALITY_INVALID');
 const wrongRun=typed();wrongRun.result.timeline.intervals[0].runIdentity='other';
 assert.equal(normalizeDpsLab(wrongRun).reason,'TIMELINE_INTERVAL_INVALID');
 const denominator=typed();denominator.result.timeline.dpsCycleSeconds=25;
 assert.equal(normalizeDpsLab(denominator).reason,'TIMELINE_CLOCK_INVALID');
 const fabricatedEnd=typed();fabricatedEnd.result.timeline.visibleEndSeconds=40;
 assert.equal(normalizeDpsLab(fabricatedEnd).reason,'TIMELINE_VISIBLE_END_MISMATCH');
});

test('point stays at exact x, block has exact width and overlapping labels get different rows',()=>{
 const fixture=typed().result.timeline;
 const entries=placeTimelineObjects([...fixture.instants,{...fixture.instants[0],id:'e2',atSeconds:2.01}],fixture.intervals,10);
 const block=entries.items.find(x=>x.shape==='interval');
 const point=entries.items.find(x=>x.data.id==='e1');
 assert.equal(block.x,20);assert.equal(block.width,230);
 assert.equal(point.x,20);
 assert.ok(new Set(entries.items.map(x=>x.row)).size>=2);
});
