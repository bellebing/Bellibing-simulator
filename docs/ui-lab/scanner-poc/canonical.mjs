// Runtime projection only: canonical catalogs remain owned by the existing source.
import {CHARACTER_CATALOG} from '../../../src/data/characters.ts';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=new URL('../../../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const echoes=read('docs/ui-prototypes/assets/echoes/browser-data.json');
const weapons=read('docs/ui-prototypes/assets/weapons/browser-data.json');
console.log(JSON.stringify({
  root:fileURLToPath(root),characters:CHARACTER_CATALOG.filter(c=>c.releaseStatus==='RELEASED').map(({id,name,element,weaponType})=>({id,name,element,weaponType})),
  echoes:echoes.echoes,sonataSets:echoes.sonataSets,statEditor:echoes.statEditor,
  weapons:weapons.weapons.filter(w=>w.releaseStatus==='RELEASED'),
  echoIcons:read('docs/ui-prototypes/assets/echoes/manifest.json').icons,
  weaponIcons:read('docs/ui-prototypes/assets/weapons/manifest.json').icons,
  characterArt:read('docs/ui-prototypes/assets/characters/hero-art/manifest.json').characters,
}));
