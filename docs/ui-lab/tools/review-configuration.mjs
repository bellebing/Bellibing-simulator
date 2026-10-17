import assert from 'node:assert/strict';
import catalog from '../../ui-prototypes/assets/echoes/browser-data.json' with {type:'json'};

const snapshot=page=>page.evaluate(()=>window.bellibingLabConfiguration.snapshot());
async function ensureSettings(page){if(await page.locator('#settingsToggle').getAttribute('aria-expanded')!=='true')await page.locator('#settingsToggle').click();}
async function selectCharacter(page,id){
  await page.locator('.portrait.selected').click();await page.locator('[data-filter="all"]').click();
  await page.locator('#galleryArt').focus();await page.keyboard.press('Home');
  const index=await page.locator('[data-art]').evaluateAll((nodes,id)=>nodes.findIndex(node=>node.dataset.art===id),id);assert.ok(index>=0);
  for(let n=0;n<index;n++)await page.keyboard.press('ArrowRight');
  await page.waitForFunction(id=>document.querySelector('#characterCarousel').dataset.focusedCharacter===id&&document.querySelector('#characterCarousel').dataset.motion==='settled',id);
  await page.keyboard.press('Enter');await page.waitForFunction(()=>getComputedStyle(document.querySelector('#characterCarousel')).height==='0px');
}
async function openEditor(page,slot,keyboard=false){
  const edit=page.locator(`[data-edit-echo="${slot}"]`);
  if(keyboard){await edit.focus();await page.keyboard.press('Enter');}else await edit.click();
  const frame=page.frameLocator('.workshop-editor-host iframe');await frame.locator('#echoOverlay.open').waitFor();assert.equal(await frame.locator('html').evaluate(()=>getComputedStyle(document.documentElement).colorScheme),'dark','Iframe must preserve the transparent dark Workshop composition');assert.equal(await frame.locator('html').evaluate(()=>localStorage.getItem('bellibing-ui-checkpoint-v34')),null,'Workshop must not read the real account Storage');return frame;
}
async function choose(page,slot,echo,main,{keyboard=false,sonata=null}={}){
  const frame=await openEditor(page,slot,keyboard);
  await frame.locator('#echoSonataToggle').click();await frame.locator('#echoSonataAll').click();await frame.locator('#echoSonataToggle').click();
  await frame.locator(`[data-echo-id="${echo.id}"]`).click();
  await frame.getByRole('combobox',{name:'Main Stat name',exact:true}).click();
  await frame.getByRole('option',{name:main,exact:true}).click();
  if(sonata&&await frame.locator(`#echoPreviewSonataChoices [data-sonata-id="${sonata}"]`).getAttribute('aria-pressed')!=='true'){
    await frame.locator(`#echoPreviewSonataChoices [data-sonata-id="${sonata}"]`).click();await frame.locator('#confirmSwitch').click();
  }
  assert.equal(await frame.locator('#echoSubstats').isVisible(),false);
  assert.equal(await frame.locator('#echoWorkspaceSlots').isVisible(),false);
  await frame.getByRole('button',{name:'Use Echo',exact:true}).click();await page.locator('.workshop-editor-host').waitFor({state:'detached'});
}
export async function reviewConfiguration(page,{width,checks,saveExamples=()=>{}}){
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.waitForFunction(()=>document.documentElement.dataset.uiLabReady==='true');
  await page.evaluate(()=>localStorage.setItem('bellibing-ui-checkpoint-v34',JSON.stringify({characters:['Augusta'],drafts:{Augusta:{character:'Augusta',build:{owner:'account-fixture',mustRemainUntouched:true}}}})));
  const sourceStorage=await page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])));
  const initial=await snapshot(page);assert.equal(initial.characterId,'augusta');assert.ok(initial.slots.every(row=>row.configuration===null&&row.simulatedCurrent===null&&!row.active));
  assert.equal(await page.locator('[data-edit-echo]').count(),5);
  const overlap=await page.locator('.activation-slot').evaluateAll(nodes=>nodes.some(n=>{const a=n.querySelector('.echo-edit').getBoundingClientRect(),b=n.querySelector('.substat:last-child').getBoundingClientRect();return a.top<b.bottom&&a.bottom>b.top;}));assert.equal(overlap,false,'Edit Echo must not cover Substats');
  assert.equal(await page.locator('#simulate').isDisabled(),true);
  await ensureSettings(page);await page.locator('[data-resource="echoes"] input').fill('27');await page.locator('[data-resource="echoes"] input').press('Enter');
  await page.locator('[data-resource="tuners"] .resource-unlimited').click();
  const echo4=catalog.echoes.find(row=>row.name==='The False Sovereign');
  const echo3=catalog.echoes.find(row=>row.cost===3&&row.sonataSetIds.length>1);
  await choose(page,0,echo4,'CRIT Rate',{keyboard:true});
  let selected=await snapshot(page);assert.equal(selected.slots[0].configuration.echoId,echo4.id);assert.equal(selected.slots[0].configuration.mainStatName,'CRIT Rate');
  assert.equal(selected.slots[0].simulatedCurrent,null);assert.equal(selected.slots[0].active,false);
  await page.locator('[data-activation="0"]').click();assert.equal((await snapshot(page)).slots[0].active,true);
  await choose(page,1,echo3,'Electro DMG',{sonata:echo3.sonataSetIds.at(-1)});
  await page.locator('[data-activation="1"]').focus();await page.keyboard.press('Space');
  selected=await snapshot(page);assert.equal(selected.slots[1].configuration.selectedSonataSetId,echo3.sonataSetIds.at(-1));assert.ok(selected.slots.every(row=>row.simulatedCurrent===null));
  await choose(page,0,echo4,'CRIT DMG');assert.equal((await snapshot(page)).slots[0].configuration.mainStatName,'CRIT DMG');
  await page.locator('[data-slot="4"]').click();assert.equal((await snapshot(page)).selectedSlot,5);
  assert.deepEqual((await snapshot(page)).selectedSlots.map(row=>row.slot),[1,2]);
  const beforeCancel=await snapshot(page);const editor=await openEditor(page,2);await editor.locator('#echoClose').click();await page.locator('.workshop-editor-host').waitFor({state:'detached'});
  assert.deepEqual((await snapshot(page)).slots,beforeCancel.slots);
  await openEditor(page,2,true);await page.keyboard.press('Escape');await page.locator('.workshop-editor-host').waitFor({state:'detached'});
  assert.deepEqual((await snapshot(page)).slots,beforeCancel.slots);
  const staleFrame=await openEditor(page,2);
  await staleFrame.locator('[data-echo-id="'+echo4.id+'"]').click();
  await page.evaluate(()=>document.querySelectorAll('.gate-options button')[1].click());
  await staleFrame.getByRole('button',{name:'Use Echo',exact:true}).click();
  assert.equal((await snapshot(page)).slots[2].configuration,null,'Stale Settings must prevent commit');
  await staleFrame.locator('#echoClose').click();await page.locator('.workshop-editor-host').waitFor({state:'detached'});
  await ensureSettings(page);await page.locator('.gate-options button').filter({hasText:/^\+5$/}).click();
  await ensureSettings(page);await page.getByRole('slider',{name:'CRIT Rate minimum',exact:true}).focus();await page.keyboard.press('ArrowRight');
  const augusta=await snapshot(page);assert.equal(augusta.context.settings.mode,'Customize');
  await page.locator('.mode-switch button').filter({hasText:'Current'}).click();
  const savedCurrent=await page.locator('#currentCard').innerHTML();assert.equal(await page.locator('.echo-edit:disabled').count(),5);
  await page.locator('.mode-switch button').filter({hasText:'Simulate'}).click();
  await page.locator('#simulate').click();assert.match(await page.locator('#toast').innerText(),/Pending.*2 active slots/);
  assert.deepEqual((await snapshot(page)).slots,augusta.slots);
  await selectCharacter(page,'aalto');const blank=await snapshot(page);assert.ok(blank.slots.every(row=>row.configuration===null));assert.deepEqual(blank.context.settings.hard,[]);assert.deepEqual(blank.context.settings.sonataPool,[]);
  const echo1=catalog.echoes.find(row=>row.cost===1);await choose(page,3,echo1,'ATK%');await page.locator('[data-activation="3"]').click();
  await ensureSettings(page);await page.locator('.gate-options button').filter({hasText:'+10'}).click();
  const aalto=await snapshot(page);assert.equal(aalto.characterId,'aalto');assert.equal(aalto.context.settings.gate,10);assert.equal(aalto.slots[3].configuration.cost,1);
  assert.equal(aalto.resourceInventory.echoes.count,27);assert.equal(aalto.resourceInventory.tuners.kind,'UNLIMITED');
  await selectCharacter(page,'augusta');const restored=await snapshot(page);assert.deepEqual(restored.slots,augusta.slots);assert.deepEqual(restored.context.settings,augusta.context.settings);
  await page.locator('.mode-switch button').filter({hasText:'Current'}).click();assert.equal(await page.locator('#currentCard').innerHTML(),savedCurrent);
  await page.locator('.mode-switch button').filter({hasText:'Simulate'}).click();await page.locator('#reset').click();
  const reset=await snapshot(page);assert.deepEqual(reset.slots.map(row=>row.configuration),augusta.slots.map(row=>row.configuration));assert.ok(reset.slots.every(row=>row.simulatedCurrent===null&&row.history.length===0));
  assert.deepEqual(await page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]))),sourceStorage);
  assert.equal(await page.locator('.cost-comparison').isVisible(),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);
  await saveExamples({augusta,aalto});checks.push({label:'Source-backed Edit Echo configuration, four-state separation and two-Character isolation',width});
}
