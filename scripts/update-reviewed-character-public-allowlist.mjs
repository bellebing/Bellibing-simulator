// Preserve the existing strict public-asset allowlist. Add ONLY exact, pinned
// image paths resolved by the existing reviewed Character/asset manifests.
// Never approve a directory/wildcard or a synthetic Character asset.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const ROOT='docs/ui-prototypes/assets/';
const DEST='ui-preview/assets/';
const ids=['hsin','lily','suoming'];
const check=(ok,reason)=>{if(!ok)throw Error('Character public allowlist: '+reason)};
const manifest=JSON.parse(readFileSync(ROOT+'builder-icons/manifest.json','utf8'));
const portraits=JSON.parse(readFileSync(ROOT+'characters/portraits/manifest.json','utf8'));
const heroes=JSON.parse(readFileSync(ROOT+'characters/hero-art/manifest.json','utf8'));
const approvedFile='scripts/public-web-assets.json';
const original=JSON.parse(readFileSync(approvedFile,'utf8'));
check(Array.isArray(original)&&original.length===new Set(original).size,'original allowlist already has duplicates');
const additions=new Set();
const allow=target=>{
 check(typeof target==='string'&&target.startsWith(ROOT)&&/\.webp$/.test(target),'non-source WebP path '+target);
 check(existsSync(target),'missing real reviewed source image '+target);
 const projected=DEST+target.slice(ROOT.length);
 additions.add(projected);
};
const builderAssetMap=new Map(manifest.assets.map(a=>[a.targetPath,a]));
for(const id of ids){
 const rows=manifest.characters.filter(c=>c.characterId===id);
 check(rows.length<=1,'duplicate builder Character '+id);
 if(!rows.length)continue; // staged prior to the 3-Character completion
 const row=rows[0];check(row.releaseStatus==='RELEASED','unreleased builder Character '+id);
 check(Object.keys(row.skills??{}).length===8&&row.chains?.length===6,'incomplete builder kit '+id);
 const refs=[...Object.values(row.skills),...row.chains];
 for(const ref of refs){
  const entry=builderAssetMap.get(ref.targetPath);
  check(entry&&entry.assetId===ref.assetId,'builder asset provenance pointer '+id);
  check(entry.sourceSha&&/^[a-f0-9]{40}$/.test(entry.sourceSha),'unverified builder source '+id);
  allow(entry.targetPath);
 }
 const h=heroes.characters.filter(c=>c.characterId===id);
 check(h.length===1&&h[0].releaseStatus==='RELEASED'&&h[0].sourceBlobSha,'reviewed Hero Art missing '+id);
 allow(h[0].targetPath);
 const ps=portraits.portraits.filter(c=>c.characterId===id);
 check(ps.length===1&&ps[0].uiEligible&&ps[0].releaseStatus==='RELEASED','reviewed portrait missing '+id);
 if(ps[0].targetPath.endsWith('.webp'))allow(ps[0].targetPath);
}
const newEntries=[...additions].filter(p=>!original.includes(p)).sort();
const output=[...original,...newEntries];
check(new Set(output).size===output.length,'collision');
writeFileSync(approvedFile,JSON.stringify(output,null,2)+'\n');
console.log('Approved only '+newEntries.length+' source-verified original WebP image paths; '+output.length+' exact public assets in whitelist.');
