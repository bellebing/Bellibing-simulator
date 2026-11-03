// Conservative visual association only, derived from existing public canonical facts.
import { readFile } from 'node:fs/promises';
import { SONATA_EFFECT_MODELS } from '../../../src/data/sonataEffects.ts';
import { SONATA_CATALOG } from '../../../src/data/sonatas.ts';
import { ELEMENTAL_DESIGNS } from './elemental-designs.mjs';
export function projectSonataEnvironment(set, effects) {
    if (!set || set.releaseStatus !== 'RELEASED')
        return { environment: 'neutral', effectIds: [], reason: 'No reviewed visual association' };
    const matches = effects.filter(e => e.sonataSetId === set.id && e.pieces === 2 && e.effectType === 'PERMANENT' && e.appliesTo === 'SELF' && e.mechanicsStatus === 'VERIFIED_MODELED' && e.provenance?.sourceUrls?.length && ELEMENTAL_DESIGNS.some(d => e.statOrEffect === d.name + ' DMG Bonus'));
    const elements = [...new Set(matches.map(e => ELEMENTAL_DESIGNS.find(d => e.statOrEffect === d.name + ' DMG Bonus').id))];
    return elements.length === 1 ? { environment: elements[0], effectIds: matches.map(e => e.effectId), reason: 'Reviewed permanent elemental 2-piece bonus' } : { environment: 'neutral', effectIds: [], reason: 'No unique reviewed permanent elemental 2-piece association' };
}
export async function loadElementalSources() {
    const manifest = JSON.parse(await readFile(new URL('../../ui-prototypes/assets/builder-icons/manifest.json', import.meta.url), 'utf8'));
    const elements = ELEMENTAL_DESIGNS.map(d => { const row = manifest.elements.find(e => e.element === d.name); if (!row?.targetPath.startsWith('docs/ui-prototypes/assets/builder-icons/'))
        throw Error('Canonical element icon unavailable'); return { id: d.id, assetPath: row.targetPath.replace('docs/ui-prototypes/', '') }; });
    const sonatas = SONATA_CATALOG.filter(s => s.releaseStatus === 'RELEASED').map(s => ({ id: s.id, name: s.name, ...projectSonataEnvironment(s, SONATA_EFFECT_MODELS) })).sort((a, b) => a.name.localeCompare(b.name));
    return { role: 'visual.elemental-associations', elements, sonatas, qualification: 'Visual association only. No effect execution, recommendations or new gameplay data.' };
}
