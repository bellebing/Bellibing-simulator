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
from icon_recognition import recognize as recognize_echo

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

def review_substat(row, raw_name, raw_value):
    """Keep literal OCR evidence separate from canonical import compatibility.

    Only the exact Discord DEF-percent 11.9% alias has verified mapping evidence.
    This does not establish why the card prints it, or verify other near-tier
    OCR conversions. All changed observations still require explicit review.
    """
    numeric=number(row['value']) if row else None
    obs=canonical_stat(row['name'],numeric) if row and numeric is not None else {'name':None,'value':None}
    observed=number(raw_value)
    observed_value=canonical_stat(row['name'],observed)['value'] if row and observed is not None else None
    changed=obs['value'] is not None and observed_value is not None and abs(obs['value']-observed_value)>1e-12
    result={**obs,'rawName':raw_name,'rawValue':raw_value,'observedValue':observed_value,
            'needsReview':row is None or changed}
    if changed:
        result['normalization']={'status':'UNVERIFIED_OCR_CONVERSION','requiresReview':True}
    legal_def=next(s['values'] for s in data.CATALOG['statEditor']['substats'] if s['name']=='DEF%')
    if (obs['name']=='DEF%' and raw_name.strip().upper() in {'DEF','DEF Y','DEF%'}
            and raw_value.strip()=='11.9%' and any(abs(v-.118)<1e-12 for v in legal_def)):
        result.update(value=.118,needsReview=True,normalization={
            'ruleId':'discord-def-percent-11.9-to-11.8-v1',
            'status':'VERIFIED_IMPORT_COMPATIBILITY','requiresReview':True,
            'cause':'CARD_DISPLAY_CAUSE_UNVERIFIED',
            'evidence':'DEF_PERCENT_IMPORT.md',
        })
    return result

def read_main(panel, cost):
    main_panel=card._crop_region(panel,card.ECHO_REGIONS['main'])
    lines=card._main_strip_lines(main_panel)
    raw=' '.join(lines[:2]); match=re.search(r'(\d+(?:\.\d+)?)\s*%',raw)
    value=float(match.group(1)) if match else None
    raw_name=re.sub(r'[^A-Za-z ]',' ', raw[:match.start()] if match else raw)
    choices=list(data.MAIN_STATS.get(f'{cost}cost',{}))
    result=process.extractOne(raw_name.strip(),choices,scorer=fuzz.WRatio,score_cutoff=75)
    name=result[0] if result else ''
    # The card draws ATK/HP/DEF without '%' in its main-stat name.
    if not name and raw_name.strip().upper() in ['ATK','HP','DEF']:
        name=raw_name.strip().upper()+'%'
    stat=canonical_stat(name,value) if name and value is not None else {'name':None,'value':None}
    allowed=data.CATALOG['statEditor']['mainStatsByCostAndLevel'].get(str(cost),{}).get('25',[])
    exact=lambda s:any(s['name']==row['name'] and s['value'] is not None and
                       abs(s['value']-row['value'])<1e-12 for row in allowed)

    # Original 1920x1080 card: the icon preceding 18% is frequently read as
    # 'xX', and the low-contrast ATK label on a 1-cost card as 'Ni'.
    # Recover ONLY the separately readable label, never from 18% alone:
    # ATK% and DEF% both have the same legal cost-1 +25 value.
    # The tight name box excludes the element badge and the stat-value icon.
    method='OCR; no default main or value snapping'
    if cost==1 and value is not None and (
        not exact(stat) or not re.fullmatch(r'(?i)(HP|ATK|DEF)%?',raw_name.strip())
    ):
        name_crop=main_panel[6:40,85:171]
        if name_crop.size:
            gray=cv2.cvtColor(name_crop,cv2.COLOR_BGR2GRAY)
            up=cv2.resize(gray,None,fx=4,fy=4,interpolation=cv2.INTER_CUBIC)
            tight=card.pytesseract.image_to_string(up,config='--psm 7').strip().upper()
            if tight in {'HP','ATK','DEF'}:
                candidate=canonical_stat(tight+'%',value)
                if exact(candidate):
                    stat=candidate
                    method='Tight label OCR + exact canonical value (original strip retained)'
    return {'stat':stat,'raw':raw,'method':method}


def _exact_secondary(stat, cost):
    expected=data.CATALOG['statEditor']['secondaryMainStatsByCostAndLevel'].get(str(cost),{}).get('25')
    return (expected is not None and stat.get('name')==expected['name']
            and type(stat.get('value')) in (int,float)
            and abs(stat['value']-expected['value'])<1e-12)

def _complete_canonical_rolls(rolls):
    if len(rolls)!=5: return False
    legal=data.CATALOG['statEditor']['substats']
    seen=set()
    for row in rolls:
        if not isinstance(row,dict): return False
        name=row.get('name'); value=row.get('value')
        source=next((r for r in legal if r['name']==name),None)
        if name in seen or source is None or type(value) not in (int,float): return False
        if not any(abs(value-v)<1e-12 for v in source['values']): return False
        seen.add(name)
    return True

def read_secondary(panel, cost):
    """Independent OCR of the fixed secondary for every cost 1/3/4 Echo."""
    region=panel[183:225,15:360]
    gray=cv2.cvtColor(region,cv2.COLOR_BGR2GRAY)
    raw=' '.join(card.tess_batch([card._upscale2(gray)],'--psm 7'))
    def parse(text):
        match=re.search(r'\b(ATK|HP)\b\s*[:+]?\s*(\d+(?:\.\d+)?)\b',text,re.I)
        return {'name':'Flat '+match.group(1).upper(),'value':float(match.group(2))} if match else {'name':None,'value':None}
    observed=parse(raw)
    if _exact_secondary(observed,cost):
        return {'stat':observed,'raw':raw,'method':'Full-row OCR; exact canonical'}
    # Independent split name/value pass, to avoid icon/artwork or dim text
    # swallowing a field. Wrong or missing values remain unresolved.
    try:
        left,right=card.tess_batch([card._upscale2(gray[:,:255]),card._upscale2(gray[:,255:])],'--psm 7')
        retried=left.strip()+' '+right.strip()
    except (RuntimeError,ValueError,OSError):
        retried=''  # A failed retry must not erase the other four Echoes.
    candidate=parse(retried)
    if _exact_secondary(candidate,cost):
        return {'stat':candidate,'raw':raw,'retry':retried,'method':'Split-row OCR; exact canonical'}
    return {'stat':{'name':None,'value':None},'raw':raw,'retry':retried,
            'method':'Unresolved secondary; review required'}

def read_echo(panel):
    eid, score, sid, identity_evidence=recognize_echo(panel)
    cost=data.ECHO_COSTS.get(eid) or card.get_echo_cost(panel) or None
    main=read_main(panel,cost); secondary=read_secondary(panel,cost)
    rows,names,values=card.read_substat_rows(card._crop_region(panel,card.ECHO_REGIONS['subs_names']),card._crop_region(panel,card.ECHO_REGIONS['subs_values']))
    subs=[]
    for row,raw_name,raw_value in zip(rows,names,values):
        subs.append(review_substat(row,raw_name,raw_value))
    evidence={**identity_evidence,'main':main['raw'],'mainMethod':main['method'],
              'secondary':secondary['raw'],'secondaryRetry':secondary.get('retry'),
              'secondaryMethod':secondary['method'],
              'note':'Rank and level are not printed; left unknown. Stats checked against Rank-5 +25 compatibility.'}
    # Five distinct legal observed rolls prove the +25 checkpoint for this
    # original-card scope. Exactly ONE fixed secondary exists per cost at +25.
    # On unreadable OCR only, recover that source fact and flag its derivation
    # for explicit review; never overwrite contradictory numeric observations.
    if secondary['stat']['name'] is None and _complete_canonical_rolls(subs):
        expected=data.CATALOG['statEditor']['secondaryMainStatsByCostAndLevel'].get(str(cost),{}).get('25')
        if expected and not re.search(r'\b(?:ATK|HP)\b\s*[:+]?\s*\d+',secondary['raw'],re.I):
            secondary['stat']=dict(expected)
            evidence['secondaryRecovery']={'status':'FIXED_CANONICAL_SECONDARY_FROM_FIVE_ROLLS',
                'requiresReview':True,'raw':secondary['raw'],'retry':secondary.get('retry')}
    return {'echoId':eid,'sonataId':sid,'cost':cost,'rank':None,'level':None,
            'mainStat':main['stat'],'secondaryMainStat':secondary['stat'],'substats':subs,
            'evidence':evidence}

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
