// Local static preview only. Never builds, stages, uploads or approves an engine.
import {createServer} from 'node:http';
import {readFile,realpath,stat} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const args=process.argv.slice(2),value=key=>{const i=args.indexOf(key);return i<0?null:args[i+1];};
if(args.some((arg,i)=>i%2===0&&!['--directory','--port'].includes(arg))||args.length%2)throw Error('Use --directory PATH and/or --port NUMBER');
const directory=await realpath(resolve(value('--directory')??'dist')),port=Number(value('--port')??8765);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid local preview port');
for(const file of ['index.html','build/index.html','sandbox/index.html','improve/index.html','review-build.json'])if(!(await stat(resolve(directory,file))).isFile())throw Error('STATIC_SIMULATOR_BUILD_REQUIRED');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
const server=createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
 if(![`127.0.0.1:${port}`,`localhost:${port}`].includes(req.headers.host)){res.writeHead(403).end();return;}
 try{
  let path=decodeURIComponent(new URL(req.url,`http://127.0.0.1:${port}`).pathname);if(path.endsWith('/'))path+='index.html';
  const file=await realpath(resolve(directory,'.'+path));
  if(!file.startsWith(directory+'/')){res.writeHead(403).end();return;}
  const data=await readFile(file);res.setHeader('Content-Type',types[extname(file)]??'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404).end();}
});
server.listen(port,'127.0.0.1',()=>console.log(`Build: http://127.0.0.1:${port}/build/\nSandbox: http://127.0.0.1:${port}/sandbox/\nImprove: http://127.0.0.1:${port}/improve/`));
