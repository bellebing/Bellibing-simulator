#!/usr/bin/env python3
"""Capture reviewed basic rotations from connected-web line views, never DPS.

Full pages remain external scratch input. Published output contains selected
command order, short manual context summaries and source pins, not guide prose.
"""
import argparse
import hashlib
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
REVIEW = ROOT / 'data/source/prydwen-rotation-review-2026-10-11.json'
OUTPUT = ROOT / 'data/source/prydwen-rotation-references-2026-10-11.json'

def digest(value):
    return hashlib.sha256(value).hexdigest()

def normalize(instruction):
    # Names, stages, repeat counts and conditional commands remain source-owned.
    for before, after in [
        ('Cancel animation endlag via ', 'Endlag cancel: '),
        ('Cancel animation on cast via ', 'On-cast cancel: '),
        ('Instantly interrupt via ', 'Immediate cancel: '),
        ('Cancel animation instantly via ', 'Immediate cancel: '),
        ('Cancel animation endlag on hit via ', 'After-hit endlag cancel: '),
        ('Cancel animation on hit via ', 'After-hit cancel: '),
    ]:
        instruction = instruction.replace(before, after)
    return instruction.strip()

def capture(source_dir):
    review_bytes = REVIEW.read_bytes()
    review = json.loads(review_bytes)
    sections = {}
    for character_id, expected_hash in review['sectionHashes'].items():
        raw = (source_dir / f'{character_id}.txt').read_text()
        lines = sorted({int(n): s for n, s in re.findall(r'(?:^|\n)L(\d+): ([^\n]*)', raw)}.items())
        start = next(n for n, s in lines if s == 'Gameplay and teams')
        end = next(n for n, s in lines if n > start and s == 'Example Teams')
        section = [(n, s) for n, s in lines if start < n < end]
        section_hash = digest('\n'.join(f'L{n}: {s}' for n, s in section).encode())
        if section_hash != expected_hash:
            raise ValueError(f'{character_id}: source section drift requires explicit review')
        sections[character_id] = section
    references = []
    for selection in review['selections']:
        character_id = selection['characterId']
        lines = sections[character_id]
        by_line = dict(lines)
        start, end = selection['sourceRange']
        rotation_end = next(n for n, s in lines if s == 'Synergies')
        chosen = [(n, s) for n, s in lines if start <= n < min(end, rotation_end)]
        heading = next((s.lstrip('#').strip() for n, s in chosen if s.startswith('#')), None)
        if selection.get('explicitSteps'):
            instructions = selection['explicitSteps']
        else:
            instructions = []
            for n, s in chosen:
                if n in selection.get('omitSourceLines', []):
                    continue
                bullet = re.match(r'^\s*\* (.+)', s)
                # These non-bullet team/input instructions belong in the sequence.
                handoff = s.startswith(('—>', '→')) or s.startswith('Complete another rotation of your 2nd character')
                if not bullet and not handoff:
                    continue
                instructions.extend(selection.get('insertBeforeSourceLine', {}).get(str(n), []))
                text = selection.get('instructionOverrides', {}).get(str(n), bullet[1] if bullet else s)
                if selection['phase'] == 'PRIORITY':
                    text = selection.get('priorityOverrides', {}).get(str(n), text)
                instructions.append({'sourceLine': n, 'instruction': text})
        if not instructions:
            raise ValueError(f'{character_id}/{selection["variantKey"]}: no source commands')
        for item in instructions:
            if item['sourceLine'] not in by_line:
                raise ValueError(f'{character_id}: nonexistent reviewed source line')
        adaptation = bool(selection.get('explicitSteps') or selection.get('instructionOverrides') or selection.get('insertBeforeSourceLine') or selection.get('omitSourceLines'))
        priority = selection['phase'] == 'PRIORITY'
        references.append({
            'id': f'prydwen-{character_id}-{selection["variantKey"]}',
            'kind': 'TEAM_AWARE_ROTATION_REFERENCE', 'characterId': character_id,
            'variantKey': selection['variantKey'], 'phase': selection['phase'], 'scope': selection['scope'],
            'executionStatus': 'SOURCE_PRIORITY_ONLY' if priority else 'SOURCE_SEQUENCE_ONLY',
            'sourceReviewStatus': 'REVIEWED_REFERENCE_ONLY',
            'sourceOrderBasis': 'PRIORITY_DISPLAY_ORDER_NOT_TIMELINE' if priority else 'REVIEWED_GUIDE_COMMAND_ORDER',
            'sourceHeading': heading,
            'source': {'provider': 'PRYDWEN', 'url': f'https://www.prydwen.gg/wuthering-waves/characters/{character_id}',
                       'capturedAt': '2026-10-11', 'reviewedAt': review['reviewedAt'], 'sectionSha256': review['sectionHashes'][character_id],
                       'selectedLineRange': [start, end], 'adaptationEvidenceLines': selection.get('adaptationEvidenceLines', []),
                       'reviewKind': 'SOURCE_DESCRIBED_ADAPTATION' if adaptation else 'SOURCE_PRIORITY_GUIDANCE' if priority else 'SOURCE_ORDERED_LIST'},
            'context': {'modeKeys': selection['modeKeys'], 'introAvailability': selection['introAvailability'],
                        'requiredTeamCombinations': selection['requiredTeamCombinations'],
                        'excludedTeamCombinations': selection['excludedTeamCombinations'],
                        'exampleTeams': selection['exampleTeams'], 'conditions': selection['conditions'],
                        'teamSemantics': 'EXPLICIT_SOURCE_CONTEXT_NOT_UNIVERSAL_TEAM_ELIGIBILITY'},
            'steps': [] if priority else [{'order': i + 1, 'instruction': normalize(item['instruction']), 'sourceLine': item['sourceLine']} for i, item in enumerate(instructions)],
            'priorityGuidance': [{'displayOrder': i + 1, 'instruction': normalize(item['instruction']), 'sourceLine': item['sourceLine']} for i, item in enumerate(instructions)] if priority else [],
            'echoTiming': selection['echoTiming'], 'notes': selection['notes'],
        })
    coverage = []
    for character_id, lines in sorted(sections.items()):
        profiles = [r for r in references if r['characterId'] == character_id]
        coverage.append({'characterId': character_id, 'status': 'PRIORITY_GUIDANCE_ONLY' if all(r['phase'] == 'PRIORITY' for r in profiles) else 'BASIC_SOURCE_SEQUENCE_AVAILABLE',
                         'referenceIds': [r['id'] for r in profiles],
                         'reviewedSourceHeadings': [s.lstrip('#').strip() for n, s in lines if s.startswith('######')],
                         'scope': 'BASELINE_AND_NECESSARY_CONTEXT_VARIANTS_NOT_ALL_POSSIBLE_ROTATIONS'})
    return {'schemaVersion': 1, 'role': 'prydwen-rotation.reference-source-evidence', 'canonicalAuthority': False,
            'provider': 'PRYDWEN', 'capturedAt': '2026-10-11', 'reviewArtifact': str(REVIEW.relative_to(ROOT)),
            'reviewSha256': digest(review_bytes), 'promotionPolicy': 'EXPLICIT_REVIEWED_SOURCE_REFERENCE_ONLY',
            'references': references, 'coverage': coverage}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-dir', type=pathlib.Path, required=True)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    output = json.dumps(capture(args.source_dir), ensure_ascii=False, indent=2) + '\n'
    if args.check:
        if OUTPUT.read_text() != output:
            raise ValueError('Reviewed rotation capture generation drift')
    else:
        OUTPUT.write_text(output)
    data = json.loads(output)
    print(json.dumps({'references': len(data['references']), 'characters': len(data['coverage']),
                      'orderedCharacters': sum(r['status'] == 'BASIC_SOURCE_SEQUENCE_AVAILABLE' for r in data['coverage']),
                      'priorityOnlyCharacters': [r['characterId'] for r in data['coverage'] if r['status'] == 'PRIORITY_GUIDANCE_ONLY']}))

if __name__ == '__main__':
    main()
