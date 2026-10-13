import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { STANDARD_TEAM_ROTATION_TIMING_REFERENCES, STANDARD_TEAM_ROTATION_TIMING_CASE_COVERAGE, STANDARD_TEAM_ROTATION_TIMING_REVIEW } from '../src/data/standardTeamRotationTiming.ts';
import { describeStandardTeamRotationTiming, findStandardTeamRotationTiming } from '../src/standardTeamRotationTiming.ts';
import { TEAM_ROTATION_CASES } from '../src/data/teamRotationCoordination.ts';

test('reviewed evidence/projection parity and all existing coordination cases accounted for', () => {
  const meta=STANDARD_TEAM_ROTATION_TIMING_REVIEW;
  const bytes=readFileSync(meta.evidenceArtifact);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),meta.evidenceSha256);
  const evidence=JSON.parse(bytes.toString());
  const reviewBytes=readFileSync(meta.reviewArtifact);
  assert.equal(createHash('sha256').update(reviewBytes).digest('hex'),meta.reviewSha256);
  const review=JSON.parse(reviewBytes.toString());
  assert.deepEqual(STANDARD_TEAM_ROTATION_TIMING_REFERENCES,evidence.sources.map((source:{id:string}) => ({...source,review:review.reviews.find((r:{sourceId:string}) => r.sourceId===source.id)})));
  assert.equal(STANDARD_TEAM_ROTATION_TIMING_REFERENCES.length,12);
  assert.deepEqual(new Set(STANDARD_TEAM_ROTATION_TIMING_CASE_COVERAGE.map(c => c.coordinationCaseId)),new Set(TEAM_ROTATION_CASES.map(c => c.id)));
});

test('Augusta loop uses energy Iuno and enhanced Intro support, not the first-rotation average', () => {
  const id='arabwuwa-augusta-iuno-shorekeeper-35';
  const loop=describeStandardTeamRotationTiming(id,2)!;
  assert.equal(loop.reportedCycleSeconds,26.06);
  assert.equal(loop.reportedThreeRotationAverageSeconds,25.99);
  assert.deepEqual(loop.visits?.map(v => [v.characterId,v.startSeconds,v.endSeconds]),[
    ['the-shorekeeper',0,4.75],['iuno',4.75,14.48],['augusta',14.48,26.06],
  ]);
  assert.equal(describeStandardTeamRotationTiming(id,1)!.memberBudgets.find(m => m.characterId==='iuno')!.fieldSeconds,8.21);
  assert.equal(loop.clock,'SOURCE_CLOCK_UNSPECIFIED');
  assert.equal(loop.referenceRelationship,'RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING');
  assert.equal(loop.automaticBuffUptime,null);
  assert.equal(loop.teamDpsReady,false);
  assert.equal(loop.rotationDps,null);
});

test('normal Ciaccona selected for repeatable loop; advanced/inconsistent opening excluded', () => {
  const id='arabwuwa-cartethyia-ciaccona-shorekeeper-38';
  assert.equal(describeStandardTeamRotationTiming(id,1)!.eligibleStandard,false);
  assert.equal(describeStandardTeamRotationTiming(id,1)!.visits,null);
  const loop=describeStandardTeamRotationTiming(id,2)!;
  assert.equal(loop.memberBudgets.find(m => m.characterId==='ciaccona')!.fieldSeconds,6.86);
  assert.equal(loop.visits!.at(-1)!.endSeconds,25.6);
  assert.equal(describeStandardTeamRotationTiming('arabwuwa-cartethyia-ciaccona-rover-aero-40',1)!.eligibleStandard,false);
});

test('split Phoebe visits preserve source total without inventing individual visit times', () => {
  const result=describeStandardTeamRotationTiming('arabwuwa-zani-phoebe-shorekeeper-33',2)!;
  assert.equal(result.eligibleStandard,true);
  assert.equal(result.reportedCycleSeconds,25.69);
  assert.equal(result.memberBudgets.find(m => m.characterId==='phoebe')!.fieldSeconds,8.24);
  assert.equal(result.visits,null);
  assert.equal(result.visitTimingGap,'SPLIT_VISIT_DURATIONS_NOT_PUBLISHED');
});

test('cooldown waits and reentries do not become a sustainable contiguous no-wait loop', () => {
  const brant=describeStandardTeamRotationTiming('arabwuwa-brant-lupa-mornye-84',3)!;
  assert.equal(brant.aggregateWaitSeconds,1.98);
  assert.equal(brant.visits,null);
  const yao=describeStandardTeamRotationTiming('arabwuwa-xiangli-yao-yinlin-shorekeeper-7',3)!;
  assert.equal(yao.aggregateWaitSeconds,2.59);
  assert.equal(yao.eligibleStandard,false);
  assert.equal(describeStandardTeamRotationTiming('arabwuwa-jinhsi-zhezhi-shorekeeper-58',2)!.aggregateWaitSeconds,.63);
  assert.deepEqual(findStandardTeamRotationTiming(['brant','lupa','mornye']),[]);
  assert.equal(findStandardTeamRotationTiming(['brant','lupa','mornye'],true).length,1);
});

test('exact trio lookup keeps source variant/mode/build conditions and cannot substitute partners', () => {
  assert.equal(findStandardTeamRotationTiming(['mornye','aemeath','lynae'])[0].review.modeRequirements.aemeath,'tune-rupture');
  assert.deepEqual(findStandardTeamRotationTiming(['phrolova','lucilla','qiuyuan']),[]);
  assert.deepEqual(findStandardTeamRotationTiming(['iuno','augusta','iuno']),[]);
  assert.equal(describeStandardTeamRotationTiming('unknown',2),null);
  assert.equal(describeStandardTeamRotationTiming('arabwuwa-augusta-iuno-shorekeeper-35',4),null);
  const rover=describeStandardTeamRotationTiming('arabwuwa-cartethyia-ciaccona-rover-aero-40',2)!;
  assert.equal(rover.sourceBuilds.find(b => b.characterId==='rover-aero')!.sequence,6);
});

test('derived single-visit timelines reconcile with source totals; off-field damage is not extra field time', () => {
  let count=0;
  for (const reference of STANDARD_TEAM_ROTATION_TIMING_REFERENCES) for (const phase of reference.phases) {
    const result=describeStandardTeamRotationTiming(reference.id,phase.rotationNumber)!;
    if (!result.visits) continue;
    count++;
    assert.ok(Math.abs(result.visits.at(-1)!.endSeconds-result.reportedCycleSeconds)<=.01);
    assert.equal(result.actionTimestamps,null);
    assert.equal(result.authorizesUpgradeVerdict,false);
  }
  assert.equal(count,22);
  assert.equal(describeStandardTeamRotationTiming('arabwuwa-cantarella-qiuyuan-phrolova-43',2)!.visits![0].durationSeconds,11.24);
});
