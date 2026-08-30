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
    return parser.parse_args()


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


def extract_character(chars: Any, row: dict[str, Any], checked_at: str) -> dict[str, Any]:
    character_id = row["characterId"]
    source_url = row["sourceUrl"]
    slug = slug_from_url(source_url, character_id)
    warnings: list[str] = []

    try:
        char = chars.get(slug)
    except Exception as exc:
        return {
            "characterId": character_id,
            "sourceUrl": source_url,
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
            "warnings": [f"page: {type(exc).__name__}: {exc}"],
        }

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


def main() -> None:
    args = parse_args()
    root = pathlib.Path(__file__).resolve().parents[1]
    input_path = (root / args.input).resolve()
    output_path = (root / args.output).resolve()
    vendor_parent = (root / args.vendor_parent).resolve()
    sys.path.insert(0, str(vendor_parent))

    from ww_prydwen_api import Characters  # type: ignore  # vendored at workflow runtime

    backlog = json.loads(input_path.read_text(encoding="utf-8"))
    if backlog.get("kind") != "PROFILE_SOURCE_BACKLOG":
        raise ValueError("input must be PROFILE_SOURCE_BACKLOG")

    characters: list[dict[str, Any]] = []
    with Characters() as chars:
        for row in backlog["characters"]:
            characters.append(extract_character(chars, row, args.checked_at))
            status = characters[-1]["fetchStatus"]
            print(f"{row['characterId']}: {status}", flush=True)

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
        },
        "characters": characters,
        "notes": [
            "Automated source extraction is CANDIDATE_ONLY / NOT_VERIFIED.",
            "Role labels, ranked weapons, Echo/Sonata recommendations, main-stat text, substat priority and endgame/ER text are source leads only.",
            "The current extractor does not provide Teams or Gameplay/Rotation; those arrays remain empty rather than being fabricated.",
            "No numeric ER band, canonical default, team, rotation, mechanic, trigger timing or uptime is inferred.",
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
