// Same-origin local sandbox transport. No policy, evaluator or account owner.
export const SANDBOX_HTTP_PROTOCOL='BELLIBING_SANDBOX_HTTP_V1';
const clone=v=>structuredClone(v);
export function createSandboxClient({readContext,readEvaluationContext=()=>null,onChange=()=>{},fetcher=globalThis.fetch.bind(globalThis),id=()=>crypto.randomUUID()}={}){
 let guest=null,run=null,generation=id(),binding=null,busy=false,controller=null,guestRequest=null;
 const current=()=>JSON.stringify({context:readContext(),evaluationContext:readEvaluationContext()});
 function invalidate(){generation=id();binding=null;run=null;busy=false;controller?.abort();controller=null;onChange(null);}
 function assertCurrent(g,b){if(g!==generation||b!==current())throw Error('STALE_SANDBOX_RESPONSE');}
 async function request(path,{body,signal,key=id()}={}){
  const options={method:body===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',signal,
   headers:{...(body!==undefined?{'Content-Type':'application/json','Idempotency-Key':key}:{}),...(guest?{'X-CSRF-Token':guest.csrfToken}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})};
  let response;for(let attempt=0;attempt<2;attempt++){try{response=await fetcher('/sandbox/v1/'+path,options);break;}catch(error){if(attempt||error.name==='AbortError'||signal?.aborted)throw error;}}
  let data;try{data=await response.json();}catch{throw Error('LOCAL_SANDBOX_SERVICE_UNAVAILABLE');}
  if(!response.ok)throw Error(data.reasonCode??'SANDBOX_REQUEST_REJECTED');
  return data;
 }
 async function authorize(){if(!guest||(Number.isFinite(guest.expiresAt)?guest.expiresAt:Date.parse(guest.expiresAt))<=Date.now()){guestRequest??=request('guest',{body:{}}).then(data=>{if(data.protocol!==SANDBOX_HTTP_PROTOCOL||typeof data.csrfToken!=='string')throw Error('INVALID_SANDBOX_GUEST');guest=data;}).finally(()=>{guestRequest=null;});await guestRequest;}}
 function accept(data,g,b){assertCurrent(g,b);if(data.protocol!==SANDBOX_HTTP_PROTOCOL||data.clientGeneration!==g||(typeof data.runId!=='string'&&data.status!=='PENDING')||(data.status!=='PENDING'&&!Number.isSafeInteger(data.serverRevision)))throw Error('INVALID_SANDBOX_RESPONSE');run=clone(data);onChange(clone(run));return clone(run);}
 async function action(kind,{seed='phase5-augusta-5'}={}){
  if(busy)throw Error('SANDBOX_REQUEST_IN_PROGRESS');
  if(binding!==null&&binding!==current())invalidate();
  const g=generation,b=current();binding=b;busy=true;controller=new AbortController();const signal=controller.signal;
  try{await authorize(signal);assertCurrent(g,b);
   if(kind==='create')return accept(await request('runs',{body:{context:clone(readContext()),evaluationContext:clone(readEvaluationContext()),seed,clientGeneration:g},signal}),g,b);
   if(!run)throw Error('SANDBOX_RUN_REQUIRED');
   const prior=clone(run),data=await request(`runs/${encodeURIComponent(prior.runId)}/${kind}`,{body:{expectedRevision:prior.serverRevision},signal});if(data.runId!==prior.runId||data.serverRevision!==prior.serverRevision+1)throw Error('INVALID_SANDBOX_REVISION');return accept(data,g,b);
  }finally{if(g===generation){busy=false;controller=null;}}
 }
 return {start:options=>action('create',options),step:()=>action('step'),abort:()=>action('abort'),invalidate,
  checkFresh(){if(binding!==null&&binding!==current()){invalidate();return false;}return true;},
  snapshot:()=>clone(run),isBusy:()=>busy,
  async metrics(){const g=generation,b=current();await authorize();assertCurrent(g,b);const data=await request('metrics',{body:{context:clone(readContext()),evaluationContext:clone(readEvaluationContext()),clientGeneration:g}});assertCurrent(g,b);if(data.protocol!==SANDBOX_HTTP_PROTOCOL||data.clientGeneration!==g)throw Error('INVALID_SANDBOX_METRICS');return data;},
  async reset(){const old=run;invalidate();if(old&&guest)await request(`runs/${encodeURIComponent(old.runId)}/reset`,{body:{expectedRevision:old.serverRevision}});},
  async export(){if(!run||!this.checkFresh())throw Error('SANDBOX_RUN_REQUIRED');const g=generation,b=current();const data=await request(`runs/${encodeURIComponent(run.runId)}/export`);assertCurrent(g,b);return data;}
 };
}
