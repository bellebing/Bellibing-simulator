// Node-only local review bridge. Private code is executed in its own checkout,
// never imported into the public bundle or exposed as a static asset.
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
export function createLocalTeamDpsHandler({engineDirectory,timeoutMs=30000,route='/local-review/team-dps',entry='scripts/team-dps/stdio.mjs',protocol='BELLIBING_LOCAL_TEAM_REVIEW_V1'}={}){
 let busy=false;
 const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
 return async(req,res,{origin})=>{
  const url=new URL(req.url,origin);if(url.pathname!==route)return false;
  const error=(status,reason)=>{json(res,status,{status:'PENDING',reason});return true;};
  if(url.search||req.method!=='POST')return error(405,'METHOD_REJECTED');
  if(req.headers.origin!==origin||req.headers['x-bellibing-review']!=='1')return error(403,'ORIGIN_REJECTED');
  if(!/^application\/json(?:;\s*charset=utf-8)?$/i.test(req.headers['content-type']??''))return error(415,'JSON_REQUIRED');
  let size=0;const chunks=[];
  try{for await(const chunk of req){size+=chunk.length;if(size>131072)return error(413,'REQUEST_BOUND');chunks.push(chunk);}}catch{return error(400,'INVALID_REQUEST');}
  let input;try{input=JSON.parse(Buffer.concat(chunks));}catch{return error(400,'INVALID_JSON');}
  if(input?.action==='status'&&Object.keys(input).length===1){json(res,200,{protocol,status:'LOCAL_REVIEW_ONLY'});return true;}
  if(busy)return error(429,'REVIEW_BUSY');busy=true;
  try{
   const output=await new Promise((ok,bad)=>{
    const child=spawn(process.execPath,['--experimental-strip-types',resolve(engineDirectory,entry)],{cwd:engineDirectory,stdio:['pipe','pipe','pipe']});
    let bytes=0,settled=false;const result=[];
    const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);req.off('aborted',aborted);res.off('close',aborted);error?bad(error):ok(value);};
    const aborted=()=>{child.kill();finish(Error('ABORTED'));};
    const timer=setTimeout(()=>{child.kill();finish(Error('TIMEOUT'));},timeoutMs);
    req.once('aborted',aborted);res.once('close',aborted);child.on('error',()=>finish(Error('UNAVAILABLE')));
    child.stdin.on('error',()=>{});child.stderr.resume();
    child.stdout.on('data',chunk=>{bytes+=chunk.length;if(bytes>65536){child.kill();finish(Error('OUTPUT_BOUND'));}else result.push(chunk);});
    child.on('close',code=>{try{const value=JSON.parse(Buffer.concat(result));if(value.protocol!==protocol||!value.result||code!==0&&value.result.status!=='PENDING')throw Error();finish(null,value);}catch{finish(Error('UNAVAILABLE'));}});
    child.stdin.end(JSON.stringify(input));
   });
   json(res,200,output);
  }catch{json(res,503,{status:'PENDING',reason:'LOCAL_REVIEW_UNAVAILABLE'});}finally{busy=false;}
  return true;
 };
}
