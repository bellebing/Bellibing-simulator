import { loadElementalSources } from './elemental-sources.mjs';
import { ELEMENTAL_DESIGNS } from './elemental-designs.mjs';
// Produce a portable, offline concept for owner review; never a production build.
import { loadHeroPresentation } from './hero-presentation.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const here = new URL('./', import.meta.url);
const [html, css, js, echoes, weapons, heroCSS, heroJS] = await Promise.all([
    'index.html', 'concept.css', 'concept.js', '../../ui-prototypes/assets/echoes/browser-data.json', '../../ui-prototypes/assets/weapons/browser-data.json', 'hero-team.css', 'hero-team.js'
].map(path => readFile(new URL(path, here), 'utf8')));
const start = js.search(/const \[echoCatalog,\s*weaponCatalog\]/), end = js.indexOf('const app', start);
if (start < 0 || end < 0)
    throw Error('Concept catalog boundary changed');
// Script-safe JSON, with no account/private information or external asset dependency.
const safe = value => JSON.stringify(JSON.parse(value)).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const embeddedAssets = {};
const elemental = await loadElementalSources();
const sceneSource = await readFile(new URL('./elemental-scene.mjs', here), 'utf8');
const designSource = await readFile(new URL('./elemental-designs.mjs', here), 'utf8');
for (const e of ELEMENTAL_DESIGNS)
    for (const name of [e.id, e.id + '-depth'])
        embeddedAssets['elemental-art/' + name + '.webp'] = 'data:image/webp;base64,' + (await readFile(new URL('./elemental-art/' + name + '.webp', here))).toString('base64');
for (const e of elemental.elements)
    embeddedAssets[e.assetPath] = 'data:image/webp;base64,' + (await readFile(new URL('../../ui-prototypes/' + e.assetPath, here))).toString('base64');
const presentation = await loadHeroPresentation();
const forteSource = await readFile(new URL('../../../src/characterForteUi.mjs', here), 'utf8');
for (const path of new Set(presentation.characters.flatMap(c => c.nodes.map(n => n.assetPath))))
    embeddedAssets[path] = 'data:image/webp;base64,' + (await readFile(new URL('../../ui-prototypes/' + path, here))).toString('base64');
for (const id of ['augusta', 'jiyan', 'calcharo']) {
    const path = 'hero-art/' + id + '.webp';
    embeddedAssets[path] = 'data:image/webp;base64,' + (await readFile(new URL('../../ui-prototypes/assets/characters/' + path, here))).toString('base64');
}
for (const id of ['augusta', 'jiyan', 'calcharo', 'iuno', 'the-shorekeeper', 'mortefi', 'verina', 'sanhua', 'baizhi']) {
    const path = 'portraits/' + id + '.png';
    embeddedAssets[path] = 'data:image/png;base64,' + (await readFile(new URL('../../ui-prototypes/assets/characters/' + path, here))).toString('base64');
}
const script = ('globalThis.BELLIBING_ELEMENTAL_PRESENTATION=' + safe(JSON.stringify(elemental)) + ';\n' + 'globalThis.BELLIBING_HERO_PRESENTATION=' + JSON.stringify(presentation) + ';\n' + forteSource.replace(/^export /gm, '') + '\n' + 'globalThis.BELLIBING_CONCEPT_ASSETS=' + JSON.stringify(embeddedAssets) + ';\n') + js.slice(0, start) + `const echoCatalog=${safe(echoes)};\nconst weaponCatalog=${safe(weapons)};\n` + js.slice(end);
const bundledScript = script.replace(/import\s*\{\s*createHeroTeamConcept\s*\}\s*from\s*['"]\.\/hero-team\.js['"];?/, () => designSource.replace(/^export /gm, '') + '\n' + sceneSource.replace(/^export /gm, '') + '\n' + heroJS.replace(/^import .*from ['"][^'"]+['"];?\n/gm, '').replace(/^export /gm, ''));
const output = html.replace('<link rel="stylesheet" href="concept.css">', () => `<style data-concept-style="base">${css}</style>`)
    .replace('<link rel="stylesheet" href="hero-team.css">', () => `<style data-concept-style="hero">${heroCSS}</style>`)
    .replace('<script type="module" src="concept.js"></script>', () => `<script type="module">${bundledScript.replace(/<\/script/gi, '<\\/script')}</script>`);
if (output.includes('<link rel="stylesheet"') || output.includes('src="concept.js"') || /import .*from ['"]\.\//.test(output))
    throw Error('Portable dependencies were not embedded');
if (!output.includes('<style data-concept-style="base">' + css + '</style>') || !output.includes('<style data-concept-style="hero">' + heroCSS + '</style>'))
    throw Error('Packaged stylesheet mismatch');
const destination = resolve(process.argv[2] ?? '/tmp/bellibing-inventory-concept.html');
await writeFile(destination, output);
console.log(`Portable concept saved: ${destination}`);
