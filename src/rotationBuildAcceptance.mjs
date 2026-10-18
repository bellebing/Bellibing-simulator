// Whole-build gates. Never turn a total requirement into per-Echo roll criteria.
export function rotationBuildAcceptance({characterId,scenarioId,requirement,customTarget=null,total=null,complete=false,upperBound=null}={}){
 const source=typeof requirement==='number'&&Number.isFinite(requirement)&&requirement>=1?requirement:null;
 const custom=customTarget?.enabled===true&&typeof customTarget.valuePercent==='number'?customTarget.valuePercent/100:customTarget?.enabled?NaN:null;
 const base={scope:'TOTAL_CHARACTER_BUILD',characterId,scenarioId,sourceMinimumRatio:source,customMinimumRatio:custom,requiredRatio:null,actualRatio:null,status:'PENDING',reason:null,authorizesDps:false};
 if(customTarget?.enabled&&(!Number.isFinite(custom)||custom<0))return {...base,reason:'INVALID_CUSTOM_TOTAL_ER'};
 if(source===null)return {...base,reason:'SOURCE_ROTATION_ER_PENDING'};
 const required=Math.max(source,custom??0);base.requiredRatio=required;
 if(Number.isFinite(upperBound)&&upperBound+1e-9<required)return {...base,status:'UNREACHABLE',upperBoundRatio:upperBound,reason:'TOTAL_ER_UNREACHABLE_WITH_CURRENT_SHELL_AND_REQUIREMENTS'};
 if(!complete||!Number.isFinite(total)||total<1)return {...base,reason:'FIVE_COMPLETE_OBSERVED_CARDS_REQUIRED'};
 const met=total+1e-9>=required;
 return {...base,actualRatio:total,status:met?'MET':'NOT_MET',reason:met?null:'TOTAL_ROTATION_ER_NOT_MET'};
}
