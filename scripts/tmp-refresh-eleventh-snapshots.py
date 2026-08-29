from pathlib import Path
import re

ALLOW = {
    'test/aaltoCharacterMechanics.test.ts',
    'test/aemeathCharacterMechanics.test.ts',
    'test/baizhiCharacterMechanics.test.ts',
    'test/brantCharacterMechanics.test.ts',
    'test/characterMechanics.test.ts',
    'test/characterMechanicsAuditHardening.test.ts',
    'test/eighthBatchCharacterMechanics.test.ts',
    'test/fifthBatchCharacterMechanics.test.ts',
    'test/fourthBatchCharacterMechanics.test.ts',
    'test/ninthBatchCharacterMechanics.test.ts',
    'test/secondBatchCharacterMechanics.test.ts',
    'test/seventhBatchCharacterMechanics.test.ts',
    'test/sixthBatchCharacterMechanics.test.ts',
    'test/starterRosterCharacterMechanics.test.ts',
    'test/tenthBatchCharacterMechanics.test.ts',
    'test/thirdBatchCharacterMechanics.test.ts',
}

OLD_IDS = [
    'aalto', 'aemeath', 'augusta', 'baizhi', 'brant', 'calcharo', 'camellya', 'carlotta',
    'changli', 'chisa', 'chixia', 'ciaccona', 'denia', 'encore', 'hiyuki', 'iuno', 'jianxin',
    'jinhsi', 'jiyan', 'lingyang', 'lumi', 'lupa', 'mortefi', 'phoebe', 'qingxiao', 'roccia',
    'rover-aero', 'rover-havoc', 'rover-spectro', 'taoqi', 'the-shorekeeper', 'verina',
    'yangyang', 'yangyang-xuanling', 'yinlin', 'youhu', 'yuanwu', 'zhezhi',
]
NEW_IDS = [
    'aalto', 'aemeath', 'augusta', 'baizhi', 'brant', 'calcharo', 'camellya', 'carlotta',
    'changli', 'chisa', 'chixia', 'ciaccona', 'denia', 'encore', 'hiyuki', 'iuno', 'jianxin',
    'jinhsi', 'jiyan', 'lingyang', 'lumi', 'lupa', 'mornye', 'mortefi', 'phoebe', 'phrolova',
    'qingxiao', 'qiuyuan', 'roccia', 'rover-aero', 'rover-havoc', 'rover-spectro', 'sanhua',
    'sigrika', 'taoqi', 'the-shorekeeper', 'verina', 'yangyang', 'yangyang-xuanling', 'yinlin',
    'youhu', 'yuanwu', 'zhezhi',
]

array_re = re.compile(r"\[(?:\s*'[^']+'\s*,?)+\s*\]", re.S)

def replace_exact_id_arrays(text: str) -> tuple[str, int]:
    count = 0
    def repl(match: re.Match[str]) -> str:
        nonlocal count
        block = match.group(0)
        ids = re.findall(r"'([^']+)'", block)
        if ids != OLD_IDS:
            return block
        line_start = text.rfind('\n', 0, match.start()) + 1
        prefix = text[line_start:match.start()]
        base_indent = re.match(r'\s*', prefix).group(0)
        item_indent = base_indent + '  '
        replacement = '[\n' + ''.join(f"{item_indent}'{value}',\n" for value in NEW_IDS) + base_indent + ']'
        count += 1
        return replacement
    return array_re.sub(repl, text), count

# Only current-roster snapshot assertions are eligible. Negative fixtures and historical source data are untouched.
assertion_patterns = [
    (re.compile(r"(assert\.(?:equal|strictEqual)\([^\n,]*(?:profileCount|verifiedCharacterIds\.length)[^\n,]*,\s*)38(\s*[,\)])"), r"\g<1>43\g<2>"),
    (re.compile(r"(assert\.(?:equal|strictEqual)\([^\n,]*unstartedCharacterIds\.length[^\n,]*,\s*)19(\s*[,\)])"), r"\g<1>14\g<2>"),
    (re.compile(r"(assert\.(?:equal|strictEqual)\([^\n,]*(?:CHARACTER_MECHANIC_FACTS\.length|CHARACTER_MECHANIC_FACT_BY_ID\.size)[^\n,]*,\s*)1261(\s*[,\)])"), r"\g<1>1420\g<2>"),
]

changed = []
array_replacements = 0
numeric_replacements = 0
for rel in sorted(ALLOW):
    path = Path(rel)
    assert path.exists(), rel
    before = path.read_text()
    text, arrays = replace_exact_id_arrays(before)
    array_replacements += arrays
    for pattern, replacement in assertion_patterns:
        text, n = pattern.subn(replacement, text)
        numeric_replacements += n

    # Human-readable current-snapshot labels only. Do not rewrite historical source/provenance values.
    text = text.replace('thirty-eight source-complete characters with 19 released characters unstarted', 'forty-three source-complete characters with 14 released characters unstarted')
    text = text.replace('thirty-eight source-complete characters with 24 unstarted', 'forty-three source-complete characters with 14 unstarted')
    text = text.replace('mechanics coverage reports thirty-eight released characters source-complete', 'mechanics coverage reports forty-three released characters source-complete')
    text = text.replace('coverage reaches 38 verified / 19 unstarted / 1261 facts', 'coverage reaches 43 verified / 14 unstarted / 1420 facts')
    text = text.replace('advances canonical coverage to 38 verified / 19 unstarted / 1261 facts', 'remains valid as current coverage reaches 43 verified / 14 unstarted / 1420 facts')

    if text != before:
        path.write_text(text)
        changed.append(rel)

assert set(changed) == ALLOW, f'changed allowlist mismatch: {changed}'
assert array_replacements >= 2, array_replacements
assert numeric_replacements >= 17, numeric_replacements
print(f'updated {len(changed)} stale snapshot files; arrays={array_replacements}; numeric={numeric_replacements}')
