import {primaryMainStatValueAtLevel,secondaryMainStatValueAtLevel,SUBSTAT_VALUE_TABLE,type Echo} from '../echoCore.ts';
import type {AugustaPilotBuild,AugustaPilotEnemy} from '../combat/augustaTeamPilot.ts';
/** Synthetic legal cards for reproducible examples, not recommended player targets. */
const card=(id:string,cost:1|3|4,main:string,hp=false):Echo=>({id,cost,rank:5,level:25,mainStat:{name:main as Echo['mainStat']['name'],value:primaryMainStatValueAtLevel(cost,main,25)!},secondaryMainStat:{name:cost===1?'Flat HP':'Flat ATK',value:secondaryMainStatValueAtLevel(cost,25)},substats:['CRIT Rate','CRIT DMG','Energy Regen',hp?'HP%':'ATK%',hp?'Flat HP':'Heavy Attack DMG'].map(name=>({name:name as Echo['substats'][number]['name'],value:SUBSTAT_VALUE_TABLE[name as keyof typeof SUBSTAT_VALUE_TABLE][2]}))});
const cards=(id:string,mains:string[],hp=false)=>[4,3,3,1,1].map((cost,i)=>card(id+'-'+i,cost as 1|3|4,mains[i],hp));
export function createAugustaPilotExampleBuilds():AugustaPilotBuild[]{return [
 {characterId:'augusta',sequence:0,weapon:{id:'thunderflare-dominion',rank:1},equipmentPresetId:'augusta-cov3-void2-false-sovereign',echoes:cards('augusta',['CRIT Rate','ATK%','ATK%','ATK%','ATK%'])},
 {characterId:'iuno',sequence:0,weapon:{id:'moongazers-sigil',rank:1},equipmentPresetId:'iuno-cov3-sierra2-lady',echoes:cards('iuno',['CRIT Rate','ATK%','ATK%','ATK%','ATK%'])},
 {characterId:'mortefi',sequence:6,weapon:{id:'static-mist',rank:1},equipmentPresetId:'mortefi-moonlit5-heron',echoes:cards('mortefi',['CRIT Rate','ATK%','ATK%','ATK%','ATK%'])},
 {characterId:'the-shorekeeper',sequence:0,weapon:{id:'stellar-symphony',rank:1},equipmentPresetId:'shorekeeper-rejuvenating5-fallacy',echoes:cards('shorekeeper',['HP%','Energy Regen','Energy Regen','HP%','HP%'],true)}
];}
export const AUGUSTA_PILOT_EXAMPLE_ENEMY:AugustaPilotEnemy={defense:1520,resistanceByElement:{Electro:0.1,Aero:0.1,Fusion:0.1,Spectro:0.1,Havoc:0.1},damageReduction:0};
