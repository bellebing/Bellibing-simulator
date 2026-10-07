// Test/dev-only observations and external dispositions, injected into an isolated
// browser profile. This file is never copied to the public browser artifact.
export async function verifyEchoSimulator({send,evaluate,navigate,setViewport,waitForUi,pointerClick,capture,sleep}) {
  const read = expression => evaluate(send,expression);
  const check = async (expression,message) => { if (!await read(expression)) throw new Error('Echo Simulator: '+message); };
  const click = async selector => {
    await read(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:10,y:10});await sleep(500);await pointerClick(send,selector);
  };
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
  await capture(send,'artifacts/ui-preview-echo-simulator-current-1440x900.png');
  await click('#simulatorEnter');await unchanged('start mutated real state');
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
  await click('#simulatorReset');await unchanged('reset mutated real state');
  await check('improveUi.simulator.slots.every(s=>!s.candidate&&!s.trash.length&&!s.accepted.length)','reset retained histories');
  await check('window.bellibingEchoSimulator.simulatedEchoSlots(improveUi.simulator).every(slot=>slot===null)&&JSON.stringify(projectImproveCurrentStats("Augusta"))==='+JSON.stringify(JSON.stringify(stats.empty)),'reset restored account Echoes or stats');
  await click('#simulatorCurrent');await unchanged('exit mutated real state');
  await check('!improveUi.simulator&&JSON.stringify(improveUi.candidate)==='+JSON.stringify(realCandidate)+'&&document.querySelectorAll(".simulator-trash").length===0','exit did not restore Current/Candidate');
  await check('JSON.stringify(projectImproveCurrentStats("Augusta"))==='+JSON.stringify(JSON.stringify(stats.current))+'&&improveWorkspaceSlots("Augusta").every(Boolean)','Current did not restore real equipped build/stats');
  await click('#simulatorEnter');await read('__simulatorFixture("accepted")');await navigate(send);
  await waitForUi(send,'echoDataLoaded&&window.bellibingEchoSimulator&&releasedCharacters.length===59','reload not ready');
  await check('!improveUi.simulator&&localStorage.getItem(KEY)==='+JSON.stringify(stored),'reload leaked simulated equipment');
  await read("show('improve');improvePicker.select('Augusta');improveUi.startSimulation();improveUi.setCharacter('Cartethyia')");
  await check('!improveUi.simulator&&improveUi.characterId==="cartethyia"','Character switch retained sandbox');
  await click('#simulatorEnter');await check('improveUi.simulator.evaluator.status==="PENDING"','Cartethyia falsely evaluatable');
  const navigationState=await read('JSON.stringify(state)'),navigationStorage=await read('localStorage.getItem(KEY)');
  await click('.page.active [data-home]');await check('!improveUi.simulator&&JSON.stringify(state)==='+JSON.stringify(navigationState)+'&&localStorage.getItem(KEY)==='+JSON.stringify(navigationStorage),'physical Home exit retained sandbox or wrote real navigation metadata');
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
