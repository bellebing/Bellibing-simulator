"""Isolated local scanner and review validation. GPL-3.0; see LICENSE/UPSTREAM.md."""
import os
os.environ.setdefault('OMP_THREAD_LIMIT', '1')
import re
import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent/'vendor'))
import cv2
import numpy as np
from rapidfuzz import fuzz, process
import card
import data
import image_integrity as integrity

# Original 1920×1080 Discord card layout, from WuWaBuilds server.py.
REGIONS = {
    'character':(0,.38,0,.55), 'forte':(.4057,.7422,.0222,.5917),
    'sequences':(.0703,.3318,.4787,.5843), 'weapon':(.7542,.9828,.3843,.5843),
    'echo1':(.0125,.2042,.6019,.9843), 'echo2':(.2057,.3974,.6019,.9843),
    'echo3':(.4016,.5938,.6019,.9843), 'echo4':(.5969,.7891,.6019,.9843),
    'echo5':(.7911,.9833,.6019,.9843),
}
MAX_BYTES=5*1024*1024
SKILLS=['basic','skill','circuit','intro','liberation']
def crop(image, region):
    x1,x2,y1,y2=REGIONS[region]; h,w=image.shape[:2]
    return image[round(y1*h):round(y2*h),round(x1*w):round(x2*w)].copy()

def number(text):
    m=re.search(r'\d+(?:\.\d+)?', text or '')
    return float(m.group()) if m else None

def canonical_stat(name, numeric):
    canonical=data.CANONICAL_NAMES.get(name,name)
    return {'name':canonical,'value':numeric if canonical.startswith('Flat ') else round(numeric/100,12)}

def read_main(panel, cost):
    lines=card._main_strip_lines(card._crop_region(panel,card.ECHO_REGIONS['main']))
    raw=' '.join(lines[:2]); match=re.search(r'(\d+(?:\.\d+)?)\s*%',raw)
    value=float(match.group(1)) if match else None
    raw_name=re.sub(r'[^A-Za-z ]',' ', raw[:match.start()] if match else raw)
    choices=list(data.MAIN_STATS.get(f'{cost}cost',{}))
    result=process.extractOne(raw_name.strip(),choices,scorer=fuzz.WRatio,score_cutoff=75)
    name=result[0] if result else ''
    # The card draws ATK/HP/DEF without '%' in its main-stat name.
    if not name and raw_name.strip().upper() in ['ATK','HP','DEF']:
        name=raw_name.strip().upper()+'%'
    return {'stat':canonical_stat(name,value) if name and value is not None else {'name':None,'value':None},
            'raw':raw, 'method':'OCR; no default main or value snapping'}

def read_secondary(panel):
    raw=panel[183:225,15:360]
    text=' '.join(card.tess_batch([card._upscale2(cv2.cvtColor(raw,cv2.COLOR_BGR2GRAY))],'--psm 7'))
    m=re.search(r'\b(ATK|HP)\b.*?(\d+)',text)
    return {'stat':{'name':'Flat '+m.group(1),'value':float(m.group(2))} if m else {'name':None,'value':None},'raw':text}

def read_echo(panel):
    eid, score, sid=card.match_icon(panel)
    suggestion={'echoId':eid,'sonataId':sid} if score < .08 else None
    if score < .08: eid=None; sid=None
    cost=data.ECHO_COSTS.get(eid) or card.get_echo_cost(panel) or None
    main=read_main(panel,cost); secondary=read_secondary(panel)
    rows,names,values=card.read_substat_rows(card._crop_region(panel,card.ECHO_REGIONS['subs_names']),card._crop_region(panel,card.ECHO_REGIONS['subs_values']))
    subs=[]
    for row,raw_name,raw_value in zip(rows,names,values):
        n=number(row['value']) if row else None
        obs=canonical_stat(row['name'],n) if row and n is not None else {'name':None,'value':None}
        subs.append({**obs,'rawName':raw_name,'rawValue':raw_value,
                     'needsReview':row is None or n!=number(raw_value)})
    return {'echoId':eid,'sonataId':sid,'cost':cost,'rank':None,'level':None,
            'mainStat':main['stat'],'secondaryMainStat':secondary['stat'],'substats':subs,
            'evidence':{'matchScore':round(float(score),4),'suggestion':suggestion,'main':main['raw'],'secondary':secondary['raw'],
                        'note':'Rank and level are not printed; left unknown. Stats checked against Rank-5 +25 compatibility.'}}

def scan(image_bytes):
    start=time.monotonic()
    if not image_bytes or len(image_bytes)>MAX_BYTES: raise ValueError('Choose a JPEG/PNG card up to 5 MiB.')
    if integrity.read_header_dimensions(image_bytes)!=(1920,1080):
        raise ValueError('Use the original 1920×1080 Discord card (JPEG or PNG).')
    if integrity._CHROME_MEDIAN is None or integrity._CHROME_MASK is None:
        raise RuntimeError('Card layout references are missing. Recognition is unavailable.')
    image=cv2.imdecode(np.frombuffer(image_bytes,np.uint8),cv2.IMREAD_COLOR)
    if image is None: raise ValueError('The image could not be decoded.')
    gate=integrity.validate_image_integrity(image)
    if not gate['accepted']: raise ValueError(gate['message'])
    # Warm shared template maps before any future concurrency; BF is deterministic.
    c=crop(image,'character'); w=crop(image,'weapon')
    person=card.recognize_character_asset(c)
    weapon=card.recognize_weapon_asset(w)
    person={'id':person.get('id') or None,'level':card.read_character_level(c) or None}
    weapon={'id':weapon.get('id') or None,'level':card.read_weapon_level(w) or None,'refinement':None}
    f=crop(image,'forte')
    boxes=list(card.FORTE_REGIONS.values())
    skill_text=card.tess_batch([card.preprocess_region(cv2.resize(card._crop_region(f,b),None,fx=3,fy=3)) for b in boxes],
                             '--psm 6 -c tessedit_char_whitelist=LVlv.0123456789/')
    skill_values={}
    for key,text in zip(SKILLS,skill_text):
        m=re.search(r'(?i)lv\.?\s*(10|[1-9])(?:\s*/\s*10)?',text)
        skill_values[key]=int(m.group(1)) if m else None
    draft={'schemaVersion':1,'kind':'bellibing-scanner-review','character':person,'weapon':weapon,
           'skills':skill_values,'sequence':card.parse_sequence_region(crop(image,'sequences')),
           'echoes':[]}
    region_errors={}
    for i in range(1,6):
        try: draft['echoes'].append(read_echo(crop(image,f'echo{i}')))
        except Exception:
            region_errors[f'echo{i}']='Region unreadable; correct this Echo manually.'
            draft['echoes'].append({'echoId':None,'sonataId':None,'cost':None,'rank':None,'level':None,
                'mainStat':{'name':None,'value':None},'secondaryMainStat':{'name':None,'value':None},
                'substats':[{'name':None,'value':None,'needsReview':True} for _ in range(5)],'evidence':{}})
    return {'draft':draft,'issues':validate_draft(draft),'elapsedMs':round((time.monotonic()-start)*1000),
            'regionErrors':region_errors,'skillRaw':dict(zip(SKILLS,skill_text)),
            'format':'English wuwa-bot 1920×1080','layoutScore':gate['chromeScore']}

def validate_draft(draft):
    """Pure review gate. No ownership/evaluator/defaults/recommendation restriction."""
    errors=[]
    def fail(path,message): errors.append({'path':path,'message':message})
    def integer(v,low,high): return type(v) is int and low<=v<=high
    if not isinstance(draft,dict) or draft.get('kind')!='bellibing-scanner-review' or draft.get('schemaVersion')!=1:
        return [{'path':'draft','message':'Unsupported scanner review shape.'}]
    person=draft.get('character'); weapon=draft.get('weapon')
    if not isinstance(person,dict) or not isinstance(weapon,dict): return [{'path':'draft','message':'Character and Weapon are required.'}]
    cp=next((c for c in data.CATALOG['characters'] if c['id']==person.get('id')),None)
    wp=next((w for w in data.CATALOG['weapons'] if w['id']==weapon.get('id')),None)
    if not cp: fail('character.id','Choose a released Character.')
    if not wp: fail('weapon.id','Choose a released Weapon.')
    if cp and wp and cp['weaponType']!=wp['weaponType']: fail('weapon.id','Weapon type does not match Character.')
    for key,obj in [('character',person),('weapon',weapon)]:
        if not integer(obj.get('level'),1,90): fail(key+'.level','Read or enter level 1–90.')
    if weapon.get('refinement') is not None and not integer(weapon['refinement'],1,5): fail('weapon.refinement','Enter R1–R5 or leave unknown.')
    if not integer(draft.get('sequence'),0,6): fail('sequence','Choose S0–S6.')
    skills=draft.get('skills')
    for key in SKILLS:
        if not isinstance(skills,dict) or not integer(skills.get(key),1,10): fail('skills.'+key,'Read or enter skill level 1–10.')
    echoes=draft.get('echoes')
    if not isinstance(echoes,list) or len(echoes)!=5: return errors+[{'path':'echoes','message':'Exactly five Echo panels required.'}]
    total=0
    for i,e in enumerate(echoes):
        p=f'echoes.{i}'
        if not isinstance(e,dict): fail(p,'Echo object required.'); continue
        identity=next((c for c in data.CATALOG['echoes'] if c['id']==e.get('echoId')),None)
        if not identity: fail(p+'.echoId','Choose a canonical Echo.'); continue
        total+=identity['cost']
        if e.get('cost')!=identity['cost']: fail(p+'.cost','Cost differs from canonical identity.')
        if e.get('sonataId') not in identity['sonataSetIds']: fail(p+'.sonataId','Choose a legal Sonata for this Echo.')
        # POC supports this exact fully rolled card layout only; unknown rank/level
        # stay unknown, while explicit corrections must match the supported scope.
        if e.get('rank') not in [None,5]: fail(p+'.rank','Only Rank-5 stat compatibility is supported.')
        if e.get('level') not in [None,25]: fail(p+'.level','Only +25 stat compatibility is supported.')
        def check_stat(key,options):
            s=e.get(key)
            if not isinstance(s,dict): fail(p+'.'+key,'Stat is required.'); return
            value=s.get('value')
            if not any(s.get('name')==o['name'] and type(value) in (int,float) and abs(value-o['value'])<1e-12 for o in options):
                fail(p+'.'+key,'Not an exact canonical Rank-5 +25 stat. Correct the read; do not guess.')
        rules=data.CATALOG['statEditor']; cost=str(identity['cost'])
        check_stat('mainStat',rules['mainStatsByCostAndLevel'][cost]['25'])
        check_stat('secondaryMainStat',[rules['secondaryMainStatsByCostAndLevel'][cost]['25']])
        rows=e.get('substats')
        if not isinstance(rows,list) or len(rows)!=5: fail(p+'.substats','Five observed roll rows required.'); continue
        seen=set()
        for j,r in enumerate(rows):
            if not isinstance(r,dict): fail(p+f'.substats.{j}','Roll object required.'); continue
            n=r.get('name'); v=r.get('value')
            opt=next((s for s in rules['substats'] if s['name']==n),None)
            if not opt or type(v) not in (int,float) or not any(abs(v-x)<1e-12 for x in opt['values']): fail(p+f'.substats.{j}','Choose an exact canonical stat/tier.')
            if n and n in seen: fail(p+f'.substats.{j}','Duplicate substat; correct the affected rows.')
            if isinstance(n,str): seen.add(n)
    if total>12: fail('echoes','Total Echo cost exceeds the current endgame cap of 12.')
    return errors
