import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CHARACTER_CATALOG} from '../src/data/characters.ts';
const path='data/source/alternative-team-context-review-2026-10-12.json';
const bytes=readFileSync(path),review=JSON.parse(bytes),hash=x=>createHash('sha256').update(x).digest('hex');
for(const key of ['guide','model'])if(hash(readFileSync(review[key+'Artifact']))!==review[key+'Sha256'])throw Error(key+' drift; explicit composition review required');
const guide=JSON.parse(readFileSync(review.guideArtifact)),model=JSON.parse(readFileSync(review.modelArtifact));
const guides=new Map(guide.characters.map(c=>[c.characterId,c]));
const released=new Map(CHARACTER_CATALOG.filter(c=>c.releaseStatus==='RELEASED').map(c=>[c.id,c]));
const standard=new Set(['verina','encore','calcharo','jianxin','lingyang']);
const healers=new Set(['the-shorekeeper','verina','baizhi','mornye','suisui','buling','youhu','rover-aero']);
const access=id=>id.startsWith('rover-')?'PROTAGONIST':released.get(id)?.rarity===4?'FOUR_STAR':standard.has(id)?'STANDARD_FIVE_STAR':'LIMITED_FIVE_STAR';
const sustain=party=>party.some(id=>healers.has(id))?'HEALING_MEMBER_PRESENT':party.some(id=>['brant','cantarella','iuno','jianxin','rover-spectro'].includes(id))?'CONDITIONAL_SUSTAIN':party.includes('chisa')?'HEALING_SETUP_REQUIRED':'NO_LISTED_HEALER';
const key=(anchor,party,modes)=>anchor+'|'+[...party].sort().join('|')+'|'+JSON.stringify(Object.fromEntries(Object.entries(modes).sort()));
const options=new Map();
function put(input){
 const party=input.characterIds;
 if(party.length!==3||new Set(party).size!==3||party.some(id=>!released.has(id))||!party.includes(input.anchorCharacterId))throw Error('Invalid released trio');
 const modes=Object.fromEntries(Object.entries(input.modeRequirements??{}).filter(([id])=>party.includes(id)));
 const k=key(input.anchorCharacterId,party,modes),existing=options.get(k);
 if(existing){existing.reviewedRuleIds.push(...input.reviewedRuleIds);return;}
 const partners=party.filter(id=>id!==input.anchorCharacterId).map(characterId=>({characterId,kind:access(characterId)}));
 const limited=partners.filter(p=>p.kind==='LIMITED_FIVE_STAR').length;
 const row={...input,modeRequirements:modes,accessibility:limited===0?'NON_LIMITED_PARTNERS':limited===2?'ALL_LIMITED_PARTNERS':'MIXED_PARTNERS',partnerAccess:partners,sustain:sustain(party),ranking:'NO_INFERRED_DPS_RANK',rotationTimingStatus:'NOT_RESEARCHED_FOR_THIS_ALTERNATIVE_CONTEXT'};
 options.set(k,row);
}
for(const rule of review.rules){
 const owner=guides.get(rule.guideOwnerId);
 if(!owner||!released.has(rule.anchorCharacterId)||rule.topCorePartners.some(id=>!rule.partnerOptions.includes(id)))throw Error('Invalid rule');
 for(const proof of rule.pairingProofs){
  const target=proof.characterId===rule.guideOwnerId?rule.anchorCharacterId:proof.characterId;
  if(!owner.teammateGroups.some(g=>g.sourceLine===proof.sourceLine&&g.characterIds.includes(target)))throw Error('Unproven guide option');
 }
 const refs=rule.pairingProofs.map(p=>({provider:'PRYDWEN',url:owner.sourceUrl,locator:`teammateGroups line ${p.sourceLine}`}));
 for(const partner of rule.partnerOptions)for(const support of rule.supportOptions){
  const party=[rule.anchorCharacterId,partner,support];if(new Set(party).size!==3)continue;
  const isBis=review.fullyNamedBisReferences.some(b=>b.characterIds.every(id=>party.includes(id)));
  const relationship=isBis?'SOURCE_BIS_REFERENCE':rule.topCorePartners.includes(partner)?'SOURCE_RECOMMENDED_CORE_VARIANT':'ALTERNATIVE';
  put({id:`guide-${rule.anchorCharacterId}-${partner}-${support}-${rule.id}`,anchorCharacterId:rule.anchorCharacterId,characterIds:party,relationship,evidenceBasis:'REVIEWED_GUIDE_SLOT_SYNTHESIS',modeRequirements:rule.modeRequirements,roleAssignment:{partner,support},whySv:rule.whySv,conditionsSv:[...rule.conditionsSv,'Källans buffvillkor, Intro/Outro-mål, energi och utrustning måste uppfyllas; inga lag-DPS-procent eller tider antas.'],sourceRefs:refs,reviewedRuleIds:[rule.id],publisherRowIds:[],sourceModes:[]});
  const fallback=review.supportFallbacks.baizhi;
  if(rule.allowBaizhiFallback&&!fallback.excludedPartners.includes(partner))put({id:`guide-${rule.anchorCharacterId}-${partner}-baizhi-${rule.id}`,anchorCharacterId:rule.anchorCharacterId,characterIds:[rule.anchorCharacterId,partner,'baizhi'],relationship:'ALTERNATIVE',evidenceBasis:'REVIEWED_GUIDE_SLOT_SYNTHESIS',modeRequirements:rule.modeRequirements,roleAssignment:{partner,support:'baizhi'},whySv:rule.whySv+' '+fallback.whySv,conditionsSv:[...rule.conditionsSv,...fallback.conditionsSv],sourceRefs:[...refs,{provider:'PRYDWEN',url:guides.get('baizhi').sourceUrl,locator:'generalTeamGuidance line 552'}],reviewedRuleIds:[rule.id,'baizhi-scoped-fallback'],publisherRowIds:[],sourceModes:[]});
 }
}
for(const s of review.specialParties)put({id:'guide-special-'+s.party.join('-'),anchorCharacterId:s.anchor,characterIds:s.party,relationship:s.relationship??'SOURCE_RECOMMENDED_CORE_VARIANT',evidenceBasis:'REVIEWED_GUIDE_TRIO',modeRequirements:{},roleAssignment:{partner:s.partner??null,support:s.support??null},whySv:s.whySv,conditionsSv:s.conditionsSv,sourceRefs:[{provider:'PRYDWEN',url:guides.get(s.owner).sourceUrl,locator:'reviewed lines '+s.lines.join(',')}],reviewedRuleIds:['special-'+s.party.join('-')],publisherRowIds:[],sourceModes:[]});
const alias=n=>review.aliases[n]??n.toLowerCase();let excludedUnreleased=0;
for(const row of model.rows){
 const party=row.members.map(m=>alias(m.sourceName));
 if(party.some(id=>!released.has(id))){excludedUnreleased++;continue;}
 for(const anchor of row.members.filter(m=>m.isMainDamage).map(m=>alias(m.sourceName))){
  const sourceModes=row.members.map(m=>({characterId:alias(m.sourceName),mode:m.sourceMode,loadoutIndex:m.sourceLoadoutIndex}));
  const k='model|'+anchor+'|'+party.slice().sort().join('|')+'|'+JSON.stringify(sourceModes);
  if(options.has(k)){options.get(k).publisherRowIds.push(row.publisherRow);continue;}
  const conditions=['Publicerad modellkombination; ingen oberoende gameplay-, rotations- eller rankingverifiering görs i detta steg.'];
  if(anchor==='qingxiao'&&(!party.includes('denia')&&!party.includes('lynae')||party.includes('denia')&&!party.includes('mornye')))conditions.push('Guiden rekommenderar inte denna Qingxiao-kärna: Denia kräver Mornye, eller välj Lynae-vägen.');
  const extra={id:'model-'+anchor+'-'+row.publisherRow,anchorCharacterId:anchor,characterIds:party,relationship:'UNRANKED_MODEL_CANDIDATE',evidenceBasis:'PUBLISHED_MODEL_ROSTER_ONLY',modeRequirements:{},roleAssignment:{partner:null,support:null},whySv:'Kombinationen är uttryckligen registrerad i den publicerade kalkylatorns laglista och är ett underlag för vidare granskning.',conditionsSv:conditions,sourceRefs:[{provider:'RILEY_CALCS',url:model.sourceUrl,locator:`ALL_TEAMS row ${row.publisherRow}; TEAMS declaration ${row.declarationIndex}`}],reviewedRuleIds:[],publisherRowIds:[row.publisherRow],sourceModes};
  const partners=party.filter(id=>id!==anchor).map(characterId=>({characterId,kind:access(characterId)})),limited=partners.filter(p=>p.kind==='LIMITED_FIVE_STAR').length;
  options.set(k,{...extra,partnerAccess:partners,accessibility:limited===0?'NON_LIMITED_PARTNERS':limited===2?'ALL_LIMITED_PARTNERS':'MIXED_PARTNERS',sustain:sustain(party),ranking:'NO_INFERRED_DPS_RANK',rotationTimingStatus:'NOT_RESEARCHED_FOR_THIS_ALTERNATIVE_CONTEXT'});
 }
}
const rows=[...options.values()];
const coverage=[...released.keys()].map(characterId=>({characterId,guidePartnerGroupCount:guides.get(characterId)?.teammateGroups.length??0,asAnchor:rows.filter(r=>r.anchorCharacterId===characterId&&r.evidenceBasis!=='PUBLISHED_MODEL_ROSTER_ONLY').length,asMember:rows.filter(r=>r.characterIds.includes(characterId)&&r.evidenceBasis!=='PUBLISHED_MODEL_ROSTER_ONLY').length,publishedModelMemberships:rows.filter(r=>r.characterIds.includes(characterId)&&r.evidenceBasis==='PUBLISHED_MODEL_ROSTER_ONLY').length}));
const meta={reviewedAt:review.reviewedAt,reviewArtifact:path,reviewSha256:hash(bytes),guideArtifact:review.guideArtifact,guideSha256:review.guideSha256,modelArtifact:review.modelArtifact,modelSha256:review.modelSha256,excludedUnreleasedRows:excludedUnreleased,scope:'TEAM_OPTIONS_ONLY_NO_DPS_RANK_OR_ROTATION_TIMING'};
const out=`// Generated from reviewed slot rules and a separately labelled discovery roster. One composition per line.\nimport type {AlternativeTeamContext} from '../alternativeTeamContextDomain.ts';\nexport const ALTERNATIVE_TEAM_CONTEXT_REVIEW = ${JSON.stringify(meta,null,2)} as const;\nexport const ALTERNATIVE_TEAM_CONTEXTS:readonly AlternativeTeamContext[] = [\n${rows.map(r=>JSON.stringify(r)).join(',\n')}\n] as const;\nexport const ALTERNATIVE_TEAM_CHARACTER_COVERAGE = ${JSON.stringify(coverage,null,2)} as const;\n`;
const target='src/data/alternativeTeamContexts.ts';if(process.argv.includes('--check')){if(readFileSync(target,'utf8')!==out)throw Error('Team-context projection drift');}else writeFileSync(target,out);
console.log(`${rows.filter(r=>r.evidenceBasis!=='PUBLISHED_MODEL_ROSTER_ONLY').length} reviewed guide trios / ${rows.filter(r=>r.evidenceBasis==='PUBLISHED_MODEL_ROSTER_ONLY').length} separately labelled model candidates / ${coverage.length} released coverage rows.`);
