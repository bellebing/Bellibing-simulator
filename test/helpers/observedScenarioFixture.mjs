// Controlled aggregate DTO for public presentation tests, never gameplay data.
import scenario from '../../docs/ui-lab/v1.1/modules/echo-scenario.json' with {type:'json'};
export function observedScenarioFixture(){
 const cards=[1,2,3,4,5].map(n=>({id:'unit-card-'+n,level:25,rank:5,cost:n===1?4:n<4?3:1,speciesId:'unit-species-'+n,selectedSonataSetId:'unit-set',mainStat:{name:'ATK%'}}));
 const alternative={...cards[0],id:'unit-alternative'};
 const view={sessionId:'unit-observed-session',revision:1,slots:cards.map((current,i)=>({slot:i+1,complete:true,current,candidate:null,trash:i===0?[{id:alternative.id,card:alternative}]:[]}))};
 const contributions=values=>scenario.actorIds.map((characterId,i)=>({characterId,dps:values[i]}));
 const baseline={status:'EXPERIMENTAL',loadoutIdentity:'unit-baseline',characterContributions:contributions([1,2,3]),teamTotal:6};
 const alternatives=[1,2,3,4,5].map(slot=>({slot,fromCardId:cards[slot-1].id,toCardId:null,status:'PENDING',reason:'NO_COMPLETE_OBSERVED_ALTERNATIVE',teamTotal:null,characterContributions:null,delta:null,loadoutIdentity:null}));
 alternatives[0]={...alternatives[0],status:'EXPERIMENTAL',reason:null,toCardId:alternative.id,loadoutIdentity:'unit-changed',characterContributions:contributions([2,2,3]),teamTotal:7,delta:{teamTotal:{absolute:1,relative:1/6},characterContributions:scenario.actorIds.map((characterId,i)=>({characterId,absolute:i===0?1:0,relative:i===0?1:0}))}};
 const provider={kind:'DPS',version:scenario.providerVersion,profileId:scenario.scenarioId,sourceRevision:scenario.publicSourceRevision,sourceBinding:'unit-fixed-source-binding'};
 const dps={characterId:'augusta',status:'EXPERIMENTAL',verification:'EXPERIMENTAL',provider,characterContributions:baseline.characterContributions,teamTotal:6,context:{kind:'SYNTHETIC_REFERENCE_TEAM',id:scenario.scenarioId,version:1},beforeAfter:{version:scenario.version,status:'EXPERIMENTAL',measurement:{selectedCharacterId:'augusta',scenarioId:scenario.scenarioId,sourceBinding:provider.sourceBinding,sourceRevision:provider.sourceRevision,actorIds:scenario.actorIds,cycle:scenario.cycle,durationSeconds:scenario.durationSeconds,clock:scenario.clock,scheduleSourceCommit:scenario.sourceCommit,hitEvidenceSha256:scenario.hitEvidenceSha256},observation:{sessionId:view.sessionId,revision:view.revision,currentCardIds:cards.map(c=>c.id)},baseline,alternatives,teamDpsReady:false,authorizesCharacterUpgrade:false}};
 return {dps,view,scenario};
}
