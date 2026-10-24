import { baseAsset, assetURL, escapeHtml } from './util.js';

// Pure numeric stat values leave space for the percent unit without inserting a glyph.
function statValue(value) {
  const text = String(value);
  const flat = /^[+-]?\d[\d,]*(?:\.\d+)?$/.test(text.trim());
  return `<strong${flat ? ' class="stat-unitless"' : ''}>${escapeHtml(text)}</strong>`;
}
// Lifecycle presentation only. Echo rarity (`rank`) never establishes Improve rank.
export function echoStatus(echo,{candidate=false,footer='SIMULATED'}={}) {
 if(!echo)return {code:'EMPTY',label:'Empty'};
 if(echo.disposition==='DISCARDED')return {code:'DISCARDED',label:'Discarded',checkpoint:Number.isInteger(echo.level)&&echo.level>=0&&echo.level<=25&&echo.level%5===0?`+${echo.level}`:null};
 if(echo.configured)return {code:'CONFIGURED',label:'Configured'};
 if(echo.disposition==='KEPT')return {code:'KEPT',label:'Kept'};
 if(echo.disposition==='TEMPORARY')return {code:'TEMPORARY',label:'Temporary'};
 if(candidate)return {code:'CANDIDATE',label:'Candidate'};
 const labels={EQUIPPED:'Equipped',CURRENT:'Equipped',ACTIVE:'Active',TEMPORARY:'Temporary',SIMULATED:'Observed',UNFINISHED:'Candidate'};
 return {code:Object.hasOwn(labels,footer)?footer:'PENDING',label:labels[footer]??'Pending'};
}
function statusField(echo,options){
 const status=echoStatus(echo,options),ranking=options.rankPending&&echo&&!echo.configured&&!options.candidate&&status.code!=='DISCARDED';
 return `<div class="card-bottom echo-status-field" data-echo-status="${status.code}" aria-label="Echo status: ${status.label}"><span class="echo-status-label">${status.label}${status.checkpoint?` <small>${status.checkpoint}</small>`:''}</span>${ranking?'<span class="echo-improve-rank" data-rank-status="PENDING" title="Rank 1: hardest to improve; Rank 5: easiest. Ranking requires a qualified Improve comparison.">Rank <span>Pending</span></span>':''}</div>`;
}
export function echoCard(echo, { candidate = false, footer = 'SIMULATED', compactFooter=false,rankPending=false } = {}) {
  if (!echo) return emptyEchoCard(compactFooter);
  if(echo.configured)footer='';
  const setName=echo.setName ?? (echo.set === 'crown' ? 'Crown of Valor' : 'Void Thunder');
  const discarded = echo.disposition === 'DISCARDED';
  const knownLevel = Number.isInteger(echo.level) && echo.level >= 0 && echo.level <= 25 && echo.level % 5 === 0;
  const name = escapeHtml(echo.name).replace(/^Nightmare: /, '<span class="nightmare-prefix">Nightmare:</span><br>');
  return `<article class="echo-card ${echo.configured ? 'configured' : ''} ${candidate ? 'candidate' : ''} ${discarded ? 'discarded' : ''}" aria-label="${escapeHtml(echo.name)}, ${echo.configured ? 'configured template, not simulated' : knownLevel ? `level ${echo.level}` : 'level unknown'}${discarded ? ', discarded' : ''}">
    <div class="echo-topline"><span class="cost">COST <strong>${echo.cost}</strong></span><span class="level">${echo.configured ? 'CONFIGURED' : knownLevel ? `+${echo.level}` : '—'}</span></div>
    <div class="echo-art"><img src="${echo.artURL ? assetURL(echo.artURL) : baseAsset(echo.art)}" alt="${escapeHtml(echo.name)}"></div>
    <div class="echo-identity"><img src="${echo.setIconURL ? assetURL(echo.setIconURL) : baseAsset(`${echo.set}.webp`)}" alt="${escapeHtml(setName)}"><div class="echo-name">${name}<small>${escapeHtml(setName.toUpperCase())}</small></div></div>
    <div class="echo-values"><div class="main-stat"><span>${escapeHtml(echo.main)}</span>${statValue(echo.value)}</div><div class="secondary-stat"><span>${escapeHtml(echo.secondary)}</span>${statValue(echo.secondaryValue)}</div>
    <div class="substats">${Array.from({ length: 5 }, (_, index) => {
      const stat = echo.stats[index];
      const checkpoint = (index + 1) * 5;
      // Templates have no rolls; discarded cards require an observed stopping checkpoint.
      const notRolled = !stat && (echo.configured || discarded && knownLevel && checkpoint > echo.level);
      return `<div class="substat ${stat && ['CRIT Rate', 'CRIT DMG'].includes(stat[0]) ? 'relevant' : ''} ${stat ? '' : 'empty'}"><span>${stat ? escapeHtml(stat[0]) : notRolled ? `+${checkpoint}` : '— — —'}</span>${stat ? statValue(stat[1]) : `<strong>${notRolled ? 'Not rolled' : '—'}</strong>`}</div>`;
    }).join('')}</div></div>
    ${compactFooter?statusField(echo,{candidate,footer,rankPending}):`<div class="card-bottom"><span class="stars">✦✦✦✦✦</span><span>${discarded ? knownLevel ? `DISCARDED AT +${echo.level}` : 'DISCARDED · CHECKPOINT UNKNOWN' : escapeHtml(footer)}</span></div>`}
  </article>`;
}

function emptyEchoCard(compactFooter=false) {
  return `<article class="echo-card empty-echo" aria-label="Empty Echo slot"><div class="echo-topline"><span class="cost">ECHO</span><span class="level">—</span></div><div class="echo-art"><span class="empty-symbol">◇</span></div><div class="echo-identity"><div class="echo-name">Empty slot<small>NO ECHO EQUIPPED</small></div></div><div class="echo-values"><div class="main-stat"><span>Main Stat</span><strong>—</strong></div><div class="secondary-stat"><span>Secondary Stat</span><strong>—</strong></div><div class="substats">${Array.from({ length: 5 }, () => '<div class="substat empty"><span>— — —</span><strong>—</strong></div>').join('')}</div></div>${compactFooter?statusField(null,{}):'<div class="card-bottom"><span class="stars">◇◇◇◇◇</span><span>EMPTY</span></div>'}</article>`;
}
