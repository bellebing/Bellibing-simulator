import test from 'node:test';
import assert from 'node:assert/strict';
import {captureCharacterSourceEvidence} from '../src/characterImportSourceCapture.mjs';
const review={
 kind:'EXTERNAL_RELEASE_IDENTITY_EVIDENCE_ONLY',characterId:'sample',name:'Sample',originalPatch:'3.8',originalDate:'2026-11-12',
 identity:{rarity:5,element:'Spectro',weaponType:'Pistols'},
 sourceCapture:{sourceRoleId:1512,originalRoleNameKey:'RoleInfo_1512_Name'}
};
const input=()=>({
 roles:[{Id:1512,Name:'RoleInfo_1512_Name',IsTrial:false,PropertyId:1512,SkillTreeGroupId:1512,ResonantChainGroupId:1512,WeaponType:3,ElementId:5,QualityId:5}],
 base:[{Id:1512,Lv:1,LifeMax:1337,Atk:23,Def:90,EnergyMax:17500,Crit:500,CritDamage:15000,EnergyEfficiency:10000}],
 growth:[{Id:96,Level:90,BreachLevel:6,LifeMaxRatio:125000,AtkRatio:125000,DefRatio:122222}],
 tree:Array.from({length:17},(_,i)=>({NodeGroup:1512,Id:i+1,NodeIndex:i+1,NodeType:i>=8&&i<16?4:2,Property:i>=8&&i<16?[{Id:35,Value:180}]:[]})),
 chains:Array.from({length:6},(_,i)=>({GroupId:1512,GroupIndex:i+1,Id:201+i})),
 characters:[{id:1512,name:{en:'Sample'},element:{id:5,name:{en:'Spectro'}},weapon:{id:3,name:{en:'Pistols'}},rarity:{id:5},
   stats:{life:1337,atk:23,def:90},
   skillTrees:Array.from({length:8},(_,i)=>({id:9+i,name:'Healing Bonus',value:[{id:35}],valueText:['1.80%']})),
   chains:Array.from({length:6},(_,i)=>({id:201+i,name:{en:'S'+(i+1)},description:{en:'description'},param:[],icon:'source'})),
   moves:Array.from({length:8},(_,i)=>({id:100+i,type:1,sort:i,name:{en:'Skill'+i},description:{en:'Source mechanics'},values:[]})),
   skillIcons:{normal:'/source.png'},icon:{banner:'source-hero',iconRound:'source-portrait'}}]
});
test('original and translated structured data are captured without canonical promotion/rounding',()=>{
 const result=captureCharacterSourceEvidence(review,input(),{role:{commit:'pin'}});
 assert.equal(result.canonicalAuthority,false);
 assert.equal(result.level1.EnergyMax,17500);
 assert.equal(result.level90GrowthSource.LifeMaxRatio,125000);
 assert.equal(Object.hasOwn(result,'level90'),false);
 assert.equal(result.intrinsicSourceNodes.length,8);
 assert.equal(result.sequences.length,6);
 assert.equal(result.skills.length,8);
});
test('source ID or equipment conflicts fail closed',()=>{
 const roleConflict=input();roleConflict.characters[0].weapon.name.en='Sword';
 assert.throws(()=>captureCharacterSourceEvidence(review,roleConflict,{}),/disagree/);
 const propertyConflict=input();propertyConflict.base[0].Atk=24;
 assert.throws(()=>captureCharacterSourceEvidence(review,propertyConflict,{}),/conflict/);
 const sequenceConflict=input();sequenceConflict.characters[0].chains.pop();
 assert.throws(()=>captureCharacterSourceEvidence(review,sequenceConflict,{}),/Sequence/);
});
