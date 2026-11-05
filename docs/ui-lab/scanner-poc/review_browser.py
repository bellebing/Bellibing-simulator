"""Real local Chromium review; requires playwright + an installed Chromium.

python review_browser.py --fixtures /path/to/private-fixtures --artifacts /tmp/review
Screenshots contain the owner's build data. Keep artifacts outside Git.
"""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

def run(fixtures,artifacts,url,chromium):
    artifacts.mkdir(parents=True,exist_ok=True)
    report={'groups':[],'pageErrors':[]}
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=chromium,headless=True,args=['--no-sandbox'])
        context=browser.new_context(viewport={'width':1440,'height':900})
        context.add_init_script("localStorage.setItem('bellibing-ui-checkpoint-v34', '{\"sentinel\":true}');localStorage.setItem('scanner-review-sentinel','unchanged');")
        page=context.new_page();page.on('pageerror',lambda e:report['pageErrors'].append(str(e)))
        page.goto(url)
        def upload(name):
            page.locator('#upload').set_input_files(str(fixtures/(name+'.jpg')))
            expect(page.locator('#status')).to_contain_text('Scan complete',timeout=60000)
            expect(page.locator('.echo-card')).to_have_count(5)
            expect(page.locator('[data-path="character.id"]')).to_have_value(name)
        def change(path,value):
            f=page.locator(f'[data-path="{path}"]');f.fill(str(value));f.press('Tab')
        def storage():return page.evaluate('() => JSON.stringify({...localStorage})')
        before=storage()
        for name in ['lupa','chisa','ciaccona']:
            upload(name)
            assert page.locator('#save').is_disabled()
            assert page.locator('#accept').is_disabled()
            for key in ['basic','skill','circuit','intro','liberation']:
                expect(page.locator(f'[data-path="skills.{key}"]')).to_have_value('10')
            if name=='ciaccona':
                expect(page.locator('#issues')).to_contain_text('echoes.1.echoId')
                expect(page.locator('.raw').filter(has_text='11.9%')).to_be_visible()
                page.get_by_role('button',name='Confirm image match: Capitaneus').click()
            expect(page.locator('#issues li')).to_have_count(0)
            assert storage()==before
            page.screenshot(path=str(artifacts/(name+'-1440.png')),full_page=True)
            report['groups'].append(name+' real upload and editable review')
        change('echoes.0.substats.0.value',1.23)
        expect(page.locator('#issues')).to_contain_text('echoes.0.substats.0')
        assert page.locator('#accept').is_disabled()
        page.locator('#reset').click()
        expect(page.locator('#issues')).to_contain_text('echoes.1.echoId')
        page.get_by_role('button',name='Confirm image match: Capitaneus').click()
        expect(page.locator('#issues li')).to_have_count(0)
        page.locator('[data-path="echoes.0.substats.1.name"]').select_option('CRIT DMG')
        expect(page.locator('#issues')).to_contain_text('Duplicate substat')
        page.locator('#reset').click();page.get_by_role('button',name='Confirm image match: Capitaneus').click()
        expect(page.locator('#issues li')).to_have_count(0)
        page.locator('#checked').check();expect(page.locator('#accept')).to_be_enabled()
        page.locator('#accept').click();expect(page.locator('#confirmation')).to_be_visible()
        page.get_by_role('button',name='Keep editing',exact=True).click();expect(page.locator('#accepted')).to_be_empty()
        page.locator('#accept').click();page.get_by_role('button',name='Confirm draft',exact=True).click()
        expect(page.locator('#accepted')).to_contain_text('Inventory has not been changed')
        assert storage()==before
        change('weapon.level',80);expect(page.locator('#accepted')).to_be_empty();assert not page.locator('#checked').is_checked()
        report['groups'].extend(['illegal tier and duplicate detection','reset preserves all observed rows','explicit review, cancel, confirm and edit invalidation','production storage unchanged'])
        for width,height in [(1920,1080),(390,844)]:
            page.set_viewport_size({'width':width,'height':height})
            assert page.evaluate('() => document.documentElement.scrollWidth <= innerWidth')
            page.screenshot(path=str(artifacts/f'ciaccona-{width}.png'),full_page=True)
        report['groups'].append('1440/1920 desktop and 390 mobile containment')
        page.locator('#upload').set_input_files({'name':'bad.png','mimeType':'image/png','buffer':b'not an image'})
        expect(page.locator('#status')).to_contain_text('Unreadable card',timeout=15000)
        expect(page.locator('#review')).to_be_hidden()
        assert storage()==before
        # API gates are checked on the same actual local server.
        for headers,status in [({'Content-Type':'text/plain'},415),({'Content-Type':'image/png','Origin':'https://unrelated.invalid'},403)]:
            r=context.request.post(url+'/api/scan',data=b'bad',headers=headers);assert r.status==status
        report['groups'].append('bad upload, wrong content type and cross-origin rejection')
        assert not report['pageErrors'],report['pageErrors']
        browser.close()
    (artifacts/'browser-report.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--fixtures',type=Path,required=True);p.add_argument('--artifacts',type=Path,required=True)
    p.add_argument('--url',default='http://127.0.0.1:8765');p.add_argument('--chromium',default='/usr/bin/chromium');a=p.parse_args()
    run(a.fixtures.resolve(),a.artifacts,a.url,a.chromium)
