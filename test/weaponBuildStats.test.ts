import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { activeWeaponBuildStats, projectWeaponBuildStatReview, type WeaponBuildStatReviewData } from '../src/weaponBuildStats.ts';

const review=JSON.parse(readFileSync('data/source/weapon-build-stat-review.json','utf8')) as WeaponBuildStatReviewData;
const releasedWeaponIds=WEAPON_CATALOG.filter(weapon=>weapon.releaseStatus==='RELEASED').map(weapon=>weapon.id);
const projected=projectWeaponBuildStatReview(WEAPON_EFFECT_CATALOG,releasedWeaponIds,review);

test('every released Weapon effect has one explicit source-backed Build Stats classification',()=>{
  assert.equal(releasedWeaponIds.length,121);assert.equal(projected.length,236);assert.equal(review.effects.length,236);
  assert.equal(projected.filter(row=>row.classification==='STATIC_BUILD_STAT').length,60);
  assert.equal(projected.filter(row=>row.classification==='NON_STATIC_MECHANIC').length,176);
  assert.equal(projected.filter(row=>row.classification==='PENDING').length,0);
  assert.equal(new Set(projected.map(row=>row.weaponId)).size,121);
  assert.deepEqual(review.summary,{releasedWeapons:121,reviewedEffects:236,staticBuildStatEffects:60,nonStaticMechanicEffects:176,pendingEffects:0});
});
test('R1 static projection is identity-backed and keeps rank values source-owned',()=>{
  assert.deepEqual(activeWeaponBuildStats(projected,'ages-of-harvest',1).map(row=>({stat:row.stat,value:row.value,identity:row.sourceWeaponEffect})),[{stat:'All Attribute DMG',value:.12,identity:{weaponId:'ages-of-harvest',effectId:'AH-ATTR',rank:1}}]);
  assert.deepEqual(activeWeaponBuildStats(projected,'guardian-sword',5).map(row=>({stat:row.stat,value:row.value,identity:row.sourceWeaponEffect})),[{stat:'Skill DMG',value:.24,identity:{weaponId:'guardian-sword',effectId:'GS-SKILL',rank:5}}]);
});
test('conditional, stacking and timed Weapon effects never leak into static Build Stats',()=>{
  assert.deepEqual(activeWeaponBuildStats(projected,'autumntrace',1),[]);
  assert.deepEqual(activeWeaponBuildStats(projected,'commando-of-conviction',1),[]);
  assert.deepEqual(activeWeaponBuildStats(projected,'somnoire-anchor',1),[]);
  const ages=projected.filter(row=>row.weaponId==='ages-of-harvest');
  assert.equal(ages.find(row=>row.effectId==='AH-ATTR')?.classification,'STATIC_BUILD_STAT');
  assert.equal(ages.find(row=>row.effectId==='AH-INTRO')?.classification,'NON_STATIC_MECHANIC');
  assert.equal(ages.find(row=>row.effectId==='AH-SKILL')?.classification,'NON_STATIC_MECHANIC');
});
test('review projection fails closed on missing identities, invalid static promotion and invalid rank',()=>{
  const missing=JSON.parse(JSON.stringify(review)) as WeaponBuildStatReviewData & {effects:WeaponBuildStatReviewData['effects'] extends readonly (infer R)[] ? R[] : never};
  missing.effects.pop();
  assert.throws(()=>projectWeaponBuildStatReview(WEAPON_EFFECT_CATALOG,releasedWeaponIds,missing),/Source\/review effect count mismatch/);
  const invalid=JSON.parse(JSON.stringify(review)) as any;
  const conditional=invalid.effects.find((row:any)=>row.effectId==='AH-INTRO');assert.ok(conditional);conditional.classification='STATIC_BUILD_STAT';conditional.buildStat='Skill DMG';
  assert.throws(()=>projectWeaponBuildStatReview(WEAPON_EFFECT_CATALOG,releasedWeaponIds,invalid),/Non-static mechanic was classified STATIC_BUILD_STAT/);
  assert.throws(()=>activeWeaponBuildStats(projected,'ages-of-harvest',0),/Invalid Weapon rank/);
});
