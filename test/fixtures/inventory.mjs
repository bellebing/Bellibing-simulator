import {readFileSync} from 'node:fs';
import {CHARACTER_CATALOG} from '../../src/data/characters.ts';
const echoData=JSON.parse(readFileSync(new URL('../../docs/ui-prototypes/assets/echoes/browser-data.json',import.meta.url))),weaponData=JSON.parse(readFileSync(new URL('../../docs/ui-prototypes/assets/weapons/browser-data.json',import.meta.url)));
export const catalog={characters:CHARACTER_CATALOG.filter(c=>c.releaseStatus==='RELEASED'),echoes:echoData.echoes,statEditor:echoData.statEditor,weapons:weaponData.weapons.filter(w=>w.releaseStatus==='RELEASED'),sourceBinding:'CANONICAL_TEST_CATALOG'};
export function scan(characterId='lupa'){
 const c=catalog.characters.find(c=>c.id===characterId),w=catalog.weapons.find(w=>w.weaponType===c.weaponType),used=new Set();
 const echoes=[4,3,3,1,1].map(cost=>{const e=catalog.echoes.find(e=>e.cost===cost&&!used.has(e.id));used.add(e.id);return {echoId:e.id,sonataId:e.sonataSetIds[0],cost,rank:null,level:null,mainStat:structuredClone(catalog.statEditor.mainStatsByCostAndLevel[cost][25][0]),secondaryMainStat:structuredClone(catalog.statEditor.secondaryMainStatsByCostAndLevel[cost][25]),substats:catalog.statEditor.substats.slice(0,5).map(r=>({name:r.name,value:r.values[0]}))};});
 return {character:{id:characterId,level:90},weapon:{id:w.id,level:90,refinement:null},sequence:0,skills:{basic:10,skill:10,circuit:10,intro:10,liberation:10},echoes};
}
