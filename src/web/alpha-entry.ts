import { listAlphaCharacterOptions, resolveAlphaSelection, type AlphaResolvedSelection } from '../alphaEntryModel.ts';
import {
  analyzeOwnedBuild,
  resolveOwnedBuildDpsBinding,
  type OwnedBuildAnalysisResult,
} from '../ownedBuildAnalysis.ts';
import { buildOwnedBuildEchoFromCanonicalInput } from '../ownedBuildEchoInput.ts';
import {
  analyzeFinishedOwnedBuildCandidate,
  forecastPartialOwnedBuildCandidate,
  type FinishedOwnedBuildCandidateResult,
  type PartialOwnedBuildCandidateForecast,
} from '../ownedBuildUpgradeAnalysis.ts';
import {
  OWNED_ECHO_CHECKPOINT_LEVELS,
  analyzeOwnedEchoCheckpoint,
  buildOwnedEchoFromCheckpointInput,
  listOwnedEchoRollOptions,
  type OwnedEchoCheckpointLevel,
  type OwnedEchoCheckpointResult,
} from '../ownedEchoCheckpointAnalysis.ts';
import {
  VerifiedWuwaEchoRuntime,
  createSeededRng,
  type Echo,
  type StatName,
  type StatRoll,
} from '../echoCore.ts';

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

const UPGRADE_FORECAST_TRIALS = 2000;
type OwnedEchoMode = 'CHECKPOINT' | 'BUILD' | 'COMPARE';
type OwnedUpgradeResult = FinishedOwnedBuildCandidateResult | PartialOwnedBuildCandidateForecast;

let selectedCharacterId = characters.find((row) => row.readinessDisposition === 'DPS_READY')?.characterId
  ?? characters[0]!.characterId;
let selectedPresetId: string | undefined;
let analysisMessage = '';
let ownedEchoOpen = false;
let ownedEchoMode: OwnedEchoMode = 'CHECKPOINT';
let ownedEchoSlotIndex = 0;
let ownedEchoLevel: OwnedEchoCheckpointLevel = 5;
let ownedEchoPrimaryMainStat = '';
let ownedEchoRolls: StatRoll[] = [];
let ownedEchoResult: OwnedEchoCheckpointResult | null = null;
let ownedUpgradeResult: OwnedUpgradeResult | null = null;
let ownedBuildCardReady = false;
let ownedEchoError = '';
let ownedEchoPendingStatName: StatName = ownedRollOptions[0]!.name;
let ownedBuildEchoes: Array<Echo | null> = Array.from({ length: 5 }, () => null);
let ownedBuildAnalysis: OwnedBuildAnalysisResult | null = null;
let ownedBuildError = '';

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

function clearOwnedEchoEntry(preservePrimaryMain = false): void {
  ownedEchoRolls = [];
  ownedEchoResult = null;
  ownedUpgradeResult = null;
  ownedBuildCardReady = false;
  ownedEchoError = '';
  ownedEchoPendingStatName = ownedRollOptions[0]!.name;
  if (!preservePrimaryMain) ownedEchoPrimaryMainStat = '';
}

function resetOwnedEcho(close = false): void {
  if (close) ownedEchoOpen = false;
  ownedEchoMode = 'CHECKPOINT';
  ownedEchoSlotIndex = 0;
  ownedEchoLevel = 5;
  clearOwnedEchoEntry();
}

function openOwnedEcho(mode: OwnedEchoMode): void {
  ownedEchoOpen = true;
  ownedEchoMode = mode;
  ownedEchoSlotIndex = 0;
  ownedEchoLevel = mode === 'CHECKPOINT' ? 5 : 25;
  clearOwnedEchoEntry();
}

function resetOwnedBuild(): void {
  ownedBuildEchoes = Array.from({ length: 5 }, () => null);
  ownedBuildAnalysis = null;
  ownedBuildError = '';
}

function formatRoll(name: StatName, value: number): string {
  return name.startsWith('Flat ')
    ? Math.round(value).toLocaleString('en-US')
    : `${(value * 100).toFixed(1)}%`;
}

function formatDps(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

function formatPercent(value: number | null, digits = 2): string {
  if (value === null || !Number.isFinite(value)) return 'pending';
  const sign = value > 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(digits)}%`;
}

function ownedEchoVerdictClass(result: OwnedEchoCheckpointResult): string {
  if (result.decision === 'DISCARD') return 'alpha-owned-verdict--discard';
  if (result.decision === 'KEEP') return 'alpha-owned-verdict--keep';
  if (result.decision === 'TEMPORARY') return 'alpha-owned-verdict--temporary';
  return 'alpha-owned-verdict--roll';
}

function ownedUpgradeVerdictClass(result: OwnedUpgradeResult): string {
  if ('decision' in result) return result.decision === 'BETTER' ? 'alpha-owned-verdict--keep' : 'alpha-owned-verdict--discard';
  if (result.action === 'ROLL') return 'alpha-owned-verdict--roll';
  if (result.action === 'STOP_RECYCLE') return 'alpha-owned-verdict--discard';
  return 'alpha-owned-verdict--temporary';
}

function ownedBuildSavedCount(): number {
  return ownedBuildEchoes.filter((echo) => echo !== null).length;
}

function comparisonAvailable(selection: AlphaResolvedSelection): boolean {
  return selection.analysisReady
    && ownedBuildSavedCount() === 5
    && resolveOwnedBuildDpsBinding(selection.preset.id) !== null;
}

function ownedBuildInputAvailable(selection: AlphaResolvedSelection): boolean {
  return selection.analysisReady && resolveOwnedBuildDpsBinding(selection.preset.id) !== null;
}

function canonicalPrimaryMainStats(selection: AlphaResolvedSelection): readonly string[] {
  return selection.echoes.slots[ownedEchoSlotIndex]?.mainStats ?? [];
}

function currentPrimaryMainStat(selection: AlphaResolvedSelection): string {
  if (ownedEchoMode === 'CHECKPOINT') {
    const policyMain = selection.rollAssist.slots[ownedEchoSlotIndex]?.primaryMain;
    if (!policyMain) throw new Error(`${selection.preset.id}: checkpoint input requires a verified Roll Assist slot binding.`);
    return policyMain;
  }
  const options = canonicalPrimaryMainStats(selection);
  if (options.length === 0) throw new Error(`${selection.preset.id}: canonical Echo slot has no primary main-stat options.`);
  return options.includes(ownedEchoPrimaryMainStat) ? ownedEchoPrimaryMainStat : options[0]!;
}

function ownedBuildProgressMarkup(selection: AlphaResolvedSelection): string {
  if (!selection.analysisReady) return '';
  const binding = resolveOwnedBuildDpsBinding(selection.preset.id);
  if (!binding) {
    return `<div class="alpha-owned-build-progress alpha-owned-build-progress--pending">
      <span>OWNED BUILD DPS</span>
      <strong>Echo → DPS adapter pending for this executable profile.</strong>
      <small>Bellibing will not reuse another Character's stat assembly.</small>
    </div>`;
  }

  const saved = ownedBuildSavedCount();
  const context = binding.contextLabel ? `<small>Combat context: ${escapeHtml(binding.contextLabel)}</small>` : '';
  return `<div class="alpha-owned-build-progress ${saved === 5 ? 'alpha-owned-build-progress--ready' : ''}">
    <span>OWNED BUILD · ${escapeHtml(binding.engineModelId)}</span>
    <strong>${saved === 5 ? 'Five +25 Echoes ready.' : `${saved} / 5 +25 Echoes saved.`}</strong>
    ${context}
    <small>${saved === 5
      ? 'Analyze current DPS, or use COMPARE AN ECHO to measure one candidate against this exact build.'
      : selection.rollAssist.supported
        ? 'Use CHECK AN ECHO I OWN, choose +25, enter its five exact rolls, then save it to the build.'
        : 'Enter each owned +25 Echo directly from the canonical slot layout. Checkpoint stopping policy remains separate and pending.'}</small>
  </div>`;
}

function upgradeResultMarkup(result: OwnedUpgradeResult): string {
  if ('decision' in result) {
    return `<div class="alpha-owned-verdict ${ownedUpgradeVerdictClass(result)}" data-upgrade-decision="${result.decision}">
      <span>WHOLE-BUILD DECISION</span>
      <strong>${escapeHtml(result.headline)}</strong>
      <small>CURRENT ${formatDps(result.currentDps)} DPS · WITH THIS ECHO ${formatDps(result.candidateDps)} DPS · ${formatPercent(result.percentageDpsDelta)}</small>
      <small>ER gate: ${result.candidateErGate} · ${escapeHtml(result.reason)}</small>
    </div>`;
  }

  const cost = result.expectedRemainingCost;
  return `<div class="alpha-owned-verdict ${ownedUpgradeVerdictClass(result)}" data-upgrade-action="${result.action}">
    <span>WHOLE-BUILD FUTURE ROLL FORECAST · ${result.trials.toLocaleString('en-US')} BRANCHES</span>
    <strong>${escapeHtml(result.headline)}</strong>
    <small>Chance to beat current Echo: ${(result.probabilityBeatsIncumbent * 100).toFixed(1)}% · Mandatory gates pass: ${(result.probabilityMandatoryGatesPass * 100).toFixed(1)}%</small>
    <small>Expected successful gain: ${formatPercent(result.expectedDpsGainOnSuccessfulUpgrade)} DPS · Remaining: ${cost.tuners.toFixed(0)} Tuners · ${cost.exp.toFixed(0)} EXP · ${cost.shellCredits.toFixed(0)} Shell Credits</small>
    <small>${escapeHtml(result.reason)}</small>
  </div>`;
}

function ownedEchoMarkup(selection: AlphaResolvedSelection): string {
  const ownedBuildBinding = resolveOwnedBuildDpsBinding(selection.preset.id);
  if (!ownedEchoOpen || (!selection.rollAssist.supported && ownedBuildBinding === null)) return '';

  const expectedRolls = ownedEchoLevel / 5;
  const usedNames = new Set(ownedEchoRolls.map((roll) => roll.name));
  const available = ownedRollOptions.filter((option) => !usedNames.has(option.name));
  const selectedOption = available.find((option) => option.name === ownedEchoPendingStatName) ?? available[0] ?? null;
  const finishedUpgrade = ownedUpgradeResult && 'decision' in ownedUpgradeResult ? ownedUpgradeResult : null;
  const checkpointMode = ownedEchoMode === 'CHECKPOINT';
  const buildMode = ownedEchoMode === 'BUILD';
  const compareMode = ownedEchoMode === 'COMPARE';
  const primaryOptions = checkpointMode
    ? [selection.rollAssist.slots[ownedEchoSlotIndex]?.primaryMain].filter((value): value is string => Boolean(value))
    : [...canonicalPrimaryMainStats(selection)];
  const selectedPrimaryMain = currentPrimaryMainStat(selection);
  const canSaveCheckpoint = checkpointMode && ownedEchoResult !== null && ownedEchoLevel === 25 && ownedBuildBinding !== null;
  const canSaveBuildCard = buildMode && ownedBuildCardReady && ownedEchoLevel === 25 && ownedBuildBinding !== null;
  const canReplaceUpgrade = compareMode
    && ownedEchoLevel === 25
    && finishedUpgrade?.decision === 'BETTER';
  const canSaveToBuild = canSaveCheckpoint || canSaveBuildCard || canReplaceUpgrade;
  const alreadySaved = ownedBuildEchoes[ownedEchoSlotIndex] !== null;

  const resultMarkup = ownedUpgradeResult
    ? upgradeResultMarkup(ownedUpgradeResult)
    : ownedEchoResult
      ? `<div class="alpha-owned-verdict ${ownedEchoVerdictClass(ownedEchoResult)}" data-decision="${ownedEchoResult.decision}">
          <span>CHECKPOINT VERDICT</span>
          <strong>${escapeHtml(ownedEchoResult.headline)}</strong>
          <small>${escapeHtml(ownedEchoResult.reason)}</small>
          <small>Target hits: ${ownedEchoResult.targetHits.length > 0 ? ownedEchoResult.targetHits.map(escapeHtml).join(' · ') : 'none'} · Dead rolls: ${ownedEchoResult.deadCount}</small>
        </div>`
      : ownedBuildCardReady
        ? `<div class="alpha-owned-verdict alpha-owned-verdict--keep" data-owned-build-card="ready">
            <span>EXACT +25 CARD READY</span>
            <strong>Canonical slot + exact five rolls verified.</strong>
            <small>No Roll Assist stopping verdict was invented. Save this Echo to the owned build.</small>
          </div>`
        : ownedEchoError
          ? `<div class="alpha-owned-verdict alpha-owned-verdict--discard"><span>INPUT ERROR</span><strong>CHECK THE ECHO</strong><small>${escapeHtml(ownedEchoError)}</small></div>`
          : '';

  const hasResult = ownedEchoResult !== null || ownedUpgradeResult !== null || ownedBuildCardReady;
  const entryMarkup = hasResult
    ? `<div class="alpha-owned-finished-actions">
        ${canSaveToBuild ? `<button id="alpha-owned-save" type="button">${compareMode ? 'REPLACE CURRENT ECHO' : `${alreadySaved ? 'REPLACE' : 'SAVE'} +25 ECHO IN BUILD`}</button>` : ''}
        <button id="alpha-owned-reset" class="alpha-owned-reset" type="button">${compareMode ? 'COMPARE ANOTHER ECHO' : buildMode ? 'RE-ENTER THIS ECHO' : 'CHECK ANOTHER ECHO'}</button>
      </div>`
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

  const levelOptions = buildMode ? [25] : OWNED_ECHO_CHECKPOINT_LEVELS;
  return `<div class="alpha-owned-panel" data-owned-mode="${ownedEchoMode}">
    <div class="alpha-owned-header">
      <div><span>${compareMode ? 'ECHO COMPARISON' : buildMode ? 'OWNED BUILD INPUT' : 'OWNED ECHO'}</span><strong>${compareMode ? 'Is this Echo actually better for your build?' : buildMode ? 'Enter this +25 Echo exactly.' : 'Check the Echo you already have.'}</strong></div>
      <button id="alpha-owned-close" type="button">CLOSE</button>
    </div>
    <div class="alpha-owned-context">
      <label><span>${compareMode ? 'Which current Echo are you challenging?' : 'Which build slot?'}</span><select id="alpha-owned-slot">
        ${selection.echoes.slots.map((slot, index) => `<option value="${index}" ${index === ownedEchoSlotIndex ? 'selected' : ''}>Echo ${index + 1} · COST ${slot.cost} · ${slot.mainStats.map(escapeHtml).join(' / ')}${ownedBuildEchoes[index] ? ' · SAVED' : ''}</option>`).join('')}
      </select></label>
      <label><span>Primary main stat?</span><select id="alpha-owned-primary" ${checkpointMode ? 'disabled' : ''}>
        ${primaryOptions.map((mainStat) => `<option value="${escapeHtml(mainStat)}" ${mainStat === selectedPrimaryMain ? 'selected' : ''}>${escapeHtml(mainStat)}</option>`).join('')}
      </select></label>
      <label><span>${compareMode ? 'Candidate level?' : 'Current level?'}</span><select id="alpha-owned-level" ${buildMode ? 'disabled' : ''}>
        ${levelOptions.map((level) => `<option value="${level}" ${level === ownedEchoLevel ? 'selected' : ''}>+${level}</option>`).join('')}
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
  const binding = resolveOwnedBuildDpsBinding(selection.preset.id);
  const compareReady = comparisonAvailable(selection);
  const buildInputReady = ownedBuildInputAvailable(selection);
  const ownedEntryAvailable = selection.rollAssist.supported || buildInputReady;
  const actionMarkup = ownedEntryAvailable
    ? `<div class="alpha-roll-assist-actions">
        ${selection.rollAssist.supported && selection.rollAssist.href
          ? `<a id="alpha-roll-assist" href="${escapeHtml(selection.rollAssist.href)}">ROLL NEW ECHOES</a>`
          : '<span class="alpha-roll-assist-disabled">POLICY PENDING</span>'}
        <button id="alpha-owned-toggle" type="button">${compareReady ? 'COMPARE AN ECHO' : selection.rollAssist.supported ? 'CHECK AN ECHO I OWN' : 'ENTER MY +25 ECHOES'}</button>
      </div>`
    : '<span class="alpha-roll-assist-disabled">POLICY PENDING</span>';

  return `<div class="alpha-roll-assist ${selection.rollAssist.supported || buildInputReady ? 'alpha-roll-assist--ready' : ''}">
    <div>
      <span>${compareReady ? 'BUILD DECISION' : selection.rollAssist.supported ? 'ROLL ASSIST' : buildInputReady ? 'OWNED BUILD' : 'ROLL ASSIST'}</span>
      <strong>${compareReady
        ? 'Your current build is locked. Test one candidate.'
        : selection.rollAssist.supported
          ? 'Verified checkpoint policy available.'
          : buildInputReady
            ? 'Owned-build DPS context verified. Checkpoint policy still pending.'
            : 'Checkpoint policy pending.'}</strong>
      <small>${compareReady
        ? 'Only the selected Echo slot changes. Character, Weapon, Team, rotation, enemy context and gates stay identical.'
        : buildInputReady && binding?.contextLabel
          ? `DPS context: ${escapeHtml(binding.contextLabel)}. ${escapeHtml(selection.rollAssist.reason)}`
          : `${escapeHtml(selection.rollAssist.reason)}${selection.rollAssist.policyId ? ` Policy: ${escapeHtml(selection.rollAssist.policyId)}.` : ''}`}</small>
    </div>
    ${actionMarkup}
  </div>${ownedEchoMarkup(selection)}`;
}

function analyzeHeading(selection: AlphaResolvedSelection): string {
  if (!selection.analysisReady) return 'Source truth is loaded. DPS is not executable yet.';
  const binding = resolveOwnedBuildDpsBinding(selection.preset.id);
  if (!binding) return 'Executable rotation verified. Owned-build DPS adapter pending.';
  const saved = ownedBuildSavedCount();
  return saved === 5 ? 'Your current build is ready. Analyze it or compare one Echo.' : `Enter your five +25 Echoes (${saved}/5).`;
}

function render(): void {
  const selection = resolveAlphaSelection(selectedCharacterId, selectedPresetId);
  selectedPresetId = selection.preset.id;
  if (!selection.rollAssist.supported && !ownedBuildInputAvailable(selection) && ownedEchoOpen) resetOwnedEcho(true);
  const readinessClass = selection.analysisReady ? 'alpha-status--ready' : 'alpha-status--pending';
  const resultReady = ownedBuildAnalysis?.erGate === 'PASS';

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
            <article class="${ownedBuildEchoes[index] ? 'alpha-echo-slot--saved' : ''}">
              <span>ECHO ${index + 1} · COST ${slot.cost}${ownedBuildEchoes[index] ? ' · SAVED' : ''}</span>
              <strong>${slot.mainStats.map(escapeHtml).join(' / ')}</strong>
            </article>`).join('')}
        </div>
        ${rollAssistMarkup(selection)}
      </section>

      <section class="alpha-step alpha-analyze">
        <div>
          <div class="alpha-step-label">5 · ANALYZE</div>
          <h2>${escapeHtml(analyzeHeading(selection))}</h2>
          <p>${selection.rotation.executionStatus === 'ENGINE_MODELED'
            ? `Rotation model ${escapeHtml(selection.rotation.engineModelId ?? 'missing')} · ${selection.rotation.rotationSeconds ?? 'duration pending'}s.`
            : 'Rotation is SOURCE_SEQUENCE_ONLY. Bellibing will not invent timing, uptime or a DPS denominator.'}</p>
          ${ownedBuildProgressMarkup(selection)}
        </div>
        <button id="alpha-analyze" type="button">ANALYZE</button>
      </section>

      ${analysisMessage ? `<section class="alpha-result ${resultReady ? 'alpha-result--ready' : ''}">${escapeHtml(analysisMessage)}</section>` : ''}

      <footer>
        Registry-driven Alpha shell. Debug/oracle surfaces stay separate from the normal start flow.
      </footer>
    </main>`;

  bind();
}

function exactCandidateSeed(
  presetId: string,
  slotIndex: number,
  level: OwnedEchoCheckpointLevel,
  primaryMainStat: string,
  rolls: readonly StatRoll[],
): string {
  const rollKey = [...rolls]
    .sort((a, b) => String(a.name).localeCompare(String(b.name)))
    .map((roll) => `${roll.name}:${roll.value}`)
    .join('|');
  return `${presetId}|slot:${slotIndex}|main:${primaryMainStat}|level:${level}|${rollKey}`;
}

function analyzeEnteredEcho(selection: AlphaResolvedSelection, nextRolls: StatRoll[]): void {
  if (ownedEchoMode === 'CHECKPOINT') {
    ownedEchoResult = analyzeOwnedEchoCheckpoint({
      presetId: selection.preset.id,
      slotIndex: ownedEchoSlotIndex,
      level: ownedEchoLevel,
      substats: nextRolls,
    });
    ownedUpgradeResult = null;
    ownedBuildCardReady = false;
    return;
  }

  const primaryMainStat = currentPrimaryMainStat(selection);
  const candidate = buildOwnedBuildEchoFromCanonicalInput({
    presetId: selection.preset.id,
    slotIndex: ownedEchoSlotIndex,
    level: ownedEchoLevel,
    primaryMainStat,
    substats: nextRolls,
  });

  if (ownedEchoMode === 'BUILD') {
    if (ownedEchoLevel !== 25) throw new Error('Owned-build entry accepts complete +25 Echoes only.');
    ownedBuildCardReady = true;
    ownedEchoResult = null;
    ownedUpgradeResult = null;
    return;
  }

  if (!comparisonAvailable(selection) || ownedBuildEchoes.some((echo) => echo === null)) {
    throw new Error('Whole-build comparison requires five saved +25 Echoes and a verified owned-build DPS binding.');
  }

  if (ownedEchoLevel === 25) {
    ownedUpgradeResult = analyzeFinishedOwnedBuildCandidate({
      presetId: selection.preset.id,
      currentEchoes: ownedBuildEchoes as Echo[],
      slotIndex: ownedEchoSlotIndex,
      candidate,
    });
  } else {
    const seed = exactCandidateSeed(selection.preset.id, ownedEchoSlotIndex, ownedEchoLevel, primaryMainStat, nextRolls);
    ownedUpgradeResult = forecastPartialOwnedBuildCandidate({
      presetId: selection.preset.id,
      currentEchoes: ownedBuildEchoes as Echo[],
      slotIndex: ownedEchoSlotIndex,
      candidate,
      trials: UPGRADE_FORECAST_TRIALS,
      runtime: new VerifiedWuwaEchoRuntime(),
      continueRng: createSeededRng(`${seed}|continue-v1`),
      restartRng: createSeededRng(`${seed}|restart-v1`),
    });
  }
  ownedEchoResult = null;
  ownedBuildCardReady = false;
}

function bind(): void {
  document.querySelector<HTMLSelectElement>('#alpha-character')?.addEventListener('change', (event) => {
    selectedCharacterId = (event.currentTarget as HTMLSelectElement).value;
    selectedPresetId = undefined;
    analysisMessage = '';
    resetOwnedEcho(true);
    resetOwnedBuild();
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedPresetId = button.dataset.preset;
      analysisMessage = '';
      resetOwnedEcho(true);
      resetOwnedBuild();
      render();
    });
  });

  document.querySelector<HTMLButtonElement>('#alpha-owned-toggle')?.addEventListener('click', () => {
    const selection = resolveAlphaSelection(selectedCharacterId, selectedPresetId);
    if (ownedEchoOpen) resetOwnedEcho(true);
    else openOwnedEcho(
      comparisonAvailable(selection)
        ? 'COMPARE'
        : selection.rollAssist.supported
          ? 'CHECKPOINT'
          : 'BUILD',
    );
    render();
  });
  document.querySelector<HTMLButtonElement>('#alpha-owned-close')?.addEventListener('click', () => {
    resetOwnedEcho(true);
    render();
  });
  document.querySelector<HTMLSelectElement>('#alpha-owned-slot')?.addEventListener('change', (event) => {
    ownedEchoSlotIndex = Number((event.currentTarget as HTMLSelectElement).value);
    clearOwnedEchoEntry();
    render();
  });
  document.querySelector<HTMLSelectElement>('#alpha-owned-primary')?.addEventListener('change', (event) => {
    ownedEchoPrimaryMainStat = (event.currentTarget as HTMLSelectElement).value;
    clearOwnedEchoEntry(true);
    render();
  });
  document.querySelector<HTMLSelectElement>('#alpha-owned-level')?.addEventListener('change', (event) => {
    ownedEchoLevel = Number((event.currentTarget as HTMLSelectElement).value) as OwnedEchoCheckpointLevel;
    clearOwnedEchoEntry(true);
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
    if (nextRolls.length === expectedRolls) {
      try {
        const selection = resolveAlphaSelection(selectedCharacterId, selectedPresetId);
        analyzeEnteredEcho(selection, nextRolls);
      } catch (error) {
        ownedEchoResult = null;
        ownedUpgradeResult = null;
        ownedBuildCardReady = false;
        ownedEchoError = error instanceof Error ? error.message : 'Unknown owned Echo analysis error.';
      }
    }
    render();
  });
  document.querySelector<HTMLButtonElement>('#alpha-owned-save')?.addEventListener('click', () => {
    if (!selectedPresetId || ownedEchoLevel !== 25 || ownedEchoRolls.length !== 5) return;
    try {
      const selection = resolveAlphaSelection(selectedCharacterId, selectedPresetId);
      const echo = ownedEchoMode === 'CHECKPOINT'
        ? buildOwnedEchoFromCheckpointInput({
          presetId: selectedPresetId,
          slotIndex: ownedEchoSlotIndex,
          level: 25,
          substats: ownedEchoRolls,
        })
        : buildOwnedBuildEchoFromCanonicalInput({
          presetId: selectedPresetId,
          slotIndex: ownedEchoSlotIndex,
          level: 25,
          primaryMainStat: currentPrimaryMainStat(selection),
          substats: ownedEchoRolls,
        });
      ownedBuildEchoes[ownedEchoSlotIndex] = echo;
      ownedBuildAnalysis = null;
      ownedBuildError = '';
      analysisMessage = ownedEchoMode === 'COMPARE'
        ? `CURRENT BUILD UPDATED: Echo ${ownedEchoSlotIndex + 1} replaced with the verified better candidate.`
        : '';

      if (ownedEchoMode === 'COMPARE') {
        resetOwnedEcho(true);
      } else {
        const nextMissing = ownedBuildEchoes.findIndex((row) => row === null);
        if (nextMissing >= 0) {
          ownedEchoSlotIndex = nextMissing;
          ownedEchoLevel = ownedEchoMode === 'BUILD' ? 25 : 25;
          clearOwnedEchoEntry();
        } else {
          resetOwnedEcho(true);
        }
      }
    } catch (error) {
      ownedBuildError = error instanceof Error ? error.message : 'Unknown owned-build save error.';
    }
    render();
  });
  document.querySelector<HTMLButtonElement>('#alpha-owned-reset')?.addEventListener('click', () => {
    clearOwnedEchoEntry(true);
    render();
  });

  document.querySelector<HTMLButtonElement>('#alpha-analyze')?.addEventListener('click', () => {
    const selection = resolveAlphaSelection(selectedCharacterId, selectedPresetId);
    ownedBuildAnalysis = null;
    ownedBuildError = '';

    if (!selection.analysisReady) {
      analysisMessage = `BLOCKED: ${statusLabel(selection.character.readinessDisposition)}. The recommended build remains usable as source-backed guidance, but DPS analysis stays fail-closed.`;
      render();
      return;
    }

    const binding = resolveOwnedBuildDpsBinding(selection.preset.id);
    if (!binding) {
      analysisMessage = `BLOCKED: ${selection.character.name} has an executable rotation, but Bellibing does not yet have a verified owned-Echo stat assembly adapter for ${selection.preset.label}.`;
      render();
      return;
    }

    if (ownedBuildSavedCount() !== 5 || ownedBuildEchoes.some((echo) => echo === null)) {
      analysisMessage = `NEED OWNED BUILD: ${ownedBuildSavedCount()} / 5 +25 Echoes entered. Bellibing will not calculate whole-build DPS from a partial or phantom loadout.`;
      render();
      return;
    }

    try {
      ownedBuildAnalysis = analyzeOwnedBuild({
        presetId: selection.preset.id,
        echoes: ownedBuildEchoes as Echo[],
      });
      const dps = formatDps(ownedBuildAnalysis.personalRotationDps);
      const er = `${(ownedBuildAnalysis.energyRegen * 100).toFixed(1)}%`;
      const context = ownedBuildAnalysis.contextLabel ? ` · ${ownedBuildAnalysis.contextLabel}` : '';
      analysisMessage = ownedBuildAnalysis.erGate === 'PASS'
        ? `${ownedBuildAnalysis.headline}: ${dps} · ER ${er} PASS · ${ownedBuildAnalysis.engineModelId}${context}.`
        : `${ownedBuildAnalysis.headline}: ER ${er}. Raw modeled DPS is ${dps}, but the locked rotation is invalid until the ER gate passes. ${ownedBuildAnalysis.engineModelId}${context}.`;
    } catch (error) {
      ownedBuildAnalysis = null;
      ownedBuildError = error instanceof Error ? error.message : 'Unknown owned-build analysis error.';
      analysisMessage = `ANALYSIS ERROR: ${ownedBuildError}`;
    }
    render();
  });
}

render();