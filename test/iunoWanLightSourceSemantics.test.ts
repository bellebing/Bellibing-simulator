import assert from 'node:assert/strict';
import test from 'node:test';

import {
  IUNO_PASSIVE_FACTS,
  IUNO_PROVENANCE,
} from '../src/data/characterMechanics/iunoRawFacts.ts';

function passive(factId: string) {
  return IUNO_PASSIVE_FACTS.find((fact) => fact.factId === factId);
}

test('Iuno Lunar Cycle remains SELF and no longer owns recipient Wan Light stack semantics', () => {
  const lunarCycle = passive('iuno-forte-lunar-cycle');
  assert.ok(lunarCycle);
  assert.equal(lunarCycle.scope, 'SELF');
  assert.equal(lunarCycle.durationSeconds, 15);
  assert.equal(lunarCycle.maxStacks, null);
  assert.match(lunarCycle.effectSummary, /Absolute Fullness ends Lunar Cycle/);
  assert.match(lunarCycle.effectSummary, /separate Full Moon Domain lifecycle fact/);
});

test('Full Moon Domain Wan Light source fact owns receiving-Resonator shield stack lifecycle', () => {
  const wanLight = passive('iuno-full-moon-domain-wan-light-recipient');
  assert.ok(wanLight);
  assert.equal(wanLight.characterId, 'iuno');
  assert.equal(wanLight.verificationStatus, 'VERIFIED');
  assert.equal(wanLight.section, 'FORTE_CIRCUIT');
  assert.equal(wanLight.conditional, true);
  assert.equal(wanLight.scope, 'TEAM');
  assert.equal(wanLight.durationSeconds, 10);
  assert.equal(wanLight.maxStacks, 10);
  assert.match(wanLight.triggerSummary, /receiving Resonator/);
  assert.match(wanLight.triggerSummary, /Full Moon Domain/);
  assert.match(wanLight.triggerSummary, /gains a Shield/);
  assert.match(wanLight.effectSummary, /1 stack of Blessing of the Wan Light/);
  assert.match(wanLight.effectSummary, /0\.5s/);
  assert.match(wanLight.effectSummary, /4% all DMG Amplification/);
  assert.match(wanLight.effectSummary, /up to 10 stacks/);
  assert.match(wanLight.effectSummary, /lasts 10s/);
  assert.match(wanLight.effectSummary, /gaining a new stack resets the buff duration/);
  assert.match(wanLight.effectSummary, /Switching that Resonator off field removes all stacks/);
});

test('Iuno self Derivation Wan Light remains separate from Full Moon Domain recipient stacks', () => {
  const derivation = passive('iuno-inherent-derivation');
  assert.ok(derivation);
  assert.equal(derivation.scope, 'SELF');
  assert.equal(derivation.maxStacks, 5);
  assert.match(derivation.triggerSummary, /Intro Skill or Resonance Liberation/);
  assert.match(derivation.effectSummary, /Immediately gain 5 stacks of Blessing of the Wan Light/);
});

test('Iuno Wan Light source correction provenance includes current recipient cross-check', () => {
  assert.equal(IUNO_PROVENANCE.checkedAt, '2026-09-04');
  assert.ok(IUNO_PROVENANCE.sourceUrls.includes('https://www.prydwen.gg/wuthering-waves/characters/iuno'));
  assert.ok(IUNO_PROVENANCE.sourceUrls.includes('https://wutheringlab.com/character/iuno-build/'));
  assert.ok(IUNO_PROVENANCE.notes.some((note) => note.includes('receiving/active Resonator')));
  assert.ok(IUNO_PROVENANCE.notes.some((note) => note.includes('new stacks reset its duration')));
  assert.ok(IUNO_PROVENANCE.notes.some((note) => note.includes('Augusta')));
});
