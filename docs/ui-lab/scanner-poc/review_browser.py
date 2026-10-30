"""Focused real-card/local Chromium review. Private images/screenshots stay local."""
import argparse
import base64
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

def run(fixtures,artifacts,url,chromium):
    artifacts.mkdir(parents=True,exist_ok=True)
    gold=json.loads((fixtures/'expected.json').read_text());report={'groups':[],'pageErrors':[]}
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=chromium,headless=True,args=['--no-sandbox'])
        context=browser.new_context(viewport={'width':1440,'height':900})
        context.add_init_script("if(!localStorage.getItem('bellibing-ui-checkpoint-v34'))localStorage.setItem('bellibing-ui-checkpoint-v34','{\"characters\":[],\"drafts\":{}}');sessionStorage.setItem('scanner-review-sentinel','unchanged');")
        page=context.new_page();page.on('pageerror',lambda e:report['pageErrors'].append(str(e)))
        page.goto(url+'/#build')
        def storage():return page.evaluate('() => JSON.stringify([{...localStorage},{...sessionStorage}])')
        before=storage()
        def group(label):report['groups'].append(label)
        def check_card(name):
            expect(page.locator('#status')).to_contain_text('Scan complete',timeout=60000)
            expect(page.locator('[data-path="character.id"]')).to_have_value(name)
            expect(page.locator('.echo-card')).to_have_count(5);expect(page.locator('#issues li')).to_have_count(0)
            for i in range(5):
                assert page.locator(f'[data-path="echoes.{i}.echoId"] option:checked').inner_text()==gold[name]['echoNames'][i]
                expect(page.locator(f'[data-path="echoes.{i}.sonataId"]')).to_have_value(f"sonata-{gold[name]['sonatas'][i]}")
            assert page.locator('#save').is_disabled();assert page.locator('#accept').is_disabled()
        def confirm():
            page.locator('#checked').check();page.locator('#accept').click();expect(page.locator('#confirmation')).to_be_visible()
            page.get_by_role('button',name='Confirm draft',exact=True).click();expect(page.locator('#accepted')).to_contain_text('Not saved to Inventory')
        def inject(name,event,target=None):
            data={'data':base64.b64encode((fixtures/(name+'.jpg')).read_bytes()).decode(),'name':name+'.jpg','event':event}
            script="""({data,name,event})=>{const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));const dt=new DataTransfer();dt.items.add(new File([bytes],name,{type:'image/jpeg'}));document.dispatchEvent(event==='paste'?new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:dt}):new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt}));}"""
            (target or page).evaluate(script,data)
        page.locator('#globalImportToggle').click();expect(page).to_have_url(url+'/#build')
        page.locator('#upload').set_input_files(str(fixtures/'lupa.jpg'));check_card('lupa')
        page.locator('#checked').check();page.locator('#accept').click();page.get_by_role('button',name='Keep editing',exact=True).click()
        expect(page.locator('#stageCount')).to_have_text('No staged imports')
        confirm();page.locator('#continueWorkflow').click();expect(page.locator('#importPanel')).to_be_hidden()
        expect(page).to_have_url(url+'/#build');expect(page.locator('[data-page=build] .character-hero h2')).to_have_text('Lupa')
        group('Lupa upload: five automatic identities/Sonatas, explicit cancel/confirm, Build staged preview')
        page.locator('[data-nav=teams]').click();page.get_by_label('Team Character 1',exact=True).select_option('lupa')
        page.locator('#globalImportToggle').click();inject('chisa','drop');check_card('chisa');confirm();page.locator('#continueWorkflow').click()
        expect(page).to_have_url(url+'/#teams');expect(page.get_by_label('Team Character 1',exact=True)).to_have_value('lupa')
        group('Chisa drag-and-drop: five identities/Sonatas; existing Team selection retained')
        page.locator('[data-nav=sandbox]').click()
        frame=page.frame_locator('#sandboxFrame');expect(frame.locator('body')).to_have_attribute('data-build-kind','SANDBOX_BUILD',timeout=20000)
        expect(page.locator('#sandboxFrame')).to_have_attribute('data-import-ready','true')
        sandbox_before=frame.locator('.current-name strong').inner_text()
        # Actual file paste from the existing Sandbox document is forwarded only
        # into the outer review panel, never into its simulation/account state.
        inject('ciaccona','paste',page.frames[1]);check_card('ciaccona')
        expect(page.locator('.raw').filter(has_text='verified importer mapping')).to_contain_text('11.9%')
        expect(page.locator('.raw').filter(has_text='verified importer mapping')).to_contain_text('11.8%')
        assert frame.locator('.current-name strong').inner_text()==sandbox_before
        confirm();page.locator('#openImportedImprove').click();expect(page).to_have_url(url+'/#improve')
        expect(page.get_by_role('heading',name='Ciaccona · imported preview',exact=True)).to_be_visible()
        expect(page.locator('.ownership-columns')).to_contain_text('No saved owned build')
        expect(page.locator('.ownership-columns')).to_contain_text('No Candidate selected')
        group('Ciaccona paste from Sandbox: five identities/Sonatas, DEF evidence, direct staged Improve preview')
        # All main routes expose the same inline panel; navigation never destroys it.
        for route in ['home','build','improve','teams','sandbox','inventory','account']:
            page.evaluate('(route)=>{location.hash=route}',route)
            expect(page.locator('body')).to_have_attribute('data-route',route)
            if page.locator('#importPanel').is_visible():page.locator('#closeImport').click()
            page.locator('#globalImportToggle').click();expect(page.locator('#importPanel')).to_be_visible()
            expect(page.locator('[data-path="character.id"]')).to_have_value('ciaccona')
            assert page.url.endswith('#'+route)
        group('Global import on all seven routes without navigation or loss of review state')
        field=page.locator('[data-path="echoes.0.substats.0.value"]');field.fill('1.23');field.press('Tab')
        expect(page.locator('#issues')).to_contain_text('echoes.0.substats.0');assert not page.locator('#checked').is_checked()
        assert page.locator('#accept').is_disabled();expect(page.locator('#accepted')).to_be_empty()
        page.locator('#reset').click();expect(page.locator('#issues li')).to_have_count(0)
        page.locator('[data-path="echoes.0.substats.1.name"]').select_option('CRIT DMG')
        expect(page.locator('#issues')).to_contain_text('Duplicate substat')
        page.locator('#reset').click();expect(page.locator('#issues li')).to_have_count(0)
        group('Corrections invalidate confirmation; invalid tiers/duplicates block; reset retains all five rows')
        # Bad input must keep the prior corrected/recognized draft and all stages.
        page.locator('#upload').set_input_files({'name':'bad.png','mimeType':'image/png','buffer':b'not an image'})
        expect(page.locator('#status')).to_contain_text('previous review is unchanged',timeout=15000)
        expect(page.locator('[data-path="character.id"]')).to_have_value('ciaccona')
        page.keyboard.press('Escape');expect(page.locator('#importPanel')).to_be_hidden()
        expect(page.locator('#globalImportToggle')).to_be_focused()
        group('Bad upload preserves review/staging; Escape closes panel and returns keyboard focus')
        assert storage()==before
        page.locator('[data-nav=inventory]').click();expect(page.locator('[data-page=inventory] .stage-item')).to_have_count(3)
        expect(page.locator('#stageCount')).to_have_text('3 staged Characters · not saved')
        page.screenshot(path=str(artifacts/'staging-1440.png'),full_page=True)
        page.locator('[data-nav=improve]').click();page.locator('[data-page=improve]').get_by_label('Staged Character',exact=True).select_option('ciaccona')
        for width,height in [(1440,900),(1920,1080),(390,844)]:
            page.set_viewport_size({'width':width,'height':height})
            assert page.evaluate('() => document.documentElement.scrollWidth <= innerWidth')
            center=page.locator('.center-nav').evaluate('(n)=>(n.getBoundingClientRect().left+n.getBoundingClientRect().width/2)-innerWidth/2')
            assert abs(center)<1,(width,center)
            page.screenshot(path=str(artifacts/f'improve-{width}.png'),full_page=True)
        page.set_viewport_size({'width':1440,'height':900});page.locator('#globalImportToggle').click()
        page.screenshot(path=str(artifacts/'import-inline-1440.png'),full_page=True)
        assert page.locator('#importPanel').bounding_box()['y']>=page.locator('.site-header').bounding_box()['height']-1
        group('Actual centered navigation and inline panel: 1440/1920 desktop and 390 mobile containment')
        assert storage()==before;assert not report['pageErrors'],report['pageErrors']
        for endpoint in ['/docs/ui-lab/scanner-poc/private-fixtures/ciaccona.jpg','/docs/ui-prototypes/v34-functional.html','/.git/config','/docs/ui-lab/../../.git/config']:
            assert context.request.get(url+endpoint).status==404
        for headers,status in [({'Content-Type':'text/plain'},415),({'Content-Type':'image/png','Origin':'https://unrelated.invalid'},403)]:
            assert context.request.post(url+'/api/scan',data=b'bad',headers=headers).status==status
        group('Production/session storage unchanged; private paths and unsafe requests rejected')
        page.reload();expect(page.locator('#stageCount')).to_have_text('No staged imports')
        group('Reload clears session staging without creating persisted ownership')
        browser.close()
    (artifacts/'browser-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--fixtures',type=Path,required=True);p.add_argument('--artifacts',type=Path,required=True)
    p.add_argument('--url',default='http://127.0.0.1:8765');p.add_argument('--chromium',default='/usr/bin/chromium');a=p.parse_args()
    run(a.fixtures.resolve(),a.artifacts,a.url,a.chromium)
