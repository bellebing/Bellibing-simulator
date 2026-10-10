export async function verifyImproveSettings({ send, evaluate, navigate, setViewport, waitForUi, pointerClick, capture, sleep }) {
  await verifyImproveSonataSettings({ send, evaluate, navigate, setViewport, waitForUi, pointerClick, capture, sleep });
  const read = expression => evaluate(send, expression);
  const state = 'window.bellibingImproveSettings.getState()';
  const check = async (expression, message) => {
    if (!await read(expression)) throw new Error('Improve Settings: ' + message + ' ' + JSON.stringify(await read(`({state:${state},text:document.getElementById('improveSettings').innerText})`)));
  };
  const click = async selector => {
    if(selector.includes('mode:')&&!await read('document.querySelector(".improve-mode-actions").open'))await click('.improve-mode-actions summary');
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
    const virtual = {ArrowLeft:37,ArrowRight:39,ArrowUp:38,ArrowDown:40,Home:36,End:35}[name];
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:name,code:name,windowsVirtualKeyCode:virtual});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:name,code:name,windowsVirtualKeyCode:virtual}); await sleep(90);
  };
  const alt = async (name, arrow) => {
    await click(focus('handle:'+name));
    const virtual = {ArrowLeft:37,ArrowRight:39,ArrowUp:38,ArrowDown:40}[arrow];
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:arrow,code:arrow,modifiers:1,windowsVirtualKeyCode:virtual});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:arrow,code:arrow,modifiers:1,windowsVirtualKeyCode:virtual}); await sleep(120);
    await check(`document.activeElement.dataset.focusKey===${JSON.stringify('handle:'+name)}`, 'keyboard retains moved handle focus');
  };
  const dragRow = async (name, target) => {
    const handle=focus('handle:'+name);
    await read(`document.querySelector(${JSON.stringify(handle)}).scrollIntoView({block:'center',behavior:'instant'})`); await sleep(600);
    const hover=await read(`(()=>{const r=document.querySelector(${JSON.stringify(handle)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',...hover}); await sleep(600);
    const points=await read(`(()=>{const a=document.querySelector(${JSON.stringify(handle)}).getBoundingClientRect(),b=document.querySelector(${JSON.stringify(target)}).getBoundingClientRect();return[{x:a.x+a.width/2,y:a.y+a.height/2},{x:b.x+b.width/2,y:b.y+Math.min(b.height/2,16)}]})()`);
    const [from,to]=points;
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',...from}); await send('Input.dispatchMouseEvent',{type:'mousePressed',...from,button:'left',buttons:1,clickCount:1});
    for(let step=1;step<=15;step++){await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:from.x+(to.x-from.x)*step/15,y:from.y+(to.y-from.y)*step/15,button:'left',buttons:1});await sleep(25);}
    await sleep(150); await send('Input.dispatchMouseEvent',{type:'mouseMoved',...to,button:'left',buttons:1}); await sleep(150);
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',...to,button:'left',clickCount:1}); await sleep(200);
  };
  const rowsUnique = async () => check(`(()=>{const rows=[...document.querySelectorAll('.improve-echo-row')],names=rows.map(n=>n.dataset.statName);return names.length===13&&new Set(names).size===13&&rows.every(n=>n.draggable&&n.querySelector('.improve-policy-handle').textContent==='≡')&&document.querySelectorAll('[data-echo-section=other] .improve-roll-slider').length===0&&JSON.stringify(rows.filter(n=>n.classList.contains('is-recommended')).map(n=>n.dataset.statName).sort())===JSON.stringify(['CRIT Rate','CRIT DMG','Energy Regen','ATK%','Heavy Attack DMG'].sort())})()`, '13 unique always-draggable rows, no other sliders, stable approved guidance');
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
  await check(`JSON.stringify([...document.querySelectorAll('[data-echo-section=every] .improve-echo-row')].map(n=>n.dataset.statName))===JSON.stringify(['CRIT Rate','CRIT DMG'])&&JSON.stringify([...document.querySelectorAll('[data-echo-section=flex] .improve-echo-row')].map(n=>n.dataset.statName))===JSON.stringify(['ATK%','Heavy Attack DMG','Energy Regen','Flat ATK'])&&document.querySelectorAll('[data-echo-section=other] .improve-echo-row').length===7`, 'fresh approved Augusta placement and exact order');
  await check(`fetch('assets/improve-settings/policies.json').then(r=>r.json()).then(d=>{const p=d.characters.find(c=>c.characterId==='augusta');return ${state}.mode==='RECOMMENDED'&&Object.keys(${state}.overrides).length===0&&p.echoPolicy.requirements.status==='PENDING'&&p.echoPolicy.preferences.status==='PENDING'})`, 'approved user defaults leave provider readiness Pending');
  await click('#improve-setting-every');
  await check(`document.querySelector('.improve-flex-count output').textContent==='At least 1 of 4'&&document.querySelector('[data-focus-key="flex-count"]').max==='3'`, 'default explicit Flex count and feasible range');
  await click(focus('flex-count')); await key('Home'); await key('ArrowRight');
  await check(`${state}.overrides.echoRequirements.groups.find(g=>g.id==='selected-flex').minimumCount===2&&document.querySelector('.improve-flex-count output').textContent==='At least 2 of 4'`, 'physical count slider and keyboard 1-to-2');
  const counted = await read(`JSON.stringify(${state}.overrides)`);
  await navigate(send); await wait(); await read("show('improve');improvePicker.select('Chixia')");
  await check(`!${state}.presentation.echoPolicy.requirements.value?.groups?.some(g=>g.minimumCount!==undefined)`, 'count does not leak to another Character');
  await read("improvePicker.select('Augusta')");
  await check(`JSON.stringify(${state}.overrides)===${JSON.stringify(counted)}`, 'count reload and Character switching');
  await click('#improve-setting-every');
  await dragRow('Flat ATK','[data-echo-section=other]'); await dragRow('Energy Regen','[data-echo-section=other]'); await dragRow('Heavy Attack DMG','[data-echo-section=other]');
  await check(`${state}.overrides.echoRequirements.groups.find(g=>g.id==='selected-flex').minimumCount===2&&document.querySelector('[data-focus-key="flex-count"]').getAttribute('aria-invalid')==='true'&&document.querySelector('.improve-flex-count output').textContent.includes('Saved count 2')`, 'drag invalidation preserves count and shows validation');
  await dragRow('ATK%','[data-echo-section=other]');
  await check(`document.querySelector('.improve-flex-count output').textContent.includes('Flex pool empty')&&!document.querySelector('.improve-flex-count output').textContent.includes('of 0')`, 'empty pool is explicit without 1-of-0');
  await dragRow('ATK%','[data-echo-section=flex]'); await dragRow('Heavy Attack DMG','[data-echo-section=flex]');
  await click(focus('flex-count')); await key('Home');
  await check(`${state}.overrides.echoRequirements.groups.find(g=>g.id==='selected-flex').minimumCount===1`, 'count 2-to-1 after pool recovery');
  await click(focus('mode:RECOMMENDED'));
  await click(slider('every','CRIT Rate')); await key('End');
  await check(`${state}.mode==='MANUAL'&&${state}.overrides.echoRequirements.requiredOnEveryEcho.find(r=>r.stat==='CRIT Rate').minimum===.105&&${state}.overrides.echoPreferences.length===4`, 'first default slider edit is immediately editable and preserves untouched defaults');
  await click(focus('mode:RECOMMENDED')); await click('#improve-setting-every'); await settle();
  // Inactive rows can also be moved directly from Recommended without selecting them.
  await click('#improve-setting-flex'); if (!await read("document.querySelector('.improve-other-stats').open")) await click('.improve-other-stats summary');
  await dragRow('Flat HP', '[data-echo-section=every]');
  await check(`${state}.mode==='MANUAL'&&${state}.overrides.echoRequirements.requiredOnEveryEcho.some(r=>r.stat==='Flat HP')&&!!document.querySelector('.improve-echo-row[data-stat-name="Flat HP"] .improve-roll-slider')`, 'Recommended inactive other-to-Hard drag immediately activates the stat');
  await click(focus('mode:RECOMMENDED')); await click('#improve-setting-flex');
  for (const [width,height] of [[1440,900],[1920,1080],[2560,1440]]) {
    await setViewport(send,width,height); await settle();
    await check(`(()=>{const row=document.querySelector('.improve-resources');return row.getBoundingClientRect().height<=40&&row.scrollWidth<=row.clientWidth+1&&[...row.querySelectorAll('input')].every(n=>n.hidden)&&[...row.querySelectorAll('.improve-resource-value')].map(n=>n.textContent).join(',')==='12,∞,7,11,0,∞'})()`, 'compact icon summaries at '+width);
    await check(`JSON.stringify([...document.querySelectorAll('.improve-resource-tubes .improve-resource-label')].map(n=>n.innerText))===JSON.stringify(['Gold','Purple','Blue','Green'])`, 'collapsed visible Tube denomination names');
    await read("document.querySelector('.improve-resources').scrollIntoView({block:'center',behavior:'instant'})");
    await capture(send,`artifacts/ui-preview-resources-collapsed-${width}x${height}-${artifactVariant}.png`);
    await click('#improve-setting-every'); await settle();
    await check(`JSON.stringify([...document.querySelectorAll('.improve-setting-label')].map(n=>n.textContent))===JSON.stringify(['Sonata Sets','Gate','Hard Requirements','Flex Stats','Character Target'])`, 'five input columns');
    await check(`(()=>{const root=document.getElementById('improveSettings');return !/Every Echo|Recommended Character Stats/.test(root.innerText)&&root.querySelector('[data-setting=target] h3').textContent==='Character Stats'&&[...root.querySelectorAll('h3,h4')].every(n=>!n.textContent.includes('Recommended'))})()`, 'presentation wording without duplicate Recommended headings');
    await check(`(()=>{const root=document.getElementById('improveSettings');return getComputedStyle(root).fontFamily.startsWith('Etna')&&[...root.querySelectorAll('.improve-setting-label')].every(n=>getComputedStyle(n).fontFamily.startsWith('Etna'))&&[...root.querySelectorAll('.improve-echo-row,.improve-recommended-stat')].every(n=>getComputedStyle(n).fontFamily.startsWith('Inter'))})()`, 'Etna headings and readable Inter stat rows');
    await check(`(()=>{const root=document.getElementById('improveSettings'),labels=[...root.querySelectorAll('.improve-setting-label')];return labels.every(n=>{const r=n.getBoundingClientRect(),owner=n.closest('.improve-setting').getBoundingClientRect(),style=getComputedStyle(n);return style.textAlign==='center'&&Math.abs(r.left+r.width/2-owner.left-owner.width/2)<1&&parseFloat(style.fontSize)>parseFloat(getComputedStyle(n.nextElementSibling).fontSize)})&&root.querySelectorAll('.improve-settings-heading button').length===0&&root.querySelectorAll('.improve-mode-actions [aria-label="Improve policy mode"]').length===1&&[...root.querySelectorAll('.improve-policy-section h3')].every(n=>getComputedStyle(n).textAlign!=='center')})()`, 'centered column title hierarchy and left-aligned inner headings');
    await check(`(()=>{const tubes=document.querySelector('.improve-resource-tubes');return tubes.querySelectorAll('img').length===4&&tubes.querySelectorAll('input').length===4&&[...tubes.querySelectorAll('.improve-resource-label')].every(n=>getComputedStyle(n).display==='none')&&!/Gold|Purple|Blue|Green/.test(tubes.innerText)})()`, 'expanded Tube icons and inputs without visible color captions');
    await check(`JSON.stringify([...document.querySelectorAll('[data-setting=gate] .improve-setting-choice')].map(n=>n.textContent))===JSON.stringify(['+5','+10','+15','+20','+25'])`, 'unchanged Gate checkpoints');
    await check(`${state}.presentation.echoPolicy.requirements.status==='USER_DEFINED'&&${state}.presentation.echoPolicy.preferences.status==='USER_DEFINED'&&document.querySelectorAll('.improve-echo-row .improve-roll-slider').length===6&&Object.keys(${state}.overrides).length===0`, 'Recommended shows only the user-approved Augusta default');
    await rowsUnique();
    await check(`(()=>{const columns=[...document.querySelectorAll('.improve-setting')].map(n=>n.getBoundingClientRect());return columns[1].width<=70&&Math.abs(columns[2].width-columns[3].width)<1&&columns[4].left>columns[3].left&&!document.querySelector('[data-setting=flex] h3')&&[...document.querySelectorAll('.improve-expected-stat')].every(n=>n.textContent==='Pending')})()`, 'screenshot columns: narrow Gate, equal Hard/Flex, source-backed comparison on right and Expected Pending');
    await check(`document.querySelector('[data-setting=every] .improve-setting-summary').textContent==='Recommended'&&document.querySelector('[data-setting=flex] .improve-setting-summary').textContent==='Recommended'&&[...document.querySelectorAll('.improve-echo-row')].every(n=>n.scrollWidth<=n.clientWidth+1)`, 'accepted Recommended summaries and row clearance');
    await check(`!JSON.stringify(${state}).includes('checkpointReference')&&!JSON.stringify(${state}).includes('effectivePolicy')`, 'public inspection contract');
    await check(`!document.querySelector('.improve-build-need')`, 'visible Build Need removed');
    await check(`(()=>{const row=document.querySelector('.improve-resources'),r=row.getBoundingClientRect(),fields=[...row.querySelectorAll('input')];return r.height<=160&&row.scrollWidth<=row.clientWidth+1&&fields.length===6&&fields.every(n=>!n.hidden)&&document.querySelector('.improve-resource-tubes').querySelectorAll('input').length===4&&!/EXP|Shell Credits/.test(row.innerText)})()`, 'expanded grouped Resources without raw EXP or Credits');
    await check(`(()=>{const root=document.getElementById('improveSettings'),title=root.querySelector('h2'),heading=root.querySelector('.improve-resources h3'),row=root.querySelector('.improve-resource-controls'),separator=root.querySelector('hr'),settings=root.querySelector('.improve-settings-controls');const rect=n=>n.getBoundingClientRect();return rect(title).bottom<=rect(heading).top&&rect(heading).bottom<=rect(row).top&&rect(row).bottom<=rect(separator).top&&rect(separator).bottom<=rect(settings).top&&parseFloat(getComputedStyle(title).fontSize)>parseFloat(getComputedStyle(heading).fontSize)&&parseFloat(getComputedStyle(heading).fontSize)>parseFloat(getComputedStyle(row.querySelector('h4')).fontSize)&&Math.abs(rect(row).left+rect(row).width/2-(rect(root).left+rect(root).width/2))<2})()`, 'Resources heading hierarchy and centered controls');
    await check(`(()=>{const expected=[['tuners','Premium Tuner'],['premium','Premium Sealed Tube'],['advanced','Advanced Sealed Tube'],['medium','Medium Sealed Tube'],['basic','Basic Sealed Tube']];return expected.every(([id,name])=>{const field=document.querySelector('[data-resource="'+id+'"]'),img=field.querySelector('img');return field.title===name&&field.querySelector('input').getAttribute('aria-label')===name+' available count'&&img.complete&&img.naturalWidth===256&&img.alt===''&&img.getAttribute('aria-hidden')==='true'&&new URL(img.src).origin===location.origin&&new URL(img.src).pathname.endsWith('/resource-icons/'+id+'.png')})&&document.querySelectorAll('.improve-resource img').length===5&&!document.querySelector('[data-resource=echoes] img')})()`, 'all five exact item icons load locally with accessible names');
    await check(`fetch('assets/resource-icons/manifest.json').then(r=>r.json()).then(m=>m.assets.map(a=>a.name+':'+a.sourcePath.split('/').pop()).join('|')==='Premium Tuner:T_IconA_txq_03_UI.png|Premium Sealed Tube:T_IconA_13_UI.png|Advanced Sealed Tube:T_IconA_12_UI.png|Medium Sealed Tube:T_IconA_11_UI.png|Basic Sealed Tube:T_IconA_10_UI.png')`, 'source-resolved item-to-texture associations in public artifact');
    await read("document.querySelector('.improve-resources').scrollIntoView({block:'center',behavior:'instant'})");
    await capture(send,`artifacts/ui-preview-resources-expanded-${width}x${height}-${artifactVariant}.png`);
    await capture(send,`artifacts/ui-preview-improve-settings-recommended-${width}x${height}-${artifactVariant}.png`);
    await click(focus('mode:MANUAL')); await check(`Object.keys(${state}.overrides).length===0`, 'Customize alone creates no inputs');
    await check(`(()=>{const root=document.getElementById('improveSettings');return root.querySelector('[data-setting=target] h3').textContent==='Character Stats'&&[...root.querySelectorAll('.improve-echo-row')].every(n=>getComputedStyle(n).fontFamily.startsWith('Inter'))&&[...root.querySelectorAll('.improve-expected-stat')].every(n=>n.textContent==='Pending')})()`, 'Customize retains source-backed comparison and Inter stat typography');
    if (!await read("document.querySelector('.improve-other-stats').open")) await click('.improve-other-stats summary');
    await dragRow('CRIT Rate', '[data-echo-section=every]'); await dragRow('CRIT DMG', '[data-echo-section=every]');
    for (const name of ['ATK%','Energy Regen','Heavy Attack DMG']) {
      await dragRow(name, '[data-echo-section=flex]');
      await check(`document.querySelector(${JSON.stringify('.improve-echo-row[data-stat-name='+JSON.stringify(name)+']')}).dataset.section==='flex'`, 'physical inactive Hard-to-Flex drag');
      await check(`!!document.querySelector(${JSON.stringify('.improve-echo-row[data-stat-name='+JSON.stringify(name)+'] .improve-roll-slider')})&&${state}.overrides.echoPreferences.some(r=>r.stat===${JSON.stringify(name)})`, 'drop activates immediately without another click');
    }
    await check(`${state}.overrides.echoRequirements.groups.find(g=>g.id==='selected-flex').minimumCount===1&&${state}.overrides.echoRequirements.requiredOnEveryEcho.length===2&&${state}.overrides.echoPreferences.length===4`, 'explicit user-only Echo inputs');
    await check(`(()=>{const owners=[...document.querySelectorAll('.improve-setting')], root=document.getElementById('improveSettings').getBoundingClientRect();return owners.every((n,i)=>{const r=n.getBoundingClientRect();return r.left>=root.left&&r.right<=root.right&&(!i||owners[i-1].getBoundingClientRect().right<=r.left)})&&[...document.querySelectorAll('.improve-roll-slider')].every(n=>n.getBoundingClientRect().width>=48)&&[...document.querySelectorAll('.improve-echo-row')].every(n=>n.scrollWidth<=n.clientWidth+1)&&document.documentElement.scrollWidth===${width}})()`, 'screenshot columns contain readable rows and minimum 48px sliders without viewport overflow');
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
    await dragRow('CRIT Rate', '[data-echo-section=flex]');
    await check(`${state}.overrides.echoPreferences.find(r=>r.stat==='CRIT Rate').minimum===.063&&${state}.overrides.echoRequirements.requiredOnEveryEcho.every(r=>r.stat!=='CRIT Rate')`, 'physical active Hard-to-Flex ownership/minimum');
    await alt('CRIT Rate','ArrowLeft');
    await check(`${state}.overrides.echoRequirements.requiredOnEveryEcho.find(r=>r.stat==='CRIT Rate').minimum===.063`, 'keyboard active Flex-to-Hard retains minimum');
    if (!await read("document.querySelector('.improve-other-stats').open")) await click('.improve-other-stats summary');
    await dragRow('HP%', '[data-echo-section=flex]');
    await check(`document.querySelector('.improve-echo-row[data-stat-name="HP%"] ').dataset.section==='flex'&&document.querySelector('.improve-echo-row[data-stat-name="HP%"] ').classList.contains('is-active')&&!!document.querySelector('.improve-echo-row[data-stat-name="HP%"] .improve-roll-slider')`, 'physical inactive Show-other-to-Flex drag');
    await click(slider('flex','HP%')); await key('End');
    await check(`${state}.overrides.echoPreferences.find(r=>r.stat==='HP%').minimum===.116&&!document.querySelector('.improve-echo-row[data-stat-name="HP%"] ').classList.contains('is-recommended')`, 'active neutral stat remains neutral');
    await dragRow('HP%', '.improve-other-stats summary');
    await check(`${state}.echoLayout.minimums['HP%']===.116&&${state}.overrides.echoPreferences.every(r=>r.stat!=='HP%')&&document.querySelector('.improve-echo-row[data-stat-name="HP%"] ').dataset.section==='other'`, 'physical active Flex-to-other stores dormant minimum');
    await alt('HP%','ArrowRight');
    await check(`document.querySelector('.improve-echo-row[data-stat-name="HP%"] ').dataset.section==='every'`, 'keyboard other-to-Hard');
    await check(`${state}.overrides.echoRequirements.requiredOnEveryEcho.find(r=>r.stat==='HP%').minimum===.116`, 'reactivation restores saved minimum');
    await alt('HP%','ArrowLeft');
    await rowsUnique();
    const order=await read(`${state}.echoLayout.flex`);
    await dragRow(order[1], '.improve-echo-row[data-stat-name='+JSON.stringify(order[0])+']');
    await check(`JSON.stringify(${state}.echoLayout.flex)===${JSON.stringify(JSON.stringify([order[1],order[0],...order.slice(2)]))}`, 'physical Flex reorder');
    await alt(order[1],'ArrowDown');
    await check(`JSON.stringify(${state}.echoLayout.flex)===${JSON.stringify(JSON.stringify(order))}`, 'keyboard Flex reorder');
    const saved=await read(`JSON.stringify(${state})`); await capture(send,`artifacts/ui-preview-improve-settings-customize-${width}x${height}-${artifactVariant}.png`);
    await navigate(send); await wait(); await read("show('improve');improvePicker.select('Augusta')");
    await check(`JSON.stringify(${state})===${JSON.stringify(saved)}`, 'reload input isolation');
    await click('#improve-setting-flex'); await settle(); await click(focus('reset:echo'));
    await check(`${state}.overrides.echoRequirements===undefined&&${state}.overrides.echoPreferences===undefined&&${state}.presentation.echoPolicy.requirements.status==='USER_DEFINED'&&document.querySelectorAll('.improve-echo-row .improve-roll-slider').length===6`, 'reset restores the user-approved Augusta default');
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
    else await check(`Object.keys(${state}.overrides).length===0&&${state}.presentation.echoPolicy.requirements.status==='USER_DEFINED'`, 'v2 Recommended adopts approved default without custom intent');
  }
  await click('#improve-setting-every'); await settle(); await click(focus('mode:MANUAL')); if (!await read("document.querySelector('.improve-other-stats').open")) await click('.improve-other-stats summary'); await dragRow('ATK%', '[data-echo-section=flex]');
  const originalBinding=await read(`${state}.contextBinding`);
  await read(`(()=>{const key='bellibing.improve.policy.v3',s=JSON.parse(localStorage.getItem(key));s.characters.augusta.contextBinding='changed-context';localStorage.setItem(key,JSON.stringify(s))})()`);
  await navigate(send); await wait(); await read("show('improve');improvePicker.select('Augusta')");
  await check(`${state}.compatibility.status==='REVIEW_REQUIRED'&&${state}.overrides.echoPreferences[0].stat==='ATK%'&&${state}.presentation.echoPolicy.preferences.status==='PENDING'&&!document.querySelector('.improve-policy-review').hidden`, 'context drift suspends original input');
  await read(`(()=>{const key='bellibing.improve.policy.v3',s=JSON.parse(localStorage.getItem(key));s.characters.augusta.contextBinding=${JSON.stringify(originalBinding)};localStorage.setItem(key,JSON.stringify(s))})()`);
  await navigate(send); await wait(); await read("show('improve');improvePicker.select('Augusta')");
  await check(`${state}.presentation.echoPolicy.preferences.status==='USER_DEFINED'`, 'matching context recovery');
  await check(`(()=>{const s=${state};s.overrides.echoPreferences.length=0;return ${state}.overrides.echoPreferences.length===4})()`, 'detached public view');
  // A failed browser write must leave both the UI state and original bytes committed.
  await click('#improve-setting-every'); await settle();
  const beforeFailure=await read(`JSON.stringify(${state})`), originalBytes=await read("localStorage.getItem('bellibing.improve.policy.v3')");
  await read("window.originalSettingsWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new Error('quota fixture')}");
  try {
    await alt('ATK%','ArrowLeft');
    await check(`JSON.stringify(${state})===${JSON.stringify(beforeFailure)}&&localStorage.getItem('bellibing.improve.policy.v3')===${JSON.stringify(originalBytes)}&&!document.querySelector('#improveSettings>p[role=status]:last-child').hidden`, 'failed save rolls back presentation and retains recovery bytes');
  } finally { await read('Storage.prototype.setItem=window.originalSettingsWrite;delete window.originalSettingsWrite'); }
  const retiredResources=await read(`JSON.stringify(${inventoryState})`), retiredQuality=await read(`${state}.rollQuality`);
  await read(`(()=>{const key='bellibing.improve.policy.v3',s=JSON.parse(localStorage.getItem(key));s.characters.augusta.overrides.echoCards={minimumCount:2};localStorage.setItem(key,JSON.stringify(s))})()`);
  const retiredBytes=await read("localStorage.getItem('bellibing.improve.policy.v3')");
  await navigate(send); await wait(); await read("show('improve');improvePicker.select('Augusta')");
  await check(`localStorage.getItem('bellibing.improve.policy.v3')===${JSON.stringify(retiredBytes)}&&Object.keys(${state}.overrides).length===0&&document.getElementById('improveSettings').innerText.includes('Recovery data has been retained')`, 'rejected card intent retained for review, never hidden acceptance or silent migration');
  await click(focus('mode:RECOMMENDED'));
  await check(`!localStorage.getItem('bellibing.improve.policy.v3').includes('echoCards')&&Object.keys(${state}.overrides).length===0&&${state}.gate===15&&${state}.rollQuality===${JSON.stringify(retiredQuality)}&&JSON.stringify(${inventoryState})===${JSON.stringify(retiredResources)}&&!document.querySelector('[data-focus-key=\"mode:MANUAL\"]').disabled`, 'existing Recommended action explicitly recovers retired card intent, preserving Gate and shared Resources');
  console.log('PASS public Improve Pending/input/source/persistence/physical-pointer/geometry regression at three desktop sizes');
}

/** Focused 1440px correction review; shared persistence and equipment stay owned
 * by the existing Settings/simulator models. All choice/scroll inputs are physical. */
export async function verifyImproveSonataSettings({ send, evaluate, navigate, setViewport, waitForUi, pointerClick, capture, sleep }) {
  const read = expression => evaluate(send, expression);
  const check = async (expression, label) => { if (!await read(expression)) throw new Error('Sonata Settings: ' + label + ' ' + JSON.stringify(await read("({focus:document.activeElement.outerHTML.slice(0,200),top:document.querySelector('.improve-sonata-list')?.scrollTop,open:document.querySelector('.improve-more-sets')?.open})"))); };
  const click = async selector => { await read(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`); await sleep(450); await pointerClick(send, selector); await sleep(180); };
  const key = async (name, code = name, virtual = 0) => { await send('Input.dispatchKeyEvent', {type:'keyDown',key:name,code,windowsVirtualKeyCode:virtual,text:name==='Enter'?'\r':undefined}); await send('Input.dispatchKeyEvent', {type:'keyUp',key:name,code,windowsVirtualKeyCode:virtual}); await sleep(150); };
  await setViewport(send, 1440, 900); await navigate(send);
  await waitForUi(send, 'echoDataLoaded&&window.bellibingImproveSettings&&document.getElementById("improveSettings").dataset.sourceStatus!=="LOADING"', 'initial Settings load', 15000);
  await read('localStorage.clear()'); await navigate(send);
  await waitForUi(send, 'echoDataLoaded&&window.bellibingImproveSettings&&document.getElementById("improveSettings").dataset.sourceStatus!=="LOADING"', 'fresh Settings load', 15000);
  await read("show('improve');improvePicker.select('Augusta')"); await sleep(800);
  const equipment = await read("JSON.stringify(improveBuildState('Augusta'))");
  const initial = await read('window.bellibingImproveSettings.getSonataSetIds()');
  await check(`JSON.stringify([...document.querySelectorAll('.improve-sonata-selected button')].map(n=>n.dataset.focusKey.slice(7)))===${JSON.stringify(JSON.stringify(initial))}`, 'selected icons preserve order');
  await check("!document.querySelector('[data-setting=sonata]').innerText.match(/selected|Choose up to|Simulation sets/) && document.querySelector('.improve-sonata-selected').querySelectorAll('img').length===2&&!document.querySelector('.improve-more-sets').open", 'icon-only fixed row and collapsed More Sets');
  await click('.improve-more-sets summary');
  await read("document.querySelector('[data-setting=sonata]').scrollIntoView({block:'start',behavior:'instant'})"); await sleep(250);
  const fixedTop = await read("document.querySelector('.improve-sonata-selected').getBoundingClientRect().top");
  const bounds = await read("(()=>{const r=document.querySelector('.improve-sonata-list').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+80}})()");
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',...bounds});
  await send('Input.dispatchMouseEvent',{type:'mouseWheel',...bounds,deltaX:0,deltaY:430}); await sleep(400);
  await check(`document.querySelector('.improve-sonata-list').scrollTop>0&&Math.abs(document.querySelector('.improve-sonata-selected').getBoundingClientRect().top-${fixedTop})<1&&parseFloat(document.querySelector('.improve-sonata-scroll-shell .weapon-scroll-rail.has-scroll').style.getPropertyValue('--scroll-p'))>0`, 'real wheel scroll moves star but keeps selected row fixed');
  await check("getComputedStyle(document.querySelector('.improve-sonata-list')).scrollbarWidth==='none'&&getComputedStyle(document.querySelector('.improve-sonata-scroll-shell .weapon-scroll-rail'),'::before').width==='1px'&&[...document.querySelectorAll('.improve-sonata-list button')].every((n,i,rows)=>n.clientWidth>130&&n.scrollWidth<=n.clientWidth+1&&(!i||rows[i-1].getBoundingClientRect().bottom<=n.getBoundingClientRect().top))", 'thin reused rail, no compressed/overlapping/clipped choices');
  await click('.improve-more-sets summary'); await check("!document.querySelector('.improve-more-sets').open&&document.querySelector('.improve-sonata-selected').offsetHeight>0", 'collapse preserves icons');
  await key('Enter','Enter',13); await key('Tab','Tab',9); await key('End','End',35);
  await check("document.activeElement.classList.contains('improve-sonata-list')&&document.querySelector('.improve-sonata-list').scrollTop>500", 'keyboard list scroll');
  await waitForUi(send, "(()=>{const n=document.querySelector('.improve-sonata-list');return Math.abs(n.scrollTop-(n.scrollHeight-n.clientHeight))<1})()", 'keyboard End settles');
  await key('Home','Home',36); await waitForUi(send, "document.querySelector('.improve-sonata-list').scrollTop===0", 'keyboard Home settles'); await check("document.querySelector('.improve-sonata-list').scrollTop===0", 'keyboard Home');
  const third = await read("document.querySelector('.improve-sonata-list button').dataset.focusKey.slice(7)");
  await read("window.__sonataChangeCount=0;window.addEventListener('bellibing-improve-settings-changed',()=>window.__sonataChangeCount++);window.addEventListener('bellibing-simulator-sonatas-changed',()=>window.__sonataChangeCount++)");
  await click(`[data-focus-key="sonata:${third}"]`);
  await check('document.querySelectorAll(".improve-sonata-replace button").length===2&&window.bellibingImproveSettings.getSonataSetIds().length===2&&document.activeElement.dataset.focusKey.startsWith("sonata-replace:")&&window.__sonataChangeCount===0', 'third choice offers explicit accessible replacement');
  await key('Escape','Escape',27); await check('!document.querySelector(".improve-sonata-replace")', 'Escape cancels replacement');
  await click(`[data-focus-key="sonata:${third}"]`); await key('Enter','Enter',13);
  await check(`JSON.stringify(window.bellibingImproveSettings.getSonataSetIds())===${JSON.stringify(JSON.stringify([third,initial[1]]))}`, 'keyboard replacement preserves position and two-set cap');
  await click(`[data-focus-key="sonata:${third}"]`); await check('window.bellibingImproveSettings.getSonataSetIds().length===1', 'selected icon deselect');
  await click(`[data-focus-key="sonata:${initial[0]}"]`); await check(`JSON.stringify(window.bellibingImproveSettings.getSonataSetIds())===${JSON.stringify(JSON.stringify([initial[1],initial[0]]))}`, 'available choice adds in actual selection order');
  await click('#simulatorEnter');
  const session = await read('JSON.stringify({source:improveUi.simulator.source,slots:improveUi.simulator.slots,build:improveUi.simulator.simulatedBuild,resources:improveUi.simulator.resources})');
  await click(`[data-focus-key="sonata:${initial[0]}"]`);
  await check(`improveUi.simulatorTemplates.filter(Boolean).every(t=>t.selectedSonataSetId===${JSON.stringify(initial[1])})&&JSON.stringify({source:improveUi.simulator.source,slots:improveUi.simulator.slots,build:improveUi.simulator.simulatedBuild,resources:improveUi.simulator.resources})===${JSON.stringify(session)}`, 'updated family reaches simulator without equipment/resource mutation');
  await click('#improve-setting-every');
  await click('[data-focus-key="roll:every:CRIT Rate"]'); await key('ArrowRight','ArrowRight',39);
  await check('document.querySelector("[data-focus-key=\\"roll:every:CRIT DMG\\"]")!==null', 'CRIT minimum controls retained');
  const settings = await read('JSON.stringify(window.bellibingImproveSettings.getState().overrides)');
  await read("document.getElementById('improveSettings').scrollIntoView({block:'start',behavior:'instant'})"); await capture(send, 'artifacts/ui-preview-sonata-correction-1440x900.png');
  await navigate(send); await waitForUi(send, 'window.bellibingImproveSettings&&echoDataLoaded&&document.getElementById("improveSettings").dataset.sourceStatus!=="LOADING"', 'reload load', 15000);
  await read("show('improve');improvePicker.select('Augusta')"); await sleep(700);
  await check(`JSON.stringify(window.bellibingImproveSettings.getState().overrides)===${JSON.stringify(settings)}&&JSON.stringify(improveBuildState('Augusta'))===${JSON.stringify(equipment)}&&!improveUi.simulator`, 'settings reload and real equipment isolation');
  console.log('PASS focused Sonata Settings 1440x900: fixed ordered icons, wheel/star/keyboard scrolling, More Sets collapse, explicit replacement/deselection, simulator eligibility, minima persistence and real equipment isolation.');
}
