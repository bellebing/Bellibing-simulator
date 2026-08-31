import {
  SUBSTAT_TYPES,
  SUBSTAT_VALUE_TABLE,
  createRank5EchoAtLevel0,
  type Echo,
  type EchoLevel,
  type PrimaryMainStatName,
  type StatName,
  type StatRoll,
} from '../echoCore.ts';
import { evaluateRollAssistantCheckpoint } from '../rollAssistantCheckpoint.ts';
import {
  createRollAssistantSession,
  getNextInstruction,
  startCandidate,
  type RollAssistantInstruction,
  type RollAssistantSession,
} from '../rollAssistantSession.ts';
import {
  getDefaultRollAssistProfileBinding,
  resolveRollAssistProfileBinding,
  type RollAssistProfileBinding,
} from '../rollAssistProfileRegistry.ts';

function requireAppRoot(): HTMLDivElement {
  const root = document.querySelector<HTMLDivElement>('#app');
  if (!root) throw new Error('Missing #app root.');
  return root;
}

function resolveRouteBinding(): { readonly binding: RollAssistProfileBinding; readonly error: string | null } {
  const fallback = getDefaultRollAssistProfileBinding();
  const params = new URLSearchParams(window.location.search);
  const requestedPresetId = params.get('preset');
  const requestedCharacterId = params.get('character');

  if (!requestedPresetId && !requestedCharacterId) return { binding: fallback, error: null };
  if (!requestedPresetId) {
    return { binding: fallback, error: 'Profile-aware Roll Assist requires a canonical preset id.' };
  }

  const binding = resolveRollAssistProfileBinding(requestedPresetId);
  if (!binding) {
    return {
      binding: fallback,
      error: `No verified Roll Assist checkpoint policy is bound to canonical preset ${requestedPresetId}.`,
    };
  }
  if (requestedCharacterId && requestedCharacterId !== binding.characterId) {
    return {
      binding: fallback,
      error: `Roll Assist route mismatch: ${requestedCharacterId} does not own preset ${requestedPresetId}.`,
    };
  }
  return { binding, error: null };
}

const app = requireAppRoot();
const route = resolveRouteBinding();
const binding = route.binding;
const profile = binding.policy;
let session: RollAssistantSession = createRollAssistantSession('RECOMMENDED');
let candidateSerial = 0;
let lastReason = '';
let errorMessage = '';
let verdict: RollAssistantInstruction | null = null;
let whyOpen = false;
let working = false;

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatRoll(name: StatName, value: number): string {
  return name.startsWith('Flat ')
    ? Math.round(value).toLocaleString('en-US')
    : `${(value * 100).toFixed(1)}%`;
}

function activeSlotIndex(): number | null {
  return session.activeSlotIndex;
}

function activeEcho(): Echo | null {
  const index = activeSlotIndex();
  if (index === null) return null;
  return session.slots[index]?.echo ?? null;
}

function nextEmptySlotIndex(): number | null {
  const slot = session.slots.find((item) => item.status === 'EMPTY');
  return slot?.index ?? null;
}

function createCandidateForSlot(slotIndex: number): Echo {
  const slot = profile.slots[slotIndex];
  if (!slot) throw new Error(`Missing Recommended Echo slot ${slotIndex + 1}.`);
  candidateSerial += 1;
  return createRank5EchoAtLevel0({
    id: `${binding.characterId}-assist-${slotIndex + 1}-${candidateSerial}`,
    cost: slot.cost,
    primaryMainStat: slot.primaryMain as PrimaryMainStatName,
  });
}

function beginSlot(slotIndex: number): void {
  session = startCandidate(session, slotIndex, createCandidateForSlot(slotIndex));
  verdict = null;
  lastReason = '';
  errorMessage = '';
  whyOpen = false;
}

function ensureActiveCandidate(): void {
  if (session.phase !== 'BUILD' || session.activeSlotIndex !== null || verdict) return;
  const slotIndex = nextEmptySlotIndex();
  if (slotIndex !== null) beginSlot(slotIndex);
}

function slotProgressMarkup(): string {
  return session.slots.map((slot) => {
    const active = slot.index === session.activeSlotIndex;
    const label = active
      ? `+${slot.echo?.level ?? 0}`
      : slot.status === 'TEMPORARY'
        ? 'TEMP'
        : slot.status === 'KEPT'
          ? 'KEEP'
          : '—';
    const klass = active
      ? 'assist-slot assist-slot--active'
      : slot.status === 'TEMPORARY'
        ? 'assist-slot assist-slot--temp'
        : slot.status === 'KEPT'
          ? 'assist-slot assist-slot--keep'
          : 'assist-slot';
    return `<div class="${klass}"><span>${slot.index + 1}</span><strong>${label}</strong></div>`;
  }).join('');
}

function currentSlotMarkup(): string {
  const index = activeSlotIndex();
  if (index === null) return '';
  const spec = profile.slots[index]!;
  return `<div class="assist-context"><span>ECHO ${index + 1}/5</span><strong>COST ${spec.cost} · ${escapeHtml(spec.primaryMain)}</strong></div>`;
}

function rolledStatsMarkup(echo: Echo): string {
  if (echo.substats.length === 0) return '<span class="assist-empty">No rolls yet</span>';
  return echo.substats.map((stat) => `
    <div class="assist-roll-chip">
      <span>${escapeHtml(stat.name)}</span>
      <strong>${formatRoll(stat.name, stat.value)}</strong>
    </div>`).join('');
}

function availableStatOptions(echo: Echo): StatName[] {
  const used = new Set(echo.substats.map((stat) => stat.name));
  return SUBSTAT_TYPES.filter((name) => !used.has(name));
}

function rollValueOptions(name: StatName): string {
  const values = SUBSTAT_VALUE_TABLE[name];
  if (!values) return '';
  return values.map((value) => `<option value="${value}">${formatRoll(name, value)}</option>`).join('');
}

function inputMarkup(echo: Echo, instruction: Extract<RollAssistantInstruction, { action: 'ROLL' }>): string {
  const options = availableStatOptions(echo);
  const first = options[0]!;
  return `
    <div class="assist-entry">
      <div class="assist-entry-label">WHAT DID YOU GET?</div>
      <div class="assist-entry-row">
        <select id="assist-stat" aria-label="Rolled substat">
          ${options.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('')}
        </select>
        <select id="assist-value" aria-label="Rolled value">
          ${rollValueOptions(first)}
        </select>
        <button id="assist-enter" type="button" ${working ? 'disabled' : ''}>${working ? 'CHECKING…' : 'ENTER'}</button>
      </div>
      <div class="assist-hint">Enter the new +${instruction.toLevel} roll from the game.</div>
    </div>`;
}

function whyMarkup(): string {
  if (!lastReason) return '';
  return `
    <button type="button" class="why-button" id="why-button">${whyOpen ? 'HIDE' : 'WHY?'}</button>
    ${whyOpen ? `<div class="why-copy">${escapeHtml(lastReason)}</div>` : ''}`;
}

function verdictClass(action: RollAssistantInstruction['action']): string {
  if (action === 'DISCARD') return 'assist-verdict--discard';
  if (action === 'KEEP') return 'assist-verdict--keep';
  if (action === 'TEMPORARY') return 'assist-verdict--temp';
  return '';
}

function verdictMarkup(instruction: RollAssistantInstruction): string {
  if (instruction.action === 'DISCARD') {
    return `
      <div class="assist-verdict ${verdictClass(instruction.action)}">
        <div class="assist-command">DISCARD</div>
        ${whyMarkup()}
        <button id="assist-restart" class="assist-next" type="button">NEW ECHO</button>
      </div>`;
  }
  if (instruction.action === 'TEMPORARY' || instruction.action === 'KEEP') {
    return `
      <div class="assist-verdict ${verdictClass(instruction.action)}">
        <div class="assist-command">${instruction.headline}</div>
        ${whyMarkup()}
        <button id="assist-next-slot" class="assist-next" type="button">NEXT</button>
      </div>`;
  }
  return '';
}

function errorMarkup(): string {
  return `
    <div class="assist-verdict assist-verdict--temp">
      ${currentSlotMarkup()}
      <div class="assist-kicker">INTEGRATION ERROR</div>
      <div class="assist-command">ROLL ASSIST ERROR</div>
      <div class="why-copy">${escapeHtml(errorMessage)}</div>
      <button id="assist-error-retry" class="assist-next" type="button">TRY AGAIN</button>
    </div>`;
}

function instructionMarkup(): string {
  if (errorMessage) return errorMarkup();
  if (verdict) return verdictMarkup(verdict);

  if (session.phase === 'UPGRADE') {
    return `
      <div class="assist-verdict assist-verdict--ready">
        <div class="assist-kicker">FIVE USABLE ECHOES</div>
        <div class="assist-command">BUILD READY</div>
        <div class="assist-subcopy">Upgrade targeting is the next engine layer.</div>
      </div>`;
  }

  const echo = activeEcho();
  if (!echo) return '';
  const instruction = getNextInstruction(session);
  if (instruction.action !== 'ROLL') return '';

  return `
    <div class="assist-verdict">
      ${currentSlotMarkup()}
      <div class="assist-command">${instruction.headline}</div>
      ${lastReason ? whyMarkup() : ''}
      <div class="assist-current-rolls">${rolledStatsMarkup(echo)}</div>
      ${inputMarkup(echo, instruction)}
    </div>`;
}

function targetPeekMarkup(): string {
  const core = profile.targets
    .filter((target) => target.role === 'CORE')
    .map((target) => `${target.name} ${formatRoll(target.name, target.minimum)}`);
  const useful = profile.targets
    .filter((target) => target.role === 'USEFUL')
    .map((target) => target.name);
  return `
    <details class="assist-target">
      <summary>Recommended target</summary>
      <div class="assist-target-body">
        <strong>${profile.requiredCoreHits} Core + any ${profile.requiredUsefulHits} Useful</strong>
        <span>Core: ${core.map(escapeHtml).join(' · ') || 'None'}</span>
        <span>Useful: ${useful.map(escapeHtml).join(' · ') || 'None'}</span>
      </div>
    </details>`;
}

function unsupportedRouteMarkup(): string {
  return `
    <main class="assist-shell">
      <header class="assist-header">
        <a class="assist-back" href="./">← Alpha</a>
        <div class="assist-brand">BELLIBING</div>
        <div class="assist-live"><i></i> FAIL CLOSED</div>
      </header>
      <section class="assist-title">
        <div class="assist-eyebrow">ROLL ASSIST</div>
        <h1>Policy unavailable</h1>
        <div class="assist-mode">CANONICAL PROFILE REQUIRED</div>
      </section>
      <section class="assist-stage">
        <div class="assist-verdict assist-verdict--temp">
          <div class="assist-command">ROLL ASSIST BLOCKED</div>
          <div class="why-copy">${escapeHtml(route.error ?? 'Unsupported Roll Assist route.')}</div>
          <a class="assist-next" href="./">BACK TO ALPHA</a>
        </div>
      </section>
      <footer class="assist-footer">No fallback policy was applied to the requested profile.</footer>
    </main>`;
}

function pageMarkup(): string {
  return `
    <main class="assist-shell">
      <header class="assist-header">
        <a class="assist-back" href="./">← Alpha</a>
        <div class="assist-brand">BELLIBING</div>
        <div class="assist-live"><i></i> LIVE</div>
      </header>

      <section class="assist-title">
        <div class="assist-eyebrow">ROLL ASSIST</div>
        <h1>${escapeHtml(binding.characterName)}</h1>
        <div class="assist-mode">${escapeHtml(profile.targetMode)}</div>
      </section>

      <section class="assist-progress">${slotProgressMarkup()}</section>

      <section class="assist-stage ${working ? 'assist-stage--working' : ''}">
        ${working ? '<div class="assist-working">CHECKING ECHO…</div>' : instructionMarkup()}
      </section>

      ${targetPeekMarkup()}

      <footer class="assist-footer">${escapeHtml(profile.id)} · canonical ${escapeHtml(binding.presetId)} · exact roll values</footer>
    </main>`;
}

function render(): void {
  if (!route.error) ensureActiveCandidate();
  app.innerHTML = route.error ? unsupportedRouteMarkup() : pageMarkup();
  bind();
}

function selectedStatName(): StatName | null {
  return document.querySelector<HTMLSelectElement>('#assist-stat')?.value ?? null;
}

function updateValueSelect(): void {
  const name = selectedStatName();
  const select = document.querySelector<HTMLSelectElement>('#assist-value');
  if (!name || !select) return;
  select.innerHTML = rollValueOptions(name);
}

function enterRoll(): void {
  const echo = activeEcho();
  if (!echo || route.error) return;
  const instruction = getNextInstruction(session);
  if (instruction.action !== 'ROLL') return;
  const name = selectedStatName();
  const rawValue = document.querySelector<HTMLSelectElement>('#assist-value')?.value;
  const value = Number(rawValue);
  if (!name || !Number.isFinite(value)) return;

  const roll: StatRoll = { name, value };
  const checkpointEcho: Echo = {
    ...echo,
    level: instruction.toLevel,
    substats: [...echo.substats, roll],
  };

  working = true;
  errorMessage = '';
  render();

  window.setTimeout(() => {
    try {
      const result = evaluateRollAssistantCheckpoint(session, profile, checkpointEcho);
      session = result.session;
      lastReason = result.evaluation.assessment.reason ?? '';
      verdict = result.instruction.action === 'ROLL' ? null : result.instruction;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unknown Roll Assist integration error.';
      verdict = null;
    } finally {
      working = false;
      whyOpen = false;
      render();
    }
  }, 420);
}

function restartCurrentSlot(): void {
  verdict = null;
  lastReason = '';
  errorMessage = '';
  whyOpen = false;
  const slotIndex = nextEmptySlotIndex();
  if (slotIndex !== null) beginSlot(slotIndex);
  render();
}

function advanceAfterUsable(): void {
  verdict = null;
  lastReason = '';
  errorMessage = '';
  whyOpen = false;
  ensureActiveCandidate();
  render();
}

function retryAfterError(): void {
  errorMessage = '';
  lastReason = '';
  whyOpen = false;
  render();
}

function bind(): void {
  document.querySelector<HTMLSelectElement>('#assist-stat')?.addEventListener('change', updateValueSelect);
  document.querySelector<HTMLButtonElement>('#assist-enter')?.addEventListener('click', enterRoll);
  document.querySelector<HTMLButtonElement>('#assist-restart')?.addEventListener('click', restartCurrentSlot);
  document.querySelector<HTMLButtonElement>('#assist-next-slot')?.addEventListener('click', advanceAfterUsable);
  document.querySelector<HTMLButtonElement>('#assist-error-retry')?.addEventListener('click', retryAfterError);
  document.querySelector<HTMLButtonElement>('#why-button')?.addEventListener('click', () => {
    whyOpen = !whyOpen;
    render();
  });
}

render();
