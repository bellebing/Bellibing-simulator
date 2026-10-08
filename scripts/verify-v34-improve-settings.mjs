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
    const virtual = {ArrowLeft:37,ArrowRight:39,ArrowDown:40,Enter:13,Home:36,End:35}[name];
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
  await read("addOwned('Augusta');addOwned('Chixia');['Sigillum','Twin Nova: Collapsar Blade','Glommoth','Iceglint Dancer','Shadow Stepper'].forEach((name,index)=>{const item=echoCatalog.find(row=>row.name===name);commitEchoSlot('Augusta',index,makeEchoStatCard(item,item.sonataSetIds[0]))});show('improve');improvePicker.select('Augusta')");
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
  let realBuild=await read("JSON.stringify(improveBuildState('Augusta'))");
  await click('#simulatorEnter'); await click('#simulatorReset'); await click('#simulatorCurrent');
  await check(`JSON.stringify(${inventoryState})===${JSON.stringify(inventorySaved)}&&JSON.stringify(improveBuildState('Augusta'))===${JSON.stringify(realBuild)}`, 'Current/Simulate/reset preserve inventory and CharacterBuildState');
  await navigate(send); await wait(); await read("show('improve');improvePicker.select('Augusta')");
  await check(`JSON.stringify(${inventoryState})===${JSON.stringify(inventorySaved)}`, 'inventory reload persistence');
  realBuild=await read("JSON.stringify(improveBuildState('Augusta'))");
  const card = name => '#improveSettings .improve-stat-card[data-stat-name=' + JSON.stringify(name) + ']';
  const cardSlider = name => card(name) + ' .improve-roll-slider';
  const savedCard = name => `${state}.overrides.echoCards.cards.find(r=>r.stat===${JSON.stringify(name)})`;
  const move = async (name, category) => {
    await click(card(name) + ' select'); await key('Home');
    for (let step=0;step<category;step++) await key('ArrowDown');
    await key('Enter'); await sleep(150);
  };
  for (const [width,height] of [[1440,900],[1920,1080],[2560,1440]]) {
    await setViewport(send,width,height); await click('#improve-setting-every'); await settle();
    // Character selection updates lastImprovedAt; bind the equipment snapshot to this interaction pass.
    realBuild=await read("JSON.stringify(improveBuildState('Augusta'))");
    await check(`JSON.stringify([...document.querySelectorAll('.improve-setting-label')].map(n=>n.textContent))===JSON.stringify(['Target','Gate','Hard Requirements','Any Of','Not Important'])`, 'five input columns');
    await check(`(()=>{const root=document.getElementById('improveSettings');return [root,...root.querySelectorAll('*')].filter(n=>n.getClientRects().length&&getComputedStyle(n).visibility==='visible').every(n=>getComputedStyle(root).fontFamily.startsWith('Etna')&&getComputedStyle(n).fontFamily===getComputedStyle(root).fontFamily)})()`, 'all visible settings text and native controls use the existing display font');
    await check(`(()=>{const root=document.getElementById('improveSettings'),labels=[...root.querySelectorAll('.improve-setting-label')];return labels.every(n=>{const r=n.getBoundingClientRect(),owner=n.closest('.improve-setting').getBoundingClientRect(),style=getComputedStyle(n);return style.textAlign==='center'&&Math.abs(r.left+r.width/2-owner.left-owner.width/2)<1&&parseFloat(style.fontSize)>parseFloat(getComputedStyle(n.nextElementSibling).fontSize)})&&root.querySelectorAll('.improve-settings-heading [aria-label="Improve policy mode"]').length===1&&[...root.querySelectorAll('.improve-policy-section h3')].every(n=>getComputedStyle(n).textAlign!=='center')})()`, 'centered column title hierarchy and left-aligned inner headings');
    await check(`(()=>{const tubes=document.querySelector('.improve-resource-tubes');return tubes.querySelectorAll('img').length===4&&tubes.querySelectorAll('input').length===4&&[...tubes.querySelectorAll('.improve-resource-label')].every(n=>getComputedStyle(n).display==='none')&&!/Gold|Purple|Blue|Green/.test(tubes.innerText)})()`, 'expanded Tube icons and inputs without visible color captions');
    await check(`JSON.stringify([...document.querySelectorAll('[data-setting=gate] .improve-setting-choice')].map(n=>n.textContent))===JSON.stringify(['+5','+10','+15','+20','+25'])`, 'unchanged Gate checkpoints');
    await check(`!JSON.stringify(${state}).includes('checkpointReference')&&!JSON.stringify(${state}).includes('effectivePolicy')`, 'public inspection contract');
    await check(`(()=>{const row=document.querySelector('.improve-resources'),r=row.getBoundingClientRect(),fields=[...row.querySelectorAll('input')];return r.height<=160&&row.scrollWidth<=row.clientWidth+1&&fields.length===6&&fields.every(n=>!n.hidden)&&document.querySelector('.improve-resource-tubes').querySelectorAll('input').length===4&&!/EXP|Shell Credits/.test(row.innerText)})()`, 'expanded grouped Resources without raw EXP or Credits');
    await check(`(()=>{const root=document.getElementById('improveSettings'),title=root.querySelector('h2'),heading=root.querySelector('.improve-resources h3'),row=root.querySelector('.improve-resource-controls'),separator=root.querySelector('hr'),settings=root.querySelector('.improve-settings-controls');const rect=n=>n.getBoundingClientRect();return rect(title).bottom<=rect(heading).top&&rect(heading).bottom<=rect(row).top&&rect(row).bottom<=rect(separator).top&&rect(separator).bottom<=rect(settings).top&&parseFloat(getComputedStyle(title).fontSize)>parseFloat(getComputedStyle(heading).fontSize)&&parseFloat(getComputedStyle(heading).fontSize)>parseFloat(getComputedStyle(row.querySelector('h4')).fontSize)&&Math.abs(rect(row).left+rect(row).width/2-(rect(root).left+rect(root).width/2))<2})()`, 'Resources heading hierarchy and centered controls');
    await check(`(()=>{const expected=[['tuners','Premium Tuner'],['premium','Premium Sealed Tube'],['advanced','Advanced Sealed Tube'],['medium','Medium Sealed Tube'],['basic','Basic Sealed Tube']];return expected.every(([id,name])=>{const field=document.querySelector('[data-resource="'+id+'"]'),img=field.querySelector('img');return field.title===name&&field.querySelector('input').getAttribute('aria-label')===name+' available count'&&img.complete&&img.naturalWidth===256&&img.alt===''&&img.getAttribute('aria-hidden')==='true'&&new URL(img.src).origin===location.origin&&new URL(img.src).pathname.endsWith('/resource-icons/'+id+'.png')})&&document.querySelectorAll('.improve-resource img').length===5&&!document.querySelector('[data-resource=echoes] img')})()`, 'all five exact item icons load locally with accessible names');
    await check(`fetch('assets/resource-icons/manifest.json').then(r=>r.json()).then(m=>m.assets.map(a=>a.name+':'+a.sourcePath.split('/').pop()).join('|')==='Premium Tuner:T_IconA_txq_03_UI.png|Premium Sealed Tube:T_IconA_13_UI.png|Advanced Sealed Tube:T_IconA_12_UI.png|Medium Sealed Tube:T_IconA_11_UI.png|Basic Sealed Tube:T_IconA_10_UI.png')`, 'source-resolved item-to-texture associations in public artifact');
    await check(`${state}.presentation.echoPolicy.requirements.status==='PENDING'&&${state}.overrides.echoCards===undefined&&document.querySelector('[data-setting=other]').innerText.includes('unsupported')`, 'unsupported recommendations remain separate from manual tiers');
    await check(`(()=>{const rows=[...document.querySelectorAll('.improve-stat-card')];return rows.length===13&&new Set(rows.map(n=>n.dataset.statName)).size===13&&rows.every(n=>!n.querySelector('input').disabled&&n.querySelector('output').textContent!=='Pending')})()`, 'every stat exactly once with editable canonical minimum');
    await check(`(()=>{const owners=[...document.querySelectorAll('.improve-setting')],r=owners.slice(2).map(n=>n.getBoundingClientRect());return Math.max(...r.map(n=>n.width))-Math.min(...r.map(n=>n.width))<1&&owners.every((n,i)=>!i||owners[i-1].getBoundingClientRect().right<=n.getBoundingClientRect().left)&&document.documentElement.scrollWidth===innerWidth&&[...document.querySelectorAll('.improve-stat-card')].every(n=>n.scrollWidth<=n.clientWidth+1)&&[...document.querySelectorAll('.improve-stat-card input')].every(n=>n.getBoundingClientRect().width>=65)})()`, 'equal stat columns and unclipped controls');
    await click(cardSlider('CRIT Rate')); await key('Home');
    const tiers=[.063,.069,.075,.081,.087,.093,.099,.105];
    for (let index=0;index<tiers.length;index++) {
      if(index) await key('ArrowRight');
      await check(`${savedCard('CRIT Rate')}.minimum===${tiers[index]}&&${state}.mode==='MANUAL'&&${savedCard('CRIT Rate')}.category==='NOT_IMPORTANT'`, 'editable grey card canonical tier '+index);
    }
    for (const category of [0,1,2,0]) {
      await move('CRIT Rate',category);
      await check(`${savedCard('CRIT Rate')}.minimum===.105&&document.querySelectorAll(${JSON.stringify(card('CRIT Rate'))}).length===1`, 'category move preserves minimum and identity');
    }
    await move('CRIT DMG',0);
    for (const name of ['ATK%','Energy Regen','Heavy Attack DMG','Skill DMG']) await move(name,1);
    await click(cardSlider('CRIT Rate')); await key('Home'); await key('End');
    await click(cardSlider('ATK%')); await key('End');
    await check(`${savedCard('ATK%')}.minimum===.116&&${savedCard('CRIT Rate')}.minimum===.105`, 'active category sliders edit exact endpoints');
    await click(focus('any-count')); await key('End');
    await check(`${state}.overrides.echoCards.anyOfMinimumCount===3&&${state}.presentation.echoPolicy.requirements.value.groups[0].minimumCount===3`, 'Any Of bounded by three remaining legal slots');
    await move('ATK%',2); await move('Skill DMG',2);
    await check(`${state}.overrides.echoCards.anyOfMinimumCount===3&&${state}.presentation.echoPolicy.requirements.status==='PENDING'&&document.querySelector('[data-setting=flex] [role=alert]')`, 'impossible pool change retains choice with clear validation');
    await click(focus('any-count')); await key('Home');
    await move('ATK%',1); await move('Skill DMG',1);
    // Physical range drag updates user input before release.
    await read(`document.querySelector(${JSON.stringify(cardSlider('CRIT Rate'))}).scrollIntoView({block:'center',behavior:'instant'})`); await sleep(150);
    const bounds=await read(`document.querySelector(${JSON.stringify(cardSlider('CRIT Rate'))}).getBoundingClientRect().toJSON()`);
    const right={x:bounds.right-4,y:bounds.y+bounds.height/2},left={x:bounds.left+4,y:bounds.y+bounds.height/2};
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',...right}); await send('Input.dispatchMouseEvent',{type:'mousePressed',...right,button:'left',buttons:1,clickCount:1});
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',...left,button:'left',buttons:1}); await sleep(100);
    await check(`${savedCard('CRIT Rate')}.minimum===.063`, 'physical pointer drag commits before release');
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',...left,button:'left',clickCount:1});
    const saved=await read(`JSON.stringify(${state})`);
    await read("document.getElementById('improveSettings').scrollIntoView({block:'start',behavior:'instant'})"); await sleep(500);
    await capture(send,`artifacts/ui-preview-improve-settings-customize-${width}x${height}-${artifactVariant}.png`);
    await click('#simulatorEnter'); await check(`JSON.stringify(${state})===${JSON.stringify(saved)}`, 'Current/Simulate share settings');
    await click(cardSlider('CRIT DMG')); await key('End');
    const shared=await read(`JSON.stringify(${state})`);
    await click('#simulatorCurrent'); await check(`JSON.stringify(${state})===${JSON.stringify(shared)}`, 'Simulate edits preserve shared settings');
    await check(`JSON.stringify(improveBuildState('Augusta'))===${JSON.stringify(realBuild)}`, 'Simulate edits preserve equipped Echoes');
    await check(`JSON.stringify(${inventoryState})===${JSON.stringify(inventorySaved)}`, 'Simulate edits preserve Resources');
    await read("improvePicker.select('Chixia')"); await check(`${state}.overrides.echoCards===undefined`, 'Character isolation');
    await read("improvePicker.select('Augusta')"); await check(`JSON.stringify(${state})===${JSON.stringify(shared)}`, 'Character restore');
    await navigate(send); await wait(); await read("show('improve');improvePicker.select('Augusta')");
    await check(`JSON.stringify(${state})===${JSON.stringify(shared)}`, 'save/reload round trip');
    await click('#improve-setting-other'); await settle(); await click(focus('reset:echo'));
    await check(`${state}.mode==='RECOMMENDED'&&Object.keys(${state}.overrides).length===0&&document.querySelectorAll('.improve-stat-card').length===13&&[...document.querySelectorAll('.improve-stat-card input')].every(n=>!n.disabled)`, 'reset restores source state and editable manual tiers');
    await read("document.querySelector('.improve-resources').scrollIntoView({block:'start',behavior:'instant'})"); await capture(send,`artifacts/ui-preview-improve-settings-recommended-${width}x${height}-${artifactVariant}.png`);
    await click('#improve-setting-gate');
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
  await click('#improve-setting-every'); await settle(); await click(focus('mode:MANUAL')); await move('ATK%',1);
  const originalBinding=await read(`${state}.contextBinding`);
  await read(`(()=>{const key='bellibing.improve.policy.v3',s=JSON.parse(localStorage.getItem(key));s.characters.augusta.contextBinding='changed-context';localStorage.setItem(key,JSON.stringify(s))})()`);
  await navigate(send); await wait(); await read("show('improve');improvePicker.select('Augusta')");
  await check(`${state}.compatibility.status==='REVIEW_REQUIRED'&&${savedCard('ATK%')}.category==='ANY'&&${state}.compatibility.suspendedSections.includes('echoCards')&&!document.querySelector('.improve-policy-review').hidden`, 'context drift suspends original input');
  await read(`(()=>{const key='bellibing.improve.policy.v3',s=JSON.parse(localStorage.getItem(key));s.characters.augusta.contextBinding=${JSON.stringify(originalBinding)};localStorage.setItem(key,JSON.stringify(s))})()`);
  await navigate(send); await wait(); await read("show('improve');improvePicker.select('Augusta')");
  await check(`${state}.presentation.echoPolicy.requirements.status==='USER_DEFINED'`, 'matching context recovery');
  await check(`(()=>{const s=${state};s.overrides.echoCards.cards.length=0;return ${state}.overrides.echoCards.cards.length===13})()`, 'detached public view');
  console.log('PASS public Improve Pending/input/source/persistence/physical-pointer/geometry regression at three desktop sizes');
}
