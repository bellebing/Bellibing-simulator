import {
  EchoLab,
  RANK5_PRIMARY_MAIN_STATS,
  VerifiedWuwaEchoRuntime,
  createRank5EchoAtLevel0,
  createSeededRng,
  type Echo,
  type EchoCost,
  type EchoLevel,
  type PrimaryMainStatName,
  type RandomSource,
  type ResourceCost,
  type StatRoll,
} from '../echoCore.ts';
import { validateEchoLoadout } from '../loadoutValidator.ts';
import {
  AUGUSTA_LIVE_CURRENT_BUILD_2026_08_21,
  augustaStandardEchoDamageEvaluator,
} from '../characters/augustaEchoEvaluator.ts';
import { analyzeOwnedEchoValue } from '../ownedEchoValue.ts';

function requireAppRoot(): HTMLDivElement {
  const root = document.querySelector<HTMLDivElement>('#app');
  if (!root) throw new Error('Missing #app root.');
  return root;
}

const app = requireAppRoot();

type AppView = 'ECHO_LAB' | 'AUGUSTA';

const augustaBuild = AUGUSTA_LIVE_CURRENT_BUILD_2026_08_21;
const augustaBaseline = augustaStandardEchoDamageEvaluator.evaluate(augustaBuild);
let selectedAugustaSlot = 2;
let currentView: AppView = 'ECHO_LAB';

const conventionalHeadlineStats = new Set([
  'CRIT Rate',
  'CRIT DMG',
  'ATK%',
  'Energy Regen',
]);

const echoRuntime = new VerifiedWuwaEchoRuntime();
const echoLab = new EchoLab(echoRuntime);
let labSession = echoLab.createSession();
let labSeed = 'bellibing-test-001';
let labRng: RandomSource = createSeededRng(labSeed);
let labCost: EchoCost = 3;
let labPrimaryMain: PrimaryMainStatName = 'Electro DMG';
let labBatchCount = 5;
let selectedLabEchoes = new Set<number>();
let recoveredResources: ResourceCost = {
  echoes: 0,
  tuners: 0,
  exp: 0,
  shellCredits: 0,
};
let labStatus = 'Create a batch, then roll it through the real Echo Core checkpoints.';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

function formatStat(stat: StatRoll, percentDigits = 1): string {
  const flat = stat.name.startsWith('Flat ');
  return `${stat.name} ${flat ? Math.round(stat.value).toLocaleString('en-US') : formatPercent(stat.value, percentDigits)}`;
}

function addResources(a: ResourceCost, b: ResourceCost): ResourceCost {
  return {
    echoes: a.echoes + b.echoes,
    tuners: a.tuners + b.tuners,
    exp: a.exp + b.exp,
    shellCredits: (a.shellCredits ?? 0) + (b.shellCredits ?? 0),
  };
}

function resourceMarkup(label: string, value: ResourceCost): string {
  return `
    <article class="resource-card">
      <div class="panel-label">${label}</div>
      <div class="resource-grid">
        <div><span>Eligible Echoes</span><strong>${value.echoes.toLocaleString('en-US')}</strong></div>
        <div><span>Tuners</span><strong>${Math.round(value.tuners).toLocaleString('en-US')}</strong></div>
        <div><span>EXP</span><strong>${Math.round(value.exp).toLocaleString('en-US')}</strong></div>
        <div><span>Shell Credits</span><strong>${Math.round(value.shellCredits ?? 0).toLocaleString('en-US')}</strong></div>
      </div>
    </article>`;
}

function commonHeaderMarkup(): string {
  return `
    <header class="topbar topbar--app">
      <div>
        <div class="eyebrow">BELLIBING / BUILD SIMULATOR</div>
        <h1>${currentView === 'ECHO_LAB' ? 'Roll it yourself.' : 'Measure the build.'}<br><span>${currentView === 'ECHO_LAB' ? 'See what the engine actually does.' : 'Know what the Echo is worth.'}</span></h1>
      </div>
      <div class="header-tools">
        <div class="engine-pill"><span></span> LIVE ENGINE</div>
        <nav class="view-tabs" aria-label="App view">
          <button type="button" data-view="ECHO_LAB" class="${currentView === 'ECHO_LAB' ? 'active' : ''}">ECHO LAB</button>
          <button type="button" data-view="AUGUSTA" class="${currentView === 'AUGUSTA' ? 'active' : ''}">AUGUSTA TEST</button>
        </nav>
      </div>
    </header>`;
}

function mainStatOptionsMarkup(): string {
  return RANK5_PRIMARY_MAIN_STATS[labCost]
    .map((profile) => `
      <option value="${escapeHtml(profile.name)}" ${profile.name === labPrimaryMain ? 'selected' : ''}>
        ${escapeHtml(profile.name)}
      </option>`)
    .join('');
}

function labEchoMarkup(echo: Echo, index: number): string {
  const selected = selectedLabEchoes.has(index);
  const secondary = echo.secondaryMainStat
    ? `<div class="lab-main-secondary">${formatStat(echo.secondaryMainStat)}</div>`
    : '';
  const subs = echo.substats.length > 0
    ? echo.substats.map((stat, subIndex) => `<li><span>${subIndex + 1}</span><strong>${formatStat(stat)}</strong></li>`).join('')
    : '<li class="empty-roll"><span>—</span><strong>No tuned substats yet</strong></li>';

  return `
    <button type="button" class="lab-echo-card ${selected ? 'lab-echo-card--selected' : ''}" data-lab-index="${index}" aria-pressed="${selected}">
      <div class="echo-card__topline">
        <span class="cost-chip">COST ${echo.cost}</span>
        <span class="level-chip">+${echo.level}</span>
      </div>
      <div class="lab-main-label">PRIMARY MAIN · ENGINE VALUE</div>
      <div class="echo-card__main">${formatStat(echo.mainStat, 2)}</div>
      ${secondary}
      <ol class="lab-substats">${subs}</ol>
      <div class="selection-state">${selected ? 'SELECTED' : 'CLICK TO SELECT'}</div>
    </button>`;
}

function echoLabMarkup(): string {
  const loadout = validateEchoLoadout(labSession.echoes);
  const hasEchoes = labSession.echoes.length > 0;
  const hasSelection = selectedLabEchoes.size > 0;
  const selectionText = hasEchoes
    ? `${selectedLabEchoes.size} / ${labSession.echoes.length} selected`
    : 'No Echoes generated';
  const validationClass = loadout.valid ? 'validation--pass' : 'validation--warn';

  return `
    <main class="shell">
      ${commonHeaderMarkup()}

      <section class="lab-control-panel panel">
        <div class="section-head section-head--lab">
          <div>
            <div class="panel-label">STEP 1 · GENERATE TEST ECHOES</div>
            <h2>Make a batch</h2>
          </div>
          <span class="quiet">Every generated Echo is already an eligible Rank-5 candidate with the chosen main stat.</span>
        </div>

        <div class="lab-form-grid">
          <label>
            <span>COST</span>
            <select id="lab-cost">
              <option value="1" ${labCost === 1 ? 'selected' : ''}>1-cost</option>
              <option value="3" ${labCost === 3 ? 'selected' : ''}>3-cost</option>
              <option value="4" ${labCost === 4 ? 'selected' : ''}>4-cost</option>
            </select>
          </label>
          <label>
            <span>Primary main</span>
            <select id="lab-main-stat">${mainStatOptionsMarkup()}</select>
          </label>
          <label>
            <span>Batch size</span>
            <input id="lab-count" type="number" min="1" max="30" step="1" value="${labBatchCount}" />
          </label>
          <label class="seed-field">
            <span>Simulation seed</span>
            <input id="lab-seed" type="text" maxlength="80" value="${escapeHtml(labSeed)}" />
          </label>
          <button id="new-batch" class="primary-action" type="button">GENERATE NEW BATCH</button>
        </div>

        <div class="scope-note">
          <strong>What this test covers now:</strong> exact Rank-5 main-stat checkpoint scaling, real substat type RNG, source-backed roll tiers, no duplicate substat type, checkpoint EXP/Tuners/Shell Credits and discard refunds.
          <span>Fresh desired-main acquisition chance is deliberately not modeled yet.</span>
        </div>
      </section>

      <section class="lab-status-strip">
        <div>
          <span class="panel-label">ENGINE STATUS</span>
          <strong id="lab-status">${escapeHtml(labStatus)}</strong>
        </div>
        <div class="lab-selection-count">${selectionText}</div>
      </section>

      <section class="lab-roll-panel panel">
        <div class="section-head section-head--lab">
          <div>
            <div class="panel-label">STEP 2 · ROLL THE SELECTED ECHOES</div>
            <h2>Push them through checkpoints</h2>
          </div>
          <div class="selection-actions">
            <button type="button" id="select-all" ${!hasEchoes ? 'disabled' : ''}>SELECT ALL</button>
            <button type="button" id="clear-selection" ${!hasSelection ? 'disabled' : ''}>CLEAR</button>
          </div>
        </div>

        <div class="checkpoint-actions" aria-label="Echo level checkpoints">
          ${([5, 10, 15, 20, 25] as EchoLevel[]).map((level) => `
            <button type="button" data-roll-level="${level}" ${!hasSelection ? 'disabled' : ''}>
              <span>ROLL SELECTED TO</span><strong>+${level}</strong>
            </button>`).join('')}
        </div>

        <div class="danger-actions">
          <button type="button" id="discard-selected" ${!hasSelection ? 'disabled' : ''}>DISCARD SELECTED + RECOVER MATERIALS</button>
          <button type="button" id="reset-lab" ${!hasEchoes ? 'disabled' : ''}>RESET LAB</button>
        </div>
      </section>

      <section class="resource-summary">
        ${resourceMarkup('TOTAL SPENT THIS SESSION', labSession.spent)}
        ${resourceMarkup('RECOVERED FROM DISCARDS', recoveredResources)}
        <article class="resource-card validation-card ${validationClass}">
          <div class="panel-label">LOADOUT VALIDATOR</div>
          <strong>${loadout.valid ? 'VALID EQUIP SHAPE' : loadout.status.replaceAll('_', ' ')}</strong>
          <span>${loadout.echoCount} Echoes · COST ${loadout.totalCost} / ${loadout.rules.maxCost}</span>
          <small>The Lab itself intentionally allows invalid experiments.</small>
        </article>
      </section>

      <section class="lab-echo-section">
        <div class="section-head">
          <div>
            <div class="panel-label">LIVE ECHO STATE</div>
            <h2>${hasEchoes ? 'Click cards to choose what gets rolled' : 'Generate a batch above'}</h2>
          </div>
          <span class="quiet">Same seed + same actions = same rolls.</span>
        </div>
        <div class="lab-echo-grid">
          ${hasEchoes ? labSession.echoes.map(labEchoMarkup).join('') : '<div class="empty-lab panel">No Echoes yet. Generate a batch to start testing.</div>'}
        </div>
      </section>

      <section class="pending-note panel">
        <div class="panel-label">VERIFIED MAIN-STAT RULE</div>
        <strong>Primary and secondary main stats scale at every modeled checkpoint.</strong>
        <p>Echo Core applies the source-backed Rank-5 GrowthValue curve at +0/+5/+10/+15/+20/+25. Fresh desired-main acquisition chance remains deliberately separate and pending.</p>
      </section>
    </main>`;
}

function augustaEchoMarkup(echo: Echo, index: number): string {
  const active = index === selectedAugustaSlot ? ' echo-card--active' : '';
  return `
    <button class="echo-card${active}" data-slot="${index}" type="button">
      <div class="echo-card__topline">
        <span class="cost-chip">COST ${echo.cost}</span>
        <span class="level-chip">+${echo.level}</span>
      </div>
      <div class="echo-card__main">${formatStat(echo.mainStat)}</div>
      <div class="echo-card__subs">
        ${echo.substats.map((stat) => `<span>${formatStat(stat)}</span>`).join('')}
      </div>
    </button>`;
}

function selectedAugustaPanelMarkup(): string {
  const echo = augustaBuild.echoes[selectedAugustaSlot]!;
  return `
    <div class="panel-label">ECHO ${selectedAugustaSlot + 1} · COST ${echo.cost}</div>
    <h2>${formatStat(echo.mainStat)}</h2>
    <p class="analysis-intro">Measure what each roll actually does to the complete rotation. No stat-weight score.</p>
    <div class="selected-subs">
      ${echo.substats.map((stat) => `<div><span>${stat.name}</span><strong>${stat.name.startsWith('Flat ') ? Math.round(stat.value) : formatPercent(stat.value)}</strong></div>`).join('')}
    </div>
    <button class="analyze-button" id="analyze-button" type="button">
      <span class="analyze-button__icon">◈</span>
      ANALYZE ECHO
    </button>
    <div id="machine-zone"></div>`;
}

function augustaMarkup(): string {
  return `
    <main class="shell">
      ${commonHeaderMarkup()}

      <section class="context-grid">
        <article class="panel context-card">
          <div class="panel-label">VERIFIED CONTEXT</div>
          <div class="context-line"><strong>Augusta</strong><span>S0</span></div>
          <div class="context-sub">Thunderflare Dominion R1</div>
          <div class="context-sub">Iuno + Shorekeeper · Standard Rotation</div>
        </article>
        <article class="panel metric-card">
          <div class="panel-label">PERSONAL ROTATION DPS</div>
          <div class="metric">${Math.round(augustaBaseline.personalRotationDps).toLocaleString('en-US')}</div>
          <div class="metric-sub">Exact V9.15 parity</div>
        </article>
        <article class="panel metric-card">
          <div class="panel-label">ENERGY GATE</div>
          <div class="metric metric--small">${formatPercent(augustaBaseline.energyRegen)}</div>
          <div class="gate gate--pass">PASS · floor 116%</div>
        </article>
      </section>

      <section class="workspace">
        <div class="echo-column">
          <div class="section-head">
            <div>
              <div class="panel-label">CURRENT BUILD</div>
              <h2>Pick an Echo</h2>
            </div>
            <span class="quiet">Live Augusta fixture · 2026-08-21</span>
          </div>
          <div class="echo-grid" id="echo-grid">
            ${augustaBuild.echoes.map(augustaEchoMarkup).join('')}
          </div>
        </div>

        <aside class="analysis-panel panel" id="analysis-panel">
          ${selectedAugustaPanelMarkup()}
        </aside>
      </section>

      <section class="next-panel panel">
        <div>
          <div class="panel-label">CONNECTED ENGINE</div>
          <h2>Owned Echo value test</h2>
          <p>This view is the existing Augusta parity fixture. Echo Lab is now the place to manually roll new candidates.</p>
        </div>
        <div class="status-chip">LIVE</div>
      </section>
    </main>`;
}

function machineMarkup(stage: number): string {
  const stages = ['ROTATION', 'STAT IMPACT', 'ER GATES', 'VERDICT'];
  return `
    <div class="machine">
      <div class="machine-spinner"><i></i><i></i><i></i></div>
      <div class="machine-copy">
        <strong>ANALYZING</strong>
        <span>${stages[Math.min(stage, stages.length - 1)]}</span>
      </div>
      <div class="machine-track">
        ${stages.map((label, i) => `<span class="${i <= stage ? 'done' : ''}">${label}</span>`).join('')}
      </div>
    </div>`;
}

function augustaResultMarkup(): string {
  const result = analyzeOwnedEchoValue(
    augustaBuild,
    selectedAugustaSlot,
    augustaStandardEchoDamageEvaluator,
  );
  const sorted = [...result.statImpacts].sort((a, b) => {
    if (a.erGateWithoutStat === 'FAIL' && b.erGateWithoutStat !== 'FAIL') return -1;
    if (b.erGateWithoutStat === 'FAIL' && a.erGateWithoutStat !== 'FAIL') return 1;
    return (b.dpsLostIfRemovedPct ?? -Infinity) - (a.dpsLostIfRemovedPct ?? -Infinity);
  });

  const hidden = sorted.filter((impact) =>
    !conventionalHeadlineStats.has(impact.stat.name) &&
    (impact.dpsLostIfRemovedPct ?? 0) >= 0.005,
  );
  const headline = hidden.length > 0 ? 'STRONGER THAN IT LOOKS' : 'VALUE MAPPED';
  const lead = hidden.length > 0
    ? `${hidden[0]!.stat.name} is carrying real rotation value on this build.`
    : 'Each roll has been measured against the complete Augusta rotation.';

  return `
    <div class="result-card">
      <div class="result-kicker">ANALYSIS COMPLETE</div>
      <h3>${headline}</h3>
      <p>${lead}</p>
      <div class="impact-list">
        ${sorted.map((impact) => {
          const gate = impact.erGateWithoutStat === 'FAIL';
          const impactText = gate
            ? 'REQUIRED FOR ER GATE'
            : impact.dpsLostIfRemovedPct === null
              ? 'PENDING'
              : `${formatPercent(impact.dpsLostIfRemovedPct, 2)} DPS`;
          return `<div class="impact-row ${gate ? 'impact-row--gate' : ''}">
            <span>${formatStat(impact.stat)}</span>
            <strong>${impactText}</strong>
          </div>`;
        }).join('')}
      </div>
      <div class="result-note">This is an owned-Echo value map, not yet the final farm/replace cost verdict.</div>
    </div>`;
}

function bindGlobalNavigation(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      if (view !== 'ECHO_LAB' && view !== 'AUGUSTA') return;
      currentView = view;
      renderApp();
    });
  });
}

function ensureValidMainStatForCost(): void {
  const allowed = RANK5_PRIMARY_MAIN_STATS[labCost];
  if (!allowed.some((profile) => profile.name === labPrimaryMain)) {
    labPrimaryMain = allowed[0]!.name;
  }
}

function selectedLabIndices(): number[] {
  return [...selectedLabEchoes].sort((a, b) => a - b);
}

function createNewBatch(): void {
  const seedInput = document.querySelector<HTMLInputElement>('#lab-seed');
  const countInput = document.querySelector<HTMLInputElement>('#lab-count');
  const mainInput = document.querySelector<HTMLSelectElement>('#lab-main-stat');

  labSeed = seedInput?.value.trim() || 'bellibing-test-001';
  const parsedCount = Number(countInput?.value ?? labBatchCount);
  labBatchCount = Number.isFinite(parsedCount)
    ? Math.min(30, Math.max(1, Math.trunc(parsedCount)))
    : 5;
  if (mainInput?.value) labPrimaryMain = mainInput.value as PrimaryMainStatName;
  ensureValidMainStatForCost();

  labRng = createSeededRng(labSeed);
  const template = createRank5EchoAtLevel0({
    id: `lab-${labSeed}`,
    cost: labCost,
    primaryMainStat: labPrimaryMain,
  });
  labSession = echoLab.acquire(echoLab.createSession(), template, labBatchCount, labRng);
  selectedLabEchoes = new Set(labSession.echoes.map((_, index) => index));
  recoveredResources = { echoes: 0, tuners: 0, exp: 0, shellCredits: 0 };
  labStatus = `Generated ${labBatchCount} eligible ${labCost}-cost Echoes. All are selected.`;
  renderApp();
}

function bindEchoLab(): void {
  const costInput = document.querySelector<HTMLSelectElement>('#lab-cost');
  costInput?.addEventListener('change', () => {
    const value = Number(costInput.value);
    if (value !== 1 && value !== 3 && value !== 4) return;
    labCost = value;
    ensureValidMainStatForCost();
    renderApp();
  });

  document.querySelector<HTMLSelectElement>('#lab-main-stat')?.addEventListener('change', (event) => {
    labPrimaryMain = (event.currentTarget as HTMLSelectElement).value as PrimaryMainStatName;
  });

  document.querySelector<HTMLButtonElement>('#new-batch')?.addEventListener('click', createNewBatch);

  document.querySelectorAll<HTMLButtonElement>('[data-lab-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.labIndex);
      if (!Number.isInteger(index)) return;
      if (selectedLabEchoes.has(index)) selectedLabEchoes.delete(index);
      else selectedLabEchoes.add(index);
      renderApp();
    });
  });

  document.querySelector<HTMLButtonElement>('#select-all')?.addEventListener('click', () => {
    selectedLabEchoes = new Set(labSession.echoes.map((_, index) => index));
    labStatus = `Selected all ${labSession.echoes.length} Echoes.`;
    renderApp();
  });

  document.querySelector<HTMLButtonElement>('#clear-selection')?.addEventListener('click', () => {
    selectedLabEchoes.clear();
    labStatus = 'Selection cleared. Click individual Echoes to choose them.';
    renderApp();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-roll-level]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = Number(button.dataset.rollLevel) as EchoLevel;
      const indices = selectedLabIndices();
      if (indices.length === 0) return;
      try {
        labSession = echoLab.rollEchoesTo(labSession, indices, target, labRng);
        labStatus = `Rolled ${indices.length} selected Echo${indices.length === 1 ? '' : 'es'} to at least +${target}.`;
      } catch (error) {
        labStatus = error instanceof Error ? `ERROR: ${error.message}` : 'Unknown Echo Lab error.';
      }
      renderApp();
    });
  });

  document.querySelector<HTMLButtonElement>('#discard-selected')?.addEventListener('click', () => {
    const indices = selectedLabIndices().sort((a, b) => b - a);
    if (indices.length === 0) return;
    for (const index of indices) {
      const result = echoLab.discard(labSession, index);
      labSession = result.session;
      recoveredResources = addResources(recoveredResources, result.recovered);
    }
    selectedLabEchoes.clear();
    labStatus = `Discarded ${indices.length} Echo${indices.length === 1 ? '' : 'es'} and recorded the verified recovery.`;
    renderApp();
  });

  document.querySelector<HTMLButtonElement>('#reset-lab')?.addEventListener('click', () => {
    labSession = echoLab.createSession();
    labRng = createSeededRng(labSeed);
    selectedLabEchoes.clear();
    recoveredResources = { echoes: 0, tuners: 0, exp: 0, shellCredits: 0 };
    labStatus = 'Lab reset. Generate a new batch to start again.';
    renderApp();
  });
}

function bindAugustaEchoCards(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-slot]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedAugustaSlot = Number(button.dataset.slot);
      renderApp();
    });
  });
}

function bindAugustaAnalyze(): void {
  const button = document.querySelector<HTMLButtonElement>('#analyze-button');
  const zone = document.querySelector<HTMLDivElement>('#machine-zone');
  if (!button || !zone) return;

  button.addEventListener('click', () => {
    button.disabled = true;
    button.classList.add('analyze-button--working');
    let stage = 0;
    zone.innerHTML = machineMarkup(stage);

    const timer = window.setInterval(() => {
      stage += 1;
      if (stage < 4) zone.innerHTML = machineMarkup(stage);
    }, 115);

    window.setTimeout(() => {
      window.clearInterval(timer);
      zone.innerHTML = augustaResultMarkup();
      button.disabled = false;
      button.classList.remove('analyze-button--working');
    }, 520);
  });
}

function renderApp(): void {
  app.innerHTML = currentView === 'ECHO_LAB' ? echoLabMarkup() : augustaMarkup();
  bindGlobalNavigation();
  if (currentView === 'ECHO_LAB') bindEchoLab();
  else {
    bindAugustaEchoCards();
    bindAugustaAnalyze();
  }
}

renderApp();
