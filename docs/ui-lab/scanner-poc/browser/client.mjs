// GPL-3.0. Shared request lifetime for the browser-local recognition proof.
export function createBrowserScanner({workerURL=new URL('./worker.js',import.meta.url),Worker=globalThis.Worker,timeoutMs=45000,onProgress=()=>{}}={}){
 let worker=null,busy=false;
 const stop=()=>{worker?.terminate();worker=null;};
 async function request(action,input,{signal}={}){
  if(busy)throw Error('SCANNER_BUSY');if(signal?.aborted)throw Error('SCANNER_ABORTED');
  busy=true;worker??=new Worker(workerURL);const active=worker,id=crypto.randomUUID();
  try{return await new Promise((resolve,reject)=>{
   let timer;const clear=()=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);active.onmessage=null;active.onerror=null;};
   const fail=message=>{clear();stop();reject(Error(message));},abort=()=>fail('SCANNER_ABORTED');
   signal?.addEventListener('abort',abort,{once:true});timer=setTimeout(()=>fail('SCANNER_TIMEOUT'),timeoutMs);
   active.onerror=()=>fail('SCANNER_WORKER_FAILED');
   active.onmessage=({data})=>{if(data.progress){onProgress(data.progress);return;}if(data.id!==id)return;clear();if(data.error)reject(Error(data.error));else resolve(data.result);};
   const transfer=input?.bytes?[input.bytes]:[];active.postMessage({id,action,...input},transfer);
  });}finally{busy=false;}
 }
 return {async scan(file,options){
  if(!['image/jpeg','image/png'].includes(file.type)||file.size>5*1024*1024||file.size===0)throw Error('Choose a JPEG/PNG card up to 5 MiB.');
  const bitmap=await createImageBitmap(file);const valid=bitmap.width===1920&&bitmap.height===1080;bitmap.close();if(!valid)throw Error('Use the original 1920×1080 Discord card.');
  return request('scan',{bytes:await file.arrayBuffer()},options);
 },validate:(draft,options)=>request('validate',{draft},options),status:options=>request('status',{},options),
 diagnoseOCR:async(file,options)=>request('ocr-smoke',{bytes:await file.arrayBuffer()},options),regressions:()=>request('regressions',{}),exportFeatures:()=>request('export-features',{}),close:stop};
}
