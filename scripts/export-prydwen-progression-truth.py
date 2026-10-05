#!/usr/bin/env python3
"""Capture Prydwen factual identity/Lv90 profile fields without build recommendations."""
from __future__ import annotations
import argparse,json,pathlib,re
from concurrent.futures import ProcessPoolExecutor,as_completed
from datetime import datetime,timezone
from typing import Any

def args():
    p=argparse.ArgumentParser()
    p.add_argument("--roster",default="data/factory/character-truth/roster.json")
    p.add_argument("--output",default="data/factory/character-truth/prydwen-progression-truth.json")
    p.add_argument("--workers",type=int,default=4)
    a=p.parse_args()
    if a.workers<1 or a.workers>4:p.error("--workers must be 1..4")
    return a

def unavailable(row,captured_at,warning):
    return {"bellibingCharacterId":row["characterId"],"providerCharacterId":row["prydwenSlug"],
      "providerDisplayName":None,"sourceUrl":row["sourceUrl"],"releaseStatusAtCapture":row["releaseStatus"],
      "freshnessSensitive":row["releaseStatus"]!="RELEASED","capturedAt":captured_at,
      "captureStatus":"UNAVAILABLE","identity":None,"level90":None,"warnings":[warning]}

def parse(text,row,captured_at):
    warnings=[]
    def one(pattern,label,cast=str):
        m=re.search(pattern,text,re.I|re.S)
        if not m:
            warnings.append(f"missing {label}");return None
        try:return cast(m.group(1))
        except Exception as exc:
            warnings.append(f"{label}: {type(exc).__name__}: {exc}");return None
    identity_match=re.search(r"is a\s+(4|5)★\s+rarity character.*?\b(Glacio|Fusion|Electro|Aero|Spectro|Havoc)\b.*?element who uses the\s+(Broadblade|Sword|Pistols|Gauntlets|Rectifier)\s+type weapon",text,re.I|re.S)
    identity={
      "rarity":int(identity_match.group(1)) if identity_match else None,
      "element":identity_match.group(2).title() if identity_match else None,
      "weaponType":identity_match.group(3).title() if identity_match else None,
    }
    if not identity_match:warnings.append("missing factual Introduction identity sentence")
    stats_unavailable=bool(re.search(r"Stats (?:data |information )?(?:are|is)n't available|stats aren't available|Stats data not available",text,re.I))
    level90=None
    if not stats_unavailable:
        hp=one(r"\bHP\s*([0-9]+)\b","level90.hp",int)
        atk=one(r"\bATK\s*([0-9]+)\b","level90.atk",int)
        defense=one(r"\bDEF\s*([0-9]+)\b","level90.def",int)
        energy=one(r"Max Energy\s*([0-9]+)\b","level90.maxEnergy",int)
        if any(v is not None for v in (hp,atk,defense,energy)):
            level90={"hp":hp,"atk":atk,"def":defense,"maxEnergy":energy}
    else:
        warnings.append("source explicitly reports Stats unavailable")
    status="CAPTURED" if all(v is not None for v in identity.values()) and level90 and all(v is not None for v in level90.values()) else "PARTIAL"
    return {"bellibingCharacterId":row["characterId"],"providerCharacterId":row["prydwenSlug"],
      "providerDisplayName":row["name"],"sourceUrl":row["sourceUrl"],"releaseStatusAtCapture":row["releaseStatus"],
      "freshnessSensitive":row["releaseStatus"]!="RELEASED","capturedAt":captured_at,
      "captureStatus":status,"identity":identity,"level90":level90,"warnings":warnings}

def chunk(rows,captured_at):
    from playwright.sync_api import sync_playwright
    out=[]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        ctx=browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153 Safari/537.36")
        for row in rows:
            page=ctx.new_page()
            try:
                response=page.goto(row["sourceUrl"],wait_until="domcontentloaded",timeout=45000)
                if response is None or response.status>=400:raise RuntimeError(f"HTTP {response.status if response else 'NO_RESPONSE'}")
                page.wait_for_timeout(800)
                result=parse(page.locator("body").inner_text(timeout=10000),row,captured_at)
            except Exception as exc:
                result=unavailable(row,captured_at,f"fetch: {type(exc).__name__}: {exc}")
            finally:page.close()
            out.append(result);print(row["characterId"],result["captureStatus"],flush=True)
        ctx.close();browser.close()
    return out

def main():
    a=args();root=pathlib.Path(__file__).resolve().parents[1]
    rows=json.loads((root/a.roster).read_text())["characters"]
    captured_at=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00","Z")
    n=min(a.workers,len(rows));chunks=[rows[i::n] for i in range(n)];by_id={}
    with ProcessPoolExecutor(max_workers=n) as pool:
        fs={pool.submit(chunk,c,captured_at):c for c in chunks}
        for f in as_completed(fs):
            c=fs[f]
            try:results=f.result()
            except Exception as exc:results=[unavailable(r,captured_at,f"worker: {type(exc).__name__}: {exc}") for r in c]
            for result in results:by_id[result["bellibingCharacterId"]]=result
    chars=[by_id.get(r["characterId"],unavailable(r,captured_at,"worker result missing")) for r in rows]
    payload={"schemaVersion":1,"kind":"PRYDWEN_PROGRESSION_TRUTH_CAPTURE","canonicalAuthority":False,
      "promotionPolicy":"MANUAL_SOURCE_VALIDATION_REQUIRED","providerId":"prydwen-profile-source",
      "providerSurface":"Prydwen Wuthering Waves Character Profile/Stats blocks","capturedAt":captured_at,
      "workerCount":n,"characters":chars,
      "excluded":["roles","ratings","build recommendations","weapons","Echo recommendations","teams","rotations","gameplay guidance"]}
    out=root/a.output;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(payload,indent=2)+"\n")
    print("summary",json.dumps({s:sum(1 for r in chars if r["captureStatus"]==s) for s in ["CAPTURED","PARTIAL","UNAVAILABLE"]}))
if __name__=="__main__":main()
