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
