#!/usr/bin/env python3
"""Extract ordered recommendation facts from connected-web source-line captures.

Input is a directory of <canonical-character-id>.txt captures, never a second
Character catalog. Long guide prose/rotations are excluded. Names, source order,
percentages, stat wording, linked synergies and short conditions remain evidence.
"""
import argparse, hashlib, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[1]

def clean(s):
    return re.sub(r'【\d+†([^†】]+)(?:†[^】]+)?】', r'\1', s).strip()

def normalized(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

def index(rows):
    return {normalized(r['name']): r['id'] for r in rows}

def extract(raw, character, catalogs):
    source_lines = {int(n): s for n,s in re.findall(r'(?:^|\n)L(\d+): ([^\n]*)', raw)}
    lines = [(n,s) for n,s in sorted(source_lines.items())]
    def section(start, end):
        a = next(i for i,(_,s) in enumerate(lines) if s == start)
        b = next((i for i in range(a+1,len(lines)) if lines[i][1] == end), len(lines))
        return lines[a+1:b]
    by_weapon, by_set, by_echo, by_character = [index(catalogs[k]) for k in ['weapons','sets','echoes','characters']]
    # Source display aliases are explicit; identities/variants never fuzzy-merge.
    by_character.update({'shorekeeper':'the-shorekeeper','roveraero':'rover-aero','roverelectro':'rover-electro','roverhavoc':'rover-havoc','roverspectro':'rover-spectro','luuk':'luuk-herssen','xuanling':'yangyang-xuanling'})
    by_weapon['bloomingjadehaven']='blooming-jadehaven'
    missing = []
    def resolve(name, ids, family):
        found=ids.get(normalized(name))
        if not found: missing.append(f'{family}: {name}')
        return found
    def values(texts, labels=()):
        return [{'sourceColumn':i+1,'sourceText':s,'relativePerformance':float(s[:-1])/100 if s.endswith('%') else None,'contextLabel':labels[i] if i<len(labels) else None} for i,s in enumerate(texts)]
    words_remaining = 145
    def excerpt(s, limit=22):
        nonlocal words_remaining
        words=clean(s).split()
        count=min(limit,words_remaining,len(words))
        if count<=0:return None
        words_remaining-=count
        return ' '.join(words[:count])+('…' if count<len(words) else '')
    build=section('Best Weapons','Best Echo Sets')
    weapons=[]; pending=[]; labels=[]; contexts=[]; current=None
    for i,(n,s) in enumerate(build):
        if re.fullmatch(r'\d+(?:\.\d+)?%',s) or s in ['-','N/A']: pending.append(s);continue
        if s.startswith('#'):
            label=s.lstrip('#').strip();labels.append(label)
            current={'label':label,'teammates':[]};contexts.append(current)
        if not weapons and s.lstrip().startswith('*') and '】 +' in s:
            match=re.search(r'【\d+†([^†】]+)】\s*\+\s*(.*?)\s*\+?$',s)
            if match:
                name=match[1];weapon=match[2].strip(' +')
                if current is None:current={'label':'Source calculation context','teammates':[]};contexts.append(current)
                current['teammates'].append({'characterId':resolve(name,by_character,'character'),'sourceName':name,'weaponId':resolve(weapon,by_weapon,'weapon') if weapon else None,'sourceWeaponName':weapon or None})
        match=re.fullmatch(r'(.+) \(R([1-5])\)',s)
        if match:
            name,refinement=match.groups()
            weapons.append({'sourceOrder':len(weapons)+1,'weaponId':resolve(name,by_weapon,'weapon'),'sourceName':name,'refinement':int(refinement),'performance':values(pending,labels),'sourceLine':n})
            pending=[]
    # Retain every source value, including columns without an observed heading.
    echo_section=section('Best Echo Sets','Best Echo Stats')
    sets=[]; current_set=None; parent=None; category='BEST_ECHO_SETS'; companion=False; pending=[]; piece=None
    for n,s in echo_section:
        if re.fullmatch(r'\d+(?:\.\d+)?%',s):pending.append(s);continue
        if s.startswith('######'):
            category=s.lstrip('#').strip().upper().replace(' ','_');companion=False;piece=None
        if s=='Best combined with your choice of:':companion=True;parent=current_set
        if s.startswith('Below you can find Main Echo options:'):companion=False
        if re.fullmatch(r'\s*\* \dP',s):piece=int(re.search(r'\d',s)[0])
        name=clean(s)
        if normalized(name) in by_set:
            item={'sourceOrder':len(sets)+1,'setId':by_set[normalized(name)],'sourceName':name,'section':category,'usage':'COMPANION_OPTION' if companion else 'PRIMARY','companionToOrder':parent['sourceOrder'] if companion and parent else None,'pieces':piece if companion else None,'performance':values(pending),'mainEchoes':[],'sourceLine':n,'conditionExcerpt':None}
            sets.append(item);pending=[]
            if not companion:current_set=item
        if normalized(name) in by_echo and current_set:
            echoes=current_set['mainEchoes']
            if not any(e['echoId']==by_echo[normalized(name)] for e in echoes):echoes.append({'sourceOrder':len(echoes)+1,'echoId':by_echo[normalized(name)],'sourceName':name,'sourceLine':n})
    # Conditions are evidence, not executable predicates. Preserve a short complete
    # sentence where available; primary sets stay separate from companion choices.
    for item in sets:
        if item['usage']!='PRIMARY':continue
        i=next(i for i,(n,_) in enumerate(echo_section) if n==item['sourceLine'])
        prose=next((s for _,s in echo_section[i+1:] if s and not s.startswith('【') and len(s.split())>10),None)
        if prose: item['conditionExcerpt']=excerpt(re.split(r'(?<=[.!?])\s+',prose)[0],24)
    stats_section=section('Best Echo Stats','Best Endgame Stats (Level 90)')
    main=[];priorities=[]
    for i,(n,s) in enumerate(stats_section):
        match=re.fullmatch(r'([1-4]) cost',s)
        if match:
            text=next((clean(t) for _,t in stats_section[i+1:] if t and not t.startswith('【')),None)
            main.append({'slotOrder':len(main)+1,'cost':int(match[1]),'sourceText':text,'sourceLine':n})
        if re.match(r'^Substats?:',s,re.I):priorities.append({'sourceText':s.split(':',1)[1].strip(),'sourceLine':n})
    endgame=section('Best Endgame Stats (Level 90)','Skill Priority')
    recommended_stats=[]
    for i,(n,s) in enumerate(endgame):
        match=re.match(r'^  \* ([^:]+): (.*)',s)
        if match:
            conditions=[]
            for _,t in endgame[i+1:]:
                if t.startswith('  * '):break
                if t.startswith('    * '):
                    short=excerpt(t[6:],30)
                    if short:conditions.append(short)
            recommended_stats.append({'sourceStatName':match[1],'sourceText':match[2],'conditions':conditions,'sourceLine':n})
    skill_priorities=[]; current_priority=None
    for n,s in section('Skill Priority','Gameplay and teams'):
        if s.startswith('#'):
            current_priority={'contextLabel':s.lstrip('#').strip(),'skills':[]}
            skill_priorities.append(current_priority)
        if s in ['Basic Attack','Res. Skill','Res. Liberation','Forte Circuit','Intro Skill']:
            if current_priority is None:
                current_priority={'contextLabel':None,'skills':[]};skill_priorities.append(current_priority)
            current_priority['skills'].append({'sourceOrder':len(current_priority['skills'])+1,'sourceName':s,'sourceLine':n})
    synergy=section('Synergies','Example Teams')
    groups=[]
    for n,s in synergy:
        if s.lstrip().startswith('*'):
            names=re.findall(r'【\d+†([^†】]+)】',s)
            if names:
                prose=s.split(' - ',1)[1] if ' - ' in s else ''
                groups.append({'displayOrder':len(groups)+1,'characterIds':[resolve(name,by_character,'character') for name in names],'sourceNames':names,'conditionExcerpt':excerpt(re.split(r'(?<=[.!?])\s+',prose)[0],23) if prose else None,'sourceLine':n})
    examples=section('Example Teams','Calculations')
    headings=[clean(s) for _,s in examples if s and not s.startswith('【') and len(s.split())<12 and not s.endswith('.')]
    updated=re.search(r'Last updated: ([^\n]+)',raw)
    return {
        'characterId':character['id'],'provider':'PRYDWEN','sourceUrl':f"https://www.prydwen.gg/wuthering-waves/characters/{character['id']}",
        'capturedAt':'2026-10-11','sourceUpdatedAt':updated[1].strip() if updated else None,
        'sourceLinesSha256':hashlib.sha256('\n'.join(f'L{n}: {s}' for n,s in lines).encode()).hexdigest(),
        'orderingPolicy':'SOURCE_DISPLAY_ORDER_NOT_RECALCULATED','comparisonStatus':'NOT_INDEPENDENTLY_VALIDATED',
        'skillPriorities':skill_priorities,'weapons':weapons,'calculationContexts':contexts,'echoSets':sets,'mainStats':main,'substatPriorities':priorities,
        'endgameStats':recommended_stats,'endgameContext':{'level':90,'sequencePolicy':'SOURCE_DEFAULT_S0_FIVE_STAR_S6_FOUR_STAR_AND_FREE_UNLESS_OVERRIDDEN','measurementBasis':'OUT_OF_COMBAT_ACTIVE_PARTY_TOTAL_STAT_SCREEN','energyRegenTeamBasis':'SOURCE_BEST_TEAM_UNLESS_SPECIFIED'},
        'generalTeamGuidance':[{'sourceText':excerpt(s,55),'sourceLine':n} for n,s in synergy if s and not s.lstrip().startswith('*') and len(s.split())>15 and not groups],
        'teammateGroups':groups,'teammateOrderingPolicy':'DISPLAY_ORDER_ONLY_NOT_AN_INFERRED_POWER_RANK',
        'exampleTeamLabels':headings,'exampleTeamMembersStatus':'NOT_EXPOSED_BY_TEXT_CAPTURE',
        'unresolvedIdentities':sorted(set(missing)),
    }

def main():
    p=argparse.ArgumentParser();p.add_argument('--source-dir',required=True);p.add_argument('--catalogs',required=True);p.add_argument('--output',default='data/source/prydwen-character-recommendations-2026-10-11.json');a=p.parse_args()
    catalogs=json.loads(pathlib.Path(a.catalogs).read_text())
    rows=[]
    for c in catalogs['characters']:
        if c['releaseStatus']=='RELEASED':rows.append(extract((pathlib.Path(a.source_dir)/(c['id']+'.txt')).read_text(),c,catalogs))
    payload={'schemaVersion':1,'role':'character-guide-recommendation.source-evidence','canonicalAuthority':False,'promotionPolicy':'EXPLICIT_SOURCE_REVIEW_REQUIRED','provider':'PRYDWEN','capturedAt':'2026-10-11','captureMethod':'CONNECTED_WEB_SOURCE_LINES','characters':rows,'policy':'Ordered guide recommendations, not game mechanics, signature identity, executable defaults or independently validated performance. No long guide prose, review, rotations or tier-rating content is retained.'}
    path=ROOT/a.output;path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'characters':len(rows),'weapons':sum(len(r['weapons']) for r in rows),'sets':sum(len(r['echoSets']) for r in rows),'stats':sum(len(r['endgameStats']) for r in rows),'groups':sum(len(r['teammateGroups']) for r in rows),'missing':{r['characterId']:r['unresolvedIdentities'] for r in rows if r['unresolvedIdentities']},'empty':{r['characterId']:[k for k in ['weapons','echoSets','mainStats','substatPriorities','endgameStats','teammateGroups'] if not r[k]] for r in rows if any(not r[k] for k in ['weapons','echoSets','mainStats','substatPriorities','endgameStats','teammateGroups'])}},indent=2))
if __name__=='__main__':main()
