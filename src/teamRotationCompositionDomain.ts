/** Timing describes an explicit source-build scenario, never the player's build or DPS. */
export interface ComposedRotationAction {name:string;atFrame:number;waitFrames:number;castUnmet:boolean}
export interface ComposedRotationVisit {characterId:string;startFrame:number;endFrame:number;actions:ComposedRotationAction[]}
export interface ComposedRotationEvent {characterId:string;name:string;castKind:'INTRO'|'OUTRO'|'LIBERATION';atFrame:number;seq:number;triggered:boolean}
export interface ComposedRotationPhase {rotationNumber:number;cycleFrames:number;visits:ComposedRotationVisit[];events:ComposedRotationEvent[]}
export interface ComposedRotationModel {
 id:string;compositionContextId:string|null;publisherRow:number|null;characterIds:string[];
 modules:{characterId:string;loadoutIndex:number;mode:string|null;semanticMode:string|null;definition?:{exportName:string;sourcePath:string};isMainDamage:boolean}[];
 builds?:{characterId:string;sequence:number;weapon:string;echo:string;mainstat:string}[];
 sourceMainstatFallbacks?:{characterId:string;mainstatIndex:number}[];
 resources?:{characterId:string;energyRegenPercent:number;largestRequiredEnergyRegenPercent:number;requiredErRolls:number;shortfall:string|null}[];
 phases:ComposedRotationPhase[];failure:string|null;
}
