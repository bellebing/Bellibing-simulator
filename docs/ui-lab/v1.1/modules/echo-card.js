import { baseAsset, assetURL, escapeHtml } from './util.js';

// Pure numeric stat values leave space for the percent unit without inserting a glyph.
function statValue(value) {
  const text = String(value);
  const flat = /^[+-]?\d[\d,]*(?:\.\d+)?$/.test(text.trim());
  return `<strong${flat ? ' class="stat-unitless"' : ''}>${escapeHtml(text)}</strong>`;
}
export function echoCard(echo, { candidate = false, footer = 'SIMULATED' } = {}) {
  if (!echo) return emptyEchoCard();
  if(echo.configured)footer='CONFIGURED';
  const setName=echo.setName ?? (echo.set === 'crown' ? 'Crown of Valor' : 'Void Thunder');
  const discarded = echo.disposition === 'DISCARDED';
  const knownLevel = Number.isInteger(echo.level) && echo.level >= 0 && echo.level <= 25 && echo.level % 5 === 0;
  const name = escapeHtml(echo.name).replace(/^Nightmare: /, '<span class="nightmare-prefix">Nightmare:</span><br>');
  return `<article class="echo-card ${candidate ? 'candidate' : ''} ${discarded ? 'discarded' : ''}" aria-label="${escapeHtml(echo.name)}, ${echo.configured ? 'configured template, not simulated' : knownLevel ? `level ${echo.level}` : 'level unknown'}${discarded ? ', discarded' : ''}">
    <div class="echo-topline"><span class="cost">COST <strong>${echo.cost}</strong></span><span class="level">${knownLevel ? `+${echo.level}` : '—'}</span></div>
    <div class="echo-art"><img src="${echo.artURL ? assetURL(echo.artURL) : baseAsset(echo.art)}" alt="${escapeHtml(echo.name)}"></div>
    <div class="echo-identity"><img src="${echo.setIconURL ? assetURL(echo.setIconURL) : baseAsset(`${echo.set}.webp`)}" alt="${escapeHtml(setName)}"><div class="echo-name">${name}<small>${escapeHtml(setName.toUpperCase())}</small></div></div>
    <div class="echo-values"><div class="main-stat"><span>${escapeHtml(echo.main)}</span>${statValue(echo.value)}</div><div class="secondary-stat"><span>${escapeHtml(echo.secondary)}</span>${statValue(echo.secondaryValue)}</div>
    <div class="substats">${Array.from({ length: 5 }, (_, index) => {
      const stat = echo.stats[index];
      const checkpoint = (index + 1) * 5;
      // Only checkpoints after an observed stopping level can say Not rolled.
      const notRolled = !stat && (echo.configured || discarded && knownLevel && checkpoint > echo.level);
      return `<div class="substat ${stat && ['CRIT Rate', 'CRIT DMG'].includes(stat[0]) ? 'relevant' : ''} ${stat ? '' : 'empty'}"><span>${stat ? escapeHtml(stat[0]) : notRolled ? `+${checkpoint}` : '— — —'}</span>${stat ? statValue(stat[1]) : `<strong>${notRolled ? 'Not rolled' : '—'}</strong>`}</div>`;
    }).join('')}</div></div>
    <div class="card-bottom"><span class="stars">✦✦✦✦✦</span><span>${discarded ? knownLevel ? `DISCARDED AT +${echo.level}` : 'DISCARDED · CHECKPOINT UNKNOWN' : escapeHtml(footer)}</span></div>
  </article>`;
}

function emptyEchoCard() {
  return `<article class="echo-card empty-echo" aria-label="Empty Echo slot"><div class="echo-topline"><span class="cost">ECHO</span><span class="level">—</span></div><div class="echo-art"><span class="empty-symbol">◇</span></div><div class="echo-identity"><div class="echo-name">Empty slot<small>NO ECHO EQUIPPED</small></div></div><div class="echo-values"><div class="main-stat"><span>Main Stat</span><strong>—</strong></div><div class="secondary-stat"><span>Secondary Stat</span><strong>—</strong></div><div class="substats">${Array.from({ length: 5 }, () => '<div class="substat empty"><span>— — —</span><strong>—</strong></div>').join('')}</div></div><div class="card-bottom"><span class="stars">◇◇◇◇◇</span><span>EMPTY</span></div></article>`;
}
