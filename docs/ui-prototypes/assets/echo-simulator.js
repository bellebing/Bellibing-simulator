import { simulatedCharacterTargets } from './character-target-presentation.js';
import * as session from '../../assets/echoSimulatorSession.js';
import * as run from '../../assets/echoSimulatorRun.js';
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
  dialog.append(node('p', 'Discarded · Reached +' + (card.card.level ?? 0)), renderCheckpointHistory(card, formatStat, true));
  dialog.append(node('p', card.reason));
  const close = node('button', 'Return to pile'); close.type = 'button';
  close.onclick = () => dialog.close(); dialog.append(close);
  dialog.addEventListener('close', () => { dialog.remove(); onReturn(); trigger?.focus({ preventScroll: true }); }, { once: true });
  document.body.append(dialog); dialog.showModal(); close.focus();
}
function renderTrashPile(state, slot, name, onInspect, onReturn, formatStat, identity = card => ({ name: name(card) })) {
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
    const trigger = node('button', undefined, 'simulator-pile-top improve-equipped-echo'); trigger.type = 'button';
    trigger.append(renderEchoCard(cards.at(-1).card, identity(cards.at(-1).card), formatStat), node('span', 'Discarded · ×' + cards.length));
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
/** One renderer for generated, prepared, unrolled and discarded slot cards. */
function renderEchoCard(card, identity, formatStat) {
  const host = node('span', undefined, 'simulator-echo-card');
  host.append(node('span', identity?.name ?? card?.echoId ?? 'Empty', 'improve-equipped-name'));
  const art = node('span', undefined, 'improve-equipped-art');
  if (identity?.artSrc) { const img = node('img'); img.src = identity.artSrc; img.alt = ''; img.draggable = false; art.append(img); }
  const cost = node('span', 'COST ' + (card?.cost ?? identity?.cost ?? '—'), 'improve-equipped-cost');
  cost.append(node('span', card?.level === undefined ? 'Not rolled' : '+' + card.level, 'improve-equipped-level'));
  host.append(art, cost);
  const stats = node('span', undefined, 'improve-echo-substats');
  const entries = [card?.mainStat ?? (card?.primaryMainStat ? { name: card.primaryMainStat } : null), card?.secondaryMainStat, ...(card?.substats ?? [])].filter(Boolean);
  for (const [index, stat] of entries.entries()) {
    const row = node('span', undefined, 'improve-echo-substat' + (index < (card?.secondaryMainStat ? 2 : 1) ? ' is-main' : ''));
    row.append(node('span', stat.name), node('strong', Number.isFinite(stat.value) ? formatStat(stat.name, stat.value) : '—')); stats.append(row);
  }
  if (!entries.length) stats.append(node('span', 'Choose main stat', 'improve-echo-substat'));
  host.append(stats); return host;
}
function renderCheckpointHistory(candidate, formatStat, discarded = false) {
  const details = node('details', undefined, 'simulator-roll-history');
  details.append(node('summary', 'Checkpoint history')); details.open = discarded;
  const checkpoints = candidate.history.filter(card => card.level > 0);
  for (const [index, checkpoint] of checkpoints.entries()) {
    const stat = checkpoint.substats?.at(-1);
    const row = node('p'); row.dataset.checkpointLevel = checkpoint.level;
    row.append(node('span', '+' + checkpoint.level + ' · '));
    const text = stat ? stat.name + ' ' + formatStat(stat.name, stat.value) : 'Roll unavailable';
    row.append(node(discarded && index === checkpoints.length - 1 ? 's' : 'span', text)); details.append(row);
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
  for (const [label, cards] of [['Equipment', history.accepted], ['Cleared New Echo', history.unplaced]]) {
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
function renderActivationControl(active, enabled, onChange, label) {
  const group = node('div', undefined, 'simulator-activation');
  group.setAttribute('role', 'group'); group.setAttribute('aria-label', label);
  for (const [value, text] of [[true, '✓'], [false, '⏻']]) {
    const button = node('button', text); button.type = 'button';
    button.title = value ? 'Activate' : 'Deactivate';
    button.setAttribute('aria-label', (value ? 'Activate ' : 'Deactivate ') + label);
    button.dataset.activation = String(value); button.disabled = !enabled;
    button.setAttribute('aria-pressed', String(enabled && active === value));
    button.onclick = () => onChange(value); group.append(button);
  }
  return group;
}
window.bellibingEchoSimulator = Object.freeze({ ...session, ...rolling, ...run, RANK5_PRIMARY_MAIN_STATS, simulatedCharacterTargets, renderEchoCard, renderActivationControl, renderTrashPile, renderCheckpointHistory, renderSlotHistory, requirementsText });
window.dispatchEvent(new Event('bellibing-echo-simulator-ready'));
