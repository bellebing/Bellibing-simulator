import * as session from '../../assets/echoSimulatorSession.js';

function node(tag, text, className) {
  const result = document.createElement(tag);
  if (text !== undefined) result.textContent = text;
  if (className) result.className = className;
  return result;
}
function inspect(sessionState, slot, card, name, onReturn, trigger) {
  const dialog = node('dialog', undefined, 'simulator-inspection');
  dialog.setAttribute('aria-label', 'Trash card history');
  dialog.append(node('h2', name(card.card)), node('p', 'Echo ' + slot + ' · ' + card.id));
  for (const checkpoint of card.history) {
    const text = checkpoint.level === undefined ? 'Initial candidate' : '+' + checkpoint.level;
    const row = node('section'); row.append(node('strong', text));
    if (checkpoint.mainStat) row.append(node('p', checkpoint.mainStat.name + ' · ' + checkpoint.mainStat.value));
    for (const stat of checkpoint.substats || []) row.append(node('p', stat.name + ' · ' + stat.value));
    dialog.append(row);
  }
  dialog.append(node('p', card.reason));
  const close = node('button', 'Return to pile'); close.type = 'button';
  close.onclick = () => dialog.close(); dialog.append(close);
  dialog.addEventListener('close', () => { dialog.remove(); onReturn(); trigger?.focus({ preventScroll: true }); }, { once: true });
  document.body.append(dialog); dialog.showModal(); close.focus();
}
function renderTrashPile(state, slot, name, onInspect, onReturn) {
  const pile = node('section', undefined, 'simulator-trash'); pile.dataset.trashSlot = slot;
  pile.setAttribute('aria-label', 'Trash Pile for Echo ' + slot);
  const cards = state.slots[slot - 1].trash;
  pile.append(node('strong', 'Trash Pile · ' + cards.length));
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
    trigger.onclick = () => { const card = cards.at(-1); onInspect(slot, card.id); inspect(state, slot, card, name, onReturn, trigger); };
    stack.append(trigger);
    const choices = node('details'); choices.append(node('summary', 'Inspect older cards'));
    for (const card of [...cards].reverse()) {
      const button = node('button', name(card.card) + ' · ' + (card.card.level === undefined ? 'Unbuilt' : '+' + card.card.level)); button.type = 'button';
      button.onclick = () => { onInspect(slot, card.id); inspect(state, slot, card, name, onReturn, button); };
      choices.append(button);
    }
    pile.append(stack, choices);
  } else pile.append(stack);
  return pile;
}
window.bellibingEchoSimulator = Object.freeze({ ...session, renderTrashPile });
window.dispatchEvent(new Event('bellibing-echo-simulator-ready'));
