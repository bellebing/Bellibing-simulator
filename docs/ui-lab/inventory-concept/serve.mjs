import { HERO_VISTAS } from './hero-vistas.mjs';
import { loadElementalSources } from './elemental-sources.mjs';
import { ELEMENTAL_DESIGNS } from './elemental-designs.mjs';
// Local-only preview: expose exactly the concept files and its two public catalogs.
import { loadHeroPresentation } from './hero-presentation.mjs';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const files = new Map([
    ['/', [new URL('./index.html', import.meta.url), 'text/html']],
    ['/index.html', [new URL('./index.html', import.meta.url), 'text/html']],
    ['/concept.css', [new URL('./concept.css', import.meta.url), 'text/css']],
    ['/concept.js', [new URL('./concept.js', import.meta.url), 'text/javascript']],
    ['/hero-team.js', [new URL('./hero-team.js', import.meta.url), 'text/javascript']],
    ['/hero-team.css', [new URL('./hero-team.css', import.meta.url), 'text/css']],
    ['/ui-prototypes/assets/echoes/browser-data.json', [new URL('../../ui-prototypes/assets/echoes/browser-data.json', import.meta.url), 'application/json']],
    ['/ui-prototypes/assets/weapons/browser-data.json', [new URL('../../ui-prototypes/assets/weapons/browser-data.json', import.meta.url), 'application/json']]
]);
for (const id of ['augusta', 'jiyan', 'calcharo'])
    files.set('/ui-prototypes/assets/characters/hero-art/' + id + '.webp', [new URL('../../ui-prototypes/assets/characters/hero-art/' + id + '.webp', import.meta.url), 'image/webp']);
for (const id of ['augusta', 'jiyan', 'calcharo', 'iuno', 'the-shorekeeper', 'mortefi', 'verina', 'sanhua', 'baizhi'])
    files.set('/ui-prototypes/assets/characters/portraits/' + id + '.png', [new URL('../../ui-prototypes/assets/characters/portraits/' + id + '.png', import.meta.url), 'image/png']);
for (const name of ['room', 'study-figure', 'foreground'])
    files.set('/environment-study/' + name + '.png', [new URL('./environment-study/' + name + '.png', import.meta.url), 'image/png']);
files.set('/elemental-designs.mjs', [new URL('./elemental-designs.mjs', import.meta.url), 'text/javascript']);
files.set('/elemental-scene.mjs', [new URL('./elemental-scene.mjs', import.meta.url), 'text/javascript']);
for (const name of ELEMENTAL_DESIGNS.flatMap(e => [e.id, e.id + '-depth']))
    files.set('/elemental-art/' + name + '.webp', [new URL('./elemental-art/' + name + '.webp', import.meta.url), 'image/webp']);
files.set('/hero-vistas.mjs', [new URL('./hero-vistas.mjs', import.meta.url), 'text/javascript']);
for (const vista of HERO_VISTAS)
    for (const name of [vista.art, vista.art + '-depth'])
        files.set('/vista-art/' + name + '.webp', [new URL('./vista-art/' + name + '.webp', import.meta.url), 'image/webp']);
const presentation = await loadHeroPresentation();
const elemental = await loadElementalSources();
for (const e of elemental.elements)
    files.set('/ui-prototypes/' + e.assetPath, [new URL('../../ui-prototypes/' + e.assetPath, import.meta.url), 'image/webp']);
files.set('/forte-ui.mjs', [new URL('../../../src/characterForteUi.mjs', import.meta.url), 'text/javascript']);
for (const c of presentation.characters)
    for (const node of c.nodes) {
        if (!node.assetPath.startsWith('assets/builder-icons/'))
            throw Error('Unexpected Forte asset path');
        files.set('/ui-prototypes/' + node.assetPath, [new URL('../../ui-prototypes/' + node.assetPath, import.meta.url), 'image/webp']);
    }
const server = createServer(async (req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/elemental-presentation.json') {
        res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
        res.end(JSON.stringify(elemental));
        return;
    }
    if (pathname === '/hero-presentation.json') {
        res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
        res.end(JSON.stringify(presentation));
        return;
    }
    const item = files.get(pathname);
    if (!item) {
        res.writeHead(404);
        res.end('Not found');
        return;
    }
    try {
        res.writeHead(200, { 'content-type': item[1] + '; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
        res.end(await readFile(item[0]));
    }
    catch {
        res.writeHead(500);
        res.end('Preview unavailable');
    }
});
server.listen(Number(process.env.CONCEPT_PORT ?? 4179), '127.0.0.1', () => console.log('Bellibing concept preview ready'));
