#!/usr/bin/env python3
"""Capture structured factual Character data from Hakush.

No recommendations, teams, rotations or inferred mechanics are stored. Large guide
prose is intentionally omitted; only structured facts and short evidence snippets
needed for later semantic review are retained.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import urllib.request
from datetime import datetime, timezone
from typing import Any

BASE="https://api.hakush.in/ww"
ELEMENTS={1:"Glacio",2:"Fusion",3:"Electro",4:"Aero",5:"Spectro",6:"Havoc"}
WEAPONS={1:"Broadblade",2:"Sword",3:"Pistols",4:"Gauntlets",5:"Rectifier"}

def args():
    p=argparse.ArgumentParser()
    p.add_argument("--roster",default="data/factory/character-truth/roster.json")
    p.add_argument("--manifest",default="docs/ui-prototypes/assets/builder-icons/manifest.json")
    p.add_argument("--output",default="data/factory/character-truth/hakush-character-truth.json")
    return p.parse_args()

def fetch_json(url:str)->tuple[Any,str]:
    req=urllib.request.Request(url,headers={"User-Agent":"Bellibing Character truth capture","Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=45) as response:
        raw=response.read()
    return json.loads(raw),hashlib.sha256(raw).hexdigest()

def compact(value:Any,limit:int=320)->str|None:
    if not isinstance(value,str) or not value.strip(): return None
    text=" ".join(value.replace("\n"," ").split())
    return text if len(text)<=limit else text[:limit].rstrip()+"…"

def source_id_map(manifest:dict[str,Any])->dict[str,str]:
    return {str(row["characterId"]):str(row["sourceId"]) for row in manifest.get("characters",[]) if row.get("sourceId") is not None}

def list_name(row:Any)->str|None:
    if isinstance(row,dict):
        for key in ("en","Name","name"):
            value=row.get(key)
            if isinstance(value,str) and value.strip(): return value.strip()
    return None

def resolve_provider_id(character:dict[str,Any], ids:dict[str,str], listing:dict[str,Any])->tuple[str|None,list[str]]:
    warnings=[]
    pinned=ids.get(character["characterId"])
    if pinned:
        listed=list_name(listing.get(pinned))
        if listed is None:
            warnings.append(f"manifest sourceId {pinned} missing from Hakush list")
        else:
            return pinned,warnings
    exact=[str(key) for key,value in listing.items() if list_name(value)==character["name"]]
    if len(exact)==1: return exact[0],warnings
    if len(exact)==0: warnings.append("no exact Hakush list-name match")
    else: warnings.append(f"ambiguous exact Hakush list-name match: {exact}")
    return None,warnings

def numeric_stats(stats:Any)->dict[str,Any]:
    out={}
    if not isinstance(stats,dict): return out
    for asc_key,levels in stats.items():
        if not isinstance(levels,dict): continue
        asc={}
        for level_key,row in levels.items():
            if not isinstance(row,dict): continue
            value={}
            for source,target in (("Life","hp"),("Atk","atk"),("Def","def")):
                v=row.get(source)
                if isinstance(v,(int,float)): value[target]=v
            if value: asc[str(level_key)]=value
        if asc: out[str(asc_key)]=asc
    return out

def normalized_level_rows(level:Any)->list[dict[str,Any]]:
    if not isinstance(level,dict): return []
    rows=[]
    for key,value in sorted(level.items(),key=lambda kv:int(kv[0]) if str(kv[0]).isdigit() else 999):
        if not isinstance(value,dict): continue
        params=value.get("Param")
        rows.append({
            "levelRowId":str(key),
            "name":value.get("Name") if isinstance(value.get("Name"),str) else None,
            "format":value.get("Format") if isinstance(value.get("Format"),str) else None,
            "params":params if isinstance(params,list) else [],
        })
    return rows

def skill_tree(raw:Any)->list[dict[str,Any]]:
    if not isinstance(raw,dict): return []
    rows=[]
    for node_id,node in raw.items():
        if not isinstance(node,dict): continue
        skill=node.get("Skill") if isinstance(node.get("Skill"),dict) else {}
        rows.append({
            "nodeId":str(node_id),
            "parentNodes":[str(x) for x in node.get("ParentNodes",[]) if isinstance(x,(int,str))],
            "nodeType":node.get("NodeType"),
            "coordinate":node.get("Coordinate"),
            "unlockCondition":node.get("UnLockCondition"),
            "skill":{
                "name":skill.get("Name") if isinstance(skill.get("Name"),str) else None,
                "type":skill.get("Type") if isinstance(skill.get("Type"),str) else None,
                "descriptionEvidence":compact(skill.get("Desc")),
                "levelRows":normalized_level_rows(skill.get("Level")),
                "damage":skill.get("Damage") if isinstance(skill.get("Damage"),dict) else {},
            },
        })
    return rows

def chains(raw:Any)->list[dict[str,Any]]:
    if not isinstance(raw,dict): return []
    out=[]
    for key,value in sorted(raw.items(),key=lambda kv:int(kv[0]) if str(kv[0]).isdigit() else 999):
        if not isinstance(value,dict): continue
        out.append({
            "sequence":int(key) if str(key).isdigit() else key,
            "name":value.get("Name") if isinstance(value.get("Name"),str) else None,
            "params":value.get("Param") if isinstance(value.get("Param"),list) else [],
            "descriptionEvidence":compact(value.get("Desc")),
        })
    return out

def main():
    a=args(); root=pathlib.Path(__file__).resolve().parents[1]
    roster=json.loads((root/a.roster).read_text())
    manifest=json.loads((root/a.manifest).read_text())
    ids=source_id_map(manifest)
    captured_at=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00","Z")
    listing,list_hash=fetch_json(f"{BASE}/data/character.json")
    characters=[]
    for row in roster["characters"]:
        provider_id,warnings=resolve_provider_id(row,ids,listing)
        if provider_id is None:
            characters.append({
                "bellibingCharacterId":row["characterId"],"providerCharacterId":None,
                "providerDisplayName":None,"captureStatus":"UNMAPPED_IDENTITY",
                "releaseStatusAtCapture":row["releaseStatus"],"freshnessSensitive":row["releaseStatus"]!="RELEASED",
                "sourceUrl":f"{BASE}/data/character.json","sourceHash":list_hash,
                "progression":None,"skillTree":[],"sequences":[],"warnings":warnings,
            })
            print(row["characterId"],"UNMAPPED_IDENTITY",flush=True); continue
        url=f"{BASE}/data/en/character/{provider_id}.json"
        try:
            detail,detail_hash=fetch_json(url)
            stats=numeric_stats(detail.get("Stats"))
            level90=stats.get("6",{}).get("90")
            entry={
                "bellibingCharacterId":row["characterId"],"providerCharacterId":provider_id,
                "providerDisplayName":detail.get("Name"),"captureStatus":"CAPTURED",
                "releaseStatusAtCapture":row["releaseStatus"],"freshnessSensitive":row["releaseStatus"]!="RELEASED",
                "sourceUrl":url,"sourceHash":detail_hash,
                "identity":{
                    "rarity":detail.get("Rarity"),
                    "element":ELEMENTS.get(detail.get("Element")),
                    "weaponType":WEAPONS.get(detail.get("Weapon")),
                },
                "progression":{"statsByAscensionAndLevel":stats,"level90":level90},
                "skillTree":skill_tree(detail.get("SkillTrees")),
                "sequences":chains(detail.get("Chains")),
                "warnings":warnings,
            }
            if not level90 or len(entry["sequences"])!=6 or not entry["skillTree"]:
                entry["captureStatus"]="PARTIAL"
                if not level90: entry["warnings"].append("missing Stats[6][90]")
                if len(entry["sequences"])!=6: entry["warnings"].append(f"expected 6 Chains, got {len(entry['sequences'])}")
                if not entry["skillTree"]: entry["warnings"].append("empty SkillTrees")
            characters.append(entry)
            print(row["characterId"],entry["captureStatus"],flush=True)
        except Exception as exc:
            characters.append({
                "bellibingCharacterId":row["characterId"],"providerCharacterId":provider_id,
                "providerDisplayName":list_name(listing.get(provider_id)),"captureStatus":"UNAVAILABLE",
                "releaseStatusAtCapture":row["releaseStatus"],"freshnessSensitive":row["releaseStatus"]!="RELEASED",
                "sourceUrl":url,"sourceHash":None,"progression":None,"skillTree":[],"sequences":[],
                "warnings":warnings+[f"fetch: {type(exc).__name__}: {exc}"],
            })
            print(row["characterId"],"UNAVAILABLE",flush=True)
    payload={
        "schemaVersion":1,"kind":"HAKUSH_CHARACTER_TRUTH_CAPTURE","canonicalAuthority":False,
        "promotionPolicy":"MANUAL_SOURCE_VALIDATION_REQUIRED","providerId":"hakush",
        "providerSurface":"Hakush Wuthering Waves structured data API","capturedAt":captured_at,
        "listSourceUrl":f"{BASE}/data/character.json","listSourceHash":list_hash,
        "characters":characters,
        "excluded":["recommendations","ratings","teams","rotations","build advice","Echo recommendations","weapon recommendations"],
    }
    out=root/a.output; out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n")
    print("summary",json.dumps({s:sum(1 for r in characters if r["captureStatus"]==s) for s in ["CAPTURED","PARTIAL","UNAVAILABLE","UNMAPPED_IDENTITY"]}))
if __name__=="__main__": main()
