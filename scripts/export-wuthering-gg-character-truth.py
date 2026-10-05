#!/usr/bin/env python3
"""Capture factual identity/Lv90 progression evidence from Wuthering.gg.

The page also contains recommendations/build content; this extractor intentionally
does not store or parse any of it.
"""
from __future__ import annotations
import argparse, json, pathlib, re, sys
from concurrent.futures import ProcessPoolExecutor, as_completed
from datetime import datetime, timezone
from typing import Any

def args():
    p=argparse.ArgumentParser()
    p.add_argument("--roster",default="data/factory/character-truth/roster.json")
    p.add_argument("--output",default="data/factory/character-truth/wuthering-gg-character-truth.json")
    p.add_argument("--workers",type=int,default=4)
    a=p.parse_args()
    if a.workers < 1 or a.workers > 4: p.error("--workers must be 1..4")
    return a

def norm_weapon(value:str)->str:
    aliases={"Pistol":"Pistols","Gauntlet":"Gauntlets"}
    return aliases.get(value,value)

def parse_page(text:str,row:dict[str,Any],url:str,captured_at:str)->dict[str,Any]:
    warnings=[]
    def one(pattern,label,cast=str):
        m=re.search(pattern,text,re.I|re.S)
        if not m:
            warnings.append(f"missing {label}")
            return None
        try: return cast(m.group(1))
        except Exception as exc:
            warnings.append(f"{label}: {type(exc).__name__}: {exc}")
            return None
    source_name="Shorekeeper" if row["characterId"]=="the-shorekeeper" else row["name"]
    intro=re.search(rf"{re.escape(source_name)}\s+in Wuthering Waves is a\s+(4|5)\s+Stars\s+(Glacio|Fusion|Electro|Aero|Spectro|Havoc)\s+character who wields a\s+(Broadblade|Sword|Pistols?|Gauntlets?|Rectifier)",text,re.I)
    rarity=int(intro.group(1)) if intro else one(r"\n(4|5)★", "rarity", int)
    element=intro.group(2).title() if intro else None
    weapon=norm_weapon(intro.group(3).title()) if intro else None
    if not intro:
        warnings.append("missing structured introduction identity sentence")
    hp=one(r"\bHP\s+(?:HP\s+)?([0-9]+)", "level90.hp", int)
    atk=one(r"\bATK\s+(?:ATK\s+)?([0-9]+)", "level90.atk", int)
    defense=one(r"\bDEF\s+(?:DEF\s+)?([0-9]+)", "level90.def", int)
    energy=one(r"Max Resonance Energy\s*([0-9]+)", "maxResonanceEnergy", int)
    identity={"rarity":rarity,"element":element,"weaponType":weapon}
    level90={"hp":hp,"atk":atk,"def":defense,"maxResonanceEnergy":energy}
    status="CAPTURED" if all(v is not None for v in identity.values()) and all(v is not None for v in level90.values()) else "PARTIAL"
    return {
      "bellibingCharacterId":row["characterId"],"providerCharacterId":row["characterId"],
      "providerDisplayName":row["name"],"sourceUrl":url,"releaseStatusAtCapture":row["releaseStatus"],
      "freshnessSensitive":row["releaseStatus"]!="RELEASED","capturedAt":captured_at,
      "captureStatus":status,"identity":identity,"level90":level90,"sequenceNames":[],"warnings":warnings,
    }

def unavailable(row,captured_at,warning):
    return {
      "bellibingCharacterId":row["characterId"],"providerCharacterId":row["characterId"],
      "providerDisplayName":None,"sourceUrl":f"https://wuthering.gg/characters/{row['characterId']}",
      "releaseStatusAtCapture":row["releaseStatus"],"freshnessSensitive":row["releaseStatus"]!="RELEASED",
      "capturedAt":captured_at,"captureStatus":"UNAVAILABLE","identity":None,"level90":None,"sequenceNames":[],
      "warnings":[warning],
    }

def capture_chunk(rows,captured_at):
    from playwright.sync_api import sync_playwright
    out=[]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        context=browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153 Safari/537.36")
        for row in rows:
            page=context.new_page()
            slug="shorekeeper" if row["characterId"]=="the-shorekeeper" else row["characterId"]
            url=f"https://wuthering.gg/characters/{slug}"
            try:
                response=page.goto(url,wait_until="domcontentloaded",timeout=45000)
                if response is None or response.status >= 400:
                    raise RuntimeError(f"HTTP {response.status if response else 'NO_RESPONSE'}")
                page.wait_for_timeout(1200)
                text=page.locator("body").inner_text(timeout=10000)
                result=parse_page(text,row,url,captured_at)
                headings=page.locator("h2,h3").all_inner_texts()
                in_chain=False
                names=[]
                for heading in headings:
                    clean=" ".join(heading.split())
                    source_name="Shorekeeper" if row["characterId"]=="the-shorekeeper" else row["name"]
                    if clean.lower()==f"{source_name} resonance chain".lower():
                        in_chain=True
                        continue
                    if in_chain and clean.lower().endswith(" background"):
                        break
                    if in_chain and clean and clean not in names:
                        names.append(clean)
                result["sequenceNames"]=names[:6]
                if len(result["sequenceNames"])!=6:
                    result["captureStatus"]="PARTIAL"
                    result["warnings"].append(f"expected 6 Resonance Chain headings, got {len(result['sequenceNames'])}")
            except Exception as exc:
                result=unavailable(row,captured_at,f"fetch: {type(exc).__name__}: {exc}")
            finally:
                page.close()
            out.append(result); print(row["characterId"],result["captureStatus"],flush=True)
        context.close(); browser.close()
    return out

def main():
    a=args(); root=pathlib.Path(__file__).resolve().parents[1]
    rows=json.loads((root/a.roster).read_text())["characters"]
    captured_at=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00","Z")
    n=min(a.workers,len(rows)); chunks=[rows[i::n] for i in range(n)]; by_id={}
    with ProcessPoolExecutor(max_workers=n) as pool:
        fs={pool.submit(capture_chunk,chunk,captured_at):chunk for chunk in chunks}
        for f in as_completed(fs):
            chunk=fs[f]
            try: results=f.result()
            except Exception as exc:
                results=[unavailable(row,captured_at,f"worker: {type(exc).__name__}: {exc}") for row in chunk]
            for result in results: by_id[result["bellibingCharacterId"]]=result
    characters=[by_id.get(row["characterId"],unavailable(row,captured_at,"worker result missing")) for row in rows]
    payload={
      "schemaVersion":1,"kind":"WUTHERING_GG_CHARACTER_TRUTH_CAPTURE","canonicalAuthority":False,
      "promotionPolicy":"MANUAL_SOURCE_VALIDATION_REQUIRED","providerId":"wuthering-gg",
      "providerSurface":"Wuthering.gg Character pages","capturedAt":captured_at,"workerCount":n,
      "characters":characters,
      "excluded":["builds","recommendations","best weapons","Echo recommendations","teams","rotations","ratings","guide prose"],
    }
    out=root/a.output; out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n")
    print("summary",json.dumps({s:sum(1 for r in characters if r["captureStatus"]==s) for s in ["CAPTURED","PARTIAL","UNAVAILABLE"]}))
if __name__=="__main__": main()
