// Public request capture only. Resource/slot/Settings revisions invalidate advice
// separately; they do not change the actual source build's ownership identity.
import {captureLocalTeamBuilds} from './localTeamBuildCapture.mjs';
export function captureObservedImproveCurrent(input){
 if(input?.mode!=='IMPROVE')return Promise.resolve({status:'PENDING',reason:'ACTUAL_CURRENT_REQUIRED'});
 return captureLocalTeamBuilds({...input,scope:{kind:'ACTUAL_CURRENT_IMPROVE_V1'},candidates:Array(5).fill(null),acceptReferenceInvestment:false});
}
