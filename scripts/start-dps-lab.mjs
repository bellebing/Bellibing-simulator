// Isolated localhost-only developer preview. Serves precisely three public
// DPS Lab assets and proxies precisely one private JSON/stdin endpoint.
// No scanner, account runtime, private worker or production deployment.
import {createServer} from 'node:http';
import {readFile,realpath} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createLocalTeamDpsHandler} from './local-team-dps.mjs';

let port=8765,engineDirectory=null;
const args=process.argv.slice(2);
if(args.length%2)throw Error('Use --engine-directory PATH [--port NUMBER]');
for(let i=0;i<args.length;i+=2){
 if(args[i]==='--engine-directory')engineDirectory=args[i+1];
 else if(args[i]==='--port'&&/^\d+$/.test(args[i+1])&&Number(args[i+1])<=65535)port=Number(args[i+1]);
 else throw Error('Unknown DPS Lab preview option');
}
if(!engineDirectory)throw Error('Use --engine-directory PATH (private checkout required)');
const root=await realpath(resolve(engineDirectory));
const pkg=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
if(pkg.name!=='bellibing-engine-private')throw Error('Expected a private Bellibing engine checkout');

const handler=createLocalTeamDpsHandler({
 engineDirectory:root,route:'/local-review/dps-lab',
 entry:'scripts/team-dps/dps-lab-stdio.mjs',protocol:'BELLIBING_DPS_LAB_V1',timeoutMs:60000
});
const files=new Map([
 ['/dps-lab/',['../web/dps-lab/index.html','text/html; charset=utf-8']],
 ['/dps-lab/index.html',['../web/dps-lab/index.html','text/html; charset=utf-8']],
 ['/dps-lab/style.css',['../web/dps-lab/style.css','text/css; charset=utf-8']],
 ['/dps-lab/lab.js',['../web/dps-lab/lab.js','text/javascript; charset=utf-8']]
]);
let publicOrigin='';
const server=createServer(async(req,res)=>{
 const deny=(status)=>{res.writeHead(status,{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end();};
 // Host allowlist also prevents local DNS rebinding to this private gateway.
 if(req.headers.host!==new URL(publicOrigin).host)return deny(403);
 const url=new URL(req.url,publicOrigin);
 if(await handler(req,res,{origin:publicOrigin}))return;
 if(!['GET','HEAD'].includes(req.method))return deny(405);
 if(url.search||!files.has(url.pathname))return deny(404);
 const [file,type]=files.get(url.pathname);
 try{
  const contents=await readFile(new URL(file,import.meta.url));
  res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'"});
  res.end(req.method==='HEAD'?undefined:contents);
 }catch{deny(503);}
});
server.on('error',error=>{console.error('DPS Lab preview error:',error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>{
 publicOrigin='http://127.0.0.1:'+server.address().port;
 console.log('DPS Lab local preview: '+publicOrigin+'/dps-lab/');
});
process.once('SIGINT',()=>{handler.close();server.close();});
process.once('SIGTERM',()=>{handler.close();server.close();});
