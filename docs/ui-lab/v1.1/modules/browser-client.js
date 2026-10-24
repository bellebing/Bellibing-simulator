// Public platform adapter only. Reviewed engine bytes are supplied separately.
import {createServerTransport} from './server-transport.js';
export function createBrowserSandboxClient({readContext,onChange=()=>{},id=()=>crypto.randomUUID(),timeoutMs=10000}={}){
 let worker=null,loading=null,run=null,binding=null,generation=0,busy=false,serial=0;
 const requests=new Map(),current=()=>JSON.stringify(readContext());
 function stop(){worker?.terminate();worker=null;loading=null;for(const p of requests.values()){clearTimeout(p.timer);p.reject(Error('STALE_SANDBOX_RESPONSE'));}requests.clear();}
 function invalidate(){generation++;run=null;binding=null;busy=false;stop();onChange(null);}
 async function load(){if(worker)return worker;if(loading)return loading;const target=generation;loading=(async()=>{
  const manifest=await fetch(new URL('./engine-release.json',import.meta.url),{cache:'no-store'}).then(r=>r.json());
  if(manifest.status==='SERVER_RUNTIME_V1'){
   if(manifest.version!==1||manifest.files?.length!==0||!manifest.review)throw Error('BROWSER_RUNTIME_MANIFEST_INVALID');
   const service=createServerTransport({endpoint:manifest.endpoint,timeoutMs});
   if(target!==generation){service.terminate();throw Error('STALE_SANDBOX_RESPONSE');}
   worker=service;return service;
  }
  const review=manifest.status==='LOCAL_REVIEW_ONLY'&&['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  if(manifest.status!=='APPROVED_FOR_PUBLICATION'&&!review)throw Error('BROWSER_RUNTIME_RELEASE_PENDING');
  const file=manifest.files?.[0];if(manifest.files.length!==1||file.path!=='sandbox-engine.worker.js'||!/^[a-f0-9]{64}$/.test(file.sha256))throw Error('BROWSER_RUNTIME_MANIFEST_INVALID');
  const response=await fetch(new URL('./sandbox-engine.worker.js',import.meta.url));if(!response.ok)throw Error('BROWSER_RUNTIME_RELEASE_PENDING');const bytes=await response.arrayBuffer();
  const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');if(digest!==file.sha256)throw Error('BROWSER_RUNTIME_HASH_MISMATCH');
  if(target!==generation)throw Error('STALE_SANDBOX_RESPONSE');
  const blob=URL.createObjectURL(new Blob([bytes],{type:'text/javascript'}));worker=new Worker(blob,{type:'module'});URL.revokeObjectURL(blob);
  worker.onmessage=({data})=>{const p=requests.get(data.id);if(!p)return;requests.delete(data.id);clearTimeout(p.timer);data.error?p.reject(Error(data.error)):p.resolve(data.result);};
  worker.onerror=()=>{for(const p of requests.values())p.reject(Error('BROWSER_RUNTIME_FAILED'));stop();};return worker;
 })().catch(error=>{if(target===generation)loading=null;throw error;});return loading;}
 async function request(action,context,options){const g=generation,w=await load();if(g!==generation){w.terminate();throw Error('STALE_SANDBOX_RESPONSE');}if(w.kind==='SERVER')return w.request(action,context,options);return new Promise((resolve,reject)=>{const key=++serial,timer=setTimeout(()=>{requests.delete(key);reject(Error('BROWSER_COMPUTATION_LIMIT_PENDING'));stop();},timeoutMs);requests.set(key,{resolve,reject,timer});w.postMessage({id:key,action,context,options});});}
 async function action(kind,options){if(busy)throw Error('SANDBOX_REQUEST_IN_PROGRESS');const g=generation,b=current();binding=b;busy=true;try{const result=await request(kind,readContext(),options);if(g!==generation||b!==current())throw Error('STALE_SANDBOX_RESPONSE');run={...result,runId:result.status==='PENDING'?null:(options?.runId??run?.runId??id())};onChange(structuredClone(run));return structuredClone(run);}catch(error){if(g===generation&&b===current()&&error.message!=='STALE_SANDBOX_RESPONSE'){run={status:'PENDING',reasons:[error instanceof TypeError?'RUNTIME_UNAVAILABLE':error.message],view:null,runId:null};onChange(structuredClone(run));}throw error;}finally{if(g===generation)busy=false;}}
 return {execution:'BROWSER',start:({seed=id()}={})=>action('start',{seed,namespace:id(),runId:id()}),step:()=>action('step'),abort:()=>action('abort'),invalidate,
  checkFresh(){if(binding!==null&&binding!==current()){invalidate();return false;}return true;},snapshot:()=>structuredClone(run),isBusy:()=>busy,
  async metrics(){const g=generation,b=current();try{const result=await request('metrics',readContext());if(g!==generation||b!==current())throw Error('STALE_SANDBOX_RESPONSE');return result;}catch(error){if(error.message==='STALE_SANDBOX_RESPONSE')throw error;return {status:'PENDING',reasons:[error instanceof TypeError?'RUNTIME_UNAVAILABLE':error.message]};}},
  async reset(){invalidate();},async export(){if(!run?.runId||!this.checkFresh())throw Error('SANDBOX_RUN_REQUIRED');const g=generation,b=current(),result=await request('export');if(g!==generation||b!==current())throw Error('STALE_SANDBOX_RESPONSE');return result;}};
}
