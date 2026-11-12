// Data-only bridge to the existing GPL Character Build scanner. Never touches AccountStore.
// A private-engine local launch starts one loopback scanner child; public dist stays unchanged.
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const scannerRoot=join(root,'docs','ui-lab','scanner-poc');
const maxBytes=5*1024*1024;
const unavailable='Character scanner is unavailable. Install its local Python/Tesseract prerequisites (docs/CHARACTER_IMPORT_LOCAL.md), then restart Bellibing Local. Your account is unchanged.';
const send=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};

async function freeLoopbackPort(){
 const server=createServer();
 await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});
 const port=server.address().port;
 await new Promise(ok=>server.close(ok));
 return port;
}

export async function startLocalCharacterScanner({env=process.env,python,script=join(scannerRoot,'serve.py'),port,spawnProcess=spawn}={}){
 let child=null,ready=false,closed=false,failed=false;
 const requested=port??Number(env.SCANNER_PORT??0);
 let scannerPort;
 const configured=python??env.SCANNER_PYTHON??[
  join(scannerRoot,'.venv',process.platform==='win32'?'Scripts/python.exe':'bin/python'),
  process.platform==='win32'?'python':'python3'
 ].find(p=>!p.includes('.venv')||existsSync(p));
 try {
  if(!Number.isInteger(requested)||requested<0||requested>65535||requested>0&&requested<1024)throw Error('Invalid scanner port.');
  scannerPort=requested||await freeLoopbackPort();
  if(!existsSync(script))throw Error('Scanner source missing.');
  child=spawnProcess(configured,[script,'--port',String(scannerPort)],{
   cwd:root,windowsHide:true,stdio:['ignore','ignore','inherit'],
   env:{...env,...(existsSync(join(scannerRoot,'tessdata','eng.traineddata'))?{TESSDATA_PREFIX:join(scannerRoot,'tessdata')}:{})}
  });
  child.on('error',()=>{ready=false;failed=true;});
  child.on('exit',()=>{ready=false;failed=true;});
 }catch{
  failed=true;
 }
 const probe=async()=>{
  if(closed||failed||ready||!child?.pid)return;
  try{
   const r=await fetch('http://127.0.0.1:'+scannerPort+'/api/catalog',{signal:AbortSignal.timeout(1200)});
   if(!closed&&!failed&&r.ok){
    const catalog=await r.json();
    ready=!!(catalog&&Array.isArray(catalog.characters)&&Array.isArray(catalog.weapons));
   }
  }catch{}
 };
 const interval=setInterval(()=>{void probe();},450);
 interval.unref();
 void probe();
 const close=()=>{if(closed)return;closed=true;ready=false;clearInterval(interval);child?.kill();};
 const handle=async(req,res,{origin})=>{
  const path=new URL(req.url,origin).pathname;
  if(!path.startsWith('/local-import/'))return false;
  if(req.headers.origin&&req.headers.origin!==origin){send(res,403,{error:'Same-origin local requests only.'});return true;}
  if(req.method!=='POST'||!['/local-import/scan','/local-import/validate'].includes(path)){
   send(res,405,{error:'Unsupported scanner operation.'});return true;
  }
  const mime=req.headers['content-type']?.split(';')[0];
  if(path.endsWith('/scan')&&!['image/jpeg','image/png'].includes(mime)||path.endsWith('/validate')&&mime!=='application/json'){
   send(res,415,{error:'Use a JPEG/PNG Character Build image or a JSON review.'});return true;
  }
  const declared=Number(req.headers['content-length']);
  if(!Number.isSafeInteger(declared)||declared<1||declared>maxBytes){
   send(res,413,{error:'Choose a Character Build image up to 5 MiB.'});return true;
  }
  if(!ready||closed||failed){send(res,503,{error:failed?unavailable:'Character scanner is starting. Try again shortly; your account is unchanged.'});return true;}
  try{
   const chunks=[];let size=0;
   for await(const chunk of req){
    size+=chunk.length;
    if(size>maxBytes){send(res,413,{error:'Image exceeds 5 MiB.'});return true;}
    chunks.push(chunk);
   }
   if(size!==declared){send(res,400,{error:'Incomplete image upload.'});return true;}
   const r=await fetch('http://127.0.0.1:'+scannerPort+'/api/'+(path.endsWith('/scan')?'scan':'validate'),{
    method:'POST',headers:{'Content-Type':mime},body:Buffer.concat(chunks),signal:AbortSignal.timeout(45000)
   });
   // An unexpected Python failure is an availability error, never an empty/HTML JSON response.
   const value=await r.json();
   if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid scanner response.');
   if(r.ok&&path.endsWith('/scan')&&(!value.draft||typeof value.draft!=='object'))throw Error('Missing scanner draft.');
   if(r.ok&&path.endsWith('/validate')&&!Array.isArray(value.issues))throw Error('Missing scanner issues.');
   send(res,r.status,value);
  }catch{send(res,503,{error:'Character scanner stopped responding. Your account is unchanged. Restart Bellibing Local and retry.'});}
  return true;
 };
 return {handle,close,status:()=>({ready,failed,closed,port:scannerPort})};
}
