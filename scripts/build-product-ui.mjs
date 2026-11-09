import {build} from 'esbuild';
import {readFileSync,writeFileSync,mkdirSync,cpSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
const source='docs/product-ui';
const styles=['candidate.css','refinement.css','workbench-concept.css','workbench-b.css'];
const art=['echo-60001215','echo-60000975','echo-60001615','echo-60000235','echo-60000285'];
export const PRODUCT_UI_ASSETS=[
 'build/legacy.html','inventory/legacy.html','teams/legacy.html','product-ui/bootstrap.js',
 ...['build','inventory','teams','navigation'].map(name=>'product-ui/'+name+'.js'),
 ...['base.css','inventory.css','team.css','navigation.css','default-loadouts.json'].map(name=>'product-ui/'+name),
 ...art.map(id=>'product-ui/build-candidate/echo-art/'+id+'-illustrated.png')
];
const paths=text=>text
 .replaceAll('/artifacts/build-ui-prototype/','../product-ui/')
 .replaceAll('/docs/ui-prototypes/','../ui-preview/')
 .replaceAll('../../ui-prototypes/','../ui-preview/')
 .replaceAll('/docs/ui-lab/inventory/art/','../inventory/art/')
 .replaceAll('/docs/ui-lab/v1.1/modules/default-loadouts.json','../product-ui/default-loadouts.json')
 .replaceAll('../v1/assets/','../sandbox/assets/');
export async function buildProductUI(directory='dist') {
 const output=resolve(directory,'product-ui');mkdirSync(output,{recursive:true});cpSync(join(source,'bootstrap.js'),join(output,'bootstrap.js'));
 const bundle=async(entry,name)=>build({entryPoints:[resolve(source,entry)],bundle:true,write:true,outfile:join(output,name+'.js'),format:'esm',platform:'browser',target:'es2022',minify:true,sourcemap:false,tsconfigRaw:{},plugins:[{name:'product-repository-inputs',setup(api){
  api.onResolve({filter:/ui-preview\/assets\/.*\.json$/},args=>({path:resolve('docs/ui-prototypes/assets',args.path.split('ui-preview/assets/')[1])}));
  api.onResolve({filter:/^\/docs\//},args=>({path:resolve('.'+args.path)}));
  api.onLoad({filter:/\.(?:js|mjs|ts)$/},args=>({contents:paths(readFileSync(args.path,'utf8')),loader:args.path.endsWith('.ts')?'ts':'js',resolveDir:dirname(args.path)}));
 }}]});
 // Bundling an import must resolve repository source before rewriting its asset
 // strings. Build source uses relative imports; raw review aliases resolve above.
 await bundle('build-candidate/workbench-b.js','build');
 await bundle('inventory-candidate/inventory.js','inventory');
 await bundle('team-candidate/team.js','teams');
 await bundle('product-navigation.js','navigation');
 const css=['docs/ui-lab/v1/style.css','docs/ui-lab/v1.1/lab.css','docs/ui-lab/v1.1/typography.css',...styles.map(name=>source+'/build-candidate/'+name)];
 writeFileSync(join(output,'base.css'),paths(css.map(p=>readFileSync(p,'utf8')).join('\n'))+'\n.bc-review{display:none}.bc-environment{inset:66px 0 0}.bc-nav{min-height:66px}.inventory-actions[hidden]{display:none!important}\n');
 for(const [from,to]of [['inventory-candidate/inventory.css','inventory.css'],['team-candidate/team.css','team.css'],['prototype-navigation.css','navigation.css']])writeFileSync(join(output,to),paths(readFileSync(join(source,from),'utf8')));
 cpSync('docs/ui-lab/v1.1/modules/default-loadouts.json',join(output,'default-loadouts.json'));
 mkdirSync(join(output,'build-candidate/echo-art'),{recursive:true});for(const id of art)cpSync(join(source,'build-candidate/echo-art',id+'-illustrated.png'),join(output,'build-candidate/echo-art',id+'-illustrated.png'));
 for(const [route,htmlFile,entry]of [['build','build-candidate/workbench-b.html','build'],['inventory','inventory-candidate/index.html','inventory'],['teams','team-candidate/index.html','teams']]) {
  const previous=join(directory,route,'index.html');cpSync(previous,join(directory,route,'legacy.html'));
  let html=readFileSync(join(source,htmlFile),'utf8').replace(/<base\b[^>]*>/g,'').replace(/<link rel="stylesheet"[^>]+>/g,'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
  const stylesheets=['base.css','navigation.css',...(route==='inventory'?['inventory.css']:route==='teams'?['team.css']:[])];
  html=html.replace('</head>',stylesheets.map(name=>'<link rel="stylesheet" href="../product-ui/'+name+'">').join('')+'<link rel="stylesheet" href="../inventory/integration.css"></head>');
  // Preserve the approved temporary Etna reference. No font substitution.
  html=html.replace('</head>','<link rel="stylesheet" href="https://db.onlinewebfonts.com/c/3c1a4128f95e2109303b045eda4bfe8a?family=Etna"></head>');
  html=html.replace('</body>','<script type="module" src="../product-ui/'+'bootstrap'+'.js"></script></body>');
  // The review-only controls are retained as hidden DOM hooks for the adapted
  // view; they no longer expose a second account/backup writer.
  writeFileSync(previous,paths(html));
 }
 for(const route of ['improve','sandbox']){
  const path=join(directory,route,'index.html');let html=readFileSync(path,'utf8').replace('class="workspace-header"','class="workspace-header bc-nav"');
  html=html.replace('</head>','<link rel="stylesheet" href="../product-ui/navigation.css"></head>').replace('</body>','<script type="module" src="../product-ui/navigation.js"></script></body>');
  writeFileSync(path,html);
 }
 console.log('Accepted product UI integrated; original Build, Inventory and Teams tools retained.');
 return PRODUCT_UI_ASSETS;
}
