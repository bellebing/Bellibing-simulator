from pathlib import Path
import re


def expect_once(text: str, old: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one occurrence, found {count}')
    return text


test_path = Path('test/characterMechanics.test.ts')
text = test_path.read_text()
old = 'assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1623);'
expect_once(text, old, 'fact count')
text = text.replace(old, 'assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1787);', 1)
start = "test('mechanics coverage reports forty-eight released characters source-complete', () => {"
end = "test('VERIFIED mechanics coverage requires linked source-verified supporting facts', () => {"
expect_once(text, start, 'coverage test start')
expect_once(text, end, 'coverage test end')
before, rest = text.split(start, 1)
_, after = rest.split(end, 1)
replacement = """test('mechanics coverage reports fifty-two released characters source-complete', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 52);
  assert.equal(audit.verifiedCharacterIds.length, 52);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.deepEqual(audit.unstartedCharacterIds, [
    'buling',
    'danjin',
    'rover-electro',
    'suisui',
    'xiangli-yao',
  ]);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1787);
  assert.deepEqual(audit.structuralIssues, []);
});

"""
test_path.write_text(before + replacement + end + after)

final_test = Path('test/finalFourCharacterMechanics.test.ts')
text = final_test.read_text()
anchor = '  assert.deepEqual(audit.structuralIssues, []);\n  assert.equal(audit.verifiedCharacterIds.length, 52);'
expect_once(text, anchor, 'final-four fact count')
final_test.write_text(text.replace(anchor, '  assert.deepEqual(audit.structuralIssues, []);\n  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1787);\n  assert.equal(audit.verifiedCharacterIds.length, 52);', 1))

status_path = Path('docs/PROJECT_STATUS.md')
text = status_path.read_text()
heading = '\n\nCurrent Character mechanics coverage:'
expect_once(text, heading, 'current coverage heading')
pr82 = """PR #82 extends the raw Character damage taxonomy with source-facing `HACK`, `SPECTRO_FRAZZLE` and simultaneous `damageClasses` for hits whose current source explicitly belongs to more than one taxonomy. Single-class consumers use a fail-closed boundary instead of choosing or inventing a primary class; this is source-facing data only and does not implement Hack/Spectro Frazzle combat formulas or broad DPS. After independent source/semantic review, Lucy, Rebecca, Zani and Luuk Herssen are canonically promoted. Lucy/Rebecca preserve explicit Hack damage, Zani preserves simultaneous Heavy Attack + Spectro Frazzle semantics plus Spectro Frazzle Outro damage, and Luuk Herssen preserves literal fixed Ichor Blade damage separately from his source-fixed Outro. Generated PR #66/#68 artifacts remain transcription/numeric inputs, never automatic VERIFIED truth."""
text = text.replace(heading, '\n\n' + pr82 + heading, 1)

replacements = {
    '- 48 characters have fully `VERIFIED` mechanics profiles;': '- 52 characters have fully `VERIFIED` mechanics profiles;',
    '- 9 released characters remain `UNSTARTED` for canonical Character mechanics promotion/source verification;': """- **Lucy: `VERIFIED` raw mechanics coverage** across all six required areas, with Hack Response Data Crash/Cripple Movement preserved as source-facing `HACK`, Thread Shredding kept as Heavy Attack DMG, current Data Crash Tune Break semantics, Inherents, Outro and S1-S6;
- **Rebecca: `VERIFIED` raw mechanics coverage** across all six required areas, with Hack Response Meltdown preserved as `HACK`, Heavy Attack Huntress explicitly Basic Attack DMG while Eat Lead!: Huntress remains Heavy Attack DMG, source-fixed Preem Choom turret hits, current Hack - Meltdown Tune Break semantics, Inherents and S1-S6;
- **Zani: `VERIFIED` raw mechanics coverage** across all six required areas, with Inferno Heavy Slash hits preserving simultaneous Heavy Attack + Spectro Frazzle taxonomy via `damageClasses`, Beacon For the Future preserved as source-fixed Spectro Frazzle DMG, current Tune Break: Gauntlets, Inherents and S1-S6;
- **Luuk Herssen: `VERIFIED` raw mechanics coverage** across all six required areas, with Ichor Blade preserved as literal fixed Spectro damage considered Basic Attack DMG rather than a fabricated ATK coefficient, source-fixed Bow to the Last Light Outro, current Silent Debate of Light Tune Break semantics, Inherents and S1-S6;
- 5 released characters remain `UNSTARTED` for canonical Character mechanics promotion/source verification;""",
    '- 1623 canonical Character mechanic facts now exist across the 48 verified profiles, including exactly one current Tune Break fact per verified profile;': '- 1787 canonical Character mechanic facts now exist across the 52 verified profiles, including exactly one current Tune Break fact per verified profile;',
    '- all 48 verified profiles pass the Character Mechanics structural/source audit. Qingxiao remains independently blocked in full `RAW_FACTS` by the registered static `maxEnergy` / `IDENTITY_LEVEL90` pending exception, and Mornye remains independently blocked by the existing static DEF pending gap; neither static gap invalidates Character Mechanics verification. Build/team/rotation/combat-profile requirements continue to gate later stages.': '- all 52 verified profiles pass the Character Mechanics structural/source audit. Qingxiao remains independently blocked in full `RAW_FACTS` by the registered static `maxEnergy` / `IDENTITY_LEVEL90` pending exception, and Mornye remains independently blocked by the existing static DEF pending gap; neither static gap invalidates Character Mechanics verification. Build/team/rotation/combat-profile requirements continue to gate later stages.',
    '- `ECHO` and `TUNE_RUPTURE` are source-facing Character damage classes only; they preserve raw kit truth without implying Echo/Sonata ownership, Tune Rupture combat formulas, rotations or DPS execution support;': '- `ECHO`, `TUNE_RUPTURE`, `AERO_EROSION`, `HACK` and `SPECTRO_FRAZZLE` are source-facing Character damage classes only; simultaneous `damageClasses` preserves explicitly multi-class source truth, while single-class consumers fail closed instead of coercing it. None of these taxonomy entries implies missing combat formulas, rotations or broad DPS execution support;',
    '- Zani remains unpromoted because current source semantics combine Heavy Attack and Spectro Frazzle damage meaning for Inferno actions and Spectro Frazzle DMG on Outro; the current single `damageClass` field cannot represent that truthfully;': '- Zani is source-verified in PR #82 after the source-facing schema gained simultaneous `damageClasses`; Inferno Heavy Slash facts retain Heavy Attack + Spectro Frazzle together and single-class consumers reject them rather than choosing one;',
    '- Rebecca and Lucy remain unpromoted where current source semantics require Hack damage classification that the current Character damage-class schema cannot represent truthfully;': '- Rebecca and Lucy are source-verified in PR #82 with explicit source-facing `HACK` classification rather than coercion into an older damage bucket;',
    '- Luuk Herssen remains unpromoted pending full semantic re-audit; PR #81 now provides a truthful fixed-flat raw representation, but schema availability alone does not verify his profile;': '- Luuk Herssen is source-verified in PR #82 after full semantic re-audit; Ichor Blade remains literal fixed Character damage with Basic Attack DMG taxonomy and no fabricated coefficient/cadence execution;',
    '- audit and promote source-backed skill/Forte/passive/resource/Outro/sequence semantics for the remaining 14 released characters using the promotion-review artifacts rather than hand-entering source tables or description numerics;': '- resolve and promote only the remaining 5 released Character Mechanics blockers when current-source evidence or import repair is sufficient; do not normalize contradictions merely to reach 57/57;',
    '**Important:** forty-three `VERIFIED` Character Mechanics profiles do not make the roster complete. The Character mechanics layer remains an explicit Pre-DPS blocker until required released-roster coverage is actually closed. PR #66/#68 remove current tabular and description-numeric transcription debt; the remaining work is semantic/source review and canonical promotion, not copying source numerics by hand.': '**Important:** fifty-two `VERIFIED` Character Mechanics profiles do not make the roster complete. Five profiles remain explicit blockers, so the Character mechanics layer remains an active Pre-DPS gate. PR #66/#68 remove tabular and description-numeric transcription debt; the remaining work is blocker resolution/source repair, not copying source numerics by hand.',
}
for old, new in replacements.items():
    expect_once(text, old, old[:70])
    text = text.replace(old, new, 1)

item5 = re.compile(r"5\. \*\*IN PROGRESS — PR #38/#39/#40/#41/#54/#55/#56/#57/#58/#60/#61/#63/#65/#66/#68/#69/#70/#71/#72/#73/#74/#75/#77/#78/#79/#80/#81:\*\*.*?\n6\. \*\*SOURCE COVERAGE DONE", re.S)
new5 = """5. **IN PROGRESS — PR #38/#39/#40/#41/#54/#55/#56/#57/#58/#60/#61/#63/#65/#66/#68/#69/#70/#71/#72/#73/#74/#75/#77/#78/#79/#80/#81/#82:** Character static/core + intrinsic gates, generic mechanics architecture, fact-backed source-completeness gates, source-fixed coefficient/flat-damage support, roster-wide candidate/description automation and raw source-facing ECHO/TUNE_RUPTURE/AERO_EROSION/HACK/SPECTRO_FRAZZLE taxonomy are in place. Current measured Character Mechanics coverage is 52 VERIFIED / 0 PARTIAL / 5 UNSTARTED / 1787 canonical facts with zero structural issues. The five unresolved profiles are Buling (Five Thunders Spell Array damage-bonus bucket not explicitly current-source confirmed), Danjin (Ruby Blossom max-120 versus full-power wording conflict), Rover (Electro) (corrupted/misaligned PR #66/#68 review slice plus conflicting reconstruction sources), Suisui (identity/nomenclature plus Tune Break Gauntlets/Rectifier conflict), and Xiangli Yao (Pivot-Impale damage bucket not explicitly current-source confirmed). Qingxiao static Max Energy and Mornye static DEF remain separate pending gaps outside mechanics verification. **Roster-wide Character Mechanics remains an active Pre-DPS gate until these five are truthfully resolved or explicitly handled by the project gate.**
6. **SOURCE COVERAGE DONE"""
text, count = item5.subn(new5, text, count=1)
if count != 1:
    raise SystemExit(f'order item 5 anchor drifted: {count}')

item7 = re.compile(r"7\. \*\*CURRENT RETURN CHECKPOINT:\*\*.*?\n8\. Complete current Echo/Sonata raw audit\.", re.S)
new7 = """7. **CURRENT RETURN CHECKPOINT:** Character Mechanics is 52 VERIFIED / 0 PARTIAL / 5 UNSTARTED / 1787 canonical facts after the PR #82 final-four promotion. Re-review only the five explicit blockers — Buling, Danjin, Rover (Electro), Suisui and Xiangli Yao — using current-source research/import repair where possible, and leave unresolved contradictions pending. Do not begin broad Character DPS, Echo/Sonata, UI or Roll/Stop optimization while this gate remains open.
8. Complete current Echo/Sonata raw audit."""
text, count = item7.subn(new7, text, count=1)
if count != 1:
    raise SystemExit(f'order item 7 anchor drifted: {count}')

status_path.write_text(text)
