import { listAlphaCharacterOptions, resolveAlphaSelection } from '../alphaEntryModel.ts';

function requireAppRoot(): HTMLDivElement {
  const root = document.querySelector<HTMLDivElement>('#app');
  if (!root) throw new Error('Missing #app root.');
  return root;
}

const app = requireAppRoot();
const characters = listAlphaCharacterOptions();
if (characters.length === 0) throw new Error('Alpha entry has no selectable registry profiles.');

let selectedCharacterId = characters.find((row) => row.readinessDisposition === 'DPS_READY')?.characterId
  ?? characters[0]!.characterId;
let selectedPresetId: string | undefined;
let analysisMessage = '';

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

function render(): void {
  const selection = resolveAlphaSelection(selectedCharacterId, selectedPresetId);
  selectedPresetId = selection.preset.id;
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
          <a href="./roll-assistant.html">Roll Assist demo</a>
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
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedPresetId = button.dataset.preset;
      analysisMessage = '';
      render();
    });
  });

  document.querySelector<HTMLButtonElement>('#alpha-analyze')?.addEventListener('click', () => {
    const selection = resolveAlphaSelection(selectedCharacterId, selectedPresetId);
    analysisMessage = selection.analysisReady
      ? 'READY: this profile has a verified executable rotation. No owned Echo values were entered on this shell, so Bellibing does not fabricate a damage verdict.'
      : `BLOCKED: ${statusLabel(selection.character.readinessDisposition)}. The recommended build remains usable as source-backed guidance, but DPS analysis stays fail-closed.`;
    render();
  });
}

render();
