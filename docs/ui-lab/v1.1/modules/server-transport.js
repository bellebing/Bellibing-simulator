// Public HTTP transport only. No private runtime bytes or administrative token.
export const RUNTIME_PROTOCOL='BELLIBING_RUNTIME_V1';
export function createServerTransport({endpoint,fetchImpl=globalThis.fetch.bind(globalThis),id=()=>crypto.randomUUID(),timeoutMs=30000}={}){
 const base=new URL(endpoint,globalThis.location?.href??import.meta.url);
 if(base.username||base.password||base.search||base.hash||!base.pathname.endsWith('/runtime/v1/')||base.protocol!=='https:'&&!(base.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(base.hostname)))throw Error('INVALID_RUNTIME_ENDPOINT');
 let guest=null,guestRequest=null,lease=id(),revision=0,retired=false;const controllers=new Set();
 async function post(path,value,token,signal){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);controllers.add(controller);
  try{let response;const serializationStart=performance.now(),body=JSON.stringify(value),options={method:'POST',credentials:'omit',cache:'no-store',signal:signal?AbortSignal.any([signal,controller.signal]):controller.signal,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body};
   if(value.payload?.improve)performance.measure('bellibing-improve:serialize',{start:serializationStart,end:performance.now()});
   for(let attempt=0;attempt<2;attempt++){try{response=await fetchImpl(new URL(path,base),options);break;}catch(error){if(attempt||options.signal.aborted||retired)throw error;}}
   if(retired)throw Error('STALE_SANDBOX_RESPONSE');const responseStart=performance.now(),data=await response.json();if(value.payload?.improve)performance.measure('bellibing-improve:response',{start:responseStart,end:performance.now()});
   if(data.protocol!==RUNTIME_PROTOCOL)throw Error('INVALID_RUNTIME_RESPONSE');
   if(!response.ok)throw Error(data.reason??'RUNTIME_UNAVAILABLE');return data;
  }finally{clearTimeout(timer);controllers.delete(controller);}
 }
 async function authorize(action){
  if(guest&&guest.expiresAt<=Date.now()){if(action!=='start'&&revision>0)throw Error('RUNTIME_SESSION_EXPIRED');guest=null;lease=id();revision=0;}
  if(!guest){guestRequest??=post('guest',{}).then(value=>{if(typeof value.token!=='string'||!value.token||!Number.isSafeInteger(value.expiresAt)||value.expiresAt<=Date.now())throw Error('INVALID_RUNTIME_GUEST');guest=value;}).finally(()=>{guestRequest=null;});await guestRequest;}
 }
 return {kind:'SERVER',prepare:()=>authorize('team'),terminate(){retired=true;controllers.forEach(c=>c.abort());controllers.clear();guest=null;},async request(action,context,options,payload,signal){
  if(retired)throw Error('STALE_SANDBOX_RESPONSE');await authorize(action);
  const requestId=id(),prior=revision,body={id:requestId,lease,action,...(context===undefined?{}:{context}),...(options===undefined?{}:{options}),...(payload===undefined?{}:{payload}),expectedRevision:prior};
  const value=await post('compute',body,guest.token,signal);if(value.id!==requestId)throw Error('INVALID_RUNTIME_RESPONSE');
  if(!['metrics','team','export'].includes(action)){if(value.revision!==prior+1)throw Error('INVALID_RUNTIME_REVISION');revision=value.revision;}
  else if(action==='export'&&value.revision!==prior)throw Error('STALE_SANDBOX_RESPONSE');
  return value.result;
 }};
}
