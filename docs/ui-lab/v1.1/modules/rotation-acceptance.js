import scenario from './echo-scenario.json' with {type:'json'};
import {escapeHtml} from './util.js';
export function rotationAcceptanceText(run){
 if(run?.status!=='GOAL_SUCCESS')return run?.status??null;
 const gate=run.metrics?.buildAcceptance?.rotation;
 if(gate?.status==='NOT_MET')return 'Echo targets met · rotation ER not met';
 if(gate?.status==='MET')return 'Echo targets met · rotation ER met · DPS experimental';
 return 'Echo targets met · rotation DPS Pending';
}
export function rotationGateMarkup(characterId,dps){
 const source=scenario.energyRequirements.find(r=>r.characterId===characterId),gate=dps?.rotationAcceptance;
 if(!source)return '';
 const pct=n=>(n*100).toFixed(4).replace(/0+$/,'').replace(/\.$/,'')+'%';
 const valid=gate?.scope==='TOTAL_CHARACTER_BUILD'&&gate.characterId===characterId&&gate.scenarioId===scenario.scenarioId&&gate.sourceMinimumRatio===source.minimumRatio;
 return `<p class="rotation-er-gate" data-status="${valid?escapeHtml(gate.status):'PENDING'}">Rotation ER · ${pct(source.minimumRatio)} total build minimum${valid&&gate.requiredRatio>source.minimumRatio?` · Custom total minimum ${pct(gate.requiredRatio)}`:''}${valid&&Number.isFinite(gate.actualRatio)?` · observed ${pct(gate.actualRatio)} · ${gate.status==='MET'?'met':'not met'}`:' · observed build Pending'}. This is not an ER roll requirement on each Echo.</p>`;
}
