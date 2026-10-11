import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';

// This extracts evidence, never assigns canonical verification/readiness.
const repository = 'Arikatsu/WutheringWaves_Data';
const commit = '9218d612ad815e398e064e577e42aaf878899968';
const sources = {
  roles: ['BinData/role/roleinfo.json', '85699a49aa28fe566343d47e7db26c86d8b03c5ab9e3ec07c250e6475b9eba22'],
  properties: ['BinData/property/baseproperty.json', '6bfedeb74243217b73d90928884c413226dda8c9768c3bc22dbec77d5413d9a3'],
  propertyIndex: ['BinData/property/propertyindex.json', '0a624ff17d390cecba0437984f36421a7b841f73a8468d74d4f3ec658820b070'],
  growth: ['BinData/property/rolepropertygrowth.json', 'b7e5c7b8acecd17c26d573cabc18542c035c5d6d7cbc45f905e3552ca7df7554'],
  tree: ['BinData/skillTree/skilltree.json', '1fbf0da2038f082e989fcbb6ae775ad835eb74eb4cc28b09fe628932e3ebda20'],
  skills: ['BinData/skill/skill.json', 'a4cb40f9b6f1de9254cc843a57739b7b5f18c39262d8284f62ae0dd0d5f72228'],
  descriptions: ['BinData/skill/skilldescription.json', '94b2a2144912a51fff462c52c45661e865082dd968e6dfdfe9c6104b9c11468f'],
  levels: ['BinData/skill/skilllevel.json', '5528c5ab569a8b700e5326928c3cddb1bad0ed38aa87a555c99dee4ac823ba4d'],
  chains: ['BinData/resonate_chain/resonantchain.json', 'f778764633e4aa8da783acbb90bd95849b9cb6ce4795448ec877813b22c09098'],
  damage: ['BinData/damage/damage.json', 'fbec3c8cae8caa4dfc352dd730929ecd9eac9db7b5bcede99871762a7b0c4b7c'],
  text: ['Textmaps/en/multi_text/MultiText.json', 'b8871035a7a3c9c8e0ca2d6884447b363e2c68e6e41cc6f1274ba655dd62fcf2'],
};
const sourceDir = process.argv.find(a => a.startsWith('--source-dir='))?.split('=')[1];
const inputs = {}, provenance = {};
for (const [key, [path, sha256]] of Object.entries(sources)) {
  const url = `https://raw.githubusercontent.com/${repository}/${commit}/${path}`;
  const bytes = sourceDir
    ? readFileSync(`${sourceDir}/${path.split('/').at(-1)}`)
    : Buffer.from(await (await fetch(url).then(r => { if (!r.ok) throw Error(`${r.status}: ${url}`); return r; })).arrayBuffer());
  if (createHash('sha256').update(bytes).digest('hex') !== sha256) throw Error(`Source hash mismatch: ${path}`);
  inputs[key] = JSON.parse(bytes);
  provenance[key] = { repository, commit, path, url, sha256 };
}
const manifest = JSON.parse(readFileSync('docs/ui-prototypes/assets/builder-icons/manifest.json', 'utf8'));
const ids = new Map(manifest.characters.map(c => [c.characterId, c.sourceId]));
// Official Hsin identity / source role 1311 is not yet in the UI icon manifest.
ids.set('hsin', 1311);
const text = new Map(inputs.text.map(r => [r.Id, r.Content]));
const requireRow = (rows, id, field = 'Id') => {
  const found = rows.filter(r => r[field] === id);
  if (found.length !== 1) throw Error(`Expected one source ${field}=${id}, got ${found.length}`);
  return found[0];
};
const pick = (row, keys) => Object.fromEntries(keys.map(key => [key, row[key]]));
const characters = CHARACTER_CATALOG.filter(c => c.releaseStatus === 'RELEASED').map(c => {
  const sourceId = ids.get(c.id);
  const role = requireRow(inputs.roles, sourceId);
  const baseProperty = requireRow(inputs.properties, role.PropertyId);
  const tree = inputs.tree.filter(n => n.NodeGroup === role.SkillTreeGroupId);
  const skills = inputs.skills.filter(s => s.SkillGroupId === role.SkillId).map(skill => ({
    source: pick(skill, ['Id', 'SkillGroupId', 'SkillType', 'SkillName', 'SkillLevelGroupId', 'MaxSkillLevel', 'DamageList', 'SortIndex', 'SkillDescribe', 'SkillDetailNum']),
    name: text.get(skill.SkillName) ?? null,
    descriptionTemplate: text.get(skill.SkillDescribe) ?? null,
    values: inputs.descriptions.filter(d => d.SkillLevelGroupId === skill.SkillLevelGroupId)
      .sort((a, b) => a.Order - b.Order || a.Id - b.Id)
      .map(source => ({ source, name: text.get(source.AttributeName) ?? null })),
    levels: inputs.levels.filter(l => l.SkillLevelGroupId === skill.SkillLevelGroupId)
      .map(l => pick(l, ['Id', 'SkillLevelGroupId', 'SkillId', 'LevelNewDescribe'])),
  }));
  const chains = inputs.chains.filter(n => n.GroupId === role.ResonantChainGroupId)
    .sort((a, b) => a.GroupIndex - b.GroupIndex).map(source => ({
      source, name: text.get(source.NodeName) ?? null,
      descriptionTemplate: text.get(source.AttributesDescription) ?? null,
    }));
  const damageIds = new Set(skills.flatMap(s => s.source.DamageList));
  if (chains.length !== 6 || tree.filter(n => n.NodeType === 4).length !== 8) throw Error(`Incomplete source tree/chains: ${c.id}`);
  return {
    characterId: c.id, sourceId, sourceName: text.get(role.Name) ?? null,
    role: pick(role, ['Id', 'Name', 'QualityId', 'PropertyId', 'ElementId', 'WeaponType', 'MaxLevel', 'SkillId', 'SkillTreeGroupId', 'ResonantChainGroupId', 'SkillBranchIds']),
    baseProperty: pick(baseProperty, ['Id', 'Lv', 'LifeMax', 'Atk', 'Def', 'EnergyMax', 'Energy', 'ElementEnergyMax', 'Crit', 'CritDamage', 'EnergyEfficiency']),
    tree,
    treeText: Object.fromEntries(tree.flatMap(n => [n.PropertyNodeTitle, n.PropertyNodeDescribe]).filter(Boolean).map(k => [k, text.get(k) ?? null])),
    skills, chains,
    // Runtime rows are retained only for the two new kits and three disputed mechanics.
    damage: ['hsin', 'jingran', 'buling', 'danjin', 'xiangli-yao'].includes(c.id)
      ? inputs.damage.filter(d => damageIds.has(d.Id)).map(d => pick(d, ['Id', 'CalculateType', 'Type', 'SubType', 'Element', 'RelatedProperty', 'RateLv', 'FormulaType', 'FormulaParam1', 'FormulaParam2']))
      : [],
  };
});
const payload = {
  schemaVersion: 1, role: 'character-release.source-evidence',
  canonicalAuthority: false, promotionPolicy: 'EXPLICIT_FIELD_REVIEW_REQUIRED',
  gameVersion: '3.7.0', resourceVersion: '3.7.8', reviewedAt: '2026-10-11', provenance,
  level90Growth: requireRow(inputs.growth, 96),
  propertyIndex: inputs.propertyIndex.filter(p => ['EnergyMax', 'Energy', 'EnergyEfficiency', 'ElementEnergyMax', 'Crit', 'CritDamage'].includes(p.Key)),
  characters,
};
const output = JSON.stringify(payload, null, 2) + '\n';
const path = 'data/source/character-release-3.7.json';
if (process.argv.includes('--check')) {
  if (readFileSync(path, 'utf8') !== output) throw Error('Released Character source capture drifted');
} else writeFileSync(path, output);
console.log(`Captured ${characters.length} released identities with source trees, skills, level rows and six chains each.`);
