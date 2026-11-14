// GPL-3.0. Existing Python scanner runs inside this isolated browser worker.
// No private engine, filesystem account or image-upload endpoint is involved.
importScripts('./runtime/pyodide.js','./ocr/tesseract.min.js');
let ready=null,python=null,ocr=null;
const base=new URL('.',self.location.href).href;
async function initialize(){
 self.postMessage({progress:'OCR_START'});
 ocr=await Tesseract.createWorker('eng',1,{workerPath:base+'ocr/worker.min.js',corePath:base+'ocr',langPath:base+'ocr',workerBlobURL:false});
 self.postMessage({progress:'OCR_READY'});
 self.scannerOCR=async(value,config)=>{
  const data=value.toJs(),parameters={tessedit_pageseg_mode:'6',tessedit_char_whitelist:''};
  const psm=config.match(/--psm\s+(\d+)/);if(psm)parameters.tessedit_pageseg_mode=psm[1];
  const whitelist=config.match(/tessedit_char_whitelist=([^\s]+)/);if(whitelist)parameters.tessedit_char_whitelist=whitelist[1];
  await ocr.setParameters(parameters);return (await ocr.recognize(new Uint8Array(data))).data.text;
 };
 python=await loadPyodide({indexURL:base+'runtime/',stdout:()=>{},stderr:()=>{}});
 self.postMessage({progress:'PYTHON_READY'});
 await python.loadPackage(['numpy','opencv-python']);
 self.postMessage({progress:'OPENCV_READY'});
 const paths=await fetch(base+'files.json').then(r=>r.json());
 // Limit concurrent asset reads while retaining the existing canonical images.
 for(let i=0;i<paths.length;i+=12)await Promise.all(paths.slice(i,i+12).map(async path=>{
  const r=await fetch(base+path);if(!r.ok)throw Error('SCANNER_ASSET_MISSING');const dest='/scanner/'+path.slice('python/'.length);
  python.FS.mkdirTree(dest.slice(0,dest.lastIndexOf('/')));python.FS.writeFile(dest,new Uint8Array(await r.arrayBuffer()));
 }));
 self.postMessage({progress:'ASSETS_READY'});
 await python.runPythonAsync("import os, sys\nos.environ['RAPIDFUZZ_IMPLEMENTATION']='python'\nsys.path.insert(0, '/scanner')\nimport scanner, json, cv2\nassert hasattr(cv2, 'SIFT_create')");
 self.postMessage({progress:'RECOGNIZER_READY'});
}
self.onmessage=async({data})=>{const {id,action,bytes,draft}=data;try{
 if(!ready)ready=initialize();await ready;
 let result;if(action==='validate'){
  python.globals.set('draft_json',JSON.stringify(draft));result=await python.runPythonAsync('json.dumps({"issues":scanner.validate_draft(json.loads(draft_json))})');
 }else if(action==='scan'){
  python.globals.set('image_bytes',new Uint8Array(bytes));
  try{result=await python.runPythonAsync('json.dumps(await scanner.scan(bytes(image_bytes.to_py())))');}finally{python.globals.delete('image_bytes');}
 }else if(action==='export-features'){
  result=await python.runPythonAsync(`import io, base64
features={}
def add_features(prefix, values):
    for identity, (points, descriptors) in values.items():
        features[prefix+'::'+identity+'::points']=__import__('numpy').array([point.pt for point in points],dtype='float32')
        features[prefix+'::'+identity+'::descriptors']=descriptors
add_features('echoId',scanner.data.TEMPLATE_FEATURES)
add_features('id',scanner.data.ELEMENT_FEATURES)
add_features('Characters',scanner.card._load_asset_features('Characters',scanner.card.CHAR_SIFT_MAX_SIDE))
add_features('Weapons',scanner.card._load_asset_features('Weapons',scanner.card.WEAP_SIFT_MAX_SIDE))
feature_buffer=io.BytesIO()
__import__('numpy').savez_compressed(feature_buffer,**features)
json.dumps({"base64":base64.b64encode(feature_buffer.getvalue()).decode()})`);
 }else if(action==='regressions'){
  result=await python.runPythonAsync(`import unittest, inspect, test_scanner
suite=unittest.defaultTestLoader.loadTestsFromModule(test_scanner)
passed=0
failures=[]
for group in suite:
    for case in group:
        try:
            value=getattr(case,case._testMethodName)()
            if inspect.isawaitable(value): await value
            passed+=1
        except Exception as error:
            failures.append({"test":case._testMethodName,"error":str(error)})
json.dumps({"passed":passed,"failures":failures})`);
 }else if(action==='ocr-smoke'){
  python.globals.set('crop_bytes',new Uint8Array(bytes));try{result=await python.runPythonAsync("ocr_crop=cv2.imdecode(__import__('numpy').frombuffer(bytes(crop_bytes.to_py()),__import__('numpy').uint8),cv2.IMREAD_COLOR)\njson.dumps({'main':await scanner.card._main_strip_lines(ocr_crop),'batch':await scanner.card.tess_batch([ocr_crop,ocr_crop], '--psm 6')})");}finally{python.globals.delete('crop_bytes');}
 }else if(action==='status')result=JSON.stringify({status:'READY',sift:true});else throw Error('UNKNOWN_SCANNER_OPERATION');
 self.postMessage({id,result:JSON.parse(result)});
 }catch(error){self.postMessage({id,error:String(error.message??error).slice(-1000)});}};
