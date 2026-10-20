import {workspaceHeader} from '../docs/ui-lab/v1.1/modules/workspace-navigation.js';
import {installSandboxRelease} from './sandbox-release.mjs';
// Public UI only. No private checkout, runtime or credentials are read here.
import {build} from 'esbuild';
import {readFileSync,writeFileSync,mkdirSync,readdirSync,cpSync,existsSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
export async function buildSandbox(directory='dist'){
 const out=resolve(directory,'sandbox');mkdirSync(out,{recursive:true});
 await build({entryPoints:['docs/ui-lab/v1.1/modules/app.js'],bundle:true,platform:'browser',format:'esm',target:'es2022',minify:true,sourcemap:false,outfile:join(out,'app.js')});
 const source='docs/ui-lab/v1.1',css=[...readFileSync(join(source,'index.html'),'utf8').matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m=>m[1]).filter(p=>!p.startsWith('https:')&&p!=='workspace-navigation.css');css.push('browser-beta.css','workspace-navigation.css');
 writeFileSync(join(out,'sandbox.css'),css.map(p=>readFileSync(resolve(source,p),'utf8')).join('\n').replaceAll('../v1/assets/','assets/').replaceAll('../../ui-prototypes/assets/','../ui-preview/assets/'));
 cpSync('docs/ui-lab/v1/assets',join(out,'assets'),{recursive:true});
 const inventory=JSON.parse(readFileSync('scripts/public-web-assets.json','utf8')),assets={};
 for(const p of inventory.filter(p=>p.startsWith('ui-preview/assets/')))assets[p.replace('ui-preview/assets/','../../ui-prototypes/assets/')]='../'+p;
 assets['../../ui-prototypes/v34-functional.html']='../ui-preview/index.html';
 for(const p of readdirSync('docs/ui-lab/v1/assets'))assets['../v1/assets/'+p]='assets/'+p;
 let html=readFileSync(join(source,'index.html'),'utf8').replace(/<link rel="stylesheet"[^>]+>/g,'').replace('</head>','<link rel="stylesheet" href="sandbox.css"></head>');
 html=html.replace('<script type="module" src="modules/app.js"></script>',`<script>globalThis.BELLIBING_WORKSPACE_ROUTES={build:'../build/',improve:'../improve/',sandbox:'../sandbox/'};globalThis.BELLIBING_LAB_ASSETS=${JSON.stringify(assets)};{const url=new URL(location.href);url.searchParams.set('sandbox','true');url.searchParams.set('execution','browser');url.searchParams.delete('demonstration');url.searchParams.delete('review');url.searchParams.delete('layout');history.replaceState(null,'',url);}</script><script type="module" src="app.js"></script>`).replaceAll('src="../v1/assets/','src="assets/').replaceAll('src="../../ui-prototypes/assets/','src="../ui-preview/assets/');
 html=html.replace('</h1>','</h1><p class="beta-boundary">Hypothetical builds · no account changes</p>');
 // The beta is hypothetical and has a real route back to the existing site.
 html=html.replace('class="brand" href="#"','class="brand" href="../"');
 const routes={build:'../build/',improve:'../improve/',sandbox:'../sandbox/'};
 html=html.replace(/<header class="site-header">[\s\S]*?<\/header>/,workspaceHeader(routes,'sandbox'));
 const builder=resolve(directory,'build');mkdirSync(builder,{recursive:true});
 writeFileSync(join(builder,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bellibing · Build a Character</title><link rel="stylesheet" href="../sandbox/workspace-navigation.css"><style>html,body{margin:0;height:100%;background:#050608}body{display:grid;grid-template-rows:auto minmax(0,1fr);height:100dvh;overflow:hidden}iframe{width:100%;height:100%;min-height:0;border:0;display:block}</style></head><body class="product-workspace">${workspaceHeader(routes,'build')}<iframe title="Character Builder" src="../ui-preview/?workspace=build"></iframe></body></html>`);
 cpSync(join(source,'workspace-navigation.css'),join(out,'workspace-navigation.css'));

 writeFileSync(join(out,'index.html'),html);installSandboxRelease(out);
 const improve=resolve(directory,'improve');mkdirSync(improve,{recursive:true});writeFileSync(join(improve,'index.html'),html.replace('aria-current="page"','').replace('data-workspace="improve"','data-workspace="improve" aria-current="page"').replace("url.searchParams.set('sandbox','true')","url.searchParams.set('sandbox','false')").replace('href="sandbox.css"','href="../sandbox/sandbox.css"').replace('src="app.js"','src="../sandbox/app.js"'));
 return ['build/index.html','sandbox/workspace-navigation.css','improve/index.html','sandbox/app.js','sandbox/index.html','sandbox/sandbox.css','sandbox/engine-release.json',...readdirSync('docs/ui-lab/v1/assets').map(p=>'sandbox/assets/'+p)];
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await buildSandbox(process.argv[2]??'dist');
