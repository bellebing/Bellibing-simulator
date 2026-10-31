"""Focused validation/failure regressions. Real-card acceptance uses benchmark.py."""
import copy
import unittest
import cv2
import numpy as np
import scanner

def valid():
    rules=scanner.data.CATALOG['statEditor']; echo=next(e for e in scanner.data.CATALOG['echoes'] if e['cost']==1)
    roll=[{'name':s['name'],'value':s['values'][0]} for s in rules['substats'][:5]]
    item={'echoId':echo['id'],'sonataId':echo['sonataSetIds'][0],'cost':1,'rank':None,'level':None,
          'mainStat':rules['mainStatsByCostAndLevel']['1']['25'][0],
          'secondaryMainStat':rules['secondaryMainStatsByCostAndLevel']['1']['25'],'substats':roll}
    return copy.deepcopy({'schemaVersion':1,'kind':'bellibing-scanner-review','character':{'id':'lupa','level':90},
        'weapon':{'id':'wildfire-mark','level':90,'refinement':None},'sequence':0,
        'skills':dict.fromkeys(scanner.SKILLS,10),'echoes':[item]*5})

class ValidationTests(unittest.TestCase):
    def test_observed_items_are_not_restricted_to_recommended_loadout(self):
        d=valid();before=copy.deepcopy(d)
        self.assertEqual(scanner.validate_draft(d),[]);self.assertEqual(d,before)
    def test_unknown_fields_are_not_filled(self):
        d=valid();d['character']['level']=None;d['skills']['circuit']=None
        paths=[e['path'] for e in scanner.validate_draft(d)]
        self.assertIn('character.level',paths);self.assertIn('skills.circuit',paths)
        self.assertIsNone(d['character']['level']);self.assertIsNone(d['echoes'][0]['rank'])
    def test_duplicate_substats_rejected(self):
        d=valid();d['echoes'][0]['substats'][1]=d['echoes'][0]['substats'][0]
        self.assertTrue(any('Duplicate' in e['message'] for e in scanner.validate_draft(d)))
    def test_wrong_decimal_tier_rejected(self):
        d=valid();d['echoes'][0]['substats'][3]['value']=6.3
        self.assertTrue(any(e['path']=='echoes.0.substats.3' for e in scanner.validate_draft(d)))
    def test_illegal_set_rejected(self):
        d=valid();d['echoes'][0]['sonataId']='nonexistent'
        self.assertTrue(any(e['path']=='echoes.0.sonataId' for e in scanner.validate_draft(d)))
    def test_wrong_weapon_type_rejected(self):
        d=valid();d['weapon']['id']='woodland-aria'
        self.assertTrue(any(e['path']=='weapon.id' for e in scanner.validate_draft(d)))
    def test_wrong_cost_and_secondary_rejected(self):
        d=valid();d['echoes'][0]['cost']=4;d['echoes'][0]['secondaryMainStat']['value']=150
        paths=[e['path'] for e in scanner.validate_draft(d)]
        self.assertIn('echoes.0.cost',paths);self.assertIn('echoes.0.secondaryMainStat',paths)
    def test_all_five_positions_remain_required(self):
        d=valid();d['echoes'][0]['substats'][2]={'name':None,'value':None}
        before=copy.deepcopy(d);self.assertTrue(scanner.validate_draft(d));self.assertEqual(d,before)
    def test_invalid_json_shape_and_future_schema(self):
        for d in [None,[],{},dict(valid(),schemaVersion=9)]: self.assertTrue(scanner.validate_draft(d))
    def test_bad_uploads(self):
        for body in [b'',b'not an image',b'x'*(scanner.MAX_BYTES+1)]:
            with self.assertRaises(ValueError):scanner.scan(body)
    def test_wrong_dimensions_and_blank_same_size(self):
        for shape in [(720,1280,3),(1080,1920,3)]:
            body=cv2.imencode('.png',np.zeros(shape,dtype=np.uint8))[1].tobytes()
            with self.assertRaises(ValueError):scanner.scan(body)
    def test_unreadable_main_stays_unknown(self):
        from unittest.mock import patch
        with patch.object(scanner.card,'_main_strip_lines',return_value=[]):
            self.assertEqual(scanner.read_main(np.zeros((413,368,3),np.uint8),3)['stat'],{'name':None,'value':None})
    def test_weak_identity_is_not_promoted_and_rows_do_not_shift(self):
        from unittest.mock import patch
        echo=next(e for e in scanner.data.CATALOG['echoes'] if e['cost']==3)
        unknown={'stat':{'name':None,'value':None},'raw':''}
        rows=[None,{'name':'Crit Rate','value':'6.3%'},None,None,None]
        with patch.object(scanner.card,'match_icon',return_value=(echo['id'],.01,echo['sonataSetIds'][0])), \
             patch.object(scanner.card,'get_echo_cost',return_value=3), \
             patch.object(scanner,'read_main',return_value=unknown), \
             patch.object(scanner,'read_secondary',return_value=unknown), \
             patch.object(scanner.card,'read_substat_rows',return_value=(rows,['','Crit Rate','','',''],['','6.3%','','',''])):
            out=scanner.read_echo(np.zeros((413,368,3),np.uint8))
        self.assertIsNone(out['echoId']);self.assertIsNone(out['sonataId'])
        self.assertEqual(out['cost'],3);self.assertEqual(len(out['substats']),5)
        self.assertIsNone(out['substats'][0]['name']);self.assertEqual(out['substats'][1]['name'],'CRIT Rate')
        self.assertEqual(out['evidence']['suggestion']['echoId'],echo['id'])

if __name__=='__main__':unittest.main()
