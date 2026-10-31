"""Focused import-overlay regression and actual local review screenshots."""
import argparse
import base64
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect


def run(fixtures, artifacts, url, chromium):
    artifacts.mkdir(parents=True, exist_ok=True)
    gold = json.loads((fixtures / 'expected.json').read_text())['chisa']
    report = {'groups': [], 'pageErrors': []}
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium, headless=True, args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': 1440, 'height': 900})
        page.on('pageerror', lambda e: report['pageErrors'].append(str(e)))
        page.goto(url + '/#build')
        expect(page.locator('body')).to_have_attribute('data-route', 'build')
        storage = page.evaluate('JSON.stringify([{...localStorage},{...sessionStorage}])')
        panel, trigger = page.locator('#importPanel'), page.locator('#globalImportToggle')
        for route in ['build', 'improve', 'teams', 'inventory', 'account', 'home', 'sandbox']:
            page.evaluate('(r)=>{location.hash=r}', route)
            expect(page.locator('body')).to_have_attribute('data-route', route)
            if route == 'sandbox':
                expect(page.frame_locator('#sandboxFrame').locator('body')).to_have_attribute('data-build-kind', 'SANDBOX_BUILD')
                page.evaluate('scrollTo(0,80)')
            before = page.locator('#workspace').bounding_box()
            scroll = page.evaluate('scrollY')
            trigger.click()
            expect(panel).to_be_visible()
            expect(panel).to_have_css('transform', 'none')
            box, anchor = panel.bounding_box(), trigger.bounding_box()
            assert box['width'] == 300 and box['height'] < 160, box
            assert abs(box['x'] + box['width'] - anchor['x'] - anchor['width']) < 1
            assert page.locator('#dropzone').inner_text() == 'Drag build card here'
            assert page.locator('#workspace').bounding_box() == before
            assert page.evaluate('scrollY') == scroll
            assert page.url.endswith('#' + route)
            assert panel.evaluate('n=>getComputedStyle(n).position') == 'fixed'
            if route in ['build', 'sandbox']:
                page.screenshot(path=str(artifacts / f'import-popover-{route}-1440.png'), animations='disabled')
            page.keyboard.press('Escape')
            expect(panel).to_be_hidden()
            expect(trigger).to_be_focused()
            if route == 'sandbox':
                trigger.click()
                page.frame_locator('#sandboxFrame').locator('body').click(position={'x': 4, 'y': 4})
                expect(panel).to_be_hidden()
        report['groups'].append('Compact button-anchored overlay on all seven routes; tool geometry, scroll and route unchanged')
        page.evaluate("location.hash='build'")
        expect(page.locator('body')).to_have_attribute('data-route', 'build')
        for width in [1440, 1920]:
            page.set_viewport_size({'width': width, 'height': 900})
            trigger.click()
            expect(panel).to_have_css('transform', 'none')
            assert abs(panel.bounding_box()['x'] + 300 - trigger.bounding_box()['x'] - trigger.bounding_box()['width']) < 1
            page.locator('[data-page=build] .page-title h1').click()
            expect(panel).to_be_hidden()
        trigger.click(); trigger.click(); expect(panel).to_be_hidden()
        report['groups'].append('Trigger toggle, Escape/focus and outside-click dismissal; anchored at both desktop widths')
        page.set_viewport_size({'width': 1440, 'height': 900})
        trigger.click()
        with page.expect_file_chooser() as chooser:
            page.locator('#dropzone').click()
        assert not chooser.value.is_multiple()
        # Browser DataTransfer exercises the real handlers, not a native OS drag.
        data = base64.b64encode((fixtures / 'chisa.jpg').read_bytes()).decode()
        transfer = page.evaluate_handle("""data=>{const dt=new DataTransfer();dt.items.add(new File([Uint8Array.from(atob(data),c=>c.charCodeAt(0))],'chisa.jpg',{type:'image/jpeg'}));return dt;}""", data)
        before = page.locator('#workspace').bounding_box()
        page.dispatch_event('#dropzone', 'dragover', {'dataTransfer': transfer})
        expect(page.locator('#dropzone')).to_have_class('dropzone is-dragging')
        page.screenshot(path=str(artifacts / 'import-popover-drag-1440.png'), animations='disabled')
        page.dispatch_event('#dropzone', 'drop', {'dataTransfer': transfer})
        expect(page.locator('[data-path="character.id"]')).to_have_value('chisa', timeout=30000)
        expect(page.locator('#status')).to_contain_text('Scan complete', timeout=30000)
        expect(page.locator('#issues li')).to_have_count(0)
        for i in range(5):
            assert page.locator(f'[data-path="echoes.{i}.echoId"] option:checked').inner_text() == gold['echoNames'][i]
            assert page.locator(f'[data-path="echoes.{i}.sonataId"]').input_value() == f"sonata-{gold['sonatas'][i]}"
        assert page.locator('#workspace').bounding_box() == before
        assert panel.evaluate('n=>n.scrollHeight>n.clientHeight')
        page.screenshot(path=str(artifacts / 'import-popover-review-1440.png'), animations='disabled')
        report['groups'].append('Click opens file chooser; real Chisa drop recognizes five identities/Sonatas in scrollable overlay without reflow')
        page.locator('#checked').check()
        skill = page.locator('[data-path="skills.basic"]')
        skill.fill('9'); skill.press('Tab')
        assert not page.locator('#checked').is_checked()
        assert page.locator('#accept').is_disabled()
        page.keyboard.press('Escape'); trigger.click()
        expect(skill).to_have_value('9')
        expect(page.locator('#stageCount')).to_have_text('No staged imports')
        page.locator('#checked').check(); page.locator('#accept').click()
        page.get_by_role('button', name='Keep editing', exact=True).click()
        expect(page.locator('#stageCount')).to_have_text('No staged imports')
        page.locator('#accept').click()
        page.get_by_role('button', name='Confirm draft', exact=True).click()
        expect(page.locator('#stageCount')).to_have_text('1 staged Character · not saved')
        assert page.locator('#save').is_disabled()
        page.locator('#continueWorkflow').click()
        expect(panel).to_be_hidden()
        expect(page.locator('[data-page=build] .character-hero h2')).to_have_text('Chisa')
        assert page.evaluate('JSON.stringify([{...localStorage},{...sessionStorage}])') == storage
        assert not report['pageErrors'], report['pageErrors']
        report['groups'].append('Correction retained on reopen; confirmation invalidated; cancel/explicit staging work; Inventory and storage unchanged')
        browser.close()
    (artifacts / 'import-popover-report.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--fixtures', type=Path, required=True)
    p.add_argument('--artifacts', type=Path, required=True)
    p.add_argument('--url', default='http://127.0.0.1:8765')
    p.add_argument('--chromium', default='/usr/bin/chromium')
    a = p.parse_args()
    run(a.fixtures.resolve(), a.artifacts, a.url, a.chromium)
