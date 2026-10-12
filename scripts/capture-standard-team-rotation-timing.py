"""Capture numeric source evidence only; publication requires separate manual review."""
import json, re
from pathlib import Path
import argparse
parser=argparse.ArgumentParser(description='Capture numeric timing tables from saved numbered web renders. No damage or guide text is imported.')
parser.add_argument('--input-dir',type=Path,required=True)
parser.add_argument('--output',type=Path,default=Path('data/source/standard-team-rotation-timing-evidence-2026-10-12.json'))
args=parser.parse_args()
slugs=['augusta-iuno-shorekeeper-35','cartethyia-ciaccona-rover-aero-40','aemeath-lynae-mornye-86','galbrena-lucilla-shorekeeper-140','cartethyia-ciaccona-chisa-50','zani-phoebe-shorekeeper-33','brant-lupa-mornye-84','cantarella-qiuyuan-phrolova-43','changli-brant-lupa-24','cartethyia-ciaccona-shorekeeper-38','jinhsi-zhezhi-shorekeeper-58','xiangli-yao-yinlin-shorekeeper-7']
nameids={'Shorekeeper':'the-shorekeeper','Rover Aero':'rover-aero','Xiangli Yao':'xiangli-yao'}
sources=[]
for slug in slugs:
 raw=(args.input_dir/('timing-'+slug+'.txt')).read_text()
 lines=[(int(n),v) for n,v in re.findall(r'^L(\d+): ?(.*)$',raw,re.M)]
 phases=[]; builds=[]
 for n,v in lines:
  if v.startswith('### ') and 'Rotation' in v:
   phases.append({'rotationNumber':len(phases)+1,'headingLine':n,'reportedCycleSeconds':None,'summaryLine':None,'members':[]})
  elif phases and re.search(r'Damage ([0-9.]+)s',v):
   phases[-1]['reportedCycleSeconds']=float(re.search(r'Damage ([0-9.]+)s',v)[1]);phases[-1]['summaryLine']=n
  elif phases and ' | ' in v:
   cells=[x.strip() for x in v.split('|')]
   if len(cells)==8 and re.fullmatch(r'[0-9.]+s',cells[3]):
    name=cells[0];cid=nameids.get(name,name.lower())
    phases[-1]['members'].append({'characterId':cid,'sourceActionLabel':cells[1],'sourceIntroLabel':cells[2],'fieldSeconds':float(cells[3][:-1]),'waitSeconds':float(cells[4]),'difficulty':float(cells[5]),'sourceLine':n})
  elif not phases and re.search(r'Image: (.+?)】.*? S(\d)',v):
   m=re.search(r'Image: (.+?)】.*? S(\d)',v);name=m[1];builds.append({'characterId':nameids.get(name,name.lower()),'sequence':int(m[2]),'sourceLine':n,'weaponName':None,'refinement':None,'sonataLabel':None})
  elif not phases and builds and ' · R' in v:
   m=re.search(r'【\d+†([^【]+)】 · R(\d)',v)
   if m:builds[-1]['weaponName']=m[1].strip();builds[-1]['refinement']=int(m[2])
  elif not phases and builds and (re.search(r'Image】.*?】',v) or '&' in v) and not ' · R' in v:
   if 'Image】' in v: builds[-1]['sonataLabel']=re.sub(r'【\d+†|】','',v.split('Image】',1)[1]).strip()
   elif '&' in v: builds[-1]['sonataLabel']=v.strip()
 assert len(phases)==3 and all(len(p['members'])==3 and p['reportedCycleSeconds'] for p in phases),slug
 assert len(builds)==3 and all(b['weaponName'] and b['sonataLabel'] for b in builds),(slug,builds)
 avg=float(re.search(r'Average Time ([0-9.]+)s',raw)[1])
 sources.append({'id':'arabwuwa-'+slug,'provider':'ARAB_WUWA','url':'https://arabwuwa.com/teams/'+slug+'/','capturedAt':'2026-10-12','sourceLastUpdated':next(v.split(': ',1)[1] for n,v in lines if v.startswith('Last updated:')),'reportedAverageCycleSeconds':avg,'builds':builds,'phases':phases})
artifact={'schemaVersion':1,'role':'standard-team-rotation-timing.source-evidence','canonicalAuthority':False,'capturedAt':'2026-10-12','methodology':{'url':'https://arabwuwa.com/methodology/','reviewedLines':[37,40,41,42,47,54],'basis':'PROVIDER_REPORTED_GAMEPLAY_TIMING','clock':'SOURCE_CLOCK_UNSPECIFIED','summary':'Provider describes three gameplay-tested rotations with standardized builds, adequate Energy and clean execution; cancels can be used. Damage is spreadsheet-calculated. It does not define whether cinematic/time-stop seconds are included in the timing clock.'},'sources':sources}
path=args.output;path.write_text(json.dumps(artifact,indent=2,ensure_ascii=False)+'\n')
print(f'Captured {len(sources)} teams / {sum(len(s["phases"]) for s in sources)} rotation phases.')
