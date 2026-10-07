export async function verifyImproveSettings({ send, evaluate, navigate, setViewport, waitForUi, pointerClick, capture, sleep }) {
  const read = expression => evaluate(send, expression);
  const state = 'window.bellibingImproveSettings.getState()';
  const check = async (expression, message) => {
    if (!await read(expression)) throw new Error('Improve Settings: ' + message + ' ' + JSON.stringify(await read(`({state:${state},text:document.getElementById('improveSettings').innerText})`)));
  };
  const click = async selector => {
    // Hover can expand the active input column and move its controls. Settle it
    // before the caller's physical click, then require an actual visible hit.
    await read(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',inline:'center',behavior:'instant'})`);
    const point = await read(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await send('Input.dispatchMouseEvent', { type:'mouseMoved', ...point }); await sleep(600);
    await waitForUi(send, `(()=>{const el=document.querySelector(${JSON.stringify(selector)}),r=el.getBoundingClientRect();return r.width>0&&r.height>0&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))})()`, 'Settings pointer target covered: '+selector);
    await pointerClick(send, selector); await sleep(100);
  };
  const focus = key => '#improveSettings [data-focus-key=' + JSON.stringify(key) + ']';
  const slider = (list, name) => '[data-setting=' + list + '] .improve-echo-row[data-stat-name=' + JSON.stringify(name) + '] .improve-roll-slider';
  const wait = () => waitForUi(send, 'releasedCharacters.length===59&&echoDataLoaded&&document.getElementById("improveSettings").dataset.sourceStatus!=="LOADING"', 'Settings not ready', 15000);
  const settle = async () => { await send('Input.dispatchMouseEvent', {type:'mouseMoved',x:20,y:800}); await sleep(750); };
  const key = async name => {
    const virtual = {ArrowLeft:37,ArrowRight:39,Home:36,End:35}[name];
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:name,code:name,windowsVirtualKeyCode:virtual});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:name,code:name,windowsVirtualKeyCode:virtual}); await sleep(90);
  };
  const enter = async (selector, text) => {
    await click(selector);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'a',code:'KeyA',modifiers:2,windowsVirtualKeyCode:65});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',modifiers:2,windowsVirtualKeyCode:65});
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Backspace',code:'Backspace'});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Backspace',code:'Backspace'});
    if (text) await send('Input.insertText',{text});
  };
  await setViewport(send,1440,900); await navigate(send); await read('localStorage.clear()'); await navigate(send); await wait();
  const source = await read("fetch('assets/improve-settings/sources.json').then(r=>r.json()).then(d=>d.characters.find(c=>c.characterId==='augusta'))");
  await read("addOwned('Augusta');addOwned('Chixia');show('improve');improvePicker.select('Augusta')");
  const artifactVariant = await read("location.pathname.startsWith('/ui-preview/') ? 'built' : 'source'");
  const inventoryState = 'window.bellibingResourceInventory.getState()';
  const resourceInput = id => '#improveSettings [data-resource="'+id+'"] input';
  await check(`document.querySelectorAll('.improve-resources').length===1&&document.querySelectorAll('.improve-resources-separator').length===1&&[...document.querySelectorAll('.improve-resource input')].every(n=>n.hidden)&&[...document.querySelectorAll('.improve-resource-value')].every(n=>!n.hidden)`, 'compact collapsed Resources and existing summaries');
  await click('#improve-setting-gate'); await settle();
  for (const [id,value] of [['echoes','12'],['tuners','∞'],['premium','7'],['advanced','11'],['medium','0'],['basic','unlimited']]) {
    await enter(resourceInput(id),value); await read(`document.querySelector(${JSON.stringify(resourceInput(id))}).blur()`);
  }
  const inventorySaved=await read(`JSON.stringify(${inventoryState})`);
  await check(`${inventoryState}.echoes.count===12&&${inventoryState}.tuners.kind==='UNLIMITED'&&${inventoryState}.tubes.premium.count===7&&${inventoryState}.tubes.advanced.count===11&&${inventoryState}.tubes.medium.count===0&&${inventoryState}.tubes.basic.kind==='UNLIMITED'`, 'six independent inventory counts');
  for (const invalid of ['-1','1.5']) {
    await enter(resourceInput('echoes'),invalid); await read(`document.querySelector(${JSON.stringify(resourceInput('echoes'))}).blur()`);
    await check(`JSON.stringify(${inventoryState})===${JSON.stringify(inventorySaved)}&&document.querySelector(${JSON.stringify(resourceInput('echoes'))}).getAttribute('aria-invalid')==='true'`, 'invalid resource input never saves');
  }
  await enter(resourceInput('echoes'),'12'); await read(`document.querySelector(${JSON.stringify(resourceInput('echoes'))}).blur()`);
  await read("improvePicker.select('Chixia');improvePicker.select('Augusta')");
  await check(`JSON.stringify(${inventoryState})===${JSON.stringify(inventorySaved)}`, 'Character switching retains account-like inventory');
  const realBuild=await read("JSON.stringify(improveBuildState('Augusta'))");
  await click('#simulatorEnter'); await click('#simulatorReset'); await click('#simulatorCurrent');
  await check(`JSON.stringify(${inventoryState})===${JSON.stringify(inventorySaved)}&&JSON.stringify(improveBuildState('Augusta'))===${JSON.stringify(realBuild)}`, 'Current/Simulate/reset preserve inventory and CharacterBuildState');
  await navigate(send); await wait(); await read("show('improve');improvePicker.select('Augusta')");
  await check(`JSON.stringify(${inventoryState})===${JSON.stringify(inventorySaved)}`, 'inventory reload persistence');
  for (const [width,height] of [[1440,900],[1920,1080],[2560,1440]]) {
    await setViewport(send,width,height); await settle();
    await check(`(()=>{const row=document.querySelector('.improve-resources');return row.getBoundingClientRect().height<=40&&row.scrollWidth<=row.clientWidth+1&&[...row.querySelectorAll('input')].every(n=>n.hidden)&&[...row.querySelectorAll('.improve-resource-value')].map(n=>n.textContent).join(',')==='12,∞,7,11,0,∞'})()`, 'compact icon summaries at '+width);
    await read("document.querySelector('.improve-resources').scrollIntoView({block:'center',behavior:'instant'})");
    await capture(send,`artifacts/ui-preview-resources-collapsed-${width}x${height}-${artifactVariant}.png`);
    await click('#improve-setting-every'); await settle();
    await check(`JSON.stringify([...document.querySelectorAll('.improve-setting-label')].map(n=>n.textContent))===JSON.stringify(['Character Target','Gate','Every Echo','Flex Stats'])`, 'four input columns');
    await check(`${state}.presentation.echoPolicy.requirements.status==='PENDING'&&${state}.presentation.echoPolicy.preferences.status==='PENDING'&&document.querySelectorAll('.improve-roll-slider').length>0&&[...document.querySelectorAll('.improve-roll-slider')].every(n=>n.disabled&&n.dataset.status==='PENDING'&&n.getAttribute('aria-valuetext')==='Pending')&&Object.keys(${state}.overrides).length===0`, 'Recommended preserves discrete read-only controls without inferred selections or thresholds');
    await check(`document.querySelector('[data-setting=every] .improve-setting-summary').textContent==='Recommended'&&document.querySelector('[data-setting=flex] .improve-setting-summary').textContent==='Recommended'&&[...document.querySelectorAll('.improve-echo-row')].every(n=>n.scrollWidth<=n.clientWidth+1)`, 'accepted Recommended summaries and row clearance');
    await check(`!JSON.stringify(${state}).includes('checkpointReference')&&!JSON.stringify(${state}).includes('effectivePolicy')`, 'public inspection contract');
    await check(`document.querySelector('[data-setting=flex] .improve-build-need p').textContent==='Pending'`, 'Build Need Pending');
    await check(`(()=>{const row=document.querySelector('.improve-resources'),r=row.getBoundingClientRect(),fields=[...row.querySelectorAll('input')];return r.height<=160&&row.scrollWidth<=row.clientWidth+1&&fields.length===6&&fields.every(n=>!n.hidden)&&document.querySelector('.improve-resource-tubes').querySelectorAll('input').length===4&&!/EXP|Shell Credits/.test(row.innerText)})()`, 'expanded grouped Resources without raw EXP or Credits');
    await check(`(()=>{const root=document.getElementById('improveSettings'),title=root.querySelector('h2'),heading=root.querySelector('.improve-resources h3'),row=root.querySelector('.improve-resource-controls'),separator=root.querySelector('hr'),settings=root.querySelector('.improve-settings-controls');const rect=n=>n.getBoundingClientRect();return rect(title).bottom<=rect(heading).top&&rect(heading).bottom<=rect(row).top&&rect(row).bottom<=rect(separator).top&&rect(separator).bottom<=rect(settings).top&&parseFloat(getComputedStyle(title).fontSize)>parseFloat(getComputedStyle(heading).fontSize)&&parseFloat(getComputedStyle(heading).fontSize)>parseFloat(getComputedStyle(row.querySelector('h4')).fontSize)&&Math.abs(rect(row).left+rect(row).width/2-(rect(root).left+rect(root).width/2))<2})()`, 'Resources heading hierarchy and centered controls');
    await check(`(()=>{const expected=[['tuners','Premium Tuner'],['premium','Premium Sealed Tube'],['advanced','Advanced Sealed Tube'],['medium','Medium Sealed Tube'],['basic','Basic Sealed Tube']];return expected.every(([id,name])=>{const field=document.querySelector('[data-resource="'+id+'"]'),img=field.querySelector('img');return field.title===name&&field.querySelector('input').getAttribute('aria-label')===name+' available count'&&img.complete&&img.naturalWidth===256&&img.alt===''&&img.getAttribute('aria-hidden')==='true'&&new URL(img.src).origin===location.origin&&new URL(img.src).pathname.endsWith('/resource-icons/'+id+'.png')})&&document.querySelectorAll('.improve-resource img').length===5&&!document.querySelector('[data-resource=echoes] img')})()`, 'all five exact item icons load locally with accessible names');
    await check(`fetch('assets/resource-icons/manifest.json').then(r=>r.json()).then(m=>m.assets.map(a=>a.name+':'+a.sourcePath.split('/').pop()).join('|')==='Premium Tuner:T_IconA_txq_03_UI.png|Premium Sealed Tube:T_IconA_13_UI.png|Advanced Sealed Tube:T_IconA_12_UI.png|Medium Sealed Tube:T_IconA_11_UI.png|Basic Sealed Tube:T_IconA_10_UI.png')`, 'source-resolved item-to-texture associations in public artifact');
    await read("document.querySelector('.improve-resources').scrollIntoView({block:'center',behavior:'instant'})");
    await capture(send,`artifacts/ui-preview-resources-expanded-${width}x${height}-${artifactVariant}.png`);
    await capture(send,`artifacts/ui-preview-improve-settings-recommended-${width}x${height}.png`);
    await click(focus('mode:MANUAL')); await check(`Object.keys(${state}.overrides).length===0`, 'Customize alone creates no inputs');
    await click(focus('every:CRIT Rate')); await click(focus('every:CRIT DMG'));
    for (const name of ['ATK%','Energy Regen','Heavy Attack DMG']) await click(focus('flex:'+name));
    await check(`${state}.overrides.echoRequirements.groups.length===0&&${state}.overrides.echoRequirements.requiredOnEveryEcho.length===2&&${state}.overrides.echoPreferences.length===3`, 'explicit user-only Echo inputs');
    await check(`(()=>{const owners=[...document.querySelectorAll('.improve-setting')], root=document.getElementById('improveSettings').getBoundingClientRect();return owners.every((n,i)=>{const r=n.getBoundingClientRect();return r.left>=root.left&&r.right<=root.right&&(!i||owners[i-1].getBoundingClientRect().right<=r.left)})&&[...document.querySelectorAll('.improve-roll-slider')].every(n=>n.getBoundingClientRect().width>=65)&&[...document.querySelectorAll('.improve-echo-row')].every(n=>n.scrollWidth<=n.clientWidth+1)&&document.documentElement.scrollWidth===${width}})()`, 'unchanged column/slider/viewport assertions');
    await click(slider('every','CRIT Rate')); await key('Home');
    const tiers=[.063,.069,.075,.081,.087,.093,.099,.105];
    for (let index=0; index<tiers.length; index++) {
      if(index) await key('ArrowRight');
      await check(`${state}.overrides.echoRequirements.requiredOnEveryEcho.find(r=>r.stat==='CRIT Rate').minimum===${tiers[index]}&&Number(document.querySelector(${JSON.stringify(slider('every','CRIT Rate'))}).value)===${index}`, 'canonical keyboard tier '+index);
    }
    await key('ArrowLeft'); await check(`${state}.overrides.echoRequirements.requiredOnEveryEcho.find(r=>r.stat==='CRIT Rate').minimum===.099`, 'single tier left');
    await key('End'); await check(`${state}.overrides.echoRequirements.requiredOnEveryEcho.find(r=>r.stat==='CRIT Rate').minimum===.105`, 'canonical endpoint');
    await read(`document.querySelector(${JSON.stringify(slider('every','CRIT Rate'))}).scrollIntoView({block:'center',behavior:'instant'})`); await sleep(150);
    const bounds=await read(`document.querySelector(${JSON.stringify(slider('every','CRIT Rate'))}).getBoundingClientRect().toJSON()`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:bounds.right-4,y:bounds.y+bounds.height/2});
    await send('Input.dispatchMouseEvent',{type:'mousePressed',x:bounds.right-4,y:bounds.y+bounds.height/2,button:'left',buttons:1,clickCount:1});
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:bounds.left+4,y:bounds.y+bounds.height/2,button:'left',buttons:1}); await sleep(150);
    await check(`${state}.overrides.echoRequirements.requiredOnEveryEcho.find(r=>r.stat==='CRIT Rate').minimum===.063`, 'physical pointer input updates before release');
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:bounds.left+4,y:bounds.y+bounds.height/2,button:'left',clickCount:1});
    await click(slider('flex','ATK%')); await key('End');
    await check(`${state}.overrides.echoPreferences.find(r=>r.stat==='ATK%').minimum===.116`, 'Flex canonical endpoint');
    await click(focus('every:Energy Regen'));
    await check(`${state}.overrides.echoPreferences.every(r=>r.stat!=='Energy Regen')&&!document.querySelector(${JSON.stringify(slider('flex','Energy Regen'))})&&document.querySelector('[data-setting=flex] [data-stat-name="Energy Regen"] button').disabled`, 'Every Echo/Flex single owner');
    await click(focus('every:Energy Regen')); await click(focus('flex:Energy Regen'));
    const order=await read(`${state}.overrides.echoPreferences.map(r=>r.stat)`);
    const rowSel=name=>'[data-setting=flex] .improve-echo-row[data-stat-name='+JSON.stringify(name)+']';
    await read(`document.querySelector(${JSON.stringify(rowSel(order[0]))}).scrollIntoView({block:'center',behavior:'instant'})`); await sleep(150);
    const rows=await read(`[${JSON.stringify(order[1])},${JSON.stringify(order[0])}].map(name=>document.querySelector('[data-setting=flex] .improve-echo-row[data-stat-name="'+name+'"]').getBoundingClientRect().toJSON())`);
    const from={x:rows[0].x+12,y:rows[0].y+rows[0].height/2},to={x:rows[1].x+12,y:rows[1].y+rows[1].height/2};
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',...from}); await send('Input.dispatchMouseEvent',{type:'mousePressed',...from,button:'left',buttons:1,clickCount:1});
    for (let step=1;step<=10;step++) { await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:from.x+(to.x-from.x)*step/10,y:from.y+(to.y-from.y)*step/10,button:'left',buttons:1}); await sleep(25); }
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',...to,button:'left',clickCount:1}); await sleep(200);
    await check(`JSON.stringify(${state}.overrides.echoPreferences.map(r=>r.stat))===${JSON.stringify(JSON.stringify([order[1],order[0],...order.slice(2)]))}`, 'physical Flex drag order');
    await click('[aria-label='+JSON.stringify('Move '+order[1]+' down')+']');
    await check(`JSON.stringify(${state}.overrides.echoPreferences.map(r=>r.stat))===${JSON.stringify(JSON.stringify(order))}`, 'Move button order');
    const saved=await read(`JSON.stringify(${state})`); await capture(send,`artifacts/ui-preview-improve-settings-customize-${width}x${height}.png`);
    await navigate(send); await wait(); await read("show('improve');improvePicker.select('Augusta')");
    await check(`JSON.stringify(${state})===${JSON.stringify(saved)}`, 'reload input isolation');
    await click('#improve-setting-flex'); await settle(); await click(focus('reset:echo'));
    await check(`${state}.overrides.echoRequirements===undefined&&${state}.overrides.echoPreferences===undefined&&${state}.presentation.echoPolicy.requirements.status==='PENDING'&&document.querySelectorAll('.improve-roll-slider').length===0`, 'reset returns neutral Pending');
    await click(focus('mode:RECOMMENDED')); await click('#improve-setting-flex');
  }
  for (const width of [960,640,390]) {
    await setViewport(send,width,900); await click('#improve-setting-gate'); await settle();
    await check(`(()=>{const row=document.querySelector('.improve-resources'),tubes=row.querySelector('.improve-resource-tubes'),separator=document.querySelector('.improve-resources-separator');return row.scrollWidth<=row.clientWidth+1&&row.getBoundingClientRect().right<=innerWidth&&tubes.scrollWidth<=tubes.clientWidth+1&&tubes.querySelectorAll('input').length===4&&row.getBoundingClientRect().bottom<=separator.getBoundingClientRect().top&&[...row.querySelectorAll('input')].every(n=>n.getBoundingClientRect().width>=80)})()`, 'narrow Resources wrapping without overflow at '+width);
    await read("document.querySelector('.improve-resources').scrollIntoView({block:'center',behavior:'instant'})");
    await capture(send,`artifacts/ui-preview-resources-expanded-${width}x900-${artifactVariant}.png`);
    await click('#improve-setting-gate');
  }
  // Character Target input, validity and source-family presentation remain independent of decisions.
  await setViewport(send,1440,900); await click('#improve-setting-target'); await settle(); await click(focus('mode:MANUAL'));
  await click('#improveSettings .improve-target-add summary'); await click(focus('metric:TOTAL_ENERGY_REGEN'));
  const inputs='[data-editor-metric="TOTAL_ENERGY_REGEN"] input';
  await enter('#improve-target-minimum-TOTAL_ENERGY_REGEN','117.5'); await enter('#improve-target-preferred-TOTAL_ENERGY_REGEN','100');
  await click('[data-editor-metric="TOTAL_ENERGY_REGEN"] button');
  await check(`${state}.overrides.numericTargets===undefined&&document.querySelector('[data-editor-metric="TOTAL_ENERGY_REGEN"] [role=alert]').hidden===false`, 'invalid preferred value does not save');
  await enter('#improve-target-preferred-TOTAL_ENERGY_REGEN','126.25'); await click('[data-editor-metric="TOTAL_ENERGY_REGEN"] button');
  await check(`${state}.overrides.numericTargets[0].minimum===1.175&&${state}.overrides.numericTargets[0].preferred===1.2625&&${state}.presentation.characterTarget.numericTargets.status==='USER_DEFINED'`, 'exact numeric round trip');
  await read("improveUi.setCharacter('Chixia')"); await check(`${state}.overrides.numericTargets===undefined&&${state}.mode==='RECOMMENDED'`, 'Character isolation');
  await read("improveUi.setCharacter('Augusta')");
  try {
    await send('Network.enable'); await send('Network.setBlockedURLs',{urls:['*improve-settings/policies.json*']});
    await navigate(send); await wait(); await read("show('improve');improvePicker.select('Augusta')");
    await check(`${state}.overrides.numericTargets[0].minimum===1.175&&${state}.presentation.characterTarget.numericTargets.status==='PENDING'`, 'source outage suspends retained input');
  } finally { await send('Network.setBlockedURLs',{urls:[]}); }
  await navigate(send); await wait(); await read("show('improve');improvePicker.select('Augusta')");
  await check(`${state}.presentation.characterTarget.numericTargets.status==='USER_DEFINED'`, 'source recovery');
  const binding=JSON.stringify(['augusta',source.presetId,source.profileId,source.provenance,source.stats]);
  for(const [mode,activeStats] of [['MANUAL',['CRIT DMG','CRIT Rate']],['MANUAL',[]],['RECOMMENDED',[]]]) {
    const legacy={version:2,characters:{augusta:{schemaVersion:2,characterId:'augusta',gate:15,rollQuality:'Mid+',valuableStats:{schemaVersion:2,presetId:source.presetId,profileId:source.profileId,sourceBinding:binding,orderingMode:mode,activeStats}}}};
    const raw=JSON.stringify(legacy);
    await read(`localStorage.removeItem('bellibing.improve.policy.v3');localStorage.setItem('bellibing.improve.simple-settings.v2',${JSON.stringify(raw)})`);
    await navigate(send); await wait(); await read("show('improve');improvePicker.select('Augusta')");
    await check(`${state}.mode===${JSON.stringify(mode)}&&${state}.gate===15&&localStorage.getItem('bellibing.improve.simple-settings.v2')===${JSON.stringify(raw)}&&${state}.overrides.echoRequirements===undefined&&${state}.overrides.numericTargets===undefined`, 'v2 intent/recovery copy');
    if(mode==='MANUAL') await check(`JSON.stringify(${state}.overrides.echoPreferences.map(r=>r.stat))===${JSON.stringify(JSON.stringify(activeStats))}`, 'v2 order/empty preserved');
    else await check(`Object.keys(${state}.overrides).length===0&&${state}.presentation.echoPolicy.requirements.status==='PENDING'`, 'v2 Recommended remains Pending');
  }
  await click('#improve-setting-every'); await settle(); await click(focus('mode:MANUAL')); await click(focus('flex:ATK%'));
  const originalBinding=await read(`${state}.contextBinding`);
  await read(`(()=>{const key='bellibing.improve.policy.v3',s=JSON.parse(localStorage.getItem(key));s.characters.augusta.contextBinding='changed-context';localStorage.setItem(key,JSON.stringify(s))})()`);
  await navigate(send); await wait(); await read("show('improve');improvePicker.select('Augusta')");
  await check(`${state}.compatibility.status==='REVIEW_REQUIRED'&&${state}.overrides.echoPreferences[0].stat==='ATK%'&&${state}.presentation.echoPolicy.preferences.status==='PENDING'&&!document.querySelector('.improve-policy-review').hidden`, 'context drift suspends original input');
  await read(`(()=>{const key='bellibing.improve.policy.v3',s=JSON.parse(localStorage.getItem(key));s.characters.augusta.contextBinding=${JSON.stringify(originalBinding)};localStorage.setItem(key,JSON.stringify(s))})()`);
  await navigate(send); await wait(); await read("show('improve');improvePicker.select('Augusta')");
  await check(`${state}.presentation.echoPolicy.preferences.status==='USER_DEFINED'`, 'matching context recovery');
  await check(`(()=>{const s=${state};s.overrides.echoPreferences.length=0;return ${state}.overrides.echoPreferences.length===1})()`, 'detached public view');
  console.log('PASS public Improve Pending/input/source/persistence/physical-pointer/geometry regression at three desktop sizes');
}
