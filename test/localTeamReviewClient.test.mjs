import test from 'node:test';
import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
import {createLocalTeamReview} from '../docs/ui-lab/v1.1/modules/local-team-review.js';
import {team,own} from './helpers/localTeamFixture.mjs';
// Deferred transport ignores abort deliberately: generation/snapshot checks must
// independently prevent an old successful response from becoming current.
test('late successful results cannot overwrite a new Pending owner/resource context',async()=>{
 const originalDocument=globalThis.document,originalLocation=globalThis.location;
 let enabledHandler,html='',input={mode:'IMPROVE',selectedCharacterId:'augusta',team,records:own().records,scope:{resources:1},candidates:[]},release;
 const child={isConnected:true,set className(v){},dataset:{},set innerHTML(v){html=v;},querySelector(){return {set onchange(f){enabledHandler=f;}};}};
 globalThis.document={createElement:()=>child};globalThis.location={hostname:'127.0.0.1'};
 let requests=0,started;
 const firstStarted=new Promise(ok=>{started=ok;});
 const fetchImpl=async(_url,options)=>{
  const data=JSON.parse(options.body);
  if(data.action==='status')return {ok:true,json:async()=>({protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',status:'LOCAL_REVIEW_ONLY'})};
  requests++;
  if(requests===1){started();return new Promise(ok=>{release=()=>ok({ok:true,json:async()=>({protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',result:{status:'EXPERIMENTAL',current:{status:'EXPERIMENTAL',verification:'EXPERIMENTAL_FIXED_REFERENCE',teamDpsReady:false,authorizesCharacterUpgrade:false,contextIdentity:'a'.repeat(64),provider:{sourceBinding:'b'.repeat(64)},rotationAcceptance:{status:'MET'},teamTotal:123456,characterContributions:team.characterIds.map(characterId=>({characterId,dps:41152}))},candidate:null}})});});}
  return {ok:true,json:async()=>({protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',result:{status:'PENDING',reason:'COMPLETE_ACCOUNT_TEAM_REQUIRED',current:null,candidate:null}})};
 };
 try{
  const controller=createLocalTeamReview({readInput:()=>input,fetchImpl});await delay(0);controller.mount({append(){}});enabledHandler({target:{checked:true}});
  await firstStarted;input={...input,scope:{resources:2}};controller.checkFresh();await delay(300);
  assert.ok(html.includes('Complete the team in Build'));release();await delay(0);
  assert.ok(!html.includes('123,456'));assert.ok(html.includes('Complete the team in Build'));assert.equal(requests,2);
 }finally{globalThis.document=originalDocument;globalThis.location=originalLocation;}
});
