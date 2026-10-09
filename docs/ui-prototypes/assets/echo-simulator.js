import * as session from '../../assets/echoSimulatorSession.js';
import * as rolling from '../../assets/echoSimulatorRolling.js';
import { RANK5_PRIMARY_MAIN_STATS } from '../../assets/echoMainStats.js';
import { assessEchoRequirements } from '../../assets/echoRequirements.js';

function node(tag, text, className) {
  const result = document.createElement(tag);
  if (text !== undefined) result.textContent = text;
  if (className) result.className = className;
  return result;
}
function inspect(sessionState, slot, card, name, onReturn, trigger, formatStat) {
  const dialog = node('dialog', undefined, 'simulator-inspection');
  dialog.setAttribute('aria-label', 'Trash card history');
  dialog.append(node('h2', name(card.card)), node('p', 'Echo #' + card.id.split(':').at(-1) + ' · Slot ' + slot));
  for (const checkpoint of card.history) {
    const text = checkpoint.level === undefined ? 'Initial candidate' : '+' + checkpoint.level;
    const row = node('section'); row.append(node('strong', text));
    const stats = node('dl', undefined, 'simulator-checkpoint-stats');
    for (const stat of [checkpoint.mainStat, ...(checkpoint.substats || [])].filter(Boolean)) {
      stats.append(node('dt', stat.name), node('dd', formatStat(stat.name, stat.value)));
    }
    row.append(stats);
    dialog.append(row);
  }
  dialog.append(node('p', card.reason));
  const close = node('button', 'Return to pile'); close.type = 'button';
  close.onclick = () => dialog.close(); dialog.append(close);
  dialog.addEventListener('close', () => { dialog.remove(); onReturn(); trigger?.focus({ preventScroll: true }); }, { once: true });
  document.body.append(dialog); dialog.showModal(); close.focus();
}
function renderTrashPile(state, slot, name, onInspect, onReturn, formatStat) {
  const pile = node('section', undefined, 'simulator-trash'); pile.dataset.trashSlot = slot;
  pile.setAttribute('aria-label', 'Trash Pile for Echo ' + slot);
  const cards = state.slots[slot - 1].trash;
  pile.append(node('strong', 'Echo ' + slot + ' · Trash Pile'));
  const stack = node('div', undefined, 'simulator-trash-stack');
  stack.style.setProperty('--pile-depth', Math.min(cards.length, 8));
  if (!cards.length) stack.append(node('small', 'Empty'));
  // Compressed visible bundle; every actual history card remains inspectable on demand.
  for (let index = 0; index < Math.min(cards.length, 8); index++) {
    const back = node('span', undefined, 'simulator-card-back');
    back.style.setProperty('--card-offset', index); back.setAttribute('aria-hidden', 'true'); stack.append(back);
  }
  if (cards.length) {
    const trigger = node('button', name(cards.at(-1).card) + ' ×' + cards.length, 'simulator-pile-top'); trigger.type = 'button';
    trigger.onclick = () => { const card = cards.at(-1); onInspect(slot, card.id); inspect(state, slot, card, name, onReturn, trigger, formatStat); };
    stack.append(trigger);
    const choices = node('details'); choices.append(node('summary', 'Inspect older cards'));
    for (const card of [...cards].reverse()) {
      const button = node('button', name(card.card) + ' · ' + (card.card.level === undefined ? 'Unbuilt' : '+' + card.card.level)); button.type = 'button';
      button.onclick = () => { onInspect(slot, card.id); inspect(state, slot, card, name, onReturn, button, formatStat); };
      choices.append(button);
    }
    pile.append(stack, choices);
  } else pile.append(stack);
  return pile;
}
function renderCheckpointHistory(candidate, formatStat) {
  const details = node('details', undefined, 'simulator-roll-history');
  details.append(node('summary', 'Checkpoint history'));
  for (const checkpoint of candidate.history.filter(card => card.level !== undefined)) {
    const stat = checkpoint.substats?.at(-1);
    details.append(node('p', '+' + checkpoint.level + (stat ? ' · ' + stat.name + ' ' + formatStat(stat.name, stat.value) : ' · Eligible Rank-5 template')));
  }
  return details;
}
function requirementsText(settings, card) {
  const requirements = settings?.presentation.echoPolicy.requirements;
  if (!requirements?.value || settings.migration || settings.compatibility.context !== 'MATCH' || settings.compatibility.suspendedSections.some(key => ['echoRequirements', 'echoPreferences'].includes(key))) return 'Selected Echo requirements: Pending';
  const result = assessEchoRequirements(requirements.value, card);
  return result.status === 'SATISFIED' ? 'Meets selected Echo requirements'
    : result.status === 'IMPOSSIBLE' ? 'Does not meet selected Echo requirements'
    : 'Selected Echo requirements: ' + result.status.toLowerCase() + ' · ' + result.reason;
}
function renderSlotHistory(history, formatStat) {
  const details = node('details', undefined, 'simulator-roll-history');
  details.append(node('summary', 'Slot history'));
  for (const [label, cards] of [['Manually placed', history.accepted], ['Cleared New Echo', history.unplaced]]) {
    for (const candidate of cards) {
      const entry = node('details');
      entry.append(node('summary', label + ' #' + candidate.id.split(':').at(-1)));
      const stats = node('dl', undefined, 'simulator-checkpoint-stats');
      for (const stat of [candidate.card.mainStat, candidate.card.secondaryMainStat, ...(candidate.card.substats || [])].filter(Boolean)) {
        stats.append(node('dt', stat.name), node('dd', formatStat(stat.name, stat.value)));
      }
      entry.append(stats, renderCheckpointHistory(candidate, formatStat));details.append(entry);
    }
  }
  return details;
}
window.bellibingEchoSimulator = Object.freeze({ ...session, ...rolling, RANK5_PRIMARY_MAIN_STATS, renderTrashPile, renderCheckpointHistory, renderSlotHistory, requirementsText });
window.dispatchEvent(new Event('bellibing-echo-simulator-ready'));
