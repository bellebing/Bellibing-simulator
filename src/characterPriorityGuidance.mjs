// Label normalization of already reviewed guide priorities, not numerical
// requirements. Whole-build conditions stay attached to the original token.
const aliases={
 'CRIT RATE':['CRIT Rate'],'CRIT DMG':['CRIT DMG'],'ENERGY REGEN':['Energy Regen'],
 'ATK%':['ATK%'],'ATK':['Flat ATK'],'FLAT ATK':['Flat ATK'],
 'HP%':['HP%'],'HP':['Flat HP'],'FLAT HP':['Flat HP'],
 'DEF%':['DEF%'],'DEF':['Flat DEF'],'FLAT DEF':['Flat DEF'],
 'BASIC DMG%':['Basic Attack DMG'],'BASIC ATK DMG%':['Basic Attack DMG'],'BASIC ATTACK DMG%':['Basic Attack DMG'],
 'HEAVY DMG%':['Heavy Attack DMG'],'HEAVY ATK DMG%':['Heavy Attack DMG'],'HEAVY ATTACK DMG%':['Heavy Attack DMG'],
 'SKILL DMG%':['Skill DMG'],'RESONANCE SKILL DMG%':['Skill DMG'],'RESONANCE SKILL DMG':['Skill DMG'],
 'LIBERATION DMG%':['Liberation DMG'],'RESONANCE LIBERATION DMG%':['Liberation DMG'],
 'HEAVY/LIBERATION/BASIC DMG%':['Heavy Attack DMG','Liberation DMG','Basic Attack DMG']
};
export function sourcePriorityGuidance(guide){
 const entries=[],unresolved=[];
 for(const row of guide.substatPriorities){
  let rank=1;
  for(const part of row.sourceText.split(/(>+|≥|=)/)){
   if(!part.trim())continue;
   if(/^(>+|≥|=)$/.test(part)){if(part!=='=')rank++;continue;}
   const condition=part.match(/\(([^)]+)\)/)?.[1]??null;
   const token=part.replace(/\([^)]*\)/g,'').trim().toUpperCase();
   if(token==='HP'&&condition){entries.push({stats:[],buildMetric:'TOTAL_HP',rank,condition,sourceToken:part.trim(),sourceLine:row.sourceLine});continue;}
   const stats=aliases[token];
   if(!stats){unresolved.push({sourceToken:part.trim(),sourceLine:row.sourceLine,reason:'UNREVIEWED_STAT_ALIAS_OR_CAPTURE_SYNTAX'});continue;}
   entries.push({stats,rank,condition,sourceToken:part.trim(),sourceLine:row.sourceLine});
  }
 }
 const orderedStats=[...new Set(entries.flatMap(e=>e.stats))];
 return {characterId:guide.characterId,sourceUrl:guide.sourceUrl,sourceLinesSha256:guide.sourceLinesSha256,
  kind:'SOURCE_PRIORITY_GUIDANCE_ONLY',entries,orderedStats,unresolved,
  hardRequirements:'PENDING_REVIEWED_PER_ECHO_THRESHOLDS',flexCount:null,erThreshold:'PENDING_EXACT_APPLICABLE_TARGET',authorizesExecution:false};
}
