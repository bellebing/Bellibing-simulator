// Explicit loopback review only. Never copies engine bytes into public dist.
import {readFile,realpath} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {isInside} from './local-paths.mjs';
import {createLocalTeamDpsHandler} from './local-team-dps.mjs';

export async function localProductEngine(directory){
 const root=await realpath(resolve(directory));
 if(JSON.parse(await readFile(resolve(root,'package.json'),'utf8')).name!=='bellibing-engine-private')throw Error('Expected private engine checkout.');
 const output=await realpath(resolve(root,'.simulator-output/browser-beta'));
 if(!isInside(root,output))throw Error('Local engine output escapes its checkout.');
 const disclosure=JSON.parse(await readFile(resolve(output,'disclosure.json'),'utf8'));
 const file=disclosure.files?.[0];
 if(disclosure.status!=='PRIVATE_REVIEW_ONLY_NOT_APPROVED_FOR_PUBLICATION'||disclosure.files.length!==1||file.path!=='sandbox-engine.worker.js')throw Error('Prepare the existing local engine review build first.');
 const target=await realpath(resolve(output,file.path));if(!isInside(output,target))throw Error('Invalid local engine file.');
 const bytes=await readFile(target);
 if(bytes.length!==file.bytes||createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error('Local engine review hash mismatch.');
 const manifest={version:1,status:'LOCAL_REVIEW_ONLY',files:[{path:file.path,sha256:file.sha256,bytes:file.bytes}]};
 const team=createLocalTeamDpsHandler({engineDirectory:root});
 const improve=createLocalTeamDpsHandler({engineDirectory:root,route:'/local-review/improve-search',entry:'scripts/team-dps/improve-stdio.mjs',protocol:'BELLIBING_IMPROVE_SEARCH_V1',persistent:true,timeoutMs:600000});
 const advisor=createLocalTeamDpsHandler({engineDirectory:root,route:'/local-review/echo-advisor',entry:'scripts/echo-advisor-stdio.mjs',protocol:'BELLIBING_ECHO_ADVICE_V1'});
 return {async handle(req,res,context){
  if(await improve(req,res,context)||await advisor(req,res,context)||await team(req,res,context))return true;
  const path=new URL(req.url,context.origin).pathname;
  if(!['/sandbox/engine-release.json','/sandbox/sandbox-engine.worker.js'].includes(path))return false;
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return true;}
  res.writeHead(200,{'Content-Type':path.endsWith('.json')?'application/json':'text/javascript','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:path.endsWith('.json')?JSON.stringify(manifest):bytes);return true;
 },close(){improve.close();advisor.close();team.close();}};
}
