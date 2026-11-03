"""Build a local browser proof from retained public scanner source.

Downloads only pinned WebAssembly dependencies, never owner images. Generated
files stay in ignored artifacts until browser/distribution acceptance.
"""
import hashlib
import importlib.util
import json
import shutil
import subprocess
import urllib.request
import zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/browser-scanner'
CACHE=ROOT.parent/'.cache/browser-scanner'
OUT.mkdir(parents=True,exist_ok=True)
CACHE.mkdir(parents=True,exist_ok=True)
runtime=ROOT/'node_modules/pyodide'
dependencies=json.loads((ROOT/'docs/ui-lab/scanner-poc/browser/dependencies.json').read_text())
if hashlib.sha256((runtime/'pyodide-lock.json').read_bytes()).hexdigest()!=dependencies['pyodideLockSha256']:
    raise RuntimeError('Pinned Pyodide dependency lock changed.')
for name in ['pyodide.js','pyodide.asm.js','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json']:
    (OUT/'runtime').mkdir(exist_ok=True)
    shutil.copyfile(runtime/name,OUT/'runtime'/name)
lock=json.loads((runtime/'pyodide-lock.json').read_text())
needed=set()
def include(name):
    if name in needed: return
    needed.add(name)
    for dependency in lock['packages'][name]['depends']: include(dependency)
for package in ['opencv-python','numpy']: include(package)
for name in needed:
    row=lock['packages'][name];path=CACHE/row['file_name']
    if not path.exists():
        urllib.request.urlretrieve('https://cdn.jsdelivr.net/pyodide/v0.29.3/full/'+row['file_name'],path)
    if hashlib.sha256(path.read_bytes()).hexdigest()!=row['sha256']: raise RuntimeError('WASM package integrity failed: '+name)
    shutil.copyfile(path,OUT/'runtime'/path.name)

scanner=ROOT/'docs/ui-lab/scanner-poc'
catalog=json.loads(subprocess.check_output(['node','--experimental-strip-types',str(scanner/'canonical.mjs')],cwd=ROOT,text=True))
catalog['root']='/scanner'
(OUT/'python').mkdir(exist_ok=True)
spec=importlib.util.spec_from_file_location('async_sources',scanner/'browser/async_sources.py')
adapter=importlib.util.module_from_spec(spec);spec.loader.exec_module(adapter)
files=[]
def write(path,data):
    target=OUT/path;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data);files.append(path)
for name,source in adapter.adapt(scanner,catalog).items(): write('python/'+name,source.encode())
write('python/catalog.json',json.dumps(catalog).encode())
for path in ['LICENSE','UPSTREAM.md','DEF_PERCENT_IMPORT.md']:
    write('python/'+path,(scanner/path).read_bytes())
for path in (scanner/'vendor/assets').glob('*.npy'): write('python/assets/'+path.name,path.read_bytes())
for path in (scanner/'vendor/Costs').glob('*.jpg'): write('python/Costs/'+path.name,path.read_bytes())
# Pure-Python RapidFuzz implementation from the pinned downloaded distribution.
wheel=dependencies['rapidfuzzWheel'];cached=CACHE/wheel['file']
if not cached.exists(): urllib.request.urlretrieve(wheel['url'],cached)
if hashlib.sha256(cached.read_bytes()).hexdigest()!=wheel['sha256']: raise RuntimeError('RapidFuzz dependency integrity failed.')
with zipfile.ZipFile(cached) as archive:
    for name in archive.namelist():
        if name.startswith('rapidfuzz/') and name.endswith('.py'):
            write('python/'+name,archive.read(name))
        elif '.dist-info/licenses/' in name:
            write('python/licenses/'+Path(name).name,archive.read(name))
for rows,key in [(catalog['echoIcons'],'targetPath'),(catalog['sonataSets'],'artPath'),(catalog['characterArt'],'targetPath'),(catalog['weaponIcons'],'targetPath')]:
    for row in rows:
        if row.get(key) and (ROOT/row[key]).is_file(): write('python/'+row[key],(ROOT/row[key]).read_bytes())
binding=hashlib.sha256(json.dumps({'dependencies':dependencies,'files':{path:hashlib.sha256((OUT/path).read_bytes()).hexdigest() for path in sorted(set(files))}},sort_keys=True).encode()).hexdigest()
(OUT/'binding.json').write_text(json.dumps({'binding':binding}))
prepared=CACHE/'features.npz';identity=CACHE/'features-binding.json'
if prepared.exists() and identity.exists() and json.loads(identity.read_text()).get('binding')==binding:
    if hashlib.sha256(prepared.read_bytes()).hexdigest()!=json.loads(identity.read_text()).get('sha256'): raise RuntimeError('Prepared SIFT cache integrity failed.')
    write('python/features.npz',prepared.read_bytes())
write('files.json',json.dumps(sorted(set(files))).encode())
for name in ['worker.js','client.mjs']:
    shutil.copyfile(scanner/'browser'/name,OUT/name)
ocr=OUT/'ocr';ocr.mkdir(exist_ok=True)
for name in ['tesseract.min.js','worker.min.js','tesseract.min.js.LICENSE.txt','worker.min.js.LICENSE.txt']:
    # External library source maps are intentionally not distributed.
    text=(ROOT/'node_modules/tesseract.js/dist'/name).read_text()
    text='\n'.join(line for line in text.splitlines() if 'sourceMappingURL=' not in line)
    (ocr/name).write_text(text)
for path in (ROOT/'node_modules/tesseract.js-core').glob('*.wasm*'): shutil.copyfile(path,ocr/path.name)
shutil.copyfile(ROOT/'node_modules/tesseract.js-core/LICENSE',ocr/'CORE_LICENSE')
shutil.copyfile(ROOT/'node_modules/@tesseract.js-data/eng/4.0.0/eng.traineddata.gz',ocr/'eng.traineddata.gz')
print('Prepared browser-local reuse proof: '+str(OUT))
