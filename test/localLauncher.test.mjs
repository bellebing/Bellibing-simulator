import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdtemp, mkdir, writeFile, rm, symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {request} from 'node:http';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {isInside} from '../scripts/local-paths.mjs';
import {artifactRelative} from '../scripts/verify-public-artifact.mjs';
import {startPreview} from '../scripts/preview-simulator-v1.mjs';
import {parseOptions, localGitEnvironment, findNpmCli, ensureCanonicalRevision} from '../scripts/start-bellibing-local.mjs';

test('Windows containment accepts spaces/Unicode; rejects siblings, traversal, UNC/drive escape', () => {
  const root = 'C:\\Bellibing lokal åäö\\site';
  for (const file of [root+'\\build\\index.html', 'c:\\Bellibing lokal åäö\\site\\sandbox\\engine-release.json']) assert.equal(isInside(root, file, path.win32), true);
  for (const file of [root, root+'2\\private.txt', 'C:\\Bellibing lokal åäö\\secret', 'D:\\site\\index.html', '\\\\server\\share\\index.html']) assert.equal(isInside(root, file, path.win32), false);
});
test('Windows module imports use the unchanged POSIX public allowlist; escapes stay outside it', () => {
  const root = 'C:\\Bellibing lokal\\dist';
  assert.equal(artifactRelative(root, root+'\\assets\\echoCore.js', path.win32), 'assets/echoCore.js');
  assert.equal(artifactRelative(root, 'C:\\Bellibing lokal\\private.js', path.win32), '../private.js');
});
test('launcher options and scoped Git configuration preserve unrelated configuration', () => {
  assert.equal(parseOptions(['--port','8877','--no-open']).port, 8877);
  assert.equal(parseOptions(['--no-open']).open, false);
  for (const args of [['--port','0'],['--port','NaN'],['--port'],['--unexpected']]) assert.throws(()=>parseOptions(args));
  const env = {GIT_CONFIG_COUNT:'1',GIT_CONFIG_KEY_0:'safe.directory',GIT_CONFIG_VALUE_0:'example'};
  const actual = localGitEnvironment(env);
  assert.equal(actual.GIT_CONFIG_COUNT,'2'); assert.equal(actual.GIT_CONFIG_VALUE_0,'example'); assert.equal(actual.GIT_CONFIG_KEY_1,'core.autocrlf'); assert.equal(actual.GIT_CONFIG_VALUE_1,'false');assert.equal(env.GIT_CONFIG_COUNT,'1');
  assert.match(findNpmCli(), /npm-cli\.js$/);
});
test('shallow checkout acquires the locked object without changing HEAD or working files', async () => {
  const parent=await mkdtemp(path.join(tmpdir(),'Bellibing shallow ')),source=path.join(parent,'source'),checkout=path.join(parent,'checkout');
  const env=localGitEnvironment(),git=(directory,args)=>execFileSync('git',args,{cwd:directory,env,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  try {
    await mkdir(source);git(source,['init']);await writeFile(path.join(source,'sample.txt'),'first\n');git(source,['add','.']);git(source,['-c','user.name=Local test','-c','user.email=local@example.invalid','commit','-m','first']);const pin=git(source,['rev-parse','HEAD']);
    await writeFile(path.join(source,'sample.txt'),'current\n');git(source,['add','.']);git(source,['-c','user.name=Local test','-c','user.email=local@example.invalid','commit','-m','current']);const head=git(source,['rev-parse','HEAD']);
    git(parent,['clone','--depth=1',pathToFileURL(source).href,checkout]);assert.throws(()=>git(checkout,['cat-file','-e',pin+'^{commit}']));
    ensureCanonicalRevision(checkout,source,pin,env);assert.equal(git(checkout,['rev-parse','HEAD']),head);assert.equal(git(checkout,['status','--porcelain']),'');git(checkout,['cat-file','-e',pin+'^{commit}']);
  } finally {await rm(parent,{recursive:true,force:true});}
});
function get(port, url, options={}) {
  return new Promise((ok,bad)=>{const req=request({host:'127.0.0.1',port,path:url,...options},res=>{let body='';res.on('data',d=>body+=d);res.on('end',()=>ok({status:res.statusCode,body,headers:res.headers}));});req.once('error',bad);req.end();});
}
test('real preview serves a spaced directory and blocks host/method/path/symlink escapes', async () => {
  const parent=await mkdtemp(path.join(tmpdir(),'Bellibing local åäö ')),directory=path.join(parent,'site');
  let server;
  try {
    for(const file of ['index.html','build/index.html','sandbox/index.html','improve/index.html','review-build.json']){await mkdir(path.dirname(path.join(directory,file)),{recursive:true});await writeFile(path.join(directory,file),file);}
    await writeFile(path.join(parent,'secret.txt'),'private');
    server=await startPreview({directory,port:0});const port=server.address().port;
    for(const route of ['/build/','/improve/','/sandbox/'])assert.equal((await get(port,route)).status,200);
    assert.equal((await get(port,'/build/',{method:'HEAD'})).body,'');
    assert.equal((await get(port,'/build/',{method:'POST'})).status,405);
    assert.equal((await get(port,'/build/',{headers:{host:'attacker.invalid'}})).status,403);
    assert.equal((await get(port,'/%5c..%5csecret.txt')).status,403);
    assert.equal((await get(port,'/%')).status,404);
    assert.notEqual((await get(port,'/../secret.txt')).body,'private');
    // Windows unprivileged symlinks require Developer Mode; junctions need no elevation.
    await symlink(parent,path.join(directory,'escape'),process.platform==='win32'?'junction':'dir');
    assert.equal((await get(port,'/escape/secret.txt')).status,403);
    await assert.rejects(startPreview({directory,port}),{code:'EADDRINUSE'});
  } finally {if(server){server.closeAllConnections();await new Promise(r=>server.close(r));}await rm(parent,{recursive:true,force:true});}
});
