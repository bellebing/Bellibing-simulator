// Source-bound extension of npm run import:character. Writes existing canonical
// catalogs and presentation sources only. Never creates a parallel Character store.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {dirname,basename,extname} from 'node:path';
import {createHash} from 'node:crypto';
const prefix='docs/ui-prototypes/assets/';
const pins=JSON.parse(readFileSync('data/research/character-import/source-pins/3.8.json'));
const idMap={hsin:1311,lily:1512,suoming:1312};
const skillRoles=['normal-attack','skill','liberation','intro','circuit','outro','inherent-1','inherent-2'];
const statNames={8:'CRIT Rate',9:'CRIT DMG',10007:'ATK%',10002:'HP%',10010:'DEF%',35:'Healing Bonus',22:'Glacio DMG',23:'Fusion DMG',24:'Electro DMG',25:'Aero DMG',26:'Spectro DMG',27:'Havoc DMG'};
const check=(condition,message)=>{if(!condition)throw Error('Character import source conflict: '+message)};
const json=path=>JSON.parse(readFileSync(path,'utf8'));
const save=(path,obj)=>{mkdirSync(dirname(path),{recursive:true});writeFileSync(path,JSON.stringify(obj,null,2)+'\n')};
const blobSha=bytes=>createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
const url=(r,c,p)=>'https://raw.githubusercontent.com/'+r+'/'+c+'/'+p;
const one=(rows,key,id)=>{const matches=rows.filter(r=>r[key]===id);check(matches.length===1,'expected unique '+key+'='+id);return matches[0]};
async function bytes(u){const r=await fetch(u);check(r.ok,'HTTP '+r.status+' '+u);return Buffer.from(await r.arrayBuffer());}
async function pinned(group,key){const s=pins.sources[group],b=s.blobs[key],data=await bytes(url(s.repository,s.commit,b.path));check(blobSha(data)===b.sha,'Git blob SHA '+group+'/'+key);return JSON.parse(data.toString('utf8'));}
const artSource=pins.sources.wuwabuild;
async function asset(path){
 check(typeof path==='string'&&path.startsWith('/assets/')&&path.endsWith('.webp'),'verified image path');
 const sourcePath='public'+path,buffer=await bytes(url(artSource.repository,artSource.commit,sourcePath));
 check(buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP','original WebP magic');
 return {sourcePath,buffer,sourceSha:blobSha(buffer),sourceBytes:buffer.length};
}
function putBinary(path,buffer){
 mkdirSync(dirname(path),{recursive:true});
 if(existsSync(path))check(readFileSync(path).equals(buffer),'existing asset conflict '+path);
 else writeFileSync(path,buffer);
}
const id=process.argv[2];
check(Object.hasOwn(idMap,id),'expected hsin/lily/suoming');
const sourceId=idMap[id];
const originals={};
for(const k of ['roles','base','growth','tree','chains'])originals[k]=await pinned('arikatsu',k);
originals.characters=await pinned('wuwabuild','characters');
const provider=one(originals.characters,'id',sourceId);
const role=one(originals.roles,'Id',sourceId),base=one(originals.base,'Id',sourceId),growth=one(originals.growth,'Id',96);
check(role.PropertyId===sourceId&&role.SkillTreeGroupId===sourceId&&role.ResonantChainGroupId===sourceId,'original role join '+id);
const tree=originals.tree.filter(n=>n.NodeGroup===sourceId);
check(tree.length===17&&provider.chains.length===6,'source Forte/Sequences count '+id);
let capture;
if(id==='hsin'){
 capture={characterId:'hsin',characterName:provider.name.en,sourceRoleId:sourceId,level1:base,
  level90GrowthSource:growth,forteTree:tree,sourceIcons:provider.skillIcons,
  sourceArt:{portrait:provider.icon.iconRound,hero:provider.icon.banner},
  intrinsicSourceNodes:tree.filter(n=>n.NodeType===4).map(n=>({nodeId:n.Id,sourceProperty:n.Property,sourceParams:n.PropertyNodeParam})),
  sequences:provider.chains.map((c,i)=>({sequence:i+1,sourceChainId:c.id,name:c.name.en,descriptionTemplate:c.description.en,params:c.param??[],sourceIcon:c.icon}))};
}else capture=json('data/research/character-import/'+id+'-captured.json');
check(capture.characterId===id&&capture.sourceRoleId===sourceId&&capture.characterName===provider.name.en,'original capture identity '+id);
check(capture.level1.LifeMax===base.LifeMax&&capture.level1.Atk===base.Atk&&capture.level1.Def===base.Def&&capture.level1.EnergyMax===base.EnergyMax,'Lv1 provider/source mismatch '+id);
check(capture.level90GrowthSource.LifeMaxRatio===growth.LifeMaxRatio&&capture.level90GrowthSource.AtkRatio===growth.AtkRatio&&capture.level90GrowthSource.DefRatio===growth.DefRatio,'Lv90 growth source mismatch '+id);
check(JSON.stringify(capture.sourceIcons)===JSON.stringify(provider.skillIcons),'pinned skill icons mismatch '+id);
check(capture.forteTree.length===17&&capture.intrinsicSourceNodes.length===8&&capture.sequences.length===6,'incomplete kit '+id);
for(let i=0;i<6;i++)check(capture.sequences[i].sourceChainId===provider.chains[i].id,'Sequence identity '+id+'/'+i);
const level90={hp:Math.round(base.LifeMax*growth.LifeMaxRatio/10000),atk:Math.round(base.Atk*growth.AtkRatio/10000),def:Math.round(base.Def*growth.DefRatio/10000),maxEnergy:base.EnergyMax/100};
const reviewed={hsin:[10300,463,1112,125],lily:[16713,288,1100,175],suoming:[10300,463,1112,125]};
check(JSON.stringify(Object.values(level90))===JSON.stringify(reviewed[id]),'original fixed-point Lv90 display rule: '+id+' '+JSON.stringify(level90));
const intrinsic=new Map();
for(const n of capture.intrinsicSourceNodes){
 const prop=n.sourceProperty,display=n.sourceParams?.[0];
 check(prop?.length===1&&typeof display==='string'&&/^[0-9]+(?:\.[0-9]+)?%$/.test(display),'permanent Forte source node '+n.nodeId);
 const p=prop[0],stat=statNames[p.Id],value=Number.parseFloat(display)/100;
 check(stat&&Math.abs((p.IsRatio?p.Value:p.Value/10000)-value)<1e-7,'permanent Forte numerical conflict '+n.nodeId);
 intrinsic.set(stat,Number(((intrinsic.get(stat)??0)+value).toFixed(10)));
}
check(intrinsic.size===2,'expected two source-proven permanent stat families '+id);
const stats=[...intrinsic].map(([stat,value])=>({stat,value}));
const canonicalPath='src/data/characters.ts';
if(id!=='hsin'){
 let text=readFileSync(canonicalPath,'utf8');
 const label=id==='lily'?'Lily':'Suoming',element=id==='lily'?'Spectro':'Electro',weapon=id==='lily'?'Pistols':'Sword';
 check(provider.element.name.en===element&&provider.weapon.name.en===weapon&&provider.rarity.id===5,'cross-source playable identity '+id);
 const line="  row({ id: '"+id+"', name: '"+label+"', rarity: 5, element: '"+element+"', weaponType: '"+weapon+"', hp: "+level90.hp+", atk: "+level90.atk+", def: "+level90.def+", maxEnergy: "+level90.maxEnergy+",\n"+
 "    verificationStatus: 'VERIFIED',\n"+
 "    sourceLabels: ['Kuro original release 3.7/3.8', 'Arikatsu 3.8 original Lv1, Level90 fixed-point growth and permanent Forte', 'DommyMM 3.8 pin cross-check'],\n"+
 "    sourceUrls: ['"+url(pins.sources.arikatsu.repository,pins.sources.arikatsu.commit,pins.sources.arikatsu.blobs.base.path)+"', '"+url(artSource.repository,artSource.commit,pins.sources.wuwabuild.blobs.characters.path)+"'],\n"+
 "    checkedAt: '2026-11-13',\n"+
 "    notes: ['Verified original Lv1 × Lv90 fixed-point /10000 growth, game-facing integer round-half-up; EnergyMax /100 is capacity, not Liberation cost.', 'DPS mechanics and unreviewed recommendation policies remain Pending.'],\n"+
 "  }),";
 if(id==='lily'){
  check(!text.includes("row({ id: 'lily'"),'Lily already canonical');
  check(text.includes("  row({ id: 'lingyang'"),'Lily insert anchor');
  text=text.replace("  row({ id: 'lingyang'",line+"\n  row({ id: 'lingyang'");
 }else{
  const old=text.split('\n').find(l=>l.startsWith("  row({ id: 'suoming'"));
  check(old&&old.includes("releaseStatus: 'CONFIRMED_UPCOMING'"),'Suoming stale row changed unexpectedly');
  text=text.replace(old,line);
 }
 writeFileSync(canonicalPath,text);
 const intrinsicPath='src/data/characterIntrinsicStats.ts';let t=readFileSync(intrinsicPath,'utf8');
 const anchor=id==='lily'?"  verified('lingyang'":"  verified('taoqi'";
 check(t.includes(anchor)&&!t.includes("verified('"+id+"'"),'new intrinsic identity/anchor '+id);
 t=t.replace(anchor,"  verified('"+id+"', "+JSON.stringify(stats)+", ['Arikatsu 3.8 pinned permanent Forte source nodes @"+pins.sources.arikatsu.commit+"'], ['Original eight nodes; conditional mechanics excluded.'], '2026-11-13'),\n"+anchor);
 writeFileSync(intrinsicPath,t);
}else{
 const c=(await import('../../src/data/characters.ts')).CHARACTER_CATALOG.find(x=>x.id===id);
 check(c&&JSON.stringify([c.level90.hp,c.level90.atk,c.level90.def,c.level90.maxEnergy])===JSON.stringify(reviewed[id]),'Hsin previously verified raw data');
 check(stats.every(s=>c.intrinsicStats.some(v=>v.stat===s.stat&&Math.abs(v.value-s.value)<1e-9)),'Hsin already verified permanent Forte nodes');
}
console.log('Original Character identity / Lv90 / eight permanent Forte nodes verified: '+id+' '+JSON.stringify({level90,stats}));
