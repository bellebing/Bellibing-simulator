import { $, baseAsset, escapeHtml } from './util.js';
import { visibleMaterials } from './lab-state.js';

// Receives explicit presentation state. It never validates a loadout, spends a
// resource or chooses a fix. A future Suggest a Fix action belongs to its caller.
export function mountWorkshopFeedback({ highlightSlots, clearHighlights }) {
  const popover = $('#workshopExplanation');
  const fix = $('#howToFix');
  let current;
  function positionExplanation() {
    if (!popover.matches(':popover-open')) return;
    const source = fix.getBoundingClientRect();
    const bounds = popover.getBoundingClientRect();
    popover.style.left = `${Math.max(16, Math.min(innerWidth - bounds.width - 16, source.left + source.width / 2 - bounds.width / 2))}px`;
    popover.style.top = `${Math.max(16, Math.min(innerHeight - bounds.height - 16, source.bottom + 14))}px`;
  }
  function closeExplanation() {
    if (popover.matches(':popover-open')) popover.hidePopover();
    clearHighlights();
  }
  fix.onclick = () => {
    if (popover.matches(':popover-open')) { closeExplanation(); return; }
    const explanation = current.explanation;
    if (!explanation) return;
    $('#explanationTitle').textContent = explanation.title;
    $('#explanationMessage').textContent = explanation.message;
    $('#explanationFacts').innerHTML = (explanation.facts ?? []).map(fact => `<div><dt>${escapeHtml(fact.label)}</dt><dd>${escapeHtml(fact.value)}</dd></div>`).join('');
    $('#explanationNote').textContent = explanation.note ?? '';
    popover.dataset.severity = current.severity;
    popover.showPopover();
    positionExplanation();
    highlightSlots(current.affectedSlots ?? [], current.severity);
    $('#closeExplanation').focus({ preventScroll: true });
  };
  $('#closeExplanation').onclick = closeExplanation;
  popover.addEventListener('beforetoggle', event => {
    if (event.newState !== 'closed') return;
    const focusedInside = popover.contains(document.activeElement);
    clearHighlights();
    if (focusedInside) fix.focus({ preventScroll: true });
  });
  popover.addEventListener('toggle', () => fix.setAttribute('aria-expanded', popover.matches(':popover-open')));
  window.addEventListener('resize', positionExplanation);
  window.addEventListener('scroll', positionExplanation, { passive: true, capture: true });

  function render(feedback) {
    closeExplanation();
    current = feedback;
    $('#workshopFeedback').dataset.severity = feedback.severity;
    $('#feedbackTitle').textContent = feedback.title;
    $('#feedbackText').textContent = feedback.message ?? '';
    $('#feedbackText').hidden = !feedback.message;
    fix.hidden = !feedback.explanation;
    $('#simulate').disabled = !feedback.actionAllowed;
    $('#simulate').setAttribute('aria-describedby', 'feedbackTitle demoDescription');
    // An empty record means no consumption; null explicitly means unavailable.
    const records = feedback.recordedMaterials;
    const rows = records === null ? null : visibleMaterials(records ?? []);
    $('#consumption').hidden = rows !== null && rows.length === 0;
    $('#materialRows').innerHTML = rows === null
      ? '<p class="materials-unavailable">Consumption not recorded</p>'
      : rows.map(material => `<div class="material-row"><span>${material.icon ? `<img src="${baseAsset(material.icon)}" alt="">` : '<span class="material-symbol" aria-hidden="true">◇</span>'}${escapeHtml(material.name)}</span><strong>${material.count == null ? '—' : escapeHtml(material.count)}</strong></div>`).join('');
  }
  return { render, closeExplanation };
}
