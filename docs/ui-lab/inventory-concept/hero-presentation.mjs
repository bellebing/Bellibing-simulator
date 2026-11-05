// Isolated preview projection of the existing generated, source-backed Forte UI.
// No new skill identity, levels, gameplay mechanics or account state is authored here.
import { readFile } from 'node:fs/promises';
const root = new URL('../../ui-prototypes/', import.meta.url);
export async function loadHeroPresentation() {
    const runtime = JSON.parse(await readFile(new URL('assets/skills-runtime.json', root), 'utf8'));
    const characters = runtime.characters.filter(c => ['augusta', 'jiyan', 'calcharo'].includes(c.characterId));
    if (characters.length !== 3 || characters.some(c => c.status !== 'SOURCE_BACKED' || c.nodes.filter(n => n.kind === 'skill').length !== 5))
        throw Error('Hero Forte source presentation unavailable');
    return { schemaVersion: runtime.schemaVersion, role: runtime.role, provenance: runtime.provenance, characters };
}
