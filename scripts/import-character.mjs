#!/usr/bin/env node
// Existing source-bound Character workflow; no inference/scraping and no second database.
// npm run import:character -- lily [--json] [--integrate] [--verify]
import {readFileSync, existsSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {CHARACTER_CATALOG} from '../src/data/characters.ts';
import {CHARACTER_ORIGINAL_RELEASE} from '../src/characterOriginalRelease.mjs';
import {getCharacterPreflight} from '../src/data/characterPreflight.ts';
import {characterRecommendations} from '../src/characterRecommendations.mjs';
import {improveProductEchoDefault} from '../src/improveProductEchoDefaults.mjs';
import {characterImportCoverage} from '../src/characterImportCoverage.mjs';

const usage = 'Usage: npm run import:character -- <canonical-id> [--json] [--integrate] [--verify] [--output path]';
const args=process.argv.slice(2);
if(!args.length || args.includes('--help')){console.log(usage);process.exit(args.includes('--help')?0:2);}
const id=args[0];
const knownFlags=new Set(['--json','--integrate','--verify','--output']);
for(let i=1;i<args.length;i++){
 if(!knownFlags.has(args[i]))throw Error('Unknown option '+args[i]+'\n'+usage);
 if(args[i]==='--output')i++;
}
if(!/^[a-z][a-z0-9-]*$/.test(id))throw Error('Use a canonical lower-case Character ID, e.g. lily.');
const json=args.includes('--json'),integrate=args.includes('--integrate'),verify=args.includes('--verify');
const outputIndex=args.indexOf('--output');
const output=outputIndex>=0?args[outputIndex+1]:null;
if(outputIndex>=0 && (!output || output.startsWith('--')))throw Error('--output needs a file path.');
const fromJson=path=>JSON.parse(readFileSync(path,'utf8'));
const root='docs/ui-prototypes/assets/';
const art=root+'characters/';
const files={
 builderManifest:root+'builder-icons/manifest.json',
 forteSource:'data/source/character-forte-ui.json',
 sequenceSource:'data/source/character-sequence-ui.json',
 buildStats:root+'build-stats/runtime-data.json',
 skillsRuntime:root+'skills-runtime.json',
 sequenceRuntime:root+'sequence-runtime.json',
 portraitManifest:art+'portraits/manifest.json',
 heroRuntime:art+'hero-art/runtime-data.json',
};
const sources=()=>{
 const payload={rawCatalog:CHARACTER_CATALOG,originalRelease:CHARACTER_ORIGINAL_RELEASE};
 for(const [name,path] of Object.entries(files))payload[name]=fromJson(path);
 payload.uiCatalog=undefined;
 // Generated catalog is a derived projection, not another source of raw facts.
 return payload;
};
async function report(){
 const data=sources();
 const mod=await import('../docs/ui-lab/v1.1/modules/catalog.js?character-import-check='+Date.now());
 data.uiCatalog=mod.CHARACTER_CATALOG;
 data.recommendations=characterRecommendations(id);
 data.improveConfiguration=improveProductEchoDefault(id);
 const preflight=getCharacterPreflight(id,'DPS_MODEL');
 data.publicDpsPreflight=preflight?{ready:preflight.ready,blockers:preflight.blockers.map(c=>({area:c.area,status:c.status}))}:null;
 // Published source review rows only; they cannot be treated as imported gameplay.
 const evidencePath='data/research/character-import/'+id+'.json';
 if(existsSync(evidencePath))data.publishedEvidence={[id]:fromJson(evidencePath)};
 return characterImportCoverage(id,data,{asOf:new Date().toISOString().slice(0,10)});
}
function command(command,args){
 const ran=spawnSync(command,args,{stdio:'inherit',env:process.env});
 if(ran.error)throw ran.error;
 if(ran.status!==0)throw Error('Command failed ('+ran.status+'): '+command+' '+args.join(' '));
}
let coverage=await report();
if(integrate){
 // Only regenerate existing projections if original canonical facts and
 // reviewed icon/skill/sequence inputs exist. No defaults or partial promotion.
 const needed=['canonicalIdentity','originalRelease','releasedAndVerified','level90',
   'sourceAssets','forteSource','sequenceSource'];
 const blockers=needed.filter(key=>coverage.checks[key].status!=='PASS');
 if(blockers.length)throw Error('Cannot integrate '+id+'; source gates Pending: '+blockers.join(', '));
 const node=process.execPath,flags=['--experimental-strip-types'];
 for(const script of [
   'scripts/export-ui-build-stats-runtime.ts',
   'scripts/export-ui-character-builder-runtime.ts',
   'scripts/export-ui-skills-runtime.ts',
   'scripts/export-ui-character-hero-art-runtime.ts',
 ])command(node,[...flags,script]);
 command(node,['docs/ui-lab/tools/export-catalog.mjs']);
 command(node,[...flags,'scripts/export-character-database.ts']);
 coverage=await report();
}
if(json)console.log(JSON.stringify(coverage,null,2));
else {
 console.log('\nCharacter Import: '+id+' ('+(coverage.canonicalName??'not imported')+')');
 console.log('Catalog: '+coverage.catalogPresence+'; release: '+coverage.release.canonicalStatus+
   ' / '+(coverage.release.originalPatch??'?')+' / '+(coverage.release.originalDate??'?'));
 if(coverage.release.releaseNeedsReview)console.log('REVIEW: Canonical Upcoming status may be stale; source promotion required.');
 for(const [name,result] of Object.entries(coverage.checks))
   console.log(' '+(result.status==='PASS'?'PASS':'PENDING')+' '+name+(result.status==='PASS'?'':' — '+result.details));
 console.log('Character Usable: '+coverage.characterUsable+' ('+coverage.characterUsableReason+')');
 console.log('DPS Ready: '+coverage.dpsReady+' ('+coverage.dpsReason+')');
}
if(output){mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(coverage,null,2)+'\n');}
if(verify){
 command('npm',['test']);
 command('npm',['run','test:foundation']);
 command('npm',['run','build']);
 // Browser is an independent, explicitly required real Chromium product gate;
 // public CLI does not fabricate successful browser/private execution.
 console.log('Node/foundation/build completed. Character-specific Chromium, account roundtrip and private DPS remain separately gated.');
}
if(coverage.characterUsable!=='CHARACTER_USABLE')process.exitCode=3;
