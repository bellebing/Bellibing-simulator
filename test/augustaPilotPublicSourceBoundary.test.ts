import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {expectedDamage,defenseMultiplier,resistanceMultiplier} from '../src/combat/damageKernel.ts';
import {AUGUSTA_PILOT_HIT_MODELS,AUGUSTA_PILOT_HIT_SOURCE} from '../src/data/augustaPilotHitModels.ts';
import {AUGUSTA_PILOT_ECHO_SOURCE_FACTS} from '../src/data/augustaPilotEchoSourceFacts.ts';
import {hasRotationEngineModel} from '../src/rotationEngineRegistry.ts';

const sha256=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex');

test('public Augusta source schedule, independent bindings and capture retain reviewed immutable provenance',()=>{
 assert.equal(sha256(AUGUSTA_PILOT_HIT_SOURCE.artifact),AUGUSTA_PILOT_HIT_SOURCE.sha256);
 assert.equal(sha256(AUGUSTA_PILOT_HIT_SOURCE.reviewPath),AUGUSTA_PILOT_HIT_SOURCE.reviewSha256);
 const raw=JSON.parse(readFileSync(AUGUSTA_PILOT_HIT_SOURCE.artifact,'utf8'));
 assert.equal(sha256('scripts/capture-augusta-pilot-hits.mjs'),raw.captureSha256);
 assert.ok(raw.records.every((r:{hits:Record<string,unknown>[]})=>r.hits.every(hit=>!Object.hasOwn(hit,'avg'))));
 assert.equal(AUGUSTA_PILOT_HIT_MODELS.length,2);
 for(const m of AUGUSTA_PILOT_HIT_MODELS){
  assert.equal(m.cycles.length,4);
  assert.ok(m.cycles.every(c=>c.endFrame>c.startFrame));
 }
 assert.equal(AUGUSTA_PILOT_HIT_SOURCE.clock,'PROVIDER_MODEL_GAME_FRAMES_AT_60FPS_EXCLUDING_TIMESTOP');
 assert.ok(AUGUSTA_PILOT_ECHO_SOURCE_FACTS.some(e=>e.name==='Echo - Lady of the Sea'));
 assert.ok(!hasRotationEngineModel('augusta-team-pilot','augusta'));
});

test('public generic damage kernel independently preserves source-benchmarked arithmetic',()=>{
 const raw=JSON.parse(readFileSync('data/research/augusta-pilot-kernel-benchmark-2026-10-12.json','utf8'));
 assert.equal(raw.role,'INDEPENDENT_PROVIDER_KERNEL_BENCHMARK_NOT_PRODUCTION_DAMAGE');
 for(const {enemyDefense,enemyResistance,providerExpectedDamage,partner,...snapshot} of raw.records){
  const actual=expectedDamage({...snapshot,defenseMultiplier:defenseMultiplier({attackerLevel:90,enemyDefense}),
   resistanceMultiplier:resistanceMultiplier(enemyResistance)});
  assert.equal(Math.floor(actual+1e-9),providerExpectedDamage,partner);
  assert.ok(actual-providerExpectedDamage<1.00000001);
 }
});
