import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { getDemoState, previewSnapshot, inspectDemoStore, resetDemoState } from '../v1.1/modules/lab-state.js';
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
  augusta.minima['CRIT Rate'] = 7;
  assert.equal(iuno.gate, '+5');
  assert.equal(iuno.selectedSlot, 0);
  assert.equal(iuno.minima['CRIT Rate'], 0);
  assert.equal(getDemoState('augusta'), augusta);
  resetDemoState('iuno');
  assert.equal(getDemoState('augusta').gate, '+20');
  assert.equal(getDemoState('augusta').minima['CRIT Rate'], 7);
  assert.notEqual(augusta.echoes[0], iuno.echoes[0]);
  resetDemoState('augusta');
});

test('discard presentation distinguishes observed stops, unknowns and unplaced cards', () => {
  const echo = getDemoState('augusta').histories[0].at(-1);
  assert.equal(echo.level, 15);
  const html = echoCard(echo);
  assert.match(html, /DISCARDED/);
  assert.match(html, /STOPPED AT \+15/);
  assert.equal((html.match(/Not rolled/g) ?? []).length, 2);
  assert.match(html, /<span>\+20<\/span><strong>Not rolled/);
  assert.match(html, /<span>\+25<\/span><strong>Not rolled/);
  const unplaced = echoCard({ ...echo, disposition: 'UNPLACED' });
  assert.doesNotMatch(unplaced, /DISCARDED|Not rolled|STOPPED AT/);
  const unknown = echoCard({ ...echo, level: null });
  assert.match(unknown, /STOPPING LEVEL UNKNOWN/);
  assert.doesNotMatch(unknown, /Not rolled|\+null|\+undefined/);
});
