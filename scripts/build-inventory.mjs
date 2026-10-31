import {readFileSync,writeFileSync,mkdirSync,cpSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {workspaceHeader} from '../docs/ui-lab/v1.1/modules/workspace-navigation.js';
export function buildInventory(directory='dist'){
 const out=join(directory,'inventory');mkdirSync(out,{recursive:true});
 const source='docs/ui-lab/inventory';
 for(const name of ['account-session.js','integration.js'])writeFileSync(join(out,name),readFileSync(join(source,name),'utf8').replaceAll('../../../src/','./'));
 cpSync(join(source,'integration.css'),join(out,'integration.css'));
 cpSync(join(source,'art'),join(out,'art'),{recursive:true});
 for(const name of ['inventoryAccount.mjs','inventoryAccountStore.mjs'])cpSync(join('src',name),join(out,name));
 const characters=JSON.parse(readFileSync(join(directory,'data/character-database.json'),'utf8')).characters.filter(c=>c.releaseStatus==='RELEASED').map(({id,name,weaponType,element})=>({id,name,weaponType,element}));
 const echoes=JSON.parse(readFileSync('docs/ui-prototypes/assets/echoes/browser-data.json','utf8')),weapons=JSON.parse(readFileSync('docs/ui-prototypes/assets/weapons/browser-data.json','utf8'));
 const catalog={characters,echoes:echoes.echoes,sonataSets:echoes.sonataSets,statEditor:echoes.statEditor,weapons:weapons.weapons.filter(w=>w.releaseStatus==='RELEASED')};
 catalog.sourceBinding=createHash('sha256').update(JSON.stringify(catalog)).digest('hex');
 catalog.presentation=Object.fromEntries(['echo','weapon'].map(kind=>{const manifest=JSON.parse(readFileSync('docs/ui-prototypes/assets/'+(kind==='echo'?'echoes':'weapons')+'/manifest.json','utf8'));return [kind+'Icons',Object.fromEntries(manifest.icons.map(i=>[i[kind+'Id'],'../ui-preview/'+i.targetPath.replace('docs/ui-prototypes/','')]))];}));
 writeFileSync(join(out,'catalog.json'),JSON.stringify(catalog));
 const routes={build:'../build/',improve:'../improve/',sandbox:'../sandbox/'};
 writeFileSync(join(out,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bellibing · Inventory</title><link rel="stylesheet" href="../sandbox/workspace-navigation.css"><link rel="stylesheet" href="integration.css"></head><body class="product-workspace owned-page">${workspaceHeader(routes,'inventory')}<script type="module" src="integration.js"></script></body></html>`);
 for(const route of ['build','improve','sandbox']){const file=join(directory,route,'index.html');let html=readFileSync(file,'utf8').replace('</head>','<link rel="stylesheet" href="../inventory/integration.css"></head>').replace('</body>','<script type="module" src="../inventory/integration.js"></script></body>');if(route==='build')html=html.replace("['character','echoSlot']","['character','echoSlot','profile']");writeFileSync(file,html);}
}
