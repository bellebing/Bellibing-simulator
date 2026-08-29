from pathlib import Path

path = Path('docs/PROJECT_STATUS.md')
text = path.read_text()

assert 'PR #80 source-audits and canonically promotes Sanhua' not in text
marker = '\n\nCurrent Character mechanics coverage:'
assert text.count(marker) == 1
pr80 = """

PR #80 source-audits and canonically promotes Sanhua, Qiuyuan, Sigrika, Phrolova and Mornye after resolving five previously explicit Character Mechanics blockers. The raw Character damage taxonomy now includes source-facing `ECHO` and `TUNE_RUPTURE` classes so verified source facts are not coerced into `OTHER`; this is a raw-data classification extension only and does not implement Echo/Sonata systems, Tune Rupture combat math, rotations or broad DPS. Sanhua uses the current 10-second S2 consensus while retaining the pinned 5-second artifact value as stale provenance. Qiuyuan preserves Echo Skill versus Heavy Attack damage-bucket boundaries and source-fixed Outro damage. Sigrika preserves explicit Echo Skill damage separately from ordinary attack buckets. Phrolova keeps Hecate damage as Echo Skill DMG, Scarlet Coda's Heavy ownership separate from its Skill damage bucket, and Aftersound's multiplier as `PENDING_INTERPRETATION` rather than fabricated standalone damage. Mornye keeps Particle Jet as Tune Rupture DMG scaling on Tune AMP while Syntony Field remains Resonance Liberation DMG; her independent static DEF gap remains pending outside Character Mechanics.
"""
text = text.replace(marker, pr80 + marker)

replacements = {
    '- 38 characters have fully `VERIFIED` mechanics profiles;': '- 43 characters have fully `VERIFIED` mechanics profiles;',
    '- 19 released characters remain `UNSTARTED` for canonical Character mechanics promotion/source verification;': '- 14 released characters remain `UNSTARTED` for canonical Character mechanics promotion/source verification;',
    '- 1261 canonical Character mechanic facts now exist across the 38 verified profiles, including exactly one current Tune Break fact per verified profile;': '- 1420 canonical Character mechanic facts now exist across the 43 verified profiles, including exactly one current Tune Break fact per verified profile;',
    "- all 38 verified profiles pass the Character Mechanics structural/source audit; 37 currently pass the full `RAW_FACTS` preflight, while Qingxiao remains correctly blocked there only by the independent registered static `maxEnergy` / `IDENTITY_LEVEL90` pending exception. Build/team/rotation/combat-profile requirements continue to gate later stages.": "- all 43 verified profiles pass the Character Mechanics structural/source audit. Qingxiao remains independently blocked in full `RAW_FACTS` by the registered static `maxEnergy` / `IDENTITY_LEVEL90` pending exception, and Mornye remains independently blocked by the existing static DEF pending gap; neither static gap invalidates Character Mechanics verification. Build/team/rotation/combat-profile requirements continue to gate later stages.",
    '- audit and promote source-backed skill/Forte/passive/resource/Outro/sequence semantics for the remaining 19 released characters using the promotion-review artifacts rather than hand-entering source tables or description numerics;': '- audit and promote source-backed skill/Forte/passive/resource/Outro/sequence semantics for the remaining 14 released characters using the promotion-review artifacts rather than hand-entering source tables or description numerics;',
    '**Important:** thirty-eight `VERIFIED` Character Mechanics profiles do not make the roster complete.': '**Important:** forty-three `VERIFIED` Character Mechanics profiles do not make the roster complete.',
}
for old, new in replacements.items():
    assert text.count(old) == 1, old
    text = text.replace(old, new)

remaining_marker = '- 14 released characters remain `UNSTARTED` for canonical Character mechanics promotion/source verification;'
assert text.count(remaining_marker) == 1
profile_bullets = """- **Sanhua: `VERIFIED` raw mechanics coverage** across all six required areas, with source-preserved Basic/Heavy/Skill/Liberation damage buckets, Clarity/Forte state semantics, current S2 anti-interruption duration at 10 seconds with the pinned 5-second value retained only as stale provenance, Inherents, Outro, S1-S6 and Tune Break: Sword;
- **Qiuyuan: `VERIFIED` raw mechanics coverage** across all six required areas, with source-facing Echo Skill DMG kept as `ECHO`, Inksplash enhanced attacks preserved as Heavy Attack DMG despite Echo-skill cast identity, Swordster's Soliloquy state semantics, source-fixed Outro, Inherents, S1-S6 and Tune Break: Sword;
- **Sigrika: `VERIFIED` raw mechanics coverage** across all six required areas, with source-facing Echo Skill DMG kept distinct from ordinary Basic/Heavy/Skill buckets, Rune/Full Stop/Soliskin Vitality/Innate Gift resources, source-fixed Outro, Inherents, S1-S6 and Tune Break: Gauntlets;
- **Phrolova: `VERIFIED` raw mechanics coverage** across all six required areas, with Hecate damage classified as source-facing Echo Skill DMG, Scarlet Coda ownership kept separate from its Resonance Skill DMG bucket, Aftersound multiplier retained as `PENDING_INTERPRETATION`, Inherents, Outro, S1-S6 and Tune Break: Rectifier;
- **Mornye: `VERIFIED` raw mechanics coverage** across all six required areas, with Particle Jet classified as source-facing Tune Rupture DMG scaling on Tune AMP, Syntony Field kept as Resonance Liberation DMG, utility healing outside Character damage fields, Inherents, Outro, S1-S6 and Decoupling Tune Break. Her separate static DEF gap remains pending and still blocks full `RAW_FACTS` readiness;
"""
text = text.replace(remaining_marker, profile_bullets + remaining_marker)

old_sanhua = '- Sanhua S2 remains explicitly pending where current sources conflict between 5s and 10s duration;\n'
assert text.count(old_sanhua) == 1
text = text.replace(old_sanhua, '')

old_echo = '- Qiuyuan, Cantarella, Cartethyia, Lucilla and Galbrena remain unpromoted where current sources explicitly classify Character-owned kit damage as Echo Skill DMG while the current Character Mechanics damage-class schema has no truthful `ECHO` bucket; Bellibing will not coerce those source facts into `OTHER` merely to advance coverage;\n'
new_echo = '- Cantarella, Cartethyia, Lucilla and Galbrena remain unpromoted pending independent source/semantic re-audit under the new raw `ECHO` taxonomy; a source-facing schema extension does not auto-promote profiles whose remaining action/state semantics have not been re-verified;\n'
assert text.count(old_echo) == 1
text = text.replace(old_echo, new_echo)

old_mornye = '- Mornye remains unpromoted because Particle Jet is explicitly Tune Rupture DMG while the current Character Mechanics damage-class schema has no truthful `TUNE_RUPTURE` bucket;\n'
assert text.count(old_mornye) == 1
text = text.replace(old_mornye, '')

old_echo_more = '- Phrolova and Sigrika remain unpromoted because current sources explicitly assign Character-owned kit damage to Echo Skill DMG and the current Character damage-class schema has no truthful `ECHO` bucket;\n'
assert text.count(old_echo_more) == 1
text = text.replace(old_echo_more, '')

old_lynae = '- Lynae remains unpromoted because Spectral Analysis is explicitly Tune Rupture DMG while the current Character damage-class schema has no truthful `TUNE_RUPTURE` bucket;\n'
new_lynae = '- Lynae remains unpromoted pending her own source/semantic re-audit under the new raw `TUNE_RUPTURE` taxonomy; schema support alone is not treated as verified profile coverage;\n'
assert text.count(old_lynae) == 1
text = text.replace(old_lynae, new_lynae)

# Raw taxonomy boundary must be explicit in the source-boundary section.
tax_anchor = '- source coefficients are stored as exact Lv1-Lv10 representations without silently choosing a talent level;\n'
assert text.count(tax_anchor) == 1
text = text.replace(tax_anchor, tax_anchor + '- `ECHO` and `TUNE_RUPTURE` are source-facing Character damage classes only; they preserve raw kit truth without implying Echo/Sonata ownership, Tune Rupture combat formulas, rotations or DPS execution support;\n')

lines = text.splitlines()
replaced5 = replaced7 = False
for i, line in enumerate(lines):
    if line.startswith('5. **IN PROGRESS'):
        lines[i] = "5. **IN PROGRESS — PR #38/#39/#40/#41/#54/#55/#56/#57/#58/#60/#61/#63/#65/#66/#68/#69/#70/#71/#72/#73/#74/#75/#77/#78/#79/#80:** Character static/core + intrinsic gates, generic mechanics architecture, fact-backed source-completeness gates, source-fixed damage support, roster-wide candidate/description automation, raw ECHO/TUNE_RUPTURE taxonomy and controlled semantic promotions are in place. Current Character Mechanics coverage is 43 VERIFIED / 0 PARTIAL / 14 UNSTARTED / 1420 canonical facts. Qingxiao's static Max Energy and Mornye's static DEF pending gaps remain explicit outside mechanics verification. The current 57-character source snapshot has zero unstructured tabular rows and zero raw description parameters; remaining work is semantic/source review and blocker resolution. **Roster-wide Character mechanics fact coverage remains the active Pre-DPS blocker.**"
        replaced5 = True
    if line.startswith('7. **CURRENT RETURN CHECKPOINT:**'):
        lines[i] = "7. **CURRENT RETURN CHECKPOINT:** Continue the remaining 14 Character Mechanics profiles from the PR #66/#68 review artifacts and current sources. Do not auto-promote Cantarella/Cartethyia/Lucilla/Galbrena/Lynae merely because raw ECHO/TUNE_RUPTURE taxonomy now exists; re-audit their full action/state semantics. Keep Danjin, Xiangli Yao, Zani, Buling, Rebecca/Lucy, Luuk Herssen, Rover (Electro) and Suisui explicitly pending until their source/schema/import blockers are truthfully resolved. Do not begin broad Character DPS, Echo/Sonata, UI or Roll/Stop optimization while released-roster Character Mechanics coverage remains open."
        replaced7 = True
assert replaced5 and replaced7

text = '\n'.join(lines) + '\n'

# Fail closed on stale current-state claims that this PR resolves.
assert '38 characters have fully `VERIFIED` mechanics profiles' not in text
assert '19 released characters remain `UNSTARTED`' not in text
assert '1261 canonical Character mechanic facts now exist across the 38' not in text
assert 'Sanhua S2 remains explicitly pending' not in text
assert 'Phrolova and Sigrika remain unpromoted' not in text
assert 'Mornye remains unpromoted because Particle Jet' not in text
assert 'schema has no truthful `ECHO` bucket' not in text
assert 'schema has no truthful `TUNE_RUPTURE` bucket' not in text

path.write_text(text)
print('PROJECT_STATUS synced for PR #80: 43/14/1420 with raw taxonomy boundary and remaining blockers')
