import {readFileSync,writeFileSync} from 'node:fs';
import {CHARACTER_CATALOG} from '../../../src/data/characters.ts';
import {SONATA_EFFECT_MODELS} from '../../../src/data/sonataEffects.ts';
// The Sandbox's source-backed Lv90/max-minor-Forte baseline does not depend
// on portrait/tree-art readiness. Existing production presentation stays intact.
const characters=CHARACTER_CATALOG.filter(c=>c.releaseStatus==='RELEASED').map(c=>({id:c.id,element:c.element,weaponType:c.weaponType,level90:c.level90,baseCombat:c.baseCombat,intrinsicStats:c.intrinsicStats,provenance:c.provenance}));
for(const c of characters)if(!c.element||!['hp','atk','def'].every(k=>Number.isFinite(c.level90[k]))||!['critRate','critDamage','energyRegen'].every(k=>Number.isFinite(c.baseCombat[k])))throw Error('Missing Sandbox Character stat facts: '+c.id);
const effects=SONATA_EFFECT_MODELS.map(e=>({effectId:e.effectId,sonataSetId:e.sonataSetId,pieces:e.pieces,statOrEffect:e.statOrEffect,value:e.value,valueMode:e.valueMode,effectType:e.effectType,appliesTo:e.appliesTo,mechanicsStatus:e.mechanicsStatus,provenance:e.provenance}));
const output=JSON.stringify({schemaVersion:1,owner:'CANONICAL_SANDBOX_STATIC_STAT_SOURCES',characters,sonataEffects:effects},null,2)+'\n';
const path=new URL('../v1.1/modules/sandbox-stat-sources.json',import.meta.url);
if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==output)throw Error('Sandbox stat sources stale');}else writeFileSync(path,output);
console.log('Sandbox static stat sources: '+characters.length+' Characters; canonical Sonata facts, no conditional execution.');
