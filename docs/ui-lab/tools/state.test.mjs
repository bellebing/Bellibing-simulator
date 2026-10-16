import { characterCardModel, forteMarkup, rarityClass, sequenceMarkup, heroVariation } from '../v1.1/modules/character-card.js';
import { CHARACTER_CATALOG, WEAPON_CATALOG } from '../v1.1/modules/catalog.js';
import { artworkOffset, artworkScale } from '../v1.1/modules/carousel-layout.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { getDemoState, previewSnapshot, inspectDemoStore, resetDemoState, visibleMaterials } from '../v1.1/modules/lab-state.js';
import { applyFeedbackScenario, workshopFeedbackFixture } from '../v1.1/modules/feedback-fixtures.js';
import { loadoutComposition } from '../v1.1/modules/sonata-summary.js';
import { clampPosition, snapTarget } from '../v1.1/modules/carousel-motion.js';
import { echoCard } from '../v1.1/modules/echo-card.js';

test('approved V1 source and artwork remain byte-identical', () => {
  const base = new URL('../v1/', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('baseline.json', base), 'utf8'));
  for (const [path, hash] of Object.entries(manifest.sha256)) {
    assert.equal(createHash('sha256').update(readFileSync(new URL(path, base))).digest('hex'), hash, path);
  }
});

test('previewing a catalog Character never creates a demo build', () => {
  const before = inspectDemoStore();
  assert.equal(previewSnapshot('jinhsi').hasBuild, false);
  assert.deepEqual(previewSnapshot('jinhsi').stats, ['—', '—', '—']);
  assert.deepEqual(inspectDemoStore(), before);
});

test('Character settings/slots are isolated and resetting one retains the other', () => {
  const augusta = getDemoState('augusta');
  const iuno = getDemoState('iuno');
  augusta.gate = '+20';
  augusta.selectedSlot = 3;
  augusta.scope = 'set';
  augusta.minima['CRIT Rate'] = 7;
  assert.equal(iuno.gate, '+5');
  assert.equal(iuno.selectedSlot, 0);
  assert.equal(iuno.scope, 'slot');
  assert.equal(iuno.minima['CRIT Rate'], 0);
  assert.equal(getDemoState('augusta'), augusta);
  resetDemoState('iuno');
  assert.equal(getDemoState('augusta').gate, '+20');
  assert.equal(getDemoState('augusta').minima['CRIT Rate'], 7);
  assert.notEqual(augusta.echoes[0], iuno.echoes[0]);
  assert.equal(getDemoState('augusta').scope, 'set');
  resetDemoState('augusta');
});

test('discard presentation distinguishes observed stops, unknowns and unplaced cards', () => {
  const echo = getDemoState('augusta').histories[0].at(-1);
  assert.equal(echo.level, 15);
  const html = echoCard(echo);
  assert.match(html, /DISCARDED/);
  assert.match(html, /DISCARDED AT \+15/);
  assert.equal((html.match(/Not rolled/g) ?? []).length, 2);
  assert.match(html, /<span>\+20<\/span><strong>Not rolled/);
  assert.match(html, /<span>\+25<\/span><strong>Not rolled/);
  const unplaced = echoCard({ ...echo, disposition: 'UNPLACED' });
  assert.doesNotMatch(unplaced, /DISCARDED|Not rolled/);
  const unknown = echoCard({ ...echo, level: null });
  assert.match(unknown, /DISCARDED · CHECKPOINT UNKNOWN/);
  assert.doesNotMatch(unknown, /Not rolled|\+null|\+undefined/);
});


test('materials distinguish recorded zero usage from unavailable quantities', () => {
  const records = [{ name: 'Unused Tube', count: 0 }, { name: 'Unknown Tube', count: null }, { name: 'Tuners', count: 120 }];
  assert.deepEqual(visibleMaterials(records), records.slice(1));
  assert.equal(records.length, 3, 'Filtering must not mutate the record');
  assert.deepEqual(getDemoState('iuno').materials, []);
});


test('feedback fixtures supply permissions, counts and recorded spending without automatic fixes', () => {
  const state = resetDemoState('augusta');
  assert.deepEqual(workshopFeedbackFixture(state).recordedMaterials, []);
  assert.equal(workshopFeedbackFixture(state).severity, 'ready');
  applyFeedbackScenario(state, 'warning');
  assert.equal(workshopFeedbackFixture(state).actionAllowed, true);
  assert.deepEqual(loadoutComposition(state.echoes).sets.map(set => set.count), [2, 2]);
  const equipment = structuredClone(state.echoes);
  const stats = structuredClone(state.stats);
  applyFeedbackScenario(state, 'result');
  assert.deepEqual(state.echoes, equipment, 'Recording a run cannot fix equipment');
  assert.deepEqual(state.stats, stats, 'A run record cannot calculate Character results');
  const recorded = structuredClone(state.materials);
  applyFeedbackScenario(state, 'error');
  const blocked = workshopFeedbackFixture(state);
  assert.equal(blocked.actionAllowed, false);
  assert.equal(loadoutComposition(state.echoes).cost, 15);
  assert.deepEqual(blocked.affectedSlots, [4]);
  assert.deepEqual(blocked.recordedMaterials, recorded, 'Invalid configuration cannot erase spending');
  applyFeedbackScenario(state, 'combination');
  assert.equal(workshopFeedbackFixture(state).actionAllowed, true);
  assert.deepEqual(workshopFeedbackFixture(state).affectedSlots, []);
  assert.match(workshopFeedbackFixture(state).title, /Pending/);
  resetDemoState('augusta');
});

test('composition uses equipped assignment counts and never asserts active bonuses', () => {
  const composition = loadoutComposition(getDemoState('augusta').echoes);
  assert.equal(composition.cost, 12);
  assert.equal(composition.count, 5);
  assert.deepEqual(composition.sets.map(set => [set.id, set.count]), [['sonata-20', 3], ['sonata-3', 2]]);
  assert.equal('activeEffects' in composition, false);
  const state = resetDemoState('iuno');
  applyFeedbackScenario(state, 'error');
  assert.equal(state.feedbackScenario, 'ready', 'Do not invent blockers for unsupported Character scenarios');
  applyFeedbackScenario(state, 'result');
  assert.equal(workshopFeedbackFixture(state).recordedMaterials, null, 'Unknown consumption is not zero');
  resetDemoState('iuno');
});


test('carousel position and momentum stay bounded across the full catalog', () => {
  assert.equal(clampPosition(-2, 58), 0);
  assert.equal(clampPosition(70, 58), 58);
  assert.equal(snapTarget(0, -.02, 58), 0);
  assert.equal(snapTarget(58, .02, 58), 58);
  assert.equal(snapTarget(4.2, .006, 58), 5);
  assert.equal(snapTarget(4.2, -.006, 58), 3);
  assert.ok(snapTarget(4.2, 5, 58) <= 6, 'Momentum must not fling through the catalog');
  assert.equal(snapTarget(4.2, .006, 58, true), 4, 'Reduced motion snaps to the nearest dragged position without a fling');
});

test('scaled artwork stays connected, recognizable and continuous at each position', () => {
  for (const width of [960, 1400, 1800]) {
    let previousInterval = Infinity;
    for (let index = 0; index < 8; index++) {
      const near = artworkOffset(index, width), far = artworkOffset(index + 1, width);
      const interval = far - near;
      const nearWidth = 252 * artworkScale(index), farWidth = 252 * artworkScale(index + 1);
      const gap = interval - (nearWidth + farWidth) / 2;
      assert.ok(interval > 0 && interval <= previousInterval + .001, 'Intervals should follow shrinking artwork');
      assert.ok(gap <= 4.001, 'Distant figures must not become disconnected');
      assert.ok(-gap / farWidth <= .3, 'Neighbors must remain recognizable');
      assert.ok(Math.abs(artworkOffset(index + 1 - .00001, width) - far) < .01, 'No position jump at snapping boundaries');
      assert.equal(artworkOffset(-index, width), -near);
      previousInterval = interval;
    }
  }
});

test('Character Card reads saved values and canonical equipment without inventing investment', () => {
  const person = CHARACTER_CATALOG.find(row => row.id === 'augusta');
  const state = resetDemoState('augusta');
  const model = characterCardModel(person, state);
  assert.equal(model.rarity, 5);
  assert.equal(model.weapon.id, 'thunderflare-dominion');
  assert.equal(model.weapon.rarity, 5);
  assert.equal(model.sequence, null);
  assert.equal((sequenceMarkup(person, null).match(/data-state="unavailable"/g) ?? []).length, 6);
  assert.equal((sequenceMarkup(person, 3).match(/data-state="active"/g) ?? []).length, 3);
  assert.equal((sequenceMarkup(person, 3).match(/data-state="inactive"/g) ?? []).length, 3);
  assert.equal(model.forte, null);
  const before = model.stats;
  state.stats[0][1] = 'untrusted simulated value';
  state.candidates = [];
  assert.deepEqual(characterCardModel(person, state).stats, before);
  const aalto = CHARACTER_CATALOG.find(row => row.id === 'aalto');
  const unknown = characterCardModel(aalto, getDemoState('aalto'));
  assert.equal(unknown.rarity, 4);
  assert.equal(unknown.weapon, null);
  assert.equal(unknown.weaponContext, null);
  const independent = characterCardModel(aalto, { ...state, id:'aalto' });
  assert.equal(independent.weapon.rarity, 5, 'Weapon rarity cannot follow Character rarity');
  assert.equal(independent.weaponContext, null, 'Character must not borrow equipment level/refinement');
  assert.equal(characterCardModel({...person,rarity:9},{...state,sequenceLevel:9}).rarity,null);
  assert.equal(rarityClass(undefined),'rarity-unknown');
  for (const rarity of [1,2,3,4,5]) assert.ok(WEAPON_CATALOG.some(weapon=>weapon.rarity===rarity));
  assert.match(forteMarkup(person,null),/Levels unavailable/);
  assert.doesNotMatch(forteMarkup(person,null),/>10</);
  assert.match(forteMarkup({...person,forte:null},null),/Skills unavailable/);
  const explicit = characterCardModel(person,{...state,sequenceLevel:3,forte:{schemaVersion:1,levels:{skill:6},enabled:{}}});
  assert.equal(explicit.sequence,3);
  assert.match(forteMarkup(person,explicit.forte),/data-skill-level="skill">6/);
  resetDemoState('augusta');
});

test('Hero alternatives are explicit and keep unknown Sequence state accessible without labels', () => {
  assert.equal(heroVariation(''), 'elegant');
  assert.equal(heroVariation('?hero=unknown'), 'elegant');
  assert.equal(heroVariation('?hero=elegant'), 'elegant');
  assert.equal(heroVariation('?hero=cinematic'), 'cinematic');
  const person = CHARACTER_CATALOG.find(row=>row.id==='augusta');
  const unknown = sequenceMarkup(person,null,{labels:false});
  assert.doesNotMatch(unknown,/seq-tag|<small>|Unknown|S6\?/);
  assert.equal((unknown.match(/aria-label="S[1-6] unavailable"/g)??[]).length,6);
  assert.equal((unknown.match(/data-state="unavailable"/g)??[]).length,6);
  assert.equal((sequenceMarkup(person,3,{labels:false}).match(/data-state="active"/g)??[]).length,3);
});

test('result roles remain independent, canonical recommendations never cross-fill and only explicit changes focus', async () => {
  const {simulationModel,changedResults} = await import('../v1.1/modules/simulation-model.js');
  const {focusFixture} = await import('../v1.1/modules/result-fixtures.js');
  const person = CHARACTER_CATALOG.find(row=>row.id==='augusta'), saved = resetDemoState('augusta');
  const before = structuredClone(saved), model = simulationModel(person,saved);
  assert.equal(model.rows.find(row=>row.id==='TOTAL_ATK').recommended,'2,407');
  assert.ok(model.rows.every(row=>row.expected===null && row.simulated===null));
  assert.equal(model.rows.find(row=>row.id==='TOTAL_HP').recommended,null);
  const fixture = focusFixture('augusta',{kind:'minimum',metric:'TOTAL_CRIT_RATE',tier:3});
  const next = simulationModel(person,saved,fixture.values);
  assert.deepEqual(changedResults(model,next,fixture.affected),fixture.affected);
  assert.deepEqual(changedResults(next,next,fixture.affected),[]);
  assert.deepEqual(changedResults(model,next,[{id:'TOTAL_ATK',role:'expected'}]),[]);
  assert.equal(focusFixture('augusta',{kind:'resources'}),null);
  assert.equal(focusFixture('aalto',{kind:'minimum',metric:'TOTAL_CRIT_RATE',tier:3}),null);
  saved.hasRecordedRun = true;
  const recorded = simulationModel(person,saved);
  assert.equal(recorded.rows.find(row=>row.id==='BASIC_ATTACK_DMG_BONUS').simulated,'0.0%');
  assert.ok(recorded.rows.every(row=>row.expected===null));
  saved.hasRecordedRun = false; assert.deepEqual(saved,before);
  const other = simulationModel(CHARACTER_CATALOG.find(row=>row.id==='aalto'),getDemoState('aalto'));
  assert.ok(other.rows.every(row=>row.recommended===null && row.expected===null && row.simulated===null));
});

test('canonical Settings placement retains dormant minima and explicit infeasible Flex intent', async () => {
  const {ECHO_SETTING_STATS}=await import('../v1.1/modules/settings-catalog.js');
  const {moveSettingStat,flexCountPresentation,editFlexCount,restoreRecommendedSettings}=await import('../v1.1/modules/settings-state.js');
  const state=resetDemoState('augusta');
  assert.equal(ECHO_SETTING_STATS.length,13);
  assert.deepEqual(state.statSections.hard,['CRIT Rate','CRIT DMG']);
  assert.deepEqual(state.statSections.flex,['ATK%','Heavy Attack DMG']);
  assert.equal(state.statSections.other[0],'Flat ATK');
  assert.equal(flexCountPresentation(state).message,'At least 1 of 2');
  state.minima['CRIT Rate']=7;
  moveSettingStat(state,'CRIT Rate','other');moveSettingStat(state,'CRIT Rate','flex');
  assert.equal(state.minima['CRIT Rate'],7);
  editFlexCount(state,3);
  moveSettingStat(state,'CRIT Rate','hard');
  assert.equal(state.flexCount,3);assert.equal(flexCountPresentation(state).valid,false);
  assert.throws(()=>editFlexCount(state,3));editFlexCount(state,2);
  const rows=Object.values(state.statSections).flat();
  assert.equal(new Set(rows).size,13);assert.deepEqual([...rows].sort(),ECHO_SETTING_STATS.map(row=>row.id).sort());
  state.gate='+20';restoreRecommendedSettings(state);
  assert.equal(state.gate,'+20');assert.equal(state.flexCount,1);assert.equal(state.minima['CRIT Rate'],0);
  assert.equal(state.erTarget.enabled,false);
  const other=resetDemoState('iuno');assert.deepEqual(other.statSections.hard,[]);assert.deepEqual(other.statSections.flex,[]);
  assert.equal(other.flexCount,null);assert.equal(restoreRecommendedSettings(other),false);
  resetDemoState('augusta');
});

test('ER Target presentation fails closed and distinguishes optional illustrative totals', async () => {
  const {erTargetPresentation}=await import('../v1.1/modules/settings-state.js');
  const base={characterId:'augusta',target:{enabled:true,valuePercent:120}};
  assert.equal(erTargetPresentation(base).status,'UNAVAILABLE');
  assert.equal(erTargetPresentation({...base,target:{enabled:false,valuePercent:120}}).status,'DISABLED');
  assert.equal(erTargetPresentation({...base,target:{enabled:true,valuePercent:null}}).status,'UNCONFIGURED');
  const total={status:'VERIFIED',characterId:'augusta',valuePercent:120};
  assert.equal(erTargetPresentation({...base,total}).status,'REACHED');
  assert.equal(erTargetPresentation({...base,total:{...total,valuePercent:119.9}}).status,'OUTSTANDING');
  assert.equal(erTargetPresentation({...base,total:{...total,characterId:'iuno'}}).status,'UNAVAILABLE');
  assert.equal(erTargetPresentation({...base,total:{...total,valuePercent:NaN}}).status,'UNAVAILABLE');
  assert.equal(erTargetPresentation({...base,total:{...total,status:'ILLUSTRATIVE'}}).status,'UNAVAILABLE');
  assert.deepEqual(erTargetPresentation({...base,total:{...total,status:'ILLUSTRATIVE'},allowIllustrative:true}),{status:'REACHED',isDemo:true,totalPercent:120});
});

test('Lab inventory reuses canonical validation and rejects drafts atomically outside Character state', async () => {
  const canonical=await import('../../../src/resourceInventory.ts');
  const browser=await import('../../assets/resourceInventory.js');
  const {createLabResourceInventory}=await import('../v1.1/modules/resource-state.js');
  const store=createLabResourceInventory(), initial=store.read();
  assert.deepEqual(initial,canonical.emptyResourceInventory());
  assert.deepEqual(browser.ECHO_TUBES,canonical.ECHO_TUBES);
  for(const text of ['0','240','00012','9007199254740991','∞','Unlimited',' unlimited ']) {
    assert.deepEqual(browser.parseInventoryQuantity(text),canonical.parseInventoryQuantity(text));
    store.set('echoes',text);
    assert.deepEqual(store.read().echoes,canonical.parseInventoryQuantity(text));
  }
  const before=store.read();
  for(const text of ['','-1','1.5','1e3','1,000','NaN','Infinity','9007199254740992']) {
    assert.throws(()=>canonical.parseInventoryQuantity(text));assert.throws(()=>store.set('echoes',text));assert.deepEqual(store.read(),before);
  }
  for(const id of ['tuners',...canonical.ECHO_TUBES.map(tube=>tube.id)])store.set(id,'0');
  assert.deepEqual(store.read().tuners,{kind:'FINITE',count:0});
  store.set('premium','Unlimited');assert.deepEqual(store.read().tubes.premium,{kind:'UNLIMITED'});
  const snapshot=store.read();snapshot.tubes.premium.kind='FINITE';assert.deepEqual(store.read().tubes.premium,{kind:'UNLIMITED'});
  resetDemoState('augusta');resetDemoState('iuno');assert.deepEqual(store.read().echoes,before.echoes);
  assert.equal(Object.hasOwn(getDemoState('augusta'),'resourceInventory'),false);
  assert.throws(()=>store.set('unknown','1'));
});

test('six Unlimited controls retain each last finite count through direct entry and rejection', async () => {
  const {createLabResourceInventory}=await import('../v1.1/modules/resource-state.js');
  const inventory=createLabResourceInventory();
  for(const id of ['echoes','tuners','premium','advanced','medium','basic']) {
    inventory.set(id,'37'); inventory.toggleUnlimited(id);
    const read=()=>inventory.read()[id]??inventory.read().tubes[id];
    assert.deepEqual(read(),{kind:'UNLIMITED'});
    assert.throws(()=>inventory.set(id,'-1'));assert.equal(read().kind,'UNLIMITED');
    inventory.toggleUnlimited(id);assert.deepEqual(read(),{kind:'FINITE',count:37});
    inventory.set(id,'0');inventory.set(id,'Unlimited');inventory.toggleUnlimited(id);
    assert.deepEqual(read(),{kind:'FINITE',count:0});
    inventory.set(id,'91');inventory.set(id,'∞');inventory.set(id,'Unlimited');inventory.toggleUnlimited(id);
    assert.equal(read().count,91);
  }
  assert.throws(()=>inventory.toggleUnlimited('unknown'));
});

test('resource cost roles require verified results and convert all canonical Tube denominations without ceiling', async () => {
  const {resourceCostValues}=await import('../v1.1/modules/resource-cost.js');
  assert.deepEqual(resourceCostValues(),[null,null,null]);
  assert.deepEqual(resourceCostValues({status:'ILLUSTRATIVE',echoes:99,tuners:99}),[null,null,null]);
  const record={status:'VERIFIED',echoes:0,tuners:20,tubes:{premium:2,advanced:3,medium:4,basic:5}};
  const before=JSON.stringify(record);
  assert.deepEqual(resourceCostValues(record),[0,20,4.5]);
  assert.equal(JSON.stringify(record),before);
  assert.deepEqual(resourceCostValues({...record,tubes:{premium:2}}),[0,20,null]);
  assert.deepEqual(resourceCostValues({...record,echoes:-1,tuners:Infinity,tubes:null}),[null,null,null]);
  assert.deepEqual(resourceCostValues({status:'VERIFIED',echoes:0,tuners:0,tubes:{premium:0,advanced:0,medium:0,basic:0}}),[0,0,0]);
});
