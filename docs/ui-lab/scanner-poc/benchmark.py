"""Run actual image OCR against separately transcribed private expectations.

Usage: python benchmark.py /path/to/private-fixtures
Requires lupa.jpg, chisa.jpg, ciaccona.jpg and expected.json (see README).
Never writes or prints player IDs, image bytes or whole builds.
"""
import argparse
import contextlib
import io
import json
from pathlib import Path
import scanner

def equal(a,b): return type(a) in (int,float) and abs(a-b)<1e-10
def run(folder):
    expected=json.loads((folder/'expected.json').read_text())
    results={}
    names=scanner.data.ECHO_NAME_MAP
    for name,gold in expected.items():
        with contextlib.redirect_stdout(io.StringIO()):
            result=scanner.scan((folder/(name+'.jpg')).read_bytes())
        draft=result['draft'];counts={}
        def count(key,ok):
            counts.setdefault(key,{'correct':0,'total':0});counts[key]['total']+=1;counts[key]['correct']+=int(ok)
        count('character',draft['character']['id']==name)
        count('characterLevel',draft['character']['level']==90)
        count('weapon',draft['weapon']['id']==gold['weapon'])
        count('weaponLevel',draft['weapon']['level']==90)
        for skill in scanner.SKILLS: count('skills',draft['skills'][skill]==10)
        count('sequence',draft['sequence']==0)
        normalizations=[];unresolved=[]
        for i,echo in enumerate(draft['echoes']):
            count('echoIdentity',names.get(echo['echoId'])==gold['echoNames'][i])
            count('sonata',echo['sonataId']==f"sonata-{gold['sonatas'][i]}")
            count('cost',echo['cost']==[4,3,3,1,1][i])
            main=echo['mainStat'];n,v=gold['mains'][i]
            count('mainStat',main['name']==n and equal(main['value'],v/100))
            secondary=echo['secondaryMainStat'];n,v=('Flat ATK',150 if i==0 else 100) if i<3 else ('Flat HP',2280)
            count('secondaryStat',secondary['name']==n and equal(secondary['value'],v))
            for j,(n,v) in enumerate(gold['subs'][i]):
                row=echo['substats'][j];target=v if n.startswith('Flat ') else v/100
                same=row['name']==n and equal(row['value'],target)
                count('substatVisibleExact',same)
                count('substatOcrNumeric',row['name']==n and equal(scanner.number(row.get('rawValue')),v))
                # Evaluate literal displayed values and canonical compatibility separately.
                options=next(x['values'] for x in scanner.data.CATALOG['statEditor']['substats'] if x['name']==n)
                canonical=min(options,key=lambda x:abs(x-target))
                count('substatCanonical',row['name']==n and equal(row['value'],canonical))
                if not same and row.get('needsReview') and scanner.number(row.get('rawValue'))==v:
                    normalizations.append({'echo':i+1,'row':j+1,'visible':v,'canonical':canonical if n.startswith('Flat ') else round(canonical*100,8)})
                if row['name'] is None: unresolved.append({'echo':i+1,'row':j+1})
        results[name]={'counts':counts,'elapsedMs':result['elapsedMs'],'normalizations':normalizations,
                       'unresolvedRows':unresolved,'validationIssuePaths':[x['path'] for x in result['issues']]}
    return {'scope':'Three owner-supplied English 1920×1080 Discord cards; not a general accuracy estimate',
            'cards':results,'upstreamCommit':'f7eb67cbe0d0749b8902f318230f403e0bd3e7ea'}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('fixtures',type=Path);p.add_argument('--out',type=Path);args=p.parse_args()
    report=run(args.fixtures)
    if args.out: args.out.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))
