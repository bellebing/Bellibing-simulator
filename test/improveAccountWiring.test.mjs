import test from 'node:test';
import assert from 'node:assert/strict';
import {productDraftFromAccount,productDraftBuildIdentity} from '../src/productBuildDraft.mjs';
import {emptyAccount,saveReviewedScan} from '../src/inventoryAccount.mjs';
import {catalog,scan} from './fixtures/inventory.mjs';
import {ownedTeamContext,characterContext} from '../docs/ui-lab/v1.1/modules/character-context.js';
import {captureLocalTeamBuilds} from '../src/localTeamBuildCapture.mjs';
import {own,team} from './helpers/localTeamFixture.mjs';

test('unchanged build ignores evidence/order; material edits and physical swaps remain changes',()=>{
 const account=saveReviewedScan(emptyAccount(),scan(),catalog,{reviewed:true,assign:true});
 const draft=productDraftFromAccount(account,Object.keys(account.characters)[0],{nodes:[]}),same=structuredClone(draft);
 same.echoes[0].evidence={extra:'recovery'};same.importObservation={retained:true};
 same.echoes[0].mainStat={value:same.echoes[0].mainStat.value,name:same.echoes[0].mainStat.name};
 assert.equal(productDraftBuildIdentity(same),productDraftBuildIdentity(draft));
 for(const edit of [d=>d.sequence++,d=>d.weaponRank=2,d=>d.weaponLevel=80,d=>d.echoes[0].instanceId='another-physical-item',d=>d.echoes[0].substats[0].value+=.001]){
  const changed=structuredClone(draft);edit(changed);assert.notEqual(productDraftBuildIdentity(changed),productDraftBuildIdentity(draft));
 }
});
test('saved exact trio wins without inventing a rotation',()=>{
 const context=characterContext('jinhsi'),alternative=context.options.find(t=>!t.characterIds.every(id=>context.team.characterIds.includes(id)));
 assert.ok(alternative);assert.equal(ownedTeamContext('jinhsi',[{characterIds:alternative.characterIds}]),alternative.id);
 const composed=ownedTeamContext('jinhsi',[{characterIds:['jinhsi','aalto','chixia']}]);
 assert.equal(composed,'account-native:jinhsi,aalto,chixia');
 assert.equal(characterContext('jinhsi',composed).team.compositionBasis,'EXPERIMENTAL_MEMBER_MODULES');
});
test('actual account capture retains an empty secondary slot and actual investments',async()=>{
 const {records}=own();for(const record of records)record.buildState.echoSets.sets.owned.slots[4]=null;
 const actualInvestments=Object.fromEntries(team.characterIds.map(id=>[id,{characterLevel:90,weaponLevel:90,weaponRefinement:1}]));
 const before=JSON.stringify(records),result=await captureLocalTeamBuilds({mode:'IMPROVE',team,selectedCharacterId:'augusta',records,actualInvestments,scope:{}});
 assert.equal(result.status,'CAPTURED');assert.ok(result.payload.current.builds.every(b=>b.echoes[4]===null&&b.kind==='ACCOUNT_BUILD'));assert.equal(JSON.stringify(records),before);
});

test('actual account team survives temporary busy responses without reference substitution',async()=>{
 const {createLocalTeamReview}=await import('../docs/ui-lab/v1.1/modules/local-team-review.js');
 const {setTimeout:delay}=await import('node:timers/promises');
 const originalLocation=globalThis.location;globalThis.location={hostname:'127.0.0.1'};
 const {records}=own();const parts={},child={isConnected:true,classList:{add(){}},dataset:{},querySelector(selector){return parts[selector]??=(selector==='.team-dps-table'?{dataset:{}}:{textContent:'',innerHTML:''});}};
 const input={mode:'IMPROVE',team,selectedCharacterId:'augusta',records,actualInvestments:Object.fromEntries(team.characterIds.map(id=>[id,{characterLevel:90,weaponLevel:90,weaponRefinement:1}])),scope:{}};
 let attempts=0,displayed=null;
 const fetchImpl=async(_,options)=>{
  const value=JSON.parse(options.body);if(value.action==='status')return {ok:true,json:async()=>({protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',status:'LOCAL_REVIEW_ONLY'})};
  assert.ok(value.current?.builds.every(b=>b.kind==='ACCOUNT_BUILD'),'reference team must not replace actual builds');
  if(++attempts===1)return {ok:false,status:429};
  return {ok:true,status:200,json:async()=>({protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',result:{status:'EXPERIMENTAL',current:{status:'EXPERIMENTAL',verification:'EXPERIMENTAL_FIXED_REFERENCE',teamDpsReady:false,authorizesCharacterUpgrade:false,contextIdentity:'a'.repeat(64),provider:{sourceBinding:'b'.repeat(64)},rotationAcceptance:{status:'MET'},teamTotal:300,characterContributions:team.characterIds.map(characterId=>({characterId,dps:100}))}}})};
 };
 try{
  const client=createLocalTeamReview({readInput:()=>input,autoReference:true,fetchImpl,onResult:r=>{displayed=r;}});await delay(0);client.mount({querySelector:()=>child});await delay(850);
  assert.equal(attempts,2);assert.equal(client.referenceInvestmentAccepted(),false);assert.equal(displayed?.current.teamTotal,300);assert.ok(parts['[data-team-dps-body]'].innerHTML.includes('300'));assert.notEqual(parts['.local-team-status'].textContent,'Local review unavailable');
 }finally{globalThis.location=originalLocation;}
});

test('Character weapon header uses saved investments for every Character, not an Augusta-only context',async()=>{
 const {characterCardModel}=await import('../docs/ui-lab/v1.1/modules/character-card.js');
 const {WEAPON_CATALOG}=await import('../docs/ui-lab/v1.1/modules/catalog.js');const weapon=WEAPON_CATALOG.find(w=>w.id==='ages-of-harvest');
 const saved={id:'jinhsi',weapon:weapon.name,accountProjection:{record:{buildState:{weaponId:weapon.id,weaponLevel:90,weaponRefinement:2}}}};
 assert.deepEqual(characterCardModel({identityElement:'Spectro'},saved).weaponContext,{id:weapon.id,level:90,rank:2});
 saved.accountProjection.record.buildState.weaponLevel=null;
 assert.equal(characterCardModel({identityElement:'Spectro'},saved).weaponContext,null);
});
