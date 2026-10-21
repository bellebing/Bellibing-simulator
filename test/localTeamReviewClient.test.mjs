import test from 'node:test';
import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
import {createLocalTeamReview,hasCompleteTeamBuilds} from '../docs/ui-lab/v1.1/modules/local-team-review.js';
import {team,own} from './helpers/localTeamFixture.mjs';
// Deferred transport ignores abort deliberately: generation/snapshot checks must
// independently prevent an old successful response from becoming current.
for(const change of ['resources','team','empty-team'])test('late successful results cannot overwrite a new Pending '+change+' context',async()=>{
 const originalDocument=globalThis.document,originalLocation=globalThis.location;
 let enabledHandler,html='',input={mode:'IMPROVE',selectedCharacterId:'augusta',team,records:own().records,scope:{resources:1},candidates:[]},release;
 const child={classList:{add(){}},isConnected:true,set className(v){},dataset:{},set innerHTML(v){html=v;},querySelector(){return {dataset:{},set textContent(v){html+=v;},set innerHTML(v){if(!v.includes('data-local-team-enable'))html=v;},set onchange(f){enabledHandler=f;}};}};
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
  const controller=createLocalTeamReview({readInput:()=>input,fetchImpl});await delay(0);controller.mount({querySelector:()=>child});enabledHandler({target:{checked:true}});
  await firstStarted;input=change==='resources'?{...input,scope:{resources:2}}:change==='team'?{...input,team:{...team,id:'guide-augusta-mortefi-the-shorekeeper-augusta-slots-4',characterIds:['augusta','mortefi','the-shorekeeper']},records:[]}:{...input,team:null,records:[]};controller.checkFresh();await delay(300);
  assert.ok(html.includes(change==='empty-team'?'Choose a teammate':change==='team'?'Complete your team in Build':'Complete the team in Build'));release();await delay(0);
  assert.ok(!html.includes('123,456'));assert.ok(html.includes(change==='empty-team'?'Choose a teammate':change==='team'?'Complete your team in Build':'Complete the team in Build'));assert.equal(requests,change==='resources'?2:1);
 }finally{globalThis.document=originalDocument;globalThis.location=originalLocation;}
});

test('relative Echo changes use each actor baseline and omit undefined zero-baseline percentages',async()=>{
 const originalDocument=globalThis.document,originalLocation=globalThis.location;
 let handler,html='',revision=0;
 const child={classList:{add(){}},isConnected:true,dataset:{},classList:{add(){}},set className(v){},set innerHTML(v){html=v;},querySelector(){return {dataset:{},set textContent(v){html+=v;},set innerHTML(v){if(!v.includes('data-local-team-enable'))html=v;},set onchange(f){handler=f;}};}};
 globalThis.document={createElement:()=>child};globalThis.location={hostname:'127.0.0.1'};
 const result=values=>({status:'EXPERIMENTAL',verification:'EXPERIMENTAL_FIXED_REFERENCE',teamDpsReady:false,authorizesCharacterUpgrade:false,contextIdentity:'a'.repeat(64),provider:{sourceBinding:'b'.repeat(64)},rotationAcceptance:{status:'MET'},teamTotal:values.reduce((a,b)=>a+b,0),characterContributions:team.characterIds.map((characterId,i)=>({characterId,dps:values[i]}))});
 const input={mode:'IMPROVE',selectedCharacterId:'augusta',team,records:own().records,candidates:[]};
 let reply={status:'EXPERIMENTAL',current:result([100,0,100]),candidate:result([110,10,80])};
 const fetchImpl=async(_url,options)=>({ok:true,json:async()=>JSON.parse(options.body).action==='status'?{protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',status:'LOCAL_REVIEW_ONLY'}:{protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',result:reply}});
 try{
  const controller=createLocalTeamReview({readInput:()=>({...input,scope:{revision}}),fetchImpl});await delay(0);controller.mount({querySelector:()=>child});handler({target:{checked:true}});await delay(250);
  assert.ok(html.includes('data-change="up">+10<small class="local-team-relative">+10%</small>'));
  assert.ok(html.includes('data-change="up">+10</td>'));assert.ok(html.includes('data-change="down">-20<small class="local-team-relative">-20%</small>'));
  assert.ok(html.includes('data-change="equal">0<small class="local-team-relative">0%</small>'));assert.ok(!html.includes('Infinity'));assert.ok(!html.includes('NaN'));
  revision++;reply={status:'PENDING',current:reply.current,candidate:{status:'PENDING',reason:'WHOLE_TEAM_ENERGY_REQUIREMENT_NOT_MET'}};controller.checkFresh();await delay(250);
  assert.ok(!html.includes('local-team-relative'));assert.ok(html.includes('ER requirement not met'));
  revision++;reply={status:'EXPERIMENTAL',current:{...result([100,0,100]),status:'VERIFIED',verification:'SOURCE_QUALIFIED_TEAM_RUN',teamDpsReady:true},candidate:result([110,10,80])};controller.checkFresh();await delay(250);assert.ok(!html.includes('local-team-relative'));assert.ok(!html.includes('>200<'));assert.ok(!html.includes('>110<'));
  revision++;reply={status:'EXPERIMENTAL',current:result([100,0,100]),candidate:{...result([110,10,80]),provider:{sourceBinding:'c'.repeat(64)}}};controller.checkFresh();await delay(250);assert.ok(!html.includes('local-team-relative'));assert.ok(!html.includes('>110<'));
 }finally{globalThis.document=originalDocument;globalThis.location=originalLocation;}
});


test('empty or incomplete team builds show one next action instead of blank comparisons',()=>{
 const {records}=own();assert.equal(hasCompleteTeamBuilds({team,records}),true);
 assert.equal(hasCompleteTeamBuilds(null),false);assert.equal(hasCompleteTeamBuilds({team:null,records}),false);assert.equal(hasCompleteTeamBuilds({team,records:[]}),false);
 const empty=structuredClone(records);empty[0].buildState.echoSets.sets.owned.slots=[];assert.equal(hasCompleteTeamBuilds({team,records:empty}),false);
});
