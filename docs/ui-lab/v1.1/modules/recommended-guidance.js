import {characterContext} from './character-context.js';
import {escapeHtml} from './util.js';
export function recommendedGuidance(characterId){
 const row=characterContext(characterId)?.character;
 if(!row)return '';
 const r=row.recommendations;
 return `<details class="recommended-guidance"><summary>Recommended · source guidance</summary><a href="${escapeHtml(r.sourceUrl)}" target="_blank" rel="noreferrer">Character guide</a><p>Source priorities · guidance, not per-Echo Hard requirements</p>${r.substatPriorities.map(p=>`<p>${escapeHtml(p.sourceText)}</p>`).join('')}<dl>${r.endgameStats.map(s=>`<dt>${escapeHtml(s.sourceStatName)}</dt><dd>${escapeHtml(s.sourceText)}${s.conditions.length?` · ${escapeHtml(s.conditions.join(' · '))}`:''}</dd>`).join('')}</dl><p>Level ${r.context.level} · ${escapeHtml(r.context.measurementBasis.replaceAll('_',' ').toLowerCase())}. Source default: S0 five-star / S6 four-star and free, unless overridden. Conditional targets and ranges are not exact Sandbox acceptance thresholds.</p><p>${r.hardFlexStatus==='PENDING_REVIEWED_ECHO_REQUIREMENTS'?'Per-Echo Hard/Flex thresholds Pending · source priorities appear in Flex without required minima/count.':'Canonical approved Echo settings are available.'} ${r.endgameStats.some(s=>/energy|regen/i.test(s.sourceStatName))?'ER guidance retains its source conditions.':'ER target Pending · this capture contains no numeric ER target.'}</p></details>`;
}
