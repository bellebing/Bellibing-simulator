import { readFileSync, writeFileSync } from 'node:fs';

// Curated source-row classifications; never infer the damage class from its panel.
const source = JSON.parse(readFileSync('data/source/character-release-3.7.json', 'utf8'));
const sectionByType = { 1: 'BASIC_ATTACK', 2: 'RESONANCE_SKILL', 3: 'RESONANCE_LIBERATION', 4: 'INHERENT_SKILL', 5: 'INTRO_SKILL', 6: 'FORTE_CIRCUIT', 11: 'OUTRO_SKILL', 12: 'TUNE_BREAK' };
const classifications = {};
function rows(ids, damageClass, actionKind, scalingStat = 'ATK') {
  for (const id of ids) classifications[id] = { damageClass, actionKind, scalingStat };
}
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
rows([...range(1311101, 1311104), 1311106, 1311108, ...range(1311110, 1311113), ...range(1311115, 1311116), ...range(1311118, 1311121)], 'BASIC', 'BASIC');
rows([1311105, 1311107, 1311114], 'HEAVY', 'HEAVY');
rows([1311109, 1311117, 1311122], 'BASIC', 'DODGE_COUNTER');
rows([1311201, 1311202, 1311203], 'SKILL', 'SKILL');
rows([1311302], 'SKILL', 'LIBERATION');
rows([1311303], 'LIBERATION', 'LIBERATION'); // damage row 1311240404: Type=2; coordinated SubType=0 is separate.
rows([1311601, 1311602, 1311604, 1311605], 'INTRO', 'INTRO');
rows([1311603, 1311606], 'SKILL', 'INTRO');
rows(range(1311701, 1311704), 'SKILL', 'HEAVY');
rows([1212001, 1212002, 1212005, 1212006, 1212009], 'BASIC', 'BASIC');
rows([1212003, 1212004, 1212007, 1212008], 'HEAVY', 'BASIC');
rows([1212010, 1212011], 'HEAVY', 'DODGE_COUNTER');
rows([1212013, 1212015], 'SKILL', 'SKILL');
rows([1212014, 1212016], 'HEAVY', 'SKILL');
rows([1212019, 1212020], 'HEAVY', 'LIBERATION');
rows([1212024], 'INTRO', 'INTRO');
rows([1212026, 1212027], 'HEAVY', 'HEAVY');
// These are conditional additive increases per 1,000 qualifying HP, not ordinary HP attacks.
rows([1212030, 1212031], 'HEAVY', 'HEAVY', 'MIXED');

function resolve(template, params) {
  if (typeof template !== 'string' || !template) throw Error('Missing source text');
  return template.replace(/\{(\d+)\}/g, (_, id) => {
    if (params[Number(id)] === undefined) throw Error(`Missing source parameter ${id}`);
    return params[Number(id)];
  }).replace(/<[^>]+>/g, '')
    .replace(/\{Cus:Ipt,[^}]*PC=([^ }]+)[^}]*\}/g, '$1')
    .replace(/\{Cus:Sap,[^}]*P=([^ }]+)[^}]*\}/g, '$1');
}
function components(values) {
  const parsed = values.slice(0, 10).map(value => value.split('+').map(term => {
    const match = term.trim().match(/^(\d+(?:\.\d+)?)%(?:\*(\d+))?$/);
    if (!match) throw Error(`Unsupported damage expression: ${value}`);
    return { coefficient: Number(match[1]) / 100, hitCount: Number(match[2] ?? 1) };
  }));
  if (parsed.length !== 10 || parsed.some(level => level.length !== parsed[0].length)) throw Error('Incomplete damage curve');
  return parsed[0].map((term, index) => {
    if (parsed.some(level => level[index].hitCount !== term.hitCount)) throw Error('Changing source hit-count structure');
    return { curve: parsed.map(level => level[index].coefficient), hitCount: term.hitCount };
  });
}
const allFacts = [], profiles = [];
for (const characterId of ['hsin', 'jingran']) {
  const character = source.characters.find(c => c.characterId === characterId);
  const provenance = {
    sourceLabels: ['Arikatsu original released client data — GameVer 3.7.0 / ResourceVer 3.7.8 @9218d612ad815e398e064e577e42aaf878899968', 'Prydwen / wuther.in post-release kit cross-check'],
    sourceUrls: ['skills', 'descriptions', 'tree', 'chains', 'text', 'damage'].map(k => source.provenance[k].url)
      .concat(`https://www.prydwen.gg/wuthering-waves/characters/${characterId}`),
    checkedAt: '2026-10-11',
    notes: ['Exact source IDs/templates/params/20-level arrays retained in data/source/character-release-3.7.json. Canonical damage curves select original levels 1–10 only; no interpolation, selected build level, rotations or modeled uptime.', 'Raw source text does not supply executable refresh, event ordering, shared-system Electro Flare or DPS semantics.'],
  };
  const facts = [];
  const base = (factId, name, section) => ({ factId, characterId, name, section, verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', conditional: true, provenance });
  for (const skill of character.skills) {
    const type = skill.source.SkillType, section = sectionByType[type];
    if (!section) continue; // Cooking is outside the combat kit.
    const summary = resolve(skill.descriptionTemplate, skill.source.SkillDetailNum);
    if (type === 12) {
      facts.push({ ...base(`${characterId}-tune-break-source`, skill.name, section), kind: 'ACTION', actionKind: 'TUNE_BREAK', actionRole: 'SHARED_SYSTEM_DAMAGE', damageClass: 'OTHER', scalingStat: 'SHARED_SYSTEM', motionValue: null, motionValueContext: 'The source grants Tune Break access; damage belongs to the shared Tune Break system, not a Character skill curve.', hitCount: null, modelingStatus: 'PENDING_INTERPRETATION', notes: [summary] });
      continue;
    }
    // Full source rules accompany the numeric actions, including thresholds, mode/state, costs and termination.
    facts.push({ ...base(`${characterId}-skill-${skill.source.Id}-rules`, skill.name, section), kind: 'PASSIVE', scope: type === 11 ? 'OTHER' : 'SELF', triggerSummary: `Source skill ${skill.source.Id}; exact prerequisites are in effectSummary.`, effectSummary: summary, durationSeconds: null, maxStacks: null });
    for (const row of skill.values) {
      const classified = classifications[row.source.Id];
      if (!classified) continue;
      const arrays = row.source.SkillDetailNum;
      if (arrays.length !== 1) throw Error(`Expected one source expression row ${row.source.Id}`);
      const data = components(arrays[0].ArrayString);
      const fact = { ...base(`${characterId}-damage-${row.source.Id}`, row.name, section), kind: 'ACTION', actionRole: 'DAMAGE', ...classified, motionValue: null, motionValueContext: `Source skill ${skill.source.Id}, description row ${row.source.Id}; exact listed per-component multipliers at skill levels 1–10.`, hitCount: data.length === 1 ? data[0].hitCount : null, notes: [`Source damage classification reviewed separately from skill panel ownership. Source description row ${row.source.Id}.`] };
      if (data.length === 1) fact.motionValueCurve = data[0].curve;
      else fact.motionValueComponents = data;
      if (classified.scalingStat === 'MIXED') fact.notes.push('Additive increase per 1,000 Max HP over 25,000 while Yinghuo/Fire of Life qualifies, capped at 25,000 qualifying HP. This is not an independently executable HP-scaled hit.');
      facts.push(fact);
    }
    if (type === 11) {
      const coefficient = Number(skill.source.SkillDetailNum[0].replace('%', '')) / 100;
      facts.push({ ...base(`${characterId}-outro-source-damage`, `${skill.name} — damage`, section), kind: 'ACTION', actionKind: 'OUTRO', actionRole: 'DAMAGE', damageClass: 'OUTRO', scalingStat: 'ATK', motionValue: null, sourceFixedMotionValue: coefficient, motionValueContext: 'Fixed source Outro coefficient; no skill-level curve.', hitCount: 1 });
    }
    if (characterId === 'jingran' && type === 1) {
      const row = skill.values.find(r => r.source.Id === 1212028);
      const values = row.source.SkillDetailNum[0].ArrayString.slice(0, 10);
      if (!values.every(v => v === '30+25')) throw Error('Shadow Step source structure drift');
      for (const [index, amount] of [30, 25].entries()) facts.push({ ...base(`jingran-shadow-step-flat-${index + 1}`, `Shadow Step — flat component ${index + 1}`, section), kind: 'ACTION', actionKind: 'DODGE_COUNTER', actionRole: 'DAMAGE', damageClass: 'BASIC', scalingStat: 'FIXED', motionValue: null, sourceFixedFlatDamage: amount, motionValueContext: 'Source row 1212028: fixed 30+25 damage; separate listed components, unaffected by all DMG Bonus effects.', hitCount: 1, notes: ['Do not apply ordinary Basic DMG Bonus or combine source components into an invented stat multiplier.'] });
    }
  }
  const resources = characterId === 'hsin'
    ? [['Answering Heart', 100, 1006107], ['Illumining Heart', 300, 1006107], ['Heart of Thunder', 100, 1006107], ['Edict', 21, 1006103], ['Unison Boon (base)', 2, 1006107], ['Thunderglow', 10, 1006105]]
    : [['Qi', 300, 1005907], ['Fire of Life', 100, 1005907], ["Wayfarer's Mark", 3, 1005903], ['Ghost Shroud', 50, 1005906], ['Fortune in Disguise', 50, 1005906]];
  for (const [name, maxValue, skillId] of resources) {
    const skill = character.skills.find(s => s.source.Id === skillId);
    facts.push({ ...base(`${characterId}-resource-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')}`, name, 'FORTE_CIRCUIT'), kind: 'RESOURCE', resourceName: name, maxValue, ruleSummary: resolve(skill.descriptionTemplate, skill.source.SkillDetailNum), notes: ['Base cap only; conditional Inherent/Sequence increases remain in their separate raw source rules.'] });
  }
  for (const chain of character.chains) facts.push({ ...base(`${characterId}-sequence-${chain.source.GroupIndex}`, chain.name, 'RESONANCE_CHAIN'), kind: 'SEQUENCE', sequence: chain.source.GroupIndex, triggerSummary: 'Exact source conditions retained in effectSummary.', effectSummary: resolve(chain.descriptionTemplate, chain.source.AttributesDescriptionParams) });
  allFacts.push(...facts);
  profiles.push({ characterId, verificationStatus: 'VERIFIED', coverage: ['ACTIONS', 'FORTE_RULES', 'INHERENT_PASSIVES', 'OUTRO_EFFECT', 'RESOURCE_RULES', 'SEQUENCES'].map(area => ({ area, status: 'VERIFIED', notes: 'Released source facts only; RAW_ONLY/PENDING_INTERPRETATION does not establish execution, UI or DPS readiness.' })), factIds: facts.map(f => f.factId), provenance });
}
const completionFacts = [];
for (const characterId of ['buling', 'danjin', 'xiangli-yao']) {
  const character = source.characters.find(c => c.characterId === characterId);
  const provenance = { ...profiles[0].provenance, sourceUrls: ['skills', 'chains', 'text', 'damage'].map(k => source.provenance[k].url) };
  const base = (factId, name, section) => ({ factId, characterId, name, section, verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', conditional: true, provenance });
  for (const chain of character.chains) completionFacts.push({ ...base(`${characterId}-sequence-${chain.source.GroupIndex}-release`, chain.name, 'RESONANCE_CHAIN'), kind: 'SEQUENCE', sequence: chain.source.GroupIndex, triggerSummary: 'Exact source conditions retained in effectSummary.', effectSummary: resolve(chain.descriptionTemplate, chain.source.AttributesDescriptionParams) });
  const resources = characterId === 'buling' ? [['Trigrams', 4, 1004301]]
    : characterId === 'xiangli-yao' ? [['Capacity', 100, 1002307], ['Performance Capacity', 5, 1002307], ['Hypercubes', 3, 1002303]]
    : [['Ruby Blossom', 120, 1000807]];
  for (const [name, maxValue, skillId] of resources) {
    const skill = character.skills.find(s => s.source.Id === skillId);
    completionFacts.push({ ...base(`${characterId}-resource-${name.toLowerCase().replace(/ /g, '-')}-release`, name, 'FORTE_CIRCUIT'), kind: 'RESOURCE', resourceName: name, maxValue, ruleSummary: resolve(skill.descriptionTemplate, skill.source.SkillDetailNum), notes: characterId === 'danjin' ? ['Cap 120 is source-explicit. The literal over-120 full-power clause contradicts that cap; full-power activation remains source-blocked, without normalization.'] : [] });
  }
}
const output = `// Generated from reviewed original release source; regenerate with scripts/generate-release-character-kit-facts.mjs.\nimport type { CharacterMechanicFact, CharacterMechanicsProfile } from '../../characterMechanicsDomain.ts';\n\nexport const RELEASE_CHARACTER_KIT_FACTS: readonly CharacterMechanicFact[] = ${JSON.stringify(allFacts, null, 2)} as const;\n\nexport const RELEASE_CHARACTER_KIT_PROFILES: readonly CharacterMechanicsProfile[] = ${JSON.stringify(profiles, null, 2)} as const;\n\nexport const RELEASE_CHARACTER_MECHANIC_COMPLETION_FACTS: readonly CharacterMechanicFact[] = ${JSON.stringify(completionFacts, null, 2)} as const;\n`;
const path = 'src/data/characterMechanics/releaseCharacterKitFacts.ts';
if (process.argv.includes('--check')) {
  if (readFileSync(path, 'utf8') !== output) throw Error('Released kit facts drifted');
} else writeFileSync(path, output);
console.log(`Generated ${allFacts.length} source-only facts for Hsin/Jingran.`);
