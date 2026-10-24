// Bounded development checks. Never substitutes for exact-head FULL.
import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {resolve,dirname,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync,spawnSync} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const imports=text=>[...text.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["']([^"']+)["']/g)].map(m=>m[1]);
const local=(base,name)=>{const p=resolve(base,name);return [p,p.replace(/\.js$/,'.ts'),p+'.mjs',p+'.ts',p+'.js'].find(p=>existsSync(p)&&statSync(p).isFile());};
function closure(file,seen=new Set()){
 if(seen.has(file))return {paths:[],blocked:false};seen.add(file);
 if(!existsSync(file)||file.includes(sep+'.cache'+sep))return {paths:[file],blocked:true};
 if(file.endsWith('.json'))return {paths:[file],blocked:false};
 const source=readFileSync(file,'utf8'),paths=[file];let blocked=/\b(?:execFileSync|execSync|spawnSync|playwright|Miniflare)\b/.test(source);
 for(const name of imports(source)){
  if(name.startsWith('node:'))continue;
  if(!name.startsWith('.')){blocked=true;continue;}
  const child=local(dirname(file),name);if(!child){blocked=true;continue;}const next=closure(child,seen);paths.push(...next.paths);blocked||=next.blocked;
 }
 return {paths,blocked};
}
export function planFast(files,{directory=root}={}){
 const changed=[...new Set(files)].sort();for(const file of changed){const p=resolve(directory,file);if(!p.startsWith(directory+sep))throw Error('INVALID_CHANGED_PATH');}
 const changedPaths=new Set(changed.map(p=>resolve(directory,p))),candidates=[],deferred=[];
 if(existsSync(resolve(directory,'test')))for(const name of readdirSync(resolve(directory,'test')).filter(n=>/\.test\.(mjs|js|ts)$/.test(n)).sort()){
  const path='test/'+name,info=closure(resolve(directory,path));
  if(!changed.includes(path)&&!info.paths.some(p=>changedPaths.has(p)))continue;
  if(path==='test/ci-fast.test.mjs'||!info.blocked)candidates.push(path);else deferred.push({path,reason:'PINNED_SOURCE_DEPENDENCY_OR_PROCESS_TEST'});
 }
 if(changed.some(p=>/^(?:\.github\/|scripts\/ci-fast|test\/ci-fast)/.test(p))&&existsSync(resolve(directory,'test/ci-fast.test.mjs'))&&!candidates.includes('test/ci-fast.test.mjs'))candidates.unshift('test/ci-fast.test.mjs');
 const allSyntax=changed.filter(p=>/\.(mjs|js|ts|json)$/.test(p)&&existsSync(resolve(directory,p)));
 const tests=candidates.slice(0,3);for(const path of candidates.slice(3))deferred.push({path,reason:'FAST_TEST_BUDGET_FULL_STILL_REQUIRED'});
 return {level:'FAST',fullRequiredForMerge:true,risk:changed.some(p=>/^(?:src|research|data)\//.test(p))?'DOMAIN_OR_RUNTIME':changed.some(p=>/^\.github\//.test(p))?'CI':changed.some(p=>/\.(?:js|mjs|ts|css|html)$/.test(p))?'RUNTIME_OR_PRESENTATION':'DOCS',changed,syntax:allSyntax.slice(0,24),deferredSyntax:allSyntax.slice(24),tests,deferred};
}
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});
async function changedFiles(){
 if(process.argv.includes('--worktree'))return (git('diff','--name-only','-z','HEAD')+git('ls-files','--others','--exclude-standard','-z')).split('\0').filter(Boolean);
 const event=process.env.GITHUB_EVENT_PATH?JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH,'utf8')):{};
 const head=event.pull_request?.head?.sha??git('rev-parse','HEAD').trim();
 const base=event.action==='synchronize'&&event.before?event.before:event.pull_request?.base?.sha??git('rev-parse','HEAD^').trim();
 if(!/^[a-f0-9]{40}$/.test(base)||!/^[a-f0-9]{40}$/.test(head))throw Error('INVALID_DIFF_IDENTITY');
 try{return git('diff','--name-only','-z',base,head).split('\0').filter(Boolean);}catch{
  const repo=process.env.GITHUB_REPOSITORY;if(!/^[\w.-]+\/[\w.-]+$/.test(repo??'')||!process.env.GITHUB_TOKEN)throw Error('DIFF_BASE_UNAVAILABLE');
  const response=await fetch(`https://api.github.com/repos/${repo}/compare/${base}...${head}`,{headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,Accept:'application/vnd.github+json'}});
  if(!response.ok)throw Error('DIFF_METADATA_UNAVAILABLE');const data=await response.json();
  if(!Array.isArray(data.files)||data.files.length>=300)throw Error('DIFF_TOO_LARGE_FOR_FAST_METADATA');
  return data.files.flatMap(f=>[f.filename,...(f.previous_filename?[f.previous_filename]:[])]);
 }
}
export async function runFast(){
 const plan=planFast(await changedFiles());console.log(JSON.stringify(plan));
 for(const file of plan.syntax){if(file.endsWith('.json'))JSON.parse(readFileSync(resolve(root,file),'utf8'));else{
  const result=spawnSync(process.execPath,['--experimental-strip-types','--check',resolve(root,file)],{cwd:root,stdio:'inherit',timeout:10000});if(result.status!==0)throw Error('FAST_SYNTAX_FAILED');
 }}
 for(const file of plan.tests){const result=spawnSync(process.execPath,['--experimental-strip-types','--test',resolve(root,file)],{cwd:root,stdio:'inherit',timeout:20000});if(result.status!==0)throw Error('FAST_FOCUSED_TEST_FAILED_OR_EXCEEDED_20S_BUDGET');}
 if(!process.argv.includes('--worktree')){
  const event=process.env.GITHUB_EVENT_PATH?JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH,'utf8')):{},base=event.action==='synchronize'?event.before:event.pull_request?.base?.sha;
  if(base&&/^[a-f0-9]{40}$/.test(base))try{git('diff','--check',base,'HEAD');}catch(error){if(!String(error.stderr??'').includes('bad object'))throw error;git('diff','--check','HEAD^','HEAD');}
 }else git('diff','--check');
 console.log('FAST completed. Deferred checks are not passed; exact-head FULL remains mandatory before merge.');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await runFast();
