import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import {
  FACTORY_PROVIDER_REGISTRY,
  validateFactoryProviderRegistry,
} from '../src/factory/evidence.ts';
import {
  compareCharacterTruthToCanonical,
  reconcileCharacterTruthFacts,
  type CharacterTruthProviderFact,
} from '../src/factory/characterTruthCapture.ts';

type Json = Record<string, any>;
const read = (path: string): Json => JSON.parse(readFileSync(path, 'utf8'));
const prydwenKit = read('data/factory/character-truth/prydwen-character-truth.json');
const prydwenProgression = read('data/factory/character-truth/prydwen-progression-truth.json');
const wuthering = read('data/factory/character-truth/wuthering-gg-character-truth.json');
const sequenceSource = read('data/source/character-sequence-ui.json');

const byId = (payload: Json) => new Map(payload.characters.map((row: Json) => [row.bellibingCharacterId, row]));
const kitById = byId(prydwenKit);
const prydwenProgressionById = byId(prydwenProgression);
const wutheringById = byId(wuthering);
const sequenceById = new Map(sequenceSource.characters.map((row: Json) => [row.characterId, row]));

const facts: CharacterTruthProviderFact[] = [];
function sourceVersionOf(_row: Json): null {
  // capturedAt is observation time, never a stand-in for provider content version.
  return null;
}
function add(input: Omit<CharacterTruthProviderFact, 'capturedAt' | 'freshnessSensitive'> & { capturedAt?: string; freshnessSensitive?: boolean }) {
  facts.push({
    ...input,
    capturedAt: input.capturedAt ?? 'UNKNOWN',
    freshnessSensitive: input.freshnessSensitive ?? false,
  });
}
function addProgression(providerId: string, row: Json | undefined, energyKey: 'maxEnergy' | 'maxResonanceEnergy') {
  if (!row || row.captureStatus === 'UNAVAILABLE') return;
  for (const [factId, value] of Object.entries(row.identity ?? {})) {
    if (value === null || value === undefined) continue;
    add({ providerId, providerCharacterId: row.providerCharacterId ?? row.bellibingCharacterId,
      bellibingCharacterId: row.bellibingCharacterId, family: 'IDENTITY', factId, value,
      sourceRef: row.sourceUrl, sourceVersion: sourceVersionOf(row), capturedAt: row.capturedAt,
      freshnessSensitive: row.freshnessSensitive });
  }
  const level = row.level90;
  if (!level) return;
  for (const factId of ['hp','atk','def'] as const) {
    if (level[factId] === null || level[factId] === undefined) continue;
    add({ providerId, providerCharacterId: row.providerCharacterId ?? row.bellibingCharacterId,
      bellibingCharacterId: row.bellibingCharacterId, family: 'PROGRESSION', factId: `level90.${factId}`,
      value: level[factId], sourceRef: row.sourceUrl, sourceVersion: sourceVersionOf(row),
      capturedAt: row.capturedAt, freshnessSensitive: row.freshnessSensitive });
  }
  const energy = level[energyKey];
  if (energy !== null && energy !== undefined) add({
    providerId, providerCharacterId: row.providerCharacterId ?? row.bellibingCharacterId,
    bellibingCharacterId: row.bellibingCharacterId, family: 'PROGRESSION', factId: 'level90.maxEnergy',
    value: energy, sourceRef: row.sourceUrl, sourceVersion: sourceVersionOf(row),
    capturedAt: row.capturedAt, freshnessSensitive: row.freshnessSensitive,
    notes: energyKey === 'maxResonanceEnergy' ? ['Provider label: Max Resonance Energy'] : ['Provider label: Max Energy'],
  });
}

for (const character of CHARACTER_CATALOG) {
  const id = character.id;
  const p = prydwenProgressionById.get(id);
  const w = wutheringById.get(id);
  addProgression('prydwen-profile-source', p, 'maxEnergy');
  addProgression('wuthering-gg', w, 'maxResonanceEnergy');

  const kit = kitById.get(id);
  if (kit && kit.captureStatus !== 'UNAVAILABLE') {
    if (kit.providerDisplayName) add({
      providerId: 'prydwen-profile-source', providerCharacterId: kit.providerCharacterId,
      bellibingCharacterId: id, family: 'IDENTITY', factId: 'displayName', value: kit.providerDisplayName,
      sourceRef: kit.sourceUrl, sourceVersion: sourceVersionOf(kit), capturedAt: kit.capturedAt,
      freshnessSensitive: kit.freshnessSensitive,
    });
    for (const [skillKey, skill] of Object.entries(kit.skills ?? {}) as [string, Json | null][]) {
      if (!skill) continue;
      if (skill.name) add({
        providerId: 'prydwen-profile-source', providerCharacterId: kit.providerCharacterId,
        bellibingCharacterId: id, family: 'SKILL_ACTION', factId: `${skillKey}.name`, value: skill.name,
        sourceRef: kit.sourceUrl, sourceVersion: sourceVersionOf(kit), capturedAt: kit.capturedAt,
        freshnessSensitive: kit.freshnessSensitive,
      });
      if (skill.multiplierTextByLevel && Object.keys(skill.multiplierTextByLevel).length > 0) add({
        providerId: 'prydwen-profile-source', providerCharacterId: kit.providerCharacterId,
        bellibingCharacterId: id, family: 'SKILL_ACTION', factId: `${skillKey}.levelValues`,
        value: skill.multiplierTextByLevel, sourceRef: kit.sourceUrl, sourceVersion: sourceVersionOf(kit),
        capturedAt: kit.capturedAt, freshnessSensitive: kit.freshnessSensitive,
      });
    }
    for (const chain of kit.sequences ?? []) if (chain?.name && !/^Sequence Node \d+$/i.test(chain.name.trim())) add({
      providerId: 'prydwen-profile-source', providerCharacterId: kit.providerCharacterId,
      bellibingCharacterId: id, family: 'SEQUENCE', factId: `S${chain.sequence}.name`, value: chain.name,
      sourceRef: kit.sourceUrl, sourceVersion: sourceVersionOf(kit), capturedAt: kit.capturedAt,
      freshnessSensitive: kit.freshnessSensitive,
    });
  }
  if (w && w.captureStatus !== 'UNAVAILABLE') {
    if (w.providerDisplayName) add({
      providerId: 'wuthering-gg', providerCharacterId: w.providerCharacterId,
      bellibingCharacterId: id, family: 'IDENTITY', factId: 'displayName', value: w.providerDisplayName,
      sourceRef: w.sourceUrl, sourceVersion: sourceVersionOf(w), capturedAt: w.capturedAt,
      freshnessSensitive: w.freshnessSensitive,
    });
    for (let i = 0; i < (w.sequenceNames ?? []).length; i++) if (w.sequenceNames[i]) add({
      providerId: 'wuthering-gg', providerCharacterId: w.providerCharacterId,
      bellibingCharacterId: id, family: 'SEQUENCE', factId: `S${i+1}.name`, value: w.sequenceNames[i],
      sourceRef: w.sourceUrl, sourceVersion: sourceVersionOf(w), capturedAt: w.capturedAt,
      freshnessSensitive: w.freshnessSensitive,
    });
  }
}

const providers = [...new Set(facts.map((fact) => fact.providerId))].sort();
validateFactoryProviderRegistry();
const registryById = new Map(FACTORY_PROVIDER_REGISTRY.map((provider) => [provider.providerId, provider]));
for (const providerId of providers) {
  const provider = registryById.get(providerId);
  if (!provider) throw new Error(`Character truth reconciliation: provider ${providerId} is not registered in FACTORY_PROVIDER_REGISTRY`);
  if (!provider.enabledForFactoryEvidence) throw new Error(`Character truth reconciliation: provider ${providerId} is not enabled for Factory evidence`);
  if (provider.canonicalAuthority !== false) throw new Error(`Character truth reconciliation: provider ${providerId} must remain noncanonical`);
  if (provider.dataUsePolicy === 'REFERENCE_ONLY_NO_REUSE') {
    throw new Error(`Character truth reconciliation: provider ${providerId} is reference-only and cannot enter reusable Factory evidence`);
  }
}

const reconciliation = reconcileCharacterTruthFacts(facts);
const canonicalDeltas: any[] = [];
const canonicalById = new Map(CHARACTER_CATALOG.map(character => [character.id, character]));
for (const row of reconciliation) {
  if (!row.bellibingCharacterId) continue;
  const character = canonicalById.get(row.bellibingCharacterId)!;
  let canonicalValue: unknown = undefined;
  if (row.family === 'IDENTITY') {
    if (row.factId === 'displayName') canonicalValue = character.name;
    if (row.factId === 'rarity') canonicalValue = character.rarity;
    if (row.factId === 'element') canonicalValue = character.element ?? undefined;
    if (row.factId === 'weaponType') canonicalValue = character.weaponType ?? undefined;
  } else if (row.family === 'PROGRESSION') {
    const field = row.factId.replace('level90.','') as 'hp'|'atk'|'def'|'maxEnergy';
    canonicalValue = character.level90[field] ?? undefined;
  } else if (row.family === 'SEQUENCE') {
    const seq = Number(row.factId.match(/^S(\d+)\.name$/)?.[1]);
    canonicalValue = sequenceById.get(character.id)?.chains?.find((chain: Json) => chain.sequence === seq)?.name ?? undefined;
  } else {
    canonicalDeltas.push({
      characterId: character.id, family: row.family, factId: row.factId,
      state: 'NOT_COMPARABLE', canonicalValue: null,
      providerValues: row.providerFacts.map(f => f.value),
    });
    continue;
  }
  canonicalDeltas.push({
    family: row.family,
    ...compareCharacterTruthToCanonical({
      characterId: character.id, factId: row.factId, canonicalValue, providerFacts: row.providerFacts,
    }),
  });
}

const countBy = <T extends string>(values: readonly T[]) =>
  Object.fromEntries([...new Set(values)].sort().map(key => [key, values.filter(value => value === key).length]));

const kitCoverage = CHARACTER_CATALOG.map(character => {
  const row = kitById.get(character.id);
  const skills = Object.entries(row?.skills ?? {}).filter(([, skill]) => skill !== null) as [string, Json][];
  const level10 = skills.filter(([, skill]) => Object.keys(skill.multiplierTextByLevel ?? {}).length === 10).map(([key]) => key);
  return {
    characterId: character.id,
    releaseStatus: character.releaseStatus,
    captureStatus: row?.captureStatus ?? 'UNAVAILABLE',
    skillKeys: skills.map(([key]) => key),
    level10SkillKeys: level10,
    sequenceCount: row?.sequences?.length ?? 0,
    warnings: row?.warnings ?? ['snapshot row missing'],
  };
});
const progressionCoverage = CHARACTER_CATALOG.map(character => ({
  characterId: character.id,
  releaseStatus: character.releaseStatus,
  prydwen: prydwenProgressionById.get(character.id)?.captureStatus ?? 'UNAVAILABLE',
  wutheringGg: wutheringById.get(character.id)?.captureStatus ?? 'UNAVAILABLE',
  prydwenWarnings: prydwenProgressionById.get(character.id)?.warnings ?? ['snapshot row missing'],
  wutheringGgWarnings: wutheringById.get(character.id)?.warnings ?? ['snapshot row missing'],
}));

const output = {
  schemaVersion: 1,
  kind: 'CHARACTER_TRUTH_RECONCILIATION_REPORT',
  canonicalAuthority: false,
  promotionPolicy: 'MANUAL_SOURCE_VALIDATION_REQUIRED',
  providers,
  roster: {
    total: CHARACTER_CATALOG.length,
    releaseStatus: countBy(CHARACTER_CATALOG.map(character => character.releaseStatus)),
    freshnessSensitive: CHARACTER_CATALOG.filter(character => character.releaseStatus !== 'RELEASED').map(character => character.id),
  },
  sourceCoverage: {
    prydwenKit: countBy(kitCoverage.map(row => row.captureStatus)),
    prydwenProgression: countBy(progressionCoverage.map(row => row.prydwen)),
    wutheringGg: countBy(progressionCoverage.map(row => row.wutheringGg)),
    completeSixSequenceCharacters: kitCoverage.filter(row => row.sequenceCount === 6).length,
    completeLevel10SkillTables: kitCoverage.reduce((sum,row) => sum + row.level10SkillKeys.length,0),
  },
  evidence: {
    factCount: facts.length,
    stateCounts: countBy(reconciliation.map(row => row.evidenceState)),
    conflictRows: reconciliation.filter(row => row.evidenceState === 'PROVIDER_CONFLICT').map(row => ({
      characterId: row.bellibingCharacterId, family: row.family, factId: row.factId,
      providers: row.providerFacts.map(f => ({providerId:f.providerId,value:f.value,sourceRef:f.sourceRef})),
    })),
  },
  canonicalDelta: {
    stateCounts: countBy(canonicalDeltas.map(row => row.state)),
    rows: canonicalDeltas,
  },
  kitCoverage,
  progressionCoverage,
  reconciliation,
};
mkdirSync(dirname('data/factory/character-truth/character-truth-reconciliation.json'),{recursive:true});
writeFileSync('data/factory/character-truth/character-truth-reconciliation.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({
  roster: output.roster,
  sourceCoverage: output.sourceCoverage,
  evidence: {factCount: output.evidence.factCount,stateCounts: output.evidence.stateCounts,conflicts: output.evidence.conflictRows.length},
  canonicalDelta: output.canonicalDelta.stateCounts,
},null,2));
