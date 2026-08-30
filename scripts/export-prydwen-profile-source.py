#!/usr/bin/env python3
"""Extract source-available Prydwen build leads for Bellibing profile review.

This is intentionally a source snapshot only. It does not choose canonical modes,
teams, rotations, defaults, numeric ER requirements, or executable mechanics.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys
from concurrent.futures import ProcessPoolExecutor, as_completed
from datetime import date
from typing import Any, Callable, TypeVar
from urllib.parse import urlparse

T = TypeVar("T")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--vendor-parent", default=".vendor")
    parser.add_argument("--upstream-commit", required=True)
    parser.add_argument("--checked-at", default=date.today().isoformat())
    parser.add_argument("--workers", type=int, default=3)
    args = parser.parse_args()
    if args.workers < 1 or args.workers > 4:
        parser.error("--workers must be between 1 and 4")
    return args


def slug_from_url(url: str, fallback: str) -> str:
    path = urlparse(url).path.rstrip("/")
    return path.rsplit("/", 1)[-1] if path else fallback


def safe_read(label: str, warnings: list[str], fn: Callable[[], T], default: T) -> T:
    try:
        return fn()
    except Exception as exc:  # one bad source field must not block the roster
        warnings.append(f"{label}: {type(exc).__name__}: {exc}")
        return default


def dict_values(value: Any) -> list[Any]:
    return list(value.values()) if isinstance(value, dict) else []


def failed_character(row: dict[str, Any], checked_at: str, warning: str) -> dict[str, Any]:
    return {
        "characterId": row["characterId"],
        "sourceUrl": row["sourceUrl"],
        "checkedAt": checked_at,
        "fetchStatus": "SOURCE_FETCH_FAILED",
        "displayName": None,
        "roleLeads": [],
        "weapons": [],
        "echoRecommendations": [],
        "mainStats": [],
        "substatPriorityText": "",
        "endgameStatLines": [],
        "energyRegenText": [],
        "teamLeads": [],
        "rotationLeads": [],
        "warnings": [warning],
    }


def extract_character(chars: Any, row: dict[str, Any], checked_at: str) -> dict[str, Any]:
    character_id = row["characterId"]
    source_url = row["sourceUrl"]
    slug = slug_from_url(source_url, character_id)
    warnings: list[str] = []

    try:
        char = chars.get(slug)
    except Exception as exc:
        return failed_character(row, checked_at, f"page: {type(exc).__name__}: {exc}")

    display_name = safe_read("displayName", warnings, lambda: char.name, None)
    role_leads = safe_read("roles", warnings, lambda: dict_values(char.role.all), [])
    build = safe_read("build", warnings, lambda: char.build, None)

    weapons: list[dict[str, Any]] = []
    echo_recommendations: list[dict[str, Any]] = []
    main_stats: list[dict[str, Any]] = []
    substat_priority = ""
    endgame_lines: list[str] = []

    if build is not None:
        weapon_items = safe_read("weaponRecommendations", warnings, lambda: build.weapon_recommendations.all, {})
        for index, item in weapon_items.items():
            percentages = safe_read(
                f"weapon[{index}].percentages",
                warnings,
                lambda item=item: dict_values(item.percentage.all),
                [],
            )
            weapons.append({
                "sourceRank": index,
                "name": safe_read(f"weapon[{index}].name", warnings, lambda item=item: item.name, ""),
                "percentages": percentages,
                "information": safe_read(f"weapon[{index}].information", warnings, lambda item=item: item.information, ""),
            })

        echo_items = safe_read("echoRecommendations", warnings, lambda: build.echo_recommendations.all, {})
        for index, item in echo_items.items():
            echo_recommendations.append({
                "sourceRank": index,
                "name": safe_read(f"echo[{index}].name", warnings, lambda item=item: item.name, ""),
                "rankText": safe_read(f"echo[{index}].rankText", warnings, lambda item=item: item.percentage, ""),
                "information": safe_read(f"echo[{index}].information", warnings, lambda item=item: item.information, ""),
            })

        stat_items = safe_read("mainStats", warnings, lambda: build.echo_stats.all, {})
        for index, item in stat_items.items():
            main_stats.append({
                "sourceIndex": index,
                "cost": safe_read(f"mainStats[{index}].cost", warnings, lambda item=item: item.cost, ""),
                "stats": safe_read(f"mainStats[{index}].stats", warnings, lambda item=item: item.stats, ""),
            })

        substat_priority = safe_read("substatPriority", warnings, lambda: build.echo_stats.substats, "")
        endgame_lines = safe_read("endgameStats", warnings, lambda: build.endgame_stats.lines, [])

    energy_regen_text = [
        line for line in endgame_lines
        if "energy regen" in line.lower() or line.strip().lower().startswith("er ") or line.strip().lower().startswith("er:")
    ]

    return {
        "characterId": character_id,
        "sourceUrl": source_url,
        "checkedAt": checked_at,
        "fetchStatus": "PARTIAL" if warnings else "FETCHED",
        "displayName": display_name,
        "roleLeads": role_leads,
        "weapons": weapons,
        "echoRecommendations": echo_recommendations,
        "mainStats": main_stats,
        "substatPriorityText": substat_priority,
        "endgameStatLines": endgame_lines,
        "energyRegenText": energy_regen_text,
        "teamLeads": [],
        "rotationLeads": [],
        "warnings": warnings,
    }


def extract_chunk(
    rows: list[dict[str, Any]],
    checked_at: str,
    vendor_parent: str,
) -> list[dict[str, Any]]:
    if vendor_parent not in sys.path:
        sys.path.insert(0, vendor_parent)
    from ww_prydwen_api import Characters  # type: ignore

    extracted: list[dict[str, Any]] = []
    with Characters() as chars:
        for row in rows:
            result = extract_character(chars, row, checked_at)
            extracted.append(result)
            print(f"{row['characterId']}: {result['fetchStatus']}", flush=True)
    return extracted


def partition_rows(rows: list[dict[str, Any]], worker_count: int) -> list[list[dict[str, Any]]]:
    return [rows[index::worker_count] for index in range(worker_count)]


def extract_roster(
    rows: list[dict[str, Any]],
    checked_at: str,
    vendor_parent: pathlib.Path,
    workers: int,
) -> list[dict[str, Any]]:
    if not rows:
        return []

    worker_count = min(workers, len(rows))
    if worker_count == 1:
        return extract_chunk(rows, checked_at, str(vendor_parent))

    chunks = partition_rows(rows, worker_count)
    by_character: dict[str, dict[str, Any]] = {}
    with ProcessPoolExecutor(max_workers=worker_count) as pool:
        future_to_chunk = {
            pool.submit(extract_chunk, chunk, checked_at, str(vendor_parent)): chunk
            for chunk in chunks
        }
        for future in as_completed(future_to_chunk):
            chunk = future_to_chunk[future]
            try:
                results = future.result()
            except Exception as exc:
                warning = f"worker: {type(exc).__name__}: {exc}"
                results = [failed_character(row, checked_at, warning) for row in chunk]
                for row in results:
                    print(f"{row['characterId']}: SOURCE_FETCH_FAILED ({warning})", flush=True)
            for result in results:
                by_character[result["characterId"]] = result

    return [
        by_character.get(
            row["characterId"],
            failed_character(row, checked_at, "worker: result missing after extraction"),
        )
        for row in rows
    ]


def main() -> None:
    args = parse_args()
    root = pathlib.Path(__file__).resolve().parents[1]
    input_path = (root / args.input).resolve()
    output_path = (root / args.output).resolve()
    vendor_parent = (root / args.vendor_parent).resolve()

    backlog = json.loads(input_path.read_text(encoding="utf-8"))
    if backlog.get("kind") != "PROFILE_SOURCE_BACKLOG":
        raise ValueError("input must be PROFILE_SOURCE_BACKLOG")

    rows = backlog["characters"]
    characters = extract_roster(rows, args.checked_at, vendor_parent, args.workers)

    snapshot = {
        "kind": "PRYDWEN_PROFILE_SOURCE_SNAPSHOT",
        "importStatus": "CANDIDATE_ONLY",
        "verificationStatus": "NOT_VERIFIED",
        "checkedAt": args.checked_at,
        "sourceCheckpoint": {
            "source": "Prydwen Wuthering Waves Character Build pages",
            "extractorReferenceRepository": "theonuverse/ww_prydwen_api",
            "extractorReferenceCommit": args.upstream_commit,
            "extractorReferenceLicense": "MIT",
            "backlogRegistrySource": backlog.get("registrySource"),
            "backlogGeneratedAt": backlog.get("generatedAt"),
            "workerCount": min(args.workers, len(rows)),
        },
        "characters": characters,
        "notes": [
            "Automated source extraction is CANDIDATE_ONLY / NOT_VERIFIED.",
            "Role labels, ranked weapons, Echo/Sonata recommendations, main-stat text, substat priority and endgame/ER text are source leads only.",
            "The current extractor does not provide Teams or Gameplay/Rotation; those arrays remain empty rather than being fabricated.",
            "No numeric ER band, canonical default, team, rotation, mechanic, trigger timing or uptime is inferred.",
            "Roster fetches are sharded across independent browser workers; output order remains registry-derived.",
        ],
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    fetched = sum(1 for row in characters if row["fetchStatus"] == "FETCHED")
    partial = sum(1 for row in characters if row["fetchStatus"] == "PARTIAL")
    failed = sum(1 for row in characters if row["fetchStatus"] == "SOURCE_FETCH_FAILED")
    print(f"Source snapshot: fetched={fetched} partial={partial} failed={failed}")
    print(f"Wrote {output_path.relative_to(root)}")


if __name__ == "__main__":
    main()
