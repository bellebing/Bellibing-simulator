// Explicit source-hosted PM fixture. Not shipped in dist or production UI.
// Loads the actual same-head entrypoint with an iframe-local memory storage
// adapter installed before app initialization. No private evaluator or local policy.
const frame = document.getElementById('preview');
const revision = location.pathname.split('/').find(part => /^[a-f0-9]{40}$/.test(part));
document.getElementById('revision').textContent = revision ? 'Head ' + revision.slice(0, 12) : 'Local worktree';
const url = new URL('../v34-functional.html', import.meta.url);
const response = await fetch(url);
if (!response.ok) throw new Error('Exact-head UI unavailable');
const source = await response.text();
const storageAdapter = `<script>{const values=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:key=>values.get(String(key))??null,setItem:(key,value)=>values.set(String(key),String(value)),removeItem:key=>values.delete(String(key)),clear:()=>values.clear(),key:index=>[...values.keys()][index]??null,get length(){return values.size}}})}</script>`;
frame.srcdoc = source.replace('<head>', '<head><base href="' + url.href + '">' + storageAdapter);
const read = expression => frame.contentWindow.eval(expression);
await new Promise(resolve => frame.addEventListener('load', resolve, { once: true }));
const deadline = Date.now() + 30000;
while (!read('typeof improveUi!=="undefined"&&echoDataLoaded&&weaponDataLoaded&&characterMechanicsDataLoaded&&sequenceRuntimeDataLoaded&&buildStatsRuntimeLoaded&&window.bellibingEchoSimulator&&releasedCharacters.length===59')) {
  if (Date.now() >= deadline) throw new Error('Review canonical sources unavailable');
  await new Promise(resolve => setTimeout(resolve, 100));
}
read(`(()=>{
  addOwned('Augusta');
  const names=['Sigillum','Twin Nova: Collapsar Blade','Glommoth','Iceglint Dancer','Shadow Stepper'];
  names.forEach((name,index)=>{const item=echoCatalog.find(row=>row.name===name);commitEchoSlot('Augusta',index,makeEchoStatCard(item,item.sonataSetIds[0]))});
  autosave('Augusta',{weaponId:'thunderflare-dominion',sequenceLevel:1});show('improve');improvePicker.select('Augusta');
  localStorage.removeItem(KEY);
})()`);
const populate = () => read(`(()=>{
  const model=window.bellibingEchoSimulator;
  if(improveUi.simulator)improveUi.closeSimulation();improveUi.startSimulation();
  let s=model.selectSimulatorSlot(improveUi.simulator,5);
  const item=echoCatalog.find(row=>row.name==='Glommoth');
  function observe(depth){
    const identity={echoId:item.id,selectedSonataSetId:item.sonataSetIds[0]};s=model.startSimulatorCandidate(s,identity);
    for(let index=0;index<=depth;index++)s=model.recordSimulatorCheckpoint(s,makeEchoStatCard(item,identity.selectedSonataSetId,{...identity,substats:echoStatContract.substats.slice(0,index).map(row=>({name:row.name,value:row.values[0]}))}));
  }
  function disposition(value){s=model.applySimulatorDisposition(s,{...model.simulatorCandidateContext(s),disposition:value,reason:'External dev review fixture · '+value})}
  observe(1);disposition('rejected');observe(2);disposition('rejected');observe(3);disposition('rejected');observe(2);disposition('accepted');
  s=model.selectSimulatorSlot(s,2);observe(1);disposition('rejected');
  s=model.selectSimulatorSlot(s,5);observe(1);
  improveUi.simulator=s;improveUi.selectedEchoIndex=4;improveUi.render();
  document.getElementById('improveEchoRow').scrollIntoView({block:'center',behavior:'instant'});
})()`);
document.getElementById('current').onclick = () => read('improveUi.closeSimulation()');
document.getElementById('populated').onclick = populate;
document.getElementById('current').disabled = false;document.getElementById('populated').disabled = false;
populate();
