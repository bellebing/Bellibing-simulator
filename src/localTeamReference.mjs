// Public scenario labels/transport only. No calculator or gameplay execution.
const sourceTeams=new Set(['guide-jinhsi-zhezhi-the-shorekeeper-jinhsi-slots-22','guide-jinhsi-zhezhi-verina-jinhsi-slots-22']);
export function localTeamReference(teamContextId){
 const source=sourceTeams.has(teamContextId);
 return {label:source?'Riley source model':'fixed reference',defense:source?1592:1520,resistance:source?0.2:0.1,
  enemy:{defense:source?1592:1520,resistanceByElement:Object.fromEntries(['Aero','Electro','Fusion','Glacio','Spectro','Havoc','Physical'].map(e=>[e,source?0.2:0.1])),damageReduction:0}};
}
