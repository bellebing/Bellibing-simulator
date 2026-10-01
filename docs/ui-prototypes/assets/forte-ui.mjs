export const FORTE_COLUMNS = ['normal-attack','skill','circuit','liberation','intro'];
const ROLES = {1:['normal-attack',1],2:['skill',2],3:['liberation',3],4:['inherent-1',4],5:['inherent-2',4],6:['intro',5],7:['circuit',6],8:['outro',11]};
const STAT_NAMES = {8:'CRIT Rate',9:'CRIT DMG',10007:'ATK%',10002:'HP%',10010:'DEF%',35:'Healing Bonus',22:'Glacio DMG',23:'Fusion DMG',24:'Electro DMG',25:'Aero DMG',26:'Spectro DMG',27:'Havoc DMG'};
const assetName = path => path?.split('/').pop()?.split('.')[0];
const fail = message => {throw Error('Forte source: '+message)};

export function sourceText(template,params=[]){
  if(typeof template!=='string'||!template.trim())return null;
  let missing=false;
  const result=template.replace(/\{(\d+)\}/g,(_,index)=>{if(params[index]===undefined){missing=true;return ''}return params[index]});
  // Only formatting is removed; never synthesize mechanic explanations.
  return missing?null:result.replace(/<[^>]*>/g,'');
}
export function projectForteCharacter(source,assets,manifest){
  if(!source)return {characterId:assets.characterId,characterName:assets.characterName,status:'PENDING',nodes:[]};
  const rows=source.tree.filter(n=>n.NodeIndex!==17); // Tune Break is outside this five-skill editor.
  if(rows.length!==16||new Set(rows.map(n=>n.NodeIndex)).size!==16)fail('Incomplete or duplicate tree for '+source.characterId);
  const nodes=rows.map(row=>{
    if(row.NodeGroup!==source.sourceId)fail('Wrong Character tree group');
    const base={id:String(row.NodeIndex),sourceNodeId:row.Id,sourceSkillId:row.SkillId,parents:row.ParentNodes.map(String),coordinate:row.Coordinate};
    if(row.NodeType===4){
      const stat=source.statNodes.find(n=>n.id===row.Id);
      if(!stat||JSON.stringify(stat.parentNodes)!==JSON.stringify(row.ParentNodes)||stat.coordinate!==row.Coordinate||JSON.stringify(stat.valueText)!==JSON.stringify(row.PropertyNodeParam))fail('Stat tree source mismatch '+row.Id);
      const icon=manifest.stats.find(a=>assetName(a.targetPath)===assetName(row.PropertyNodeIcon));
      const property=row.Property[0],value=Number.parseFloat(row.PropertyNodeParam[0])/100;
      if(row.Property.length!==1||!STAT_NAMES[property?.Id]||!Number.isFinite(value)||Math.abs(value-(property.IsRatio?property.Value:property.Value/10000))>1e-7)fail('Unsupported stat property '+row.Id);
      if(!icon)fail('Missing canonical stat icon '+row.Id);
      return {...base,kind:'stat',role:'stat-'+row.NodeIndex,name:sourceText(source.text[row.PropertyNodeTitle]),description:sourceText(source.text[row.PropertyNodeDescribe],row.PropertyNodeParam),assetPath:icon.targetPath.replace('docs/ui-prototypes/',''),stat:{stat:STAT_NAMES[property.Id],value},valueText:row.PropertyNodeParam[0],values:[]};
    }
    const mapping=ROLES[row.NodeIndex],move=source.moves.find(m=>m.id===row.SkillId);
    if(!mapping||!move||move.type!==mapping[1])fail('Skill identity mismatch '+row.Id);
    const role=mapping[0],icon=assets.skills[role];
    if(!icon||assetName(icon.assetPath)!==assetName(source.skillIcons[role]))fail('Skill icon identity mismatch '+role);
    const levelled=FORTE_COLUMNS.includes(role);
    if(move.maxLevel!==(levelled?10:1))fail('Unexpected skill levels '+move.id);
    return {...base,kind:levelled?'skill':role==='outro'?'outro':'inherent',role,name:move.name||null,description:sourceText(move.description,move.descriptionParams),assetPath:icon.assetPath,values:move.values.map(v=>({id:v.id,name:v.name,levels:v.values.length>=(levelled?10:1)?v.values.slice(0,levelled?10:1):null}))};
  });
  const byId=new Map(nodes.map(n=>[n.id,n]));
  const place=(node,visited=new Set())=>{
    if(visited.has(node.id))fail('Cyclic tree');
    if(node.column!==undefined)return;
    visited.add(node.id);
    if(node.parents.length){
      if(node.parents.length!==1)fail('Unsupported branching layout');
      const parent=byId.get(node.parents[0]);if(!parent)fail('Missing prerequisite');
      place(parent,visited);node.column=parent.column;node.row=parent.row+1;
      if(node.column<0||node.row>2||node.coordinate!==(node.kind==='inherent'?node.row+1:node.row))fail('Unsupported tree coordinates');
    }else{node.column=FORTE_COLUMNS.indexOf(node.role);node.row=0;if(node.column<0&&node.role!=='outro')fail('Unplaced node')}
    visited.delete(node.id);
  };
  nodes.forEach(node=>place(node));
  return {characterId:assets.characterId,characterName:assets.characterName,status:'SOURCE_BACKED',nodes};
}
export function normalizeForteState(tree,saved){
  const levels={},enabled={},fresh=!saved||saved.schemaVersion!==1;
  for(const n of tree.nodes){
    if(n.kind==='skill')levels[n.role]=fresh?10:(Number.isInteger(saved.levels?.[n.role])?Math.max(0,Math.min(10,saved.levels[n.role])):0);
    else if(n.kind!=='outro')enabled[n.id]=fresh?true:saved.enabled?.[n.id]===true;
  }
  const state={schemaVersion:1,levels,enabled};
  // Persisted descendants never resurrect explicitly disabled prerequisites.
  for(let i=0;i<tree.nodes.length;i++)for(const n of tree.nodes)if(n.parents.some(id=>!forteNodeActive(tree,state,id)))enabled[n.id]=false;
  return state;
}
export function forteNodeActive(tree,state,id){
  const node=tree.nodes.find(n=>n.id===id);
  return !!node&&(node.kind==='outro'||(node.kind==='skill'?state.levels[node.role]>0:state.enabled[node.id]===true));
}
export function updateForteNode(tree,saved,id,value){
  const state=normalizeForteState(tree,saved),node=tree.nodes.find(n=>n.id===id);
  if(!node||node.kind==='outro')return state;
  if(node.kind==='skill'){
    if(!Number.isInteger(value)||value<0||value>10)return state;
    state.levels[node.role]=value;
  }else state.enabled[id]=value===true;
  const enableParents=n=>{for(const parentId of n.parents){const parent=tree.nodes.find(p=>p.id===parentId);if(parent.kind==='skill')state.levels[parent.role]=Math.max(1,state.levels[parent.role]);else state.enabled[parentId]=true;enableParents(parent)}};
  if(forteNodeActive(tree,state,id))enableParents(node);
  return normalizeForteState(tree,state);
}
export function forteStats(tree,state){return tree.nodes.filter(n=>n.kind==='stat'&&forteNodeActive(tree,state,n.id)).map(n=>n.stat)}
export function forteValue(row,level){return Number.isInteger(level)&&level>=1&&level<=10&&Array.isArray(row.levels)?row.levels[level-1]??null:null}
