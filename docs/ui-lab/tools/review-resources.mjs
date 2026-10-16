import assert from 'node:assert/strict';
import { selectCardCharacter } from './review-character-card.mjs';
export async function reviewResources(page,{width,checks}) {
  const ensureSettings=async()=>{if(await page.locator('#settingsToggle').getAttribute('aria-expanded')!=='true')await page.locator('#settingsToggle').click();};
  await ensureSettings();
  const input=id=>page.locator(`#resourceInventory [data-resource="${id}"] input`);
  const read=()=>page.locator('#resourceInventory input').evaluateAll(nodes=>Object.fromEntries(nodes.map(node=>[node.closest('[data-resource]').dataset.resource,node.value])));
  const ids=['echoes','tuners','premium','advanced','medium','basic'];
  const names=['Echoes','Premium Tuner','Premium Sealed Tube','Advanced Sealed Tube','Medium Sealed Tube','Basic Sealed Tube'];
  assert.equal(await page.locator('#resourceInventory input').count(),6);
  assert.equal(await page.locator('#settings .resource-section h3').count(),0,'Remove visible Resources heading');
  assert.deepEqual(await page.locator('#resourceInventory .resource-grid-headings span').allTextContents(),['Echoes','Tuners','Tubes']);
  assert.equal(await page.locator('#resourceInventory .resource-compact-grid > label').count(),6);
  assert.equal(await page.locator('#resourceInventory .resource-tube-heading').count(),0,'Old Sealed Tubes heading removed');
  const compactGrid=await page.locator('#resourceInventory').evaluate(root=>{
    const inputs=[...root.querySelectorAll('input')].map(el=>el.getBoundingClientRect());
    const grid=root.querySelector('.resource-compact-grid').getBoundingClientRect();
    return {
      widths:inputs.map(rect=>rect.width),
      topOffsets:inputs.map(rect=>rect.top-inputs[0].top),
      fits:inputs.every(rect=>rect.left>=grid.left-1&&rect.right<=grid.right+1),
      noOverlap:inputs.every((rect,index)=>!index||rect.left>=inputs[index-1].right+3),
      labelsVisible:[...root.querySelectorAll('.resource-grid-headings span')].every(el=>el.scrollWidth<=el.clientWidth+1),
      gridHeight:grid.height,
    };
  });
  assert.ok(compactGrid.topOffsets.every(offset=>Math.abs(offset)<1),'All six counts must align in one row');
  assert.ok(compactGrid.widths.every(width=>width>=40),'Six quantities must stay comfortably editable');
  assert.ok(compactGrid.fits&&compactGrid.noOverlap&&compactGrid.labelsVisible,'Resource headings and inputs must fit expanded Settings width');
  assert.ok(compactGrid.gridHeight<60,'Compact resource controls must not add a second input row');
  for(let i=0;i<ids.length;i++)assert.equal(await input(ids[i]).getAttribute('aria-label'),`${names[i]} available count`);
  assert.deepEqual(Object.values(await read()),Array(6).fill('0'));
  await input('echoes').click();await page.keyboard.press('Control+A');await page.keyboard.type('240');await page.keyboard.press('Enter');
  await input('tuners').fill('Unlimited');await input('tuners').press('Enter');
  assert.equal(await input('tuners').inputValue(),'∞');
  for(const [id,value] of [['premium','480'],['advanced','120'],['medium','60'],['basic','30']]){await input(id).fill(value);await input(id).press('Tab');}
  const values=await read();
  for(const invalid of ['-1','1.5','1e3','1,000','oops','','9007199254740992']) {
    await input('echoes').fill(invalid);await input('echoes').press('Enter');
    assert.equal(await input('echoes').inputValue(),'240','Rejected drafts must restore the previous valid quantity');
    assert.equal(await input('echoes').getAttribute('aria-invalid'),'true');
    assert.equal(await page.locator('#resourceError').isVisible(),true);
  }
  await input('echoes').press('Escape');assert.equal(await page.locator('#resourceError').isVisible(),false);
  assert.deepEqual(await read(),values);
  await input('basic').fill('∞');await input('basic').press('Enter');
  assert.equal(await input('basic').inputValue(),'∞');
  await input('basic').fill('0030');await input('basic').press('Enter');assert.equal(await input('basic').inputValue(),'30');
  await page.locator('#settingsToggle').click();await ensureSettings();assert.deepEqual(await read(),values);
  if(await page.locator('#characterToggle').getAttribute('aria-expanded')!=='true')await page.locator('#characterToggle').click();
  await page.locator('button[data-result-mode=simulation]').click();
  await page.locator('button[data-result-mode=character]').click();await ensureSettings();assert.deepEqual(await read(),values);
  await selectCardCharacter(page,'iuno');await ensureSettings();assert.deepEqual(await read(),values);
  await input('advanced').fill('77');await input('advanced').press('Enter');
  await selectCardCharacter(page,'augusta');await ensureSettings();
  assert.equal(await input('advanced').inputValue(),'77','Inventory must be shared across Characters');
  await page.locator('#reset').click();assert.equal(await input('advanced').inputValue(),'77','Character Reset must not reset shared inventory');
  await page.locator('.setting-mode button').filter({hasText:'Recommended'}).click();assert.equal(await input('advanced').inputValue(),'77');
  for(const id of ids){await input(id).fill('0');await input(id).press('Enter');}
  assert.deepEqual(Object.values(await read()),Array(6).fill('0'));
  await page.locator('#simulate').click();
  assert.deepEqual(Object.values(await read()),Array(6).fill('0'),'Illustrative Materials Used must not be deducted from inventory');
  const materials=await page.locator('#materialRows').textContent();assert.ok(materials.length>0);
  await input('tuners').fill('Unlimited');await input('tuners').press('Enter');
  assert.equal(await page.locator('#materialRows').textContent(),materials,'Available resources must not rewrite recorded consumption');
  const appearance=await page.locator('#resourceInventory').evaluate(root=>({
    images:[...root.querySelectorAll('img')].map(image=>({src:image.getAttribute('src'),loaded:image.complete&&image.naturalWidth>0})),
    labels:[...root.querySelectorAll('.resource-caption')].filter(node=>node.scrollWidth>node.clientWidth+1).map(node=>node.textContent),
    inputs:[...root.querySelectorAll('input')].map(node=>{const r=node.getBoundingClientRect();return {width:r.width,height:r.height,font:Number.parseFloat(getComputedStyle(node).fontSize)};}),
    width:root.getBoundingClientRect().width,height:root.getBoundingClientRect().height,
  }));
  assert.equal(appearance.images.length,5);assert.ok(appearance.images.every(image=>image.loaded&&image.src.includes('/resource-icons/')));
  assert.deepEqual(appearance.labels,[],'Canonical captions should fit');
  assert.ok(appearance.inputs.every(input=>input.width>=40&&input.height>=28&&input.font>=12));
  assert.ok(appearance.height<170,'Inventory should remain compact');
  assert.ok(await page.locator('.workshop').evaluate(node=>node.clientWidth)>=1000);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
  checks.push({label:'Resource inventory: direct edits, zero/Unlimited, rejected drafts, shared ownership, panel/mode retention and no fabricated deductions',width,appearance});
}
