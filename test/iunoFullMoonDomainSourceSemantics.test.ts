import assert from 'node:assert/strict';
import test from 'node:test';

import {
  IUNO_FULL_MOON_DOMAIN_PROVENANCE,
  IUNO_PASSIVE_FACTS,
} from '../src/data/characterMechanics/iunoRawFacts.ts';

function passive(factId: string) {
  return IUNO_PASSIVE_FACTS.find((fact) => fact.factId === factId) ?? null;
}

test('Iuno canonical source keeps Lunar Cycle and Full Moon Domain as distinct timed lifecycles', () => {
  const lunarCycle = passive('iuno-forte-lunar-cycle');
  const domain = passive('iuno-full-moon-domain-lifecycle');
  const wanLight = passive('iuno-full-moon-domain-wan-light-recipient');

  assert.ok(lunarCycle);
  assert.equal(lunarCycle.name, 'Lunar Cycle');
  assert.equal(lunarCycle.scope, 'SELF');
  assert.equal(lunarCycle.durationSeconds, 15);
  assert.match(lunarCycle.effectSummary, /Absolute Fullness ends Lunar Cycle/);

  assert.ok(domain);
  assert.equal(domain.scope, 'TEAM');
  assert.equal(domain.durationSeconds, 30);
  assert.equal(domain.maxStacks, null);
  assert.match(domain.triggerSummary, /Absolute Fullness/);
  assert.match(domain.effectSummary, /does not end early when Iuno leaves the field/);
  assert.match(domain.effectSummary, /periodically restore HP and STA/);

  assert.ok(wanLight);
  assert.equal(wanLight.durationSeconds, 10);
  assert.equal(wanLight.maxStacks, 10);
  assert.notEqual(domain.factId, wanLight.factId);
});

test('Iuno Full Moon Domain duration carries narrow current-source provenance', () => {
  assert.equal(IUNO_FULL_MOON_DOMAIN_PROVENANCE.checkedAt, '2026-09-05');
  assert.ok(IUNO_FULL_MOON_DOMAIN_PROVENANCE.sourceUrls.includes('https://wutheringlab.com/character/iuno-build/'));
  assert.ok(IUNO_FULL_MOON_DOMAIN_PROVENANCE.sourceUrls.includes('https://wuthering.wiki/character_1410.html'));
  assert.ok(IUNO_FULL_MOON_DOMAIN_PROVENANCE.sourceUrls.includes('https://wuthering.gg/characters/iuno'));
  assert.ok(IUNO_FULL_MOON_DOMAIN_PROVENANCE.notes.some((note) => note.includes('Lunar Cycle Duration = 15s')));
  assert.ok(IUNO_FULL_MOON_DOMAIN_PROVENANCE.notes.some((note) => note.includes('Full Moon Domain Duration = 30s')));
});
