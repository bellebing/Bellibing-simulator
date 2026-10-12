import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {TEAM_TIMING_MODEL_SCENARIOS as scenarios,TEAM_TIMING_MODEL_REVIEW as meta,TEAM_TIMING_RESEARCH_COVERAGE as coverage} from '../src/data/teamTimingModelScenarios.ts';
import {TEAM_ROTATION_CASES} from '../src/data/teamRotationCoordination.ts';
import {describeTeamTimingModelScenario as describe} from '../src/teamTimingModelScenarios.ts';
const input=(id:string)=>{const s=scenarios.find(s=>s.coordinationCaseId===id)!;return {scenarioId:s.id,characterIds:s.characterIds,rotationNumber:3,acceptContextVariant:true};};
test('all 19 cases have source timing or an explicitly declared alternative, with pinned model evidence',()=>{
 assert.deepEqual(new Set(coverage.map(c=>c.coordinationCaseId)),new Set(TEAM_ROTATION_CASES.map(c=>c.id)));
 assert.ok(coverage.every(c=>c.publishedSourceIds.length||c.modelScenarioIds.length));
 assert.equal(scenarios.length,12);
 assert.equal(createHash('sha256').update(readFileSync(meta.evidenceArtifact)).digest('hex'),meta.evidenceSha256);
 assert.equal(createHash('sha256').update(readFileSync(meta.reviewArtifact)).digest('hex'),meta.reviewSha256);
});
test('Hsin Unison has two actual visits and separately credited cycle-closing Intro',()=>{
 const result=describe(input('hsin-jinhsi-shorekeeper-unison'))!;
 assert.equal(result.status,'DECLARED_TIMING_SCENARIO');if(result.status!=='DECLARED_TIMING_SCENARIO')return;
 assert.deepEqual(result.visits.map(v=>v.characterId),['jinhsi','hsin','the-shorekeeper','jinhsi','hsin','jinhsi']);
 assert.equal(result.visits.at(-1)!.kind,'CYCLE_CLOSING_INTRO');
 assert.ok(Math.abs(result.cycleSeconds-28.5166666667)<1e-9);
 assert.equal(result.clock,'PROVIDER_MODEL_GAME_FRAMES_AT_60FPS_EXCLUDING_TIMESTOP');
 assert.equal(result.teamDpsReady,false);assert.equal(result.automaticBuffUptime,null);
});
test('changed recipe context must be accepted; third-member identity cannot silently change',()=>{
 const a=input('aemeath-changli-quickswap');
 assert.equal(describe({...a,acceptContextVariant:false})!.status,'CONTEXT_VARIANT_REQUIRED');
 assert.equal(describe({...a,characterIds:['aemeath','changli','mornye']}),null);
 assert.equal(describe({...a,rotationNumber:8}),null);
 assert.equal(describe({...a,characterIds:['aemeath','changli','changli']}),null);
});
test('Rover shorter action variant retains the support cooldown floor as extra waiting',()=>{
 const long=describe(input('rover-havoc-danjin-hypercarry'))!,short=describe(input('rover-havoc-danjin-shared-dps'))!;
 if(long.status!=='DECLARED_TIMING_SCENARIO'||short.status!=='DECLARED_TIMING_SCENARIO')throw Error('missing declared recipe');
 const r1=long.members.find(m=>m.characterId==='rover-havoc')!,r2=short.members.find(m=>m.characterId==='rover-havoc')!;
 assert.equal(long.cycleSeconds,25);assert.equal(short.cycleSeconds,25);
 assert.ok(r2.workSeconds<r1.workSeconds);assert.ok(r2.waitSeconds>r1.waitSeconds);
 assert.equal(long.sourceBuilds.find(b=>b.characterId==='rover-havoc')!.sequence,2);
});
test('double-Forte Brant and all other visit/work/wait totals reconcile in integer model frames',()=>{
 const brant=describe(input('brant-lupa-mornye-dps'))!;
 if(brant.status!=='DECLARED_TIMING_SCENARIO')throw Error('missing declared recipe');
 assert.equal(brant.visits.filter(v=>v.characterId==='brant').length,2);
 for(const s of scenarios)for(const p of s.phases){
  assert.equal(p.members.reduce((n,m)=>n+m.fieldFrames,0),p.cycleFrames);
  for(const m of p.members)assert.equal(m.fieldFrames,m.workFrames+m.waitFrames);
  assert.equal(p.visits[0].startFrame,0);assert.equal(p.visits.at(-1)!.endFrame,p.cycleFrames);
  for(let i=1;i<p.visits.length;i++)assert.equal(p.visits[i].startFrame,p.visits[i-1].endFrame);
 }
});
