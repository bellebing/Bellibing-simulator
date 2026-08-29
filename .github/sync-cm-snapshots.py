from pathlib import Path
import re

FILES = [
    'test/aaltoCharacterMechanics.test.ts',
    'test/aemeathCharacterMechanics.test.ts',
    'test/baizhiCharacterMechanics.test.ts',
    'test/brantCharacterMechanics.test.ts',
    'test/characterMechanicsAuditHardening.test.ts',
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
    'test/twelfthBatchCharacterMechanics.test.ts',
]

UNSTARTED = """assert.deepEqual(audit.unstartedCharacterIds, [
    'buling',
    'danjin',
    'rover-electro',
    'suisui',
    'xiangli-yao',
  ]);"""

changed = []
for filename in FILES:
    path = Path(filename)
    text = path.read_text()
    original = text

    text = text.replace('assert.equal(audit.profileCount, 48);', 'assert.equal(audit.profileCount, 52);')
    text = text.replace('assert.equal(audit.verifiedCharacterIds.length, 48);', 'assert.equal(audit.verifiedCharacterIds.length, 52);')
    text = text.replace('assert.equal(audit.unstartedCharacterIds.length, 9);', 'assert.equal(audit.unstartedCharacterIds.length, 5);')
    text = text.replace('assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1623);', 'assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1787);')

    # These old exact verified-ID lists were duplicated global-current snapshots,
    # not the local batch invariant. Keep the global gate strong through the
    # measured count plus exact remaining blocker set, rather than copying 52 IDs
    # into every historical batch regression.
    text = re.sub(
        r"assert\.deepEqual\(audit\.verifiedCharacterIds, \[.*?\n\s*\]\);",
        'assert.equal(audit.verifiedCharacterIds.length, 52);',
        text,
        flags=re.S,
    )
    text = re.sub(
        r"assert\.deepEqual\(audit\.unstartedCharacterIds, \[.*?\n\s*\]\);",
        UNSTARTED,
        text,
        flags=re.S,
    )

    title_replacements = {
        'forty-eight source-complete characters with 9 released characters unstarted': 'fifty-two source-complete characters with 5 released characters unstarted',
        'forty-eight source-complete characters with 9 unstarted': 'fifty-two source-complete characters with 5 unstarted',
        '48 verified / 9 unstarted / 1623 facts': '52 verified / 5 unstarted / 1787 facts',
        '48 source-complete characters': '52 source-complete characters',
    }
    for old, new in title_replacements.items():
        text = text.replace(old, new)

    if text == original:
        raise SystemExit(f'Expected stale current-roster snapshot not found in {filename}')
    path.write_text(text)
    changed.append(filename)

print(f'Updated {len(changed)} current-roster snapshot regressions to 52/0/5/1787.')
