"""Bellibing adapter for the GPL WuWaBuilds recognizer. No upstream game catalog.

All identities, legal sets and exact stat tiers come from Bellibing's canonical
runtime exports; images come from its reviewed asset manifests. This module and
the isolated scanner prototype are distributed under GPL-3.0 (../LICENSE).
"""
import json
import subprocess
from pathlib import Path
import cv2
import numpy as np

HERE = Path(__file__).resolve().parent
CATALOG = json.loads(subprocess.check_output(
    ['node', '--experimental-strip-types', str(HERE.parent / 'canonical.mjs')], text=True))
ROOT = Path(CATALOG['root'])
ALIASES = {'Flat HP':'HP', 'Flat ATK':'ATK', 'Flat DEF':'DEF',
           'CRIT Rate':'Crit Rate', 'CRIT DMG':'Crit DMG',
           'Skill DMG':'Resonance Skill DMG Bonus', 'Liberation DMG':'Resonance Liberation DMG Bonus',
           'Basic Attack DMG':'Basic Attack DMG Bonus', 'Heavy Attack DMG':'Heavy Attack DMG Bonus'}
ALIASES.update({f'{e} DMG':f'{e} DMG Bonus' for e in ['Aero','Glacio','Fusion','Electro','Havoc','Spectro']})
CANONICAL_NAMES = {v:k for k,v in ALIASES.items()}
def ocr_name(name): return ALIASES.get(name, name)
def display_value(name, value): return value if name.startswith('Flat ') else round(value * 100, 8)
SUB_STATS = {ocr_name(r['name']):[display_value(r['name'],v) for v in r['values']] for r in CATALOG['statEditor']['substats']}
MAIN_STATS = {f'{cost}cost':{ocr_name(r['name']):[display_value(r['name'],r['value'])] for r in levels['25']}
              for cost,levels in CATALOG['statEditor']['mainStatsByCostAndLevel'].items()}
MAIN_STAT_NAMES = {n for rows in MAIN_STATS.values() for n in rows}
CHARACTER_ID_MAP = {c['name']:c['id'] for c in CATALOG['characters']}
CHARACTER_NAMES = list(CHARACTER_ID_MAP)
WEAPON_ID_MAP = {w['name']:w['id'] for w in CATALOG['weapons']}
WEAPON_NAMES = list(WEAPON_ID_MAP)
ECHO_COSTS = {e['id']:e['cost'] for e in CATALOG['echoes']}
ECHO_NAME_MAP = {e['id']:e['name'] for e in CATALOG['echoes']}
ECHO_SET_IDS = {e['id']:e['sonataSetIds'] for e in CATALOG['echoes']}
SET_NAME_BY_ID = {s['id']:s['name'] for s in CATALOG['sonataSets']}
# Rover variants are outside this one-format proof; never guess element/gender.
ROVER_GENDER_BY_ID = {}
ROVER_ELEMENT_BY_ID = {}
ICON_TEMPLATES, TEMPLATE_FEATURES, ELEMENT_TEMPLATES, ELEMENT_FEATURES = {}, {}, {}, {}
SIFT = cv2.SIFT_create()
def image(path, size=None):
    img=cv2.imread(str(path))
    if img is None: raise RuntimeError(f'Missing canonical scanner asset: {path.name}')
    return cv2.resize(img,size) if size else img
def load(rows, id_key, path_key, images, features, size=None):
    for r in rows:
        path=ROOT/r[path_key]
        if not path.is_file(): continue
        img=image(path,size); images[r[id_key]]=img
        kp,des=SIFT.detectAndCompute(img,None)
        if des is not None and len(kp)>=2: features[r[id_key]]=(kp,des)
load(CATALOG['echoIcons'],'echoId','targetPath',ICON_TEMPLATES,TEMPLATE_FEATURES,(188,188))
load(CATALOG['sonataSets'],'id','artPath',ELEMENT_TEMPLATES,ELEMENT_FEATURES)
COST_TEMPLATES = {c:cv2.imread(str(HERE/'Costs'/f'cost{c}.jpg'),0) for c in (1,3,4)}
ASSET_PATHS = {
    'Characters': {r['characterId']:ROOT/r['targetPath'] for r in CATALOG['characterArt'] if r.get('targetPath')},
    'Weapons': {r['weaponId']:ROOT/r['targetPath'] for r in CATALOG['weaponIcons']},
}

def determine_element(crop, filter_ids):
    """Match only canonical legal badges; hue handles recolors, SIFT separates shapes.

    Same principle as WuWaBuilds data.py, with canonical string IDs and dynamic
    template hues instead of a separately maintained numerical set catalog.
    Scores are matching heuristics, never probabilities of correctness.
    """
    possible=ECHO_SET_IDS.get(filter_ids,[]) if isinstance(filter_ids,str) else list(filter_ids or [])
    if not possible: return None
    hsv=cv2.cvtColor(crop,cv2.COLOR_BGR2HSV)
    mask=cv2.inRange(hsv,np.array([0,40,40]),np.array([180,255,255]))
    hist=cv2.calcHist([hsv],[0],mask,[36],[0,180]); cv2.normalize(hist,hist)
    kp,des=SIFT.detectAndCompute(crop,None)
    matcher=cv2.BFMatcher()
    scores=[]
    for sid in possible:
        tmpl=ELEMENT_TEMPLATES.get(sid)
        if tmpl is None: continue
        th=cv2.cvtColor(tmpl,cv2.COLOR_BGR2HSV)
        tm=cv2.inRange(th,np.array([0,40,40]),np.array([180,255,255]))
        h=cv2.calcHist([th],[0],tm,[36],[0,180]); cv2.normalize(h,h)
        color=float(cv2.compareHist(hist,h,cv2.HISTCMP_CORREL)) if cv2.countNonZero(tm) else (1 if cv2.countNonZero(mask)<max(10,mask.size*.03) else -1)
        feat=ELEMENT_FEATURES.get(sid); score=0
        if des is not None and feat:
            matches=matcher.knnMatch(des,feat[1],k=2)
            score=sum(1 for pair in matches if len(pair)==2 and pair[0].distance<.7*pair[1].distance)/max(len(kp),len(feat[0]))
        scores.append((sid,color,score))
    if not scores: return None
    best=max(s[1] for s in scores)
    near=[s for s in scores if s[1]>=best-.08]
    selected=max(near,key=lambda s:(s[2],s[1]))
    return selected[0] if selected[1]>.1 else None
