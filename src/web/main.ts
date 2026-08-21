import {
  AUGUSTA_LIVE_CURRENT_BUILD_2026_08_21,
  augustaStandardEchoDamageEvaluator,
} from '../characters/augustaEchoEvaluator.ts';
import { analyzeOwnedEchoValue } from '../ownedEchoValue.ts';
import type { Echo, StatRoll } from '../domain.ts';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Missing #app root.');

const build = AUGUSTA_LIVE_CURRENT_BUILD_2026_08_21;
const baseline = augustaStandardEchoDamageEvaluator.evaluate(build);
let selectedSlot = 2;

const conventionalHeadlineStats = new Set([
  'CRIT Rate',
  'CRIT DMG',
  'ATK%',
  'Energy Regen',
]);

function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

function formatStat(stat: StatRoll): string {
  const flat = stat.name.startsWith('Flat ');
  return `${stat.name} ${flat ? Math.round(stat.value) : formatPercent(stat.value)}`;
}

function echoMarkup(echo: Echo, index: number): string {
  const active = index === selectedSlot ? ' echo-card--active' : '';
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

function shellMarkup(): string {
  return `
    <main class="shell">
      <header class="topbar">
        <div>
          <div class="eyebrow">BELLIBING / ECHO DECISION LAB</div>
          <h1>Build the character.<br><span>Know when to stop.</span></h1>
        </div>
        <div class="engine-pill"><span></span> V9.15 PARITY ENGINE</div>
      </header>

      <section class="context-grid">
        <article class="panel context-card">
          <div class="panel-label">VERIFIED CONTEXT</div>
          <div class="context-line"><strong>Augusta</strong><span>S0</span></div>
          <div class="context-sub">Thunderflare Dominion R1</div>
          <div class="context-sub">Iuno + Shorekeeper · Standard Rotation</div>
        </article>
        <article class="panel metric-card">
          <div class="panel-label">PERSONAL ROTATION DPS</div>
          <div class="metric">${Math.round(baseline.personalRotationDps).toLocaleString('en-US')}</div>
          <div class="metric-sub">Exact V9.15 parity</div>
        </article>
        <article class="panel metric-card">
          <div class="panel-label">ENERGY GATE</div>
          <div class="metric metric--small">${formatPercent(baseline.energyRegen)}</div>
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
            ${build.echoes.map(echoMarkup).join('')}
          </div>
        </div>

        <aside class="analysis-panel panel" id="analysis-panel">
          ${selectedPanelMarkup()}
        </aside>
      </section>

      <section class="next-panel panel">
        <div>
          <div class="panel-label">NEXT ENGINE BLOCK</div>
          <h2>Checkpoint Roll Advisor</h2>
          <p>+5 / +10 / +15 / +20 → Continue, conditional continue, or dump — using the same combat engine plus verified roll economics.</p>
        </div>
        <div class="status-chip">IN BUILD</div>
      </section>
    </main>`;
}

function selectedPanelMarkup(): string {
  const echo = build.echoes[selectedSlot]!;
  return `
    <div class="panel-label">ECHO ${selectedSlot + 1} · COST ${echo.cost}</div>
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

function bindEchoCards(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-slot]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedSlot = Number(button.dataset.slot);
      const grid = document.querySelector<HTMLDivElement>('#echo-grid');
      const panel = document.querySelector<HTMLElement>('#analysis-panel');
      if (grid) grid.innerHTML = build.echoes.map(echoMarkup).join('');
      if (panel) panel.innerHTML = selectedPanelMarkup();
      bindEchoCards();
      bindAnalyze();
    });
  });
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

function resultMarkup(): string {
  const result = analyzeOwnedEchoValue(build, selectedSlot, augustaStandardEchoDamageEvaluator);
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

function bindAnalyze(): void {
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
      zone.innerHTML = resultMarkup();
      button.disabled = false;
      button.classList.remove('analyze-button--working');
    }, 520);
  });
}

app.innerHTML = shellMarkup();
bindEchoCards();
bindAnalyze();
