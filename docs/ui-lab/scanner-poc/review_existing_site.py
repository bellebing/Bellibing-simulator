"""Focused proof that the import overlay preserves the original #361 Build page."""
from pathlib import Path
import json,hashlib,argparse
from playwright.sync_api import sync_playwright,expect
parser=argparse.ArgumentParser()
parser.add_argument('--source-root',type=Path,required=True)
parser.add_argument('--artifacts',type=Path,required=True)
parser.add_argument('--url',default='http://127.0.0.1:8766/existing-build')
parser.add_argument('--chromium',default='/usr/bin/chromium')
a=parser.parse_args()
out=a.artifacts;out.mkdir(parents=True,exist_ok=True)
url=a.url
source=a.source_root/'docs/ui-lab/inventory-concept/preview.html'
assert hashlib.sha256(source.read_bytes()).hexdigest()=='a14a9af71df2a09a42adf48461ade5e31edf0bc240e545c92fbf11ad4c441c80', 'Review source differs from pinned #361 artifact'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=a.chromium,headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(url+'?baseline=1#build',wait_until='domcontentloaded')
 expect(page.locator('.selected-still-stage')).to_be_visible(timeout=20000)
 page.wait_for_function('() => [...document.images].every(i=>i.complete&&i.naturalWidth>0)')
 assert page.locator('.selected-still-stage').get_attribute('data-selected-still')=='electro'
 baseline_dom=page.locator('#app').inner_html();baseline_box=page.locator('#app').bounding_box()
 baseline_cards=page.locator('.bellibing-card,.hero-echo').evaluate_all('ns=>ns.map(n=>{const r=n.getBoundingClientRect();return [r.x,r.y,r.width,r.height]})')
 page.screenshot(path=str(out/'actual-build-before-import-1440.png'),animations='disabled')
 page.goto(url+'#build',wait_until='domcontentloaded')
 expect(page.locator('#globalImportToggle')).to_have_attribute('data-import-ready','true',timeout=20000)
 page.wait_for_function('() => [...document.images].every(i=>i.complete&&i.naturalWidth>0)')
 assert page.locator('#app').inner_html()==baseline_dom
 assert page.locator('#app').bounding_box()==baseline_box
 assert page.locator('.bellibing-card,.hero-echo').evaluate_all('ns=>ns.map(n=>{const r=n.getBoundingClientRect();return [r.x,r.y,r.width,r.height]})')==baseline_cards
 storage=page.evaluate('JSON.stringify([{...localStorage},{...sessionStorage}])')
 page.locator('#globalImportToggle').click()
 panel=page.locator('#importPanel');expect(panel).to_be_visible();expect(panel).to_have_css('transform','none')
 assert panel.bounding_box()['width']==300
 assert panel.locator('#review').count()==0
 assert page.locator('#app').inner_html()==baseline_dom
 assert page.locator('#app').bounding_box()==baseline_box
 page.screenshot(path=str(out/'actual-build-import-1440.png'),animations='disabled')
 with page.expect_file_chooser() as f:page.locator('#dropzone').click()
 assert not f.value.is_multiple()
 page.keyboard.press('Escape');expect(panel).to_be_hidden()
 page.locator('#globalImportToggle').click()
 page.locator('.selected-still-stage').click(position={'x':500,'y':200});expect(panel).to_be_hidden()
 page.set_viewport_size({'width':1920,'height':1080});page.locator('#globalImportToggle').click()
 expect(panel).to_have_css('transform','none')
 page.screenshot(path=str(out/'actual-build-import-1920.png'),animations='disabled')
 assert page.evaluate('JSON.stringify([{...localStorage},{...sessionStorage}])')==storage
 assert not errors,errors
 report={'source':'existing PR #361 portable Build page, unmodified original content','sourceHead':'9b457579818c212380d5911592a34c2076d64282','sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'viewports':[[1440,900],[1920,1080]],'mainDomIdenticalToBaseline':True,'mainGeometryIdenticalToBaseline':True,'characterEchoCardGeometryIdentical':True,'added':'Import Character trigger plus original compact drop component in isolated shadow root','storageUnchanged':True,'fileChooserOpens':True,'escapeAndOutsideDismiss':True,'pageErrors':errors,'scope':'visual/input integration; imported builds are not yet bound to the original Build owner, no save or fake review'}
 (out/'actual-build-import-report.json').write_text(json.dumps(report,indent=2)+'\n')
 print(json.dumps(report,indent=2));browser.close()
