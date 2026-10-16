import assert from 'node:assert/strict';
import { ECHO_SETTING_STATS } from '../v1.1/modules/settings-catalog.js';
import { selectCardCharacter } from './review-character-card.mjs';
export async function reviewSettings(page,{width,checks}) {
  const ensureSettings=async()=>{if(await page.locator('#settingsToggle').getAttribute('aria-expanded')!=='true')await page.locator('#settingsToggle').click();};
  const rows=section=>page.locator(`[data-stat-section="${section}"] [data-minimum]`);
  const ids=section=>rows(section).evaluateAll(nodes=>nodes.map(node=>node.dataset.minimum));
  const row=id=>page.locator('#echoSettings [data-minimum]').filter({has:page.locator(`button[aria-label="Move ${id}"]`)});
  const moveKey=async(id,key)=>{await row(id).locator('.handle').focus();await page.keyboard.press(key);};
  const allIds=()=>page.locator('#echoSettings [data-minimum]').evaluateAll(nodes=>nodes.map(node=>node.dataset.minimum));
  await ensureSettings();
  // Browse-only: an inline native disclosure shifts Gate and restores it on close.
  const selectedSonatas=()=>page.locator('#settings .sonata-selected .sonata-name').allTextContents();
  assert.deepEqual((await selectedSonatas()).map(s=>s.trim()),['Crown of Valor','Void Thunder']);
  const browse=page.locator('#sonataMore');
  const gateY=()=>page.locator('.gate-options').evaluate(el=>el.getBoundingClientRect().top+scrollY);
  const gateBefore=await gateY();
  assert.equal(await browse.evaluate(el=>el.open),false);
  assert.equal(await page.locator('.sonata-browse').isVisible(),false);
  await browse.locator('summary').focus();await page.keyboard.press('Enter');
  assert.equal(await browse.evaluate(el=>el.open),true,'More Sets must open with keyboard');
  assert.equal(await page.locator('.sonata-browse').isVisible(),true);
  assert.equal(await page.locator('.sonata-browse .sonata-option').count(),35,'Only source-backed other sets');
  assert.equal(await page.locator('[data-sonata-id="sonata-37"] .sonata-name').innerText(),'Flash of Electric Reflection');
  const visibleSonatas=await page.locator('.sonata-browse').evaluate(el=>{
    const viewport=el.getBoundingClientRect();
    const bounds=[...el.querySelectorAll('.sonata-card')].map(child=>child.getBoundingClientRect());
    return {
      height:viewport.height,
      visible:bounds.filter(box=>box.top<viewport.bottom&&box.bottom>viewport.top).length,
      fullyVisible:bounds.filter(box=>box.top>=viewport.top&&box.bottom<=viewport.bottom).length,
      widthFits:bounds.every(box=>box.left>=viewport.left-1&&box.right<=viewport.right+1),
    };
  });
  assert.ok(visibleSonatas.height>=250&&visibleSonatas.height<=275,'More Sets should expand to approximately seven card rows');
  assert.ok(visibleSonatas.visible>=6&&visibleSonatas.visible<=7,'More Sets should initially show approximately six or seven options');
  assert.ok(visibleSonatas.fullyVisible>=6,'At least six Sonata cards should be fully visible');
  assert.ok(visibleSonatas.widthFits,'Expanded Sonata cards must stay within the Settings panel');
  const scrollInfo=await page.locator('.sonata-browse').evaluate(el=>{
    el.scrollTop=el.scrollHeight;
    return {height:el.clientHeight,total:el.scrollHeight,scroll:el.scrollTop,overflow:el.scrollWidth>el.clientWidth+1};
  });
  assert.ok(scrollInfo.total>scrollInfo.height+80&&scrollInfo.scroll>0,'Sonata list must scroll inside panel');
  assert.equal(scrollInfo.overflow,false,'Sonata rows must fit panel width');
  assert.ok(await gateY()>gateBefore+100,'More Sets must push Gate downward');
  assert.deepEqual((await selectedSonatas()).map(s=>s.trim()),['Crown of Valor','Void Thunder'],'Browse must not change existing selected sets');
  assert.equal(await page.locator('#gateLabel').textContent(),'+5');
  await browse.locator('summary').press('Enter');
  assert.equal(await browse.evaluate(el=>el.open),false);
  assert.ok(Math.abs(await gateY()-gateBefore)<2,'Collapse must restore layout');

  // Verify actual HTML5 pointer drag, keyboard activation and demo pool isolation.
  await browse.locator('summary').click();
  const set=id=>page.locator(`[data-sonata-id="${id}"]`);
  const selectedIds=()=>page.locator('.sonata-selected [data-sonata-id]').evaluateAll(rows=>rows.map(r=>r.dataset.sonataId));
  const listIds=()=>page.locator('.sonata-browse [data-sonata-id]').evaluateAll(rows=>rows.map(r=>r.dataset.sonataId));
  const defaults=['sonata-20','sonata-3'];
  await page.evaluate(() => {
    window.sonataDragTrace=[];
    const section=document.querySelector('.sonata-section');
    for(const name of ['dragstart','dragenter','dragover','drop','dragend']){
      section.addEventListener(name,event=>{
        if(window.sonataDragTrace.length<60)
          window.sonataDragTrace.push({name,target:event.target.className,
            accepted:event.defaultPrevented,xy:[event.clientX,event.clientY]});
      },{capture:true});
    }
  });
  const chosenSize=await page.locator('.sonata-selected').boundingBox();
  await set('sonata-5').locator('.sonata-handle').dragTo(page.locator('.sonata-selected'),
    {targetPosition:{x:60,y:chosenSize.height-5}});
  assert.deepEqual(await selectedIds(),[...defaults,'sonata-5'],`Pointer drag should add Celestial Light: ${JSON.stringify(await page.evaluate(()=>window.sonataDragTrace))}`);
  assert.equal((await listIds()).length,34,'Chosen card must leave More Sets');
  assert.equal(new Set([...(await selectedIds()),...(await listIds())]).size,37,'Sonata IDs must stay unique');
  assert.equal(await page.locator('.sonata-count').count(),2,'UI pool must not change demo Echo equipment or set counts');
  await set('sonata-5').locator('.sonata-handle').focus();await page.keyboard.press('Enter');
  assert.deepEqual(await selectedIds(),defaults,'Enter should remove chosen Sonata');
  await set('sonata-5').locator('.sonata-handle').click();
  assert.deepEqual(await selectedIds(),[...defaults,'sonata-5'],'Click/tap alternative adds Sonata');
  await set('sonata-5').locator('.sonata-handle').dragTo(page.locator('.sonata-browse'),{targetPosition:{x:60,y:8}});
  assert.deepEqual(await selectedIds(),defaults,'Drag back removes Sonata');
  await set('sonata-20').locator('.sonata-handle').focus();await page.keyboard.press('Space');
  assert.deepEqual(await selectedIds(),['sonata-3'],'Space moves a chosen Sonata out');
  await set('sonata-20').locator('.sonata-handle').click();
  assert.deepEqual(await selectedIds(),['sonata-3','sonata-20']);
  await set('sonata-20').locator('.sonata-handle').dragTo(set('sonata-3'),{targetPosition:{x:8,y:3}});
  assert.deepEqual(await selectedIds(),defaults,'Chosen cards can reorder by drag');
  await selectCardCharacter(page,'iuno');await ensureSettings();
  assert.deepEqual(await selectedIds(),defaults,'Other Character pool must be independent');
  await set('sonata-5').locator('.sonata-handle').click();
  assert.equal((await selectedIds()).length,3,'Iuno edits its own preview pool');
  await selectCardCharacter(page,'augusta');await ensureSettings();
  assert.deepEqual(await selectedIds(),defaults,'Iuno selection must not leak to Augusta');
  await browse.locator('summary').click();
  assert.equal(await browse.evaluate(el=>el.open),false);

  assert.equal(await page.locator('#editERTarget').count(),0,'ER target must not have a dropdown');
  assert.equal(await page.locator('#erTotalStatus').count(),0,'No ER explanation row');
  assert.equal(await page.locator('#erTarget > .er-target-heading').count(),1,'ER target remains on one row');
  assert.equal(await page.locator('#erTargetValue').textContent(),'120% suggested');
  assert.equal(await page.locator('#erTargetValue').isVisible(),true);
  assert.equal(await page.locator('#erTargetInput').isVisible(),false);
  assert.equal(await page.locator('#erEnabled').isChecked(),false,'Suggested target is not enabled implicitly');
  await page.locator('.setting-mode button',{hasText:'Customize'}).click();
  assert.equal(await page.locator('#erTargetValue').isVisible(),false);
  assert.equal(await page.locator('#erTargetInput').isVisible(),true);
  assert.equal(await page.locator('#erTargetInput').inputValue(),'120','Customize offers the source-backed suggested value');
  assert.equal(await page.locator('#erEnabled').isChecked(),false);
  assert.ok(await page.locator('#erTarget').evaluate(node=>{
    const r=node.getBoundingClientRect(), label=node.querySelector('label').getBoundingClientRect(), field=node.querySelector('#erTargetInput').getBoundingClientRect();
    return Math.abs(label.y-field.y)<16 && r.height<58;
  }),'ER checkbox and input must share a compact row');
  assert.deepEqual(await ids('hard'),['CRIT Rate','CRIT DMG']);
  assert.deepEqual(await ids('flex'),['ATK%','Heavy Attack DMG']);
  assert.equal((await ids('other'))[0],'Flat ATK');
  assert.deepEqual((await allIds()).sort(),ECHO_SETTING_STATS.map(stat=>stat.id).sort());
  assert.equal(await page.locator('#flexCountLabel').textContent(),'At least 1 of 2');
  const geometry=await page.evaluate(()=>({panel:document.querySelector('#settings').clientWidth,workshop:document.querySelector('.workshop').clientWidth,overflow:document.documentElement.scrollWidth>innerWidth}));
  assert.ok(geometry.panel>=320&&geometry.panel<=360);assert.ok(geometry.workshop>=1000);assert.equal(geometry.overflow,false);
  const clipped=await rows('flex').evaluateAll(nodes=>nodes.flatMap(row=>{
    const name=row.querySelector('.stat-label').getBoundingClientRect(), slider=row.querySelector('input').getBoundingClientRect(),value=row.querySelector('output').getBoundingClientRect();
    return row.querySelector('.stat-label').scrollWidth>name.width+1||name.right>slider.left||slider.right>value.left||row.getBoundingClientRect().height>38?[row.textContent]:[];
  }));assert.deepEqual(clipped,[]);
  await page.evaluate(()=>{window.nativeSettingsDrags=0;document.querySelector('#echoSettings').addEventListener('dragstart',()=>window.nativeSettingsDrags++);});
  const crit=page.getByRole('slider',{name:'CRIT Rate minimum',exact:true});
  await crit.scrollIntoViewIfNeeded();const track=await crit.boundingBox();
  await page.mouse.move(track.x+5,track.y+track.height/2);await page.mouse.down();await page.mouse.move(track.x+track.width-5,track.y+track.height/2,{steps:10});await page.mouse.up();
  assert.equal(await page.evaluate(()=>window.nativeSettingsDrags),0,'Slider must never start a row drag');
  await crit.focus();await page.keyboard.press('End');
  const minimum=await row('CRIT Rate').locator('output').textContent();
  assert.equal(await page.locator('.setting-mode .selected').textContent(),'Customize');
  await moveKey('CRIT Rate','Alt+ArrowLeft');
  assert.equal(await row('CRIT Rate').getAttribute('data-section'),'other');
  assert.equal(await row('CRIT Rate').locator('input').count(),0);
  assert.equal(await page.locator('#otherStats').evaluate(node=>node.open),true);
  await moveKey('CRIT Rate','Alt+ArrowLeft');
  assert.equal(await row('CRIT Rate').getAttribute('data-section'),'flex');
  assert.equal(await row('CRIT Rate').locator('output').textContent(),minimum);
  await moveKey('CRIT Rate','Alt+ArrowLeft');await moveKey('CRIT Rate','Alt+ArrowUp');
  assert.equal((await ids('hard'))[0],'CRIT Rate');
  // Real native drag operations, using physical pointer input via Playwright.
  await row('ATK%').locator('.handle').dragTo(page.locator('#hardRows'),{targetPosition:{x:10,y:4}});
  assert.equal(await row('ATK%').getAttribute('data-section'),'hard');
  await row('ATK%').locator('.handle').dragTo(page.locator('#flexRows'),{targetPosition:{x:10,y:4}});
  assert.equal(await row('ATK%').getAttribute('data-section'),'flex');
  await row('Heavy Attack DMG').locator('.handle').dragTo(row('ATK%'),{targetPosition:{x:8,y:3}});
  assert.equal((await ids('flex'))[0],'Heavy Attack DMG');
  assert.ok(await page.evaluate(()=>window.nativeSettingsDrags)>=3);
  await page.locator('#flexCount').focus();await page.keyboard.press('End');
  assert.equal(await page.locator('#flexCountLabel').textContent(),'At least 2 of 2');
  await moveKey('ATK%','Alt+ArrowRight');
  assert.equal(await page.locator('#flexCount').getAttribute('aria-invalid'),'true');
  assert.equal(await page.locator('#flexCountLabel').textContent(),'At least 2 of 1');
  assert.equal(await page.locator('#flexCountError').isVisible(),true);
  await page.locator('#flexCount').focus();await page.keyboard.press('Home');
  assert.equal(await page.locator('#flexCount').getAttribute('aria-invalid'),'false');
  assert.equal(await page.locator('#flexCountLabel').textContent(),'At least 1 of 1');
  await moveKey('ATK%','Alt+ArrowLeft');
  await page.locator('#erEnabled').check();
  assert.equal(await page.locator('#erTargetInput').inputValue(),'120');
  assert.equal(await page.locator('#erTarget').getAttribute('data-status'),'UNAVAILABLE');
  const er=page.locator('#erTargetInput');
  await er.fill('130');await er.press('Tab');
  assert.equal(await er.inputValue(),'130');
  async function sample(value){await page.locator('.demo-note summary').click();await page.locator('#erReview').selectOption(value);await page.locator('.demo-note summary').click();}
  await sample('above');
  assert.equal(await page.locator('#erTarget').getAttribute('data-status'),'OUTSTANDING','126.8 demo must not satisfy a configured 130 target');
  await er.fill('120');await er.press('Tab');
  assert.equal(await page.locator('#erTarget').getAttribute('data-status'),'REACHED');
  assert.match(await page.locator('#erTargetBadge').textContent(),/Illustrative demo/);
  assert.equal(await er.isVisible(),true,'Reaching a target does not create or collapse a dropdown');
  await sample('below');assert.equal(await page.locator('#erTarget').getAttribute('data-status'),'OUTSTANDING');
  assert.equal(await er.isVisible(),true);
  await er.fill('');await er.press('Tab');
  assert.equal(await page.locator('#erTarget').getAttribute('data-status'),'UNCONFIGURED');
  assert.equal(await er.inputValue(),'','An invalid/cleared target must not silently revert to the suggestion');
  assert.equal(await er.getAttribute('aria-invalid'),'true');
  await page.locator('#erEnabled').uncheck();assert.equal(await page.locator('#erTarget').getAttribute('data-status'),'DISABLED');
  await sample('none');await page.locator('#erEnabled').check();
  assert.equal(await er.inputValue(),'120','Explicitly re-enabling can adopt the verified source suggestion');
  assert.equal(await page.locator('#erTarget').getAttribute('data-status'),'UNAVAILABLE');
  assert.equal(await page.locator('.result-row.is-affected').count(),0,'ER input must not fabricate Expected changes');
  await page.locator('#simulate').click();
  assert.equal(await page.locator('#erTarget').getAttribute('data-status'),'UNAVAILABLE','An illustrative run is not a verified ER projection');
  await selectCardCharacter(page,'iuno');await ensureSettings();
  assert.deepEqual(await ids('hard'),[]);assert.deepEqual(await ids('flex'),[]);
  assert.equal(await page.locator('.setting-mode button').first().isDisabled(),true);
  assert.equal(await page.locator('#erEnabled').isChecked(),false);
  assert.equal(await page.locator('#erTargetInput').inputValue(),'','No suggestion may be invented for Iuno');
  await selectCardCharacter(page,'augusta');await ensureSettings();
  assert.equal(await row('CRIT Rate').locator('output').textContent(),minimum);
  assert.equal(await page.locator('#erEnabled').isChecked(),true);
  await page.locator('.gate-options button').filter({hasText:'+15'}).click();
  await page.locator('.setting-mode button').filter({hasText:'Recommended'}).click();
  assert.deepEqual(await ids('flex'),['ATK%','Heavy Attack DMG']);
  assert.equal(await page.locator('#flexCountLabel').textContent(),'At least 1 of 2');
  assert.equal(await page.locator('#erEnabled').isChecked(),false);
  assert.equal(await page.locator('#erTargetEditor').isVisible(),false);
  assert.equal(await page.locator('#erTargetValue').textContent(),'120% suggested');
  assert.equal(await page.locator('#gateLabel').textContent(),'+15');
  await page.locator('#reset').click();assert.equal(await page.locator('#gateLabel').textContent(),'+5');
  assert.deepEqual((await allIds()).sort(),ECHO_SETTING_STATS.map(stat=>stat.id).sort());
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
  checks.push({label:'Compact canonical Settings: physical drag, keyboard placement, dormant minima, invalid Flex intent, optional ER ownership and illustrative transitions',width,geometry});
}
