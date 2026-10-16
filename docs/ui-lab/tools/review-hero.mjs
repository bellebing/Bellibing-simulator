import assert from 'node:assert/strict';
import { selectCardCharacter } from './review-character-card.mjs';

const documentBox = locator => locator.evaluate(node => { const r = node.getBoundingClientRect(); return { x:r.x + scrollX, y:r.y + scrollY, width:r.width, height:r.height }; });
export async function reviewHero(page, { width, variant, checks }) {
  await page.waitForFunction(() => document.documentElement.dataset.uiLabReady === 'true');
  if (await page.locator('#characterToggle').getAttribute('aria-expanded') !== 'true') await page.locator('#characterToggle').click();
  const workshop = await documentBox(page.locator('.workshop'));
  const weapon = await page.locator('.weapon').evaluate(node => { const r = node.getBoundingClientRect(); return [r.width,r.height,getComputedStyle(node).padding]; });
  for (const [id, rarity] of [['augusta',5], ['aalto',4], ['the-shorekeeper',5], ['jiyan',5], ['hsin',5]]) {
    if (id !== 'augusta') await selectCardCharacter(page,id);
    const hero = page.locator('.character-hero');
    assert.equal(await hero.getAttribute('data-hero'),variant);
    assert.equal(await hero.getAttribute('data-rarity'),String(rarity));
    const visual = await documentBox(hero.locator('.hero-visual'));
    const copy = await documentBox(hero.locator('.hero-copy'));
    const chain = await documentBox(hero.locator('.card-sequence'));
    assert.ok(copy.y >= visual.y + visual.height - .1, 'Identity must sit below artwork, not across the portrait');
    assert.ok(chain.y > visual.y + 15 && chain.y + chain.height <= visual.y + visual.height, 'Sequence must anchor near the artwork foot');
    assert.ok(chain.x > visual.x + visual.width * .75, 'Sequence must stay at the artwork edge');
    assert.equal(await hero.locator('.sequence-node').count(),6);
    assert.equal(await hero.locator('.seq-tag,.card-sequence small').count(),0,'No visible investment placeholders');
    assert.equal(await hero.locator('.sequence-node[data-state="unavailable"]').count(),6);
    assert.equal(await hero.locator('.sequence-node.is-active').count(),0);
    const sequenceOrder = await hero.locator('.sequence-node').evaluateAll(nodes => nodes.map(node => ({ level:Number(node.dataset.sequence), y:node.getBoundingClientRect().top, size:node.getBoundingClientRect().width, label:node.getAttribute('aria-label') })));
    assert.deepEqual(sequenceOrder.map(node=>node.level),[6,5,4,3,2,1]);
    assert.ok(sequenceOrder.every((node,index) => node.size>=30 && /unavailable/.test(node.label) && (!index || node.y>sequenceOrder[index-1].y)));
    assert.equal(await hero.locator('.hero-metadata .character-element img').count(),1);
    assert.equal(await hero.locator('.hero-visual .character-element').count(),0);
    if(id !== 'augusta') assert.equal(await hero.locator('.eyebrow').count(),0,'No fabricated epithet');
    if(id === 'hsin') {
      assert.equal(await hero.locator('.hero-visual>img.portrait-fallback').count(),1);
      const fallback = await documentBox(hero.locator('.hero-visual>img'));
      assert.ok(fallback.x>=visual.x && fallback.x+fallback.width<=visual.x+visual.width);
      assert.ok(fallback.y>=visual.y && fallback.y+fallback.height<=visual.y+visual.height);
    }
    // Text ranges must remain inside the identity region, with no wrapping into
    // Sequence/artwork or clipping at the narrowest expanded side-panel width.
    const textProblems = await hero.evaluate(node => [...node.querySelectorAll('.hero-copy h2,.hero-copy .eyebrow,.rarity-stars,.hero-metadata')].filter(item => {
      const r=item.getBoundingClientRect(),parent=node.querySelector('.hero-copy').getBoundingClientRect();
      return r.left<parent.left || r.right>parent.right+.5 || r.bottom>parent.bottom+.5 || item.scrollWidth>item.clientWidth+.5;
    }).map(item=>item.textContent));
    assert.deepEqual(textProblems,[]);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
    assert.deepEqual(await documentBox(page.locator('.workshop')),workshop,'Hero changed Workshop geometry');
    await page.waitForFunction(() => [...document.querySelectorAll('.character-hero img')].every(image=>image.complete&&image.naturalWidth>0));
    assert.equal(await hero.locator('img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0)),true);
  }
  await selectCardCharacter(page,'augusta');
  assert.deepEqual(await page.locator('.weapon').evaluate(node => { const r=node.getBoundingClientRect(); return [r.width,r.height,getComputedStyle(node).padding]; }),weapon,'Weapon presentation changed');
  const stats = page.locator('.stats-heading');
  const before = await documentBox(stats);
  await page.locator('#characterSkills summary').focus(); await page.keyboard.press('Space');
  assert.ok((await documentBox(stats)).y>before.y+100,'Skills must retain its existing in-flow expansion');
  await page.locator('#characterSkills summary').click();
  assert.deepEqual(await documentBox(stats),before);
  await page.locator('#characterToggle').click();
  assert.equal(await page.locator('.character-content').isVisible(),false);
  await page.locator('#characterToggle').click();
  assert.equal(await page.locator('.character-hero').getAttribute('data-hero'),variant);
  await page.evaluate(()=>scrollTo(0,0));
  checks.push({ label:'Hero alternatives: identity/art separation, bottom-anchored Sequence, accessible unknowns, canonical elements/rarity, 4/5-star and fallback art, long names, preserved Weapon/Skills/Workshop',width,variant });
}
