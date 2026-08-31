import { listAlphaCharacterOptions, resolveAlphaSelection, type AlphaResolvedSelection } from '../alphaEntryModel.ts';
import {
  OWNED_ECHO_CHECKPOINT_LEVELS,
  analyzeOwnedEchoCheckpoint,
  listOwnedEchoRollOptions,
  type OwnedEchoCheckpointLevel,
  type OwnedEchoCheckpointResult,
} from '../ownedEchoCheckpointAnalysis.ts';
import type { StatName, StatRoll } from '../echoCore.ts';

function requireAppRoot(): HTMLDivElement {
  const root = document.querySelector<HTMLDivElement>('#app');
  if (!root) throw new Error('Missing #app root.');
  return root;
}

const app = requireAppRoot();
const characters = listAlphaCharacterOptions();
const ownedRollOptions = listOwnedEchoRollOptions();
if (characters.length === 0) throw new Error('Alpha entry has no selectable registry profiles.');
if (ownedRollOptions.length === 0) throw new Error('Owned Echo analysis has no verified roll options.');

let selectedCharacterId = characters.find((row) => row.readinessDisposition === 'DPS_READY')?.characterId
  ?? characters[0]!.characterId;
let selectedPresetId: string | undefined;
let analysisMessage = '';
let ownedEchoOpen = false;
let ownedEchoSlotIndex = 0;
let ownedEchoLevel: OwnedEchoCheckpointLevel = 5;
let ownedEchoRolls: StatRoll[] = [];
let ownedEchoResult: OwnedEchoCheckpointResult | null = null;
let ownedEchoError = '';
let ownedEchoPendingStatName: StatName = ownedRollOptions[0]!.name;

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function statusLabel(disposition: string): string {
  if (disposition === 'DPS_READY') return 'DPS READY';
  if (disposition === 'PROFILE_COMPLETE_PENDING_FREEZE') return 'BUILD READY · SOURCE EXECUTION ONLY';
  if (disposition === 'CHARACTER_MECHANICS_SOURCE_BLOCKED') return 'MECHANICS SOURCE BLOCKED';
  return 'PROFILE SOURCE PENDING';
}

function resetOwnedEcho(close = false): void {
  if (close) ownedEchoOpen = false;
  ownedEchoSlotIndex = 0;
  ownedEchoLevel = 5;
  ownedEchoRolls = [];
  ownedEchoResult = null;
  ownedEchoError = '';
  ownedEchoPendingStatName = ownedRollOptions[0]!.name;
}

function formatRoll(name: StatName, value: number): string {
  return name.startsWith('Flat ')
    ? Math.round(value).toLocaleString('en-US')
    : `${(value * 100).toFixed(1)}%`;
}

function ownedEchoVerdictClass(result: OwnedEchoCheckpointResult): string {
  if (result.decision === 'DISCARD') return 'alpha-owned-verdict--discard';
  if (result.decision === 'KEEP') return 'alpha-owned-verdict--keep';
  if (result.decision === 'TEMPORARY') return 'alpha-owned-verdict--temporary';
  return 'alpha-owned-verdict--roll';
}

function ownedEchoMarkup(selection: AlphaResolvedSelection): string {
  if (!selection.rollAssist.supported || !ownedEchoOpen) return '';

  const expectedRolls = ownedEchoLevel / 5;
  const usedNames = new Set(ownedEchoRolls.map((roll) => roll.name));
  const available = ownedRollOptions.filter((option) => !usedNames.has(option.name));
  const selectedOption = available.find((option) => option.name === ownedEchoPendingStatName) ?? available[0] ?? null;

  const resultMarkup = ownedEchoResult
    ? `<div class="alpha-owned-verdict ${ownedEchoVerdictClass(ownedEchoResult)}" data-decision="${ownedEchoResult.decision}">
        <span>CHECKPOINT VERDICT</span>
        <strong>${escapeHtml(ownedEchoResult.headline)}</strong>
        <small>${escapeHtml(ownedEchoResult.reason)}</small>
        <small>Target hits: ${ownedEchoResult.targetHits.length > 0 ? ownedEchoResult.targetHits.map(escapeHtml).join(' · ') : 'none'} · Dead rolls: ${ownedEchoResult.deadCount}</small>
      </div>`
    : ownedEchoError
      ? `<div class="alpha-owned-verdict alpha-owned-verdict--discard"><span>INPUT ERROR</span><strong>CHECK THE ECHO</strong><small>${escapeHtml(ownedEchoError)}</small></div>`
      : '';

  const entryMarkup = ownedEchoResult
    ? '<button id="alpha-owned-reset" class="alpha-owned-reset" type="button">CHECK ANOTHER ECHO</button>'
    : `<div class="alpha-owned-entry">
        <div>
          <span>ROLL ${ownedEchoRolls.length + 1} OF ${expectedRolls}</span>
          <strong>What substat did it roll?</strong>
        </div>
        <div class="alpha-owned-entry-row">
          <select id="alpha-owned-stat" aria-label="Owned Echo substat">
            ${available.map((option) => `<option value="${escapeHtml(option.name)}" ${option.name === selectedOption?.name ? 'selected' : ''}>${escapeHtml(option.name)}</option>`).join('')}
          </select>
          <select id="alpha-owned-value" aria-label="Owned Echo roll value">
            ${(selectedOption?.values ?? []).map((value) => `<option value="${value}">${formatRoll(selectedOption!.name, value)}</option>`).join('')}
          </select>
          <button id="alpha-owned-add" type="button">ADD ROLL</button>
        </div>
      </div>`;

  return `<div class="alpha-owned-panel">
    <div class="alpha-owned-header">
      <div><span>OWNED ECHO</span><strong>Check the Echo you already have.</strong></div>
      <button id="alpha-owned-close" type="button">CLOSE</button>
    </div>
    <div class="alpha-owned-context">
      <label><span>Which build slot?</span><select id="alpha-owned-slot">
        ${selection.rollAssist.slots.map((slot, index) => `<option value="${index}" ${index === ownedEchoSlotIndex ? 'selected' : ''}>Echo ${index + 1} · COST ${slot.cost} · ${escapeHtml(slot.primaryMain)}</option>`).join('')}
      </select></label>
      <label><span>Current level?</span><select id="alpha-owned-level">
        ${OWNED_ECHO_CHECKPOINT_LEVELS.map((level) => `<option value="${level}" ${level === ownedEchoLevel ? 'selected' : ''}>+${level}</option>`).join('')}
      </select></label>
    </div>
    <div class="alpha-owned-roll-list">
      ${ownedEchoRolls.length > 0
        ? ownedEchoRolls.map((roll, index) => `<div><span>${index + 1}</span><strong>${escapeHtml(roll.name)}</strong><b>${formatRoll(roll.name, roll.value)}</b></div>`).join('')
        : '<small>No rolls entered yet.</small>'}
    </div>
    ${resultMarkup}
    ${entryMarkup}
  </div>`;
}

function rollAssistMarkup(selection: AlphaResolvedSelection): string {
  return `<div class="alpha-roll-assist ${selection.rollAssist.supported ? 'alpha-roll-assist--ready' : ''}">
    <div>
      <span>ROLL ASSIST</span>
      <strong>${selection.rollAssist.supported ? 'Verified checkpoint policy available.' : 'Checkpoint policy pending.'}</strong>
      <small>${escapeHtml(selection.rollAssist.reason)}${selection.rollAssist.policyId ? ` Policy: ${escapeHtml(selection.rollAssist.policyId)}.` : ''}</small>
    </div>
    ${selection.rollAssist.supported && selection.rollAssist.href
      ? `<div class="alpha-roll-assist-actions">
          <a id="alpha-roll-assist" href="${escapeHtml(selection.rollAssist.href)}">ROLL NEW ECHOES</a>
          <button id="alpha-owned-toggle" type="button">CHECK AN ECHO I OWN</button>
        </div>`
      : '<span class="alpha-roll-assist-disabled">POLICY PENDING</span>'}
  </div>${ownedEchoMarkup(selection)}`;
}

function render(): void {
  const selection = resolveAlphaSelection(selectedCharacterId, selectedPresetId);
  selectedPresetId = selection.preset.id;
  if (!selection.rollAssist.supported && ownedEchoOpen) resetOwnedEcho(true);
  const readinessClass = selection.analysisReady ? 'alpha-status--ready' : 'alpha-status--pending';

  app.innerHTML = `
    <main class="alpha-shell">
      <header class="alpha-header">
        <div>
          <div class="alpha-eyebrow">BELLIBING / ALPHA</div>
          <h1>Build the Echo.<br><span>Know what to do next.</span></h1>
        </div>
        <div class="alpha-tools">
          <span class="alpha-live"><i></i> REGISTRY LIVE</span>
          <a href="./echo-lab.html">Echo Lab</a>
        </div>
      </header>

      <section class="alpha-step alpha-step--first">
        <div class="alpha-step-label">1 · CHARACTER</div>
        <label class="alpha-select-wrap">
          <span>Who are you building?</span>
          <select id="alpha-character">
            ${characters.map((character) => `
              <option value="${escapeHtml(character.characterId)}" ${character.characterId === selectedCharacterId ? 'selected' : ''}>
                ${escapeHtml(character.name)} · ${escapeHtml(character.element ?? 'Pending')} · ${character.rarity}★
              </option>`).join('')}
          </select>
        </label>
        <div class="alpha-status ${readinessClass}">${escapeHtml(statusLabel(selection.character.readinessDisposition))}</div>
      </section>

      <section class="alpha-step">
        <div class="alpha-step-label">2 · MODE</div>
        <div class="alpha-mode-list">
          ${selection.character.presets.map((preset) => `
            <button type="button" data-preset="${escapeHtml(preset.id)}" class="${preset.id === selection.preset.id ? 'active' : ''}">
              <strong>${escapeHtml(preset.label)}</strong>
              <span>${escapeHtml(preset.modeKey)}${preset.isDefault ? ' · DEFAULT' : ''}</span>
            </button>`).join('')}
        </div>
      </section>

      <section class="alpha-step alpha-build">
        <div class="alpha-step-label">3 · RECOMMENDED STARTING BUILD</div>
        <div class="alpha-build-grid">
          <article>
            <span>Weapon</span>
            <strong>${escapeHtml(selection.weapon.name)}</strong>
            <small>${selection.weapon.alternatives.length > 0 ? `Alternatives: ${selection.weapon.alternatives.map(escapeHtml).join(', ')}` : 'Canonical default'}</small>
          </article>
          <article>
            <span>Team</span>
            <strong>${selection.team.map(escapeHtml).join(' / ')}</strong>
            <small>From canonical TeamProfile</small>
          </article>
          <article>
            <span>Stat priority</span>
            <strong>${selection.statPriorities.map(escapeHtml).join(' → ')}</strong>
            <small>${selection.statGates.length > 0 ? selection.statGates.map(escapeHtml).join(' · ') : 'No source-backed hard gate in this profile'}</small>
          </article>
        </div>
      </section>

      <section class="alpha-step">
        <div class="alpha-step-label">4 · ECHOES</div>
        <div class="alpha-echo-summary">
          <div><span>Sonata</span><strong>${selection.echoes.sonatas.map(escapeHtml).join(' + ')}</strong></div>
          <div><span>Main Echo</span><strong>${escapeHtml(selection.echoes.mainEcho ?? 'No fixed main Echo')}</strong></div>
        </div>
        <div class="alpha-echo-grid">
          ${selection.echoes.slots.map((slot, index) => `
            <article>
              <span>ECHO ${index + 1} · COST ${slot.cost}</span>
              <strong>${slot.mainStats.map(escapeHtml).join(' / ')}</strong>
            </article>`).join('')}
        </div>
        ${rollAssistMarkup(selection)}
      </section>

      <section class="alpha-step alpha-analyze">
        <div>
          <div class="alpha-step-label">5 · ANALYZE</div>
          <h2>${selection.analysisReady ? 'Executable DPS profile verified.' : 'Source truth is loaded. DPS is not executable yet.'}</h2>
          <p>${selection.rotation.executionStatus === 'ENGINE_MODELED'
            ? `Rotation model ${escapeHtml(selection.rotation.engineModelId ?? 'missing')} · ${selection.rotation.rotationSeconds ?? 'duration pending'}s.`
            : 'Rotation is SOURCE_SEQUENCE_ONLY. Bellibing will not invent timing, uptime or a DPS denominator.'}</p>
        </div>
        <button id="alpha-analyze" type="button">ANALYZE</button>
      </section>

      ${analysisMessage ? `<section class="alpha-result ${selection.analysisReady ? 'alpha-result--ready' : ''}">${escapeHtml(analysisMessage)}</section>` : ''}

      <footer>
        Registry-driven Alpha shell. Debug/oracle surfaces stay separate from the normal start flow.
      </footer>
    </main>`;

  bind();
}

function bind(): void {
  document.querySelector<HTMLSelectElement>('#alpha-character')?.addEventListener('change', (event) => {
    selectedCharacterId = (event.currentTarget as HTMLSelectElement).value;
    selectedPresetId = undefined;
    analysisMessage = '';
    resetOwnedEcho(true);
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedPresetId = button.dataset.preset;
      analysisMessage = '';
      resetOwnedEcho(true);
      render();
    });
  });

  document.querySelector<HTMLButtonElement>('#alpha-owned-toggle')?.addEventListener('click', () => {
    ownedEchoOpen = !ownedEchoOpen;
    if (ownedEchoOpen) resetOwnedEcho(false);
    render();
  });
  document.querySelector<HTMLButtonElement>('#alpha-owned-close')?.addEventListener('click', () => {
    resetOwnedEcho(true);
    render();
  });
  document.querySelector<HTMLSelectElement>('#alpha-owned-slot')?.addEventListener('change', (event) => {
    ownedEchoSlotIndex = Number((event.currentTarget as HTMLSelectElement).value);
    ownedEchoRolls = [];
    ownedEchoResult = null;
    ownedEchoError = '';
    render();
  });
  document.querySelector<HTMLSelectElement>('#alpha-owned-level')?.addEventListener('change', (event) => {
    ownedEchoLevel = Number((event.currentTarget as HTMLSelectElement).value) as OwnedEchoCheckpointLevel;
    ownedEchoRolls = [];
    ownedEchoResult = null;
    ownedEchoError = '';
    render();
  });
  document.querySelector<HTMLSelectElement>('#alpha-owned-stat')?.addEventListener('change', (event) => {
    ownedEchoPendingStatName = (event.currentTarget as HTMLSelectElement).value;
    render();
  });
  document.querySelector<HTMLButtonElement>('#alpha-owned-add')?.addEventListener('click', () => {
    const stat = document.querySelector<HTMLSelectElement>('#alpha-owned-stat')?.value;
    const rawValue = document.querySelector<HTMLSelectElement>('#alpha-owned-value')?.value;
    if (!stat || rawValue === undefined) return;

    const nextRolls = [...ownedEchoRolls, { name: stat, value: Number(rawValue) }];
    ownedEchoRolls = nextRolls;
    ownedEchoError = '';
    const expectedRolls = ownedEchoLevel / 5;
    if (nextRolls.length === expectedRolls && selectedPresetId) {
      try {
        ownedEchoResult = analyzeOwnedEchoCheckpoint({
          presetId: selectedPresetId,
          slotIndex: ownedEchoSlotIndex,
          level: ownedEchoLevel,
          substats: nextRolls,
        });
      } catch (error) {
        ownedEchoResult = null;
        ownedEchoError = error instanceof Error ? error.message : 'Unknown owned Echo analysis error.';
      }
    }
    render();
  });
  document.querySelector<HTMLButtonElement>('#alpha-owned-reset')?.addEventListener('click', () => {
    ownedEchoRolls = [];
    ownedEchoResult = null;
    ownedEchoError = '';
    render();
  });

  document.querySelector<HTMLButtonElement>('#alpha-analyze')?.addEventListener('click', () => {
    const selection = resolveAlphaSelection(selectedCharacterId, selectedPresetId);
    analysisMessage = selection.analysisReady
      ? 'READY: this profile has a verified executable rotation. No full owned five-Echo build has been entered on this shell, so Bellibing does not fabricate a damage verdict.'
      : `BLOCKED: ${statusLabel(selection.character.readinessDisposition)}. The recommended build remains usable as source-backed guidance, but DPS analysis stays fail-closed.`;
    render();
  });
}

render();
