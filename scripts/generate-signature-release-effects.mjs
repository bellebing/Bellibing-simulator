import { readFileSync, writeFileSync } from 'node:fs';
const packet=JSON.parse(readFileSync('data/source/signature-weapon-release-3.7.json','utf8'));
const effects=[];
for (const weapon of packet.weapons) {
  const values=index=>weapon.source.DescParams[index].ArrayString.map(v=>Number(v.replace('%',''))/100);
  const provenance={sourceLabels:['Original released 3.7 weapon passive and R1–R5 parameter arrays'],sourceUrls:packet.sources.map(s=>s.url),checkedAt:packet.reviewedAt,notes:[`Original weapon ${weapon.source.ItemId}; full source template/params and level-90 properties retained in data/source/signature-weapon-release-3.7.json.`]};
  const sourceEffectText=weapon.descriptionTemplate.replace(/\{(\d+)\}/g,(_,i)=>weapon.source.DescParams[Number(i)].ArrayString[0]).replace(/<[^>]+>/g,'').replace(/\{Cus:Sap,[^}]*P=([^ }]+)[^}]*\}/g,'$1');
  const add=(suffix,index,statOrEffect,extra={})=>effects.push({effectId:`${weapon.weaponId}-${suffix}`,weaponId:weapon.weaponId,statOrEffect,rankValues:values(index),valueUnit:'DECIMAL_MULTIPLIER',effectType:'STATE_CONDITIONAL',trigger:'See exact source passive prerequisites; activation requires a future explicit adapter.',durationSeconds:null,triggerCooldownSeconds:null,maxStacks:1,stackIntervalSeconds:0,appliesTo:'SELF',conditions:[sourceEffectText],simulatorMode:'MANUAL',mechanicsStatus:'VERIFIED_RAW_PENDING_MODEL',sourceEffectText,notes:'Source values only. No independent timing, full-stack state, uptime, stack mutation or team applicability is inferred.',provenance,...extra});
  add('all-attribute',0,'All Attribute DMG',{effectType:'PERMANENT',trigger:'Passive',conditions:[],simulatorMode:'ALWAYS',mechanicsStatus:'VERIFIED_MODELED',notes:'Explicit unconditional self All-Attribute DMG; the existing static Build-stat contract applies.'});
  if(weapon.weaponId==='blooming-jadehaven'){
    add('skill-amplification',1,'Resonance Skill DMG Amplification',{trigger:'After the wielder inflicts Electro Flare or triggers Unison Response.'});
    add('electro-res-ignore',2,'Electro RES Ignore',{trigger:'After the wielder inflicts Electro Flare or triggers Unison Response.',notes:'Applies to Resonance Skill damage only; not generic resistance reduction or a team aura.'});
    add('flare-amplification',3,'Electro Flare DMG Taken Amplification',{effectType:'TRIGGERED',trigger:'While the wielder is the active Resonator; targets within source-specified range.',durationSeconds:30,triggerCooldownSeconds:0.1,appliesTo:'TARGET',notes:'One trigger every 0.1s; only the strongest same-name effect applies. Range magnitude and refresh/event ordering are not supplied by the source and remain unmodeled.'});
  }else{
    add('nature-crit-damage',3,'CRIT DMG',{effectType:'STACKING',trigger:'Casting Intro Skill or gaining a Shield as the active Resonator grants a Nature\'s Order stack.',durationSeconds:7,maxStacks:6,notes:'Values are per stack; source maximum is six stacks (24/30/36/42/48%). Shield-trigger cadence is 0.5s; this is not generalized to the Intro trigger. Switching immediately removes Nature\'s Order.'});
    add('nature-heavy-crit-rate',11,'Heavy Attack CRIT Rate',{trigger:'Nature\'s Order reaches six stacks.',notes:'Heavy Attack CRIT Rate only. Depends on Nature\'s Order state and is not a permanent whole-Character CRIT stat.'});
    add('cradle-heavy-def-ignore',7,'Heavy Attack DEF Ignore',{effectType:'STACKING',trigger:'Heavy Attack consumes up to two Cradle of Life stacks.',durationSeconds:2,maxStacks:2,notes:'Values are per consumed stack; original maximum is 30/35/40/45/50%. Cradle gains one stack alongside Nature\'s Order, up to six held stacks for seven seconds, with 0.5s Shield-trigger cadence and immediate removal on switch. Consumed damage stacks and held resource stacks are distinct; execution stays unmodeled.'});
  }
}
const output=`// Generated from manually reviewed original release passive rows.\nimport type { WeaponEffectData } from '../effectDomain.ts';\nexport const SIGNATURE_RELEASE_WEAPON_EFFECTS: readonly WeaponEffectData[] = ${JSON.stringify(effects,null,2)} as const;\n`;
const path='src/data/weaponEffectsRelease37.ts';
if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==output)throw Error('Signature weapon effect generation drift');}else writeFileSync(path,output);
console.log(`Generated ${effects.length} original source effects; only two unconditional All-Attribute rows use existing static execution.`);
