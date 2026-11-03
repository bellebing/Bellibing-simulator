import test from 'node:test';
import assert from 'node:assert/strict';
import { projectSonataEnvironment, loadElementalSources } from './elemental-sources.mjs';
import { SONATA_EFFECT_MODELS } from '../../../src/data/sonataEffects.ts';
import { SONATA_CATALOG } from '../../../src/data/sonatas.ts';
const fact = SONATA_EFFECT_MODELS.find(e => e.sonataSetId === 'sonata-3' && e.pieces === 2);
const set = SONATA_CATALOG.find(s => s.id === 'sonata-3');
test('reviewed explicit fact supports Electro even when the set name is unrelated', () => { assert.equal(projectSonataEnvironment({ ...set, name: 'Unrelated name' }, [fact]).environment, 'electro'); });
test('a suggestive name never manufactures elemental association', () => { assert.equal(projectSonataEnvironment({ ...set, id: 'unknown', name: 'Electro Ice Fire Storm' }, []).environment, 'neutral'); assert.equal(projectSonataEnvironment(null, [fact]).environment, 'neutral'); });
test('conditional, unverified, unsupported-scope or unsourced branches stay neutral', () => { for (const change of [{ pieces: 5 }, { effectType: 'CONDITIONAL' }, { appliesTo: 'TEAM' }, { mechanicsStatus: 'PENDING' }, { provenance: { sourceUrls: [] } }, { statOrEffect: 'ATK%' }])
    assert.equal(projectSonataEnvironment(set, [{ ...fact, ...change }]).environment, 'neutral', JSON.stringify(change)); assert.equal(projectSonataEnvironment({ ...set, releaseStatus: 'UNRELEASED_WIP' }, [fact]).environment, 'neutral'); });
test('ambiguous multiple-element facts fail closed rather than selecting a preferred element', () => { assert.equal(projectSonataEnvironment(set, [fact, { ...fact, effectId: 'other', statOrEffect: 'Aero DMG Bonus' }]).environment, 'neutral'); });
test('all actual projections join the canonical set identity and qualifying source effect IDs; non-element sets stay neutral', async () => { const p = await loadElementalSources(); assert.equal(p.elements.length, 6); for (const row of p.sonatas) {
    assert.equal(row.name, SONATA_CATALOG.find(s => s.id === row.id).name);
    for (const id of row.effectIds) {
        const e = SONATA_EFFECT_MODELS.find(e => e.effectId === id);
        assert.equal(e.sonataSetId, row.id);
        assert.equal(e.pieces, 2);
        assert.equal(e.statOrEffect, row.environment[0].toUpperCase() + row.environment.slice(1) + ' DMG Bonus');
    }
} for (const name of ['Moonlit Clouds', 'Rejuvenating Glow', 'Lingering Tunes'])
    assert.equal(p.sonatas.find(s => s.name === name).environment, 'neutral'); });
