// Test-only fixtures. Product code never imports this module.
export async function verifyUnifiedSimulator({send,evaluate,navigate,setViewport,waitForUi,pointerClick,capture,sleep}) {
  const read = expression => evaluate(send,expression);
  const check = async (expression,message) => { if(!await read(expression))throw Error('Unified simulator: '+message); };
  const click = async selector => {await read(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);const point=await read(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});await sleep(500);await pointerClick(send,selector);await sleep(150);};
  await setViewport(send,1440,900);await navigate(send);
  await read('localStorage.clear()');await navigate(send);
  await waitForUi(send,"echoDataLoaded&&weaponDataLoaded&&characterMechanicsDataLoaded&&buildStatsRuntimeLoaded&&window.bellibingImproveSettings?.canAssessEchoRequirements!==undefined",'source readiness',20000);
  await read("show('build');buildPicker.select('Augusta');addOwned('Augusta');show('improve');improvePicker.select('Augusta')");
  await waitForUi(send,"window.bellibingImproveSettings.canAssessEchoRequirements()",'policy readiness',20000);
  const current=await read('JSON.stringify(state)'), inventory=await read('JSON.stringify(window.bellibingResourceInventory.getState())');
  await waitForUi(send,"!document.getElementById('simulatorEnter').disabled&&!!window.bellibingEchoSimulator",'enabled simulator entry',20000);await click('#simulatorEnter');
  await check('!!improveUi.simulator&&improveUi.simulatorTemplates.length===5','one working session '+JSON.stringify(await read('({id:improveUi.characterId,session:!!improveUi.simulator,templates:improveUi.simulatorTemplates,disabled:document.getElementById("simulatorEnter").disabled,model:!!window.bellibingEchoSimulator})')));
  await check("document.querySelector('.improve-stat-head span:nth-child(2)').textContent==='Current'&&document.querySelector('.improve-stat-head span:last-child').textContent==='Simulated'",'separate comparison columns');
  await click('#simulatorRoll');
  await waitForUi(send,"improveUi.simulator.run?.status==='EXHAUSTED'",'zero-budget rejection');
  await check('improveUi.simulator.rolling.attempts===0','no free rolls');
  await click('[data-edit-echo="0"]');
  await waitForUi(send,"echoUi.open&&echoUi.context.kind==='simulate-setup'&&!!echoUi.editorDraft",'shared workshop');
  await check("[...document.querySelectorAll('[data-echo-filter]')].every(b=>b.disabled===(b.dataset.echoFilter!=='4'))",'setup communicates fixed slot cost');
  // Prepare a canonical +25 card inside the real editor, then use its physical Save.
  await read("echoUi.editorSubstatRows=echoStatContract.substats.slice(0,5).map(s=>({name:s.name,value:s.values[0]}));echoUi.syncDraftFromSubstatRows();echoUi.renderEditor();echoUi.syncEquipAction()");
  await capture(send,'artifacts/unified-echo-editor-1440x900.png');
  await click('#echoEquip');
  await waitForUi(send,"!echoUi.open&&improveWorkspaceSlots('Augusta')[0]?.level===25",'prepared Save');
  const active=await read("JSON.stringify(projectImproveCurrentStats('Augusta'))");
  const card=await read('JSON.stringify(window.bellibingEchoSimulator.simulatorEquipmentSlots(improveUi.simulator)[0])');
  await click('[data-simulator-slot="1"] [data-activation="false"]');
  await check("improveWorkspaceSlots('Augusta')[0]===null&&JSON.stringify(window.bellibingEchoSimulator.simulatorEquipmentSlots(improveUi.simulator)[0])==="+JSON.stringify(card),'deactivation retains the prepared card');
  await click('[data-simulator-slot="1"] [data-activation="true"]');
  await check("JSON.stringify(projectImproveCurrentStats('Augusta'))==="+JSON.stringify(active),'reactivation restores exact stats');
  await check('improveUi.simulator.slots[0].accepted.length===0&&improveUi.simulator.rolling.attempts===0','preparation is not a paid/generated outcome');
  await check('JSON.stringify(state)==='+JSON.stringify(current)+'&&JSON.stringify(window.bellibingResourceInventory.getState())==='+JSON.stringify(inventory),'Current and budget isolation');
  await check("!document.getElementById('simulatorResultStats').hidden&&document.getElementById('simulatorEnergyTarget').dataset.targetStatus==='BELOW'&&document.getElementById('simulatorEnergyTarget').textContent.includes('120%')",'visible Character-wide ER reference separate from Echo requirements');
  await check("document.getElementById('simulatorTrashPanel').parentElement===document.getElementById('improveBuildCard').parentElement&&document.querySelectorAll('#simulatorTrashColumns [data-trash-slot]').length===5&&document.getElementById('simulatorTrashPanel').compareDocumentPosition(document.getElementById('improveEchoRow'))&Node.DOCUMENT_POSITION_PRECEDING",'five piles in their separate panel after Simulator');
  // Use the existing serialized Settings writer for the fixture budget/criteria.
  await click('#improve-setting-gate');
  const input='[data-resource="echoes"] input';
  await click(input);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'a',code:'KeyA',modifiers:2});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',modifiers:2});
  await send('Input.insertText',{text:'37'});
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab'});
  await waitForUi(send,'window.bellibingResourceInventory.getState().echoes.count===37','persisted input');
  await click('[data-resource="echoes"] .improve-resource-unlimited');
  await waitForUi(send,"window.bellibingResourceInventory.getState().echoes.kind==='UNLIMITED'",'Unlimited toggle');
  await check("document.querySelector('[data-resource=echoes] input').value==='∞'&&document.querySelector('[data-resource=echoes] .improve-resource-unlimited').getAttribute('aria-pressed')==='true'",'infinite count shown');
  await click('[data-resource="echoes"] .improve-resource-unlimited');
  await waitForUi(send,"window.bellibingResourceInventory.getState().echoes.count===37",'toggle restores prior numeric value');
  await click(input);
  const dragPoint=await read(`(()=>{const r=document.querySelector(${JSON.stringify(input)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',...dragPoint});await sleep(200);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,...dragPoint});await sleep(100);
  for(const dx of [1.25,2.5,6.25,60]){await send('Input.dispatchMouseEvent',{type:'mouseMoved',button:'left',buttons:1,x:dragPoint.x+dx,y:dragPoint.y});await sleep(50)}
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,x:dragPoint.x+60,y:dragPoint.y});
  await waitForUi(send,'window.bellibingResourceInventory.getState().echoes.count===47','physical resource scrub commits exactly once');
  await click('#improve-setting-gate');
  const historyBeforeBudget=await read('JSON.stringify(improveUi.simulator.slots)');
  await check("document.getElementById('simulatorRoll').disabled&&document.getElementById('simulatorApplyBudget')",'resource change has a visible recovery action');
  await click('#simulatorApplyBudget');
  await check('!document.getElementById("simulatorRoll").disabled&&JSON.stringify(improveUi.simulator.slots)==='+JSON.stringify(historyBeforeBudget),'apply preserves prepared cards and history');
  await click('#improve-setting-gate');
  // Fixtures write only through the same exclusive canonical storage API.
  await read("(async()=>{const m=await import(new URL('../../assets/improvePolicyState.js',new URL('assets/improve-settings.js',location.href)));const r=await import(new URL('../../assets/resourceInventory.js',new URL('assets/improve-settings.js',location.href)));const awaitSourceFixture=(await(await fetch('assets/improve-settings/policies.json')).json()).characters.find(p=>p.characterId==='augusta');await m.withExclusiveImprovePolicyStorage(()=>{let store=m.loadImprovePolicyStorage(localStorage);let budget=r.updateResourceInventory(store.resourceInventory,'echoes',{kind:'FINITE',count:8});for(const id of ['tuners','premium','advanced','medium','basic'])budget=r.updateResourceInventory(budget,id,{kind:'UNLIMITED'});store=m.persistResourceInventory(store,budget,localStorage);const src=(awaitSourceFixture);let policy=m.readImprovePolicyState(store,'augusta',src);policy=m.updateImprovePolicyState(policy,{type:'set',section:'echoRequirements',value:{requiredOnEveryEcho:[],groups:[]}},src);policy=m.updateImprovePolicyState(policy,{type:'set',section:'echoPreferences',value:[]},src);m.persistImprovePolicyState(store,policy,localStorage)});window.dispatchEvent(new StorageEvent('storage',{key:m.IMPROVE_POLICY_STORAGE_KEY,storageArea:localStorage}));})()");
  await waitForUi(send,'window.bellibingResourceInventory.getState().tuners.kind===\"UNLIMITED\"','fixture budget');
  await click('#improve-setting-gate');await click('#simulatorReset');
  // Deterministic RNG provides reproducible real Echo Core results, not injected outcomes.
  await read('window.unifiedOriginalRandom=Math.random;Math.random=()=>0');
  await click('#simulatorFullSet');await click('#simulatorRoll');
  await waitForUi(send,"improveUi.simulator.run?.status!=='RUNNING'",'Full Set completion',60000);
  await check("improveUi.simulator.run.status==='SUCCESS'&&improveWorkspaceSlots('Augusta').every(card=>card?.level===25)",'five generated cards');
  await click('#simulatorBuildDetails summary');
  await check("document.getElementById('simulatorBuildDetails').open&&(()=>{const a=document.getElementById('simulatorBuildDetails').getBoundingClientRect(),b=document.getElementById('improveEchoRow').getBoundingClientRect();return a.bottom<=b.top})()",'expanded Skills/Sequence never overlaps Echoes');
  await click('#simulatorBuildDetails summary');
  await click('.improve-more-stats summary');
  await check("document.querySelector('.improve-more-stats').open",'extra stats reachable');
  await click('.improve-more-stats summary');
  await click('[data-simulator-slot="1"] [data-activation="false"]');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',modifiers:8,windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',modifiers:8,windowsVirtualKeyCode:9});
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});await send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});
  await waitForUi(send,"!!improveWorkspaceSlots('Augusta')[0]",'keyboard activation restores the same equipment');
  await check('improveUi.simulator.rolling.attempts===5&&window.bellibingResourceInventory.getState().echoes.count===8','one detached budget');
  await read('Math.random=window.unifiedOriginalRandom;delete window.unifiedOriginalRandom');
  for(const [width,height] of [[1440,900],[1920,1080],[2560,1440]]){
    await setViewport(send,width,height);await sleep(400);
    await read("document.getElementById('improveBuildCard').scrollIntoView({block:'center',behavior:'instant'})");
    await check("(()=>{const cards=[...document.querySelectorAll('.simulator-slot>.improve-equipped-echo')];return cards.length===5&&cards.every(c=>{const r=c.getBoundingClientRect();return r.width>100&&r.left>=0&&r.right<=innerWidth&&c.scrollWidth<=c.clientWidth+1})})()",'five contained cards '+width);
    await capture(send,'artifacts/unified-simulator-'+width+'x'+height+'.png');
  }
  // A below-minimum unique roll proves impossibility at +5, without stat blacklists.
  await read("(async()=>{const m=await import(new URL('../../assets/improvePolicyState.js',new URL('assets/improve-settings.js',location.href)));const source=(await(await fetch('assets/improve-settings/policies.json')).json()).characters.find(p=>p.characterId==='augusta');await m.withExclusiveImprovePolicyStorage(()=>{let store=m.loadImprovePolicyStorage(localStorage);let policy=m.readImprovePolicyState(store,'augusta',source);policy=m.updateImprovePolicyState(policy,{type:'gate',value:5},source);policy=m.updateImprovePolicyState(policy,{type:'set',section:'echoRequirements',value:{requiredOnEveryEcho:[{stat:'Flat HP',minimum:echoStatContract.substats.find(row=>row.name==='Flat HP').values.at(-1)}],groups:[]}},source);m.persistImprovePolicyState(store,policy,localStorage)});window.dispatchEvent(new StorageEvent('storage',{key:m.IMPROVE_POLICY_STORAGE_KEY,storageArea:localStorage}));})()");
  await setViewport(send,1440,900);await click('#simulatorOneSlot');await click('#simulatorReset');
  await read('window.unifiedOriginalRandom=Math.random;Math.random=()=>0');await click('#simulatorRoll');
  await waitForUi(send,"improveUi.simulator.run?.status==='EXHAUSTED'",'early rejected finite run');
  await check("improveUi.simulator.slots[0].trash.length===8&&improveUi.simulator.slots[0].trash.every(card=>card.card.level===5)&&improveUi.simulator.rolling.tuners===80&&improveUi.simulator.evaluator.status==='PENDING'",'actual +5 stops and no economic evaluator');
  await click('[data-trash-slot="1"] .simulator-pile-top');
  await check("document.querySelector('.simulator-inspection').open&&document.querySelectorAll('.simulator-inspection [data-checkpoint-level]').length===1&&document.querySelector('.simulator-inspection [data-checkpoint-level]').textContent.includes('Flat HP')&&document.querySelector('.simulator-inspection s')&&!document.querySelector('.simulator-inspection').textContent.includes('CRIT Rate')",'discard inspection shows only the new roll and actual stopped checkpoint');
  await capture(send,'artifacts/public-simulator-discard-history-1440x900.png');
  await click('.simulator-inspection button');
  await read("document.getElementById('simulatorTrashPanel').scrollIntoView({block:'center',behavior:'instant'})");
  await capture(send,'artifacts/public-simulator-trash-panel-1440x900.png');
  await read('Math.random=window.unifiedOriginalRandom;delete window.unifiedOriginalRandom');
  await click('#simulatorCurrent');await check('!improveUi.simulator&&JSON.stringify(state)==='+JSON.stringify(current),'exit restores Current');
  await navigate(send);await waitForUi(send,'window.bellibingResourceInventory','reload');await check('!improveUi.simulator&&window.bellibingResourceInventory.getState().echoes.count===8','reload keeps budget, discards sandbox');
  console.log('Display font:',await read("[...document.fonts].filter(f=>f.family.includes('Etna')).map(f=>({family:f.family,status:f.status}))"));
  console.log('Unified simulator PASS: workshop, prepared/generated ownership, Current/Simulated isolation, exact activation, zero-budget guard, Full Set, canonical storage and three desktop sizes.');
}
