import { readFile, writeFile } from 'node:fs/promises';

const FILES = [
  'test/aaltoCharacterMechanics.test.ts',
  'test/aemeathCharacterMechanics.test.ts',
  'test/baizhiCharacterMechanics.test.ts',
  'test/brantCharacterMechanics.test.ts',
  'test/characterMechanics.test.ts',
  'test/eighthBatchCharacterMechanics.test.ts',
  'test/eleventhBatchCharacterMechanics.test.ts',
  'test/fifthBatchCharacterMechanics.test.ts',
  'test/fourthBatchCharacterMechanics.test.ts',
  'test/ninthBatchCharacterMechanics.test.ts',
  'test/secondBatchCharacterMechanics.test.ts',
  'test/seventhBatchCharacterMechanics.test.ts',
  'test/sixthBatchCharacterMechanics.test.ts',
  'test/starterRosterCharacterMechanics.test.ts',
  'test/tenthBatchCharacterMechanics.test.ts',
  'test/thirdBatchCharacterMechanics.test.ts',
];

const OLD_VERIFIED = [
  'aalto','aemeath','augusta','baizhi','brant','calcharo','camellya','carlotta','changli','chisa','chixia','ciaccona','denia','encore','hiyuki','iuno','jianxin','jinhsi','jiyan','lingyang','lumi','lupa','mornye','mortefi','phoebe','phrolova','qingxiao','qiuyuan','roccia','rover-aero','rover-havoc','rover-spectro','sanhua','sigrika','taoqi','the-shorekeeper','verina','yangyang','yangyang-xuanling','yinlin','youhu','yuanwu','zhezhi',
];
const NEW_VERIFIED = [
  'aalto','aemeath','augusta','baizhi','brant','calcharo','camellya','cantarella','carlotta','cartethyia','changli','chisa','chixia','ciaccona','denia','encore','galbrena','hiyuki','iuno','jianxin','jinhsi','jiyan','lingyang','lucilla','lumi','lupa','lynae','mornye','mortefi','phoebe','phrolova','qingxiao','qiuyuan','roccia','rover-aero','rover-havoc','rover-spectro','sanhua','sigrika','taoqi','the-shorekeeper','verina','yangyang','yangyang-xuanling','yinlin','youhu','yuanwu','zhezhi',
];
const OLD_UNSTARTED = [
  'buling','cantarella','cartethyia','danjin','galbrena','lucilla','lucy','luuk-herssen','lynae','rebecca','rover-electro','suisui','xiangli-yao','zani',
];
const NEW_UNSTARTED = [
  'buling','danjin','lucy','luuk-herssen','rebecca','rover-electro','suisui','xiangli-yao','zani',
];

function same(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function renderArray(values, indent) {
  const inner = `${indent}  `;
  return `[\n${values.map((value) => `${inner}'${value}',`).join('\n')}\n${indent}]`;
}

function replaceExactRosterArrays(text) {
  return text.replace(/\[(?:\s*['"][a-z0-9-]+['"]\s*,?){9,}\s*\]/g, (block, offset, whole) => {
    const values = [...block.matchAll(/['"]([a-z0-9-]+)['"]/g)].map((match) => match[1]);
    let replacement = null;
    if (same(values, OLD_VERIFIED)) replacement = NEW_VERIFIED;
    if (same(values, OLD_UNSTARTED)) replacement = NEW_UNSTARTED;
    if (!replacement) return block;
    const lineStart = whole.lastIndexOf('\n', offset) + 1;
    const prefix = whole.slice(lineStart, offset);
    const indent = /^\s*/.exec(prefix)?.[0] ?? '';
    return renderArray(replacement, indent);
  });
}

function replaceCounts(text) {
  let out = text;
  out = out.replace(/(assert\.equal\(\s*[\w.]+\.profileCount\s*,\s*)43(\s*\))/g, '$148$2');
  out = out.replace(/(assert\.equal\(\s*[\w.]+\.verifiedCharacterIds\.length\s*,\s*)43(\s*\))/g, '$148$2');
  out = out.replace(/(assert\.equal\(\s*[\w.]+\.unstartedCharacterIds\.length\s*,\s*)14(\s*\))/g, '$19$2');
  out = out.replace(/(assert\.equal\(\s*CHARACTER_MECHANIC_FACT_BY_ID\.size\s*,\s*)1420(\s*\))/g, '$11623$2');
  out = out.replace(/(assert\.equal\(\s*CHARACTER_MECHANIC_FACTS\.length\s*,\s*)1420(\s*\))/g, '$11623$2');
  out = out.replaceAll('43 verified / 14 unstarted / 1420 facts', '48 verified / 9 unstarted / 1623 facts');
  out = out.replaceAll('43 VERIFIED / 14 UNSTARTED / 1420 facts', '48 VERIFIED / 9 UNSTARTED / 1623 facts');
  out = out.replaceAll('43 source-complete characters with 14 released characters unstarted', '48 source-complete characters with 9 released characters unstarted');
  out = out.replaceAll('forty-three source-complete characters with 14 released characters unstarted', 'forty-eight source-complete characters with 9 released characters unstarted');
  out = out.replaceAll('forty-three source-complete characters with 14 unstarted', 'forty-eight source-complete characters with 9 unstarted');
  out = out.replaceAll('forty-three released characters source-complete', 'forty-eight released characters source-complete');
  return out;
}

const changed = [];
for (const path of FILES) {
  const original = await readFile(path, 'utf8');
  let next = replaceExactRosterArrays(original);
  next = replaceCounts(next);
  if (next === original) throw new Error(`Expected snapshot change not found in ${path}`);
  if (/CHARACTER_MECHANIC_FACT_BY_ID\.size\s*,\s*1420/.test(next)) throw new Error(`Stale fact count remains in ${path}`);
  if (/\.profileCount\s*,\s*43/.test(next) || /\.verifiedCharacterIds\.length\s*,\s*43/.test(next)) throw new Error(`Stale verified count remains in ${path}`);
  if (/\.unstartedCharacterIds\.length\s*,\s*14/.test(next)) throw new Error(`Stale unstarted count remains in ${path}`);
  await writeFile(path, next, 'utf8');
  changed.push(path);
}

console.log(`Refreshed ${changed.length} Character Mechanics snapshot files.`);
