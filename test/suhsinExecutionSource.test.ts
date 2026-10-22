import test from 'node:test';
import assert from 'node:assert/strict';
import source from '../data/source/echo-suhsin-execution-2026-10-22.json' with {type:'json'};
import {ECHO_SKILL_RAW} from '../src/data/echoSkillRaw.ts';

test('Suhsin original item/skill/damage join independently agrees with canonical Rank-5 text and retains raw energy',()=>{
 assert.equal(source.sourceCommit,'9218d612ad815e398e064e577e42aaf878899968');
 assert.equal(source.item.ItemId,60002255);assert.equal(source.item.SkillId,source.skill.Id);
 assert.equal(source.item.QualityId,5);assert.equal(source.skill.Id,280045);
 assert.deepEqual(source.skill.SettleIds,source.damage.map(r=>r.Id));
 const raw=ECHO_SKILL_RAW.find(e=>e.echoId==='echo-60002255')!;
 const percent=(text:string)=>Math.round(Number(text.replace('%',''))*100);
 // Raw SettleIds put Hsin's two components before the ordinary form.
 const order=[2,3,0,1];
 for(const [i,row]of source.damage.entries()){
  assert.equal(row.RateLv[4],percent(raw.rank5Params[order[i]]));
  assert.equal(row.Type,5);assert.equal(row.Element,3);assert.equal(row.RelatedProperty,7);
  for(let rank=0;rank<5;rank++)assert.equal(row.RateLv[rank],percent(source.skill.LevelDescStrArray[rank].ArrayString[order[i]]));
 }
 assert.deepEqual(source.damage.map(r=>r.Energy),[[11],[323],[38],[228]]);
 assert.equal(source.skill.SkillCD,20);
 // These rows do not establish hit timing, hit count, source rotation, uptime
 // or an executable public Echo attack profile. Those remain separate gates.
});
