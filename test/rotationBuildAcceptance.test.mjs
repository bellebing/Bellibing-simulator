import test from 'node:test';
import assert from 'node:assert/strict';
import {rotationBuildAcceptance} from '../src/rotationBuildAcceptance.mjs';
import scenario from '../docs/ui-lab/v1.1/modules/echo-scenario.json' with {type:'json'};
import {rotationAcceptanceText} from '../docs/ui-lab/v1.1/modules/rotation-acceptance.js';
const required=scenario.energyRequirements.find(r=>r.characterId==='augusta').minimumRatio;
const gate=overrides=>rotationBuildAcceptance({characterId:'augusta',scenarioId:scenario.scenarioId,requirement:required,...overrides});
test('source rotation gate uses completed total ER, exact source minimum and explicit Custom intent independently of per-Echo goals',()=>{
 assert.equal(gate({total:required,complete:true}).status,'MET');assert.equal(gate({total:required-0.001,complete:true}).status,'NOT_MET');
 assert.equal(gate({total:5,complete:false}).actualRatio,null);assert.equal(gate({total:1.18,complete:true}).status,'MET');
 assert.equal(gate({total:1.18,complete:true,customTarget:{enabled:true,valuePercent:120}}).status,'NOT_MET');
 assert.equal(gate({total:required,complete:true,customTarget:{enabled:true,valuePercent:110}}).status,'MET');
 assert.equal(gate({upperBound:1.1}).status,'UNREACHABLE');assert.equal(gate({requirement:null,total:2,complete:true}).status,'PENDING');
 assert.equal(gate({customTarget:{enabled:true,valuePercent:null}}).reason,'INVALID_CUSTOM_TOTAL_ER');
 assert.ok(scenario.energyRequirements.length===3);assert.notEqual(required,1.2);
});
test('Echo goal completion is not rotation-qualified DPS success',()=>{
 const result={status:'GOAL_SUCCESS',metrics:{buildAcceptance:{rotation:{status:'NOT_MET'}}}};
 assert.match(rotationAcceptanceText(result),/Echo targets met.*rotation ER not met/);
 result.metrics.buildAcceptance.rotation.status='MET';assert.match(rotationAcceptanceText(result),/DPS experimental/);
 assert.match(rotationAcceptanceText({status:'GOAL_SUCCESS'}),/DPS Pending/);
});
