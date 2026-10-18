// Bounded public scenario metadata only; no source schedules or synthetic rolls.
import {readFileSync,writeFileSync} from 'node:fs';
import {AUGUSTA_PILOT_HIT_SOURCE,AUGUSTA_PILOT_HIT_MODELS} from '../../../src/data/augustaPilotHitModels.ts';
import {AUGUSTA_PILOT_EXAMPLE_ENEMY,createAugustaPilotExampleBuilds} from '../../../src/data/augustaPilotExampleBuilds.ts';
import {CANONICAL_CONFIGURATION_SOURCE} from '../../../src/simulationConfigurationBridge.mjs';
const model=AUGUSTA_PILOT_HIT_MODELS.find(m=>m.partnerId==='iuno'),cycle=model.cycles.find(c=>c.number===2);
const manifest={version:'BELLIBING_OBSERVED_ECHO_SCENARIO_V1',scenarioId:'AUGUSTA_IUNO_SHOREKEEPER_REFERENCE_V1',
 providerVersion:'AUGUSTA_REFERENCE_SCENARIO_ADAPTER_V2',publicSourceRevision:CANONICAL_CONFIGURATION_SOURCE,
 sourceCommit:AUGUSTA_PILOT_HIT_SOURCE.sourceCommit,hitEvidenceSha256:AUGUSTA_PILOT_HIT_SOURCE.sha256,
 clock:AUGUSTA_PILOT_HIT_SOURCE.clock,cycle:cycle.number,startFrame:cycle.startFrame,endFrame:cycle.endFrame,durationSeconds:(cycle.endFrame-cycle.startFrame)/60,
 energyRequirements:model.resources.map(r=>({characterId:r.characterId,minimumRatio:r.requiredEnergyRegenPercent/100,basis:'PINNED_FIXED_SCENARIO_RESOURCE_REQUIREMENT'})),
 enemy:AUGUSTA_PILOT_EXAMPLE_ENEMY,actorIds:['augusta','iuno','the-shorekeeper'],
 equipment:createAugustaPilotExampleBuilds().filter(b=>b.characterId!=='mortefi').map(b=>({characterId:b.characterId,sequence:b.sequence,weapon:b.weapon,equipmentPresetId:b.equipmentPresetId})),
 boundary:'EXPERIMENTAL_FIXED_STATE_REPLAY; SYNTHETIC_FIXED_NON_SELECTED_MEMBERS; NO_VERIFIED_UPGRADE'};
const path=new URL('../v1.1/modules/echo-scenario.json',import.meta.url),text=JSON.stringify(manifest,null,2)+'\n';
if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==text)throw Error('Echo scenario metadata drift');}else writeFileSync(path,text);
console.log('Fixed Echo scenario metadata: canonical Augusta/Iuno/Shorekeeper cycle 2; experimental only.');
