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

// Source-backed Builder skill/Sequence assets, without re-importing existing 58 kits.
const builderPath=prefix+'builder-icons/manifest.json',builder=json(builderPath);
check(!builder.characters.some(c=>c.characterId===id),'Builder Character already mapped '+id);
builder.sources.wuwabuild38={repository:artSource.repository,commit:artSource.commit,dataPaths:[pins.sources.wuwabuild.blobs.characters.path],assetRoot:'public/assets/'};
const byTarget=new Map(builder.assets.map(a=>[a.targetPath,a]));
async function installBuilder(relative,upstream,assetId,family){
 const targetPath=prefix+'builder-icons/'+relative;
 const prior=byTarget.get(targetPath);
 if(prior)return {assetId:prior.assetId,targetPath};
 const original=await asset(upstream);
 check(!builder.assets.some(a=>a.assetId===assetId),'unique builder asset ID '+assetId);
 const entry={assetId,family,sourceKey:'wuwabuild38',sourcePath:original.sourcePath,targetPath,sourceBytes:original.sourceBytes,sourceSha:original.sourceSha};
 putBinary(targetPath,original.buffer);
 builder.assets.push(entry);byTarget.set(targetPath,entry);
 return {assetId,targetPath};
}
const skillAssets={};
for(const skillRole of skillRoles){
 const upstream=capture.sourceIcons?.[skillRole];
 check(typeof upstream==='string','missing source Skill '+id+'/'+skillRole);
 const name=basename(upstream);
 skillAssets[skillRole]=await installBuilder('skills/'+name,upstream,'skill:'+name.slice(0,-extname(name).length),'skill');
}
const chains=[];
for(const seq of capture.sequences){
 const ref=await installBuilder('chains/'+id+'/s'+seq.sequence+'.webp',seq.sourceIcon,'chain:'+id+':s'+seq.sequence,'chain');
 chains.push({sequence:seq.sequence,sourceChainId:seq.sourceChainId,name:seq.name,...ref});
}
builder.characters.push({characterId:id,characterName:capture.characterName,releaseStatus:'RELEASED',sourceId,sourceName:capture.characterName,skills:skillAssets,chains});
builder.policy.excludedCharacters=builder.policy.excludedCharacters.filter(x=>x!==id);
builder.policy.characterCoverage='Reviewed original 3.8 source IDs extend existing 3.6 kits; all selected released kits must be manifest-resolved.';
const count=family=>builder.assets.filter(a=>a.family===family).length;
Object.assign(builder.summary,{logicalCharacterKits:builder.characters.length,skillReferences:builder.characters.length*8,chainReferences:builder.characters.length*6,skills:count('skill'),chains:count('chain'),physicalAssets:builder.assets.length});
save(builderPath,builder);
// Original 3.8 Forte data appended to existing 3.6 source, without replacing or
// altering historical Characters. Original translation text may be unavailable;
// its labels remain null, never fabricated from other sources.
const fortePath='data/source/character-forte-ui.json',forte=json(fortePath);
check(!forte.characters.some(c=>c.characterId===id),'existing Forte character '+id);
let textRows=null;
try{
 const textUrl=url(pins.sources.arikatsu.repository,pins.sources.arikatsu.commit,'Textmaps/en/multi_text/MultiText.json');
 const result=JSON.parse((await bytes(textUrl)).toString('utf8'));
 check(Array.isArray(result),'original textmap shape');
 textRows=new Map(result.map(r=>[r.Id,r.Content]));
}catch(err){console.warn('Original 3.8 localization Pending: '+err.message);}
const originalText=Object.fromEntries(capture.forteTree.flatMap(n=>[n.PropertyNodeTitle,n.PropertyNodeDescribe]).filter(Boolean).map(k=>[k,textRows?.get(k)??null]));
forte.characters.push({characterId:id,sourceId,sourceName:capture.characterName,tree:capture.forteTree,
 statNodes:provider.skillTrees,skillIcons:provider.skillIcons,
 moves:provider.moves.map(m=>({id:m.id,type:m.type,sort:m.sort,name:m.name?.en??null,description:m.description?.en??null,descriptionParams:m.descriptionParams,maxLevel:m.maxLevel,values:(m.values??[]).map(v=>({id:v.id,name:v.name?.en??null,values:v.values}))})),
 text:originalText
});
forte.provenance.characterImport38={repository:pins.sources.arikatsu.repository,commit:pins.sources.arikatsu.commit,path:pins.sources.arikatsu.blobs.tree.path,gitBlobSha:pins.sources.arikatsu.blobs.tree.sha,provider:{repository:artSource.repository,commit:artSource.commit,gitBlobSha:pins.sources.wuwabuild.blobs.characters.sha}};
save(fortePath,forte);
// Six source-backed Sequence descriptions; missing static Build-stat adjudication
// stays explicit PENDING, which does not block ordinary character ownership.
const seqPath='data/source/character-sequence-ui.json',seq=json(seqPath);
check(!seq.characters.some(c=>c.characterId===id),'existing Sequence '+id);
seq.characters.push({characterId:id,sourceId,sourceName:capture.characterName,chains:capture.sequences.map(c=>({sequence:c.sequence,sourceChainId:c.sourceChainId,name:c.name,descriptionTemplate:c.descriptionTemplate,params:c.params,icon:c.sourceIcon}))});
seq.provenance.characterImport38={repository:artSource.repository,commit:artSource.commit,path:pins.sources.wuwabuild.blobs.characters.path,gitBlobSha:pins.sources.wuwabuild.blobs.characters.sha};
save(seqPath,seq);
const revPath='data/source/character-sequence-build-stat-review.json',rev=json(revPath);
check(!rev.characters.some(c=>c.characterId===id),'existing Sequence stat review '+id);
rev.characters.push({characterId:id,chains:capture.sequences.map(c=>({sequence:c.sequence,sourceChainId:c.sourceChainId,classification:'PENDING'}))});
save(revPath,rev);
// Real source banner art: no placeholders, borrowed pictures or auto-cropping.
const heroPath=prefix+'characters/hero-art/manifest.json',hero=json(heroPath);
check(!hero.characters.some(c=>c.characterId===id),'already mapped Hero '+id);
const originalHero=await asset(capture.sourceArt.hero),heroTarget=prefix+'characters/hero-art/'+id+'.webp';
putBinary(heroTarget,originalHero.buffer);
hero.characters.push({characterId:id,characterName:capture.characterName,releaseStatus:'RELEASED',
 sourceCharacterId:sourceId,sourceName:capture.characterName,sourceBannerPath:capture.sourceArt.hero,
 sourceAssetPath:originalHero.sourcePath,sourceBlobSha:originalHero.sourceSha,sourceBytes:originalHero.sourceBytes,targetPath:heroTarget,
 presentation:{safeFraming:'CONTAIN',reviewStatus:'BUILD_FRAME_PENDING',scale:1,offsetX:0,offsetY:0,focalAnchor:{x:0.5,y:0.5},note:'Source-identical original art. Safe contain. Exact live framing can be reviewed independently.'}});
hero.pending=hero.pending.filter(c=>c.characterId!==id);
hero.summary.releasedCharacters=hero.characters.length+hero.pending.length;
hero.summary.mapped=hero.characters.length;hero.summary.pending=hero.pending.length;
hero.policy.unreleased='Suoming and Lily now use verified original source assets; existing nonimported candidates still fail closed.';
hero.additionalSources??={};
hero.additionalSources.wuwabuild38={repository:artSource.repository,commit:artSource.commit};
save(heroPath,hero);
// Hsin portrait exists; Suoming has an existing unselectable preview portrait;
// Lily uses its exact released-game round avatar, with no synthetic PNG conversion.
const portraitPath=prefix+'characters/portraits/manifest.json',portrait=json(portraitPath);
if(id==='suoming'){
 const entry=one(portrait.portraits,'characterId',id);
 check(entry.sourcePath==='images/Suoming.png'&&!entry.uiEligible,'existing upcoming portrait changed');
 entry.releaseStatus='RELEASED';entry.uiEligible=true;
}
if(id==='lily'){
 check(!portrait.portraits.some(c=>c.characterId===id),'Lily portrait identity');
 const face=await asset(capture.sourceArt.portrait),path=prefix+'characters/portraits/lily.webp';
 putBinary(path,face.buffer);
 portrait.portraits.push({characterId:id,characterName:'Lily',rarity:5,releaseStatus:'RELEASED',
  sourceKey:'wuwabuild38',sourcePath:face.sourcePath,sourceSha:face.sourceSha,sourceBytes:face.sourceBytes,
  targetPath:path,mappingStatus:'DIRECT_ORIGINAL_SOURCE_ROLE_ID',uiEligible:true});
 portrait.additionalSources??={};portrait.additionalSources.wuwabuild38={repository:artSource.repository,commit:artSource.commit};
}
portrait.summary.catalogEntries=portrait.portraits.length+portrait.roverPortraits.length;
portrait.summary.directPortraits=portrait.portraits.length;
portrait.summary.directReleased=portrait.portraits.filter(c=>c.releaseStatus==='RELEASED').length;
portrait.summary.directConfirmedUpcoming=portrait.portraits.filter(c=>c.releaseStatus==='CONFIRMED_UPCOMING').length;
save(portraitPath,portrait);
if(id==='hsin'){
 const path='src/data/characterPresentationPending.ts';let t=readFileSync(path,'utf8');
 check(t.includes("'hsin', "),'pending exclusion Hsin drift');
 t=t.replace("'hsin', ",'');writeFileSync(path,t);
}
console.log('Built source-backed Skills, six Sequences, original images and existing-manifest projections for '+id);
