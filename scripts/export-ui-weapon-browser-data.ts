import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { activeWeaponBuildStats, projectWeaponBuildStatReview, type WeaponBuildStatReviewData } from '../src/weaponBuildStats.ts';

const defaultOutput='docs/ui-prototypes/assets/weapons/browser-data.json';
const reviewPath=resolve('data/source/weapon-build-stat-review.json');
const check=process.argv.includes('--check');
const outputArg=process.argv.indexOf('--output');
const output=resolve(outputArg>=0?process.argv[outputArg+1]:defaultOutput);
const buildStatWeaponRank=1;
const releasedWeapons=WEAPON_CATALOG.filter(weapon=>weapon.releaseStatus==='RELEASED');
const releasedWeaponIds=releasedWeapons.map(weapon=>weapon.id);
const review=JSON.parse(readFileSync(reviewPath,'utf8')) as WeaponBuildStatReviewData;
const reviewedEffects=projectWeaponBuildStatReview(WEAPON_EFFECT_CATALOG,releasedWeaponIds,review);
const payload={
  schemaVersion:2,role:'character-builder.weapon-browser',buildStatWeaponRank,weaponBuildStatReview:review.summary,
  generatedFrom:['src/data/weapons.ts#WEAPON_CATALOG','src/data/characters.ts#CHARACTER_CATALOG','src/data/weaponEffectCatalog.ts#WEAPON_EFFECT_CATALOG','data/source/weapon-build-stat-review.json','src/weaponBuildStats.ts'],
  weapons:releasedWeapons.map(weapon=>({id:weapon.id,name:weapon.name,releaseStatus:weapon.releaseStatus,weaponType:weapon.weaponType,rarity:weapon.rarity,level90BaseAtk:weapon.level90BaseAtk,secondary:weapon.secondary,staticBuildStats:activeWeaponBuildStats(reviewedEffects,weapon.id,buildStatWeaponRank).map(fact=>({stat:fact.stat,value:fact.value,sourceWeaponEffect:fact.sourceWeaponEffect}))})),
  characters:CHARACTER_CATALOG.filter(character=>character.releaseStatus==='RELEASED'&&character.weaponType).map(character=>({id:character.id,name:character.name,releaseStatus:character.releaseStatus,weaponType:character.weaponType}))
};
const serialized=`${JSON.stringify(payload,null,2)}\n`;
if(check){const existing=JSON.parse(readFileSync(output,'utf8'));if(JSON.stringify(existing)!==JSON.stringify(payload)){console.error('Canonical Weapon browser data is stale: '+output);console.error('Run: node --experimental-strip-types scripts/export-ui-weapon-browser-data.ts');process.exit(1)}console.log(`Canonical Weapon browser data verified: ${payload.weapons.length} released Weapons / ${payload.characters.length} released Characters / ${review.summary.reviewedEffects} reviewed effects / ${review.summary.staticBuildStatEffects} static Build-stat effects at R${buildStatWeaponRank}.`)}
else{mkdirSync(dirname(output),{recursive:true});writeFileSync(output,serialized);console.log('Exported canonical Weapon browser data: '+output)}
