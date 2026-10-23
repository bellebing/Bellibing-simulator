import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const input=JSON.parse(readFileSync('data/source/character-execution-buffs-2026-10-23.json','utf8'));
test('original client buff capture preserves all ten explicit role families and source property identities',()=>{
 assert.equal(input.source.commit,'9218d612ad815e398e064e577e42aaf878899968');
 assert.equal(input.characters.length,10);
 assert.equal(input.characters.reduce((n:number,c:{buffs:unknown[]})=>n+c.buffs.length,0),774);
 assert.equal(input.characters.reduce((n:number,c:{skills:unknown[]})=>n+c.skills.length,0),100);
 assert.deepEqual(Object.fromEntries(input.properties.map((p:{Id:number;Key:string})=>[p.Id,p.Key])),{60:'Energy',62:'SpecialEnergy1',64:'SpecialEnergy2',77:'ElementEnergy'});
 assert.ok(input.role.includes('NOT_AUTOMATIC_EXECUTION_ADMISSION'));
});
test('Jianxin cast/resource candidates retain the original skill joins and disputed raw value rather than normalizing it away',()=>{
 const j=input.characters.find((c:{characterId:string})=>c.characterId==='jianxin');
 const skill=j.skills.find((s:{Id:number})=>s.Id===1001902);
 assert.deepEqual(skill.DamageList,[1405021001,1405022001,1405023001]);
 const gain=j.buffs.find((b:{Id:number})=>b.Id===1405003010);
 assert.equal(gain.GameAttributeID,62);assert.deepEqual(gain.ModifierMagnitude,[25]);
 const rawOuter=j.buffs.find((b:{Id:number})=>b.Id===1405003009);
 assert.equal(rawOuter.GameAttributeID,77);assert.deepEqual(rawOuter.ModifierMagnitude,[2500]);
 // A raw row does not override the current canonical 23-Concerto skill table:
 // event use, trigger and current-client semantics must be reviewed separately.
 assert.ok(input.reviewPolicy.some((p:string)=>p.includes('trigger ordering')));
});
