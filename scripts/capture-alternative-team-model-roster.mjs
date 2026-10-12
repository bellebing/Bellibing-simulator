/** Composition discovery only: imports the published roster, never runs rotations or DPS. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const sourceDir=resolve(process.argv[2]??''),output=process.argv[3];
if(!process.argv[2]||!output)throw Error('Usage: node scripts/capture-alternative-team-model-roster.mjs PINNED_RILEY_CHECKOUT OUTPUT');
const pin='195a22f1b7a1b55b953224e26742b896a719e1c3';
const head=readFileSync(sourceDir+'/.git/HEAD','utf8').trim();let actual=head;
if(head.startsWith('ref: ')){const ref=head.slice(5);try{actual=readFileSync(sourceDir+'/.git/'+ref,'utf8').trim();}catch{actual=readFileSync(sourceDir+'/.git/packed-refs','utf8').split('\n').find(l=>l.endsWith(' '+ref))?.split(' ')[0];}}
if(actual!==pin)throw Error('Wrong published source revision');
const {ALL_TEAMS}=await import(pathToFileURL(sourceDir+'/dist/src/teams.js').href);
const variants=new Map();const variantKey=l=>{if(!variants.has(l))variants.set(l,variants.size);return variants.get(l);};
const rows=ALL_TEAMS.map((t,index)=>({publisherRow:index,declarationIndex:t.from,members:t.loadouts.map((l,i)=>({sourceName:l.resonator.name,sourceMode:l.mode?.name??null,sourceLoadoutIndex:variantKey(l),isMainDamage:t.mdps[i]}))}));
const out={schemaVersion:1,role:'alternative-team.published-composition-discovery',capturedAt:'2026-10-12',sourceUrl:'https://github.com/riley31415/wuwa_calc/blob/'+pin+'/src/teams.ts',sourceCommit:pin,sourceTeamsSha256:createHash('sha256').update(readFileSync(sourceDir+'/src/teams.ts')).digest('hex'),authority:'PUBLISHED_MODEL_ROSTER_NOT_INDEPENDENT_GAMEPLAY_OR_RANKING_PROOF',rows};
writeFileSync(output,JSON.stringify(out,null,2)+'\n');console.log(`Captured ${rows.length} published composition rows. No calculation executed.`);
