// Release readiness only: OPTIONS performs no guest creation or compute work.
import {readFileSync,appendFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateSandboxRelease} from './sandbox-release.mjs';
const origin='https://bellebing.github.io';
export async function checkRuntimeRelease(record,{fetchImpl=globalThis.fetch}={}){
 validateSandboxRelease(record);
 if(record.status!=='SERVER_RUNTIME_V1')return {status:record.status,serverRequired:false};
 const response=await fetchImpl(new URL('guest',record.endpoint),{method:'OPTIONS',credentials:'omit',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000),headers:{Origin:origin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'Content-Type, Authorization','User-Agent':'Bellibing-Release-Readiness/1.0'}});
 const tokens=name=>(response.headers.get(name)??'').toLowerCase().split(',').map(s=>s.trim());
 if(response.status!==204||response.headers.get('Access-Control-Allow-Origin')!==origin||!tokens('Access-Control-Allow-Methods').includes('post')||!['authorization','content-type'].every(v=>tokens('Access-Control-Allow-Headers').includes(v)))throw Error('RUNTIME_RELEASE_NOT_READY');
 return {status:'SERVER_CONFIGURATION_REACHABLE',serverRequired:true};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const record=JSON.parse(process.env.RUNTIME_RELEASE_RECORD??readFileSync(process.argv[2]??'dist/sandbox/engine-release.json','utf8'));
 console.log(JSON.stringify(await checkRuntimeRelease(record)));
 if(process.env.GITHUB_OUTPUT)appendFileSync(process.env.GITHUB_OUTPUT,'runtime_release='+JSON.stringify(record)+'\n');
}
