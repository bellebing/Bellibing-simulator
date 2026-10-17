import {activateConfigurationSlot} from './simulation-configuration.js';
// UI Lab-owned mask, independent of selection and retained card/history data.
// Follows #288's separation of display equipment and active projection inputs;
// canonical simulator sessions cannot consume the Lab's illustrative cards.
export function activeEchoSlots(state) {
  if(state.configurationSession)return state.configurationSession.current.map((card,index)=>state.configurationSession.active[index]?structuredClone(card):null);
  return state.echoes.map((card,index) => state.echoActive[index] ? structuredClone(card) : null);
}
export function activeSlotIndices(state) {
  if(state.configurationSession)return state.configurationSession.configurations.flatMap((template,index)=>template&&state.configurationSession.active[index]?[index]:[]);
  return activeEchoSlots(state).flatMap((card,index) => card ? [index] : []);
}
export function setEchoActive(state,index,active) {
  if(state.configurationSession){activateConfigurationSlot(state.configurationSession,index,active);return;}
  if (!Number.isInteger(index) || index < 0 || index > 4 || typeof active !== 'boolean') throw new RangeError('Invalid Echo activation');
  if (!state.echoes[index]) throw new RangeError('No Echo in this slot');
  state.echoActive[index] = active;
}
export function hasInactiveEchoes(state) {
  if(state.configurationSession)return true; // No accepted-roll projection is connected in Phase 6A.
  return state.echoes.some((card,index) => card && !state.echoActive[index]);
}
export function activationMarkup(index,active,available) {
  return `<button type="button" class="activation-mark${active ? '' : ' is-off'}" data-activation="${index}" aria-label="${active ? 'Deactivate' : 'Activate'} Echo ${index+1}" aria-pressed="${active}" title="${active ? 'Deactivate' : 'Activate'} Echo ${index+1}"${available ? '' : ' disabled'}><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2v7M5.4 4.8a7 7 0 1 0 9.2 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>`;
}
export function positionActivationMarks(host) {
  for (const wrap of host.querySelectorAll('.activation-slot')) {
    const box=wrap.getBoundingClientRect(), card=wrap.querySelector('.echo-card').getBoundingClientRect(), mark=wrap.querySelector('.activation-mark');
    mark.style.top=`${card.top-box.top-3}px`;mark.style.right=`${box.right-card.right-1}px`;
  }
}
export function simulationRequest(state) {
  return {status:'PENDING',reason:'MULTI_SLOT_SIMULATION_PENDING',characterId:state.id,slots:activeSlotIndices(state)};
}
