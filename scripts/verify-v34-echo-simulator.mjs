// Test/dev-only observations and external dispositions, injected into an isolated
// browser profile. This file is never copied to the public browser artifact.
export async function verifyEchoSimulator({send,evaluate,navigate,setViewport,waitForUi,pointerClick,capture,sleep}) {
  const read = expression => evaluate(send,expression);
  const check = async (expression,message) => { if (!await read(expression)) throw new Error('Echo Simulator: '+message); };
  const click = async selector => {
    await read(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:10,y:10});await sleep(500);await pointerClick(send,selector);
  };
  const policyState='window.bellibingImproveSettings.getState()', inventoryState='window.bellibingResourceInventory.getState()';
  const policyKey='bellibing.improve.policy.v3';
  const focus=key=>'#improveSettings [data-focus-key='+JSON.stringify(key)+']';
  const resource=id=>'#improveSettings [data-resource="'+id+'"] input';
  const enter=async(selector,text)=>{
    await click(selector);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'a',code:'KeyA',modifiers:2,windowsVirtualKeyCode:65});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',modifiers:2,windowsVirtualKeyCode:65});
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Backspace',code:'Backspace'});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Backspace',code:'Backspace'});
    await send('Input.insertText',{text});
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  };
  const expand=async id=>{await click('#improve-setting-'+id);await check('document.querySelector("#improve-setting-'+id+'").getAttribute("aria-expanded")==="true"&&!document.getElementById("improveSettings").inert','physical '+id+' expansion')};
  const collapse=async id=>{await click('#improve-setting-'+id);await check('document.querySelector("#improve-setting-'+id+'").getAttribute("aria-expanded")==="false"','physical '+id+' collapse')};
  await setViewport(send,1440,900);await navigate(send);await read('localStorage.clear()');await navigate(send);
  await waitForUi(send,'echoDataLoaded&&weaponDataLoaded&&characterMechanicsDataLoaded&&sequenceRuntimeDataLoaded&&buildStatsRuntimeLoaded&&window.bellibingEchoSimulator&&releasedCharacters.length===59','Simulator sources not ready');
  await read(`(()=>{
    addOwned('Augusta');addOwned('Cartethyia');
    const names=['Sigillum','Twin Nova: Collapsar Blade','Glommoth','Iceglint Dancer','Shadow Stepper'];
    names.forEach((name,index)=>{const item=echoCatalog.find(row=>row.name===name);commitEchoSlot('Augusta',index,makeEchoStatCard(item,item.sonataSetIds[0]))});
    autosave('Augusta',{weaponId:'thunderflare-dominion',sequenceLevel:1});show('improve');improvePicker.select('Augusta');
    return true;
  })()`);await sleep(800);
  await read(`(()=>{const item=echoCatalog.find(row=>row.name==='Iceglint Dancer');improveUi.candidate={echoId:item.id,selectedSonataSetId:item.sonataSetIds[0]};improveUi.renderCandidate()})()`);
  // Counterfactual canonical projection with identical non-Echo inputs, no account equipment.
  const stats=await read(`(()=>{const project=window.bellibingProjectStaticBuildStats;let empty;
    try{window.bellibingProjectStaticBuildStats=input=>{empty=project({...input,echoSlots:Array(5).fill(null)});return project(input)};
      const current=projectImproveCurrentStats('Augusta');return {current,empty};
    }finally{window.bellibingProjectStaticBuildStats=project}})()`);
  await check('JSON.stringify('+JSON.stringify(stats.current)+')!==JSON.stringify('+JSON.stringify(stats.empty)+')','equipped fixture must affect real stats');
  const realCandidate=await read('JSON.stringify(improveUi.candidate)');
  const stored=await read('localStorage.getItem(KEY)'), real=await read('JSON.stringify(state)');
  const unchanged=async message=>{await check('localStorage.getItem(KEY)==='+JSON.stringify(stored)+'&&JSON.stringify(state)==='+JSON.stringify(real),message)};
  await check('!improveUi.simulator&&document.querySelectorAll(".simulator-trash").length===0&&improveUi.currentWeapon().id==="thunderflare-dominion"','Current mode changed');
  await waitForUi(send,'window.bellibingImproveSettings&&document.getElementById("improveSettings").dataset.sourceStatus!=="LOADING"','Shared settings not ready');
  await expand('gate');await enter(resource('echoes'),'21');await enter(resource('tuners'),'∞');await click(focus('gate:10'));await collapse('gate');
  await check(inventoryState+'.echoes.count===21&&'+inventoryState+'.tuners.kind==="UNLIMITED"&&'+policyState+'.gate===10','Current physical finite/∞/Gate input');
  let sharedPolicy=await read('JSON.stringify('+policyState+')'),sharedInventory=await read('JSON.stringify('+inventoryState+')');
  const storageKeys=await read('JSON.stringify(Object.keys(localStorage).sort())');
  const sharedUnchanged=async message=>check('JSON.stringify('+policyState+')==='+JSON.stringify(sharedPolicy)+'&&JSON.stringify('+inventoryState+')==='+JSON.stringify(sharedInventory),message);
  const artifactVariant=await read("location.pathname.startsWith('/ui-preview/')?'built':'source'");
  await capture(send,'artifacts/ui-preview-echo-simulator-current-1440x900.png');
  await read('improveUi.startSimulation()');await unchanged('start mutated real state');await sharedUnchanged('Current edits not shared with Simulate');
  await check('!!improveUi.simulator&&document.querySelectorAll(".simulator-slot").length===5&&document.querySelectorAll(".simulator-trash").length===5','five physical slot/pile pairs missing');
  await check('window.bellibingEchoSimulator.simulatedEchoSlots(improveUi.simulator).every(slot=>slot===null)&&[...document.querySelectorAll(".simulator-slot .improve-equipped-echo")].every(card=>card.textContent.includes("EMPTY"))&&improveUi.simulator.slots.every(slot=>!slot.candidate&&!slot.accepted.length&&!slot.trash.length)', 'start must have five empty cards and histories');
  await check('JSON.stringify(projectImproveCurrentStats("Augusta"))==='+JSON.stringify(JSON.stringify(stats.empty)),'real Echoes contributed to empty simulated stats');
  for(const [width,height] of [[1440,900],[1920,1080],[2560,1440]]){
    await setViewport(send,width,height);await read('document.getElementById("improveEchoRow").scrollIntoView({block:"center",behavior:"instant"})');await sleep(250);
    await check('document.getElementById("improveCurrentEcho").textContent.includes("Empty slot")&&document.querySelectorAll(".simulator-trash").length===5','empty Current/piles missing');
    await capture(send,'artifacts/ui-preview-echo-simulator-empty-'+width+'x'+height+'.png');
  }
  await setViewport(send,1440,900);
  await click('#improveEchoRow [data-echo-slot="4"]');
  await check('improveUi.simulator.selectedSlot===5&&improveUi.selectedEchoIndex===4','free slot selection failed');
  await click('#improveNewEcho');await waitForUi(send,'echoUi.open&&echoUi.context.kind==="candidate"','New Echo chooser not opened');await sleep(650);
  await click('#echoChoices .echo-choice:not([hidden])');await click('#echoEquip');await waitForUi(send,'!echoUi.open&&!echoUi.closing','Candidate chooser not closed');
  await check('!!improveUi.simulator.slots[4].candidate&&JSON.stringify(improveUi.candidate)==='+JSON.stringify(realCandidate)+'&&document.getElementById("improveHelperTitle").textContent==="Evaluator Pending"','candidate isolation/Pending failed');
  await unchanged('choose candidate mutated real state');
  // Observed checkpoints come from the existing canonical card editor contract.
  // Dispositions are explicit fixtures, never computed from Target or stat quality.
  await read(`window.__simulatorFixture=(disposition,depth=2)=>{
    const model=window.bellibingEchoSimulator;let s=improveUi.simulator;
    if(!s.slots[s.selectedSlot-1].candidate){const item=echoCatalog.find(row=>row.name==='Glommoth');s=model.startSimulatorCandidate(s,{echoId:item.id,selectedSonataSetId:item.sonataSetIds[0]})}
    const identity=s.slots[s.selectedSlot-1].candidate.card,item=echoById.get(identity.echoId);
    for(let index=0;index<=depth;index++){
      const substats=echoStatContract.substats.slice(0,index).map(row=>({name:row.name,value:row.values[0]}));
      s=model.recordSimulatorCheckpoint(s,makeEchoStatCard(item,identity.selectedSonataSetId,{...identity,substats}));
    }
    improveUi.simulator=disposition===null?s:model.applySimulatorDisposition(s,{...model.simulatorCandidateContext(s),disposition,reason:'External test fixture · '+disposition});improveUi.render();
  }`);
  await read('__simulatorFixture("rejected")');await unchanged('reject mutated real state');
  await check('JSON.stringify(improveUi.simulator.slots.map(s=>s.trash.length))==="[0,0,0,0,1]"','reject went to wrong pile');
  await read('__simulatorFixture("rejected",3);__simulatorFixture("rejected",4)');
  await check(`document.querySelector("[data-trash-slot='5']").textContent.includes("×3")&&document.querySelectorAll("[data-trash-slot='5'] .simulator-card-back").length===3`,'stack/count did not grow');
  await click('[data-trash-slot="5"] summary');await click('[data-trash-slot="5"] details button:last-child');
  await check('improveUi.simulator.inspected.slot===5&&document.querySelector(".simulator-inspection").textContent.includes("+10")&&document.querySelector(".simulator-inspection").textContent.includes("External test fixture")','actual older history missing');
  await click('.simulator-inspection button');await check('!improveUi.simulator.inspected&&!document.querySelector(".simulator-inspection")','return failed');
  const slots=await read('JSON.stringify(window.bellibingEchoSimulator.simulatedEchoSlots(improveUi.simulator))');
  await read('__simulatorFixture("accepted")');await unchanged('accept mutated real state');
  await check(`(()=>{const before=JSON.parse(${JSON.stringify(slots)}),after=window.bellibingEchoSimulator.simulatedEchoSlots(improveUi.simulator);return after[4].level===10&&JSON.stringify(before.slice(0,4))===JSON.stringify(after.slice(0,4))&&improveUi.simulator.slots[4].accepted.length===1&&document.getElementById('improveCurrentEcho').textContent.includes('Simulated')})()`,'accept changed wrong slots or Current ownership unclear');
  await click('#improveEchoRow [data-echo-slot="1"]');await read('__simulatorFixture("rejected",1)');
  await check('JSON.stringify(improveUi.simulator.slots.map(s=>s.trash.length))==="[0,1,0,0,3]"','histories cross-contaminated');
  await click('#improveEchoRow [data-echo-slot="4"]');await read('__simulatorFixture(null,1)');
  for(const [width,height] of [[1440,900],[1920,1080],[2560,1440]]){
    await setViewport(send,width,height);await sleep(600);
    await read('document.getElementById("improveEchoRow").scrollIntoView({block:"center",behavior:"instant"})');await sleep(250);
    await check(`(()=>{const columns=[...document.querySelectorAll('.simulator-slot')];return columns.every(column=>{const c=column.querySelector('.improve-equipped-echo').getBoundingClientRect(),p=column.querySelector('.simulator-trash').getBoundingClientRect();return p.top>=c.bottom&&Math.abs(p.x-c.x)<3&&p.width>60&&p.right<=innerWidth&&p.bottom<=innerHeight})})()`,'pile layout/viewport '+width);
    await capture(send,'artifacts/ui-preview-echo-simulator-'+width+'x'+height+'.png');
    await click('[data-trash-slot="5"] summary');await click('[data-trash-slot="5"] details button:last-child');
    await capture(send,'artifacts/ui-preview-echo-simulator-inspect-'+width+'x'+height+'.png');
    await click('.simulator-inspection button');
    await click('[data-trash-slot="5"] summary');
  }
  await check('!document.getElementById("improveBuildCard").innerText.match(/\\b(?:EXP|XP)\\b|Shell Credits|Run 1,000|DPS|combined score/)','fabricated resource/output presentation');
  for(const index of [0,1,2]){
    await click('#improveEchoRow [data-echo-slot="'+index+'"]');await read('__simulatorFixture("accepted")');
    await check('window.bellibingEchoSimulator.simulatedEchoSlots(improveUi.simulator).filter(Boolean).length==='+String(index+2)+'&&window.bellibingEchoSimulator.simulatedEchoSlots(improveUi.simulator)[3]===null&&improveUi.simulator.evaluator.status==="PENDING"','partial build filled empty slots or fabricated evaluator availability');
  }
  await unchanged('partial simulated builds mutated real state');
  // Physical edits against an active populated sandbox must leave every candidate/history/build byte intact.
  const activeSession=await read('JSON.stringify(improveUi.simulator)');
  const activeUnchanged=async message=>{
    await unchanged(message+' mutated real equipment/account');
    await check('JSON.stringify(improveUi.simulator)==='+JSON.stringify(activeSession),message+' reset/changed active simulator session');
    await check('JSON.stringify(Object.keys(localStorage).sort())==='+JSON.stringify(storageKeys),message+' created duplicate settings/session storage');
  };
  for(const [index,[width,height]] of [[1440,900],[1920,1080],[2560,1440]].entries()){
    await setViewport(send,width,height);
    await expand('gate');await enter(resource('echoes'),String(32+index));await enter(resource('tuners'),String(99+index));await enter(resource('premium'),'∞');
    await check(inventoryState+'.echoes.count==='+String(32+index)+'&&'+inventoryState+'.tuners.count==='+String(99+index)+'&&'+inventoryState+'.tubes.premium.kind==="UNLIMITED"','Simulate physical finite and ∞');
    if(await read("!!document.querySelector('[data-focus-key=\"clear:numericTargets\"]')")) await click(focus('clear:numericTargets'));
    if(await read("!!document.querySelector('[data-focus-key=\"reset:echo\"]')")) await click(focus('reset:echo'));
    await check('Object.keys('+policyState+'.overrides).length===0','existing section resets restore shared source defaults');
    await click(focus('gate:'+([10,15,20][index])));await collapse('gate');
    await expand('target');await click('#improveSettings .improve-target-add summary');await click(focus('metric:TOTAL_ENERGY_REGEN'));
    await enter('#improve-target-minimum-TOTAL_ENERGY_REGEN','117.5');await enter('#improve-target-preferred-TOTAL_ENERGY_REGEN','126.25');
    await click('[data-editor-metric="TOTAL_ENERGY_REGEN"] button');await collapse('target');
    await expand('every');await click('[data-setting=every] .improve-echo-row[data-stat-name="CRIT Rate"] .improve-roll-slider');
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'End',code:'End',windowsVirtualKeyCode:35});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'End',code:'End',windowsVirtualKeyCode:35});await collapse('every');
    await expand('flex');await click(focus('flex-count'));
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Home',code:'Home',windowsVirtualKeyCode:36});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Home',code:'Home',windowsVirtualKeyCode:36});
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
    await check(policyState+'.overrides.echoRequirements.groups.find(g=>g.id==="selected-flex").minimumCount===2','Simulate explicit Flex count');
    await click('[data-setting=flex] .improve-echo-row[data-stat-name="ATK%"] .improve-roll-slider');
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'End',code:'End',windowsVirtualKeyCode:35});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'End',code:'End',windowsVirtualKeyCode:35});
    await check(policyState+'.gate==='+String([10,15,20][index])+'&&'+policyState+'.overrides.numericTargets[0].minimum===1.175&&'+policyState+'.overrides.numericTargets[0].preferred===1.2625&&'+policyState+'.overrides.echoRequirements.requiredOnEveryEcho[0].minimum===.105&&'+policyState+'.overrides.echoPreferences[0].minimum===.116','Simulate Target/Gate/Every Echo/Flex canonical edits');
    await activeUnchanged('Simulate settings/resources at '+width);
    await check(`(()=>{const row=document.querySelector('.improve-resources');return row.scrollWidth<=row.clientWidth+1&&row.querySelectorAll('input').length===6&&[...row.querySelectorAll('img')].every(n=>n.complete&&n.naturalWidth===256)&&row.getBoundingClientRect().bottom<=document.querySelector('.improve-resources-separator').getBoundingClientRect().top})()`,'Simulate unchanged resources layout/icons');
    await read('document.querySelector(".improve-resources").scrollIntoView({block:"center",behavior:"instant"})');
    await capture(send,'artifacts/ui-preview-echo-simulator-shared-settings-'+width+'x'+height+'-'+artifactVariant+'.png');await collapse('flex');
  }
  for(const width of [960,640,390]){
    await setViewport(send,width,900);await expand('gate');await enter(resource('echoes'),String(width));await enter(resource('tuners'),'∞');
    await activeUnchanged('narrow Simulate edits at '+width);
    await check('document.querySelector(".improve-resources").scrollWidth<=document.querySelector(".improve-resources").clientWidth+1&&document.querySelector(".improve-resources").getBoundingClientRect().right<=innerWidth','narrow Simulate Resources overflow');
    await collapse('gate');
  }
  await setViewport(send,1440,900);
  sharedPolicy=await read('JSON.stringify('+policyState+')');sharedInventory=await read('JSON.stringify('+inventoryState+')');
  await check('JSON.stringify(JSON.parse(localStorage.getItem('+JSON.stringify(policyKey)+')).resourceInventory)==='+JSON.stringify(sharedInventory)+'&&JSON.stringify(JSON.parse(localStorage.getItem('+JSON.stringify(policyKey)+')).characters.augusta.overrides)===JSON.stringify('+policyState+'.overrides)&&JSON.parse(localStorage.getItem('+JSON.stringify(policyKey)+')).characters.augusta.gate==='+policyState+'.gate&&Object.keys(JSON.parse(localStorage.getItem('+JSON.stringify(policyKey)+'))).sort().join()==="characters,pendingV2Characters,resourceInventory,version"','one canonical v3 envelope, no Simulate-only state');
  await read('improveUi.resetSimulation()');await unchanged('reset mutated real state');await sharedUnchanged('reset lost shared settings/resources');
  await check('improveUi.simulator.slots.every(s=>!s.candidate&&!s.trash.length&&!s.accepted.length)','reset retained histories');
  await check('window.bellibingEchoSimulator.simulatedEchoSlots(improveUi.simulator).every(slot=>slot===null)&&JSON.stringify(projectImproveCurrentStats("Augusta"))==='+JSON.stringify(JSON.stringify(stats.empty)),'reset restored account Echoes or stats');
  await read('improveUi.closeSimulation()');await unchanged('exit mutated real state');await sharedUnchanged('Simulate edits not visible in Current');
  await check('!improveUi.simulator&&JSON.stringify(improveUi.candidate)==='+JSON.stringify(realCandidate)+'&&document.querySelectorAll(".simulator-trash").length===0','exit did not restore Current/Candidate');
  await check('JSON.stringify(projectImproveCurrentStats("Augusta"))==='+JSON.stringify(JSON.stringify(stats.current))+'&&improveWorkspaceSlots("Augusta").every(Boolean)','Current did not restore real equipped build/stats');
  await expand('gate');await enter(resource('basic'),'17');await click(focus('gate:25'));await collapse('gate');
  sharedPolicy=await read('JSON.stringify('+policyState+')');sharedInventory=await read('JSON.stringify('+inventoryState+')');
  await read('improveUi.startSimulation()');await sharedUnchanged('Current edits not visible on re-entry');await read('__simulatorFixture("accepted")');await navigate(send);
  await waitForUi(send,'echoDataLoaded&&window.bellibingEchoSimulator&&releasedCharacters.length===59','reload not ready');
  await check('!improveUi.simulator&&localStorage.getItem(KEY)==='+JSON.stringify(stored),'reload leaked simulated equipment');
  await waitForUi(send,'window.bellibingImproveSettings&&document.getElementById("improveSettings").dataset.sourceStatus!=="LOADING"','Reloaded shared settings not ready');
  await read("show('improve');improvePicker.select('Augusta')");await sharedUnchanged('reload lost canonical shared inputs');
  await read("improveUi.startSimulation();improveUi.setCharacter('Cartethyia')");
  await check(policyState+'.characterId==="cartethyia"&&'+policyState+'.gate===5&&Object.keys('+policyState+'.overrides).length===0&&JSON.stringify('+inventoryState+')==='+JSON.stringify(sharedInventory),'Character policy isolation and Character-independent budget');
  await check('!improveUi.simulator&&improveUi.characterId==="cartethyia"','Character switch retained sandbox');
  await read('improveUi.startSimulation()');await check('improveUi.simulator.evaluator.status==="PENDING"','Cartethyia falsely evaluatable');
  const navigationState=await read('JSON.stringify(state)'),navigationStorage=await read('localStorage.getItem(KEY)');
  await click('.page.active [data-home]');await check('!improveUi.simulator&&JSON.stringify(state)==='+JSON.stringify(navigationState)+'&&localStorage.getItem(KEY)==='+JSON.stringify(navigationStorage),'physical Home exit retained sandbox or wrote real navigation metadata');
  console.log('Shared Current/Simulate editable settings: physical finite/∞, direct Target/Gate/Every Echo/Flex edits and existing section resets, populated session byte isolation, canonical storage, reset/exit/re-entry/reload, Character ownership and desktop/narrow widths passed.');
  console.log('Echo Simulator Foundation: browser isolation, five piles, free slot selection, fixture histories/dispositions, inspection, stack growth, reset/exit/reload and Pending passed at 1440/1920/2560.');
}

export async function verifyEchoSimulatorReview({send,evaluate,setViewport,waitForUi,capture,sleep}) {
  const url=process.env.BELLIBING_SIMULATOR_REVIEW_URL;
  const read=expression=>evaluate(send,expression);
  await setViewport(send,1440,900);await send('Page.navigate',{url});
  await waitForUi(send,'document.getElementById("populated")&&!document.getElementById("populated").disabled','Review fixture not ready',40000);
  const check=async(expression,message)=>{if(!await read(expression))throw new Error('Review fixture: '+message)};
  const frame=expression=>'document.getElementById("preview").contentWindow.eval('+JSON.stringify(expression)+')';
  await check(frame('!!improveUi.simulator&&window.bellibingEchoSimulator.simulatedEchoSlots(improveUi.simulator).every(slot=>slot===null)&&improveUi.simulator.slots.every(slot=>!slot.candidate&&!slot.accepted.length&&!slot.trash.length)'), 'review must initially demonstrate empty simulated build');
  await capture(send,'artifacts/ui-preview-echo-simulator-review-empty-1440x900.png');
  await click('#populated');
  await check(frame('!!improveUi.simulator&&improveUi.simulator.slots[4].trash.length===3&&improveUi.simulator.slots[4].candidate.card.level===5&&window.bellibingEchoSimulator.simulatedEchoSlots(improveUi.simulator)[4].level===10'),'populated actual UI missing');
  await check('localStorage.getItem("bellibing-ui-checkpoint-v34")===null&&localStorage.length===0','review fixture leaked to real storage '+JSON.stringify(await read('Object.keys(localStorage)')));
  async function click(selector,inFrame=false){
    if(inFrame)await read(frame('document.querySelector('+JSON.stringify(selector)+').scrollIntoView({block:"center",behavior:"instant"})'));
    await sleep(350);
    const bounds=await read(inFrame?'(()=>{const iframe=document.getElementById("preview"),f=iframe.getBoundingClientRect(),r=iframe.contentDocument.querySelector('+JSON.stringify(selector)+').getBoundingClientRect();return {x:f.x+r.x+r.width/2,y:f.y+r.y+r.height/2}})()':'(()=>{const r=document.querySelector('+JSON.stringify(selector)+').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()');
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',...bounds});
    await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...bounds});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...bounds});await sleep(180);
  }
  await capture(send,'artifacts/ui-preview-echo-simulator-review-1440x900.png');
  await click('[data-trash-slot="5"] summary',true);await click('[data-trash-slot="5"] details button:last-child',true);
  await check(frame('!!document.querySelector(".simulator-inspection")&&improveUi.simulator.inspected.slot===5'),'physical review inspection missing');
  await capture(send,'artifacts/ui-preview-echo-simulator-review-inspect-1440x900.png');
  await click('.simulator-inspection button',true);await click('#current');
  await check(frame('!improveUi.simulator&&document.querySelectorAll(".simulator-trash").length===0'),'review Current mode missing');
  await click('#populated');await check(frame('improveUi.simulator.slots[4].trash.length===3&&window.bellibingEchoSimulator.simulatedEchoSlots(improveUi.simulator).filter(Boolean).length===1'),'review fixture populated baseline failed');
  await click('#empty');await check(frame('window.bellibingEchoSimulator.simulatedEchoSlots(improveUi.simulator).every(slot=>slot===null)&&improveUi.simulator.slots.every(slot=>!slot.candidate&&!slot.trash.length&&!slot.accepted.length)'), 'review empty reset failed');
  console.log('Source-hosted exact-head review wrapper: actual UI, isolated storage, populated sandbox, physical inspection/return and Current passed.');
}
