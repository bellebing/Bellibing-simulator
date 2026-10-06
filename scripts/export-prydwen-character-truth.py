#!/usr/bin/env python3
"""Capture factual Prydwen Character kit data only.

This deliberately excludes roles, ratings, builds, weapons, Echo recommendations,
teams, rotations and other subjective/recommendation fields. Output is provider
evidence only and is never canonical/runtime truth.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import sys
from concurrent.futures import ProcessPoolExecutor, as_completed
from datetime import datetime, timezone
from typing import Any

EXTRACTOR_REPOSITORY = "theonuverse/ww_prydwen_api"
EXTRACTOR_COMMIT = "96585d530be9f30c262eac69a4932b861b856adc"

def args():
    p=argparse.ArgumentParser()
    p.add_argument("--roster", default="data/factory/character-truth/roster.json")
    p.add_argument("--output", default="data/factory/character-truth/prydwen-character-truth.json")
    p.add_argument("--vendor-parent", default=".vendor")
    p.add_argument("--workers", type=int, default=4)
    a=p.parse_args()
    if a.workers < 1 or a.workers > 4:
        p.error("--workers must be between 1 and 4")
    return a

def compact(text: str, limit: int = 600) -> str:
    text=" ".join((text or "").split())
    return text if len(text)<=limit else text[:limit].rstrip()+"…"

def skill_payload(skill: Any) -> dict[str, Any]:
    return {
        "category": skill.category,
        "name": skill.name,
        "descriptionEvidence": compact(skill.description),
        "multiplierTextByLevel": {str(k): v for k,v in skill.multipliers.all.items()},
    }

def safe_skill(label: str, fn, warnings: list[str]):
    try: return skill_payload(fn())
    except Exception as exc:
        warnings.append(f"{label}: {type(exc).__name__}: {exc}")
        return None

def unavailable(row: dict[str, Any], captured_at: str, warning: str) -> dict[str, Any]:
    return {
        "bellibingCharacterId":row["characterId"],"providerCharacterId":row["prydwenSlug"],
        "providerDisplayName":None,"sourceUrl":row["sourceUrl"],"releaseStatusAtCapture":row["releaseStatus"],
        "freshnessSensitive":row["releaseStatus"]!="RELEASED","capturedAt":captured_at,
        "captureStatus":"UNAVAILABLE","skills":{},"sequences":[],"warnings":[warning],
    }

def capture(char: Any, row: dict[str, Any], captured_at: str) -> dict[str, Any]:
    warnings: list[str]=[]
    try:
        name=char.name
        kit=char.kit
        skills={
            "basicAttack": safe_skill("basicAttack", lambda: kit.skills.active.basic_attack, warnings),
            "resonanceSkill": safe_skill("resonanceSkill", lambda: kit.skills.active.resonance_skill, warnings),
            "resonanceLiberation": safe_skill("resonanceLiberation", lambda: kit.skills.active.resonance_liberation, warnings),
            "forteCircuit": safe_skill("forteCircuit", lambda: kit.skills.passive.forte_circuit, warnings),
            "inherentSkill1": safe_skill("inherentSkill1", lambda: kit.skills.passive.inherent_skill_1, warnings),
            "inherentSkill2": safe_skill("inherentSkill2", lambda: kit.skills.passive.inherent_skill_2, warnings),
            "introSkill": safe_skill("introSkill", lambda: kit.skills.concerto.intro_skill, warnings),
            "outroSkill": safe_skill("outroSkill", lambda: kit.skills.concerto.outro_skill, warnings),
        }
        try:
            if kit.skills.passive.has_tune:
                skills["forteCircuitTune"]=safe_skill("forteCircuitTune", lambda: kit.skills.passive.forte_circuit_tune, warnings)
        except Exception as exc:
            warnings.append(f"forteCircuitTuneProbe: {type(exc).__name__}: {exc}")
        chains=[]
        try:
            for index,node in sorted(kit.resonance_chain.all.items()):
                chains.append({"sequence":index,"sourceSequenceLabel":node.sequence,"name":node.name,"descriptionEvidence":compact(node.description)})
        except Exception as exc:
            warnings.append(f"resonanceChain: {type(exc).__name__}: {exc}")
        present=sum(v is not None for v in skills.values())
        return {
            "bellibingCharacterId":row["characterId"],
            "providerCharacterId":row["prydwenSlug"],
            "providerDisplayName":name,
            "sourceUrl":row["sourceUrl"],
            "releaseStatusAtCapture":row["releaseStatus"],
            "freshnessSensitive":row["releaseStatus"]!="RELEASED",
            "capturedAt":captured_at,
            "captureStatus":"CAPTURED" if present and len(chains)==6 else "PARTIAL",
            "skills":skills,
            "sequences":chains,
            "warnings":warnings,
        }
    except Exception as exc:
        return unavailable(row,captured_at,f"page: {type(exc).__name__}: {exc}")

def capture_chunk(rows: list[dict[str, Any]], captured_at: str, vendor_parent: str) -> list[dict[str, Any]]:
    if vendor_parent not in sys.path:
        sys.path.insert(0,vendor_parent)
    from ww_prydwen_api import Characters
    results=[]
    with Characters() as chars:
        for row in rows:
            try:
                result=capture(chars.get(row["prydwenSlug"]),row,captured_at)
            except Exception as exc:
                result=unavailable(row,captured_at,f"fetch: {type(exc).__name__}: {exc}")
            results.append(result)
            print(row["characterId"],result["captureStatus"],flush=True)
    return results

def main():
    a=args(); root=pathlib.Path(__file__).resolve().parents[1]
    roster=json.loads((root/a.roster).read_text())
    rows=roster["characters"]
    captured_at=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00","Z")
    worker_count=min(a.workers,len(rows))
    chunks=[rows[i::worker_count] for i in range(worker_count)]
    by_id: dict[str,dict[str,Any]]={}
    vendor_parent=str((root/a.vendor_parent).resolve())
    with ProcessPoolExecutor(max_workers=worker_count) as pool:
        future_to_chunk={pool.submit(capture_chunk,chunk,captured_at,vendor_parent):chunk for chunk in chunks}
        for future in as_completed(future_to_chunk):
            chunk=future_to_chunk[future]
            try:
                results=future.result()
            except Exception as exc:
                warning=f"worker: {type(exc).__name__}: {exc}"
                results=[unavailable(row,captured_at,warning) for row in chunk]
            for result in results:
                by_id[result["bellibingCharacterId"]]=result
    out=[by_id.get(row["characterId"],unavailable(row,captured_at,"worker: result missing")) for row in rows]
    payload={
      "schemaVersion":1,"kind":"PRYDWEN_CHARACTER_TRUTH_CAPTURE","canonicalAuthority":False,
      "promotionPolicy":"MANUAL_SOURCE_VALIDATION_REQUIRED","providerId":"prydwen-profile-source",
      "providerSurface":"Prydwen Wuthering Waves Character Kit pages",
      "extractor":{"repository":EXTRACTOR_REPOSITORY,"commit":EXTRACTOR_COMMIT,"license":"MIT"},
      "capturedAt":captured_at,"workerCount":worker_count,"characters":out,
      "excluded":["roles","ratings","weapon recommendations","Echo recommendations","stat priority","teams","rotations","pull value"],
    }
    path=(root/a.output); path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n")
    print("summary",json.dumps({s:sum(1 for r in out if r["captureStatus"]==s) for s in ["CAPTURED","PARTIAL","UNAVAILABLE"]}))
if __name__=="__main__": main()
