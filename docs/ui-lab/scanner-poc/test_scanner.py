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
    def test_partial_icon_geometry_requires_distinct_spread_and_margin(self):
        from unittest.mock import patch
        import icon_recognition
        echo=next(e for e in scanner.data.CATALOG['echoes'] if e['cost']==3)
        candidate={'echoId':echo['id'],'inliers':8,'uniquePoints':6,'inlierRatio':.8,'coverage':.12}
        panel=np.zeros((413,368,3),np.uint8)
        with patch.object(icon_recognition.card,'match_icon',return_value=(echo['id'],.04,echo['sonataSetIds'][0])), \
             patch.object(icon_recognition,'geometric_matches',return_value=[candidate]), \
             patch.object(icon_recognition.data,'determine_element',return_value=echo['sonataSetIds'][0]):
            result=icon_recognition.recognize(panel)
        self.assertEqual(result[0],echo['id']);self.assertIn('geometry',result[3])
        for bad in [dict(candidate,inliers=7),dict(candidate,uniquePoints=5),dict(candidate,coverage=.02),dict(candidate,inlierRatio=.4)]:
            with patch.object(icon_recognition.card,'match_icon',return_value=(echo['id'],.04,None)), \
                 patch.object(icon_recognition,'geometric_matches',return_value=[bad]):
                self.assertIsNone(icon_recognition.recognize(panel)[0])
        with patch.object(icon_recognition.card,'match_icon',return_value=(echo['id'],.04,None)), \
             patch.object(icon_recognition,'geometric_matches',return_value=[candidate,dict(candidate,echoId='ambiguous')]):
            self.assertIsNone(icon_recognition.recognize(panel)[0])
    def test_geometry_does_not_assign_an_unresolved_or_illegal_badge(self):
        from unittest.mock import patch
        import icon_recognition
        echo=next(e for e in scanner.data.CATALOG['echoes'] if e['cost']==3)
        candidate={'echoId':echo['id'],'inliers':12,'uniquePoints':10,'inlierRatio':.9,'coverage':.3}
        for badge in [None,'illegal-set']:
            with patch.object(icon_recognition.card,'match_icon',return_value=(echo['id'],.04,None)), \
                 patch.object(icon_recognition,'geometric_matches',return_value=[candidate]), \
                 patch.object(icon_recognition.data,'determine_element',return_value=badge):
                self.assertIsNone(icon_recognition.recognize(np.zeros((413,368,3),np.uint8))[0])
    def test_blank_icon_remains_unrecognized(self):
        import icon_recognition
        self.assertIsNone(icon_recognition.recognize(np.zeros((413,368,3),np.uint8))[0])
    def test_flat_missing_badge_is_not_a_perfect_hue_match(self):
        echo=next(e for e in scanner.data.CATALOG['echoes'] if e['cost']==3)
        for color in [0,127,255]:
            self.assertIsNone(scanner.data.determine_element(np.full((45,45,3),color,np.uint8),echo['id']))
    def test_exact_discord_def_alias_preserves_observation_and_requires_review(self):
        row={'name':'DEF%','value':'11.8%'}
        before=copy.deepcopy(scanner.data.CATALOG['statEditor'])
        for label in ['DEF','DEF Y','DEF%']:
            out=scanner.review_substat(row,label,'11.9%')
            self.assertEqual(out['rawName'],label);self.assertEqual(out['rawValue'],'11.9%')
            self.assertEqual(out['observedValue'],.119);self.assertEqual(out['value'],.118)
            self.assertTrue(out['needsReview']);self.assertTrue(out['normalization']['requiresReview'])
            self.assertEqual(out['normalization']['status'],'VERIFIED_IMPORT_COMPATIBILITY')
            self.assertEqual(out['normalization']['cause'],'CARD_DISPLAY_CAUSE_UNVERIFIED')
        self.assertEqual(scanner.data.CATALOG['statEditor'],before)
    def test_other_conversions_remain_unverified(self):
        for row,label,raw in [({'name':'ATK%','value':'11.6%'},'ATK','11.7%'),
                              ({'name':'DEF%','value':'11.8%'},'DEF','11.85%'),
                              ({'name':'DEF%','value':'11.8%'},'Unreadable','11.9%')]:
            out=scanner.review_substat(row,label,raw)
            self.assertEqual(out['rawValue'],raw);self.assertTrue(out['needsReview'])
            self.assertEqual(out['normalization']['status'],'UNVERIFIED_OCR_CONVERSION')
    def test_exact_def_tier_and_unresolved_rows_are_not_converted(self):
        out=scanner.review_substat({'name':'DEF%','value':'11.8%'},'DEF','11.8%')
        self.assertFalse(out['needsReview']);self.assertNotIn('normalization',out)
        out=scanner.review_substat(None,'DEF','11.9%')
        self.assertIsNone(out['value']);self.assertTrue(out['needsReview'])
    def test_alias_does_not_override_a_changed_canonical_catalog(self):
        from unittest.mock import patch
        catalog=copy.deepcopy(scanner.data.CATALOG)
        next(s for s in catalog['statEditor']['substats'] if s['name']=='DEF%')['values']=[.12]
        with patch.object(scanner.data,'CATALOG',catalog):
            out=scanner.review_substat({'name':'DEF%','value':'11.8%'},'DEF','11.9%')
        self.assertEqual(out['normalization']['status'],'UNVERIFIED_OCR_CONVERSION')
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

    def test_independent_main_ocr_recovers_icon_818_without_snap(self):
        from unittest.mock import patch
        for cost,name,rawvalue,correct in [
            (1,'DEF','818%',18),
            (1,'ATK','818%',18),
            (3,'Energy Regen','332%',32),
            (4,'Crit DMG','444%',44),
        ]:
            with (self.subTest(cost=cost,name=name),
                  patch.object(scanner.card,'_main_strip_lines',return_value=[name,'xX '+rawvalue]),
                  patch.object(scanner.card.pytesseract,'image_to_string',side_effect=[name,str(correct)+'%']) as ocr):
                result=scanner.read_main(np.zeros((413,368,3),np.uint8),cost)
                expected=scanner.canonical_stat(name+('%' if name in ('DEF','ATK') else ''),correct)
                self.assertEqual(result['stat'],expected)
                self.assertEqual(result['recovery']['valueRead'],str(correct)+'%')
                self.assertTrue(result['recovery']['requiresReview'])
                self.assertEqual(ocr.call_count,2)

    def test_real_hiyuki_noisy_atk_name_recovered_from_separate_read(self):
        from unittest.mock import patch
        with (patch.object(scanner.card,'_main_strip_lines',return_value=['Ni','xX 18%']),
              patch.object(scanner.card.pytesseract,'image_to_string',side_effect=['ATK','18%'])):
            result=scanner.read_main(np.zeros((413,368,3),np.uint8),1)
            self.assertEqual(result['stat'],{'name':'ATK%','value':.18})
            self.assertEqual(result['raw'],'Ni xX 18%')
            self.assertEqual(result['recovery']['labelRead'],'ATK')

    def test_main_retry_never_guesses_from_value_or_illegal_main(self):
        from unittest.mock import patch
        for label,value in [('Unreadable','18%'),('DEF','19%'),('DEF','818%'),
                            ('ATK','18'),('ATK','xX 18%')]:
            with (self.subTest(label=label,value=value),
                  patch.object(scanner.card,'_main_strip_lines',return_value=['Ni','xX 818%']),
                  patch.object(scanner.card.pytesseract,'image_to_string',side_effect=[label,value])):
                result=scanner.read_main(np.zeros((413,368,3),np.uint8),1)
                self.assertFalse(any(result['stat']['name']==s['name'] and
                    result['stat']['value'] is not None and abs(result['stat']['value']-s['value'])<1e-12
                    for s in scanner.data.CATALOG['statEditor']['mainStatsByCostAndLevel']['1']['25']))
                self.assertIsNone(result['recovery'])

    def test_main_exact_ocr_skips_retry_and_keeps_source(self):
        from unittest.mock import patch
        with (patch.object(scanner.card,'_main_strip_lines',return_value=['DEF','18%']),
              patch.object(scanner.card.pytesseract,'image_to_string') as retry):
            result=scanner.read_main(np.zeros((413,368,3),np.uint8),1)
            self.assertEqual(result['stat'],{'name':'DEF%','value':.18})
            self.assertIsNone(result['recovery'])
            retry.assert_not_called()

    def test_secondary_full_and_split_ocr_for_all_costs(self):
        from unittest.mock import patch
        rules=scanner.data.CATALOG['statEditor']
        for cost in (1,3,4):
            expected=rules['secondaryMainStatsByCostAndLevel'][str(cost)]['25']
            label=expected['name'].removeprefix('Flat ')
            number=str(int(expected['value']))
            with (self.subTest(cost=cost),patch.object(scanner.card,'tess_batch',return_value=[label+' '+number])):
                self.assertEqual(scanner.read_secondary(np.zeros((413,368,3),np.uint8),cost)['stat'],expected)
            with (self.subTest(cost=cost),patch.object(scanner.card,'tess_batch',
                    side_effect=[['Unreadable'],[label,number]])):
                result=scanner.read_secondary(np.zeros((413,368,3),np.uint8),cost)
                self.assertEqual(result['stat'],expected)
                self.assertIn('Split-row',result['method'])
            with (self.subTest(cost=cost),patch.object(scanner.card,'tess_batch',
                    side_effect=[['Unreadable'],[label,'99999']])):
                self.assertIsNone(scanner.read_secondary(np.zeros((413,368,3),np.uint8),cost)['stat']['name'])

    def test_secondary_cost_recovery_only_from_five_exact_distinct_rolls(self):
        from unittest.mock import patch
        rules=scanner.data.CATALOG['statEditor']
        legal=[{'name':r['name'],'value':r['values'][0]} for r in rules['substats'][:5]]
        echo=next(e for e in scanner.data.CATALOG['echoes'] if e['cost']==3)
        main={'stat':rules['mainStatsByCostAndLevel']['3']['25'][0],'raw':'main','method':'Full'}
        for raw,invalid in [('Unreadable',False),('ATK 999',False),('Unreadable',True)]:
            with (self.subTest(raw=raw,invalid=invalid),
                  patch.object(scanner,'recognize_echo',return_value=(echo['id'],1,echo['sonataSetIds'][0],{})),
                  patch.object(scanner,'read_main',return_value=main),
                  patch.object(scanner,'read_secondary',return_value={'stat':{'name':None,'value':None},
                      'raw':raw,'retry':'noise','method':'Unresolved'}),
                  patch.object(scanner.card,'read_substat_rows',return_value=(legal,['']*5,['']*5)),
                  patch.object(scanner,'review_substat',side_effect=lambda row,*a:row)):
                rows=[dict(x) for x in legal]
                if invalid: rows[-1]={'name':None,'value':None}
                with patch.object(scanner.card,'read_substat_rows',return_value=(rows,['']*5,['']*5)):
                    result=scanner.read_echo(np.zeros((413,368,3),np.uint8))
                should_recover=raw=='Unreadable' and not invalid
                if should_recover:
                    self.assertEqual(result['secondaryMainStat'],rules['secondaryMainStatsByCostAndLevel']['3']['25'])
                    self.assertTrue(result['evidence']['secondaryRecovery']['requiresReview'])
                    self.assertEqual(result['evidence']['secondaryRecovery']['raw'],raw)
                else:
                    self.assertIsNone(result['secondaryMainStat']['name'])
                    self.assertNotIn('secondaryRecovery',result['evidence'])

    def test_all_five_mixed_cost_positions_validated_together(self):
        draft=valid();rules=scanner.data.CATALOG['statEditor']
        costs=[4,3,3,1,1]
        for i,cost in enumerate(costs):
            identity=next(e for e in scanner.data.CATALOG['echoes'] if e['cost']==cost)
            draft['echoes'][i]={'echoId':identity['id'],'sonataId':identity['sonataSetIds'][0],
                'cost':cost,'rank':None,'level':None,
                'mainStat':rules['mainStatsByCostAndLevel'][str(cost)]['25'][0],
                'secondaryMainStat':rules['secondaryMainStatsByCostAndLevel'][str(cost)]['25'],
                'substats':[{'name':x['name'],'value':x['values'][0]} for x in rules['substats'][:5]]}
        self.assertEqual(scanner.validate_draft(draft),[])
        for i in range(5):draft['echoes'][i]['secondaryMainStat']={'name':None,'value':None}
        self.assertEqual([issue['path'] for issue in scanner.validate_draft(draft)],
                         [f'echoes.{i}.secondaryMainStat' for i in range(5)])

    def test_weak_identity_is_not_promoted_and_rows_do_not_shift(self):
        from unittest.mock import patch
        echo=next(e for e in scanner.data.CATALOG['echoes'] if e['cost']==3)
        unknown={'stat':{'name':None,'value':None},'raw':''}
        rows=[None,{'name':'Crit Rate','value':'6.3%'},None,None,None]
        with patch.object(scanner,'recognize_echo',return_value=(None,.01,None,{'suggestion':{'echoId':echo['id'],'sonataId':echo['sonataSetIds'][0]}})), \
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
