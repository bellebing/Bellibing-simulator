import {readFileSync,writeFileSync} from 'node:fs';
import {SUBSTAT_VALUE_TABLE} from '../src/echoCore.ts';
import {evaluateAugustaTeamPilot,compareAugustaPilotTeams,compareAugustaPilotEcho,analyzeAugustaPilotEchoRolls} from '../src/combat/augustaTeamPilot.ts';
import {createAugustaPilotExampleBuilds,AUGUSTA_PILOT_EXAMPLE_ENEMY} from '../src/data/augustaPilotExampleBuilds.ts';
const builds=createAugustaPilotExampleBuilds(),enemy=AUGUSTA_PILOT_EXAMPLE_ENEMY;
const compact=(r:ReturnType<typeof evaluateAugustaTeamPilot>)=>r.status==='ENERGY_REQUIREMENT_NOT_MET'?r:{status:r.status,cycleSeconds:r.cycleSeconds,scenarioDamage:r.scenarioDamage,scenarioDps:r.scenarioDps,members:r.members,builds:r.builds,requirements:r.requirements,pending:r.pending,teamDpsReady:r.teamDpsReady};
const comparison=compareAugustaPilotTeams({builds,enemy,cycleNumber:2,heronTransfer:'PUBLISHED_DAMAGE_BONUS'});
const scenarios=(['iuno','mortefi'] as const).map(partnerId=>({partnerId,builds:builds.filter(b=>b.characterId!==(partnerId==='iuno'?'mortefi':'iuno')),enemy,cycleNumber:2 as const,acceptReferenceStateSchedule:true as const,heronTransfer:'PUBLISHED_DAMAGE_BONUS' as const}));
const upgrades=scenarios.map(scenario=>{
 const original=scenario.builds.find(b=>b.characterId==='augusta')!.echoes[0];
 const candidate={...original,substats:original.substats.map(r=>['CRIT DMG','ATK%'].includes(r.name)?{...r,value:SUBSTAT_VALUE_TABLE[r.name].at(-1)!}:r)};
 const result=compareAugustaPilotEcho({scenario,characterId:'augusta',slotIndex:0,candidate});
 return {partnerId:scenario.partnerId,changedEcho:{current:original,candidate},scenarioDpsDelta:result.scenarioDpsDelta,percentChange:result.percentChange,current:compact(result.current),candidate:compact(result.candidate),nextRollTierValues:analyzeAugustaPilotEchoRolls({scenario,characterId:'augusta',slotIndex:0})};
});
const report={scope:'EXPERIMENTAL_FIXED_GEAR_REFERENCE_STATE_SCHEDULE',enemy,exampleBuilds:builds,baseline:{iuno:compact(comparison.iuno),mortefi:compact(comparison.mortefi),scenarioDpsDelta:comparison.scenarioDpsDelta,percentChange:comparison.percentChange,comparisonBasis:comparison.comparisonBasis},upgrades,
 laterCycles:scenarios.map(s=>({partnerId:s.partnerId,cycles:([2,3,4] as const).map(cycleNumber=>compact(evaluateAugustaTeamPilot({...s,cycleNumber})))})),
 heronSensitivity:compact(evaluateAugustaTeamPilot({...scenarios[1],heronTransfer:'DISABLED_SENSITIVITY'})),authorizesUpgradeVerdict:false};
const target='data/generated/augusta-team-pilot-report.json',text=JSON.stringify(report,null,2)+'\n';
if(process.argv.includes('--check')){if(readFileSync(target,'utf8')!==text)throw Error('Pilot report parity drift');}else writeFileSync(target,text);
console.log(JSON.stringify({iuno:comparison.iuno.scenarioDps,mortefi:comparison.mortefi.scenarioDps,percentChange:comparison.percentChange,upgrades:upgrades.map(u=>({partnerId:u.partnerId,percentChange:u.percentChange}))}));
