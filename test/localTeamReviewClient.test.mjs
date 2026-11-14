import test from 'node:test';
import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
import {createLocalTeamReview,hasCompleteTeamBuilds} from '../docs/ui-lab/v1.1/modules/local-team-review.js';
import {team,own} from './helpers/localTeamFixture.mjs';
import {createSandboxWorkspace} from '../docs/ui-lab/v1.1/modules/sandbox-state.js';
import {emptyResourceInventory} from '../docs/assets/resourceInventory.js';
import {accountTeamBasis} from '../docs/ui-lab/v1.1/modules/improve-comparison-basis.js';

test('ER-short planned DPS stays visibly conditional and cannot produce a certified comparison',async()=>{
 const originalLocation=globalThis.location;globalThis.location={hostname:'127.0.0.1'};
 let html='';const text={};const child={classList:{add(){}},isConnected:true,dataset:{},querySelector(selector){return {dataset:{},set textContent(v){text[selector]=v;},set innerHTML(v){if(selector==='[data-team-dps-body]')html=v;}};}};
 const input={mode:'IMPROVE',selectedCharacterId:'augusta',team,records:own().records,actualInvestments:Object.fromEntries(team.characterIds.map(id=>[id,{characterLevel:90,weaponLevel:90,weaponRefinement:1}])),scope:{}};
 const conditional={status:'CONDITIONAL',basis:'PLANNED_ROTATION_ASSUMING_ENERGY_AVAILABLE',verification:'EXPERIMENTAL_FIXED_REFERENCE',teamDpsReady:false,authorizesCharacterUpgrade:false,contextIdentity:'a'.repeat(64),comparisonIdentity:'c'.repeat(64),provider:{sourceBinding:'b'.repeat(64)},rotationAcceptance:{status:'NOT_MET',requirements:[{characterId:'augusta',actual:1,required:1.2}]},teamTotal:300,characterContributions:team.characterIds.map(characterId=>({characterId,dps:100}))};
 const blocked={status:'PENDING',reason:'WHOLE_TEAM_ENERGY_REQUIREMENT_NOT_MET',rotationAcceptance:conditional.rotationAcceptance,conditionalDps:conditional};
 let candidate=blocked;
 const fetchImpl=async(_,options)=>({ok:true,json:async()=>JSON.parse(options.body).action==='status'?{protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',status:'LOCAL_REVIEW_ONLY'}:{protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',result:{status:'PENDING',current:blocked,candidate,delta:null}}});
 try{
  const client=createLocalTeamReview({readInput:()=>input,autoReference:true,fetchImpl});await delay(0);client.mount({querySelector:()=>child});await delay(250);
  assert.match(html,/<th>Current \*<\/th>/);assert.match(html,/>300<\/td>/);
  assert.match(text['.local-team-status'],/Planned rotation; ER not met/);
  assert.equal(child.dataset.status,'PENDING');assert.doesNotMatch(html,/data-change="up"|data-change="down"/);
  candidate={...conditional,status:'EXPERIMENTAL',rotationAcceptance:{status:'MET'}};
  input.scope={candidateChanged:true};client.checkFresh();await delay(250);
  assert.match(html,/<tr data-dps-row="new"><th>New Echo<\/th><td[^>]*>100<\/td>/,'a legal candidate must remain visible beside ER-short Current');
 }finally{globalThis.location=originalLocation;}
});

test('Expected disappears immediately when a teammate build or the model basis changes',async()=>{
 const originalLocation=globalThis.location;globalThis.location={hostname:'127.0.0.1'};
 let html='';const child={classList:{add(){}},isConnected:true,dataset:{},querySelector(selector){return {dataset:{},set textContent(v){},set innerHTML(v){if(selector==='[data-team-dps-body]')html=v;}};}};
 const input={mode:'IMPROVE',selectedCharacterId:'augusta',team,records:own().records,actualInvestments:Object.fromEntries(team.characterIds.map(id=>[id,{characterLevel:90,weaponLevel:90,weaponRefinement:1}])),scope:{}};
 const baseline={status:'EXPERIMENTAL',verification:'EXPERIMENTAL_FIXED_REFERENCE',teamDpsReady:false,authorizesCharacterUpgrade:false,contextIdentity:'a'.repeat(64),comparisonIdentity:'c'.repeat(64),provider:{sourceBinding:'b'.repeat(64)},rotationAcceptance:{status:'MET'},teamTotal:300,characterContributions:team.characterIds.map(characterId=>({characterId,dps:100}))};
 let search={status:'ESTIMATED',characterId:'augusta',teamBuildIdentity:accountTeamBasis(input),useReference:false,current:structuredClone(baseline),selected:{expected:{teamDps:330,characterContributions:team.characterIds.map(characterId=>({characterId,dps:110}))}}};
 const fetchImpl=async(_,options)=>({ok:true,json:async()=>JSON.parse(options.body).action==='status'?{protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',status:'LOCAL_REVIEW_ONLY'}:{protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',result:{status:'EXPERIMENTAL',current:baseline,candidate:null}}});
 try{
  const client=createLocalTeamReview({readInput:()=>input,readSearch:()=>search,autoReference:true,fetchImpl});await delay(0);client.mount({querySelector:()=>child});await delay(250);
  assert.ok(html.includes('<th>Expected</th>'));assert.ok(html.includes('>330</td>'));
  input.records[1].buildState.weaponId='changed-partner-weapon';client.redraw();assert.ok(!html.includes('<th>Expected</th>'));
  await delay(250);
  search.teamBuildIdentity=accountTeamBasis(input);search.current.provider.sourceBinding='d'.repeat(64);client.redraw();assert.ok(!html.includes('<th>Expected</th>'));
  search.current.provider=structuredClone(baseline.provider);client.redraw();assert.ok(html.includes('<th>Expected</th>'));
 }finally{globalThis.location=originalLocation;}
});

test('Sandbox Expected build and Change use mean-build DPS instead of the fixed reference',async()=>{
 const originalDocument=globalThis.document,originalLocation=globalThis.location;let html='';
 const child={classList:{add(){}},isConnected:true,dataset:{},set innerHTML(v){html=v;},querySelector(selector){return {dataset:{},set textContent(v){},set innerHTML(v){if(selector==='[data-team-dps-body]')html=v;}};}};
 globalThis.document={createElement:()=>child};globalThis.location={hostname:'127.0.0.1'};
 const result=n=>({status:'EXPERIMENTAL',verification:'EXPERIMENTAL_FIXED_REFERENCE',teamDpsReady:false,authorizesCharacterUpgrade:false,contextIdentity:'a'.repeat(64),provider:{sourceBinding:'b'.repeat(64)},rotationAcceptance:{status:'MET'},teamTotal:n*3,characterContributions:team.characterIds.map(characterId=>({characterId,dps:n}))});
 const w=createSandboxWorkspace();w.select('augusta');
 const input={mode:'SANDBOX',team,selectedCharacterId:'augusta',scope:w.readContext(emptyResourceInventory(),0)};
 let erFailure=false;
 const fetchImpl=async(_url,options)=>({ok:true,json:async()=>JSON.parse(options.body).action==='status'?{protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',status:'LOCAL_REVIEW_ONLY'}:{protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',result:{status:'EXPERIMENTAL',current:result(900),expected:{...result(100),statisticalBasis:'DPS_AT_EXPECTED_STATS_NOT_EXPECTED_DPS'},candidate:erFailure?{status:'PENDING',reason:'WHOLE_TEAM_ENERGY_REQUIREMENT_NOT_MET',rotationAcceptance:{status:'NOT_MET',requirements:[{characterId:'augusta',actual:1,required:1.163}]}}:result(110)}}});
 try{const c=createLocalTeamReview({readInput:()=>input,fetchImpl});await delay(0);c.mount({querySelector:()=>child});await delay(250);assert.ok(html.includes('Expected build'));assert.ok(!html.includes('>900<'));assert.ok(html.includes('>100<'));assert.ok(html.includes('data-change="up">+10<'));assert.ok(!html.includes('-790'));
  input.candidates=[null];erFailure=true;c.checkFresh();assert.ok(html.includes('>100<'),'a new run must retain the matching Expected row');assert.ok(!html.includes('>110<'));
  await delay(250);assert.ok(html.includes('ER not met'));assert.ok(html.includes('100.0% / 116.3% required'));assert.ok(html.includes('>100<'));assert.ok(!html.includes('local-team-relative'));
 }
 finally{globalThis.document=originalDocument;globalThis.location=originalLocation;}
});
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
  if(requests===1){started();return new Promise(ok=>{release=()=>ok({ok:true,json:async()=>({protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',result:{status:'EXPERIMENTAL',current:null,candidate:{status:'EXPERIMENTAL',verification:'EXPERIMENTAL_FIXED_REFERENCE',teamDpsReady:false,authorizesCharacterUpgrade:false,contextIdentity:'a'.repeat(64),provider:{sourceBinding:'b'.repeat(64)},rotationAcceptance:{status:'MET'},teamTotal:123456,characterContributions:team.characterIds.map(characterId=>({characterId,dps:41152}))}}})});});}
  return {ok:true,json:async()=>({protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',result:{status:'PENDING',reason:'COMPLETE_ACCOUNT_TEAM_REQUIRED',current:null,candidate:null}})};
 };
 try{
  const controller=createLocalTeamReview({readInput:()=>input,fetchImpl});await delay(0);controller.mount({querySelector:()=>child});enabledHandler({target:{checked:true}});
  await firstStarted;input=change==='resources'?{...input,scope:{resources:2}}:change==='team'?{...input,team:{...team,id:'guide-augusta-mortefi-the-shorekeeper-augusta-slots-4',characterIds:['augusta','mortefi','the-shorekeeper']},records:[]}:{...input,team:null,records:[]};controller.checkFresh();await delay(300);
  assert.ok(html.includes(change==='empty-team'?'Choose a teammate':change==='team'?'Choose a Character build with five Echo slots':'Complete the team in Build'));release();await delay(0);
  assert.ok(!html.includes('123,456'));assert.ok(html.includes(change==='empty-team'?'Choose a teammate':change==='team'?'Choose a Character build with five Echo slots':'Complete the team in Build'));assert.equal(requests,change==='resources'?2:1);
 }finally{globalThis.document=originalDocument;globalThis.location=originalLocation;}
});

test('relative Echo changes use each actor baseline and omit undefined zero-baseline percentages',async()=>{
 const originalDocument=globalThis.document,originalLocation=globalThis.location;
 let handler,html='',revision=0;
 const child={classList:{add(){}},isConnected:true,dataset:{},classList:{add(){}},set className(v){},set innerHTML(v){html=v;},querySelector(){return {dataset:{},set textContent(v){html+=v;},set innerHTML(v){if(!v.includes('data-local-team-enable'))html=v;},set onchange(f){handler=f;}};}};
 globalThis.document={createElement:()=>child};globalThis.location={hostname:'127.0.0.1'};
 const result=values=>({status:'EXPERIMENTAL',verification:'EXPERIMENTAL_FIXED_REFERENCE',teamDpsReady:false,authorizesCharacterUpgrade:false,contextIdentity:'a'.repeat(64),provider:{sourceBinding:'b'.repeat(64)},rotationAcceptance:{status:'MET'},teamTotal:values.reduce((a,b)=>a+b,0),characterContributions:team.characterIds.map((characterId,i)=>({characterId,dps:values[i]}))});
 const input={mode:'IMPROVE',selectedCharacterId:'augusta',team,records:own().records,candidates:[]};
 input.candidates=[structuredClone(input.records.find(r=>r.characterId==='augusta').buildState.echoSets.sets[input.records.find(r=>r.characterId==='augusta').buildState.echoSets.activeSetId].slots[0])];
 let reply={status:'EXPERIMENTAL',current:result([100,0,100]),candidate:result([110,10,80])};
 let measurements=0;
 const fetchImpl=async(_url,options)=>({ok:true,json:async()=>JSON.parse(options.body).action==='status'?{protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',status:'LOCAL_REVIEW_ONLY'}:{protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',result:{status:reply.status,current:reply.current,candidate:measurements++%2===0?reply.current:reply.candidate}}});
 try{
  const controller=createLocalTeamReview({readInput:()=>({...input,scope:{revision}}),fetchImpl});await delay(0);controller.mount({querySelector:()=>child});handler({target:{checked:true}});await delay(250);
  assert.ok(html.includes('data-change="up">+10<small class="local-team-relative">+10%</small>'));
  assert.ok(html.includes('data-change="up">+10</td>'));assert.ok(html.includes('data-change="down">-20<small class="local-team-relative">-20%</small>'));
  assert.ok(html.includes('data-change="equal">0<small class="local-team-relative">0%</small>'));assert.ok(!html.includes('Infinity'));assert.ok(!html.includes('NaN'));
  revision++;reply={status:'EXPERIMENTAL',current:result([43594.8,0,100]),candidate:result([43595.2,0,100])};
  const exact=structuredClone(reply);controller.checkFresh();await delay(250);
  assert.ok(html.includes('>43,595</td>'));assert.ok(!html.includes('43,594.8'));
  assert.ok(html.includes('data-change="equal">0</td>'),'sub-unit rounded differences must not show +0 or -0');
  assert.deepEqual(reply,exact,'formatting must preserve exact provider values');
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

for(const changed of ['weapon','team','settings','configuration','resources'])test('standalone Sandbox automatically rejects late '+changed+' results without account records',async()=>{
 const originalLocation=globalThis.location;globalThis.location={hostname:'127.0.0.1'};
 const {createSandboxWorkspace}=await import('../docs/ui-lab/v1.1/modules/sandbox-state.js');
 const {emptyResourceInventory}=await import('../docs/assets/resourceInventory.js');
 const workspace=createSandboxWorkspace();workspace.select('augusta');let input={mode:'SANDBOX',selectedCharacterId:'augusta',team,scope:workspace.readContext(emptyResourceInventory(),0)},release,started;
 const first=new Promise(r=>started=r),parts={};
 const child={isConnected:true,classList:{add(){}},dataset:{},querySelector(selector){return parts[selector]??=(selector==='.team-dps-table'?{dataset:{}}:{textContent:'',innerHTML:''});}};
 let calls=0;
 const fetchImpl=async(_,options)=>{
  const q=JSON.parse(options.body);if(q.action==='status')return {ok:true,json:async()=>({protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',status:'LOCAL_REVIEW_ONLY'})};
  assert.deepEqual(Object.keys(q),['sandbox']);calls++;
  if(calls===1){started();return new Promise(ok=>{release=()=>ok({ok:true,json:async()=>({protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',result:{status:'EXPERIMENTAL',current:{status:'EXPERIMENTAL',verification:'EXPERIMENTAL_FIXED_REFERENCE',teamDpsReady:false,authorizesCharacterUpgrade:false,contextIdentity:'a'.repeat(64),provider:{sourceBinding:'b'.repeat(64)},rotationAcceptance:{status:'MET'},teamTotal:987654,characterContributions:team.characterIds.map(characterId=>({characterId,dps:329218}))},candidate:null}})});});}
  return {ok:true,json:async()=>({protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',result:{status:'PENDING',reason:'SANDBOX_REFERENCE_SOURCE_PENDING'}})};
 };
 try{
  const controller=createLocalTeamReview({readInput:()=>input,fetchImpl});await delay(0);controller.mount({querySelector:()=>child});await first;
  assert.equal(parts['[data-team-reference]'].innerHTML,'','no opt-in');
  input=structuredClone(input);
  if(changed==='weapon')input.scope.buildContext.weaponId='unsupported';
  else if(changed==='team')input.team={...team,id:'unknown'};
  else input.scope.revisions[changed==='resources'?'inventory':changed]++;
  controller.checkFresh();await delay(250);release();await delay(0);
  assert.equal(calls,2);assert.ok(!parts['[data-team-dps-body]'].innerHTML.includes('987,654'));assert.equal(parts['[data-team-status]'].textContent,'DPS not supported');assert.equal(child.dataset.kind,'SANDBOX_BUILD');
 }finally{globalThis.location=originalLocation;}
});
